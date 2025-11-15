import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead, generateWebPageSchema } from '../components/seo/SEOHead';
import { ArrowRight, Sparkles, Compass, Cog, Ruler } from 'lucide-react';

const title = 'FieldForge — Enterprise-Grade Construction Management';
const description =
  'Plan, coordinate, and deliver transmission and substation projects with AI-assisted scheduling, safety workflows, and real-time collaboration.';

export const Landing: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const structuredData = generateWebPageSchema(
    title,
    description,
    'https://fieldforge.app/'
  );

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        url="https://fieldforge.app/"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Sacred Geometry Layers */}
        <div className="absolute inset-0">
          {/* Technical Blueprint Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(218, 165, 32, 0.1) 0px, transparent 1px, transparent 61.8px, rgba(218, 165, 32, 0.1) 61.8px),
                             repeating-linear-gradient(90deg, rgba(218, 165, 32, 0.1) 0px, transparent 1px, transparent 61.8px, rgba(218, 165, 32, 0.1) 61.8px)`
          }} />
          
          {/* Technical Compass Rose */}
          <div className=" top-10 right-10" />
          
          {/* Vitruvian Circle Overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[618px] h-[618px] rounded-full border border-gray-700 
               style={{ transform: `translate(-50%, -50%) rotate(${scrollY * 0.05}deg)` }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[382px] h-[382px] rounded-full border border-gray-700 
               style={{ transform: `translate(-50%, -50%) rotate(-${scrollY * 0.08}deg)` }} />
          
          {/* Renaissance Glow Orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" 
               style={{ transform: `translateZ(${scrollY * 0.1}px)` }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" 
               style={{ transform: `translateZ(${scrollY * 0.15}px)` }} />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Technical Drawing Accent */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-10">
            <Compass className="w-24 h-24 text-blue-400" style={{ transform: `rotate(${scrollY * 0.2}deg)` }} />
          </div>
          
          {/* Spiral Path Decoration */}
          
          <Link to="/showcase" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 rounded-full text-sm font-medium mb-8 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
            See What Makes Us Different
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight relative">
            {/* Technical Line Accent */}
            <div className="absolute -left-[55px] top-1/2 transform -translate-y-1/2 hidden lg:block">
              <Ruler className="w-[34px] h-[34px] text-blue-400/20" />
            </div>
            <span className="">Construction Management</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#B87333] to-amber-600 text-blueprint">
              Built for the Field
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Voice-controlled, offline-capable, and designed specifically for electrical contractors. 
            <br className="hidden md:block" />
            <span className="text-[#DAA520]/60 font-medium">Finally, software that works as hard as you do.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-[21px] justify-center mb-[55px] ">
            <Link 
              to="/signup" 
              className="group px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-[13px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all touch-golden  relative overflow-hidden "
            >
              <span className="relative z-10">Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </Link>
            <Link 
              to="/showcase" 
              className="px-[34px] py-[13px] bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-[8px] font-semibold transition-all transform hover:scale-105 border border-gray-700 touch-golden relative"
            >
              <span className="relative z-10">Explore Features</span>
            </Link>
            <Link 
              to="/contact" 
              className="px-[34px] py-[13px] border-2 border-gray-700 hover:border-gray-700 text-blue-300 hover:bg-blue-500/5 rounded-[8px] font-semibold transition-all transform hover:scale-105 border border-gray-700 touch-golden relative"
            >
              <span className="relative z-10">Request Demo</span>
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-[34px] justify-center items-center text-sm text-slate-400 relative mb-[55px]">
            {/* Technical Gear Decoration */}
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-5">
              <Cog className="w-16 h-16 text-blue-400" style={{ animation: ' 20s linear infinite' }} />
            </div>
            
            <div className="flex items-center gap-[8px] " >
              <div className="w-[8px] h-[8px] bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">500+ Active Crews</span>
            </div>
            <div className="flex items-center gap-[8px] " >
              <div className="w-[8px] h-[8px] bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">95% Field Adoption</span>
            </div>
            <div className="flex items-center gap-[8px] " >
              <div className="w-[8px] h-[8px] bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">45 Min Saved Daily</span>
            </div>
          </div>
          
          {/* Add pricing and acquisition links */}
          <div className="mt-[55px] text-center space-y-[13px]">
            <Link
              to="/pricing"
              className="text-blue-400 hover:text-blue-300 font-semibold text-base transition-colors  block" 
            >
              View Transparent Pricing →
            </Link>
            <Link
              to="/acquisition-inquiry"
              className="text-blue-400/80 hover:text-blue-300 font-medium text-sm transition-colors  block" 
            >
              Interested in Acquiring or Custom Development? →
            </Link>
          </div>
          
          {/* Demo Credentials - Always visible for testing */}
          <div className="mt-[55px] p-[21px] bg-blue-400/10 border border-gray-700 rounded-[13px] border border-gray-700">
            <h3 className="text-sm font-semibold text-blue-400 mb-[13px] " >
              Demo Credentials
            </h3>
            <div className="grid md:grid-cols-3 gap-[13px] text-sm text-blue-400/80">
              <div>
                <span className="font-medium">Field Worker:</span>
                <div className="text-white">demo@fieldforge.com</div>
                <div className="text-xs text-blue-400/60">password: demo123</div>
              </div>
              <div>
                <span className="font-medium">Manager:</span>
                <div className="text-white">manager@fieldforge.com</div>
                <div className="text-xs text-blue-400/60">password: demo123</div>
              </div>
              <div>
                <span className="font-medium">Admin:</span>
                <div className="text-white">admin@fieldforge.com</div>
                <div className="text-xs text-blue-400/60">password: demo123</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Landing;

