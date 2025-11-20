import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, TrendingUp, Shield, Users, Zap, DollarSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthContext } from '../components/auth/AuthProvider';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PricingTier {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  cta: string;
  popular?: boolean;
  description: string;
}

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const tiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      yearlyPrice: 39,
      description: 'Perfect for small contractors and teams',
      features: [
        'Up to 5 team members',
        'Basic project management',
        'Safety compliance tracking',
        'Email support',
        'Mobile & offline access',
        'Basic reporting',
        '5GB storage'
      ],
      cta: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 149,
      yearlyPrice: 119,
      description: 'For growing construction companies',
      popular: true,
      features: [
        'Up to 20 team members',
        'Advanced analytics',
        'Equipment management',
        'Time tracking & payroll',
        'Priority support',
        'API access',
        'Document management',
        'Custom workflows',
        'Real-time collaboration',
        '3D visualization',
        'AI-powered insights',
        '50GB storage'
      ],
      cta: 'Start Free Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 499,
      yearlyPrice: 399,
      description: 'For large-scale operations',
      features: [
        'Unlimited team members',
        'Custom integrations',
        'Advanced 3D visualization',
        'AI-powered insights',
        'Dedicated account manager',
        'SLA guarantee',
        'On-premise deployment option',
        'White-label options',
        '24/7 phone support',
        'Custom training',
        'Unlimited storage'
      ],
      cta: 'Contact Sales'
    }
  ];

  const handleCheckout = async (tierId: string) => {
    if (!user) {
      // Redirect to sign up if not logged in
      navigate('/signup', { state: { redirect: '/pricing', plan: tierId } });
      return;
    }

    setLoading(tierId);

    try {
      // Call backend to create Stripe Checkout session
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: tierId,
          billingCycle: billingCycle
        })
      });

      const { checkoutUrl, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur text-white rounded-full text-sm font-medium mb-8 border border-white/10">
            <Sparkles className="w-4 h-4" />
            14-day free trial • No credit card required
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Simple, Transparent
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Pricing
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Choose the plan that fits your team. Scale up or down anytime. 
            All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-20 h-10 bg-gray-700 rounded-full p-1 transition-colors"
            >
              <motion.div
                className="absolute w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                animate={{ x: billingCycle === 'monthly' ? 0 : 40 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
              <span className="text-green-400 text-sm ml-2">(Save 20%)</span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${tier.popular ? 'scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className={`h-full p-8 rounded-2xl backdrop-blur ${
                tier.popular 
                  ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50 border-2 border-blue-500/50' 
                  : 'bg-gray-900/50 border border-gray-800'
              }`}>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 mb-6">{tier.description}</p>
                
                <div className="mb-8">
                  <span className="text-5xl font-bold text-white">
                    ${billingCycle === 'monthly' ? tier.price : tier.yearlyPrice}
                  </span>
                  <span className="text-gray-400 ml-2">/month</span>
                  {billingCycle === 'yearly' && (
                    <div className="text-sm text-green-400 mt-1">
                      Billed annually (${tier.yearlyPrice * 12}/year)
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.cta === 'Contact Sales' ? (
                  <Link
                    to="/contact"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(tier.id)}
                    disabled={loading === tier.id}
                    className={`w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {loading === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      tier.cta
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROI Section */}
      <section className="relative py-24 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Return on Investment
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-6">
                <TrendingUp className="w-10 h-10 text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">45 min/day</div>
              <div className="text-gray-400">Saved per worker</div>
              <div className="text-green-400 text-sm mt-2">= $750/month value</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-6">
                <Shield className="w-10 h-10 text-green-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">73%</div>
              <div className="text-gray-400">Fewer incidents</div>
              <div className="text-green-400 text-sm mt-2">= $500K+ saved</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-500/20 rounded-full mb-6">
                <Users className="w-10 h-10 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Field adoption</div>
              <div className="text-green-400 text-sm mt-2">vs 20% industry avg</div>
            </motion.div>
          </div>

          <div className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur border border-blue-500/20">
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">ROI in 30 Days</h3>
            <p className="text-lg text-gray-300 mb-6">
              FieldForge pays for itself in the first month through time savings alone.
              Everything after that is pure profit.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold"
            >
              See ROI Calculator
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">Is there a setup fee?</h3>
              <p className="text-gray-400">No. We believe in proving our value, not charging for promises.</p>
            </div>
            
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-400">Yes. Upgrade or downgrade instantly. We'll prorate any differences.</p>
            </div>
            
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">What about data migration?</h3>
              <p className="text-gray-400">Free migration from any major construction software for Professional and Enterprise plans.</p>
            </div>
            
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">Yes! 14 days, full access, no credit card required. We even help with setup.</p>
            </div>

            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards through our secure payment processor, Stripe. Enterprise customers can also pay via invoice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join 500+ construction teams already working smarter with FieldForge
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/signup"
              className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-12 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};