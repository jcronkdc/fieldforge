"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishCursorUpdate = publishCursorUpdate;
exports.publishRoomEvent = publishRoomEvent;
exports.publishParticipantPresence = publishParticipantPresence;
exports.publishDrawingUpdate = publishDrawingUpdate;
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
function getRoomChannelName(roomId) {
    return `collaboration:room:${roomId}`;
}
function getCursorChannelName(roomId) {
    return `collaboration:room:${roomId}:cursors`;
}
/**
 * Publish cursor position updates for real-time cursor control
 */
async function publishCursorUpdate(roomId, userId, userName, cursorData) {
    const client = getRestClient();
    if (!client) {
        // Ably not configured, skip real-time publishing
        return;
    }
    try {
        await client.channels.get(getCursorChannelName(roomId)).publish('cursor.update', {
            roomId,
            userId,
            userName,
            x: cursorData.x,
            y: cursorData.y,
            action: cursorData.action || 'move',
            documentId: cursorData.documentId,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.warn("[ably] failed to publish cursor update", { roomId, userId, error });
    }
}
/**
 * Publish room events (participant joined/left, room created/ended)
 */
async function publishRoomEvent(roomId, eventType, payload) {
    const client = getRestClient();
    if (!client) {
        return;
    }
    try {
        await client.channels.get(getRoomChannelName(roomId)).publish(eventType, {
            roomId,
            timestamp: new Date().toISOString(),
            ...payload,
        });
    }
    catch (error) {
        console.warn("[ably] failed to publish room event", { roomId, eventType, error });
    }
}
/**
 * Publish participant presence updates
 */
async function publishParticipantPresence(roomId, userId, userName, action) {
    const client = getRestClient();
    if (!client) {
        return;
    }
    try {
        await client.channels.get(getRoomChannelName(roomId)).publish('participant.presence', {
            roomId,
            userId,
            userName,
            action,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.warn("[ably] failed to publish participant presence", { roomId, userId, action, error });
    }
}
/**
 * Publish drawing/annotation updates for collaborative editing
 */
async function publishDrawingUpdate(roomId, userId, documentId, updateData) {
    const client = getRestClient();
    if (!client) {
        return;
    }
    try {
        await client.channels.get(`collaboration:room:${roomId}:drawing`).publish('drawing.update', {
            roomId,
            userId,
            documentId,
            type: updateData.type,
            data: updateData.data,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.warn("[ably] failed to publish drawing update", { roomId, userId, error });
    }
}
