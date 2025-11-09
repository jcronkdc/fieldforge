/**
 * FUTURISTIC FEED VIEW - Cyber Timeline
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../components/AuthenticatedAppV2';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  type: 'text' | 'image' | 'video' | 'achievement';
  actionUrl?: FocusedView;
  image?: string;
}

interface FuturisticFeedViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
  embedded?: boolean;
}

export const FuturisticFeedView: React.FC<FuturisticFeedViewProps> = ({ profile, onNavigate, embedded }) => {
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: 'AlphaUser',
      avatar: '🚀',
      content: 'Just launched an epic session in Angry Lips! The AI generated the most hilarious story about space pirates.',
      timestamp: '2m',
      likes: 42,
      comments: 5,
      shares: 2,
      type: 'text',
      actionUrl: 'angry-lips'
    },
    {
      id: '2',
      author: 'StoryMaster',
      avatar: '📝',
      content: 'New chapter in my cyberpunk saga is live! Check it out in StoryForge.',
      timestamp: '15m',
      likes: 128,
      comments: 23,
      shares: 8,
      type: 'text',
      actionUrl: 'stories'
    },
    {
      id: '3',
      author: 'BeatMaker',
      avatar: '🎵',
      content: 'Just dropped a new track in SongForge. Synthwave meets AI composition!',
      timestamp: '1h',
      likes: 256,
      comments: 47,
      shares: 15,
      type: 'text',
      actionUrl: 'songforge'
    }
  ]);

  const filters = [
    { id: 'all', label: 'ALL POSTS', icon: '🌐' },
    { id: 'following', label: 'FOLLOWING', icon: '👥' },
    { id: 'trending', label: 'TRENDING', icon: '🔥' }
  ];

  if (embedded) {
    return (
      <div className="space-y-4">
        {posts.slice(0, 3).map((post) => (
          <div key={post.id} className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{post.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-cyan-400">{post.author}</span>
                  <span className="text-xs text-gray-600 uppercase">{post.timestamp}</span>
                </div>
                <p className="text-gray-300 text-sm">{post.content}</p>
                <div className="flex gap-4 mt-3">
                  <span className="text-xs text-gray-500">❤️ {post.likes}</span>
                  <span className="text-xs text-gray-500">💬 {post.comments}</span>
                  <span className="text-xs text-gray-500">🔄 {post.shares}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
              COMMUNITY FEED
            </h1>
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

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  filter === f.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                <span className="mr-2">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Create Post */}
        <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 mb-6 hover:border-cyan-400 transition-all">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black">
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <input
              type="text"
              placeholder="SHARE YOUR CREATION..."
              className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none uppercase tracking-wider text-sm"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
              POST
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-black/60 border border-cyan-500/20 rounded-lg hover:border-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] group">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-cyan-400 uppercase tracking-wider">{post.author}</h3>
                      <span className="text-xs text-gray-600 uppercase tracking-widest">{post.timestamp} AGO</span>
                    </div>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-6">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                    <span className="text-sm font-bold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    <span className="text-sm font-bold">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 1l4 4-4 4M3 11v-1a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v1a4 4 0 01-4 4H3"/>
                    </svg>
                    <span className="text-sm font-bold">{post.shares}</span>
                  </button>
                </div>
                {post.actionUrl && (
                  <button
                    onClick={() => onNavigate(post.actionUrl!)}
                    className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all"
                  >
                    EXPLORE →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer hover:scale-110 transition-transform">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </div>
  );
};

export default FuturisticFeedView;