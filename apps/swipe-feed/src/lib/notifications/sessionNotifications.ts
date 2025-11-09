/**
 * Session Notifications System
 * Handles in-app and email notifications for resumed sessions
 */

interface SessionNotification {
  sessionId: string;
  sessionName: string;
  players: string[];
  resumedBy: string;
  timestamp: number;
}

class SessionNotificationService {
  private subscribers: Set<(notification: SessionNotification) => void> = new Set();

  /**
   * Send notification when session is resumed
   */
  async notifySessionResumed(
    sessionId: string, 
    sessionName: string,
    players: string[],
    resumedBy: string
  ) {
    const notification: SessionNotification = {
      sessionId,
      sessionName,
      players,
      resumedBy,
      timestamp: Date.now()
    };

    // In-app notifications
    this.broadcastToSubscribers(notification);
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AngryLips Session Resumed!', {
        body: `${resumedBy} has resumed "${sessionName}". Join now!`,
        icon: '/icon-192x192.png',
        tag: sessionId,
        requireInteraction: true
      });
    }

    // Store notification for display
    const notifications = JSON.parse(localStorage.getItem('mythatron_notifications') || '[]');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'session_resumed',
      title: 'Session Resumed',
      message: `${resumedBy} resumed "${sessionName}"`,
      sessionId,
      timestamp: Date.now(),
      read: false
    });
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.length = 50;
    }
    
    localStorage.setItem('mythatron_notifications', JSON.stringify(notifications));

    // Simulate email notification (in production, this would call backend)
    await this.sendEmailNotification(notification);
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notification: SessionNotification) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Broadcast to all subscribers
   */
  private broadcastToSubscribers(notification: SessionNotification) {
    this.subscribers.forEach(callback => callback(notification));
  }

  /**
   * Send email notification (simulated)
   */
  private async sendEmailNotification(notification: SessionNotification) {
    // In production, this would call your email service API
    console.log('Email notification would be sent:', {
      to: notification.players.filter(p => p !== notification.resumedBy),
      subject: `${notification.resumedBy} resumed your AngryLips game!`,
      body: `Join "${notification.sessionName}" now to continue playing!`
    });

    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Auto-invite players when session resumes
   */
  autoInvitePlayers(sessionId: string, players: string[], excludePlayer?: string) {
    const invites = players
      .filter(p => p !== excludePlayer)
      .map(player => ({
        id: `invite-${Date.now()}-${Math.random()}`,
        sessionId,
        invitedPlayer: player,
        invitedBy: excludePlayer || 'System',
        status: 'pending',
        timestamp: Date.now()
      }));

    // Store invites
    const existingInvites = JSON.parse(localStorage.getItem('angry_lips_invites') || '[]');
    const updatedInvites = [...invites, ...existingInvites];
    localStorage.setItem('angry_lips_invites', JSON.stringify(updatedInvites));

    return invites;
  }
}

export const sessionNotifications = new SessionNotificationService();

export default sessionNotifications;
