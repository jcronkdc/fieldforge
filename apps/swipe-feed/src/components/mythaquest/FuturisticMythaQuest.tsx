/**
 * FUTURISTIC MYTHAQUEST - Cyber RPG Interface
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  xp: number;
  nextLevel: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  progress: number;
  total: number;
}

interface Props {
  onNavigate: (view: FocusedView) => void;
}

export const FuturisticMythaQuest: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'character' | 'world' | 'quests' | 'combat'>('character');
  const [character] = useState<Character>({
    id: '1',
    name: 'CYBER_KNIGHT',
    class: 'Technomancer',
    level: 15,
    hp: 85,
    maxHp: 100,
    mp: 45,
    maxMp: 50,
    xp: 3250,
    nextLevel: 4000
  });

  const [quests] = useState<Quest[]>([
    {
      id: '1',
      title: 'THE NEON CITADEL',
      description: 'Infiltrate the corporate fortress',
      reward: '500 XP + Plasma Blade',
      difficulty: 'Hard',
      progress: 2,
      total: 5
    },
    {
      id: '2',
      title: 'DATA HEIST',
      description: 'Steal encrypted files from the mainframe',
      reward: '300 XP + 1000 Credits',
      difficulty: 'Medium',
      progress: 0,
      total: 3
    }
  ]);

  const tabs = [
    { id: 'character', label: 'CHARACTER', icon: '⚔️' },
    { id: 'world', label: 'WORLD', icon: '🌍' },
    { id: 'quests', label: 'QUESTS', icon: '📜' },
    { id: 'combat', label: 'COMBAT', icon: '⚡' }
  ];

  const stats = [
    { name: 'STR', value: 18, max: 20, color: 'red' },
    { name: 'DEX', value: 14, max: 20, color: 'green' },
    { name: 'INT', value: 16, max: 20, color: 'blue' },
    { name: 'WIS', value: 12, max: 20, color: 'purple' },
    { name: 'CHA', value: 10, max: 20, color: 'pink' },
    { name: 'LUCK', value: 15, max: 20, color: 'yellow' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-500/30';
      case 'Medium': return 'text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'text-orange-400 border-orange-500/30';
      case 'Legendary': return 'text-red-400 border-red-500/30';
      default: return 'text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                MYTHAQUEST
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-bold uppercase">
                  ONLINE
                </span>
                <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-400">
                  REALM: NEXUS-7
                </span>
              </div>
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

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-purple-500/50 hover:text-purple-400'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'character' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Character Card */}
            <div className="lg:col-span-1">
              <div className="bg-black/60 border border-purple-500/20 rounded-lg p-6 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] transition-all">
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(147,51,234,0.4)]">
                    🤖
                  </div>
                  <h2 className="text-2xl font-black text-purple-400 uppercase tracking-wider">{character.name}</h2>
                  <p className="text-sm text-gray-500 uppercase tracking-widest">LVL {character.level} {character.class}</p>
                </div>

                {/* HP/MP Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-400 font-bold">HP</span>
                      <span className="text-gray-500">{character.hp}/{character.maxHp}</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                        style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400 font-bold">MP</span>
                      <span className="text-gray-500">{character.mp}/{character.maxMp}</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                        style={{ width: `${(character.mp / character.maxMp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-yellow-400 font-bold">XP</span>
                      <span className="text-gray-500">{character.xp}/{character.nextLevel}</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                        style={{ width: `${(character.xp / character.nextLevel) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-2">
              <div className="bg-black/60 border border-purple-500/20 rounded-lg p-6">
                <h3 className="text-lg font-black text-purple-400 uppercase tracking-wider mb-4">ATTRIBUTES</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.map(stat => (
                    <div key={stat.name} className="bg-black/40 border border-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-400">{stat.name}</span>
                        <span className="text-xl font-black text-cyan-400">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all`}
                          style={{ width: `${(stat.value / stat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Equipment */}
                <h3 className="text-lg font-black text-purple-400 uppercase tracking-wider mt-6 mb-4">EQUIPMENT</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-400 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚔️</span>
                      <div>
                        <p className="text-sm font-bold text-cyan-400">PLASMA KATANA</p>
                        <p className="text-xs text-gray-500">+15 ATK</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-400 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🛡️</span>
                      <div>
                        <p className="text-sm font-bold text-cyan-400">NANO SHIELD</p>
                        <p className="text-xs text-gray-500">+10 DEF</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-400 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👕</span>
                      <div>
                        <p className="text-sm font-bold text-cyan-400">CYBER ARMOR</p>
                        <p className="text-xs text-gray-500">+20 HP</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-400 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💍</span>
                      <div>
                        <p className="text-sm font-bold text-cyan-400">HOLO RING</p>
                        <p className="text-xs text-gray-500">+5 LUCK</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'world' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/60 border border-purple-500/20 rounded-lg p-8 text-center">
              <div className="text-8xl mb-4">🌍</div>
              <h2 className="text-3xl font-black text-purple-400 mb-4">NEXUS-7 REALM</h2>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                A cyberpunk metropolis where magic and technology collide. Explore neon-lit streets, 
                corporate towers, and underground hacker dens.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                <button className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold uppercase tracking-wider text-xs hover:from-cyan-500/20 hover:to-blue-500/20 transition-all">
                  EXPLORE
                </button>
                <button className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg text-purple-400 font-bold uppercase tracking-wider text-xs hover:from-purple-500/20 hover:to-pink-500/20 transition-all">
                  MAP
                </button>
                <button className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-green-400 font-bold uppercase tracking-wider text-xs hover:from-green-500/20 hover:to-emerald-500/20 transition-all">
                  TRAVEL
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {quests.map(quest => (
              <div key={quest.id} className="bg-black/60 border border-purple-500/20 rounded-lg p-6 hover:border-purple-400 transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-purple-400 uppercase tracking-wider mb-1">{quest.title}</h3>
                    <p className="text-sm text-gray-400">{quest.description}</p>
                  </div>
                  <span className={`px-3 py-1 border rounded text-xs font-bold uppercase ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">PROGRESS</span>
                    <span className="text-gray-500">{quest.progress}/{quest.total}</span>
                  </div>
                  <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    <span className="text-yellow-400">REWARD:</span> {quest.reward}
                  </p>
                  <button className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-bold uppercase tracking-wider hover:bg-purple-500/20 transition-all">
                    CONTINUE →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'combat' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/60 border border-red-500/20 rounded-lg p-8 text-center">
              <div className="text-8xl mb-4">⚔️</div>
              <h2 className="text-3xl font-black text-red-400 mb-4">COMBAT ARENA</h2>
              <p className="text-gray-400 mb-6">Enter the digital battleground and test your skills</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button className="px-6 py-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold uppercase tracking-wider hover:from-red-500/20 hover:to-orange-500/20 transition-all">
                  PVE BATTLE
                </button>
                <button className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg text-purple-400 font-bold uppercase tracking-wider hover:from-purple-500/20 hover:to-pink-500/20 transition-all">
                  PVP DUEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticMythaQuest;
