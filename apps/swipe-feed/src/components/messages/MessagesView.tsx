/**
 * Messages View - Direct messaging interface
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface MessagesViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ profile, onNavigate }) => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // Real conversations will be loaded from backend
  const conversations: any[] = [];

  const [currentMessages, setCurrentMessages] = useState<any[]>([]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      const newMessage = {
        id: Date.now(),
        sender: 'me',
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setCurrentMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Real-time messaging will be handled by backend
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-light">Messages</h2>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full px-10 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full p-4 hover:bg-white/5 transition-all flex items-center gap-3 ${
                selectedConversation === conv.id ? 'bg-white/10 border-l-2 border-purple-500' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {conv.avatar}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-white">{conv.name}</h3>
                  <span className="text-xs text-white/40">{conv.timestamp}</span>
                </div>
                <p className="text-sm text-white/60 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {conversations.find(c => c.id === selectedConversation)?.avatar || '?'}
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {conversations.find(c => c.id === selectedConversation)?.name || 'Select a conversation'}
                  </h3>
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('prologue')}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                      : 'bg-white/10 border border-white/10'
                  }`}>
                    <p className="text-white">{msg.text}</p>
                    <p className="text-xs text-white/40 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
                <button 
                  onClick={handleSendMessage}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={!messageText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
              <h3 className="text-xl font-light text-white/60 mb-2">Select a conversation</h3>
              <p className="text-sm text-white/40">Choose a message from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
