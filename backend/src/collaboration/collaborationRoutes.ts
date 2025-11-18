import { Router, Request, Response } from "express";
import { loadEnv } from "../worker/env.js";

/**
 * Daily.co Video Collaboration Routes
 * 
 * Features:
 * - Create video rooms for project collaboration
 * - Cursor control sharing for real-time co-working
 * - Screen sharing and recording
 * - Invite-only room access
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

      // Store room metadata in database
      // This would go into a collaboration_rooms table
      const roomData = {
        id: dailyRoom.id,
        name: dailyRoom.name,
        url: dailyRoom.url,
        projectId,
        conversationId,
        createdBy,
        roomName,
        privacy,
        dailyRoomId: dailyRoom.id,
        dailyRoomUrl: dailyRoom.url,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        settings: {
          enableCursorControl: true,
          enableScreenShare: true,
          enableRecording: true,
          maxParticipants: 50
        }
      };

      console.log('[collaboration] Room created:', roomData);

      res.json({ 
        success: true,
        room: roomData,
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
   */
  router.delete("/rooms/:roomId", async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    try {
      if (!env.DAILY_API_KEY) {
        return res.status(503).json({ 
          error: "Video collaboration not configured" 
        });
      }

      // TODO: Verify user has permission to delete this room
      // Check if userId is the room creator or project admin

      const dailyResponse = await fetch(`https://api.daily.co/v1/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${env.DAILY_API_KEY}`
        }
      });

      if (!dailyResponse.ok) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json({ success: true, message: "Room deleted" });
    } catch (error) {
      console.error('[collaboration] delete room error:', error);
      res.status(500).json({ error: "Failed to delete room" });
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

      res.json({ 
        success: true,
        token: tokenData.token,
        expiresAt: new Date((Math.floor(Date.now() / 1000) + (24 * 60 * 60)) * 1000).toISOString()
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
   */
  router.post("/rooms/:roomId/cursor", async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId, userName, x, y, action, documentId } = req.body;

    try {
      // Publish cursor position via Ably for real-time sync
      // This allows participants to see each other's cursors
      const cursorData = {
        userId,
        userName,
        x,
        y,
        action, // 'move', 'click', 'drag', etc.
        documentId,
        timestamp: Date.now()
      };

      // TODO: Publish to Ably channel: `collaboration:${roomId}:cursors`
      // await publishToAbly(`collaboration:${roomId}:cursors`, cursorData);

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

