import React from 'react';

export const SupportPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-slate-300">
          FieldForge is in active development. During this phase, support is focused on a small group of early adopters.
        </p>
        <div className="space-y-3 text-sm text-slate-300">
          <p>For help during the beta:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the in-app contact or feedback workflows where available.</li>
            <li>Share reproducible steps and screenshots from LibreFox DevTools when reporting issues.</li>
            <li>Include which environment you are using (local dev, staging, or production).</li>
          </ul>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          As we move toward GA, we will publish full support SLAs and contact channels here.
        </p>
      </div>
    </main>
  );
};

export default SupportPage;








