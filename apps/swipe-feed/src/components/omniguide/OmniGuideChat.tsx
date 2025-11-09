/**
 * OMNIGUIDE CHAT INTERFACE - Futuristic AI Assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { OmniGuideCore, OmniGuideResponse, OmniGuideContext } from '../../lib/omniguide/core';
import { useSparks } from '../sparks/SparksContext';
import { useAuth } from '../../context/AuthContext';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Props {
  currentView: FocusedView;
  onNavigate: (view: FocusedView) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actions?: any[];
  troubleshooting?: any[];
  requiresUpgrade?: any;
}

export const OmniGuideChat: React.FC<Props> = ({
  currentView,
  onNavigate,
  isMinimized = false,
  onToggleMinimize
}) => {
  const { user } = useAuth();
  const { balance: sparksBalance, isAdmin } = useSparks();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: `Welcome to MythaTron! I'm OmniGuide, your genius-level AI assistant with complete knowledge of this platform.

I can help you with:
• 🎮 Games - AngryLips battles, MythaQuest RPG adventures
• 🎨 Creative Tools - StoryForge narratives, SongForge music
• 💎 Sparks Economy - Pricing, purchases, rewards
• 🚀 Features - Social, collaboration, achievements
• 🐛 Feedback - Report bugs, request features

Just ask me anything! I remember our conversations and learn your preferences. What would you like to explore?`,
      timestamp: Date.now(),
      actions: [
        {
          type: 'execute',
          label: 'Show me around',
          command: 'tour',
          params: {}
        },
        {
          type: 'execute',
          label: 'How does this work?',
          command: 'explain.platform',
          params: {}
        },
        {
          type: 'execute',
          label: 'What can I create?',
          command: 'show.apps',
          params: {}
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const omniGuideRef = useRef<OmniGuideCore | null>(null);

  // Initialize OmniGuide
  useEffect(() => {
    const context: OmniGuideContext = {
      userId: user?.id || 'guest',
      userTier: isAdmin ? 'pro' : sparksBalance > 5000 ? 'standard' : 'free',
      currentView,
      sparksBalance,
      permissions: isAdmin ? ['all'] : ['basic'],
      sessionHistory: messages.map(m => m.content),
      activeErrors: [],
      pageData: { view: currentView }
    };

    omniGuideRef.current = new OmniGuideCore(
      context,
      import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
      'gpt-4.1'
    );
  }, [user, isAdmin, sparksBalance, currentView]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Process with OmniGuide
      const response = await omniGuideRef.current!.processQuery(input);
      
      // Handle navigation
      if (response.navigation) {
        onNavigate(response.navigation.view);
      }

      // Check for upgrade requirement
      if (response.requiresUpgrade) {
        setShowUpgrade(true);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        actions: response.actions,
        troubleshooting: response.troubleshooting,
        requiresUpgrade: response.requiresUpgrade
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Log interaction
      omniGuideRef.current!.logInteraction(input, response);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: 'Error processing request. Initiating diagnostics...',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = (action: any) => {
    if (action.requiresPremium && !isAdmin) {
      setShowUpgrade(true);
      return;
    }

    switch (action.type) {
      case 'navigate':
        // Ask for confirmation before navigating
        if (action.params?.view) {
          const confirmMessage = `Taking you to ${action.label || action.params.view}...`;
          setMessages(prev => [...prev, {
            id: `confirm-${Date.now()}`,
            type: 'system',
            content: confirmMessage,
            timestamp: Date.now()
          }]);
          
          // Navigate after a short delay for user to see the message
          setTimeout(() => {
            onNavigate(action.params.view);
          }, 500);
        }
        break;
      case 'purchase':
        onNavigate('sparks-store');
        break;
      case 'reset':
        window.location.reload();
        break;
      case 'execute':
        handleExecuteAction(action);
        break;
    }
  };

  const handleExecuteAction = (action: any) => {
    switch (action.command) {
      case 'tour':
        handleSend('Give me a tour of MythaTron');
        break;
      case 'explain.platform':
        handleSend('How does MythaTron work?');
        break;
      case 'show.apps':
        handleSend('What creative tools are available?');
        break;
      case 'explain':
        if (action.params?.topic) {
          handleSend(`Tell me more about ${action.params.topic}`);
        }
        break;
      case 'show.related':
        if (action.params?.topics) {
          const topicsMessage = `Related topics: ${action.params.topics.join(', ')}. What would you like to know more about?`;
          setMessages(prev => [...prev, {
            id: `related-${Date.now()}`,
            type: 'assistant',
            content: topicsMessage,
            timestamp: Date.now()
          }]);
        }
        break;
      default:
        console.log('Unknown action:', action.command, action.params);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 group">
        <button
          onClick={onToggleMinimize}
          className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform hover:shadow-[0_0_60px_rgba(6,182,212,0.8)]"
        >
          <div className="absolute inset-0 rounded-full animate-ping bg-cyan-500 opacity-30"></div>
          <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {messages.length > 1 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-xs font-bold text-white">
              !
            </div>
          )}
        </button>
        <div className="absolute bottom-20 right-0 bg-black/90 border border-cyan-500/30 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">AI ASSISTANT</p>
          <p className="text-xs text-gray-500">Click for help or feedback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="omniguide-chat-container fixed bottom-4 right-4 w-96 h-[600px] bg-black/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] z-50 flex flex-col overflow-hidden md:bottom-4 md:right-4 md:w-96 md:h-[600px]">
      {/* Header */}
      <div className="omniguide-header border-b border-cyan-500/20 px-4 py-3 bg-black/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-black text-cyan-400 uppercase tracking-wider">OMNIGUIDE AI</h3>
          </div>
          <button
            onClick={onToggleMinimize}
            className="p-1 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">
          SYSTEM AUTHORITY • {currentView.toUpperCase()}
        </p>
      </div>

      {/* Messages */}
      <div className="omniguide-messages-container flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {message.type !== 'user' && (
                <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">
                  {message.type === 'assistant' ? 'OMNIGUIDE' : 'SYSTEM'}
                </div>
              )}
              <div className={`px-3 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300'
                  : message.type === 'system'
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-gray-900/60 border border-gray-800 text-gray-300'
              }`}>
                <p className="text-sm">{message.content}</p>
                
                {/* Troubleshooting Steps */}
                {message.troubleshooting && (
                  <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                    {message.troubleshooting.map((step: any) => (
                      <div key={step.step} className="flex gap-2">
                        <span className="text-cyan-400 font-bold">{step.step}.</span>
                        <div className="flex-1">
                          <p className="text-xs">{step.instruction}</p>
                          {step.verification && (
                            <p className="text-xs text-gray-600 mt-1">✓ {step.verification}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {message.actions && (
                  <div className="omniguide-actions-container mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => executeAction(action)}
                        className="omniguide-action-button px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Upgrade Prompt */}
                {message.requiresUpgrade && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-xs text-purple-400 font-bold uppercase mb-2">
                      {message.requiresUpgrade.tier} REQUIRED
                    </p>
                    <ul className="space-y-1">
                      {message.requiresUpgrade.features.slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-400">• {feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onNavigate('sparks-store')}
                      className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-black font-black uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all"
                    >
                      {message.requiresUpgrade.ctaText}
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-700 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs uppercase">Processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Feedback Buttons */}
      <div className="border-t border-cyan-500/20 px-4 py-2 bg-black/80">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">QUICK FEEDBACK</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setInput('I found a bug');
              handleSend('I found a bug');
            }}
            className="flex-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-all"
          >
            🐛 BUG
          </button>
          <button
            onClick={() => {
              setInput('I have a feature request');
              handleSend('I have a feature request');
            }}
            className="flex-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs font-bold uppercase tracking-wider text-purple-400 hover:bg-purple-500/20 transition-all"
          >
            ✨ FEATURE
          </button>
          <button
            onClick={() => {
              setInput('I have feedback');
              handleSend('I have feedback');
            }}
            className="flex-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            💬 FEEDBACK
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-cyan-500/20 p-4 bg-black/90">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="TYPE MESSAGE OR FEEDBACK..."
            className="flex-1 px-3 py-2 bg-black/60 border border-gray-800 rounded-lg text-cyan-300 placeholder-gray-600 focus:border-cyan-500 focus:outline-none text-sm uppercase tracking-wider"
            disabled={isProcessing}
          />
          <button
            onClick={() => handleSend()}
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            {isAdmin ? 'ADMIN ACCESS' : sparksBalance > 5000 ? 'STANDARD' : 'FREE TIER'}
          </p>
          {isAdmin && (
            <button
              onClick={() => onNavigate('feedback')}
              className="text-xs text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
            >
              VIEW ALL FEEDBACK →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OmniGuideChat;
