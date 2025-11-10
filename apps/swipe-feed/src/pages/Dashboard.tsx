import React from 'react';
import { SEOHead, generateWebPageSchema } from '../components/seo/SEOHead';
import { Dashboard } from '../components/dashboard/Dashboard';

const title = 'FieldForge Dashboard — Project Performance & Safety Overview';
const description =
  'Monitor construction programs, safety metrics, and upcoming field priorities with real-time analytics from the FieldForge dashboard.';

export const DashboardPage: React.FC = () => {
  const structuredData = generateWebPageSchema(
    title,
    description,
    'https://fieldforge.app/dashboard'
  );

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        url="https://fieldforge.app/dashboard"
        structuredData={structuredData}
      />
      <Dashboard />
    </>
  );
};

export default DashboardPage;

