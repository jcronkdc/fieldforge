/**
 * FUTURISTIC BADASS LANDING PAGE
 * The most epic space-age experience ever created
 */

import React, { useState, useEffect, useRef } from "react";
import { AuthForm } from "../auth/AuthForm";

export const FuturisticLanding: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
      setMouseY((e.clientY / window.innerHeight) * 100);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animated stars background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: Array<{x: number, y: number, size: number, speed: number}> = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        ctx.fillStyle = `rgba(6, 182, 212, ${star.size})`;
        ctx.shadowBlur = star.size * 5;
        ctx.shadowColor = '#06b6d4';
        ctx.fillRect(star.x, star.y, star.size, star.size);
        
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Stars Canvas */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Gradient Overlays */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at ${mouseX}% ${mouseY}%, 
              rgba(6, 182, 212, 0.1) 0%, 
              transparent 40%
            ),
            radial-gradient(circle at ${100 - mouseX}% ${100 - mouseY}%, 
              rgba(59, 130, 246, 0.1) 0%, 
              transparent 40%
            )
          `,
          zIndex: 2
        }}
      />

      {/* Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(cyan 1px, transparent 1px),
            linear-gradient(90deg, cyan 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `perspective(500px) rotateX(60deg) translateY(-50%)`,
          transformOrigin: 'center',
          zIndex: 1
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b border-cyan-500/20 backdrop-blur-xl bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                MYTHATRON
              </h1>
              <div className="hidden md:flex items-center gap-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-sm text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  AI-POWERED
                </span>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-sm text-xs text-blue-400 font-bold uppercase tracking-wider">
                  NEXT-GEN
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openAuth("signin")}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all font-bold uppercase tracking-wider text-sm"
              >
                SIGN IN
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:scale-105"
              >
                START FREE
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Glowing Orb */}
            <div className="relative mb-12 inline-block">
              <div className="absolute inset-0 animate-pulse">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-3xl opacity-50"></div>
              </div>
              <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_100px_rgba(6,182,212,0.5)]">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-black">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M12 2v20"/>
                  <path d="M2 7h20"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                THE FUTURE
              </span>
              <span className="block text-3xl md:text-5xl mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                IS NOW
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light tracking-wide">
              ENTER THE NEXT DIMENSION OF
              <span className="block text-cyan-400 font-black mt-2 tracking-wider">
                AI-POWERED CREATION
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => openAuth("signup")}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg overflow-hidden transform hover:scale-105 transition-all"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="relative font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  LAUNCH NOW
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="text-white">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button className="px-8 py-4 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400 transition-all">
                <span className="font-black text-lg uppercase tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  WATCH DEMO
                </span>
              </button>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {[
                { 
                  title: "ANGRYLIPS", 
                  desc: "NEXT-GEN MAD LIBS",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <path d="M9 2L2 8l2 2 7-8M15 2l7 6-2 2-7-8"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  )
                },
                { 
                  title: "STORYFORGE", 
                  desc: "AI STORY ENGINE",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                      <line x1="10" y1="8" x2="16" y2="8"/>
                      <line x1="10" y1="12" x2="16" y2="12"/>
                    </svg>
                  )
                },
                { 
                  title: "SONGFORGE", 
                  desc: "AI MUSIC STUDIO",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  )
                },
                { 
                  title: "SCREENPLAY", 
                  desc: "SCRIPT WRITER",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="8" y1="13" x2="16" y2="13"/>
                      <line x1="8" y1="17" x2="16" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  )
                },
                { 
                  title: "MYTHAQUEST", 
                  desc: "EPIC RPG WORLDS",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      <path d="M12 9v6"/>
                      <path d="M12 17h.01"/>
                    </svg>
                  )
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group relative p-6 bg-black/50 border border-gray-800 rounded-lg hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:scale-105"
                  style={{
                    transform: `translateY(${Math.sin(Date.now() / 1000 + i) * 5}px)`
                  }}
                >
                  <div className="mb-3 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-black text-cyan-400 mb-1 tracking-wider text-center">{feature.title}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest text-center">{feature.desc}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="border-t border-cyan-500/20 bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {[
                { label: "USERS", value: "10K+" },
                { label: "STORIES", value: "50K+" },
                { label: "AI CALLS", value: "1M+" },
                { label: "UPTIME", value: "99.9%" },
                { label: "LATENCY", value: "<50ms" },
                { label: "RATING", value: "4.9★" }
              ].map((stat, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="text-2xl font-black text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tech Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 border border-cyan-500/20 rounded-lg animate-pulse" style={{ transform: `translateY(${Math.sin(Date.now() / 2000) * 10}px)` }}></div>
      <div className="fixed bottom-20 right-10 w-16 h-16 border border-blue-500/20 rounded-lg animate-pulse" style={{ transform: `translateX(${Math.cos(Date.now() / 2000) * 10}px)` }}></div>
      <div className="fixed top-1/2 left-20 w-12 h-12 border border-cyan-500/10 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
      <div className="fixed bottom-1/3 right-20 w-24 h-24 border border-blue-500/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="relative max-w-md w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-12 right-0 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Auth Form Container */}
            <div className="bg-gradient-to-b from-gray-900/95 via-black to-gray-900/95 rounded-lg border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.3)] p-8">
              <h2 className="text-2xl font-black mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider">
                {authMode === 'signin' ? 'WELCOME BACK' : 'JOIN THE FUTURE'}
              </h2>
              <AuthForm mode={authMode} />
              <div className="mt-6 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold uppercase tracking-wider"
                >
                  {authMode === 'signin' ? 'CREATE ACCOUNT' : 'ALREADY HAVE ACCOUNT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          from { transform: translateY(100vh) rotate(0deg); }
          to { transform: translateY(-100vh) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FuturisticLanding;