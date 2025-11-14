import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

// Create webhook router
export function createStripeWebhookRouter() {
  const router = Router();
  
  // Initialize Stripe with your secret key
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia'
  });

  // Webhook handler for Stripe events (no auth required)
  // This must use raw body parsing, so it needs special handling
  router.post('/stripe/webhook', async (req: Request, res: Response) => {
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
    // Update user subscription in database
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    
    if (userId && plan) {
      // TODO: Update user subscription in database
      console.log(`Activating ${plan} plan for user ${userId}`);
      
      // In production, you would update the user's subscription status
      // await updateUserSubscription(userId, {
      //   stripeCustomerId: session.customer,
      //   stripeSubscriptionId: session.subscription,
      //   plan: plan,
      //   status: 'active',
      //   trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      // });
    }
  }

  async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    console.log('Subscription updated:', subscription.id);
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan;
    
    if (userId) {
      // TODO: Update subscription status in database
      console.log(`Updating subscription for user ${userId} to ${plan}`);
      
      // await updateUserSubscription(userId, {
      //   status: subscription.status,
      //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      //   cancelAtPeriodEnd: subscription.cancel_at_period_end
      // });
    }
  }

  async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log('Subscription canceled:', subscription.id);
    const userId = subscription.metadata?.userId;
    
    if (userId) {
      // TODO: Update user to free tier in database
      console.log(`Canceling subscription for user ${userId}`);
      
      // await updateUserSubscription(userId, {
      //   plan: 'free',
      //   status: 'canceled',
      //   canceledAt: new Date()
      // });
    }
  }

  async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('Invoice payment succeeded:', invoice.id);
    // TODO: Send receipt email
    
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
    // TODO: Send payment failure notification
    
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
