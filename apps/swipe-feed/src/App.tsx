import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './components/auth/AuthProvider';
import { VoiceCommandInterface } from './components/voice/VoiceCommandInterface';
import './styles/animations.css';
import './styles/ai-animations.css';

// Landing Page
import { Landing } from './pages/Landing';
import { LandingPageTest } from './pages/LandingPageTest';
import { TestRouting } from './pages/TestRouting';
import { TestRunner } from './pages/TestRunner';

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
import { DashboardPage } from './pages/Dashboard';

// Project Management
import { ProjectManager } from './components/projects/ProjectManager';

// Real Components - LIVE UPDATED AS WE BUILD ✅
import { TimeTracking } from './components/time/TimeTracking';
import { SafetyHub } from './components/safety/SafetyHub';
import { EquipmentHub } from './components/equipment/EquipmentHub';
import { SafetyManagement } from './components/safety/SafetyManagement';
import { CrewManagement } from './components/crew/CrewManagement';
import { QAQCHub } from './components/qaqc/QAQCHub';
import { DocumentHub } from './components/documents/DocumentHub';
import { ReceiptManager } from './components/receipts/ReceiptManager';

// Placeholder Components - TO BE REPLACED
import {
  ProjectMetrics,
  SafetyMetrics,
  DailyOperations,
  SafetyBriefing,
  IncidentReporting,
  PermitManagement,
  MaterialInventory,
  EquipmentMaintenance,
  InspectionManager,
  TestingDashboard,
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
  CompanySettings,
  UserProfile
} from './components/placeholders';
import { SettingsPage } from './pages/Settings';

// Offline Support
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncStatus } from './components/common/SyncStatus';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => undefined);
    }

    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    return () => {
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
          <p className="text-slate-400 mt-2">Initializing construction management system</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {isOffline && <OfflineIndicator />}
        
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={session ? <Navigate to="/dashboard" replace /> : <Landing />}
          />
          
          {/* Auth Routes */}
          <Route path="/login" element={
            session ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/signup" element={
            session ? <Navigate to="/dashboard" replace /> : <SignUpPage />
          } />
          
          {/* Test Routes - Available to all */}
          <Route path="/test" element={<LandingPageTest />} />
          <Route path="/test-routing" element={<TestRouting />} />
          <Route path="/test-runner" element={<TestRunner />} />
          
          {/* Protected Routes */}
          {session ? (
            <Route element={<MainLayout session={session} />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/feed" element={<SocialFeed />} />
              <Route path="/analytics" element={<RealTimeViz />} />
              <Route path="/projects" element={<ProjectManager />} />
              <Route path="/metrics/project" element={<ProjectMetrics />} />
              <Route path="/metrics/safety" element={<SafetyMetrics />} />
              
                  {/* Field Operations */}
                  <Route path="/field" element={<DailyOperations />} />
                  <Route path="/field/crews" element={<CrewManagement />} />
                  <Route path="/field/time" element={<TimeTracking />} />
                  <Route path="/field/receipts" element={<ReceiptManager />} />
              
              {/* Safety - REORGANIZED FOR BETTER FLOW */}
              <Route path="/safety" element={<SafetyManagement />} />
              <Route path="/safety/hub" element={<SafetyHub />} />
              <Route path="/safety/briefing" element={<SafetyBriefing />} />
              <Route path="/safety/incidents" element={<IncidentReporting />} />
              <Route path="/safety/permits" element={<PermitManagement />} />
              
              {/* Equipment */}
              <Route path="/equipment" element={<EquipmentHub />} />
              <Route path="/equipment/inventory" element={<MaterialInventory />} />
              <Route path="/equipment/maintenance" element={<EquipmentMaintenance />} />
              
              {/* QAQC */}
              <Route path="/qaqc" element={<QAQCHub />} />
              <Route path="/qaqc/inspections" element={<InspectionManager />} />
              <Route path="/qaqc/testing" element={<TestingDashboard />} />
              
              {/* Documents */}
              <Route path="/documents" element={<DocumentHub />} />
              <Route path="/documents/drawings" element={<DrawingViewer />} />
              <Route path="/documents/submittals" element={<SubmittalManager />} />
              
              {/* Project */}
              <Route path="/schedule" element={<ProjectSchedule />} />
              <Route path="/schedule/lookahead" element={<ThreeWeekLookahead />} />
              <Route path="/schedule/outages" element={<OutageCoordination />} />
              
              {/* Weather */}
              <Route path="/weather" element={<WeatherDashboard />} />
              <Route path="/environmental" element={<EnvironmentalCompliance />} />
              
              {/* Communication */}
              <Route path="/messages" element={<TeamMessaging />} />
              <Route path="/alerts" element={<EmergencyAlerts />} />
              
              {/* 3D Visualization */}
              <Route path="/map" element={<ProjectMap3D />} />
              <Route path="/model" element={<SubstationModel />} />
              
              {/* AI Assistant */}
              <Route path="/ai" element={<FieldForgeAI />} />
              
              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/company" element={<CompanySettings />} />
              <Route path="/settings/profile" element={<UserProfile />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>

        {/* Mobile Navigation - Only show when logged in */}
        {session && <MobileNav />}
        
        {/* Sync Status Indicator */}
        {session && <SyncStatus />}
        
        {/* Voice Command Interface - Available when logged in */}
        {session && <VoiceCommandInterface />}
        
        {/* AI Assistant - Available on all protected routes */}
        {session && <AIAssistant />}
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
