import React from 'react';
import {
  Building2,
  FilePlus,
  Upload,
  ClipboardCheck,
  HardHat,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SubstationManager: React.FC = () => {
  const nextSteps = [
    {
      title: 'Collect the latest one-line diagrams',
      description:
        'Store issued-for-construction drawings, switching procedures, and relay settings in a shared package so the field has the current revision.',
      icon: Layers
    },
    {
      title: 'Document commissioning checkpoints',
      description:
        'Capture inspection forms, test sheets, and energization approvals as you progress through construction, testing, and turnover.',
      icon: ClipboardCheck
    },
    {
      title: 'Record equipment readiness',
      description:
        'Log transformer deliveries, enclosure assembly, control house work, and punch-list items so everyone sees what is complete.',
      icon: HardHat
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
        <header className="space-y-3 border-b border-slate-800 pb-8">
          <p className="text-sm font-medium text-amber-300">Substation &amp; switchyard delivery</p>
          <h1 className="text-3xl font-semibold text-white">Keep every build package and outage plan aligned</h1>
          <p className="max-w-4xl text-base text-slate-300">
            FieldForge gives your team a central place to prepare work, document installation, and hand over
            commissioning records. Start by bringing in the current design set and outlining the major build stages.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Your workspace is ready to populate</h2>
            <p className="mt-2 text-sm text-slate-300">
              There are no substation projects stored yet. Upload the first job or connect to an existing project
              tracker to populate this view.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                to="/projects"
                className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 hover:bg-slate-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100/80">
                  <Building2 className="h-5 w-5 text-slate-900" />
                </span>
                <span>
                  <strong className="block text-white">Create a project</strong>
                  Define location, voltage class, and outage window basics.
                </span>
              </Link>
              <Link
                to="/documents"
                className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 hover:bg-slate-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100/80">
                  <Upload className="h-5 w-5 text-slate-900" />
                </span>
                <span>
                  <strong className="block text-white">Upload design set</strong>
                  Organise one-lines, plans, and relay drawings by revision.
                </span>
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="text-base font-semibold text-white">When data arrives</h3>
            <p className="mt-2 text-sm text-slate-300">
              This panel will show project status, outage timing, and commissioning readiness at a glance.
            </p>
            <div className="mt-4 rounded-md border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
              <FilePlus className="mb-2 h-5 w-5 text-amber-300" aria-hidden="true" />
              Import spreadsheets or integrate with your existing system of record to populate structure lists,
              equipment registers, and inspection forms.
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Recommended next steps</h2>
          <p className="mt-2 text-sm text-slate-300">
            Align transmission, distribution, and substation teams by working through these setup items.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nextSteps.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-3 text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100/80">
                    <Icon className="h-5 w-5 text-slate-900" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};


