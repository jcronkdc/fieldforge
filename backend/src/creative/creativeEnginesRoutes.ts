/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * API Routes for Creative Engines
 */

import { Router, Request, Response } from "express";
import * as screenplayEngine from "./screenplayEngine.js";
import * as songEngine from "./songEngine.js";
import * as poetryEngine from "./poetryEngine.js";
import * as storyEnhancements from "./storyEnhancements.js";
import * as aiTierSystem from "./aiTierSystem.js";

export function createCreativeEnginesRouter(): Router {
  const router = Router();

  // ============================================================================
  // SCREENPLAY ENGINE ROUTES
  // ============================================================================

  router.post("/screenplay/convert", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const screenplay = await screenplayEngine.convertToScreenplay({
        userId,
        ...req.body
      });

      res.json(screenplay);
    } catch (error: any) {
      console.error("Error converting to screenplay:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to convert to screenplay" 
      });
    }
  });

  router.get("/screenplay/user/:userId", async (req: Request, res: Response) => {
    try {
      const screenplays = await screenplayEngine.getUserScreenplays(req.params.userId);
      res.json(screenplays);
    } catch (error) {
      console.error("Error fetching screenplays:", error);
      res.status(500).json({ error: "Failed to fetch screenplays" });
    }
  });

  router.get("/screenplay/:id", async (req: Request, res: Response) => {
    try {
      const screenplay = await screenplayEngine.getScreenplayWithScenes(req.params.id);
      res.json(screenplay);
    } catch (error) {
      console.error("Error fetching screenplay:", error);
      res.status(500).json({ error: "Failed to fetch screenplay" });
    }
  });

  router.get("/screenplay/:id/export", async (req: Request, res: Response) => {
    try {
      const screenplay = await screenplayEngine.getScreenplayWithScenes(req.params.id);
      const formatted = screenplayEngine.formatScreenplayText(screenplay);
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${screenplay.title}.txt"`);
      res.send(formatted);
    } catch (error) {
      console.error("Error exporting screenplay:", error);
      res.status(500).json({ error: "Failed to export screenplay" });
    }
  });

  // ============================================================================
  // SONG ENGINE ROUTES
  // ============================================================================

  router.post("/song/convert", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const song = await songEngine.convertToSong({
        userId,
        ...req.body
      });

      res.json(song);
    } catch (error: any) {
      console.error("Error converting to song:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to convert to song" 
      });
    }
  });

  router.get("/song/user/:userId", async (req: Request, res: Response) => {
    try {
      const songs = await songEngine.getUserSongs(req.params.userId);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  router.post("/song/collaborate", async (req: Request, res: Response) => {
    try {
      const collaboration = await songEngine.addCollaborator(req.body);
      res.json(collaboration);
    } catch (error) {
      console.error("Error adding collaborator:", error);
      res.status(500).json({ error: "Failed to add collaborator" });
    }
  });

  // ============================================================================
  // POETRY ENGINE ROUTES
  // ============================================================================

  router.post("/poetry/convert", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const poem = await poetryEngine.convertToPoem({
        userId,
        ...req.body
      });

      res.json(poem);
    } catch (error: any) {
      console.error("Error converting to poem:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to convert to poem" 
      });
    }
  });

  router.get("/poetry/user/:userId", async (req: Request, res: Response) => {
    try {
      const poems = await poetryEngine.getUserPoems(req.params.userId);
      res.json(poems);
    } catch (error) {
      console.error("Error fetching poems:", error);
      res.status(500).json({ error: "Failed to fetch poems" });
    }
  });

  router.post("/poetry/anthology", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const anthology = await poetryEngine.createAnthology({
        userId,
        ...req.body
      });

      res.json(anthology);
    } catch (error) {
      console.error("Error creating anthology:", error);
      res.status(500).json({ error: "Failed to create anthology" });
    }
  });

  router.get("/poetry/forms", async (req: Request, res: Response) => {
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

  router.post("/enhancements/prologue", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const prologue = await storyEnhancements.generatePrologue({
        userId,
        ...req.body
      });

      res.json(prologue);
    } catch (error: any) {
      console.error("Error generating prologue:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to generate prologue" 
      });
    }
  });

  router.post("/enhancements/epilogue", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const epilogue = await storyEnhancements.generateEpilogue({
        userId,
        ...req.body
      });

      res.json(epilogue);
    } catch (error: any) {
      console.error("Error generating epilogue:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to generate epilogue" 
      });
    }
  });

  router.post("/enhancements/toc", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const toc = await storyEnhancements.generateTableOfContents({
        userId,
        ...req.body
      });

      res.json(toc);
    } catch (error: any) {
      console.error("Error generating table of contents:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to generate table of contents" 
      });
    }
  });

  router.post("/enhancements/characters", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const profiles = await storyEnhancements.generateCharacterProfiles({
        userId,
        ...req.body
      });

      res.json(profiles);
    } catch (error: any) {
      console.error("Error generating character profiles:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to generate character profiles" 
      });
    }
  });

  router.post("/enhancements/marketing", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const marketing = await storyEnhancements.generateMarketingCopy({
        userId,
        ...req.body
      });

      res.json(marketing);
    } catch (error: any) {
      console.error("Error generating marketing copy:", error);
      res.status(error.message.includes("tier") ? 403 : 500).json({ 
        error: error.message || "Failed to generate marketing copy" 
      });
    }
  });

  router.get("/enhancements/story/:storyId", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const enhancements = await storyEnhancements.getStoryEnhancements(
        req.params.storyId,
        userId
      );

      res.json(enhancements);
    } catch (error) {
      console.error("Error fetching enhancements:", error);
      res.status(500).json({ error: "Failed to fetch enhancements" });
    }
  });

  // ============================================================================
  // AI TIER SYSTEM ROUTES
  // ============================================================================

  router.get("/ai/tiers", async (req: Request, res: Response) => {
    try {
      const tiers = await aiTierSystem.getAvailableTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching AI tiers:", error);
      res.status(500).json({ error: "Failed to fetch AI tiers" });
    }
  });

  router.get("/ai/tier/current", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const tier = await aiTierSystem.getUserTier(userId);
      res.json(tier);
    } catch (error) {
      console.error("Error fetching user tier:", error);
      res.status(500).json({ error: "Failed to fetch user tier" });
    }
  });

  router.post("/ai/tier/upgrade", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const subscription = await aiTierSystem.upgradeTier(
        userId,
        req.body.tierId,
        req.body.paymentMethod
      );

      res.json(subscription);
    } catch (error) {
      console.error("Error upgrading tier:", error);
      res.status(500).json({ error: "Failed to upgrade tier" });
    }
  });

  return router;
}
