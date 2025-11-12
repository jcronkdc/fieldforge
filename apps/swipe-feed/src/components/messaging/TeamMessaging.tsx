import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Users,
  Hash,
  Building2,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Conversation {
  id: string;
  name: string;
  type: 'project' | 'team' | 'safety' | 'direct';
  participants: number;
  lastMessage?: string;
  lastActivity: Date;
  unreadCount: number;
  priority: 'normal' | 'high' | 'emergency';
  metadata: {
    projectName?: string;
    voltageClass?: string;
    urgency?: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'safety_alert' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    safetyLevel?: 'info' | 'warning' | 'emergency';
    equipmentId?: string;
  };
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Substation Alpha-7 Project',
    type: 'project',
    participants: 8,
    lastMessage: 'Safety briefing at 7 AM tomorrow',
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    unreadCount: 2,
    priority: 'high',
    metadata: { projectName: 'Alpha-7 138kV Substation', voltageClass: '138kV' }
  },
  {
    id: '2', 
    name: 'IBEW Local 160 Crew',
    type: 'team',
    participants: 12,
    lastMessage: 'Crew assignments for next week posted',
    lastActivity: new Date(Date.now() - 1000 * 60 * 45),
    unreadCount: 0,
    priority: 'normal',
    metadata: { }
  },
  {
    id: '3',
    name: 'High Voltage Safety',
    type: 'safety', 
    participants: 25,
    lastMessage: 'Updated arc flash boundaries - Review required',
    lastActivity: new Date(Date.now() - 1000 * 60 * 120),
    unreadCount: 1,
    priority: 'emergency',
    metadata: { urgency: 'All crew members must acknowledge' }
  }
];

export const TeamMessaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId: string) => {
    // Mock messages for demo - in production this would load from Supabase
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'user1',
        senderName: 'Mike Rodriguez',
        content: 'Morning safety briefing complete. All crew members present and JSA reviewed.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text'
      },
      {
        id: '2',
        senderId: 'user2',
        senderName: 'Sarah Chen',
        content: '⚠️ SAFETY ALERT: New arc flash study results available. All workers must review before accessing 138kV equipment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: 'safety_alert',
        metadata: { safetyLevel: 'warning' }
      },
      {
        id: '3',
        senderId: 'user3', 
        senderName: 'Tom Wilson',
        content: 'Transformer delivery confirmed for 0800 tomorrow. Crane crew on standby.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'text'
      }
    ];
    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current_user',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // In production, send to Supabase and real-time channels
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'project': return Building2;
      case 'safety': return Shield;
      case 'team': return Users;
      default: return Hash;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      default: return 'border-slate-700 bg-slate-800/30';
    }
  };

  const filteredConversations = mockConversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = mockConversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-900">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-slate-700 bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Team Messages</h2>
              <p className="text-xs text-slate-400">Electrical Construction Workspace</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const Icon = getConversationIcon(conversation.type);
            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 text-left hover:bg-slate-800/50 transition-colors border-l-4 ${
                  selectedConversation === conversation.id 
                    ? 'bg-slate-800/50 border-blue-500' 
                    : `border-transparent ${getPriorityColor(conversation.priority)}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    conversation.priority === 'emergency' ? 'bg-red-500/20' :
                    conversation.priority === 'high' ? 'bg-orange-500/20' :
                    'bg-slate-700'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      conversation.priority === 'emergency' ? 'text-red-400' :
                      conversation.priority === 'high' ? 'text-orange-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {conversation.name}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-300 truncate mb-1">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {conversation.lastActivity.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs text-slate-400">
                        {conversation.participants} members
                      </span>
                    </div>
                    
                    {conversation.metadata.voltageClass && (
                      <span className="inline-block mt-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono">
                        {conversation.metadata.voltageClass}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentConversation.priority === 'emergency' ? 'bg-red-500/20 border border-red-500/30' :
                    currentConversation.priority === 'high' ? 'bg-orange-500/20 border border-orange-500/30' :
                    'bg-slate-700 border border-slate-600'
                  }`}>
                    {React.createElement(getConversationIcon(currentConversation.type), { 
                      className: `w-5 h-5 ${
                        currentConversation.priority === 'emergency' ? 'text-red-400' :
                        currentConversation.priority === 'high' ? 'text-orange-400' :
                        'text-blue-400'
                      }` 
                    })}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{currentConversation.name}</h3>
                    <p className="text-sm text-slate-300">
                      {currentConversation.participants} members • {currentConversation.type === 'project' ? 'Project Chat' : 'Team Chat'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Video className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${message.senderId === 'current_user' ? 'order-2' : ''}`}>
                    {message.senderId !== 'current_user' && (
                      <div className="text-xs text-slate-400 mb-1">{message.senderName}</div>
                    )}
                    
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.senderId === 'current_user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.type === 'safety_alert'
                        ? 'bg-orange-500/20 border border-orange-500/40 text-orange-100'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}>
                      {message.type === 'safety_alert' && (
                        <div className="flex items-center gap-2 mb-2 text-orange-400">
                          <Shield className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase">Safety Alert</span>
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.metadata?.voltageClass && (
                        <div className="mt-2 inline-block text-xs bg-black/20 text-white px-2 py-1 rounded font-mono">
                          {message.metadata.voltageClass}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-slate-400" />
                </button>
                
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Conversation</h3>
              <p className="text-slate-400">Choose a project or team chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Conversation Details */}
      {currentConversation && (
        <div className="w-72 border-l border-slate-700 bg-slate-900 p-4">
          <h3 className="font-bold text-white mb-4">Conversation Details</h3>
          
          {/* Project Info */}
          {currentConversation.metadata.projectName && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Project Information</h4>
              <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Project:</span>
                  <span className="text-xs text-slate-200">{currentConversation.metadata.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Voltage:</span>
                  <span className="text-xs text-yellow-400 font-mono">{currentConversation.metadata.voltageClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Type:</span>
                  <span className="text-xs text-slate-200">{currentConversation.type}</span>
                </div>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Team Members ({currentConversation.participants})</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">MR</span>
                </div>
                <div>
                  <p className="text-sm text-white">Mike Rodriguez</p>
                  <p className="text-xs text-slate-400">Field Supervisor</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">SC</span>
                </div>
                <div>
                  <p className="text-sm text-white">Sarah Chen</p>
                  <p className="text-xs text-slate-400">Safety Officer</p>
                </div>
              </div>
              <button className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors text-sm">
                + Add team member
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white">Send Safety Alert</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">Schedule Meeting</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
                <Paperclip className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Share Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
