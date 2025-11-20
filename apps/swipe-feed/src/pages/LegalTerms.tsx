import React from 'react';

export const LegalTerms: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
        <p className="text-slate-300 mb-6">
          FieldForge is currently in a private beta phase. By using this site, you acknowledge that features are evolving
          and that the service may change, break, or be unavailable without notice.
        </p>
        <ul className="space-y-3 text-sm text-slate-300">
          <li>• The platform is provided “as is” during beta, with no uptime guarantees.</li>
          <li>• You are responsible for verifying any data exported from the system before using it operationally.</li>
          <li>• We may modify or remove features as we iterate toward a stable release.</li>
        </ul>
        <p className="mt-6 text-sm text-slate-400">
          A full commercial terms-of-service document will be provided prior to general availability.
        </p>
      </div>
    </main>
  );
};

export default LegalTerms;







