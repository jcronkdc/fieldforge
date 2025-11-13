import React from 'react';
import { TrendingUp, Calendar, Users } from 'lucide-react';

// Example component showing Da Vinci design system applied to a dashboard card
export const DaVinciCard: React.FC = () => {
  return (
    <div className="dashboard-card card-vitruvian corner-sketch p-[21px] rounded-[13px] depth-layer-1">
      {/* Subtle spiral path decoration */}
      <div className="spiral-path" />
      
      {/* Card Header with golden ratio spacing */}
      <div className="flex items-center justify-between mb-[13px]">
        <h3 className="text-golden-lg font-semibold text-white">Project Progress</h3>
        <Calendar className="w-[21px] h-[21px] text-amber-400/60" />
      </div>
      
      {/* Stats Grid with golden ratio */}
      <div className="grid grid-cols-3 gap-[13px] mb-[21px]">
        <div className="text-center">
          <div className="text-golden-xl font-bold text-amber-400">87%</div>
          <div className="text-golden-sm text-slate-400">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-golden-xl font-bold text-white">12</div>
          <div className="text-golden-sm text-slate-400">Days Left</div>
        </div>
        <div className="text-center">
          <div className="text-golden-xl font-bold text-green-400">+5%</div>
          <div className="text-golden-sm text-slate-400">This Week</div>
        </div>
      </div>
      
      {/* Progress Bar with golden ratio segments */}
      <div className="relative h-[8px] bg-slate-800 rounded-[5px] overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-[5px]" 
          style={{ width: '87%' }}
        >
          {/* Blueprint grid overlay on progress */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 9px)'
          }} />
        </div>
      </div>
      
      {/* Footer with technical annotation style */}
      <div className="flex items-center justify-between mt-[21px]">
        <div className="flex items-center gap-[8px] annotation" data-note="VERIFIED">
          <Users className="w-[13px] h-[13px] text-slate-400" />
          <span className="text-golden-sm text-slate-400">24 Active</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <TrendingUp className="w-[13px] h-[13px] text-green-400" />
          <span className="text-golden-sm text-green-400">On Track</span>
        </div>
      </div>
    </div>
  );
};

// Example of form input with Da Vinci styling
export const DaVinciInput: React.FC = () => {
  return (
    <div className="space-y-[8px]">
      <label className="text-golden-sm text-slate-300 uppercase tracking-wider">
        Project Name
      </label>
      <input
        type="text"
        className="w-full input-davinci bg-transparent text-white text-golden-base"
        placeholder="Enter project name..."
      />
    </div>
  );
};

// Example of navigation item with Da Vinci styling
export const DaVinciNavItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => {
  return (
    <button 
      className={`nav-davinci text-golden-base ${
        active ? 'text-amber-400' : 'text-slate-300 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
};
