import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import { Trophy, Medal } from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/exam/leaderboard');
      setLeaderboard(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading leaderboard rankings..." />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
            <Trophy size={32} className="sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Global Leaderboard</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">The top performers of the TCS NQT Simulator</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-4 sm:p-8">
            <div className="space-y-3 sm:space-y-4">
              {leaderboard.map((user, index) => (
                <div key={index} className={`flex items-center justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all ${index === 0 ? 'bg-yellow-50 border border-yellow-100 sm:scale-[1.02] shadow-md' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                    <div className="flex items-center justify-center w-8 sm:w-10 shrink-0">
                       {index === 0 ? <Medal className="text-yellow-500" size={28} /> : 
                        index === 1 ? <Medal className="text-slate-400" size={24} /> :
                        index === 2 ? <Medal className="text-orange-400" size={22} /> :
                        <span className="text-lg font-bold text-slate-400">{index + 1}</span>}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">{user.name}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{user.accuracy.toFixed(1)}% Accuracy</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xl sm:text-2xl font-black text-blue-600">{user.score}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Points</div>
                  </div>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  No records yet. Be the first to top the charts!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
