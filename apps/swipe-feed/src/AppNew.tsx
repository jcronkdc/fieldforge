import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/animations.css';
import './styles/ai-animations.css';

// Simple working landing page
const WorkingLandingPage = () => {
  console.log('WorkingLandingPage rendered');
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-7xl font-black text-amber-500 mb-4">
            FIELDFORGE
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            Construction Management Platform
          </p>
          <div className="space-x-4">
            <a href="/login" className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold">
              Sign In
            </a>
            <a href="/signup" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Dashboard
const SimpleDashboard = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <p className="text-xl mb-4">Welcome to FieldForge!</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Import auth pages
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';

export function AppNew() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AppNew: Starting initialization');
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('AppNew: Loading timeout - forcing completion');
      setLoading(false);
    }, 3000);

    // Check session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.log('AppNew: Session check complete', { hasSession: !!session });
        setSession(session);
        setLoading(false);
        clearTimeout(loadingTimeout);
      })
      .catch((error) => {
        console.error('AppNew: Error getting session:', error);
        setSession(null);
        setLoading(false);
        clearTimeout(loadingTimeout);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AppNew: Auth state changed', { event, hasSession: !!session });
      setSession(session);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  console.log('AppNew: Render', { loading, hasSession: !!session });

  // Show loading for maximum 3 seconds
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Landing page - always accessible */}
          <Route path="/" element={
            session ? <Navigate to="/dashboard" replace /> : <WorkingLandingPage />
          } />
          
          {/* Auth routes */}
          <Route path="/login" element={
            session ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/signup" element={
            session ? <Navigate to="/dashboard" replace /> : <SignUpPage />
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            session ? <SimpleDashboard /> : <Navigate to="/" replace />
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
