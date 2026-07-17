import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiBriefcase, FiUser, FiDollarSign, FiSun, FiMoon, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { applyTheme } from '../utils/theme';

const currencies = [
  { code: 'INR', label: '₹ Indian Rupee (INR)' },
  { code: 'USD', label: '$ US Dollar (USD)' },
  { code: 'EUR', label: '€ Euro (EUR)' },
  { code: 'GBP', label: '£ British Pound (GBP)' },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setUser, user } = useAuth();

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data.settings)).finally(() => setLoading(false));
  }, []);

  const update = (key) => (e) => setSettings({ ...settings, [key]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/settings', {
        businessName: settings.business_name,
        ownerName: settings.owner_name,
        currency: settings.currency,
        theme: settings.theme,
        lowStockThreshold: parseInt(settings.low_stock_threshold),
      });
      setSettings(data.settings);
      const updatedUser = { ...user, business_name: data.settings.business_name, owner_name: data.settings.owner_name };
      setUser(updatedUser);
      localStorage.setItem('vyapaar_user', JSON.stringify(updatedUser));
      // apply theme immediately
      if (data.settings.theme === 'dark') applyTheme('dark');
      else applyTheme('light');
      toast.success('Settings updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <Layout title="Settings"><LoadingSpinner full /></Layout>;

  return (
    <Layout title="Settings" subtitle="Manage your business profile and preferences">
      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-5">Business Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Business name</label>
              <div className="relative mt-1.5">
                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={settings.business_name || ''} onChange={update('business_name')} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Owner name</label>
              <div className="relative mt-1.5">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={settings.owner_name || ''} onChange={update('owner_name')} className="input-field pl-10" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-5">Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Currency</label>
              <div className="relative mt-1.5">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={settings.currency} onChange={update('currency')} className="input-field pl-10">
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Low stock alert threshold</label>
              <div className="relative mt-1.5">
                <FiAlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" min="0" value={settings.low_stock_threshold} onChange={update('low_stock_threshold')} className="input-field pl-10" />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Default alert threshold applied to new products.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setSettings({ ...settings, theme: 'light' })} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition ${settings.theme === 'light' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 text-slate-500'}`}>
                  <FiSun /> Light
                </button>
                <button type="button" onClick={() => setSettings({ ...settings, theme: 'dark' })} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition ${settings.theme === 'dark' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 text-slate-500'}`}>
                  <FiMoon /> Dark
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Select your preferred system theme layout.</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-60">
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.form>
    </Layout>
  );
}
