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
    tone: 'text-amber-400',
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
    <div className="relative min-h-screen davinci-grid paper-texture">
      {/* Renaissance Decorations */}
      <div className="compass-rose" />
      <div className="spiral-path" />

      <div className="mx-auto flex max-w-7xl flex-col gap-[34px] px-[34px] py-[55px]">
        <header className="flex flex-col gap-[21px] border-b border-amber-500/20 pb-[34px] lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-[13px]">
            <p className="text-golden-sm text-amber-400/60 font-medium uppercase tracking-wider technical-annotation" data-note="OVERVIEW">Portfolio overview</p>
            <h1 className="text-golden-2xl font-bold text-white measurement-line">
              Maintain control across every transmission and substation build
            </h1>
            <p className="max-w-3xl text-golden-base text-amber-400/60">
              Use this dashboard to move programs forward: align construction and commissioning, surface risk, and deliver the reporting executives expect without chasing spreadsheets.
            </p>
          </div>
          <Link
            to="/analytics"
            className="btn-davinci px-[21px] py-[13px] flex items-center gap-[8px] field-touch"
          >
            View executive analytics
            <ArrowRight className="w-5 h-5" />
          </Link>
        </header>

        <section className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3 paper-texture">
          {telemetryCards.map(({ label, metric, caption, tone, icon: Icon }, index) => (
            <div
              key={label}
              className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-[13px]">
                <div className="vitruvian-square">
                  <Icon className="w-[34px] h-[34px] text-amber-400" />
                </div>
                <div>
                  <p className={`text-golden-xl font-bold ${tone}`}>{metric}</p>
                  <p className="text-golden-sm font-medium uppercase tracking-wider text-amber-400/60 technical-annotation" data-note={label.toUpperCase().replace(' ', '-')}>{label}</p>
                </div>
              </div>
              <p className="mt-[13px] text-golden-sm font-medium uppercase tracking-wider text-amber-400/40">{caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-[21px] sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map(({ title, description, cta, to, icon: Icon }, index) => (
            <div key={title} className="card-engineering p-[21px] rounded-[13px] tech-border depth-layer-1 breathe corner-sketch" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="vitruvian-rect mb-[21px]">
                <Icon className="w-[34px] h-[34px] text-amber-400" aria-hidden="true" />
              </div>
              <h2 className="text-golden-base font-semibold text-white measurement-line">{title}</h2>
              <p className="mt-[13px] text-golden-sm text-amber-400/60">{description}</p>
              <Link to={to} className="mt-[21px] inline-flex items-center gap-[8px] text-golden-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors technical-annotation" data-note="EXPLORE">
                {cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </section>

        <section className="grid gap-[34px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="dashboard-card p-[34px] rounded-[21px] tech-border depth-layer-1">
            <div className="flex items-center justify-between mb-[21px]">
              <h2 className="text-golden-lg font-semibold text-white measurement-line">Implementation checklist</h2>
              <span className="text-golden-sm font-semibold uppercase tracking-[0.2em] text-amber-400/60 technical-annotation" data-note="BEGIN">Start here</span>
            </div>
            <p className="text-golden-sm text-amber-400/60">
              Work through these actions to migrate active capital programs into FieldForge.
            </p>
            <ol className="mt-[21px] space-y-[13px] text-golden-sm text-white">
              {setupChecklist.map((item, index) => (
                <li key={item} className="flex items-start gap-[13px]">
                  <span className="mt-1 inline-flex h-[34px] w-[34px] items-center justify-center rounded-full tech-border text-golden-sm font-semibold text-amber-400 vitruvian-square">
                    {index + 1}
                  </span>
                  <span className="text-amber-400/80 field-readable">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-[21px]">
            <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe">
              <div className="flex items-center gap-[13px] mb-[13px]">
                <HardHat className="w-[21px] h-[21px] text-amber-400" aria-hidden="true" />
                <h2 className="text-golden-base font-semibold text-white measurement-line">Today's priorities</h2>
              </div>
              <p className="text-golden-sm text-amber-400/60 field-readable">
                Start with crews deploying in the next 24 hours. Confirm documents, permits, and resource plans so field leaders sign off before mobilization.
              </p>
            </div>

            <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-[13px] mb-[13px]">
                <Calendar className="w-[21px] h-[21px] text-amber-400" aria-hidden="true" />
                <h2 className="text-golden-base font-semibold text-white measurement-line">Upcoming reviews</h2>
              </div>
              <ul className="space-y-[13px]">
                {upcomingItems.map(({ title, description, to }) => (
                  <li key={title} className="tech-border rounded-[8px] bg-slate-800/50 p-[13px]">
                    <p className="font-semibold text-white text-golden-sm">{title}</p>
                    <p className="mt-[8px] text-golden-sm text-amber-400/60">{description}</p>
                    <Link to={to} className="mt-[8px] inline-flex items-center gap-[8px] text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors technical-annotation" data-note="GO">
                      Go to section
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="dashboard-card p-[34px] rounded-[21px] tech-border depth-layer-1 corner-sketch">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <FileText className="w-[21px] h-[21px] text-amber-400" aria-hidden="true" />
            <h2 className="text-golden-lg font-semibold text-white measurement-line">Activity timeline</h2>
          </div>
          <p className="text-golden-sm text-amber-400/60 field-readable">
            As you capture daily reports, safety briefings, and commercial approvals, this feed becomes the single source of truth for your executive team.
          </p>
          <div className="mt-[21px] flex items-center gap-[13px] rounded-[13px] border border-dashed border-amber-500/20 bg-slate-800/50 p-[21px] text-golden-sm text-amber-400/60">
            <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
            <span className="field-readable">Start logging operational data to bring the timeline to life for your stakeholders.</span>
          </div>
        </section>

        {/* Leonardo Quote */}
        <div className="text-center opacity-30 mt-[89px]">
          <p className="text-golden-sm text-amber-400/60 font-light italic technical-annotation">
            "As every divided kingdom falls, so every mind divided between many studies confounds and saps itself."
          </p>
          <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
        </div>
      </div>
    </div>
  );
};
