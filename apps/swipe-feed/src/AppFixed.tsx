import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// Import all placeholder components
import {
  ProjectMetrics,
  SafetyMetrics,
  DailyOperations,
  CrewManagement,
  TimeTracking,
  SafetyHub,
  SafetyBriefing,
  IncidentReporting,
  PermitManagement,
  EquipmentHub,
  MaterialInventory,
  EquipmentMaintenance,
  QAQCHub,
  InspectionManager,
  TestingDashboard,
  DocumentHub,
  DrawingViewer,
  SubmittalManager,
  ProjectSchedule,
  ThreeWeekLookahead,
  OutageCoordination,
  WeatherDashboard,
  EnvironmentalCompliance,
  TeamMessaging,
  EmergencyAlerts,
  ProjectMap3D,
  SubstationModel,
  FieldForgeAI,
  Settings,
  CompanySettings,
  UserProfile,
  ReceiptManager
} from './components/placeholders';

// Offline Support
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncStatus } from './components/common/SyncStatus';

// Fixed Landing Page Component
const FixedLandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FF</span>
              </div>
              <span className="text-2xl font-bold text-white">FieldForge</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-white hover:text-blue-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-6">
              BUILD THE IMPOSSIBLE
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Next-Generation Construction Management Platform with AI-Powered Tools,
              Voice Control, and Real-Time Collaboration
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 border border-slate-700"
              >
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>50,000+ Field Workers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>1,000+ Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
          Cutting-Edge Features for Modern Construction
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Voice Control */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-700 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🎙️</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">Voice Control</h3>
            <p className="text-slate-400">
              Hands-free operation for field workers. Create reports, scan receipts,
              and manage tasks with simple voice commands.
            </p>
          </div>
          
          {/* Gesture Controls */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-700 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">👆</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">Smart Gestures</h3>
            <p className="text-slate-400">
              Swipe to approve, reject, and manage. Intuitive touch controls
              designed for tablets and mobile devices.
            </p>
          </div>
          
          {/* AI Assistant */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-700 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">AI Assistant</h3>
            <p className="text-slate-400">
              Get instant answers, generate reports, and receive intelligent
              suggestions powered by advanced AI.
            </p>
          </div>

          {/* Real-Time Analytics */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-700 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">Live Analytics</h3>
            <p className="text-slate-400">
              Monitor project performance in real-time with interactive dashboards
              and predictive insights.
            </p>
          </div>

          {/* OCR Scanning */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-700 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">Smart OCR</h3>
            <p className="text-slate-400">
              Scan receipts and documents with automatic data extraction and
              intelligent categorization.
            </p>
          </div>

          {/* 3D Visualization */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-gray-700 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🌐</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-3">3D Visualization</h3>
            <p className="text-slate-400">
              Holographic UI elements and immersive 3D project visualization
              for better understanding.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FF</span>
              </div>
              <span className="text-xl font-bold text-white">FieldForge</span>
            </div>
            <p className="text-slate-400">© 2025 Cronk Companies LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Need to import useNavigate separately for the component
import { useNavigate } from 'react-router-dom';
import { QATestRunner } from './pages/QATestRunner';
import { FuturisticElectricalLanding } from './pages/FuturisticElectricalLanding';

function AppFixed() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    let mounted = true;
    
    // Check session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker Registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js');
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white">FieldForge</h1>
          <p className="text-slate-400 mt-2">Loading FieldForge</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
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
              
              {/* Admin Setup - For creating admin account */}
              <Route path="/admin-setup" element={<AdminSetup />} />
              
              {/* QA Test Runner - Available to all for testing */}
              <Route path="/qa-tests" element={<QATestRunner />} />
              
              {/* Protected Routes */}
              {session ? (
                <Route element={<MainLayout session={session} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/feed" element={<SocialFeed />} />
                  <Route path="/analytics" element={<RealTimeViz />} />
                  <Route path="/projects" element={<ProjectManager />} />
                  <Route path="/metrics/project" element={<ProjectMetrics />} />
                  <Route path="/metrics/safety" element={<SafetyMetrics />} />
                  <Route path="/field/daily-report" element={<DailyOperations />} />
                  <Route path="/field/crew-management" element={<CrewManagement />} />
                  <Route path="/field/time-tracking" element={<TimeTracking />} />
                  <Route path="/field/receipts" element={<ReceiptManager />} />
                  <Route path="/safety/hub" element={<SafetyHub />} />
                  <Route path="/safety/briefing" element={<SafetyBriefing />} />
                  <Route path="/safety/incident" element={<IncidentReporting />} />
                  <Route path="/safety/permits" element={<PermitManagement />} />
                  <Route path="/equipment/hub" element={<EquipmentHub />} />
                  <Route path="/equipment/inventory" element={<MaterialInventory />} />
                  <Route path="/equipment/maintenance" element={<EquipmentMaintenance />} />
                  <Route path="/qaqc/hub" element={<QAQCHub />} />
                  <Route path="/qaqc/inspections" element={<InspectionManager />} />
                  <Route path="/qaqc/testing" element={<TestingDashboard />} />
                  <Route path="/documents/hub" element={<DocumentHub />} />
                  <Route path="/documents/drawings" element={<DrawingViewer />} />
                  <Route path="/documents/submittals" element={<SubmittalManager />} />
                  <Route path="/schedule/overview" element={<ProjectSchedule />} />
                  <Route path="/schedule/lookahead" element={<ThreeWeekLookahead />} />
                  <Route path="/schedule/outages" element={<OutageCoordination />} />
                  <Route path="/field/weather" element={<WeatherDashboard />} />
                  <Route path="/compliance/environmental" element={<EnvironmentalCompliance />} />
                  <Route path="/communication/messages" element={<TeamMessaging />} />
                  <Route path="/communication/alerts" element={<EmergencyAlerts />} />
                  <Route path="/visualization/map" element={<ProjectMap3D />} />
                  <Route path="/visualization/model" element={<SubstationModel />} />
                  <Route path="/ai/assistant" element={<FieldForgeAI />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/company" element={<CompanySettings />} />
                  <Route path="/settings/profile" element={<UserProfile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              ) : (
                <Route path="*" element={<Navigate to="/" replace />} />
              )}
          </Routes>

          {/* Global Components */}
          {session && (
            <>
              <MobileNav />
              <SyncStatus />
              <VoiceCommandInterface />
              <AIAssistant />
            </>
          )}
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppFixed;