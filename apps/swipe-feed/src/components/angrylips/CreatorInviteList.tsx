/**
 * Creator Invite List for Angry Lips
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';

interface Creator {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  lastActive?: string;
}

interface CreatorInviteListProps {
  sessionId: string;
  currentPlayers: string[];
  maxPlayers: number;
  onInvite: (creatorId: string) => void;
  isGameStarted: boolean;
}

export const CreatorInviteList: React.FC<CreatorInviteListProps> = ({
  sessionId,
  currentPlayers,
  maxPlayers,
  onInvite,
  isGameStarted
}) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [invitedCreators, setInvitedCreators] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load real creators from backend
    const realCreators: Creator[] = [];
    
    // Filter out already joined players
    const availableCreators = realCreators.filter(
      creator => !currentPlayers.includes(creator.username)
    );
    
    setCreators(availableCreators);
  }, [currentPlayers]);

  const handleInvite = (creator: Creator) => {
    if (isGameStarted) {
      alert('Game has already started. No new players can join.');
      return;
    }
    
    if (currentPlayers.length >= maxPlayers) {
      alert(`Maximum ${maxPlayers} players allowed.`);
      return;
    }

    // Add to invited set
    setInvitedCreators(prev => new Set(prev).add(creator.id));
    
    // Simulate sending invitation
    onInvite(creator.id);
    
    // Show notification
    setTimeout(() => {
      alert(`Invitation sent to ${creator.username}!`);
    }, 100);
  };

  const filteredCreators = creators.filter(creator =>
    creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCreators = filteredCreators.filter(c => c.status === 'online');
  const busyCreators = filteredCreators.filter(c => c.status === 'busy');
  const offlineCreators = filteredCreators.filter(c => c.status === 'offline');

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-white">
          Invite Creators ({currentPlayers.length}/{maxPlayers})
        </h3>
        {isGameStarted && (
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400">
            Game Locked
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isGameStarted}
          className="w-full px-10 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
        />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* Creator List */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {/* Online Creators */}
        {onlineCreators.length > 0 && (
          <>
            <div className="text-xs text-green-400/60 px-2 py-1">Online</div>
            {onlineCreators.map(creator => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                      {creator.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black"/>
                  </div>
                  <span className="text-sm text-white">{creator.username}</span>
                </div>
                
                <button
                  onClick={() => handleInvite(creator)}
                  disabled={isGameStarted || invitedCreators.has(creator.id)}
                  className="px-3 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invitedCreators.has(creator.id) ? 'Invited' : 'Invite'}
                </button>
              </div>
            ))}
          </>
        )}

        {/* Busy Creators */}
        {busyCreators.length > 0 && (
          <>
            <div className="text-xs text-yellow-400/60 px-2 py-1 mt-2">Busy</div>
            {busyCreators.map(creator => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all opacity-75"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                      {creator.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-black"/>
                  </div>
                  <span className="text-sm text-white/80">{creator.username}</span>
                </div>
                
                <button
                  onClick={() => handleInvite(creator)}
                  disabled={isGameStarted || invitedCreators.has(creator.id)}
                  className="px-3 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invitedCreators.has(creator.id) ? 'Invited' : 'Invite'}
                </button>
              </div>
            ))}
          </>
        )}

        {/* Offline Creators */}
        {offlineCreators.length > 0 && (
          <>
            <div className="text-xs text-white/40 px-2 py-1 mt-2">Offline</div>
            {offlineCreators.map(creator => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all opacity-50"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-xs font-bold">
                      {creator.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-black"/>
                  </div>
                  <div>
                    <span className="text-sm text-white/60 block">{creator.username}</span>
                    <span className="text-xs text-white/30">{creator.lastActive}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleInvite(creator)}
                  disabled={isGameStarted || invitedCreators.has(creator.id)}
                  className="px-3 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invitedCreators.has(creator.id) ? 'Invited' : 'Invite'}
                </button>
              </div>
            ))}
          </>
        )}

        {filteredCreators.length === 0 && (
          <div className="text-center py-4 text-white/40 text-sm">
            No creators found
          </div>
        )}
      </div>

      {isGameStarted && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400">
            🔒 Game has started. No new players can join until the next session.
          </p>
        </div>
      )}
    </div>
  );
};
