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
