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
      <div className="flex flex-col gap-2">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={clsx(
            'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm',
            'transition-colors duration-200',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
            error
              ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'hover:border-slate-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
            'placeholder:text-slate-400',
            className
          )}
          {...props}
        />
        {helperText && !error ? (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

