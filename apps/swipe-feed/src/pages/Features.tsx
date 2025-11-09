import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons/Icons';

export const Features: React.FC = () => {
  const features = [
    {
      title: 'StoryForge',
      icon: Icons.StoryForge,
      description: 'AI-powered collaborative storytelling platform',
      highlights: [
        'Real-time collaboration with multiple writers',
        'AI story suggestions and plot development',
        'Character development assistant',
        'World-building tools',
        'Version control and branching',
        'Export to multiple formats'
      ],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'SongForge',
      icon: Icons.SongForge,
      description: 'Create original music with AI assistance',
      highlights: [
        'AI-powered lyric generation',
        'Melody and harmony suggestions',
        'Multiple genre support',
        'Real-time collaboration',
        'Professional mixing tools',
        'MIDI export and DAW integration'
      ],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'AngryLips',
      icon: Icons.Fire,
      description: 'Next-generation AI word game battles',
      highlights: [
        'Dynamic story templates',
        'Multiplayer modes',
        'AI mood director',
        'Voice synthesis narration',
        'Semantic intelligence',
        'Episodic universe tracking'
      ],
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'MythaQuest',
      icon: Icons.MythaQuest,
      description: 'Immersive AI-driven RPG universe',
      highlights: [
        'Procedural world generation',
        'AI Dungeon Master',
        'Character creation system',
        'Cross-realm conflicts',
        'Dynamic economy',
        'Guild systems'
      ],
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Screenplay',
      icon: Icons.Screenplay,
      description: 'Professional script writing with AI',
      highlights: [
        'Industry-standard formatting',
        'AI dialogue assistant',
        'Character arc tracking',
        'Scene breakdown tools',
        'Collaboration features',
        'Export to Final Draft'
      ],
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'OmniGuide AI',
      icon: Icons.Sparkle,
      description: 'Your intelligent creative assistant',
      highlights: [
        'Context-aware help',
        'Creative suggestions',
        'Task automation',
        'Learning from your style',
        'Cross-app integration',
        '24/7 availability'
      ],
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

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
            POWERFUL FEATURES
          </h1>
          <p className="text-xl text-cyan-500/60 max-w-3xl mx-auto">
            Everything you need to unleash your creativity with AI-powered tools designed for the future of content creation.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group relative bg-gradient-to-b from-gray-900/50 to-black border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                  <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                    <IconComponent size={32} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-cyan-500/60 mb-6">
                  {feature.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="text-sm text-white/70">{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-cyan-500/20 bg-gradient-to-b from-black to-gray-900/50 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
            Ready to Start Creating?
          </h2>
          <p className="text-cyan-500/60 mb-8">
            Join thousands of creators using MythaTron's AI-powered tools.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-105"
          >
            <span className="font-black text-lg uppercase tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              Get Started Free
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
