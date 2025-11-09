import { FC } from "react";
import clsx from "clsx";

export interface BadgeProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

export const Badge: FC<BadgeProps> = ({ label, value, highlight = false, className }) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
      highlight ? "border-aurora/80 text-aurora" : "border-slate-700 text-slate-400",
      className
    )}
  >
    <span className="font-semibold text-sm leading-none">{value}</span>
    <span className="text-[0.6rem] uppercase tracking-wide">{label}</span>
  </span>
);


