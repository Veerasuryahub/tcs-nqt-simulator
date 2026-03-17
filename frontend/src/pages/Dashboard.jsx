import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import { Play, History, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [userStats, setUserStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/auth/me');
      const historyRes = await api.get('/exam/history');
      setUserStats(statsRes.data);
      setHistory(historyRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {userStats?.name}!</h1>
            <p className="text-slate-500 mt-1">Track your progress and practice for TCS NQT 2026.</p>
          </div>
          <Link 
            to="/exam" 
            className="flex items-center gap-2 px-8 py-4 tcs-gradient text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:scale-105 transition-transform"
          >
            <Play size={20} /> START FULL MOCK TEST
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12% from last week</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Average Accuracy</h3>
            <p className="text-2xl font-bold text-slate-800">{userStats?.analytics?.avgScore?.toFixed(1) || 0}%</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <History size={20} />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Total Tests Taken</h3>
            <p className="text-2xl font-bold text-slate-800">{userStats?.analytics?.totalTests || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Weakest Section</h3>
            <p className="text-2xl font-bold text-slate-800">{userStats?.analytics?.weakSections?.[0] || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Recent Test History</h2>
              <Link to="/history" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
            </div>
            
            {history.length === 0 ? (
               <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center">
                  <p className="text-slate-400">No tests taken yet. Start your first mock test today!</p>
               </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 5).map((test) => (
                  <div key={test._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 tcs-gradient rounded-xl flex items-center justify-center text-white font-bold">
                        {test.totalScore}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{test.testName}</h4>
                        <p className="text-xs text-slate-400">{new Date(test.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-slate-700">{test.totalAccuracy.toFixed(1)}% Accuracy</p>
                          <p className="text-xs text-slate-400">{Math.floor(test.timeTaken / 60)}m taken</p>
                       </div>
                       <Link to={`/results/${test._id}`} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <ChevronRight size={20} />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice Sections */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Quick Practice</h2>
            <div className="grid grid-cols-1 gap-4">
              {['Numerical', 'Logical', 'Verbal', 'Coding'].map((section) => (
                <button key={section} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                  <span className="font-medium text-slate-700">{section} Ability</span>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              ))}
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-200">
               <h3 className="font-bold mb-2">Daily Challenge</h3>
               <p className="text-blue-100 text-sm mb-4">Complete today's coding problem to earn extra points.</p>
               <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">Solve Now</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
