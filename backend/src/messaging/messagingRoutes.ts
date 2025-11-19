import { Router, Request, Response } from "express";
import {
  createOrGetDirectConversation,
  createGroupConversation,
  createProjectConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  addMessageReaction,
  removeMessageReaction,
  updateTypingIndicator,
  getTypingIndicators,
  addParticipantsToConversation,
  leaveConversation,
  getConversationParticipants,
} from "./messagingRepository.js";
import { publishMessageEvent } from "../realtime/messagingPublisher.js";
import { notifyNewMessage, notifyMention } from "../notifications/notificationRepository.js";

export function createMessagingRouter(): Router {
  const router = Router();

  // Get user's conversations
  router.get("/conversations", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      const conversations = await getUserConversations(userId, limit, offset);
      res.json({ conversations });
    } catch (error) {
      console.error("[messaging] get conversations error", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Create or get direct conversation
  router.post("/conversations/direct", async (req: Request, res: Response) => {
    const { userId, otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ error: "userId and otherUserId are required" });
    }

    try {
      const conversationId = await createOrGetDirectConversation(userId, otherUserId);
      res.json({ conversationId });
    } catch (error) {
      console.error("[messaging] create direct conversation error", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Create group conversation
  router.post("/conversations/group", async (req: Request, res: Response) => {
    const { creatorId, name, description, participantIds } = req.body;

    if (!creatorId || !name) {
      return res.status(400).json({ error: "creatorId and name are required" });
    }

    try {
      const conversation = await createGroupConversation(
        creatorId,
        name,
        description,
        participantIds
      );
      res.json({ conversation });
    } catch (error) {
      console.error("[messaging] create group conversation error", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  // Create project conversation
  router.post("/conversations/project", async (req: Request, res: Response) => {
    const { creatorId, projectType, projectId, name, participantIds } = req.body;

    if (!creatorId || !projectType || !projectId || !name) {
      return res.status(400).json({ 
        error: "creatorId, projectType, projectId, and name are required" 
      });
    }

    try {
      const conversation = await createProjectConversation(
        creatorId,
        projectType,
        projectId,
        name,
        participantIds
      );
      res.json({ conversation });
    } catch (error) {
      console.error("[messaging] create project conversation error", error);
      res.status(500).json({ error: "Failed to create project conversation" });
    }
  });

  // Get conversation messages
  router.get("/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.query.userId as string;
    const limit = Number(req.query.limit) || 50;
    const beforeMessageId = req.query.beforeMessageId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      const messages = await getConversationMessages(
        conversationId,
        userId,
        limit,
        beforeMessageId
      );
      res.json({ messages });
    } catch (error) {
      console.error("[messaging] get messages error", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message
  router.post("/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { senderId, content, messageType, metadata } = req.body;

    if (!senderId || !content) {
      return res.status(400).json({ error: "senderId and content are required" });
    }

    try {
      const message = await sendMessage(
        conversationId,
        senderId,
        content,
        messageType,
        metadata
      );
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'message.sent', {
        message,
        senderId
      });
      
      // Create notifications for all participants (except sender)
      try {
        const participants = await getConversationParticipants(conversationId);
        const senderInfo = participants.find(p => p.userId === senderId);
        const senderName = senderInfo?.displayName || senderInfo?.username || 'Someone';
        
        // Get conversation name from first message or use default
        const conversationName = metadata?.conversationName || 'Conversation';
        
        // Notify all participants except sender
        for (const participant of participants) {
          if (participant.userId !== senderId) {
            // Check if message contains mention
            const hasMention = content.includes(`@${participant.username}`) || content.includes(`@${participant.displayName}`);
            
            if (hasMention) {
              await notifyMention(
                participant.userId,
                conversationId,
                conversationName,
                senderId,
                senderName,
                content
              );
            } else {
              await notifyNewMessage(
                participant.userId,
                conversationId,
                conversationName,
                senderId,
                senderName,
                content
              );
            }
          }
        }
      } catch (notifError) {
        // Don't fail the message send if notifications fail
        console.error('[messaging] Failed to create notifications:', notifError);
      }
      
      res.json({ message });
    } catch (error) {
      console.error("[messaging] send message error", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Mark conversation as read
  router.post("/conversations/:conversationId/read", async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      await markConversationAsRead(conversationId, userId);
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'conversation.read', {
        userId
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[messaging] mark as read error", error);
      res.status(500).json({ error: "Failed to mark as read" });
    }
  });

  // Add reaction to message
  router.post("/messages/:messageId/reactions", async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { userId, reaction, conversationId } = req.body;

    if (!userId || !reaction || !conversationId) {
      return res.status(400).json({ error: "userId, reaction, and conversationId are required" });
    }

    try {
      await addMessageReaction(messageId, userId, reaction);
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'message.reaction', {
        messageId,
        userId,
        reaction,
        action: 'add'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[messaging] add reaction error", error);
      res.status(500).json({ error: "Failed to add reaction" });
    }
  });

  // Remove reaction from message
  router.delete("/messages/:messageId/reactions", async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { userId, reaction, conversationId } = req.body;

    if (!userId || !reaction || !conversationId) {
      return res.status(400).json({ error: "userId, reaction, and conversationId are required" });
    }

    try {
      await removeMessageReaction(messageId, userId, reaction);
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'message.reaction', {
        messageId,
        userId,
        reaction,
        action: 'remove'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[messaging] remove reaction error", error);
      res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  // Update typing indicator
  router.post("/conversations/:conversationId/typing", async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { userId, isTyping } = req.body;

    if (!userId || typeof isTyping !== 'boolean') {
      return res.status(400).json({ error: "userId and isTyping are required" });
    }

    try {
      await updateTypingIndicator(conversationId, userId, isTyping);
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'typing.update', {
        userId,
        isTyping
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[messaging] update typing error", error);
      res.status(500).json({ error: "Failed to update typing indicator" });
    }
  });

  // Get typing indicators
  router.get("/conversations/:conversationId/typing", async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    try {
      const typingUsers = await getTypingIndicators(conversationId);
      res.json({ typingUsers });
    } catch (error) {
      console.error("[messaging] get typing indicators error", error);
      res.status(500).json({ error: "Failed to fetch typing indicators" });
    }
  });

  // Add participants to conversation
  router.post("/conversations/:conversationId/participants", async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { participantIds, addedBy } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || !addedBy) {
      return res.status(400).json({ error: "participantIds and addedBy are required" });
    }

    try {
      await addParticipantsToConversation(conversationId, participantIds, addedBy);
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'participants.added', {
        participantIds,
        addedBy
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[messaging] add participants error", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to add participants" });
    }
  });

  // Leave conversation
  router.delete("/conversations/:conversationId/participants/:userId", async (req: Request, res: Response) => {
    const { conversationId, userId } = req.params;

    try {
      await leaveConversation(conversationId, userId);
      
      // Publish real-time event
      await publishMessageEvent(conversationId, 'participant.left', {
        userId
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("[messaging] leave conversation error", error);
      res.status(500).json({ error: "Failed to leave conversation" });
    }
  });

  return router;
}
