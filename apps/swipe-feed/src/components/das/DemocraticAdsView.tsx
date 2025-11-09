/**
 * Democratic Ads View - Community-driven advertising
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface DemocraticAdsViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const DemocraticAdsView: React.FC<DemocraticAdsViewProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'revenue'>('vote');

  const mockCampaigns = [
    {
      id: 1,
      brand: 'EcoTech',
      product: 'Solar Charger',
      description: 'Sustainable charging solution for creators on the go',
      yesVotes: 234,
      noVotes: 89,
      revenue: 500,
      status: 'voting',
    },
    {
      id: 2,
      brand: 'Creative Tools',
      product: 'AI Writing Assistant',
      description: 'Help creators write better stories faster',
      yesVotes: 456,
      noVotes: 123,
      revenue: 750,
      status: 'approved',
    },
    {
      id: 3,
      brand: 'MegaCorp',
      product: 'Energy Drink',
      description: 'High caffeine energy drink',
      yesVotes: 45,
      noVotes: 456,
      revenue: 1000,
      status: 'rejected',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Democratic Ad System</h1>
              <p className="text-sm text-white/60">Community votes on which brands can advertise</p>
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['vote', 'results', 'revenue'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-b from-purple-500/20 to-transparent text-purple-400 border-b-2 border-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'vote' ? 'Vote on Ads' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'vote' && (
          <div className="space-y-6">
            {mockCampaigns.filter(c => c.status === 'voting').map(campaign => (
              <div key={campaign.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-light mb-1">{campaign.brand}</h3>
                    <p className="text-white/60">{campaign.product}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400">
                    ${campaign.revenue} potential
                  </span>
                </div>

                <p className="text-white/80 mb-6">{campaign.description}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>Community Response</span>
                    <span>{campaign.yesVotes + campaign.noVotes} votes</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${(campaign.yesVotes / (campaign.yesVotes + campaign.noVotes)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{campaign.yesVotes} Yes</span>
                    <span>{campaign.noVotes} No</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-all flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Approve
                  </button>
                  <button className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockCampaigns.filter(c => c.status !== 'voting').map(campaign => (
                <div key={campaign.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-light">{campaign.brand}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      campaign.status === 'approved'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}>
                      {campaign.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-4">{campaign.product}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Final Vote</span>
                    <span className="text-white">
                      {campaign.yesVotes} Yes / {campaign.noVotes} No
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-light mb-6">Revenue Distribution</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-white/80">Creators</span>
                  </div>
                  <span className="text-xl font-light text-purple-400">40%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-white/80">Platform Development</span>
                  </div>
                  <span className="text-xl font-light text-blue-400">50%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white/80">Charity</span>
                  </div>
                  <span className="text-xl font-light text-green-400">10%</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-sm text-yellow-400">
                  💡 All approved ads generate revenue that's automatically distributed according to these percentages. Creators earn based on their engagement and content quality.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
