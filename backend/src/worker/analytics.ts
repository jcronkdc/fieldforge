import fetch from "node-fetch";

interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
}

export async function capture(event: AnalyticsEvent, posthogKey?: string) {
  if (!posthogKey) {
    console.info(`[analytics] ${event.event}`, event.properties);
    return;
  }

  await fetch("https://app.posthog.com/capture/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${posthogKey}`,
    },
    body: JSON.stringify({
      api_key: posthogKey,
      event: event.event,
      properties: {
        distinct_id: event.properties.distinct_id ?? "hourglass-worker",
        ...event.properties,
      },
    }),
  });
}

