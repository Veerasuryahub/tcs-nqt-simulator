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
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <XCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Result Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-sm">We couldn't find the specific test result you're looking for. It may have been removed or the link is invalid.</p>
      <Link to="/dashboard" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
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
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Exam Results</h1>
          <p className="text-slate-500">Submitted on {new Date(result.completedAt).toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Award size={24} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase">Total Score</span>
            <span className="text-3xl font-bold text-slate-800">{result.totalScore}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={24} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase">Accuracy</span>
            <span className="text-3xl font-bold text-slate-800">{result.totalAccuracy.toFixed(1)}%</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase">Time Taken</span>
            <span className="text-3xl font-bold text-slate-800">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <BarChart2 size={24} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase">Result Status</span>
            <span className="text-3xl font-bold text-slate-800">Pass</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6">Section-wise Performance</h3>
            <div className="h-80">
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6">Detailed Analysis</h3>
            <div className="space-y-6">
              {result.sections.map((section, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700 uppercase text-sm tracking-wider">{section.name.replace('_', ' ')}</span>
                    <span className={`text-sm font-bold ${section.accuracy >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                      {section.accuracy.toFixed(1)}% Accuracy
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> {section.correctAnswers} Correct</span>
                    <span className="flex items-center gap-1 text-red-600"><XCircle size={14} /> {section.wrongAnswers} Wrong</span>
                    <span>Score: {section.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/dashboard" className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg">
            Back to Dashboard
          </Link>
          <Link to="/exam" className="px-8 py-3 tcs-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
            Retake Full Mock Test
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
