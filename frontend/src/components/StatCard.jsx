import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function StatCard({ icon: Icon, label, value, trend, trendUp, gradient = 'from-blue-500 to-sky-400', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trendUp ? 'text-success' : 'text-danger'}`}>
              {trendUp ? <FiArrowUp /> : <FiArrowDown />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg shadow-lg`}>
          {Icon && <Icon />}
        </div>
      </div>
    </motion.div>
  );
}
