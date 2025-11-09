/**
 * Sparks Purchase Flow
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';

interface SparkPackage {
  id: string;
  name: string;
  sparks: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const SPARK_PACKAGES: SparkPackage[] = [
  { id: 'starter', name: 'Starter', sparks: 100, price: 4.99 },
  { id: 'creator', name: 'Creator', sparks: 500, price: 19.99, bonus: 50, popular: true },
  { id: 'pro', name: 'Pro', sparks: 1000, price: 34.99, bonus: 150 },
  { id: 'legend', name: 'Legend', sparks: 2500, price: 79.99, bonus: 500 },
];

export function SparksPurchaseFlow({ onClose }: { onClose: () => void }) {
  const [selectedPackage, setSelectedPackage] = useState<SparkPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add sparks to user's balance (mock)
    const currentBalance = parseInt(localStorage.getItem('mythatron_sparks') || '0');
    const newBalance = currentBalance + selectedPackage.sparks + (selectedPackage.bonus || 0);
    localStorage.setItem('mythatron_sparks', newBalance.toString());
    
    setProcessing(false);
    setSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const SparkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
            fill="url(#spark-gradient)" stroke="url(#spark-gradient)" strokeWidth="0.5"/>
      <defs>
        <linearGradient id="spark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <SparkIcon />
          </div>
          <h2 className="text-2xl font-light text-white mb-2">Purchase Successful!</h2>
          <p className="text-white/60 mb-6">
            {selectedPackage?.sparks} {selectedPackage?.bonus && `+ ${selectedPackage.bonus} bonus`} Sparks have been added to your account
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all text-white"
          >
            Start Creating!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-4xl w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-white">Get Sparks</h2>
              <p className="text-sm text-white/60 mt-1">Power up your creativity with Sparks</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Packages */}
        <div className="p-6">
          <h3 className="text-lg font-light text-white mb-4">Choose a package</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPARK_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-6 rounded-xl border transition-all ${
                  selectedPackage?.id === pkg.id
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                
                <div className="flex justify-center mb-4">
                  <SparkIcon />
                </div>
                
                <h4 className="text-lg font-medium text-white mb-2">{pkg.name}</h4>
                
                <div className="text-3xl font-light text-white mb-1">
                  {pkg.sparks.toLocaleString()}
                  {pkg.bonus && (
                    <span className="text-sm text-yellow-400 ml-2">+{pkg.bonus}</span>
                  )}
                </div>
                <p className="text-xs text-white/40 mb-4">Sparks</p>
                
                <div className="text-xl font-medium text-white">
                  ${pkg.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        {selectedPackage && (
          <div className="p-6 border-t border-white/10">
            <h3 className="text-lg font-light text-white mb-4">Payment method</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-white/10 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-white/60">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <p className="text-sm text-white">Credit/Debit Card</p>
              </button>
              
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-xl border transition-all ${
                  paymentMethod === 'paypal'
                    ? 'bg-white/10 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-white/60">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20"/>
                </svg>
                <p className="text-sm text-white">PayPal</p>
              </button>
            </div>

            {/* Payment Form (simplified) */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Card number"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 bg-white/5 rounded-xl mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Package</span>
                <span className="text-white">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Sparks</span>
                <span className="text-white">
                  {selectedPackage.sparks.toLocaleString()}
                  {selectedPackage.bonus && (
                    <span className="text-yellow-400 ml-2">+{selectedPackage.bonus}</span>
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between">
                <span className="text-white font-medium">Total</span>
                <span className="text-white font-medium">${selectedPackage.price}</span>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={processing}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Purchase ${selectedPackage.sparks.toLocaleString()} Sparks`}
            </button>

            <p className="text-xs text-white/40 text-center mt-4">
              Secure payment powered by Stripe. Your payment info is never stored.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
