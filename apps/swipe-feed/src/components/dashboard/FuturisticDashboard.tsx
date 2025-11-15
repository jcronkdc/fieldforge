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
  ShieldCheck,
  Compass,
  Ruler
} from 'lucide-react';
import { ElectricalContractorDashboard } from './ElectricalContractorDashboard';
import { Link } from 'react-router-dom';

const telemetryCards = [
  {
    label: 'Active spans',
    metric: '487',
    caption: '+12 vs plan',
    tone: 'text-green-400',
    icon: Activity
  },
  {
    label: 'Crew utilization',
    metric: '94%',
    caption: '3% above target',
    tone: 'text-blue-400',
    icon: Users
  },
  {
    label: 'Commercial status',
    metric: 'Green',
    caption: 'Variance < 2%',
    tone: 'text-green-400',
    icon: ShieldCheck
  }
];

export const FuturisticDashboard: React.FC = () => {
  // Check if this is a new electrical contractor (like National Conductor)
  const isNewElectricalContractor = !localStorage.getItem('fieldforge_onboarding_complete');
  
  if (isNewElectricalContractor) {
    // Show specialized onboarding for electrical contractors
    return <ElectricalContractorDashboard />;
  }

  const summaryCards = [
    {
      title: 'Substations & Switchyards', 
      description: 'Manage substation construction projects from 12.5kV to 500kV including switchyard installations.',
      cta: 'View substation projects',
      to: '/substations',
      icon: Building2
    },
    {
      title: 'IBEW Crews & Teams',
      description: 'Coordinate union crews, specialized welders, and inspection teams for electrical construction.',
      cta: 'Manage IBEW crews',
      to: '/crews',
      icon: Users
    },
    {
      title: 'High-Voltage Safety',
      description: 'Digital JSAs, switching orders, energized work permits, and safety briefings for electrical work.',
      cta: 'Access safety center',
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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
        <header className="flex flex-col gap-4 border-b border-gray-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Portfolio overview</p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Maintain control across every transmission and substation build
            </h1>
            <p className="max-w-3xl text-base text-gray-400">
              Use this dashboard to move programs forward: align construction and commissioning, surface risk, and deliver the reporting executives expect without chasing spreadsheets.
            </p>
          </div>
          <Link
            to="/analytics"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
          >
            View executive analytics
            <ArrowRight className="w-5 h-5" />
          </Link>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {telemetryCards.map(({ label, metric, caption, tone, icon: Icon }, index) => (
            <div
              key={label}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  "
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-[13px]">
                <div className="">
                  <Icon className="w-[34px] h-[34px] text-blue-400" />
                </div>
                <div>
                  <p className={`text-xl font-bold ${tone}`}>{metric}</p>
                  <p className="text-sm font-medium uppercase tracking-wider text-blue-400/60 " data-note={label.toUpperCase().replace(' ', '-')}>{label}</p>
                </div>
              </div>
              <p className="mt-[13px] text-sm font-medium uppercase tracking-wider text-blue-400/40">{caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map(({ title, description, cta, to, icon: Icon }, index) => (
            <div key={title} className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700   " style={{ animationDelay: `${index * 0.1}s` }}>
              <div className=" mb-[21px]">
                <Icon className="w-[34px] h-[34px] text-blue-400" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-white ">{title}</h2>
              <p className="mt-[13px] text-sm text-blue-400/60">{description}</p>
              <Link to={to} className="mt-[21px] inline-flex items-center gap-[8px] text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors " >
                {cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </section>

        <section className="grid gap-[34px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700 ">
            <div className="flex items-center justify-between mb-[21px]">
              <h2 className="text-lg font-semibold text-white ">Implementation checklist</h2>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400/60 " >Start here</span>
            </div>
            <p className="text-sm text-blue-400/60">
              Work through these actions to migrate active capital programs into FieldForge.
            </p>
            <ol className="mt-[21px] space-y-[13px] text-sm text-white">
              {setupChecklist.map((item, index) => (
                <li key={item} className="flex items-start gap-[13px]">
                  <span className="mt-1 inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-700 text-sm font-semibold text-blue-400 ">
                    {index + 1}
                  </span>
                  <span className="text-blue-400/80 ">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-[21px]">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  ">
              <div className="flex items-center gap-[13px] mb-[13px]">
                <HardHat className="w-[21px] h-[21px] text-blue-400" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white ">Today's priorities</h2>
              </div>
              <p className="text-sm text-blue-400/60 ">
                Start with crews deploying in the next 24 hours. Confirm documents, permits, and resource plans so field leaders sign off before mobilization.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-[13px] mb-[13px]">
                <Calendar className="w-[21px] h-[21px] text-blue-400" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white ">Upcoming reviews</h2>
              </div>
              <ul className="space-y-[13px]">
                {upcomingItems.map(({ title, description, to }) => (
                  <li key={title} className="border border-gray-700 rounded-[8px] bg-slate-800/50 p-[13px]">
                    <p className="font-semibold text-white text-sm">{title}</p>
                    <p className="mt-[8px] text-sm text-blue-400/60">{description}</p>
                    <Link to={to} className="mt-[8px] inline-flex items-center gap-[8px] text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors " >
                      Go to section
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700  ">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <FileText className="w-[21px] h-[21px] text-blue-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white ">Activity timeline</h2>
          </div>
          <p className="text-sm text-blue-400/60 ">
            As you capture daily reports, safety briefings, and commercial approvals, this feed becomes the single source of truth for your executive team.
          </p>
          <div className="mt-[21px] flex items-center gap-[13px] rounded-[13px] border border-dashed border-gray-700 bg-slate-800/50 p-[21px] text-sm text-blue-400/60">
            <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
            <span className="">Start logging operational data to bring the timeline to life for your stakeholders.</span>
          </div>
        </section>

      </div>
    </div>
  );
};
