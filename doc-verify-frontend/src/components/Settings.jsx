import React from 'react';
import { User, Shield, Trash2 } from 'lucide-react';

const Settings = () => {
  const userEmail = localStorage.getItem('userEmail') || "Not Logged In";
  const userRole = localStorage.getItem('role') || "Guest";

  const handleClearCache = () => {
    if (window.confirm("Log out and clear session?")) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-500/10 p-3 rounded-2xl">
            <User className="text-blue-500 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Account Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
            <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">{userEmail}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Role</p>
            <p className="text-blue-400 bg-blue-500/5 p-3 rounded-xl border border-blue-500/20 uppercase">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; // <--- MAKE SURE THIS LINE IS HERE