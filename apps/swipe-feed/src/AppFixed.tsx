import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceCommandInterface } from './components/voice/VoiceCommandInterface';
import './styles/animations.css';
import './styles/ai-animations.css';

// Auth Components
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-2xl">
            <span className="text-4xl font-black text-white">FF</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mb-4">
            FIELDFORGE
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
            Next-Generation Construction Management Platform
          </p>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur text-amber-400 rounded-full text-sm font-medium">
            🎙️ Voice Control
          </span>
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur text-amber-400 rounded-full text-sm font-medium">
            👆 Gesture Support
          </span>
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur text-amber-400 rounded-full text-sm font-medium">
            📊 Real-Time Analytics
          </span>
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur text-amber-400 rounded-full text-sm font-medium">
            🤖 AI Assistant
          </span>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-105"
          >
            Get Started Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-105"
          >
            Sign In
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-amber-400">50K+</div>
            <div className="text-sm text-slate-400">Field Workers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">1000+</div>
            <div className="text-sm text-slate-400">Active Projects</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">99.9%</div>
            <div className="text-sm text-slate-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import useNavigate hook for FixedLandingPage
import { useNavigate } from 'react-router-dom';

// Import test runner
import { SystemTestRunner } from './pages/SystemTestRunner';

export default function AppFixed() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error);
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white">FieldForge</h1>
          <p className="text-slate-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {isOffline && <OfflineIndicator />}
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                session ? <Navigate to="/dashboard" replace /> : <FixedLandingPage />
              } />
              
              <Route path="/login" element={
                session ? <Navigate to="/dashboard" replace /> : <LoginPage />
              } />
              
              <Route path="/signup" element={
                session ? <Navigate to="/dashboard" replace /> : <SignUpPage />
              } />
              
              {/* Test Runner - Available to all */}
              <Route path="/test-runner" element={<SystemTestRunner />} />
              
              {/* Protected Routes */}
              {session ? (
                <Route element={<MainLayout session={session} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/feed" element={<SocialFeed />} />
                  <Route path="/analytics" element={<RealTimeViz />} />
                  <Route path="/projects" element={<ProjectManager />} />
                  <Route path="/metrics/project" element={<ProjectMetrics />} />
                  <Route path="/metrics/safety" element={<SafetyMetrics />} />
                  
                  {/* Field Operations */}
                  <Route path="/field/daily-report" element={<DailyOperations />} />
                  <Route path="/field/crew" element={<CrewManagement />} />
                  <Route path="/field/time-tracking" element={<TimeTracking />} />
                  <Route path="/field/weather" element={<WeatherDashboard />} />
                  <Route path="/field/environmental" element={<EnvironmentalCompliance />} />
                  <Route path="/field/receipts" element={<ReceiptManager />} />
                  
                  {/* Safety */}
                  <Route path="/safety" element={<SafetyHub />} />
                  <Route path="/safety/briefing" element={<SafetyBriefing />} />
                  <Route path="/safety/incident" element={<IncidentReporting />} />
                  <Route path="/safety/permits" element={<PermitManagement />} />
                  <Route path="/safety/inspection" element={<InspectionManager />} />
                  
                  {/* Equipment & Materials */}
                  <Route path="/equipment" element={<EquipmentHub />} />
                  <Route path="/equipment/inventory" element={<MaterialInventory />} />
                  <Route path="/equipment/maintenance" element={<EquipmentMaintenance />} />
                  
                  {/* Quality */}
                  <Route path="/quality" element={<QAQCHub />} />
                  <Route path="/quality/testing" element={<TestingDashboard />} />
                  
                  {/* Documents */}
                  <Route path="/documents" element={<DocumentHub />} />
                  <Route path="/documents/drawings" element={<DrawingViewer />} />
                  <Route path="/documents/submittals" element={<SubmittalManager />} />
                  
                  {/* Schedule */}
                  <Route path="/schedule" element={<ProjectSchedule />} />
                  <Route path="/schedule/lookahead" element={<ThreeWeekLookahead />} />
                  <Route path="/schedule/outage" element={<OutageCoordination />} />
                  
                  {/* Communication */}
                  <Route path="/messages" element={<TeamMessaging />} />
                  <Route path="/alerts" element={<EmergencyAlerts />} />
                  
                  {/* 3D Visualization */}
                  <Route path="/map" element={<ProjectMap3D />} />
                  <Route path="/model" element={<SubstationModel />} />
                  
                  {/* AI */}
                  <Route path="/ai" element={<FieldForgeAI />} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/company" element={<CompanySettings />} />
                  <Route path="/settings/profile" element={<UserProfile />} />
                </Route>
              ) : (
                <Route path="*" element={<Navigate to="/" replace />} />
              )}
            </Routes>

            {/* Global Components for authenticated users */}
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
