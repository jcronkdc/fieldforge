/**
 * Sparks Manager - Complete monetization system
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { SparksPurchaseFlow } from './SparksPurchaseFlow';

interface Subscription {
  id: string;
  tier: 'free' | 'creator' | 'professional' | 'enterprise';
  displayName: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  monthlySparks: number;
  features: string[];
  status: 'active' | 'cancelled' | 'expired';
  nextBilling?: string;
  cancelAtPeriodEnd?: boolean;
}

interface QuickReload {
  amount: number;
  price: number;
}

export function SparksManager({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'quick' | 'packages' | 'subscription'>('quick');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load current balance
  useEffect(() => {
    const balance = parseInt(localStorage.getItem('mythatron_sparks') || '0');
    setCurrentBalance(balance);
    
    // Mock subscription
    const mockSub: Subscription = {
      id: 'sub-1',
      tier: 'free',
      displayName: 'Free Plan',
      monthlyPrice: 0,
      monthlySparks: 0,
      features: ['3 AI uses per month', 'Unlimited story branches', 'Join Angry Lips sessions'],
      status: 'active',
    };
    setCurrentSubscription(mockSub);
  }, []);

  const quickReloads: QuickReload[] = [
    { amount: 50, price: 2.99 },
    { amount: 100, price: 4.99 },
    { amount: 250, price: 9.99 },
    { amount: 500, price: 17.99 },
  ];

  const subscriptionTiers = [
    {
      tier: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlySparks: 0,
      features: [
        '3 AI uses per month',
        'Unlimited story branches',
        'Join Angry Lips sessions',
        'Basic themes',
      ],
    },
    {
      tier: 'creator',
      name: 'Creator',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      monthlySparks: 500,
      popular: true,
      features: [
        '50 AI uses per month',
        '500 Sparks monthly',
        'Priority support',
        'Early access features',
        'Custom themes',
      ],
    },
    {
      tier: 'professional',
      name: 'Professional',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      monthlySparks: 1200,
      features: [
        'Unlimited AI uses',
        '1,200 Sparks monthly',
        'Advanced analytics',
        'Custom themes',
        'API access (coming soon)',
      ],
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      monthlySparks: 3000,
      features: [
        'Everything in Pro',
        '3,000 Sparks monthly',
        'Dedicated support',
        'Custom integrations',
        'Team management',
      ],
    },
  ];

  const handleQuickReload = async (reload: QuickReload) => {
    setProcessing(true);
    
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newBalance = currentBalance + reload.amount;
    setCurrentBalance(newBalance);
    localStorage.setItem('mythatron_sparks', newBalance.toString());
    
    setProcessing(false);
    
    // Show success message
    alert(`Successfully added ${reload.amount} Sparks!`);
  };

  const handleSubscribe = async (tier: string, billing: 'monthly' | 'yearly') => {
    setProcessing(true);
    
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedTier = subscriptionTiers.find(t => t.tier === tier);
    if (selectedTier) {
      setCurrentSubscription({
        id: `sub-${Date.now()}`,
        tier: tier as any,
        displayName: selectedTier.name,
        monthlyPrice: selectedTier.monthlyPrice,
        yearlyPrice: selectedTier.yearlyPrice,
        monthlySparks: selectedTier.monthlySparks,
        features: selectedTier.features,
        status: 'active',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      });
      
      // Add initial monthly sparks
      if (selectedTier.monthlySparks > 0) {
        const newBalance = currentBalance + selectedTier.monthlySparks;
        setCurrentBalance(newBalance);
        localStorage.setItem('mythatron_sparks', newBalance.toString());
      }
    }
    
    setProcessing(false);
  };

  const SparkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
            fill="url(#spark-gradient-manager)" stroke="url(#spark-gradient-manager)" strokeWidth="0.5"/>
      <defs>
        <linearGradient id="spark-gradient-manager" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-6xl w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-black/90 backdrop-blur-xl p-6 border-b border-white/10 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SparkIcon />
                <div>
                  <h2 className="text-2xl font-light text-white">Sparks Center</h2>
                  <p className="text-sm text-white/60">Manage your Sparks and subscription</p>
                </div>
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

            {/* Current Balance */}
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Current Balance</p>
                  <p className="text-3xl font-light text-white mt-1">{currentBalance.toLocaleString()} Sparks</p>
                </div>
                {currentSubscription && currentSubscription.tier !== 'free' && (
                  <div className="text-right">
                    <p className="text-sm text-white/60">Monthly Sparks</p>
                    <p className="text-xl font-light text-yellow-400">+{currentSubscription.monthlySparks}</p>
                    <p className="text-xs text-white/40">Next: {currentSubscription.nextBilling}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveTab('quick')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'quick'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Quick Reload
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'packages'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Spark Packages
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'subscription'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Subscription
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Quick Reload */}
            {activeTab === 'quick' && (
              <div>
                <h3 className="text-lg font-light text-white mb-6">Quick Reload - Instant Sparks</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {quickReloads.map((reload) => (
                    <button
                      key={reload.amount}
                      onClick={() => handleQuickReload(reload)}
                      disabled={processing}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all disabled:opacity-50"
                    >
                      <SparkIcon />
                      <div className="text-2xl font-light text-white mt-2">
                        {reload.amount}
                      </div>
                      <div className="text-sm text-white/40 mb-2">Sparks</div>
                      <div className="text-lg font-medium text-white">
                        ${reload.price}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowPurchaseFlow(true)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Need more? View all packages →
                  </button>
                </div>

                {/* Recent Purchases */}
                <div className="mt-8 p-4 bg-white/5 rounded-xl">
                  <h4 className="text-sm font-medium text-white/60 mb-3">Recent Purchases</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Nov 7, 2025</span>
                      <span className="text-white">+100 Sparks</span>
                      <span className="text-white/40">$4.99</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Nov 5, 2025</span>
                      <span className="text-white">+500 Sparks</span>
                      <span className="text-white/40">$19.99</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Packages */}
            {activeTab === 'packages' && (
              <div>
                <h3 className="text-lg font-light text-white mb-6">Spark Packages - Best Value</h3>
                <button
                  onClick={() => setShowPurchaseFlow(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium transition-all text-white"
                >
                  View All Spark Packages
                </button>
              </div>
            )}

            {/* Subscription */}
            {activeTab === 'subscription' && (
              <div>
                <h3 className="text-lg font-light text-white mb-6">Monthly Subscription Plans</h3>
                
                {/* Current Subscription */}
                {currentSubscription && (
                  <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-white/60">Current Plan</p>
                        <p className="text-xl font-light text-white">{currentSubscription.displayName}</p>
                        {currentSubscription.tier !== 'free' && (
                          <p className="text-sm text-white/40 mt-1">
                            Next billing: {currentSubscription.nextBilling}
                          </p>
                        )}
                      </div>
                      {currentSubscription.tier !== 'free' && (
                        <button className="text-sm text-red-400 hover:text-red-300">
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Subscription Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subscriptionTiers.map((tier) => (
                    <div
                      key={tier.tier}
                      className={`relative p-6 rounded-xl border ${
                        tier.popular
                          ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-medium text-white">
                          Most Popular
                        </div>
                      )}
                      
                      <h4 className="text-lg font-medium text-white mb-2">{tier.name}</h4>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-light text-white">${tier.monthlyPrice}</span>
                        <span className="text-sm text-white/40">/month</span>
                      </div>
                      
                      {tier.monthlySparks > 0 && (
                        <div className="mb-4 p-2 bg-yellow-500/10 rounded-lg text-center">
                          <span className="text-sm text-yellow-400">
                            {tier.monthlySparks} Sparks/month
                          </span>
                        </div>
                      )}
                      
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-white/60">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 mt-0.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      {currentSubscription?.tier === tier.tier ? (
                        <button disabled className="w-full px-4 py-2 bg-white/10 rounded-lg text-white/60 cursor-not-allowed">
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(tier.tier, 'monthly')}
                          disabled={processing}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all text-white disabled:opacity-50"
                        >
                          {tier.monthlyPrice === 0 ? 'Stay Free' : 'Subscribe'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Annual Billing */}
                <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Save with Annual Billing</p>
                      <p className="text-sm text-white/60">Get 2 months free when you pay yearly</p>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                      View Annual Plans
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Flow Modal */}
      {showPurchaseFlow && (
        <SparksPurchaseFlow onClose={() => setShowPurchaseFlow(false)} />
      )}
    </>
  );
}
