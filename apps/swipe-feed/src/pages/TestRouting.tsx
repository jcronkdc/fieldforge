import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const TestRouting: React.FC = () => {
  const routes = [
    { path: '/', label: 'Landing Page', requiresAuth: false },
    { path: '/login', label: 'Login', requiresAuth: false },
    { path: '/signup', label: 'Sign Up', requiresAuth: false },
    { path: '/dashboard', label: 'Dashboard', requiresAuth: true },
    { path: '/feed', label: 'Social Feed', requiresAuth: true },
    { path: '/analytics', label: 'Analytics', requiresAuth: true },
    { path: '/projects', label: 'Projects', requiresAuth: true },
    { path: '/field', label: 'Field Operations', requiresAuth: true },
    { path: '/safety', label: 'Safety', requiresAuth: true },
    { path: '/equipment', label: 'Equipment', requiresAuth: true },
    { path: '/qaqc', label: 'QAQC', requiresAuth: true },
    { path: '/documents', label: 'Documents', requiresAuth: true },
    { path: '/schedule', label: 'Schedule', requiresAuth: true },
    { path: '/weather', label: 'Weather', requiresAuth: true },
    { path: '/messages', label: 'Messages', requiresAuth: true },
    { path: '/settings', label: 'Settings', requiresAuth: true },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Route Testing Page</h1>
        <p className="text-gray-400 mb-6">Click any link to test routing on Vercel deployment</p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">Public Routes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {routes.filter(r => !r.requiresAuth).map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 rounded-lg p-3 transition-all flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white">{route.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-400 mb-3">Protected Routes (Require Login)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {routes.filter(r => r.requiresAuth).map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-lg p-3 transition-all flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">{route.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Current URL:</h3>
            <p className="text-white font-mono">{window.location.href}</p>
            <h3 className="text-lg font-semibold text-amber-400 mt-4 mb-2">Pathname:</h3>
            <p className="text-white font-mono">{window.location.pathname}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
