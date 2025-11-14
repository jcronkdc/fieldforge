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
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:bg-blue-700 shadow-sm',
  secondary:
    'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:bg-slate-300 shadow-sm',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:bg-red-700 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
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
      'inline-flex items-center justify-center gap-2 font-medium rounded-md',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]'
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
