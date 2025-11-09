import React from 'react';
import { Link } from 'react-router-dom';

export const Blog: React.FC = () => {
  const posts = [
    {
      date: 'January 15, 2025',
      category: 'Product Update',
      title: 'Introducing OmniGuide AI Assistant',
      excerpt: 'Meet your new creative companion. OmniGuide learns your style and helps you create better content faster.',
      author: 'Justin Cronk',
      readTime: '5 min read',
      featured: true
    },
    {
      date: 'January 10, 2025',
      category: 'Tutorial',
      title: 'Mastering StoryForge: Advanced Techniques',
      excerpt: 'Learn how to use branching narratives, character development tools, and AI suggestions to create compelling stories.',
      author: 'Sarah Chen',
      readTime: '8 min read'
    },
    {
      date: 'January 5, 2025',
      category: 'Community',
      title: 'Creator Spotlight: Amazing MythaQuest Worlds',
      excerpt: 'Explore the most creative and immersive worlds built by our community in MythaQuest.',
      author: 'Mike Rodriguez',
      readTime: '6 min read'
    },
    {
      date: 'December 28, 2024',
      category: 'Technology',
      title: 'How We Achieved 65% Profit Margins with AI',
      excerpt: 'A deep dive into our Profitability Intelligence System and how we optimize costs while delivering value.',
      author: 'Justin Cronk',
      readTime: '12 min read'
    },
    {
      date: 'December 20, 2024',
      category: 'Product Update',
      title: 'SongForge 2.0: Now with Voice Synthesis',
      excerpt: 'Create complete songs with AI-generated vocals that match your lyrics and melody perfectly.',
      author: 'Lisa Park',
      readTime: '4 min read'
    },
    {
      date: 'December 15, 2024',
      category: 'Tutorial',
      title: 'Building Your First AngryLips Tournament',
      excerpt: 'Everything you need to know about hosting multiplayer word battles with custom rules and prizes.',
      author: 'Tom Wilson',
      readTime: '7 min read'
    }
  ];

  const categories = ['All', 'Product Update', 'Tutorial', 'Community', 'Technology'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black text-xl">
                M
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">MythaTron</h1>
            </Link>
            <Link 
              to="/"
              className="px-6 py-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
            >
              <span className="font-bold uppercase tracking-wider text-sm">Back to App</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            BLOG
          </h1>
          <p className="text-xl text-cyan-500/60 max-w-3xl mx-auto">
            News, updates, tutorials, and insights from the MythaTron team.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              className="px-4 py-2 border border-cyan-500/20 rounded-lg text-white/60 hover:text-white hover:border-cyan-400/50 transition-all font-bold uppercase tracking-wider text-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Featured Post */}
        {posts.filter(p => p.featured).map((post, index) => (
          <div 
            key={index}
            className="mb-12 bg-gradient-to-b from-gray-900/50 to-black border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-cyan-500 text-black text-xs font-black rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] uppercase tracking-wider">
                Featured
              </span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs font-bold uppercase tracking-wider text-cyan-400">
                {post.category}
              </span>
              <span className="text-xs text-white/40">{post.date}</span>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 group-hover:text-cyan-400 transition-colors">
              {post.title}
            </h2>
            
            <p className="text-white/60 text-lg mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/80">{post.author}</span>
                <span className="text-sm text-white/40">{post.readTime}</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span>Read More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        ))}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.filter(p => !p.featured).map((post, index) => (
            <div 
              key={index}
              className="bg-gradient-to-b from-gray-900/50 to-black border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {post.category}
                </span>
                <span className="text-xs text-white/40">{post.date}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-white/60 text-sm mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60">{post.author}</span>
                  <span className="text-xs text-white/40">{post.readTime}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-cyan-500/20 bg-gradient-to-b from-black to-gray-900/50 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
            Stay Updated
          </h2>
          <p className="text-cyan-500/60 mb-8">
            Get the latest news and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all">
              <span className="font-bold uppercase tracking-wider">Subscribe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
