import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiBox, FiShoppingCart, FiBarChart2, FiCpu, FiFileText, FiSettings, FiMenu, FiX, FiZap,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/inventory', label: 'Inventory', icon: FiBox },
  { to: '/sales', label: 'Sales', icon: FiShoppingCart },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/ai-advisor', label: 'AI Advisor', icon: FiCpu },
  { to: '/orders', label: 'Orders', icon: FiFileText },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white">
          <FiZap />
        </div>
        <span className="font-bold text-lg text-slate-800">Vyapaar<span className="text-primary">AI</span></span>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.75 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-primary text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`
            }
          >
            <item.icon className="text-lg" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-100">
        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
        <p className="text-sm font-semibold text-slate-700 truncate">{user?.owner_name}</p>
        <p className="text-xs text-slate-400 truncate">{user?.business_name}</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-100 bg-white">
        {content}
      </aside>

      <div className="lg:hidden flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
            <FiZap />
          </div>
          <span className="font-bold text-slate-800">Vyapaar<span className="text-primary">AI</span></span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-2xl text-slate-600">
          <FiMenu />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative w-72 bg-white h-full shadow-2xl"
          >
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-4 text-xl text-slate-500">
              <FiX />
            </button>
            {content}
          </motion.div>
        </div>
      )}
    </>
  );
}
