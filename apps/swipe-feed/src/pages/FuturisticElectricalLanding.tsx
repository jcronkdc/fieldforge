import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Cpu, HardHat, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { SEOHead, generateOrganizationSchema, generateSoftwareSchema, generateWebPageSchema } from '../components/seo/SEOHead';

export const FuturisticElectricalLanding: React.FC = () => {
  const navigate = useNavigate();

  const structuredData = {
    ...generateOrganizationSchema(),
    ...generateSoftwareSchema(),
    ...generateWebPageSchema(
      'FieldForge – Electrical Construction Operations Software',
      'FieldForge keeps transmission, distribution, and substation teams aligned with scheduling, documentation, and safety tools that work in the field.',
      'https://fieldforge.app'
    )
  };

  const highlights = [
    'Purpose-built for transmission, distribution, and substation work.',
    'Designed with electrical constructors to streamline daily coordination.',
    'Transparent workflows that reinforce safety, quality, and compliance.'
  ];

  const capabilities = [
    {
      icon: <HardHat className="w-6 h-6 text-slate-900" />,
      title: 'Field Reporting',
      description: 'Capture crews, work performed, and equipment notes from any device in a single step.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-slate-900" />,
      title: 'Document Control',
      description: 'Versioned drawings, switching orders, and procedures remain accessible even when bandwidth is limited.'
    },
    {
      icon: <Shield className="w-6 h-6 text-slate-900" />,
      title: 'Safety & Compliance',
      description: 'Issue tailboards, track permits, and log corrective actions without duplicating work.'
    },
    {
      icon: <MapPin className="w-6 h-6 text-slate-900" />,
      title: 'Network Awareness',
      description: 'Coordinate outages and mobilizations with a shared map of structures, spans, and substations.'
    }
  ];

  return (
    <>
      <SEOHead
        title="FieldForge – Electrical Construction Operations Software"
        description="Software built with electrical constructors to coordinate crews, documents, and safety programs across transmission, distribution, and substation projects."
        keywords="electrical construction software, transmission project management, distribution operations platform, substation documentation, field reporting, safety tailboards"
        image="https://fieldforge.app/og-hero-image.png"
        url="https://fieldforge.app"
        type="website"
        canonical="https://fieldforge.app"
        structuredData={structuredData}
      />

      <main className="bg-slate-950 text-slate-100" role="main" itemScope itemType="https://schema.org/WebPage">
        <h1 className="sr-only">FieldForge – Electrical construction operations software</h1>

        <header className="border-b border-slate-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-400/90">
                <Zap className="h-6 w-6 text-slate-900" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-semibold text-white">FieldForge</p>
                <p className="text-xs text-slate-400">Electrical Construction Operations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section className="bg-slate-900/60">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:px-8 lg:py-24">
            <div className="space-y-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                Built with line constructors and substation teams
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                One operating picture for T&amp;D and substation delivery
              </h2>
              <p className="text-lg leading-relaxed text-slate-300">
                FieldForge replaces email threads, shared drives, and ad-hoc spreadsheets with a connected workspace
                tailored to electrical construction. Crews get the information they need, office teams see progress in
                real time, and everyone works from the latest plan.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="mt-[2px] h-4 w-4 text-amber-300" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/signup')}
                  className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
                >
                  Create an account
                </button>
                <button
                  onClick={() => navigate('/demo')}
                  className="text-sm font-medium text-slate-200 underline-offset-4 hover:underline"
                >
                  Request a walkthrough
                </button>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-sm font-semibold text-white">What teams organise in FieldForge</h3>
              <dl className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="flex justify-between">
                  <dt>Switching procedures</dt>
                  <dd>Clear, versioned, and acknowledgement tracked</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Daily crew reports</dt>
                  <dd>Line, civil, and substation templates in one log</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Safety and permits</dt>
                  <dd>Tailboards, clearances, and energized work approvals</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Materials &amp; equipment</dt>
                  <dd>Structure packages, outage windows, and fleet status</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <h3 className="text-2xl font-semibold text-white">Platform capabilities</h3>
          <p className="mt-2 text-base text-slate-300">
            Software that respects the way electrical constructors plan, brief, execute, and document work.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon, title, description }) => (
              <div key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-4 inline-flex items-center justify-center rounded-md bg-amber-100/80 p-2">
                  {icon}
                </div>
                <h4 className="text-lg font-semibold text-white">{title}</h4>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-800 bg-slate-900/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-xl space-y-4">
              <h3 className="text-2xl font-semibold text-white">Built for joint field and office teams</h3>
              <p className="text-base text-slate-300">
                FieldForge keeps jobs moving with the details that matter: structure numbers, circuit names, clear
                switching orders, and shared visibility for construction, testing, and commissioning.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-[2px] h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Available as a responsive web app—works on desktops, tablets, and rugged mobiles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-[2px] h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Role-based access controls so partners, QC, and safety see what they need—no more, no less.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-[2px] h-4 w-4 text-amber-300" aria-hidden="true" />
                  <span>Structured exports for project controls, finance, and as-built packages.</span>
                </li>
              </ul>
            </div>

            <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-950/70 p-6">
              <p className="text-sm font-semibold text-white">Next steps</p>
              <p className="mt-2 text-sm text-slate-300">
                Start with a project sandbox or connect with the team to review your current workflows.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
                >
                  Launch a sandbox
                </button>
                <button
                  onClick={() => navigate('/demo')}
                  className="w-full rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Talk with us
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-slate-400 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <Zap className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <span>FieldForge</span>
            </div>
            <div className="flex gap-6">
              <span>Support: support@fieldforge.app</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};
