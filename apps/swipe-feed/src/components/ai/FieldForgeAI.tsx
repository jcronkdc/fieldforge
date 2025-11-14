import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  Shield,
  Clock,
  BarChart3,
  Activity,
  Bot,
  Loader2,
  ChevronDown,
  FileText,
  HelpCircle,
  Settings,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type MessageRole = 'user' | 'assistant' | 'system';
type InsightType = 'safety' | 'efficiency' | 'schedule' | 'resource' | 'predictive';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  insights?: Insight[];
  actions?: QuickAction[];
}

interface Insight {
  type: InsightType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface QuickAction {
  label: string;
  action: string;
  icon: React.ElementType;
}

interface PredictiveAnalytics {
  projectCompletion: {
    estimated: string;
    confidence: number;
    factors: string[];
  };
  safetyRisk: {
    level: 'low' | 'medium' | 'high';
    areas: string[];
    recommendations: string[];
  };
  resourceUtilization: {
    current: number;
    optimal: number;
    suggestions: string[];
  };
  weatherImpact: {
    nextWeek: string[];
    recommendations: string[];
  };
}

// Suggested queries for different categories
const suggestedQueries = {
  safety: [
    "What are today's safety concerns?",
    "Show me recent incident trends",
    "Which crews need safety refreshers?",
    "Analyze PPE compliance rates"
  ],
  schedule: [
    "What's the critical path status?",
    "Show me potential delays",
    "Which tasks are behind schedule?",
    "Optimize tomorrow's crew assignments"
  ],
  resources: [
    "Check equipment utilization",
    "What materials are running low?",
    "Show crew availability next week",
    "Analyze overtime trends"
  ],
  analytics: [
    "Show project health metrics",
    "Compare this week to last week",
    "What's our efficiency trend?",
    "Predict completion date"
  ]
};

// AI response simulator (in production, this would call a real AI service)
const generateAIResponse = async (query: string): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const lowerQuery = query.toLowerCase();
  
  // Safety-related queries
  if (lowerQuery.includes('safety') || lowerQuery.includes('incident') || lowerQuery.includes('ppe')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Based on current site conditions, I've identified 3 key safety areas requiring attention. Heat stress risk is elevated due to today's temperature (89°F). I've also noticed PPE compliance has dropped 5% in the west sector.",
      timestamp: new Date(),
      insights: [
        {
          type: 'safety',
          title: 'Heat Stress Alert',
          description: 'Temperature exceeds 85°F. Implement mandatory hydration breaks.',
          priority: 'high',
          metric: '89°F',
          trend: 'up'
        },
        {
          type: 'safety',
          title: 'PPE Compliance',
          description: 'West sector showing 92% compliance, below 95% target.',
          priority: 'medium',
          metric: '92%',
          trend: 'down'
        }
      ],
        actions: [
        { label: 'Send Heat Alert', action: 'alert-heat', icon: AlertTriangle },
        { label: 'Schedule Safety Brief', action: 'schedule-brief', icon: Calendar },
        { label: 'View PPE Report', action: 'view-ppe', icon: FileText }
        ]
      };
    }

    // Schedule-related queries
  if (lowerQuery.includes('schedule') || lowerQuery.includes('delay') || lowerQuery.includes('behind')) {
      return {
        id: Date.now().toString(),
      role: 'assistant',
      content: "The project is currently 2 days behind schedule, primarily due to weather delays last week. However, I've identified opportunities to accelerate 3 tasks by reallocating crews from completed sections. Implementing these changes could recover 1.5 days.",
      timestamp: new Date(),
      insights: [
        {
          type: 'schedule',
          title: 'Critical Path Analysis',
          description: 'Substation grounding installation is the current bottleneck.',
          priority: 'high',
          metric: '-2 days',
          trend: 'down'
        },
        {
          type: 'efficiency',
          title: 'Recovery Opportunity',
          description: 'Parallel task execution possible for sections 4 & 5.',
          priority: 'medium',
          metric: '+1.5 days',
          trend: 'up'
        }
      ],
        actions: [
        { label: 'Optimize Schedule', action: 'optimize', icon: TrendingUp },
        { label: 'Reallocate Crews', action: 'reallocate', icon: Users },
        { label: 'Update Timeline', action: 'update-timeline', icon: Calendar }
        ]
      };
    }

  // Resource queries
  if (lowerQuery.includes('equipment') || lowerQuery.includes('utilization') || lowerQuery.includes('crew')) {
      return {
        id: Date.now().toString(),
      role: 'assistant',
      content: "Equipment utilization is at 78%, which is below our 85% target. I've noticed Crane #3 has been idle for 6 hours today. Crew Alpha is operating at 95% efficiency, while Crew Beta is at 72% due to waiting on materials.",
      timestamp: new Date(),
      insights: [
        {
          type: 'resource',
          title: 'Equipment Optimization',
          description: 'Crane #3 could be reassigned to Section B.',
          priority: 'medium',
          metric: '78%',
          trend: 'stable'
        },
        {
          type: 'efficiency',
          title: 'Crew Performance Gap',
          description: 'Material delays affecting Crew Beta productivity.',
          priority: 'high',
          metric: '72%',
          trend: 'down'
        }
      ],
        actions: [
        { label: 'Reassign Equipment', action: 'reassign', icon: Truck },
        { label: 'Order Materials', action: 'order', icon: Package },
        { label: 'View Utilization', action: 'view-util', icon: BarChart3 }
        ]
      };
    }

  // Default intelligent response
      return {
        id: Date.now().toString(),
    role: 'assistant',
    content: "I've analyzed your query and current project status. Overall project health is good with 82% on-time task completion. I recommend focusing on the upcoming transformer installation as it's a critical path item. Would you like me to dive deeper into any specific area?",
    timestamp: new Date(),
    insights: [
      {
        type: 'predictive',
        title: 'Project Health Score',
        description: 'Overall project tracking well with minor schedule pressure.',
        priority: 'low',
        metric: '82%',
        trend: 'stable'
      }
    ],
    actions: [
      { label: 'View Dashboard', action: 'dashboard', icon: LayoutDashboard },
      { label: 'Daily Report', action: 'report', icon: FileText }
    ]
  };
};

