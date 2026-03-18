import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  History, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  Zap,
  Target,
  BarChart3,
  Timer
} from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const historyRes = await api.get('/exam/history');
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // We still want to show the dashboard even if history fails, just empty
      setError("Unable to load latest test history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Fetching your latest performance stats..." />;

  const stats = [
    {
      label: "Avg. Accuracy",
      value: `${(user?.analytics?.avgScore || 0).toFixed(1)}%`,
      icon: <Target className="text-blue-600" />,
      bg: "bg-blue-50",
      trend: "+5.2% vs last month"
    },
    {
      label: "Tests Completed",
      value: user?.analytics?.totalTests || 0,
      icon: <History className="text-purple-600" />,
      bg: "bg-purple-50",
      trend: "3 tests this week"
    },
    {
      label: "Strongest Area",
      value: user?.analytics?.weakSections?.length === 0 ? "N/A" : "Verbal",
      icon: <TrendingUp className="text-emerald-600" />,
      bg: "bg-emerald-50",
      trend: "Top 10% in Verbal"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Hello, <span className="text-blue-600">{user?.name}</span>!
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Ready to crush the TCS NQT 2026? Let's check your progress.
            </p>
          </div>
          
          <div className="flex gap-4 animate-in fade-in slide-in-from-right duration-700">
            <Link 
              to="/exam" 
              className="group flex items-center gap-3 px-8 py-4 tcs-gradient text-white rounded-2xl font-bold shadow-2xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-1 transition-all"
            >
              <Zap className="fill-white group-hover:scale-110 transition-transform" />
              START MOCK TEST
            </Link>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group animate-in zoom-in duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(stat.icon, { size: 28 })}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insight</span>
                  <p className="text-xs font-bold text-slate-400 mt-1">{stat.trend}</p>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</h3>
              <p className="text-4xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Recent Activity */}
          <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <BarChart3 className="text-blue-600" />
                  Recent Performance
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Summary of your latest 5 attempts</p>
              </div>
              <Link to="/history" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-full">
                View Reports
              </Link>
            </div>

            {error && (
               <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <AlertTriangle size={18} />
                  {error}
               </div>
            )}
            
            {history.length === 0 ? (
               <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <History size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No history found</h3>
                  <p className="text-slate-400 max-w-sm mb-8">You haven't attempted any tests yet. Your performance metrics will appear here once you complete your first mock test.</p>
                  <Link to="/exam" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    Take Your First Test
                  </Link>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {history.slice(0, 5).map((test, idx) => (
                  <div 
                    key={test._id || idx} 
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center group hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                  >
                    <div className="w-16 h-16 tcs-gradient rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                      {test.totalScore}
                    </div>
                    
                    <div className="ml-6 flex-1">
                      <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                        Full Prep Mock Test #{idx + 1}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                          <Timer size={14} /> {Math.floor(test.timeTaken / 60)} min
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                          <Target size={14} /> {test.totalAccuracy.toFixed(0)}% Accurate
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end mr-8">
                       <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Date</p>
                       <p className="text-sm font-bold text-slate-600">
                         {new Date(test.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </p>
                    </div>

                    <Link to={`/results/${test._id}`} className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                       <ChevronRight size={24} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice Hub */}
          <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-right duration-700">
            <h2 className="text-2xl font-black text-slate-900 px-2 flex items-center gap-3">
              <Zap className="text-blue-600 fill-blue-600" />
              Practice Hub
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Numerical', id: 'numerical', icon: '123', color: 'bg-orange-50 text-orange-600 border-orange-100' },
                { name: 'Reasoning', id: 'reasoning', icon: '(?!)', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                { name: 'Verbal', id: 'verbal', icon: '"Aa"', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                { name: 'Coding', id: 'coding', icon: '</>', color: 'bg-slate-900 text-white border-slate-900' }
              ].map((section, idx) => (
                <Link 
                  key={section.name} 
                  to={`/exam?section=${section.id}&practice=true`}
                  className={`p-5 rounded-2xl border flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm ${section.color}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black opacity-30 tracking-tighter w-8">{section.icon}</span>
                    <span className="font-bold text-lg">{section.name} Ability</span>
                  </div>
                  <ChevronRight size={20} className="stroke-[3]" />
                </Link>
              ))}
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/40 transition-colors duration-700"></div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-3">Daily Code Quest</h3>
                 <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Solve one hard-level coding problem every day to maintain your streak.</p>
                 <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                   SOLVE TODAY <Zap size={14} className="fill-slate-900" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
