/**
 * StoryForge - Create, branch, and evolve collaborative stories
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface StoryBranch {
  id: string;
  parentId?: string;
  title: string;
  author: string;
  content: string;
  createdAt: Date;
  likes: number;
  views: number;
  branchCount: number;
}

interface Story {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  genre: string;
  description: string;
  coverImage?: string;
  followers: number;
  branches: number;
  versions: number;
  lastUpdated: Date;
  isFollowing: boolean;
  mainBranch: StoryBranch;
  allBranches: StoryBranch[];
}

interface EnhancedStoryBranchesViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const EnhancedStoryBranchesView: React.FC<EnhancedStoryBranchesViewProps> = ({ 
  profile, 
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'following' | 'my-stories' | 'create'>('explore');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'timeline'>('tree');
  const [selectedBranch, setSelectedBranch] = useState<StoryBranch | null>(null);

  // Real stories will be loaded from backend
  const realStories: Story[] = [];

  const [stories, setStories] = useState(realStories);
  const followedStories = stories.filter(s => s.isFollowing);

  const handleFollowToggle = (storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, isFollowing: !story.isFollowing, followers: story.isFollowing ? story.followers - 1 : story.followers + 1 }
        : story
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">StoryForge</h1>
              <p className="text-sm text-white/60">Create, branch, and evolve collaborative stories</p>
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
            {(['explore', 'following', 'my-stories', 'create'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-b from-purple-500/20 to-transparent text-purple-400 border-b-2 border-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'following' ? `Following (${followedStories.length})` : 
                 tab === 'my-stories' ? 'My Stories' : 
                 tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all">
                {/* Story Cover */}
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleFollowToggle(story.id)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        story.isFollowing
                          ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {story.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur rounded text-xs">
                      {story.genre}
                    </span>
                  </div>
                </div>

                {/* Story Info */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-1">{story.title}</h3>
                  <p className="text-sm text-white/60 mb-3">{story.description}</p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs">
                        {story.authorAvatar}
                      </div>
                      <span className="text-xs text-white/60">{story.author}</span>
                    </div>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/40">{formatTime(story.lastUpdated)}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 text-xs text-white/60">
                      <span>{story.followers} followers</span>
                      <span>{story.branches} forges</span>
                      <span>v{story.versions}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStory(story)}
                    className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all text-sm"
                  >
                    View Forges
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'following' && (
          <div>
            {followedStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedStories.map(story => (
                  <div key={story.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-medium mb-2">{story.title}</h3>
                    <p className="text-sm text-white/60 mb-4">{story.description}</p>
                    
                    {/* Recent Activity */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-white/40">Recent activity:</div>
                      {story.allBranches.slice(0, 2).map(branch => (
                        <div key={branch.id} className="p-2 bg-white/5 rounded-lg">
                          <p className="text-xs text-white/80">{branch.title}</p>
                          <p className="text-xs text-white/40">by {branch.author}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedStory(story)}
                      className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all text-sm"
                    >
                      Continue Reading
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <h3 className="text-xl font-light text-white/60 mb-2">No stories followed yet</h3>
                <p className="text-sm text-white/40 mb-6">Follow stories to track updates and new branches</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all"
                >
                  Explore Stories
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-stories' && (
          <div className="text-center py-12">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
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
                  <input type="checkbox" id="branching" className="rounded" defaultChecked />
                  <label htmlFor="branching" className="text-sm text-white/60">
                    Allow others to create branches
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="ai-assist" className="rounded" />
                  <label htmlFor="ai-assist" className="text-sm text-white/60">
                    Use AI assistance (costs 10 Sparks)
                  </label>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all">
                  Create Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Story Branch Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-light">{selectedStory.title}</h2>
                  <p className="text-sm text-white/60">by {selectedStory.author}</p>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* View Mode Selector */}
              <div className="flex gap-2">
                {(['tree', 'list', 'timeline'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === mode
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {mode === 'tree' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                        <path d="M12 2v6m0 4v6m-4-10h8"/>
                      </svg>
                    )}
                    {mode === 'list' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/>
                        <line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                    )}
                    {mode === 'timeline' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      </svg>
                    )}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} View
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {viewMode === 'tree' && (
                <div className="space-y-4">
                  {/* Main Branch */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{selectedStory.mainBranch.title}</h3>
                      <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400">Main</span>
                    </div>
                    <p className="text-sm text-white/70 mb-3">{selectedStory.mainBranch.content.substring(0, 150)}...</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{selectedStory.mainBranch.views} views</span>
                      <span>{selectedStory.mainBranch.likes} likes</span>
                      <span>{selectedStory.mainBranch.branchCount} branches</span>
                    </div>
                  </div>

                  {/* Sub-branches */}
                  <div className="ml-8 space-y-4">
                    {selectedStory.allBranches.map(branch => (
                      <div key={branch.id} className="relative">
                        {/* Connection Line */}
                        <div className="absolute -left-6 top-0 bottom-0 w-px bg-white/20"></div>
                        <div className="absolute -left-6 top-6 w-6 h-px bg-white/20"></div>
                        
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{branch.title}</h3>
                            <span className="text-xs text-white/40">{formatTime(branch.createdAt)}</span>
                          </div>
                          <p className="text-sm text-white/70 mb-3">{branch.content.substring(0, 150)}...</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/50">by {branch.author}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-white/50">
                              <span>{branch.views} views</span>
                              <span>{branch.likes} likes</span>
                              {branch.branchCount > 0 && (
                                <span>{branch.branchCount} sub-branches</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create New Branch Button */}
                  <div className="ml-8">
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all border-dashed">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Create New Branch
                    </button>
                  </div>
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-3">
                  {[selectedStory.mainBranch, ...selectedStory.allBranches].map((branch, index) => (
                    <div key={branch.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{branch.title}</h3>
                            {index === 0 && (
                              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400">Main</span>
                            )}
                          </div>
                          <p className="text-sm text-white/70 mb-2">{branch.content.substring(0, 200)}...</p>
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span>by {branch.author}</span>
                            <span>{formatTime(branch.createdAt)}</span>
                            <span>{branch.views} views</span>
                            <span>{branch.likes} likes</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all text-sm">
                          Read
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'timeline' && (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-white/20"></div>
                  
                  <div className="space-y-8">
                    {[selectedStory.mainBranch, ...selectedStory.allBranches]
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((branch, index) => (
                      <div key={branch.id} className="relative flex gap-4">
                        {/* Timeline Dot */}
                        <div className="absolute left-6 w-4 h-4 bg-purple-500 rounded-full border-2 border-black"></div>
                        
                        {/* Content */}
                        <div className="ml-16 flex-1">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{branch.title}</h3>
                              <span className="text-xs text-white/40">{formatTime(branch.createdAt)}</span>
                            </div>
                            <p className="text-sm text-white/70 mb-2">{branch.content.substring(0, 150)}...</p>
                            <div className="flex items-center gap-4 text-xs text-white/50">
                              <span>by {branch.author}</span>
                              <span>{branch.views} views</span>
                              <span>{branch.likes} likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
