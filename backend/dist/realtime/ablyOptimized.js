"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishEvent = publishEvent;
exports.batchPublishEvents = batchPublishEvents;
exports.subscribeToChannel = subscribeToChannel;
exports.enterChannelPresence = enterChannelPresence;
exports.updateChannelPresence = updateChannelPresence;
exports.leaveChannelPresence = leaveChannelPresence;
exports.getChannelPresence = getChannelPresence;
const ably_1 = __importDefault(require("ably"));
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
// Singleton instance with connection pooling
class AblyManager {
    static instance;
    restClient = null;
    realtimeClient = null;
    channelCache = new Map();
    presenceData = new Map();
    constructor() {
        if (env.ABLY_API_KEY) {
            // REST client for publishing
            this.restClient = new ably_1.default.Rest({
                key: env.ABLY_API_KEY,
                // Enable request batching for better performance
                useBinaryProtocol: true,
                // Fallback hosts for reliability
                fallbackHosts: ['a-fallback.ably-realtime.com', 'b-fallback.ably-realtime.com']
            });
            // Realtime client for subscriptions
            this.realtimeClient = new ably_1.default.Realtime({
                key: env.ABLY_API_KEY,
                // Auto-reconnect with exponential backoff
                disconnectedRetryTimeout: 15000,
                suspendedRetryTimeout: 30000,
                // Connection state recovery
                recover: (lastConnectionDetails, callback) => {
                    console.log('[ably] Attempting connection recovery');
                    callback(true);
                }
            });
            this.setupConnectionHandlers();
        }
    }
    static getInstance() {
        if (!AblyManager.instance) {
            AblyManager.instance = new AblyManager();
        }
        return AblyManager.instance;
    }
    setupConnectionHandlers() {
        if (!this.realtimeClient)
            return;
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
    restorePresence() {
        // Restore presence data after reconnection
        this.presenceData.forEach((data, channelName) => {
            const channel = this.channelCache.get(channelName);
            if (channel) {
                channel.presence.enter(data);
            }
        });
    }
    // Optimized channel management with caching
    getChannel(name) {
        if (!this.realtimeClient)
            return null;
        if (!this.channelCache.has(name)) {
            const channel = this.realtimeClient.channels.get(name, {
                // Enable message persistence for recovery
                params: { rewind: '2m' }
            });
            this.channelCache.set(name, channel);
        }
        return this.channelCache.get(name);
    }
    // Batch publish for multiple messages
    async batchPublish(publishes) {
        if (!this.restClient)
            return;
        try {
            const batchSpecs = publishes.map(pub => ({
                channel: pub.channel,
                messages: [{ name: pub.name, data: pub.data }]
            }));
            await this.restClient.request('POST', '/messages', null, { batchRequests: batchSpecs }, null);
        }
        catch (error) {
            console.error('[ably] Batch publish failed:', error);
        }
    }
    // Optimized single publish with retry
    async publish(channel, eventName, data, retries = 3) {
        if (!this.restClient)
            return;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await this.restClient.channels.get(channel).publish(eventName, data);
                return;
            }
            catch (error) {
                console.warn(`[ably] Publish attempt ${attempt} failed:`, error);
                if (attempt === retries) {
                    console.error('[ably] All publish attempts failed');
                }
                else {
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
    }
    // Presence management with optimization
    async enterPresence(channel, data) {
        const ch = this.getChannel(channel);
        if (!ch)
            return;
        this.presenceData.set(channel, data);
        await ch.presence.enter(data);
    }
    async updatePresence(channel, data) {
        const ch = this.getChannel(channel);
        if (!ch)
            return;
        this.presenceData.set(channel, data);
        await ch.presence.update(data);
    }
    async leavePresence(channel) {
        const ch = this.getChannel(channel);
        if (!ch)
            return;
        this.presenceData.delete(channel);
        await ch.presence.leave();
    }
    // Get presence members with caching
    async getPresenceMembers(channel) {
        const ch = this.getChannel(channel);
        if (!ch)
            return [];
        try {
            const members = await ch.presence.get();
            return Array.isArray(members) ? members : [];
        }
        catch (error) {
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
async function publishEvent(channel, eventName, data) {
    return manager.publish(channel, eventName, data);
}
async function batchPublishEvents(events) {
    return manager.batchPublish(events);
}
function subscribeToChannel(channel, callback) {
    const ch = manager.getChannel(channel);
    if (!ch)
        return () => { };
    ch.subscribe(callback);
    // Return unsubscribe function
    return () => {
        ch.unsubscribe(callback);
    };
}
async function enterChannelPresence(channel, data) {
    return manager.enterPresence(channel, data);
}
async function updateChannelPresence(channel, data) {
    return manager.updatePresence(channel, data);
}
async function leaveChannelPresence(channel) {
    return manager.leavePresence(channel);
}
async function getChannelPresence(channel) {
    return manager.getPresenceMembers(channel);
}
// Cleanup on process exit
process.on('SIGTERM', () => {
    manager.cleanup();
});
process.on('SIGINT', () => {
    manager.cleanup();
});
