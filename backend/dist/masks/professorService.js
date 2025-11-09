"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProfessorCritique = generateProfessorCritique;
const registry_js_1 = require("./registry.js");
const analytics_js_1 = require("../worker/analytics.js");
const env_js_1 = require("../worker/env.js");
const professorRepository_js_1 = require("./professorRepository.js");
const MODE_CONFIG = {
    serious: {
        tone: "Academic",
        intro: "Let us examine your work with a studious eye.",
    },
    funny: {
        tone: "Witty",
        intro: "Class, gather round—this piece brought snacks.",
        punchline: "Humour aside, the insights below are quite real.",
    },
    insult: {
        tone: "Hypercritical",
        intro: "Prepare yourself; we are grading with the red pen uncapped.",
    },
    heckler: {
        tone: "Heckling",
        intro: "I'm shouting from the back row and scribbling notes simultaneously.",
    },
    chaos: {
        tone: "Chaotic Blend",
        intro: "Dice rolled, personas shuffled—let's see which professor shows up line by line.",
    },
    custom: {
        tone: "Custom",
        intro: "Activating your bespoke professorial vibe.",
    },
};
const DEFAULT_FIELDS = ["structure", "clarity", "creativity", "correctness"];
const env = (0, env_js_1.loadEnv)();
async function generateProfessorCritique(input) {
    if (!input.content || input.content.trim().length === 0) {
        throw new Error("content is required");
    }
    const mode = (input.mode ?? "serious");
    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.serious;
    const session = await registry_js_1.maskRegistry.activateMask({
        maskId: "mask.professor",
        userId: input.userId,
        projectId: input.projectId,
        context: {
            mode,
            objectType: input.objectType ?? "story",
            customTone: input.customTone ?? undefined,
        },
        metadata: {
            requestedMode: mode,
            customTone: input.customTone ?? null,
        },
    });
    await (0, analytics_js_1.capture)({
        event: "mask_session_started",
        properties: {
            mask_id: session.maskId,
            mask_version: session.maskVersion,
            session_id: session.sessionId,
            mode,
            user_id: input.userId ?? null,
            project_id: input.projectId ?? null,
            source: "professor_service",
        },
    }, env.POSTHOG_API_KEY);
    const metrics = computeMetrics(input.content);
    const scores = buildScores(metrics, input.objectType);
    const { strengths, risks, suggestions } = craftFeedback(metrics, scores, mode);
    await registry_js_1.maskRegistry.endSession(session.sessionId, "completed");
    await (0, analytics_js_1.capture)({
        event: "mask_session_ended",
        properties: {
            session_id: session.sessionId,
            mask_id: session.maskId,
            ended_reason: "completed",
            source: "professor_service",
        },
    }, env.POSTHOG_API_KEY);
    const summaryParts = [modeConfig.intro];
    if (mode === "custom" && input.customTone) {
        summaryParts.push(`Custom tone keywords: ${input.customTone}.`);
    }
    if (modeConfig.punchline) {
        summaryParts.push(modeConfig.punchline);
    }
    await (0, analytics_js_1.capture)({
        event: "professor_critique_generated",
        properties: {
            session_id: session.sessionId,
            mask_id: session.maskId,
            mode,
            tone: modeConfig.tone,
            object_type: input.objectType ?? "story",
            scores,
            metrics,
        },
    }, env.POSTHOG_API_KEY);
    await (0, professorRepository_js_1.insertProfessorCritique)({
        storyId: input.storyId,
        userId: input.userId,
        projectId: input.projectId,
        maskSessionId: session.sessionId,
        maskId: session.maskId,
        maskVersion: session.maskVersion,
        mode,
        tone: modeConfig.tone,
        summary: summaryParts.join(" "),
        strengths: dedupe(strengths),
        risks: dedupe(risks),
        suggestions: dedupe(suggestions),
        scores,
        metrics,
        customTone: input.customTone,
    });
    return {
        session,
        tone: modeConfig.tone,
        summary: summaryParts.join(" "),
        strengths,
        risks,
        suggestions,
        scores,
        metrics,
    };
}
function computeMetrics(content) {
    const words = content.trim().split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    const wordCount = words.length;
    const sentenceCount = Math.max(sentences.length, 1);
    const avgSentenceLength = wordCount / sentenceCount;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const uniqueWordRatio = uniqueWords / Math.max(wordCount, 1);
    const readabilityIndex = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * syllableEstimate(words) / sentenceCount));
    return {
        wordCount,
        sentenceCount,
        avgSentenceLength,
        uniqueWordRatio,
        readabilityIndex,
    };
}
function syllableEstimate(words) {
    return words.reduce((total, word) => {
        const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
        if (!cleaned)
            return total;
        const matches = cleaned.match(/[aeiouy]+/g);
        return total + (matches ? matches.length : 1);
    }, 0);
}
function buildScores(metrics, objectType) {
    const baseScores = {};
    DEFAULT_FIELDS.forEach((field) => {
        baseScores[field] = 0;
    });
    baseScores.structure = normalizeScore(80 - Math.abs(metrics.avgSentenceLength - 18) * 3);
    baseScores.clarity = normalizeScore(metrics.readabilityIndex);
    baseScores.creativity = normalizeScore(metrics.uniqueWordRatio * 120);
    baseScores.correctness = normalizeScore(60 + metrics.readabilityIndex / 2);
    if (objectType === "song" || objectType === "poem") {
        baseScores.creativity = normalizeScore(baseScores.creativity + 10);
    }
    return baseScores;
}
function normalizeScore(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function craftFeedback(metrics, scores, mode) {
    const strengths = [];
    const risks = [];
    const suggestions = [];
    if (scores.creativity > 70)
        strengths.push("Inventive vocabulary keeps the piece lively.");
    if (scores.clarity > 70)
        strengths.push("Sentences read smoothly with clear intent.");
    if (metrics.uniqueWordRatio > 0.4)
        strengths.push("Distinct phrasing prevents repetition fatigue.");
    if (scores.structure < 55)
        risks.push("Structure feels uneven—consider tightening paragraph transitions.");
    if (scores.clarity < 55)
        risks.push("Clarity slips in places; some sentences overstay their welcome.");
    if (metrics.avgSentenceLength > 24)
        risks.push("Sentence length skews long, risking reader fatigue.");
    suggestions.push("Refine the opening to declare stakes sooner.");
    if (scores.correctness < 65)
        suggestions.push("Run a grammar pass to eliminate surface errors.");
    suggestions.push("Highlight the protagonist's motivation to solidify emotional resonance.");
    if (mode === "insult") {
        risks.push("Even your metaphors look exhausted—wake them up.");
        suggestions.push("Rewrite the dullest paragraph as if a rival were grading you.");
    }
    else if (mode === "heckler") {
        suggestions.push("Imagine me heckling each bland sentence—cut them before I do.");
    }
    else if (mode === "funny") {
        strengths.push("Timing lands like a well-placed punchline.");
    }
    return {
        strengths: dedupe(strengths),
        risks: dedupe(risks),
        suggestions: dedupe(suggestions),
    };
}
function dedupe(items) {
    return Array.from(new Set(items.filter(Boolean)));
}
