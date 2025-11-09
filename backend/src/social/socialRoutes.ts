import express from "express";
import {
  createConnectionRequest,
  getConnectionStats,
  listBookworms,
  listConnectionRequests,
  lookupProfileByUsername,
  removeBookworm,
  respondToRequest,
} from "./socialRepository.js";

export function createSocialRouter() {
  const router = express.Router();

  router.get("/bookworms", async (req, res) => {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    try {
      const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
      const limit = Number.isFinite(limitParam) ? limitParam : 12;
      const [items, stats] = await Promise.all([
        listBookworms(userId, limit),
        getConnectionStats(userId),
      ]);
      res.json({ items, stats });
    } catch (error) {
      console.error("[social] list bookworms error", error);
      res.status(500).json({ error: "Failed to load bookworms" });
    }
  });

  router.delete("/bookworms/:friendId", async (req, res) => {
    const userId = typeof req.body?.userId === "string" ? req.body.userId : typeof req.query.userId === "string" ? req.query.userId : undefined;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    try {
      await removeBookworm(userId, req.params.friendId);
      res.status(204).send();
    } catch (error) {
      console.error("[social] remove bookworm error", error);
      res.status(500).json({ error: "Failed to remove bookworm" });
    }
  });

  router.get("/requests", async (req, res) => {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const direction =
      req.query.direction === "outbound" || req.query.direction === "inbound"
        ? (req.query.direction as "outbound" | "inbound")
        : "inbound";
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    try {
      const requests = await listConnectionRequests(userId, direction);
      res.json({ items: requests });
    } catch (error) {
      console.error("[social] list requests error", error);
      res.status(500).json({ error: "Failed to load requests" });
    }
  });

  router.post("/requests", async (req, res) => {
    const { requesterId, targetId, targetUsername, message } = req.body ?? {};
    if (!requesterId) {
      return res.status(400).json({ error: "requesterId is required" });
    }
    try {
      let resolvedTargetId = targetId;
      if (!resolvedTargetId && typeof targetUsername === "string") {
        const profile = await lookupProfileByUsername(targetUsername);
        if (!profile) {
          return res.status(404).json({ error: "User not found" });
        }
        resolvedTargetId = profile.userId;
      }
      if (!resolvedTargetId) {
        return res.status(400).json({ error: "targetId or targetUsername is required" });
      }

      const request = await createConnectionRequest({
        requesterId,
        targetId: resolvedTargetId,
        message: typeof message === "string" ? message : null,
      });
      res.status(201).json({ request });
    } catch (error) {
      console.error("[social] create request error", error);
      res.status(500).json({ error: (error as Error).message ?? "Failed to create request" });
    }
  });

  router.post("/requests/:requestId/respond", async (req, res) => {
    const { action, userId } = req.body ?? {};
    if (!userId || !action) {
      return res.status(400).json({ error: "userId and action are required" });
    }
    if (!["accept", "decline", "cancel"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    try {
      const result = await respondToRequest({
        requestId: req.params.requestId,
        actorId: userId,
        action,
      });
      if (!result) {
        return res.status(404).json({ error: "Request not found" });
      }
      res.json({ request: result });
    } catch (error) {
      console.error("[social] respond request error", error);
      res.status(500).json({ error: (error as Error).message ?? "Failed to update request" });
    }
  });

  router.get("/profiles/lookup", async (req, res) => {
    const username = typeof req.query.username === "string" ? req.query.username : undefined;
    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }
    try {
      const profile = await lookupProfileByUsername(username);
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ profile });
    } catch (error) {
      console.error("[social] lookup profile error", error);
      res.status(500).json({ error: "Failed to look up profile" });
    }
  });

  return router;
}


