import type { FeedEvent, StreamEvent } from "./types";
import { getAuthHeaders } from './authHeaders';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface FeedFilters {
  limit?: number;
  offset?: number;
  search?: string;
  sort?: "latest" | "popular";
  eventTypes?: string[];
  userId?: string | null;
}

export async function fetchFeedEvents(filters: FeedFilters = {}) {
  const params = new URLSearchParams();
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const offset = Math.max(filters.offset ?? 0, 0);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  if (filters.search && filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.sort === "popular") {
    params.set("sort", "popular");
  }

  if (filters.eventTypes?.length) {
    params.set("eventType", filters.eventTypes.join(","));
  }

  if (filters.userId) {
    params.set("userId", filters.userId);
  }

  return request<{ items: FeedEvent[] }>(`/api/feed?${params.toString()}`);
}

export async function fetchStreamFeed(limit = 20, offset = 0) {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(limit, 1), 100)),
    offset: String(Math.max(offset, 0)),
  });

  return request<{ items: StreamEvent[] }>(`/api/feed/stream?${params.toString()}`);
}

export async function likeFeedEvent(eventId: string, userId: string) {
  return request<{ liked: boolean; likeCount: number }>(`/api/feed/${eventId}/like`, {
    method: "POST",
    body: JSON.stringify({ userId, like: true }),
  });
}

export async function unlikeFeedEvent(eventId: string, userId: string) {
  return request<{ liked: boolean; likeCount: number }>(`/api/feed/${eventId}/like`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
}

export interface FeedCommentPayload {
  id: string;
  eventId: string;
  userId: string;
  body: string;
  createdAt: string;
  actor: FeedEvent["actor"];
}

export async function fetchFeedComments(eventId: string, limit = 20, offset = 0) {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(limit, 1), 100)),
    offset: String(Math.max(offset, 0)),
  });
  return request<{ items: FeedCommentPayload[] }>(`/api/feed/${eventId}/comments?${params.toString()}`);
}

export async function addFeedComment(eventId: string, userId: string, body: string) {
  return request<{ comment: FeedCommentPayload }>(`/api/feed/${eventId}/comments`, {
    method: "POST",
    body: JSON.stringify({ userId, body }),
  });
}

export async function repostFeedEvent(eventId: string, userId: string) {
  return request<{ reposted: boolean; repostCount: number }>(`/api/feed/${eventId}/repost`, {
    method: "POST",
    body: JSON.stringify({ userId, repost: true }),
  });
}

export async function undoRepostFeedEvent(eventId: string, userId: string) {
  return request<{ reposted: boolean; repostCount: number }>(`/api/feed/${eventId}/repost`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
}


