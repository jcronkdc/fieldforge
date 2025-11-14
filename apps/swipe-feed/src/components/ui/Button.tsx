import React, { forwardRef } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button.
   */
  variant?: ButtonVariant;
  /**
   * Defines padding and font sizing.
   */
  size?: ButtonSize;
  /**
   * Optional icon rendered alongside children.
   */
  icon?: React.ReactNode;
  /**
   * Icon alignment relative to text.
   */
  iconPosition?: 'left' | 'right';
  /**
   * Icon-only buttons hide the textual label visually but require an aria-label.
   */
  iconOnly?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-amber-500 to-amber-600 text-[#0b0f14] hover:from-amber-400 hover:to-amber-500 focus-visible:from-amber-400 focus-visible:to-amber-500 shadow-amber-500/20 corner-sketch',
  secondary:
    'bg-slate-800/90 text-white hover:bg-slate-700/90 focus-visible:bg-slate-700/90 border border-amber-500/20 vitruvian-rect',
  ghost:
    'bg-transparent text-amber-200 hover:bg-amber-500/10 focus-visible:bg-amber-500/10 hover:text-amber-100',
  danger:
    'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 focus-visible:from-red-500 focus-visible:to-red-600 shadow-red-500/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-[8px] py-[5px] text-golden-sm',
  md: 'px-[13px] py-[8px] text-golden-base',
  lg: 'px-[21px] py-[13px] text-golden-lg',
};

/**
 * Accessible button component with consistent variants, focus states,
 * and optional leading/trailing icons.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      children,
      icon,
      iconPosition = 'left',
      iconOnly = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const propAriaLabel = props['aria-label'];
    const fallbackLabel =
      typeof children === 'string' ? children : undefined;
    const resolvedAriaLabel = iconOnly ? propAriaLabel ?? fallbackLabel : propAriaLabel;

    if (iconOnly && !resolvedAriaLabel && import.meta.env.DEV) {
      console.warn('Button (iconOnly) requires an aria-label for accessibility.');
    }

    const baseStyles = clsx(
      'inline-flex items-center justify-center gap-[8px] font-semibold rounded-[8px]',
      'transition-all duration-300 ease-[var(--ease-standard)]',
      'focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--ring-offset)] focus-visible:ring-2 focus-visible:ring-amber-400/50',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'shadow-md hover:shadow-lg active:scale-[0.98]',
      'relative overflow-hidden depth-layer-1'
    );

    const content = (
      <>
        {icon && iconPosition === 'left' && <span aria-hidden>{icon}</span>}
        {iconOnly ? <span className="sr-only">{resolvedAriaLabel}</span> : children}
        {icon && iconPosition === 'right' && <span aria-hidden>{icon}</span>}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        data-icon-only={iconOnly ? 'true' : undefined}
        aria-label={resolvedAriaLabel}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
