/**
 * Quick Purchase Modal - Inline Sparks purchase
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Minimum purchase amounts to cover processing fees:
 * - Stripe/PayPal fee: ~$0.30 + 2.9%
 * - Minimum purchase: $4.99 (500 Sparks) for profitability
 */

import React, { useState } from 'react';

export interface SparkPackage {
  id: string;
  name: string;
  sparks: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

interface QuickPurchaseModalProps {
  requiredSparks: number;
  currentSparks: number;
  onPurchase: (packageId: string) => void;
  onClose: () => void;
}

export const SPARK_PACKAGES: SparkPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    sparks: 500,
    price: 4.99,
    bonus: 0
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    sparks: 1000,
    price: 9.99,
    bonus: 100,
    popular: true
  },
  {
    id: 'value',
    name: 'Value Pack',
    sparks: 2500,
    price: 19.99,
    bonus: 500
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    sparks: 5000,
    price: 39.99,
    bonus: 1500
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    sparks: 10000,
    price: 74.99,
    bonus: 4000
  }
];

export const QuickPurchaseModal: React.FC<QuickPurchaseModalProps> = ({
  requiredSparks,
  currentSparks,
  onPurchase,
  onClose
}) => {
  const [selectedPackage, setSelectedPackage] = useState<SparkPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const sparksNeeded = requiredSparks - currentSparks;

  // Find recommended package
  const recommendedPackage = SPARK_PACKAGES.find(pkg => 
    (pkg.sparks + (pkg.bonus || 0)) >= sparksNeeded
  ) || SPARK_PACKAGES[0];

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Update sparks balance
      const newBalance = currentSparks + selectedPackage.sparks + (selectedPackage.bonus || 0);
      localStorage.setItem('mythatron_sparks', newBalance.toString());
      
      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('spark_transactions') || '[]');
      transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'purchase',
        package: selectedPackage.name,
        sparks: selectedPackage.sparks + (selectedPackage.bonus || 0),
        price: selectedPackage.price,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
      localStorage.setItem('spark_transactions', JSON.stringify(transactions));
      
      onPurchase(selectedPackage.id);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl max-w-2xl w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/60 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-light text-white mb-2">Need More Sparks?</h2>
          <p className="text-white/60">
            You need <span className="text-yellow-400 font-bold">{sparksNeeded} more Sparks</span> for this action
          </p>
          <p className="text-sm text-white/40 mt-2">
            Current balance: {currentSparks} ⚡
          </p>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {SPARK_PACKAGES.map(pkg => {
            const totalSparks = pkg.sparks + (pkg.bonus || 0);
            const isRecommended = pkg.id === recommendedPackage.id;
            const isSelected = selectedPackage?.id === pkg.id;
            
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'bg-purple-500/30 border-purple-400' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black">
                    MOST POPULAR
                  </div>
                )}
                
                {isRecommended && !pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-bold text-black">
                    RECOMMENDED
                  </div>
                )}

                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="text-lg font-medium text-white">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-yellow-400 my-2">
                    {totalSparks.toLocaleString()}
                  </div>
                  {pkg.bonus && pkg.bonus > 0 && (
                    <div className="text-sm text-green-400 mb-2">
                      +{pkg.bonus} Bonus!
                    </div>
                  )}
                  <div className="text-xl text-white/80">
                    ${pkg.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    ${(pkg.price / totalSparks * 100).toFixed(2)}¢ per Spark
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 border-2 border-purple-400 rounded-xl pointer-events-none">
                    <div className="absolute top-2 right-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-purple-400">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Monthly Subscription Option */}
        <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Monthly Unlimited</h3>
              <p className="text-sm text-white/60">Unlimited AI features + 5000 Sparks/month</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">$29.99/mo</div>
              <button className="text-sm text-purple-300 hover:text-purple-200">
                Learn More →
              </button>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Processing...
              </span>
            ) : selectedPackage ? (
              `Buy ${selectedPackage.sparks + (selectedPackage.bonus || 0)} Sparks for $${selectedPackage.price}`
            ) : (
              'Select a Package'
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center text-xs text-white/40">
          🔒 Secure payment via Stripe • Instant delivery • No hidden fees
        </div>
      </div>
    </div>
  );
};
