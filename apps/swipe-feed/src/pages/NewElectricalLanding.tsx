import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Shield,
  Activity,
  Users,
  BarChart3,
  CheckCircle,
  Star,
  Globe,
  Settings,
  Cpu,
  Layers
} from 'lucide-react';

const metrics = [
  { value: 'Beta', label: 'Early Access', icon: Activity },
  { value: 'New', label: 'Platform', icon: Users },
  { value: '2025', label: 'Launch Year', icon: BarChart3 },
  { value: 'Live', label: 'Development', icon: Shield }
];

const features = [
  {
    icon: Zap,
    title: 'Real-Time Operations',
    description: 'Monitor crews, equipment, and progress across all sites with live updates and instant notifications.'
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Digital JSAs, switching orders, and compliance tracking ensure every worker goes home safe.'
  },
  {
    icon: Settings,
    title: 'Smart Automation',
    description: 'AI-powered scheduling, automated reporting, and intelligent resource allocation.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Connect field crews, project managers, and executives in one unified platform.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights into project performance, cost tracking, and predictive maintenance.'
  },
  {
    icon: Globe,
    title: 'Enterprise Scale',
    description: 'Built for utilities and contractors managing multiple transmission and substation projects.'
  }
];

const earlyAdopterBenefits = [
  {
    title: "Early Access",
    description: "Be among the first to experience the next generation of electrical construction management software.",
    icon: Star
  },
  {
    title: "Shape the Product",
    description: "Your feedback directly influences feature development and helps build the perfect tool for your industry.",
    icon: Settings
  },
  {
    title: "Founder Access",
    description: "Direct communication with our team and priority support as we build the platform together.",
    icon: Users
  }
];

