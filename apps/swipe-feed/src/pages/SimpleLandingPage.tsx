import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SimpleLandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
            BUILD THE IMPOSSIBLE
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Next-Generation Construction Management Platform
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/50 transition">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">Voice Control</h3>
            <p className="text-slate-400">Hands-free operation for field workers</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/50 transition">
            <div className="text-4xl mb-4">👆</div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">Gesture Controls</h3>
            <p className="text-slate-400">Swipe to approve, reject, and manage</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/50 transition">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">3D Visualization</h3>
            <p className="text-slate-400">Holographic UI with real-time data</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-amber-400">50K+</div>
            <div className="text-slate-400">Field Workers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">1000+</div>
            <div className="text-slate-400">Projects</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">99.9%</div>
            <div className="text-slate-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};
