import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBox, FiChevronLeft, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../api/axios.js';

const emptyForm = { name: '', category: '', price: '', cost: '', quantity: '', lowStockThreshold: '10', image: '' };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api.get('/products', { params: { search, category: categoryFilter, page, limit: 9 } })
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, categoryFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { api.get('/products/categories').then((res) => setCategories(res.data.categories)); }, []);

  const openAddModal = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEditModal = (p) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, price: p.price, cost: p.cost, quantity: p.quantity, lowStockThreshold: p.low_stock_threshold, image: p.image || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      cost: parseFloat(form.cost),
      quantity: parseInt(form.quantity),
      lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
      image: form.image,
    };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success('Product updated successfully.');
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully.');
      }
      setModalOpen(false);
      fetchProducts();
      api.get('/products/categories').then((res) => setCategories(res.data.categories));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast.success('Product deleted.');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const currencyFmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <Layout title="Inventory" subtitle="Manage your products and stock levels">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field sm:w-56">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={openAddModal} className="btn-primary px-5 py-2.5 flex items-center gap-2 whitespace-nowrap">
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState icon={FiBox} title="No products found" description="Try adjusting your search or add your first product." action={
          <button onClick={openAddModal} className="btn-primary px-5 py-2.5 flex items-center gap-2"><FiPlus /> Add Product</button>
        } />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => {
              const isLow = p.quantity <= p.low_stock_threshold;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
                  <div className="flex items-start justify-between">
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl bg-slate-50 object-cover" />
                    {isLow && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-red-50 px-2.5 py-1 rounded-full">
                        <FiAlertTriangle className="text-xs" /> Low
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 mt-3.5">{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.category}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-lg font-bold text-slate-800">{currencyFmt(p.price)}</p>
                      <p className="text-xs text-slate-400">Cost: {currencyFmt(p.cost)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isLow ? 'text-danger' : 'text-slate-700'}`}>{p.quantity}</p>
                      <p className="text-xs text-slate-400">in stock</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => openEditModal(p)} className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1.5">
                      <FiEdit2 className="text-xs" /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(p)} className="flex-1 py-2 text-sm rounded-xl border-1.5 border border-red-100 text-danger hover:bg-red-50 transition flex items-center justify-center gap-1.5 font-semibold">
                      <FiTrash2 className="text-xs" /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Product name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1.5" placeholder="e.g. Basmati Rice 5kg" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Category</label>
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field mt-1.5" placeholder="e.g. Grocery" list="category-list" />
            <datalist id="category-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Selling price (₹)</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Cost price (₹)</label>
              <input required type="number" step="0.01" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input-field mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Quantity in stock</label>
              <input required type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input-field mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Low stock threshold</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="input-field mt-1.5" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Image URL (optional)</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field mt-1.5" placeholder="https://..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 mt-2 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`This will permanently remove "${deleteTarget?.name}" from your inventory. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </Layout>
  );
}
