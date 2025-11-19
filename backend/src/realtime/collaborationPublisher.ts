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

function getRoomChannelName(roomId: string): string {
  return `collaboration:room:${roomId}`;
}

function getCursorChannelName(roomId: string): string {
  return `collaboration:room:${roomId}:cursors`;
}

/**
 * Publish cursor position updates for real-time cursor control
 */
export async function publishCursorUpdate(
  roomId: string,
  userId: string,
  userName: string,
  cursorData: {
    x: number;
    y: number;
    action?: 'move' | 'click' | 'drag' | 'select' | 'idle';
    documentId?: string;
  }
): Promise<void> {
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
  } catch (error) {
    console.warn("[ably] failed to publish cursor update", { roomId, userId, error });
  }
}

/**
 * Publish room events (participant joined/left, room created/ended)
 */
export async function publishRoomEvent(
  roomId: string,
  eventType: 'room.created' | 'room.ended' | 'participant.joined' | 'participant.left' | 'recording.started' | 'recording.stopped' | 'screen.shared' | 'screen.stopped',
  payload: Record<string, unknown>
): Promise<void> {
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
  } catch (error) {
    console.warn("[ably] failed to publish room event", { roomId, eventType, error });
  }
}

/**
 * Publish participant presence updates
 */
export async function publishParticipantPresence(
  roomId: string,
  userId: string,
  userName: string,
  action: 'join' | 'leave'
): Promise<void> {
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
  } catch (error) {
    console.warn("[ably] failed to publish participant presence", { roomId, userId, action, error });
  }
}

/**
 * Publish drawing/annotation updates for collaborative editing
 */
export async function publishDrawingUpdate(
  roomId: string,
  userId: string,
  documentId: string,
  updateData: {
    type: 'annotation' | 'highlight' | 'measurement' | 'markup';
    data: Record<string, unknown>;
  }
): Promise<void> {
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
  } catch (error) {
    console.warn("[ably] failed to publish drawing update", { roomId, userId, error });
  }
}

