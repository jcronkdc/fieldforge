import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  FileText,
  HardHat,
  Calendar,
  ArrowRight,
  CheckCircle,
  Activity,
  ShieldCheck,
  Video,
  MessageSquare,
  Radio,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ProjectData {
  id: string;
  project_number: string;
  name: string;
  status: string;
  created_at: string;
}

interface FeedPost {
  id: string;
  post_type: string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
}

export const FuturisticDashboard: React.FC = () => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [recentPosts, setRecentPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's projects
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          *,
          project_team!inner(user_id)
        `)
        .eq('project_team.user_id', user.id)
        .eq('project_team.status', 'active')
        .limit(1);

      if (projects && projects.length > 0) {
        setProject(projects[0]);

        // Fetch recent feed posts for this project
        const { data: posts } = await supabase
          .from('feed_posts')
          .select(`
            *,
            user_profiles!feed_posts_author_id_fkey(first_name, last_name)
          `)
          .eq('project_id', projects[0].id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (posts) {
          setRecentPosts(posts.map((p: any) => ({
            ...p,
            author: p.user_profiles
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'safety': return Shield;
      case 'milestone': return TrendingUp;
      case 'achievement': return CheckCircle;
      default: return Activity;
    }
  };

  const collaborationCard = {
    title: 'Team Collaboration',
    description: 'Start a video call, chat with your team, or share your screen with cursor control for real-time collaboration.',
    features: [
      { icon: Video, label: 'Video calls', path: '/projects' },
      { icon: MessageSquare, label: 'Team chat', path: '/projects' },
      { icon: Radio, label: 'Cursor control', path: '/projects' }
    ]
  };

  const quickActions = [
    {
      title: 'Projects & Teams',
      description: 'Manage your projects, invite team members, and start collaborative sessions with video and chat.',
      cta: 'View projects',
      to: '/projects',
      icon: Building2,
      badge: 'COLLABORATION'
    },
    {
      title: 'Social Feed',
      description: 'See team updates, milestones, safety briefings, and project achievements in real-time.',
      cta: 'View feed',
      to: '/feed',
      icon: MessageSquare,
      badge: 'NEW'
    },
    {
      title: 'Safety Hub',
      description: 'Digital JSAs, safety briefings, incident reporting, and team safety collaboration.',
      cta: 'Access safety',
      to: '/safety',
      icon: Shield,
      badge: null
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
        
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-gray-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Dashboard Overview</p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {project ? project.name : 'Welcome to FieldForge'}
            </h1>
            <p className="max-w-3xl text-base text-gray-400">
              Collaborate with your team using video, chat, and cursor control. Track safety, manage equipment, and keep everyone aligned.
            </p>
          </div>
          <Link
            to="/analytics"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Live Analytics
            <Activity className="w-5 h-5" />
          </Link>
        </header>

        {/* Collaboration Hub - Featured */}
        <section className="bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-blue-900/30 border border-blue-500/30 rounded-xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">{collaborationCard.title}</h2>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Invite-Only Groups
                </span>
              </div>
              <p className="text-gray-300 max-w-2xl">{collaborationCard.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collaborationCard.features.map(({ icon: Icon, label, path }) => (
              <Link
                key={label}
                to={path}
                className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-blue-500/50 hover:bg-gray-900/80 transition-all group"
              >
                <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span className="text-white font-medium">{label}</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 ml-auto" />
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions - Clean Pathways */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(({ title, description, cta, to, icon: Icon, badge }, index) => (
            <div
              key={title}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 text-blue-400" />
                {badge && (
                  <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs font-semibold text-blue-300 uppercase tracking-wider">
                    {badge}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
              <p className="text-sm text-gray-400 mb-4">{description}</p>
              <Link 
                to={to} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </section>

        {/* Recent Activity - Live Feed Integration */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            
            {loading ? (
              <p className="text-gray-400 text-sm">Loading activity...</p>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post) => {
                  const PostIcon = getPostIcon(post.post_type);
                  return (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <PostIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white mb-1">{post.content.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500">
                          {post.author?.first_name} {post.author?.last_name} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Link to="/feed" className="block text-center text-sm text-blue-400 hover:text-blue-300 pt-2">
                  View all activity →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-2">No recent activity</p>
                <Link to="/feed" className="text-sm text-blue-400 hover:text-blue-300">
                  Start sharing updates →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Getting Started</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="text-white text-sm font-medium">Explore your project</p>
                  <p className="text-gray-400 text-xs">Go to Projects to see your team and start collaborating</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="text-white text-sm font-medium">Start a video call</p>
                  <p className="text-gray-400 text-xs">Use Daily.co video with cursor control for real-time collaboration</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="text-white text-sm font-medium">Share updates</p>
                  <p className="text-gray-400 text-xs">Post to the feed to keep everyone informed</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Project Info - If Available */}
        {project && (
          <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Active Project</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Project Number: {project.project_number}</p>
                <p className="text-2xl font-bold text-white">{project.name}</p>
                <p className="text-gray-400 text-sm mt-1">Status: <span className="text-green-400 capitalize">{project.status}</span></p>
              </div>
              <Link
                to="/projects"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                Open Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
