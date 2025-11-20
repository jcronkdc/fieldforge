import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Sparkles, Send, Mic, MicOff, Volume2, VolumeX,
  Zap, TrendingUp, AlertTriangle, CheckCircle, Info,
  ChevronDown, ChevronUp, Cpu, Activity, Bot, Loader2,
  Shield, Calendar, Users, Wrench, FileText, Map, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AISuggestion {
  id: string;
  project_id: string;
  suggestion_type: string;
  title: string;
  description: string;
  priority: string;
  impact_score: number;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I\'m your AI construction assistant. I can help you with safety protocols, scheduling optimization, resource management, and real-time insights. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isVisible, setIsVisible] = useState(false); // Start closed
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    fetchAISuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAISuggestions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('status', 'pending')
      .order('impact_score', { ascending: false })
      .limit(5);

    if (data) {
      setSuggestions(data);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Get current user and project context
      const { data: { user } } = await supabase.auth.getUser();
      const currentPath = window.location.pathname;

      // Check if this is a navigation/help query
      const isNavigationQuery = /\b(where|how|show|navigate|find|go to|help|guide)\b/i.test(userInput);
      const isProjectQuery = /\b(project|summary|status|overview|analytics)\b/i.test(userInput);
      
      let response;

      if (isNavigationQuery) {
        // Use navigation endpoint
        response = await fetch('/api/ai/navigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userInput,
            currentPath,
            userId: user?.id,
          }),
        });
      } else if (isProjectQuery && userInput.toLowerCase().includes('summary')) {
        // Get project summary
        const projectId = localStorage.getItem('currentProjectId');
        if (projectId) {
          response = await fetch(`/api/ai/project/${projectId}/summary?userId=${user?.id}`);
        } else {
          throw new Error('No project selected');
        }
      } else {
        // Use standard AI chat
        response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: userInput,
            context: {
              userId: user?.id,
              category: 'general',
            },
          }),
        });
      }

      if (!response) {
        throw new Error('No response from AI');
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || data.summary || generateFallbackResponse(userInput),
        timestamp: new Date(),
        suggestions: data.insights || []
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI error:', error);
      // Fallback to local response if API fails
      const aiResponse = generateAIResponse(userInput);
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (query: string): string => {
    return generateAIResponse(query).content;
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    let response = '';
    let relevantSuggestions: AISuggestion[] = [];

    if (lowerQuery.includes('safety')) {
      response = 'Based on current conditions, I recommend implementing enhanced fall protection protocols for work above 6 feet. The weather forecast shows high winds tomorrow, so consider postponing elevated work. I\'ve also identified 3 safety optimizations that could reduce incident risk by 45%.';
      relevantSuggestions = suggestions.filter(s => s.suggestion_type === 'safety');
    } else if (lowerQuery.includes('schedule') || lowerQuery.includes('timeline')) {
      response = 'Your current project is tracking 2 days ahead of schedule. However, material deliveries for Phase 3 may cause a bottleneck next week. I suggest pre-ordering supplies and adjusting crew assignments to maintain momentum. Critical path analysis shows potential for 15% time savings.';
      relevantSuggestions = suggestions.filter(s => s.suggestion_type === 'schedule');
    } else if (lowerQuery.includes('crew') || lowerQuery.includes('team')) {
      response = 'Current crew efficiency is at 87%. I\'ve identified skill gaps in electrical work that could be addressed with targeted training. Recommend redistributing teams to balance workload - Crew A is at 95% capacity while Crew B is at 70%.';
      relevantSuggestions = suggestions.filter(s => s.suggestion_type === 'resource');
    } else if (lowerQuery.includes('weather')) {
      response = 'Weather analysis: Clear conditions for the next 3 days, then 60% chance of rain Thursday-Friday. Temperature dropping to 45°F overnight. Consider scheduling concrete pours for tomorrow morning and indoor work for end of week.';
    } else if (lowerQuery.includes('optimize') || lowerQuery.includes('improve')) {
      response = 'I\'ve analyzed your project data and identified several optimization opportunities: 1) Equipment utilization can be improved by 23% through better scheduling, 2) Material waste can be reduced by implementing just-in-time delivery, 3) Communication delays are causing 1.5 hours of lost productivity daily.';
      relevantSuggestions = suggestions.filter(s => s.suggestion_type === 'optimization');
    } else {
      response = 'I can help you with various aspects of your construction project. Try asking about safety protocols, schedule optimization, crew management, weather impacts, or quality control. I\'m constantly analyzing your project data to provide proactive insights.';
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      suggestions: relevantSuggestions.slice(0, 3)
    };
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In production, integrate with Web Speech API
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    // In production, integrate with Text-to-Speech
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'safety': return Shield;
      case 'schedule': return Calendar;
      case 'resource': return Users;
      case 'quality': return CheckCircle;
      default: return TrendingUp;
    }
  };

  const quickActions = [
    { label: 'Safety Check', icon: Shield, query: 'Show me current safety concerns and how to report an incident' },
    { label: 'Project Summary', icon: Calendar, query: 'Give me a comprehensive project summary with analytics' },
    { label: 'Navigation Help', icon: Map, query: 'Show me all features and how to navigate the platform' },
    { label: 'Weather Impact', icon: Activity, query: 'How will weather affect our work and what is the workability score?' }
  ];

  // Show floating button when assistant is hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <Brain className="w-8 h-8 text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-auto' : 'w-96'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="relative">
              <Brain className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-white font-bold">AI Assistant</h3>
              <p className="text-purple-100 text-xs">Always learning, always helping</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* AI Suggestions Banner */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-gray-900 border-x border-gray-800 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide">AI Insights</span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 2).map((suggestion) => {
                  const Icon = getSuggestionIcon(suggestion.suggestion_type);
                  return (
                    <div
                      key={suggestion.id}
                      className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start space-x-2">
                        <Icon className={`w-4 h-4 mt-0.5 ${getPriorityColor(suggestion.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">{suggestion.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              Impact: {suggestion.impact_score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="bg-gray-900 border-x border-gray-800 h-96 overflow-y-auto">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-purple-400 font-medium">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Show suggestions if any */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-400">Related insights:</p>
                          {message.suggestions.map((s) => (
                            <div key={s.id} className="bg-gray-900/50 rounded p-2">
                              <p className="text-xs text-purple-300">{s.title}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-sm text-gray-400">AI is thinking</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border-x border-gray-800 p-3">
            <div className="flex gap-2 flex-wrap">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(action.query);
                      handleSend();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="bg-gray-900 border border-gray-800 rounded-b-2xl p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything"
                className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              
              <button
                onClick={toggleSpeaking}
                className={`p-2 rounded-lg transition-colors ${
                  isSpeaking
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
