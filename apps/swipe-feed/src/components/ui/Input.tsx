import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visible label rendered above the input element.
   */
  label: string;
  /**
   * Optional helper text rendered beneath the field.
   */
  helperText?: string;
  /**
   * Validation error text. When present, the field is marked invalid.
   */
  error?: string;
}

/**
 * Accessible text input with built-in label, helper, and error messaging.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, id, className, type = 'text', ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? `ff-input-${reactId}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-[8px]">
        <label
          htmlFor={inputId}
          className="text-golden-sm font-medium text-amber-200 technical-annotation"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={clsx(
              'w-full rounded-[8px] border-2 border-amber-500/20 bg-slate-900/50 px-[13px] py-[8px] text-amber-100 shadow-inner',
              'backdrop-blur-sm transition-all duration-300 ease-[var(--ease-standard)]',
              'focus-visible:border-amber-400 focus-visible:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30',
              error
                ? 'border-red-500/50 text-red-100 focus-visible:border-red-400 focus-visible:ring-red-400/30'
                : 'hover:border-amber-500/40 hover:bg-slate-800/60',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
              'placeholder:text-amber-400/40 vitruvian-rect',
              className
            )}
            {...props}
          />
          {/* Corner sketch decoration */}
          <div className="corner-sketch opacity-20" />
        </div>
        {helperText && !error ? (
          <p id={helperId} className="text-golden-xs text-amber-400/60 italic">
            {helperText}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-golden-xs text-red-400 font-medium">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

