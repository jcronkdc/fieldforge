/**
 * Collaborative Chat - Real-time chat for all collaborative features
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Similar to Roblox chat - always available during collaborative sessions
 */

import React, { useState, useEffect, useRef } from 'react';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'join' | 'leave';
  avatar?: string;
}

interface CollaborativeChatProps {
  sessionId: string;
  userId: string;
  username: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const CollaborativeChat: React.FC<CollaborativeChatProps> = ({
  sessionId,
  userId,
  username,
  isMinimized = false,
  onToggleMinimize,
  position = 'bottom-right'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Common emojis for quick access
  const quickReactions = [
    { id: 'like', icon: '♥', label: 'Like' },
    { id: 'fire', icon: '◆', label: 'Fire' },
    { id: 'star', icon: '★', label: 'Star' },
    { id: 'check', icon: '✓', label: 'Agree' },
    { id: 'think', icon: '◉', label: 'Thinking' },
    { id: 'wow', icon: '◈', label: 'Wow' }
  ];

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };

  useEffect(() => {
    // Load messages from localStorage (in production, this would be WebSocket)
    const storageKey = `chat_${sessionId}`;
    const savedMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setMessages(savedMessages);

    // Add join message
    const joinMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'system',
      username: 'System',
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
      type: 'join'
    };
    
    const updatedMessages = [...savedMessages, joinMessage];
    setMessages(updatedMessages);
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));

    // Listen for real-time updates via storage events (works across tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const newMessages = JSON.parse(e.newValue);
        setMessages(newMessages);
        
        // Update unread count if minimized
        if (isMinimized && newMessages.length > messages.length) {
          setUnreadCount(prev => prev + (newMessages.length - messages.length));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Real-time updates will come from backend

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      
      // Add leave message
      const leaveMessage: ChatMessage = {
        id: `msg_${Date.now()}_leave`,
        userId: 'system',
        username: 'System',
        message: `${username} left the chat`,
        timestamp: new Date().toISOString(),
        type: 'leave'
      };
      
      const currentMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...currentMessages, leaveMessage]));
    };
  }, [sessionId, username]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Reset unread count when chat is opened
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId,
      username,
      message: inputText.trim(),
      timestamp: new Date().toISOString(),
      type: 'chat',
      avatar: username[0].toUpperCase()
    };

    const storageKey = `chat_${sessionId}`;
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    
    setInputText('');
    
    // Simulate response from other users sometimes
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const responses = [
          "That's awesome! 😄",
          "LOL that word choice!",
          "This story is getting wild",
          "Great idea!",
          "I can't wait to see how this ends",
          "😂😂😂",
          "Let's make it even crazier!",
          "Who picked that word?? 🤣"
        ];
        
        const mockResponse: ChatMessage = {
          id: `msg_${Date.now()}_mock`,
          userId: 'mock_user',
          username: 'Alex Writer',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          type: 'chat',
          avatar: 'A'
        };
        
        setMessages(prev => {
          const updated = [...prev, mockResponse];
          const key = `chat_${sessionId}`;
          localStorage.setItem(key, JSON.stringify(updated));
          return updated;
        });
        
        if (isMinimized) {
          setUnreadCount(prev => prev + 1);
        }
      }, 2000 + Math.random() * 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className={`fixed ${positionClasses[position]} z-40`}>
        <button
          onClick={onToggleMinimize}
          className="relative p-4 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-2xl transition-all group"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
            Open Chat
          </div>
        </button>
      </div>
    );
  }

  // Full chat view
  return (
    <div className={`fixed ${positionClasses[position]} w-80 h-96 bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl z-40 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
          <span className="text-sm font-medium text-white">Session Chat</span>
          <span className="text-xs text-white/40">({messages.filter(m => m.type === 'chat').length} messages)</span>
        </div>
        <button
          onClick={onToggleMinimize}
          className="text-white/40 hover:text-white/60 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`${
            msg.userId === userId ? 'ml-auto' : ''
          } ${msg.type !== 'chat' ? 'w-full' : 'max-w-[70%]'}`}>
            {msg.type === 'system' || msg.type === 'join' || msg.type === 'leave' ? (
              <div className="text-center text-xs text-white/40 py-1">
                {msg.type === 'join' && '→ '}
                {msg.type === 'leave' && '← '}
                {msg.message}
              </div>
            ) : (
              <div className={`flex gap-2 ${msg.userId === userId ? 'flex-row-reverse' : ''}`}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {msg.avatar || msg.username[0].toUpperCase()}
                </div>
                <div className={`flex flex-col ${msg.userId === userId ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/60">{msg.username}</span>
                    <span className="text-xs text-white/30">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-xl ${
                    msg.userId === userId 
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30' 
                      : 'bg-white/10 border border-white/10'
                  }`}>
                    <p className="text-sm text-white break-words">{msg.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isTyping.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
            </div>
            {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        
        {/* Enhanced Emoji Picker */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/40">Quick emojis:</span>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {showEmojiPicker ? 'Hide' : 'Show all'}
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {(showEmojiPicker ? quickReactions.slice(0, 6) : quickReactions.slice(0, 4)).map(reaction => (
              <button
                key={emoji}
                onClick={() => {
                  setInputText(inputText + emoji);
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-white/10 rounded transition-all text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
