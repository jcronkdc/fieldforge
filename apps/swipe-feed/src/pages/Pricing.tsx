import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons/Icons';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for exploring our creative tools',
      sparks: 100,
      features: [
        '100 Sparks per month',
        'Access to basic features',
        'Community support',
        'Public creations only',
        '1 active project',
        'Standard processing speed'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Creator',
      price: '$19',
      period: 'per month',
      description: 'For serious content creators',
      sparks: 2000,
      features: [
        '2,000 Sparks per month',
        'All premium features',
        'Priority support',
        'Private projects',
        'Unlimited active projects',
        'Fast processing speed',
        'Collaboration tools',
        'Advanced AI models'
      ],
      cta: 'Go Creator',
      popular: true
    },
    {
      name: 'Studio',
      price: '$79',
      period: 'per month',
      description: 'For teams and professionals',
      sparks: 10000,
      features: [
        '10,000 Sparks per month',
        'Everything in Creator',
        'Team collaboration',
        'API access',
        'Custom AI training',
        'White-label options',
        'Dedicated support',
        'Analytics dashboard',
        'Export to professional formats'
      ],
      cta: 'Go Studio',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'Tailored solutions for your organization',
      sparks: 'Unlimited',
      features: [
        'Unlimited Sparks',
        'Everything in Studio',
        'Custom integrations',
        'SLA guarantees',
        'Dedicated account manager',
        'On-premise deployment',
        'Custom AI models',
        'Training & onboarding',
        'Priority feature requests'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black text-xl">
                M
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">MythaTron</h1>
            </Link>
            <Link 
              to="/"
              className="px-6 py-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
            >
              <span className="font-bold uppercase tracking-wider text-sm">Back to App</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            SIMPLE PRICING
          </h1>
          <p className="text-xl text-cyan-500/60 max-w-3xl mx-auto">
            Choose the perfect plan for your creative journey. Upgrade or downgrade anytime.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-gradient-to-b from-gray-900/50 to-black border rounded-2xl p-8 transition-all ${
                plan.popular 
                  ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-105' 
                  : 'border-cyan-500/20 hover:border-cyan-400/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-cyan-500 text-black text-xs font-black rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] z-20 tracking-wider whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-black text-cyan-400">{plan.price}</span>
                <span className="text-white/60 text-sm ml-2">{plan.period}</span>
              </div>

              {/* Sparks */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-cyan-500/20">
                <Icons.Sparkle size={20} className="text-yellow-400" />
                <span className="text-white font-bold">
                  {typeof plan.sparks === 'number' ? plan.sparks.toLocaleString() : plan.sparks} Sparks
                </span>
              </div>

              {/* Description */}
              <p className="text-cyan-500/60 text-sm mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 mt-0.5 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black'
                  : 'border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-cyan-500/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-white mb-12 text-center uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">What are Sparks?</h3>
              <p className="text-white/60">
                Sparks are our universal currency for AI operations. Each AI action costs a certain number of Sparks based on computational complexity. 1 Spark ≈ $0.02.
              </p>
            </div>
            
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Can I change my plan anytime?</h3>
              <p className="text-white/60">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.
              </p>
            </div>
            
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">What happens if I run out of Sparks?</h3>
              <p className="text-white/60">
                You can purchase additional Sparks anytime, or wait for your monthly renewal. Free users can earn extra Sparks through referrals and community contributions.
              </p>
            </div>
            
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Is there a free trial?</h3>
              <p className="text-white/60">
                Our Free plan is essentially a permanent trial. You get 100 Sparks every month to explore all our basic features. No credit card required!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
