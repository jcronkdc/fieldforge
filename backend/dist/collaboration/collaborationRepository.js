"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollaborationRoom = createCollaborationRoom;
exports.getCollaborationRoom = getCollaborationRoom;
exports.getCollaborationRoomByDailyId = getCollaborationRoomByDailyId;
exports.getProjectRooms = getProjectRooms;
exports.endCollaborationRoom = endCollaborationRoom;
exports.addRoomParticipant = addRoomParticipant;
exports.updateParticipantToken = updateParticipantToken;
exports.markParticipantJoined = markParticipantJoined;
exports.markParticipantLeft = markParticipantLeft;
exports.getRoomParticipants = getRoomParticipants;
exports.cleanupExpiredRooms = cleanupExpiredRooms;
const supabase_js_1 = require("@supabase/supabase-js");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const supabase = (0, supabase_js_1.createClient)(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_KEY || '');
/**
 * Create a new collaboration room in the database
 */
async function createCollaborationRoom(projectId, roomName, createdBy, dailyRoomData, conversationId, privacy = 'private') {
    const { data, error } = await supabase
        .from('collaboration_rooms')
        .insert({
        project_id: projectId,
        conversation_id: conversationId,
        room_name: roomName,
        daily_room_id: dailyRoomData.id,
        daily_room_url: dailyRoomData.url,
        daily_room_name: dailyRoomData.name,
        privacy,
        created_by: createdBy,
        settings: {
            enableCursorControl: true,
            enableScreenShare: true,
            enableRecording: true,
            enableChat: true,
            maxParticipants: 50,
            requireKnocking: true
        },
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
        .select()
        .single();
    if (error) {
        console.error('[collaboration] Failed to create room:', error);
        throw new Error(`Failed to create collaboration room: ${error.message}`);
    }
    return data;
}
/**
 * Get a collaboration room by ID
 */
async function getCollaborationRoom(roomId) {
    const { data, error } = await supabase
        .from('collaboration_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Room not found
        }
        console.error('[collaboration] Failed to get room:', error);
        throw new Error(`Failed to get collaboration room: ${error.message}`);
    }
    return data;
}
/**
 * Get a collaboration room by Daily.co room ID
 */
async function getCollaborationRoomByDailyId(dailyRoomId) {
    const { data, error } = await supabase
        .from('collaboration_rooms')
        .select('*')
        .eq('daily_room_id', dailyRoomId)
        .single();
    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('[collaboration] Failed to get room by Daily ID:', error);
        throw new Error(`Failed to get collaboration room: ${error.message}`);
    }
    return data;
}
/**
 * Get all active rooms for a project
 */
async function getProjectRooms(projectId) {
    const { data, error } = await supabase
        .from('collaboration_rooms')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('[collaboration] Failed to get project rooms:', error);
        throw new Error(`Failed to get project rooms: ${error.message}`);
    }
    return (data || []);
}
/**
 * End a collaboration room
 */
async function endCollaborationRoom(roomId, userId) {
    // First check if user has permission to delete (must be creator or admin)
    const room = await getCollaborationRoom(roomId);
    if (!room) {
        throw new Error('Room not found');
    }
    if (room.created_by !== userId) {
        // Check if user is a project admin
        const { data: projectMember } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', room.project_id)
            .eq('user_id', userId)
            .single();
        if (!projectMember || projectMember.role !== 'admin') {
            throw new Error('Unauthorized: Only room creator or project admin can end the room');
        }
    }
    const { error } = await supabase
        .from('collaboration_rooms')
        .update({
        status: 'ended',
        ended_at: new Date().toISOString()
    })
        .eq('id', roomId);
    if (error) {
        console.error('[collaboration] Failed to end room:', error);
        throw new Error(`Failed to end collaboration room: ${error.message}`);
    }
}
/**
 * Add a participant to a room
 */
async function addRoomParticipant(roomId, userId, userName, role = 'participant', permissions = {}) {
    const { data, error } = await supabase
        .from('collaboration_room_participants')
        .insert({
        room_id: roomId,
        user_id: userId,
        user_name: userName,
        role,
        can_screen_share: permissions.canScreenShare !== false,
        can_record: permissions.canRecord === true,
        can_control_cursor: permissions.canControlCursor !== false,
        is_owner: permissions.isOwner === true
    })
        .select()
        .single();
    if (error) {
        console.error('[collaboration] Failed to add participant:', error);
        throw new Error(`Failed to add participant: ${error.message}`);
    }
    return data;
}
/**
 * Update participant's meeting token
 */
async function updateParticipantToken(roomId, userId, token, expiresAt) {
    const { error } = await supabase
        .from('collaboration_room_participants')
        .update({
        meeting_token: token,
        token_expires_at: expiresAt
    })
        .eq('room_id', roomId)
        .eq('user_id', userId);
    if (error) {
        console.error('[collaboration] Failed to update participant token:', error);
        throw new Error(`Failed to update participant token: ${error.message}`);
    }
}
/**
 * Mark participant as joined
 */
async function markParticipantJoined(roomId, userId) {
    const { error } = await supabase
        .from('collaboration_room_participants')
        .update({
        joined_at: new Date().toISOString()
    })
        .eq('room_id', roomId)
        .eq('user_id', userId);
    if (error) {
        console.error('[collaboration] Failed to mark participant joined:', error);
    }
}
/**
 * Mark participant as left
 */
async function markParticipantLeft(roomId, userId) {
    const participant = await supabase
        .from('collaboration_room_participants')
        .select('joined_at')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();
    if (participant.data?.joined_at) {
        const duration = Math.floor((new Date().getTime() - new Date(participant.data.joined_at).getTime()) / 1000);
        await supabase
            .from('collaboration_room_participants')
            .update({
            left_at: new Date().toISOString(),
            duration_seconds: duration
        })
            .eq('room_id', roomId)
            .eq('user_id', userId);
    }
}
/**
 * Get room participants
 */
async function getRoomParticipants(roomId) {
    const { data, error } = await supabase
        .from('collaboration_room_participants')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: false });
    if (error) {
        console.error('[collaboration] Failed to get participants:', error);
        throw new Error(`Failed to get participants: ${error.message}`);
    }
    return (data || []);
}
/**
 * Clean up expired rooms (called by scheduled job or manually)
 */
async function cleanupExpiredRooms() {
    const { data, error } = await supabase
        .from('collaboration_rooms')
        .update({
        status: 'ended',
        ended_at: new Date().toISOString()
    })
        .eq('status', 'active')
        .lt('expires_at', new Date().toISOString())
        .select();
    if (error) {
        console.error('[collaboration] Failed to cleanup expired rooms:', error);
        throw new Error(`Failed to cleanup expired rooms: ${error.message}`);
    }
    return data?.length || 0;
}
