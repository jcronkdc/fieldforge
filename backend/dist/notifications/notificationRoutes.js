"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationRouter = createNotificationRouter;
const express_1 = require("express");
const notificationRepository_js_1 = require("./notificationRepository.js");
/**
 * Notification Routes
 * Endpoints for accessing user notifications
 */
function createNotificationRouter() {
    const router = (0, express_1.Router)();
    /**
     * Get user notifications
     * GET /api/notifications?limit=50&offset=0&unreadOnly=false
     */
    router.get("/", async (req, res) => {
        const userId = req.query.userId;
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;
        const unreadOnly = req.query.unreadOnly === 'true';
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const notifications = await (0, notificationRepository_js_1.getUserNotifications)(userId, limit, offset, unreadOnly);
            res.json({ notifications });
        }
        catch (error) {
            console.error("[notifications] get notifications error", error);
            res.status(500).json({ error: "Failed to fetch notifications" });
        }
    });
    /**
     * Get unread notification count
     * GET /api/notifications/unread-count?userId=...
     */
    router.get("/unread-count", async (req, res) => {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const count = await (0, notificationRepository_js_1.getUnreadCount)(userId);
            res.json({ count });
        }
        catch (error) {
            console.error("[notifications] get unread count error", error);
            res.status(500).json({ error: "Failed to get unread count" });
        }
    });
    /**
     * Mark notification as read
     * POST /api/notifications/:notificationId/read
     */
    router.post("/:notificationId/read", async (req, res) => {
        const { notificationId } = req.params;
        try {
            await (0, notificationRepository_js_1.markAsRead)(notificationId);
            res.json({ success: true });
        }
        catch (error) {
            console.error("[notifications] mark as read error", error);
            res.status(500).json({ error: "Failed to mark as read" });
        }
    });
    /**
     * Mark all notifications as read
     * POST /api/notifications/mark-all-read
     */
    router.post("/mark-all-read", async (req, res) => {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const count = await (0, notificationRepository_js_1.markAllAsRead)(userId);
            res.json({ success: true, count });
        }
        catch (error) {
            console.error("[notifications] mark all as read error", error);
            res.status(500).json({ error: "Failed to mark all as read" });
        }
    });
    /**
     * Dismiss notification
     * DELETE /api/notifications/:notificationId
     */
    router.delete("/:notificationId", async (req, res) => {
        const { notificationId } = req.params;
        try {
            await (0, notificationRepository_js_1.dismissNotification)(notificationId);
            res.json({ success: true });
        }
        catch (error) {
            console.error("[notifications] dismiss notification error", error);
            res.status(500).json({ error: "Failed to dismiss notification" });
        }
    });
    /**
     * Health check
     */
    router.get("/health", (_req, res) => {
        res.json({ status: "ok", service: "notifications" });
    });
    return router;
}
