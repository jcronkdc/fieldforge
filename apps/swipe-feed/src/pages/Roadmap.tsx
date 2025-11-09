import React from 'react';
import { Link } from 'react-router-dom';

export const Roadmap: React.FC = () => {
  const quarters = [
    {
      period: 'Q1 2025',
      status: 'current',
      items: [
        { title: 'OmniGuide AI Assistant', status: 'completed', description: 'Intelligent helper across all apps' },
        { title: 'Enhanced Selection States', status: 'completed', description: 'Improved UI feedback' },
        { title: 'Screenplay Writer', status: 'completed', description: 'Professional script writing tool' },
        { title: 'Mobile App Beta', status: 'in-progress', description: 'iOS and Android native apps' },
        { title: 'API v2.0', status: 'in-progress', description: 'Enhanced developer tools' }
      ]
    },
    {
      period: 'Q2 2025',
      status: 'upcoming',
      items: [
        { title: 'Voice Integration', status: 'planned', description: 'Voice commands and narration' },
        { title: 'Video Export', status: 'planned', description: 'Export creations as videos' },
        { title: 'Team Workspaces', status: 'planned', description: 'Collaborative team environments' },
        { title: 'Plugin System', status: 'planned', description: 'Third-party integrations' },
        { title: 'Advanced Analytics', status: 'planned', description: 'Deep insights into your creations' }
      ]
    },
    {
      period: 'Q3 2025',
      status: 'upcoming',
      items: [
        { title: 'AR/VR Support', status: 'planned', description: 'Immersive creation experiences' },
        { title: 'Blockchain Integration', status: 'planned', description: 'NFT minting and ownership' },
        { title: 'AI Model Marketplace', status: 'planned', description: 'Custom AI models and sharing' },
        { title: 'Live Streaming', status: 'planned', description: 'Stream your creative process' },
        { title: 'Education Platform', status: 'planned', description: 'Courses and tutorials' }
      ]
    },
    {
      period: 'Q4 2025',
      status: 'upcoming',
      items: [
        { title: 'Enterprise Features', status: 'planned', description: 'Advanced business tools' },
        { title: 'Global Expansion', status: 'planned', description: 'Multi-language support' },
        { title: 'AI Director Mode', status: 'planned', description: 'Full creative automation' },
        { title: 'Cross-Platform Sync', status: 'planned', description: 'Seamless device switching' },
        { title: 'MythaTron OS', status: 'planned', description: 'Dedicated creative operating system' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'in-progress': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'planned': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
      default: return 'text-white/60 border-white/20 bg-white/5';
    }
  };

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
            PRODUCT ROADMAP
          </h1>
          <p className="text-xl text-cyan-500/60 max-w-3xl mx-auto">
            Our vision for the future of creative AI. See what we're building and what's coming next.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500"></div>
          
          {/* Quarters */}
          <div className="space-y-16">
            {quarters.map((quarter, qIndex) => (
              <div key={qIndex} className="relative">
                {/* Quarter marker */}
                <div className="absolute left-8 w-4 h-4 -translate-x-1/2 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
                
                {/* Content */}
                <div className="ml-20">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-3xl font-black text-white">{quarter.period}</h2>
                    {quarter.status === 'current' && (
                      <span className="px-3 py-1 bg-cyan-500 text-black text-xs font-black rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quarter.items.map((item, iIndex) => (
                      <div 
                        key={iIndex}
                        className="bg-gradient-to-b from-gray-900/50 to-black border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-cyan-500/20 bg-gradient-to-b from-black to-gray-900/50 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
            Have a Feature Request?
          </h2>
          <p className="text-cyan-500/60 mb-8">
            We're always listening to our community. Share your ideas and help shape the future of MythaTron.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-105">
            <span className="font-black text-lg uppercase tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              Submit Feedback
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
