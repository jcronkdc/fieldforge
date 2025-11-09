"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCharacterRouter = createCharacterRouter;
const express_1 = __importDefault(require("express"));
const characterRepository_js_1 = require("./characterRepository.js");
function createCharacterRouter() {
    const router = express_1.default.Router();
    router.get("/", async (req, res) => {
        const worldId = typeof req.query.worldId === "string" ? req.query.worldId : undefined;
        const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
        if (!worldId) {
            return res.status(400).json({ error: "worldId is required" });
        }
        try {
            const characters = await (0, characterRepository_js_1.listCharacters)(worldId, Number.isFinite(limitParam) ? limitParam : 50);
            res.json({ items: characters });
        }
        catch (error) {
            console.error("[creative] character list error", error);
            res.status(500).json({ error: "Failed to load characters" });
        }
    });
    router.get("/:id", async (req, res) => {
        try {
            const character = await (0, characterRepository_js_1.getCharacter)(req.params.id);
            if (!character) {
                return res.status(404).json({ error: "Character not found" });
            }
            res.json({ character });
        }
        catch (error) {
            console.error("[creative] character detail error", error);
            res.status(500).json({ error: "Failed to load character" });
        }
    });
    router.post("/", async (req, res) => {
        const { worldId, displayName } = req.body ?? {};
        if (!worldId || !displayName) {
            return res.status(400).json({ error: "worldId and displayName are required" });
        }
        try {
            const character = await (0, characterRepository_js_1.createCharacter)({
                worldId,
                displayName,
                summary: req.body?.summary,
                tagline: req.body?.tagline,
                tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
                createdBy: req.body?.createdBy,
                initialVersion: req.body?.initialVersion,
            });
            res.status(201).json({ character });
        }
        catch (error) {
            console.error("[creative] create character error", error);
            res.status(500).json({ error: "Failed to create character" });
        }
    });
    router.post("/:id/versions", async (req, res) => {
        const { id } = req.params;
        try {
            const version = await (0, characterRepository_js_1.addCharacterVersion)({
                characterId: id,
                title: req.body?.title,
                summary: req.body?.summary,
                traits: req.body?.traits,
                notes: req.body?.notes,
                createdBy: req.body?.createdBy,
                setCanonical: Boolean(req.body?.setCanonical),
            });
            res.status(201).json({ version });
        }
        catch (error) {
            console.error("[creative] add character version error", error);
            res.status(500).json({ error: "Failed to add character version" });
        }
    });
    router.post("/:id/relationships", async (req, res) => {
        const { id } = req.params;
        const { targetCharacterId, relationshipType } = req.body ?? {};
        if (!targetCharacterId || !relationshipType) {
            return res.status(400).json({ error: "targetCharacterId and relationshipType are required" });
        }
        try {
            const relationship = await (0, characterRepository_js_1.upsertRelationship)({
                characterId: id,
                targetCharacterId,
                relationshipType,
                strength: typeof req.body?.strength === "number" ? req.body.strength : undefined,
                context: req.body?.context,
                createdBy: req.body?.createdBy,
            });
            res.status(201).json({ relationship });
        }
        catch (error) {
            console.error("[creative] upsert relationship error", error);
            res.status(500).json({ error: "Failed to update relationship" });
        }
    });
    return router;
}
