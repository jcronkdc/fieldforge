"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const rateLimit_js_1 = require("./middleware/rateLimit.js");
const securityHeaders_js_1 = require("./middleware/securityHeaders.js");
const requestId_js_1 = require("./middleware/requestId.js");
const requestLogger_js_1 = require("./middleware/requestLogger.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const auth_js_1 = require("./middleware/auth.js");
const inputValidation_js_1 = require("./middleware/inputValidation.js");
const env_js_1 = require("./worker/env.js");
// Router imports only - no repository imports
const storyRoutes_js_1 = require("./creative/storyRoutes.js");
const characterRoutes_js_1 = require("./creative/characterRoutes.js");
const socialRoutes_js_1 = require("./social/socialRoutes.js");
const aiClient_js_1 = require("./creative/aiClient.js");
const mythacoinRoutes_js_1 = require("./mythacoin/mythacoinRoutes.js");
const feedRoutes_js_1 = require("./feed/feedRoutes.js");
const messagingRoutes_js_1 = require("./messaging/messagingRoutes.js");
const dasRoutes_js_1 = require("./das/dasRoutes.js");
const feedbackRoutes_js_1 = require("./feedback/feedbackRoutes.js");
const creativeEnginesRoutes_js_1 = require("./creative/creativeEnginesRoutes.js");
const betaRoutes_js_1 = __importDefault(require("./beta/betaRoutes.js"));
const sparksRoutes_js_1 = __importDefault(require("./sparks/sparksRoutes.js"));
const angryLipsRoutes_js_1 = require("./routes/angryLipsRoutes.js");
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
const env = (0, env_js_1.loadEnv)();
const app = (0, express_1.default)();
// Configure CORS with security best practices
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS?.split(',') || process.env.CORS_ORIGIN?.split(',') || ['https://fieldforge.vercel.app']).filter(Boolean)
        : process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || true, // In development, prefer env var if set, otherwise allow all
    credentials: true,
    maxAge: 86400, // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Input validation middleware (apply after body parsing)
app.use(inputValidation_js_1.validateRequestBody);
app.use(inputValidation_js_1.validateQueryParams);
// Security middleware (order matters - apply early)
app.use(requestId_js_1.requestIdMiddleware); // Add request ID for tracing
app.use(securityHeaders_js_1.securityHeaders); // Set security headers
app.use(requestLogger_js_1.requestLogger); // Log all requests
// Apply rate limiting to all API routes
app.use('/api', rateLimit_js_1.apiLimiter);
// Health check endpoint (no auth required)
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "mythatron-api", timestamp: new Date().toISOString() });
});
// Apply authentication middleware to ALL API routes (except health check)
app.use('/api', auth_js_1.authenticateRequest);
// Apply granular rate limiting for sensitive/compute-intensive endpoints
app.use("/api/creative/engines", rateLimit_js_1.sensitiveOperationLimiter);
app.use("/api/mythacoin", rateLimit_js_1.sensitiveOperationLimiter);
app.use("/api/sparks", rateLimit_js_1.sensitiveOperationLimiter);
// API routes
app.use("/api/creative/story", (0, storyRoutes_js_1.createStoryRouter)());
app.use("/api/creative/characters", (0, characterRoutes_js_1.createCharacterRouter)());
app.use("/api/social", (0, socialRoutes_js_1.createSocialRouter)());
app.use("/api/mythacoin", (0, mythacoinRoutes_js_1.createMythacoinRouter)());
app.use("/api/feed", (0, feedRoutes_js_1.createFeedRouter)());
app.use("/api/messaging", (0, messagingRoutes_js_1.createMessagingRouter)());
app.use("/api/das", (0, dasRoutes_js_1.createDasRouter)());
app.use("/api/feedback", (0, feedbackRoutes_js_1.createFeedbackRouter)());
app.use("/api/creative/engines", (0, creativeEnginesRoutes_js_1.createCreativeEnginesRouter)());
app.use("/api/beta", betaRoutes_js_1.default);
app.use("/api/sparks", sparksRoutes_js_1.default);
app.use("/api/angry-lips", (0, angryLipsRoutes_js_1.createAngryLipsRouter)());
// Feed stream endpoint moved to feedRoutes.js
// Mask endpoints moved to masks router
// Professor endpoints moved to professor router
// Story timeline endpoint moved to story router
// Story chapters endpoints moved to story router
// Story AI action moved to story router
// All remaining individual API routes removed
// All endpoints now go through proper router modules with authentication
// Error handling middleware (must be last)
app.use(errorHandler_js_1.notFoundHandler); // Handle 404s
app.use(errorHandler_js_1.errorHandler); // Handle all errors
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`[mythatron-api] listening on port ${port}`);
    console.log(`[mythatron-api] environment: ${process.env.NODE_ENV || 'development'}`);
});
async function generateAiAction(mode, persona, snippet) {
    const personaDescriptor = persona === "narrator"
        ? "a visionary narrator weaving cinematic transitions that maintain continuity"
        : persona === "character"
            ? "the character whose perspective drives the story, matching their voice and motives"
            : "a collaborative writer helping continue the scene";
    try {
        if (mode === "muse") {
            const { content } = await (0, aiClient_js_1.runCreativeCompletion)({
                messages: [
                    {
                        role: "system",
                        content: "You generate creative prompts for storytellers. Always respond in JSON with shape {\"prompts\":[\"idea 1\",\"idea 2\",...]} and nothing else.",
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
            }
            catch {
                // fall through to heuristic parsing below
            }
            const prompts = content
                .split("\n")
                .map((line) => line.replace(/^[-*]\s*/, "").trim())
                .filter(Boolean);
            return { mode, persona, prompts: prompts.length ? prompts : [content.trim()] };
        }
        if (mode === "critique") {
            const { content } = await (0, aiClient_js_1.runCreativeCompletion)({
                messages: [
                    {
                        role: "system",
                        content: "You critique story drafts. Always respond in JSON with shape {\"notes\":[\"point 1\",\"point 2\",...]} and nothing else.",
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
            }
            catch {
                // fall through to heuristic parsing below
            }
            const notes = content
                .split("\n")
                .map((line) => line.replace(/^[-*]\s*/, "").trim())
                .filter(Boolean);
            return { mode, persona, notes: notes.length ? notes : [content.trim()] };
        }
        const userPrompt = mode === "rewrite"
            ? `Rewrite the excerpt below, keeping the author's voice while tightening the prose and increasing urgency.\n\n${snippet}`
            : `Continue the story below with the next beat, preserving tone, stakes, and pacing.\n\n${snippet}`;
        const { content, model } = await (0, aiClient_js_1.runCreativeCompletion)({
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
    }
    catch (error) {
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
