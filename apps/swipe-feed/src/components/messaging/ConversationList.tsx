import { useState } from "react";
import clsx from "clsx";
import { formatDistanceToNow } from "../../lib/utils";

interface Participant {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
}

interface LastMessage {
  content: string;
  createdAt: string;
  senderUsername?: string;
  messageType: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'project';
  name?: string;
  description?: string;
  avatarUrl?: string;
  projectType?: string;
  lastMessageAt?: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  currentUserId: string;
  onSelect: (conversation: Conversation) => void;
  onCreateGroup?: () => void;
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  currentUserId,
  onClick 
}: { 
  conversation: Conversation; 
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  // Get display info based on conversation type
  const getDisplayInfo = () => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
      return {
        name: otherParticipant?.displayName || otherParticipant?.username || 'Unknown',
        avatar: otherParticipant?.avatarUrl,
        initial: (otherParticipant?.displayName || otherParticipant?.username || 'U').charAt(0).toUpperCase()
      };
    }
    
    return {
      name: conversation.name || 'Unnamed Group',
      avatar: conversation.avatarUrl,
      initial: (conversation.name || 'G').charAt(0).toUpperCase()
    };
  };

  const { name, avatar, initial } = getDisplayInfo();
  
  // Format last message preview
  const getMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { content, messageType, senderUsername } = conversation.lastMessage;
    
    if (messageType === 'system') return content;
    if (messageType === 'image') return '📷 Image';
    if (messageType === 'file') return '📎 File';
    
    const prefix = conversation.type !== 'direct' && senderUsername 
      ? `${senderUsername}: ` 
      : '';
    
    return prefix + content;
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full p-3 flex gap-3 hover:bg-slate-800/40 transition-colors text-left",
        isSelected && "bg-slate-800/60 border-l-2 border-aurora"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aurora/20 to-aurora-200/20 flex items-center justify-center text-sm font-semibold text-white">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        
        {/* Project type badge */}
        {conversation.projectType && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">
            {conversation.projectType === 'angry_lips' ? '🔥' : '📖'}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm text-white truncate">
            {name}
          </h3>
          {conversation.lastMessage && (
            <span className="text-[10px] text-slate-500 shrink-0">
              {formatDistanceToNow(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        
        <p className="text-xs text-slate-400 truncate">
          {getMessagePreview()}
        </p>
      </div>
      
      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <div className="shrink-0 self-center">
          <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-black bg-aurora rounded-full">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </span>
        </div>
      )}
    </button>
  );
}

export function ConversationList({ 
  conversations, 
  selectedId, 
  currentUserId,
  onSelect,
  onCreateGroup
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'direct' | 'group' | 'project'>('all');
  
  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Type filter
    if (filter !== 'all' && conv.type !== filter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = conv.type === 'direct' 
        ? conv.participants.find(p => p.userId !== currentUserId)?.username || ''
        : conv.name || '';
      
      return name.toLowerCase().includes(query);
    }
    
    return true;
  });

  return (
    <div className="w-80 border-r border-slate-800 bg-black/40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <button
            onClick={onCreateGroup}
            className="w-8 h-8 rounded-lg bg-aurora/20 hover:bg-aurora/30 flex items-center justify-center text-aurora transition-colors"
            title="Create group"
          >
            +
          </button>
        </div>
        
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aurora/50"
        />
        
        {/* Filters */}
        <div className="flex gap-1 mt-2">
          {(['all', 'direct', 'group', 'project'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs capitalize transition-colors",
                filter === type 
                  ? "bg-aurora/20 text-aurora border border-aurora/30" 
                  : "bg-slate-800/40 text-slate-400 hover:bg-slate-800/60"
              )}
            >
              {type === 'project' ? '📂' : ''} {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedId}
              currentUserId={currentUserId}
              onClick={() => onSelect(conversation)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm">No conversations found</p>
            {searchQuery && (
              <p className="text-xs mt-1">Try a different search</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
