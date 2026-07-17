import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { motion } from 'framer-motion';

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-bgsoft">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-4 lg:p-8 max-w-[1600px] mx-auto"
        >
          <div className="lg:hidden mb-5">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
