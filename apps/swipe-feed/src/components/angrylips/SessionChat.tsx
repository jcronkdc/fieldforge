/**
 * Session Chat for AngryLips Online Games
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/Icons';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system' | 'game';
}

interface Props {
  sessionId: string;
  currentPlayer: string;
  players: string[];
  isOnline: boolean;
}

export const SessionChat: React.FC<Props> = ({ 
  sessionId, 
  currentPlayer, 
  players, 
  isOnline 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'System',
      content: 'Welcome to the game! Chat with other players here.',
      timestamp: Date.now(),
      type: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentPlayer,
      content: input.trim(),
      timestamp: Date.now(),
      type: 'chat'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate other players responding (for demo)
    if (isOnline && players.length > 1) {
      setTimeout(() => {
        const responses = [
          "Great move!",
          "That's hilarious!",
          "Nice one!",
          "LOL",
          "Good choice!"
        ];
        const otherPlayer = players.find(p => p !== currentPlayer) || 'Player 2';
        
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-response`,
          sender: otherPlayer,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now(),
          type: 'chat'
        }]);
      }, 2000 + Math.random() * 3000);
    }
  };

  if (!isOnline) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-all session-chat ${
      isExpanded ? 'w-80' : 'w-14'
    }`}>
      {/* Chat Window */}
      {isExpanded && (
        <div className="bg-black/90 border border-cyan-500/30 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Icons.Messages size={16} className="text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Game Chat
              </span>
              <span className="text-xs text-gray-500">
                ({players.length} players)
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={`${
                msg.type === 'system' 
                  ? 'text-center' 
                  : msg.sender === currentPlayer 
                    ? 'text-right' 
                    : 'text-left'
              }`}>
                {msg.type === 'system' ? (
                  <div className="text-xs text-gray-500 italic">
                    {msg.content}
                  </div>
                ) : (
                  <div className={`inline-block max-w-[70%] ${
                    msg.sender === currentPlayer
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-purple-500/20 border border-purple-500/30'
                  } rounded-lg px-3 py-2`}>
                    <div className="text-xs font-bold text-cyan-400 mb-1">
                      {msg.sender}
                    </div>
                    <div className="text-sm text-white">
                      {msg.content}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-cyan-500/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] transition-all ${
          isExpanded ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        <Icons.Messages size={24} className="text-white" />
        {messages.length > 1 && !isExpanded && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {messages.length - 1}
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
