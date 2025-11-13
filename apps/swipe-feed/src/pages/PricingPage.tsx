import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Check, ArrowRight, Zap, Shield, Building, Compass } from 'lucide-react';
import '../styles/davinci.css';

interface PricingTier {
  name: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 49,
    unit: 'per user/month',
    description: 'Perfect for small crews getting started',
    features: [
      'Up to 10 users',
      'Core features (time, safety, equipment)',
      '5GB document storage',
      'Email support',
      'Mobile & offline access',
      'Basic reporting',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: 89,
    unit: 'per user/month',
    description: 'For growing companies that need more power',
    popular: true,
    features: [
      'Unlimited users',
      'All starter features plus:',
      'Advanced analytics & reports',
      'API access & integrations',
      'Priority support (4hr response)',
      '50GB storage per user',
      'Custom workflows',
      'Equipment maintenance tracking',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 149,
    unit: 'per user/month',
    description: 'Full platform for large operations',
    features: [
      'Everything in Professional plus:',
      'White-label options',
      'Dedicated success manager',
      'Custom training program',
      'Unlimited storage',
      'Advanced security (SSO, 2FA)',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
  },
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const discount = billingCycle === 'annual' ? 0.2 : 0; // 20% discount for annual

  const handleCTA = (tier: PricingTier) => {
    if (tier.cta === 'Contact Sales') {
      navigate('/contact');
    } else {
      navigate('/signup');
    }
  };

  return (
    <>
      <SEOHead
        title="Pricing - FieldForge Construction Management"
        description="Transparent pricing for construction teams. Start free, scale as you grow. No hidden fees."
        url="https://fieldforge.app/pricing"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture">
        {/* Sacred Geometry Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-[377px] h-[377px] rounded-full border border-amber-500/10 vitruvian-circle" />
          <div className="absolute bottom-40 left-10 w-[233px] h-[233px] rounded-full border border-amber-500/10" />
          <div className="compass-rose top-10 left-10" />
        </div>

        {/* Header */}
        <div className="relative z-10 pt-[89px] pb-[55px]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-golden-xl md:text-golden-2xl font-bold text-white mb-[21px] leading-tight">
              <span className="measurement-line">Transparent Pricing</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#B87333] to-amber-600">
                Built for Growth
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-[34px] readable-field">
              Start with a 30-day free trial. No credit card required.
              <br />
              <span className="text-amber-400/60 font-medium technical-annotation" data-note="SIMPLE">
                Scale as your business grows.
              </span>
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-[21px] mb-[55px]">
              <span className={`text-golden-sm ${billingCycle === 'monthly' ? 'text-amber-400' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-[89px] h-[34px] bg-slate-800 rounded-full tech-border transition-colors hover:bg-slate-700"
              >
                <div
                  className={`absolute top-[3px] left-[3px] w-[28px] h-[28px] bg-amber-500 rounded-full transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-[55px]' : ''
                  }`}
                />
              </button>
              <span className={`text-golden-sm ${billingCycle === 'annual' ? 'text-amber-400' : 'text-slate-400'}`}>
                Annual
                <span className="text-green-400 ml-2 annotation" data-note="SAVE 20%">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-[89px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[34px]">
            {pricingTiers.map((tier, index) => {
              const price = Math.round(tier.price * (1 - discount));
              return (
                <div
                  key={tier.name}
                  className={`relative rounded-[21px] p-[34px] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] depth-layer-1 ${
                    tier.popular
                      ? 'bg-amber-500/20 border-2 border-amber-500 shadow-[0_8px_32px_rgba(218,165,32,0.3)]'
                      : 'bg-slate-900/80 border border-amber-500/20'
                  } card-vitruvian`}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-[13px] left-1/2 transform -translate-x-1/2">
                      <div className="bg-amber-500 text-slate-900 px-[21px] py-[5px] rounded-full text-sm font-bold annotation" data-note="MOST CHOSEN">
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Technical Accent */}
                  <div className="absolute top-[21px] right-[21px] opacity-10">
                    <Compass className="w-[55px] h-[55px] text-amber-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-amber-400 mb-[8px]">{tier.name}</h3>
                  <p className="text-slate-400 mb-[21px] text-golden-sm">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-[34px]">
                    <div className="flex items-baseline gap-[5px]">
                      <span className="text-golden-xl font-bold text-white">${price}</span>
                      <span className="text-slate-400 text-golden-sm">/{tier.unit}</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-green-400 text-sm mt-[5px]">
                        <s className="text-slate-500">${tier.price}</s> · Save ${tier.price - price}/mo
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-[13px] mb-[34px]">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-[8px]">
                        {!feature.includes(':') && (
                          <Check className="w-[21px] h-[21px] text-green-400 flex-shrink-0 mt-[2px]" />
                        )}
                        <span className={`text-golden-sm ${feature.includes(':') ? 'text-amber-400 font-semibold' : 'text-slate-300'} field-readable`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCTA(tier)}
                    className={`w-full px-[34px] py-[13px] rounded-[8px] font-semibold transition-all flex items-center justify-center gap-[13px] field-touch ${
                      tier.popular
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg glow-renaissance'
                        : 'bg-white/10 hover:bg-white/20 text-white tech-border'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-[89px] text-center">
            <div className="inline-flex items-center gap-[34px] flex-wrap justify-center">
              <div className="flex items-center gap-[8px] text-slate-400">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-golden-sm">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-[8px] text-slate-400">
                <Building className="w-5 h-5 text-green-400" />
                <span className="text-golden-sm">500+ Construction Teams</span>
              </div>
              <div className="flex items-center gap-[8px] text-slate-400">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-golden-sm">99.9% Uptime SLA</span>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="mt-[55px] text-center">
            <p className="text-slate-400 mb-[21px]">
              Questions about pricing?
            </p>
            <Link
              to="/contact"
              className="text-amber-400 hover:text-amber-300 font-semibold text-golden-base transition-colors annotation"
              data-note="PERSONALIZED"
            >
              Talk to our team →
            </Link>
          </div>

          {/* Leonardo Quote */}
          <div className="text-center opacity-30 mt-[89px]">
            <p className="text-golden-sm text-amber-400/60 font-light italic technical-annotation">
              "Where the spirit does not work with the hand, there is no art"
            </p>
            <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
