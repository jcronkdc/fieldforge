/**
 * EPIC ONBOARDING EXPERIENCE
 * The most badass signup flow ever created
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onComplete: (profile: any) => void;
}

export const EpicOnboarding: React.FC<Props> = ({ onComplete }) => {
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [vibe, setVibe] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  
  const steps = [
    {
      title: "WELCOME TO THE FUTURE",
      subtitle: "YOU'RE ABOUT TO ENTER SOMETHING LEGENDARY",
      content: "intro"
    },
    {
      title: "CLAIM YOUR IDENTITY",
      subtitle: "WHAT SHALL THE DIGITAL REALM CALL YOU?",
      content: "username"
    },
    {
      title: "CHOOSE YOUR VIBE",
      subtitle: "HOW DO YOU WANT TO CREATE?",
      content: "vibe"
    },
    {
      title: "READY TO ASCEND?",
      subtitle: "YOUR CREATIVE JOURNEY BEGINS NOW",
      content: "complete"
    }
  ];

  const vibes = [
    { id: 'creator', name: 'CREATOR', desc: 'Build worlds with words', icon: Icons.StoryForge, color: 'purple' },
    { id: 'composer', name: 'COMPOSER', desc: 'Forge melodies from dreams', icon: Icons.SongForge, color: 'pink' },
    { id: 'gamer', name: 'GAMER', desc: 'Compete in creative battles', icon: Icons.Fire, color: 'orange' },
    { id: 'explorer', name: 'EXPLORER', desc: 'Discover infinite possibilities', icon: Icons.MythaQuest, color: 'cyan' },
    { id: 'visionary', name: 'VISIONARY', desc: 'See beyond the horizon', icon: Icons.Sparkle, color: 'yellow' }
  ];

  const epicPhrases = [
    "INITIALIZING GREATNESS...",
    "LOADING INFINITE CREATIVITY...",
    "PREPARING YOUR DIGITAL THRONE...",
    "UNLOCKING THE MULTIVERSE...",
    "CALIBRATING AWESOME LEVELS...",
    "ENGAGING HYPERDRIVE...",
    "SUMMONING THE MUSES...",
    "ACTIVATING GENIUS MODE..."
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    if (step === 0) {
      const interval = setInterval(() => {
        setCurrentPhrase(prev => (prev + 1) % epicPhrases.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleComplete = () => {
    const profile = {
      username,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      vibe,
      createdAt: Date.now(),
      level: 1,
      xp: 0,
      achievements: ['PIONEER']
    };

    localStorage.setItem('mythatron_username', username);
    localStorage.setItem('mythatron_profile', JSON.stringify(profile));
    localStorage.setItem('mythatron_onboarding_completed', 'true');
    
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
        
        {/* Floating particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className={`max-w-2xl w-full transition-all duration-1000 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          
          {/* Step 0: Epic Introduction */}
          {step === 0 && (
            <div className="text-center">
              <div className="mb-8">
                <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  MYTHATRON
                </h1>
                <p className="text-xl md:text-2xl text-cyan-400 mt-4 font-bold tracking-wider">
                  {epicPhrases[currentPhrase]}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-400 text-lg">
                  You're not just signing up. You're joining a revolution.
                </p>
                <p className="text-white text-xl font-bold">
                  Where stories breathe. Music lives. Games evolve.
                </p>
                <p className="text-purple-400 text-lg italic">
                  And YOU become the creator of worlds.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setStep(1);
                    setIsAnimating(false);
                  }, 500);
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-black text-xl uppercase tracking-wider hover:from-cyan-400 hover:to-purple-400 transform hover:scale-105 transition-all shadow-[0_0_30px_rgba(147,51,234,0.5)]"
              >
                BEGIN THE JOURNEY
              </button>
            </div>
          )}

          {/* Step 1: Username */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                {steps[step].title}
              </h2>
              <p className="text-cyan-400 text-lg mb-8">
                {steps[step].subtitle}
              </p>

              <div className="mb-8">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ENTER YOUR LEGENDARY NAME..."
                  className="w-full px-6 py-4 bg-black/60 border-2 border-cyan-500/30 rounded-xl text-white text-xl placeholder-gray-500 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] outline-none uppercase tracking-wider text-center"
                  autoFocus
                />
                
                {username && (
                  <p className="mt-4 text-purple-400 italic">
                    "{username}" shall echo through the digital cosmos...
                  </p>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(0)}
                  className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-600 transition-all font-bold uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (username.trim()) {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setStep(2);
                        setIsAnimating(false);
                      }, 500);
                    }
                  }}
                  disabled={!username.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-purple-400 transition-all"
                >
                  Claim It
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Vibe */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                {steps[step].title}
              </h2>
              <p className="text-cyan-400 text-lg mb-8">
                {steps[step].subtitle}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {vibes.map(v => {
                  const IconComponent = v.icon;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        vibe === v.id
                          ? `bg-${v.color}-500/20 border-${v.color}-400 shadow-[0_0_30px_rgba(147,51,234,0.5)]`
                          : 'bg-black/40 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <IconComponent size={32} className={`text-${v.color}-400 mx-auto mb-3`} />
                      <h3 className="font-black text-white uppercase tracking-wider mb-1">
                        {v.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {v.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-600 transition-all font-bold uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (vibe) {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setStep(3);
                        setIsAnimating(false);
                      }, 500);
                    }
                  }}
                  disabled={!vibe}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-purple-400 transition-all"
                >
                  Lock It In
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  WELCOME, {username.toUpperCase()}!
                </h2>
                <p className="text-xl text-white mb-2">
                  Your legend begins now.
                </p>
                <p className="text-cyan-400 italic">
                  The {vibes.find(v => v.id === vibe)?.name} has awakened...
                </p>
              </div>

              <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-purple-400 mb-4">YOUR STARTING POWERS:</h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <Icons.Spark size={20} className="text-yellow-400" />
                    <span className="text-white">100 Sparks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Fire size={20} className="text-orange-400" />
                    <span className="text-white">AngryLips Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.StoryForge size={20} className="text-purple-400" />
                    <span className="text-white">StoryForge Unlocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.AIAssistant size={20} className="text-cyan-400" />
                    <span className="text-white">AI Assistant Ready</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-black text-xl uppercase tracking-wider hover:from-green-400 hover:to-emerald-400 transform hover:scale-105 transition-all shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              >
                ENTER MYTHATRON
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-5px); }
        }
      `}</style>
    </div>
  );
};
