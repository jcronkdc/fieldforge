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
export const ProjectMetrics = () => <PlaceholderPage title="Project Metrics" icon={Activity} description="Detailed project performance analytics" />;
export const SafetyMetrics = () => <PlaceholderPage title="Safety Metrics" icon={Shield} description="Safety performance and compliance tracking" />;

// Field Operations
export const DailyOperations = () => <PlaceholderPage title="Daily Operations" icon={HardHat} description="Manage daily field activities and reports" />;
// CrewManagement is now a real component - see ./crew/CrewManagement.tsx
export { CrewManagement } from './crew/CrewManagement';
// TimeTracking is now a real component - see ./time/TimeTracking.tsx
export { TimeTracking } from './time/TimeTracking';

// Safety Management
// SafetyHub is now a real component - see ./safety/SafetyHub.tsx
export { SafetyHub } from './safety/SafetyHub';
export const SafetyBriefing = () => <PlaceholderPage title="Safety Briefing" icon={Shield} description="Conduct and document safety briefings" />;
export const IncidentReporting = () => <PlaceholderPage title="Incident Reporting" icon={AlertTriangle} description="Report and track safety incidents" />;
export const PermitManagement = () => <PlaceholderPage title="Permit Management" icon={FileText} description="Manage work permits and clearances" />;

// Equipment & Materials
// EquipmentHub is now a real component - see ./equipment/EquipmentHub.tsx
export { EquipmentHub } from './equipment/EquipmentHub';
export const MaterialInventory = () => <PlaceholderPage title="Material Inventory" icon={Package} description="Track material stock and usage" />;
export const EquipmentMaintenance = () => <PlaceholderPage title="Equipment Maintenance" icon={Wrench} description="Schedule and track maintenance" />;

// QAQC - Now a real component with inspection tracking
export { QAQCHub } from './qaqc/QAQCHub';
export const InspectionManager = () => <PlaceholderPage title="Inspection Manager" icon={ClipboardCheck} description="Schedule and document inspections" />;
export const TestingDashboard = () => <PlaceholderPage title="Testing Dashboard" icon={ClipboardCheck} description="Equipment testing and results" />;

// Documents
export const DocumentHub = () => <PlaceholderPage title="Document Hub" icon={FileText} description="Central document repository" />;
export const DrawingViewer = () => <PlaceholderPage title="Drawing Viewer" icon={FileText} description="View and annotate project drawings" />;
export const SubmittalManager = () => <PlaceholderPage title="Submittal Manager" icon={FileText} description="Manage project submittals" />;

// Project Management
export const ProjectSchedule = () => <PlaceholderPage title="Project Schedule" icon={Calendar} description="Master project schedule and milestones" />;
export const ThreeWeekLookahead = () => <PlaceholderPage title="3-Week Lookahead" icon={Calendar} description="Short-term planning and coordination" />;
export const OutageCoordination = () => <PlaceholderPage title="Outage Coordination" icon={Calendar} description="Plan and coordinate system outages" />;

// Weather & Environmental
export const WeatherDashboard = () => <PlaceholderPage title="Weather Dashboard" icon={Cloud} description="Weather monitoring and forecasts" />;
export const EnvironmentalCompliance = () => <PlaceholderPage title="Environmental Compliance" icon={Cloud} description="Environmental monitoring and compliance" />;

// Communication
export const TeamMessaging = () => <PlaceholderPage title="Team Messaging" icon={MessageSquare} description="Real-time team communication" />;
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