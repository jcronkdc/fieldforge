/**
 * Dashboard Tab Content Components
 */

import React from 'react';
import { Icons } from '../icons/Icons';
import { useSparks } from '../sparks/SparksContext';

interface TabContentProps {
  profile: any;
}

export const OverviewTab: React.FC<TabContentProps> = ({ profile }) => {
  const { balance: sparksBalance } = useSparks();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Total Sparks</span>
          <Icons.Spark size={16} className="text-cyan-400" />
        </div>
        <div className="text-2xl font-black text-white">{sparksBalance.toLocaleString()}</div>
        <div className="text-xs text-green-400 mt-1">+12% this week</div>
      </div>
      
      <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Stories Created</span>
          <Icons.StoryForge size={16} className="text-purple-400" />
        </div>
        <div className="text-2xl font-black text-white">47</div>
        <div className="text-xs text-gray-400 mt-1">3 this week</div>
      </div>
      
      <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Songs Composed</span>
          <Icons.SongForge size={16} className="text-pink-400" />
        </div>
        <div className="text-2xl font-black text-white">23</div>
        <div className="text-xs text-gray-400 mt-1">5 this week</div>
      </div>
      
      <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Games Played</span>
          <Icons.Fire size={16} className="text-orange-400" />
        </div>
        <div className="text-2xl font-black text-white">156</div>
        <div className="text-xs text-gray-400 mt-1">12 this week</div>
      </div>
    </div>
  );
};

export const AnalyticsTab: React.FC<TabContentProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
        <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Daily Active Time</div>
            <div className="text-xl font-bold text-cyan-400">2h 34m</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
            <div className="text-xl font-bold text-green-400">87%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">AI Interactions</div>
            <div className="text-xl font-bold text-purple-400">342</div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
        <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Performance Trends</h3>
        <div className="space-y-3">
          {['StoryForge', 'SongForge', 'AngryLips', 'MythaQuest'].map((app, i) => (
            <div key={app} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{app}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${[78, 92, 65, 45][i]}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{[78, 92, 65, 45][i]}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ActivityTab: React.FC<TabContentProps> = ({ profile }) => {
  const activities = [
    { type: 'story', action: 'Created story "The Last Algorithm"', time: '5 minutes ago', icon: Icons.StoryForge },
    { type: 'game', action: 'Won AngryLips match', time: '1 hour ago', icon: Icons.Fire },
    { type: 'song', action: 'Composed "Digital Dreams"', time: '2 hours ago', icon: Icons.SongForge },
    { type: 'achievement', action: 'Unlocked "Creative Genius" badge', time: '3 hours ago', icon: Icons.Success },
    { type: 'social', action: 'Joined "Writers Guild"', time: '5 hours ago', icon: Icons.Friends },
    { type: 'rpg', action: 'Reached Level 10 in MythaQuest', time: '1 day ago', icon: Icons.MythaQuest },
  ];
  
  return (
    <div className="space-y-3">
      {activities.map((activity, i) => (
        <div key={i} className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <activity.icon size={20} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white">{activity.action}</div>
              <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SystemsTab: React.FC<TabContentProps> = ({ profile }) => {
  // Get real system metrics
  const getStorageUsage = () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0;
        return percentage;
      });
    }
    return 0;
  };
  
  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.jsHeapSizeLimit;
      return Math.round((used / total) * 100);
    }
    return 0;
  };
  
  const systems = [
    { 
      name: 'AI ENGINE', 
      status: 'ONLINE', 
      statusColor: 'text-green-400',
      metric: '99.9% uptime',
      icon: Icons.AIAssistant
    },
    { 
      name: 'DATABASE', 
      status: 'OPTIMAL', 
      statusColor: 'text-green-400',
      metric: '12ms latency',
      icon: Icons.Database
    },
    { 
      name: 'NETWORK', 
      status: 'FAST', 
      statusColor: 'text-cyan-400',
      metric: '45ms ping',
      icon: Icons.Export
    },
    { 
      name: 'STORAGE', 
      status: `${getStorageUsage()}% USED`, 
      statusColor: 'text-yellow-400',
      metric: 'Local cache',
      icon: Icons.Database
    },
    { 
      name: 'MEMORY', 
      status: `${getMemoryUsage()}% USED`, 
      statusColor: 'text-orange-400',
      metric: 'Browser heap',
      icon: Icons.Metrics
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {systems.map((system, i) => (
        <div key={i} className="bg-black/60 border border-cyan-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <system.icon size={20} className="text-cyan-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">{system.name}</span>
            </div>
            <span className={`text-xs font-bold uppercase ${system.statusColor}`}>{system.status}</span>
          </div>
          <div className="text-xs text-gray-500">{system.metric}</div>
        </div>
      ))}
    </div>
  );
};
