import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Preparing your mock test environment..." }) => {
  return (
    <div className="fixed inset-0 min-h-screen bg-slate-50 flex flex-col items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-3xl shadow-xl shadow-blue-100 border border-slate-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 tcs-gradient rounded-lg shadow-inner"></div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">TCS NQT Simulator 2026</h3>
          <p className="text-slate-500 font-medium px-4">{message}</p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
