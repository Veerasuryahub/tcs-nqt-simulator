import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="max-w-md w-full glass-card p-6 sm:p-10 rounded-2xl sm:rounded-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 tcs-gradient rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto mb-4 shadow-lg">
            N
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Access your TCS NQT Prep Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-sm flex items-center gap-2 border border-red-100">
             <Lock size={16} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-slate-500 text-xs sm:text-sm">Remember me</span>
            </label>
            <a href="#" className="font-semibold text-blue-600 hover:underline text-xs sm:text-sm">Forgot?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-4 tcs-gradient text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:opacity-90 transition-all disabled:opacity-70 text-sm sm:text-base"
          >
            {loading ? 'Signing in...' : <><LogIn size={20} /> Login</>}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center text-sm">
          <span className="text-slate-500">Don't have an account?</span>{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
