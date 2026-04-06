import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { CheckCircle, XCircle, Clock, Award, BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import LoadingScreen from '../../components/common/LoadingScreen';

const Results = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/exam/history`);
      const submission = res.data.find(s => s._id === id);
      setResult(submission);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Gleaning insights from your performance..." />;
  
  if (!result) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <XCircle size={32} className="sm:w-10 sm:h-10" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Result Not Found</h2>
      <p className="text-slate-500 mb-6 sm:mb-8 max-w-sm text-sm sm:text-base">We couldn't find the specific test result you're looking for.</p>
      <Link to="/dashboard" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg text-sm sm:text-base">
        Return to Dashboard
      </Link>
    </div>
  );

  const chartData = {
    labels: result.sections.map(s => s.name.toUpperCase()),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: result.sections.map(s => s.accuracy),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-4">Exam Results</h1>
          <p className="text-slate-500 text-sm sm:text-base">Submitted on {new Date(result.completedAt).toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 sm:mb-4">
              <Award size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Total Score</span>
            <span className="text-xl sm:text-3xl font-bold text-slate-800">{result.totalScore}</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 sm:mb-4">
              <CheckCircle size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Accuracy</span>
            <span className="text-xl sm:text-3xl font-bold text-slate-800">{result.totalAccuracy.toFixed(1)}%</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2 sm:mb-4">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Time</span>
            <span className="text-xl sm:text-3xl font-bold text-slate-800">{Math.floor(result.timeTaken / 60)}m</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 sm:mb-4">
              <BarChart2 size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Status</span>
            <span className="text-xl sm:text-3xl font-bold text-slate-800">Pass</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Section-wise Performance</h3>
            <div className="h-60 sm:h-80">
              <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Detailed Analysis</h3>
            <div className="space-y-4 sm:space-y-6">
              {result.sections.map((section, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3 sm:pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <span className="font-bold text-slate-700 uppercase text-xs sm:text-sm tracking-wider">{section.name.replace('_', ' ')}</span>
                    <span className={`text-xs sm:text-sm font-bold ${section.accuracy >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                      {section.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {section.correctAnswers}</span>
                    <span className="flex items-center gap-1 text-red-600"><XCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {section.wrongAnswers}</span>
                    <span>Score: {section.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link to="/dashboard" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg text-center text-sm sm:text-base">
            Back to Dashboard
          </Link>
          <Link to="/exam" className="px-6 sm:px-8 py-2.5 sm:py-3 tcs-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg text-center text-sm sm:text-base">
            Retake Full Mock Test
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
