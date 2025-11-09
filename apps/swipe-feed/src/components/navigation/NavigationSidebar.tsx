/**
 * Navigation Sidebar - Intuitive app navigation
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedApp';
import { useAuth } from '../../context/AuthContext';
import { useOmniGuide } from '../../context/OmniGuideContext';

interface NavigationItem {
  id: FocusedView;
  label: string;
  icon: JSX.Element;
  description?: string;
  badge?: number | string;
}

interface NavigationSidebarProps {
  currentView: FocusedView;
  onNavigate: (view: FocusedView) => void;
  notifications?: number;
  sparksBalance?: number;
  username?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentView,
  onNavigate,
  notifications = 0,
  sparksBalance = 0,
  username = 'User',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [showSparksDetails, setShowSparksDetails] = useState(false);
  const { signOut } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      id: 'prologue',
      label: 'Home',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      description: 'Dashboard & Overview',
    },
    {
      id: 'feed',
      label: 'Feed',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      description: 'Community Posts',
    },
    {
      id: 'angrylips',
      label: 'AngryLips',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ),
      description: 'Mad-lib Battles',
    },
    {
      id: 'stories',
      label: 'StoryForge',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="3"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
      ),
      description: 'Collaborative StoryForge',
    },
    {
      id: 'songforge',
      label: 'SongForge',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      ),
      description: 'AI Music Creation',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      ),
      description: 'All Notifications',
      badge: notifications > 0 ? notifications : undefined,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
        </svg>
      ),
      description: 'Direct Messages',
    },
    {
      id: 'bookworms',
      label: 'Friends',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      description: 'Friend Network',
    },
    {
      id: 'das',
      label: 'Democratic Ads',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      description: 'Vote on Ads',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M1 12h6m6 0h6m-13.22 4.22l-4.24 4.24m16.92 0l-4.24-4.24"/>
        </svg>
      ),
      description: 'Account Settings',
    },
  ];

  // Add admin-only items
  const userId = localStorage.getItem('mythatron_user_id');
  if (userId === 'MythaTron' || userId === 'admin') {
    navigationItems.push({
      id: 'master-test' as FocusedView,
      label: 'Admin Tools',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      description: 'Testing & Analytics',
    });
  }

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-black/90 backdrop-blur-xl border-r border-cyan-500/20 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                M
              </div>
              {!isCollapsed && (
                <div>
                  <h2 className="font-black text-cyan-400 tracking-tight">MYTHATRON</h2>
                  <p className="text-xs text-cyan-500/60 uppercase tracking-widest">@{username}</p>
                </div>
              )}
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isCollapsed ? (
                    <polyline points="9 18 15 12 9 6"/>
                  ) : (
                    <polyline points="15 18 9 12 15 6"/>
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sparks Balance - Clickable */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => setShowSparksDetails(!showSparksDetails)}
            className="w-full text-left hover:bg-white/5 rounded-xl p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#sparksGradient)" strokeWidth="2">
                  <defs>
                    <linearGradient id="sparksGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24"/>
                      <stop offset="100%" stopColor="#f59e0b"/>
                    </linearGradient>
                  </defs>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {!isCollapsed && <span className="text-white/60 text-sm">Sparks</span>}
              </div>
              <span className="text-xl font-light text-yellow-400">
                {sparksBalance === Infinity ? '∞' : sparksBalance}
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'hover:bg-white/5 hover:border-cyan-500/30 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`${currentView === item.id ? 'text-cyan-400' : 'text-gray-500'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${
                      currentView === item.id 
                        ? 'from-white to-cyan-400' 
                        : 'from-white/80 to-cyan-400/80'
                    } bg-clip-text text-transparent`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-white/40">{item.description}</p>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Invite Friends Button */}
        <div className="px-4 pb-2">
          <button
            onClick={() => onNavigate('invite' as FocusedView)}
            className="w-full p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/20 rounded-xl transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              {!isCollapsed && <span className="text-white font-medium">Invite Friends</span>}
            </div>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!isCollapsed && <span className="text-white/60 text-sm">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Sparks Details Modal */}
      {showSparksDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-white">Sparks Account</h3>
              <button
                onClick={() => setShowSparksDetails(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Current Balance</span>
                  <span className="text-3xl font-light text-yellow-400">{sparksBalance}</span>
                </div>
                <p className="text-xs text-white/40">Use Sparks for premium features</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowSparksDetails(false);
                    onNavigate('sparks-store' as FocusedView);
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl transition-all"
                >
                  Buy Sparks
                </button>
                <button
                  onClick={() => {
                    setShowSparksDetails(false);
                    // Open transaction history
                  }}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  History
                </button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-medium text-white/60 mb-2">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/40">
                    <span>StoryForge Created</span>
                    <span className="text-green-400">+5</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>AI Feature Used</span>
                    <span className="text-red-400">-10</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>Daily Login Bonus</span>
                    <span className="text-green-400">+2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
