/**
 * FUTURISTIC MESSAGES - Terminal-Style Chat Interface
 */

import React, { useState, useRef, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Props {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const FuturisticMessages: React.FC<Props> = ({ profile, onNavigate }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'ALPHA_USER',
      avatar: '🚀',
      lastMessage: 'Ready for the next session?',
      timestamp: '2m',
      unread: 3,
      online: true
    },
    {
      id: '2',
      name: 'STORY_MASTER',
      avatar: '📝',
      lastMessage: 'Check out my new chapter!',
      timestamp: '1h',
      unread: 0,
      online: false
    },
    {
      id: '3',
      name: 'BEAT_MAKER',
      avatar: '🎵',
      lastMessage: 'Collab on the new track?',
      timestamp: '3h',
      unread: 1,
      online: true
    }
  ]);

  // Store messages per chat
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        sender: 'ALPHA_USER',
        content: 'Hey! Are you up for another Angry Lips session?',
        timestamp: '14:23',
        isMe: false
      },
      {
        id: '2',
        sender: 'ME',
        content: 'Absolutely! The last one was hilarious.',
        timestamp: '14:24',
        isMe: true
      },
      {
        id: '3',
        sender: 'ALPHA_USER',
        content: 'Ready for the next session?',
        timestamp: '14:25',
        isMe: false
      }
    ],
    '2': [
      {
        id: '1',
        sender: 'STORY_MASTER',
        content: 'Check out my new chapter!',
        timestamp: '13:45',
        isMe: false
      }
    ],
    '3': [
      {
        id: '1',
        sender: 'BEAT_MAKER',
        content: 'Collab on the new track?',
        timestamp: '11:30',
        isMe: false
      }
    ]
  });
  
  // Get current messages based on selected chat
  const messages = selectedChat ? (chatMessages[selectedChat.id] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    // Add user message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'ME',
      content: message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isMe: true
    };
    
    // Update messages for current chat
    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));
    setMessage('');
    
    // Update last message in chat list
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, lastMessage: message, timestamp: 'now', unread: 0 }
          : chat
      )
    );
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Generate contextual response
      const responses = getAIResponse(message, selectedChat.name);
      
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: selectedChat.name,
        content: responses,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isMe: false
      };
      
      // Update messages for current chat with AI response
      setChatMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), aiMessage]
      }));
      
      // Update chat list with AI response
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, lastMessage: responses, timestamp: 'now' }
            : chat
        )
      );
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  };
  
  // AI response generator
  const getAIResponse = (userMessage: string, sender: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware responses based on sender
    if (sender === 'ALPHA_USER') {
      if (lowerMessage.includes('angry lips') || lowerMessage.includes('game')) {
        const responses = [
          'Great! I just created a new session. Want to join?',
          'Perfect timing! The AI just generated an epic space pirate story.',
          'Let\'s do it! I\'ll set up a versus mode game.',
          'Awesome! Check out the new advanced modes - they\'re incredible!'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return 'Hey there! Ready for some gaming action?';
      }
    }
    
    if (sender === 'STORY_MASTER') {
      if (lowerMessage.includes('story') || lowerMessage.includes('chapter')) {
        const responses = [
          'Just finished Chapter 5! The plot twist is insane.',
          'Working on a cyberpunk saga. Want to collaborate?',
          'The AI suggestions for my story are mind-blowing!',
          'Check out my latest branch - added a new character arc.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    if (sender === 'BEAT_MAKER') {
      if (lowerMessage.includes('music') || lowerMessage.includes('track') || lowerMessage.includes('song')) {
        const responses = [
          'Just dropped a sick beat! 140 BPM synthwave vibes.',
          'The AI melody generator is fire! You should try it.',
          'Collab time! I need vocals for this new track.',
          'Check out my latest mix in SongForge - it\'s trending!'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // Generic responses
    const genericResponses = [
      'That sounds interesting! Tell me more.',
      'Totally agree with you on that.',
      'Have you tried the new features yet?',
      'Nice! I\'m excited about this.',
      'Let\'s make it happen!',
      'That\'s what I\'m talking about!',
      'For sure! Count me in.',
      'Interesting perspective. I like it.'
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Chat List */}
      <div className="w-80 border-r border-cyan-500/20 bg-black/90">
        <div className="p-4 border-b border-cyan-500/20">
          <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider">MESSAGES</h2>
          <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">SECURE CHANNEL</p>
        </div>
        
        <div className="overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-4 border-b border-gray-900 hover:bg-cyan-500/5 transition-all text-left ${
                selectedChat?.id === chat.id ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-xl">
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-cyan-400 text-sm uppercase tracking-wider">{chat.name}</h3>
                    <span className="text-xs text-gray-600">{chat.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs text-black font-bold">
                    {chat.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-cyan-500/20 bg-black/90">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-xl">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h3 className="font-black text-cyan-400 uppercase tracking-wider">{selectedChat.name}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedChat.online ? (
                        <span className="text-green-400">● ONLINE</span>
                      ) : (
                        <span className="text-gray-600">● OFFLINE</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('prologue')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md ${msg.isMe ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isMe && <span className="text-xs text-cyan-400 uppercase">{msg.sender}</span>}
                      <span className="text-xs text-gray-600">{msg.timestamp}</span>
                      {msg.isMe && <span className="text-xs text-green-400 uppercase">ME</span>}
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-lg ${
                      msg.isMe 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300' 
                        : 'bg-gray-900/60 border border-gray-800 text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-xs uppercase">ALPHA_USER IS TYPING</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cyan-500/20 bg-black/90">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="TYPE MESSAGE..."
                  className="flex-1 px-4 py-2 bg-black/60 border border-gray-800 rounded-lg text-cyan-300 placeholder-gray-600 focus:border-cyan-500 focus:outline-none font-mono uppercase"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  SEND
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-black text-cyan-400 mb-2">SELECT CHAT</h2>
              <p className="text-gray-500 uppercase tracking-wider">Choose a conversation to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticMessages;
