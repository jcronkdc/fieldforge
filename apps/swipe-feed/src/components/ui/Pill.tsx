import { FC, ReactNode } from "react";
import clsx from "clsx";

type PillVariant = "outline" | "aurora" | "subtle" | "danger";

export interface PillProps {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
}

const variantStyles: Record<PillVariant, string> = {
  outline: "border border-slate-700 text-slate-300",
  aurora: "border border-aurora/60 text-aurora bg-aurora/10",
  subtle: "border border-slate-800 text-slate-400 bg-black/20",
  danger: "border border-rose-500/60 text-rose-200 bg-rose-900/20",
};

export const Pill: FC<PillProps> = ({ children, variant = "outline", className }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
      variantStyles[variant],
      className
    )}
  >
    {children}
  </span>
);


