/**
 * Story Branches View - Interactive story creation
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface StoryBranchesViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const StoryBranchesView: React.FC<StoryBranchesViewProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'my-stories' | 'explore' | 'create'>('explore');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Story Branches</h1>
              <p className="text-sm text-white/60">Create and explore interactive narratives</p>
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

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['explore', 'my-stories', 'create'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-b from-purple-500/20 to-transparent text-purple-400 border-b-2 border-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'my-stories' ? 'My Stories' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl mb-4"></div>
                <h3 className="text-lg font-light mb-2">Story Title {i}</h3>
                <p className="text-sm text-white/60 mb-4">An epic adventure awaits...</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">5 branches</span>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all">
                    Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-stories' && (
          <div className="text-center py-12">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3 className="text-xl font-light text-white/60 mb-2">No stories yet</h3>
            <p className="text-sm text-white/40 mb-6">Start creating your first story branch</p>
            <button
              onClick={() => setActiveTab('create')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all"
            >
              Create Story
            </button>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-light mb-6">Create New Story</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Enter your story title"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Genre</label>
                  <select className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                    <option value="">Select a genre</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="scifi">Science Fiction</option>
                    <option value="mystery">Mystery</option>
                    <option value="romance">Romance</option>
                    <option value="horror">Horror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Opening Scene</label>
                  <textarea
                    placeholder="Write your opening scene..."
                    rows={6}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="ai-assist" className="rounded" />
                  <label htmlFor="ai-assist" className="text-sm text-white/60">
                    Use AI assistance (costs 10 Sparks)
                  </label>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all">
                  Create Story Branch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
