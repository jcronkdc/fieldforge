/**
 * Notification Badge - Persistent notification indicator
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface NotificationBadgeProps {
  onNavigate: (view: FocusedView) => void;
  userId?: string;
}

interface Notification {
  id: string;
  type: 'invite' | 'message' | 'like' | 'comment' | 'follow' | 'session' | 'story';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onNavigate, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  // Load notifications on mount and set up polling
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('mythatron_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    };

    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('mythatron_notifications', JSON.stringify(updated));
      return updated;
    });

    // Show popup for new notification
    setNewNotification(newNotif);
    setTimeout(() => setNewNotification(null), 5000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('mythatron_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('mythatron_notifications', JSON.stringify(updated));
      return updated;
    });
    setShowPopup(false);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invite':
        return '✉️';
      case 'message':
        return '💬';
      case 'like':
        return '❤️';
      case 'comment':
        return '💭';
      case 'follow':
        return '👥';
      case 'session':
        return '🎭';
      case 'story':
        return '📚';
      default:
        return '🔔';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      {/* Inline Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowPopup(!showPopup)}
          className="relative p-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white group-hover:scale-110 transition-transform">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showPopup && (
          <div className="absolute right-0 mt-2 w-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light text-white">Notifications</h3>
                <div className="flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      onNavigate('notifications');
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    See all
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${
                      !notif.read ? 'bg-purple-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getIcon(notif.type)}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{notif.title}</h4>
                        <p className="text-xs text-white/60">{notif.message}</p>
                        <p className="text-xs text-white/40 mt-1">{formatTime(notif.timestamp)}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-white/50">
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Notification Toast */}
      {newNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getIcon(newNotification.type)}</span>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">{newNotification.title}</h4>
                <p className="text-xs text-white/80">{newNotification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
