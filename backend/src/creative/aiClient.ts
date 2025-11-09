import fetch from "node-fetch";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const CHAT_PATH = "/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  apiKey?: string;
}

export async function runCreativeCompletion({
  messages,
  temperature,
  maxTokens,
  model,
  apiKey,
}: ChatCompletionOptions): Promise<{ content: string; model: string }> {
  const resolvedModel =
    model ?? env.AI_PROVIDER_MODEL ?? env.AI_FALLBACK_MODEL ?? "anthropic/claude-3-haiku";
  const resolvedKey = apiKey ?? env.AI_PROVIDER_API_KEY ?? env.AI_FALLBACK_API_KEY;
  if (!resolvedKey) {
    throw new Error("AI provider API key is not configured");
  }

  const baseUrl = (env.AI_PROVIDER_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const url = `${baseUrl}${CHAT_PATH}`;

  const body: Record<string, unknown> = {
    model: resolvedModel,
    messages,
  };
  if (typeof temperature === "number") {
    body.temperature = temperature;
  }
  if (typeof maxTokens === "number") {
    body.max_tokens = maxTokens;
  }

  const response = await fetch(url, {
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

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
    model?: string;
  };

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

