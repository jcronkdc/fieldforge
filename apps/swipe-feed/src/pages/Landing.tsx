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
      <SimpleLandingPage />
    </>
  );
};

export default Landing;

