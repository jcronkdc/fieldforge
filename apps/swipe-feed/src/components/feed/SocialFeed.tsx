import React, { useState, useEffect } from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreVertical,
  Camera, Video, FileText, Trophy, AlertTriangle, 
  CheckCircle, Sparkles, TrendingUp, Users, Clock,
  MapPin, Send, Image, Zap, Shield, HardHat
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { SwipeableCard } from '../gestures/SwipeableCard';
import { HolographicCard } from '../holographic/HolographicCard';
import { EmptyState } from '../EmptyState';

interface FeedPost {
  id: string;
  project_id: string;
  author_id: string;
  post_type: string;
  content: string;
  media_urls?: string[];
  location?: any;
  tags?: string[];
  visibility: string;
  is_pinned: boolean;
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
    job_title?: string;
    photo_url?: string;
  };
  project?: {
    name: string;
    project_number: string;
  };
  reactions?: {
    count: number;
    user_reacted: boolean;
    type?: string;
  };
  comments_count?: number;
}

export const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<string>('update');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[SocialFeed] No authenticated user');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_team!inner(user_id)
        `)
        .eq('project_team.user_id', user.id)
        .eq('project_team.status', 'active');

      if (error) {
        console.error('[SocialFeed] Error fetching projects:', error);
        // Check if tables exist
        if (error.code === '42P01') {
          console.error('[SocialFeed] Tables "projects" or "project_team" do not exist');
        }
        return;
      }

      if (data) {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0].id);
        } else {
          console.warn('[SocialFeed] User has no active projects');
        }
      }
    } catch (error) {
      console.error('[SocialFeed] Unexpected error fetching projects:', error);
    }
  };

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('feed_posts')
      .select(`
        *,
        author:user_profiles!feed_posts_author_id_fkey(
          first_name,
          last_name,
          job_title,
          photo_url
        ),
        project:projects!feed_posts_project_id_fkey(
          name,
          project_number
        ),
        reactions:feed_reactions(count),
        comments:feed_comments(count)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setPosts(data as any);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !selectedProject) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('feed_posts')
      .insert({
        project_id: selectedProject,
        author_id: user.id,
        post_type: postType,
        content: newPost,
        visibility: 'project'
      });

    if (!error) {
      setNewPost('');
      fetchPosts();
    }
  };

  const handleReaction = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Toggle reaction
    const { data: existing } = await supabase
      .from('feed_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase
        .from('feed_reactions')
        .delete()
        .eq('id', existing.id);
    } else {
      await supabase
        .from('feed_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: 'like'
        });
    }

    fetchPosts();
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'safety': return <Shield className="w-5 h-5 text-green-400" />;
      case 'issue': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'milestone': return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'photo': return <Camera className="w-5 h-5 text-purple-400" />;
      case 'video': return <Video className="w-5 h-5 text-pink-400" />;
      default: return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const postTypes = [
    { value: 'update', label: 'Update', icon: Zap },
    { value: 'achievement', label: 'Achievement', icon: Trophy },
    { value: 'safety', label: 'Safety', icon: Shield },
    { value: 'milestone', label: 'Milestone', icon: CheckCircle },
    { value: 'issue', label: 'Issue', icon: AlertTriangle },
    { value: 'photo', label: 'Photo', icon: Camera }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Create Post Section */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 shadow-lg">
        <div className="w-full max-w-4xl mx-auto px-4 py-3">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="space-y-3">
              {/* Textarea */}
              <textarea
                id="compose-post"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an update from the field..."
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base"
                rows={2}
              />
              
              {/* Post Type Buttons - Simple Icon Grid */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setPostType(type.value)}
                      title={type.label}
                      className={`flex items-center justify-center p-2 rounded-lg transition-all flex-shrink-0 ${
                        postType === type.value 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Bottom Row: Select + Buttons */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                  disabled={projects.length === 0}
                >
                  <option value="" disabled>
                    {projects.length === 0 ? 'No projects' : 'Select Project'}
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handlePost}
                  disabled={!newPost.trim() || !selectedProject}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-lg font-medium text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 rounded-xl border border-gray-700 bg-gray-800/30 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-4">Share an update to brief the team.</p>
              <button
                onClick={() => document.getElementById('compose-post')?.focus()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
              >
                Share update
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800/70 transition-all shadow-lg"
              >
                <div className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">
                          {post.author?.first_name} {post.author?.last_name}
                        </span>
                        {getPostIcon(post.post_type)}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {post.author?.job_title || 'Team Member'} • {post.project?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-3">
                    <p className="text-white text-sm leading-relaxed break-words">{post.content}</p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-900 text-blue-400 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Media */}
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="mt-3">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <img
                            src={post.media_urls[0]}
                            alt="Post media"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReaction(post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-all"
                      >
                        <Heart className={`w-5 h-5 ${post.reactions?.user_reacted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                        <span className={`text-sm ${post.reactions?.user_reacted ? 'text-red-500' : 'text-gray-400'}`}>
                          {post.reactions?.count || 0}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-all"
                      >
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {post.comments_count || 0}
                        </span>
                      </button>
                      
                      <button className="p-1.5 rounded-lg hover:bg-gray-700 transition-all">
                        <Share2 className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <button className="p-1.5 rounded-lg hover:bg-gray-700 transition-all">
                      <Bookmark className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments === post.id && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0"></div>
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                        <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
