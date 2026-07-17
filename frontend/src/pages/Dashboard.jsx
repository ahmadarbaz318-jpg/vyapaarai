import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiDollarSign, FiTrendingUp, FiBox, FiAlertTriangle, FiPlus, FiShoppingCart, FiCpu, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/analytics/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><LoadingSpinner full /></Layout>;

  const { summary, lowStockProducts, recentSales, revenueTrend } = data;
  const currencyFmt = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.owner_name?.split(' ')[0]} 👋`}>
      {/* Welcome card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-hero rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{user?.business_name}</h2>
            <p className="text-blue-100 text-sm mt-1">Here's how your business is doing today.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/sales" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 shadow-none hover:bg-white/25">
              <FiPlus /> New Sale
            </Link>
            <Link to="/ai-advisor" className="px-5 py-2.5 text-sm rounded-xl bg-white text-slate-800 font-semibold flex items-center gap-2 hover:bg-blue-50 transition">
              <FiCpu /> Ask AI
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={FiDollarSign} label="Today's Sales" value={currencyFmt(summary.todayRevenue)} trend={`${summary.todayOrders} orders`} trendUp gradient="from-blue-500 to-sky-400" delay={0} />
        <StatCard icon={FiTrendingUp} label="Monthly Revenue" value={currencyFmt(summary.monthRevenue)} trend={`${summary.monthOrders} orders`} trendUp gradient="from-teal-500 to-emerald-400" delay={0.05} />
        <StatCard icon={FiDollarSign} label="Monthly Profit" value={currencyFmt(summary.monthProfit)} trend="This month" trendUp gradient="from-indigo-500 to-blue-400" delay={0.1} />
        <StatCard icon={FiBox} label="Inventory Value" value={currencyFmt(summary.inventoryValue)} trend={`${summary.totalProducts} products`} trendUp gradient="from-amber-500 to-orange-400" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800">Revenue — Last 7 Days</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily revenue and profit trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', fontSize: '13px' }} formatter={(v) => currencyFmt(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2.5} fill="url(#profGrad)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">Low Stock Alerts</h3>
            <span className="w-7 h-7 rounded-lg bg-red-50 text-danger flex items-center justify-center text-sm"><FiAlertTriangle /></span>
          </div>
          {lowStockProducts.length === 0 ? (
            <EmptyState icon={FiBox} title="All stocked up!" description="No products are running low right now." />
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.category}</p>
                  </div>
                  <span className="text-xs font-bold text-danger bg-red-100 px-2.5 py-1 rounded-full">{p.quantity} left</span>
                </div>
              ))}
              <Link to="/inventory" className="text-primary text-sm font-semibold flex items-center gap-1.5 justify-center pt-2">
                Manage inventory <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent sales */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800">Recent Sales</h3>
          <Link to="/orders" className="text-primary text-sm font-semibold flex items-center gap-1.5">
            View all <FiArrowRight />
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <EmptyState icon={FiShoppingCart} title="No sales yet" description="Record your first sale to see it show up here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3.5 font-semibold text-slate-700">{s.invoice_number}</td>
                    <td className="py-3.5 text-slate-500">{s.customer_name}</td>
                    <td className="py-3.5"><span className="px-2.5 py-1 rounded-full bg-blue-50 text-primary text-xs font-medium">{s.payment_method}</span></td>
                    <td className="py-3.5 text-right font-semibold text-slate-700">{currencyFmt(s.total_amount)}</td>
                    <td className="py-3.5 text-right text-success font-medium">{currencyFmt(s.total_profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
