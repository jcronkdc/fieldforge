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

function getChannelName(sessionId: string): string {
  return `angrylips:session:${sessionId}`;
}

export async function publishSessionEvent(
  sessionId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const client = getRestClient();
  if (!client) {
    return;
  }

  try {
    await client.channels.get(getChannelName(sessionId)).publish(eventType, {
      sessionId,
      ...payload,
    });
  } catch (error) {
    console.warn("[ably] failed to publish session event", { eventType, sessionId, error });
  }
}

export async function publishTurnEvent(
  sessionId: string,
  turnId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const client = getRestClient();
  if (!client) {
    return;
  }

  try {
    await client.channels.get(getChannelName(sessionId)).publish(eventType, {
      sessionId,
      turnId,
      ...payload,
    });
  } catch (error) {
    console.warn("[ably] failed to publish turn event", { eventType, sessionId, turnId, error });
  }
}

export async function createTokenRequest(clientId?: string) {
  const client = getRestClient();
  if (!client) {
    throw new Error("Ably is not configured");
  }

  const tokenParams: Ably.Types.TokenParams = {};
  if (clientId) {
    tokenParams.clientId = clientId;
  }

  return new Promise<Ably.Types.TokenRequest>((resolve, reject) => {
    client.auth.createTokenRequest(tokenParams, (err, tokenRequest) => {
      if (err || !tokenRequest) {
        reject(err ?? new Error("Ably token request failed"));
        return;
      }
      resolve(tokenRequest);
    });
  });
}

