import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Zap, Brain, Layers, Globe, Wifi, 
  TrendingUp, Shield, Users, Smartphone, Headphones,
  ChevronRight, Play, Volume2, ArrowRight, Star,
  Activity, BarChart3, Bot, Gauge, Orbit, Cpu,
  Waves, Hexagon, Binary, Network, Atom
} from 'lucide-react';

// Futuristic animated background component
const FuturisticBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-amber-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          >
            <div className="w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-sm"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Holographic Display Component (CSS-based)
const HolographicDisplay = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-black/20 backdrop-blur-sm">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      
      {/* Rotating rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 border-2 border-cyan-400/10 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute inset-8 border-2 border-purple-400/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-16 border-2 border-pink-400/10 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Holographic UI Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="text-center animate-pulse">
          <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-hologram">
            FIELDFORGE™
          </h3>
          <p className="text-cyan-300/60 mt-2 text-sm md:text-lg tracking-widest">NEXT GENERATION</p>
        </div>
      </div>
    </div>
  );
};

// Social Feed Preview Component
const SocialFeedPreview = () => {
  const [posts] = useState([
    {
      id: 1,
      user: 'Sarah Chen',
      role: 'Site Supervisor',
      time: '2 min ago',
      content: 'Transformer installation complete on Pad 3. 🎯 Zero incidents, ahead of schedule.',
      likes: 47,
      comments: 12,
      type: 'achievement',
      image: '/api/placeholder/400/300'
    },
    {
      id: 2,
      user: 'Mike Rodriguez',
      role: 'Safety Lead',
      time: '15 min ago',
      content: 'New AR safety briefing just dropped. Review it in the app to stay aligned. 🥽⚡',
      likes: 89,
      comments: 23,
      type: 'safety',
      video: true
    },
    {
      id: 3,
      user: 'AI Assistant',
      role: 'FieldForge AI',
      time: '1 hour ago',
      content: "Weather alert: Optimal conditions for concrete pour tomorrow. I've pre-scheduled crews and equipment. Confirm?",
      likes: 156,
      comments: 45,
      type: 'ai',
      actionable: true
    }
  ]);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 hover:border-cyan-400/40 transition-all cursor-pointer group animate-slide-down"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div className="flex items-start space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {post.user[0]}
                </span>
              </div>
              {post.type === 'ai' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{post.user}</p>
                  <p className="text-cyan-400 text-xs">{post.role} • {post.time}</p>
                </div>
                <Sparkles className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-gray-200 mt-2">{post.content}</p>
              
              {post.video && (
                <div className="mt-3 relative rounded-lg overflow-hidden bg-gradient-to-r from-purple-600/20 to-cyan-600/20 p-8">
                  <Play className="w-8 h-8 text-white mx-auto" />
                </div>
              )}
              
              {post.actionable && (
                <div className="mt-3 flex space-x-2">
                  <button className="px-3 py-1 bg-cyan-500 text-black rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-colors">
                    Confirm
                  </button>
                  <button className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors">
                    Modify
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-4 mt-3 text-gray-400">
                <button className="flex items-center space-x-1 hover:text-cyan-400 transition-colors">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
                  <Waves className="w-4 h-4" />
                  <span className="text-xs">{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-pink-400 transition-colors">
                  <Network className="w-4 h-4" />
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Counter Animation
const AnimatedCounter = ({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment;
        if (next >= end) {
          clearInterval(timer);
          return end;
        }
        return next;
      });
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  
  return <span>{Math.floor(count).toLocaleString()}{suffix}</span>;
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 -z-20">
        <FuturisticBackground />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slide-down">
              <div className="relative">
                <Hexagon className="w-10 h-10 text-cyan-400" />
                <Zap className="w-5 h-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  FIELDFORGE
                </h1>
                <p className="text-xs text-gray-400 tracking-widest">THE FUTURE IS NOW</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:block">
                Features
              </button>
              <button className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:block">
                Technology
              </button>
              <button className="text-gray-300 hover:text-cyan-400 transition-colors hidden md:block">
                Vision
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-semibold hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:scale-105 active:scale-95 transition-all"
              >
                Enter the Future
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <HolographicDisplay />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
          <div className="animate-slide-down">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-xl rounded-full border border-cyan-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">Introducing the Future of Construction</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                BUILD
              </span>
              <br />
              <span className="text-white">THE IMPOSSIBLE</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The world's first <span className="text-cyan-400 font-semibold">social construction platform</span>. 
              Where AI meets steel. Where data builds skylines. Where the future is constructed daily.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-full font-bold text-lg hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span>Start Building</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full font-bold text-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch the Revolution</span>
              </button>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto animate-slide-down" style={{ animationDelay: '1s' }}>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400">
                <AnimatedCounter end={1847} suffix="+" />
              </div>
              <p className="text-gray-400 text-sm mt-1">Active Projects</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">
                <AnimatedCounter end={47329} suffix="+" />
              </div>
              <p className="text-gray-400 text-sm mt-1">Connected Workers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400">
                $<AnimatedCounter end={2.8} duration={3} suffix="B+" />
              </div>
              <p className="text-gray-400 text-sm mt-1">Value Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Feed Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Construction Gets Social
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time collaboration that feels like scrolling through the future. 
              Every update, every milestone, every breakthrough - shared instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className="animate-slide-down"
            >
              <SocialFeedPreview />
            </div>

            <div
              className="space-y-6"
            >
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Intelligence',
                  description: 'Our AI learns from every project, predicting issues before they happen.'
                },
                {
                  icon: Orbit,
                  title: 'Real-Time Sync',
                  description: 'Changes on-site reflect instantly across all devices. No delays, no confusion.'
                },
                {
                  icon: Network,
                  title: 'Connected Ecosystem',
                  description: 'From field to office, everyone stays in perfect sync through our social feed.'
                },
                {
                  icon: Atom,
                  title: 'Quantum Leap Forward',
                  description: 'This isn\'t an upgrade. It\'s a complete reimagination of construction management.'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="flex space-x-4 group cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Features From </span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tomorrow
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: 'Neural Project Management',
                color: 'from-cyan-400 to-blue-600',
                description: 'AI that thinks ahead, plans smarter, and adapts in real-time.'
              },
              {
                icon: Globe,
                title: 'Global Mesh Network',
                color: 'from-purple-400 to-pink-600',
                description: 'Connect with any project, anywhere, instantly. No boundaries.'
              },
              {
                icon: Shield,
                title: 'Predictive Safety Shield',
                color: 'from-green-400 to-emerald-600',
                description: 'Zero incidents through AI-powered hazard prediction.'
              },
              {
                icon: Gauge,
                title: 'Quantum Scheduling',
                color: 'from-orange-400 to-red-600',
                description: 'Optimize thousands of variables simultaneously.'
              },
              {
                icon: Layers,
                title: '4D Visualization',
                color: 'from-indigo-400 to-purple-600',
                description: 'See your project through time and space.'
              },
              {
                icon: Bot,
                title: 'Autonomous Reporting',
                color: 'from-pink-400 to-rose-600',
                description: 'Reports write themselves. Data flows like water.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{ animationDelay: `${index * 100}ms` }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
                  style={{ background: `linear-gradient(to right, ${feature.color})` }}
                ></div>
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:border-white/30 transition-all">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-12 md:p-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  The Future Waits for No One
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the revolution. Be part of the first generation to build with tomorrow's technology, today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-10 py-5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-full font-bold text-xl hover:shadow-[0_0_60px_rgba(0,255,255,0.6)] transition-all flex items-center space-x-3"
                >
                  <span>Begin Your Journey</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mt-12 flex items-center justify-center space-x-8 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span>Military-Grade Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-pink-400" />
                  <span>Global Scale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            © 2025 FieldForge™ | The Future of Construction
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="text-xs">Powered by</span>
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-xs">Advanced AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
