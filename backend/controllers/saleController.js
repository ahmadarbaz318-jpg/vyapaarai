// Handles creating sales (with multiple line items) and retrieving sales history.
import db from '../db/init.js';

function generateInvoiceNumber() {
  const timestamp = Date.now().toString().slice(-8);
  return `INV-${timestamp}`;
}

export function createSale(req, res, next) {
  const { items, customerName, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one product item is required.' });
  }

  let totalAmount = 0;
  let totalProfit = 0;
  const resolvedItems = [];

  try {
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(item.productId, req.userId);
      if (!product) {
        const err = new Error(`Product with id ${item.productId} not found.`);
        err.statusCode = 404;
        throw err;
      }
      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) {
        const err = new Error(`Invalid quantity for ${product.name}.`);
        err.statusCode = 400;
        throw err;
      }
      if (product.quantity < qty) {
        const err = new Error(`Not enough stock for ${product.name}. Available: ${product.quantity}`);
        err.statusCode = 400;
        throw err;
      }

      const subtotal = qty * product.price;
      const profit = qty * (product.price - product.cost);
      totalAmount += subtotal;
      totalProfit += profit;

      resolvedItems.push({ product, qty, subtotal, profit });
    }

    const invoiceNumber = generateInvoiceNumber();
    const saleInfo = db.prepare(`
      INSERT INTO sales (user_id, invoice_number, total_amount, total_profit, customer_name, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.userId, invoiceNumber, totalAmount, totalProfit, customerName || 'Walk-in Customer', paymentMethod || 'Cash');

    const insertItem = db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, cost, subtotal, profit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?');

    for (const { product, qty, subtotal, profit } of resolvedItems) {
      insertItem.run(saleInfo.lastInsertRowid, product.id, product.name, qty, product.price, product.cost, subtotal, profit);
      updateStock.run(qty, product.id);
    }

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleInfo.lastInsertRowid);
    const saleItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleInfo.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Sale recorded successfully.', sale: { ...sale, items: saleItems } });
  } catch (err) {
    next(err);
  }
}

export function getSales(req, res, next) {
  try {
    const { page = 1, limit = 15, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM sales WHERE user_id = ?';
    const params = [req.userId];

    if (search) {
      query += ' AND (invoice_number LIKE ? OR customer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const total = db.prepare(countQuery).get(...params).count;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const sales = db.prepare(query).all(...params);
    const getItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?');
    const salesWithItems = sales.map((sale) => ({ ...sale, items: getItems.all(sale.id) }));

    res.json({
      success: true,
      sales: salesWithItems,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

export function getSale(req, res, next) {
  try {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' });
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(sale.id);
    res.json({ success: true, sale: { ...sale, items } });
  } catch (err) {
    next(err);
  }
}
