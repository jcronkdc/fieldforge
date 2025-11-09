"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIFill = generateAIFill;
const aiClient_js_1 = require("../creative/aiClient.js");
async function generateAIFill({ prompt, model = "gpt-4o-mini", apiKey }) {
    try {
        const { content, model: usedModel } = await (0, aiClient_js_1.runCreativeCompletion)({
            messages: [
                {
                    role: "system",
                    content: "You are the witty Angry Lips AI co-host. Respond with a single imaginative blank fill that fits the tone, usually one sentence.",
                },
                {
                    role: "user",
                    content: `Fill in the blank creatively:\n\n${prompt}`,
                },
            ],
            temperature: 0.95,
            model,
            apiKey,
        });
        return {
            content: content.trim(),
            model: usedModel ?? model,
        };
    }
    catch (error) {
        console.warn("[ai] fallback to heuristic Angry Lips fill", error);
        const suffix = prompt.length > 120 ? `${prompt.slice(0, 120)}...` : prompt;
        return {
            content: `AI improv: ${suffix}`,
            model,
        };
    }
}
