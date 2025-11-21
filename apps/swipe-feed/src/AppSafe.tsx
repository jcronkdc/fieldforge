import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useRobustAuth } from './hooks/useRobustAuth';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceCommandInterface } from './components/voice/VoiceCommandInterface';
import { FuturisticToastContainer } from './components/common/FuturisticToast';
import { FuturisticLoader } from './components/common/FuturisticLoader';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { logEnvironmentStatus } from './lib/env-validator';
import type { Session } from '@supabase/supabase-js';
import './styles/animations.css';
import './styles/ai-animations.css';
import './styles/futuristic.css';
import './styles/futuristic-master.css';
import './styles/premium-animations.css';
import './styles/contrast-fixes.css';

// 🐜 ANT OPTIMIZATION: Lazy-load heavy components for shortest initial bundle
// Only auth and landing pages load immediately (critical path)
// All other components load on-demand when user navigates

// Auth Components (Critical Path - Load Immediately)
import { FuturisticLogin } from './components/auth/FuturisticLogin';
import { FuturisticSignUp } from './components/auth/FuturisticSignUp';
import { FuturisticAdminSetup } from './components/auth/FuturisticAdminSetup';

// Landing Page (Critical Path - Load Immediately)
import { NewElectricalLanding } from './pages/NewElectricalLanding';
import { Landing } from './pages/Landing';

// Layout Components (Critical Path - Load Immediately)
import { FuturisticLayout } from './components/layout/FuturisticLayout';

// 🍄 MYCELIAL CODE-SPLITTING: Dynamic imports for all non-critical routes
// Benefits: 1.9 MB → ~300 KB initial, ~150 KB per route chunk
// User impact: Faster first load, near-instant navigation

