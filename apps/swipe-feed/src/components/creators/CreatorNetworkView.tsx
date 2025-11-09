/**
 * Friend Network View - Connect with friends
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface FriendNetworkViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const CreatorNetworkView: React.FC<FriendNetworkViewProps> = ({ profile, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'connections' | 'invites'>('discover');
  const [pendingConnections, setPendingConnections] = useState<number[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState<any>(null);

  // Real creators will be loaded from backend
  const realCreators: any[] = [];
  
  // All creators from backend
  const allCreators = realCreators;
  
  // Real-time search - filter as user types
  const filteredCreators = useMemo(() => {
    if (!searchQuery || searchQuery.length === 0) {
      return realCreators;
    }
    
    const query = searchQuery.toLowerCase();
    return realCreators.filter(creator => 
      creator.name.toLowerCase().includes(query) ||
      creator.username.toLowerCase().includes(query) ||
      creator.email.toLowerCase().includes(query) ||
      creator.bio.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  const handleAcceptRequest = (requestId: number, requesterName: string) => {
    // Add to connected users
    setConnectedUsers(prev => [...prev, requestId]);
    // Remove from incoming requests
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    
    // Send notification back to requester
    const notification = {
      id: Date.now(),
      type: 'friend_request_accepted',
      from: profile?.username || 'testuser82',
      to: requesterName,
      message: `${profile?.username || 'testuser82'} accepted your friend request!`,
      timestamp: new Date().toISOString()
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('mythatron_notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('mythatron_notifications', JSON.stringify(existingNotifications));
    
    alert(`Friend request from ${requesterName} accepted!`);
  };

  const handleRejectRequest = (requestId: number, requesterName: string) => {
    // Remove from incoming requests
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    alert(`Friend request from ${requesterName} rejected.`);
  };

  const handleConnect = (creatorId: number, creatorName: string, creatorEmail?: string) => {
    if (connectedUsers.includes(creatorId)) {
      // Already connected, disconnect
      setConnectedUsers(prev => prev.filter(id => id !== creatorId));
      alert(`Disconnected from ${creatorName}`);
    } else if (pendingConnections.includes(creatorId)) {
      // Already pending
      alert(`Friend request already sent to ${creatorName}`);
    } else {
      // Send connection request
      setPendingConnections(prev => [...prev, creatorId]);
      
      // Simulate sending email notification
      console.log(`[EMAIL] Sending friend request notification to ${creatorName} at ${creatorEmail || 'user@example.com'}`);
      
      // Add in-app notification
      const notification = {
        id: Date.now(),
        type: 'friend_request',
        from: profile?.username || 'testuser82',
        to: creatorName,
        message: `${profile?.username || 'testuser82'} sent you a friend request`,
        timestamp: new Date().toISOString()
      };
      
      // Store notification in localStorage for demo
      const existingNotifications = JSON.parse(localStorage.getItem('mythatron_notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('mythatron_notifications', JSON.stringify(existingNotifications));
      
      alert(`Friend request sent to ${creatorName}! They will receive an email and in-app notification.`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-light">Friend Network</h1>
              <p className="text-xs sm:text-sm text-white/60">Connect and collaborate with friends</p>
            </div>
            <button
              onClick={() => onNavigate('invite')}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Invite Friends
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['discover', 'connections', 'invites'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-b from-purple-500/20 to-transparent text-purple-400 border-b-2 border-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'invites' && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-xs">
                    2
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-8">
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators..."
              className="w-full px-10 sm:px-12 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 text-sm sm:text-base"
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {activeTab === 'discover' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredCreators.map(creator => (
              <div key={creator.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {creator.name[0]}
                    </div>
                    <div>
                      <h3 className="font-light">{creator.name}</h3>
                      <p className="text-sm text-white/60">{creator.username}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs">
                    {creator.genre}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">{creator.followers} followers</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowProfileModal(creator)}
                      className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all text-xs"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => handleConnect(creator.id, creator.name, creator.email)}
                      className={`px-3 py-1.5 rounded-lg transition-all text-xs ${
                        connectedUsers.includes(creator.id)
                          ? 'bg-green-500/20 hover:bg-red-500/20 border border-green-500/30 hover:border-red-500/30'
                          : pendingConnections.includes(creator.id)
                          ? 'bg-yellow-500/20 border border-yellow-500/30 cursor-wait'
                          : 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30'
                      }`}
                    >
                      {connectedUsers.includes(creator.id)
                        ? 'Connected'
                        : pendingConnections.includes(creator.id)
                        ? 'Pending...'
                        : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'connections' && (
          connectedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCreators
                .filter(creator => connectedUsers.includes(creator.id))
                .map(creator => (
                  <div key={creator.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {creator.name[0]}
                        </div>
                        <div>
                          <h3 className="font-light">{creator.name}</h3>
                          <p className="text-sm text-white/60">{creator.username}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs">
                        {creator.genre}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/40">{creator.followers} followers</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all text-xs">
                          Message
                        </button>
                        <button 
                          onClick={() => handleConnect(creator.id, creator.name)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all text-xs"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <h3 className="text-xl font-light text-white/60 mb-2">No connections yet</h3>
              <p className="text-sm text-white/40 mb-6">Start building your creator network</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all"
              >
                Discover Creators
              </button>
            </div>
          )
        )}

        {activeTab === 'invites' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {incomingRequests.length > 0 ? (
              <>
                <h3 className="text-lg font-light text-white/80 mb-4">Incoming Friend Requests</h3>
                {incomingRequests.map(request => (
                  <div key={request.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {request.name[0]}
                        </div>
                        <div>
                          <h4 className="font-light text-white">{request.name}</h4>
                          <p className="text-sm text-white/60">{request.username} • {request.followers} followers</p>
                          <p className="text-xs text-white/40 mt-1">{request.bio}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowProfileModal(request)}
                          className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all text-sm"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleAcceptRequest(request.id, request.name)}
                          className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all text-sm"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(request.id, request.name)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <h3 className="text-xl font-light text-white/60 mb-2">No pending invites</h3>
                <p className="text-sm text-white/40">Friend requests will appear here</p>
              </div>
            )}
            
            {/* Legacy invite display - can be removed */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-8 opacity-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div>
                    <h4 className="font-light">Jamie Author</h4>
                    <p className="text-sm text-white/60">Wants to connect</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all">
                    Accept
                  </button>
                  <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                    Decline
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div>
                    <h4 className="font-light">Creative Mind</h4>
                    <p className="text-sm text-white/60">Invited you to collaborate</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all">
                    Accept
                  </button>
                  <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-light">Creator Profile</h2>
              <button 
                onClick={() => setShowProfileModal(null)}
                className="text-white/60 hover:text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {showProfileModal.name?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-light">{showProfileModal.name}</h3>
                  <p className="text-white/60">{showProfileModal.username}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm text-white/40">{showProfileModal.followers} followers</span>
                    <span className="text-sm text-white/40">•</span>
                    <span className="text-sm text-white/40">{showProfileModal.genre}</span>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <h4 className="text-sm text-white/60 mb-2">About</h4>
                <p className="text-white/80">{showProfileModal.bio || 'No bio available'}</p>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h4 className="text-sm text-white/60 mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-sm text-white/60">Created story "The Last Adventure"</p>
                    <p className="text-xs text-white/40">2 days ago</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-sm text-white/60">Joined Angry Lips session</p>
                    <p className="text-xs text-white/40">5 days ago</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                {connectedUsers.includes(showProfileModal.id) ? (
                  <>
                    <button className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all">
                      Send Message
                    </button>
                    <button 
                      onClick={() => {
                        handleConnect(showProfileModal.id, showProfileModal.name, showProfileModal.email);
                        setShowProfileModal(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all"
                    >
                      Disconnect
                    </button>
                  </>
                ) : pendingConnections.includes(showProfileModal.id) ? (
                  <button disabled className="flex-1 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl cursor-wait">
                    Friend Request Pending...
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      handleConnect(showProfileModal.id, showProfileModal.name, showProfileModal.email);
                      setShowProfileModal(null);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all"
                  >
                    Send Friend Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
