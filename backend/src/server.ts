import express, { type Request, type Response } from "express";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimit.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { maskRegistry } from "./masks/registry.js";
import { capture } from "./worker/analytics.js";
import type { ActivateMaskInput } from "./masks/types.js";
import { loadEnv } from "./worker/env.js";
import { generateProfessorCritique } from "./masks/professorService.js";
import { fetchProfessorCritiques } from "./masks/professorRepository.js";
import { getSampleTimeline } from "./story/sampleTimeline.js";
import {
  getTimeline,
  getChapters,
  addChapter,
  updateChapter,
  removeChapter,
  getStoryNodes,
  saveStoryNodes,
  getStoryComments,
  addStoryComment,
  deleteStoryComment,
  getWorldLore,
  type StoryNode,
} from "./story/storyRepository.js";
import { logStoryNotification, fetchStoryNotifications } from "./story/notificationRepository.js";
import {
  createSession as createAngryLipsSession,
  getSession as getAngryLipsSession,
  listSessions as listAngryLipsSessions,
  submitTurn as submitAngryLipsTurn,
  autoFillTurn as autoFillAngryLipsTurn,
  logTurnEvent as logAngryLipsTurnEvent,
  completeSession as completeAngryLipsSession,
  inviteParticipants as inviteAngryLipsParticipants,
  respondToInvitation as respondAngryLipsInvitation,
  listSessionParticipants as listAngryLipsParticipants,
  startSession as startAngryLipsSession,
  advanceTurn as advanceAngryLipsTurn,
  summarizeSession as summarizeAngryLipsSession,
  generateAiStory as generateAngryLipsStory,
  publishVaultEntry as publishAngryLipsEntry,
  listPublishedEntries as listAngryLipsPublishedEntries,
} from "./angryLips/sessionRepository.js";
import { createTokenRequest as createRealtimeTokenRequest } from "./realtime/ablyPublisher.js";
import { createStoryRouter } from "./creative/storyRoutes.js";
import { createCharacterRouter } from "./creative/characterRoutes.js";
import { recordAuditEvent, enqueueCoherenceEvent } from "./creative/auditRepository.js";
import { runCreativeCompletion } from "./creative/aiClient.js";
import { createSocialRouter } from "./social/socialRoutes.js";
import { listStreamEvents } from "./feed/feedRepository.js";
import { createMythacoinRouter } from "./mythacoin/mythacoinRoutes.js";
import { createFeedRouter } from "./feed/feedRoutes.js";
import { createMessagingRouter } from "./messaging/messagingRoutes.js";
import { createDasRouter } from "./das/dasRoutes.js";
import { createFeedbackRouter } from "./feedback/feedbackRoutes.js";
import { createCreativeEnginesRouter } from "./creative/creativeEnginesRoutes.js";
import betaRouter from "./beta/betaRoutes.js";
import sparksRouter from "./sparks/sparksRoutes.js";

/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 * 
 * MythaTron™ is a trademark of Cronk Companies, LLC.
 * This application is 100% founded and built by Cronk Companies, LLC.
 * 
 * Unauthorized copying, modification, or distribution of this code
 * is strictly prohibited and will be prosecuted to the fullest extent of the law.
 * 
 * For licensing inquiries: mythatron@proton.me
 */

const env = loadEnv();
const app = express();

// Configure CORS with security best practices
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS?.split(',') || process.env.CORS_ORIGIN?.split(',') || ['https://fieldforge.vercel.app']).filter(Boolean)
    : true, // Allow all origins in development
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware (order matters - apply early)
app.use(requestIdMiddleware); // Add request ID for tracing
app.use(securityHeaders); // Set security headers
app.use(requestLogger); // Log all requests

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint (no auth required)
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "mythatron-api", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/creative/story", createStoryRouter());
app.use("/api/creative/characters", createCharacterRouter());
app.use("/api/social", createSocialRouter());
app.use("/api/mythacoin", createMythacoinRouter());
app.use("/api/feed", createFeedRouter());
app.use("/api/messaging", createMessagingRouter());
app.use("/api/das", createDasRouter());
app.use("/api/feedback", createFeedbackRouter());
app.use("/api/creative/engines", createCreativeEnginesRouter());
app.use("/api/beta", betaRouter);
app.use("/api/sparks", sparksRouter);

