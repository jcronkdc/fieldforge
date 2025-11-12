import express from "express";
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
} from "../story/storyRepository.js";
import {
  recordAuditEvent,
  enqueueCoherenceEvent,
  fetchAuditEvents,
} from "./auditRepository.js";

export function createStoryRouter() {
  const router = express.Router();

  router.get("/timeline", async (req, res) => {
    try {
      const worldId =
        typeof req.query.worldId === "string" && req.query.worldId.length > 0
          ? req.query.worldId
          : "city-of-thousand-codes";
      const nodes = await getTimeline(worldId);
      res.json({ worldId, nodes });
    } catch (error) {
      console.error("[creative] story timeline error", error);
      res.status(500).json({ error: "Failed to load story timeline" });
    }
  });

  router.get("/chapters", async (req, res) => {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    if (!branchId) {
      return res.status(400).json({ error: "branchId is required" });
    }
    try {
      const chapters = await getChapters(branchId);
      res.json({ branchId, chapters });
    } catch (error) {
      console.error("[creative] story chapters error", error);
      res.status(500).json({ error: "Failed to load chapters" });
    }
  });

  // Get story comments
  router.get("/comments", async (req, res) => {
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

  // Add story comment
  router.post("/comments", async (req, res) => {
    const { branchId, nodeId, body, authorId } = req.body ?? {};
    if (!branchId || typeof nodeId !== "number" || !body) {
      return res.status(400).json({ error: "branchId, nodeId and body required" });
    }
    try {
      const comment = await addStoryComment(branchId, nodeId, body, authorId);
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

  // Delete story comment
  router.delete("/comments/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }
    try {
      await deleteStoryComment(id);
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

  // Get world lore
  router.get("/lore", async (req, res) => {
    const worldId = typeof req.query.worldId === "string" ? req.query.worldId : "city-of-thousand-codes";
    try {
      const lore = await getWorldLore(worldId);
      res.json(lore);
    } catch (error) {
      console.error("[api] get lore error", error);
      res.status(500).json({ error: "Failed to load world lore" });
    }
  });

  router.post("/chapters", async (req, res) => {
    const { branchId, title, actorId } = req.body ?? {};
    if (!branchId || !title) {
      return res.status(400).json({ error: "branchId and title are required" });
    }
    try {
      const chapter = await addChapter(branchId, title);
      await recordAuditEvent({
        entityType: "story_branch",
        entityId: branchId,
        action: "chapter_added",
        actorId,
        metadata: { chapterId: chapter.id, title },
      });
      res.status(201).json(chapter);
    } catch (error) {
      console.error("[creative] story add chapter error", error);
      res.status(500).json({ error: "Failed to add chapter" });
    }
  });

  router.patch("/chapters/:id", async (req, res) => {
    const chapterId = Number(req.params.id);
    if (!Number.isFinite(chapterId)) {
      return res.status(400).json({ error: "Invalid chapter id" });
    }
    try {
      await updateChapter(chapterId, req.body ?? {});
      await recordAuditEvent({
        entityType: "story_chapter",
        entityId: String(chapterId),
        action: "chapter_updated",
        actorId: req.body?.actorId,
        metadata: { updates: req.body },
      });
      res.status(204).send();
    } catch (error) {
      console.error("[creative] story update chapter error", error);
      res.status(500).json({ error: "Failed to update chapter" });
    }
  });

  router.delete("/chapters/:id", async (req, res) => {
    const chapterId = Number(req.params.id);
    if (!Number.isFinite(chapterId)) {
      return res.status(400).json({ error: "Invalid chapter id" });
    }
    try {
      await removeChapter(chapterId);
      await recordAuditEvent({
        entityType: "story_chapter",
        entityId: String(chapterId),
        action: "chapter_removed",
        actorId: req.query.actorId as string | undefined,
      });
      res.status(204).send();
    } catch (error) {
      console.error("[creative] story remove chapter error", error);
      res.status(500).json({ error: "Failed to remove chapter" });
    }
  });

  router.get("/editor", async (req, res) => {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    if (!branchId) {
      return res.status(400).json({ error: "branchId is required" });
    }
    try {
      const nodes = await getStoryNodes(branchId);
      res.json({ branchId, nodes });
    } catch (error) {
      console.error("[creative] story editor load error", error);
      res.status(500).json({ error: "Failed to load story content" });
    }
  });

  router.post("/editor", async (req, res) => {
    const { branchId, nodes, actorId } = req.body ?? {};
    if (!branchId || !Array.isArray(nodes)) {
      return res.status(400).json({ error: "branchId and nodes required" });
    }
    try {
      await saveStoryNodes(branchId, nodes);
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
      console.error("[creative] story editor save error", error);
      res.status(500).json({ error: "Failed to save story content" });
    }
  });

  router.get("/comments", async (req, res) => {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    if (!branchId) {
      return res.status(400).json({ error: "branchId is required" });
    }
    try {
      const comments = await getStoryComments(branchId);
      res.json({ items: comments });
    } catch (error) {
      console.error("[creative] story comments load error", error);
      res.status(500).json({ error: "Failed to load comments" });
    }
  });

  router.post("/comments", async (req, res) => {
    const { branchId, nodeId, body, authorId } = req.body ?? {};
    if (!branchId || typeof nodeId !== "number" || !body) {
      return res.status(400).json({ error: "branchId, nodeId and body required" });
    }
    try {
      const comment = await addStoryComment(branchId, nodeId, body, authorId);
      await recordAuditEvent({
        entityType: "story_branch",
        entityId: branchId,
        action: "comment_added",
        actorId: authorId,
        metadata: { nodeId, commentId: comment.id },
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("[creative] story add comment error", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  router.delete("/comments/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }
    try {
      await deleteStoryComment(id);
      await recordAuditEvent({
        entityType: "story_comment",
        entityId: String(id),
        action: "comment_removed",
        actorId: req.query.actorId as string | undefined,
      });
      res.status(204).send();
    } catch (error) {
      console.error("[creative] story delete comment error", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  router.get("/lore", async (req, res) => {
    const worldId =
      typeof req.query.worldId === "string" && req.query.worldId.length > 0
        ? req.query.worldId
        : "city-of-thousand-codes";
    try {
      const lore = await getWorldLore(worldId);
      res.json({ worldId, items: lore });
    } catch (error) {
      console.error("[creative] story lore error", error);
      res.status(500).json({ error: "Failed to load lore" });
    }
  });

  router.get("/audit", async (req, res) => {
    const entityType = typeof req.query.entityType === "string" ? req.query.entityType : undefined;
    const entityId = typeof req.query.entityId === "string" ? req.query.entityId : undefined;
    const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    if (!entityType || !entityId) {
      return res.status(400).json({ error: "entityType and entityId are required" });
    }
    try {
      const events = await fetchAuditEvents({
        entityType,
        entityId,
        limit: Number.isFinite(limitParam) ? limitParam : undefined,
      });
      res.json({ items: events });
    } catch (error) {
      console.error("[creative] story audit load error", error);
      res.status(500).json({ error: "Failed to load audit history" });
    }
  });

  return router;
}

