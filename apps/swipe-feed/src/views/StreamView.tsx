/**
 * Stream View - Live streaming content
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';
import type { FocusedView } from '../components/AuthenticatedAppV2';

interface StreamViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const StreamView: React.FC<StreamViewProps> = ({ profile, onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Stream</h1>
              <p className="text-sm text-white/60">Live content and updates</p>
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-white/20">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <h3 className="text-xl font-light text-white/60 mb-2">No active streams</h3>
                <p className="text-sm text-white/40">Check back later for live content</p>
              </div>
            </div>

            {/* Stream Info */}
            <div className="mt-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <h3 className="text-lg font-light mb-4">Upcoming Streams</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white">Creative Writing Workshop</h4>
                    <p className="text-sm text-white/60">Tomorrow at 3:00 PM</p>
                  </div>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all">
                    Remind Me
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white">Story Branch Collaboration</h4>
                    <p className="text-sm text-white/60">Friday at 7:00 PM</p>
                  </div>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all">
                    Remind Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-light mb-4">Live Chat</h3>
              <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl mb-4">
                <p className="text-sm text-white/40">Chat will appear during streams</p>
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 opacity-50"
              />
            </div>

            {/* Stream Stats */}
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl">
              <h4 className="text-sm font-medium text-purple-400 mb-3">Stream Benefits</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Live interaction with creators
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Exclusive content access
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Earn Sparks by participating
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
