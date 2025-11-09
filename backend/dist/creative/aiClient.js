"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCreativeCompletion = runCreativeCompletion;
const node_fetch_1 = __importDefault(require("node-fetch"));
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const CHAT_PATH = "/chat/completions";
async function runCreativeCompletion({ messages, temperature, maxTokens, model, apiKey, }) {
    const resolvedModel = model ?? env.AI_PROVIDER_MODEL ?? env.AI_FALLBACK_MODEL ?? "anthropic/claude-3-haiku";
    const resolvedKey = apiKey ?? env.AI_PROVIDER_API_KEY ?? env.AI_FALLBACK_API_KEY;
    if (!resolvedKey) {
        throw new Error("AI provider API key is not configured");
    }
    const baseUrl = (env.AI_PROVIDER_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const url = `${baseUrl}${CHAT_PATH}`;
    const body = {
        model: resolvedModel,
        messages,
    };
    if (typeof temperature === "number") {
        body.temperature = temperature;
    }
    if (typeof maxTokens === "number") {
        body.max_tokens = maxTokens;
    }
    const response = await (0, node_fetch_1.default)(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resolvedKey}`,
            "X-Title": "MythaTron Creative Engine",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(`AI provider error (${response.status}): ${message}`);
    }
    const json = (await response.json());
    const choice = json.choices?.[0];
    const content = choice?.message?.content ?? choice?.text;
    if (!content) {
        throw new Error("AI provider returned no content");
    }
    return {
        content,
        model: json.model ?? resolvedModel,
    };
}
