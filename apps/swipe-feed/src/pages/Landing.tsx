import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead, generateWebPageSchema } from '../components/seo/SEOHead';
import { ArrowRight, Sparkles } from 'lucide-react';

const title = 'FieldForge — Enterprise-Grade Construction Management';
const description =
  'Plan, coordinate, and deliver transmission and substation projects with AI-assisted scheduling, safety workflows, and real-time collaboration.';

export const Landing: React.FC = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <Link to="/showcase" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-8 hover:bg-amber-500/30 transition-colors">
            <Sparkles className="w-4 h-4" />
            See What Makes Us Different
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Construction Management
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Built for the Field
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12">
            Voice-controlled, offline-capable, and designed specifically for electrical contractors. 
            Finally, software that works as hard as you do.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/signup" 
              className="group px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/showcase" 
              className="px-8 py-4 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              Explore Features
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              500+ Active Crews
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              95% Field Adoption
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              45 Min Saved Daily
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;

