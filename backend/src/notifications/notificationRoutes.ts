import { Router, Request, Response } from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification
} from "./notificationRepository.js";

/**
 * Notification Routes
 * Endpoints for accessing user notifications
 */

export function createNotificationRouter(): Router {
  const router = Router();

  /**
   * Get user notifications
   * GET /api/notifications?limit=50&offset=0&unreadOnly=false
   */
  router.get("/", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      const notifications = await getUserNotifications(userId, limit, offset, unreadOnly);
      res.json({ notifications });
    } catch (error) {
      console.error("[notifications] get notifications error", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count?userId=...
   */
  router.get("/unread-count", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      const count = await getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("[notifications] get unread count error", error);
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  /**
   * Mark notification as read
   * POST /api/notifications/:notificationId/read
   */
  router.post("/:notificationId/read", async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    try {
      await markAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("[notifications] mark as read error", error);
      res.status(500).json({ error: "Failed to mark as read" });
    }
  });

  /**
   * Mark all notifications as read
   * POST /api/notifications/mark-all-read
   */
  router.post("/mark-all-read", async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      const count = await markAllAsRead(userId);
      res.json({ success: true, count });
    } catch (error) {
      console.error("[notifications] mark all as read error", error);
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  });

  /**
   * Dismiss notification
   * DELETE /api/notifications/:notificationId
   */
  router.delete("/:notificationId", async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    try {
      await dismissNotification(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("[notifications] dismiss notification error", error);
      res.status(500).json({ error: "Failed to dismiss notification" });
    }
  });

  /**
   * Health check
   */
  router.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "notifications" });
  });

  return router;
}



