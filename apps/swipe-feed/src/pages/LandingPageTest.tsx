import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPageTest: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-500 mb-4">
            🚧 FieldForge Test Page
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            If you can see this, the routing is working!
          </p>
          
          <div className="bg-slate-800 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Debug Information</h2>
            <div className="text-left space-y-2">
              <p>✅ React Router is functioning</p>
              <p>✅ Component is rendering</p>
              <p>✅ Styles are loading</p>
              <p>Current Path: {window.location.pathname}</p>
              <p>Timestamp: {new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-8 space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-all"
            >
              Go to Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
            >
              Go to Sign Up
            </button>
            <button 
              onClick={() => {
                // Clear session
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
            >
              Clear Session & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
