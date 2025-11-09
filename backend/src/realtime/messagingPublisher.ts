import Ably from "ably";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();

let restClient: Ably.Rest | null = null;

function getRestClient(): Ably.Rest | null {
  if (!env.ABLY_API_KEY) {
    return null;
  }

  if (!restClient) {
    restClient = new Ably.Rest({ key: env.ABLY_API_KEY });
  }

  return restClient;
}

function getChannelName(conversationId: string): string {
  return `messaging:conversation:${conversationId}`;
}

export async function publishMessageEvent(
  conversationId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const client = getRestClient();
  if (!client) {
    // Ably not configured, skip real-time publishing
    return;
  }

  try {
    await client.channels.get(getChannelName(conversationId)).publish(eventType, {
      conversationId,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  } catch (error) {
    console.warn("[ably] failed to publish message event", { eventType, conversationId, error });
  }
}

export async function publishPresenceUpdate(
  userId: string,
  status: 'online' | 'away' | 'offline',
  metadata?: Record<string, unknown>
): Promise<void> {
  const client = getRestClient();
  if (!client) {
    return;
  }

  try {
    await client.channels.get('presence:global').publish('presence.update', {
      userId,
      status,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  } catch (error) {
    console.warn("[ably] failed to publish presence update", { userId, status, error });
  }
}
