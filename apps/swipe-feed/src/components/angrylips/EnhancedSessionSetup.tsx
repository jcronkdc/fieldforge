/**
 * Enhanced Session Setup for AngryLips
 * Includes player names, time limits, and invite friends
 */

import React, { useState } from 'react';
import { Icons } from '../icons/Icons';

interface Props {
  onStartSession: (config: SessionConfig) => void;
  onCancel: () => void;
  sparksBalance: number;
  isAdmin: boolean;
}

export interface SessionConfig {
  mode: 'versus' | 'chain' | 'team-remix' | 'speed-fill' | 'blind-collab';
  genre: string;
  playerNames: string[];
  timeLimit: 'rapid' | 'normal' | 'relaxed' | 'none';
  useAI: boolean;
  customPrompt?: string;
  inviteCode?: string;
}

export const EnhancedSessionSetup: React.FC<Props> = ({ 
  onStartSession, 
  onCancel, 
  sparksBalance, 
  isAdmin 
}) => {
  const [mode, setMode] = useState<SessionConfig['mode']>('versus');
  const [genre, setGenre] = useState('Comedy');
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [timeLimit, setTimeLimit] = useState<SessionConfig['timeLimit']>('normal');
  const [useAI, setUseAI] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode] = useState(`ANGRY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);

  const gameModes = [
    { id: 'versus' as const, name: 'VERSUS', desc: 'COMPETE', icon: Icons.Sword },
    { id: 'chain' as const, name: 'CHAIN', desc: 'SEQUENCE', icon: Icons.Collaborate },
    { id: 'team-remix' as const, name: 'TEAM', desc: 'COLLAB', icon: Icons.Friends },
    { id: 'speed-fill' as const, name: 'SPEED', desc: 'RACE', icon: Icons.Fire },
    { id: 'blind-collab' as const, name: 'BLIND', desc: 'MYSTERY', icon: Icons.Shield }
  ];

  const genres = ['Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Action', 'Mystery', 'Fantasy', 'Noir'];

  const timeLimits = [
    { id: 'rapid' as const, label: 'RAPID', desc: '15 SEC', color: 'red' },
    { id: 'normal' as const, label: 'NORMAL', desc: '30 SEC', color: 'cyan' },
    { id: 'relaxed' as const, label: 'RELAXED', desc: '60 SEC', color: 'green' },
    { id: 'none' as const, label: 'NO LIMIT', desc: 'UNLIMITED', color: 'gray' }
  ];

  const addPlayer = () => {
    if (currentName.trim() && playerNames.length < 8) {
      setPlayerNames([...playerNames, currentName.trim()]);
      setCurrentName('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const canStart = () => {
    const sparksCost = useAI ? 25 : 10;
    return (isAdmin || sparksBalance >= sparksCost) && playerNames.length > 0;
  };

  const handleStart = () => {
    if (!canStart()) return;
    
    onStartSession({
      mode,
      genre,
      playerNames,
      timeLimit,
      useAI,
      customPrompt: useAI ? customPrompt : undefined,
      inviteCode: showInvite ? inviteCode : undefined
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Invite code copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-tight">
            SETUP SESSION
          </h1>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Game Mode */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">GAME MODE</h3>
          <div className="grid grid-cols-5 gap-3">
            {gameModes.map(m => {
              const IconComponent = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  data-selected={mode === m.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    mode === m.id 
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <IconComponent size={24} className="text-cyan-400 mx-auto mb-2" />
                  <div className="font-black text-xs uppercase">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">STORY GENRE</h3>
          <div className="grid grid-cols-4 gap-2">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                data-selected={genre === g}
                className={`px-4 py-2 rounded-lg border-2 font-bold uppercase text-sm transition-all ${
                  genre === g
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
                    : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">TIME LIMIT</h3>
          <div className="grid grid-cols-4 gap-3">
            {timeLimits.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeLimit(t.id)}
                data-selected={timeLimit === t.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  timeLimit === t.id
                    ? `bg-${t.color}-500/10 border-${t.color}-400 text-${t.color}-400`
                    : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="font-black uppercase">{t.label}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">
            PLAYERS ({playerNames.length}/8)
          </h3>
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="ENTER PLAYER NAME..."
                className="flex-1 px-4 py-3 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none uppercase tracking-wider"
              />
              <button
                onClick={addPlayer}
                disabled={!currentName.trim() || playerNames.length >= 8}
                className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.Plus size={20} className="text-cyan-400" />
              </button>
            </div>
            
            {playerNames.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {playerNames.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                  >
                    <span className="text-sm font-bold uppercase">{name}</span>
                    <button
                      onClick={() => removePlayer(i)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">NO PLAYERS ADDED YET</p>
            )}
          </div>
        </div>

        {/* Invite Friends */}
        <div className="mb-8">
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.Friends size={24} className="text-purple-400" />
                <div className="text-left">
                  <h4 className="font-black text-purple-400 uppercase tracking-wider">INVITE FRIENDS</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">SHARE CODE FOR MULTIPLAYER</p>
                </div>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-purple-400 transition-transform ${showInvite ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </button>
          
          {showInvite && (
            <div className="mt-4 p-4 bg-black/60 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-widest">INVITE CODE</span>
                <button
                  onClick={copyInviteCode}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Icons.Export size={16} />
                </button>
              </div>
              <div className="font-mono text-2xl text-purple-400 tracking-wider">{inviteCode}</div>
              <p className="text-xs text-gray-500 mt-2">Share this code with friends to join your session</p>
            </div>
          )}
        </div>

        {/* AI Story Option */}
        <div className="mb-8">
          <label className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <Icons.Sparkle size={24} className="text-yellow-400" />
              <div>
                <h4 className="font-black text-yellow-400 uppercase tracking-wider">AI STORY</h4>
                <p className="text-xs text-gray-500 uppercase tracking-widest">CUSTOM GENERATED • 25 SPARKS</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); setUseAI(!useAI); }}
              className={`relative w-14 h-7 rounded-full transition-all ${
                useAI ? 'bg-yellow-500' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                useAI ? 'translate-x-7' : ''
              }`}/>
            </button>
          </label>
          
          {useAI && (
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="DESCRIBE YOUR STORY THEME..."
              className="w-full mt-4 px-4 py-3 bg-black/60 border border-yellow-500/30 rounded-lg text-yellow-300 placeholder-yellow-500/50 focus:border-yellow-400 focus:outline-none uppercase tracking-wider"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-black border border-gray-700 rounded-xl hover:border-gray-600 transition-all font-black uppercase tracking-wider"
          >
            CANCEL
          </button>
          <button
            onClick={handleStart}
            disabled={!canStart()}
            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-wider transition-all ${
              canStart()
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!canStart() ? 'ADD PLAYERS TO START' : `START SESSION (${useAI ? 25 : 10} SPARKS)`}
          </button>
        </div>
      </div>
    </div>
  );
};
