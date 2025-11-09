/**
 * SongForge View Component
 * Main interface for the AI music creation system
 */

import React, { useState } from 'react';
import { Music, Mic, Users, Sparkles, Play, Save, Share2, Layers } from 'lucide-react';

interface SongForgeViewProps {
  onClose?: () => void;
}

export const SongForgeView: React.FC<SongForgeViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'collaborate' | 'remix'>('create');
  const [songTitle, setSongTitle] = useState('');
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('upbeat');

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              SongForge
            </h1>
            <p className="text-xs text-gray-400">AI-Powered Music Creation</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'create'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Create
        </button>
        <button
          onClick={() => setActiveTab('collaborate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'collaborate'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Collaborate
        </button>
        <button
          onClick={() => setActiveTab('remix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'remix'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          Remix
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Song Setup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">New Song</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Enter your song title..."
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Genre</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="pop">Pop</option>
                      <option value="rock">Rock</option>
                      <option value="hip-hop">Hip-Hop</option>
                      <option value="electronic">Electronic</option>
                      <option value="country">Country</option>
                      <option value="jazz">Jazz</option>
                      <option value="classical">Classical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Mood</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="upbeat">Upbeat</option>
                      <option value="mellow">Mellow</option>
                      <option value="energetic">Energetic</option>
                      <option value="melancholic">Melancholic</option>
                      <option value="romantic">Romantic</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generation Options */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">AI Generation</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-all">
                  <Mic className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-white">Generate Lyrics</span>
                  <span className="text-xs text-gray-400">5 Sparks</span>
                </button>

                <button className="flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-all">
                  <Music className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-white">Generate Melody</span>
                  <span className="text-xs text-gray-400">5 Sparks</span>
                </button>
              </div>
            </div>

            {/* Song Structure */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Song Structure</h3>
              
              <div className="space-y-2">
                {['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Outro'].map((section, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded text-purple-400 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-white">{section}</span>
                    <button className="text-gray-400 hover:text-white">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collaborate' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Active Collaborations</h2>
              <p className="text-gray-400">Start a new collaboration session or join an existing one.</p>
              
              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
                Start New Session
              </button>
            </div>
          </div>
        )}

        {activeTab === 'remix' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Remix Feed</h2>
              <p className="text-gray-400">Discover and remix songs from the community.</p>
              
              <div className="mt-4 grid gap-4">
                {/* Placeholder for remix cards */}
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <p className="text-gray-500 text-center">No remixes available yet</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/50">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>100 Sparks Available</span>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
            <Share2 className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};
