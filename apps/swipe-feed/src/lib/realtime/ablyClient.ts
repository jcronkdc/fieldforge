import { Realtime } from "ably/promises";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

let realtime: Realtime | null = null;

async function getRealtimeClient(): Promise<Realtime> {
  if (!realtime) {
    realtime = new Realtime({
      authUrl: `${API_BASE}/api/angry-lips/realtime/token`,
      closeOnUnload: true,
    });
  }

  return realtime;
}

export async function subscribeToAngryLipsSession(
  sessionId: string,
  handler: (message: { name: string; data: Record<string, unknown> }) => void
) {
  const client = await getRealtimeClient();
  const channel = client.channels.get(`angrylips:session:${sessionId}`);

  const wrappedHandler = (msg: { name: string; data: Record<string, unknown> }) => {
    handler({ name: msg.name, data: (msg.data ?? {}) as Record<string, unknown> });
  };

  channel.subscribe(wrappedHandler);

  return async () => {
    try {
      channel.unsubscribe(wrappedHandler);
      const listeners = channel.listeners();
      if (!listeners || listeners.length === 0) {
        channel.detach().catch(() => {
          /* ignore */
        });
      }
    } catch (error) {
      console.warn("[ably] unsubscribe failed", error);
    }
  };
}
