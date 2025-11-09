import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle, Globe2, LineChart, ShieldCheck, Users2, Zap } from 'lucide-react';

const highlights = [
  'Transmission, distribution, and substation execution in one system',
  'Granular structure, circuit, and crew traceability across every job',
  'Built-in commercial controls that reduce overruns and claims risk'
];

const capabilityColumns = [
  {
    title: 'Field execution without guesswork',
    items: [
      'Structured daily briefs, switching orders, and energization checklists',
      'Native support for relay, commissioning, and specialty crews',
      'Voice-to-record capture for storm and restoration events'
    ]
  },
  {
    title: 'Office visibility that holds up in audits',
    items: [
      'Commercial metrics tied to cost codes, structure numbers, and outage IDs',
      'Automated document control for permits, clearances, and energization packs',
      'Configurable approvals that stand up to utility and regulator scrutiny'
    ]
  },
  {
    title: 'Executive confidence at program scale',
    items: [
      'Portfolio dashboards showing risk, progress, and productivity',
      'Enterprise-grade security, role separation, and API integrations',
      'Implementation playbooks tailored to IOUs, EPCs, and grid modernization teams'
    ]
  }
];

const proofPoints = [
  {
    heading: 'Deployment in weeks, not quarters',
    copy: 'Template libraries for transmission line, substation, and UG programs accelerate configuration. Our delivery teams operate alongside your PMO to ensure adoption.'
  },
  {
    heading: 'Operational ROI in the first outage season',
    copy: 'Customers report 18% reduction in rework, 9-point improvement in energization readiness, and faster closeout packages compared with legacy systems.'
  },
  {
    heading: 'Built for partnered delivery',
    copy: 'Open integrations connect to Primavera, Maximo, SAP, and contractor ERPs. FieldForge becomes the system of record for the job, not an additional burden.'
  }
];

const logos = ['Dominion Energy', 'National Grid', 'NextEra Energy', 'Southern Company', 'Quanta Services'];

const metrics = [
  { label: 'Projects orchestrated annually', value: '1,200+', icon: LineChart },
  { label: 'Field users supported per deployment', value: '5k+', icon: Users2 },
  { label: 'Reduction in reporting lag', value: '63%', icon: BarChart3 }
];

export const FuturisticElectricalLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-white text-slate-900" role="main" itemScope itemType="https://schema.org/WebPage">
      <h1 className="sr-only">FieldForge – Enterprise construction management for transmission, distribution, and substation delivery</h1>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Zap className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-slate-900">FieldForge</p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Grid Construction Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="btn-secondary"
            >
              Request briefing
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary"
            >
              Launch sandbox
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-white to-slate-100/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl space-y-6">
            <p className="badge">Transmission • Distribution • Substations</p>
            <h2 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              One control surface for the teams powering the grid
            </h2>
            <p className="text-lg text-slate-600">
              FieldForge delivers the execution discipline of the largest utilities with the speed of a modern SaaS platform. Align engineering, construction, testing, and commissioning on a single source of truth that project executives can rely on.
            </p>
            <ul className="space-y-3 text-base text-slate-600">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 text-emerald-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Explore the platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button onClick={() => navigate('/demo')} className="btn-ghost">
                Schedule a leadership briefing
              </button>
            </div>
          </div>

          <aside className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-elevated">
            <p className="text-sm font-semibold text-slate-500 uppercase">Executive scorecard</p>
            <p className="mt-3 text-lg font-medium text-slate-800">
              Utilities using FieldForge close outage packages 2.4× faster than with legacy systems.
            </p>
            <div className="mt-6 space-y-4">
              {metrics.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      <p className="text-lg font-semibold text-slate-900">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Trusted by leaders modernising the grid</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-500 lg:text-base">
            {logos.map((logo) => (
              <span key={logo} className="uppercase tracking-[0.2em] text-slate-400">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="badge">Built for joint field and office teams</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">
              Replace point solutions with a program-level operating model
            </h2>
            <p className="mt-4 text-base text-slate-600">
              FieldForge captures the detail executives expect while staying simple for crews in the field. Every workflow—from outage switching to commercial governance—runs on a single set of data.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {capabilityColumns.map(({ title, items }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="badge">Why utilities switch</p>
              <h2 className="text-3xl font-semibold text-slate-900">From capital programs to storm response, FieldForge outperforms legacy suites</h2>
              <p className="text-base text-slate-600">
                We built the platform around the realities of grid construction: multi-party coordination, regulator expectations, and relentless capital delivery targets. No more compromising between field adoption and executive reporting.
              </p>
            </div>
            <div className="space-y-6">
              {proofPoints.map(({ heading, copy }) => (
                <div key={heading} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">{heading}</h3>
                  <p className="mt-3 text-sm text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-10 w-10 text-slate-900" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Security and governance first</h3>
              <p className="mt-3 text-sm text-slate-600">
                SOC 2, role-based access, SSO, and audit trails are standard. Aligns with corporate IT and regulator demands without slowing project teams.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Globe2 className="h-10 w-10 text-slate-900" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Operate with your ecosystem</h3>
              <p className="mt-3 text-sm text-slate-600">
                REST and event-based integrations connect to Primavera, Maximo, SAP, and contractor systems—no double entry, no stale reporting.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Users2 className="h-10 w-10 text-slate-900" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Proven change management</h3>
              <p className="mt-3 text-sm text-slate-600">
                Adoption specialists embed with your PMO and construction leadership to train crews, reinforce behaviors, and deliver measurable ROI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16 text-white lg:px-8 lg:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Executive briefing</p>
              <h2 className="text-3xl font-semibold">See how FieldForge compares to Procore, Sitetracker, and legacy custom builds</h2>
              <p className="text-base text-slate-200">
                In 45 minutes we map your current capital delivery process, identify opportunities for immediate impact, and outline how FieldForge supports your grid reliability goals.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/demo')} className="btn-secondary">
                Book an executive session
              </button>
              <button onClick={() => navigate('/signup')} className="btn-ghost text-white">
                Explore the sandbox
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2 text-slate-600">
            <Zap className="h-5 w-5 text-slate-900" aria-hidden="true" />
            <span>FieldForge</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Executive briefings: leadership@fieldforge.app</span>
            <span>Security &amp; Compliance</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </main>
  );
};
