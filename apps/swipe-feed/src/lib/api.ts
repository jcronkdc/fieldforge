const isBrowser = typeof window !== "undefined";
const DEFAULT_TIMEOUT_MS = 10000;

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  baseUrl?: string;
  skipTokenRefresh?: boolean; // Set to true to skip automatic token refresh on 401
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

const buildHeaders = async (initHeaders: HeadersInit | undefined, body: BodyInit | null | undefined): Promise<HeadersInit> => {
  const headers = new Headers(initHeaders);
  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (isBrowser && !headers.has("Authorization")) {
    // Get Supabase session token
    try {
      const { supabase } = await import('./supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }
    } catch (error) {
      // Supabase not available, continue without auth header
      console.warn('Could not get Supabase session for API request:', error);
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

    const headers = await buildHeaders(init.headers, init.body ?? body);

    let response = await fetch(url, {
      ...init,
      body,
      signal: controller.signal,
      headers,
    });

    const status = response.status;

    // Handle 401 Unauthorized - try to refresh token and retry once
    if (status === 401 && isBrowser && !options.skipTokenRefresh) {
      try {
        const { supabase } = await import('./supabase');
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && session?.access_token) {
          // Retry request with new token
          const retryHeaders = new Headers(headers);
          retryHeaders.set("Authorization", `Bearer ${session.access_token}`);
          
          const retryResponse = await fetch(url, {
            ...init,
            body,
            signal: controller.signal,
            headers: retryHeaders,
          });
          
          if (retryResponse.ok) {
            const data = await safeParseJson<T>(retryResponse);
            return { data, status: retryResponse.status };
          }
          // If retry also fails, continue with original error
          response = retryResponse;
        }
      } catch (refreshError) {
        // Token refresh failed, continue with original error
        console.warn('Token refresh failed:', refreshError);
      }
    }

    if (!response.ok) {
      const errorPayload = await safeParseJson<{ message?: string }>(response).catch(() => undefined);
      const error = new Error(errorPayload?.message ?? `Request failed with status ${response.status}`);
      return { error, status: response.status };
    }

    const data = await safeParseJson<T>(response);
    return { data, status: response.status };
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