app.get("/api/feed/stream", async (req: Request, res: Response) => {
  const limit = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const offset = typeof req.query.offset === "string" ? Number.parseInt(req.query.offset, 10) : undefined;

  try {
    const events = await listStreamEvents(
      Number.isFinite(limit) ? limit! : 20,
      Number.isFinite(offset) ? offset! : 0
    );
    res.json({ items: events });
  } catch (error) {
    console.error("[api] feed stream", error);
    res.status(500).json({ error: "Failed to load feed" });
  }
});

app.post("/api/masks/activate", async (req: Request, res: Response) => {
  try {
    const input = req.body as ActivateMaskInput;
    if (!input?.maskId) {
      return res.status(400).json({ error: "maskId is required" });
    }

    const session = await maskRegistry.activateMask(input);

    await capture(
      {
        event: "mask_session_started",
        properties: {
          mask_id: session.maskId,
          mask_version: session.maskVersion,
          session_id: session.sessionId,
          blend_masks: session.blendMasks,
          user_id: session.userId,
          project_id: session.projectId,
        },
      },
      env.POSTHOG_API_KEY
    );

    res.status(201).json(session);
  } catch (error) {
    console.error("[api] activate error", error);
    res.status(500).json({ error: "Failed to activate mask" });
  }
});

app.post("/api/masks/sessions/:sessionId/end", async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    await maskRegistry.endSession(sessionId, req.body?.reason);

    await capture(
      {
        event: "mask_session_ended",
        properties: {
          session_id: sessionId,
          reason: req.body?.reason ?? null,
        },
      },
      env.POSTHOG_API_KEY
    );

    res.status(204).send();
  } catch (error) {
    console.error("[api] end session error", error);
    res.status(500).json({ error: "Failed to end mask session" });
  }
});

app.post("/api/professor/critique", async (req: Request, res: Response) => {
  const { content, mode, objectType, userId, projectId, customTone, storyId } = req.body ?? {};
  try {
    const critique = await generateProfessorCritique({
      content,
      mode,
      objectType,
      userId,
      projectId,
      customTone,
      storyId,
    });

    res.status(200).json(critique);
  } catch (error) {
    console.error("[api] professor critique error", error);
    if (error instanceof Error && error.message.includes("content is required")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to generate critique" });
    }
  }
});

app.get("/api/professor/critique/history", async (req: Request, res: Response) => {
  const { storyId, userId, limit, offset } = req.query;

  if (!storyId && !userId) {
    return res.status(400).json({ error: "Provide at least storyId or userId" });
  }

  try {
    const history = await fetchProfessorCritiques({
      storyId: typeof storyId === "string" ? storyId : undefined,
      userId: typeof userId === "string" ? userId : undefined,
      limit: typeof limit === "string" ? Number(limit) : undefined,
      offset: typeof offset === "string" ? Number(offset) : undefined,
    });

    res.json({ items: history });
  } catch (error) {
    console.error("[api] professor critique history error", error);
    res.status(500).json({ error: "Failed to fetch critique history" });
  }
});

app.get("/api/story/timeline", (req: Request, res: Response) => {
  const worldId = typeof req.query.worldId === "string" ? req.query.worldId : "city-of-thousand-codes";
  getTimeline(worldId)
    .then((timeline) => {
      if (timeline.length === 0) {
        res.json({ worldId, items: getSampleTimeline(worldId) });
      } else {
        res.json({ worldId, items: timeline });
      }
    })
    .catch((error) => {
      console.error("[api] timeline error", error);
      res.json({ worldId, items: getSampleTimeline(worldId) });
    });
});

app.get("/api/story/chapters", async (req: Request, res: Response) => {
  const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
  if (!branchId) {
    return res.status(400).json({ error: "branchId is required" });
  }
  try {
    const chapters = await getChapters(branchId);
    res.json({ items: chapters });
  } catch (error) {
    console.error("[api] get chapters error", error);
    res.status(500).json({ error: "Failed to load chapters" });
  }
});

app.post("/api/story/chapters", async (req: Request, res: Response) => {
  const { branchId, title, actorId } = req.body ?? {};
  if (!branchId || !title) {
    return res.status(400).json({ error: "branchId and title required" });
  }
  try {
    const chapter = await addChapter(branchId, title);
    logStoryNotification("chapter_added", { branchId, chapterId: chapter.id, title: chapter.title });
    await recordAuditEvent({
      entityType: "story_branch",
      entityId: branchId,
      action: "chapter_added",
      actorId,
      metadata: { chapterId: chapter.id, title },
    });
    res.status(201).json(chapter);
  } catch (error) {
    console.error("[api] add chapter error", error);
    res.status(500).json({ error: "Failed to add chapter" });
  }
});

