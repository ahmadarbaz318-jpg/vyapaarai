// Integrates with Google's Gemini API to power the AI Business Advisor.
// Builds a context snapshot from real business data and sends it to Gemini for grounded advice.
import db from '../db/init.js';

function buildBusinessContext(userId) {
  const settings = db.prepare('SELECT * FROM business_settings WHERE user_id = ?').get(userId);
  const products = db.prepare('SELECT name, category, price, cost, quantity, low_stock_threshold FROM products WHERE user_id = ?').all(userId);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesSummary = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(total_profit), 0) as profit, COUNT(*) as orders
    FROM sales WHERE user_id = ? AND created_at >= ?
  `).get(userId, thirtyDaysAgo.toISOString());

  const bestSelling = db.prepare(`
    SELECT product_name, SUM(quantity) as qty
    FROM sale_items si JOIN sales s ON s.id = si.sale_id
    WHERE s.user_id = ? AND s.created_at >= ?
    GROUP BY si.product_id ORDER BY qty DESC LIMIT 5
  `).all(userId, thirtyDaysAgo.toISOString());

  const lowStock = products.filter((p) => p.quantity <= p.low_stock_threshold);

  return {
    businessName: settings?.business_name || 'the business',
    currency: settings?.currency || 'INR',
    totalProducts: products.length,
    last30Days: salesSummary,
    bestSellingProducts: bestSelling,
    lowStockProducts: lowStock.map((p) => ({ name: p.name, quantity: p.quantity })),
    categories: [...new Set(products.map((p) => p.category))],
  };
}

export async function askAdvisor(req, res, next) {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, message: 'A question is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const context = buildBusinessContext(req.userId);

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Graceful fallback so the app still demos well without a live API key.
      return res.json({
        success: true,
        answer: buildFallbackAnswer(question, context),
        source: 'fallback',
      });
    }

    const systemPrompt = `You are Vyapaar AI, a friendly and practical business advisor for small Indian retail shop owners (grocery stores, pharmacies, cafes, stationery shops, etc). You give short, clear, actionable advice in plain language, using bullet points where helpful. Always use the ${context.currency} currency symbol context where relevant. Keep responses under 200 words unless the user asks for detail.

Business snapshot for ${context.businessName}:
- Total products in inventory: ${context.totalProducts}
- Categories: ${context.categories.join(', ') || 'N/A'}
- Last 30 days: Revenue ₹${context.last30Days.revenue.toFixed(0)}, Profit ₹${context.last30Days.profit.toFixed(0)}, Orders: ${context.last30Days.orders}
- Best selling products (last 30 days): ${context.bestSellingProducts.map((p) => `${p.product_name} (${p.qty} sold)`).join(', ') || 'No sales yet'}
- Low stock products needing restock: ${context.lowStockProducts.map((p) => `${p.name} (${p.quantity} left)`).join(', ') || 'None currently'}

Answer the shop owner's question below using this real data whenever relevant.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nShop owner's question: ${question}` }] }],
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.text();
      console.error('Gemini API error:', errData);
      return res.json({
        success: true,
        answer: buildFallbackAnswer(question, context),
        source: 'fallback',
      });
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || buildFallbackAnswer(question, context);

    res.json({ success: true, answer, source: 'gemini' });
  } catch (err) {
    next(err);
  }
}

// Rule-based fallback so the AI Advisor page always responds, even without a Gemini key configured.
function buildFallbackAnswer(question, context) {
  const q = question.toLowerCase();

  if (q.includes('restock') || q.includes('stock')) {
    if (context.lowStockProducts.length === 0) {
      return `Good news — none of your products are currently low on stock. Keep monitoring your fast movers like ${context.bestSellingProducts[0]?.product_name || 'your top sellers'} so you can reorder before they run out.`;
    }
    const list = context.lowStockProducts.slice(0, 5).map((p) => `• ${p.name} (only ${p.quantity} left)`).join('\n');
    return `Here's what needs restocking soon:\n${list}\n\nTip: Reorder your fastest-selling items first to avoid losing sales.`;
  }

  if (q.includes('profit') || q.includes('increase')) {
    return `A few practical ways to increase profit:\n• Bundle slow-moving items with your best sellers (${context.bestSellingProducts[0]?.product_name || 'top products'}) as combo offers.\n• Review supplier costs on low-margin products and negotiate better rates.\n• Reduce stockouts on your top sellers — you sold ${context.bestSellingProducts[0]?.qty || 0} units of your best product recently.\n• Offer small discounts on items nearing expiry instead of writing them off.`;
  }

  if (q.includes('marketing') || q.includes('promote')) {
    return `Marketing ideas for a shop like yours:\n• Run a WhatsApp broadcast to regular customers about new stock or offers.\n• Offer a small discount for referrals — word of mouth is powerful for local shops.\n• Highlight your best sellers (${context.bestSellingProducts[0]?.product_name || 'top items'}) near the entrance or billing counter.\n• Partner with nearby shops for cross-promotions.`;
  }

  if (q.includes('decreas') || q.includes('why') || q.includes('down')) {
    return `Sales dips are usually caused by stockouts on popular items, seasonal demand changes, or nearby competition. In the last 30 days you had ${context.last30Days.orders} orders totaling ₹${context.last30Days.revenue.toFixed(0)}. Check if any of your ${context.bestSellingProducts.map((p)=>p.product_name).join(', ') || 'best-selling products'} went out of stock recently, as that's the most common cause.`;
  }

  if (q.includes('analyz') || q.includes('data') || q.includes('performance')) {
    return `Here's a quick snapshot of your business over the last 30 days:\n• Revenue: ₹${context.last30Days.revenue.toFixed(0)}\n• Profit: ₹${context.last30Days.profit.toFixed(0)}\n• Orders: ${context.last30Days.orders}\n• Top seller: ${context.bestSellingProducts[0]?.product_name || 'N/A'}\n• Products needing restock: ${context.lowStockProducts.length}\n\nOverall this shows a healthy margin — keep an eye on restocking to avoid missed sales.`;
  }

  return `Thanks for your question! Based on your business data — ₹${context.last30Days.revenue.toFixed(0)} revenue and ${context.last30Days.orders} orders in the last 30 days — I'd suggest focusing on keeping your best sellers (${context.bestSellingProducts[0]?.product_name || 'top products'}) well-stocked and watching your ${context.lowStockProducts.length} low-stock items closely. Ask me about restocking, profit, marketing, or sales trends for more specific tips!`;
}

export function getSuggestedQuestions(req, res) {
  res.json({
    success: true,
    questions: [
      'How can I increase profit?',
      'Which products should I restock?',
      'Why are sales decreasing?',
      'Suggest marketing ideas for my shop.',
      'Analyze my recent sales data.',
      'Generate 3 business tips for this week.',
    ],
  });
}
