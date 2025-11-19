"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getUserNotifications = getUserNotifications;
exports.getUnreadCount = getUnreadCount;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
exports.dismissNotification = dismissNotification;
exports.notifyRoomInvite = notifyRoomInvite;
exports.notifyNewMessage = notifyNewMessage;
exports.notifyMention = notifyMention;
exports.notifyRoomStarted = notifyRoomStarted;
const database_js_1 = require("../database.js");
/**
 * Create a notification for a user
 */
async function createNotification(params) {
    const result = await (0, database_js_1.query)(`SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) as notification_id`, [
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
    ]);
    const notificationId = result.rows[0].notification_id;
    console.log(`[notifications] Created ${params.type} notification for user ${params.userId}: ${notificationId}`);
    return notificationId;
}
/**
 * Get user notifications
 */
async function getUserNotifications(userId, limit = 50, offset = 0, unreadOnly = false) {
    let sql = `
    SELECT * FROM notifications
    WHERE user_id = $1
  `;
    if (unreadOnly) {
        sql += ` AND read_at IS NULL`;
    }
    sql += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    const result = await (0, database_js_1.query)(sql, [userId, limit, offset]);
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
async function getUnreadCount(userId) {
    const result = await (0, database_js_1.query)(`SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read_at IS NULL`, [userId]);
    return parseInt(result.rows[0].count);
}
/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
    await (0, database_js_1.query)(`SELECT mark_notification_read($1)`, [notificationId]);
    console.log(`[notifications] Marked as read: ${notificationId}`);
}
/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
    const result = await (0, database_js_1.query)(`SELECT mark_all_notifications_read($1) as count`, [userId]);
    const count = parseInt(result.rows[0].count);
    console.log(`[notifications] Marked ${count} notifications as read for user ${userId}`);
    return count;
}
/**
 * Dismiss notification
 */
async function dismissNotification(notificationId) {
    await (0, database_js_1.query)(`UPDATE notifications SET dismissed_at = now() WHERE id = $1`, [notificationId]);
    console.log(`[notifications] Dismissed: ${notificationId}`);
}
/**
 * Helper: Create notification when user invited to collaboration room
 */
async function notifyRoomInvite(userId, roomId, roomName, invitedBy, inviterName) {
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
async function notifyNewMessage(userId, conversationId, conversationName, senderId, senderName, messagePreview) {
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
async function notifyMention(userId, conversationId, conversationName, senderId, senderName, messagePreview) {
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
async function notifyRoomStarted(userId, roomId, roomName, startedBy, starterName) {
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