app.patch("/api/story/chapters/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid chapter id" });
  }
  try {
    await updateChapter(id, { title: req.body?.title, status: req.body?.status });
    logStoryNotification("chapter_updated", { chapterId: id, patch: req.body });
    await recordAuditEvent({
      entityType: "story_chapter",
      entityId: String(id),
      action: "chapter_updated",
      actorId: req.body?.actorId,
      metadata: { updates: req.body },
    });
    res.status(204).send();
  } catch (error) {
    console.error("[api] update chapter error", error);
    res.status(500).json({ error: "Failed to update chapter" });
  }
});

app.delete("/api/story/chapters/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid chapter id" });
  }
  try {
    await removeChapter(id);
    logStoryNotification("chapter_removed", { chapterId: id });
    await recordAuditEvent({
      entityType: "story_chapter",
      entityId: String(id),
      action: "chapter_removed",
      actorId: req.query.actorId as string | undefined,
    });
    res.status(204).send();
  } catch (error) {
    console.error("[api] remove chapter error", error);
    res.status(500).json({ error: "Failed to remove chapter" });
  }
});

app.get("/api/story/editor", async (req: Request, res: Response) => {
  const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
  if (!branchId) {
    return res.status(400).json({ error: "branchId is required" });
  }
  try {
    const nodes = await getStoryNodes(branchId);
    res.json({ branchId, nodes });
  } catch (error) {
    console.error("[api] editor fetch error", error);
    res.status(500).json({ error: "Failed to load story content" });
  }
});

app.post("/api/story/editor", async (req: Request, res: Response) => {
  const { branchId, nodes, actorId } = req.body ?? {};
  if (!branchId || !Array.isArray(nodes)) {
    return res.status(400).json({ error: "branchId and nodes required" });
  }
  try {
    await saveStoryNodes(
      branchId,
      nodes.map((node: Partial<StoryNode> & { id?: number; orderIndex?: number; content?: string }, index: number) => ({
        id: typeof node.id === "number" && node.id > 0 ? node.id : undefined,
        orderIndex:
          typeof node.orderIndex === "number" && Number.isFinite(node.orderIndex)
            ? node.orderIndex
            : index,
        content: String(node.content ?? ""),
      }))
    );
    logStoryNotification("story_saved", { branchId, nodeCount: nodes.length });
    await recordAuditEvent({
      entityType: "story_branch",
      entityId: branchId,
      action: "story_saved",
      actorId,
      metadata: { nodeCount: nodes.length },
    });
    await enqueueCoherenceEvent({
      entityType: "story_branch",
      entityId: branchId,
      scope: "story_content",
      payload: { nodeCount: nodes.length },
    });
    res.status(204).send();
  } catch (error) {
    console.error("[api] editor save error", error);
    res.status(500).json({ error: "Failed to save story content" });
  }
});

app.post("/api/story/ai-action", async (req: Request, res: Response) => {
  const { mode, content, persona } = req.body ?? {};
  const safeMode = typeof mode === "string" ? mode : "continue";
  const personaId = typeof persona === "string" ? persona : "general";
  const snippet = typeof content === "string" ? content.slice(-2000) : "";
  try {
    const response = await generateAiAction(safeMode, personaId, snippet);
    logStoryNotification("ai_action_run", { mode: safeMode, persona: personaId });
    res.json(response);
  } catch (error) {
    console.error("[api] ai action error", error);
    res.status(503).json({ error: "AI service unavailable" });
  }
});

