import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Paperclip, Search, Users, Hash, AtSign, Image, FileText, AlertCircle, CheckCheck, Clock, Plus, Settings, Phone, Video, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
  }>;
  created_at: string;
  edited_at?: string;
  is_read: boolean;
  mentions?: string[];
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description?: string;
  members: number;
  unread_count: number;
  last_message?: {
    content: string;
    created_at: string;
    user_name: string;
  };
  is_emergency?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  last_seen?: string;
}

export const TeamMessaging: React.FC = () => {
  const { session } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New channel form
  const [newChannel, setNewChannel] = useState<{
    name: string;
    type: 'public' | 'private';
    description: string;
    is_emergency: boolean;
  }>({
    name: '',
    type: 'public',
    description: '',
    is_emergency: false
  });

  // Predefined channels for construction
  const defaultChannels: Channel[] = [
    { id: '1', name: 'general', type: 'public', members: 15, unread_count: 0, 
      last_message: { content: 'Morning safety briefing at 7 AM', created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'John Smith' } },
    { id: '2', name: 'safety-alerts', type: 'public', members: 25, unread_count: 2, is_emergency: true,
      last_message: { content: 'High wind warning - secure all equipment', created_at: new Date(Date.now() - 1800000).toISOString(), user_name: 'Safety Team' } },
    { id: '3', name: 'electrical-crew', type: 'private', members: 8, unread_count: 0,
      last_message: { content: 'Transformer installation complete on Pad 3', created_at: new Date(Date.now() - 7200000).toISOString(), user_name: 'Mike Johnson' } },
    { id: '4', name: 'civil-crew', type: 'private', members: 6, unread_count: 1,
      last_message: { content: 'Concrete pour scheduled for tomorrow', created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Sarah Chen' } },
    { id: '5', name: 'project-managers', type: 'private', members: 4, unread_count: 0,
      last_message: { content: 'Weekly progress meeting at 2 PM', created_at: new Date(Date.now() - 14400000).toISOString(), user_name: 'David Lee' } }
  ];

  // Mock team members
  const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'John Smith', role: 'Site Supervisor', status: 'online' },
    { id: '2', name: 'Mike Johnson', role: 'Electrical Lead', status: 'online' },
    { id: '3', name: 'Sarah Chen', role: 'Civil Engineer', status: 'busy' },
    { id: '4', name: 'David Lee', role: 'Project Manager', status: 'online' },
    { id: '5', name: 'Emily Wilson', role: 'Safety Officer', status: 'online' },
    { id: '6', name: 'Robert Brown', role: 'QC Inspector', status: 'offline', last_seen: new Date(Date.now() - 3600000).toISOString() }
  ];

  useEffect(() => {
    // Initialize with default data
    setChannels(defaultChannels);
    setTeamMembers(mockTeamMembers);
    setSelectedChannel(defaultChannels[0]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (channelId: string) => {
    // Mock messages for selected channel
    const mockMessages: Message[] = [
      {
        id: '1',
        channel_id: channelId,
        user_id: '1',
        user_name: 'John Smith',
        content: 'Good morning team! Today\'s safety briefing will cover working at heights.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_read: true
      },
      {
        id: '2',
        channel_id: channelId,
        user_id: '2',
        user_name: 'Mike Johnson',
        content: 'Reminder: We have a scheduled power outage from 10 AM to 12 PM in Section B.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
        mentions: ['@all']
      },
      {
        id: '3',
        channel_id: channelId,
        user_id: '3',
        user_name: 'Sarah Chen',
        content: 'Concrete trucks are arriving at 2 PM. Need 4 people to assist.',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true
      },
      {
        id: '4',
        channel_id: channelId,
        user_id: '5',
        user_name: 'Emily Wilson',
        content: 'Safety reminder: High wind advisory in effect. All crane operations suspended.',
        created_at: new Date(Date.now() - 600000).toISOString(),
        is_read: false,
        attachments: [{
          type: 'file',
          url: '/weather-alert.pdf',
          name: 'Weather Advisory.pdf',
          size: 245000
        }]
      }
    ];

    setMessages(mockMessages);

    // Mark channel as read
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, unread_count: 0 } : ch
    ));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedChannel) return;

    setSending(true);
    
    try {
      // In production, this would send to a real messaging API
      const newMessage: Message = {
        id: Date.now().toString(),
        channel_id: selectedChannel.id,
        user_id: session?.user?.id || 'current-user',
        user_name: session?.user?.user_metadata?.full_name || 'You',
        content: messageInput,
        created_at: new Date().toISOString(),
        is_read: false,
        mentions: extractMentions(messageInput)
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Update channel's last message
      setChannels(prev => prev.map(ch => 
        ch.id === selectedChannel.id 
          ? { 
              ...ch, 
              last_message: {
                content: messageInput,
                created_at: newMessage.created_at,
                user_name: newMessage.user_name
              }
            } 
          : ch
      ));

      setMessageInput('');
      
      // Check for emergency keywords
      if (messageInput.toLowerCase().includes('emergency') || 
          messageInput.toLowerCase().includes('urgent') ||
          messageInput.toLowerCase().includes('accident')) {
        toast.error('Emergency keyword detected! Safety team has been notified.', { duration: 5000 });
      } else {
        toast.success('Message sent');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChannel.name) return;

    try {
      const channel: Channel = {
        id: Date.now().toString(),
        name: newChannel.name.toLowerCase().replace(/\s+/g, '-'),
        type: newChannel.type,
        description: newChannel.description,
        members: 1,
        unread_count: 0,
        is_emergency: newChannel.is_emergency
      };

      setChannels(prev => [...prev, channel]);
      setSelectedChannel(channel);
      setShowCreateChannel(false);
      setNewChannel({ name: '', type: 'public', description: '', is_emergency: false });
      
      toast.success('Channel created successfully');
    } catch (error) {
      console.error('Failed to create channel:', error);
      toast.error('Failed to create channel');
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map(m => m.substring(1));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.is_emergency) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (channel.type === 'public') return <Hash className="w-4 h-4 text-gray-500" />;
    if (channel.type === 'private') return <Users className="w-4 h-4 text-gray-500" />;
    return <AtSign className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Channels */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Team Chat</h2>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-2 hover:bg-slate-800 rounded"
              title="Create Channel"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Channels</h3>
            {channels
              .filter(ch => ch.name.includes(searchQuery.toLowerCase()))
              .map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    selectedChannel?.id === channel.id ? 'bg-blue-600' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getChannelIcon(channel)}
                      <span className="text-sm truncate">{channel.name}</span>
                    </div>
                    {channel.unread_count > 0 && (
                      <span className="bg-blue-500 text-black text-xs px-2 py-0.5 rounded-full">
                        {channel.unread_count}
                      </span>
                    )}
                  </div>
                  {channel.last_message && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {channel.last_message.user_name}: {channel.last_message.content}
                    </p>
                  )}
                </button>
              ))}
          </div>

          <div className="p-2 mt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Direct Messages</h3>
            {teamMembers.slice(0, 5).map(member => (
              <button
                key={member.id}
                className="w-full text-left px-3 py-2 rounded-lg mb-1 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedChannel ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getChannelIcon(selectedChannel)}
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChannel.name}</h2>
                  {selectedChannel.description && (
                    <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast('Voice calls coming soon!')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Start Voice Call"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => toast('Video calls coming soon!')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Start Video Call"
                >
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setShowChannelInfo(!showChannelInfo)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Channel Info"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => {
              const showAvatar = idx === 0 || messages[idx - 1].user_id !== message.user_id;
              
              return (
                <div key={message.id} className={`flex gap-3 ${!showAvatar ? 'pl-11' : ''}`}>
                  {showAvatar && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold">
                        {message.user_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{message.user_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="text-gray-700">
                      {message.content}
                      {message.mentions && message.mentions.length > 0 && (
                        <span className="text-blue-600 ml-1">
                          {message.mentions.map(m => `@${m}`).join(' ')}
                        </span>
                      )}
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg max-w-sm">
                            {attachment.type === 'image' ? (
                              <Image className="w-5 h-5 text-blue-500" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {!message.is_read && (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t bg-white p-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toast('File attachments coming soon!')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${selectedChannel.name}`}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a channel to start messaging</p>
          </div>
        </div>
      )}

      {/* Channel Info Sidebar */}
      {showChannelInfo && selectedChannel && (
        <div className="w-80 bg-white border-l p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Channel Details</h3>
            <button
              onClick={() => setShowChannelInfo(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus className="w-4 h-4 text-gray-600 rotate-45" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Channel Name</p>
              <p className="font-medium">{selectedChannel.name}</p>
            </div>

            {selectedChannel.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-sm">{selectedChannel.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="capitalize">{selectedChannel.type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3">Members ({selectedChannel.members})</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-2">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedChannel.is_emergency && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">Emergency Channel</p>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  All messages trigger immediate notifications
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Channel</h2>
            
            <form onSubmit={createChannel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name *
                </label>
                <input
                  type="text"
                  required
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., concrete-crew"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newChannel.description}
                  onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  placeholder="What's this channel about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Type
                </label>
                <select
                  value={newChannel.type}
                  onChange={(e) => setNewChannel({...newChannel, type: e.target.value as 'public' | 'private'})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="public">Public - Anyone can join</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newChannel.is_emergency}
                  onChange={(e) => setNewChannel({...newChannel, is_emergency: e.target.checked})}
                  className="rounded text-red-600"
                />
                <span className="text-sm text-gray-700">Emergency channel (all messages trigger alerts)</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
