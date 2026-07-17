import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiBriefcase, FiZap, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const businessTypes = ['Grocery Store', 'Pharmacy', 'Cafe', 'Clothing Store', 'Stationery Shop', 'Hardware Store', 'General Store'];

export default function Register() {
  const [form, setForm] = useState({ businessName: '', ownerName: '', email: '', password: '', businessType: 'Grocery Store' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Vyapaar AI.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bgsoft">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative order-2 lg:order-1">
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition">
          <FiArrowLeft /> Back to home
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Start managing your shop digitally in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-3.5">
            <div>
              <label className="text-sm font-medium text-slate-600">Business name</label>
              <div className="relative mt-1.5">
                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required value={form.businessName} onChange={update('businessName')} className="input-field pl-10" placeholder="Sharma General Store" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Owner name</label>
              <div className="relative mt-1.5">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required value={form.ownerName} onChange={update('ownerName')} className="input-field pl-10" placeholder="Rahul Sharma" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Business type</label>
              <select value={form.businessType} onChange={update('businessType')} className="input-field mt-1.5">
                {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email address</label>
              <div className="relative mt-1.5">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={form.email} onChange={update('email')} className="input-field pl-10" placeholder="you@shop.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Password</label>
              <div className="relative mt-1.5">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required minLength={6} value={form.password} onChange={update('password')} className="input-field pl-10" placeholder="At least 6 characters" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Log in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gradient-hero relative overflow-hidden items-center justify-center p-12 order-1 lg:order-2">
        <div className="absolute top-24 right-16 w-36 h-36 rounded-3xl bg-white/10 float-anim" />
        <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-teal-400/20 float-anim" style={{ animationDelay: '1.2s' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 text-white max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
            <FiZap className="text-2xl text-teal-300" />
          </div>
          <h2 className="text-3xl font-bold leading-snug">Join thousands of shop owners going digital.</h2>
          <p className="text-blue-100 mt-4 leading-relaxed">No technical knowledge needed. Set up your shop, add products, and start tracking sales in under 5 minutes.</p>
        </motion.div>
      </div>
    </div>
  );
}
