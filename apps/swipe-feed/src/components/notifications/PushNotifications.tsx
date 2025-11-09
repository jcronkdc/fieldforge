import React, { useState, useEffect } from 'react';
import {
  Bell, BellOff, Check, X, AlertCircle, Info,
  Shield, HardHat, Calendar, MessageSquare, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Zap, Volume2, VolumeX
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'safety' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

export const PushNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    checkNotificationPermission();
    loadStoredNotifications();
    subscribeToRealtimeNotifications();
    
    // Register service worker for push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      setIsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        showNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Notifications Enabled',
          message: 'You\'ll now receive important updates from FieldForge',
          timestamp: new Date(),
          read: false
        });
      }
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      });
      
      // Send subscription to your server
      await saveSubscription(subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const saveSubscription = async (subscription: PushSubscription) => {
    // Save subscription to your backend
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Store subscription in database
      console.log('Saving push subscription for user:', user.id);
    }
  };

  const loadStoredNotifications = () => {
    // Load from localStorage for demo
    const stored = localStorage.getItem('fieldforge_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    } else {
      // Demo notifications
      setNotifications([
        {
          id: '1',
          type: 'safety',
          title: 'Safety Alert',
          message: 'High wind advisory - Secure all materials and equipment',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false
        },
        {
          id: '2',
          type: 'success',
          title: 'Milestone Achieved',
          message: 'Foundation pour completed ahead of schedule',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false
        },
        {
          id: '3',
          type: 'info',
          title: 'New Team Member',
          message: 'John Smith has joined Crew A as an electrician',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true
        }
      ]);
    }
  };

  const subscribeToRealtimeNotifications = () => {
    // Subscribe to real-time updates from Supabase
    const channel = supabase.channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const newNotification: Notification = {
          id: payload.id || Date.now().toString(),
          type: payload.type || 'info',
          title: payload.title,
          message: payload.message,
          timestamp: new Date(),
          read: false,
          actionUrl: payload.actionUrl,
          metadata: payload.metadata
        };
        
        addNotification(newNotification);
        showNotification(newNotification);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('fieldforge_notifications', JSON.stringify(updated));
      return updated;
    });
    
    if (soundEnabled) {
      playNotificationSound();
    }
  };

  const showNotification = (notification: Notification) => {
    if (permission === 'granted' && document.hidden) {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: notification.id,
        requireInteraction: notification.type === 'safety' || notification.type === 'warning'
      });
      
      n.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        n.close();
      };
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('fieldforge_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('fieldforge_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('fieldforge_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'safety': return <Shield className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'achievement': return <TrendingUp className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'safety': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'success': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'achievement': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        {isEnabled ? (
          <Bell className="w-6 h-6" />
        ) : (
          <BellOff className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50" onClick={() => setShowPanel(false)}>
          <div
            className="absolute right-4 top-16 w-96 max-h-[600px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-white" />
                  <h3 className="text-white font-bold">Notifications</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1 text-white/80 hover:text-white transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-2 text-xs text-white/80 hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Permission Request */}
            {permission !== 'granted' && (
              <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Enable Push Notifications</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Get real-time alerts for important updates
                    </p>
                    <button
                      onClick={requestPermission}
                      className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-medium hover:bg-yellow-400 transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`mb-2 p-3 rounded-lg border transition-all cursor-pointer ${
                        notification.read ? 'opacity-60' : ''
                      } ${getNotificationColor(notification.type)} hover:bg-gray-800/50`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
