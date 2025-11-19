import { Router, Request, Response } from "express";
import { loadEnv } from "../worker/env.js";
import {
  createCollaborationRoom,
  getCollaborationRoom,
  getCollaborationRoomByDailyId,
  getProjectRooms,
  endCollaborationRoom,
  addRoomParticipant,
  updateParticipantToken,
  getRoomParticipants
} from "./collaborationRepository.js";
import {
  publishCursorUpdate,
  publishRoomEvent,
  publishParticipantPresence
} from "../realtime/collaborationPublisher.js";

/**
 * Daily.co Video Collaboration Routes
 * 
 * Features:
 * - Create video rooms for project collaboration
 * - Cursor control sharing for real-time co-working
 * - Screen sharing and recording
 * - Invite-only room access with database RLS enforcement
 */

const env = loadEnv();

export function createCollaborationRouter(): Router {
  const router = Router();

  /**
   * Create a Daily.co room for project collaboration
   * POST /api/collaboration/rooms
   */
  router.post("/rooms", async (req: Request, res: Response) => {
    const { projectId, conversationId, createdBy, roomName, privacy = 'private' } = req.body;

    if (!projectId || !createdBy || !roomName) {
      return res.status(400).json({ 
        error: "projectId, createdBy, and roomName are required" 
      });
    }

    try {
      // Check if Daily.co API key is configured
      if (!env.DAILY_API_KEY) {
        return res.status(503).json({ 
          error: "Video collaboration not configured. Daily.co API key missing." 
        });
      }

      // Create Daily.co room
      const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DAILY_API_KEY}`
        },
        body: JSON.stringify({
          name: `fieldforge-${projectId}-${Date.now()}`,
          privacy: privacy, // 'private' means only people with the URL can join
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            enable_recording: 'cloud',
            enable_knocking: true, // Requires approval to join (invite-only)
            start_video_off: false,
            start_audio_off: false,
            owner_only_broadcast: false,
            enable_prejoin_ui: true,
            max_participants: 50,
            // Custom cursor control via Daily's network topology
            enable_network_ui: true,
            enable_noise_cancellation_ui: true
          }
        })
      });

      if (!dailyResponse.ok) {
        const errorData = await dailyResponse.json();
        console.error('[collaboration] Daily.co error:', errorData);
        return res.status(500).json({ 
          error: "Failed to create video room",
          details: errorData 
        });
      }

      const dailyRoom = await dailyResponse.json();

      // Store room metadata in database (mycelial persistence)
      const room = await createCollaborationRoom(
        projectId,
        roomName,
        createdBy,
        {
          id: dailyRoom.id,
          name: dailyRoom.name,
          url: dailyRoom.url
        },
        conversationId,
        privacy
      );

      // Add creator as room participant
      await addRoomParticipant(
        room.id,
        createdBy,
        req.body.creatorName || 'Room Creator',
        'host',
        {
          canScreenShare: true,
          canRecord: true,
          canControlCursor: true,
          isOwner: true
        }
      );

      console.log('[collaboration] Room created and persisted:', room.id);

      // Publish real-time event: room created
      await publishRoomEvent(room.id, 'room.created', {
        projectId: room.project_id,
        roomName: room.room_name,
        createdBy: room.created_by
      });

      res.json({ 
        success: true,
        room: {
          id: room.id,
          roomName: room.room_name,
          url: room.daily_room_url,
          dailyRoomUrl: room.daily_room_url,
          projectId: room.project_id,
          conversationId: room.conversation_id,
          createdBy: room.created_by,
          privacy: room.privacy,
          settings: room.settings,
          createdAt: room.created_at,
          expiresAt: room.expires_at
        },
        joinUrl: dailyRoom.url
      });
    } catch (error) {
      console.error('[collaboration] create room error:', error);
      res.status(500).json({ 
        error: "Failed to create collaboration room",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get all active collaboration rooms for a project
   * GET /api/collaboration/projects/:projectId/rooms
   */
  router.get("/projects/:projectId/rooms", async (req: Request, res: Response) => {
    const { projectId } = req.params;

    try {
      const rooms = await getProjectRooms(projectId);
      res.json({ rooms });
    } catch (error) {
      console.error('[collaboration] get project rooms error:', error);
      res.status(500).json({ error: "Failed to fetch project rooms" });
    }
  });

  /**
   * Get room details
   * GET /api/collaboration/rooms/:roomId
   */
  router.get("/rooms/:roomId", async (req: Request, res: Response) => {
    const { roomId } = req.params;

    try {
      if (!env.DAILY_API_KEY) {
        return res.status(503).json({ 
          error: "Video collaboration not configured" 
        });
      }

      const dailyResponse = await fetch(`https://api.daily.co/v1/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${env.DAILY_API_KEY}`
        }
      });

      if (!dailyResponse.ok) {
        return res.status(404).json({ error: "Room not found" });
      }

      const room = await dailyResponse.json();
      res.json({ room });
    } catch (error) {
      console.error('[collaboration] get room error:', error);
      res.status(500).json({ error: "Failed to fetch room details" });
    }
  });

  /**
   * Delete/end a collaboration room
   * DELETE /api/collaboration/rooms/:roomId
   * SECURITY: Only room creator or project admin can delete
   */
  router.delete("/rooms/:roomId", async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      if (!env.DAILY_API_KEY) {
        return res.status(503).json({ 
          error: "Video collaboration not configured" 
        });
      }

      // Get room from database to find Daily.co room ID
      const room = await getCollaborationRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Verify user has permission (creator or project admin)
      // This throws an error if unauthorized
      await endCollaborationRoom(roomId, userId);

      // Delete from Daily.co
      const dailyResponse = await fetch(`https://api.daily.co/v1/rooms/${room.daily_room_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${env.DAILY_API_KEY}`
        }
      });

      if (!dailyResponse.ok) {
        console.error('[collaboration] Daily.co deletion failed, but database updated');
      }

      // Publish real-time event: room ended
      await publishRoomEvent(roomId, 'room.ended', {
        endedBy: userId
      });

      res.json({ success: true, message: "Room ended" });
    } catch (error) {
      console.error('[collaboration] delete room error:', error);
      const message = error instanceof Error ? error.message : "Failed to delete room";
      const status = message.includes('Unauthorized') ? 403 : 500;
      res.status(status).json({ error: message });
    }
  });

  /**
   * Create a meeting token for invite-only access
   * POST /api/collaboration/rooms/:roomId/tokens
   */
  router.post("/rooms/:roomId/tokens", async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId, userName, permissions = {} } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ 
        error: "userId and userName are required" 
      });
    }

    try {
      if (!env.DAILY_API_KEY) {
        return res.status(503).json({ 
          error: "Video collaboration not configured" 
        });
      }

      // Create a meeting token with specific permissions
      const dailyResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DAILY_API_KEY}`
        },
        body: JSON.stringify({
          properties: {
            room_name: roomId,
            user_name: userName,
            user_id: userId,
            enable_screenshare: permissions.canScreenShare !== false,
            enable_recording: permissions.canRecord === true,
            start_video_off: permissions.startVideoOff === true,
            start_audio_off: permissions.startAudioOff === true,
            is_owner: permissions.isOwner === true,
            // Token expires in 24 hours
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
          }
        })
      });

      if (!dailyResponse.ok) {
        const errorData = await dailyResponse.json();
        console.error('[collaboration] Token creation error:', errorData);
        return res.status(500).json({ 
          error: "Failed to create meeting token" 
        });
      }

      const tokenData = await dailyResponse.json();
      const expiresAt = new Date((Math.floor(Date.now() / 1000) + (24 * 60 * 60)) * 1000).toISOString();

      // Add participant if not already added, or update their token
      try {
        await addRoomParticipant(
          roomId,
          userId,
          userName,
          permissions.isOwner ? 'host' : 'participant',
          permissions
        );
      } catch (err) {
        // Participant might already exist, update token instead
        await updateParticipantToken(roomId, userId, tokenData.token, expiresAt);
      }

      res.json({ 
        success: true,
        token: tokenData.token,
        expiresAt
      });
    } catch (error) {
      console.error('[collaboration] create token error:', error);
      res.status(500).json({ 
        error: "Failed to create meeting token" 
      });
    }
  });

  /**
   * Get active participants in a room
   * GET /api/collaboration/rooms/:roomId/participants
   */
  router.get("/rooms/:roomId/participants", async (req: Request, res: Response) => {
    const { roomId } = req.params;

    try {
      if (!env.DAILY_API_KEY) {
        return res.status(503).json({ 
          error: "Video collaboration not configured" 
        });
      }

      const dailyResponse = await fetch(`https://api.daily.co/v1/rooms/${roomId}/get-session-data`, {
        headers: {
          'Authorization': `Bearer ${env.DAILY_API_KEY}`
        }
      });

      if (!dailyResponse.ok) {
        return res.status(404).json({ error: "Room not found or no active session" });
      }

      const sessionData = await dailyResponse.json();
      res.json({ participants: sessionData.participants || [] });
    } catch (error) {
      console.error('[collaboration] get participants error:', error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  /**
   * Cursor Control State (WebSocket alternative via Ably)
   * POST /api/collaboration/rooms/:roomId/cursor
   * Real-time cursor sharing for collaborative editing
   */
  router.post("/rooms/:roomId/cursor", async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId, userName, x, y, action, documentId } = req.body;

    if (!userId || !userName || x === undefined || y === undefined) {
      return res.status(400).json({ 
        error: "userId, userName, x, and y are required" 
      });
    }

    try {
      // Publish cursor position via Ably for real-time sync
      // This allows participants to see each other's cursors
      await publishCursorUpdate(roomId, userId, userName, {
        x,
        y,
        action: action || 'move',
        documentId
      });

      res.json({ success: true });
    } catch (error) {
      console.error('[collaboration] cursor update error:', error);
      res.status(500).json({ error: "Failed to update cursor" });
    }
  });

  /**
   * Health check
   */
  router.get("/health", (_req: Request, res: Response) => {
    res.json({ 
      status: "ok",
      service: "collaboration",
      dailyConfigured: !!env.DAILY_API_KEY
    });
  });

  return router;
}

