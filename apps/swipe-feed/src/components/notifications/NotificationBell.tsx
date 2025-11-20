import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, MessageSquare, Users, Video } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import { format } from 'date-fns';

/**
 * NotificationBell - Real-time notification dropdown
 * 
 * Mycelial Integration:
 * - Backend: /api/notifications endpoints (MF-30)
 * - Database: notifications table (migration 026)
 * - Real-time: Ably notifications:{userId} channel
 * - Security: RLS enforces users see only their own notifications
 * 
 * Human Test:
 * - Does badge show unread count accurately?
 * - Do notifications appear in real-time when events occur?
 * - Can user mark as read and dismiss easily?
 * - Is the UI clean and not overwhelming?
 */

interface Notification {
  id: string;
  type: 'message' | 'mention' | 'room_invite' | 'room_started' | 'project_invite' | 'team_invite' | 'emergency_alert' | 'system';
  title: string;
  message: string;
  link?: string;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

export const NotificationBell: React.FC = () => {
  const { session } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && session?.access_token) {
      fetchNotifications();
    }
  }, [isOpen, session?.access_token]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (session?.access_token) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.access_token]);

  // TODO: Subscribe to Ably channel for real-time updates
  // useEffect(() => {
  //   if (session?.user?.id && window.Ably) {
  //     const channel = window.Ably.channels.get(`notifications:${session.user.id}`);
  //     channel.subscribe('new', (message) => {
  //       setUnreadCount(prev => prev + 1);
  //       if (isOpen) fetchNotifications();
  //     });
  //     return () => channel.unsubscribe();
  //   }
  // }, [session?.user?.id, isOpen]);

  const fetchUnreadCount = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
      case 'mention':
        return <MessageSquare className="w-4 h-4" />;
      case 'room_invite':
      case 'room_started':
        return <Video className="w-4 h-4" />;
      case 'project_invite':
      case 'team_invite':
        return <Users className="w-4 h-4" />;
      case 'emergency_alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'emergency_alert':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'mention':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'room_invite':
      case 'project_invite':
      case 'team_invite':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (!session?.user) {
    return null; // Don't show bell if not logged in
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[calc(100vh-5rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({unreadCount} unread)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm mt-1">You'll see updates here when they arrive</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                        !notification.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read_at) {
                          markAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            {!notification.read_at && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/notifications'; // TODO: Create notifications page
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
