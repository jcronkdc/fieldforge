import React from 'react';
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
  { value: '500+', label: 'Active Projects', icon: Activity },
  { value: '10k+', label: 'Field Workers', icon: Users },
  { value: '99.9%', label: 'System Uptime', icon: BarChart3 },
  { value: '24/7', label: 'Support', icon: Shield }
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

const testimonials = [
  {
    quote: "FieldForge transformed how we manage our transmission projects. The real-time visibility and safety compliance features are game-changing.",
    author: "Sarah Chen",
    title: "VP of Operations",
    company: "Pacific Grid Solutions"
  },
  {
    quote: "We reduced project delays by 40% and improved safety compliance to 99.8%. The ROI was clear within the first quarter.",
    author: "Mike Rodriguez", 
    title: "Construction Manager",
    company: "National Power Corp"
  }
];

export const NewElectricalLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
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
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white hover:text-blue-300 transition-colors font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
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
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-300 border border-blue-500/30">
                  <Star className="h-4 w-4" />
                  Enterprise T&D Construction Management
                </span>
              </div>
              
              <h1 className="mb-6 text-5xl font-bold text-white lg:text-7xl">
                Build the
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Future </span>
                of Electrical Construction
              </h1>
              
              <p className="mx-auto mb-10 max-w-3xl text-xl text-slate-300 leading-relaxed">
                The only platform built specifically for transmission, distribution, and substation projects. 
                Streamline operations, ensure safety compliance, and deliver projects on time and under budget.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600 text-white text-lg font-semibold rounded-xl hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2"
                >
                  Watch Demo
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <div key={metric.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-3">
                      <metric.icon className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="text-3xl font-bold text-white">{metric.value}</div>
                    <div className="text-sm text-slate-400">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-2 text-sm text-blue-700 border border-blue-200">
              <Cpu className="h-4 w-4" />
              Built for Electrical Construction
            </span>
            <h2 className="mt-6 text-4xl font-bold text-slate-900 lg:text-5xl">
              Everything you need to manage complex projects
            </h2>
            <p className="mt-6 text-xl text-slate-700 max-w-3xl mx-auto">
              From initial planning to final energization, FieldForge provides the tools and insights 
              your teams need to deliver projects safely and efficiently.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="group relative">
                <div className="h-full rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{feature.description}</p>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              See what construction professionals are saying about FieldForge
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <div className="flex items-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-white mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.title}</div>
                    <div className="text-sm text-blue-300">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6 lg:text-5xl">
            Ready to Transform Your Construction Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of construction professionals who trust FieldForge to deliver 
            their most critical infrastructure projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              Sign In
            </button>
          </div>

          <p className="mt-8 text-sm text-blue-200">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
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
