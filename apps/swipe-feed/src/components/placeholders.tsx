// Temporary placeholder components for FieldForge
// These will be replaced with full implementations

import React from 'react';
import { HardHat, Shield, Package, ClipboardCheck, FileText, Calendar, Cloud, MessageSquare, Map, Brain, Settings as SettingsIcon, Activity, Users, Timer, AlertTriangle, Building2, Wrench, DollarSign, Target } from 'lucide-react';

const PlaceholderPage: React.FC<{ title: string; icon: React.ElementType; description: string }> = ({ title, icon: Icon, description }) => (
  <div className="p-6">
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
        <Icon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400">{description}</p>
        <p className="text-sm text-slate-500 mt-8">Coming Soon - This feature is under development</p>
      </div>
    </div>
  </div>
);

// Dashboard Components
// ProjectMetrics is now a real component - see ./analytics/ProjectMetrics.tsx
export { ProjectMetrics } from './analytics/ProjectMetrics';
// SafetyMetrics is now a real component - see ./analytics/SafetyMetrics.tsx
export { SafetyMetrics } from './analytics/SafetyMetrics';

// Field Operations
// DailyOperations is now a real component - see ./fieldops/DailyOperations.tsx
export { DailyOperations } from './fieldops/DailyOperations';
// CrewManagement is now a real component - see ./crew/CrewManagement.tsx
export { CrewManagement } from './crew/CrewManagement';
// TimeTracking is now a real component - see ./time/TimeTracking.tsx
export { TimeTracking } from './time/TimeTracking';

// Safety Management
// SafetyHub is now a real component - see ./safety/SafetyHub.tsx
export { SafetyHub } from './safety/SafetyHub';
// SafetyBriefing is now a real component - see ./safety/SafetyBriefing.tsx
export { SafetyBriefing } from './safety/SafetyBriefing';
// IncidentReporting is now a real component - see ./safety/IncidentReporting.tsx
export { IncidentReporting } from './safety/IncidentReporting';
// PermitManagement is now a real component - see ./safety/PermitManagement.tsx
export { PermitManagement } from './safety/PermitManagement';

// Equipment & Materials
// EquipmentHub is now a real component - see ./equipment/EquipmentHub.tsx
export { EquipmentHub } from './equipment/EquipmentHub';
// MaterialInventory is now a real component - see ./inventory/MaterialInventory.tsx
export { MaterialInventory } from './inventory/MaterialInventory';
// EquipmentMaintenance is now a real component - see ./equipment/EquipmentMaintenance.tsx
export { EquipmentMaintenance } from './equipment/EquipmentMaintenance';

// QAQC - Now a real component with inspection tracking
export { QAQCHub } from './qaqc/QAQCHub';
// InspectionManager is now a real component - see ./qaqc/InspectionManager.tsx
export { InspectionManager } from './qaqc/InspectionManager';
// Testing - Complete equipment testing & compliance system
export { TestingDashboard } from './testing/TestingDashboard';

// Documents - Now with real upload/download/share functionality
export { DocumentHub } from './documents/DocumentHub';
// Drawing Viewer - CAD/PDF viewing with annotations
export { DrawingViewer } from './documents/DrawingViewer';
// SubmittalManager is now a real component - see ./submittals/SubmittalManager.tsx
export { SubmittalManager } from './submittals/SubmittalManager';

// Project Management
// ProjectSchedule is now a real component - see ./projects/ProjectSchedule.tsx
export { ProjectSchedule } from './projects/ProjectSchedule';
// Scheduling - Real-time 3-week activity planning
export { ThreeWeekLookahead } from './scheduling/ThreeWeekLookahead';
// OutageCoordination is now a real component - see ./outages/OutageCoordination.tsx
export { OutageCoordination } from './outages/OutageCoordination';

// Weather & Environmental
// WeatherDashboard is now a real component - see ./weather/WeatherDashboard.tsx
export { WeatherDashboard } from './weather/WeatherDashboard';
// EnvironmentalCompliance is now a real component - see ./environmental/EnvironmentalCompliance.tsx
export { EnvironmentalCompliance } from './environmental/EnvironmentalCompliance';

// Communication
// TeamMessaging is now a real component - see ./messaging/TeamMessaging.tsx
export { TeamMessaging } from './messaging/TeamMessaging';
export const EmergencyAlerts = () => <PlaceholderPage title="Emergency Alerts" icon={AlertTriangle} description="Emergency broadcast system" />;

// 3D Visualization
export const ProjectMap3D = () => <PlaceholderPage title="3D Project Map" icon={Map} description="Interactive 3D project visualization" />;
export const SubstationModel = () => <PlaceholderPage title="Substation Model" icon={Building2} description="3D substation equipment layout" />;

// AI Assistant
export const FieldForgeAI = () => <PlaceholderPage title="FieldForge AI Assistant" icon={Brain} description="AI-powered construction assistant" />;

// Settings
export const Settings = () => <PlaceholderPage title="Settings" icon={SettingsIcon} description="Application settings and preferences" />;
export const CompanySettings = () => <PlaceholderPage title="Company Settings" icon={Building2} description="Company configuration and management" />;
export const UserProfile = () => <PlaceholderPage title="User Profile" icon={Users} description="Manage your profile and preferences" />;

// Receipt Management - Now using real implementation
export { ReceiptScanner } from './receipts/ReceiptScanner';
export { ReceiptManager } from './receipts/ReceiptManager';