/**
 * Enhanced Master Dashboard
 * Integrates all dashboard extensions with existing functionality
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Icons } from '../icons/Icons';

// Lazy load dashboard extensions for performance
const ProfitabilityDeepDive = lazy(() => import('./extensions/ProfitabilityDeepDive'));
const GrowthScienceDashboard = lazy(() => import('./extensions/GrowthScienceDashboard'));
const ExportAccountingPack = lazy(() => import('./extensions/ExportAccountingPack'));
const TestExecutionPanel = lazy(() => import('./TestExecutionPanel'));

// Import existing dashboard components
// These would be your existing dashboard modules
interface DashboardModule {
  id: string;
  name: string;
  icon: React.FC<any>;
  component: React.FC<any>;
  category: 'financial' | 'growth' | 'operations' | 'export' | 'admin';
  requiredRole?: 'admin' | 'analyst' | 'viewer';
  description: string;
}

interface Props {
  userId: string;
  userRole?: 'admin' | 'analyst' | 'viewer';
  sparksBalance?: number;
  notifications?: any[];
}

export const EnhancedMasterDashboard: React.FC<Props> = ({ userId, userRole = 'viewer', sparksBalance, notifications: initialNotifications }) => {
  const [selectedModule, setSelectedModule] = useState<string>('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Dashboard modules configuration
  const modules: DashboardModule[] = [
    // Existing modules
    {
      id: 'overview',
      name: 'Overview',
      icon: Icons.Dashboard,
      component: () => <OverviewDashboard dateRange={dateRange} />,
      category: 'financial',
      description: 'Real-time metrics and KPIs'
    },
    
    // New Extensions
    {
      id: 'profitability',
      name: 'Profitability Deep Dive',
      icon: Icons.Revenue,
      component: () => <ProfitabilityDeepDive dateRange={dateRange} />,
      category: 'financial',
      requiredRole: 'analyst',
      description: 'Advanced margin analysis and unit economics'
    },
    {
      id: 'growth',
      name: 'Growth Science',
      icon: Icons.Analytics,
      component: () => <GrowthScienceDashboard dateRange={dateRange} />,
      category: 'growth',
      requiredRole: 'analyst',
      description: 'Experimentation and growth metrics'
    },
    {
      id: 'export',
      name: 'Export & Accounting',
      icon: Icons.Export,
      component: () => <ExportAccountingPack />,
      category: 'export',
      description: 'Comprehensive data export for taxes and audits'
    },
    
    // Testing module
    {
      id: 'testing',
      name: 'Test Execution',
      icon: Icons.Metrics,
      component: () => <TestExecutionPanel />,
      category: 'operations',
      requiredRole: 'admin',
      description: 'One-click comprehensive testing for 1M users'
    },
    
    // Additional modules
    {
      id: 'reliability',
      name: 'SLO & Reliability',
      icon: Icons.Metrics,
      component: () => <SLODashboard dateRange={dateRange} />,
      category: 'operations',
      requiredRole: 'admin',
      description: 'Service level objectives and uptime'
    },
    {
      id: 'incidents',
      name: 'Incidents & RCA',
      icon: Icons.Warning,
      component: () => <IncidentsDashboard />,
      category: 'operations',
      requiredRole: 'admin',
      description: 'Incident management and root cause analysis'
    },
    {
      id: 'governance',
      name: 'Governance & Safety',
      icon: Icons.Security,
      component: () => <GovernanceDashboard />,
      category: 'admin',
      requiredRole: 'admin',
      description: 'Compliance and safety monitoring'
    },
    {
      id: 'ai-copilot',
      name: 'AI Copilot',
      icon: Icons.Spark,
      component: () => <AICopilotDashboard />,
      category: 'admin',
      requiredRole: 'admin',
      description: 'AI-powered insights and recommendations'
    }
  ];

  // Filter modules based on user role
  const accessibleModules = modules.filter(module => {
    if (!module.requiredRole) return true;
    if (userRole === 'admin') return true;
    if (userRole === 'analyst' && module.requiredRole !== 'admin') return true;
    return false;
  });

  // Group modules by category
  const modulesByCategory = accessibleModules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, DashboardModule[]>);

  // Search functionality
  const filteredModules = searchQuery
    ? accessibleModules.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  useEffect(() => {
    // Fetch notifications
    fetchNotifications();
    
    // Set up WebSocket for real-time updates
    const ws = setupWebSocket();
    
    return () => {
      ws?.close();
    };
  }, []);

  const fetchNotifications = async () => {
    // Mock notifications
    setNotifications([
      {
        id: '1',
        type: 'alert',
        message: 'Profitability margin dropped below 65%',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'success',
        message: 'Export completed successfully',
        timestamp: new Date()
      }
    ]);
  };

  const setupWebSocket = () => {
    // In production, connect to WebSocket server
    return null;
  };

  const handleExport = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      console.log(`Exporting data from ${module.name}`);
      // Trigger export logic
    }
  };

  const currentModule = accessibleModules.find(m => m.id === selectedModule);

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 border-r border-gray-800 transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-white">Master Dashboard</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Icons.Settings size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-gray-500"
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {filteredModules ? (
            // Search results
            <div>
              <p className="text-xs text-gray-500 mb-2">Search Results</p>
              {filteredModules.map(module => (
                <button
                  key={module.id}
                  onClick={() => {
                    setSelectedModule(module.id);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    selectedModule === module.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <module.icon size={20} />
                  {!isCollapsed && <span className="text-sm">{module.name}</span>}
                </button>
              ))}
            </div>
          ) : (
            // Categorized modules
            Object.entries(modulesByCategory).map(([category, categoryModules]) => (
              <div key={category} className="mb-6">
                {!isCollapsed && (
                  <p className="text-xs text-gray-500 uppercase mb-2">{category}</p>
                )}
                {categoryModules.map(module => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    title={module.name}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors mb-1 ${
                      selectedModule === module.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <module.icon size={20} />
                    {!isCollapsed && (
                      <div className="text-left flex-1">
                        <p className="text-sm">{module.name}</p>
                        {module.requiredRole && (
                          <p className="text-xs opacity-60">{module.requiredRole}</p>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </nav>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {userId.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{userId}</p>
                <p className="text-xs text-gray-400">{userRole}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {currentModule?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {currentModule?.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Date Range Picker */}
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <Icons.Chart size={16} color="#9CA3AF" />
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    start: new Date(e.target.value)
                  })}
                  className="bg-transparent text-white text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    end: new Date(e.target.value)
                  })}
                  className="bg-transparent text-white text-sm"
                />
              </div>

              {/* Quick Actions */}
              <button
                onClick={() => handleExport(selectedModule)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title="Export"
              >
                <Icons.Export size={20} color="white" />
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Icons.Notification size={20} color="white" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }>
            {currentModule ? (
              <currentModule.component />
            ) : (
              <div className="text-center text-gray-400">
                <p>Select a module from the sidebar</p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for additional dashboards
const OverviewDashboard: React.FC<{ dateRange: any }> = ({ dateRange }) => (
  <div className="bg-gray-900 rounded-lg p-6 text-white">
    <h3 className="text-xl font-bold mb-4">Overview Dashboard</h3>
    <p className="text-gray-400">Real-time metrics and KPIs</p>
    {/* Your existing overview dashboard content */}
  </div>
);

const SLODashboard: React.FC<{ dateRange: any }> = ({ dateRange }) => (
  <div className="bg-gray-900 rounded-lg p-6 text-white">
    <h3 className="text-xl font-bold mb-4">SLO & Reliability Dashboard</h3>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400 text-sm">API Uptime</p>
        <p className="text-2xl font-bold text-green-500">99.98%</p>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400 text-sm">Error Budget</p>
        <p className="text-2xl font-bold text-yellow-500">12.4h</p>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400 text-sm">P95 Latency</p>
        <p className="text-2xl font-bold text-blue-500">142ms</p>
      </div>
    </div>
  </div>
);

const IncidentsDashboard: React.FC = () => (
  <div className="bg-gray-900 rounded-lg p-6 text-white">
    <h3 className="text-xl font-bold mb-4">Incidents & RCA</h3>
    <p className="text-gray-400">Incident management and root cause analysis</p>
  </div>
);

const GovernanceDashboard: React.FC = () => (
  <div className="bg-gray-900 rounded-lg p-6 text-white">
    <h3 className="text-xl font-bold mb-4">Governance & Safety</h3>
    <p className="text-gray-400">Compliance and safety monitoring</p>
  </div>
);

const AICopilotDashboard: React.FC = () => (
  <div className="bg-gray-900 rounded-lg p-6 text-white">
    <h3 className="text-xl font-bold mb-4">AI Copilot</h3>
    <p className="text-gray-400">AI-powered insights and recommendations</p>
  </div>
);

export default EnhancedMasterDashboard;
