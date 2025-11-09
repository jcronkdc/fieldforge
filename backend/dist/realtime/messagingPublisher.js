"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishMessageEvent = publishMessageEvent;
exports.publishPresenceUpdate = publishPresenceUpdate;
const ably_1 = __importDefault(require("ably"));
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
let restClient = null;
function getRestClient() {
    if (!env.ABLY_API_KEY) {
        return null;
    }
    if (!restClient) {
        restClient = new ably_1.default.Rest({ key: env.ABLY_API_KEY });
    }
    return restClient;
}
function getChannelName(conversationId) {
    return `messaging:conversation:${conversationId}`;
}
async function publishMessageEvent(conversationId, eventType, payload) {
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
    }
    catch (error) {
        console.warn("[ably] failed to publish message event", { eventType, conversationId, error });
    }
}
async function publishPresenceUpdate(userId, status, metadata) {
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
    }
    catch (error) {
        console.warn("[ably] failed to publish presence update", { userId, status, error });
    }
}
