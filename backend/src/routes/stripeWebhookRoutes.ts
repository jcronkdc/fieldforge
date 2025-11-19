import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import {
  updateCompanySubscription,
  getCompanyByStripeCustomer,
  cancelCompanySubscription,
  getCompanyByUserId
} from '../billing/subscriptionRepository.js';

// Create webhook router
export function createStripeWebhookRouter() {
  const router = Router();
  
  // Initialize Stripe only if API key is present
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: '2025-10-29.clover'
  }) : null;

  // Webhook handler for Stripe events (no auth required)
  // This must use raw body parsing, so it needs special handling
  router.post('/stripe/webhook', async (req: Request, res: Response) => {
    if (!stripe) {
      console.warn('Stripe webhook called but STRIPE_SECRET_KEY not configured');
      return res.status(503).json({ error: 'Stripe not configured' });
    }
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).send('Webhook signature missing');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(session);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          break;
        
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCanceled(deletedSubscription);
          break;
        
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentSucceeded(invoice);
          break;
        
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentFailed(failedInvoice);
          break;
        
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).send('Webhook processing failed');
    }

    res.json({ received: true });
  });

  // Helper functions for webhook handlers
  async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('Checkout session completed:', session.id);
    
    try {
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || 'professional';
      
      if (!userId) {
        console.warn('[stripe] No userId in checkout session metadata');
        return;
      }
      
      // Get company ID from user
      const companyId = await getCompanyByUserId(userId);
      if (!companyId) {
        console.error('[stripe] No company found for user:', userId);
        return;
      }
      
      // Update company subscription
      await updateCompanySubscription({
        companyId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        plan,
        status: 'active',
        currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
      });
      
      console.log(`[stripe] Activated ${plan} plan for company ${companyId}`);
    } catch (error) {
      console.error('[stripe] Failed to update subscription:', error);
    }
  }

  async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    console.log('Subscription updated:', subscription.id);
    
    try {
      // Find company by Stripe customer ID
      const companyId = await getCompanyByStripeCustomer(subscription.customer as string);
      if (!companyId) {
        console.warn('[stripe] No company found for customer:', subscription.customer);
        return;
      }
      
      const plan = subscription.metadata?.plan || 'professional';
      
      await updateCompanySubscription({
        companyId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        plan,
        status: subscription.status as any,
        currentPeriodEnd: (subscription as any).current_period_end || Date.now() / 1000,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false
      });
      
      console.log(`[stripe] Updated subscription for company ${companyId} to ${subscription.status}`);
    } catch (error) {
      console.error('[stripe] Failed to update subscription:', error);
    }
  }

  async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log('Subscription canceled:', subscription.id);
    
    try {
      // Find company by Stripe customer ID
      const companyId = await getCompanyByStripeCustomer(subscription.customer as string);
      if (!companyId) {
        console.warn('[stripe] No company found for customer:', subscription.customer);
        return;
      }
      
      await cancelCompanySubscription(companyId);
      console.log(`[stripe] Canceled subscription for company ${companyId}`);
    } catch (error) {
      console.error('[stripe] Failed to cancel subscription:', error);
    }
  }

  async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('Invoice payment succeeded:', invoice.id);
    // Send receipt email
    if (invoice.customer_email) {
      try {
        const { sendStripeReceipt } = await import('../email/emailService.js');
        await sendStripeReceipt(
          invoice.customer_email,
          invoice.amount_paid || 0,
          invoice.currency || 'usd',
          invoice.hosted_invoice_url || undefined
        );
      } catch (emailError) {
        console.error('[stripe] Failed to send receipt email:', emailError);
        // Don't fail the webhook if email fails
      }
    }
    
    // if (invoice.customer_email) {
    //   await sendReceiptEmail(invoice.customer_email, {
    //     invoiceId: invoice.id,
    //     amount: invoice.amount_paid / 100,
    //     currency: invoice.currency,
    //     invoiceUrl: invoice.hosted_invoice_url
    //   });
    // }
  }

  async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log('Invoice payment failed:', invoice.id);
    // Send payment failure notification
    if (invoice.customer_email) {
      try {
        const { sendPaymentFailure } = await import('../email/emailService.js');
        await sendPaymentFailure(
          invoice.customer_email,
          invoice.amount_due || 0,
          invoice.currency || 'usd',
          invoice.last_finalization_error?.message
        );
      } catch (emailError) {
        console.error('[stripe] Failed to send payment failure email:', emailError);
      }
    }
    
    // if (invoice.customer_email) {
    //   await sendPaymentFailureEmail(invoice.customer_email, {
    //     invoiceId: invoice.id,
    //     attemptCount: invoice.attempt_count,
    //     nextAttempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null
    //   });
    // }
  }
  
  return router;
}

export default createStripeWebhookRouter;
