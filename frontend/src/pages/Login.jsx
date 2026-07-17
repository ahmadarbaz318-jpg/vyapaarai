import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiZap, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('demo@vyapaar.ai');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bgsoft">
      <div className="hidden lg:flex w-1/2 bg-gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-16 w-40 h-40 rounded-3xl bg-white/10 float-anim" />
        <div className="absolute bottom-24 right-20 w-28 h-28 rounded-full bg-teal-400/20 float-anim" style={{ animationDelay: '1s' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 text-white max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
            <FiZap className="text-2xl text-teal-300" />
          </div>
          <h2 className="text-3xl font-bold leading-snug">Run your shop smarter, not harder.</h2>
          <p className="text-blue-100 mt-4 leading-relaxed">Track inventory, record sales, and get AI-powered business advice — all from one simple dashboard built for local shop owners.</p>
          <div className="mt-10 flex gap-6">
            <div>
              <p className="text-2xl font-bold">10k+</p>
              <p className="text-blue-200 text-sm">Shops onboarded</p>
            </div>
            <div>
              <p className="text-2xl font-bold">₹2Cr+</p>
              <p className="text-blue-200 text-sm">Sales tracked</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition">
          <FiArrowLeft /> Back to home
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Log in to your Vyapaar AI dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Email address</label>
              <div className="relative mt-1.5">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@shop.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Password</label>
              <div className="relative mt-1.5">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 disabled:opacity-60">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-5 p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <strong>Demo credentials</strong> are pre-filled — just click Log In to explore.
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-primary font-semibold">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
