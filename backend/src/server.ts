import express, { type Request, type Response } from "express";
import cors from "cors";
import { apiLimiter, authLimiter, sensitiveOperationLimiter } from "./middleware/rateLimit.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authenticateRequest } from "./middleware/auth.js";
import { validateRequestBody, validateQueryParams } from "./middleware/inputValidation.js";
import { maskRegistry } from "./masks/registry.js";
import { capture } from "./worker/analytics.js";
import type { ActivateMaskInput } from "./masks/types.js";
import { loadEnv } from "./worker/env.js";
import { generateProfessorCritique } from "./masks/professorService.js";
import { fetchProfessorCritiques } from "./masks/professorRepository.js";
import { getSampleTimeline } from "./story/sampleTimeline.js";
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
  type StoryNode,
} from "./story/storyRepository.js";
import { logStoryNotification, fetchStoryNotifications } from "./story/notificationRepository.js";
import {
  createSession as createAngryLipsSession,
  getSession as getAngryLipsSession,
  listSessions as listAngryLipsSessions,
  submitTurn as submitAngryLipsTurn,
  autoFillTurn as autoFillAngryLipsTurn,
  logTurnEvent as logAngryLipsTurnEvent,
  completeSession as completeAngryLipsSession,
  inviteParticipants as inviteAngryLipsParticipants,
  respondToInvitation as respondAngryLipsInvitation,
  listSessionParticipants as listAngryLipsParticipants,
  startSession as startAngryLipsSession,
  advanceTurn as advanceAngryLipsTurn,
  summarizeSession as summarizeAngryLipsSession,
  generateAiStory as generateAngryLipsStory,
  publishVaultEntry as publishAngryLipsEntry,
  listPublishedEntries as listAngryLipsPublishedEntries,
} from "./angryLips/sessionRepository.js";
import { createTokenRequest as createRealtimeTokenRequest } from "./realtime/ablyPublisher.js";
import { createStoryRouter } from "./creative/storyRoutes.js";
import { createCharacterRouter } from "./creative/characterRoutes.js";
import { recordAuditEvent, enqueueCoherenceEvent } from "./creative/auditRepository.js";
import { runCreativeCompletion } from "./creative/aiClient.js";
import { createSocialRouter } from "./social/socialRoutes.js";
import { listStreamEvents } from "./feed/feedRepository.js";
import { createMythacoinRouter } from "./mythacoin/mythacoinRoutes.js";
import { createFeedRouter } from "./feed/feedRoutes.js";
import { createMessagingRouter } from "./messaging/messagingRoutes.js";
import { createDasRouter } from "./das/dasRoutes.js";
import { createFeedbackRouter } from "./feedback/feedbackRoutes.js";
import { createCreativeEnginesRouter } from "./creative/creativeEnginesRoutes.js";
import betaRouter from "./beta/betaRoutes.js";
import sparksRouter from "./sparks/sparksRoutes.js";

/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 * 
 * MythaTron™ is a trademark of Cronk Companies, LLC.
 * This application is 100% founded and built by Cronk Companies, LLC.
 * 
 * Unauthorized copying, modification, or distribution of this code
 * is strictly prohibited and will be prosecuted to the fullest extent of the law.
 * 
 * For licensing inquiries: mythatron@proton.me
 */

const env = loadEnv();
const app = express();

// Configure CORS with security best practices
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS?.split(',') || process.env.CORS_ORIGIN?.split(',') || ['https://fieldforge.vercel.app']).filter(Boolean)
    : process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || true, // In development, prefer env var if set, otherwise allow all
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation middleware (apply after body parsing)
app.use(validateRequestBody);
app.use(validateQueryParams);

// Security middleware (order matters - apply early)
app.use(requestIdMiddleware); // Add request ID for tracing
app.use(securityHeaders); // Set security headers
app.use(requestLogger); // Log all requests

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint (no auth required)
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "mythatron-api", timestamp: new Date().toISOString() });
});

// Apply authentication middleware to ALL API routes (except health check)
app.use('/api', authenticateRequest);

// Apply granular rate limiting for sensitive/compute-intensive endpoints
app.use("/api/creative/engines", sensitiveOperationLimiter);
app.use("/api/mythacoin", sensitiveOperationLimiter);
app.use("/api/sparks", sensitiveOperationLimiter);

