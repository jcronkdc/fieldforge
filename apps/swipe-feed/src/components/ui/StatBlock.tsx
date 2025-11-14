import React from 'react';

interface StatBlockProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  label,
  value,
  icon,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'rounded-lg p-4 border';
  
  const variantStyles = {
    default: 'bg-slate-800/50 border-slate-700 text-slate-300',
    primary: 'bg-blue-900/20 border-gray-700 text-blue-400',
    success: 'bg-green-900/20 border-green-700 text-green-400',
    warning: 'bg-yellow-900/20 border-yellow-700 text-yellow-400',
    danger: 'bg-red-900/20 border-red-700 text-red-400'
  };
  
  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const valueSizeStyles = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`${sizeStyles[size]} font-medium opacity-75`}>{label}</p>
          <p className={`${valueSizeStyles[size]} font-bold mt-1`}>{value}</p>
        </div>
        {icon && (
          <div className="opacity-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
