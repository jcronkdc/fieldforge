import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium';
  
  const variantStyles = {
    default: 'bg-slate-700 text-slate-300',
    success: 'bg-green-900/50 text-green-400',
    warning: 'bg-blue-900/50 text-blue-400',
    danger: 'bg-red-900/50 text-red-400',
    info: 'bg-blue-900/50 text-blue-400'
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
