/**
 * Advanced Mode Selector for AngryLips
 * Implements Meta's next-gen features with smart pricing
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import { useSparks } from '../sparks/SparksContext';
import { 
  ANGRY_LIPS_PRICING,
  type PricingTier,
  type GameMode,
  TONE_PROFILES,
  type StoryTone
} from '../../lib/angryLipsAdvanced';

interface AdvancedModeSelectorProps {
  onModeSelect: (mode: GameMode, tone: StoryTone, tier: PricingTier) => void;
  onClose: () => void;
}

export const AdvancedModeSelector: React.FC<AdvancedModeSelectorProps> = ({
  onModeSelect,
  onClose
}) => {
  const { balance, isAdmin } = useSparks();
  const [selectedMode, setSelectedMode] = useState<GameMode>('versus');
  const [selectedTone, setSelectedTone] = useState<StoryTone>('comedy');
  const [selectedTier, setSelectedTier] = useState<PricingTier>(ANGRY_LIPS_PRICING[1]); // Default to Enhanced
  const [showDetails, setShowDetails] = useState(false);

  const gameModes: { id: GameMode; name: string; description: string; icon: React.ReactNode }[] = [
    {
      id: 'versus',
      name: 'Versus Mode',
      description: 'Everyone fills same blanks, vote for funniest',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 4v16l-4-4m4 4l4-4m6-12v16l4-4m-4 4l-4-4"/>
        </svg>
      )
    },
    {
      id: 'chain',
      name: 'Chain Mode',
      description: 'Fill one blank each, no one sees story until end',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
      )
    },
    {
      id: 'team-remix',
      name: 'Team Remix',
      description: 'One creates blanks, another fills them',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      )
    },
    {
      id: 'speed-fill',
      name: 'Speed Fill',
      description: 'Race to complete all blanks first',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    },
    {
      id: 'blind-collab',
      name: 'Blind Collab',
      description: 'Fill blanks without knowing the story theme',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      )
    }
  ];

  const tones: { id: StoryTone; name: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'comedy', 
      name: 'Comedy', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ), 
      description: 'Fast-paced laughs' 
    },
    { 
      id: 'horror', 
      name: 'Horror', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 2L2 8l2 2 7-8M15 2l7 6-2 2-7-8"/>
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5-2 4-2 4 2 4 2"/>
        </svg>
      ), 
      description: 'Slow atmospheric dread' 
    },
    { 
      id: 'romance', 
      name: 'Romance', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      ), 
      description: 'Tender and passionate' 
    },
    { 
      id: 'sci-fi', 
      name: 'Sci-Fi', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ), 
      description: 'Futuristic wonder' 
    },
    { 
      id: 'noir', 
      name: 'Noir', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l-6 6v3h3l6-6m2-2l2.5-2.5a1.8 1.8 0 00-2.5-2.5L11 9m-2 2l-2 2"/>
          <path d="M22 12c0 5.5-4.5 10-10 10V12"/>
        </svg>
      ), 
      description: 'Dark and cynical' 
    },
    { 
      id: 'action', 
      name: 'Action', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"/>
          <line x1="17" y1="8" x2="12" y2="3"/>
          <line x1="21" y1="12" x2="16" y2="7"/>
        </svg>
      ), 
      description: 'Explosive intensity' 
    },
    { 
      id: 'mystery', 
      name: 'Mystery', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      ), 
      description: 'Puzzling intrigue' 
    }
  ];

  const canAfford = (tier: PricingTier) => {
    return isAdmin || balance >= tier.sparksCost;
  };

  const handleStart = () => {
    if (!canAfford(selectedTier)) {
      alert(`You need ${selectedTier.sparksCost} Sparks for this mode. Current balance: ${balance}`);
      return;
    }
    onModeSelect(selectedMode, selectedTone, selectedTier);
  };

  const estimatedCostPerHour = (tier: PricingTier): string => {
    const sessionsPerHour = Math.floor(60 / 15); // Assume 15 min sessions
    const costPerHour = tier.sparksCost * sessionsPerHour;
    return `~${costPerHour} Sparks/hour`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 via-black to-gray-900/95 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tight">
              ANGRYLIPS
            </h2>
            <p className="text-cyan-500/60 text-sm tracking-widest uppercase">AI-Powered • Dynamic • Next-Gen</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-8 overflow-visible">
          <h3 className="text-xl font-semibold text-white mb-4">Choose Your Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-2 overflow-visible">
            {ANGRY_LIPS_PRICING.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                disabled={!canAfford(tier)}
                data-selected={selectedTier.id === tier.id}
                className={`relative p-6 rounded-lg border transition-all transform hover:scale-[1.02] ${
                  selectedTier.id === tier.id
                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] selected'
                    : canAfford(tier)
                    ? 'bg-black/40 border-gray-700 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'bg-black/20 border-gray-800 opacity-40 cursor-not-allowed'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-cyan-500 text-black text-xs font-black rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] z-20 tracking-wider whitespace-nowrap">
                    RECOMMENDED
                  </div>
                )}
                <div className="text-left">
                  <h4 className="font-bold text-white mb-2 text-lg">{tier.name}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl font-black text-cyan-400">{tier.sparksCost}</span>
                    <span className="text-gray-500 text-sm uppercase tracking-wider">Sparks</span>
                  </div>
                  <div className="text-xs text-white/50 mb-2">
                    {estimatedCostPerHour(tier)}
                  </div>
                  <ul className="space-y-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="text-xs text-white/70 flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Modes */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Game Mode</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {gameModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                disabled={false} // All modes now available for all tiers
                data-selected={selectedMode === mode.id}
                className={`p-4 rounded-lg border transition-all transform hover:scale-[1.02] ${
                  selectedMode === mode.id
                    ? 'bg-gradient-to-b from-blue-500/10 to-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] selected'
                    : 'bg-black/30 border-gray-700 hover:border-blue-500/50 hover:bg-black/50'
                }`}
              >
                <div className="text-3xl mb-2">{mode.icon}</div>
                <div className="text-sm font-semibold text-white mb-1">{mode.name}</div>
                <div className="text-xs text-white/60">{mode.description}</div>
                {selectedTier.id === 'basic' && (
                  <div className="text-xs text-green-400 mt-1 font-semibold">✨ FREE</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Story Tones */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Story Tone</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {tones.map(tone => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                data-selected={selectedTone === tone.id}
                className={`p-3 rounded-lg border transition-all transform hover:scale-[1.02] ${
                  selectedTone === tone.id
                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] selected'
                    : 'bg-black/30 border-gray-700 hover:border-cyan-500/50 hover:bg-black/50'
                }`}
              >
                <div className="mb-1 flex justify-center">{tone.icon}</div>
                <div className="text-xs font-semibold text-white">{tone.name}</div>
                <div className="text-xs text-white/50">{tone.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <span className="text-sm font-black uppercase tracking-wider">Advanced Features</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          
          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/30 rounded-xl">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 mt-1">
                    <path d="M12 2a10 10 0 100 20 10 10 0 100-20z"/>
                    <path d="M12 6v6l4 2"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Dynamic Templates</h4>
                    <p className="text-white/60 text-xs">Stories adapt based on your word choices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400 mt-1">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Semantic Intelligence</h4>
                    <p className="text-white/60 text-xs">AI understands meaning for better humor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 mt-1">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Adaptive Humor</h4>
                    <p className="text-white/60 text-xs">Learns what makes you laugh</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-1">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Episodic Universe</h4>
                    <p className="text-white/60 text-xs">Your stories become canon</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 mt-1">
                    <path d="M12 2v7l4-4"/>
                    <path d="M12 2v7l-4-4"/>
                    <circle cx="12" cy="14" r="8"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Voice Acting</h4>
                    <p className="text-white/60 text-xs">AI narrates your completed stories</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400 mt-1">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                    <line x1="7" y1="2" x2="7" y2="22"/>
                    <line x1="17" y1="2" x2="17" y2="22"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <line x1="2" y1="7" x2="7" y2="7"/>
                    <line x1="2" y1="17" x2="7" y2="17"/>
                    <line x1="17" y1="17" x2="22" y2="17"/>
                    <line x1="17" y1="7" x2="22" y2="7"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Animated Output</h4>
                    <p className="text-white/60 text-xs">Stories come to life visually</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400 mt-1">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Social Sharing</h4>
                    <p className="text-white/60 text-xs">TikTok-ready video clips</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 mt-1">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8"/>
                    <path d="M12 8v8"/>
                  </svg>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Accessibility</h4>
                    <p className="text-white/60 text-xs">Family mode, language assist, more time</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Start */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-left">
              <h4 className="text-white font-black uppercase tracking-wider text-sm mb-2">Your Selection</h4>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-black/50 border border-cyan-500/50 rounded-sm text-cyan-400 font-bold">
                  {selectedTier.name}
                </span>
                <span className="px-3 py-1 bg-black/50 border border-blue-500/50 rounded-sm text-blue-400 font-bold">
                  {gameModes.find(m => m.id === selectedMode)?.name}
                </span>
                <span className="px-3 py-1 bg-black/50 border border-gray-500/50 rounded-sm text-gray-300 font-bold">
                  {tones.find(t => t.id === selectedTone)?.name}
                </span>
              </div>
              <div className="mt-2 text-gray-500 text-sm">
                COST: <span className="text-cyan-400 font-black text-base">{selectedTier.sparksCost}</span> <span className="text-gray-600 uppercase">Sparks</span>
                {isAdmin && <span className="ml-2 text-green-400">(Admin - Free)</span>}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-black border border-gray-700 rounded-lg transition-all text-gray-400 hover:border-gray-600 hover:text-white font-bold uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                disabled={!canAfford(selectedTier)}
                className={`px-8 py-3 rounded-lg font-black uppercase tracking-wider text-sm transition-all transform hover:scale-[1.02] ${
                  canAfford(selectedTier)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canAfford(selectedTier) ? 'LAUNCH' : `NEED ${selectedTier.sparksCost} SPARKS`}
              </button>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-6 p-4 bg-black/50 border border-cyan-500/20 rounded-lg">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest">
            <span className="text-cyan-400 font-black">NEXT-GEN AI</span> • 
            <span className="text-gray-500"> DYNAMIC STORIES</span> • 
            <span className="text-cyan-400 font-black">REAL-TIME ADAPTATION</span> • 
            <span className="text-gray-500"> PERSONALIZED HUMOR</span>
          </p>
        </div>
      </div>
    </div>
  );
};
