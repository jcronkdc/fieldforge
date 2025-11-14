import React from 'react';
import { Compass, Ruler, Cog, Package, Users, Shield } from 'lucide-react';
import '../styles/davinci.css';

export const RenaissanceTest: React.FC = () => {
  return (
    <div className="min-h-screen davinci-grid paper-texture">
      {/* Renaissance Decorations */}
      <div className="compass-rose" />
      
      <div className="max-w-4xl mx-auto p-[34px]">
        <h1 className="text-golden-2xl font-bold text-white mb-[34px] measurement-line">
          Renaissance Theme Test Page
        </h1>
        
        <p className="text-golden-base text-amber-400/60 mb-[55px] technical-annotation" data-note="VERIFICATION">
          This page tests all Renaissance design elements
        </p>

        {/* Golden Ratio Grid */}
        <div className="grid grid-cols-3 gap-[21px] mb-[55px]">
          <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe">
            <div className="vitruvian-square mx-auto mb-[13px]">
              <Compass className="w-[34px] h-[34px] text-amber-400" />
            </div>
            <h3 className="text-golden-base font-semibold text-white text-center">Navigation</h3>
            <p className="text-golden-sm text-amber-400/60 text-center mt-[8px]">Compass Rose</p>
          </div>
          
          <div className="card-engineering p-[21px] rounded-[13px] tech-border depth-layer-1 breathe" style={{ animationDelay: '0.1s' }}>
            <div className="vitruvian-square mx-auto mb-[13px]">
              <Ruler className="w-[34px] h-[34px] text-amber-400" />
            </div>
            <h3 className="text-golden-base font-semibold text-white text-center">Measurement</h3>
            <p className="text-golden-sm text-amber-400/60 text-center mt-[8px]">Golden Ratio</p>
          </div>
          
          <div className="dashboard-card p-[21px] rounded-[13px] corner-sketch depth-layer-1 breathe" style={{ animationDelay: '0.2s' }}>
            <div className="vitruvian-square mx-auto mb-[13px]">
              <Cog className="w-[34px] h-[34px] text-amber-400 gear-rotate" />
            </div>
            <h3 className="text-golden-base font-semibold text-white text-center">Mechanics</h3>
            <p className="text-golden-sm text-amber-400/60 text-center mt-[8px]">Engineering</p>
          </div>
        </div>

        {/* Button Styles */}
        <div className="flex gap-[21px] mb-[55px]">
          <button className="btn-davinci px-[21px] py-[13px] field-touch">
            Primary Action
          </button>
          <button className="btn-blueprint px-[21px] py-[13px] field-touch">
            Secondary Action
          </button>
          <button className="tech-border bg-slate-800/50 text-amber-400/60 hover:bg-slate-700/50 px-[21px] py-[13px] rounded-[8px] field-touch">
            Tertiary Action
          </button>
        </div>

        {/* Input Styles */}
        <div className="space-y-[21px] mb-[55px]">
          <input 
            type="text" 
            placeholder="Renaissance Input Field"
            className="w-full input-davinci px-[21px] py-[13px] field-readable"
          />
          <select className="w-full input-davinci px-[21px] py-[13px] field-readable">
            <option>Select Option</option>
            <option>Engineering</option>
            <option>Architecture</option>
            <option>Mathematics</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-[21px] mb-[55px]">
          <div className="bg-slate-800/50 p-[21px] rounded-[13px] tech-border">
            <Package className="w-[21px] h-[21px] text-amber-400 mb-[8px]" />
            <div className="text-golden-xl font-bold text-white">42</div>
            <div className="text-golden-sm text-amber-400/60">Equipment</div>
          </div>
          
          <div className="bg-slate-800/50 p-[21px] rounded-[13px] tech-border">
            <Users className="w-[21px] h-[21px] text-green-400 mb-[8px]" />
            <div className="text-golden-xl font-bold text-green-400">156</div>
            <div className="text-golden-sm text-amber-400/60">Workers</div>
          </div>
          
          <div className="bg-slate-800/50 p-[21px] rounded-[13px] tech-border">
            <Shield className="w-[21px] h-[21px] text-blue-400 mb-[8px]" />
            <div className="text-golden-xl font-bold text-blue-400">98%</div>
            <div className="text-golden-sm text-amber-400/60">Safety Score</div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="bg-slate-900/80 p-[34px] rounded-[21px] border border-amber-500/20 mb-[55px]">
          <h2 className="text-golden-lg font-bold text-white mb-[21px]">Background Test</h2>
          <div className="h-[144px] relative">
            <div className="absolute inset-0 blueprint-overlay opacity-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-400/40 text-golden-base">Technical Drawing Overlay</span>
            </div>
          </div>
        </div>

        {/* Leonardo Quote */}
        <div className="text-center opacity-30">
          <p className="text-golden-sm text-amber-400/60 font-light italic">
            "Learning never exhausts the mind."
          </p>
          <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
        </div>
      </div>
    </div>
  );
};
