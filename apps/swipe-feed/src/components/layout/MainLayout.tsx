import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, HardHat, Shield, Package, ClipboardCheck,
  FileText, Calendar, Cloud, MessageSquare, Map, Brain,
  Settings, LogOut, Menu, X, Bell, Zap, Users, AlertTriangle,
  Activity, Wrench, Truck, Building2, Radio, ChevronDown, Sun, Moon,
  DollarSign, Phone, MapPin
} from 'lucide-react';
import { PushNotifications } from '../notifications/PushNotifications';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { NotificationBell } from '../notifications/NotificationBell';
import { WeatherWidget } from '../weather/WeatherWidget';

const headerTelemetry = [
  { label: 'Grid load', value: '68%', tone: 'text-blue-400' },
  { label: 'Crews active', value: '137', tone: 'text-blue-300' },
  { label: 'Incidents', value: '0', tone: 'text-green-400' }
];

interface MainLayoutProps {
  session: Session;
}

const THEME_STORAGE_KEY = 'fieldforge_theme';

export const MainLayout: React.FC<MainLayoutProps> = ({ session }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'dark';
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
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
      color: 'text-slate-900'
    },
    {
      label: 'Social Feed',
      icon: MessageSquare,
      path: '/feed',
      badge: 'NEW',
      badgeColor: 'bg-slate-900 text-white',
      color: 'text-slate-900'
    },
    {
      label: 'Live Analytics',
      icon: Activity,
      path: '/analytics',
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500 text-white',
      color: 'text-slate-900'
    },
    {
      label: 'Projects',
      icon: Building2,
      path: '/projects',
      badge: null,
      color: 'text-slate-900'
    },
    {
      label: 'Project Map 3D',
      icon: MapPin,
      path: '/project-map',
      badge: 'NEW',
      badgeColor: 'bg-purple-500 text-white',
      color: 'text-slate-900'
    },
    {
      label: 'Equipment 3D',
      icon: Wrench,
      path: '/substation-3d',
      badge: 'NEW',
      badgeColor: 'bg-indigo-500 text-white',
      color: 'text-slate-900'
    },
    {
      label: 'AI Assistant',
      icon: Brain,
      path: '/ai-assistant',
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
      color: 'text-slate-900'
    },
    {
      label: 'Field Operations',
      icon: HardHat,
      path: '/field',
      badge: null,
      color: 'text-slate-900',
      subItems: [
        { label: 'Operational Index', path: '/field' },
        { label: 'Crew Management', path: '/field/crews' },
        { label: 'Time Tracking', path: '/field/time' },
        { label: 'Receipt Management', path: '/field/receipts' }
      ]
    },
    {
      label: 'Safety',
      icon: Shield,
      path: '/safety',
      badge: null,
      color: 'text-slate-900',
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
      color: 'text-slate-900',
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
      badgeColor: 'bg-slate-200 text-slate-700',
      color: 'text-slate-900',
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
      color: 'text-slate-900',
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
      color: 'text-slate-900',
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
      color: 'text-slate-900'
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      badge: '5',
      badgeColor: 'bg-slate-200 text-slate-700',
      color: 'text-slate-900'
    },
    {
      label: '3D Map',
      icon: Map,
      path: '/map',
      badge: 'NEW',
      badgeColor: 'bg-slate-200 text-slate-700',
      color: 'text-slate-900'
    },
    {
      label: 'AI Assistant',
      icon: Brain,
      path: '/ai',
      badge: 'BETA',
      badgeColor: 'bg-slate-200 text-slate-700',
      color: 'text-slate-900'
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  const hasActiveSubItem = (item: any) =>
    item.subItems?.some((sub: any) => location.pathname === sub.path);

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,_rgba(218,165,32,0.05),_transparent_55%),_radial-gradient(circle_at_75%_0,_rgba(184,115,51,0.08),_transparent_50%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(130deg,_rgba(15,23,42,0.08),_transparent_45%)]" aria-hidden />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 shadow-2xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FieldForge</h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500">Grid Construction</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-blue-400 hover:text-blue-300"
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
                className={`flex items-center justify-between px-3 py-2 rounded-[8px] transition-all  ${
                  isActive(item.path) || hasActiveSubItem(item)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-400/80 hover:bg-blue-500/10 hover:text-blue-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${isActive(item.path) || hasActiveSubItem(item) ? 'text-white' : 'text-blue-500/60'}`} />
                  <span className="font-medium  text-base">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${item.badgeColor || 'bg-blue-500/20 text-blue-300'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>

              {item.subItems && (hasActiveSubItem(item) || isActive(item.path)) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem: any) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isActive(subItem.path)
                          ? 'text-slate-900 font-semibold'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Business Links */}
        <div className="border-t border-gray-700 p-4">
          <Link
            to="/pricing"
            className="flex items-center space-x-3 px-3 py-2 rounded-[8px] text-blue-400/80 hover:bg-blue-500/10 hover:text-blue-400 transition-all mb-1"
          >
            <DollarSign className="w-5 h-5 text-blue-500/60" />
            <span className="font-medium  text-base">Pricing</span>
          </Link>
          <Link
            to="/contact"
            className="flex items-center space-x-3 px-3 py-2 rounded-[8px] text-blue-400/80 hover:bg-blue-500/10 hover:text-blue-400 transition-all"
          >
            <Phone className="w-5 h-5 text-blue-500/60" />
            <span className="font-medium  text-base">Contact Sales</span>
          </Link>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 bg-slate-900/95 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold ">
                {(user.email ?? 'user@fieldforge.app').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-400 truncate">
                  {(() => {
                    const email = user.email ?? 'user@fieldforge.app';
                    const atIndex = email.indexOf('@');
                    return atIndex > 0 ? email.slice(0, atIndex) : email;
                  })()}
                </p>
                <p className="text-xs text-blue-600/60">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center rounded-full border border-gray-700 px-2.5 py-2 text-blue-400 hover:bg-blue-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-68">
        {/* Top Bar */}
        <header className="h-20 bg-slate-900/90 backdrop-blur-xl border-b border-gray-700 px-5 flex items-center justify-between shadow-[0_6px_18px_rgba(218,165,32,0.1)] bg-gray-800/50 border border-gray-700 rounded-lg" role="banner">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-blue-400 hover:text-blue-300"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 rounded-[8px] border border-gray-700 bg-blue-500/10 px-3 py-1.5 border border-gray-700">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300 ">Demo 138kV Substation</span>
              <ChevronDown className="w-4 h-4 text-blue-500" />
            </div>

            <div className="hidden xl:flex items-center gap-3 rounded-[8px] border border-gray-700 bg-blue-500/5 px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg">
              {headerTelemetry.map(({ label, value, tone }, index) => (
                <div key={label} className="flex items-center gap-2 pr-3">
                  <div>
                    <p className={`text-sm font-semibold ${tone} `}>{value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-600/60 ">{label}</p>
                  </div>
                  {index < headerTelemetry.length - 1 && (
                    <span className="h-8 w-[1px] bg-blue-500/20" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <WeatherWidget />
            <button className="flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 transition-all btn-blueprint">
              <Radio className="w-4 h-4" />
              Emergency
            </button>
            {/* Real-time Notification Bell - MF-38 */}
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 transition-all"
              aria-label="Toggle theme"
              type="button"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <Link to="/settings" className="p-2 rounded-full border border-gray-700 text-blue-400 hover:bg-blue-500/10 transition-all">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main id="main" className="flex-1 overflow-y-auto bg-slate-50">
          <PushNotifications />
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
