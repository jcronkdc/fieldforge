/**
 * Ultra Spectacular Landing Page - The Ultimate Futuristic Experience
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthForm } from '../auth/AuthForm';

export default function UltraSpectacularLanding() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Animated particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2,
        opacity: Math.random() * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // Custom SVG Icons
  const SparkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
            fill="url(#spark-gradient)" stroke="url(#spark-gradient)" strokeWidth="0.5"/>
      <defs>
        <linearGradient id="spark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );

  const NetworkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 8V16M12 16L5 19M12 16L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const CreativeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15 9L22 10L17 15L18 22L12 18.5L6 22L7 15L2 10L9 9L12 2Z" 
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/>
    </svg>
  );

  const VoteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10V6C7 4.9 7.9 4 9 4H15C16.1 4 17 4.9 17 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
    </svg>
  );

  const features = [
    {
      icon: <CreativeIcon />,
      title: 'Angry Lips',
      description: 'Revolutionary collaborative storytelling with AI co-hosts',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <NetworkIcon />,
      title: 'BookWorm Network',
      description: 'Connect with creative minds across the multiverse',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <VoteIcon />,
      title: 'Democratic Ads',
      description: 'You vote. Creators earn. Community controls.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <SparkIcon />,
      title: 'Sparks Economy',
      description: 'Earn rewards for your creative contributions',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const stats = [
    { value: '100', label: 'Beta Spots', subtext: 'Limited Access' },
    { value: '500', label: 'Free Sparks', subtext: 'Launch Bonus' },
    { value: '40%', label: 'Creator Revenue', subtext: 'If ads approved' },
    { value: '0', label: 'Forced Ads', subtext: 'Your choice' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      {/* Progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
      }}>
        <div style={{
          height: '100%',
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 50%, #10b981 100%)',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
        }} />
      </div>

      {/* Dynamic gradient background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
        `,
        transition: 'background 0.5s ease',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px',
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}>
            {/* Left side - Content */}
            <div style={{ animation: 'fadeIn 1s ease-out' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                borderRadius: '9999px',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                marginBottom: '2rem',
              }}>
                <span style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  BETA ACCESS OPEN • LIMITED TO 100 CREATORS
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: '200',
                letterSpacing: '-0.02em',
                lineHeight: '1',
                marginBottom: '1.5rem',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  MythaTron
                </span>
              </h1>

              <p style={{
                fontSize: '1.5rem',
                fontWeight: '300',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '2rem',
                lineHeight: '1.4',
              }}>
                Where stories evolve through
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '400',
                }}>
                  collective imagination
                </span>
              </p>

              {/* Stats grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginTop: '3rem',
              }}>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '300',
                      background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginTop: '0.25rem',
                    }}>
                      {stat.label}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginTop: '0.125rem',
                    }}>
                      {stat.subtext}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div style={{
              animation: 'fadeIn 1s ease-out 0.3s both',
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
                  animation: 'rotate 20s linear infinite',
                }} />
                
                <div style={{ position: 'relative' }}>
                  <AuthForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          padding: '6rem 2rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(147, 51, 234, 0.02) 50%, transparent 100%)',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '200',
              textAlign: 'center',
              marginBottom: '4rem',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Revolutionary Features
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    padding: '2rem',
                    background: activeFeature === index 
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: activeFeature === index ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${feature.gradient.split(' ')[1]} 0%, ${feature.gradient.split(' ')[3]} 100%)`,
                    borderRadius: '1rem',
                    marginBottom: '1.5rem',
                  }}>
                    <div style={{ color: 'white' }}>
                      {feature.icon}
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '400',
                    marginBottom: '0.75rem',
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.6',
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DAS Explanation Section */}
        <section style={{
          padding: '6rem 2rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, transparent 100%)',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              borderRadius: '1.5rem',
              marginBottom: '2rem',
            }}>
              <VoteIcon />
            </div>

            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '200',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              You Control the Platform
            </h2>

            <p style={{
              fontSize: '1.25rem',
              fontWeight: '300',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              marginBottom: '3rem',
            }}>
              The Democratic Ad System (DAS) puts power in your hands.
              No ads unless the community votes to allow them.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginTop: '3rem',
            }}>
              {[
                { title: 'Community Votes', desc: 'on brand partnerships' },
                { title: 'Creators Earn 40%', desc: 'if ads are approved' },
                { title: 'Full Transparency', desc: 'on all revenue flows' },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Apps Section */}
        <section style={{
          padding: '6rem 2rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(147, 51, 234, 0.02) 100%)',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: '300',
              marginBottom: '2rem',
              color: 'rgba(255, 255, 255, 0.9)',
            }}>
              Mobile Apps in Development
            </h2>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}>
              {['iOS App Store', 'Google Play'].map((platform, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem 2.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                  }}>
                    {platform}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'rgba(147, 51, 234, 0.8)',
                  }}>
                    Q2 2025
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '3rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              © 2025 Cronk Companies, LLC. All Rights Reserved.
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.3)',
              marginTop: '0.5rem',
            }}>
              MythaTron™ is a trademark of Cronk Companies, LLC
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
