import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceCommandInterface } from './components/voice/VoiceCommandInterface';
import './styles/animations.css';
import './styles/ai-animations.css';
import './styles/futuristic.css';

// Auth Components
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { AdminSetup } from './components/auth/AdminSetup';

// Landing Page
import { FuturisticElectricalLanding } from './pages/FuturisticElectricalLanding';

// Social & AI Components
import { SocialFeed } from './components/feed/SocialFeed';
import { AIAssistant } from './components/ai/AIAssistant';
import { RealTimeViz } from './components/visualization/RealTimeViz';

// Layout Components  
import { MainLayout } from './components/layout/MainLayout';
import { MobileNav } from './components/layout/MobileNav';

// Dashboard
import { Dashboard } from './components/dashboard/Dashboard';

// Project Management
import { ProjectManager } from './components/projects/ProjectManager';

// Test Components
import { QATestRunner } from './pages/QATestRunner';

// Placeholder components
import { ReceiptManager } from './components/placeholders';

// Offline Support
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncStatus } from './components/common/SyncStatus';

// Simple fallback component for errors
const ErrorFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
      <p className="text-slate-400 mb-8">Please refresh the page or contact support if the issue persists.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

function AppSafe() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('Auth initialization timeout - proceeding without session');
            setLoading(false);
          }
        }, 5000); // 5 second timeout

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Auth error:', error);
            setError(error.message);
          } else {
            setSession(session);
          }
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      if (mounted) {
        setSession(session);
        setError(null);
      }
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker Registration (only in production)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.log('Service worker registration failed:', err);
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white">FieldForge</h1>
          <p className="text-slate-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if critical error
  if (error && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-red-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(false);
              }}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {isOffline && <OfflineIndicator />}
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                session ? <Navigate to="/dashboard" replace /> : <FuturisticElectricalLanding />
              } />
              
              <Route path="/login" element={
                session ? <Navigate to="/dashboard" replace /> : <LoginPage />
              } />
              
              <Route path="/signup" element={
                session ? <Navigate to="/dashboard" replace /> : <SignUpPage />
              } />
              
              {/* Admin Setup - Always accessible */}
              <Route path="/admin-setup" element={<AdminSetup />} />
              
              {/* QA Test Runner - Always accessible */}
              <Route path="/qa-tests" element={<QATestRunner />} />
              
              {/* Protected Routes */}
              {session ? (
                <>
                  <Route element={<MainLayout session={session} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/feed" element={<SocialFeed />} />
                    <Route path="/analytics" element={<RealTimeViz />} />
                    <Route path="/projects" element={<ProjectManager />} />
                    <Route path="/field/receipts" element={<ReceiptManager />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </>
              ) : (
                <Route path="*" element={<Navigate to="/" replace />} />
              )}
            </Routes>

            {/* Global Components - Only show when authenticated */}
            {session && (
              <>
                <MobileNav />
                <SyncStatus />
                <VoiceCommandInterface />
                <AIAssistant />
              </>
            )}
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppSafe;
