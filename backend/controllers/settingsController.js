// Manages business settings (name, owner, currency, theme, low stock threshold).
import db from '../db/init.js';

export function getSettings(req, res, next) {
  try {
    const settings = db.prepare('SELECT * FROM business_settings WHERE user_id = ?').get(req.userId);
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found.' });
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}

export function updateSettings(req, res, next) {
  try {
    const { businessName, ownerName, currency, theme, lowStockThreshold } = req.body;
    const existing = db.prepare('SELECT * FROM business_settings WHERE user_id = ?').get(req.userId);
    if (!existing) return res.status(404).json({ success: false, message: 'Settings not found.' });

    db.prepare(`
      UPDATE business_settings SET business_name = ?, owner_name = ?, currency = ?, theme = ?, low_stock_threshold = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      businessName ?? existing.business_name,
      ownerName ?? existing.owner_name,
      currency ?? existing.currency,
      theme ?? existing.theme,
      lowStockThreshold ?? existing.low_stock_threshold,
      req.userId
    );

    if (businessName || ownerName) {
      db.prepare('UPDATE users SET business_name = ?, owner_name = ? WHERE id = ?').run(
        businessName ?? existing.business_name,
        ownerName ?? existing.owner_name,
        req.userId
      );
    }

    const settings = db.prepare('SELECT * FROM business_settings WHERE user_id = ?').get(req.userId);
    res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (err) {
    next(err);
  }
}
