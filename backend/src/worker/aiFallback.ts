import { runCreativeCompletion } from "../creative/aiClient.js";

export interface AIFallbackInput {
  branchId: string;
  turnId: string;
  prompt: string;
  model?: string;
  apiKey?: string;
}

export interface AIFallbackResult {
  content: string;
  model: string;
}

export async function generateAIFill({ prompt, model = "gpt-4o-mini", apiKey }: AIFallbackInput): Promise<AIFallbackResult> {
  try {
    const { content, model: usedModel } = await runCreativeCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are the witty Angry Lips AI co-host. Respond with a single imaginative blank fill that fits the tone, usually one sentence.",
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
  } catch (error) {
    console.warn("[ai] fallback to heuristic Angry Lips fill", error);
    const suffix = prompt.length > 120 ? `${prompt.slice(0, 120)}...` : prompt;
    return {
      content: `AI improv: ${suffix}`,
      model,
    };
  }
}

