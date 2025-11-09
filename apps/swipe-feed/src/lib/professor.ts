export type ProfessorMode = "serious" | "funny" | "insult" | "heckler" | "chaos" | "custom";

export interface ProfessorCritique {
  tone: string;
  summary: string;
  strengths: string[];
  risks: string[];
  suggestions: string[];
  scores: Record<string, number>;
  metrics: {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    uniqueWordRatio: number;
    readabilityIndex: number;
  };
}

export interface ProfessorCritiqueHistoryItem {
  mode: ProfessorMode;
  customTone?: string;
  createdAt: string;
  critique: ProfessorCritique;
}

interface CritiqueOptions {
  content: string;
  mode?: ProfessorMode;
  objectType?: string;
  customTone?: string;
  storyId?: string;
}

export async function requestProfessorCritique(options: CritiqueOptions): Promise<ProfessorCritique> {
  const response = await fetch("/api/professor/critique", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Professor critique failed with status ${response.status}`);
  }

  const json = await response.json();
  return {
    tone: json.tone,
    summary: json.summary,
    strengths: json.strengths ?? [],
    risks: json.risks ?? [],
    suggestions: json.suggestions ?? [],
    scores: json.scores ?? {},
    metrics: json.metrics ?? {
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      uniqueWordRatio: 0,
      readabilityIndex: 0,
    },
  };
}

export async function fetchProfessorCritiqueHistory(params: {
  storyId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<ProfessorCritiqueHistoryItem[]> {
  const searchParams = new URLSearchParams();
  if (params.storyId) searchParams.set("storyId", params.storyId);
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));

  if (!searchParams.has("storyId") && !searchParams.has("userId")) {
    throw new Error("Provide storyId or userId to fetch professor critiques");
  }

  const response = await fetch(`/api/professor/critique/history?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch critique history (${response.status})`);
  }

  const json = await response.json();
  const items = Array.isArray(json.items) ? json.items : [];
  
  interface CritiqueHistoryResponse {
    mode?: string;
    customTone?: string;
    custom_tone?: string;
    createdAt?: string;
    created_at?: string;
    tone: string;
    summary?: string;
    strengths?: string[];
    risks?: string[];
    suggestions?: string[];
    scores?: Record<string, number>;
    metrics?: {
      wordCount: number;
      sentenceCount: number;
      avgSentenceLength: number;
      uniqueWordRatio: number;
      readabilityIndex: number;
    };
  }
  
  return items.map((item: CritiqueHistoryResponse) => ({
    mode: (item.mode ?? "serious") as ProfessorMode,
    customTone: item.customTone ?? item.custom_tone ?? undefined,
    createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
    critique: {
      tone: item.tone,
      summary: item.summary ?? "",
      strengths: item.strengths ?? [],
      risks: item.risks ?? [],
      suggestions: item.suggestions ?? [],
      scores: item.scores ?? {},
      metrics: item.metrics ?? {
        wordCount: 0,
        sentenceCount: 0,
        avgSentenceLength: 0,
        uniqueWordRatio: 0,
        readabilityIndex: 0,
      },
    },
  }));
}

