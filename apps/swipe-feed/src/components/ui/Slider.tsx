import { FC, useMemo } from "react";
import clsx from "clsx";

export interface SliderMark {
  value: number;
  label: string;
}

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  marks?: SliderMark[];
  className?: string;
}

export const Slider: FC<SliderProps> = ({ value, min, max, step = 1, onChange, marks, className }) => {
  const progress = useMemo(() => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  return (
    <div className={clsx("flex w-full flex-col gap-2", className)}>
      <input
        type="range"
        className="mythatron-slider"
        value={value}
        min={min}
        max={max}
        step={step}
        style={{
          background: `linear-gradient(to right, rgba(94,234,212,0.8) 0%, rgba(94,234,212,0.8) ${progress}%, rgba(30,41,59,0.7) ${progress}%, rgba(30,41,59,0.7) 100%)`,
        }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {marks ? (
        <div className="flex justify-between text-[0.6rem] uppercase tracking-wide text-slate-500">
          {marks.map((mark) => (
            <span key={mark.value} className="relative flex flex-col items-center">
              <span className="mb-1 h-2 w-px bg-slate-600" aria-hidden></span>
              {mark.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};


