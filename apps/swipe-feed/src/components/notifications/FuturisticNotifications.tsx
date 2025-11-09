/**
 * FUTURISTIC NOTIFICATIONS - Holographic Alert Center
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Notification {
  id: string;
  type: 'message' | 'mention' | 'achievement' | 'system' | 'friend' | 'spark';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: FocusedView;
  icon: string;
}

interface Props {
  onNavigate: (view: FocusedView) => void;
}

export const FuturisticNotifications: React.FC<Props> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'NEW MESSAGE',
      description: 'ALPHA_USER sent you a message',
      timestamp: '2m ago',
      read: false,
      actionUrl: 'messages',
      icon: '💬'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'ACHIEVEMENT UNLOCKED',
      description: 'Story Master - Created 10 stories',
      timestamp: '1h ago',
      read: false,
      icon: '🏆'
    },
    {
      id: '3',
      type: 'spark',
      title: 'SPARKS EARNED',
      description: '+100 Sparks for daily login',
      timestamp: '3h ago',
      read: true,
      icon: '✨'
    },
    {
      id: '4',
      type: 'friend',
      title: 'FRIEND REQUEST',
      description: 'BEAT_MAKER wants to connect',
      timestamp: '5h ago',
      read: false,
      actionUrl: 'bookworms',
      icon: '👥'
    },
    {
      id: '5',
      type: 'system',
      title: 'SYSTEM UPDATE',
      description: 'New features available in SongForge',
      timestamp: '1d ago',
      read: true,
      actionUrl: 'songforge',
      icon: '🔔'
    }
  ]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'border-blue-500/30 bg-blue-500/10';
      case 'achievement': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'spark': return 'border-purple-500/30 bg-purple-500/10';
      case 'friend': return 'border-green-500/30 bg-green-500/10';
      case 'system': return 'border-cyan-500/30 bg-cyan-500/10';
      case 'mention': return 'border-pink-500/30 bg-pink-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                NOTIFICATIONS
              </h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-cyan-500 rounded-full text-black text-xs font-black">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                UNREAD ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                MARK ALL READ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-black text-cyan-400 mb-2">NO NOTIFICATIONS</h2>
            <p className="text-gray-500 uppercase tracking-wider">
              {filter === 'unread' ? 'All caught up!' : 'Your notification center is empty'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`relative group ${!notification.read ? 'animate-pulse-subtle' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* Holographic effect for unread */}
                {!notification.read && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 rounded-lg blur-xl"></div>
                )}
                
                <div className={`relative border rounded-lg p-4 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer ${
                  !notification.read 
                    ? 'border-cyan-500/40 bg-black/80' 
                    : 'border-gray-800 bg-black/60 opacity-75 hover:opacity-100'
                }`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${getTypeColor(notification.type)}`}>
                      {notification.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-black uppercase tracking-wider text-sm ${
                          !notification.read ? 'text-cyan-400' : 'text-gray-400'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-600 uppercase tracking-widest">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{notification.description}</p>
                      
                      {notification.actionUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                            onNavigate(notification.actionUrl!);
                          }}
                          className="mt-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all inline-block"
                        >
                          VIEW →
                        </button>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating notification settings */}
      <button
        onClick={() => onNavigate('settings')}
        className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M1 12h6m6 0h6"/>
        </svg>
      </button>
    </div>
  );
};

export default FuturisticNotifications;
