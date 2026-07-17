import React from 'react';
import { FiLogOut, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Topbar({ title, subtitle }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.owner_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/70 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => toast('You have no new notifications')}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
        >
          <FiBell />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-danger transition px-3 py-2 rounded-xl hover:bg-red-50"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}