app.get("/api/story/comments", async (req: Request, res: Response) => {
  const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
  if (!branchId) {
    return res.status(400).json({ error: "branchId is required" });
  }
  try {
    const comments = await getStoryComments(branchId);
    res.json({ items: comments });
  } catch (error) {
    console.error("[api] get comments error", error);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

app.post("/api/story/comments", async (req: Request, res: Response) => {
  const { branchId, nodeId, body, authorId } = req.body ?? {};
  if (!branchId || typeof nodeId !== "number" || !body) {
    return res.status(400).json({ error: "branchId, nodeId and body required" });
  }
  try {
    const comment = await addStoryComment(branchId, nodeId, body, authorId);
    logStoryNotification("comment_added", { branchId, nodeId, commentId: comment.id });
    await recordAuditEvent({
      entityType: "story_branch",
      entityId: branchId,
      action: "comment_added",
      actorId: authorId,
      metadata: { nodeId, commentId: comment.id },
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error("[api] add comment error", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.delete("/api/story/comments/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid comment id" });
  }
  try {
    await deleteStoryComment(id);
    logStoryNotification("comment_removed", { commentId: id });
    await recordAuditEvent({
      entityType: "story_comment",
      entityId: String(id),
      action: "comment_removed",
      actorId: req.query.actorId as string | undefined,
    });
    res.status(204).send();
  } catch (error) {
    console.error("[api] delete comment error", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

app.get("/api/story/lore", async (req: Request, res: Response) => {
  const worldId = typeof req.query.worldId === "string" ? req.query.worldId : "city-of-thousand-codes";
  try {
    const lore = await getWorldLore(worldId);
    res.json({ worldId, items: lore });
  } catch (error) {
    console.error("[api] lore error", error);
    res.status(500).json({ error: "Failed to load lore" });
  }
});

app.get("/api/story/notifications", async (req: Request, res: Response) => {
  try {
    const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam ?? 20, 1), 100) : 20;
    const notifications = await fetchStoryNotifications(limit);
    res.json({ items: notifications });
  } catch (error) {
    console.error("[api] notifications error", error);
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

app.get("/api/angry-lips/sessions", async (req: Request, res: Response) => {
  try {
    const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const statusParam = typeof req.query.status === "string" ? req.query.status : undefined;
    const userIdParam = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const sessions = await listAngryLipsSessions({
      status: statusParam,
      limit: Number.isFinite(limitParam) ? limitParam : undefined,
      userId: userIdParam,
    });
    res.json({ items: sessions });
  } catch (error) {
    console.error("[api] angry lips list sessions", error);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

app.get("/api/angry-lips/sessions/:sessionId", async (req: Request, res: Response) => {
  try {
    const session = await getAngryLipsSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  } catch (error) {
    console.error("[api] angry lips get session", error);
    res.status(500).json({ error: "Failed to load session" });
  }
});

app.get("/api/angry-lips/sessions/:sessionId/participants", async (req: Request, res: Response) => {
  try {
    const participants = await listAngryLipsParticipants(req.params.sessionId);
    res.json({ items: participants });
  } catch (error) {
    console.error("[api] angry lips list participants", error);
    res.status(500).json({ error: "Failed to load participants" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/invite", async (req: Request, res: Response) => {
  const { hostId, participantIds } = req.body ?? {};
  if (!hostId || !Array.isArray(participantIds)) {
    return res.status(400).json({ error: "hostId and participantIds are required" });
  }
  try {
    const participants = await inviteAngryLipsParticipants(
      req.params.sessionId,
      hostId,
      participantIds.filter((id: unknown): id is string => typeof id === "string")
    );
    res.status(201).json({ items: participants });
  } catch (error) {
    console.error("[api] angry lips invite participants", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to invite participants" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/respond", async (req: Request, res: Response) => {
  const { userId, action } = req.body ?? {};
  if (!userId || typeof action !== "string") {
    return res.status(400).json({ error: "userId and action are required" });
  }
  if (!["accept", "decline", "left"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }
  try {
    const participant = await respondAngryLipsInvitation(req.params.sessionId, userId, action as "accept" | "decline" | "left");
    if (!participant) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    res.json({ participant });
  } catch (error) {
    console.error("[api] angry lips respond invitation", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to update invitation" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/start", async (req: Request, res: Response) => {
  const { hostId } = req.body ?? {};
  if (!hostId) {
    return res.status(400).json({ error: "hostId is required" });
  }
  try {
    const session = await startAngryLipsSession(req.params.sessionId, hostId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  } catch (error) {
    console.error("[api] angry lips start session", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to start session" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/advance", async (req: Request, res: Response) => {
  const { hostId } = req.body ?? {};
  if (!hostId) {
    return res.status(400).json({ error: "hostId is required" });
  }
  try {
    const session = await advanceAngryLipsTurn(req.params.sessionId, hostId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  } catch (error) {
    console.error("[api] angry lips advance turn", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to advance turn" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/summarize", async (req: Request, res: Response) => {
  const { userId, focus } = req.body ?? {};
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  try {
    const entry = await summarizeAngryLipsSession(req.params.sessionId, userId, typeof focus === "string" ? focus : undefined);
    res.json({ entry, summary: entry.summaryText });
  } catch (error) {
    console.error("[api] angry lips summarize", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to summarize session" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/ai-story", async (req: Request, res: Response) => {
  const { hostId, prompt } = req.body ?? {};
  if (!hostId) {
    return res.status(400).json({ error: "hostId is required" });
  }
  try {
    const entry = await generateAngryLipsStory(req.params.sessionId, hostId, typeof prompt === "string" ? prompt : undefined);
    res.json({ entry, story: entry.aiStoryText });
  } catch (error) {
    console.error("[api] angry lips ai story", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to generate AI story" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/publish", async (req: Request, res: Response) => {
  const { hostId, visibility } = req.body ?? {};
  if (!hostId) {
    return res.status(400).json({ error: "hostId is required" });
  }
  try {
    const entry = await publishAngryLipsEntry(
      req.params.sessionId,
      hostId,
      typeof visibility === "string" ? (visibility as "invite_only" | "public" | "locked") : "public"
    );
    res.json({ entry });
  } catch (error) {
    console.error("[api] angry lips publish", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to update visibility" });
  }
});

app.get("/api/angry-lips/feed", async (req: Request, res: Response) => {
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
  try {
    const items = await listAngryLipsPublishedEntries(limit, offset);
    res.json({ items });
  } catch (error) {
    console.error("[api] angry lips feed", error);
    res.status(500).json({ error: "Failed to load public feed" });
  }
});

app.post("/api/angry-lips/sessions", async (req: Request, res: Response) => {
  const {
    hostId,
    title,
    genre,
    templateSource,
    templateLength,
    seedText,
    responseWindowMinutes,
    allowAiCohost,
    vaultMode,
    participants,
    participantIds: participantIdsFromBody,
  } = req.body ?? {};

  const rawParticipantIds = Array.isArray(participantIdsFromBody)
    ? participantIdsFromBody
    : Array.isArray(participants)
    ? participants
    : [];
  const participantIds = rawParticipantIds.filter((value: unknown): value is string => typeof value === "string");

  try {
    const result = await createAngryLipsSession({
      hostId,
      title,
      genre,
      templateSource,
      templateLength,
      seedText,
      responseWindowMinutes,
      allowAiCohost,
      vaultMode,
      participantIds,
    });

    await capture(
      {
        event: "angrylips_session_created",
        properties: {
          session_id: result.session.id,
          template_source: result.session.templateSource,
          template_length: result.session.templateLength,
          blank_count: result.template.blanks.length,
        },
      },
      env.POSTHOG_API_KEY
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("[api] angry lips create session", error);
    res.status(500).json({ error: (error as Error).message ?? "Failed to create session" });
  }
});

app.post("/api/angry-lips/turns/:turnId/submit", async (req: Request, res: Response) => {
  const { text, handle } = req.body ?? {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const turn = await submitAngryLipsTurn({ turnId: req.params.turnId, text, handle });
    if (!turn) {
      return res.status(404).json({ error: "Turn not found" });
    }
    res.json({ turn });
  } catch (error) {
    console.error("[api] angry lips submit turn", error);
    res.status(500).json({ error: "Failed to submit turn" });
  }
});

app.post("/api/angry-lips/turns/:turnId/auto-fill", async (req: Request, res: Response) => {
  const { text, handle } = req.body ?? {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const turn = await autoFillAngryLipsTurn({ turnId: req.params.turnId, text, handle });
    if (!turn) {
      return res.status(404).json({ error: "Turn not found" });
    }
    res.json({ turn });
  } catch (error) {
    console.error("[api] angry lips auto-fill", error);
    res.status(500).json({ error: "Failed to auto-fill turn" });
  }
});

app.post("/api/angry-lips/turns/:turnId/events", async (req: Request, res: Response) => {
  const { eventType, payload } = req.body ?? {};
  if (!eventType || typeof eventType !== "string") {
    return res.status(400).json({ error: "eventType is required" });
  }

  try {
    await logAngryLipsTurnEvent(req.params.turnId, eventType, payload ?? {});
    res.status(204).send();
  } catch (error) {
    console.error("[api] angry lips log event", error);
    res.status(500).json({ error: "Failed to log turn event" });
  }
});

app.post("/api/angry-lips/sessions/:sessionId/complete", async (req: Request, res: Response) => {
  const { storyText, title, visibility } = req.body ?? {};
  if (!storyText || typeof storyText !== "string") {
    return res.status(400).json({ error: "storyText is required" });
  }

  try {
    const vaultEntry = await completeAngryLipsSession({
      sessionId: req.params.sessionId,
      storyText,
      title,
      visibility,
    });
    res.json({ vaultEntry });
  } catch (error) {
    console.error("[api] angry lips complete session", error);
    res.status(500).json({ error: "Failed to complete session" });
  }
});

app.get("/api/angry-lips/realtime/token", async (req: Request, res: Response) => {
  try {
    const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
    const tokenRequest = await createRealtimeTokenRequest(clientId);
    res.json(tokenRequest);
  } catch (error) {
    console.error("[api] angry lips token request", error);
    res.status(503).json({ error: "Realtime service unavailable" });
  }
});

// Error handling middleware (must be last)
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all errors

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`[mythatron-api] listening on port ${port}`);
  console.log(`[mythatron-api] environment: ${process.env.NODE_ENV || 'development'}`);
});

async function generateAiAction(mode: string, persona: string, snippet: string) {
  const personaDescriptor =
    persona === "narrator"
      ? "a visionary narrator weaving cinematic transitions that maintain continuity"
      : persona === "character"
      ? "the character whose perspective drives the story, matching their voice and motives"
      : "a collaborative writer helping continue the scene";

  try {
    if (mode === "muse") {
      const { content } = await runCreativeCompletion({
        messages: [
          {
            role: "system",
            content:
              "You generate creative prompts for storytellers. Always respond in JSON with shape {\"prompts\":[\"idea 1\",\"idea 2\",...]} and nothing else.",
          },
          {
            role: "user",
            content: `Provide three surprising prompts that could evolve this story beat:\n\n${snippet}`,
          },
        ],
        temperature: 0.85,
      });
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.prompts) && parsed.prompts.length) {
          return { mode, persona, prompts: parsed.prompts };
        }
      } catch {
        // fall through to heuristic parsing below
      }
      const prompts = content
        .split("\n")
        .map((line: string) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
      return { mode, persona, prompts: prompts.length ? prompts : [content.trim()] };
    }

    if (mode === "critique") {
      const { content } = await runCreativeCompletion({
        messages: [
          {
            role: "system",
            content:
              "You critique story drafts. Always respond in JSON with shape {\"notes\":[\"point 1\",\"point 2\",...]} and nothing else.",
          },
          {
            role: "user",
            content: `Give clear, actionable critique for the excerpt below:\n\n${snippet}`,
          },
        ],
        temperature: 0.4,
      });
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.notes) && parsed.notes.length) {
          return { mode, persona, notes: parsed.notes };
        }
      } catch {
        // fall through to heuristic parsing below
      }
      const notes = content
        .split("\n")
        .map((line: string) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
      return { mode, persona, notes: notes.length ? notes : [content.trim()] };
    }

    const userPrompt =
      mode === "rewrite"
        ? `Rewrite the excerpt below, keeping the author's voice while tightening the prose and increasing urgency.\n\n${snippet}`
        : `Continue the story below with the next beat, preserving tone, stakes, and pacing.\n\n${snippet}`;

    const { content, model } = await runCreativeCompletion({
      messages: [
        {
          role: "system",
          content: `You are ${personaDescriptor}. Honor established continuity, avoid contradictions, and keep the response focused.`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: mode === "rewrite" ? 0.6 : 0.9,
    });

    return {
      mode,
      persona,
      model,
      content: content.trim(),
    };
  } catch (error) {
    console.warn("[ai] falling back to heuristic generation", error);
    if (persona === "narrator") {
      return {
        mode,
        persona,
        content: `${snippet}\n\n[Narrator] The skyline hums as the aurora core shifts the stakes.`,
      };
    }
    if (persona === "character") {
      return {
        mode,
        persona,
        content: `${snippet}\n\n"I'll rewrite destinies myself," the protagonist mutters, pulse synced with the aurora.`,
      };
    }
    if (mode === "muse") {
      return {
        mode,
        persona,
        prompts: [
          "Introduce a rival crew secretly funded by the same client.",
          "Reveal that the aurora core is rewriting the crew's memories.",
          "Cut to a city-wide broadcast reacting in real time.",
        ],
      };
    }
    if (mode === "critique") {
      return {
        mode,
        persona,
        notes: ["Highlight the antagonist sooner", "Clarify the hijack stakes"],
      };
    }
    return {
      mode,
      persona,
      content: `${snippet}\n\nAnd the city answers with an encrypted beacon begging to be chased.`,
    };
  }
}

