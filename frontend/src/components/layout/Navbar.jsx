import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, BarChart2, LayoutDashboard, Trophy } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 tcs-gradient rounded-lg flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <span className="text-xl font-bold text-slate-800">TCS <span className="text-blue-600">NQT</span> Simulator</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium">
              <Trophy size={18} /> Leaderboard
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-slate-600 hover:text-blue-600 font-medium">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-700">
              <User size={16} />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
