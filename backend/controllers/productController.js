// CRUD operations for products, including search, filter, pagination, and low-stock lookups.
import db from '../db/init.js';
import { validateProductInput } from '../utils/validators.js';

export function getProducts(req, res, next) {
  try {
    const userId = req.userId;
    const { search = '', category = '', page = 1, limit = 12, lowStock } = req.query;

    let query = 'SELECT * FROM products WHERE user_id = ?';
    const params = [userId];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (lowStock === 'true') {
      query += ' AND quantity <= low_stock_threshold';
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const total = db.prepare(countQuery).get(...params).count;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const products = db.prepare(query).all(...params);

    res.json({
      success: true,
      products,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

export function getCategories(req, res, next) {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM products WHERE user_id = ? ORDER BY category').all(req.userId);
    res.json({ success: true, categories: categories.map((c) => c.category) });
  } catch (err) {
    next(err);
  }
}

export function getProduct(req, res, next) {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export function createProduct(req, res, next) {
  try {
    const { name, category, price, cost, quantity, image, lowStockThreshold } = req.body;
    const errors = validateProductInput({ name, category, price, cost, quantity });
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

    const info = db.prepare(`
      INSERT INTO products (user_id, name, category, price, cost, quantity, image, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.userId, name.trim(), category.trim(), price, cost, quantity,
      image || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
      lowStockThreshold || 10
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Product added successfully.', product });
  } catch (err) {
    next(err);
  }
}

export function updateProduct(req, res, next) {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { name, category, price, cost, quantity, image, lowStockThreshold } = req.body;
    const errors = validateProductInput({
      name: name ?? existing.name,
      category: category ?? existing.category,
      price: price ?? existing.price,
      cost: cost ?? existing.cost,
      quantity: quantity ?? existing.quantity,
    });
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

    db.prepare(`
      UPDATE products SET name = ?, category = ?, price = ?, cost = ?, quantity = ?, image = ?, low_stock_threshold = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      name ?? existing.name,
      category ?? existing.category,
      price ?? existing.price,
      cost ?? existing.cost,
      quantity ?? existing.quantity,
      image ?? existing.image,
      lowStockThreshold ?? existing.low_stock_threshold,
      req.params.id,
      req.userId
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Product updated successfully.', product });
  } catch (err) {
    next(err);
  }
}

export function deleteProduct(req, res, next) {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    db.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
