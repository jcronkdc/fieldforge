import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Mic, MicOff, Send, AlertTriangle, Zap,
  TrendingUp, Shield, Calendar, Users, Truck,
  FileText, Activity, HelpCircle, X, Minimize2,
  Maximize2, Volume2, VolumeX, ChevronDown, Sparkles,
  Bot, User, Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  category?: 'safety' | 'schedule' | 'equipment' | 'compliance' | 'general';
  actionable?: boolean;
  actions?: AIAction[];
}

interface AIAction {
  id: string;
  label: string;
  action: string;
  params?: any;
}

interface Insight {
  id: string;
  type: 'warning' | 'suggestion' | 'prediction' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
}

interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: React.ElementType;
  category: string;
}

export const FieldForgeAI: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickPrompts: QuickPrompt[] = [
    {
      id: '1',
      label: 'Safety Analysis',
      prompt: 'Analyze current safety conditions and identify any potential hazards',
      icon: Shield,
      category: 'safety'
    },
    {
      id: '2',
      label: 'Schedule Optimization',
      prompt: 'Review the project schedule and suggest optimizations',
      icon: Calendar,
      category: 'schedule'
    },
    {
      id: '3',
      label: 'Equipment Status',
      prompt: 'Check equipment health and predict maintenance needs',
      icon: Truck,
      category: 'equipment'
    },
    {
      id: '4',
      label: 'Crew Productivity',
      prompt: 'Analyze crew productivity and suggest improvements',
      icon: Users,
      category: 'productivity'
    },
    {
      id: '5',
      label: 'Compliance Check',
      prompt: 'Review all compliance requirements and identify any gaps',
      icon: FileText,
      category: 'compliance'
    },
    {
      id: '6',
      label: 'Cost Analysis',
      prompt: 'Analyze project costs and identify potential savings',
      icon: TrendingUp,
      category: 'finance'
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: `Hello ${user?.email?.split('@')[0] || 'there'}! I'm your FieldForge AI assistant. I can help you with safety analysis, schedule optimization, equipment monitoring, and much more. How can I assist you today?`,
        timestamp: new Date().toISOString(),
        category: 'general'
      };
      setMessages([welcomeMessage]);
    }

    // Simulate real-time insights
    const insightInterval = setInterval(() => {
      generateInsight();
    }, 30000); // Every 30 seconds

    return () => clearInterval(insightInterval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const generateInsight = () => {
    const insightTypes = [
      {
        type: 'warning' as const,
        title: 'Equipment Maintenance Due',
        description: 'Crane 01 has exceeded 80% of its maintenance interval. Schedule service soon.',
        impact: 'medium' as const,
        category: 'equipment'
      },
      {
        type: 'suggestion' as const,
        title: 'Weather Window Opportunity',
        description: 'Clear weather forecasted for next 5 days. Optimal for concrete pouring.',
        impact: 'high' as const,
        category: 'schedule'
      },
      {
        type: 'prediction' as const,
        title: 'Material Shortage Risk',
        description: 'Current consumption rate suggests rebar shortage by Thursday.',
        impact: 'high' as const,
        category: 'materials'
      },
      {
        type: 'success' as const,
        title: 'Safety Milestone Achieved',
        description: '100 days without incidents. Team morale is high.',
        impact: 'low' as const,
        category: 'safety'
      }
    ];

    const randomInsight = insightTypes[Math.floor(Math.random() * insightTypes.length)];
    
    const newInsight: Insight = {
      id: Date.now().toString(),
      ...randomInsight,
      timestamp: new Date().toISOString()
    };

    setInsights(prev => [newInsight, ...prev].slice(0, 5)); // Keep only 5 latest
  };

  const processMessage = async (message: string) => {
    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);

      // Speak response if voice enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse.content);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  const generateAIResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase();
    
    // Safety-related queries
    if (lowerInput.includes('safety') || lowerInput.includes('hazard') || lowerInput.includes('danger')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `Based on current site conditions, I've identified 3 potential safety concerns:

1. **Wet conditions** near the excavation area - recommend additional barriers
2. **Crane operation** proximity to power lines - maintain 20ft clearance
3. **Missing harnesses** detected in Zone C - immediate action required

I've created safety alerts for all supervisors. Would you like me to initiate an emergency safety briefing?`,
        timestamp: new Date().toISOString(),
        category: 'safety',
        actionable: true,
        actions: [
          { id: '1', label: 'Send Safety Alert', action: 'safety_alert' },
          { id: '2', label: 'Schedule Briefing', action: 'schedule_briefing' }
        ]
      };
    }

    // Schedule-related queries
    if (lowerInput.includes('schedule') || lowerInput.includes('deadline') || lowerInput.includes('delay')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `Analyzing project schedule... 

Current status:
- **On Track**: Foundation work (85% complete)
- **At Risk**: Steel assembly (2 days behind due to weather)
- **Critical Path**: Electrical rough-in must start by Monday

I recommend reallocating 3 crew members from Zone A to steel assembly to recover the delay. This maintains the critical path without overtime costs.`,
        timestamp: new Date().toISOString(),
        category: 'schedule',
        actionable: true,
        actions: [
          { id: '1', label: 'Reallocate Crew', action: 'crew_reallocation' },
          { id: '2', label: 'Update Schedule', action: 'update_schedule' }
        ]
      };
    }

    // Equipment-related queries
    if (lowerInput.includes('equipment') || lowerInput.includes('machine') || lowerInput.includes('maintenance')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `Equipment analysis complete:

**Operational**: 12 units (86%)
**Maintenance Due**: 2 units
- Excavator 03: Oil change required (operating hours: 498)
- Generator 02: Filter replacement needed

**Predictive Alert**: Crane 01 showing unusual vibration patterns. Recommend inspection within 48 hours to prevent failure.

All other equipment operating within normal parameters.`,
        timestamp: new Date().toISOString(),
        category: 'equipment',
        actionable: true,
        actions: [
          { id: '1', label: 'Schedule Maintenance', action: 'schedule_maintenance' },
          { id: '2', label: 'Order Parts', action: 'order_parts' }
        ]
      };
    }

    // Cost/Finance queries
    if (lowerInput.includes('cost') || lowerInput.includes('budget') || lowerInput.includes('expense')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `Financial analysis for current period:

**Budget Status**: 78% utilized ($2.34M of $3M)
**Burn Rate**: $142K/week (on target)

**Cost Optimization Opportunities**:
1. Bulk material ordering could save ~$18K
2. Crew optimization could reduce overtime by 15%
3. Equipment sharing with Site B could save $8K/month

Projected completion within budget if current efficiency maintained.`,
        timestamp: new Date().toISOString(),
        category: 'general'
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: `I understand you're asking about "${input}". Let me analyze the relevant data across all systems...

Based on current project data, I can help you with:
- Safety compliance and hazard detection
- Schedule optimization and resource allocation  
- Equipment health monitoring
- Cost analysis and savings opportunities
- Crew productivity insights
- Weather impact planning

Could you please be more specific about what aspect you'd like me to focus on?`,
      timestamp: new Date().toISOString(),
      category: 'general'
    };
  };

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      processMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    processMessage(prompt);
  };

  const handleAction = (action: AIAction) => {
    switch (action.action) {
      case 'safety_alert':
        toast.error('🚨 Safety alert sent to all supervisors');
        break;
      case 'schedule_briefing':
        toast.success('Safety briefing scheduled for 2:00 PM');
        break;
      case 'crew_reallocation':
        toast.success('Crew reallocation request submitted');
        break;
      case 'schedule_maintenance':
        toast.success('Maintenance scheduled for tomorrow');
        break;
      default:
        toast.success(`Action initiated: ${action.label}`);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'suggestion': return Sparkles;
      case 'prediction': return TrendingUp;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-400 bg-amber-400/20';
      case 'suggestion': return 'text-blue-400 bg-blue-400/20';
      case 'prediction': return 'text-purple-400 bg-purple-400/20';
      case 'success': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <>
      {/* AI Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[34px] right-[34px] w-[68px] h-[68px] bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-full shadow-lg flex items-center justify-center group transition-all z-50"
          >
            <Brain className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-50 bg-slate-900 border border-slate-700 rounded-[21px] shadow-2xl ${
              isMinimized 
                ? 'bottom-[34px] right-[34px] w-[350px] h-[60px]'
                : 'bottom-[34px] right-[34px] w-[450px] h-[600px] max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-[21px] border-b border-slate-700">
              <div className="flex items-center gap-[13px]">
                <div className="w-[34px] h-[34px] bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">FieldForge AI</h3>
                  <p className="text-xs text-slate-400">
                    {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Always learning'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="p-[8px] text-slate-400 hover:text-white transition-all"
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-[8px] text-slate-400 hover:text-white transition-all"
                >
                  {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-[8px] text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Insights Bar */}
                {insights.length > 0 && (
                  <div className="p-[13px] border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-slate-300">Real-time Insights</span>
                    </div>
                    <div className="space-y-[5px]">
                      {insights.slice(0, 2).map(insight => {
                        const Icon = getInsightIcon(insight.type);
                        const colorClass = getInsightColor(insight.type);
                        return (
                          <div
                            key={insight.id}
                            className={`text-xs p-[8px] rounded-[8px] flex items-start gap-[8px] ${colorClass}`}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0 mt-[2px]" />
                            <div className="flex-1">
                              <p className="font-medium">{insight.title}</p>
                              <p className="opacity-80 text-[10px] mt-[2px]">{insight.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-[21px] space-y-[13px]" style={{ height: 'calc(100% - 180px)' }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-start gap-[8px]">
                          {message.type === 'ai' && (
                            <div className="w-[28px] h-[28px] bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div className={`p-[13px] rounded-[13px] ${
                            message.type === 'user' 
                              ? 'bg-amber-500 text-slate-900' 
                              : 'bg-slate-800 text-white'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            
                            {message.actions && message.actions.length > 0 && (
                              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                                {message.actions.map(action => (
                                  <button
                                    key={action.id}
                                    onClick={() => handleAction(action)}
                                    className="px-[13px] py-[5px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-[8px] text-xs font-medium transition-all"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs opacity-70 mt-[5px]">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          
                          {message.type === 'user' && (
                            <div className="w-[28px] h-[28px] bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[28px] h-[28px] bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-800 rounded-[13px] p-[13px]">
                        <div className="flex gap-[5px]">
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="px-[21px] py-[13px] border-t border-slate-700">
                  <div className="flex gap-[8px] overflow-x-auto pb-[8px]">
                    {quickPrompts.map((prompt) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={prompt.id}
                          onClick={() => handleQuickPrompt(prompt.prompt)}
                          className="flex items-center gap-[5px] px-[13px] py-[5px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[8px] text-xs whitespace-nowrap transition-all"
                        >
                          <Icon className="w-3 h-3" />
                          {prompt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-[21px] border-t border-slate-700">
                  <div className="flex items-end gap-[13px]">
                    <button
                      onClick={toggleVoice}
                      className={`p-[13px] rounded-[13px] transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex-1">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Ask me anything about your project..."
                        className="w-full px-[13px] py-[8px] bg-slate-800 text-white rounded-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
                        rows={1}
                      />
                    </div>
                    
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isProcessing}
                      className="p-[13px] bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-white rounded-[13px] transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
