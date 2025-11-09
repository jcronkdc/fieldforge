/**
 * Futuristic Dashboard - Premium aesthetic matching landing page
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../../lib/profile';
import type { TimelineNode } from '../../lib/types';
import type { StoryNotification } from '../../lib/prologueApi';
import type { CharacterSummary } from '../../lib/characterApi';
import type { AngryLipsSessionSummary } from '../../lib/angryLipsApi';
import type { BookwormConnection as CreatorConnection, ConnectionRequest, ConnectionStats } from '../../lib/social';
import type { MythacoinSummary } from '../../lib/mythacoin';
import type { StreamEvent } from '../../lib/stream';
import type { StoryHighlight } from '../../data/sampleStories';
import { NotificationBell } from '../notifications/NotificationBell';
import { GlobalSearch } from '../search/GlobalSearch';
import { SparksManager } from '../sparks/SparksManager';

interface FuturisticDashboardProps {
  profile: UserProfile;
  feed: TimelineNode[];
  notifications: StoryNotification[];
  characters: CharacterSummary[];
  sessions: AngryLipsSessionSummary[];
  creators: CreatorConnection[];
  incomingRequests: ConnectionRequest[];
  outgoingRequests: ConnectionRequest[];
  connectionStats: ConnectionStats | null;
  stories: StoryHighlight[];
  loading: boolean;
  worldId: string;
  onRefresh: () => void;
  onEnterFeed: () => void;
  onOpenCharacters: () => void;
  onOpenAngryLips: () => void;
  onOpenStream: () => void;
  onInviteByUsername: (username: string, message?: string) => Promise<void>;
  onRespondRequest: (requestId: string, action: "accept" | "decline" | "cancel") => Promise<void>;
  onRemoveCreator: (friendId: string) => Promise<void>;
  onSessionRespond: (sessionId: string, action: "accept" | "decline" | "left") => Promise<void>;
  currentUserId: string;
  mythacoinSummary: MythacoinSummary | null;
  onOpenSettings: () => void;
  streamPreview: StreamEvent[];
  onOpenAngryLipsTest?: () => void;
  onOpenMasterTest?: () => void;
  onOpenInviteFriends?: () => void;
}

export function FuturisticDashboard({
  profile,
  feed,
  notifications,
  characters,
  sessions,
  creators,
  incomingRequests,
  outgoingRequests,
  connectionStats,
  stories,
  loading,
  worldId,
  onRefresh,
  onEnterFeed,
  onOpenCharacters,
  onOpenAngryLips,
  onOpenStream,
  onInviteByUsername,
  onRespondRequest,
  onRemoveCreator,
  onSessionRespond,
  currentUserId,
  mythacoinSummary,
  onOpenSettings,
  streamPreview,
  onOpenAngryLipsTest,
  onOpenMasterTest,
  onOpenInviteFriends,
}: FuturisticDashboardProps) {
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [showSparksManager, setShowSparksManager] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    await onInviteByUsername(inviteUsername, inviteMessage);
    setInviteUsername('');
    setInviteMessage('');
  };

  const GridIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );

  const StreamIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L12 22M6 6L6 18M18 6L18 18" strokeLinecap="round"/>
    </svg>
  );

  const MessageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.31 21 9.18 20.75 8.15 20.31L3 22L4.69 16.85C4.25 15.82 4 14.69 4 13.5C4 8.25 8.25 4 13.5 4C16.12 4 18.44 5.16 20 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const VoteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="10" width="18" height="11" rx="2"/>
      <path d="M7 10V6C7 4.9 7.9 4 9 4H15C16.1 4 17 4.9 17 6V10" strokeLinecap="round"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1V5M12 19V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H5M19 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4V16M4 10H16" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 opacity-30">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-emerald-900/20"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              {/* Profile section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-[2px]">
                    <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {profile.username?.[0]?.toUpperCase() || 'M'}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-light">
                    <span className="font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {profile.displayName || profile.username}
                    </span>
                  </h1>
                  <p className="text-sm text-white/40 font-mono">@{profile.username}</p>
                  {profile.role === 'founder' && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <span className="text-xs text-purple-300">Founder</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-light">{creators.length}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light">{mythacoinSummary?.balance || 0}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Sparks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light">{stories.length}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Stories</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex items-center gap-2">
                {/* Global Search */}
                <GlobalSearch />
                
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* Invite Friends Button - Prominent */}
                {onOpenInviteFriends && (
                  <button
                    onClick={onOpenInviteFriends}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 transition-all flex items-center gap-2"
                    title="Invite Friends"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" y1="8" x2="19" y2="14"/>
                      <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    <span className="text-sm font-medium">Invite Friends</span>
                  </button>
                )}
                <button
                  onClick={onEnterFeed}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  title="Feed"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={onOpenStream}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  title="Stream"
                >
                  <StreamIcon />
                </button>
                <button
                  onClick={() => {/* Open messages */}}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  title="Messages"
                >
                  <MessageIcon />
                </button>
                <button
                  onClick={() => {/* Open DAS */}}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  title="Democratic Ads"
                >
                  <VoteIcon />
                </button>
                <button
                  onClick={onOpenSettings}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  title="Settings"
                >
                  <SettingsIcon />
                </button>
                {profile.username === 'MythaTron' && onOpenMasterTest && (
                  <button
                    onClick={onOpenMasterTest}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 transition-all group"
                    title="Master Test Suite (Admin)"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M7 7L17 17M17 7L7 17" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Story Feed Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-light mb-1">Story Feed</h3>
                    <p className="text-xs text-white/40">Latest from your universe</p>
                  </div>
                  <button
                    onClick={onEnterFeed}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 12L10 8L6 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                {feed.length > 0 ? (
                  <div className="space-y-3">
                    {feed.slice(0, 3).map((node) => (
                      <div key={node.id} className="p-3 bg-black/30 rounded-lg">
                        <div className="text-sm font-medium mb-1">{node.title}</div>
                        <div className="text-xs text-white/40">by {node.author}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-white/30 text-sm">
                    No stories yet
                  </div>
                )}
              </div>
            </div>

            {/* MythaStream Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-light mb-1">MythaStream</h3>
                    <p className="text-xs text-white/40">Live creative pulse</p>
                  </div>
                  <button
                    onClick={onOpenStream}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 12L10 8L6 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                {streamPreview.length > 0 ? (
                  <div className="space-y-2">
                    {streamPreview.slice(0, 4).map((event, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <div className="text-xs text-white/60 truncate flex-1">
                          {event.type}: {event.title || 'Activity'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-white/30 text-sm">
                    Stream starting soon
                  </div>
                )}
              </div>
            </div>

            {/* Angry Lips Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-light mb-1">Angry Lips</h3>
                    <p className="text-xs text-white/40">Mad-lib battles</p>
                  </div>
                  <div className="flex gap-2">
                    {profile.username === 'MythaTron' && onOpenAngryLipsTest && (
                      <button
                        onClick={onOpenAngryLipsTest}
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                        title="Test Suite (Admin Only)"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M8 2L8 14M2 8L14 8" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={onOpenAngryLips}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 12L10 8L6 4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 2).map((session) => (
                      <div key={session.id} className="p-3 bg-black/30 rounded-lg">
                        <div className="text-sm font-medium mb-1">{session.title}</div>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <span>{session.participantCount} players</span>
                          <span>•</span>
                          <span>{session.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <button
                      onClick={onOpenAngryLips}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg hover:from-emerald-500/30 hover:to-blue-500/30 transition-all text-sm"
                    >
                      Host First Session
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Connections Card - Full Width */}
            <div className="lg:col-span-2 group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-light mb-1">Creator Network</h3>
                    <p className="text-xs text-white/40">Your creative connections</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Connections</div>
                    {creators.length > 0 ? (
                      <div className="flex -space-x-2">
                        {creators.slice(0, 8).map((connection) => (
                          <div
                            key={connection.id}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-black flex items-center justify-center"
                            title={connection.username}
                          >
                            <span className="text-xs font-bold">{connection.username[0]}</span>
                          </div>
                        ))}
                        {creators.length > 8 && (
                          <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-black flex items-center justify-center">
                            <span className="text-xs">+{creators.length - 8}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-white/30 text-sm">No connections yet</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Invite</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteUsername}
                        onChange={(e) => setInviteUsername(e.target.value)}
                        placeholder="@username"
                        className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:border-white/30 focus:outline-none"
                      />
                      <button
                        onClick={handleInvite}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sparks Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-light mb-1">Sparks</h3>
                    <p className="text-xs text-white/40">Creative energy</p>
                  </div>
                  <button 
                    onClick={() => setShowSparksManager(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    title="Manage Sparks"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2l1.09 6.26L19 7l-3.55 4.82L21 16l-6.19.95L16 23l-4-4.73L8 23l1.19-6.05L3 16l5.55-4.82L5 7l5.91 1.26L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="text-center py-4">
                  <div className="text-4xl font-light mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {mythacoinSummary?.balance || 0}
                  </div>
                  <div className="text-xs text-white/40">Available Balance</div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowSparksManager(true)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm font-medium transition-all"
                  >
                    Buy Sparks
                  </button>
                  <button
                    onClick={() => setShowSparksManager(true)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                  >
                    Subscribe
                  </button>
                </div>
                
                {mythacoinSummary?.recentTransactions && mythacoinSummary.recentTransactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent</div>
                    {mythacoinSummary.recentTransactions.slice(0, 2).map((tx, i) => (
                      <div key={i} className="flex justify-between items-center text-xs py-1">
                        <span className="text-white/60">{tx.description}</span>
                        <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Sparks Manager Modal */}
      {showSparksManager && (
        <SparksManager onClose={() => setShowSparksManager(false)} />
      )}
    </div>
  );
}
