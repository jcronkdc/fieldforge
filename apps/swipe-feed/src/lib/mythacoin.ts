const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

export interface MythacoinTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MythacoinSummary {
  balance: number;
  transactions: MythacoinTransaction[];
}

export async function fetchMythacoinSummary(userId: string): Promise<MythacoinSummary> {
  return apiRequest<MythacoinSummary>(`/api/mythacoin/summary?${new URLSearchParams({ userId }).toString()}`);
}

export async function fetchMythacoinTransactions(userId: string, limit = 25, offset = 0) {
  const params = new URLSearchParams({
    userId,
    limit: String(Math.max(1, Math.min(limit, 100))),
    offset: String(Math.max(0, offset)),
  });
  return apiRequest<{ items: MythacoinTransaction[] }>(`/api/mythacoin/transactions?${params.toString()}`);
}


