// Handles registration, login, and fetching the current authenticated user.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/init.js';
import { validateRegisterInput, isValidEmail, isNonEmptyString } from '../utils/validators.js';

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function register(req, res, next) {
  try {
    const { businessName, ownerName, email, password, businessType } = req.body;
    const errors = validateRegisterInput({ businessName, ownerName, email, password });
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insert = db.prepare(`
      INSERT INTO users (business_name, owner_name, email, password, business_type)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = insert.run(
      businessName.trim(),
      ownerName.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      businessType?.trim() || 'General Store'
    );

    db.prepare(`
      INSERT INTO business_settings (user_id, business_name, owner_name, currency, theme, low_stock_threshold)
      VALUES (?, ?, ?, 'INR', 'light', 10)
    `).run(info.lastInsertRowid, businessName.trim(), ownerName.trim());

    // Select product catalog based on businessType
    const type = businessType?.toLowerCase() || 'general';
    let defaultProducts = [];

    const groceryProducts = [
      ['Basmati Rice 5kg', 'Grocery', 650, 480, 45, 10, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'],
      ['Toor Dal 1kg', 'Grocery', 140, 105, 60, 15, 'https://images.unsplash.com/photo-1547058886-af779930f7c1?w=400&auto=format&fit=crop&q=80'],
      ['Sunflower Oil 1L', 'Grocery', 175, 140, 8, 10, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80'],
      ['Wheat Atta 10kg', 'Grocery', 420, 340, 30, 10, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80'],
      ['Sugar 1kg', 'Grocery', 48, 38, 70, 15, 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&auto=format&fit=crop&q=80'],
      ['Tea Powder 250g', 'Beverages', 95, 70, 55, 10, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80'],
      ['Coffee Powder 200g', 'Beverages', 180, 135, 6, 10, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80'],
      ['Colgate Toothpaste', 'Personal Care', 55, 40, 40, 12, 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&auto=format&fit=crop&q=80'],
      ['Dettol Soap Pack', 'Personal Care', 90, 65, 5, 10, 'https://images.unsplash.com/photo-1607006342411-9a905574572d?w=400&auto=format&fit=crop&q=80'],
      ['Parle-G Biscuit', 'Snacks', 10, 7, 200, 30, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80'],
      ['Lays Chips 52g', 'Snacks', 20, 15, 90, 20, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80'],
      ['Maggi Noodles Pack', 'Snacks', 14, 10, 120, 25, 'https://images.unsplash.com/photo-1612966608963-478a8ed57e8f?w=400&auto=format&fit=crop&q=80'],
      ['Amul Milk 1L', 'Dairy', 66, 56, 40, 15, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80'],
      ['Amul Butter 100g', 'Dairy', 58, 48, 25, 10, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80'],
      ['Britannia Bread', 'Bakery', 45, 32, 18, 10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80'],
      ['Notebook 200 pages', 'Stationery', 45, 30, 3, 10, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop&q=80'],
      ['Blue Ball Pen', 'Stationery', 10, 6, 150, 25, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&auto=format&fit=crop&q=80'],
      ['Surf Excel 1kg', 'Household', 210, 165, 20, 10, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=80'],
      ['Vim Dishwash Bar', 'Household', 20, 14, 60, 15, 'https://images.unsplash.com/photo-1585811630202-798586afc45b?w=400&auto=format&fit=crop&q=80'],
      ['Harpic 500ml', 'Household', 99, 75, 4, 10, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80']
    ];

    const cafeProducts = [
      ['Hot Cappuccino', 'Coffee', 150, 45, 999, 50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80'],
      ['Iced Caramel Latte', 'Coffee', 180, 55, 999, 50, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80'],
      ['Espresso Shot', 'Coffee', 90, 25, 999, 30, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop&q=80'],
      ['Chocolate Croissant', 'Bakery', 120, 50, 20, 5, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80'],
      ['Blueberry Muffin', 'Bakery', 95, 38, 25, 6, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&auto=format&fit=crop&q=80'],
      ['Fudge Brownie', 'Snacks', 110, 42, 30, 8, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80'],
      ['Masala Chai', 'Tea', 80, 20, 999, 40, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80'],
      ['Club Sandwich', 'Snacks', 160, 65, 15, 4, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80'],
      ['Green Tea', 'Tea', 90, 25, 999, 30, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&auto=format&fit=crop&q=80'],
      ['Choco Chip Cookie', 'Snacks', 60, 22, 50, 10, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80']
    ];

    const pharmacyProducts = [
      ['Paracetamol 650mg', 'Pharmacy', 30, 18, 120, 30, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80'],
      ['Cough Syrup 100ml', 'Pharmacy', 85, 60, 45, 10, 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop&q=80'],
      ['First Aid Kit', 'First Aid', 450, 310, 15, 5, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&auto=format&fit=crop&q=80'],
      ['Hand Sanitizer 500ml', 'Hygiene', 120, 80, 50, 10, 'https://images.unsplash.com/photo-1584483777132-e71446a2aef0?w=400&auto=format&fit=crop&q=80'],
      ['Adhesive Bandages Pack', 'First Aid', 99, 65, 80, 15, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80'],
      ['Vitamin C Chewables', 'Vitamins', 180, 120, 35, 8, 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=400&auto=format&fit=crop&q=80'],
      ['N95 Face Mask Pack', 'Hygiene', 250, 160, 60, 10, 'https://images.unsplash.com/photo-1584622681564-1d987f7333c1?w=400&auto=format&fit=crop&q=80'],
      ['Antiseptic Cream 20g', 'Pharmacy', 75, 50, 40, 10, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&auto=format&fit=crop&q=80'],
      ['Digital Thermometer', 'Devices', 299, 200, 25, 5, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80'],
      ['Moisturizing Cream', 'Skincare', 220, 150, 30, 8, 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80']
    ];

    const hardwareProducts = [
      ['Claw Hammer 16oz', 'Tools', 350, 240, 20, 5, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&auto=format&fit=crop&q=80'],
      ['Screwdriver Set 10pc', 'Tools', 499, 350, 15, 4, 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=400&auto=format&fit=crop&q=80'],
      ['Power Drill 20V', 'Power Tools', 2499, 1800, 8, 2, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80'],
      ['Steel Nails Pack', 'Fasteners', 60, 35, 100, 20, 'https://images.unsplash.com/photo-1565538810844-1e119de867c8?w=400&auto=format&fit=crop&q=80'],
      ['Paint Brush 3 Inch', 'Painting', 120, 80, 40, 10, 'https://images.unsplash.com/photo-1525909002-1b057f39dd72?w=400&auto=format&fit=crop&q=80'],
      ['Tape Measure 5m', 'Tools', 180, 120, 30, 8, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&auto=format&fit=crop&q=80'],
      ['WD-40 Spray 100ml', 'Chemicals', 130, 95, 50, 12, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=80'],
      ['Combination Plier 8"', 'Tools', 280, 190, 25, 5, 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=400&auto=format&fit=crop&q=80'],
      ['Wall Screws Set', 'Fasteners', 150, 100, 60, 15, 'https://images.unsplash.com/photo-1565538810844-1e119de867c8?w=400&auto=format&fit=crop&q=80'],
      ['Masking Tape 2 Inch', 'Painting', 90, 60, 70, 15, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=80']
    ];

    const clothingProducts = [
      ["Men's Cotton T-Shirt", 'Menswear', 499, 250, 35, 10, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80'],
      ["Women's Summer Dress", 'Womenswear', 1299, 700, 20, 5, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop&q=80'],
      ['Slim Fit Blue Jeans', 'Menswear', 1499, 850, 25, 6, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop&q=80'],
      ['Denim Jacket', 'Unisex', 1999, 1100, 15, 4, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=80'],
      ['Casual White Sneakers', 'Footwear', 1899, 1000, 18, 5, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80'],
      ['Summer Straw Hat', 'Accessories', 399, 200, 30, 8, 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400&auto=format&fit=crop&q=80'],
      ['Athletic Socks 3pk', 'Accessories', 299, 150, 50, 10, 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400&auto=format&fit=crop&q=80'],
      ['Unisex Hoodie', 'Unisex', 1199, 650, 22, 6, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80'],
      ['Leather Handbag', 'Accessories', 2499, 1350, 10, 3, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80'],
      ['Formal Leather Belt', 'Accessories', 599, 300, 40, 10, 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=400&auto=format&fit=crop&q=80']
    ];

    if (type.includes('coffee') || type.includes('cafe')) {
      defaultProducts = cafeProducts;
    } else if (type.includes('pharmacy') || type.includes('medical')) {
      defaultProducts = pharmacyProducts;
    } else if (type.includes('hardware')) {
      defaultProducts = hardwareProducts;
    } else if (type.includes('clothing') || type.includes('boutique') || type.includes('apparel')) {
      defaultProducts = clothingProducts;
    } else {
      defaultProducts = groceryProducts;
    }

    const prodStmt = db.prepare(`
      INSERT INTO products (user_id, name, category, price, cost, quantity, low_stock_threshold, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const [name, cat, price, cost, qty, threshold, img] of defaultProducts) {
      prodStmt.run(info.lastInsertRowid, name, cat, price, cost, qty, threshold, img);
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    const token = generateToken(user.id);

    res.status(201).json({ success: true, message: 'Account created successfully.', token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    res.json({ success: true, message: 'Logged in successfully.', token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export function getMe(req, res, next) {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}
