import { Router, Request, Response } from "express";
import {
  listSessions as listAngryLipsSessions,
  getSession as getAngryLipsSession,
  listSessionParticipants,
  inviteParticipants as inviteToAngrySession,
  respondToInvitation as submitAngryResponse,
  startSession,
  advanceTurn,
  summarizeSession,
  generateAiStory as generateAngryStory,
  publishVaultEntry as publishAngryLipsEntry,
  listPublishedEntries as getAngryFeed,
  createSession as createAngryLipsSession,
  submitTurn as submitAngryLipsTurn,
  autoFillTurn as autoFillAngryLipsTurn,
  logTurnEvent as logAngryLipsTurnEvent,
  completeSession as completeAngryLipsSession,
} from "../angryLips/sessionRepository.js";
import { recordAuditEvent } from "../creative/auditRepository.js";
import { createTokenRequest as createRealtimeTokenRequest } from "../realtime/ablyPublisher.js";

export function createAngryLipsRouter(): Router {
  const router = Router();

  // Get all sessions
  router.get("/sessions", async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    if (limit > 100 || limit < 1) {
      return res.status(400).json({ error: "Limit must be between 1 and 100" });
    }
    try {
      const sessions = await listAngryLipsSessions({ limit });
      res.json({
        items: sessions,
        limit,
        offset,
        hasMore: sessions.length === limit,
      });
    } catch (error) {
      console.error("[api] get sessions error", error);
      res.status(500).json({ error: "Failed to load sessions" });
    }
  });

  // Get session by ID
  router.get("/sessions/:sessionId", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
      const session = await getAngryLipsSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("[api] get session error", error);
      res.status(500).json({ error: "Failed to load session" });
    }
  });

  // Get session participants
  router.get("/sessions/:sessionId/participants", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
      const participants = await listSessionParticipants(sessionId);
      res.json({ items: participants });
    } catch (error) {
      console.error("[api] get participants error", error);
      res.status(500).json({ error: "Failed to load participants" });
    }
  });

  // Invite to session
  router.post("/sessions/:sessionId/invite", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { userId, hostId } = req.body ?? {};
    if (!userId || !hostId) {
      return res.status(400).json({ error: "userId and hostId required" });
    }
    try {
      const participant = await inviteToAngrySession(sessionId, userId, hostId);
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: sessionId,
        action: "participant_invited",
        actorId: hostId,
        metadata: { userId },
      });
      res.json(participant);
    } catch (error) {
      console.error("[api] invite error", error);
      res.status(500).json({ error: "Failed to invite participant" });
    }
  });

  // Submit response
  router.post("/sessions/:sessionId/respond", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { userId, response } = req.body ?? {};
    if (!userId || !response) {
      return res.status(400).json({ error: "userId and response required" });
    }
    try {
      const result = await submitAngryResponse(sessionId, userId, response);
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: sessionId,
        action: "response_submitted",
        actorId: userId,
      });
      res.json(result);
    } catch (error) {
      console.error("[api] submit response error", error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  // Start session
  router.post("/sessions/:sessionId/start", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { hostId } = req.body ?? {};
    if (!hostId) {
      return res.status(400).json({ error: "hostId required" });
    }
    try {
      const session = await startSession(sessionId, hostId);
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: sessionId,
        action: "session_started",
        actorId: hostId,
      });
      res.json(session);
    } catch (error) {
      console.error("[api] start session error", error);
      res.status(500).json({ error: "Failed to start session" });
    }
  });

  // Advance turn
  router.post("/sessions/:sessionId/advance", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { hostId } = req.body ?? {};
    if (!hostId) {
      return res.status(400).json({ error: "hostId required" });
    }
    try {
      const session = await advanceTurn(sessionId, hostId);
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: sessionId,
        action: "turn_advanced",
        actorId: hostId,
      });
      res.json(session);
    } catch (error) {
      console.error("[api] advance turn error", error);
      res.status(500).json({ error: "Failed to advance turn" });
    }
  });

  // Summarize session
  router.post("/sessions/:sessionId/summarize", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { hostId, prompt = "default" } = req.body ?? {};
    try {
      const summary = await summarizeSession(sessionId, hostId, prompt);
      res.json(summary);
    } catch (error) {
      console.error("[api] summarize error", error);
      res.status(500).json({ error: "Failed to summarize session" });
    }
  });

  // Generate AI story
  router.post("/sessions/:sessionId/ai-story", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { hostId, prompt = "default" } = req.body ?? {};
    try {
      const story = await generateAngryStory(sessionId, hostId, prompt);
      res.json(story);
    } catch (error) {
      console.error("[api] generate story error", error);
      res.status(500).json({ error: "Failed to generate story" });
    }
  });

  // Publish story
  router.post("/sessions/:sessionId/publish", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { hostId, title, summary, story } = req.body ?? {};
    if (!hostId || !title) {
      return res.status(400).json({ error: "hostId and title required" });
    }
    try {
      await publishAngryLipsEntry(sessionId, hostId, "public");
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: sessionId,
        action: "story_published",
        actorId: hostId,
      });
      res.json({ published: true });
    } catch (error) {
      console.error("[api] publish error", error);
      res.status(500).json({ error: "Failed to publish story" });
    }
  });

  // Get feed
  router.get("/feed", async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    try {
      const feed = await getAngryFeed(limit, offset);
      res.json({ items: feed, limit, offset });
    } catch (error) {
      console.error("[api] get feed error", error);
      res.status(500).json({ error: "Failed to load feed" });
    }
  });

  // Create session
  router.post("/sessions", async (req: Request, res: Response) => {
    const { hostId, title, prompt1, prompt2, maxRounds = 5 } = req.body ?? {};
    const validatedMaxRounds = Math.min(Math.max(3, Number(maxRounds) || 5), 10);
    
    if (!hostId || !title || !prompt1 || !prompt2) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["hostId", "title", "prompt1", "prompt2"],
        optional: ["maxRounds (3-10, default 5)"],
      });
    }
    
    try {
      const session = await createAngryLipsSession({
        hostId,
        title: String(title).slice(0, 100),
        seedText: String(prompt1 || "").slice(0, 200),
      });
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: session.session.id,
        action: "session_created",
        actorId: hostId,
        metadata: { title },
      });
      res.status(201).json(session);
    } catch (error) {
      console.error("[api] create session error", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Submit turn
  router.post("/turns/:turnId/submit", async (req: Request, res: Response) => {
    const { turnId } = req.params;
    const { userId, lipReading } = req.body ?? {};
    if (!userId || !lipReading) {
      return res.status(400).json({ error: "userId and lipReading required" });
    }
    try {
      const turn = await submitAngryLipsTurn({ turnId, text: lipReading });
      await recordAuditEvent({
        entityType: "angry_turn",
        entityId: turnId,
        action: "turn_submitted",
        actorId: userId,
      });
      res.json(turn);
    } catch (error) {
      console.error("[api] submit turn error", error);
      res.status(500).json({ error: "Failed to submit turn" });
    }
  });

  // Auto-fill turn
  router.post("/turns/:turnId/auto-fill", async (req: Request, res: Response) => {
    const { turnId } = req.params;
    const { userId, model = "gpt-4o-mini" } = req.body ?? {};
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    try {
      const result = await autoFillAngryLipsTurn({ turnId, text: model });
      await recordAuditEvent({
        entityType: "angry_turn",
        entityId: turnId,
        action: "auto_fill_used",
        actorId: userId,
        metadata: { model },
      });
      res.json(result);
    } catch (error) {
      console.error("[api] auto-fill error", error);
      res.status(500).json({ error: "Failed to auto-fill" });
    }
  });

  // Record turn event
  router.post("/turns/:turnId/events", async (req: Request, res: Response) => {
    const { turnId } = req.params;
    const { userId, eventType, eventData } = req.body ?? {};
    if (!userId || !eventType) {
      return res.status(400).json({ error: "userId and eventType required" });
    }
    try {
      await logAngryLipsTurnEvent(turnId, eventType, eventData);
      res.json({ recorded: true });
    } catch (error) {
      console.error("[api] record event error", error);
      res.status(500).json({ error: "Failed to record event" });
    }
  });

  // Complete session
  router.post("/sessions/:sessionId/complete", async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { hostId, endReason = "completed" } = req.body ?? {};
    if (!hostId) {
      return res.status(400).json({ error: "hostId required" });
    }
    try {
      const session = await completeAngryLipsSession({ sessionId, storyText: endReason || "" });
      await recordAuditEvent({
        entityType: "angry_session",
        entityId: sessionId,
        action: "session_completed",
        actorId: hostId,
        metadata: { endReason },
      });
      res.json(session);
    } catch (error) {
      console.error("[api] complete session error", error);
      res.status(500).json({ error: "Failed to complete session" });
    }
  });

  // Get realtime token
  router.get("/realtime/token", async (req: Request, res: Response) => {
    const { userId, sessionId } = req.query;
    if (!userId || !sessionId || typeof userId !== "string" || typeof sessionId !== "string") {
      return res.status(400).json({ error: "userId and sessionId required" });
    }
    try {
      const token = await createRealtimeTokenRequest(userId);
      res.json({ token });
    } catch (error) {
      console.error("[api] get token error", error);
      res.status(500).json({ error: "Failed to get token" });
    }
  });

  return router;
}
