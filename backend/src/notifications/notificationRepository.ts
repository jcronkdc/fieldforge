import { query } from "../database.js";

/**
 * Notification Repository
 * Handles persistent notifications for collaborative features
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'room_invite' | 'room_started' | 'project_invite' | 'team_invite' | 'emergency_alert' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  senderId?: string;
  readAt?: string;
  dismissedAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  senderId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<string> {
  const result = await query(
    `SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) as notification_id`,
    [
      params.userId,
      params.type,
      params.title,
      params.message,
      params.actionUrl || null,
      params.actionLabel || null,
      params.relatedEntityType || null,
      params.relatedEntityId || null,
      params.senderId || null,
      JSON.stringify(params.metadata || {})
    ]
  );
  
  const notificationId = result.rows[0].notification_id;
  console.log(`[notifications] Created ${params.type} notification for user ${params.userId}: ${notificationId}`);
  
  return notificationId;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let sql = `
    SELECT * FROM notifications
    WHERE user_id = $1
  `;
  
  if (unreadOnly) {
    sql += ` AND read_at IS NULL`;
  }
  
  sql += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
  
  const result = await query(sql, [userId, limit, offset]);
  
  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    actionUrl: row.action_url,
    actionLabel: row.action_label,
    relatedEntityType: row.related_entity_type,
    relatedEntityId: row.related_entity_id,
    senderId: row.sender_id,
    readAt: row.read_at,
    dismissedAt: row.dismissed_at,
    expiresAt: row.expires_at,
    metadata: row.metadata,
    createdAt: row.created_at
  }));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  
  return parseInt(result.rows[0].count);
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await query(`SELECT mark_notification_read($1)`, [notificationId]);
  console.log(`[notifications] Marked as read: ${notificationId}`);
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const result = await query(`SELECT mark_all_notifications_read($1) as count`, [userId]);
  const count = parseInt(result.rows[0].count);
  console.log(`[notifications] Marked ${count} notifications as read for user ${userId}`);
  return count;
}

/**
 * Dismiss notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  await query(
    `UPDATE notifications SET dismissed_at = now() WHERE id = $1`,
    [notificationId]
  );
  console.log(`[notifications] Dismissed: ${notificationId}`);
}

/**
 * Helper: Create notification when user invited to collaboration room
 */
export async function notifyRoomInvite(
  userId: string,
  roomId: string,
  roomName: string,
  invitedBy: string,
  inviterName: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'room_invite',
    title: 'Collaboration Room Invite',
    message: `${inviterName} invited you to join "${roomName}"`,
    actionUrl: `/collaboration/rooms/${roomId}`,
    actionLabel: 'Join Room',
    relatedEntityType: 'room',
    relatedEntityId: roomId,
    senderId: invitedBy
  });
}

/**
 * Helper: Create notification when new message received
 */
export async function notifyNewMessage(
  userId: string,
  conversationId: string,
  conversationName: string,
  senderId: string,
  senderName: string,
  messagePreview: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'message',
    title: `New message in ${conversationName}`,
    message: `${senderName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
    actionUrl: `/messaging/conversations/${conversationId}`,
    actionLabel: 'View Message',
    relatedEntityType: 'conversation',
    relatedEntityId: conversationId,
    senderId
  });
}

/**
 * Helper: Create notification when user mentioned
 */
export async function notifyMention(
  userId: string,
  conversationId: string,
  conversationName: string,
  senderId: string,
  senderName: string,
  messagePreview: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'mention',
    title: `${senderName} mentioned you`,
    message: messagePreview.substring(0, 150),
    actionUrl: `/messaging/conversations/${conversationId}`,
    actionLabel: 'View Message',
    relatedEntityType: 'conversation',
    relatedEntityId: conversationId,
    senderId
  });
}

/**
 * Helper: Create notification when collaboration room starts
 */
export async function notifyRoomStarted(
  userId: string,
  roomId: string,
  roomName: string,
  startedBy: string,
  starterName: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'room_started',
    title: 'Collaboration Session Started',
    message: `${starterName} started a collaboration session in "${roomName}"`,
    actionUrl: `/collaboration/rooms/${roomId}`,
    actionLabel: 'Join Now',
    relatedEntityType: 'room',
    relatedEntityId: roomId,
    senderId: startedBy
  });
}




