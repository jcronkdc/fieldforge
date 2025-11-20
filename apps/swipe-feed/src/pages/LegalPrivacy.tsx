import React from 'react';

export const LegalPrivacy: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-slate-300 mb-6">
          FieldForge is an early-stage platform under active development. This page describes the current, honest state of
          how we handle data during private beta.
        </p>
        <ul className="space-y-3 text-sm text-slate-300">
          <li>• Authentication and basic profile data are handled by Supabase.</li>
          <li>• We do not sell your data or share it with third parties for marketing.</li>
          <li>• Logs and telemetry are used only to improve stability, performance, and reliability.</li>
          <li>• As this is a beta, data schemas and retention policies may evolve as features are built.</li>
        </ul>
        <p className="mt-6 text-sm text-slate-400">
          For questions about privacy during the beta period, please reach out via the Support page.
        </p>
      </div>
    </main>
  );
};

export default LegalPrivacy;







