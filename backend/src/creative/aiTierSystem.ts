/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * AI Tier System - Manage AI model access and usage limits
 */

import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export interface AITier {
  id: string;
  tier_name: string;
  tier_level: number;
  model_access: string[];
  monthly_tokens: number;
  features: {
    screenplay: boolean;
    song: boolean;
    poetry: boolean;
    story: boolean;
    enhancements?: boolean;
    collaboration?: boolean;
  };
  price_usd: number;
  price_sparks: number;
  benefits: string[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  tokens_used: number;
  tokens_remaining: number;
  subscription_start: string;
  subscription_end?: string;
  auto_renew: boolean;
  payment_method: 'sparks' | 'credit_card' | 'paypal';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
}

// Check if user has access to a feature
export async function checkUserAITier(userId: string, feature: string): Promise<boolean> {
  const result = await query(
    `SELECT s.*, t.features, t.tier_level
     FROM user_ai_subscriptions s
     JOIN ai_tiers t ON s.tier_id = t.id
     WHERE s.user_id = $1 AND s.status = 'active'`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Check free tier
    const freeResult = await query(
      `SELECT features FROM ai_tiers WHERE tier_level = 0`
    );
    const freeFeatures = freeResult.rows[0]?.features || {};
    return freeFeatures[feature] === true;
  }

  const subscription = result.rows[0];
  return subscription.features[feature] === true;
}

// Get user's current tier
export async function getUserTier(userId: string): Promise<AITier | null> {
  const result = await query(
    `SELECT t.*
     FROM user_ai_subscriptions s
     JOIN ai_tiers t ON s.tier_id = t.id
     WHERE s.user_id = $1 AND s.status = 'active'`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Return free tier
    const freeResult = await query(
      `SELECT * FROM ai_tiers WHERE tier_level = 0`
    );
    return freeResult.rows[0];
  }

  return result.rows[0];
}

// Consume AI tokens
export async function consumeAITokens(
  userId: string,
  feature: string,
  tokensUsed: number,
  modelUsed: string = 'claude-3-haiku'
): Promise<void> {
  // Get user's subscription
  const subResult = await query(
    `SELECT * FROM user_ai_subscriptions 
     WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  let subscription = subResult.rows[0];
  
  if (!subscription) {
    // Create free tier subscription
    const freeTierResult = await query(
      `SELECT * FROM ai_tiers WHERE tier_level = 0`
    );
    
    const freeTier = freeTierResult.rows[0];
    
    const createSubResult = await query(
      `INSERT INTO user_ai_subscriptions (
        user_id, tier_id, tokens_remaining, payment_method
      ) VALUES ($1, $2, $3, 'sparks')
      RETURNING *`,
      [userId, freeTier.id, freeTier.monthly_tokens]
    );
    
    subscription = createSubResult.rows[0];
  }

  // Check if user has enough tokens
  if (subscription.tokens_remaining < tokensUsed) {
    throw new Error("Insufficient AI tokens. Please upgrade your tier.");
  }

  // Update token usage
  await query(
    `UPDATE user_ai_subscriptions
     SET tokens_used = tokens_used + $1,
         tokens_remaining = tokens_remaining - $1,
         updated_at = NOW()
     WHERE user_id = $2`,
    [tokensUsed, userId]
  );

  // Log usage
  await query(
    `INSERT INTO ai_usage_log (
      user_id, feature, model_used, tokens_consumed
    ) VALUES ($1, $2, $3, $4)`,
    [userId, feature, modelUsed, tokensUsed]
  );
}

// Upgrade user tier
export async function upgradeTier(
  userId: string,
  tierId: string,
  paymentMethod: 'sparks' | 'credit_card' | 'paypal'
): Promise<UserSubscription> {
  // Get tier details
  const tierResult = await query(
    `SELECT * FROM ai_tiers WHERE id = $1`,
    [tierId]
  );
  
  const tier = tierResult.rows[0];
  if (!tier) {
    throw new Error("Invalid tier");
  }

  // Check if user has existing subscription
  const existingResult = await query(
    `SELECT * FROM user_ai_subscriptions WHERE user_id = $1`,
    [userId]
  );

  let subscription;
  
  if (existingResult.rows.length > 0) {
    // Update existing subscription
    const result = await query(
      `UPDATE user_ai_subscriptions
       SET tier_id = $1,
           tokens_remaining = $2,
           tokens_used = 0,
           payment_method = $3,
           subscription_start = NOW(),
           subscription_end = NOW() + INTERVAL '30 days',
           status = 'active',
           updated_at = NOW()
       WHERE user_id = $4
       RETURNING *`,
      [tierId, tier.monthly_tokens, paymentMethod, userId]
    );
    subscription = result.rows[0];
  } else {
    // Create new subscription
    const result = await query(
      `INSERT INTO user_ai_subscriptions (
        user_id, tier_id, tokens_remaining, payment_method,
        subscription_end
      ) VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
      RETURNING *`,
      [userId, tierId, tier.monthly_tokens, paymentMethod]
    );
    subscription = result.rows[0];
  }

  return subscription;
}

// Get available tiers
export async function getAvailableTiers(): Promise<AITier[]> {
  const result = await query(
    `SELECT * FROM ai_tiers ORDER BY tier_level`
  );
  return result.rows;
}

// Check and reset monthly tokens
export async function resetMonthlyTokens(): Promise<void> {
  // Reset tokens for all active subscriptions that have passed their period
  await query(
    `UPDATE user_ai_subscriptions s
     SET tokens_used = 0,
         tokens_remaining = t.monthly_tokens,
         subscription_start = NOW(),
         subscription_end = NOW() + INTERVAL '30 days'
     FROM ai_tiers t
     WHERE s.tier_id = t.id
     AND s.status = 'active'
     AND s.subscription_end < NOW()
     AND s.auto_renew = true`
  );

  // Expire subscriptions that don't auto-renew
  await query(
    `UPDATE user_ai_subscriptions
     SET status = 'expired'
     WHERE status = 'active'
     AND subscription_end < NOW()
     AND auto_renew = false`
  );
}
