/**
 * Safe Dashboard - Error-resistant dashboard with fallbacks
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Props {
  userId: string;
  userRole?: 'admin' | 'analyst' | 'viewer';
  sparksBalance: number;
  notifications: any[];
  profile?: any;
  onNavigate?: (view: FocusedView) => void;
}

export const SafeDashboard: React.FC<Props> = ({ 
  userId, 
  userRole = 'viewer', 
  sparksBalance = 0, 
  notifications = [],
  profile,
  onNavigate 
}) => {
  const [error, setError] = useState<string | null>(null);

  // Safe navigation wrapper
  const safeNavigate = (view: FocusedView) => {
    try {
      if (onNavigate) {
        onNavigate(view);
      } else {
        // Fallback to hash navigation
        window.location.hash = `#${view}`;
      }
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Navigation failed. Please try again.');
    }
  };

  const quickActions = [
    { 
      id: 'feed' as FocusedView, 
      label: 'Feed', 
      icon: Icons.Feed, 
      color: 'from-blue-500 to-purple-500',
      description: 'View community posts'
    },
    { 
      id: 'stories' as FocusedView, 
      label: 'StoryForge', 
      icon: Icons.StoryForge, 
      color: 'from-purple-500 to-pink-500',
      description: 'Create amazing stories'
    },
    { 
      id: 'songforge' as FocusedView, 
      label: 'SongForge', 
      icon: Icons.SongForge, 
      color: 'from-pink-500 to-red-500',
      description: 'Compose music with AI'
    },
    { 
      id: 'angry-lips' as FocusedView, 
      label: 'Angry Lips', 
      icon: Icons.Admin, 
      color: 'from-orange-500 to-yellow-500',
      description: 'Play mad libs games'
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Dashboard Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to MythaTron
              </h1>
              <p className="text-gray-400 mt-1">
                {profile?.username ? `Hello, ${profile.username}!` : 'Your creative hub awaits'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Sparks Display */}
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <Icons.Sparkle size={20} className="text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">
                  {typeof sparksBalance === 'number' ? sparksBalance : 0}
                </span>
                <span className="text-sm text-yellow-400/80">Sparks</span>
              </div>
              
              {/* Notifications */}
              {notifications && notifications.length > 0 && (
                <button
                  onClick={() => safeNavigate('notifications')}
                  className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Icons.Notification size={24} className="text-gray-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-300">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => safeNavigate(action.id)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className="mb-3">
                  <action.icon size={32} className="text-white" />
                </div>
                <h3 className="font-semibold text-white">{action.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Getting Started */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-white">Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Explore the Feed to see community posts</li>
              <li>• Create stories with StoryForge</li>
              <li>• Compose music with SongForge</li>
              <li>• Play games with Angry Lips</li>
            </ul>
          </div>

          {/* Your Stats */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-white">Your Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Sparks Balance</span>
                <span className="text-yellow-400 font-bold">{sparksBalance || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Notifications</span>
                <span className="text-white">{notifications?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <div className="space-y-2">
              <button
                onClick={() => safeNavigate('settings')}
                className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
              >
                → Settings
              </button>
              <button
                onClick={() => safeNavigate('messages')}
                className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
              >
                → Messages
              </button>
              <button
                onClick={() => safeNavigate('bookworms')}
                className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
              >
                → Friends
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {userRole === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Admin Tools</h3>
          <div className="flex gap-4">
            <button
              onClick={() => safeNavigate('master-test' as FocusedView)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Test Suite
            </button>
            <button
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              onClick={() => console.log('View logs')}
            >
              View Logs
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-white/10 mt-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 MythaTron. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Last login: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafeDashboard;
