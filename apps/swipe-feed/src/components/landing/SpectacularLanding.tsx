/**
 * Spectacular Landing Page - The Ultimate First Impression
 * Bulletproof implementation with stunning visuals
 */

import React from "react";
import { AuthForm } from "../auth/AuthForm";

// Simple icon components to avoid any import issues
const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 14.5L3 21L4.5 15.5L9.5 14.5Z"/>
    <path d="M14.5 9.5L21 3L15.5 4.5L14.5 9.5Z"/>
    <path d="M9 9C9 9 10 7 12 5C16 1 20 1 20 1S20 5 16 9C14 11 12 12 12 12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface SpectacularLandingProps {}

export const SpectacularLanding: React.FC<SpectacularLandingProps> = () => {
  const [showAuth, setShowAuth] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  const [mouseX, setMouseX] = React.useState(0);
  const [mouseY, setMouseY] = React.useState(0);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
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
      background: `
        radial-gradient(circle at ${mouseX * 0.05}% ${mouseY * 0.05}%, 
          rgba(139, 92, 246, 0.15) 0%, 
          transparent 50%
        ),
        radial-gradient(circle at ${100 - mouseX * 0.05}% ${100 - mouseY * 0.05}%, 
          rgba(6, 182, 212, 0.15) 0%, 
          transparent 50%
        ),
        linear-gradient(to bottom right, #0a0015, #000000, #000a15)
      `,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Animated Background Grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        opacity: 1
      }} />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: '2px',
            height: '2px',
            background: '#8b5cf6',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: '100%',
            boxShadow: '0 0 10px #8b5cf6',
            animation: `float ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* Navigation Bar */}
      <nav style={{
        position: 'relative',
        zIndex: 100,
        padding: '1.5rem 0',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              animation: 'logoGlow 3s ease-in-out infinite'
            }}>
              <SparklesIcon />
            </div>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #e0e0e0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              MythaTron
            </span>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => openAuth("signin")}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
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
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
              }}
            >
              Start Creating
              <span style={{ marginLeft: '0.25rem' }}>→</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: 'calc(100vh - 85px)',
        display: 'flex',
        alignItems: 'center',
        padding: '4rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{ 
          flex: 1, 
          maxWidth: '650px',
          zIndex: 2
        }}>
          {/* Beta Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '100px',
            marginBottom: '2rem',
            animation: 'badgePulse 2s ease-in-out infinite'
          }}>
            <span style={{ 
              display: 'inline-block',
              width: '8px',
              height: '8px',
              background: '#8b5cf6',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <span style={{ 
              color: '#a78bfa', 
              fontSize: '0.875rem', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Beta Access • Limited to 100 Users
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: '800',
            lineHeight: '1.05',
            letterSpacing: '-0.03em',
            marginBottom: '2rem'
          }}>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 5s ease infinite'
            }}>
              Create Stories
            </span>
            <span style={{
              display: 'block',
              marginTop: '0.5rem',
              WebkitTextStroke: '2px transparent',
              backgroundImage: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextStrokeColor: '#8b5cf6',
              WebkitTextFillColor: 'transparent'
            }}>
              That Come Alive
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '3rem',
            maxWidth: '90%'
          }}>
            The world's first AI-powered creative platform where stories evolve, 
            characters think, and writers earn real rewards. Join the revolution.
          </p>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '500', label: 'Free Sparks ✨' },
              { value: '100', label: 'Beta Spots' },
              { value: '40%', label: 'Creator Revenue (if ads approved)' }
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: '1',
                  minWidth: '140px',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.25rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => openAuth("signup")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.125rem 2rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease',
                animation: 'ctaPulse 3s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
              }}
            >
              <RocketIcon />
              Claim Your Spot
            </button>
            <button
              style={{
                padding: '1.125rem 2rem',
                background: 'transparent',
                border: '2px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '14px',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
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

        {/* Hero Visual */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          minHeight: '500px'
        }}>
          {/* Central Orb */}
          <div style={{
            position: 'relative',
            width: '400px',
            height: '400px',
            animation: 'float 6s ease-in-out infinite'
          }}>
            {/* Outer Ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, #8b5cf6, transparent, #06b6d4) 1',
              borderRadius: '50%',
              animation: 'rotate 20s linear infinite'
            }} />
            
            {/* Middle Ring */}
            <div style={{
              position: 'absolute',
              inset: '15%',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, #06b6d4, transparent, #8b5cf6) 1',
              borderRadius: '50%',
              animation: 'rotate-reverse 15s linear infinite'
            }} />
            
            {/* Inner Ring */}
            <div style={{
              position: 'absolute',
              inset: '30%',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, #8b5cf6, #06b6d4) 1',
              borderRadius: '50%',
              animation: 'rotate 25s linear infinite'
            }} />
            
            {/* Core */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'corePulse 3s ease-in-out infinite'
            }}>
              <div style={{
                fontSize: '3rem',
                color: '#8b5cf6',
                filter: 'drop-shadow(0 0 20px #8b5cf6)'
              }}>
                ✨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Apps Coming Soon */}
      <section style={{
        padding: '3rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '48px' }}>📱</span>
              <span style={{ fontSize: '48px' }}>🍎</span>
              <span style={{ fontSize: '48px' }}>🤖</span>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Mobile Apps in Development
            </h3>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6'
            }}>
              Native iOS and Android apps coming soon! Take MythaTron anywhere and create on the go.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              marginTop: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                🍎 iOS App Store - Q2 2025
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                🤖 Google Play - Q2 2025
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Democratic Ad System Explanation */}
      <section style={{
        padding: '6rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            borderRadius: '16px',
            marginBottom: '2rem',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)'
          }}>
            <span style={{ fontSize: '32px' }}>🗳️</span>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            You Control the Platform
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '800px',
            margin: '0 auto 2rem'
          }}>
            <strong style={{ color: '#8b5cf6' }}>MythaTron is 100% ad-free by default.</strong> No tracking, no interruptions, no exploitation.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: '24px', marginBottom: '1rem', display: 'block' }}>1️⃣</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: '#06b6d4' }}>
                Community Votes
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                Brands must apply and be approved by the community vote
              </p>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: '24px', marginBottom: '1rem', display: 'block' }}>2️⃣</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: '#8b5cf6' }}>
                Fair Revenue Split
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                40% to creators, 10% to charity, 50% for platform development
              </p>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: '24px', marginBottom: '1rem', display: 'block' }}>3️⃣</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: '#facc15' }}>
                Always Optional
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                Users can opt out anytime. Your experience, your choice
              </p>
            </div>
          </div>
          
          <p style={{
            marginTop: '2rem',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontStyle: 'italic'
          }}>
            This is the Democratic Ad System (DAS) - advertising reimagined for creators, not corporations.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '6rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '4rem' 
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Revolutionary Features
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Everything you need to create, compete, and earn
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { 
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="12" rx="2" ry="2"/>
                  <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0"/>
                  <path d="M6 11V7m0 10v-3m12-3V7m0 10v-3"/>
                </svg>
              ), 
              title: 'Angry Lips', 
              desc: 'Multiplayer story battles that are insanely fun',
              featured: true 
            },
            { 
              emoji: '🤖', 
              title: 'Genius AI', 
              desc: 'AI that learns your writing style perfectly' 
            },
            { 
              emoji: '⚔️', 
              title: 'Story Battles', 
              desc: 'Compete with AI judges and spectators' 
            },
            { 
              emoji: '🚫', 
              title: 'Ad-Free Platform', 
              desc: 'No ads unless YOU vote to allow them' 
            },
            { 
              emoji: '🗳️', 
              title: 'Democratic Ad System', 
              desc: 'Community votes on brands. Creators get 50% if approved.',
              featured: true 
            },
            { 
              emoji: '🎬', 
              title: 'Convert Everything', 
              desc: 'Story → Song → Screenplay → Poem',
              featured: true 
            },
            { 
              emoji: '🏰', 
              title: 'RPG System', 
              desc: 'Level up your writing with quests' 
            }
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                gridColumn: feature.featured ? 'span 2' : 'span 1',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {feature.featured && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.25rem 0.75rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Popular
                </div>
              )}
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {feature.emoji}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: 'white'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
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
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.98) 0%, rgba(25, 25, 25, 0.98) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              position: 'relative',
              boxShadow: `
                0 0 0 1px rgba(139, 92, 246, 0.1),
                0 20px 80px rgba(139, 92, 246, 0.3),
                0 10px 40px rgba(0, 0, 0, 0.8)
              `,
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAuth(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
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
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              <CloseIcon />
            </button>

            {/* Auth Content */}
            <div style={{ padding: '3rem 2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                }}>
                  <SparklesIcon />
                </div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: 'white'
                }}>
                  {authMode === "signin" ? "Welcome Back" : "Join Beta #1-100"}
                </h2>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {authMode === "signin" 
                    ? "Continue your creative journey" 
                    : "Get 500 free Sparks + Beta Badge"}
                </p>
              </div>
              
              {/* Placeholder for AuthForm */}
              <AuthForm 
                variant="panel"
                titleSignIn="Welcome Back to MythaTron"
                titleSignUp="Join the Creative Revolution"
              />
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          from { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          to { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 4px 30px rgba(139, 92, 246, 0.6); }
        }
        
        @keyframes badgePulse {
          0%, 100% { background: rgba(139, 92, 246, 0.1); }
          50% { background: rgba(139, 92, 246, 0.15); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 10px 50px rgba(139, 92, 246, 0.5); }
        }
        
        @keyframes corePulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

// Default export for maximum compatibility
export default SpectacularLanding;
