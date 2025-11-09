import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora/60 disabled:cursor-not-allowed disabled:opacity-40";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-aurora text-white shadow-lg shadow-aurora/40 hover:scale-[1.02] hover:shadow-aurora/60",
  secondary:
    "border border-slate-700 text-slate-200 hover:border-aurora hover:text-white bg-transparent",
  ghost: "text-slate-400 hover:text-white",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-500/40 hover:shadow-rose-500/60",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className, iconOnly = false, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          iconOnly ? "h-10 w-10 rounded-full p-0" : sizeStyles[size],
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";


