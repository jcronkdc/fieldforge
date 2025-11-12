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
          <p className="text-xl text-slate-300 max-w-2xl">{description}</p>
        </div>
      </div>
    </>
  );
};

export default Landing;

