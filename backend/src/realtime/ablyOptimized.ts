import Ably from "ably";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();

// Singleton instance with connection pooling
class AblyManager {
  private static instance: AblyManager;
  private restClient: Ably.Rest | null = null;
  private realtimeClient: Ably.Realtime | null = null;
  private channelCache: Map<string, Ably.Types.RealtimeChannelCallbacks> = new Map();
  private presenceData: Map<string, any> = new Map();
  
  private constructor() {
    if (env.ABLY_API_KEY) {
      // REST client for publishing
      this.restClient = new Ably.Rest({ 
        key: env.ABLY_API_KEY,
        // Enable request batching for better performance
        useBinaryProtocol: true,
        // Fallback hosts for reliability
        fallbackHosts: ['a-fallback.ably-realtime.com', 'b-fallback.ably-realtime.com']
      });
      
      // Realtime client for subscriptions
      this.realtimeClient = new Ably.Realtime({
        key: env.ABLY_API_KEY,
        // Auto-reconnect with exponential backoff
        disconnectedRetryTimeout: 15000,
        suspendedRetryTimeout: 30000,
        // Connection state recovery
        recover: (lastConnectionDetails: any, callback: any) => {
          console.log('[ably] Attempting connection recovery');
          callback(true);
        }
      } as any);
      
      this.setupConnectionHandlers();
    }
  }
  
  static getInstance(): AblyManager {
    if (!AblyManager.instance) {
      AblyManager.instance = new AblyManager();
    }
    return AblyManager.instance;
  }
  
  private setupConnectionHandlers() {
    if (!this.realtimeClient) return;
    
    this.realtimeClient.connection.on('connected', () => {
      console.log('[ably] Connected successfully');
      this.restorePresence();
    });
    
    this.realtimeClient.connection.on('disconnected', () => {
      console.log('[ably] Disconnected, will attempt reconnection');
    });
    
    this.realtimeClient.connection.on('suspended', () => {
      console.warn('[ably] Connection suspended');
    });
    
    this.realtimeClient.connection.on('failed', (error) => {
      console.error('[ably] Connection failed:', error);
    });
  }
  
  private restorePresence() {
    // Restore presence data after reconnection
    this.presenceData.forEach((data, channelName) => {
      const channel = this.channelCache.get(channelName);
      if (channel) {
        channel.presence.enter(data);
      }
    });
  }
  
  // Optimized channel management with caching
  getChannel(name: string): Ably.Types.RealtimeChannelCallbacks | null {
    if (!this.realtimeClient) return null;
    
    if (!this.channelCache.has(name)) {
      const channel = this.realtimeClient.channels.get(name, {
        // Enable message persistence for recovery
        params: { rewind: '2m' }
      });
      this.channelCache.set(name, channel);
    }
    
    return this.channelCache.get(name)!;
  }
  
  // Batch publish for multiple messages
  async batchPublish(publishes: Array<{
    channel: string;
    name: string;
    data: any;
  }>): Promise<void> {
    if (!this.restClient) return;
    
    try {
      const batchSpecs = publishes.map(pub => ({
        channel: pub.channel,
        messages: [{ name: pub.name, data: pub.data }]
      }));
      
      await this.restClient.request(
        'POST',
        '/messages',
        null,
        { batchRequests: batchSpecs },
        null
      );
    } catch (error) {
      console.error('[ably] Batch publish failed:', error);
    }
  }
  
  // Optimized single publish with retry
  async publish(
    channel: string, 
    eventName: string, 
    data: any,
    retries = 3
  ): Promise<void> {
    if (!this.restClient) return;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.restClient.channels.get(channel).publish(eventName, data);
        return;
      } catch (error) {
        console.warn(`[ably] Publish attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          console.error('[ably] All publish attempts failed');
        } else {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
  }
  
  // Presence management with optimization
  async enterPresence(channel: string, data: any): Promise<void> {
    const ch = this.getChannel(channel);
    if (!ch) return;
    
    this.presenceData.set(channel, data);
    await ch.presence.enter(data);
  }
  
  async updatePresence(channel: string, data: any): Promise<void> {
    const ch = this.getChannel(channel);
    if (!ch) return;
    
    this.presenceData.set(channel, data);
    await ch.presence.update(data);
  }
  
  async leavePresence(channel: string): Promise<void> {
    const ch = this.getChannel(channel);
    if (!ch) return;
    
    this.presenceData.delete(channel);
    await ch.presence.leave();
  }
  
  // Get presence members with caching
  async getPresenceMembers(channel: string): Promise<Ably.Types.PresenceMessage[]> {
    const ch = this.getChannel(channel);
    if (!ch) return [];
    
    try {
      const members = await ch.presence.get();
      return Array.isArray(members) ? members : [];
    } catch (error) {
      console.error(`[ably] Error getting presence for ${channel}:`, error);
      return [];
    }
  }
  
  // Cleanup and resource management
  cleanup() {
    this.channelCache.forEach(channel => {
      channel.detach();
    });
    this.channelCache.clear();
    this.presenceData.clear();
    
    if (this.realtimeClient) {
      this.realtimeClient.close();
    }
  }
}

// Export optimized functions
const manager = AblyManager.getInstance();

export async function publishEvent(
  channel: string,
  eventName: string,
  data: any
): Promise<void> {
  return manager.publish(channel, eventName, data);
}

export async function batchPublishEvents(
  events: Array<{ channel: string; name: string; data: any }>
): Promise<void> {
  return manager.batchPublish(events);
}

export function subscribeToChannel(
  channel: string,
  callback: (message: Ably.Types.Message) => void
): () => void {
  const ch = manager.getChannel(channel);
  if (!ch) return () => {};
  
  ch.subscribe(callback);
  
  // Return unsubscribe function
  return () => {
    ch.unsubscribe(callback);
  };
}

export async function enterChannelPresence(
  channel: string,
  data: any
): Promise<void> {
  return manager.enterPresence(channel, data);
}

export async function updateChannelPresence(
  channel: string,
  data: any
): Promise<void> {
  return manager.updatePresence(channel, data);
}

export async function leaveChannelPresence(channel: string): Promise<void> {
  return manager.leavePresence(channel);
}

export async function getChannelPresence(
  channel: string
): Promise<Ably.Types.PresenceMessage[]> {
  return manager.getPresenceMembers(channel);
}

// Cleanup on process exit
process.on('SIGTERM', () => {
  manager.cleanup();
});

process.on('SIGINT', () => {
  manager.cleanup();
});
