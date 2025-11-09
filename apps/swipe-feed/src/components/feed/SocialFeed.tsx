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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        project_team!inner(user_id)
      `)
      .eq('project_team.user_id', user.id)
      .eq('project_team.status', 'active');

    if (data) {
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
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
      default: return <Zap className="w-5 h-5 text-amber-400" />;
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
    <div className="min-h-screen bg-black">
      {/* Create Post Section */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share an update from the field..."
                  className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
                  rows={2}
                />
                
                {/* Post Type Selector */}
                <div className="flex items-center space-x-2 mt-3 mb-3">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setPostType(type.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 ${
                          postType === type.value
                            ? 'bg-amber-500 text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Project Selector & Post Button */}
                <div className="flex items-center justify-between">
                  <select
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="" disabled>Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-amber-400 transition-colors">
                      <Image className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-amber-400 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handlePost}
                      disabled={!newPost.trim() || !selectedProject}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-semibold text-black hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
            >
              <div className="p-4">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          {post.author?.first_name} {post.author?.last_name}
                        </span>
                        {getPostIcon(post.post_type)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{post.author?.job_title || 'Team Member'}</span>
                        <span>•</span>
                        <span>{post.project?.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-white text-lg leading-relaxed">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-800 text-amber-400 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Media */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mt-3 rounded-xl overflow-hidden">
                      <img
                        src={post.media_urls[0]}
                        alt="Post media"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleReaction(post.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <Heart className={`w-5 h-5 ${post.reactions?.user_reacted ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-red-400'}`} />
                      <span className={`text-sm ${post.reactions?.user_reacted ? 'text-red-500' : 'text-gray-400'}`}>
                        {post.reactions?.count || 0}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-amber-400" />
                      <span className="text-sm text-gray-400">
                        {post.comments_count || 0}
                      </span>
                    </button>
                    
                    <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors group">
                      <Share2 className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                    </button>
                  </div>
                  
                  <button className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <Bookmark className="w-5 h-5 text-gray-400 hover:text-amber-400" />
                  </button>
                </div>

                {/* Comments Section (placeholder) */}
                {showComments === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      <button className="p-2 text-amber-400 hover:text-amber-300 transition-colors">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
