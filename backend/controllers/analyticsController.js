// Aggregates sales and product data into dashboard and analytics metrics.
import db from '../db/init.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDashboardSummary(req, res, next) {
  try {
    const userId = req.userId;
    const today = startOfDay(new Date()).toISOString();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const todaySales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as count
      FROM sales WHERE user_id = ? AND created_at >= ?
    `).get(userId, today);

    const monthSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as count
      FROM sales WHERE user_id = ? AND created_at >= ?
    `).get(userId, monthStart.toISOString());

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE user_id = ?').get(userId).count;

    const lowStockProducts = db.prepare(`
      SELECT * FROM products WHERE user_id = ? AND quantity <= low_stock_threshold ORDER BY quantity ASC LIMIT 10
    `).all(userId);

    const recentSales = db.prepare(`
      SELECT * FROM sales WHERE user_id = ? ORDER BY created_at DESC LIMIT 6
    `).all(userId);

    const inventoryValue = db.prepare(`
      SELECT COALESCE(SUM(price * quantity), 0) as sellValue, COALESCE(SUM(cost * quantity), 0) as costValue
      FROM products WHERE user_id = ?
    `).get(userId);

    // Last 7 days revenue trend
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const row = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(total_profit), 0) as profit
        FROM sales WHERE user_id = ? AND created_at >= ? AND created_at < ?
      `).get(userId, dayStart.toISOString(), dayEnd.toISOString());

      revenueTrend.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: row.revenue,
        profit: row.profit,
      });
    }

    res.json({
      success: true,
      summary: {
        todayRevenue: todaySales.revenue,
        todayProfit: todaySales.profit,
        todayOrders: todaySales.count,
        monthRevenue: monthSales.revenue,
        monthProfit: monthSales.profit,
        monthOrders: monthSales.count,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        inventoryValue: inventoryValue.sellValue,
        inventoryCost: inventoryValue.costValue,
      },
      lowStockProducts,
      recentSales,
      revenueTrend,
    });
  } catch (err) {
    next(err);
  }
}

export function getAnalytics(req, res, next) {
  try {
    const userId = req.userId;
    const { range = '30' } = req.query;
    const days = parseInt(range) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const dailyTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const row = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as orders
        FROM sales WHERE user_id = ? AND created_at >= ? AND created_at < ?
      `).get(userId, dayStart.toISOString(), dayEnd.toISOString());

      dailyTrend.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: row.revenue,
        profit: row.profit,
        orders: row.orders,
      });
    }

    const bestSelling = db.prepare(`
      SELECT product_name, SUM(quantity) as totalQty, SUM(subtotal) as totalRevenue, SUM(profit) as totalProfit
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      WHERE s.user_id = ? AND s.created_at >= ?
      GROUP BY si.product_id
      ORDER BY totalQty DESC
      LIMIT 5
    `).all(userId, startDate.toISOString());

    const worstSelling = db.prepare(`
      SELECT p.id, p.name as product_name, COALESCE(SUM(si.quantity), 0) as totalQty
      FROM products p
      LEFT JOIN sale_items si ON si.product_id = p.id
      LEFT JOIN sales s ON s.id = si.sale_id AND s.created_at >= ?
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY totalQty ASC
      LIMIT 5
    `).all(startDate.toISOString(), userId);

    const totals = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as orders
      FROM sales WHERE user_id = ? AND created_at >= ?
    `).get(userId, startDate.toISOString());

    const inventoryValue = db.prepare(`
      SELECT COALESCE(SUM(price * quantity), 0) as sellValue FROM products WHERE user_id = ?
    `).get(userId);

    const categoryBreakdown = db.prepare(`
      SELECT p.category, COALESCE(SUM(si.subtotal), 0) as revenue
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      JOIN products p ON p.id = si.product_id
      WHERE s.user_id = ? AND s.created_at >= ?
      GROUP BY p.category
      ORDER BY revenue DESC
    `).all(userId, startDate.toISOString());

    res.json({
      success: true,
      dailyTrend,
      bestSelling,
      worstSelling,
      categoryBreakdown,
      totals: { ...totals, inventoryValue: inventoryValue.sellValue },
    });
  } catch (err) {
    next(err);
  }
}
