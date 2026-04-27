import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// --- PrivateRoute Component ---
// This prevents users from manually typing /dashboard if they aren't logged in.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// --- Dashboard Placeholder ---
// We will build the full professional dashboard in the next step!
const DashboardPlaceholder = () => {
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 flex flex-col items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center max-w-lg shadow-2xl">
        <h1 className="text-4xl font-black mb-4">Welcome back, {role}!</h1>
        <p className="text-slate-400 mb-8 font-mono">Logged in as: {email}</p>
        
        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl mb-8">
          <p className="text-blue-400 text-sm italic">
            Dashboard UI is currently under construction.
            Backend connection: <span className="text-emerald-400 font-bold underline">ONLINE</span>
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 border border-slate-700 text-slate-300 px-8 py-3 rounded-xl transition-all font-bold"
        >
          Secure Logout
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard Route */}
        <Route 
  path="/dashboard" 
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } 
/>

        {/* Redirect any unknown routes back to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;