import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, Zap, Shield, Brain, Smartphone, WifiOff, BarChart3, 
  Clock, Users, FileText, CheckCircle, ArrowRight, Play,
  TrendingUp, Award, Globe, Cpu, Sparkles, Construction,
  HardHat, AlertTriangle, MapPin, Gauge, Lock
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  demo?: string;
  stats?: string;
}

export const ShowcasePage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features: Feature[] = [
    {
      icon: Mic,
      title: "Voice-First Field Operations",
      description: "Update everything hands-free. Perfect for bucket trucks, confined spaces, and hazardous locations.",
      demo: "/demos/voice-control.mp4",
      stats: "45 min saved per worker daily"
    },
    {
      icon: Zap,
      title: "Built for Electrical Work",
      description: "Arc flash calculations, switching orders, grounding verification - we speak your language.",
      demo: "/demos/electrical-specific.mp4",
      stats: "100% IEEE compliance tracking"
    },
    {
      icon: Brain,
      title: "AI That Actually Helps",
      description: "OCR for meters, auto-generated reports, failure predictions, and intelligent crew assignments.",
      demo: "/demos/ai-features.mp4",
      stats: "80% less paperwork"
    },
    {
      icon: WifiOff,
      title: "Works Everywhere - Even Offline",
      description: "No signal at the substation? No problem. Full functionality offline with automatic sync.",
      demo: "/demos/offline-mode.mp4",
      stats: "100% uptime in dead zones"
    },
    {
      icon: Smartphone,
      title: "True Mobile-First Design",
      description: "44px+ touch targets for gloved hands. Works in portrait, landscape, tablet, or desktop.",
      demo: "/demos/mobile-first.mp4",
      stats: "95% field adoption rate"
    },
    {
      icon: Shield,
      title: "Safety at the Core",
      description: "Real-time incident tracking, permit workflows, JSA forms, and predictive safety analytics.",
      demo: "/demos/safety-features.mp4",
      stats: "73% reduction in incidents"
    }
  ];

  const stats = [
    { value: "500+", label: "Active Crews", icon: Users },
    { value: "45min", label: "Saved Daily/Worker", icon: Clock },
    { value: "95%", label: "Field Adoption", icon: TrendingUp },
    { value: "$18K", label: "Annual Savings/Worker", icon: BarChart3 }
  ];

  const comparisons = [
    { feature: "Voice Control", fieldforge: true, others: false },
    { feature: "Offline Mode", fieldforge: true, others: false },
    { feature: "Electrical-Specific", fieldforge: true, others: false },
    { feature: "Mobile-First", fieldforge: true, others: "Partial" },
    { feature: "AI Integration", fieldforge: true, others: "Limited" },
    { feature: "Real-Time Sync", fieldforge: true, others: true },
    { feature: "Safety Workflows", fieldforge: true, others: "Generic" },
    { feature: "Equipment Testing", fieldforge: true, others: false },
    { feature: "One Platform", fieldforge: true, others: false },
    { feature: "Field-Friendly", fieldforge: true, others: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
        <motion.div 
          style={{ opacity }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10"
        />
        
        {/* Sacred Geometry Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[618px] h-[618px] rounded-full border border-gray-700 
               style={{ transform: `translate(-50%, -50%) rotate(${scrollY * 0.03}deg)` }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/20 rounded-2xl backdrop-blur-xl">
                <Construction className="w-16 h-16 text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Construction Software
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                That Actually Works
              </span>
              <br />
              In The Field
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Voice-controlled. Offline-capable. Built specifically for electrical and T&D contractors 
              who need to get real work done in real conditions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-[21px] justify-center">
              <Link
                to="/signup"
                className="px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-[8px] transition-all transform hover:scale-105 flex items-center justify-center gap-[13px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all touch-golden "
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setIsPlaying(true)}
                className="px-[34px] py-[13px] bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-semibold rounded-[8px] transition-all transform hover:scale-105 flex items-center justify-center gap-[13px] border border-gray-700 touch-golden"
              >
                <Play className="w-5 h-5" />
                Watch 2-Min Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Industry Leader</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span>Works Everywhere</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-12 h-12 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Features That Actually Matter
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We didn't ask software developers what you need. 
              We asked linemen, foremen, and safety managers.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveFeature(index)}
                  className={`p-[21px] rounded-[13px] cursor-pointer transition-all card-vitruvian ${
                    activeFeature === index
                      ? 'bg-blue-500/20 border-2 border-gray-700 '
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10 '
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 mb-2">
                        {feature.description}
                      </p>
                      {feature.stats && (
                        <div className="text-blue-400 font-semibold">
                          {feature.stats}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    {React.createElement(features[activeFeature].icon, { className: "w-24 h-24 text-blue-400 mx-auto mb-4" })}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-slate-400">
                      Interactive demo coming soon
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Switch to FieldForge?
            </h2>
            <p className="text-xl text-slate-400">
              See how we stack up against generic construction software
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-3 text-center">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-slate-400">Feature</h3>
              </div>
              <div className="p-6 border-b border-white/10 bg-blue-500/10">
                <h3 className="text-lg font-semibold text-blue-400">FieldForge</h3>
              </div>
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-slate-400">Others</h3>
              </div>
            </div>
            
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-3 text-center"
              >
                <div className="p-4 border-b border-white/10 text-white">
                  {item.feature}
                </div>
                <div className="p-4 border-b border-white/10 bg-blue-500/10">
                  {item.fieldforge === true ? (
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                  ) : (
                    <span className="text-blue-400">{item.fieldforge}</span>
                  )}
                </div>
                <div className="p-4 border-b border-white/10">
                  {item.others === false ? (
                    <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
                  ) : item.others === true ? (
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                  ) : (
                    <span className="text-yellow-400">{item.others}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/20 to-amber-600/20 rounded-3xl p-12 text-center"
          >
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6">
              "FieldForge saved us 2 hours per crew per day. 
              That's $300,000 in productivity gains this year alone. 
              But the real win? Our guys actually use it."
            </blockquote>
            <cite className="text-lg text-slate-300">
              <span className="font-semibold">Mike Thompson</span>
              <br />
              Operations Manager, PowerGrid Contractors
            </cite>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Field Operations?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join 500+ crews already working smarter, safer, and faster with FieldForge.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/signup"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Start 30-Day Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                Schedule Live Demo
              </Link>
            </div>
            
            <p className="text-slate-400">
              No credit card required • Full access • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="w-24 h-24 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">Demo video coming soon</p>
              </div>
            </div>
          </motion.div>
          
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-white" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
