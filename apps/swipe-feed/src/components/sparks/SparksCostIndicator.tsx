/**
 * Sparks Cost Indicator - Clear pricing display
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';
import { formatSparksCost, calculateDollarValue } from '../../config/sparksCosts';

interface SparksCostIndicatorProps {
  cost: number;
  balance?: number;
  showDollarValue?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function SparksCostIndicator({
  cost,
  balance = 0,
  showDollarValue = true,
  size = 'medium',
  className = '',
}: SparksCostIndicatorProps) {
  const canAfford = balance >= cost || cost === 0;
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2',
  };

  if (cost === 0) {
    return (
      <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 ${className}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span className="font-medium">FREE</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${
      canAfford 
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    } rounded-lg border ${className}`}>
      <SparkIcon />
      <span className="font-medium">{cost}</span>
      {showDollarValue && (
        <span className="text-white/40">({calculateDollarValue(cost)})</span>
      )}
      {!canAfford && balance > 0 && (
        <span className="text-xs text-red-300 ml-1">
          Need {cost - balance} more
        </span>
      )}
    </div>
  );
}

interface FeatureCostCardProps {
  title: string;
  description: string;
  cost: number;
  balance?: number;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export function FeatureCostCard({
  title,
  description,
  cost,
  balance = 0,
  onAction,
  actionLabel = 'Use Feature',
  disabled = false,
}: FeatureCostCardProps) {
  const canAfford = balance >= cost || cost === 0;

  return (
    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
          <p className="text-xs text-white/60">{description}</p>
        </div>
        <SparksCostIndicator 
          cost={cost} 
          balance={balance} 
          size="small"
          showDollarValue={false}
        />
      </div>
      
      {onAction && (
        <button
          onClick={onAction}
          disabled={disabled || !canAfford}
          className={`w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            canAfford && !disabled
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {!canAfford ? `Need ${cost} Sparks` : actionLabel}
        </button>
      )}
    </div>
  );
}

const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
          fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

interface PricingTooltipProps {
  children: React.ReactNode;
  cost: number;
  feature: string;
}

export function PricingTooltip({ children, cost, feature }: PricingTooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 whitespace-nowrap">
            <div className="text-xs text-white/80 mb-1">{feature}</div>
            <div className="flex items-center gap-2">
              <SparksCostIndicator cost={cost} size="small" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
