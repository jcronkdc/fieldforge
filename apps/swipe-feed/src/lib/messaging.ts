import { apiRequest } from "./api";
import { supabaseClient } from "./supabaseClient";

export interface Participant {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  senderUsername?: string;
  senderDisplayName?: string;
  senderAvatarUrl?: string;
  reactions?: Array<{
    reaction: string;
    count: number;
    hasReacted: boolean;
  }>;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'project';
  name?: string;
  description?: string;
  avatarUrl?: string;
  projectType?: string;
  projectId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  settings?: Record<string, any>;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
}

// Fetch user's conversations
export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const response = await apiRequest('/api/messaging/conversations', {
    method: 'GET',
    params: { userId }
  });
  return response.conversations;
}

// Fetch messages for a conversation
export async function fetchMessages(
  conversationId: string,
  userId: string,
  limit = 50,
  beforeMessageId?: string
): Promise<Message[]> {
  const response = await apiRequest(`/api/messaging/conversations/${conversationId}/messages`, {
    method: 'GET',
    params: { 
      userId, 
      limit, 
      beforeMessageId 
    }
  });
  return response.messages;
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' | 'system' = 'text',
  metadata?: Record<string, any>
): Promise<Message> {
  const response = await apiRequest(`/api/messaging/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: {
      senderId,
      content,
      messageType,
      metadata
    }
  });
  return response.message;
}

// Create or get direct conversation
export async function createDirectConversation(
  userId: string,
  otherUserId: string
): Promise<string> {
  const response = await apiRequest('/api/messaging/conversations/direct', {
    method: 'POST',
    body: {
      userId,
      otherUserId
    }
  });
  return response.conversationId;
}

// Create group conversation
export async function createGroupConversation(
  creatorId: string,
  name: string,
  description?: string,
  participantIds: string[] = []
): Promise<Conversation> {
  const response = await apiRequest('/api/messaging/conversations/group', {
    method: 'POST',
    body: {
      creatorId,
      name,
      description,
      participantIds
    }
  });
  return response.conversation;
}

// Create project conversation
export async function createProjectConversation(
  creatorId: string,
  projectType: string,
  projectId: string,
  name: string,
  participantIds: string[] = []
): Promise<Conversation> {
  const response = await apiRequest('/api/messaging/conversations/project', {
    method: 'POST',
    body: {
      creatorId,
      projectType,
      projectId,
      name,
      participantIds
    }
  });
  return response.conversation;
}

// Mark conversation as read
export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await apiRequest(`/api/messaging/conversations/${conversationId}/read`, {
    method: 'POST',
    body: { userId }
  });
}

// Add reaction to message
export async function addReaction(
  messageId: string,
  userId: string,
  reaction: string,
  conversationId: string
): Promise<void> {
  await apiRequest(`/api/messaging/messages/${messageId}/reactions`, {
    method: 'POST',
    body: {
      userId,
      reaction,
      conversationId
    }
  });
}

// Remove reaction from message
export async function removeReaction(
  messageId: string,
  userId: string,
  reaction: string,
  conversationId: string
): Promise<void> {
  await apiRequest(`/api/messaging/messages/${messageId}/reactions`, {
    method: 'DELETE',
    body: {
      userId,
      reaction,
      conversationId
    }
  });
}

// Update typing indicator
export async function updateTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  await apiRequest(`/api/messaging/conversations/${conversationId}/typing`, {
    method: 'POST',
    body: {
      userId,
      isTyping
    }
  });
}

// Get typing indicators
export async function getTypingIndicators(
  conversationId: string
): Promise<Array<{ userId: string; username: string; displayName?: string }>> {
  const response = await apiRequest(`/api/messaging/conversations/${conversationId}/typing`, {
    method: 'GET'
  });
  return response.typingUsers;
}

// Add participants to conversation
export async function addParticipants(
  conversationId: string,
  participantIds: string[],
  addedBy: string
): Promise<void> {
  await apiRequest(`/api/messaging/conversations/${conversationId}/participants`, {
    method: 'POST',
    body: {
      participantIds,
      addedBy
    }
  });
}

// Leave conversation
export async function leaveConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  await apiRequest(`/api/messaging/conversations/${conversationId}/participants/${userId}`, {
    method: 'DELETE'
  });
}