// API routes
app.use("/api/creative/story", createStoryRouter());
app.use("/api/creative/characters", createCharacterRouter());
app.use("/api/social", createSocialRouter());
app.use("/api/mythacoin", createMythacoinRouter());
app.use("/api/feed", createFeedRouter());
app.use("/api/messaging", createMessagingRouter());
app.use("/api/das", createDasRouter());
app.use("/api/feedback", createFeedbackRouter());
app.use("/api/creative/engines", createCreativeEnginesRouter());
app.use("/api/beta", betaRouter);
app.use("/api/sparks", sparksRouter);

// Feed stream endpoint moved to feedRoutes.js

// Mask endpoints moved to masks router

// Professor endpoints moved to professor router

// Story timeline endpoint moved to story router

// Story chapters endpoints moved to story router






// Story AI action moved to story router

// All remaining individual API routes removed
// All endpoints now go through proper router modules with authentication

// Error handling middleware (must be last)
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all errors

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`[mythatron-api] listening on port ${port}`);
  console.log(`[mythatron-api] environment: ${process.env.NODE_ENV || 'development'}`);
});

async function generateAiAction(mode: string, persona: string, snippet: string) {
  const personaDescriptor =
    persona === "narrator"
      ? "a visionary narrator weaving cinematic transitions that maintain continuity"
      : persona === "character"
      ? "the character whose perspective drives the story, matching their voice and motives"
      : "a collaborative writer helping continue the scene";

  try {
    if (mode === "muse") {
      const { content } = await runCreativeCompletion({
        messages: [
          {
            role: "system",
            content:
              "You generate creative prompts for storytellers. Always respond in JSON with shape {\"prompts\":[\"idea 1\",\"idea 2\",...]} and nothing else.",
          },
          {
            role: "user",
            content: `Provide three surprising prompts that could evolve this story beat:\n\n${snippet}`,
          },
        ],
        temperature: 0.85,
      });
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.prompts) && parsed.prompts.length) {
          return { mode, persona, prompts: parsed.prompts };
        }
      } catch {
        // fall through to heuristic parsing below
      }
      const prompts = content
        .split("\n")
        .map((line: string) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
      return { mode, persona, prompts: prompts.length ? prompts : [content.trim()] };
    }

    if (mode === "critique") {
      const { content } = await runCreativeCompletion({
        messages: [
          {
            role: "system",
            content:
              "You critique story drafts. Always respond in JSON with shape {\"notes\":[\"point 1\",\"point 2\",...]} and nothing else.",
          },
          {
            role: "user",
            content: `Give clear, actionable critique for the excerpt below:\n\n${snippet}`,
          },
        ],
        temperature: 0.4,
      });
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.notes) && parsed.notes.length) {
          return { mode, persona, notes: parsed.notes };
        }
      } catch {
        // fall through to heuristic parsing below
      }
      const notes = content
        .split("\n")
        .map((line: string) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
      return { mode, persona, notes: notes.length ? notes : [content.trim()] };
    }

    const userPrompt =
      mode === "rewrite"
        ? `Rewrite the excerpt below, keeping the author's voice while tightening the prose and increasing urgency.\n\n${snippet}`
        : `Continue the story below with the next beat, preserving tone, stakes, and pacing.\n\n${snippet}`;

    const { content, model } = await runCreativeCompletion({
      messages: [
        {
          role: "system",
          content: `You are ${personaDescriptor}. Honor established continuity, avoid contradictions, and keep the response focused.`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: mode === "rewrite" ? 0.6 : 0.9,
    });

    return {
      mode,
      persona,
      model,
      content: content.trim(),
    };
  } catch (error) {
    console.warn("[ai] falling back to heuristic generation", error);
    if (persona === "narrator") {
      return {
        mode,
        persona,
        content: `${snippet}\n\n[Narrator] The skyline hums as the aurora core shifts the stakes.`,
      };
    }
    if (persona === "character") {
      return {
        mode,
        persona,
        content: `${snippet}\n\n"I'll rewrite destinies myself," the protagonist mutters, pulse synced with the aurora.`,
      };
    }
    if (mode === "muse") {
      return {
        mode,
        persona,
        prompts: [
          "Introduce a rival crew secretly funded by the same client.",
          "Reveal that the aurora core is rewriting the crew's memories.",
          "Cut to a city-wide broadcast reacting in real time.",
        ],
      };
    }
    if (mode === "critique") {
      return {
        mode,
        persona,
        notes: ["Highlight the antagonist sooner", "Clarify the hijack stakes"],
      };
    }
    return {
      mode,
      persona,
      content: `${snippet}\n\nAnd the city answers with an encrypted beacon begging to be chased.`,
    };
  }
}

