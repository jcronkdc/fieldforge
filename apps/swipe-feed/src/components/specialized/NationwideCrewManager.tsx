import React from 'react';
import { Users, MapPin, Calendar, ClipboardList, Truck, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NationwideCrewManager: React.FC = () => {
  const onboardingSteps = [
    'Import or create your crew roster with roles, certifications, and home base information.',
    'Outline upcoming mobilizations, outages, and switching windows that require staffing.',
    'Attach safety packages, job hazard analyses, and tailboard templates for each location.'
  ];

  const coordinationIdeas = [
    {
      title: 'Crew availability',
      description: 'Track when crews are on-site, traveling, or standing by so planners can adjust assignments before drive time.',
      icon: Users
    },
    {
      title: 'Geography awareness',
      description: 'Map crews to structures, spans, or substations to see coverage gaps and avoid duplicate dispatches.',
      icon: MapPin
    },
    {
      title: 'Logistics & equipment',
      description: 'Note required tooling, specialty vehicles, and permit requirements for each mobilization.',
      icon: Truck
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
        <header className="space-y-3 border-b border-slate-800 pb-8">
          <p className="text-sm font-medium text-amber-300">Crew coordination</p>
          <h1 className="text-3xl font-semibold text-white">Give every crew the information they need before wheels-up</h1>
          <p className="max-w-4xl text-base text-slate-300">
            FieldForge helps construction management, safety, and logistics plan work across transmission, distribution,
            and substation projects. Start by importing your roster and the next few weeks of work.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">No crews have been added yet</h2>
            <p className="mt-2 text-sm text-slate-300">
              Upload a roster or connect to your HR or resource system to start tracking availability and assignments.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                to="/crews/new"
                className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 hover:bg-slate-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100/80">
                  <Users className="h-5 w-5 text-slate-900" />
                </span>
                <span>
                  <strong className="block text-white">Add crew</strong>
                  Create a record with lead, skills, and home base details.
                </span>
              </Link>
              <Link
                to="/import"
                className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 hover:bg-slate-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100/80">
                  <ClipboardList className="h-5 w-5 text-slate-900" />
                </span>
                <span>
                  <strong className="block text-white">Import roster</strong>
                  Upload spreadsheet exports from your staffing system.
                </span>
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="text-base font-semibold text-white">Need a starting point?</h3>
            <p className="mt-2 text-sm text-slate-300">
              Save an empty roster template, fill it with your data, and import it when you are ready.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
              <Phone className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <span>Need help importing data? Contact support@fieldforge.app and we will assist.</span>
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">First, get the basics in place</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-300">
            {onboardingSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-xs font-semibold text-slate-300">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">What you can coordinate in FieldForge</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coordinationIdeas.map(({ title, description, icon: Icon }) => (
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

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Suggestions once crews are in the system</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Use filters to view crews by voltage qualification, region, or specialty.</li>
            <li>Attach tailboards, work packages, and safety alerts directly to the assignment.</li>
            <li>Share read-only access with partners so they always see the latest plan.</li>
          </ul>
        </section>

        <footer className="border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400">
            FieldForge is designed to support electrical construction operations. Finish configuring this workspace to
            replace spreadsheets, text threads, and phone trees with a single, dependable source of truth.
          </p>
        </footer>
      </div>
    </div>
  );
};


