/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * API helper for consistent requests
 */

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  
  const defaultHeaders: Record<string, string> = {};
  
  // Add content-type for JSON bodies
  if (options?.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${baseUrl}${url}`, {
    method: options?.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options?.headers
    },
    body: options?.body instanceof FormData 
      ? options.body 
      : options?.body 
        ? JSON.stringify(options.body) 
        : undefined
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}
