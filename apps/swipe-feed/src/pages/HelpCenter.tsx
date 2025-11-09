import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons/Icons';

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: Icons.Dashboard },
    { id: 'getting-started', name: 'Getting Started', icon: Icons.Sparkle },
    { id: 'features', name: 'Features', icon: Icons.Settings },
    { id: 'billing', name: 'Billing', icon: Icons.Revenue },
    { id: 'technical', name: 'Technical', icon: Icons.Database },
    { id: 'community', name: 'Community', icon: Icons.Friends }
  ];

  const articles = [
    {
      category: 'getting-started',
      title: 'Welcome to MythaTron',
      description: 'Learn the basics of our platform and get started quickly',
      readTime: '5 min'
    },
    {
      category: 'getting-started',
      title: 'Understanding Sparks',
      description: 'How our universal currency system works',
      readTime: '3 min'
    },
    {
      category: 'features',
      title: 'Using StoryForge',
      description: 'Complete guide to collaborative storytelling',
      readTime: '10 min'
    },
    {
      category: 'features',
      title: 'SongForge Basics',
      description: 'Create your first AI-powered song',
      readTime: '8 min'
    },
    {
      category: 'features',
      title: 'Mastering AngryLips',
      description: 'Tips and strategies for word game battles',
      readTime: '6 min'
    },
    {
      category: 'features',
      title: 'MythaQuest Guide',
      description: 'Navigate the AI-driven RPG universe',
      readTime: '15 min'
    },
    {
      category: 'billing',
      title: 'Managing Your Subscription',
      description: 'Upgrade, downgrade, or cancel your plan',
      readTime: '4 min'
    },
    {
      category: 'billing',
      title: 'Purchasing Sparks',
      description: 'How to buy additional Sparks when needed',
      readTime: '3 min'
    },
    {
      category: 'technical',
      title: 'System Requirements',
      description: 'Minimum specs for optimal performance',
      readTime: '2 min'
    },
    {
      category: 'technical',
      title: 'API Documentation',
      description: 'Integrate MythaTron into your workflow',
      readTime: '20 min'
    },
    {
      category: 'community',
      title: 'Community Guidelines',
      description: 'Rules and best practices for our community',
      readTime: '5 min'
    },
    {
      category: 'community',
      title: 'Collaboration Features',
      description: 'Working with other creators',
      readTime: '7 min'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <div className="relative py-20 px-6 bg-gradient-to-b from-cyan-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            HELP CENTER
          </h1>
          <p className="text-xl text-cyan-500/60 mb-8">
            Find answers to your questions and learn how to make the most of MythaTron.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 pl-14"
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-5 top-1/2 transform -translate-y-1/2 text-cyan-400">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  selectedCategory === category.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white'
                    : 'border-cyan-500/20 text-white/60 hover:text-white hover:border-cyan-400/50'
                }`}
              >
                <IconComponent size={18} />
                <span className="font-bold uppercase tracking-wider text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <div 
              key={index}
              className="bg-gradient-to-b from-gray-900/50 to-black border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {article.category.replace('-', ' ')}
                </span>
                <span className="text-xs text-white/40">{article.readTime}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-white/60 text-sm mb-4">
                {article.description}
              </p>
              
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                <span>Read Article</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-white/40 mb-4">No articles found</p>
            <p className="text-white/60">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="border-t border-cyan-500/20 bg-gradient-to-b from-black to-gray-900/50 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
            Still Need Help?
          </h2>
          <p className="text-cyan-500/60 mb-8">
            Our support team is here to assist you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <Icons.Message size={32} className="text-cyan-400 mb-4 mx-auto" />
              <h3 className="font-bold text-white mb-2">Live Chat</h3>
              <p className="text-white/60 text-sm mb-4">Chat with our support team</p>
              <button className="text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors">
                Start Chat →
              </button>
            </div>
            
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <Icons.Messages size={32} className="text-cyan-400 mb-4 mx-auto" />
              <h3 className="font-bold text-white mb-2">Community Forum</h3>
              <p className="text-white/60 text-sm mb-4">Get help from other users</p>
              <button className="text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors">
                Visit Forum →
              </button>
            </div>
            
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <Icons.Notification size={32} className="text-cyan-400 mb-4 mx-auto" />
              <h3 className="font-bold text-white mb-2">Email Support</h3>
              <p className="text-white/60 text-sm mb-4">We'll respond within 24h</p>
              <button className="text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors">
                Send Email →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
