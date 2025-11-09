/**
 * Sparks Widget - Minimal, auto-updating balance display
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';

interface SparksWidgetProps {
  balance: number;
  onClick?: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export const SparksWidget: React.FC<SparksWidgetProps> = ({
  balance: initialBalance,
  onClick,
  position = 'bottom-right',
}) => {
  const [balance, setBalance] = useState(initialBalance);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-update balance from localStorage
  useEffect(() => {
    const updateBalance = () => {
      const storedBalance = localStorage.getItem('mythatron_sparks');
      if (storedBalance) {
        const newBalance = parseInt(storedBalance, 10);
        if (newBalance !== balance) {
          setBalance(newBalance);
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
        }
      }
    };

    // Check for updates every second
    const interval = setInterval(updateBalance, 1000);
    
    // Listen for custom events
    const handleBalanceUpdate = (e: CustomEvent) => {
      setBalance(e.detail.balance);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    };
    
    window.addEventListener('sparks-balance-updated' as any, handleBalanceUpdate as any);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sparks-balance-updated' as any, handleBalanceUpdate as any);
    };
  }, [balance]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses[position]} z-40 group transition-all hover:scale-105`}
      title="Click for Sparks details"
    >
      <div className={`
        bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl px-4 py-3
        flex items-center gap-3 hover:bg-black/90 hover:border-yellow-500/50
        transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}
      `}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <span className="text-2xl font-light text-yellow-400 tabular-nums">
          {balance.toLocaleString()}
        </span>
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 whitespace-nowrap">
          <p className="text-xs text-white/60">Click for details</p>
        </div>
      </div>
    </button>
  );
};

// Helper function to update balance globally
export function updateSparksBalance(newBalance: number) {
  localStorage.setItem('mythatron_sparks', newBalance.toString());
  window.dispatchEvent(new CustomEvent('sparks-balance-updated', { 
    detail: { balance: newBalance } 
  }));
}
