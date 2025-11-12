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

export interface BookwormProfile {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface BookwormConnection {
  userId: string;
  friendId: string;
  createdAt: string;
  friend: BookwormProfile;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  targetId: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  requester: BookwormProfile;
  target: BookwormProfile;
}

export interface ConnectionStats {
  bookwormCount: number;
  outgoingPending: number;
  incomingPending: number;
}

export interface BookwormResponse {
  items: BookwormConnection[];
  stats: ConnectionStats;
}

export async function fetchBookworms(userId: string, limit = 12): Promise<BookwormResponse> {
  const params = new URLSearchParams({
    userId,
    limit: String(Math.max(1, Math.min(limit, 50))),
  });
  return apiRequest<BookwormResponse>(`/api/social/bookworms?${params.toString()}`);
}

export async function removeBookworm(userId: string, friendId: string): Promise<void> {
  await apiRequest<void>(`/api/social/bookworms/${friendId}`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
}

export async function fetchConnectionRequests(userId: string, direction: "inbound" | "outbound"): Promise<ConnectionRequest[]> {
  const params = new URLSearchParams({
    userId,
    direction,
  });
  const data = await apiRequest<{ items: ConnectionRequest[] }>(`/api/social/requests?${params.toString()}`);
  return data.items ?? [];
}

export async function sendConnectionRequest(input: {
  requesterId: string;
  targetUsername?: string;
  targetId?: string;
  message?: string;
}): Promise<ConnectionRequest> {
  const { request } = await apiRequest<{ request: ConnectionRequest }>(`/api/social/requests`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return request;
}

export async function respondConnectionRequest(input: {
  requestId: string;
  userId: string;
  action: "accept" | "decline" | "cancel";
}): Promise<ConnectionRequest> {
  const { request } = await apiRequest<{ request: ConnectionRequest }>(`/api/social/requests/${input.requestId}/respond`, {
    method: "POST",
    body: JSON.stringify({ userId: input.userId, action: input.action }),
  });
  return request;
}

export async function lookupProfileByUsername(username: string): Promise<BookwormProfile> {
  const { profile } = await apiRequest<{ profile: BookwormProfile }>(
    `/api/social/profiles/lookup?${new URLSearchParams({ username }).toString()}`
  );
  return profile;
}


