import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, HardHat, Shield, Package, ClipboardCheck,
  FileText, Calendar, Cloud, MessageSquare, Map, Brain,
  Settings, LogOut, Menu, X, Bell, Zap, Users, AlertTriangle,
  Activity, Wrench, Truck, Building2, Radio, ChevronDown
} from 'lucide-react';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { WeatherWidget } from '../weather/WeatherWidget';

interface MainLayoutProps {
  session: Session;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ session }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = session.user;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null,
      color: 'text-amber-500'
    },
    {
      label: 'Field Operations',
      icon: HardHat,
      path: '/field',
      badge: 'LIVE',
      badgeColor: 'bg-green-500',
      color: 'text-green-500',
      subItems: [
        { label: 'Daily Operations', path: '/field' },
        { label: 'Crew Management', path: '/field/crews' },
        { label: 'Time Tracking', path: '/field/time' }
      ]
    },
    {
      label: 'Safety',
      icon: Shield,
      path: '/safety',
      badge: null,
      color: 'text-red-500',
      subItems: [
        { label: 'Safety Hub', path: '/safety' },
        { label: 'Briefings', path: '/safety/briefing' },
        { label: 'Incidents', path: '/safety/incidents' },
        { label: 'Permits', path: '/safety/permits' }
      ]
    },
    {
      label: 'Equipment',
      icon: Package,
      path: '/equipment',
      badge: null,
      color: 'text-blue-500',
      subItems: [
        { label: 'Equipment Hub', path: '/equipment' },
        { label: 'Inventory', path: '/equipment/inventory' },
        { label: 'Maintenance', path: '/equipment/maintenance' }
      ]
    },
    {
      label: 'QAQC',
      icon: ClipboardCheck,
      path: '/qaqc',
      badge: '3',
      badgeColor: 'bg-orange-500',
      color: 'text-orange-500',
      subItems: [
        { label: 'QAQC Hub', path: '/qaqc' },
        { label: 'Inspections', path: '/qaqc/inspections' },
        { label: 'Testing', path: '/qaqc/testing' }
      ]
    },
    {
      label: 'Documents',
      icon: FileText,
      path: '/documents',
      badge: null,
      color: 'text-purple-500',
      subItems: [
        { label: 'Document Hub', path: '/documents' },
        { label: 'Drawings', path: '/documents/drawings' },
        { label: 'Submittals', path: '/documents/submittals' }
      ]
    },
    {
      label: 'Schedule',
      icon: Calendar,
      path: '/schedule',
      badge: null,
      color: 'text-cyan-500',
      subItems: [
        { label: 'Master Schedule', path: '/schedule' },
        { label: '3-Week Lookahead', path: '/schedule/lookahead' },
        { label: 'Outages', path: '/schedule/outages' }
      ]
    },
    {
      label: 'Weather',
      icon: Cloud,
      path: '/weather',
      badge: null,
      color: 'text-sky-500'
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      badge: '5',
      badgeColor: 'bg-indigo-500',
      color: 'text-indigo-500'
    },
    {
      label: '3D Map',
      icon: Map,
      path: '/map',
      badge: 'NEW',
      badgeColor: 'bg-emerald-500',
      color: 'text-emerald-500'
    },
    {
      label: 'AI Assistant',
      icon: Brain,
      path: '/ai',
      badge: 'BETA',
      badgeColor: 'bg-violet-500',
      color: 'text-violet-500'
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  const hasActiveSubItem = (item: any) => 
    item.subItems?.some((sub: any) => location.pathname === sub.path);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-lg border-r border-slate-700
        transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FieldForge</h1>
              <p className="text-xs text-amber-500">T&D Construction</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navigationItems.map((item) => (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg transition-all
                  ${isActive(item.path) || hasActiveSubItem(item)
                    ? 'bg-slate-700/50 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs rounded-full text-white ${item.badgeColor || 'bg-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub Items */}
              {item.subItems && hasActiveSubItem(item) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`
                        block px-3 py-1.5 rounded text-sm transition-all
                        ${isActive(subItem.path) 
                          ? 'text-amber-500 bg-slate-700/30' 
                          : 'text-slate-500 hover:text-slate-300'
                        }
                      `}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-400">Field Supervisor</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Project Selector */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-white">Demo 138kV Substation</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Live Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Systems Online</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Weather Widget */}
            <WeatherWidget />

            {/* Emergency Button */}
            <button className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg transition-colors">
              <Radio className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Emergency</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1920px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notifications Panel */}
      {notificationsOpen && (
        <NotificationCenter onClose={() => setNotificationsOpen(false)} />
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
