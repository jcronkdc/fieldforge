const isBrowser = typeof window !== "undefined";
const DEFAULT_TIMEOUT_MS = 10000;

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  baseUrl?: string;
}

export interface FetchJsonResult<T> {
  data?: T;
  error?: Error;
  status: number;
}

const resolveUrl = (input: string, baseUrl: string): string => {
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  if (!baseUrl) {
    return input;
  }
  return `${baseUrl}${input.startsWith("/") ? input : `/${input}`}`;
};

const buildHeaders = (initHeaders: HeadersInit | undefined, body: BodyInit | null | undefined): HeadersInit => {
  const headers = new Headers(initHeaders);
  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (isBrowser) {
    const token = window.localStorage.getItem("auth_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
};

const safeParseJson = async <T>(response: Response): Promise<T | undefined> => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Failed to parse JSON response", error);
    throw new Error("Invalid JSON response");
  }
};

export async function fetchJson<T = unknown>(input: string, options: FetchJsonOptions = {}): Promise<FetchJsonResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const baseUrl = options.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "";

  try {
    const url = resolveUrl(input, baseUrl);
    const { timeoutMs, baseUrl: _ignoredBase, ...init } = options;
    const body =
      init.body && !(init.body instanceof FormData) && typeof init.body !== "string"
        ? JSON.stringify(init.body)
        : init.body;

    const response = await fetch(url, {
      ...init,
      body,
      signal: controller.signal,
      headers: buildHeaders(init.headers, init.body ?? body),
    });

    const status = response.status;

    if (!response.ok) {
      const errorPayload = await safeParseJson<{ message?: string }>(response).catch(() => undefined);
      const error = new Error(errorPayload?.message ?? `Request failed with status ${status}`);
      return { error, status };
    }

    const data = await safeParseJson<T>(response);
    return { data, status };
  } catch (error) {
    console.error("Network request failed", error);
    return { error: error instanceof Error ? error : new Error("Network request failed"), status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiRequest<T = unknown>(input: string, options?: FetchJsonOptions): Promise<T> {
  const { data, error } = await fetchJson<T>(input, options);
  if (error) {
    throw error;
  }
  return data as T;
}

