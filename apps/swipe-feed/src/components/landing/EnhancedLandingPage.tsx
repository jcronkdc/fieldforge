/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 * 
 * MythaTron™ - The World's First Democratic Creative Platform
 */

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { AuthPanel } from "../auth/AuthPanel";
import { PLATFORM_NAMES } from "../../config/naming";

export function EnhancedLandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Copyright Notice */}
      <div className="bg-black/50 text-white/70 text-xs py-2 px-4 text-center">
        © 2025 Cronk Companies, LLC. All Rights Reserved. | 100% Founded & Built by Cronk Companies, LLC
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              MythaTron<span className="text-purple-400">™</span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-200 mb-4">
              The World's First Democratic Creative Platform
            </p>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create stories with friends • Earn {PLATFORM_NAMES.currency} • Control what you see
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6 text-lg">
              <span className="bg-purple-500/30 px-4 py-2 rounded-full text-white">
                👶 Ages 7+
              </span>
              <span className="bg-blue-500/30 px-4 py-2 rounded-full text-white">
                🎮 Fun & Easy
              </span>
              <span className="bg-green-500/30 px-4 py-2 rounded-full text-white">
                💰 Earn Real Money
              </span>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4"
              >
                Join the Revolution
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:mythatron@proton.me'}
                className="bg-transparent border-2 border-purple-400 text-purple-300 hover:bg-purple-400/20 text-lg px-8 py-4"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* World's First Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            🌟 World's First Features 🌟
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Democratic Ad System */}
            <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 rounded-2xl p-8 border border-purple-500/30">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Democratic Advertising System (DAS)
              </h3>
              <p className="text-gray-200 mb-4">
                <strong>WORLD'S FIRST:</strong> Users vote on which companies can advertise. 
                40% of ALL ad revenue goes to creators and users!
              </p>
              <ul className="text-purple-200 space-y-2">
                <li>✅ You decide who advertises</li>
                <li>✅ Play games to earn {PLATFORM_NAMES.currency}</li>
                <li>✅ See exactly where money goes</li>
                <li>✅ 10% goes to help kids</li>
              </ul>
            </div>

            {/* Angry Lips */}
            <div className="bg-gradient-to-br from-red-800/50 to-orange-800/50 rounded-2xl p-8 border border-red-500/30">
              <div className="text-4xl mb-4">😤</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Angry Lips™ Collaborative Stories
              </h3>
              <p className="text-gray-200 mb-4">
                <strong>REVOLUTIONARY:</strong> Real-time collaborative storytelling where each person 
                adds one sentence. AI helps maintain coherence and can generate full stories from sessions.
              </p>
              <ul className="text-orange-200 space-y-2">
                <li>✅ Multiplayer creative sessions</li>
                <li>✅ AI-powered story enhancement</li>
                <li>✅ Publish to public feed</li>
                <li>✅ Earn {PLATFORM_NAMES.currency} for hosting</li>
              </ul>
            </div>

            {/* Fair Creator Economy */}
            <div className="bg-gradient-to-br from-green-800/50 to-teal-800/50 rounded-2xl p-8 border border-green-500/30">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Fair Creator Economy
              </h3>
              <p className="text-gray-200 mb-4">
                <strong>UNPRECEDENTED:</strong> Creators earn from every interaction. 
                No exploitation, no hidden fees. Transparent profit sharing on all platform revenue.
              </p>
              <ul className="text-green-200 space-y-2">
                <li>✅ {PLATFORM_NAMES.currency} rewards system</li>
                <li>✅ Creator marketplace (coming)</li>
                <li>✅ Direct user-to-creator payments</li>
                <li>✅ No middleman exploitation</li>
              </ul>
            </div>

            {/* Privacy First */}
            <div className="bg-gradient-to-br from-blue-800/50 to-indigo-800/50 rounded-2xl p-8 border border-blue-500/30">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Privacy & Ethics First
              </h3>
              <p className="text-gray-200 mb-4">
                <strong>INDUSTRY LEADING:</strong> Your data is NEVER sold. 
                Advanced anti-spam, anti-bot measures. More ethical than Facebook & X combined.
              </p>
              <ul className="text-blue-200 space-y-2">
                <li>✅ Zero data sales policy</li>
                <li>✅ Community moderation</li>
                <li>✅ Transparent algorithms</li>
                <li>✅ User-controlled experience</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            🚀 Coming Soon 🚀
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-2">🎬 Screenplay Engine</h3>
              <p className="text-gray-300">Convert any story into professional screenplay format</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold text-white mb-2">🎵 Song Engine</h3>
              <p className="text-gray-300">Transform stories into songs with AI-powered composition</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/50 to-lime-900/50 rounded-xl p-6 border border-green-500/20">
              <h3 className="text-xl font-bold text-white mb-2">📜 Poetry Engine</h3>
              <p className="text-gray-300">Create beautiful poetry from your narratives</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-xl p-6 border border-orange-500/20">
              <h3 className="text-xl font-bold text-white mb-2">🎮 MythaQuest RPG</h3>
              <p className="text-gray-300">Full D&D-style RPG with AI mercenaries</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/20">
              <h3 className="text-xl font-bold text-white mb-2">🖼️ Grok Imagine Integration</h3>
              <p className="text-gray-300">Generate images and videos from your stories</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 rounded-xl p-6 border border-pink-500/20">
              <h3 className="text-xl font-bold text-white mb-2">🏕️ Summer Camps</h3>
              <p className="text-gray-300">Free camps for kids funded by platform revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Our Mission</h2>
          <p className="text-xl text-gray-200 mb-6">
            MythaTron isn't just another platform. It's a movement to democratize creativity, 
            fairly compensate creators, and give users complete control over their digital experience.
          </p>
          <p className="text-lg text-purple-300 mb-6">
            Future charity initiatives will fund free summer camps for underprivileged children 
            and support efforts to stop human trafficking.
          </p>
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
            <p className="text-gray-200">
              <strong className="text-white">This platform is proprietary technology</strong> developed by 
              Cronk Companies, LLC. The code and concepts are protected by copyright and trade secret law. 
              Unauthorized use, copying, or distribution is strictly prohibited.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="text-white font-bold mb-2">Legal</h4>
              <p className="text-gray-400 text-sm">
                © 2025 Cronk Companies, LLC<br />
                All Rights Reserved<br />
                Proprietary & Confidential
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">Contact</h4>
              <p className="text-gray-400 text-sm">
                For inquiries:<br />
                <a href="mailto:mythatron@proton.me" className="text-purple-400 hover:text-purple-300">
                  mythatron@proton.me
                </a>
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">Important</h4>
              <p className="text-gray-400 text-sm">
                This application is 100% founded<br />
                and built by Cronk Companies, LLC.<br />
                Code reuse without permission is illegal.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <AuthPanel />
          </div>
        </div>
      )}
    </div>
  );
}
