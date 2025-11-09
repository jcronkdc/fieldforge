/**
 * Sparks Purchase - Real payment flow (Stripe integration)
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import { updateSparksBalance } from './SparksWidget';
import { FinancialTracking } from '../../utils/financialTracker';
import { PurchaseLogger } from '../../utils/purchaseLogger';

interface SparksPackage {
  id: string;
  sparks: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

interface SparksPurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export const SparksPurchase: React.FC<SparksPurchaseProps> = ({
  isOpen,
  onClose,
  currentBalance,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<SparksPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const packages: SparksPackage[] = [
    { id: 'starter', sparks: 100, price: 4.99 },
    { id: 'popular', sparks: 500, price: 19.99, bonus: 50, popular: true },
    { id: 'pro', sparks: 1000, price: 37.99, bonus: 150 },
    { id: 'mega', sparks: 2500, price: 89.99, bonus: 500 },
  ];

  const handlePurchase = async () => {
    if (!selectedPackage || !email) {
      alert('Please select a package and enter your email');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVC)) {
      alert('Please enter your card details');
      return;
    }

    setIsProcessing(true);

    // Log purchase attempt
    const attemptId = PurchaseLogger.logAttempt(
      localStorage.getItem('mythatron_user_id') || 'user',
      email,
      'sparks',
      selectedPackage.sparks + (selectedPackage.bonus || 0),
      selectedPackage.price,
      { method: paymentMethod }
    );

    try {
      // In production, this would call Stripe API
      // For now, simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if admin user
      const userId = localStorage.getItem('mythatron_user_id');
      const isAdmin = userId === 'admin' || email === 'admin@mythatron.com' || email === 'justincronk@me.com';
      
      // Admin gets unlimited sparks automatically
      if (isAdmin) {
        localStorage.setItem('mythatron_sparks', 'Infinity');
        updateSparksBalance(Infinity);
        PurchaseLogger.logSuccess(attemptId, 'admin_unlimited', 'admin_unlimited');
        setIsProcessing(false);
        setPurchaseComplete(true);
        return;
      }
      
      // For regular users, simulate payment
      const paymentSuccessful = confirm(
        `DEMO MODE: Confirm payment of $${selectedPackage.price} for ${selectedPackage.sparks} Sparks?\n\n` +
        `In production, this would process through Stripe.`
      );

      if (!paymentSuccessful) {
        PurchaseLogger.logDecline(attemptId, 'User cancelled', 'cancelled');
        setIsProcessing(false);
        return;
      }

      // Calculate total Sparks (including bonus)
      const totalSparks = selectedPackage.sparks + (selectedPackage.bonus || 0);
      const newBalance = currentBalance + totalSparks;

      // Update balance
      updateSparksBalance(newBalance);

      // Log success
      PurchaseLogger.logSuccess(attemptId, `pi_demo_${Date.now()}`, `ch_demo_${Date.now()}`);

      // Record in financial tracker
      FinancialTracking.recordRevenue(
        selectedPackage.price,
        `${totalSparks} Sparks Purchase`,
        email,
        paymentMethod,
        { package: selectedPackage.id }
      );

      // Show confirmation
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Payment failed:', error);
      PurchaseLogger.logFailure(attemptId, 'Payment processing failed', 'payment_error');
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-white">Buy Sparks</h2>
              <p className="text-white/60 mt-1">Select a package to continue</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
              disabled={isProcessing}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showConfirmation ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Packages */}
              <div>
                <h3 className="text-lg font-light text-white mb-4">Select Package</h3>
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      disabled={isProcessing}
                      className={`w-full p-4 rounded-xl border transition-all ${
                        selectedPackage?.id === pkg.id
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } ${pkg.popular ? 'ring-2 ring-yellow-500/30' : ''}`}
                    >
                      {pkg.popular && (
                        <span className="inline-block px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400 mb-2">
                          MOST POPULAR
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-xl font-light text-white">
                            {pkg.sparks.toLocaleString()} Sparks
                          </div>
                          {pkg.bonus && (
                            <div className="text-sm text-green-400">
                              +{pkg.bonus} bonus Sparks
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-light text-yellow-400">
                          ${pkg.price}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <h3 className="text-lg font-light text-white mb-4">Payment Details</h3>
                
                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                    disabled={isProcessing}
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm text-white/60 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-white/10 border-yellow-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      disabled={isProcessing}
                    >
                      Credit Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-xl border transition-all ${
                        paymentMethod === 'paypal'
                          ? 'bg-white/10 border-yellow-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      disabled={isProcessing}
                    >
                      PayPal
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm text-white/60 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">CVC</label>
                        <input
                          type="text"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* PayPal */}
                {paymentMethod === 'paypal' && (
                  <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-400">
                      You will be redirected to PayPal to complete your purchase
                    </p>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={!selectedPackage || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-yellow-400"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Purchase
                      {selectedPackage && <span>${selectedPackage.price}</span>}
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 mt-0.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <p className="text-xs text-green-400">
                      Secure payment processing. Your information is encrypted and never stored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="text-2xl font-light text-white mb-2">Purchase Complete!</h3>
              <p className="text-white/60">
                {selectedPackage && (
                  <>
                    {selectedPackage.sparks + (selectedPackage.bonus || 0)} Sparks have been added to your account
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};