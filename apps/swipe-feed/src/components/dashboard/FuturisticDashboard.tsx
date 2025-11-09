import React from 'react';
import {
  Building2,
  Users,
  Shield,
  FileText,
  HardHat,
  Calendar,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FuturisticDashboard: React.FC = () => {
  const summaryCards = [
    {
      title: 'Projects',
      description: 'Keep structure packages, switching plans, and materials in one place.',
      cta: 'Create a project',
      to: '/projects',
      icon: Building2
    },
    {
      title: 'Crews & partners',
      description: 'Invite supervisors, field crews, subcontractors, and client representatives.',
      cta: 'Manage people',
      to: '/crews',
      icon: Users
    },
    {
      title: 'Safety & permits',
      description: 'Log tailboard briefings, energized work authorizations, and corrective actions.',
      cta: 'View safety tools',
      to: '/safety',
      icon: Shield
    }
  ];

  const setupChecklist = [
    'Add the active circuits, spans, and structures for your project.',
    'Upload the latest switching orders, drawings, and vendor documents.',
    'Publish tomorrow’s work plan so crews can review before the tailboard.',
    'Invite construction management, QC, safety, and commissioning partners.'
  ];

  const upcomingItems = [
    {
      title: 'Review outages and switching windows',
      description: 'Confirm clearances, customer notices, and staffing before locking the schedule.',
      to: '/analytics'
    },
    {
      title: 'Prepare tomorrow’s tailboard package',
      description: 'Attach procedures, energized work approvals, and crew assignments.',
      to: '/safety'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-300">Project command center</p>
            <h1 className="text-3xl font-semibold text-white">
              Align field crews, office teams, and partners
            </h1>
            <p className="max-w-3xl text-base text-slate-300">
              Use FieldForge to keep construction, commissioning, and safety on the same page. Organise the day’s plan,
              confirm switching orders, and record progress without leaving the flow of work.
            </p>
          </div>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            View schedule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map(({ title, description, cta, to, icon: Icon }) => (
            <div key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100/80">
                <Icon className="h-5 w-5 text-slate-900" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-300">{description}</p>
              <Link to={to} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200">
                {cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Get set up</h2>
              <span className="text-xs font-medium uppercase text-slate-400">Foundation checklist</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Work through these steps to move your active jobs into FieldForge.
            </p>
            <ol className="mt-6 space-y-4 text-sm text-slate-200">
              {setupChecklist.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-xs font-semibold text-slate-300">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center gap-3 text-white">
                <HardHat className="h-5 w-5 text-amber-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Today’s focus</h2>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Start with the crews that are mobilizing in the next 24 hours. Confirm that documents are current and
                permits are recorded. Everyone sees the same plan once it is published.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="h-5 w-5 text-amber-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Upcoming items</h2>
              </div>
              <ul className="mt-4 space-y-4 text-sm text-slate-300">
                {upcomingItems.map(({ title, description, to }) => (
                  <li key={title} className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-1 text-sm text-slate-300">{description}</p>
                    <Link to={to} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200">
                      Go to section
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3 text-white">
            <FileText className="h-5 w-5 text-amber-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Latest activity</h2>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Activity will appear here as you log daily reports, upload documents, and complete safety briefings.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
            <CheckCircle className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <span>Once data is flowing, the timeline keeps the team aligned without extra status calls.</span>
          </div>
        </section>
      </div>
    </div>
  );
};
