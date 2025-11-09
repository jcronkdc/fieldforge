/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Sparks Purchase System - Like Roblox Robux
 */

import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";
import Stripe from "stripe";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16' as any
}) : null as any;

// Check if Stripe is configured
if (!stripeKey) {
  console.warn('⚠️  Stripe is not configured. Add STRIPE_SECRET_KEY to .env file');
  console.warn('   See backend/STRIPE_SETUP.md for instructions');
}

async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export interface SparksPackage {
  id: string;
  name: string;
  sparks_amount: number;
  price_usd: number;
  bonus_percentage: number;
  popular: boolean;
  best_value: boolean;
  icon_emoji: string;
  stripe_price_id?: string;
  total_sparks?: number; // Calculated with bonus
}

export interface SparksPurchase {
  id: string;
  user_id: string;
  package_id: string;
  sparks_amount: number;
  bonus_amount: number;
  total_sparks: number;
  price_paid: number;
  payment_method: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

// Get available Sparks packages
export async function getSparksPackages(): Promise<SparksPackage[]> {
  const result = await query(
    `SELECT *, 
     sparks_amount + FLOOR(sparks_amount * bonus_percentage / 100.0) as total_sparks
     FROM sparks_packages 
     WHERE active = true 
     ORDER BY display_order`
  );
  
  return result.rows;
}

// Create Stripe checkout session for Sparks purchase
export async function createSparksCheckoutSession(data: {
  userId: string;
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  // Get package details
  const packageResult = await query(
    `SELECT * FROM sparks_packages WHERE id = $1 AND active = true`,
    [data.packageId]
  );
  
  if (packageResult.rows.length === 0) {
    throw new Error("Package not found");
  }
  
  const sparksPackage = packageResult.rows[0];
  const totalSparks = sparksPackage.sparks_amount + 
    Math.floor(sparksPackage.sparks_amount * sparksPackage.bonus_percentage / 100);
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'apple_pay', 'google_pay'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: sparksPackage.name,
            description: `${totalSparks} Sparks${sparksPackage.bonus_percentage > 0 ? ` (includes ${sparksPackage.bonus_percentage}% bonus!)` : ''}`,
            images: ['https://mythatron.com/sparks-icon.png']
          },
          unit_amount: Math.round(sparksPackage.price_usd * 100) // Convert to cents
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: {
      user_id: data.userId,
      package_id: data.packageId,
      sparks_amount: sparksPackage.sparks_amount.toString(),
      total_sparks: totalSparks.toString()
    }
  });
  
  // Create purchase record
  await query(
    `INSERT INTO sparks_purchases (
      user_id, package_id, sparks_amount, bonus_amount,
      total_sparks, price_paid, payment_method, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'stripe', 'pending')
    RETURNING id`,
    [
      data.userId,
      data.packageId,
      sparksPackage.sparks_amount,
      totalSparks - sparksPackage.sparks_amount,
      totalSparks,
      sparksPackage.price_usd
    ]
  );
  
  return {
    sessionId: session.id,
    url: session.url || ''
  };
}

// Handle Stripe webhook for successful payment
export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.metadata) {
        // Complete the purchase
        await completePurchase({
          userId: session.metadata.user_id,
          packageId: session.metadata.package_id,
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent as string
        });
      }
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Mark purchase as failed
      await query(
        `UPDATE sparks_purchases 
         SET status = 'failed' 
         WHERE stripe_payment_intent_id = $1`,
        [paymentIntent.id]
      );
      break;
    }
  }
}

