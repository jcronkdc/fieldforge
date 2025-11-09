/**
 * Balance Widget - Always-visible Sparks balance with quick reload
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { QuickBuyModal } from './QuickBuyModal';
import { useSparks } from './SparksContext';

interface BalanceWidgetProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  compact?: boolean;
  showQuickReload?: boolean;
}

export function BalanceWidget({ 
  position = 'top-right',
  compact = false,
  showQuickReload = true
}: BalanceWidgetProps) {
  const { balance } = useSparks();
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [animateBalance, setAnimateBalance] = useState(false);
  const [previousBalance, setPreviousBalance] = useState(0);

  useEffect(() => {
    // Load balance from localStorage
    const loadBalance = () => {
      const stored = localStorage.getItem('mythatron_sparks');
      const newBalance = stored ? parseInt(stored) : 0;
      
      if (newBalance !== balance) {
        setPreviousBalance(balance);
        setBalance(newBalance);
        setAnimateBalance(true);
        setTimeout(() => setAnimateBalance(false), 1000);
      }
    };

    loadBalance();
    
    // Listen for storage changes (when balance updates in other tabs)
    const interval = setInterval(loadBalance, 1000);
    window.addEventListener('storage', loadBalance);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadBalance);
    };
  }, [balance]);

  const positionClasses = {
    'top-right': 'fixed top-20 right-4',
    'top-left': 'fixed top-20 left-4',
    'bottom-right': 'fixed bottom-20 right-4',
    'bottom-left': 'fixed bottom-20 left-4',
  };

  const getBalanceColor = () => {
    if (balance === 0) return 'from-red-500/20 to-orange-500/20 border-red-500/30';
    if (balance < 50) return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30';
    if (balance < 200) return 'from-yellow-500/20 to-green-500/20 border-yellow-500/30';
    return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
  };

  const SparkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
            fill="url(#spark-gradient-widget)" stroke="url(#spark-gradient-widget)" strokeWidth="0.5"/>
      <defs>
        <linearGradient id="spark-gradient-widget" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (compact) {
    return (
      <>
        <div className={`${positionClasses[position]} z-40`}>
          <button
            onClick={() => setShowQuickBuy(true)}
            className={`group flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${getBalanceColor()} backdrop-blur-sm rounded-full border transition-all hover:scale-105 ${
              animateBalance ? 'animate-pulse' : ''
            }`}
          >
            <SparkIcon />
            <span className="text-lg font-medium text-white">
              {balance.toLocaleString()}
            </span>
            {balance === 0 && (
              <span className="text-xs text-red-300 ml-1">Empty</span>
            )}
          </button>
        </div>

        {showQuickBuy && (
          <QuickBuyModal
            isOpen={showQuickBuy}
            onClose={() => setShowQuickBuy(false)}
            currentBalance={balance}
            requiredSparks={50} // Default amount
            featureName="Quick Reload"
            onPurchaseComplete={(newBalance) => {
              setBalance(newBalance);
              setShowQuickBuy(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`${positionClasses[position]} z-40`}>
        <div className={`bg-black/80 backdrop-blur-xl rounded-2xl border ${
          getBalanceColor().split(' ')[2]
        } p-4 shadow-lg ${animateBalance ? 'animate-pulse' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SparkIcon />
              <span className="text-sm font-medium text-white/60">Sparks Balance</span>
            </div>
            {previousBalance !== balance && animateBalance && (
              <span className={`text-xs ${
                balance > previousBalance ? 'text-green-400' : 'text-orange-400'
              }`}>
                {balance > previousBalance ? '+' : ''}{balance - previousBalance}
              </span>
            )}
          </div>

          {/* Balance */}
          <div className="text-3xl font-light text-white mb-3">
            {balance.toLocaleString()}
          </div>

          {/* Status */}
          <div className="mb-3">
            {balance === 0 ? (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Balance empty - reload to continue</span>
              </div>
            ) : balance < 50 ? (
              <div className="flex items-center gap-1 text-xs text-orange-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>Low balance</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Ready to create</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {showQuickReload && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickBuy(true)}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-sm font-medium transition-all"
              >
                Quick Reload
              </button>
              <button
                onClick={() => window.location.hash = '#sparks-manager'}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Manage Sparks"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                </svg>
              </button>
            </div>
          )}

          {/* Recent transaction */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Last transaction</span>
              <button 
                onClick={() => window.location.hash = '#transactions'}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuickBuy && (
        <QuickBuyModal
          isOpen={showQuickBuy}
          onClose={() => setShowQuickBuy(false)}
          currentBalance={balance}
          requiredSparks={50} // Default amount
          featureName="Quick Reload"
          onPurchaseComplete={(newBalance) => {
            setBalance(newBalance);
            setShowQuickBuy(false);
          }}
        />
      )}
    </>
  );
}
