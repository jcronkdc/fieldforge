import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();
const supabase = createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_KEY || '');

/**
 * Collaboration Repository
 * Database operations for video collaboration rooms
 */

export interface CollaborationRoom {
  id: string;
  project_id: string;
  conversation_id?: string;
  room_name: string;
  description?: string;
  daily_room_id: string;
  daily_room_url: string;
  daily_room_name: string;
  privacy: 'private' | 'public';
  created_by: string;
  settings: {
    enableCursorControl: boolean;
    enableScreenShare: boolean;
    enableRecording: boolean;
    enableChat: boolean;
    maxParticipants: number;
    requireKnocking: boolean;
  };
  status: 'active' | 'ended' | 'scheduled';
  started_at: string;
  ended_at?: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface CollaborationRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  role: 'host' | 'moderator' | 'participant';
  can_screen_share: boolean;
  can_record: boolean;
  can_control_cursor: boolean;
  is_owner: boolean;
  meeting_token?: string;
  token_expires_at?: string;
  joined_at?: string;
  left_at?: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new collaboration room in the database
 */
export async function createCollaborationRoom(
  projectId: string,
  roomName: string,
  createdBy: string,
  dailyRoomData: {
    id: string;
    name: string;
    url: string;
  },
  conversationId?: string,
  privacy: 'private' | 'public' = 'private'
): Promise<CollaborationRoom> {
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

  return data as CollaborationRoom;
}

/**
 * Get a collaboration room by ID
 */
export async function getCollaborationRoom(roomId: string): Promise<CollaborationRoom | null> {
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

  return data as CollaborationRoom;
}

/**
 * Get a collaboration room by Daily.co room ID
 */
export async function getCollaborationRoomByDailyId(dailyRoomId: string): Promise<CollaborationRoom | null> {
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

  return data as CollaborationRoom;
}

/**
 * Get all active rooms for a project
 */
export async function getProjectRooms(projectId: string): Promise<CollaborationRoom[]> {
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

  return (data || []) as CollaborationRoom[];
}

/**
 * End a collaboration room
 */
export async function endCollaborationRoom(roomId: string, userId: string): Promise<void> {
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
export async function addRoomParticipant(
  roomId: string,
  userId: string,
  userName: string,
  role: 'host' | 'moderator' | 'participant' = 'participant',
  permissions: {
    canScreenShare?: boolean;
    canRecord?: boolean;
    canControlCursor?: boolean;
    isOwner?: boolean;
  } = {}
): Promise<CollaborationRoomParticipant> {
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

  return data as CollaborationRoomParticipant;
}

/**
 * Update participant's meeting token
 */
export async function updateParticipantToken(
  roomId: string,
  userId: string,
  token: string,
  expiresAt: string
): Promise<void> {
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
export async function markParticipantJoined(roomId: string, userId: string): Promise<void> {
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
export async function markParticipantLeft(roomId: string, userId: string): Promise<void> {
  const participant = await supabase
    .from('collaboration_room_participants')
    .select('joined_at')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .single();

  if (participant.data?.joined_at) {
    const duration = Math.floor(
      (new Date().getTime() - new Date(participant.data.joined_at).getTime()) / 1000
    );

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
export async function getRoomParticipants(roomId: string): Promise<CollaborationRoomParticipant[]> {
  const { data, error } = await supabase
    .from('collaboration_room_participants')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('[collaboration] Failed to get participants:', error);
    throw new Error(`Failed to get participants: ${error.message}`);
  }

  return (data || []) as CollaborationRoomParticipant[];
}

/**
 * Clean up expired rooms (called by scheduled job or manually)
 */
export async function cleanupExpiredRooms(): Promise<number> {
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