// Complete a purchase and credit Sparks
async function completePurchase(data: {
  userId: string;
  packageId: string;
  stripeSessionId: string;
  paymentIntentId: string;
}): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get purchase details
    const purchaseResult = await client.query(
      `UPDATE sparks_purchases 
       SET status = 'completed',
           completed_at = NOW(),
           stripe_payment_intent_id = $1
       WHERE user_id = $2 
       AND package_id = $3 
       AND status = 'pending'
       RETURNING *`,
      [data.paymentIntentId, data.userId, data.packageId]
    );
    
    if (purchaseResult.rows.length === 0) {
      throw new Error("Purchase not found");
    }
    
    const purchase = purchaseResult.rows[0];
    
    // Credit Sparks to user
    await client.query(
      `UPDATE user_profiles 
       SET mytha_coins = mytha_coins + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [purchase.total_sparks, data.userId]
    );
    
    // Record in transaction ledger
    await client.query(
      `INSERT INTO mythacoin_transactions (
        user_id, amount, transaction_type, description, metadata
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        data.userId,
        purchase.total_sparks,
        'purchase',
        `Purchased ${purchase.total_sparks} Sparks`,
        JSON.stringify({ 
          purchase_id: purchase.id,
          package_name: purchase.name 
        })
      ]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Redeem gift code
export async function redeemGiftCode(data: {
  userId: string;
  code: string;
}): Promise<{ success: boolean; sparksAmount?: number; error?: string }> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if code is valid
    const codeResult = await client.query(
      `SELECT * FROM sparks_gift_codes 
       WHERE UPPER(code) = UPPER($1)
       AND redeemed_by IS NULL
       AND (valid_until IS NULL OR valid_until > NOW())
       AND redemption_count < max_redemptions
       FOR UPDATE`,
      [data.code]
    );
    
    if (codeResult.rows.length === 0) {
      return { success: false, error: "Invalid or expired gift code" };
    }
    
    const giftCode = codeResult.rows[0];
    
    // Mark as redeemed
    await client.query(
      `UPDATE sparks_gift_codes
       SET redeemed_by = $1,
           redeemed_at = NOW(),
           redemption_count = redemption_count + 1
       WHERE id = $2`,
      [data.userId, giftCode.id]
    );
    
    // Credit Sparks to user
    await client.query(
      `UPDATE user_profiles
       SET mytha_coins = mytha_coins + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [giftCode.sparks_amount, data.userId]
    );
    
    // Record in transaction ledger
    await client.query(
      `INSERT INTO mythacoin_transactions (
        user_id, amount, transaction_type, description, metadata
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        data.userId,
        giftCode.sparks_amount,
        'gift_code',
        'Redeemed gift code',
        JSON.stringify({ 
          code: data.code,
          campaign: giftCode.campaign_name 
        })
      ]
    );
    
    await client.query('COMMIT');
    
    return { 
      success: true, 
      sparksAmount: giftCode.sparks_amount 
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error redeeming gift code:', error);
    return { 
      success: false, 
      error: "Failed to redeem gift code" 
    };
  } finally {
    client.release();
  }
}

// Get user's purchase history
export async function getUserPurchaseHistory(
  userId: string,
  limit: number = 10
): Promise<SparksPurchase[]> {
  const result = await query(
    `SELECT p.*, pkg.name as package_name
     FROM sparks_purchases p
     JOIN sparks_packages pkg ON p.package_id = pkg.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  
  return result.rows;
}

// Check spending limits (parental controls)
export async function checkSpendingLimit(
  userId: string,
  amount: number
): Promise<{ allowed: boolean; requiresApproval: boolean }> {
  const result = await query(
    `SELECT * FROM sparks_spending_limits 
     WHERE user_id = $1 AND enabled = true`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    return { allowed: true, requiresApproval: false };
  }
  
  const limits = result.rows[0];
  
  // Check if approval is required
  if (limits.require_approval_above && amount > limits.require_approval_above) {
    return { allowed: false, requiresApproval: true };
  }
  
  // Check daily limit
  if (limits.daily_limit) {
    const dailyResult = await query(
      `SELECT COALESCE(SUM(price_paid), 0) as daily_total
       FROM sparks_purchases
       WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '24 hours'
       AND status = 'completed'`,
      [userId]
    );
    
    if (parseFloat(dailyResult.rows[0].daily_total) + amount > limits.daily_limit) {
      return { allowed: false, requiresApproval: false };
    }
  }
  
  // Check monthly limit
  if (limits.monthly_limit) {
    const monthlyResult = await query(
      `SELECT COALESCE(SUM(price_paid), 0) as monthly_total
       FROM sparks_purchases
       WHERE user_id = $1
       AND created_at >= DATE_TRUNC('month', NOW())
       AND status = 'completed'`,
      [userId]
    );
    
    if (parseFloat(monthlyResult.rows[0].monthly_total) + amount > limits.monthly_limit) {
      return { allowed: false, requiresApproval: false };
    }
  }
  
  return { allowed: true, requiresApproval: false };
}
