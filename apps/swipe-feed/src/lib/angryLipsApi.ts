import type {
  AngryLipsSessionResponse,
  AngryLipsTurnResponse,
  AngryLipsParticipantResponse,
  AngryLipsVaultEntryResponse,
  AngryLipsFeedEntryResponse,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface CreateSessionPayload {
  genre?: string;
  templateSource?: "ai" | "custom" | "seed";
  templateLength?: "quick" | "classic" | "epic";
  responseWindowMinutes?: number;
  participantIds?: string[];
  hostId?: string;
  title?: string;
  seedText?: string;
  allowAiCohost?: boolean;
  vaultMode?: "invite_only" | "public" | "locked";
}

export async function createAngryLipsSession(payload: CreateSessionPayload = {}) {
  return request<AngryLipsSessionResponse>(`/api/angry-lips/sessions`, {
    method: "POST",
    body: JSON.stringify({
      genre: payload.genre ?? "heist",
      templateSource: payload.templateSource ?? "ai",
      templateLength: payload.templateLength ?? "quick",
      responseWindowMinutes: payload.responseWindowMinutes ?? 3,
      participantIds: payload.participantIds ?? [],
      hostId: payload.hostId,
      title: payload.title,
      seedText: payload.seedText,
      allowAiCohost: payload.allowAiCohost,
      vaultMode: payload.vaultMode,
    }),
  });
}

export async function fetchAngryLipsSession(sessionId: string) {
  return request<AngryLipsSessionResponse>(`/api/angry-lips/sessions/${sessionId}`);
}

export async function submitAngryLipsTurn(turnId: string, text: string, handle?: string) {
  return request<{ turn: AngryLipsTurnResponse }>(`/api/angry-lips/turns/${turnId}/submit`, {
    method: "POST",
    body: JSON.stringify({ text, handle }),
  });
}

export async function autoFillAngryLipsTurn(turnId: string, text: string, handle?: string) {
  return request<{ turn: AngryLipsTurnResponse }>(`/api/angry-lips/turns/${turnId}/auto-fill`, {
    method: "POST",
    body: JSON.stringify({ text, handle }),
  });
}

export async function logAngryLipsTurnEvent(turnId: string, eventType: string, payload: Record<string, unknown>) {
  return request<void>(`/api/angry-lips/turns/${turnId}/events`, {
    method: "POST",
    body: JSON.stringify({ eventType, payload }),
  });
}

export async function inviteAngryLipsParticipants(sessionId: string, hostId: string, participantIds: string[]) {
  return request<{ items: AngryLipsParticipantResponse[] }>(`/api/angry-lips/sessions/${sessionId}/invite`, {
    method: "POST",
    body: JSON.stringify({ hostId, participantIds }),
  });
}

export async function respondAngryLipsInvitation(
  sessionId: string,
  userId: string,
  action: "accept" | "decline" | "left"
) {
  return request<{ participant: AngryLipsParticipantResponse }>(`/api/angry-lips/sessions/${sessionId}/respond`, {
    method: "POST",
    body: JSON.stringify({ userId, action }),
  });
}

export async function fetchAngryLipsParticipants(sessionId: string) {
  return request<{ items: AngryLipsParticipantResponse[] }>(`/api/angry-lips/sessions/${sessionId}/participants`);
}

export async function startAngryLipsSession(sessionId: string, hostId: string) {
  return request<AngryLipsSessionResponse>(`/api/angry-lips/sessions/${sessionId}/start`, {
    method: "POST",
    body: JSON.stringify({ hostId }),
  });
}

export async function advanceAngryLipsTurn(sessionId: string, hostId: string) {
  return request<AngryLipsSessionResponse>(`/api/angry-lips/sessions/${sessionId}/advance`, {
    method: "POST",
    body: JSON.stringify({ hostId }),
  });
}

export async function summarizeAngryLipsSession(sessionId: string, userId: string, focus?: string) {
  return request<{ entry: AngryLipsVaultEntryResponse; summary: string | null }>(
    `/api/angry-lips/sessions/${sessionId}/summarize`,
    {
      method: "POST",
      body: JSON.stringify({ userId, focus }),
    }
  );
}

export async function generateAngryLipsAiStory(sessionId: string, hostId: string, prompt?: string) {
  return request<{ entry: AngryLipsVaultEntryResponse; story: string | null }>(
    `/api/angry-lips/sessions/${sessionId}/ai-story`,
    {
      method: "POST",
      body: JSON.stringify({ hostId, prompt }),
    }
  );
}

export async function publishAngryLipsSession(
  sessionId: string,
  hostId: string,
  visibility: "invite_only" | "public" | "locked" = "public"
) {
  return request<{ entry: AngryLipsVaultEntryResponse }>(`/api/angry-lips/sessions/${sessionId}/publish`, {
    method: "POST",
    body: JSON.stringify({ hostId, visibility }),
  });
}

export async function fetchAngryLipsFeed(limit = 12, offset = 0) {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(limit, 1), 50)),
    offset: String(Math.max(offset, 0)),
  });
  return request<{ items: AngryLipsFeedEntryResponse[] }>(
    `/api/angry-lips/feed?${params.toString()}`
  );
}