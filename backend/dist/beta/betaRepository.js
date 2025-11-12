"use strict";
/**
 * Beta Testing Repository
 * Manages beta user registration, limits, and Spark bonuses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canRegisterNewUser = canRegisterNewUser;
exports.getBetaStatus = getBetaStatus;
exports.grantDailyLoginBonus = grantDailyLoginBonus;
exports.getBetaUserInfo = getBetaUserInfo;
exports.processReferralBonus = processReferralBonus;
exports.getBetaLeaderboard = getBetaLeaderboard;
exports.checkBetaUserLimit = checkBetaUserLimit;
exports.updateActivityScore = updateActivityScore;
const database_js_1 = require("../database.js");
/**
 * Check if new user registration is allowed
 */
async function canRegisterNewUser() {
    const result = await (0, database_js_1.query)(`SELECT can_register_new_user() as can_register`);
    return result.rows[0]?.can_register ?? false;
}
/**
 * Get current beta testing status
 */
async function getBetaStatus() {
    const result = await (0, database_js_1.query)(`SELECT get_beta_status() as status`);
    const statusData = result.rows[0]?.status || {};
    return {
        currentUsers: statusData.current_users || 0,
        maxUsers: statusData.max_users || 100,
        spotsRemaining: statusData.spots_remaining || 100,
        registrationOpen: statusData.registration_open || false,
        totalSparksGranted: parseFloat(statusData.total_sparks_granted || '0'),
        totalSparksSpent: parseFloat(statusData.total_sparks_spent || '0'),
        avgSparksPerUser: parseFloat(statusData.avg_sparks_per_user || '0')
    };
}
/**
 * Grant daily login bonus to user
 */
async function grantDailyLoginBonus(userId) {
    const result = await (0, database_js_1.query)(`SELECT grant_daily_login_bonus($1) as bonus_amount`, [userId]);
    return parseFloat(result.rows[0]?.grant_daily_login_bonus || '0');
}
/**
 * Get beta user info
 */
async function getBetaUserInfo(userId) {
    const result = await (0, database_js_1.query)(`SELECT 
      user_id,
      beta_number,
      joined_at,
      referral_code,
      total_sparks_earned,
      total_sparks_spent,
      activity_score,
      is_vip
    FROM beta_users
    WHERE user_id = $1`, [userId]);
    if (result.rows.length === 0) {
        return null;
    }
    const row = result.rows[0];
    return {
        userId: row.user_id,
        betaNumber: row.beta_number,
        joinedAt: new Date(row.joined_at),
        referralCode: row.referral_code,
        totalSparksEarned: parseFloat(row.total_sparks_earned),
        totalSparksSpent: parseFloat(row.total_sparks_spent),
        activityScore: row.activity_score,
        isVip: row.is_vip
    };
}
/**
 * Process referral bonus
 */
async function processReferralBonus(referralCode, newUserId) {
    try {
        // Find the referrer
        const referrerResult = await (0, database_js_1.query)(`SELECT user_id FROM beta_users WHERE referral_code = $1`, [referralCode]);
        if (referrerResult.rows.length === 0) {
            return false;
        }
        const referrerId = referrerResult.rows[0].user_id;
        // Update the new user's referred_by
        await (0, database_js_1.query)(`UPDATE beta_users SET referred_by = $1 WHERE user_id = $2`, [referrerId, newUserId]);
        // Get referral bonus amount
        const configResult = await (0, database_js_1.query)(`SELECT referral_bonus_sparks FROM beta_config LIMIT 1`);
        const bonusAmount = parseFloat(configResult.rows[0]?.referral_bonus_sparks || '100');
        // Grant bonus to referrer
        await (0, database_js_1.query)(`SELECT grant_bonus_sparks($1, $2, $3)`, [referrerId, bonusAmount, 'Referral bonus for inviting a friend']);
        // Grant bonus to new user
        await (0, database_js_1.query)(`SELECT grant_bonus_sparks($1, $2, $3)`, [newUserId, bonusAmount / 2, 'Welcome bonus for using referral code']);
        return true;
    }
    catch (error) {
        console.error('Error processing referral bonus:', error);
        return false;
    }
}
/**
 * Get beta leaderboard
 */
async function getBetaLeaderboard() {
    const result = await (0, database_js_1.query)(`SELECT 
      u.display_name,
      u.username,
      b.beta_number,
      b.total_sparks_earned,
      b.total_sparks_spent,
      b.activity_score,
      b.is_vip,
      COUNT(DISTINCT f.id) as feedback_count
    FROM beta_users b
    JOIN user_profiles u ON b.user_id = u.user_id
    LEFT JOIN user_feedback f ON b.user_id = f.user_id
    GROUP BY u.display_name, u.username, b.beta_number, 
             b.total_sparks_earned, b.total_sparks_spent, 
             b.activity_score, b.is_vip
    ORDER BY b.activity_score DESC, b.total_sparks_earned DESC
    LIMIT 20`);
    return result.rows;
}
/**
 * Check and enforce beta user limit
 */
async function checkBetaUserLimit() {
    const status = await getBetaStatus();
    if (!status.registrationOpen) {
        return {
            allowed: false,
            currentCount: status.currentUsers,
            maxCount: status.maxUsers,
            message: `Beta testing is full! We've reached our limit of ${status.maxUsers} testers. Join the waitlist for the next round!`
        };
    }
    return {
        allowed: true,
        currentCount: status.currentUsers,
        maxCount: status.maxUsers,
        message: `Welcome! You'll be beta tester #${status.currentUsers + 1} of ${status.maxUsers}.`
    };
}
/**
 * Update user activity score
 */
async function updateActivityScore(userId, action, points = 1) {
    await (0, database_js_1.query)(`UPDATE beta_users 
     SET activity_score = activity_score + $2
     WHERE user_id = $1`, [userId, points]);
    // Log the activity
    await (0, database_js_1.query)(`INSERT INTO beta_metrics (
      metric_date,
      features_used,
      active_users_today
    ) VALUES (
      CURRENT_DATE,
      jsonb_build_object($2, 1),
      1
    ) ON CONFLICT (metric_date) DO UPDATE
    SET features_used = COALESCE(beta_metrics.features_used, '{}'::jsonb) || 
                       jsonb_build_object($2, COALESCE((beta_metrics.features_used->>$2)::int, 0) + 1),
        active_users_today = beta_metrics.active_users_today + 1`, [userId, action]);
}
