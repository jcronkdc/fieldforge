/**
 * FUTURISTIC ANGRYLIPS HUB - Next-Gen Mad Libs
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';
import { useSparks } from '../sparks/SparksContext';
import { FuturisticMadLibsSession } from './FuturisticMadLibsSession';
import { AdvancedModeSelector } from './AdvancedModeSelector';
import { Icons } from '../icons/Icons';
import { EnhancedSessionSetup } from './EnhancedSessionSetup';
import { SessionChat } from './SessionChat';
import { SessionManager } from './SessionManager';
import { PostGameRemix } from './PostGameRemix';

interface Props {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

interface Session {
  id: string;
  host: string;
  genre: string;
  mode: 'versus' | 'chain' | 'team-remix' | 'speed-fill' | 'blind-collab';
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  createdAt: string;
  sparksCost: number;
}

export const FuturisticAngryLipsHub: React.FC<Props> = ({ profile, onNavigate }) => {
  const { balance: sparksBalance, isAdmin, deductSparks } = useSparks();
  const [activeView, setActiveView] = useState<'hub' | 'create' | 'session' | 'advanced'>('hub');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [showEnhancedSetup, setShowEnhancedSetup] = useState(false);
  const [showPostGameRemix, setShowPostGameRemix] = useState(false);
  const [completedStory, setCompletedStory] = useState<any>(null);
  
  // Create session form state
  const [selectedMode, setSelectedMode] = useState<Session['mode']>('versus');
  const [selectedGenre, setSelectedGenre] = useState('Comedy');
  const [selectedPlayers, setSelectedPlayers] = useState(4);
  const [useAI, setUseAI] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    // Load sessions from localStorage
    const saved = localStorage.getItem('angry_lips_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load sessions');
      }
    }
  }, []);

  const createSession = () => {
    const sparksCost = useAI ? 25 : 10;
    
    if (!isAdmin && sparksBalance < sparksCost) {
      alert(`Need ${sparksCost} Sparks. Current balance: ${sparksBalance}`);
      return;
    }

    const newSession: Session = {
      id: `session-${Date.now()}`,
      host: profile?.username || 'Player',
      genre: selectedGenre,
      mode: selectedMode,
      players: [profile?.username || 'Player'],
      maxPlayers: selectedPlayers,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      sparksCost
    };

    if (!isAdmin) {
      deductSparks(sparksCost);
    }

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('angry_lips_sessions', JSON.stringify(updated));
    
    setActiveSession(newSession);
    setActiveView('session');
  };

  const joinSession = (session: Session) => {
    setActiveSession(session);
    setActiveView('session');
  };

  const handleQuickMatch = () => {
    // Find available sessions or create a new one
    const availableSessions = sessions.filter(s => 
      s.status === 'waiting' && 
      s.players.length < s.maxPlayers
    );
    
    if (availableSessions.length > 0) {
      // Join random available session
      const randomSession = availableSessions[Math.floor(Math.random() * availableSessions.length)];
      randomSession.players.push(profile?.username || 'Player');
      joinSession(randomSession);
    } else {
      // Create instant session with random settings
      const modes: Session['mode'][] = ['versus', 'chain', 'team-remix', 'speed-fill', 'blind-collab'];
      const genres = ['Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Action'];
      
      const quickSession: Session = {
        id: `quick-${Date.now()}`,
        host: 'QuickMatch',
        genre: genres[Math.floor(Math.random() * genres.length)],
        mode: modes[Math.floor(Math.random() * modes.length)],
        players: [profile?.username || 'Player'],
        maxPlayers: 4,
        status: 'active',
        createdAt: new Date().toISOString(),
        sparksCost: 5 // Reduced cost for quick match
      };
      
      // Deduct sparks
      if (!isAdmin && sparksBalance >= 5) {
        deductSparks(5);
      }
      
      setSessions([quickSession, ...sessions]);
      setActiveSession(quickSession);
      setActiveView('session');
    }
  };

  const gameModes = [
    { id: 'versus' as const, name: 'VERSUS', desc: 'COMPETITIVE FILL', icon: Icons.Sword, color: 'cyan' },
    { id: 'chain' as const, name: 'CHAIN', desc: 'SEQUENTIAL BUILD', icon: Icons.Collaborate, color: 'blue' },
    { id: 'team-remix' as const, name: 'TEAM REMIX', desc: 'COLLABORATIVE', icon: Icons.Friends, color: 'purple' },
    { id: 'speed-fill' as const, name: 'SPEED FILL', desc: 'TIME ATTACK', icon: Icons.Fire, color: 'yellow' },
    { id: 'blind-collab' as const, name: 'BLIND COLLAB', desc: 'MYSTERY MODE', icon: Icons.Shield, color: 'pink' }
  ];

  const genres = ['Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Action', 'Mystery', 'Fantasy', 'Noir'];

  if (activeView === 'session' && activeSession) {
    return (
      <FuturisticMadLibsSession
        sessionId={activeSession.id}
        genre={activeSession.genre}
        maxPlayers={activeSession.maxPlayers}
        playerNames={activeSession.players}
        host={activeSession.host}
        onNavigate={onNavigate}
        onEndSession={() => {
          setActiveView('hub');
          setActiveSession(null);
        }}
        onComplete={(storyData) => {
          setCompletedStory(storyData);
          setShowPostGameRemix(true);
        }}
      />
    );
  }

  if (showAdvancedMode) {
    return (
      <AdvancedModeSelector
        onModeSelect={(mode, tone, tier) => {
          console.log('Advanced mode selected:', { mode, tone, tier });
          setShowAdvancedMode(false);
          // Create advanced session
          createSession();
        }}
        onClose={() => setShowAdvancedMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                ANGRYLIPS
              </h1>
              <p className="text-sm text-cyan-500/60 uppercase tracking-widest">AI-POWERED MAD LIBS BATTLE</p>
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {activeView === 'hub' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => setShowEnhancedSetup(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-2">HOST GAME</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">CREATE NEW SESSION</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickMatch()}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-8 hover:border-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-4xl mb-4">🎲</div>
                <h3 className="text-xl font-black text-blue-400 uppercase tracking-wider mb-2">QUICK MATCH</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">JOIN RANDOM GAME</p>
              </div>
            </button>

            <button
              onClick={() => setShowAdvancedMode(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8 hover:border-purple-400 hover:shadow-[0_0_40px_rgba(147,51,234,0.3)] transition-all transform hover:scale-[1.02]"
            >
              <div className="absolute -top-2 -right-2 px-3 py-1 bg-purple-500 text-black text-xs font-black rounded-sm uppercase tracking-wider">
                PRO
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-black text-purple-400 uppercase tracking-wider mb-2">ADVANCED</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">NEXT-GEN MODES</p>
              </div>
            </button>
          </div>

          {/* Active Sessions */}
          <div className="mb-8">
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-4">ACTIVE SESSIONS</h2>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="bg-black/60 border border-gray-800 rounded-xl p-8 text-center">
                  <p className="text-gray-500 uppercase tracking-widest">NO ACTIVE SESSIONS</p>
                  <p className="text-sm text-gray-600 mt-2">CREATE A NEW SESSION TO GET STARTED</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="bg-black/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-cyan-400 uppercase tracking-wider">{session.host}'S GAME</h3>
                          <span className={`px-3 py-1 rounded-sm text-xs font-black uppercase tracking-wider ${
                            session.status === 'active' 
                              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                              : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 uppercase tracking-widest">
                          <span>{session.genre}</span>
                          <span>•</span>
                          <span>{session.mode}</span>
                          <span>•</span>
                          <span>{session.players.length}/{session.maxPlayers} PLAYERS</span>
                        </div>
                      </div>
                      <button
                        onClick={() => joinSession(session)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
                      >
                        JOIN
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div>
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-4">TOP PLAYERS</h2>
            <div className="bg-black/60 border border-cyan-500/20 rounded-xl p-6">
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'ALPHA_MASTER', score: 9847, badge: '🏆' },
                  { rank: 2, name: 'STORY_KING', score: 8234, badge: '🥈' },
                  { rank: 3, name: 'WORD_WIZARD', score: 7621, badge: '🥉' }
                ].map(player => (
                  <div key={player.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{player.badge}</span>
                      <span className="font-black text-cyan-400 uppercase tracking-wider">{player.name}</span>
                    </div>
                    <span className="text-xl font-black text-white">{player.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'create' && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wider mb-8">CREATE SESSION</h2>
          
          {/* Game Mode Selection */}
          <div className="mb-8">
            <label className="text-sm text-gray-500 uppercase tracking-widest mb-4 block">SELECT MODE</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {gameModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                    selectedMode === mode.id
                      ? `bg-${mode.color}-500/10 border-${mode.color}-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]`
                      : 'bg-black/40 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {selectedMode === mode.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                  <div className="text-3xl mb-2">
                    {React.createElement(mode.icon, { size: 28, className: 'text-cyan-400 mx-auto' })}
                  </div>
                  <h4 className="font-black text-white uppercase tracking-wider text-sm mb-1">{mode.name}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Genre Selection */}
          <div className="mb-8">
            <label className="text-sm text-gray-500 uppercase tracking-widest mb-4 block">SELECT GENRE</label>
            <div className="grid grid-cols-4 gap-3">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-3 rounded-lg border-2 font-bold uppercase tracking-wider text-sm transition-all ${
                    selectedGenre === genre
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Player Count */}
          <div className="mb-8">
            <label className="text-sm text-gray-500 uppercase tracking-widest mb-4 block">MAX PLAYERS</label>
            <div className="flex gap-3">
              {[2, 3, 4, 5, 6, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedPlayers(num)}
                  className={`w-14 h-14 rounded-lg border-2 font-black text-lg transition-all ${
                    selectedPlayers === num
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* AI Story Toggle */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <h4 className="font-black text-purple-400 uppercase tracking-wider mb-1">AI STORY GENERATION</h4>
                <p className="text-sm text-gray-500 uppercase tracking-widest">CUSTOM AI-POWERED STORY • 25 SPARKS</p>
              </div>
              <button
                onClick={() => setUseAI(!useAI)}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  useAI ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  useAI ? 'translate-x-7' : 'translate-x-0'
                }`}></div>
              </button>
            </label>
            {useAI && (
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="DESCRIBE YOUR STORY THEME..."
                className="w-full mt-4 px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-purple-300 placeholder-purple-500/50 focus:border-purple-400 focus:outline-none uppercase tracking-wider"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveView('hub')}
              className="flex-1 px-6 py-4 bg-black border-2 border-gray-700 rounded-lg text-gray-400 font-black uppercase tracking-wider hover:border-gray-600 hover:text-white transition-all"
            >
              CANCEL
            </button>
            <button
              onClick={createSession}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02]"
            >
              CREATE SESSION • {useAI ? '25' : '10'} SPARKS
            </button>
          </div>
        </div>
      )}
      {/* Enhanced Session Setup */}
      {showEnhancedSetup && (
        <EnhancedSessionSetup
          onStartSession={(config) => {
            const newSession: Session = {
              id: `session-${Date.now()}`,
              host: profile?.username || 'Player',
              genre: config.genre,
              mode: config.mode,
              players: config.playerNames,
              maxPlayers: config.playerNames.length,
              status: 'active',
              createdAt: new Date().toISOString(),
              sparksCost: config.useAI ? 25 : 10
            };
            
            if (!isAdmin && config.useAI) {
              deductSparks(25);
            } else if (!isAdmin) {
              deductSparks(10);
            }
            
            setSessions([newSession, ...sessions]);
            setActiveSession(newSession);
            setActiveView('session');
            setShowEnhancedSetup(false);
          }}
          onCancel={() => setShowEnhancedSetup(false)}
          sparksBalance={sparksBalance}
          isAdmin={isAdmin}
        />
      )}

      {/* Post Game Remix */}
      {showPostGameRemix && completedStory && (
        <PostGameRemix
          storyData={completedStory}
          onClose={() => {
            setShowPostGameRemix(false);
            setCompletedStory(null);
          }}
          onNavigate={onNavigate}
        />
      )}

      {/* Session Manager - Always available in active sessions */}
      {activeView === 'session' && activeSession && (
        <SessionManager
          sessionId={activeSession.id}
          sessionData={activeSession}
          onSave={() => console.log('Session saved')}
          onLoad={(session) => {
            setActiveSession(session as any);
          }}
        />
      )}

      {/* Session Chat - For online sessions */}
      {activeView === 'session' && activeSession && activeSession.players.length > 1 && (
        <SessionChat
          sessionId={activeSession.id}
          currentPlayer={profile?.username || 'Player'}
          players={activeSession.players}
          isOnline={true}
        />
      )}
    </div>
  );
};

export default FuturisticAngryLipsHub;
