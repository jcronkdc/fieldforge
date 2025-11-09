import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OmniGuideProvider } from './context/OmniGuideContext';
import { AuthenticatedAppV2 } from './components/AuthenticatedAppV2';
import { AuthenticatedApp } from './components/AuthenticatedApp'; // Keep as fallback
import { FuturisticLanding } from './components/landing/FuturisticLanding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BetaBanner } from './components/BetaBanner';
import { FullPageLoader } from './components/LoadingStates';
import { RecoveryModal } from './components/RecoveryModal';
import { SafeStorage } from './utils/storageUtils';
import { Footer } from './components/layout/Footer';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { EpicOnboarding } from './components/onboarding/EpicOnboarding';
// New pages
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { Roadmap } from './pages/Roadmap';
import { HelpCenter } from './pages/HelpCenter';
import { Blog } from './pages/Blog';
import { CookiePolicy } from './pages/CookiePolicy';
import { DMCA } from './pages/DMCA';
import { SafeClickFeedback } from './components/SafeClickFeedback';
import { EnhancedSelectionFeedback } from './components/EnhancedSelectionFeedback';
import './styles/global.css';
import './styles/safe-feedback.css';
import './styles/button-selection.css';
import './styles/landing-fix.css';
import './styles/futuristic.css';
import './styles/enhanced-selection.css';
import './styles/mobile-fixes.css';
import './styles/omniguide-mobile.css';
import './styles/DESIGN_SYSTEM.css'; // IMMUTABLE DESIGN SYSTEM - DO NOT MODIFY

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
        <OmniGuideProvider>
          <SafeClickFeedback />
          <EnhancedSelectionFeedback />
          <AppContent />
        </OmniGuideProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { loading, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRecovery, setShowRecovery] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Clear any hash if not authenticated
    if (!loading && !session) {
      if (location.hash && location.hash !== '') {
        navigate('/', { replace: true });
      }
    }
  }, [loading, session, location.hash, navigate]);

  useEffect(() => {
    // Keyboard shortcut for recovery modal (Ctrl/Cmd + Shift + R)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setShowRecovery(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Check for storage corruption on load
    try {
      SafeStorage.clearCorruptedData(localStorage);
      SafeStorage.clearCorruptedData(sessionStorage);
    } catch (error) {
      console.error('Error checking storage:', error);
    }
  }, []);

  // Check for first-time user
  useEffect(() => {
    if (session && !loading) {
      const hasSeenOnboarding = localStorage.getItem('mythatron_onboarding_completed');
      const forceShowTutorial = localStorage.getItem('mythatron_force_tutorial');
      const hasProfile = localStorage.getItem('mythatron_username'); // Check if user has a profile
      const hasSignedInBefore = localStorage.getItem('mythatron_demo_auth') === 'true' || 
                               localStorage.getItem('mythatron_user_email');
      
      if (forceShowTutorial === 'true') {
        setShowOnboarding(true);
        localStorage.removeItem('mythatron_force_tutorial');
      } else if (hasSeenOnboarding !== 'true' && !hasProfile && !hasSignedInBefore) {
        // Only show onboarding for brand new users who have never signed in
        setShowOnboarding(true);
      } else {
        // For returning users, mark onboarding as completed
        if (hasSeenOnboarding !== 'true') {
          localStorage.setItem('mythatron_onboarding_completed', 'true');
        }
      }
    }
  }, [session, loading]);

  if (loading) {
    return <FullPageLoader message="Initializing MythaTron..." />;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/dmca" element={<DMCA />} />
        <Route path="*" element={
          <>
            <BetaBanner />
            <FuturisticLanding />
            <Footer />
            <RecoveryModal isOpen={showRecovery} onClose={() => setShowRecovery(false)} />
            
            {/* Recovery Button - Always visible */}
            <button
              onClick={() => setShowRecovery(true)}
              className="fixed bottom-20 right-4 z-50 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110"
              title="Recovery Options (Ctrl+Shift+R)"
            >
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </>
        } />
      </Routes>
    );
  }

  return (
    <>
      {showOnboarding && (
        <EpicOnboarding onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('mythatron_onboarding_completed', 'true');
          // Don't change the hash, just let the app continue
        }} />
      )}
      <ErrorBoundary>
        <AuthenticatedAppV2 />
      </ErrorBoundary>
      <RecoveryModal isOpen={showRecovery} onClose={() => setShowRecovery(false)} />
      
      {/* Recovery Button - Always visible */}
      <button
        onClick={() => setShowRecovery(true)}
        className="fixed bottom-20 right-4 z-50 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110"
        title="Recovery Options (Ctrl+Shift+R)"
      >
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </>
  );
}