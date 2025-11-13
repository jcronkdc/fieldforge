import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, TrendingUp, Shield, Users, Zap, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingTier {
  name: string;
  price: number;
  unit: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  const tiers: PricingTier[] = [
    {
      name: "Starter",
      price: billingPeriod === 'monthly' ? 49 : 39,
      unit: "per user/month",
      features: [
        "Up to 10 users",
        "Core features (time, safety, equipment)",
        "5GB storage",
        "Email support",
        "Mobile & offline access",
        "Basic reporting"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: billingPeriod === 'monthly' ? 89 : 71,
      unit: "per user/month",
      popular: true,
      features: [
        "Unlimited users",
        "All features including voice control",
        "50GB storage per project",
        "Priority support",
        "API access",
        "Advanced analytics",
        "Custom workflows",
        "Equipment testing module",
        "Document management",
        "Real-time collaboration"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: billingPeriod === 'monthly' ? 149 : 119,
      unit: "per user/month",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated success manager",
        "SLA guarantees",
        "Advanced security",
        "Unlimited storage",
        "White-label options",
        "On-premise deployment",
        "24/7 phone support",
        "Custom training"
      ],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture">
      {/* Hero Section */}
      <section className="relative py-[89px] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-[21px] py-[8px] bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-[34px] annotation" data-note="LIMITED TIME">
            <Sparkles className="w-4 h-4" />
            Save 20% with Annual Billing
          </div>
          
          <h1 className="text-golden-xl md:text-golden-2xl font-bold text-white mb-[21px]">
            Transparent Pricing for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Construction Teams
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-[55px]">
            No hidden fees. No per-project charges. Just simple, predictable pricing
            that scales with your team.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-[89px]">
            <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-[89px] h-[34px] bg-slate-700 rounded-full p-1 transition-colors"
            >
              <motion.div
                className="absolute w-[26px] h-[26px] bg-amber-500 rounded-full"
                animate={{ x: billingPeriod === 'monthly' ? 0 : 55 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </button>
            <span className={`text-lg ${billingPeriod === 'annual' ? 'text-white' : 'text-slate-400'}`}>
              Annual
              <span className="text-green-400 text-sm ml-2">(Save 20%)</span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-[89px] px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-[34px]">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${tier.popular ? 'depth-layer-2' : 'depth-layer-1'}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-[21px] py-[5px] bg-amber-500 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className={`h-full card-vitruvian corner-sketch p-[34px] rounded-[13px] ${
                tier.popular ? 'border-2 border-amber-500' : ''
              }`}>
                <h3 className="text-2xl font-bold text-white mb-[8px]">{tier.name}</h3>
                
                <div className="mb-[34px]">
                  <span className="text-golden-2xl font-bold text-white">${tier.price}</span>
                  <span className="text-slate-400 ml-2">{tier.unit}</span>
                  {billingPeriod === 'annual' && (
                    <div className="text-sm text-green-400 mt-1">
                      Billed annually
                    </div>
                  )}
                </div>

                <ul className="space-y-[13px] mb-[34px]">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-[13px]">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={tier.cta === 'Contact Sales' ? '/contact' : '/signup'}
                  className={`block w-full text-center py-[13px] px-[34px] rounded-[8px] font-semibold transition-all ${
                    tier.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-white btn-davinci'
                      : 'bg-white/10 hover:bg-white/20 text-white tech-border'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROI Section */}
      <section className="relative py-[89px] px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-golden-xl font-bold text-white mb-[55px]">
            The Math is Simple
          </h2>
          
          <div className="grid md:grid-cols-3 gap-[34px] mb-[55px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-[89px] h-[89px] bg-amber-500/20 rounded-full mb-[21px]">
                <TrendingUp className="w-[34px] h-[34px] text-amber-400" />
              </div>
              <div className="text-golden-xl font-bold text-white mb-[8px]">45 min/day</div>
              <div className="text-slate-400">Saved per worker</div>
              <div className="text-green-400 text-sm mt-2">= $750/month value</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-[89px] h-[89px] bg-green-500/20 rounded-full mb-[21px]">
                <Shield className="w-[34px] h-[34px] text-green-400" />
              </div>
              <div className="text-golden-xl font-bold text-white mb-[8px]">73%</div>
              <div className="text-slate-400">Fewer incidents</div>
              <div className="text-green-400 text-sm mt-2">= $500K+ saved</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-[89px] h-[89px] bg-blue-500/20 rounded-full mb-[21px]">
                <Users className="w-[34px] h-[34px] text-blue-400" />
              </div>
              <div className="text-golden-xl font-bold text-white mb-[8px]">95%</div>
              <div className="text-slate-400">Field adoption</div>
              <div className="text-green-400 text-sm mt-2">vs 20% industry avg</div>
            </motion.div>
          </div>

          <div className="p-[34px] bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-[21px] backdrop-blur">
            <Zap className="w-[55px] h-[55px] text-amber-400 mx-auto mb-[21px]" />
            <h3 className="text-2xl font-bold text-white mb-[13px]">ROI in 30 Days</h3>
            <p className="text-lg text-slate-300 mb-[21px]">
              FieldForge pays for itself in the first month through time savings alone.
              Everything after that is pure profit.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-[8px] text-amber-400 hover:text-amber-300 font-semibold"
            >
              See ROI Calculator
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-[89px] px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-golden-xl font-bold text-white text-center mb-[55px]">
            Common Questions
          </h2>
          
          <div className="space-y-[21px]">
            <div className="p-[21px] bg-white/5 rounded-[13px]">
              <h3 className="text-lg font-semibold text-white mb-[8px]">Is there a setup fee?</h3>
              <p className="text-slate-400">No. We believe in proving our value, not charging for promises.</p>
            </div>
            
            <div className="p-[21px] bg-white/5 rounded-[13px]">
              <h3 className="text-lg font-semibold text-white mb-[8px]">Can I change plans anytime?</h3>
              <p className="text-slate-400">Yes. Upgrade or downgrade instantly. We'll prorate any differences.</p>
            </div>
            
            <div className="p-[21px] bg-white/5 rounded-[13px]">
              <h3 className="text-lg font-semibold text-white mb-[8px]">What about data migration?</h3>
              <p className="text-slate-400">Free migration from any major construction software for Professional and Enterprise plans.</p>
            </div>
            
            <div className="p-[21px] bg-white/5 rounded-[13px]">
              <h3 className="text-lg font-semibold text-white mb-[8px]">Is there a free trial?</h3>
              <p className="text-slate-400">Yes! 30 days, full access, no credit card required. We even help with setup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-[89px] px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-golden-xl font-bold text-white mb-[21px]">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-slate-300 mb-[34px]">
            Join 500+ construction teams already working smarter with FieldForge
          </p>
          <div className="flex flex-col sm:flex-row gap-[21px] justify-center">
            <Link
              to="/signup"
              className="px-[55px] py-[21px] bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-[13px] transition-all btn-davinci breathe"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-[55px] py-[21px] bg-white/10 hover:bg-white/20 text-white font-bold rounded-[13px] transition-all tech-border"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
