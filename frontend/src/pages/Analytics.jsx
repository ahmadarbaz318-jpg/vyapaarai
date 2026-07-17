import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiPackage } from 'react-icons/fi';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../api/axios.js';

const COLORS = ['#2563EB', '#14B8A6', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EF4444'];
const ranges = [{ label: '7D', value: 7 }, { label: '30D', value: 30 }, { label: '90D', value: 90 }];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    api.get('/analytics', { params: { range } }).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [range]);

  const currencyFmt = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <Layout title="Analytics" subtitle="Deep insights into your business performance">
      <div className="flex items-center justify-end mb-6 gap-2">
        {ranges.map((r) => (
          <button key={r.value} onClick={() => setRange(r.value)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${range === r.value ? 'bg-gradient-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {loading || !data ? <LoadingSpinner full /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <StatCard icon={FiTrendingUp} label="Total Revenue" value={currencyFmt(data.totals.revenue)} trend={`${data.totals.orders} orders`} trendUp gradient="from-blue-500 to-sky-400" />
            <StatCard icon={FiTrendingUp} label="Total Profit" value={currencyFmt(data.totals.profit)} trend="In selected period" trendUp gradient="from-teal-500 to-emerald-400" />
            <StatCard icon={FiPackage} label="Inventory Value" value={currencyFmt(data.totals.inventoryValue)} trend="Current stock" trendUp gradient="from-indigo-500 to-blue-400" />
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-5">Revenue & Profit Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', fontSize: '13px' }} formatter={(v) => currencyFmt(v)} />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2.5} dot={false} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5"><FiTrendingUp className="text-success" /> Best Selling Products</h3>
              {data.bestSelling.length === 0 ? <EmptyState icon={FiPackage} title="No sales yet" description="Record sales to see your top products." /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.bestSelling} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="product_name" type="category" width={110} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', fontSize: '13px' }} />
                    <Bar dataKey="totalQty" fill="#2563EB" radius={[0, 8, 8, 0]} name="Units sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5"><FiTrendingDown className="text-danger" /> Slow Moving Products</h3>
              {data.worstSelling.length === 0 ? <EmptyState icon={FiPackage} title="No data yet" description="This will populate as you record sales." /> : (
                <div className="space-y-3 mt-2">
                  {data.worstSelling.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
                      <span className="text-sm font-medium text-slate-700">{p.product_name}</span>
                      <span className="text-xs font-bold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-100">{p.totalQty} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-5">Revenue by Category</h3>
            {data.categoryBreakdown.length === 0 ? <EmptyState icon={FiPackage} title="No category data" description="Category breakdown appears once you have sales." /> : (
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.categoryBreakdown} dataKey="revenue" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
                      {data.categoryBreakdown.map((entry, i) => <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => currencyFmt(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5">
                  {data.categoryBreakdown.map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-600 font-medium">{c.category}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{currencyFmt(c.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
