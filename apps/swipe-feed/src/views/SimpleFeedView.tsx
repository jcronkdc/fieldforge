/**
 * Simple Feed View - Functional feed with proper navigation
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { PostCard } from '../components/feed/PostCard';
import { getPublicFeedPosts, type Post } from '../data/welcomePost';
import type { FocusedView } from '../components/AuthenticatedAppV2';

interface SimpleFeedViewProps {
  profile: any;
  onNavigate?: (view: FocusedView) => void;
  embedded?: boolean;
}

export const SimpleFeedView: React.FC<SimpleFeedViewProps> = ({ profile, onNavigate, embedded = false }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'angry-lips' | 'stories' | 'creators'>('all');

  // Mock community posts
  const mockPosts = [
    {
      id: 'post-2',
      author: 'Alex Writer',
      avatar: 'A',
      timestamp: '2 hours ago',
      content: 'Just finished an amazing Angry Lips session! The AI co-host feature is incredible 🎭',
      likes: 23,
      comments: 5,
      shares: 2,
      type: 'angry-lips' as const,
      actionUrl: 'angry-lips',
      actionText: 'Join Session',
    },
    {
      id: 'post-3',
      author: 'Sam Poet',
      avatar: 'S',
      timestamp: '5 hours ago',
      content: 'New branch on "The Quantum Heist" - took the story in a completely different direction!',
      likes: 45,
      comments: 12,
      shares: 8,
      type: 'stories' as const,
      actionUrl: 'stories',
      actionText: 'View Story',
    },
    {
      id: 'post-4',
      author: 'Jordan Tales',
      avatar: 'J',
      timestamp: '1 day ago',
      content: 'Looking for collaborators on my new mystery series. Who wants to join?',
      likes: 67,
      comments: 23,
      shares: 15,
      type: 'creators' as const,
      actionUrl: 'creators',
      actionText: 'Connect',
    },
  ];

  useEffect(() => {
    // Load posts
    setTimeout(() => {
      const welcomePosts = getPublicFeedPosts();
      setPosts(welcomePosts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredPosts = filter === 'all' 
    ? mockPosts 
    : mockPosts.filter(post => post.type === filter);

  const searchedPosts = searchQuery
    ? filteredPosts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPosts;

  if (embedded) {
    // Simplified view for embedding in dashboard
    return (
      <div className="space-y-4">
        {filteredPosts.slice(0, 5).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onComment={() => {}}
            onShare={() => {}}
            onClick={() => onNavigate?.(post.actionUrl as FocusedView)}
          />
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No posts to show yet</p>
            <p className="text-sm mt-2">Start creating content to see it here!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-light bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Community Feed
            </h1>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
              title="Back to Dashboard"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-purple-500/50 focus:outline-none transition-all"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'angry-lips', 'stories', 'creators'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === tab
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                {tab === 'all' ? 'All' :
                 tab === 'angry-lips' ? '🎭 Angry Lips' :
                 tab === 'stories' ? '📚 Stories' :
                 '👥 Creators'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Post */}
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => console.log('Liked')}
                onComment={() => console.log('Comment')}
                onShare={() => console.log('Share')}
              />
            ))}

            {/* Community Posts */}
            {searchedPosts.length > 0 && (
              <>
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Community Posts</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
                </div>

                {searchedPosts.map(post => (
                  <div key={post.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{post.author}</h3>
                          <span className="text-xs text-white/40">{post.timestamp}</span>
                        </div>
                        <p className="text-white/80 mb-4">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-sm text-white/60 hover:text-purple-400 transition-colors">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                              </svg>
                              {post.likes}
                            </button>
                            <button className="flex items-center gap-2 text-sm text-white/60 hover:text-blue-400 transition-colors">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                              </svg>
                              {post.comments}
                            </button>
                            <button className="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-colors">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                              </svg>
                              {post.shares}
                            </button>
                          </div>
                          {post.actionUrl && (
                            <button
                              onClick={() => onNavigate(post.actionUrl as FocusedView)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all text-sm"
                            >
                              {post.actionText || 'View'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {searchedPosts.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-white/50">No posts found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
