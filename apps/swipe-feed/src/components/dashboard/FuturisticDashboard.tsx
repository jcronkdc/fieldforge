/**
 * FUTURISTIC DASHBOARD - Command Center of the Future
 * The most badass dashboard interface ever created
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import { OverviewTab, AnalyticsTab, ActivityTab, SystemsTab } from './DashboardTabs';
import type { FocusedView } from '../AuthenticatedAppV2';
import { canAccessFeature } from '../../lib/admin/adminConfig';

interface Props {
  userId: string;
  userRole?: 'admin' | 'analyst' | 'viewer';
  sparksBalance: number;
  notifications: any[];
  onNavigate?: (view: FocusedView) => void;
}

export const FuturisticDashboard: React.FC<Props> = ({ 
  userId, 
  userRole = 'viewer', 
  sparksBalance, 
  notifications,
  onNavigate 
}) => {
  const [activeModule, setActiveModule] = useState('overview');
  
  // Check admin dashboard access
  const userEmail = localStorage.getItem('mythatron_user_email');
  const hasAdminAccess = canAccessFeature('adminDashboard', userEmail, userId);
  const hasUnlimitedAI = canAccessFeature('unlimitedAI', userEmail, userId);
  const canExportData = canAccessFeature('exportData', userEmail, userId);
  const [time, setTime] = useState(new Date());
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Update time every second for cyber clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track mouse for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
      setMouseY((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const modules = [
    { id: 'overview', label: 'OVERVIEW', icon: Icons.Dashboard },
    { id: 'analytics', label: 'ANALYTICS', icon: Icons.Chart },
    { id: 'activity', label: 'ACTIVITY', icon: Icons.Metrics },
    { id: 'systems', label: 'SYSTEMS', icon: Icons.Database },
  ];

  const quickActions = [
    { 
      id: 'angrylips',
      title: 'ANGRYLIPS',
      desc: 'LAUNCH GAME',
      icon: Icons.Fire,
      color: 'from-cyan-500 to-blue-500',
      view: 'angry-lips' as FocusedView
    },
    { 
      id: 'storyforge',
      title: 'STORYFORGE',
      desc: 'CREATE STORY',
      icon: Icons.StoryForge,
      color: 'from-blue-500 to-purple-500',
      view: 'stories' as FocusedView
    },
    { 
      id: 'songforge',
      title: 'SONGFORGE',
      desc: 'MAKE MUSIC',
      icon: Icons.SongForge,
      color: 'from-purple-500 to-pink-500',
      view: 'songforge' as FocusedView
    },
    { 
      id: 'mythaquest',
      title: 'MYTHAQUEST',
      desc: 'ENTER WORLD',
      icon: Icons.MythaQuest,
      color: 'from-pink-500 to-red-500',
      view: 'mythaquest' as FocusedView
    },
  ];

  const stats = [
    { label: 'SPARKS', value: sparksBalance.toLocaleString(), trend: '+12%' },
    { label: 'STORIES', value: '147', trend: '+23%' },
    { label: 'FRIENDS', value: '42', trend: '+5%' },
    { label: 'RANK', value: '#1,337', trend: '↑ 15' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at ${mouseX}% ${mouseY}%, 
              rgba(6, 182, 212, 0.05) 0%, 
              transparent 30%
            ),
            radial-gradient(circle at ${100 - mouseX}% ${100 - mouseY}%, 
              rgba(59, 130, 246, 0.05) 0%, 
              transparent 30%
            )
          `
        }}
      />

      {/* Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  COMMAND CENTER
                </h1>
                <p className="text-xs text-cyan-500/60 uppercase tracking-widest mt-1">
                  SYSTEM STATUS: OPTIMAL • UPLINK: ACTIVE
                </p>
              </div>
              
              {/* Cyber Clock */}
              <div className="text-right">
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {time.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-widest">
                  {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Module Tabs */}
            <div className="flex gap-2 mt-6 module-tabs-container dashboard-tabs">
              {modules.map(module => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                    activeModule === module.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <module.icon size={14} />
                    {module.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Section */}
        <div className="px-6 py-4 border-b border-cyan-500/20">
          {activeModule === 'overview' && <OverviewTab profile={{ userId }} />}
          {activeModule === 'analytics' && <AnalyticsTab profile={{ userId }} />}
          {activeModule === 'activity' && <ActivityTab profile={{ userId }} />}
          {activeModule === 'systems' && <SystemsTab profile={{ userId }} />}
        </div>

        {/* Dashboard Grid */}
        <div className="p-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stats-grid">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-black/60 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-black text-cyan-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    {stat.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* OPUS Test Protocol - ADMIN ONLY */}
      {hasAdminAccess && (
      <>
      {/* Critical Auth Test - Added after blank screen incident */}
      <div className="mb-4 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-purple-400 uppercase tracking-wider">
              🔐 CRITICAL AUTH TEST
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Authentication flow validation • Must pass before deployment
            </p>
            <p className="text-xs text-yellow-400 mt-1 font-bold uppercase tracking-widest">
              ADDED AFTER BLANK SCREEN INCIDENT
            </p>
          </div>
          <Icons.Shield size={48} className="text-purple-400" />
        </div>
        <button
          onClick={async () => {
            try {
              console.log('🔐 Starting Critical Auth Test...');
              const AuthTest = (await import('../../testing/auth-critical-test')).default;
              const test = new AuthTest();
              const result = await test.runAllTests();
              
              alert(`CRITICAL AUTH TEST ${result.passed ? 'PASSED ✅' : 'FAILED ❌'}\n\nCritical: ${result.critical}/8 passed\nTotal: ${result.results.filter(r => r.passed).length}/${result.total} passed\n\n${result.passed ? '✅ Safe to deploy!' : '❌ DO NOT DEPLOY - Fix auth issues first!'}\n\nCheck console for details.`);
            } catch (error) {
              console.error('Auth test failed:', error);
              alert('Auth test failed. Check console for details.');
            }
          }}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-all transform hover:scale-[1.02]"
        >
          🔐 RUN CRITICAL AUTH TEST
        </button>
      </div>
      
      {/* Main OPUS Test */}
      <div className="mb-8 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-red-400 uppercase tracking-wider">
              OPUS 4.1 TEST PROTOCOL
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Comprehensive testing for 1M user readiness • 14 acceptance gates
            </p>
            <p className="text-xs text-yellow-400 mt-1 font-bold uppercase tracking-widest">
              🔐 ADMIN ONLY - justincronk@pm.me
            </p>
          </div>
          <Icons.Rocket size={48} className="text-red-400" />
        </div>
        <button
          onClick={async () => {
                try {
                  console.log('🚀 Starting OPUS Test Protocol...');
                  const OpusTest = (await import('../../testing/opus-browser-test')).default;
                  const test = new OpusTest();
                  const report = await test.runAllTests();
                  console.log('📊 Test Complete:', report);
                  
                  // Show detailed results
                  const passed = report.gates.filter(g => g.status === 'passed').length;
                  const failed = report.gates.filter(g => g.status === 'failed').length;
                  
                  alert(`OPUS 4.1 TEST COMPLETE!\n\nStatus: ${report.overallStatus.toUpperCase()}\nPassed: ${passed}/14 gates\nFailed: ${failed} gates\nConsecutive Days: ${report.consecutiveDaysPassed}/7\n\n${report.consecutiveDaysPassed >= 7 ? '🎉 ACCEPTANCE CRITERIA MET!' : `${7 - report.consecutiveDaysPassed} more days needed`}\n\nCheck console for detailed results.`);
                } catch (error) {
                  console.error('Test failed:', error);
                  alert('Test failed. Check console for details.');
                }
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-all transform hover:scale-[1.02]"
            >
              🔬 RUN COMPREHENSIVE TEST SUITE
        </button>
      </div>
      </>
      )}

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-black text-cyan-400 uppercase tracking-wider mb-4">
              QUICK LAUNCH
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 quick-actions-grid">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onNavigate?.(action.view)}
                  className="group relative overflow-hidden"
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-20 transition-opacity rounded-lg blur-xl`} />
                  
                  {/* Card */}
                  <div className="relative bg-black/60 border border-gray-800 rounded-lg p-6 hover:border-cyan-500/50 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <div className="text-3xl mb-3">
                      {React.createElement(action.icon, { size: 32, className: 'text-cyan-400' })}
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 uppercase tracking-widest">
                      {action.desc}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 activity-feed-container">
              <h2 className="text-lg font-black text-cyan-400 uppercase tracking-wider mb-4">
                RECENT ACTIVITY
              </h2>
              <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 space-y-3">
                {[
                  { icon: Icons.Fire, text: 'Launched AngryLips session', time: '2m ago' },
                  { icon: Icons.StoryForge, text: 'Created new story in StoryForge', time: '15m ago' },
                  { icon: Icons.SongForge, text: 'Composed track in SongForge', time: '1h ago' },
                  { icon: Icons.MythaQuest, text: 'Explored new realm in MythaQuest', time: '3h ago' },
                  { icon: Icons.Messages, text: 'Joined collaborative session', time: '5h ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-800 hover:border-cyan-500/30 transition-all">
                    <div className="text-2xl">
                      {React.createElement(item.icon, { size: 24, className: 'text-cyan-400' })}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">{item.text}</div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="system-status-container">
              <h2 className="text-lg font-black text-cyan-400 uppercase tracking-wider mb-4">
                SYSTEM STATUS
              </h2>
              <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 space-y-4">
                {[
                  { label: 'AI ENGINE', status: 'ONLINE', color: 'text-green-400' },
                  { label: 'DATABASE', status: 'OPTIMAL', color: 'text-green-400' },
                  { label: 'NETWORK', status: 'FAST', color: 'text-cyan-400' },
                  { label: 'STORAGE', status: '73% USED', color: 'text-yellow-400' },
                  { label: 'SECURITY', status: 'ACTIVE', color: 'text-green-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">{item.label}</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tech Elements */}
      <div className="fixed bottom-10 left-10 w-16 h-16 border border-cyan-500/20 rounded-lg animate-pulse pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-20 h-20 border border-blue-500/20 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '20s' }} />
      
      {/* Scan Line Effect */}
      <div className="fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 pointer-events-none" 
           style={{ 
             animation: 'scan 8s linear infinite',
             transform: `translateY(${(Date.now() / 50) % window.innerHeight}px)`
           }} 
      />
    </div>
  );
};

export default FuturisticDashboard;
