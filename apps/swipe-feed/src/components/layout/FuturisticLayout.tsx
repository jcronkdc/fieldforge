import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, HardHat, Shield, Package, ClipboardCheck,
  FileText, Calendar, Cloud, MessageSquare, Map, Brain,
  Settings, LogOut, Menu, X, Bell, Zap, Users, AlertTriangle,
  Activity, Wrench, Truck, Building2, Radio, ChevronDown,
  Power, Cpu, Signal, Wifi, Battery
} from 'lucide-react';

interface FuturisticLayoutProps {
  session: Session;
}

export const FuturisticLayout: React.FC<FuturisticLayoutProps> = ({ session }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = session.user;
  const userEmail = user.email ?? 'user@fieldforge.app';
  const emailInitial = userEmail.charAt(0).toUpperCase();
  const emailHandle = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navigationItems = [
    { label: 'Command Center', icon: LayoutDashboard, path: '/dashboard', gradient: 'from-cyan-500 to-blue-600' },
    { label: 'Social Feed', icon: MessageSquare, path: '/feed', gradient: 'from-purple-500 to-pink-600', badge: 'NEW' },
    { label: 'Live Grid', icon: Activity, path: '/analytics', gradient: 'from-green-500 to-emerald-600', badge: 'LIVE' },
    { label: 'Projects', icon: Building2, path: '/projects', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Field Ops', icon: HardHat, path: '/field', gradient: 'from-red-500 to-pink-600' },
    { label: 'Safety', icon: Shield, path: '/safety', gradient: 'from-indigo-500 to-purple-600' },
    { label: 'Equipment', icon: Package, path: '/equipment', gradient: 'from-teal-500 to-cyan-600' },
    { label: 'QA/QC', icon: ClipboardCheck, path: '/qaqc', gradient: 'from-orange-500 to-red-600', badge: '3' },
    { label: 'Documents', icon: FileText, path: '/documents', gradient: 'from-violet-500 to-purple-600' },
    { label: 'Schedule', icon: Calendar, path: '/schedule', gradient: 'from-blue-500 to-indigo-600' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slide 20s linear infinite'
          }}
        />
      </div>

      {/* Futuristic Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-cyan-500/30
        transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-cyan-500/30 relative">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                FIELDFORGE
              </h1>
              <p className="text-xs text-cyan-400/60">ELECTRICAL DIVISION</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-cyan-400 hover:text-cyan-300 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* System Status */}
        <div className="px-6 py-4 border-b border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">System Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-500 font-['Exo 2']">ONLINE</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/50 rounded p-2 text-center">
              <Cpu className="w-4 h-4 mx-auto mb-1 text-cyan-500" />
              <span className="text-gray-400">CPU</span>
              <p className="text-cyan-400 font-['Orbitron']">42%</p>
            </div>
            <div className="bg-slate-900/50 rounded p-2 text-center">
              <Signal className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <span className="text-gray-400">NET</span>
              <p className="text-green-400 font-['Orbitron']">5G</p>
            </div>
            <div className="bg-slate-900/50 rounded p-2 text-center">
              <Battery className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <span className="text-gray-400">PWR</span>
              <p className="text-amber-400 font-['Orbitron']">98%</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-20rem)]">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${active ? 'bg-gradient-to-r ' + item.gradient : 'hover:bg-slate-900/50'}
                  group overflow-hidden
                `}
              >
                {/* Scan Line Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-cyan-400/60 group-hover:text-cyan-400'}`} />
                  <span className={`font-medium font-['Exo 2'] ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </div>
                
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 font-['Orbitron']">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/30 bg-slate-950/95">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold font-['Orbitron']">
                  {emailInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {emailHandle}
                </p>
                <p className="text-xs text-cyan-400/60">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded"
              title="System Logout"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Control Bar */}
        <header className="h-20 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/30 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-cyan-400 hover:text-cyan-300 p-2 hover:bg-slate-900/50 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Project Status */}
            <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-slate-900/50 rounded-lg border border-cyan-500/20">
              <Building2 className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-gray-400">ACTIVE PROJECT</p>
                <p className="text-sm font-medium font-['Orbitron'] text-cyan-400">138kV Substation</p>
              </div>
            </div>

            {/* Live Indicators */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-xs text-green-500">CONNECTED</span>
              </div>
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs text-amber-500">TRANSMITTING</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Emergency Button */}
            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center space-x-2 hover:scale-105 transform transition-all shadow-lg hover:shadow-red-500/25">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold font-['Orbitron'] hidden sm:inline">EMERGENCY</span>
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-900/50 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-900/50 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black">
          <Outlet />
        </main>

        {/* Footer Status Bar */}
        <footer className="h-8 bg-slate-950/90 border-t border-cyan-500/30 px-6 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">© 2025 FIELDFORGE ELECTRICAL</span>
            <div className="w-px h-4 bg-cyan-500/30" />
            <span className="text-cyan-400 font-['Orbitron']">v2.0.0</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">LAT: 45.1234°</span>
            <span className="text-gray-500">LON: -93.5678°</span>
            <div className="w-px h-4 bg-cyan-500/30" />
            <span className="text-green-500 font-['Orbitron']">SECURE</span>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};
