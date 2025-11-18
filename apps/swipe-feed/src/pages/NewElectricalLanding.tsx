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
  Layers,
  Video,
  MessageSquare,
  Share2,
  MousePointer
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
    description: 'Video calls, screen sharing, real-time messaging, and cursor control in one platform.'
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

const collaborationFeatures = [
  {
    icon: Video,
    title: 'Live Video Calls',
    description: 'HD video conferencing with Daily.co integration. Host team meetings, safety briefings, and site reviews without leaving the platform.'
  },
  {
    icon: Share2,
    title: 'Screen Sharing',
    description: 'Share drawings, documents, and live screens. Perfect for reviewing plans, coordinating installations, or troubleshooting issues in real-time.'
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Messaging',
    description: 'Secure team chat with project channels. Discuss safety concerns, coordinate schedules, and keep all communication in one place.'
  },
  {
    icon: MousePointer,
    title: 'Cursor Control',
    description: 'See where teammates are pointing in shared documents. Collaborate on engineering drawings and specifications together.'
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
        {/* Simplified Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
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
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 backdrop-blur-sm px-6 py-3 text-sm text-blue-200 border border-blue-400/30">
                  <Zap className="h-4 w-4" />
                  Enterprise T&D Construction Management
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </span>
              </div>
              
              <h1 className="mb-6 text-5xl font-bold text-white lg:text-7xl leading-tight">
                Power the
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent"> Grid </span>
                of Tomorrow
                <div className="text-2xl lg:text-4xl font-light text-blue-300 mt-2">
                  TRANSMISSION • DISTRIBUTION • SUBSTATIONS
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

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 mb-3">
                      <metric.icon className="h-7 w-7 text-blue-400" />
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-300 font-mono">{metric.value}</div>
                      <div className="text-sm text-slate-400 uppercase">{metric.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm text-white shadow-lg">
              <Layers className="h-4 w-4" />
              CONSTRUCTION CONTROL CENTER
            </span>
            <h2 className="mt-8 text-4xl font-bold text-slate-900 lg:text-5xl">
              Built for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Electrical </span>
              Construction
            </h2>
            <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto">
              Enterprise tools designed for transmission, distribution, and substation projects.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* Collaboration Features Section */}
      <section className="relative bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-500/30 px-5 py-2 text-sm text-blue-200">
              <Users className="h-4 w-4" />
              REAL-TIME COLLABORATION
            </span>
            <h2 className="mt-8 text-4xl font-bold text-white lg:text-5xl">
              Work Together,
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Anywhere</span>
            </h2>
            <p className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto">
              Built-in video conferencing, screen sharing, and real-time messaging powered by Daily.co. 
              Collaborate on projects without ever leaving the platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {collaborationFeatures.map((feature) => (
              <div key={feature.title} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Collaboration Benefits */}
          <div className="mt-12 bg-slate-800/30 rounded-2xl border border-slate-700 p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">Invite-Only</div>
                <div className="text-slate-300">Secure team access controls</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">Real-Time</div>
                <div className="text-slate-300">Instant updates across all users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">All-in-One</div>
                <div className="text-slate-300">No third-party tools needed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Section */}
      <section className="bg-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join the Early Access Program
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Help us build the electrical construction platform you've always wanted
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {earlyAdopterBenefits.map((benefit) => (
              <div key={benefit.title} className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                  <benefit.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-5 py-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300 text-sm font-medium">Currently in Development</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4 lg:text-4xl">
            Ready to Build the Future Together?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Be part of the next generation of electrical construction management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignupClick}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Join Early Access
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLoginClick}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Sign In
            </button>
          </div>

          <p className="mt-6 text-sm text-blue-100">
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
                <div className="text-xs text-slate-400 font-mono">password: FieldForge2025!Demo</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/20">
                <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Manager</div>
                <div className="text-white font-mono mb-1">manager@fieldforge.com</div>
                <div className="text-xs text-slate-400 font-mono">password: FieldForge2025!Demo</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-green-500/20">
                <div className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Administrator</div>
                <div className="text-white font-mono mb-1">admin@fieldforge.com</div>
                <div className="text-xs text-slate-400 font-mono">password: FieldForge2025!Demo</div>
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
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="/support" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
