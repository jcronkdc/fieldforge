import { FC } from "react";
import clsx from "clsx";

export interface StatBlockProps {
  label: string;
  value: string;
  className?: string;
}

export const StatBlock: FC<StatBlockProps> = ({ label, value, className }) => (
  <div className={clsx("rounded-2xl border border-slate-800 bg-black/20 px-4 py-3", className)}>
    <div className="text-[0.6rem] uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-medium text-slate-200">{value}</div>
  </div>
);


