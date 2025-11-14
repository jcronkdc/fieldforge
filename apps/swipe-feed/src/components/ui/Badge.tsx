import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[5px] backdrop-blur-sm transition-all duration-300 shadow-sm vitruvian-rect';
  
  const variantStyles = {
    default: 'bg-slate-800/70 text-amber-200 border border-amber-500/20 hover:bg-slate-700/70',
    primary: 'bg-amber-900/40 text-amber-300 border border-amber-500/40 hover:bg-amber-800/50 shadow-amber-500/10',
    success: 'bg-green-900/40 text-green-300 border border-green-500/40 hover:bg-green-800/50 shadow-green-500/10',
    warning: 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-800/50 shadow-yellow-500/10',
    danger: 'bg-red-900/40 text-red-300 border border-red-500/40 hover:bg-red-800/50 shadow-red-500/10'
  };
  
  const sizeStyles = {
    sm: 'px-[5px] py-[3px] text-golden-xs',
    md: 'px-[8px] py-[5px] text-golden-sm',
    lg: 'px-[13px] py-[8px] text-golden-base'
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} technical-annotation`}>
      {children}
    </span>
  );
};
