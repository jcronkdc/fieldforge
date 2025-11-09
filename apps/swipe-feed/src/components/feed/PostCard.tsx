/**
 * Post Card Component - Display individual posts in feed
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { Post } from '../../data/welcomePost';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike?.();
  };

  // Format content with proper line breaks
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Check for bullet points
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="ml-4 text-white/80">
            {line}
          </div>
        );
      }
      // Check for bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={index} className="my-2">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <span key={i} className="font-semibold text-white">{part}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      }
      // Regular line
      return line.trim() ? (
        <div key={index} className="my-2">
          {line}
        </div>
      ) : (
        <br key={index} />
      );
    });
  };

  // Icons
  const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );

  const CommentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );

  const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
    </svg>
  );

  const PinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2L9 9l-7 2 7 2 3 7 3-7 7-2-7-2z"/>
    </svg>
  );

  const VerifiedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
            fill="url(#verified-gradient)" stroke="url(#verified-gradient)" strokeWidth="0.5"/>
      <defs>
        <linearGradient id="verified-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <div className="relative">
      {/* Pinned indicator */}
      {post.isPinned && (
        <div className="absolute -top-3 left-4 z-10 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
          <PinIcon />
          <span className="text-xs font-medium text-white">Pinned</span>
        </div>
      )}

      <div className={`
        bg-black/40 backdrop-blur-xl rounded-2xl p-6 
        border ${post.isPinned ? 'border-purple-500/30' : 'border-white/10'}
        hover:border-white/20 transition-all
        ${post.isPinned ? 'shadow-lg shadow-purple-500/10' : ''}
      `}>
        {/* Author header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {post.author.displayName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{post.author.displayName}</span>
                {post.author.isVerified && <VerifiedIcon />}
                {post.author.isFounder && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full text-xs text-purple-400 border border-purple-500/30">
                    Founder
                  </span>
                )}
              </div>
              <div className="text-sm text-white/40">@{post.author.username}</div>
            </div>
          </div>
          <div className="text-xs text-white/40">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Content */}
        <div className="text-white/90 mb-4 whitespace-pre-wrap">
          {formatContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-all cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all ${
              liked ? 'text-pink-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <HeartIcon />
            <span className="text-sm">{likes}</span>
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
          >
            <CommentIcon />
            <span className="text-sm">{post.comments}</span>
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
          >
            <ShareIcon />
            <span className="text-sm">{post.shares}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
