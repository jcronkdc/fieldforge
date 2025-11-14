import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = '',
  disabled = false
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-golden-sm font-medium text-amber-200 mb-[8px] technical-annotation">
          {label}
        </label>
      )}
      <div className="flex items-center gap-[13px]">
        <div className="flex-1 relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-[8px] bg-slate-800/50 rounded-[5px] appearance-none cursor-pointer outline-none
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[21px] [&::-webkit-slider-thumb]:h-[21px]
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br
                     [&::-webkit-slider-thumb]:from-amber-400 [&::-webkit-slider-thumb]:to-amber-500
                     [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-500/30
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-300/50
                     [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110
                     disabled:opacity-50 disabled:cursor-not-allowed vitruvian-rect"
          />
          {/* Progress fill */}
          <div 
            className="absolute top-[50%] left-0 h-[8px] bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-[5px] pointer-events-none -translate-y-1/2 shadow-inner"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-golden-sm font-semibold text-amber-300 min-w-[34px] text-right measurement-line">
          {value}
        </span>
      </div>
    </div>
  );
};
