"use strict";
/**
 * Sparks Repository - Database operations for Sparks economy
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparksRepository = void 0;
const database_1 = require("../database");
class SparksRepository {
    // Get all active Sparks packages
    async getPackages() {
        const result = await (0, database_1.query)(`SELECT 
        id, name, display_name as "displayName", 
        sparks_amount as "sparksAmount", bonus_sparks as "bonusSparks",
        price_cents as "priceCents", currency,
        is_popular as "isPopular", is_active as "isActive"
      FROM sparks_packages
      WHERE is_active = true
      ORDER BY sort_order`);
        return result.rows;
    }
    // Get all active subscription tiers
    async getSubscriptionTiers() {
        const result = await (0, database_1.query)(`SELECT 
        id, name, display_name as "displayName",
        monthly_price_cents as "monthlyPriceCents",
        yearly_price_cents as "yearlyPriceCents",
        monthly_sparks as "monthlySparks",
        features, benefits,
        is_popular as "isPopular", is_active as "isActive"
      FROM subscription_tiers
      WHERE is_active = true
      ORDER BY sort_order`);
        return result.rows;
    }
    // Get user's current balance
    async getUserBalance(userId) {
        const result = await (0, database_1.query)('SELECT get_user_sparks_balance($1) as balance', [userId]);
        return result.rows[0]?.balance || 0;
    }
    // Get user's subscription
    async getUserSubscription(userId) {
        const result = await (0, database_1.query)(`SELECT 
        s.id, s.user_id as "userId", s.tier_id as "tierId",
        s.status, s.billing_cycle as "billingCycle",
        s.current_period_start as "currentPeriodStart",
        s.current_period_end as "currentPeriodEnd",
        s.cancel_at_period_end as "cancelAtPeriodEnd"
      FROM user_subscriptions s
      WHERE s.user_id = $1 AND s.status = 'active'
      LIMIT 1`, [userId]);
        return result.rows[0] || null;
    }
    // Get user's transaction history
    async getUserTransactions(userId, limit = 50) {
        const result = await (0, database_1.query)(`SELECT 
        id, user_id as "userId", amount,
        balance_after as "balanceAfter",
        transaction_type as "transactionType",
        description,
        reference_type as "referenceType",
        reference_id as "referenceId",
        created_at as "createdAt"
      FROM sparks_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`, [userId, limit]);
        return result.rows;
    }
    // Add Sparks to user balance
    async addSparks(userId, amount, type, description, referenceType, referenceId) {
        const result = await (0, database_1.query)('SELECT add_sparks($1, $2, $3, $4, $5, $6) as add_sparks', [userId, amount, type, description, referenceType, referenceId]);
        return result.rows[0].add_sparks;
    }
    // Use Sparks (with balance check)
    async useSparks(userId, amount, feature, referenceType, referenceId) {
        const result = await (0, database_1.query)('SELECT use_sparks($1, $2, $3, $4, $5) as use_sparks', [userId, amount, feature, referenceType, referenceId]);
        return result.rows[0].use_sparks;
    }
    // Claim daily bonus
    async claimDailyBonus(userId) {
        const result = await (0, database_1.query)('SELECT claim_daily_bonus($1) as claim_daily_bonus', [userId]);
        return result.rows[0].claim_daily_bonus;
    }
    // Create purchase record
    async createPurchase(userId, type, amountCents, sparksGranted, packageId, tierId, paymentMethod) {
        const result = await (0, database_1.query)(`INSERT INTO purchase_history (
        user_id, type, package_id, tier_id,
        amount_cents, sparks_granted, status, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
      RETURNING id`, [userId, type, packageId, tierId, amountCents, sparksGranted, paymentMethod]);
        return result.rows[0].id;
    }
    // Complete purchase
    async completePurchase(purchaseId, stripePaymentIntentId, stripeChargeId, receiptUrl) {
        await (0, database_1.query)(`UPDATE purchase_history
      SET status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          stripe_payment_intent_id = $2,
          stripe_charge_id = $3,
          receipt_url = $4
      WHERE id = $1`, [purchaseId, stripePaymentIntentId, stripeChargeId, receiptUrl]);
    }
    // Create or update subscription
    async upsertSubscription(userId, tierId, billingCycle, stripeSubscriptionId, stripeCustomerId) {
        // Validate billing cycle to prevent SQL injection
        const validPeriods = {
            monthly: '1 month',
            yearly: '1 year'
        };
        const periodLength = validPeriods[billingCycle] || '1 month';
        const result = await (0, database_1.query)(`INSERT INTO user_subscriptions (
        user_id, tier_id, status, billing_cycle,
        current_period_start, current_period_end,
        stripe_subscription_id, stripe_customer_id
      ) VALUES (
        $1, $2, 'active', $3,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL $6,
        $4, $5
      )
      ON CONFLICT (user_id, status) 
      DO UPDATE SET
        tier_id = $2,
        billing_cycle = $3,
        current_period_start = CURRENT_TIMESTAMP,
        current_period_end = CURRENT_TIMESTAMP + INTERVAL $6,
        stripe_subscription_id = $4,
        stripe_customer_id = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id`, [userId, tierId, billingCycle, stripeSubscriptionId, stripeCustomerId, periodLength]);
        return result.rows[0].id;
    }
    // Cancel subscription
    async cancelSubscription(userId, cancelAtPeriodEnd = true) {
        if (cancelAtPeriodEnd) {
            await (0, database_1.query)(`UPDATE user_subscriptions
        SET cancel_at_period_end = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND status = 'active'`, [userId]);
        }
        else {
            await (0, database_1.query)(`UPDATE user_subscriptions
        SET status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND status = 'active'`, [userId]);
        }
    }
    // Process referral reward
    async processReferralReward(referrerId, referredId, rewardType) {
        const rewardAmount = rewardType === 'signup' ? 25 : 50;
        // Check if reward already given - use CASE statement to avoid dynamic column names
        const check = await (0, database_1.query)(`SELECT 
        CASE 
          WHEN $3 = 'signup' THEN signup_rewarded
          WHEN $3 = 'first_action' THEN first_action_rewarded
          ELSE false
        END as rewarded
      FROM referral_rewards
      WHERE referrer_id = $1 AND referred_id = $2`, [referrerId, referredId, rewardType]);
        if (check.rows[0]?.rewarded) {
            return; // Already rewarded
        }
        // Grant reward
        await this.addSparks(referrerId, rewardAmount, 'referral', `Referral ${rewardType} reward`, 'referral', referredId);
        // Mark as rewarded - use CASE statement to update correct column
        await (0, database_1.query)(`UPDATE referral_rewards
      SET 
        signup_rewarded = CASE WHEN $3 = 'signup' THEN true ELSE signup_rewarded END,
        first_action_rewarded = CASE WHEN $3 = 'first_action' THEN true ELSE first_action_rewarded END
      WHERE referrer_id = $1 AND referred_id = $2`, [referrerId, referredId, rewardType]);
    }
    // Get usage statistics
    async getUserUsageStats(userId) {
        const result = await (0, database_1.query)(`SELECT 
        COUNT(*) as total_uses,
        SUM(sparks_cost) as total_sparks_used,
        feature,
        DATE_TRUNC('day', created_at) as date
      FROM sparks_usage
      WHERE user_id = $1
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY feature, DATE_TRUNC('day', created_at)
      ORDER BY date DESC`, [userId]);
        return result.rows;
    }
}
exports.SparksRepository = SparksRepository;
