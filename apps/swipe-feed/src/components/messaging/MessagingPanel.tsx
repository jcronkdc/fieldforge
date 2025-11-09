import { useState, useEffect, useCallback } from "react";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { Button } from "../ui/Button";
import { useMessaging } from "../../hooks/useMessaging";
import clsx from "clsx";

interface MessagingPanelProps {
  currentUserId: string;
  onClose?: () => void;
  initialConversationId?: string;
  projectType?: string;
  projectId?: string;
}

export function MessagingPanel({ 
  currentUserId, 
  onClose,
  initialConversationId,
  projectType,
  projectId
}: MessagingPanelProps) {
  const {
    conversations,
    messages,
    selectedConversation,
    typingUsers,
    loading,
    hasMoreMessages,
    selectConversation,
    sendMessage,
    loadMoreMessages,
    addReaction,
    removeReaction,
    updateTyping,
    markAsRead,
    createGroupConversation
  } = useMessaging(currentUserId);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Select initial conversation if provided
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === initialConversationId);
      if (conv) {
        selectConversation(conv);
      }
    }
  }, [initialConversationId, conversations, selectConversation]);

  // Auto-create project conversation if needed
  useEffect(() => {
    if (projectType && projectId && !initialConversationId) {
      // Check if project conversation already exists
      const existingConv = conversations.find(
        c => c.projectType === projectType && c.projectId === projectId
      );
      
      if (existingConv) {
        selectConversation(existingConv);
      }
    }
  }, [projectType, projectId, conversations, selectConversation, initialConversationId]);

  const handleReaction = useCallback((messageId: string, reaction: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    const existingReaction = message.reactions?.find(r => r.reaction === reaction && r.hasReacted);
    
    if (existingReaction) {
      removeReaction(messageId, reaction);
    } else {
      addReaction(messageId, reaction);
    }
  }, [messages, addReaction, removeReaction]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
      
      <div className="flex w-full max-w-7xl mx-auto my-8 bg-slate-900/95 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        {/* Conversation list */}
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          currentUserId={currentUserId}
          onSelect={selectConversation}
          onCreateGroup={() => setShowGroupModal(true)}
        />
        
        {/* Chat area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aurora/20 to-aurora-200/20 flex items-center justify-center text-sm font-semibold text-white">
                  {selectedConversation.avatarUrl ? (
                    <img 
                      src={selectedConversation.avatarUrl} 
                      alt={selectedConversation.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : selectedConversation.type === 'direct' ? (
                    selectedConversation.participants
                      .find(p => p.userId !== currentUserId)
                      ?.username?.charAt(0).toUpperCase() || 'U'
                  ) : (
                    (selectedConversation.name || 'G').charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Name and status */}
                <div>
                  <h3 className="font-medium text-white">
                    {selectedConversation.type === 'direct' 
                      ? selectedConversation.participants
                          .find(p => p.userId !== currentUserId)
                          ?.displayName || 
                        selectedConversation.participants
                          .find(p => p.userId !== currentUserId)
                          ?.username || 'Unknown'
                      : selectedConversation.name || 'Unnamed Group'}
                  </h3>
                  
                  {selectedConversation.type !== 'direct' && (
                    <p className="text-xs text-slate-500">
                      {selectedConversation.participants.length} members
                      {selectedConversation.projectType && ` • ${selectedConversation.projectType} project`}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {selectedConversation.type !== 'direct' && (
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    ℹ️
                  </button>
                )}
              </div>
            </div>
            
            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              onLoadMore={loadMoreMessages}
              hasMore={hasMoreMessages}
              loading={loading}
              onReaction={handleReaction}
            />
            
            {/* Composer */}
            <MessageComposer
              onSend={sendMessage}
              onTyping={updateTyping}
              typingUsers={typingUsers}
              disabled={!selectedConversation}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <span className="text-6xl mb-4 block">💬</span>
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">Choose a chat from the list or start a new one</p>
            </div>
          </div>
        )}
        
        {/* Info sidebar */}
        {showInfo && selectedConversation && selectedConversation.type !== 'direct' && (
          <div className="w-64 border-l border-slate-800 bg-black/40 p-4">
            <h4 className="font-medium text-white mb-4">Group Info</h4>
            
            {/* Members */}
            <div className="space-y-2">
              <h5 className="text-xs text-slate-500 uppercase tracking-wide">Members</h5>
              {selectedConversation.participants.map(participant => (
                <div key={participant.userId} className="flex items-center gap-2 py-1">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                    {(participant.displayName || participant.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">
                    {participant.displayName || participant.username}
                  </span>
                  {participant.role === 'admin' && (
                    <span className="text-[10px] text-aurora">Admin</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Project info */}
            {selectedConversation.projectType && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h5 className="text-xs text-slate-500 uppercase tracking-wide mb-2">Project</h5>
                <p className="text-sm text-slate-300">
                  {selectedConversation.projectType === 'angry_lips' ? '🔥 Angry Lips Session' : '📖 Story Project'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create group modal */}
      {showGroupModal && (
        <CreateGroupModal
          currentUserId={currentUserId}
          onClose={() => setShowGroupModal(false)}
          onCreate={(name, description, participantIds) => {
            createGroupConversation(name, description, participantIds);
            setShowGroupModal(false);
          }}
        />
      )}
    </div>
  );
}

// Simple create group modal
function CreateGroupModal({ 
  currentUserId, 
  onClose, 
  onCreate 
}: { 
  currentUserId: string;
  onClose: () => void;
  onCreate: (name: string, description: string, participantIds: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), []);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Create Group Chat</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-aurora/50"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-aurora/50 resize-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreate} 
            disabled={!name.trim()}
            className="flex-1"
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
}
