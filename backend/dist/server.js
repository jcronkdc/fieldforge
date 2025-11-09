"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const registry_js_1 = require("./masks/registry.js");
const analytics_js_1 = require("./worker/analytics.js");
const env_js_1 = require("./worker/env.js");
const professorService_js_1 = require("./masks/professorService.js");
const professorRepository_js_1 = require("./masks/professorRepository.js");
const sampleTimeline_js_1 = require("./story/sampleTimeline.js");
const storyRepository_js_1 = require("./story/storyRepository.js");
const notificationRepository_js_1 = require("./story/notificationRepository.js");
const sessionRepository_js_1 = require("./angryLips/sessionRepository.js");
const ablyPublisher_js_1 = require("./realtime/ablyPublisher.js");
const storyRoutes_js_1 = require("./creative/storyRoutes.js");
const characterRoutes_js_1 = require("./creative/characterRoutes.js");
const auditRepository_js_1 = require("./creative/auditRepository.js");
const aiClient_js_1 = require("./creative/aiClient.js");
const socialRoutes_js_1 = require("./social/socialRoutes.js");
const feedRepository_js_1 = require("./feed/feedRepository.js");
const mythacoinRoutes_js_1 = require("./mythacoin/mythacoinRoutes.js");
const feedRoutes_js_1 = require("./feed/feedRoutes.js");
const messagingRoutes_js_1 = require("./messaging/messagingRoutes.js");
const dasRoutes_js_1 = require("./das/dasRoutes.js");
const feedbackRoutes_js_1 = require("./feedback/feedbackRoutes.js");
const creativeEnginesRoutes_js_1 = require("./creative/creativeEnginesRoutes.js");
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
const env = (0, env_js_1.loadEnv)();
const app = (0, express_1.default)();
// Configure CORS with security best practices
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://mythatron.com']
        : true,
    credentials: true,
    maxAge: 86400, // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint (no auth required)
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "mythatron-api", timestamp: new Date().toISOString() });
});
// API routes
app.use("/api/creative/story", (0, storyRoutes_js_1.createStoryRouter)());
app.use("/api/creative/characters", (0, characterRoutes_js_1.createCharacterRouter)());
app.use("/api/social", (0, socialRoutes_js_1.createSocialRouter)());
app.use("/api/mythacoin", (0, mythacoinRoutes_js_1.createMythacoinRouter)());
app.use("/api/feed", (0, feedRoutes_js_1.createFeedRouter)());
app.use("/api/messaging", (0, messagingRoutes_js_1.createMessagingRouter)());
app.use("/api/das", (0, dasRoutes_js_1.createDasRouter)());
app.use("/api/feedback", (0, feedbackRoutes_js_1.createFeedbackRouter)());
app.use("/api/creative/engines", (0, creativeEnginesRoutes_js_1.createCreativeEnginesRouter)());
app.get("/api/feed/stream", async (req, res) => {
    const limit = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
    const offset = typeof req.query.offset === "string" ? Number.parseInt(req.query.offset, 10) : undefined;
    try {
        const events = await (0, feedRepository_js_1.listStreamEvents)(Number.isFinite(limit) ? limit : 20, Number.isFinite(offset) ? offset : 0);
        res.json({ items: events });
    }
    catch (error) {
        console.error("[api] feed stream", error);
        res.status(500).json({ error: "Failed to load feed" });
    }
});
app.post("/api/masks/activate", async (req, res) => {
    try {
        const input = req.body;
        if (!input?.maskId) {
            return res.status(400).json({ error: "maskId is required" });
        }
        const session = await registry_js_1.maskRegistry.activateMask(input);
        await (0, analytics_js_1.capture)({
            event: "mask_session_started",
            properties: {
                mask_id: session.maskId,
                mask_version: session.maskVersion,
                session_id: session.sessionId,
                blend_masks: session.blendMasks,
                user_id: session.userId,
                project_id: session.projectId,
            },
        }, env.POSTHOG_API_KEY);
        res.status(201).json(session);
    }
    catch (error) {
        console.error("[api] activate error", error);
        res.status(500).json({ error: "Failed to activate mask" });
    }
});
app.post("/api/masks/sessions/:sessionId/end", async (req, res) => {
    const { sessionId } = req.params;
    try {
        await registry_js_1.maskRegistry.endSession(sessionId, req.body?.reason);
        await (0, analytics_js_1.capture)({
            event: "mask_session_ended",
            properties: {
                session_id: sessionId,
                reason: req.body?.reason ?? null,
            },
        }, env.POSTHOG_API_KEY);
        res.status(204).send();
    }
    catch (error) {
        console.error("[api] end session error", error);
        res.status(500).json({ error: "Failed to end mask session" });
    }
});
app.post("/api/professor/critique", async (req, res) => {
    const { content, mode, objectType, userId, projectId, customTone, storyId } = req.body ?? {};
    try {
        const critique = await (0, professorService_js_1.generateProfessorCritique)({
            content,
            mode,
            objectType,
            userId,
            projectId,
            customTone,
            storyId,
        });
        res.status(200).json(critique);
    }
    catch (error) {
        console.error("[api] professor critique error", error);
        if (error instanceof Error && error.message.includes("content is required")) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to generate critique" });
        }
    }
});
app.get("/api/professor/critique/history", async (req, res) => {
    const { storyId, userId, limit, offset } = req.query;
    if (!storyId && !userId) {
        return res.status(400).json({ error: "Provide at least storyId or userId" });
    }
    try {
        const history = await (0, professorRepository_js_1.fetchProfessorCritiques)({
            storyId: typeof storyId === "string" ? storyId : undefined,
            userId: typeof userId === "string" ? userId : undefined,
            limit: typeof limit === "string" ? Number(limit) : undefined,
            offset: typeof offset === "string" ? Number(offset) : undefined,
        });
        res.json({ items: history });
    }
    catch (error) {
        console.error("[api] professor critique history error", error);
        res.status(500).json({ error: "Failed to fetch critique history" });
    }
});
app.get("/api/story/timeline", (req, res) => {
    const worldId = typeof req.query.worldId === "string" ? req.query.worldId : "city-of-thousand-codes";
    (0, storyRepository_js_1.getTimeline)(worldId)
        .then((timeline) => {
        if (timeline.length === 0) {
            res.json({ worldId, items: (0, sampleTimeline_js_1.getSampleTimeline)(worldId) });
        }
        else {
            res.json({ worldId, items: timeline });
        }
    })
        .catch((error) => {
        console.error("[api] timeline error", error);
        res.json({ worldId, items: (0, sampleTimeline_js_1.getSampleTimeline)(worldId) });
    });
});
app.get("/api/story/chapters", async (req, res) => {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    if (!branchId) {
        return res.status(400).json({ error: "branchId is required" });
    }
    try {
        const chapters = await (0, storyRepository_js_1.getChapters)(branchId);
        res.json({ items: chapters });
    }
    catch (error) {
        console.error("[api] get chapters error", error);
        res.status(500).json({ error: "Failed to load chapters" });
    }
});
app.post("/api/story/chapters", async (req, res) => {
    const { branchId, title, actorId } = req.body ?? {};
    if (!branchId || !title) {
        return res.status(400).json({ error: "branchId and title required" });
    }
    try {
        const chapter = await (0, storyRepository_js_1.addChapter)(branchId, title);
        (0, notificationRepository_js_1.logStoryNotification)("chapter_added", { branchId, chapterId: chapter.id, title: chapter.title });
        await (0, auditRepository_js_1.recordAuditEvent)({
            entityType: "story_branch",
            entityId: branchId,
            action: "chapter_added",
            actorId,
            metadata: { chapterId: chapter.id, title },
        });
        res.status(201).json(chapter);
    }
    catch (error) {
        console.error("[api] add chapter error", error);
        res.status(500).json({ error: "Failed to add chapter" });
    }
});
app.patch("/api/story/chapters/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: "Invalid chapter id" });
    }
    try {
        await (0, storyRepository_js_1.updateChapter)(id, { title: req.body?.title, status: req.body?.status });
        (0, notificationRepository_js_1.logStoryNotification)("chapter_updated", { chapterId: id, patch: req.body });
        await (0, auditRepository_js_1.recordAuditEvent)({
            entityType: "story_chapter",
            entityId: String(id),
            action: "chapter_updated",
            actorId: req.body?.actorId,
            metadata: { updates: req.body },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("[api] update chapter error", error);
        res.status(500).json({ error: "Failed to update chapter" });
    }
});
app.delete("/api/story/chapters/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: "Invalid chapter id" });
    }
    try {
        await (0, storyRepository_js_1.removeChapter)(id);
        (0, notificationRepository_js_1.logStoryNotification)("chapter_removed", { chapterId: id });
        await (0, auditRepository_js_1.recordAuditEvent)({
            entityType: "story_chapter",
            entityId: String(id),
            action: "chapter_removed",
            actorId: req.query.actorId,
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("[api] remove chapter error", error);
        res.status(500).json({ error: "Failed to remove chapter" });
    }
});
app.get("/api/story/editor", async (req, res) => {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    if (!branchId) {
        return res.status(400).json({ error: "branchId is required" });
    }
    try {
        const nodes = await (0, storyRepository_js_1.getStoryNodes)(branchId);
        res.json({ branchId, nodes });
    }
    catch (error) {
        console.error("[api] editor fetch error", error);
        res.status(500).json({ error: "Failed to load story content" });
    }
});
app.post("/api/story/editor", async (req, res) => {
    const { branchId, nodes, actorId } = req.body ?? {};
    if (!branchId || !Array.isArray(nodes)) {
        return res.status(400).json({ error: "branchId and nodes required" });
    }
    try {
        await (0, storyRepository_js_1.saveStoryNodes)(branchId, nodes.map((node, index) => ({
            id: typeof node.id === "number" && node.id > 0 ? node.id : undefined,
            orderIndex: typeof node.orderIndex === "number" && Number.isFinite(node.orderIndex)
                ? node.orderIndex
                : index,
            content: String(node.content ?? ""),
        })));
        (0, notificationRepository_js_1.logStoryNotification)("story_saved", { branchId, nodeCount: nodes.length });
        await (0, auditRepository_js_1.recordAuditEvent)({
            entityType: "story_branch",
            entityId: branchId,
            action: "story_saved",
            actorId,
            metadata: { nodeCount: nodes.length },
        });
        await (0, auditRepository_js_1.enqueueCoherenceEvent)({
            entityType: "story_branch",
            entityId: branchId,
            scope: "story_content",
            payload: { nodeCount: nodes.length },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("[api] editor save error", error);
        res.status(500).json({ error: "Failed to save story content" });
    }
});
app.post("/api/story/ai-action", async (req, res) => {
    const { mode, content, persona } = req.body ?? {};
    const safeMode = typeof mode === "string" ? mode : "continue";
    const personaId = typeof persona === "string" ? persona : "general";
    const snippet = typeof content === "string" ? content.slice(-2000) : "";
    try {
        const response = await generateAiAction(safeMode, personaId, snippet);
        (0, notificationRepository_js_1.logStoryNotification)("ai_action_run", { mode: safeMode, persona: personaId });
        res.json(response);
    }
    catch (error) {
        console.error("[api] ai action error", error);
        res.status(503).json({ error: "AI service unavailable" });
    }
});
app.get("/api/story/comments", async (req, res) => {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    if (!branchId) {
        return res.status(400).json({ error: "branchId is required" });
    }
    try {
        const comments = await (0, storyRepository_js_1.getStoryComments)(branchId);
        res.json({ items: comments });
    }
    catch (error) {
        console.error("[api] get comments error", error);
        res.status(500).json({ error: "Failed to load comments" });
    }
});
app.post("/api/story/comments", async (req, res) => {
    const { branchId, nodeId, body, authorId } = req.body ?? {};
    if (!branchId || typeof nodeId !== "number" || !body) {
        return res.status(400).json({ error: "branchId, nodeId and body required" });
    }
    try {
        const comment = await (0, storyRepository_js_1.addStoryComment)(branchId, nodeId, body, authorId);
        (0, notificationRepository_js_1.logStoryNotification)("comment_added", { branchId, nodeId, commentId: comment.id });
        await (0, auditRepository_js_1.recordAuditEvent)({
            entityType: "story_branch",
            entityId: branchId,
            action: "comment_added",
            actorId: authorId,
            metadata: { nodeId, commentId: comment.id },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        console.error("[api] add comment error", error);
        res.status(500).json({ error: "Failed to add comment" });
    }
});
app.delete("/api/story/comments/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: "Invalid comment id" });
    }
    try {
        await (0, storyRepository_js_1.deleteStoryComment)(id);
        (0, notificationRepository_js_1.logStoryNotification)("comment_removed", { commentId: id });
        await (0, auditRepository_js_1.recordAuditEvent)({
            entityType: "story_comment",
            entityId: String(id),
            action: "comment_removed",
            actorId: req.query.actorId,
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("[api] delete comment error", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
});
app.get("/api/story/lore", async (req, res) => {
    const worldId = typeof req.query.worldId === "string" ? req.query.worldId : "city-of-thousand-codes";
    try {
        const lore = await (0, storyRepository_js_1.getWorldLore)(worldId);
        res.json({ worldId, items: lore });
    }
    catch (error) {
        console.error("[api] lore error", error);
        res.status(500).json({ error: "Failed to load lore" });
    }
});
app.get("/api/story/notifications", async (req, res) => {
    try {
        const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam ?? 20, 1), 100) : 20;
        const notifications = await (0, notificationRepository_js_1.fetchStoryNotifications)(limit);
        res.json({ items: notifications });
    }
    catch (error) {
        console.error("[api] notifications error", error);
        res.status(500).json({ error: "Failed to load notifications" });
    }
});
app.get("/api/angry-lips/sessions", async (req, res) => {
    try {
        const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
        const statusParam = typeof req.query.status === "string" ? req.query.status : undefined;
        const userIdParam = typeof req.query.userId === "string" ? req.query.userId : undefined;
        const sessions = await (0, sessionRepository_js_1.listSessions)({
            status: statusParam,
            limit: Number.isFinite(limitParam) ? limitParam : undefined,
            userId: userIdParam,
        });
        res.json({ items: sessions });
    }
    catch (error) {
        console.error("[api] angry lips list sessions", error);
        res.status(500).json({ error: "Failed to load sessions" });
    }
});
app.get("/api/angry-lips/sessions/:sessionId", async (req, res) => {
    try {
        const session = await (0, sessionRepository_js_1.getSession)(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ session });
    }
    catch (error) {
        console.error("[api] angry lips get session", error);
        res.status(500).json({ error: "Failed to load session" });
    }
});
app.get("/api/angry-lips/sessions/:sessionId/participants", async (req, res) => {
    try {
        const participants = await (0, sessionRepository_js_1.listSessionParticipants)(req.params.sessionId);
        res.json({ items: participants });
    }
    catch (error) {
        console.error("[api] angry lips list participants", error);
        res.status(500).json({ error: "Failed to load participants" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/invite", async (req, res) => {
    const { hostId, participantIds } = req.body ?? {};
    if (!hostId || !Array.isArray(participantIds)) {
        return res.status(400).json({ error: "hostId and participantIds are required" });
    }
    try {
        const participants = await (0, sessionRepository_js_1.inviteParticipants)(req.params.sessionId, hostId, participantIds.filter((id) => typeof id === "string"));
        res.status(201).json({ items: participants });
    }
    catch (error) {
        console.error("[api] angry lips invite participants", error);
        res.status(500).json({ error: error.message ?? "Failed to invite participants" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/respond", async (req, res) => {
    const { userId, action } = req.body ?? {};
    if (!userId || typeof action !== "string") {
        return res.status(400).json({ error: "userId and action are required" });
    }
    if (!["accept", "decline", "left"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }
    try {
        const participant = await (0, sessionRepository_js_1.respondToInvitation)(req.params.sessionId, userId, action);
        if (!participant) {
            return res.status(404).json({ error: "Invitation not found" });
        }
        res.json({ participant });
    }
    catch (error) {
        console.error("[api] angry lips respond invitation", error);
        res.status(500).json({ error: error.message ?? "Failed to update invitation" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/start", async (req, res) => {
    const { hostId } = req.body ?? {};
    if (!hostId) {
        return res.status(400).json({ error: "hostId is required" });
    }
    try {
        const session = await (0, sessionRepository_js_1.startSession)(req.params.sessionId, hostId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ session });
    }
    catch (error) {
        console.error("[api] angry lips start session", error);
        res.status(500).json({ error: error.message ?? "Failed to start session" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/advance", async (req, res) => {
    const { hostId } = req.body ?? {};
    if (!hostId) {
        return res.status(400).json({ error: "hostId is required" });
    }
    try {
        const session = await (0, sessionRepository_js_1.advanceTurn)(req.params.sessionId, hostId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ session });
    }
    catch (error) {
        console.error("[api] angry lips advance turn", error);
        res.status(500).json({ error: error.message ?? "Failed to advance turn" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/summarize", async (req, res) => {
    const { userId, focus } = req.body ?? {};
    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }
    try {
        const entry = await (0, sessionRepository_js_1.summarizeSession)(req.params.sessionId, userId, typeof focus === "string" ? focus : undefined);
        res.json({ entry, summary: entry.summaryText });
    }
    catch (error) {
        console.error("[api] angry lips summarize", error);
        res.status(500).json({ error: error.message ?? "Failed to summarize session" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/ai-story", async (req, res) => {
    const { hostId, prompt } = req.body ?? {};
    if (!hostId) {
        return res.status(400).json({ error: "hostId is required" });
    }
    try {
        const entry = await (0, sessionRepository_js_1.generateAiStory)(req.params.sessionId, hostId, typeof prompt === "string" ? prompt : undefined);
        res.json({ entry, story: entry.aiStoryText });
    }
    catch (error) {
        console.error("[api] angry lips ai story", error);
        res.status(500).json({ error: error.message ?? "Failed to generate AI story" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/publish", async (req, res) => {
    const { hostId, visibility } = req.body ?? {};
    if (!hostId) {
        return res.status(400).json({ error: "hostId is required" });
    }
    try {
        const entry = await (0, sessionRepository_js_1.publishVaultEntry)(req.params.sessionId, hostId, typeof visibility === "string" ? visibility : "public");
        res.json({ entry });
    }
    catch (error) {
        console.error("[api] angry lips publish", error);
        res.status(500).json({ error: error.message ?? "Failed to update visibility" });
    }
});
app.get("/api/angry-lips/feed", async (req, res) => {
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
    try {
        const items = await (0, sessionRepository_js_1.listPublishedEntries)(limit, offset);
        res.json({ items });
    }
    catch (error) {
        console.error("[api] angry lips feed", error);
        res.status(500).json({ error: "Failed to load public feed" });
    }
});
app.post("/api/angry-lips/sessions", async (req, res) => {
    const { hostId, title, genre, templateSource, templateLength, seedText, responseWindowMinutes, allowAiCohost, vaultMode, participants, participantIds: participantIdsFromBody, } = req.body ?? {};
    const rawParticipantIds = Array.isArray(participantIdsFromBody)
        ? participantIdsFromBody
        : Array.isArray(participants)
            ? participants
            : [];
    const participantIds = rawParticipantIds.filter((value) => typeof value === "string");
    try {
        const result = await (0, sessionRepository_js_1.createSession)({
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
        await (0, analytics_js_1.capture)({
            event: "angrylips_session_created",
            properties: {
                session_id: result.session.id,
                template_source: result.session.templateSource,
                template_length: result.session.templateLength,
                blank_count: result.template.blanks.length,
            },
        }, env.POSTHOG_API_KEY);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("[api] angry lips create session", error);
        res.status(500).json({ error: error.message ?? "Failed to create session" });
    }
});
app.post("/api/angry-lips/turns/:turnId/submit", async (req, res) => {
    const { text, handle } = req.body ?? {};
    if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text is required" });
    }
    try {
        const turn = await (0, sessionRepository_js_1.submitTurn)({ turnId: req.params.turnId, text, handle });
        if (!turn) {
            return res.status(404).json({ error: "Turn not found" });
        }
        res.json({ turn });
    }
    catch (error) {
        console.error("[api] angry lips submit turn", error);
        res.status(500).json({ error: "Failed to submit turn" });
    }
});
app.post("/api/angry-lips/turns/:turnId/auto-fill", async (req, res) => {
    const { text, handle } = req.body ?? {};
    if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text is required" });
    }
    try {
        const turn = await (0, sessionRepository_js_1.autoFillTurn)({ turnId: req.params.turnId, text, handle });
        if (!turn) {
            return res.status(404).json({ error: "Turn not found" });
        }
        res.json({ turn });
    }
    catch (error) {
        console.error("[api] angry lips auto-fill", error);
        res.status(500).json({ error: "Failed to auto-fill turn" });
    }
});
app.post("/api/angry-lips/turns/:turnId/events", async (req, res) => {
    const { eventType, payload } = req.body ?? {};
    if (!eventType || typeof eventType !== "string") {
        return res.status(400).json({ error: "eventType is required" });
    }
    try {
        await (0, sessionRepository_js_1.logTurnEvent)(req.params.turnId, eventType, payload ?? {});
        res.status(204).send();
    }
    catch (error) {
        console.error("[api] angry lips log event", error);
        res.status(500).json({ error: "Failed to log turn event" });
    }
});
app.post("/api/angry-lips/sessions/:sessionId/complete", async (req, res) => {
    const { storyText, title, visibility } = req.body ?? {};
    if (!storyText || typeof storyText !== "string") {
        return res.status(400).json({ error: "storyText is required" });
    }
    try {
        const vaultEntry = await (0, sessionRepository_js_1.completeSession)({
            sessionId: req.params.sessionId,
            storyText,
            title,
            visibility,
        });
        res.json({ vaultEntry });
    }
    catch (error) {
        console.error("[api] angry lips complete session", error);
        res.status(500).json({ error: "Failed to complete session" });
    }
});
app.get("/api/angry-lips/realtime/token", async (req, res) => {
    try {
        const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
        const tokenRequest = await (0, ablyPublisher_js_1.createTokenRequest)(clientId);
        res.json(tokenRequest);
    }
    catch (error) {
        console.error("[api] angry lips token request", error);
        res.status(503).json({ error: "Realtime service unavailable" });
    }
});
// Error handling middleware (must be last)
app.use((err, _req, res, _next) => {
    console.error('[api] unhandled error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`[mythatron-api] listening on port ${port}`);
    console.log(`[mythatron-api] environment: ${process.env.NODE_ENV || 'development'}`);
});
async function generateAiAction(mode, persona, snippet) {
    const personaDescriptor = persona === "narrator"
        ? "a visionary narrator weaving cinematic transitions that maintain continuity"
        : persona === "character"
            ? "the character whose perspective drives the story, matching their voice and motives"
            : "a collaborative writer helping continue the scene";
    try {
        if (mode === "muse") {
            const { content } = await (0, aiClient_js_1.runCreativeCompletion)({
                messages: [
                    {
                        role: "system",
                        content: "You generate creative prompts for storytellers. Always respond in JSON with shape {\"prompts\":[\"idea 1\",\"idea 2\",...]} and nothing else.",
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
            }
            catch {
                // fall through to heuristic parsing below
            }
            const prompts = content
                .split("\n")
                .map((line) => line.replace(/^[-*]\s*/, "").trim())
                .filter(Boolean);
            return { mode, persona, prompts: prompts.length ? prompts : [content.trim()] };
        }
        if (mode === "critique") {
            const { content } = await (0, aiClient_js_1.runCreativeCompletion)({
                messages: [
                    {
                        role: "system",
                        content: "You critique story drafts. Always respond in JSON with shape {\"notes\":[\"point 1\",\"point 2\",...]} and nothing else.",
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
            }
            catch {
                // fall through to heuristic parsing below
            }
            const notes = content
                .split("\n")
                .map((line) => line.replace(/^[-*]\s*/, "").trim())
                .filter(Boolean);
            return { mode, persona, notes: notes.length ? notes : [content.trim()] };
        }
        const userPrompt = mode === "rewrite"
            ? `Rewrite the excerpt below, keeping the author's voice while tightening the prose and increasing urgency.\n\n${snippet}`
            : `Continue the story below with the next beat, preserving tone, stakes, and pacing.\n\n${snippet}`;
        const { content, model } = await (0, aiClient_js_1.runCreativeCompletion)({
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
    }
    catch (error) {
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
