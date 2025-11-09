/**
 * Angry Lips Stories View - Browse and search saved Mad Libs stories
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface SavedStory {
  id: string;
  sessionId: string;
  title: string;
  genre: string;
  completedStory: string;
  htmlStory: string;
  savedAt: string;
  participants: string[];
  host: string;
  playerPerspective: string;
  searchTags: string[];
  conversions?: {
    format: { name: string; icon: string };
    story: string;
  }[];
  score?: number;
  maxStreak?: number;
}

interface AngryLipsStoriesViewProps {
  onNavigate: (view: FocusedView) => void;
}

export const AngryLipsStoriesView: React.FC<AngryLipsStoriesViewProps> = ({ onNavigate }) => {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<SavedStory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'participant' | 'date'>('all');
  const currentUser = localStorage.getItem('mythatron_user_id') || 'You';

  useEffect(() => {
    // Load stories for current user
    const userKey = `angry_lips_saved_stories_${currentUser.toLowerCase().replace(/\s+/g, '_')}`;
    const userStories = JSON.parse(localStorage.getItem(userKey) || '[]');
    
    // Also check the old format for backward compatibility
    const oldStories = JSON.parse(localStorage.getItem('angry_lips_saved_stories') || '[]');
    
    // Combine and deduplicate
    const allStories = [...userStories];
    oldStories.forEach((story: any) => {
      if (!allStories.find(s => s.id === story.id)) {
        // Convert old format to new format
        allStories.push({
          ...story,
          participants: story.players || [story.host],
          htmlStory: story.content || story.completedStory,
          playerPerspective: currentUser,
          searchTags: [
            story.title?.toLowerCase() || '',
            story.genre?.toLowerCase() || '',
            ...(story.players || []).map((p: string) => p.toLowerCase()),
            'angry_lips'
          ].filter(Boolean)
        });
      }
    });
    
    setStories(allStories);
    setFilteredStories(allStories);
  }, [currentUser]);

  useEffect(() => {
    let filtered = [...stories];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(query) ||
        story.genre.toLowerCase().includes(query) ||
        story.participants.some(p => p.toLowerCase().includes(query)) ||
        story.searchTags.some(tag => tag.includes(query)) ||
        story.completedStory.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filterBy === 'participant') {
      // Group by participants
      filtered.sort((a, b) => a.participants.join(',').localeCompare(b.participants.join(',')));
    } else if (filterBy === 'date') {
      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
    
    setFilteredStories(filtered);
  }, [searchQuery, filterBy, stories]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const deleteStory = (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    const updatedStories = stories.filter(s => s.id !== storyId);
    setStories(updatedStories);
    
    // Update localStorage
    const userKey = `angry_lips_saved_stories_${currentUser.toLowerCase().replace(/\s+/g, '_')}`;
    localStorage.setItem(userKey, JSON.stringify(updatedStories));
    
    if (selectedStory?.id === storyId) {
      setSelectedStory(null);
    }
  };

  const handleConvertStory = (story: SavedStory, format: string) => {
    // This is a placeholder for the actual conversion logic.
    // In a real app, you would call a converter service here.
    alert(`Converting story "${story.title}" to ${format}... (This is a placeholder)`);
    // Example: Simulate a conversion result
    const newConversions = [...(story.conversions || [])];
    newConversions.push({
      format: { name: format, icon: '📄' }, // Placeholder icon
      story: `Converted story for ${format} format. This is a placeholder.`
    });
    setStories(stories.map(s => s.id === story.id ? { ...s, conversions: newConversions } : s));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Angry Lips Stories</h1>
              <p className="text-sm text-white/60">
                {stories.length} saved {stories.length === 1 ? 'story' : 'stories'}
              </p>
            </div>
            
            <button
              onClick={() => onNavigate('angrylips')}
              className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all"
            >
              New Session
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search stories, participants, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Stories</option>
              <option value="date">By Date</option>
              <option value="participant">By Participants</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-8 bg-white/5 rounded-3xl">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <p className="text-white/40">
                {searchQuery ? 'No stories match your search' : 'No saved stories yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => onNavigate('angrylips')}
                  className="mt-4 px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all text-sm"
                >
                  Start Your First Session
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Story List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredStories.map(story => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`p-6 bg-white/5 hover:bg-white/10 border rounded-2xl transition-all cursor-pointer ${
                    selectedStory?.id === story.id 
                      ? 'border-purple-500/50 bg-purple-500/10' 
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-light text-white">{story.title}</h3>
                      <p className="text-sm text-white/60">{story.genre} • {formatDate(story.savedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStory(story.id);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 group-hover:text-red-400">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-white/40">Participants:</span>
                    <div className="flex flex-wrap gap-1">
                      {story.participants.map((participant, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs"
                        >
                          {participant}
                          {participant === story.host && ' 👑'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Story Preview */}
                  <p className="text-sm text-white/60 line-clamp-2">
                    {story.completedStory.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Story Detail */}
            {selectedStory && (
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-light mb-2">{selectedStory.title}</h3>
                  <p className="text-sm text-white/60 mb-4">
                    {selectedStory.genre} • {new Date(selectedStory.savedAt).toLocaleString()}
                  </p>

                  {/* Participants */}
                  <div className="mb-4">
                    <p className="text-sm text-white/40 mb-2">Played with:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStory.participants.map((participant, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                            {participant[0].toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {participant}
                            {participant === selectedStory.host && ' (Host)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gamification Stats */}
                  {(selectedStory.score || selectedStory.maxStreak) && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex justify-between items-center">
                        {selectedStory.score && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span className="text-yellow-400 font-bold">{selectedStory.score.toLocaleString()} pts</span>
                          </div>
                        )}
                        {selectedStory.maxStreak && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🔥</span>
                            <span className="text-orange-400 font-bold">{selectedStory.maxStreak}x streak</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Story Conversions */}
                  {selectedStory.conversions && selectedStory.conversions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-white/40 mb-2">Converted Versions:</p>
                      <div className="space-y-2">
                        {selectedStory.conversions.map((conversion, idx) => (
                          <details key={idx} className="group">
                            <summary className="cursor-pointer p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-2">
                              <span className="text-xl">{conversion.format.icon}</span>
                              <span className="text-sm font-medium">{conversion.format.name}</span>
                            </summary>
                            <div className="mt-2 p-4 bg-black/30 rounded-xl max-h-64 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-sm text-white/80 font-mono">
                                {conversion.story}
                              </pre>
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Story */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-white/40 mb-2">Complete Story:</p>
                    <div 
                      className="text-sm text-white/80 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedStory.htmlStory }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all text-sm">
                      Share
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStory.completedStory);
                        alert('Story copied to clipboard!');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all text-sm"
                    >
                      Copy
                    </button>
                  </div>

                  {/* Convert Options */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['Screenplay', 'Song', 'Poem', 'Short Story', 'Zombify', 'Shakespeare'].map(format => (
                      <button
                        key={format}
                        onClick={() => handleConvertStory(selectedStory, format)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white font-semibold shadow-xl hover:from-purple-700 hover:to-pink-600 transition-all"
                      >
                        Convert to {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
