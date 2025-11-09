/**
 * Simple Dashboard - Clean, functional dashboard
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface SimpleDashboardProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
  sparksBalance?: number;
  notifications?: number;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  profile,
  onNavigate,
  sparksBalance = 0,
  notifications = 0,
}) => {
  const [savedStories, setSavedStories] = React.useState<any[]>([]);
  const [activeSessions, setActiveSessions] = React.useState(0);
  const [totalStories, setTotalStories] = React.useState(0);
  const [friendsCount, setFriendsCount] = React.useState(0);
  
  React.useEffect(() => {
    // Load saved stories
    const stories = JSON.parse(localStorage.getItem('angry_lips_saved_stories') || '[]');
    setSavedStories(stories);
    setTotalStories(stories.length);
    
    // Count active sessions
    const sessions = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
    setActiveSessions(sessions.filter((s: any) => s.status === 'active').length);
    
    // Count friends
    const friends = JSON.parse(localStorage.getItem('mythatron_friends') || '[]');
    setFriendsCount(friends.length);
  }, []);
  
  const quickActions = [
    {
      id: 'feed' as FocusedView,
      title: 'Community Feed',
      description: 'See what creators are sharing',
      icon: '📰',
      color: 'from-purple-500/20 to-blue-500/20',
    },
    {
      id: 'angry-lips' as FocusedView,
      title: 'Angry Lips',
      description: 'Start a mad-lib battle',
      icon: '🎭',
      color: 'from-pink-500/20 to-purple-500/20',
    },
    {
      id: 'stories' as FocusedView,
      title: 'Story Branches',
      description: 'Create interactive stories',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      ),
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 'bookworms' as FocusedView,
      title: 'Friend Network',
      description: 'Connect with friends',
      icon: '👥',
      color: 'from-green-500/20 to-emerald-500/20',
    },
    {
      id: 'das' as FocusedView,
      title: 'Democratic Ads',
      description: 'Vote on advertising',
      icon: '🗳️',
      color: 'from-yellow-500/20 to-orange-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light mb-2">
                Welcome back, <span className="text-purple-400">{profile?.username || 'Creator'}</span>!
              </h1>
              <p className="text-white/60">Your creative hub awaits</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* PROMINENT Invite Friends Button */}
              <button
                onClick={() => onNavigate('invite' as any)}
                className="relative px-6 py-3 pr-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg animate-pulse overflow-visible"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                <span className="text-base">INVITE FRIENDS</span>
                <span className="absolute -top-3 -right-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce whitespace-nowrap">GET REWARDS!</span>
              </button>
              
              {/* Help/Tutorial */}
              <button
                onClick={() => {
                  // Trigger tutorial
                  localStorage.setItem('mythatron_force_tutorial', 'true');
                  window.location.reload();
                }}
                className="p-3 hover:bg-purple-500/10 rounded-xl transition-all group"
                title="View Tutorial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:text-purple-400 transition-colors">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </button>
              
              {/* Settings */}
              <button
                onClick={() => onNavigate('settings')}
                className="p-3 hover:bg-white/5 rounded-xl transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M1 12h6m6 0h6m-13.22 4.22l-4.24 4.24m16.92 0l-4.24-4.24"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-white/60">Sparks</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-xl sm:text-3xl font-light text-yellow-400">
              {sparksBalance === Infinity ? '∞' : sparksBalance}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-white/60">Stories</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="text-xl sm:text-3xl font-light">{totalStories}</p>
          </div>

          <button
            onClick={() => onNavigate('bookworms')}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-white/60">Friends</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <p className="text-xl sm:text-3xl font-light">{friendsCount}</p>
          </button>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-white/60">Sessions</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <p className="text-xl sm:text-3xl font-light">{activeSessions}</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-lg sm:text-xl font-light mb-4 sm:mb-6 text-white/80">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`group relative overflow-hidden bg-gradient-to-br ${action.color} border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300`}
            >
              <div className="relative z-10">
                <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">{action.icon}</div>
                <h3 className="text-sm sm:text-lg font-medium text-white mb-1 sm:mb-2">{action.title}</h3>
                <p className="text-xs sm:text-sm text-white/70 hidden sm:block">{action.description}</p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>

        {/* Saved Angry Lips Sessions to Resume */}
        {(() => {
          const username = localStorage.getItem('mythatron_username') || 'user';
          const savedSessionsKey = `angry_lips_saved_sessions_${username.toLowerCase().replace(/\s+/g, '_')}`;
          const savedSessions = JSON.parse(localStorage.getItem(savedSessionsKey) || '[]');
          
          if (savedSessions.length > 0) {
            return (
              <div className="mt-8">
                <h2 className="text-xl font-light mb-6 text-white/80">Resume Angry Lips Sessions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedSessions.slice(0, 3).map((session: any) => (
                    <div key={session.sessionId} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{session.genre} Session</h4>
                        <span className="text-xs text-white/40">
                          {new Date(session.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-3">
                        Progress: {session.currentBlankIndex}/{session.currentStory?.blanks?.length || 0} words filled
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400">
                          {session.players?.length || 1} players
                        </span>
                        <button 
                          onClick={() => {
                            // Store the session to resume
                            localStorage.setItem('angry_lips_resume_session', JSON.stringify(session));
                            onNavigate('angry-lips');
                          }}
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-xs transition-all"
                        >
                          Resume
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Recent Activity / Saved Stories */}
        <div className="mt-12">
          <h2 className="text-xl font-light mb-6 text-white/80">Recent Activity</h2>
          {savedStories.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-light mb-4 text-purple-300">🎭 Your Angry Lips Stories</h3>
                <div className="space-y-3">
                  {savedStories.slice(-3).reverse().map((story, idx) => (
                    <div key={story.id || idx} className="bg-black/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{story.title}</h4>
                        <span className="text-xs text-white/40">
                          {new Date(story.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {story.completedStory}
                      </p>
                      <div className="flex gap-3 mt-2">
                        <button className="text-xs text-purple-400 hover:text-purple-300">
                          Read Full Story
                        </button>
                        <button className="text-xs text-purple-400 hover:text-purple-300">
                          Share to Feed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {savedStories.length > 3 && (
                  <button 
                    onClick={() => onNavigate('angry-lips')}
                    className="mt-4 text-sm text-purple-400 hover:text-purple-300">
                    View all {savedStories.length} stories →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="text-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p className="text-white/60">No recent activity yet</p>
                <p className="text-sm text-white/40 mt-2">Start exploring to see your activity here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
