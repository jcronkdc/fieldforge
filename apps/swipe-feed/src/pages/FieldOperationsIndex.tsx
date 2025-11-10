import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Users, Timer, FileText, Cloud } from 'lucide-react';
import { GridHeroBackdrop } from '../components/graphics/GridHeroBackdrop';

const fieldCards = [
  {
    title: 'Daily Operations',
    description: 'Capture tailboards, switching steps, and daily job notes.',
    icon: HardHat,
    to: '/field/daily'
  },
  {
    title: 'Crew Management',
    description: 'See where every crew is assigned and balance workloads.',
    icon: Users,
    to: '/field/crews'
  },
  {
    title: 'Time Tracking',
    description: 'Clock crews in/out and reconcile hours against schedules.',
    icon: Timer,
    to: '/field/time'
  },
  {
    title: 'Receipt Management',
    description: 'Scan, review, and export field purchase receipts.',
    icon: FileText,
    to: '/field/receipts'
  },
  {
    title: 'Weather & Work Limits',
    description: 'Check wind, lightning, and heat restrictions for today.',
    icon: Cloud,
    to: '/field/weather'
  }
];

export const FieldOperationsIndex: React.FC = () => {
  return (
    <div className="relative min-h-full bg-[#0f172a] text-white">
      <div className="absolute inset-0 overflow-hidden opacity-[0.65]">
        <GridHeroBackdrop />
      </div>
      <div className="relative px-6 py-10 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 animate-fade-in">Field Operations</p>
            <h1 className="mt-2 text-3xl font-semibold text-white animate-fade-in-delay">Everything crews need to execute today</h1>
            <p className="mt-3 text-slate-300">
              Launch daily reports, manage crew assignments, record time, and keep commercial controls tight without
              bouncing between spreadsheets and messaging apps.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {fieldCards.map((card, index) => (
              <Link
                key={card.to}
                to={card.to}
                className={`group flex flex-col justify-between rounded-2xl border border-emerald-100/30 bg-white/5 p-6 shadow-[0_12px_40px_rgba(4,61,92,0.18)] backdrop-blur transition hover:border-emerald-200/70 hover:bg-white/10 ${
                  index % 2 === 0 ? 'animate-float-slow' : 'animate-float-slower'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">
                      <card.icon className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-semibold text-white group-hover:text-emerald-200">
                      {card.title}
                    </h2>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{card.description}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
                  Open workflow
                  <span aria-hidden className="translate-y-[1px] transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