export const NewElectricalLanding: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSignupClick = useCallback(() => {
    try {
      navigate('/signup');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [navigate]);
  
  const handleLoginClick = useCallback(() => {
    try {
      navigate('/login');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Electrical Grid Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          
          {/* Transmission Tower Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800">
            <defs>
              <linearGradient id="powerLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Transmission Towers */}
            <g stroke="url(#powerLine)" strokeWidth="2" fill="none" filter="url(#glow)">
              <path d="M200 600 L250 200 L300 600 M250 200 L450 200"/>
              <path d="M500 600 L550 180 L600 600 M550 180 L750 180"/>
              <path d="M800 600 L850 220 L900 600 M850 220 L1050 220"/>
            </g>
            
            {/* Power Lines with Electric Arc Effect */}
            <g stroke="url(#powerLine)" strokeWidth="1" strokeDasharray="4,4" opacity="0.8">
              <path d="M200 350 Q350 320 500 350 Q650 380 800 350">
                <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite"/>
              </path>
              <path d="M200 380 Q350 350 500 380 Q650 410 800 380">
                <animate attributeName="stroke-dashoffset" values="8;0" dur="2s" repeatCount="indefinite"/>
              </path>
            </g>
            
            {/* Electrical Nodes with Pulse */}
            <g fill="#3B82F6" opacity="0.7">
              <circle cx="250" cy="200" r="6">
                <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="550" cy="180" r="6">
                <animate attributeName="r" values="6;8;6" dur="3s" begin="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" begin="1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="850" cy="220" r="6">
                <animate attributeName="r" values="6;8;6" dur="3s" begin="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" begin="2s" repeatCount="indefinite"/>
              </circle>
            </g>
          </svg>
          
          {/* Electric Arc Ambient Effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Substation Control Panel Grid */}
          <div className="absolute right-10 top-20 w-64 h-64 opacity-10">
            <div className="grid grid-cols-8 gap-1 w-full h-full">
              {Array.from({length: 64}).map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-sm ${Math.random() > 0.7 ? 'bg-blue-400' : 'bg-slate-600'} transition-all duration-1000`}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animation: Math.random() > 0.8 ? 'pulse 2s infinite' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FieldForge</h1>
              <p className="text-xs text-blue-300 uppercase tracking-wider">Electrical Construction Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="/pricing" className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium hidden md:block">
              Pricing
            </a>
            <a href="/showcase" className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium hidden md:block">
              Features
            </a>
            <button 
              onClick={handleLoginClick}
              className="px-6 py-2.5 text-white hover:text-blue-300 transition-colors font-medium border border-slate-700 rounded-lg hover:border-slate-600"
            >
              Sign In
            </button>
            <button 
              onClick={handleSignupClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 pb-20 pt-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm px-6 py-3 text-sm text-blue-200 border border-blue-400/40 shadow-lg shadow-blue-500/20">
                  <Zap className="h-4 w-4 animate-pulse" />
                  Enterprise T&D Construction Management
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </span>
              </div>
              
              <h1 className="mb-6 text-5xl font-bold text-white lg:text-7xl leading-tight">
                Power the
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-pulse"> Grid </span>
                of Tomorrow
                <div className="text-2xl lg:text-4xl font-light text-blue-300 mt-2 tracking-wider">
                  ⚡ TRANSMISSION • DISTRIBUTION • SUBSTATIONS ⚡
                </div>
              </h1>
              
              <p className="mx-auto mb-10 max-w-3xl text-xl text-slate-200 font-light leading-relaxed">
                Enterprise-grade construction management platform built specifically for electrical contractors.
                Streamline your transmission, distribution, and substation projects with real-time intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button 
                  onClick={handleSignupClick}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] hover:shadow-blue-500/25 flex items-center justify-center gap-3 border border-blue-400/20"
                >
                  Join Early Access
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleLoginClick}
                  className="px-10 py-4 bg-slate-800/80 backdrop-blur-md border-2 border-slate-600 text-white text-lg font-semibold rounded-xl hover:bg-slate-700/80 hover:border-slate-500 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  Learn More
                </button>
              </div>

              {/* Electrical Control Panel Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <div key={metric.label} className="group text-center">
                    <div className="relative mb-4">
                      {/* Control Panel Frame */}
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 shadow-xl relative overflow-hidden">
                        {/* Electric Arc Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                        
                        {/* Icon with Electric Glow */}
                        <metric.icon className="h-8 w-8 text-blue-300 relative z-10 drop-shadow-lg group-hover:text-blue-200 transition-colors" />
                        
                        {/* Control Panel Indicator Lights */}
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                        <div className="absolute top-1 left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                    </div>
                    
                    {/* Display Panel */}
                    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 group-hover:border-blue-500/50 transition-all">
                      <div className="text-3xl font-bold text-blue-300 font-mono tracking-wider">{metric.value}</div>
                      <div className="text-sm text-slate-300 uppercase tracking-wide font-semibold">{metric.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Electrical Control Room Style */}
      <section className="relative bg-gradient-to-b from-white to-slate-100 py-20">
        {/* Electrical Grid Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="electricGrid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#electricGrid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white shadow-xl shadow-blue-500/20 border-2 border-white/20">
              <Layers className="h-5 w-5 animate-pulse" />
              ELECTRICAL CONSTRUCTION CONTROL CENTER
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </span>
            <h2 className="mt-8 text-5xl font-bold text-slate-900 lg:text-6xl leading-tight">
              Building the Future of
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Electrical
              </span>
              <br />
              Construction
            </h2>
            <p className="mt-8 text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
              We're developing next-generation tools for transmission, distribution, and substation projects.
              Join us in revolutionizing how electrical construction gets done.
            </p>
          </div>

          {/* Electrical Control Panel Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="group relative">
                {/* Electrical Panel Frame */}
                <div className="h-full rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 border-4 border-slate-700 p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden">
                  
                  {/* Electric Circuit Lines */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 opacity-60"></div>
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500 opacity-60"></div>
                  
                  {/* Power Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <span className="text-xs text-green-400 font-mono">ONLINE</span>
                  </div>
                  
                  {/* Main Content */}
                  <div className="relative z-10">
                    {/* Control Panel Display */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30 border-2 border-white/20">
                          <feature.icon className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                        {/* Electric Arc Animation */}
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-sm animate-pulse"></div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{feature.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                          <span className="text-xs text-blue-300 font-mono">SYS_{(index + 1).toString().padStart(3, '0')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Control Panel Text Display */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4 mb-4">
                      <p className="text-slate-200 leading-relaxed">{feature.description}</p>
                    </div>
                    
                    {/* Control Switches */}
                    <div className="flex items-center gap-3 mt-6">
                      <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-2 h-6 rounded-full ${i === 1 ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-slate-600'} transition-all duration-300`}></div>
                        ))}
                      </div>
                      <span className="text-xs text-green-400 font-mono uppercase tracking-wider">OPERATIONAL</span>
                    </div>
                  </div>
                  
                  {/* Electrical Circuit Pattern */}
                  <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-10" viewBox="0 0 100 100">
                    <path d="M20 20 L80 20 L80 80 L20 80 Z M50 20 L50 80 M20 50 L80 50" stroke="#3B82F6" strokeWidth="1" fill="none"/>
                    <circle cx="20" cy="20" r="3" fill="#3B82F6"/>
                    <circle cx="80" cy="20" r="3" fill="#8B5CF6"/>
                    <circle cx="80" cy="80" r="3" fill="#3B82F6"/>
                    <circle cx="20" cy="80" r="3" fill="#8B5CF6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {/* Substation Status Panel */}
          <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl border-4 border-slate-700 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <h3 className="text-2xl font-bold text-white">GRID STATUS: ALL SYSTEMS OPERATIONAL</h3>
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500/30">
                  <div className="text-orange-400 text-2xl font-mono font-bold">DEV</div>
                  <div className="text-slate-300 text-sm">TRANSMISSION</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500/30">
                  <div className="text-orange-400 text-2xl font-mono font-bold">DEV</div>
                  <div className="text-slate-300 text-sm">DISTRIBUTION</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500/30">
                  <div className="text-orange-400 text-2xl font-mono font-bold">DEV</div>
                  <div className="text-slate-300 text-sm">SUBSTATION</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/30">
                  <div className="text-blue-400 text-2xl font-mono font-bold">LIVE</div>
                  <div className="text-slate-300 text-sm">DEMO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Section */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join the Early Access Program
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Help us build the electrical construction platform you've always wanted
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {earlyAdopterBenefits.map((benefit, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-6">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-slate-300 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-white font-semibold">Currently in Development</span>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6 lg:text-5xl">
            Ready to Build the Future Together?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Be part of the next generation of electrical construction management. 
            Join our early access program and help us create something amazing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignupClick}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Join Early Access
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLoginClick}
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              Sign In
            </button>
          </div>

          <p className="mt-8 text-sm text-blue-200">
            No credit card required • Early access • Help shape the future
          </p>
        </div>
      </section>

      {/* Demo Access Section */}
      <section className="bg-slate-900/50 py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Test Drive the Platform
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-blue-500/20">
                <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Field Worker</div>
                <div className="text-white font-mono mb-1">demo@fieldforge.com</div>
                <div className="text-xs text-slate-400 font-mono">password: demo123</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/20">
                <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Manager</div>
                <div className="text-white font-mono mb-1">manager@fieldforge.com</div>
                <div className="text-xs text-slate-400 font-mono">password: demo123</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-green-500/20">
                <div className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Administrator</div>
                <div className="text-white font-mono mb-1">admin@fieldforge.com</div>
                <div className="text-xs text-slate-400 font-mono">password: demo123</div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <a href="/pricing" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                View Transparent Pricing
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="text-slate-400">•</div>
              <a href="/acquisition-inquiry" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Enterprise Solutions & Acquisition
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">FieldForge</div>
                <div className="text-sm text-slate-400">Electrical Construction Platform</div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <span>© 2025 Cronk Companies LLC</span>
              <span>•</span>
              <button className="hover:text-white transition-colors">Privacy</button>
              <span>•</span>
              <button className="hover:text-white transition-colors">Terms</button>
              <span>•</span>
              <button className="hover:text-white transition-colors">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
