import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  Building2, 
  Users,
  Shield,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Zap,
  HardHat,
  Activity,
  BarChart3,
  ChevronRight
} from 'lucide-react';

interface CleanWorkspaceLayoutProps {
  session: Session;
}

// Clean, professional navigation for electrical construction teams
const navigationSections = [
  {
    title: 'Core Operations',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        description: 'Project overview and key metrics'
      },
      {
        label: 'Projects',
        icon: Building2,
        path: '/projects',
        description: 'Substations, transmission, and distribution'
      },
      {
        label: 'Team Messages',
        icon: MessageSquare, 
        path: '/messages',
        description: 'Real-time team communication',
        badge: '3'
      }
    ]
  },
  {
    title: 'Field Operations', 
    items: [
      {
        label: 'Crew Management',
        icon: Users,
        path: '/crews',
        description: 'IBEW crews and specialized teams'
      },
      {
        label: 'Safety Center',
        icon: Shield,
        path: '/safety',
        description: 'High-voltage safety and compliance'
      },
      {
        label: 'Equipment',
        icon: HardHat,
        path: '/equipment',
        description: 'Tools, materials, and inspections'
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Analytics', 
        icon: BarChart3,
        path: '/analytics',
        description: 'Performance and insights'
      },
      {
        label: 'Documents',
        icon: FileText,
        path: '/documents',
        description: 'Drawings, permits, and reports'
      }
    ]
  }
];

export const CleanWorkspaceLayout: React.FC<CleanWorkspaceLayoutProps> = ({ session }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">FieldForge</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Electrical Construction Workspace</p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">8 Active Crews</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm text-white font-bold">
                  {session.user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700 rounded-lg transition-colors text-sm text-slate-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 transition-transform duration-200 ease-in-out`}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700 lg:hidden">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="p-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActivePath(item.path)
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${
                        isActivePath(item.path) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-300 font-semibold">System Status</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Backend:</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-green-400">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
