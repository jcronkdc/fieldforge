import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';

export const SimpleLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">FieldForge</h1>
            <p className="text-slate-400">Electrical Construction Platform</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="mb-12">
          <h2 className="text-6xl font-bold text-white mb-6">
            Built for <span className="text-blue-400">Electrical Contractors</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Complete project management, crew coordination, and safety compliance 
            for substation, transmission, and distribution construction.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">Project Management</h3>
            <p className="text-slate-400">
              Track electrical construction projects with voltage classes, budgets, and crew assignments.
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">IBEW Crew Coordination</h3>
            <p className="text-slate-400">
              Manage union crews, certifications, and high-voltage work assignments.
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">Safety Compliance</h3>
            <p className="text-slate-400">
              Arc flash studies, work permits, and OSHA compliance tracking.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 text-lg font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all"
          >
            Sign In
          </button>
        </div>

        {/* Beta Badge */}
        <div className="mt-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-semibold">
            🚀 Now in Beta Testing
          </span>
        </div>
      </div>
    </div>
  );
};
