import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import './styles/animations.css';

// Landing Page
import { LandingPage } from './pages/LandingPage';

// Auth Components
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';

// Layout Components  
import { MainLayout } from './components/layout/MainLayout';
import { MobileNav } from './components/layout/MobileNav';

// Dashboard
import { Dashboard } from './components/dashboard/Dashboard';

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
  UserProfile
} from './components/placeholders';

// Offline Support
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncStatus } from './components/common/SyncStatus';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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
          <p className="text-slate-400 mt-2">Initializing Construction Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {isOffline && <OfflineIndicator />}
        
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={
            session ? <Navigate to="/dashboard" replace /> : <LandingPage />
          } />
          
          {/* Auth Routes */}
          <Route path="/login" element={
            session ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/signup" element={
            session ? <Navigate to="/dashboard" replace /> : <SignUpPage />
          } />
          
          {/* Protected Routes */}
          {session ? (
            <Route element={<MainLayout session={session} />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/metrics/project" element={<ProjectMetrics />} />
              <Route path="/metrics/safety" element={<SafetyMetrics />} />
              
              {/* Field Operations */}
              <Route path="/field" element={<DailyOperations />} />
              <Route path="/field/crews" element={<CrewManagement />} />
              <Route path="/field/time" element={<TimeTracking />} />
              
              {/* Safety */}
              <Route path="/safety" element={<SafetyHub />} />
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
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/company" element={<CompanySettings />} />
              <Route path="/settings/profile" element={<UserProfile />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>

        {/* Mobile Navigation - Only show when logged in */}
        {session && <MobileNav />}
        
        {/* Sync Status Indicator */}
        {session && <SyncStatus />}
      </div>
    </Router>
  );
}

export default App;