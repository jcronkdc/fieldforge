import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Activity, Shield, Network, Cpu, Globe,
  TrendingUp, AlertTriangle, CheckCircle, BarChart3,
  Gauge, Waves, Binary, Atom, Hexagon, Radio,
  Battery, Power, Cable, Router, HardHat, MapPin,
  Sparkles, Brain, Wifi, ChevronRight, Play
} from 'lucide-react';

// Animated Electric Grid Background
const ElectricGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const connections: any[] = [];
    
    // Create grid nodes (like electrical substations)
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        energy: Math.random()
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.energy = (particle.energy + 0.01) % 1;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle as substation node
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + particle.energy * 0.5})`;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `rgba(251, 191, 36, ${particle.energy * 0.3})`);
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw connections (transmission lines)
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - distance / 150) * 0.3})`;
            ctx.lineWidth = (1 - distance / 150) * 2;
            ctx.stroke();
            
            // Electric pulse animation
            if (Math.random() > 0.98) {
              const pulseX = p1.x + (p2.x - p1.x) * Math.random();
              const pulseY = p1.y + (p2.y - p1.y) * Math.random();
              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
              ctx.fill();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #000428, #004e92)' }}
    />
  );
};

// Holographic 3D Transmission Tower
const HolographicTransmissionTower = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        className="relative"
        style={{
          transform: `perspective(1000px) rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Main tower structure */}
        <div className="absolute inset-0 w-64 h-96">
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Tower structure */}
            <g stroke="url(#hologram-gradient)" strokeWidth="2" fill="none">
              {/* Main vertical lines */}
              <line x1="50" y1="0" x2="70" y2="300" />
              <line x1="150" y1="0" x2="130" y2="300" />
              <line x1="100" y1="0" x2="100" y2="300" />
              
              {/* Cross beams */}
              {[0, 50, 100, 150, 200, 250].map((y, i) => (
                <g key={i}>
                  <line x1={50 + i * 3} y1={y} x2={150 - i * 3} y2={y} />
                  <line x1={50 + i * 3} y1={y} x2={100} y2={y + 25} />
                  <line x1={150 - i * 3} y1={y} x2={100} y2={y + 25} />
                </g>
              ))}
              
              {/* Power lines */}
              <path d="M 0,50 Q 100,40 200,50" strokeDasharray="5,5" className="animate-pulse" />
              <path d="M 0,60 Q 100,50 200,60" strokeDasharray="5,5" className="animate-pulse" />
              <path d="M 0,70 Q 100,60 200,70" strokeDasharray="5,5" className="animate-pulse" />
            </g>
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="hologram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="100%" stopColor="#00ffff" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Electric sparks */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            >
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
          ))}
        </div>
        
        {/* Energy field effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-amber-500/20 blur-3xl animate-pulse" />
      </div>
    </div>
  );
};

// Animated Statistics Counter
const AnimatedCounter = ({ end, duration, suffix = '' }: { end: number; duration: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const FuturisticElectricalLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Power className="w-8 h-8" />,
      title: 'Transmission Line Management',
      description: 'AI-powered monitoring and maintenance of high-voltage transmission infrastructure with real-time fault detection.',
      color: 'from-amber-400 to-orange-600'
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'Distribution Network Control',
      description: 'Smart grid integration for efficient power distribution with load balancing and outage prediction.',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: 'Substation Automation',
      description: 'Digital twin technology for substation monitoring with predictive maintenance and automated switching.',
      color: 'from-purple-400 to-pink-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safety Compliance System',
      description: 'Real-time safety monitoring with AR-guided procedures and automatic OSHA compliance reporting.',
      color: 'from-green-400 to-emerald-600'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <ElectricGridBackground />
      
      {/* Cyberpunk Grid Overlay */}
      <div className="fixed inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform rotate-45">
              <Zap className="w-6 h-6 text-white transform -rotate-45" />
            </div>
            <div className="absolute inset-0 bg-amber-500 rounded-xl blur-xl opacity-50 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              FIELDFORGE
            </span>
            <div className="text-xs text-cyan-400 tracking-widest">ELECTRICAL DIVISION</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-slate-300 hover:text-cyan-400 transition-colors">Solutions</button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors">Technology</button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors">Resources</button>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 border border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-all"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Industry Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-amber-500/20 border border-cyan-500/50 rounded-full">
              <Radio className="w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
              <span className="text-sm text-cyan-300">Powering The Future of Electrical Construction</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                BUILD THE
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                POWER GRID
              </span>
              <br />
              <span className="text-white">OF TOMORROW</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-300 leading-relaxed">
              Advanced AI-powered platform for transmission line construction, distribution network management, 
              and substation automation. Designed for the future of electrical infrastructure.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/signup')}
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Building
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={() => navigate('/demo')}
                className="group px-8 py-4 bg-black/50 backdrop-blur border border-cyan-500 rounded-xl font-bold text-lg text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-amber-400">
                  <AnimatedCounter end={500} duration={2000} suffix="+" />
                </div>
                <div className="text-sm text-slate-400">Miles of Lines</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-cyan-400">
                  <AnimatedCounter end={150} duration={2000} suffix="+" />
                </div>
                <div className="text-sm text-slate-400">Substations</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">
                  <AnimatedCounter end={99} duration={2000} suffix="%" />
                </div>
                <div className="text-sm text-slate-400">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Visualization */}
          <div className="relative h-[600px] lg:h-[700px]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-amber-500/10 rounded-3xl backdrop-blur-sm border border-cyan-500/20">
              <HolographicTransmissionTower />
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute top-10 right-10 px-4 py-2 bg-black/70 backdrop-blur border border-cyan-500 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-sm">Live Grid Status</span>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-10 px-4 py-2 bg-black/70 backdrop-blur border border-amber-500 rounded-lg">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span className="text-sm">Load: 87.3 MW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Next-Generation Features
            </span>
          </h2>
          <p className="text-slate-400">Built for the future of electrical infrastructure</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 cursor-pointer
                ${activeFeature === index 
                  ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-500 scale-105 shadow-2xl shadow-cyan-500/25' 
                  : 'bg-black/50 border-slate-700 hover:border-slate-600'
                }
              `}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
              
              {activeFeature === index && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-amber-500/10 rounded-2xl animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Voice Control */}
          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Brain className="w-8 h-8 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold">AI Voice Control</h3>
            </div>
            <p className="text-slate-400">
              Hands-free operation for field workers. Control equipment, log data, and manage safety protocols with voice commands.
            </p>
          </div>

          {/* AR Visualization */}
          <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Hexagon className="w-8 h-8 text-cyan-400 mr-3" />
              <h3 className="text-xl font-bold">AR Visualization</h3>
            </div>
            <p className="text-slate-400">
              See underground cables, voltage levels, and safety zones through augmented reality on mobile devices.
            </p>
          </div>

          {/* Digital Twin */}
          <div className="p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-2xl border border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-amber-400 mr-3" />
              <h3 className="text-xl font-bold">Digital Twin</h3>
            </div>
            <p className="text-slate-400">
              Real-time 3D models of your entire electrical infrastructure with predictive maintenance capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="p-12 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-3xl border border-amber-500/30 backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Electrical Projects?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join leading electrical contractors building the smart grid of tomorrow.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-12 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-xl hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="fixed animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
            zIndex: 1
          }}
        >
          <Sparkles className="w-2 h-2 text-amber-400/30" />
        </div>
      ))}

      {/* Custom styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