// Marketing Pages (Lazy - ~80 KB chunk)
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactSales = lazy(() => import('./components/contact/ContactSales'));
const ShowcasePage = lazy(() => import('./components/showcase/ShowcasePage'));
const AcquisitionInquiry = lazy(() => import('./pages/AcquisitionInquiry'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

// Legal / Support Pages (Lazy - ~20 KB chunk)
const LegalPrivacy = lazy(() => import('./pages/LegalPrivacy'));
const LegalTerms = lazy(() => import('./pages/LegalTerms'));
const SupportPage = lazy(() => import('./pages/SupportPage'));

// Social & AI Components (Lazy - ~200 KB chunk)
const SocialFeed = lazy(() => import('./components/feed/SocialFeed'));
const AIAssistant = lazy(() => import('./components/ai/AIAssistant'));
const FieldForgeAI = lazy(() => import('./components/ai/FieldForgeAI'));
const RealTimeViz = lazy(() => import('./components/visualization/RealTimeViz'));

// Dashboard & Management (Lazy - ~250 KB chunk)
const FuturisticDashboard = lazy(() => import('./components/dashboard/FuturisticDashboard'));
const ProjectManager = lazy(() => import('./components/projects/ProjectManager'));

// Test Components (Lazy - ~50 KB chunk)
const QATestRunner = lazy(() => import('./pages/QATestRunner'));
const AcquisitionEvaluation = lazy(() => import('./tests/AcquisitionEvaluation'));
const AuthDiagnostic = lazy(() => import('./pages/AuthDiagnostic'));

// Onboarding (Lazy - ~30 KB chunk)
const WelcomePage = lazy(() => import('./pages/WelcomePage'));

// 🍄 COLLABORATION HUB COMPONENTS (Lazy - ~300 KB chunk)
// Daily.co video, Ably real-time, invite-only groups
const ReceiptManager = lazy(() => import('./components/receipts/ReceiptManager'));
const DailyOperations = lazy(() => import('./components/fieldops/DailyOperations'));
const TimeTracking = lazy(() => import('./components/time/TimeTracking'));
const WeatherDashboard = lazy(() => import('./components/weather/WeatherDashboard'));
const TeamMessaging = lazy(() => import('./components/messaging/TeamMessaging'));
const QAQCHub = lazy(() => import('./components/qaqc/QAQCHub'));
const EquipmentHub = lazy(() => import('./components/equipment/EquipmentHub'));
const DocumentHub = lazy(() => import('./components/documents/DocumentHub'));
const SafetyHub = lazy(() => import('./components/safety/SafetyHub'));
const ProjectSchedule = lazy(() => import('./components/projects/ProjectSchedule'));
const ThreeWeekLookahead = lazy(() => import('./components/scheduling/ThreeWeekLookahead'));

// Field Operations (Lazy - ~100 KB chunk)
const FieldOperationsIndex = lazy(() => import('./pages/FieldOperationsIndex'));

// Specialized Components (Lazy - ~150 KB chunk)
const SubstationManager = lazy(() => import('./components/specialized/SubstationManager'));
const NationwideCrewManager = lazy(() => import('./components/specialized/NationwideCrewManager'));

// 3D Visualization (Lazy - ~200 KB chunk with Three.js)
const ProjectMap3D = lazy(() => import('./components/visualization/ProjectMap3D'));
const SubstationModel = lazy(() => import('./components/visualization/SubstationModel'));

// Onboarding for Electrical Contractors (Lazy - ~40 KB chunk)
const ElectricalContractorWelcome = lazy(() => import('./components/onboarding/ElectricalContractorWelcome'));

// Offline Support (Keep immediate - critical for UX)
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncStatus } from './components/common/SyncStatus';

// Environment Indicators (Keep immediate - critical for UX)
import { EnvironmentBadge, LiveSiteBanner } from './components/common/EnvironmentBadge';

// Simple fallback component for errors
const ErrorFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
      <p className="text-slate-400 mb-8">Please refresh the page or contact support if the issue persists.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

function AppSafe() {
  // Use the robust auth system
  const { session, loading, error, isAuthenticated } = useRobustAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Validate environment on app start
    try {
      logEnvironmentStatus();
    } catch (error) {
      console.error('Environment validation failed:', error);
    }

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
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              🏠 Return Home
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
              <Route path="/" element={<NewElectricalLanding />} />
              <Route path="/app" element={
                session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              } />
              
              <Route path="/login" element={
                session ? <Navigate to="/dashboard" replace /> : <FuturisticLogin />
              } />
              <Route path="/landing" element={<Landing />} />
              <Route path="/simple" element={<Landing />} />
              
              {/* Marketing Pages - Always Public */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactSales />} />
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/privacy" element={<LegalPrivacy />} />
              <Route path="/terms" element={<LegalTerms />} />
              <Route path="/support" element={<SupportPage />} />
              
              <Route path="/signup" element={
                session ? <Navigate to="/dashboard" replace /> : <FuturisticSignUp />
              } />
              
              {/* Welcome Page - For email confirmation */}
              <Route path="/welcome" element={<WelcomePage />} />
              
              {/* Admin Setup - Always accessible */}
              <Route path="/admin-setup" element={<FuturisticAdminSetup />} />
              
              {/* QA Test Runner - Always accessible */}
              <Route path="/qa-tests" element={<QATestRunner />} />
              
              {/* Auth Diagnostic - Always accessible */}
              <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
              
              {/* Acquisition Evaluation - Always accessible */}
              <Route path="/acquisition" element={<AcquisitionEvaluation />} />
              
              {/* Acquisition & Custom Development - Always accessible */}
              <Route path="/acquisition-inquiry" element={<AcquisitionInquiry />} />
              
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
                    <Route path="/messages" element={<TeamMessaging />} />
                    
                    {/* QA/QC Routes */}
                    <Route path="/qaqc" element={<QAQCHub />} />
                    
                    {/* Equipment Routes */}
                    <Route path="/equipment" element={<EquipmentHub />} />
                    
                    {/* Document Routes */}
                    <Route path="/documents" element={<DocumentHub />} />
                    
                    {/* Safety Routes */}
                    <Route path="/safety" element={<SafetyHub />} />
                    
                    {/* Schedule Routes */}
                    <Route path="/schedule" element={<ThreeWeekLookahead />} />
                    <Route path="/schedule/lookahead" element={<ThreeWeekLookahead />} />
                    <Route path="/schedule/overview" element={<ProjectSchedule />} />
                    
                    {/* Weather */}
                    <Route path="/weather" element={<WeatherDashboard />} />
                    
                    {/* 3D Visualization */}
                    <Route path="/project-map" element={<ProjectMap3D />} />
                    <Route path="/substation-3d" element={<SubstationModel />} />
                    
                    {/* AI Assistant */}
                    <Route path="/ai-assistant" element={<FieldForgeAI />} />
                    
                    {/* Catch all - redirect to dashboard */}
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
