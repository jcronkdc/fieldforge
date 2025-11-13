import React from 'react';
import { SEOHead, generateWebPageSchema } from '../components/seo/SEOHead';
import { Settings } from '../components/settings/Settings';

const title = 'FieldForge Settings — Manage Application Preferences';
const description =
  'Adjust notifications, security, and workspace preferences for your FieldForge account.';

export const SettingsPage: React.FC = () => {
  const structuredData = generateWebPageSchema(
    title,
    description,
    'https://fieldforge.app/settings'
  );

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        url="https://fieldforge.app/settings"
        structuredData={structuredData}
      />
      <Settings />
    </>
  );
};

export default SettingsPage;

