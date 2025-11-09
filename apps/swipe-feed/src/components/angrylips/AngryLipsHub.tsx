/**
 * Angry Lips Hub - Mad-lib battles central
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';
import { AngryLipsMadLibsSession } from './AngryLipsMadLibsSession';
import { useSparks } from '../sparks/SparksContext';
import { getTemplatesByLength, getBlankDensityInfo } from '../../lib/angryLipsTemplates';
import { AdvancedModeSelector } from './AdvancedModeSelector';
import { AdvancedAngryLipsSystem } from '../../lib/angryLipsAdvanced';

interface AngryLipsHubProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const AngryLipsHub: React.FC<AngryLipsHubProps> = ({ profile, onNavigate }) => {
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [genre, setGenre] = useState('Comedy');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [useAIStory, setUseAIStory] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customNames, setCustomNames] = useState('');
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [storyLength, setStoryLength] = useState<'micro' | 'short' | 'medium' | 'long'>('short');
  const [timerMode, setTimerMode] = useState<'rapid' | 'normal' | 'relaxed' | 'none'>('normal');
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [advancedSystem] = useState(() => new AdvancedAngryLipsSystem());

  const { balance: sparksBalance, isAdmin, deductSparks, addSparks } = useSparks();

  React.useEffect(() => {
    // Check if there's a session to resume
    const resumeSessionData = localStorage.getItem('angry_lips_resume_session');
    if (resumeSessionData) {
      const sessionToResume = JSON.parse(resumeSessionData);
      localStorage.removeItem('angry_lips_resume_session'); // Clear it after reading
      
      // Set the active session to resume
      setActiveSessionId(sessionToResume.sessionId);
      
      // Add to active sessions if not already there
      const storedSessions = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
      const sessionExists = storedSessions.some((s: any) => s.sessionId === sessionToResume.sessionId);
      if (!sessionExists) {
        storedSessions.push({
          sessionId: sessionToResume.sessionId,
          host: sessionToResume.host,
          genre: sessionToResume.genre,
          maxPlayers: sessionToResume.maxPlayers,
          players: sessionToResume.players,
          isResumed: true
        });
        localStorage.setItem('angry_lips_sessions', JSON.stringify(storedSessions));
      }
    }
    
    // Load sessions and saved stories from localStorage with error handling
    try {
      const storedSessions = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
      if (Array.isArray(storedSessions)) {
        setSessions(storedSessions);
      } else {
        console.error('Invalid sessions data in localStorage, resetting...');
        localStorage.removeItem('angry_lips_sessions');
        setSessions([]);
      }
    } catch (e) {
      console.error('Error loading sessions:', e);
      localStorage.removeItem('angry_lips_sessions');
      setSessions([]);
    }
    
    try {
      const storedStories = JSON.parse(localStorage.getItem('angry_lips_saved_stories') || '[]');
      if (Array.isArray(storedStories)) {
        setSavedStories(storedStories);
      } else {
        console.error('Invalid stories data in localStorage, resetting...');
        localStorage.removeItem('angry_lips_saved_stories');
        setSavedStories([]);
      }
    } catch (e) {
      console.error('Error loading stories:', e);
      localStorage.removeItem('angry_lips_saved_stories');
      setSavedStories([]);
    }
    
    // Load leaderboard
    try {
      const storedLeaderboard = JSON.parse(localStorage.getItem('angry_lips_leaderboard') || '[]');
      if (Array.isArray(storedLeaderboard)) {
        setLeaderboard(storedLeaderboard.slice(0, 10)); // Top 10
      } else {
        console.error('Invalid leaderboard data in localStorage, resetting...');
        localStorage.removeItem('angry_lips_leaderboard');
        setLeaderboard([]);
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e);
      localStorage.removeItem('angry_lips_leaderboard');
      setLeaderboard([]);
    }
    
    // CRITICAL: Check for incomplete/saved sessions that can be resumed
    const username = localStorage.getItem('mythatron_username') || 'user';
    const savedSessionsKey = `angry_lips_saved_sessions_${username.toLowerCase().replace(/\s+/g, '_')}`;
    const savedSessions = JSON.parse(localStorage.getItem(savedSessionsKey) || '[]');
    if (savedSessions.length > 0) {
      console.log(`Found ${savedSessions.length} saved sessions that can be resumed`);
    }
  }, []);

  const handleCreateSession = () => {
    const userIdRaw = localStorage.getItem('mythatron_user_id') || '';
    const userId = userIdRaw.toLowerCase();
    const isAdmin = userId === 'mythatron';

    // Admin always has unlimited sparks
    if (isAdmin) {
      localStorage.setItem('mythatron_sparks', 'Infinity');
    }
    
    // Reduced price: 25 sparks instead of 50 for custom AI stories
    if (useAIStory && !isAdmin && sparksBalance < 25) {
      alert('You need 25 Sparks to generate an AI story. Please purchase more Sparks.');
      return;
    }

    // Deduct sparks for non-admin users
    if (useAIStory && !isAdmin && sparksBalance !== Infinity) {
      deductSparks(25);
    }
    
    const sessionId = `session_${Date.now()}`;
    const newSession = {
      id: sessionId,
      genre: useAIStory ? 'AI Generated' : genre,
      maxPlayers,
      playerNames: playerList,
      createdAt: new Date().toISOString(),
      host: profile?.username || 'You',
      players: [profile?.username || 'You'],
      status: 'active',
      customPrompt: useAIStory ? customPrompt : undefined,
      customNames: useAIStory ? customNames.split(',').map(n => n.trim()).filter(n => n) : undefined,
      timerMode,
      isOnlineOnly,
      storyLength
    };
    
    // Deduct Sparks if using AI (except for admin)
    if (useAIStory && !isAdmin) {
      deductSparks(25);
    }
    
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('angry_lips_sessions', JSON.stringify(updatedSessions));
    
    setShowCreateSession(false);
    
    // Start the session immediately
    setActiveSessionId(sessionId);
    
    // Reset form
    setGenre('Comedy');
    setMaxPlayers(4);
    setPlayerList([]);
    setPlayerNameInput('');
    setUseAIStory(false);
    setCustomPrompt('');
    setCustomNames('');
  };

  const handleJoinSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleEndSession = (saveProgress = true) => {
    if (saveProgress && activeSessionId) {
      // Find the active session
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (activeSession) {
        // Save the session to saved stories before removing
        const username = localStorage.getItem('mythatron_username') || 'user';
        const savedSessionsKey = `angry_lips_saved_sessions_${username.toLowerCase().replace(/\s+/g, '_')}`;
        const existingSaved = JSON.parse(localStorage.getItem(savedSessionsKey) || '[]');
        
        // Add timestamp and mark as incomplete if not finished
        const sessionToSave = {
          ...activeSession,
          savedAt: Date.now(),
          status: activeSession.gamePhase === 'reveal' ? 'completed' : 'incomplete',
          lastActivity: Date.now()
        };
        
        // Add to saved sessions (keep last 10)
        const updatedSaved = [sessionToSave, ...existingSaved].slice(0, 10);
        localStorage.setItem(savedSessionsKey, JSON.stringify(updatedSaved));
        
        // Also save to the general saved stories if completed
        if (activeSession.gamePhase === 'reveal' && activeSession.filledBlanks) {
          const story = {
            id: activeSession.id,
            title: activeSession.storyTitle || 'Untitled Story',
            genre: activeSession.genre,
            content: activeSession.filledStory || '',
            blanks: activeSession.filledBlanks,
            createdAt: Date.now(),
            players: activeSession.players || [activeSession.host],
            score: activeSession.totalPoints || 0
          };
          
          const existingStories = JSON.parse(localStorage.getItem('angry_lips_saved_stories') || '[]');
          const updatedStories = [story, ...existingStories].slice(0, 50);
          localStorage.setItem('angry_lips_saved_stories', JSON.stringify(updatedStories));
        }
      }
    }
    
    // Remove the session from active sessions
    const updatedSessions = sessions.filter(s => s.id !== activeSessionId);
    setSessions(updatedSessions);
    localStorage.setItem('angry_lips_sessions', JSON.stringify(updatedSessions));
    setActiveSessionId(null);
  };

  // If there's an active session, show it instead of the hub
  if (activeSessionId) {
    const activeSession = sessions.find(s => s.id === activeSessionId || s.sessionId === activeSessionId);
    
    // Check if there's saved session data to restore
    const username = localStorage.getItem('mythatron_username') || 'user';
    const savedSessionsKey = `angry_lips_saved_sessions_${username.toLowerCase().replace(/\s+/g, '_')}`;
    const savedSessions = JSON.parse(localStorage.getItem(savedSessionsKey) || '[]');
    const savedSessionData = savedSessions.find((s: any) => s.sessionId === activeSessionId);
    
    if (activeSession || savedSessionData) {
      const sessionData = savedSessionData || activeSession;
      return (
        <AngryLipsMadLibsSession
          sessionId={sessionData.sessionId || sessionData.id}
          genre={sessionData.genre}
          maxPlayers={sessionData.maxPlayers}
          playerNames={sessionData.playerNames || sessionData.players || []}
          host={sessionData.host}
          onNavigate={onNavigate}
          onEndSession={handleEndSession}
          customStoryPrompt={sessionData.customStoryPrompt || sessionData.customPrompt}
          customNames={sessionData.customNames}
          timerMode={sessionData.timerMode || 'normal'}
          isOnlineOnly={sessionData.isOnlineOnly || false}
          storyLength={sessionData.storyLength || 'medium'}
          resumeData={savedSessionData}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight uppercase">ANGRY LIPS</h1>
              <p className="text-xs text-cyan-500/60 uppercase tracking-widest">AI-POWERED BATTLES</p>
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Active Sessions */}
                <div className="lg:col-span-2">
                  {/* Saved Stories */}
                  {savedStories.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-light mb-4">Your Saved Stories</h2>
                      <div className="grid grid-cols-1 gap-3 mb-6">
                        {savedStories.slice(-3).reverse().map(story => (
                          <div key={story.id} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-purple-300">{story.title}</h3>
                              <span className="text-xs text-white/40">{new Date(story.savedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-white/60 line-clamp-2">{story.completedStory}</p>
                            <div className="flex gap-2 mt-2">
                              <button className="text-xs text-cyan-400 hover:text-purple-300">View Full</button>
                              <button className="text-xs text-cyan-400 hover:text-purple-300">Share</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {savedStories.length > 3 && (
                        <button 
                          onClick={() => onNavigate('prologue')}
                          className="text-sm text-cyan-400 hover:text-purple-300">
                          View all {savedStories.length} saved stories in Dashboard →
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* CRITICAL: Show saved/incomplete sessions that can be resumed */}
                  {(() => {
                    const username = localStorage.getItem('mythatron_username') || 'user';
                    const savedSessionsKey = `angry_lips_saved_sessions_${username.toLowerCase().replace(/\s+/g, '_')}`;
                    const savedSessions = JSON.parse(localStorage.getItem(savedSessionsKey) || '[]');
                    
                    if (savedSessions.length > 0) {
                      return (
                        <div className="mb-6">
                          <h2 className="text-xl font-light mb-4 text-yellow-400">
                            ⚠️ Resume Saved Sessions (Paid with Sparks)
                          </h2>
                          <div className="space-y-3">
                            {savedSessions.map((saved: any) => (
                              <div key={saved.sessionId} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-lg font-medium text-yellow-400">
                                      {saved.genre} Story - {saved.currentStory?.blanks ? Math.round((saved.currentBlankIndex / saved.currentStory.blanks.length) * 100) : 0}% Complete
                                    </h3>
                                    <p className="text-sm text-white/60 mt-1">
                                      Progress: {saved.currentBlankIndex || 0} of {saved.currentStory?.blanks?.length || 0} blanks filled
                                    </p>
                                    <p className="text-xs text-white/40 mt-1">
                                      Saved: {new Date(saved.savedAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                                    SAVED
                                  </span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setActiveSessionId(saved.sessionId);
                                    // Auto-invite all previous participants if multiplayer
                                    if (saved.players && saved.players.length > 1) {
                                      console.log('Auto-inviting previous participants:', saved.players);
                                      // In a real app, this would send invites via WebSocket/API
                                      saved.players.forEach((player: string) => {
                                        if (player !== saved.host) {
                                          console.log(`Sending invite to ${player}`);
                                        }
                                      });
                                    }
                                  }}
                                  className="w-full py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl transition-all font-medium"
                                >
                                  Resume Session (No Additional Cost) {saved.players?.length > 1 && '• Auto-invites participants'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <h2 className="text-xl font-light mb-6">Active Sessions</h2>
                  <div className="space-y-4">
              {sessions && Array.isArray(sessions) && sessions.length > 0 ? sessions.map(session => (
                <div key={session.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-light mb-1">Session by {session.host}</h3>
                      <p className="text-sm text-white/60">Genre: {session.genre} • {session.players?.length || 0}/{session.maxPlayers} players</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                      {session.status === 'waiting' ? 'Waiting' : 'Live'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleJoinSession(session.id)}
                      className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all">
                      Join Session
                    </button>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                      Watch
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <p className="text-white/50">No active sessions. Create one to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-light mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowCreateSession(true)}
                className="w-full p-6 bg-black/40 border border-cyan-500/20 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all transform hover:scale-[1.01]"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-cyan-400">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <h3 className="text-lg font-black uppercase tracking-wider mb-1 text-cyan-400">HOST SESSION</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">START NEW GAME</p>
              </button>

              <button className="w-full p-6 bg-black/40 border border-blue-500/20 rounded-lg hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all transform hover:scale-[1.01]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-blue-400">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                </svg>
                <h3 className="text-lg font-black uppercase tracking-wider mb-1 text-blue-400">QUICK MATCH</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">JOIN RANDOM</p>
              </button>

              <button 
                onClick={() => setShowAdvancedMode(true)}
                className="w-full p-6 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border border-cyan-400 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all transform hover:scale-[1.01] relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 text-black text-xs font-black rounded-sm tracking-wider">
                  NEW
                </div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-cyan-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3 className="text-lg font-black uppercase tracking-wider mb-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ADVANCED MODES</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">NEXT-GEN • AI-POWERED • MULTIPLAYER</p>
                <div className="mt-2 flex gap-2 justify-center">
                  <span className="text-xs px-2 py-1 bg-cyan-500/20 rounded-sm text-cyan-300 font-bold uppercase">DYNAMIC</span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-sm text-blue-300 font-bold uppercase">SEMANTIC</span>
                  <span className="text-xs px-2 py-1 bg-gray-700/50 rounded-sm text-gray-300 font-bold uppercase">ADAPTIVE</span>
                </div>
              </button>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <h4 className="text-sm font-medium text-yellow-400 mb-2">AI Co-Host Available</h4>
                <p className="text-xs text-white/60 mb-3">Use AI to enhance your sessions</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">10 Sparks per use</span>
                  <button className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-xs transition-all">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Session Modal */}
        {/* Advanced Mode Modal */}
        {showAdvancedMode && (
          <AdvancedModeSelector
            onModeSelect={(mode, tone, tier) => {
              // Handle advanced mode selection
              console.log('Advanced mode selected:', { mode, tone, tier });
              setShowAdvancedMode(false);
              
              // Deduct sparks if not admin
              if (!isAdmin) {
                deductSparks(tier.sparksCost);
              }
              
              // Create advanced session
              const sessionId = `adv_${Date.now()}`;
              const newSession = {
                id: sessionId,
                genre: tone,
                mode: mode,
                tier: tier.id,
                maxPlayers: 8,
                playerNames: [],
                createdAt: new Date().toISOString(),
                host: profile?.username || 'Player',
                isAdvanced: true,
                storyLength: tier.id === 'premium' ? 'long' : 'medium'
              };
              
              // Save to localStorage
              const updatedSessions = [newSession, ...sessions];
              setSessions(updatedSessions);
              localStorage.setItem('angry_lips_sessions', JSON.stringify(updatedSessions));
              
              // Start the session
              setActiveSessionId(sessionId);
            }}
            onClose={() => setShowAdvancedMode(false)}
          />
        )}

        {showCreateSession && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-gray-900/95 via-black to-gray-900/95 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 tracking-tight uppercase">Create Session</h3>

                    <div className="space-y-4">
                      {/* AI Story Toggle */}
                      <div className="p-4 bg-black/40 border border-cyan-500/20 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            id="use-ai-story"
                            className="rounded"
                            checked={useAIStory}
                            onChange={(e) => setUseAIStory(e.target.checked)}
                          />
                          <label htmlFor="use-ai-story" className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold uppercase tracking-wider text-sm">AI STORY GENERATION</span>
                            <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-sm text-xs text-cyan-400 font-black">
                              25 SPARKS
                            </span>
                          </label>
                        </div>
                        
                        {useAIStory && (
                          <div className="space-y-3 mt-3">
                            <div>
                              <label className="block text-sm text-white/60 mb-1">Story Idea/Theme</label>
                              <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="E.g., 'A birthday party gone wrong' or 'Aliens at a wedding'"
                                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-white/60 mb-1">Custom Names (optional)</label>
                              <input
                                type="text"
                                value={customNames}
                                onChange={(e) => setCustomNames(e.target.value)}
                                placeholder="E.g., John, Sarah, Mike (comma-separated)"
                                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30"
                              />
                              <p className="text-xs text-white/40 mt-1">These names will be used in the story</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {!useAIStory && (
                        <>
                          <div>
                            <label className="block text-sm text-white/60 mb-2">Story Length (Based on Mad Libs Formula)</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setStoryLength('micro')}
                                className={`px-3 py-2 rounded-lg transition-all text-sm transform hover:scale-[1.02] ${
                                  storyLength === 'micro' 
                                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                    : 'bg-black/30 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
                                }`}>
                                <div className="font-semibold">Micro</div>
                                <div className="text-xs opacity-70">5-8 blanks</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setStoryLength('short')}
                                className={`px-3 py-2 rounded-lg transition-all text-sm transform hover:scale-[1.02] ${
                                  storyLength === 'short' 
                                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                    : 'bg-black/30 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
                                }`}>
                                <div className="font-semibold">Short</div>
                                <div className="text-xs opacity-70">10-15 blanks</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setStoryLength('medium')}
                                className={`px-3 py-2 rounded-lg transition-all text-sm transform hover:scale-[1.02] ${
                                  storyLength === 'medium' 
                                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                    : 'bg-black/30 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
                                }`}>
                                <div className="font-semibold">Medium</div>
                                <div className="text-xs opacity-70">15-25 blanks</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setStoryLength('long')}
                                className={`px-3 py-2 rounded-lg transition-all text-sm transform hover:scale-[1.02] ${
                                  storyLength === 'long' 
                                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                    : 'bg-black/30 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
                                }`}>
                                <div className="font-semibold">Long</div>
                                <div className="text-xs opacity-70">25-35 blanks</div>
                              </button>
                            </div>
                            <div className="text-xs text-white/40 mt-2 space-y-1">
                              <p>• Optimal blank density for maximum comedy</p>
                              <p>• {storyLength === 'micro' ? '~45 words total, quick punchline' : 
                                    storyLength === 'short' ? '~120 words, single scene' :
                                    storyLength === 'medium' ? '~280 words, full story arc' :
                                    '~450 words, epic narrative'}</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-white/60 mb-2">Genre</label>
                            <select
                              value={genre}
                              onChange={(e) => setGenre(e.target.value)}
                              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white">
                    <option value="fantasy">Fantasy</option>
                    <option value="sci-fi">Sci-Fi</option>
                    <option value="horror">Horror</option>
                    <option value="comedy">Comedy</option>
                    <option value="action">Action/Adventure</option>
                    <option value="mystery">Mystery/Detective</option>
                    <option value="romance">Romance</option>
                    <option value="sports">Sports</option>
                    <option value="workplace">Workplace/Satire</option>
                    <option value="historical">Historical</option>
                    <option value="western">Western</option>
                    <option value="superhero">Superhero</option>
                    <option value="noir">Noir</option>
                    <option value="steampunk">Steampunk</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="fairy-tale">Fairy Tale (Coming Soon)</option>
                    <option value="dystopian">Dystopian (Coming Soon)</option>
                    <option value="post-apocalyptic">Post-Apocalyptic (Coming Soon)</option>
                    <option value="slice-of-life">Slice of Life (Coming Soon)</option>
                    <option value="anime">Anime (Coming Soon)</option>
                    <option value="cartoon">Cartoon (Coming Soon)</option>
                    <option value="musical">Musical (Coming Soon)</option>
                    <option value="zombie">Zombie (Coming Soon)</option>
                    <option value="medieval">Medieval (Coming Soon)</option>
                    <option value="mythology">Mythology (Coming Soon)</option>
                    <option value="space-opera">Space Opera (Coming Soon)</option>
                    <option value="espionage">Espionage/Spy (Coming Soon)</option>
                    <option value="reality-tv">Reality TV (Coming Soon)</option>
                    <option value="political">Political Satire (Coming Soon)</option>
                    <option value="video-game">Video Game (Coming Soon)</option>
                    <option value="fanfiction">Fanfiction (Coming Soon)</option>
                    <option value="time-travel">Time Travel (Coming Soon)</option>
                    <option value="survival">Survival (Coming Soon)</option>
                    <option value="magical-girl">Magical Girl (Coming Soon)</option>
                    <option value="school">School/Academia (Coming Soon)</option>
                    <option value="heist">Heist/Burglary (Coming Soon)</option>
                    <option value="courtroom">Courtroom/Legal Drama (Coming Soon)</option>
                    <option value="cooking">Cooking/Food (Coming Soon)</option>
                    <option value="children">Children's/Family (Coming Soon)</option>
                    <option value="animal">Pet/Animal Adventure (Coming Soon)</option>
                    <option value="pirates">Pirates (Coming Soon)</option>
                    <option value="vampire-werewolf">Vampire/Werewolf (Coming Soon)</option>
                    <option value="holiday">Christmas/Holiday (Coming Soon)</option>
                    <option value="road-trip">Road Trip (Coming Soon)</option>
                    <option value="paranormal">Paranormal (Coming Soon)</option>
                    <option value="experimental">Experimental/Absurdist (Coming Soon)</option>
                  </select>
                </div>
              </>
            )}

                <div>
                  <label className="block text-sm text-white/60 mb-2">Max Players</label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Timer Mode</label>
                  <select
                    value={timerMode}
                    onChange={(e) => setTimerMode(e.target.value as any)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white">
                    <option value="rapid">Rapid (15 seconds)</option>
                    <option value="normal">Normal (30 seconds)</option>
                    <option value="relaxed">Relaxed (60 seconds)</option>
                    <option value="none">No Timer</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="online-only" 
                    className="rounded"
                    checked={isOnlineOnly}
                    onChange={(e) => setIsOnlineOnly(e.target.checked)}
                  />
                  <label htmlFor="online-only" className="text-sm text-white/60">
                    Online-only mode (Players take turns, 5-second cooloff)
                  </label>
                </div>

                {/* Player Names for Local Play */}
                <div className="space-y-3">
                  <label className="text-sm text-white/60">Players in the Room (for local play)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter player name"
                      value={playerNameInput}
                      onChange={(e) => setPlayerNameInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && playerNameInput.trim()) {
                          setPlayerList([...playerList, playerNameInput.trim()]);
                          setPlayerNameInput('');
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30"
                    />
                    <button
                      onClick={() => {
                        if (playerNameInput.trim()) {
                          setPlayerList([...playerList, playerNameInput.trim()]);
                          setPlayerNameInput('');
                        }
                      }}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {playerList.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {playerList.map((name, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
                          <span className="text-sm text-purple-300">{name}</span>
                          <button
                            onClick={() => setPlayerList(playerList.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateSession(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateSession}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
