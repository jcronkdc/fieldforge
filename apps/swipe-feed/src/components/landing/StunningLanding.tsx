/**
 * Stunning Landing Page - Beautiful AND reliable
 * All styling inline for maximum reliability
 */

import { useState, useEffect } from "react";
import { Sparkles, Zap, Shield, Users, Rocket, Brain, Gamepad2, TrendingUp, ChevronRight, X, Star, Globe, Cpu } from "lucide-react";
import { AuthForm } from "../auth/AuthForm";

export function StunningLanding() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a0033 0%, #000000 50%), radial-gradient(ellipse at bottom, #001a33 0%, #000000 50%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Orbs */}
      <div style={{
        position: 'fixed',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-20%',
        left: '-10%',
        filter: 'blur(100px)',
        transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-20%',
        right: '-10%',
        filter: 'blur(100px)',
        transform: `translate(${-mousePos.x * 0.02}px, ${-mousePos.y * 0.02}px)`,
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'none'
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      {/* Navigation */}
      <nav style={{ 
        position: 'relative',
        zIndex: 100,
        padding: '1.75rem 0',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              borderRadius: '12px',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
            }}>
              <Sparkles size={24} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
              MythaTron
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => openAuth("signin")}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => openAuth("signup")}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.3)';
              }}
            >
              Start Creating
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ flex: 1, maxWidth: '600px' }}>
          {/* Beta Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '100px',
            marginBottom: '2.5rem'
          }}>
            <Zap size={16} color="#a78bfa" />
            <span style={{ color: '#a78bfa', fontSize: '0.875rem', fontWeight: '500' }}>
              Beta Access • Limited to 100 Users
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 7vw, 5rem)',
            fontWeight: '800',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '2rem'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Create Stories
            </span>
            <br />
            <span style={{
              WebkitTextStroke: '2px #8b5cf6',
              WebkitTextFillColor: 'transparent'
            }}>
              That Come Alive
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.25rem',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '3.5rem',
            maxWidth: '90%'
          }}>
            The world's first AI-powered creative platform where stories evolve,
            characters think, and writers earn real rewards.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginBottom: '3.5rem'
          }}>
            {[
              { number: '500', label: 'Free ✨' },
              { number: '100', label: 'Beta Spots' },
              { number: '50%', label: 'Revenue Share' }
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                minWidth: '120px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '0.25rem'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <button
              onClick={() => openAuth("signup")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
              }}
            >
              <Rocket size={20} />
              Claim Your Spot
            </button>
            <button
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                border: '2px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '16px',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Visual - Animated Hologram */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            width: '400px',
            height: '400px'
          }}>
            {/* Rotating Rings */}
            <div style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid #8b5cf6',
              borderRadius: '50%',
              opacity: 0.3,
              animation: 'rotate 20s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '10%',
              border: '2px solid #06b6d4',
              borderRadius: '50%',
              opacity: 0.3,
              animation: 'rotate-reverse 15s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '20%',
              border: '2px solid #a78bfa',
              borderRadius: '50%',
              opacity: 0.3,
              animation: 'rotate 25s linear infinite'
            }} />
            {/* Core */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 3s ease-in-out infinite'
            }}>
              <Sparkles size={80} color="#8b5cf6" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        position: 'relative',
        padding: '8rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Revolutionary Features
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            Technology that transforms creativity
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { icon: Gamepad2, title: 'Story Battles', desc: 'Compete in real-time creative duels with AI judges and live spectators', featured: true },
            { icon: Brain, title: 'Genius AI', desc: 'AI that learns your style and writes in your voice' },
            { icon: Shield, title: "Writer's Guild", desc: 'RPG progression with real benefits' },
            { icon: TrendingUp, title: 'Story Stocks', desc: 'Trade story popularity like stocks' },
            { icon: Users, title: 'Democratic Ads', desc: 'Users vote on ads, creators get 40% of revenue, charity gets 10%', featured: true }
          ].map((feature, i) => (
            <div 
              key={feature.title}
              style={{
                position: 'relative',
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
                gridColumn: feature.featured ? 'span 2' : 'span 1',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                borderRadius: '16px',
                marginBottom: '1.5rem'
              }}>
                <feature.icon size={32} color="#a78bfa" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem',
                letterSpacing: '-0.01em'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.7,
                fontSize: '0.95rem'
              }}>
                {feature.desc}
              </p>
              {feature.featured && (
                <div style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  padding: '0.375rem 0.75rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  World First
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <div
          onClick={() => setShowAuth(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '32px',
              boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.1), 0 30px 100px rgba(139, 92, 246, 0.4), 0 10px 40px rgba(0, 0, 0, 0.8)',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <button
              onClick={() => setShowAuth(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              <X size={24} />
            </button>
            <div style={{ padding: '3rem 2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  borderRadius: '16px'
                }}>
                  <Sparkles size={32} color="white" />
                </div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {authMode === "signin" ? "Welcome Back" : "Join the Beta"}
                </h2>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {authMode === "signin" 
                    ? "Continue your creative journey" 
                    : "Get 500 free Sparks instantly!"}
                </p>
              </div>
              <AuthForm variant="panel" />
            </div>
          </div>
        </div>
      )}

      {/* Inline Keyframes */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
