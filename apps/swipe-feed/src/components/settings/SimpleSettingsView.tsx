/**
 * Simple Settings View - Account settings page
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface SimpleSettingsViewProps {
  profile: any;
  onNavigate: (view: FocusedView) => void;
  onSignOut: () => void;
}

export const SimpleSettingsView: React.FC<SimpleSettingsViewProps> = ({ 
  profile, 
  onNavigate, 
  onSignOut 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy' | 'notifications'>('profile');
  const [username, setUsername] = useState(profile?.username || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Save to localStorage for now
    localStorage.setItem('mythatron_profile', JSON.stringify({
      ...profile,
      username,
      email,
      bio
    }));
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile saved!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light">Settings</h1>
              <p className="text-sm text-white/60">Manage your account preferences</p>
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
            {(['profile', 'account', 'privacy', 'notifications'] as const).map(tab => (
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light mb-6">Account Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div>
                    <h3 className="font-medium">Account Type</h3>
                    <p className="text-sm text-white/60">Beta User</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400">
                    BETA
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div>
                    <h3 className="font-medium">Sparks Balance</h3>
                    <p className="text-sm text-white/60">Current balance</p>
                  </div>
                  <span className="text-yellow-300 font-bold">
                    {localStorage.getItem('mythatron_sparks') || '200'} ⚡
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div>
                    <h3 className="font-medium">Member Since</h3>
                    <p className="text-sm text-white/60">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={onSignOut}
                  className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light mb-6">Privacy Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">Public Profile</h3>
                    <p className="text-sm text-white/60">Allow others to see your profile</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">Show Online Status</h3>
                    <p className="text-sm text-white/60">Let others see when you're online</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">Allow Friend Requests</h3>
                    <p className="text-sm text-white/60">Others can send you connection requests</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">Session Invites</h3>
                    <p className="text-sm text-white/60">When someone invites you to Angry Lips</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">Story Updates</h3>
                    <p className="text-sm text-white/60">When stories you follow get new branches</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">Messages</h3>
                    <p className="text-sm text-white/60">When you receive new messages</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer">
                  <div>
                    <h3 className="font-medium">New Followers</h3>
                    <p className="text-sm text-white/60">When someone follows you</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
