"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySubscription = updateCompanySubscription;
exports.getCompanyByStripeCustomer = getCompanyByStripeCustomer;
exports.cancelCompanySubscription = cancelCompanySubscription;
exports.getCompanySubscription = getCompanySubscription;
exports.getCompanyByUserId = getCompanyByUserId;
const database_js_1 = require("../database.js");
/**
 * Update company subscription from Stripe webhook
 */
async function updateCompanySubscription(data) {
    await (0, database_js_1.query)(`SELECT update_company_subscription($1, $2, $3, $4, $5, $6, $7)`, [
        data.companyId,
        data.stripeCustomerId,
        data.stripeSubscriptionId,
        data.plan,
        data.status,
        data.currentPeriodEnd,
        data.cancelAtPeriodEnd || false
    ]);
    console.log(`[subscription] Updated subscription for company ${data.companyId} to ${data.plan} (${data.status})`);
}
/**
 * Get company ID by Stripe customer ID
 */
async function getCompanyByStripeCustomer(stripeCustomerId) {
    const result = await (0, database_js_1.query)(`SELECT get_company_by_stripe_customer($1) as company_id`, [stripeCustomerId]);
    return result.rows[0]?.company_id || null;
}
/**
 * Cancel company subscription
 */
async function cancelCompanySubscription(companyId) {
    await (0, database_js_1.query)(`SELECT cancel_company_subscription($1)`, [companyId]);
    console.log(`[subscription] Canceled subscription for company ${companyId}`);
}
/**
 * Get company subscription details
 */
async function getCompanySubscription(companyId) {
    const result = await (0, database_js_1.query)(`SELECT 
      settings->'subscription'->>'plan' as plan,
      subscription_status as status,
      stripe_customer_id,
      stripe_subscription_id,
      current_period_end,
      cancel_at_period_end
     FROM company_settings 
     WHERE company_id = $1`, [companyId]);
    if (result.rows.length === 0) {
        return null;
    }
    const row = result.rows[0];
    return {
        plan: row.plan || 'free',
        status: row.status || 'active',
        stripeCustomerId: row.stripe_customer_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : undefined,
        cancelAtPeriodEnd: row.cancel_at_period_end || false
    };
}
/**
 * Get company ID by user ID (for webhook handling)
 */
async function getCompanyByUserId(userId) {
    const result = await (0, database_js_1.query)(`SELECT company_id 
     FROM company_users 
     WHERE user_id = $1 
     LIMIT 1`, [userId]);
    return result.rows[0]?.company_id || null;
}
