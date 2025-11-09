/**
 * Empty State Component
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Animated Background */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
        </div>
        
        {/* Icon Container */}
        <div className="relative w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center">
          {icon || (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-light text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 text-center max-w-sm mb-6">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all text-white"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all text-white"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
