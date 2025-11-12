import React from 'react';
import { SEOHead, generateWebPageSchema } from '../components/seo/SEOHead';
// Removed broken import - SimpleLandingPage doesn't exist

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
      {/* SimpleLandingPage component was removed - using placeholder */}
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-xl text-slate-300 max-w-2xl mb-8">{description}</p>
          <div className="flex gap-4 justify-center">
            <a href="/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              Get Started
            </a>
            <a href="/login" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;

