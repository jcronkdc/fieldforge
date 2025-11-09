type AnalyticsPayload = Record<string, unknown>;

export function track(event: string, payload: AnalyticsPayload = {}) {
  // Placeholder for PostHog or server-side instrumentation.
  // eslint-disable-next-line no-console
  console.log(`[analytics] ${event}`, payload);
}

