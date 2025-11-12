import React, { useEffect, useState, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceCommandInterface } from './components/voice/VoiceCommandInterface';
import { FuturisticToastContainer } from './components/common/FuturisticToast';
import { FuturisticLoader } from './components/common/FuturisticLoader';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './styles/animations.css';
import './styles/ai-animations.css';
import './styles/futuristic.css';
import './styles/futuristic-master.css';
import './styles/premium-animations.css';

// Auth Components
import { FuturisticLogin } from './components/auth/FuturisticLogin';
import { FuturisticSignUp } from './components/auth/FuturisticSignUp';
import { FuturisticAdminSetup } from './components/auth/FuturisticAdminSetup';

// Landing Page
import { FuturisticElectricalLanding } from './pages/FuturisticElectricalLanding';

// Social & AI Components
import { SocialFeed } from './components/feed/SocialFeed';
import { AIAssistant } from './components/ai/AIAssistant';
import { RealTimeViz } from './components/visualization/RealTimeViz';

// Layout Components  
import { FuturisticLayout } from './components/layout/FuturisticLayout';
import { MobileNav } from './components/layout/MobileNav';

// Dashboard
import { FuturisticDashboard } from './components/dashboard/FuturisticDashboard';

// Project Management
import { ProjectManager } from './components/projects/ProjectManager';

// Test Components
import { QATestRunner } from './pages/QATestRunner';
import { AcquisitionEvaluation } from './tests/AcquisitionEvaluation';

// Onboarding
import { WelcomePage } from './pages/WelcomePage';

// Placeholder components
import { ReceiptManager, DailyOperations, TimeTracking, WeatherDashboard } from './components/placeholders';

// Field operations
import { FieldOperationsIndex } from './pages/FieldOperationsIndex';

// Specialized components for electrical contractors
import { SubstationManager } from './components/specialized/SubstationManager';
import { NationwideCrewManager } from './components/specialized/NationwideCrewManager';

// Offline Support
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncStatus } from './components/common/SyncStatus';

// Environment Indicators
import { EnvironmentBadge, LiveSiteBanner } from './components/common/EnvironmentBadge';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((err) => {
          console.error('Service worker registration failed:', err);
        });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading state with futuristic loader
  if (loading) {
    return <FuturisticLoader size="fullscreen" message="INITIALIZING FIELDFORGE SYSTEMS" />;
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
        <ScrollToTop />
        <AppContent session={session} isOffline={isOffline} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};
// Inner component that can use Router hooks
const AppContent: React.FC<{ session: Session | null; isOffline: boolean }> = ({ session, isOffline }) => {
  // Use keyboard shortcuts hook
  useKeyboardShortcuts();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <FuturisticToastContainer />
      <KeyboardShortcutsModal />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <LiveSiteBanner />
        <EnvironmentBadge />
        {isOffline && <OfflineIndicator />}
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                session ? <Navigate to="/dashboard" replace /> : <FuturisticElectricalLanding />
              } />
              
              <Route path="/login" element={
                session ? <Navigate to="/dashboard" replace /> : <FuturisticLogin />
              } />
              
              <Route path="/signup" element={
                session ? <Navigate to="/dashboard" replace /> : <FuturisticSignUp />
              } />
              
              {/* Welcome Page - For email confirmation */}
              <Route path="/welcome" element={<WelcomePage />} />
              
              {/* Admin Setup - Always accessible */}
              <Route path="/admin-setup" element={<FuturisticAdminSetup />} />
              
              {/* QA Test Runner - Always accessible */}
              <Route path="/qa-tests" element={<QATestRunner />} />
              
              {/* Acquisition Evaluation - Always accessible */}
              <Route path="/acquisition" element={<AcquisitionEvaluation />} />
              
              {/* Protected Routes */}
              {session ? (
                <>
                  <Route element={<FuturisticLayout session={session} />}>
                    <Route path="/dashboard" element={<FuturisticDashboard />} />
                    <Route path="/feed" element={<SocialFeed />} />
                    <Route path="/analytics" element={<RealTimeViz />} />
                    <Route path="/projects" element={<ProjectManager />} />
                    <Route path="/field" element={<FieldOperationsIndex />} />
                    <Route path="/field/daily" element={<DailyOperations />} />
                    <Route path="/field/daily-report" element={<DailyOperations />} />
                    <Route path="/field/crews" element={<NationwideCrewManager />} />
                    <Route path="/field/time" element={<TimeTracking />} />
                    <Route path="/field/time-tracking" element={<TimeTracking />} />
                    <Route path="/field/receipts" element={<ReceiptManager />} />
                    <Route path="/field/weather" element={<WeatherDashboard />} />
                    <Route path="/substations" element={<SubstationManager />} />
                    <Route path="/crews" element={<NationwideCrewManager />} />
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
    </>
  );
};

export default AppSafe;
