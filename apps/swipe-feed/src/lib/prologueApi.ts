import type { TimelineNode } from "../data/sampleTimelines";
import type {
  AngryLipsSessionResponse,
  AngryLipsTurnResponse,
  AngryLipsParticipantResponse,
} from "./types";

import { getAuthHeaders } from './authHeaders';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
    ...init,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface StoryNotification {
  id: number;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface CharacterSummary {
  id: string;
  worldId: string;
  displayName: string;
  tagline: string | null;
  summary: string | null;
  tags: string[];
  canonicalVersionId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface AngryLipsSessionSummary {
  id: string;
  hostId: string | null;
  title: string | null;
  genre: string | null;
  templateSource: "ai" | "custom" | "seed";
  templateLength: "quick" | "classic" | "epic";
  seedText: string | null;
  templateText: string | null;
  status: string;
  responseWindowMinutes: number;
  allowAiCohost: boolean;
  vaultMode: "invite_only" | "public" | "locked";
  participants: AngryLipsParticipantResponse[];
  createdAt: string;
  updatedAt: string | null;
}

interface TimelineResponse {
  worldId: string;
  nodes?: TimelineNode[];
  items?: TimelineNode[];
}

interface NotificationsResponse {
  items: StoryNotification[];
}

interface CharactersResponse {
  items: CharacterSummary[];
}

interface AngryLipsSessionsResponse {
  items: AngryLipsSessionSummary[];
}

export async function fetchTimeline(worldId: string, limit = 5): Promise<TimelineNode[]> {
  const params = new URLSearchParams();
  if (worldId) params.set("worldId", worldId);
  params.set("limit", String(Math.max(1, Math.min(limit, 20))));
  const data = await apiRequest<TimelineResponse>(`/api/creative/story/timeline?${params.toString()}`);
  return data.nodes ?? data.items ?? [];
}

export async function fetchStoryNotifications(limit = 10): Promise<StoryNotification[]> {
  const params = new URLSearchParams({ limit: String(Math.max(1, Math.min(limit, 50))) });
  const data = await apiRequest<NotificationsResponse>(`/api/story/notifications?${params.toString()}`);
  return data.items ?? [];
}

export async function fetchCharacters(worldId: string, limit = 6): Promise<CharacterSummary[]> {
  const params = new URLSearchParams({
    worldId,
    limit: String(Math.max(1, Math.min(limit, 24))),
  });
  const data = await apiRequest<CharactersResponse>(`/api/creative/characters?${params.toString()}`);
  return data.items ?? [];
}

export async function fetchAngryLipsSessions(limit = 4, status?: string): Promise<AngryLipsSessionSummary[]> {
  const params = new URLSearchParams({
    limit: String(Math.max(1, Math.min(limit, 20))),
  });
  if (status) params.set("status", status);
  const data = await apiRequest<AngryLipsSessionsResponse>(`/api/angry-lips/sessions?${params.toString()}`);
  return data.items ?? [];
}

export async function fetchUserAngryLipsSessions(
  userId: string,
  limit = 4,
  status?: string
): Promise<AngryLipsSessionSummary[]> {
  const params = new URLSearchParams({
    limit: String(Math.max(1, Math.min(limit, 20))),
    userId,
  });
  if (status) params.set("status", status);
  const data = await apiRequest<AngryLipsSessionsResponse>(`/api/angry-lips/sessions?${params.toString()}`);
  return data.items ?? [];
}

export type { TimelineNode, AngryLipsSessionResponse, AngryLipsTurnResponse };


