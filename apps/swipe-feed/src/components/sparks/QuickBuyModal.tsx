/**
 * Quick Buy Modal - Seamless mid-session Sparks purchase
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import { QUICK_RELOAD_OPTIONS } from '../../config/sparksCosts';
import { PurchaseLogger } from '../../utils/purchaseLogger';
import { Analytics } from '../../utils/analyticsTracker';
import { FinancialTracking } from '../../utils/financialTracker';

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  requiredSparks: number;
  featureName: string;
  onPurchaseComplete: (newBalance: number) => void;
}

export function QuickBuyModal({
  isOpen,
  onClose,
  currentBalance,
  requiredSparks,
  featureName,
  onPurchaseComplete,
}: QuickBuyModalProps) {
  const [processing, setProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const sparksNeeded = requiredSparks - currentBalance;
  
  // Filter options to show only those that give enough Sparks
  const validOptions = QUICK_RELOAD_OPTIONS.filter(opt => opt.sparks >= sparksNeeded);
  
  // Add a custom option for exact amount needed
  const exactOption = {
    sparks: sparksNeeded,
    price: Math.ceil(sparksNeeded * 0.03 * 100) / 100, // 3 cents per Spark
    exact: true,
  };

  const handleQuickBuy = async (sparks: number, price: number) => {
    setProcessing(true);
    setSelectedOption(sparks);
    
    // Log the purchase attempt
    const userId = localStorage.getItem('mythatron_user_id') || 'demo_user';
    const userEmail = localStorage.getItem('mythatron_user_email') || 'demo@mythatron.com';
    const attemptId = PurchaseLogger.logAttempt(
      userId,
      userEmail,
      'sparks',
      sparks,
      price,
      { feature: featureName, quickBuy: true }
    );
    
    try {
      // Update status to processing
      PurchaseLogger.updateStatus(attemptId, 'processing');
      
      // Simulate purchase - in production, this would call Stripe
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            // Simulate different failure types
            const failureType = Math.random();
            if (failureType < 0.5) {
              reject({ type: 'declined', message: 'Card declined by bank' });
            } else {
              reject({ type: 'failed', message: 'Network error' });
            }
          }
        }, 1500);
      });
      
      // Success!
      const newBalance = currentBalance + sparks;
      
      // Save to localStorage for demo
      localStorage.setItem('mythatron_sparks', newBalance.toString());
      
      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('mythatron_transactions') || '[]');
      transactions.unshift({
        id: `tx_${Date.now()}`,
        type: 'purchase',
        amount: sparks,
        price: price,
        description: `Quick reload for ${featureName}`,
        timestamp: new Date().toISOString(),
        balanceAfter: newBalance,
      });
      localStorage.setItem('mythatron_transactions', JSON.stringify(transactions.slice(0, 100)));
      
      // Log success
      PurchaseLogger.logSuccess(attemptId, `pi_demo_${Date.now()}`, `ch_demo_${Date.now()}`);
      
      // Track revenue in analytics
      Analytics.trackRevenue('purchase_completed', price, {
        sparks,
        feature: featureName,
        quickBuy: true,
      });
      Analytics.trackFeature(featureName, 'sparks_purchased', sparks);
      
      // Record in financial tracker for QuickBooks export
      FinancialTracking.recordRevenue(
        price,
        `${sparks} Sparks - Quick Reload for ${featureName}`,
        userEmail,
        'card',
        { sparks, feature: featureName, quickBuy: true }
      );
      
      setProcessing(false);
      onPurchaseComplete(newBalance);
      onClose();
    } catch (error: any) {
      // Log failure
      if (error.type === 'declined') {
        PurchaseLogger.logDecline(attemptId, error.message, 'card_declined');
        alert(`Payment declined: ${error.message}. Please try a different card.`);
      } else {
        PurchaseLogger.logFailure(attemptId, error.message || 'Unknown error', 'network_error');
        alert(`Payment failed: ${error.message || 'Unknown error'}. Please try again.`);
      }
      
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-light text-white mb-1">Need More Sparks</h2>
              <p className="text-sm text-white/60">Quick reload to continue</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60">Feature:</span>
            <span className="text-sm font-medium text-white">{featureName}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60">Required:</span>
            <span className="text-sm font-medium text-orange-400">{requiredSparks} Sparks</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60">Current Balance:</span>
            <span className="text-sm font-medium text-white">{currentBalance} Sparks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">You Need:</span>
            <span className="text-lg font-medium text-red-400">{sparksNeeded} More Sparks</span>
          </div>
        </div>

        {/* Quick Buy Options */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-white/60 mb-4">One-Click Purchase Options</h3>
          
          {/* Exact amount option */}
          <button
            onClick={() => handleQuickBuy(exactOption.sparks, exactOption.price)}
            disabled={processing}
            className="w-full mb-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparkIcon />
                <div className="text-left">
                  <div className="font-medium text-white">
                    Exact Amount Needed
                  </div>
                  <div className="text-sm text-white/60">
                    {exactOption.sparks} Sparks
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-white">
                  ${exactOption.price.toFixed(2)}
                </div>
                <div className="text-xs text-green-400">Best Value</div>
              </div>
            </div>
            {processing && selectedOption === exactOption.sparks && (
              <div className="mt-2 text-sm text-white/60">Processing...</div>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-black text-white/40">or get extra Sparks</span>
            </div>
          </div>

          {/* Standard options */}
          <div className="grid grid-cols-2 gap-3">
            {validOptions.map(option => (
              <button
                key={option.sparks}
                onClick={() => handleQuickBuy(option.sparks, option.price)}
                disabled={processing}
                className={`p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  option.popular ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                {option.popular && (
                  <div className="text-xs text-purple-400 mb-1">Popular</div>
                )}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <SparkIcon />
                  <span className="text-xl font-light text-white">{option.sparks}</span>
                </div>
                <div className="text-lg font-medium text-white">
                  ${option.price.toFixed(2)}
                </div>
                {processing && selectedOption === option.sparks && (
                  <div className="mt-2 text-xs text-white/60">Processing...</div>
                )}
              </button>
            ))}
          </div>

          {/* More options link */}
          <button
            onClick={() => {
              onClose();
              // Open full Sparks Manager
              window.location.hash = '#sparks-manager';
            }}
            className="w-full mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Need more options? View all packages →
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span>Secure payment via Stripe • Instant delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SparkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
          fill="url(#spark-gradient-quick)" stroke="url(#spark-gradient-quick)" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="spark-gradient-quick" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);
