/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Notification Center - Real-time notifications with return navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  GlassCard,
  NeonButton,
  HoloBadge,
  AnimatedCounter,
  Toast
} from '../ui/ModernUI';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { formatDistanceToNow } from '../../lib/utils';
import './NotificationCenter.css';

interface Notification {
  id: string;
  type: 'angry_lips_turn' | 'angry_lips_invite' | 'message' | 'friend_request' | 
        'story_update' | 'sparks_earned' | 'achievement' | 'system';
  title: string;
  body: string;
  action_url?: string;
  action_data?: any;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (url: string, data?: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousLocationRef = useRef<string>(window.location.href);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      // Save current location for return navigation
      previousLocationRef.current = window.location.href;
    }
  }, [isOpen]);

  useEffect(() => {
    // Set up real-time subscription for new notifications
    setupRealtimeNotifications();
    
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up periodic check for new notifications
    const interval = setInterval(checkNewNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const data = await apiRequest(`/api/notifications/user/${user.id}`);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeNotifications = () => {
    // Subscribe to Supabase/Ably for real-time notifications
    // This would listen for new notifications and update the UI
  };

  const checkNewNotifications = async () => {
    if (!user) return;
    
    try {
      const data = await apiRequest(`/api/notifications/unread-count/${user.id}`);
      
      if (data.count > unreadCount) {
        // New notifications received
        playNotificationSound();
        showBrowserNotification(data.latestNotification);
        loadNotifications();
      }
      
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation
    if (notification.action_url) {
      // Save current work state
      saveCurrentWorkState();
      
      // Navigate to the action URL
      if (onNavigate) {
        onNavigate(notification.action_url, notification.action_data);
      } else {
        window.location.href = notification.action_url;
      }
    }
    
    onClose();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await apiRequest(`/api/notifications/user/${user.id}/read-all`, {
        method: 'POST'
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    if (!user) return;
    
    try {
      await apiRequest(`/api/notifications/user/${user.id}/clear`, {
        method: 'DELETE'
      });
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const saveCurrentWorkState = () => {
    // Save current work state to localStorage
    const workState = {
      url: window.location.href,
      scrollPosition: window.scrollY,
      formData: getFormData(),
      timestamp: Date.now()
    };
    
    localStorage.setItem('mythatron_work_state', JSON.stringify(workState));
  };

  const returnToPreviousWork = () => {
    const savedState = localStorage.getItem('mythatron_work_state');
    
    if (savedState) {
      const workState = JSON.parse(savedState);
      
      // Check if state is still valid (less than 1 hour old)
      if (Date.now() - workState.timestamp < 3600000) {
        window.location.href = workState.url;
        
        // Restore scroll position after navigation
        setTimeout(() => {
          window.scrollTo(0, workState.scrollPosition);
        }, 100);
        
        // Restore form data if applicable
        restoreFormData(workState.formData);
      }
    } else {
      // Return to previous location
      window.location.href = previousLocationRef.current;
    }
    
    onClose();
  };

  const getFormData = (): any => {
    // Capture form data from current page
    const forms = document.querySelectorAll('form');
    const formData: any = {};
    
    forms.forEach((form, index) => {
      const data = new FormData(form as HTMLFormElement);
      formData[`form_${index}`] = Object.fromEntries(data);
    });
    
    // Also capture contenteditable elements
    const editables = document.querySelectorAll('[contenteditable="true"]');
    editables.forEach((element, index) => {
      formData[`editable_${index}`] = element.textContent;
    });
    
    return formData;
  };

  const restoreFormData = (formData: any) => {
    // Restore form data after navigation
    if (!formData) return;
    
    Object.keys(formData).forEach(key => {
      if (key.startsWith('form_')) {
        const formIndex = parseInt(key.split('_')[1]);
        const form = document.querySelectorAll('form')[formIndex];
        
        if (form) {
          Object.entries(formData[key]).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
            if (input) {
              input.value = value as string;
            }
          });
        }
      } else if (key.startsWith('editable_')) {
        const editableIndex = parseInt(key.split('_')[1]);
        const editable = document.querySelectorAll('[contenteditable="true"]')[editableIndex];
        
        if (editable) {
          editable.textContent = formData[key];
        }
      }
    });
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Could not play sound:', e));
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.body,
        icon: '/mythatron-icon.png',
        badge: '/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        actions: notification.action_url ? [
          { action: 'open', title: 'Open' },
          { action: 'dismiss', title: 'Dismiss' }
        ] : []
      });
      
      browserNotif.onclick = () => {
        window.focus();
        handleNotificationClick(notification);
      };
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      angry_lips_turn: '🎭',
      angry_lips_invite: '🎪',
      message: '💬',
      friend_request: '👥',
      story_update: '📖',
      sparks_earned: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      achievement: '🏆',
      system: '📢'
    };
    return icons[type] || '📬';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      urgent: '#EF4444',
      high: '#F97316',
      normal: '#3B82F6',
      low: '#6B7280'
    };
    return colors[priority] || '#6B7280';
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay">
      <GlassCard className="notification-center">
        {/* Header */}
        <div className="notification-header">
          <h2>
            Notifications
            {unreadCount > 0 && (
              <HoloBadge text={`${unreadCount} NEW`} type="hot" />
            )}
          </h2>
          
          <div className="notification-actions">
            <NeonButton size="sm" onClick={markAllAsRead}>
              Mark All Read
            </NeonButton>
            <NeonButton size="sm" onClick={clearAll}>
              Clear All
            </NeonButton>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Return to Work Button */}
        <div className="return-to-work">
          <NeonButton 
            color="green"
            onClick={returnToPreviousWork}
            icon="↩️"
          >
            Return to Previous Work
          </NeonButton>
        </div>

        {/* Filter Tabs */}
        <div className="notification-filters">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <span className="empty-icon">📭</span>
              <p>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ borderLeftColor: getPriorityColor(notification.priority) }}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                    {notification.priority === 'urgent' && (
                      <HoloBadge text="URGENT" type="hot" />
                    )}
                  </div>
                  <div className="notification-body">
                    {notification.body}
                  </div>
                  <div className="notification-time">
                    {formatDistanceToNow(new Date(notification.created_at))} ago
                  </div>
                </div>
                
                {notification.action_url && (
                  <div className="notification-action">
                    <NeonButton size="sm">
                      Open
                    </NeonButton>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Audio for notification sound */}
        <audio ref={audioRef} src="/notification-sound.mp3" />
      </GlassCard>
    </div>
  );
};

// Floating notification bell component
export const NotificationBell: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (user) {
      checkUnreadCount();
      const interval = setInterval(checkUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkUnreadCount = async () => {
    if (!user) return;
    
    try {
      const data = await apiRequest(`/api/notifications/unread-count/${user.id}`);
      
      if (data.count > unreadCount) {
        // New notifications - shake the bell
        setShake(true);
        setTimeout(() => setShake(false), 1000);
      }
      
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  };

  return (
    <button 
      className={`notification-bell ${shake ? 'shake' : ''}`}
      onClick={onClick}
    >
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="bell-badge">
          <AnimatedCounter value={unreadCount} duration={500} />
        </span>
      )}
    </button>
  );
};
