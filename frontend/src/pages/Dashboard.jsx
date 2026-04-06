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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-10 gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hello, <span className="text-blue-600">{user?.name}</span>!
            </h1>
            <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-lg">
              Ready to crush the TCS NQT 2026? Let's check your progress.
            </p>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <Link 
              to="/exam" 
              className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 tcs-gradient text-white rounded-xl sm:rounded-2xl font-bold shadow-2xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-1 transition-all text-sm sm:text-base w-full sm:w-auto"
            >
              <Zap className="fill-white group-hover:scale-110 transition-transform" size={20} />
              START MOCK TEST
            </Link>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className={`w-11 h-11 sm:w-14 sm:h-14 ${stat.bg} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(stat.icon, { size: 24 })}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insight</span>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1">{stat.trend}</p>
                </div>
              </div>
              <h3 className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">{stat.label}</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Recent Activity */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 px-1 sm:px-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
                  <BarChart3 className="text-blue-600" size={22} />
                  Recent Performance
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Summary of your latest 5 attempts</p>
              </div>
              <Link to="/history" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                View Reports
              </Link>
            </div>

            {error && (
               <div className="bg-red-50 border border-red-100 text-red-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
               </div>
            )}
            
            {history.length === 0 ? (
               <div className="bg-white p-8 sm:p-16 rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 sm:mb-6">
                    <History size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">No history found</h3>
                  <p className="text-slate-400 max-w-sm mb-6 sm:mb-8 text-sm">You haven't attempted any tests yet. Your performance metrics will appear here once you complete your first mock test.</p>
                  <Link to="/exam" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 text-sm">
                    Take Your First Test
                  </Link>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {history.slice(0, 5).map((test, idx) => (
                  <div 
                    key={test._id || idx} 
                    className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex items-center group hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 tcs-gradient rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-black shadow-lg shrink-0">
                      {test.totalScore}
                    </div>
                    
                    <div className="ml-3 sm:ml-6 flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-lg group-hover:text-blue-600 transition-colors truncate">
                        Full Prep Mock Test #{idx + 1}
                      </h4>
                      <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-400 flex items-center gap-1">
                          <Timer size={12} className="sm:w-3.5 sm:h-3.5" /> {Math.floor(test.timeTaken / 60)}m
                        </span>
                        <span className="text-slate-300 hidden xs:inline">•</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-400 flex items-center gap-1">
                          <Target size={12} className="sm:w-3.5 sm:h-3.5" /> {test.totalAccuracy.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end mr-4 sm:mr-8 shrink-0">
                       <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Date</p>
                       <p className="text-sm font-bold text-slate-600">
                         {new Date(test.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </p>
                    </div>

                    <Link to={`/results/${test._id}`} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 flex items-center justify-center rounded-xl sm:rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                       <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice Hub */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 px-1 sm:px-2 flex items-center gap-2 sm:gap-3">
              <Zap className="text-blue-600 fill-blue-600" size={22} />
              Practice Hub
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {[
                { name: 'Numerical', id: 'numerical', icon: '123', color: 'bg-orange-50 text-orange-600 border-orange-100' },
                { name: 'Reasoning', id: 'reasoning', icon: '(?!)', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                { name: 'Verbal', id: 'verbal', icon: '"Aa"', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                { name: 'Coding', id: 'coding', icon: '</>', color: 'bg-slate-900 text-white border-slate-900' }
              ].map((section) => (
                <Link 
                  key={section.name} 
                  to={`/exam?section=${section.id}&practice=true`}
                  className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm ${section.color}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-lg sm:text-xl font-black opacity-30 tracking-tighter w-7 sm:w-8">{section.icon}</span>
                    <span className="font-bold text-base sm:text-lg">{section.name} Ability</span>
                  </div>
                  <ChevronRight size={18} className="stroke-[3] sm:w-5 sm:h-5" />
                </Link>
              ))}
            </div>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-600/20 rounded-full blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:bg-blue-600/40 transition-colors duration-700"></div>
               <div className="relative z-10">
                 <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3">Daily Code Quest</h3>
                 <p className="text-slate-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6 leading-relaxed">Solve one hard-level coding problem every day to maintain your streak.</p>
                 <button className="w-full py-3 sm:py-4 bg-white text-slate-900 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
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
