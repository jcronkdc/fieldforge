import React from 'react';
import {
  Building2,
  Users,
  Shield,
  FileText,
  HardHat,
  Calendar,
  ArrowRight,
  CheckCircle,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const telemetryCards = [
  {
    label: 'Active spans',
    metric: '487',
    caption: '+12 vs plan',
    tone: 'text-emerald-600',
    icon: Activity
  },
  {
    label: 'Crew utilization',
    metric: '94%',
    caption: '3% above target',
    tone: 'text-slate-900',
    icon: Users
  },
  {
    label: 'Commercial status',
    metric: 'Green',
    caption: 'Variance < 2%',
    tone: 'text-emerald-600',
    icon: ShieldCheck
  }
];

export const FuturisticDashboard: React.FC = () => {
  const summaryCards = [
    {
      title: 'Programs & projects',
      description: 'Organise structure packages, switching plans, and contract deliverables.',
      cta: 'Open projects workspace',
      to: '/projects',
      icon: Building2
    },
    {
      title: 'Crews & partners',
      description: 'Onboard contractors, internal crews, and client observers with the right controls.',
      cta: 'Manage teams',
      to: '/crews',
      icon: Users
    },
    {
      title: 'Safety & permits',
      description: 'Capture tailboards, energized work approvals, and incident follow-up in one record.',
      cta: 'View safety hub',
      to: '/safety',
      icon: Shield
    }
  ];

  const setupChecklist = [
    'Publish your active spans, circuits, and structure identifiers to FieldForge.',
    'Upload the latest switching orders, drawings, and vendor packages.',
    'Assign work for the next 72 hours so crews review before the tailboard.',
    'Invite construction management, QC, safety, and commissioning leads.'
  ];

  const upcomingItems = [
    {
      title: 'Validate outage readiness',
      description: 'Confirm clearances, resource plans, and customer notices before locking the outage.',
      to: '/analytics'
    },
    {
      title: 'Prepare tomorrow’s tailboard',
      description: 'Attach procedures, energized work approvals, and crew assignments in one packet.',
      to: '/field/daily'
    }
  ];

  return (
    <div className="relative min-h-screen bg-white text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,_rgba(15,76,129,0.08),_transparent_55%),_radial-gradient(circle_at_82%_0,_rgba(17,118,161,0.08),_transparent_50%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,_rgba(15,23,42,0.06),_transparent_45%)]" aria-hidden />

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="badge">Portfolio overview</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Maintain control across every transmission and substation build
            </h1>
            <p className="max-w-3xl text-base text-slate-600">
              Use this dashboard to move programs forward: align construction and commissioning, surface risk, and deliver the reporting executives expect without chasing spreadsheets.
            </p>
          </div>
          <Link
            to="/analytics"
            className="btn-secondary"
          >
            View executive analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {telemetryCards.map(({ label, metric, caption, tone, icon: Icon }, index) => (
            <div
              key={label}
              className={`rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur animate-fade-in ${
                index % 2 === 0 ? 'animate-float-slow' : 'animate-float-slower'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className={`text-xl font-semibold ${tone}`}>{metric}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{label}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map(({ title, description, cta, to, icon: Icon }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
              <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline">
                {cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Implementation checklist</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Start here</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Work through these actions to migrate active capital programs into FieldForge.
            </p>
            <ol className="mt-6 space-y-4 text-sm text-slate-700">
              {setupChecklist.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-900">
                <HardHat className="h-6 w-6 text-slate-900" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Today’s priorities</h2>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Start with crews deploying in the next 24 hours. Confirm documents, permits, and resource plans so field leaders sign off before mobilization.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-900">
                <Calendar className="h-6 w-6 text-slate-900" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Upcoming reviews</h2>
              </div>
              <ul className="mt-4 space-y-4 text-sm text-slate-700">
                {upcomingItems.map(({ title, description, to }) => (
                  <li key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                    <Link to={to} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline">
                      Go to section
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <FileText className="h-6 w-6" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Activity timeline</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            As you capture daily reports, safety briefings, and commercial approvals, this feed becomes the single source of truth for your executive team.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            <CheckCircle className="h-4 w-4 text-slate-900" aria-hidden="true" />
            <span>Start logging operational data to bring the timeline to life for your stakeholders.</span>
          </div>
        </section>
      </div>
    </div>
  );
};
