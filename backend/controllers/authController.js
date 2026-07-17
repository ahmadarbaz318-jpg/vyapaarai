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

    // Seed default products with premium images for the new user
    const defaultProducts = [
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
