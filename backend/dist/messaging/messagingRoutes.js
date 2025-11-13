"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessagingRouter = createMessagingRouter;
const express_1 = require("express");
const messagingRepository_js_1 = require("./messagingRepository.js");
const messagingPublisher_js_1 = require("../realtime/messagingPublisher.js");
function createMessagingRouter() {
    const router = (0, express_1.Router)();
    // Get user's conversations
    router.get("/conversations", async (req, res) => {
        const userId = req.query.userId;
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const conversations = await (0, messagingRepository_js_1.getUserConversations)(userId, limit, offset);
            res.json({ conversations });
        }
        catch (error) {
            console.error("[messaging] get conversations error", error);
            res.status(500).json({ error: "Failed to fetch conversations" });
        }
    });
    // Create or get direct conversation
    router.post("/conversations/direct", async (req, res) => {
        const { userId, otherUserId } = req.body;
        if (!userId || !otherUserId) {
            return res.status(400).json({ error: "userId and otherUserId are required" });
        }
        try {
            const conversationId = await (0, messagingRepository_js_1.createOrGetDirectConversation)(userId, otherUserId);
            res.json({ conversationId });
        }
        catch (error) {
            console.error("[messaging] create direct conversation error", error);
            res.status(500).json({ error: "Failed to create conversation" });
        }
    });
    // Create group conversation
    router.post("/conversations/group", async (req, res) => {
        const { creatorId, name, description, participantIds } = req.body;
        if (!creatorId || !name) {
            return res.status(400).json({ error: "creatorId and name are required" });
        }
        try {
            const conversation = await (0, messagingRepository_js_1.createGroupConversation)(creatorId, name, description, participantIds);
            res.json({ conversation });
        }
        catch (error) {
            console.error("[messaging] create group conversation error", error);
            res.status(500).json({ error: "Failed to create group" });
        }
    });
    // Create project conversation
    router.post("/conversations/project", async (req, res) => {
        const { creatorId, projectType, projectId, name, participantIds } = req.body;
        if (!creatorId || !projectType || !projectId || !name) {
            return res.status(400).json({
                error: "creatorId, projectType, projectId, and name are required"
            });
        }
        try {
            const conversation = await (0, messagingRepository_js_1.createProjectConversation)(creatorId, projectType, projectId, name, participantIds);
            res.json({ conversation });
        }
        catch (error) {
            console.error("[messaging] create project conversation error", error);
            res.status(500).json({ error: "Failed to create project conversation" });
        }
    });
    // Get conversation messages
    router.get("/conversations/:conversationId/messages", async (req, res) => {
        const { conversationId } = req.params;
        const userId = req.query.userId;
        const limit = Number(req.query.limit) || 50;
        const beforeMessageId = req.query.beforeMessageId;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const messages = await (0, messagingRepository_js_1.getConversationMessages)(conversationId, userId, limit, beforeMessageId);
            res.json({ messages });
        }
        catch (error) {
            console.error("[messaging] get messages error", error);
            res.status(500).json({ error: "Failed to fetch messages" });
        }
    });
    // Send message
    router.post("/conversations/:conversationId/messages", async (req, res) => {
        const { conversationId } = req.params;
        const { senderId, content, messageType, metadata } = req.body;
        if (!senderId || !content) {
            return res.status(400).json({ error: "senderId and content are required" });
        }
        try {
            const message = await (0, messagingRepository_js_1.sendMessage)(conversationId, senderId, content, messageType, metadata);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'message.sent', {
                message,
                senderId
            });
            res.json({ message });
        }
        catch (error) {
            console.error("[messaging] send message error", error);
            res.status(500).json({ error: "Failed to send message" });
        }
    });
    // Mark conversation as read
    router.post("/conversations/:conversationId/read", async (req, res) => {
        const { conversationId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            await (0, messagingRepository_js_1.markConversationAsRead)(conversationId, userId);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'conversation.read', {
                userId
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error("[messaging] mark as read error", error);
            res.status(500).json({ error: "Failed to mark as read" });
        }
    });
    // Add reaction to message
    router.post("/messages/:messageId/reactions", async (req, res) => {
        const { messageId } = req.params;
        const { userId, reaction, conversationId } = req.body;
        if (!userId || !reaction || !conversationId) {
            return res.status(400).json({ error: "userId, reaction, and conversationId are required" });
        }
        try {
            await (0, messagingRepository_js_1.addMessageReaction)(messageId, userId, reaction);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'message.reaction', {
                messageId,
                userId,
                reaction,
                action: 'add'
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error("[messaging] add reaction error", error);
            res.status(500).json({ error: "Failed to add reaction" });
        }
    });
    // Remove reaction from message
    router.delete("/messages/:messageId/reactions", async (req, res) => {
        const { messageId } = req.params;
        const { userId, reaction, conversationId } = req.body;
        if (!userId || !reaction || !conversationId) {
            return res.status(400).json({ error: "userId, reaction, and conversationId are required" });
        }
        try {
            await (0, messagingRepository_js_1.removeMessageReaction)(messageId, userId, reaction);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'message.reaction', {
                messageId,
                userId,
                reaction,
                action: 'remove'
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error("[messaging] remove reaction error", error);
            res.status(500).json({ error: "Failed to remove reaction" });
        }
    });
    // Update typing indicator
    router.post("/conversations/:conversationId/typing", async (req, res) => {
        const { conversationId } = req.params;
        const { userId, isTyping } = req.body;
        if (!userId || typeof isTyping !== 'boolean') {
            return res.status(400).json({ error: "userId and isTyping are required" });
        }
        try {
            await (0, messagingRepository_js_1.updateTypingIndicator)(conversationId, userId, isTyping);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'typing.update', {
                userId,
                isTyping
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error("[messaging] update typing error", error);
            res.status(500).json({ error: "Failed to update typing indicator" });
        }
    });
    // Get typing indicators
    router.get("/conversations/:conversationId/typing", async (req, res) => {
        const { conversationId } = req.params;
        try {
            const typingUsers = await (0, messagingRepository_js_1.getTypingIndicators)(conversationId);
            res.json({ typingUsers });
        }
        catch (error) {
            console.error("[messaging] get typing indicators error", error);
            res.status(500).json({ error: "Failed to fetch typing indicators" });
        }
    });
    // Add participants to conversation
    router.post("/conversations/:conversationId/participants", async (req, res) => {
        const { conversationId } = req.params;
        const { participantIds, addedBy } = req.body;
        if (!participantIds || !Array.isArray(participantIds) || !addedBy) {
            return res.status(400).json({ error: "participantIds and addedBy are required" });
        }
        try {
            await (0, messagingRepository_js_1.addParticipantsToConversation)(conversationId, participantIds, addedBy);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'participants.added', {
                participantIds,
                addedBy
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error("[messaging] add participants error", error);
            res.status(500).json({ error: error instanceof Error ? error.message : "Failed to add participants" });
        }
    });
    // Leave conversation
    router.delete("/conversations/:conversationId/participants/:userId", async (req, res) => {
        const { conversationId, userId } = req.params;
        try {
            await (0, messagingRepository_js_1.leaveConversation)(conversationId, userId);
            // Publish real-time event
            await (0, messagingPublisher_js_1.publishMessageEvent)(conversationId, 'participant.left', {
                userId
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error("[messaging] leave conversation error", error);
            res.status(500).json({ error: "Failed to leave conversation" });
        }
    });
    return router;
}
