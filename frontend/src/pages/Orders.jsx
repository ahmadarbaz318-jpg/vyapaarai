import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFileText, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from 'react-icons/fi';
import Layout from '../components/Layout.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../api/axios.js';

export default function Orders() {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchSales = useCallback(() => {
    setLoading(true);
    api.get('/sales', { params: { search, page, limit: 10 } })
      .then((res) => { setSales(res.data.sales); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const currencyFmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;
  const dateFmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <Layout title="Orders" subtitle="View your complete sales history">
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by invoice or customer..." className="input-field pl-10" />
      </div>

      {loading ? <LoadingSpinner /> : sales.length === 0 ? (
        <EmptyState icon={FiFileText} title="No orders yet" description="Sales you record will appear here as an order history." />
      ) : (
        <>
          <div className="space-y-3">
            {sales.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="w-full flex items-center justify-between p-5 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <FiFileText />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{s.invoice_number}</p>
                      <p className="text-xs text-slate-400">{s.customer_name} • {dateFmt(s.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-medium">{s.payment_method}</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{currencyFmt(s.total_amount)}</p>
                      <p className="text-xs text-success font-medium">+{currencyFmt(s.total_profit)} profit</p>
                    </div>
                    {expandedId === s.id ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
                  </div>
                </button>
                {expandedId === s.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50">
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="text-left text-slate-400">
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 font-medium text-right">Qty</th>
                          <th className="pb-2 font-medium text-right">Price</th>
                          <th className="pb-2 font-medium text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-1.5 text-slate-600">{item.product_name}</td>
                            <td className="py-1.5 text-right text-slate-500">{item.quantity}</td>
                            <td className="py-1.5 text-right text-slate-500">{currencyFmt(item.price)}</td>
                            <td className="py-1.5 text-right font-medium text-slate-700">{currencyFmt(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50">
                <FiChevronLeft />
              </button>
              <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50">
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
