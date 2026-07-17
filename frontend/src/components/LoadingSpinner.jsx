import React from 'react';

export default function LoadingSpinner({ full = false, label = 'Loading...' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? 'h-[70vh]' : 'py-16'}`}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}
