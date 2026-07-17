// Database initialization: creates tables if they do not exist.
import { initDatabase } from './connection.js';

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  business_type TEXT DEFAULT 'General Store',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  business_name TEXT,
  owner_name TEXT,
  currency TEXT DEFAULT 'INR',
  theme TEXT DEFAULT 'light',
  low_stock_threshold INTEGER DEFAULT 10,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  cost REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  low_stock_threshold INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL,
  total_amount REAL NOT NULL,
  total_profit REAL NOT NULL,
  customer_name TEXT DEFAULT 'Walk-in Customer',
  payment_method TEXT DEFAULT 'Cash',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  cost REAL NOT NULL,
  subtotal REAL NOT NULL,
  profit REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
`;

// Export a mutable wrapper object so controllers can call `db.prepare()`
// after the async initialization completes.
const db = {};

let _readyResolve;
export const ready = new Promise((resolve) => { _readyResolve = resolve; });

// Initialize database on module import and populate the wrapper
(async () => {
  try {
    const database = await initDatabase();
    // ensure schema exists
    database.exec(schema);

    // Populate wrapper with sync-style methods expected by controllers
    db.prepare = (sql) => database.prepare(sql);
    db.exec = (sql) => database.exec(sql);

    console.log('✅ Database initialized successfully');
    _readyResolve();
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  }
})();

export default db;
