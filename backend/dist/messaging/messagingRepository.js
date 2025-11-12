"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrGetDirectConversation = createOrGetDirectConversation;
exports.createGroupConversation = createGroupConversation;
exports.createProjectConversation = createProjectConversation;
exports.getUserConversations = getUserConversations;
exports.getConversationMessages = getConversationMessages;
exports.sendMessage = sendMessage;
exports.markConversationAsRead = markConversationAsRead;
exports.addMessageReaction = addMessageReaction;
exports.removeMessageReaction = removeMessageReaction;
exports.updateTypingIndicator = updateTypingIndicator;
exports.getTypingIndicators = getTypingIndicators;
exports.addParticipantsToConversation = addParticipantsToConversation;
exports.leaveConversation = leaveConversation;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const env = (0, env_js_1.loadEnv)();
// Create or get direct conversation
async function createOrGetDirectConversation(userId, otherUserId) {
    const result = await (0, database_js_1.query)(`SELECT create_or_get_direct_conversation($1) as conversation_id`, [otherUserId]);
    return result.rows[0].conversation_id;
}
// Create group conversation
async function createGroupConversation(creatorId, name, description, participantIds = []) {
    const client = await (0, database_js_1.query)('BEGIN');
    try {
        // Create conversation
        const conversationResult = await (0, database_js_1.query)(`INSERT INTO conversations (type, name, description, created_by)
       VALUES ('group', $1, $2, $3)
       RETURNING *`, [name, description, creatorId]);
        const conversation = conversationResult.rows[0];
        // Add creator as admin
        await (0, database_js_1.query)(`INSERT INTO conversation_participants (conversation_id, user_id, role)
       VALUES ($1, $2, 'admin')`, [conversation.id, creatorId]);
        // Add other participants as members
        if (participantIds.length > 0) {
            const values = participantIds.map((id, i) => `($1, $${i + 2}, 'member')`).join(', ');
            await (0, database_js_1.query)(`INSERT INTO conversation_participants (conversation_id, user_id, role)
         VALUES ${values}`, [conversation.id, ...participantIds]);
        }
        await (0, database_js_1.query)('COMMIT');
        return conversation;
    }
    catch (error) {
        await (0, database_js_1.query)('ROLLBACK');
        throw error;
    }
}
// Create project conversation (for Angry Lips, Stories, etc.)
async function createProjectConversation(creatorId, projectType, projectId, name, participantIds = []) {
    const client = await (0, database_js_1.query)('BEGIN');
    try {
        // Create conversation
        const conversationResult = await (0, database_js_1.query)(`INSERT INTO conversations (type, name, project_type, project_id, created_by)
       VALUES ('project', $1, $2, $3, $4)
       RETURNING *`, [name, projectType, projectId, creatorId]);
        const conversation = conversationResult.rows[0];
        // Add creator as admin
        await (0, database_js_1.query)(`INSERT INTO conversation_participants (conversation_id, user_id, role)
       VALUES ($1, $2, 'admin')`, [conversation.id, creatorId]);
        // Add other participants
        if (participantIds.length > 0) {
            const values = participantIds.map((id, i) => `($1, $${i + 2}, 'member')`).join(', ');
            await (0, database_js_1.query)(`INSERT INTO conversation_participants (conversation_id, user_id, role)
         VALUES ${values}`, [conversation.id, ...participantIds]);
        }
        await (0, database_js_1.query)('COMMIT');
        return conversation;
    }
    catch (error) {
        await (0, database_js_1.query)('ROLLBACK');
        throw error;
    }
}
// Get user's conversations with details
async function getUserConversations(userId, limit = 50, offset = 0) {
    const result = await (0, database_js_1.query)(`WITH user_conversations AS (
      SELECT 
        c.*,
        cp.last_read_at,
        COUNT(m.id) FILTER (WHERE m.created_at > COALESCE(cp.last_read_at, '1970-01-01')) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE cp.user_id = $1
      GROUP BY c.id, cp.last_read_at
    ),
    conversation_participants_details AS (
      SELECT 
        cp.conversation_id,
        json_agg(json_build_object(
          'userId', cp.user_id,
          'username', up.username,
          'displayName', up.display_name,
          'avatarUrl', up.avatar_url,
          'role', cp.role
        )) as participants
      FROM conversation_participants cp
      JOIN user_profiles up ON up.user_id = cp.user_id
      GROUP BY cp.conversation_id
    ),
    last_messages AS (
      SELECT DISTINCT ON (m.conversation_id)
        m.*,
        up.username as sender_username,
        up.display_name as sender_display_name,
        up.avatar_url as sender_avatar_url
      FROM messages m
      JOIN user_profiles up ON up.user_id = m.sender_id
      WHERE m.deleted_at IS NULL
      ORDER BY m.conversation_id, m.created_at DESC
    )
    SELECT 
      uc.*,
      cpd.participants,
      CASE 
        WHEN lm.id IS NOT NULL THEN
          json_build_object(
            'id', lm.id,
            'conversationId', lm.conversation_id,
            'senderId', lm.sender_id,
            'content', lm.content,
            'messageType', lm.message_type,
            'createdAt', lm.created_at,
            'senderUsername', lm.sender_username,
            'senderDisplayName', lm.sender_display_name,
            'senderAvatarUrl', lm.sender_avatar_url
          )
        ELSE NULL
      END as last_message
    FROM user_conversations uc
    JOIN conversation_participants_details cpd ON cpd.conversation_id = uc.id
    LEFT JOIN last_messages lm ON lm.conversation_id = uc.id
    ORDER BY COALESCE(uc.last_message_at, uc.created_at) DESC
    LIMIT $2 OFFSET $3`, [userId, limit, offset]);
    return result.rows.map((row) => ({
        ...row,
        lastMessage: row.last_message,
        unreadCount: parseInt(row.unread_count) || 0
    }));
}
// Get conversation messages
async function getConversationMessages(conversationId, userId, limit = 50, beforeMessageId) {
    let whereClause = 'm.conversation_id = $1 AND m.deleted_at IS NULL';
    const params = [conversationId, userId];
    if (beforeMessageId) {
        whereClause += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $3)`;
        params.push(beforeMessageId);
    }
    const result = await (0, database_js_1.query)(`WITH message_reactions AS (
      SELECT 
        mr.message_id,
        mr.reaction,
        COUNT(*) as count,
        bool_or(mr.user_id = $2) as has_reacted
      FROM message_reactions mr
      GROUP BY mr.message_id, mr.reaction
    )
    SELECT 
      m.*,
      up.username as sender_username,
      up.display_name as sender_display_name,
      up.avatar_url as sender_avatar_url,
      COALESCE(
        json_agg(
          json_build_object(
            'reaction', mr.reaction,
            'count', mr.count,
            'hasReacted', mr.has_reacted
          )
        ) FILTER (WHERE mr.message_id IS NOT NULL),
        '[]'::json
      ) as reactions
    FROM messages m
    JOIN user_profiles up ON up.user_id = m.sender_id
    LEFT JOIN message_reactions mr ON mr.message_id = m.id
    WHERE ${whereClause}
    GROUP BY m.id, up.username, up.display_name, up.avatar_url
    ORDER BY m.created_at DESC
    LIMIT ${params.length + 1}`, [...params, limit]);
    return result.rows.reverse();
}
// Send message
async function sendMessage(conversationId, senderId, content, messageType = 'text', metadata = {}) {
    const result = await (0, database_js_1.query)(`INSERT INTO messages (conversation_id, sender_id, content, message_type, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`, [conversationId, senderId, content, messageType, metadata]);
    return result.rows[0];
}
// Mark conversation as read
async function markConversationAsRead(conversationId, userId) {
    await (0, database_js_1.query)(`UPDATE conversation_participants
     SET last_read_at = NOW()
     WHERE conversation_id = $1 AND user_id = $2`, [conversationId, userId]);
}
// Add reaction to message
async function addMessageReaction(messageId, userId, reaction) {
    await (0, database_js_1.query)(`INSERT INTO message_reactions (message_id, user_id, reaction)
     VALUES ($1, $2, $3)
     ON CONFLICT (message_id, user_id, reaction) DO NOTHING`, [messageId, userId, reaction]);
}
// Remove reaction from message
async function removeMessageReaction(messageId, userId, reaction) {
    await (0, database_js_1.query)(`DELETE FROM message_reactions
     WHERE message_id = $1 AND user_id = $2 AND reaction = $3`, [messageId, userId, reaction]);
}
// Update typing indicator
async function updateTypingIndicator(conversationId, userId, isTyping) {
    if (isTyping) {
        await (0, database_js_1.query)(`INSERT INTO typing_indicators (conversation_id, user_id, started_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (conversation_id, user_id) 
       DO UPDATE SET started_at = NOW()`, [conversationId, userId]);
    }
    else {
        await (0, database_js_1.query)(`DELETE FROM typing_indicators
       WHERE conversation_id = $1 AND user_id = $2`, [conversationId, userId]);
    }
}
// Get typing indicators for conversation
async function getTypingIndicators(conversationId) {
    const result = await (0, database_js_1.query)(`SELECT 
      ti.user_id,
      up.username,
      up.display_name
    FROM typing_indicators ti
    JOIN user_profiles up ON up.user_id = ti.user_id
    WHERE ti.conversation_id = $1
    AND ti.started_at > NOW() - INTERVAL '10 seconds'`, [conversationId]);
    return result.rows;
}
// Add participants to conversation
async function addParticipantsToConversation(conversationId, participantIds, addedBy) {
    // Verify user is admin
    const adminCheck = await (0, database_js_1.query)(`SELECT role FROM conversation_participants
     WHERE conversation_id = $1 AND user_id = $2`, [conversationId, addedBy]);
    if (!adminCheck.rows[0] || adminCheck.rows[0].role !== 'admin') {
        throw new Error('Only admins can add participants');
    }
    // Add participants
    const values = participantIds.map((id, i) => `($1, $${i + 2}, 'member')`).join(', ');
    await (0, database_js_1.query)(`INSERT INTO conversation_participants (conversation_id, user_id, role)
     VALUES ${values}
     ON CONFLICT (conversation_id, user_id) DO NOTHING`, [conversationId, ...participantIds]);
    // Send system message
    await sendMessage(conversationId, addedBy, `Added ${participantIds.length} participant(s) to the conversation`, 'system');
}
// Leave conversation
async function leaveConversation(conversationId, userId) {
    await (0, database_js_1.query)(`DELETE FROM conversation_participants
     WHERE conversation_id = $1 AND user_id = $2`, [conversationId, userId]);
    // Send system message
    await sendMessage(conversationId, userId, 'Left the conversation', 'system');
}