// Insight card component
function InsightCard({ insight }: { insight: Insight }) {
  const iconMap = {
    safety: Shield,
    efficiency: TrendingUp,
    schedule: Calendar,
    resource: Users,
    predictive: Brain
  };
  
  const Icon = iconMap[insight.type];
  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/10',
    medium: 'border-yellow-500/30 bg-yellow-500/10',
    low: 'border-green-500/30 bg-green-500/10'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${priorityColors[insight.priority]} backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            insight.priority === 'high' ? 'bg-red-500/20' :
            insight.priority === 'medium' ? 'bg-yellow-500/20' :
            'bg-green-500/20'
          }`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
            <p className="text-slate-300 text-xs mt-1">{insight.description}</p>
          </div>
        </div>
        {insight.metric && (
          <div className="text-right">
            <div className="text-lg font-bold text-white">{insight.metric}</div>
            {insight.trend && (
              <div className={`text-xs ${
                insight.trend === 'up' ? 'text-green-400' :
                insight.trend === 'down' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Main FieldForgeAI component
export const FieldForgeAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm FieldForge AI, your intelligent construction assistant. I can help you with safety analysis, schedule optimization, resource planning, and predictive insights. What would you like to know about your project?",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof suggestedQueries>('safety');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      const response = await generateAIResponse(query);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Voice input simulation
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // In production, this would use Web Speech API
      setTimeout(() => {
        setInput("What's the current safety status across all active sites?");
        setIsListening(false);
      }, 2000);
    }
  };
  
  // Quick action handler
  const handleQuickAction = (action: string) => {
    console.log('Executing action:', action);
    // In production, this would trigger actual actions
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">FieldForge AI Assistant</h2>
              <p className="text-sm text-slate-400">Intelligent construction insights & automation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className={`px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/50 text-white border border-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
            </div>

                  {/* Insights */}
                  {message.insights && message.insights.length > 0 && (
                    <div className="grid gap-2 mt-3">
                      {message.insights.map((insight, idx) => (
                        <InsightCard key={idx} insight={insight} />
                      ))}
                  </div>
                )}

                  {/* Quick Actions */}
                            {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.actions.map((action, idx) => (
                                  <button
                          key={idx}
                          onClick={() => handleQuickAction(action.action)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
                        >
                          <action.icon className="w-4 h-4" />
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                  <div className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                      </div>
                    </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-slate-400"
          >
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your request...</span>
                        </div>
          </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && !isLoading && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-700"
          >
            <div className="px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300">Suggested queries</span>
                <div className="flex gap-2">
                  {Object.keys(suggestedQueries).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as keyof typeof suggestedQueries)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                    </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQueries[selectedCategory].map((query, idx) => (
                    <button
                    key={idx}
                    onClick={() => handleSubmit(query)}
                    className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border border-slate-700"
                  >
                    {query}
                    </button>
                ))}
                  </div>
                </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your construction project..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-red-500 animate-pulse"></div>
                  <div className="w-1 h-6 bg-red-500 animate-pulse animation-delay-100"></div>
                  <div className="w-1 h-3 bg-red-500 animate-pulse animation-delay-200"></div>
                  <div className="w-1 h-5 bg-red-500 animate-pulse animation-delay-300"></div>
                </div>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Send
          </button>
        </form>
        
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Real-time analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure & private</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing imports
import { User, LayoutDashboard, Package } from 'lucide-react';