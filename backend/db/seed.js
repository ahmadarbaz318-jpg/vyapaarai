// Seeds the database with a demo user, sample products, and demo sales history.
import bcrypt from 'bcryptjs';
import { initDatabase } from './connection.js';

async function seed() {
  try {
    const db = await initDatabase();
    
    // Initialize schema first
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
    
    db.exec(schema);
    
    const DEMO_EMAIL = 'demo@vyapaar.ai';

    // Check if demo data exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL);
    if (existing) {
      console.log('Demo data already exists. Skipping seed.');
      process.exit(0);
    }

    const hashedPassword = bcrypt.hashSync('demo1234', 10);

    // Insert user
    const userResult = db.prepare(
      `INSERT INTO users (business_name, owner_name, email, password, business_type)
       VALUES (?, ?, ?, ?, ?)`
    ).run('Sharma General Store', 'Rahul Sharma', DEMO_EMAIL, hashedPassword, 'Grocery Store');
    const userId = userResult.lastInsertRowid;

    // Insert business settings
    db.prepare(
      `INSERT INTO business_settings (user_id, business_name, owner_name, currency, theme, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(userId, 'Sharma General Store', 'Rahul Sharma', 'INR', 'light', 10);

    // Products data
    const products = [
      ['Basmati Rice 5kg', 'Grocery', 650, 480, 45, 10],
      ['Toor Dal 1kg', 'Grocery', 140, 105, 60, 15],
      ['Sunflower Oil 1L', 'Grocery', 175, 140, 8, 10],
      ['Wheat Atta 10kg', 'Grocery', 420, 340, 30, 10],
      ['Sugar 1kg', 'Grocery', 48, 38, 70, 15],
      ['Tea Powder 250g', 'Beverages', 95, 70, 55, 10],
      ['Coffee Powder 200g', 'Beverages', 180, 135, 6, 10],
      ['Colgate Toothpaste', 'Personal Care', 55, 40, 40, 12],
      ['Dettol Soap Pack', 'Personal Care', 90, 65, 5, 10],
      ['Parle-G Biscuit', 'Snacks', 10, 7, 200, 30],
      ['Lays Chips 52g', 'Snacks', 20, 15, 90, 20],
      ['Maggi Noodles Pack', 'Snacks', 14, 10, 120, 25],
      ['Amul Milk 1L', 'Dairy', 66, 56, 40, 15],
      ['Amul Butter 100g', 'Dairy', 58, 48, 25, 10],
      ['Britannia Bread', 'Bakery', 45, 32, 18, 10],
      ['Notebook 200 pages', 'Stationery', 45, 30, 3, 10],
      ['Blue Ball Pen', 'Stationery', 10, 6, 150, 25],
      ['Surf Excel 1kg', 'Household', 210, 165, 20, 10],
      ['Vim Dishwash Bar', 'Household', 20, 14, 60, 15],
      ['Harpic 500ml', 'Household', 99, 75, 4, 10],
    ];

    // Insert products
    const productIds = [];
    for (const [name, category, price, cost, quantity, threshold] of products) {
      const result = db.prepare(
        `INSERT INTO products (user_id, name, category, price, cost, quantity, low_stock_threshold, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        userId, name, category, price, cost, quantity, threshold,
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`
      );
      productIds.push({ id: result.lastInsertRowid, name, price, cost, quantity });
    }

    // Generate demo sales
    const customers = ['Walk-in Customer', 'Priya Verma', 'Amit Kumar', 'Sneha Rao', 'Walk-in Customer', 'Vikram Singh'];
    const paymentMethods = ['Cash', 'UPI', 'Card'];

    let invoiceCounter = 1001;
    const today = new Date();

    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - dayOffset);

      const salesPerDay = 2 + Math.floor(Math.random() * 5);
      for (let s = 0; s < salesPerDay; s++) {
        const itemCount = 1 + Math.floor(Math.random() * 4);
        const chosenProducts = [...productIds].sort(() => 0.5 - Math.random()).slice(0, itemCount);

        let totalAmount = 0;
        let totalProfit = 0;
        const saleTime = new Date(saleDate);
        saleTime.setHours(9 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60));

        const invoiceNumber = `INV-${invoiceCounter++}`;
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const payment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const itemsToInsert = [];
        for (const product of chosenProducts) {
          const qty = 1 + Math.floor(Math.random() * 3);
          const subtotal = qty * product.price;
          const profit = qty * (product.price - product.cost);
          totalAmount += subtotal;
          totalProfit += profit;
          itemsToInsert.push({ ...product, qty, subtotal, profit });
        }

        const saleResult = db.prepare(
          `INSERT INTO sales (user_id, invoice_number, total_amount, total_profit, customer_name, payment_method, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          userId, invoiceNumber, totalAmount, totalProfit, customer, payment, saleTime.toISOString()
        );

        for (const item of itemsToInsert) {
          db.prepare(
            `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, cost, subtotal, profit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            saleResult.lastInsertRowid, item.id, item.name, item.qty, item.price, item.cost, item.subtotal, item.profit
          );
        }
      }
    }

    console.log('✅ Seed complete!');
    console.log('📧 Demo login -> email: demo@vyapaar.ai | password: demo1234');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
