"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * API Routes for Creative Engines
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreativeEnginesRouter = createCreativeEnginesRouter;
const express_1 = require("express");
const screenplayEngine = __importStar(require("./screenplayEngine.js"));
const songEngine = __importStar(require("./songEngine.js"));
const poetryEngine = __importStar(require("./poetryEngine.js"));
const storyEnhancements = __importStar(require("./storyEnhancements.js"));
const aiTierSystem = __importStar(require("./aiTierSystem.js"));
const auth_js_1 = require("../middleware/auth.js");
function createCreativeEnginesRouter() {
    const router = (0, express_1.Router)();
    // ============================================================================
    // SCREENPLAY ENGINE ROUTES
    // ============================================================================
    router.post("/screenplay/convert", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const screenplay = await screenplayEngine.convertToScreenplay({
                userId,
                ...req.body
            });
            res.json(screenplay);
        }
        catch (error) {
            console.error("Error converting to screenplay:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to convert to screenplay"
            });
        }
    });
    router.get("/screenplay/user/:userId", async (req, res) => {
        try {
            const screenplays = await screenplayEngine.getUserScreenplays(req.params.userId);
            res.json(screenplays);
        }
        catch (error) {
            console.error("Error fetching screenplays:", error);
            res.status(500).json({ error: "Failed to fetch screenplays" });
        }
    });
    router.get("/screenplay/:id", async (req, res) => {
        try {
            const screenplay = await screenplayEngine.getScreenplayWithScenes(req.params.id);
            res.json(screenplay);
        }
        catch (error) {
            console.error("Error fetching screenplay:", error);
            res.status(500).json({ error: "Failed to fetch screenplay" });
        }
    });
    router.get("/screenplay/:id/export", async (req, res) => {
        try {
            const screenplay = await screenplayEngine.getScreenplayWithScenes(req.params.id);
            const formatted = screenplayEngine.formatScreenplayText(screenplay);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${screenplay.title}.txt"`);
            res.send(formatted);
        }
        catch (error) {
            console.error("Error exporting screenplay:", error);
            res.status(500).json({ error: "Failed to export screenplay" });
        }
    });
    // ============================================================================
    // SONG ENGINE ROUTES
    // ============================================================================
    router.post("/song/convert", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const song = await songEngine.convertToSong({
                userId,
                ...req.body
            });
            res.json(song);
        }
        catch (error) {
            console.error("Error converting to song:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to convert to song"
            });
        }
    });
    router.get("/song/user/:userId", async (req, res) => {
        try {
            const songs = await songEngine.getUserSongs(req.params.userId);
            res.json(songs);
        }
        catch (error) {
            console.error("Error fetching songs:", error);
            res.status(500).json({ error: "Failed to fetch songs" });
        }
    });
    router.post("/song/collaborate", async (req, res) => {
        try {
            const collaboration = await songEngine.addCollaborator(req.body);
            res.json(collaboration);
        }
        catch (error) {
            console.error("Error adding collaborator:", error);
            res.status(500).json({ error: "Failed to add collaborator" });
        }
    });
    // ============================================================================
    // POETRY ENGINE ROUTES
    // ============================================================================
    router.post("/poetry/convert", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const poem = await poetryEngine.convertToPoem({
                userId,
                ...req.body
            });
            res.json(poem);
        }
        catch (error) {
            console.error("Error converting to poem:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to convert to poem"
            });
        }
    });
    router.get("/poetry/user/:userId", async (req, res) => {
        try {
            const poems = await poetryEngine.getUserPoems(req.params.userId);
            res.json(poems);
        }
        catch (error) {
            console.error("Error fetching poems:", error);
            res.status(500).json({ error: "Failed to fetch poems" });
        }
    });
    router.post("/poetry/anthology", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const anthology = await poetryEngine.createAnthology({
                userId,
                ...req.body
            });
            res.json(anthology);
        }
        catch (error) {
            console.error("Error creating anthology:", error);
            res.status(500).json({ error: "Failed to create anthology" });
        }
    });
    router.get("/poetry/forms", async (req, res) => {
        res.json({
            forms: [
                { value: 'haiku', label: 'Haiku', description: '3 lines, 5-7-5 syllables' },
                { value: 'sonnet', label: 'Sonnet', description: '14 lines, iambic pentameter' },
                { value: 'limerick', label: 'Limerick', description: '5 lines, AABBA, humorous' },
                { value: 'free_verse', label: 'Free Verse', description: 'No fixed structure' },
                { value: 'ballad', label: 'Ballad', description: 'Narrative poem, often musical' },
                { value: 'ode', label: 'Ode', description: 'Celebratory, formal structure' },
                { value: 'tanka', label: 'Tanka', description: '5 lines, 5-7-5-7-7 syllables' },
                { value: 'cinquain', label: 'Cinquain', description: '5 lines, 2-4-6-8-2 syllables' },
                { value: 'acrostic', label: 'Acrostic', description: 'First letters spell a word' },
                { value: 'villanelle', label: 'Villanelle', description: '19 lines, complex rhyme' }
            ]
        });
    });
    // ============================================================================
    // STORY ENHANCEMENT ROUTES
    // ============================================================================
    router.post("/enhancements/prologue", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const prologue = await storyEnhancements.generatePrologue({
                userId,
                ...req.body
            });
            res.json(prologue);
        }
        catch (error) {
            console.error("Error generating prologue:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to generate prologue"
            });
        }
    });
    router.post("/enhancements/epilogue", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const epilogue = await storyEnhancements.generateEpilogue({
                userId,
                ...req.body
            });
            res.json(epilogue);
        }
        catch (error) {
            console.error("Error generating epilogue:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to generate epilogue"
            });
        }
    });
    router.post("/enhancements/toc", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const toc = await storyEnhancements.generateTableOfContents({
                userId,
                ...req.body
            });
            res.json(toc);
        }
        catch (error) {
            console.error("Error generating table of contents:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to generate table of contents"
            });
        }
    });
    router.post("/enhancements/characters", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const profiles = await storyEnhancements.generateCharacterProfiles({
                userId,
                ...req.body
            });
            res.json(profiles);
        }
        catch (error) {
            console.error("Error generating character profiles:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to generate character profiles"
            });
        }
    });
    router.post("/enhancements/marketing", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const marketing = await storyEnhancements.generateMarketingCopy({
                userId,
                ...req.body
            });
            res.json(marketing);
        }
        catch (error) {
            console.error("Error generating marketing copy:", error);
            res.status(error.message.includes("tier") ? 403 : 500).json({
                error: error.message || "Failed to generate marketing copy"
            });
        }
    });
    router.get("/enhancements/story/:storyId", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const enhancements = await storyEnhancements.getStoryEnhancements(req.params.storyId, userId);
            res.json(enhancements);
        }
        catch (error) {
            console.error("Error fetching enhancements:", error);
            res.status(500).json({ error: "Failed to fetch enhancements" });
        }
    });
    // ============================================================================
    // AI TIER SYSTEM ROUTES
    // ============================================================================
    router.get("/ai/tiers", async (req, res) => {
        try {
            const tiers = await aiTierSystem.getAvailableTiers();
            res.json(tiers);
        }
        catch (error) {
            console.error("Error fetching AI tiers:", error);
            res.status(500).json({ error: "Failed to fetch AI tiers" });
        }
    });
    router.get("/ai/tier/current", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const tier = await aiTierSystem.getUserTier(userId);
            res.json(tier);
        }
        catch (error) {
            console.error("Error fetching user tier:", error);
            res.status(500).json({ error: "Failed to fetch user tier" });
        }
    });
    router.post("/ai/tier/upgrade", auth_js_1.authenticateRequest, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const subscription = await aiTierSystem.upgradeTier(userId, req.body.tierId, req.body.paymentMethod);
            res.json(subscription);
        }
        catch (error) {
            console.error("Error upgrading tier:", error);
            res.status(500).json({ error: "Failed to upgrade tier" });
        }
    });
    return router;
}
