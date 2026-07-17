// SQLite database connection using sql.js (pure JavaScript implementation)
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, '..', process.env.DB_PATH)
  : path.join(__dirname, 'vyapaar.sqlite');

let SQL;
let db;

// Initialize SQL.js
async function initDb() {
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  return db;
}

// Save database to disk
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Statement wrapper for sql.js
class PreparedStatement {
  constructor(sql, database) {
    this.sql = sql;
    this.db = database;
  }

  run(...params) {
    try {
      this.db.run(this.sql, params);
      // Get the last inserted row ID
      const result = this.db.exec('SELECT last_insert_rowid() as lastID');
      const lastID = result[0]?.values[0]?.[0] || 0;
      saveDb();
      return { lastInsertRowid: lastID, changes: 1 };
    } catch (err) {
      throw err;
    }
  }

  get(...params) {
    try {
      const result = this.db.exec(this.sql, params);
      if (result && result[0]) {
        const columns = result[0].columns;
        const values = result[0].values[0];
        const row = {};
        columns.forEach((col, idx) => {
          row[col] = values[idx];
        });
        return row;
      }
      return null;
    } catch (err) {
      throw err;
    }
  }

  all(...params) {
    try {
      const result = this.db.exec(this.sql, params);
      if (result && result[0]) {
        const columns = result[0].columns;
        return result[0].values.map(values => {
          const row = {};
          columns.forEach((col, idx) => {
            row[col] = values[idx];
          });
          return row;
        });
      }
      return [];
    } catch (err) {
      throw err;
    }
  }
}

// Async versions for seed script
export const dbRun = async (sql, params = []) => {
  if (!db) throw new Error('Database not initialized');
  const stmt = new PreparedStatement(sql, db);
  return stmt.run(...params);
};

export const dbGet = async (sql, params = []) => {
  if (!db) throw new Error('Database not initialized');
  const stmt = new PreparedStatement(sql, db);
  return stmt.get(...params);
};

export const dbAll = async (sql, params = []) => {
  if (!db) throw new Error('Database not initialized');
  const stmt = new PreparedStatement(sql, db);
  return stmt.all(...params);
};

export const dbExec = async (sql) => {
  if (!db) throw new Error('Database not initialized');
  db.run(sql);
  saveDb();
};

// Sync wrapper object for controllers that use db.prepare()
export class Database {
  prepare(sql) {
    if (!db) throw new Error('Database not initialized');
    return new PreparedStatement(sql, db);
  }

  exec(sql) {
    if (!db) throw new Error('Database not initialized');
    db.run(sql);
    saveDb();
  }
}

export const getSqlDb = () => db;
export const getSql = () => SQL;

export async function initDatabase() {
  await initDb();
  return new Database();
}

export default new Database();
