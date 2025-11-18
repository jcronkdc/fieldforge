import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

// Create router function
export function createStripeRouter() {
  const router = Router();
  
  // Initialize Stripe only if API key is present
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: '2025-10-29.clover'
  }) : null;

  // FieldForge pricing tiers
  const PRICING_PLANS = {
    starter: {
      name: 'Starter Plan',
      description: 'Perfect for small contractors and teams',
      features: [
        'Up to 5 team members',
        'Basic project management',
        'Safety compliance tracking',
        'Email support'
      ],
      price: 4900, // $49.00 in cents
      priceId: process.env.STRIPE_STARTER_PRICE_ID
    },
    professional: {
      name: 'Professional Plan', 
      description: 'For growing construction companies',
      features: [
        'Up to 20 team members',
        'Advanced analytics',
        'Equipment management',
        'Time tracking & payroll',
        'Priority support',
        'API access'
      ],
      price: 14900, // $149.00 in cents
      priceId: process.env.STRIPE_PRO_PRICE_ID
    },
    enterprise: {
      name: 'Enterprise Plan',
      description: 'For large-scale operations',
      features: [
        'Unlimited team members',
        'Custom integrations',
        'Advanced 3D visualization',
        'AI-powered insights',
        'Dedicated account manager',
        'SLA guarantee',
        'On-premise deployment option'
      ],
      price: 49900, // $499.00 in cents
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
    }
  };

  // Create Stripe Checkout session
  router.post('/create-checkout-session', async (req: Request, res: Response) => {
    if (!stripe) {
      console.warn('Stripe checkout called but STRIPE_SECRET_KEY not configured');
      return res.status(503).json({ error: 'Payment processing not configured' });
    }
    
    try {
      const { plan, billingCycle = 'monthly' } = req.body;
      const userId = (req as any).user?.id;
      const userEmail = (req as any).user?.email;

      if (!plan || !PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
        return res.status(400).json({ error: 'Invalid pricing plan' });
      }

      const selectedPlan = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
      
      // Create line items based on whether we have Price IDs configured
      const lineItems = selectedPlan.priceId ? [{
        price: selectedPlan.priceId,
        quantity: 1,
      }] : [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: selectedPlan.name,
            description: selectedPlan.description,
            metadata: {
              plan: plan,
              features: selectedPlan.features.join(', ')
            }
          },
          unit_amount: selectedPlan.price,
          recurring: billingCycle === 'monthly' ? {
            interval: 'month' as Stripe.PriceCreateParams.Recurring.Interval
          } : {
            interval: 'year' as Stripe.PriceCreateParams.Recurring.Interval
          }
        },
        quantity: 1,
      }];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
        customer_email: userEmail,
        metadata: {
          userId: userId || '',
          plan: plan
        },
        subscription_data: {
          trial_period_days: 14, // 14-day free trial
          metadata: {
            userId: userId || '',
            plan: plan
          }
        },
        allow_promotion_codes: true,
      });

      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });
    } catch (error) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get customer portal session
  router.post('/create-portal-session', async (req: Request, res: Response) => {
    if (!stripe) {
      console.warn('Stripe portal called but STRIPE_SECRET_KEY not configured');
      return res.status(503).json({ error: 'Payment processing not configured' });
    }
    
    try {
      const { customerId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID required' });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing`,
      });

      res.json({ portalUrl: portalSession.url });
    } catch (error) {
      console.error('Portal session error:', error);
      res.status(500).json({ 
        error: 'Failed to create portal session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get subscription status
  router.get('/subscription-status', async (req: Request, res: Response) => {
    if (!stripe) {
      // Return mock subscription status when Stripe not configured
      return res.json({
        status: 'trialing',
        plan: 'Starter',
        trial: true,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      });
    }
    
    try {
      const { customerId } = req.query;
      
      if (!customerId || typeof customerId !== 'string') {
        return res.json({ 
          status: 'inactive',
          plan: 'free',
          trial: false 
        });
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length === 0) {
        return res.json({ 
          status: 'inactive',
          plan: 'free',
          trial: false 
        });
      }

      const subscription = subscriptions.data[0];
      const plan = subscription.metadata?.plan || 'free';
      
      res.json({
        status: subscription.status,
        plan: plan,
        trial: subscription.status === 'trialing',
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ 
        error: 'Failed to fetch subscription status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return router;
}

export default createStripeRouter;