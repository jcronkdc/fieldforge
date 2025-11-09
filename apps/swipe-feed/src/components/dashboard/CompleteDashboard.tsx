/**
 * Complete Dashboard - Shows feed, stats, and all features
 * Restores the original dashboard functionality
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import { SimpleFeedView } from '../../views/SimpleFeedView';
import { useSparks } from '../sparks/SparksContext';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Props {
  userId: string;
  userRole?: 'admin' | 'analyst' | 'viewer';
  sparksBalance: number;
  notifications: any[];
  profile?: any;
  onNavigate?: (view: FocusedView) => void;
}

export const CompleteDashboard: React.FC<Props> = ({ 
  userId, 
  userRole = 'viewer', 
  sparksBalance, 
  notifications,
  profile,
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'stats' | 'activity'>('feed');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFriends: 0,
    storiesCreated: 0,
    songsCreated: 0,
    gamesPlayed: 0
  });

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      const posts = JSON.parse(localStorage.getItem('mythatron_posts') || '[]');
      const friends = JSON.parse(localStorage.getItem('mythatron_friends') || '[]');
      const stories = JSON.parse(localStorage.getItem('angry_lips_saved_stories') || '[]');
      
      setStats({
        totalPosts: posts.length,
        totalLikes: posts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0),
        totalComments: posts.reduce((sum: number, post: any) => sum + (post.comments?.length || 0), 0),
        totalFriends: friends.length,
        storiesCreated: stories.length,
        songsCreated: parseInt(localStorage.getItem('mythatron_songs_count') || '0'),
        gamesPlayed: parseInt(localStorage.getItem('mythatron_games_played') || '0')
      });
    };

    loadStats();
  }, []);

  const quickActions = [
    { 
      id: 'stories', 
      label: 'StoryForge', 
      icon: <Icons.StoryForge size={24} />, 
      color: 'from-purple-500 to-pink-500',
      description: 'Create amazing stories'
    },
    { 
      id: 'songforge', 
      label: 'SongForge', 
      icon: <Icons.SongForge size={24} />, 
      color: 'from-blue-500 to-purple-500',
      description: 'Compose music with AI'
    },
    { 
      id: 'angry-lips', 
      label: 'Angry Lips', 
      icon: <Icons.Admin size={24} />, 
      color: 'from-red-500 to-orange-500',
      description: 'Play mad libs games'
    },
    { 
      id: 'mythaquest', 
      label: 'MythaQuest', 
      icon: <Icons.MythaQuest size={24} />, 
      color: 'from-green-500 to-teal-500',
      description: 'Epic RPG adventures'
    }
  ];

  const statCards = [
    { label: 'Sparks Balance', value: sparksBalance, icon: <Icons.Sparkle size={20} />, color: 'text-yellow-400' },
    { label: 'Total Posts', value: stats.totalPosts, icon: <Icons.Feed size={20} />, color: 'text-blue-400' },
    { label: 'Friends', value: stats.totalFriends, icon: <Icons.Friends size={20} />, color: 'text-green-400' },
    { label: 'Stories Created', value: stats.storiesCreated, icon: <Icons.StoryForge size={20} />, color: 'text-purple-400' },
    { label: 'Songs Created', value: stats.songsCreated, icon: <Icons.SongForge size={20} />, color: 'text-pink-400' },
    { label: 'Games Played', value: stats.gamesPlayed, icon: <Icons.Dice size={20} />, color: 'text-orange-400' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome back, {profile?.username || 'Creator'}!
              </h1>
              <p className="text-gray-400 mt-1">Your creative hub awaits</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <Icons.Sparkle size={20} className="text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">{sparksBalance}</span>
                <span className="text-sm text-yellow-400/80">Sparks</span>
              </div>
              {notifications.length > 0 && (
                <div className="relative">
                  <Icons.Notification size={24} className="text-gray-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate?.(action.id as FocusedView)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className="mb-3">{action.icon}</div>
                <h3 className="font-semibold text-white">{action.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 px-4 py-2 rounded-md transition-all ${
              activeTab === 'feed' 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Feed size={18} className="inline mr-2" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-4 py-2 rounded-md transition-all ${
              activeTab === 'stats' 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Chart size={18} className="inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-2 rounded-md transition-all ${
              activeTab === 'activity' 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Notification size={18} className="inline mr-2" />
            Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'feed' && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Recent Activity Feed</h3>
            <SimpleFeedView 
              profile={profile}
              onNavigate={onNavigate}
              embedded={true}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Engagement Rate</span>
                  <span className="text-xl font-bold">
                    {stats.totalPosts > 0 ? Math.round((stats.totalLikes + stats.totalComments) / stats.totalPosts * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Content Created</span>
                  <span className="text-xl font-bold">{stats.storiesCreated + stats.songsCreated + stats.totalPosts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Social Connections</span>
                  <span className="text-xl font-bold">{stats.totalFriends}</span>
                </div>
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Admin Tools</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => onNavigate?.('master-test' as FocusedView)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Run Tests
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    View Logs
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 10).map((notif, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Icons.Notification size={20} className="text-purple-400 mt-1" />
                    <div>
                      <p className="text-sm">{notif.message || 'New notification'}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time || 'Just now'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No new notifications</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-white/10 mt-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              Refresh
            </button>
            <button className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
              Customize Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteDashboard;
