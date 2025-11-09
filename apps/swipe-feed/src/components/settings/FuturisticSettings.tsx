/**
 * FUTURISTIC SETTINGS - System Control Panel
 */

import React, { useState } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Props {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const FuturisticSettings: React.FC<Props> = ({ profile, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'privacy' | 'notifications' | 'appearance' | 'security'>('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    messages: true,
    mentions: true,
    updates: false,
    marketing: false
  });

  const sections = [
    { id: 'profile', label: 'PROFILE', icon: '👤' },
    { id: 'privacy', label: 'PRIVACY', icon: '🔒' },
    { id: 'notifications', label: 'ALERTS', icon: '🔔' },
    { id: 'appearance', label: 'DISPLAY', icon: '🎨' },
    { id: 'security', label: 'SECURITY', icon: '🛡️' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
              SYSTEM SETTINGS
            </h1>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-cyan-500/20 bg-black/60 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'hover:bg-white/5 text-gray-500 hover:text-cyan-400'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-bold uppercase tracking-wider text-sm">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {activeSection === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-6">USER PROFILE</h2>
              
              <div className="space-y-6">
                {/* Avatar */}
                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-4 block">AVATAR</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <button className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold uppercase tracking-wider text-xs hover:bg-cyan-500/20 transition-all">
                      CHANGE AVATAR
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">USERNAME</label>
                  <input
                    type="text"
                    defaultValue={profile?.username || 'USER'}
                    className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-cyan-400 focus:border-cyan-500 focus:outline-none uppercase"
                  />
                </div>

                {/* Bio */}
                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">BIO</label>
                  <textarea
                    rows={3}
                    placeholder="TELL US ABOUT YOURSELF..."
                    className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-600 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
                  SAVE CHANGES
                </button>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-6">PRIVACY CONTROLS</h2>
              
              <div className="space-y-4">
                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-wider text-sm">PROFILE VISIBILITY</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">WHO CAN SEE YOUR PROFILE</p>
                    </div>
                    <select className="px-3 py-1 bg-black/40 border border-gray-800 rounded-lg text-cyan-400 text-sm">
                      <option>EVERYONE</option>
                      <option>FRIENDS</option>
                      <option>PRIVATE</option>
                    </select>
                  </div>
                </div>

                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-wider text-sm">MESSAGE REQUESTS</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">ALLOW MESSAGES FROM</p>
                    </div>
                    <select className="px-3 py-1 bg-black/40 border border-gray-800 rounded-lg text-cyan-400 text-sm">
                      <option>EVERYONE</option>
                      <option>FRIENDS ONLY</option>
                    </select>
                  </div>
                </div>

                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-wider text-sm">DATA TRACKING</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">ANALYTICS & IMPROVEMENTS</p>
                    </div>
                    <button className="relative w-12 h-6 bg-gray-800 rounded-full transition-all">
                      <div className="absolute top-1 left-1 w-4 h-4 bg-cyan-400 rounded-full transition-all transform translate-x-6"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-6">ALERT PREFERENCES</h2>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">{key.toUpperCase()}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                          {key === 'messages' && 'NEW MESSAGES & REPLIES'}
                          {key === 'mentions' && 'WHEN SOMEONE MENTIONS YOU'}
                          {key === 'updates' && 'SYSTEM & FEATURE UPDATES'}
                          {key === 'marketing' && 'PROMOTIONAL CONTENT'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          value ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-gray-800'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all transform ${
                          value ? 'bg-cyan-400 translate-x-6' : 'bg-gray-600'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-6">DISPLAY SETTINGS</h2>
              
              <div className="space-y-4">
                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-wider text-sm">THEME</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">INTERFACE COLOR SCHEME</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        darkMode ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-gray-800'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all transform ${
                        darkMode ? 'bg-cyan-400 translate-x-6' : 'bg-gray-600'
                      }`}></div>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg hover:border-cyan-400 transition-all">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">CYBER</div>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:border-purple-400 transition-all">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">NEON</div>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-400 transition-all">
                      <div className="text-xs font-bold text-green-400 uppercase tracking-wider">MATRIX</div>
                    </button>
                  </div>
                </div>

                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">FONT SIZE</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="12"
                      max="20"
                      defaultValue="16"
                      className="flex-1"
                    />
                    <span className="text-cyan-400 font-bold w-12 text-right">16px</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-6">SECURITY CENTER</h2>
              
              <div className="space-y-4">
                <div className="bg-black/60 border border-red-500/20 rounded-lg p-6">
                  <h3 className="font-bold text-red-400 uppercase tracking-wider text-sm mb-4">TWO-FACTOR AUTH</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">ENHANCE ACCOUNT SECURITY</p>
                  <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold uppercase tracking-wider text-xs hover:bg-red-500/20 transition-all">
                    ENABLE 2FA
                  </button>
                </div>

                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">PASSWORD</h3>
                  <button className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold uppercase tracking-wider text-xs hover:bg-cyan-500/20 transition-all">
                    CHANGE PASSWORD
                  </button>
                </div>

                <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">ACTIVE SESSIONS</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-cyan-400">CHROME • WINDOWS</p>
                        <p className="text-xs text-gray-500">CURRENT SESSION</p>
                      </div>
                      <span className="text-xs text-green-400">ACTIVE</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 border border-orange-500/20 rounded-lg p-6">
                  <h3 className="font-bold text-orange-400 uppercase tracking-wider text-sm mb-2">DANGER ZONE</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">IRREVERSIBLE ACTIONS</p>
                  <button className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 font-bold uppercase tracking-wider text-xs hover:bg-orange-500/20 transition-all">
                    DELETE ACCOUNT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuturisticSettings;
