"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAngryLipsRouter = createAngryLipsRouter;
const express_1 = require("express");
const sessionRepository_js_1 = require("../angryLips/sessionRepository.js");
const auditRepository_js_1 = require("../creative/auditRepository.js");
const ablyPublisher_js_1 = require("../realtime/ablyPublisher.js");
function createAngryLipsRouter() {
    const router = (0, express_1.Router)();
    // Get all sessions
    router.get("/sessions", async (req, res) => {
        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;
        if (limit > 100 || limit < 1) {
            return res.status(400).json({ error: "Limit must be between 1 and 100" });
        }
        try {
            const sessions = await (0, sessionRepository_js_1.listSessions)({ limit });
            res.json({
                items: sessions,
                limit,
                offset,
                hasMore: sessions.length === limit,
            });
        }
        catch (error) {
            console.error("[api] get sessions error", error);
            res.status(500).json({ error: "Failed to load sessions" });
        }
    });
    // Get session by ID
    router.get("/sessions/:sessionId", async (req, res) => {
        const { sessionId } = req.params;
        try {
            const session = await (0, sessionRepository_js_1.getSession)(sessionId);
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            res.json(session);
        }
        catch (error) {
            console.error("[api] get session error", error);
            res.status(500).json({ error: "Failed to load session" });
        }
    });
    // Get session participants
    router.get("/sessions/:sessionId/participants", async (req, res) => {
        const { sessionId } = req.params;
        try {
            const participants = await (0, sessionRepository_js_1.listSessionParticipants)(sessionId);
            res.json({ items: participants });
        }
        catch (error) {
            console.error("[api] get participants error", error);
            res.status(500).json({ error: "Failed to load participants" });
        }
    });
    // Invite to session
    router.post("/sessions/:sessionId/invite", async (req, res) => {
        const { sessionId } = req.params;
        const { userId, hostId } = req.body ?? {};
        if (!userId || !hostId) {
            return res.status(400).json({ error: "userId and hostId required" });
        }
        try {
            const participant = await (0, sessionRepository_js_1.inviteParticipants)(sessionId, userId, hostId);
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: sessionId,
                action: "participant_invited",
                actorId: hostId,
                metadata: { userId },
            });
            res.json(participant);
        }
        catch (error) {
            console.error("[api] invite error", error);
            res.status(500).json({ error: "Failed to invite participant" });
        }
    });
    // Submit response
    router.post("/sessions/:sessionId/respond", async (req, res) => {
        const { sessionId } = req.params;
        const { userId, response } = req.body ?? {};
        if (!userId || !response) {
            return res.status(400).json({ error: "userId and response required" });
        }
        try {
            const result = await (0, sessionRepository_js_1.respondToInvitation)(sessionId, userId, response);
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: sessionId,
                action: "response_submitted",
                actorId: userId,
            });
            res.json(result);
        }
        catch (error) {
            console.error("[api] submit response error", error);
            res.status(500).json({ error: "Failed to submit response" });
        }
    });
    // Start session
    router.post("/sessions/:sessionId/start", async (req, res) => {
        const { sessionId } = req.params;
        const { hostId } = req.body ?? {};
        if (!hostId) {
            return res.status(400).json({ error: "hostId required" });
        }
        try {
            const session = await (0, sessionRepository_js_1.startSession)(sessionId, hostId);
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: sessionId,
                action: "session_started",
                actorId: hostId,
            });
            res.json(session);
        }
        catch (error) {
            console.error("[api] start session error", error);
            res.status(500).json({ error: "Failed to start session" });
        }
    });
    // Advance turn
    router.post("/sessions/:sessionId/advance", async (req, res) => {
        const { sessionId } = req.params;
        const { hostId } = req.body ?? {};
        if (!hostId) {
            return res.status(400).json({ error: "hostId required" });
        }
        try {
            const session = await (0, sessionRepository_js_1.advanceTurn)(sessionId, hostId);
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: sessionId,
                action: "turn_advanced",
                actorId: hostId,
            });
            res.json(session);
        }
        catch (error) {
            console.error("[api] advance turn error", error);
            res.status(500).json({ error: "Failed to advance turn" });
        }
    });
    // Summarize session
    router.post("/sessions/:sessionId/summarize", async (req, res) => {
        const { sessionId } = req.params;
        const { hostId, prompt = "default" } = req.body ?? {};
        try {
            const summary = await (0, sessionRepository_js_1.summarizeSession)(sessionId, hostId, prompt);
            res.json(summary);
        }
        catch (error) {
            console.error("[api] summarize error", error);
            res.status(500).json({ error: "Failed to summarize session" });
        }
    });
    // Generate AI story
    router.post("/sessions/:sessionId/ai-story", async (req, res) => {
        const { sessionId } = req.params;
        const { hostId, prompt = "default" } = req.body ?? {};
        try {
            const story = await (0, sessionRepository_js_1.generateAiStory)(sessionId, hostId, prompt);
            res.json(story);
        }
        catch (error) {
            console.error("[api] generate story error", error);
            res.status(500).json({ error: "Failed to generate story" });
        }
    });
    // Publish story
    router.post("/sessions/:sessionId/publish", async (req, res) => {
        const { sessionId } = req.params;
        const { hostId, title, summary, story } = req.body ?? {};
        if (!hostId || !title) {
            return res.status(400).json({ error: "hostId and title required" });
        }
        try {
            await (0, sessionRepository_js_1.publishVaultEntry)(sessionId, hostId, "public");
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: sessionId,
                action: "story_published",
                actorId: hostId,
            });
            res.json({ published: true });
        }
        catch (error) {
            console.error("[api] publish error", error);
            res.status(500).json({ error: "Failed to publish story" });
        }
    });
    // Get feed
    router.get("/feed", async (req, res) => {
        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;
        try {
            const feed = await (0, sessionRepository_js_1.listPublishedEntries)(limit, offset);
            res.json({ items: feed, limit, offset });
        }
        catch (error) {
            console.error("[api] get feed error", error);
            res.status(500).json({ error: "Failed to load feed" });
        }
    });
    // Create session
    router.post("/sessions", async (req, res) => {
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
            const session = await (0, sessionRepository_js_1.createSession)({
                hostId,
                title: String(title).slice(0, 100),
                seedText: String(prompt1 || "").slice(0, 200),
            });
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: session.session.id,
                action: "session_created",
                actorId: hostId,
                metadata: { title },
            });
            res.status(201).json(session);
        }
        catch (error) {
            console.error("[api] create session error", error);
            res.status(500).json({ error: "Failed to create session" });
        }
    });
    // Submit turn
    router.post("/turns/:turnId/submit", async (req, res) => {
        const { turnId } = req.params;
        const { userId, lipReading } = req.body ?? {};
        if (!userId || !lipReading) {
            return res.status(400).json({ error: "userId and lipReading required" });
        }
        try {
            const turn = await (0, sessionRepository_js_1.submitTurn)({ turnId, text: lipReading });
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_turn",
                entityId: turnId,
                action: "turn_submitted",
                actorId: userId,
            });
            res.json(turn);
        }
        catch (error) {
            console.error("[api] submit turn error", error);
            res.status(500).json({ error: "Failed to submit turn" });
        }
    });
    // Auto-fill turn
    router.post("/turns/:turnId/auto-fill", async (req, res) => {
        const { turnId } = req.params;
        const { userId, model = "gpt-4o-mini" } = req.body ?? {};
        if (!userId) {
            return res.status(400).json({ error: "userId required" });
        }
        try {
            const result = await (0, sessionRepository_js_1.autoFillTurn)({ turnId, text: model });
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_turn",
                entityId: turnId,
                action: "auto_fill_used",
                actorId: userId,
                metadata: { model },
            });
            res.json(result);
        }
        catch (error) {
            console.error("[api] auto-fill error", error);
            res.status(500).json({ error: "Failed to auto-fill" });
        }
    });
    // Record turn event
    router.post("/turns/:turnId/events", async (req, res) => {
        const { turnId } = req.params;
        const { userId, eventType, eventData } = req.body ?? {};
        if (!userId || !eventType) {
            return res.status(400).json({ error: "userId and eventType required" });
        }
        try {
            await (0, sessionRepository_js_1.logTurnEvent)(turnId, eventType, eventData);
            res.json({ recorded: true });
        }
        catch (error) {
            console.error("[api] record event error", error);
            res.status(500).json({ error: "Failed to record event" });
        }
    });
    // Complete session
    router.post("/sessions/:sessionId/complete", async (req, res) => {
        const { sessionId } = req.params;
        const { hostId, endReason = "completed" } = req.body ?? {};
        if (!hostId) {
            return res.status(400).json({ error: "hostId required" });
        }
        try {
            const session = await (0, sessionRepository_js_1.completeSession)({ sessionId, storyText: endReason || "" });
            await (0, auditRepository_js_1.recordAuditEvent)({
                entityType: "angry_session",
                entityId: sessionId,
                action: "session_completed",
                actorId: hostId,
                metadata: { endReason },
            });
            res.json(session);
        }
        catch (error) {
            console.error("[api] complete session error", error);
            res.status(500).json({ error: "Failed to complete session" });
        }
    });
    // Get realtime token
    router.get("/realtime/token", async (req, res) => {
        const { userId, sessionId } = req.query;
        if (!userId || !sessionId || typeof userId !== "string" || typeof sessionId !== "string") {
            return res.status(400).json({ error: "userId and sessionId required" });
        }
        try {
            const token = await (0, ablyPublisher_js_1.createTokenRequest)(userId);
            res.json({ token });
        }
        catch (error) {
            console.error("[api] get token error", error);
            res.status(500).json({ error: "Failed to get token" });
        }
    });
    return router;
}
