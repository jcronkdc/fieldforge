import { useState, useEffect, useCallback, useRef } from "react";
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage as sendMessageApi,
  createDirectConversation,
  createGroupConversation as createGroupApi,
  markAsRead as markAsReadApi,
  addReaction as addReactionApi,
  removeReaction as removeReactionApi,
  updateTypingIndicator,
  addParticipants,
  leaveConversation as leaveConversationApi,
  type Conversation,
  type Message
} from "../lib/messaging";
import { supabaseClient } from "../lib/supabaseClient";

export function useMessaging(currentUserId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; username: string; displayName?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const realtimeChannelRef = useRef<any>(null);

  // Fetch conversations
  useEffect(() => {
    if (!currentUserId) return;
    
    const loadConversations = async () => {
      setConversationsLoading(true);
      try {
        const data = await fetchConversations(currentUserId);
        setConversations(data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setConversationsLoading(false);
      }
    };
    
    loadConversations();
  }, [currentUserId]);

  // Subscribe to real-time updates for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    
    // Clean up previous subscription
    if (realtimeChannelRef.current) {
      supabaseClient.removeChannel(realtimeChannelRef.current);
    }
    
    // Subscribe to conversation updates
    const channel = supabaseClient
      .channel(`messaging:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          // Add new message to the list
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Update conversation's last message
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.createdAt }
              : conv
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        async () => {
          // Fetch updated typing indicators
          try {
            const { data } = await supabaseClient
              .from('typing_indicators')
              .select('user_id, user_profiles(username, display_name)')
              .eq('conversation_id', selectedConversation.id)
              .gt('started_at', new Date(Date.now() - 10000).toISOString());
            
            if (data) {
              setTypingUsers(data.map((d: any) => ({
                userId: d.user_id,
                username: d.user_profiles?.username || '',
                displayName: d.user_profiles?.display_name
              })).filter((u: any) => u.userId !== currentUserId));
            }
          } catch (error) {
            console.error("Failed to fetch typing indicators:", error);
          }
        }
      )
      .subscribe();
    
    realtimeChannelRef.current = channel;
    
    return () => {
      if (realtimeChannelRef.current) {
        supabaseClient.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [selectedConversation?.id, currentUserId]);

  // Select conversation and load messages
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setHasMoreMessages(true);
    setLoading(true);
    
    try {
      const data = await fetchMessages(conversation.id, currentUserId);
      setMessages(data);
      setHasMoreMessages(data.length === 50);
      
      // Mark as read
      if (conversation.unreadCount > 0) {
        await markAsReadApi(conversation.id, currentUserId);
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedConversation || !content.trim()) return;
    
    try {
      const message = await sendMessageApi(
        selectedConversation.id,
        currentUserId,
        content.trim()
      );
      
      // Optimistically add message
      setMessages(prev => [...prev, message]);
      
      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
          : conv
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [selectedConversation, currentUserId]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || loading || !hasMoreMessages) return;
    
    setLoading(true);
    try {
      const oldestMessage = messages[0];
      const data = await fetchMessages(
        selectedConversation.id,
        currentUserId,
        50,
        oldestMessage?.id
      );
      
      setMessages(prev => [...data, ...prev]);
      setHasMoreMessages(data.length === 50);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedConversation, messages, currentUserId, loading, hasMoreMessages]);

  // Add reaction
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!selectedConversation) return;
    
    try {
      await addReactionApi(messageId, currentUserId, reaction, selectedConversation.id);
      
      // Optimistically update UI
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;
        
        const reactions = msg.reactions || [];
        const existing = reactions.find(r => r.reaction === reaction);
        
        if (existing) {
          return {
            ...msg,
            reactions: reactions.map(r => 
              r.reaction === reaction 
                ? { ...r, count: r.count + 1, hasReacted: true }
                : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...reactions, { reaction, count: 1, hasReacted: true }]
          };
        }
      }));
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  }, [selectedConversation, currentUserId]);

  // Remove reaction
  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!selectedConversation) return;
    
    try {
      await removeReactionApi(messageId, currentUserId, reaction, selectedConversation.id);
      
      // Optimistically update UI
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;
        
        const reactions = msg.reactions || [];
        
        return {
          ...msg,
          reactions: reactions.map(r => 
            r.reaction === reaction 
              ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false }
              : r
          ).filter(r => r.count > 0)
        };
      }));
    } catch (error) {
      console.error("Failed to remove reaction:", error);
    }
  }, [selectedConversation, currentUserId]);

  // Update typing indicator
  const updateTyping = useCallback(async (isTyping: boolean) => {
    if (!selectedConversation) return;
    
    try {
      await updateTypingIndicator(selectedConversation.id, currentUserId, isTyping);
    } catch (error) {
      console.error("Failed to update typing indicator:", error);
    }
  }, [selectedConversation, currentUserId]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await markAsReadApi(conversationId, currentUserId);
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, [currentUserId]);

  // Create group conversation
  const createGroupConversation = useCallback(async (
    name: string, 
    description: string, 
    participantIds: string[]
  ) => {
    try {
      const conversation = await createGroupApi(currentUserId, name, description, participantIds);
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  }, [currentUserId]);

  return {
    conversations,
    messages,
    selectedConversation,
    typingUsers,
    loading,
    hasMoreMessages,
    conversationsLoading,
    selectConversation,
    sendMessage,
    loadMoreMessages,
    addReaction,
    removeReaction,
    updateTyping,
    markAsRead,
    createGroupConversation
  };
}
