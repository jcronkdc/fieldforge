/**
 * Collaboration Panel - Real-time collaboration features for StoryForge
 */

import React, { useState, useEffect, useRef } from 'react';
import type { StoryBranch } from '../../lib/storyforge/types';

interface CollaborationPanelProps {
  branch: StoryBranch | null;
  userId: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'suggestion' | 'vote' | 'system';
}

interface ActiveCollaborator {
  id: string;
  name: string;
  role: 'author' | 'editor' | 'reviewer' | 'viewer';
  isOnline: boolean;
  lastActive: number;
  cursorPosition?: number;
  selectedText?: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  branch,
  userId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'collaborators' | 'edits' | 'voting'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [collaborators, setCollaborators] = useState<ActiveCollaborator[]>([]);
  const [isTyping, setIsTyping] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with mock collaborators
    setCollaborators([
      {
        id: userId,
        name: 'You',
        role: 'author',
        isOnline: true,
        lastActive: Date.now()
      }
    ]);

    // Add system message
    setMessages([
      {
        id: '1',
        sender: 'System',
        content: 'Collaboration session started',
        timestamp: Date.now(),
        type: 'system'
      }
    ]);
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const inviteCollaborator = () => {
    const email = prompt('Enter collaborator email:');
    if (email) {
      // In production, this would send an actual invitation
      setMessages([...messages, {
        id: Date.now().toString(),
        sender: 'System',
        content: `Invitation sent to ${email}`,
        timestamp: Date.now(),
        type: 'system'
      }]);
    }
  };

  const createSuggestion = () => {
    const suggestion = prompt('Enter your suggestion:');
    if (suggestion) {
      setMessages([...messages, {
        id: Date.now().toString(),
        sender: 'You',
        content: suggestion,
        timestamp: Date.now(),
        type: 'suggestion'
      }]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Collaboration</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {(['chat', 'collaborators', 'edits', 'voting'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`${
                  msg.type === 'system' ? 'text-center' : ''
                }`}>
                  {msg.type === 'system' ? (
                    <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded">
                      {msg.content}
                    </span>
                  ) : msg.type === 'suggestion' ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">💡</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{msg.sender}</span>
                            <span className="text-xs text-white/40">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-white/80">{msg.content}</p>
                          <div className="flex gap-2 mt-2">
                            <button className="text-xs px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded transition-all">
                              Accept
                            </button>
                            <button className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded transition-all">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex gap-2 ${
                      msg.sender === 'You' ? 'justify-end' : ''
                    }`}>
                      <div className={`max-w-[80%] ${
                        msg.sender === 'You'
                          ? 'bg-purple-500/20 border-purple-500/30'
                          : 'bg-white/5 border-white/10'
                      } border rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{msg.sender}</span>
                          <span className="text-xs text-white/40">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/80">{msg.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicators */}
              {isTyping.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce"/>
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}/>
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}/>
                  </div>
                  <span>{Array.from(isTyping).join(', ')} typing...</span>
                </div>
              )}
              
              <div ref={chatEndRef}/>
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={createSuggestion}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  title="Create suggestion"
                >
                  💡
                </button>
                <button
                  onClick={sendMessage}
                  className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'collaborators' && (
          <div className="p-4 space-y-3">
            <button
              onClick={inviteCollaborator}
              className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all"
            >
              + Invite Collaborator
            </button>

            <div className="space-y-2">
              {collaborators.map(collab => (
                <div key={collab.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        collab.isOnline ? 'bg-green-400' : 'bg-white/20'
                      }`}/>
                      <span className="font-medium">{collab.name}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                        {collab.role}
                      </span>
                    </div>
                    {collab.id !== userId && (
                      <button className="p-1 hover:bg-white/10 rounded transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  {collab.cursorPosition !== undefined && (
                    <div className="text-xs text-white/40">
                      Editing at position {collab.cursorPosition}
                    </div>
                  )}
                  {!collab.isOnline && (
                    <div className="text-xs text-white/40">
                      Last seen {new Date(collab.lastActive).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Permissions */}
            <div className="pt-3 border-t border-white/10">
              <h4 className="text-sm text-white/60 mb-2">Permissions</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked readOnly className="rounded"/>
                  <span>Allow edits</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked readOnly className="rounded"/>
                  <span>Allow branching</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded"/>
                  <span>Require approval for edits</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edits' && (
          <div className="p-4 space-y-3">
            <div className="text-center py-8 text-white/40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <p className="text-sm">No recent edits</p>
              <p className="text-xs mt-1">Edits will appear here as collaborators make changes</p>
            </div>
          </div>
        )}

        {activeTab === 'voting' && (
          <div className="p-4 space-y-3">
            <button className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm transition-all">
              Create New Vote
            </button>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <h4 className="font-medium mb-2">Should we change the ending?</h4>
              <p className="text-sm text-white/60 mb-3">
                Proposal to make the ending more optimistic
              </p>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Yes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 w-3/4"/>
                    </div>
                    <span className="text-sm text-white/60">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">No</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-1/4"/>
                    </div>
                    <span className="text-sm text-white/60">25%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-sm transition-all">
                  Vote Yes
                </button>
                <button className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-sm transition-all">
                  Vote No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {branch && (
        <div className="border-t border-white/10 p-3 text-xs text-white/40">
          <div className="flex items-center justify-between">
            <span>{collaborators.filter(c => c.isOnline).length} online</span>
            <span>Branch: {branch.title.substring(0, 20)}...</span>
          </div>
        </div>
      )}
    </div>
  );
};
