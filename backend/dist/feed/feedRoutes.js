"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedRouter = createFeedRouter;
const express_1 = __importDefault(require("express"));
const feedRepository_js_1 = require("./feedRepository.js");
function parseEventTypes(value) {
    if (typeof value !== "string" || value.trim() === "")
        return [];
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}
function createFeedRouter() {
    const router = express_1.default.Router();
    router.get("/", async (req, res) => {
        const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
        const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const sort = req.query.sort === "popular" ? "popular" : "latest";
        const eventTypes = parseEventTypes(req.query.eventType);
        const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
        try {
            const events = await (0, feedRepository_js_1.fetchFeedCards)({
                limit,
                offset,
                search,
                sort,
                eventTypes: eventTypes,
                userId,
            });
            res.json({ items: events });
        }
        catch (error) {
            console.error("[api] feed list", error);
            res.status(500).json({ error: "Failed to load feed" });
        }
    });
    router.post("/:eventId/like", async (req, res) => {
        const { eventId } = req.params;
        const { userId, like = true } = req.body ?? {};
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const result = await (0, feedRepository_js_1.setFeedLike)(eventId, userId, Boolean(like));
            res.json(result);
        }
        catch (error) {
            console.error("[api] feed like", error);
            res.status(500).json({ error: "Failed to update like" });
        }
    });
    router.delete("/:eventId/like", async (req, res) => {
        const { eventId } = req.params;
        const { userId } = req.body ?? {};
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const result = await (0, feedRepository_js_1.setFeedLike)(eventId, userId, false);
            res.json(result);
        }
        catch (error) {
            console.error("[api] feed unlike", error);
            res.status(500).json({ error: "Failed to remove like" });
        }
    });
    router.get("/:eventId/comments", async (req, res) => {
        const { eventId } = req.params;
        const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
        const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
        try {
            const comments = await (0, feedRepository_js_1.listFeedComments)(eventId, limit ?? 20, offset ?? 0);
            res.json({ items: comments });
        }
        catch (error) {
            console.error("[api] feed comments list", error);
            res.status(500).json({ error: "Failed to load comments" });
        }
    });
    router.post("/:eventId/comments", async (req, res) => {
        const { eventId } = req.params;
        const { userId, body } = req.body ?? {};
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const comment = await (0, feedRepository_js_1.createFeedComment)(eventId, userId, body ?? "");
            res.status(201).json({ comment });
        }
        catch (error) {
            console.error("[api] feed comment create", error);
            res.status(500).json({ error: error.message ?? "Failed to add comment" });
        }
    });
    router.post("/:eventId/repost", async (req, res) => {
        const { eventId } = req.params;
        const { userId, repost = true } = req.body ?? {};
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const result = await (0, feedRepository_js_1.setFeedRepost)(eventId, userId, Boolean(repost));
            res.json(result);
        }
        catch (error) {
            console.error("[api] feed repost", error);
            res.status(500).json({ error: "Failed to update repost" });
        }
    });
    router.delete("/:eventId/repost", async (req, res) => {
        const { eventId } = req.params;
        const { userId } = req.body ?? {};
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required" });
        }
        try {
            const result = await (0, feedRepository_js_1.setFeedRepost)(eventId, userId, false);
            res.json(result);
        }
        catch (error) {
            console.error("[api] feed repost delete", error);
            res.status(500).json({ error: "Failed to remove repost" });
        }
    });
    return router;
}
