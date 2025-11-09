import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Activity, Shield, Network, Cpu, Globe,
  TrendingUp, AlertTriangle, CheckCircle, BarChart3,
  Gauge, Waves, Binary, Atom, Hexagon, Radio,
  Battery, Power, Cable, Router, HardHat, MapPin,
  Sparkles, Brain, Wifi, ChevronRight, Play
} from 'lucide-react';
import { SEOHead, generateOrganizationSchema, generateSoftwareSchema, generateWebPageSchema } from '../components/seo/SEOHead';

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
  
  // Generate structured data for SEO
  const structuredData = {
    ...generateOrganizationSchema(),
    ...generateSoftwareSchema(),
    ...generateWebPageSchema(
      'FieldForge - AI Construction Management for Electrical T&D | 34% Efficiency Gains',
      'Revolutionary AI-powered platform for transmission lines, distribution systems & substations. Voice control, smart OCR, predictive analytics. Enterprise-ready.',
      'https://fieldforge.app'
    )
  };

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
    <>
      <SEOHead
        title="FieldForge - AI Construction Management for T&D | Voice Control, Smart OCR | 34% Efficiency"
        description="Revolutionary AI-powered construction management platform for electrical infrastructure. Transmission lines, distribution systems, substations. Voice-controlled operations, smart OCR, real-time analytics. 34% efficiency gains, 45% safer. Enterprise-ready for electrical contractors."
        keywords="construction management software, electrical construction, T&D construction, transmission lines, distribution systems, substations, AI construction, voice control construction, smart OCR, field management, construction safety, electrical contractors, power grid, utility construction, construction efficiency, digital construction, construction automation, project management, Quanta Services, electrical infrastructure, power line construction, grid modernization, construction technology, enterprise software, field operations, construction analytics"
        image="https://fieldforge.app/og-hero-image.png"
        url="https://fieldforge.app"
        type="website"
        canonical="https://fieldforge.app"
        structuredData={structuredData}
      />
      
      <main className="relative min-h-screen bg-black text-white overflow-hidden" role="main" itemScope itemType="https://schema.org/WebPage">
        {/* SEO: Hidden H1 for search engines */}
        <h1 className="sr-only">FieldForge - AI-Powered Construction Management Software for Electrical Infrastructure, Transmission Lines, Distribution Systems and Substations</h1>
      
      {/* Animated Background */}
      <div aria-hidden="true">
        <ElectricGridBackground />
      </div>
      
      {/* Cyberpunk Grid Overlay */}
      <div className="fixed inset-0 opacity-30" aria-hidden="true">
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
      <nav className="relative z-20 flex justify-between items-center p-6" role="navigation" aria-label="Main navigation">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform rotate-45" role="img" aria-label="FieldForge Logo">
              <Zap className="w-6 h-6 text-white transform -rotate-45" aria-hidden="true" />
            </div>
            <div className="absolute inset-0 bg-amber-500 rounded-xl blur-xl opacity-50 animate-pulse" aria-hidden="true" />
          </div>
          <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
            <span className="text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent" itemProp="name">
              FIELDFORGE
            </span>
            <div className="text-xs text-cyan-400 tracking-widest" itemProp="description">ELECTRICAL DIVISION</div>
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
            {/* Value Proposition Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-full animate-pulse">
              <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-green-300 font-semibold">Industry-Leading Platform • Enterprise-Ready • Proven ROI</span>
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
              The <span className="text-cyan-400 font-bold">first AI-native</span> platform purpose-built for T&D construction. 
              <span className="text-green-400 font-semibold"> Transformative efficiency gains.</span> 
              <span className="text-amber-400 font-semibold"> Unprecedented safety improvements.</span> 
              <span className="text-purple-400 font-semibold"> Complete digital transformation.</span>
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

            {/* Value Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2 p-3 bg-gradient-to-b from-green-900/30 to-green-900/10 border border-green-500/30 rounded-lg">
                <div className="text-3xl font-bold text-green-400">
                  <AnimatedCounter end={34} duration={2000} suffix="%" />
                </div>
                <div className="text-sm text-slate-400">Efficiency Gain</div>
              </div>
              <div className="space-y-2 p-3 bg-gradient-to-b from-amber-900/30 to-amber-900/10 border border-amber-500/30 rounded-lg">
                <div className="text-3xl font-bold text-amber-400">
                  <AnimatedCounter end={45} duration={2000} suffix="%" />
                </div>
                <div className="text-sm text-slate-400">Safer Operations</div>
              </div>
              <div className="space-y-2 p-3 bg-gradient-to-b from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">
                  <AnimatedCounter end={87} duration={2000} suffix="%" />
                </div>
                <div className="text-sm text-slate-400">Automation Rate</div>
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

      {/* Strategic Value Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                TRANSFORMATIVE VALUE PROPOSITION
              </span>
            </h2>
            <p className="text-xl text-slate-400">Why industry leaders choose FieldForge</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center">
                  <Globe className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Massive Market</h3>
                <p className="text-sm text-gray-400">Addressing the entire T&D infrastructure sector with unprecedented growth</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">AI-First Platform</h3>
                <p className="text-sm text-gray-400">12+ proprietary features including voice AI, smart OCR, predictive analytics</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                  <Activity className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Proven Impact</h3>
                <p className="text-sm text-gray-400">34% efficiency gains, 45% safety improvements, 87% automation rate</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Market Leader</h3>
                <p className="text-sm text-gray-400">First-mover advantage with 3-5 year technology lead</p>
              </div>
            </div>
            
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-400">Enterprise Ready</h4>
                    <p className="text-xs text-gray-400">Complete platform, production deployed</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-400">Industry Specific</h4>
                    <p className="text-xs text-gray-400">Built exclusively for T&D construction</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Gauge className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-400">Infinite Scale</h4>
                    <p className="text-xs text-gray-400">Supports unlimited users and projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        <div className="p-12 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-3xl border border-green-500/30 backdrop-blur-sm">
          <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-6">
            <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400 font-semibold">Strategic Acquisition Opportunity</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Own the Future of T&D Construction
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Complete platform ready for enterprise deployment. Transformative technology with proven ROI.
            <br/><span className="text-green-400 font-semibold">The only AI-native solution built specifically for electrical infrastructure.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/acquisition')}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/25"
            >
              View Acquisition Analysis
            </button>
            
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25"
            >
              Start Free Trial
            </button>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span>Enterprise Ready</span>
            </div>
            <div className="flex items-center text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span>Proven Technology</span>
            </div>
            <div className="flex items-center text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span>Immediate ROI</span>
            </div>
          </div>
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
      <style>{`
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
        /* SEO: Ensure sr-only class for screen readers */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </main>
    </>
  );
};
