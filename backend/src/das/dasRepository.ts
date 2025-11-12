import { loadEnv } from "../worker/env.js";
import { query } from "../database.js";
import { recordTransaction } from "../mythacoin/mythacoinRepository.js";
import { createDasAuditEntry } from "./dasAudit.js";

const env = loadEnv();

// ============================================================================
// BRAND MANAGEMENT
// ============================================================================

export async function registerBrand(data: {
  companyName: string;
  companyWebsite?: string;
  contactEmail: string;
  userId: string;
}) {
  const result = await query(
    `INSERT INTO das_brands (company_name, company_website, contact_email)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.companyName, data.companyWebsite, data.contactEmail]
  );

  // Create audit entry
  await createDasAuditEntry({
    eventType: "brand_registration",
    eventCategory: "governance",
    actorId: data.userId,
    entityType: "das_brands",
    entityId: result.rows[0].id,
    eventData: { brand: result.rows[0] }
  });

  return result.rows[0];
}

export async function getBrandById(brandId: string) {
  const result = await query(
    `SELECT * FROM das_brands WHERE id = $1`,
    [brandId]
  );
  return result.rows[0];
}

export async function listBrands(status?: string) {
  const sql = status
    ? `SELECT * FROM das_brands WHERE status = $1 ORDER BY reputation_score DESC`
    : `SELECT * FROM das_brands ORDER BY reputation_score DESC`;
  
  const params = status ? [status] : [];
  const result = await query(sql, params);
  return result.rows;
}

// ============================================================================
// PROPOSAL MANAGEMENT
// ============================================================================

export async function submitProposal(data: {
  brandId: string;
  campaignName: string;
  campaignDescription: string;
  creativeContent: string;
  ethicalDisclosure: string;
  targetAudience?: any;
  proposedBudget: number;
  revenueSharePercentage?: number;
  campaignDurationDays: number;
  loreIntegrationPlan?: string;
  interactiveElements?: any[];
  creatorPartnerships?: string[];
  votingCycleId?: string;
  userId: string;
}) {
  // Get current active voting cycle if not specified
  let cycleId = data.votingCycleId;
  if (!cycleId) {
    const cycleResult = await query(
      `SELECT id FROM das_voting_cycles 
       WHERE status = 'active' 
       ORDER BY start_date DESC 
       LIMIT 1`
    );
    cycleId = cycleResult.rows[0]?.id;
  }

  const result = await query(
    `INSERT INTO das_proposals (
      brand_id, campaign_name, campaign_description, creative_concept,
      ethical_disclosure, target_audience, proposed_budget,
      revenue_share_percentage, campaign_duration_days,
      lore_integration_plan, interactive_elements, creator_partnerships,
      voting_cycle_id, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'voting')
    RETURNING *`,
    [
      data.brandId,
      data.campaignName,
      data.campaignDescription,
      data.creativeContent,
      data.ethicalDisclosure,
      JSON.stringify(data.targetAudience || {}),
      data.proposedBudget,
      data.revenueSharePercentage || 50,
      data.campaignDurationDays,
      data.loreIntegrationPlan,
      JSON.stringify(data.interactiveElements || []),
      JSON.stringify(data.creatorPartnerships || []),
      cycleId
    ]
  );

  // Create audit entry
  await createDasAuditEntry({
    eventType: "proposal_submission",
    eventCategory: "governance",
    actorId: data.userId,
    entityType: "das_proposals",
    entityId: result.rows[0].id,
    eventData: { proposal: result.rows[0] }
  });

  return result.rows[0];
}

export async function getProposalById(proposalId: string) {
  const result = await query(
    `SELECT p.*, b.company_name, b.reputation_score,
            COUNT(DISTINCT v.id) as total_votes,
            COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'approve') as approve_votes,
            COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'reject') as reject_votes
     FROM das_proposals p
     LEFT JOIN das_brands b ON p.brand_id = b.id
     LEFT JOIN das_votes v ON p.id = v.proposal_id
     WHERE p.id = $1
     GROUP BY p.id, b.company_name, b.reputation_score`,
    [proposalId]
  );
  return result.rows[0];
}

export async function listProposals(cycleId?: string, status?: string) {
  let sql = `
    SELECT p.*, b.company_name, b.reputation_score,
           COUNT(DISTINCT v.id) as total_votes,
           COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'approve') as approve_votes
    FROM das_proposals p
    LEFT JOIN das_brands b ON p.brand_id = b.id
    LEFT JOIN das_votes v ON p.id = v.proposal_id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramIndex = 1;

  if (cycleId) {
    sql += ` AND p.voting_cycle_id = $${paramIndex++}`;
    params.push(cycleId);
  }

  if (status) {
    sql += ` AND p.status = $${paramIndex++}`;
    params.push(status);
  }

  sql += ` GROUP BY p.id, b.company_name, b.reputation_score
           ORDER BY p.submission_date DESC`;

  const result = await query(sql, params);
  return result.rows;
}

// ============================================================================
// VOTING SYSTEM
// ============================================================================

export async function castVote(data: {
  proposalId: string;
  userId: string;
  voteType: 'approve' | 'reject' | 'abstain';
  feedback?: string;
  ethicalConcerns?: string;
}) {
  // Check if user can vote
  const canVoteResult = await query(
    `SELECT can_user_vote($1, $2) as can_vote`,
    [data.userId, data.proposalId]
  );

  if (!canVoteResult.rows[0].can_vote) {
    throw new Error("User cannot vote on this proposal");
  }

  // Get voting cycle
  const cycleResult = await query(
    `SELECT voting_cycle_id FROM das_proposals WHERE id = $1`,
    [data.proposalId]
  );

  // Cast vote
  const result = await query(
    `INSERT INTO das_votes (
      proposal_id, user_id, vote_type, feedback, 
      ethical_concerns, voting_cycle_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (proposal_id, user_id) 
    DO UPDATE SET 
      vote_type = $3,
      feedback = $4,
      ethical_concerns = $5,
      voted_at = NOW()
    RETURNING *`,
    [
      data.proposalId,
      data.userId,
      data.voteType,
      data.feedback,
      data.ethicalConcerns,
      cycleResult.rows[0].voting_cycle_id
    ]
  );

  // Reward user with Sparks for voting
  await recordTransaction({
    userId: data.userId,
    amount: 5,
    transactionType: 'earn',
    description: 'Voted on ad proposal',
    metadata: { proposalId: data.proposalId }
  });

  // Check if proposal has enough votes to conclude
  await checkProposalVotingStatus(data.proposalId);

  return result.rows[0];
}

export async function getUserVotes(userId: string, limit = 50) {
  const result = await query(
    `SELECT v.*, p.campaign_name, b.company_name
     FROM das_votes v
     JOIN das_proposals p ON v.proposal_id = p.id
     JOIN das_brands b ON p.brand_id = b.id
     WHERE v.user_id = $1
     ORDER BY v.voted_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

async function checkProposalVotingStatus(proposalId: string) {
  // Get voting statistics
  const statsResult = await query(
    `SELECT 
      p.*,
      vc.min_votes_required,
      vc.approval_threshold,
      COUNT(v.id) as total_votes,
      COUNT(v.id) FILTER (WHERE v.vote_type = 'approve') as approve_votes,
      COUNT(v.id) FILTER (WHERE v.vote_type = 'reject') as reject_votes
     FROM das_proposals p
     JOIN das_voting_cycles vc ON p.voting_cycle_id = vc.id
     LEFT JOIN das_votes v ON p.id = v.proposal_id
     WHERE p.id = $1
     GROUP BY p.id, vc.min_votes_required, vc.approval_threshold`,
    [proposalId]
  );

  const stats = statsResult.rows[0];
  if (!stats) return;

  // Check if minimum votes reached
  if (stats.total_votes >= stats.min_votes_required) {
    const approvalPercentage = (stats.approve_votes / stats.total_votes) * 100;
    
    if (approvalPercentage >= stats.approval_threshold) {
      // Approve proposal and create campaign
      await approveProposal(proposalId, approvalPercentage);
    } else {
      // Reject proposal
      await rejectProposal(proposalId, approvalPercentage, "Insufficient approval votes");
    }
  }
}

async function approveProposal(proposalId: string, approvalPercentage: number) {
  // Update proposal status
  await query(
    `UPDATE das_proposals 
     SET status = 'approved', 
         approval_percentage = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [proposalId, approvalPercentage]
  );

  // Create campaign from approved proposal
  const proposalResult = await query(
    `SELECT * FROM das_proposals WHERE id = $1`,
    [proposalId]
  );
  
  const proposal = proposalResult.rows[0];
  
  await query(
    `INSERT INTO das_campaigns (
      proposal_id, brand_id, campaign_name, status,
      start_date, end_date
    ) VALUES ($1, $2, $3, 'scheduled', 
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '7 days' + ($4 || ' days')::INTERVAL
    )`,
    [proposalId, proposal.brand_id, proposal.campaign_name, proposal.campaign_duration_days]
  );

  // Create audit entry
  await createDasAuditEntry({
    eventType: "proposal_approved",
    eventCategory: "governance",
    actorId: null,
    entityType: "das_proposals",
    entityId: proposalId,
    eventData: { approvalPercentage }
  });
}

async function rejectProposal(proposalId: string, approvalPercentage: number, reason: string) {
  await query(
    `UPDATE das_proposals 
     SET status = 'rejected',
         approval_percentage = $2,
         rejection_reason = $3,
         updated_at = NOW()
     WHERE id = $1`,
    [proposalId, approvalPercentage, reason]
  );

  // Create audit entry
  await createDasAuditEntry({
    eventType: "proposal_rejected",
    eventCategory: "governance",
    actorId: null,
    entityType: "das_proposals",
    entityId: proposalId,
    eventData: { approvalPercentage, reason }
  });
}

// ============================================================================
// VOTING CYCLES
// ============================================================================

export async function createVotingCycle(data: {
  cycleName: string;
  cycleType: 'weekly' | 'monthly' | 'seasonal' | 'special';
  startDate: Date;
  endDate: Date;
  minVotesRequired?: number;
  approvalThreshold?: number;
}) {
  const result = await query(
    `INSERT INTO das_voting_cycles (
      cycle_name, cycle_type, start_date, end_date,
      min_votes_required, approval_threshold, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 
      CASE 
        WHEN $3 > NOW() THEN 'upcoming'
        WHEN $3 <= NOW() AND $4 > NOW() THEN 'active'
        ELSE 'completed'
      END
    )
    RETURNING *`,
    [
      data.cycleName,
      data.cycleType,
      data.startDate,
      data.endDate,
      data.minVotesRequired || 100,
      data.approvalThreshold || 60
    ]
  );
  return result.rows[0];
}

export async function getCurrentVotingCycle() {
  const result = await query(
    `SELECT * FROM das_voting_cycles 
     WHERE status = 'active'
     ORDER BY start_date DESC
     LIMIT 1`
  );
  return result.rows[0];
}

export async function listVotingCycles(status?: string) {
  const sql = status
    ? `SELECT * FROM das_voting_cycles WHERE status = $1 ORDER BY start_date DESC`
    : `SELECT * FROM das_voting_cycles ORDER BY start_date DESC`;
  
  const params = status ? [status] : [];
  const result = await query(sql, params);
  return result.rows;
}

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

export async function getCampaignById(campaignId: string) {
  const result = await query(
    `SELECT c.*, b.company_name, b.reputation_score,
            p.creative_concept, p.lore_integration_plan,
            p.interactive_elements
     FROM das_campaigns c
     JOIN das_brands b ON c.brand_id = b.id
     LEFT JOIN das_proposals p ON c.proposal_id = p.id
     WHERE c.id = $1`,
    [campaignId]
  );
  return result.rows[0];
}

export async function listActiveCampaigns() {
  const result = await query(
    `SELECT c.*, b.company_name, b.reputation_score
     FROM das_campaigns c
     JOIN das_brands b ON c.brand_id = b.id
     WHERE c.status = 'active'
     AND c.start_date <= NOW()
     AND c.end_date >= NOW()
     ORDER BY c.start_date DESC`
  );
  return result.rows;
}

export async function updateCampaignMetrics(campaignId: string, metrics: any) {
  const result = await query(
    `UPDATE das_campaigns
     SET performance_metrics = performance_metrics || $2,
         total_engagements = total_engagements + ($2->>'engagements')::INTEGER,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [campaignId, JSON.stringify(metrics)]
  );
  return result.rows[0];
}

// ============================================================================
// AD CONTENT & ENGAGEMENT
// ============================================================================

export async function createAdContent(data: {
  campaignId: string;
  contentType: 'quest' | 'mini_game' | 'puzzle' | 'poll' | 'story' | 'challenge';
  title: string;
  description: string;
  loreContext?: string;
  difficultyLevel?: number;
  estimatedDurationMinutes?: number;
  rewardSparks?: number;
  contentData: any;
  completionCriteria?: any;
}) {
  const result = await query(
    `INSERT INTO das_ad_content (
      campaign_id, content_type, title, description,
      lore_context, difficulty_level, estimated_duration_minutes,
      reward_sparks, content_data, completion_criteria
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.campaignId,
      data.contentType,
      data.title,
      data.description,
      data.loreContext,
      data.difficultyLevel || 1,
      data.estimatedDurationMinutes || 5,
      data.rewardSparks || 10,
      JSON.stringify(data.contentData),
      JSON.stringify(data.completionCriteria || {})
    ]
  );
  return result.rows[0];
}

export async function getAdContent(contentId: string) {
  const result = await query(
    `SELECT ac.*, c.campaign_name, b.company_name
     FROM das_ad_content ac
     JOIN das_campaigns c ON ac.campaign_id = c.id
     JOIN das_brands b ON c.brand_id = b.id
     WHERE ac.id = $1 AND ac.is_active = true`,
    [contentId]
  );
  return result.rows[0];
}

export async function listUserEligibleAds(userId: string) {
  // Check user preferences
  const prefsResult = await query(
    `SELECT * FROM das_user_preferences WHERE user_id = $1`,
    [userId]
  );
  
  const prefs = prefsResult.rows[0];
  if (!prefs?.opt_in_ads) {
    return [];
  }

  // Get eligible ads based on preferences
  const result = await query(
    `SELECT ac.*, c.campaign_name, b.company_name
     FROM das_ad_content ac
     JOIN das_campaigns c ON ac.campaign_id = c.id
     JOIN das_brands b ON c.brand_id = b.id
     WHERE ac.is_active = true
     AND c.status = 'active'
     AND c.start_date <= NOW()
     AND c.end_date >= NOW()
     AND NOT b.id = ANY($1)
     AND ($2 = '{}' OR ac.content_type = ANY($2))
     AND ac.difficulty_level <= $3
     ORDER BY RANDOM()
     LIMIT $4`,
    [
      prefs.blocked_brands || [],
      prefs.preferred_ad_types || [],
      prefs.preferred_difficulty || 3,
      prefs.max_daily_ads || 5
    ]
  );
  
  return result.rows;
}

// ============================================================================
// ENGAGEMENT TRACKING
// ============================================================================

export async function recordEngagement(data: {
  userId: string;
  campaignId: string;
  contentId?: string;
  engagementType: 'view' | 'click' | 'play' | 'complete' | 'share' | 'skip';
  durationSeconds?: number;
  completionPercentage?: number;
  feedbackRating?: number;
  feedbackComment?: string;
}) {
  // Calculate earned Sparks based on engagement type
  let earnedSparks = 0;
  switch (data.engagementType) {
    case 'complete': earnedSparks = 10; break;
    case 'play': earnedSparks = 5; break;
    case 'share': earnedSparks = 3; break;
    case 'click': earnedSparks = 1; break;
  }

  const result = await query(
    `INSERT INTO das_engagements (
      user_id, campaign_id, content_id, engagement_type,
      duration_seconds, completion_percentage, earned_sparks,
      feedback_rating, feedback_comment
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      data.userId,
      data.campaignId,
      data.contentId,
      data.engagementType,
      data.durationSeconds,
      data.completionPercentage,
      earnedSparks,
      data.feedbackRating,
      data.feedbackComment
    ]
  );

  // Award Sparks to user
  if (earnedSparks > 0) {
    await recordTransaction({
      userId: data.userId,
      amount: earnedSparks,
      transactionType: 'earn',
      description: `Ad engagement: ${data.engagementType}`,
      metadata: { 
        campaignId: data.campaignId,
        engagementId: result.rows[0].id
      }
    });
  }

  // Update campaign metrics
  await updateCampaignMetrics(data.campaignId, {
    engagements: 1,
    [`${data.engagementType}_count`]: 1
  });

  return result.rows[0];
}

export async function getUserEngagements(userId: string, limit = 50) {
  const result = await query(
    `SELECT e.*, c.campaign_name, b.company_name
     FROM das_engagements e
     JOIN das_campaigns c ON e.campaign_id = c.id
     JOIN das_brands b ON c.brand_id = b.id
     WHERE e.user_id = $1
     ORDER BY e.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export async function getUserPreferences(userId: string) {
  const result = await query(
    `SELECT * FROM das_user_preferences WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

export async function updateUserPreferences(userId: string, preferences: any) {
  const result = await query(
    `INSERT INTO das_user_preferences (
      user_id, opt_in_ads, preferred_ad_types, blocked_brands,
      max_daily_ads, preferred_difficulty, auto_skip_after_seconds,
      share_analytics, receive_vote_notifications, payout_preferences,
      privacy_level
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (user_id) DO UPDATE SET
      opt_in_ads = $2,
      preferred_ad_types = $3,
      blocked_brands = $4,
      max_daily_ads = $5,
      preferred_difficulty = $6,
      auto_skip_after_seconds = $7,
      share_analytics = $8,
      receive_vote_notifications = $9,
      payout_preferences = $10,
      privacy_level = $11,
      updated_at = NOW()
    RETURNING *`,
    [
      userId,
      preferences.optInAds ?? false,
      preferences.preferredAdTypes || [],
      preferences.blockedBrands || [],
      preferences.maxDailyAds || 5,
      preferences.preferredDifficulty || 2,
      preferences.autoSkipAfterSeconds || 30,
      preferences.shareAnalytics ?? false,
      preferences.receiveVoteNotifications ?? true,
      JSON.stringify(preferences.payoutPreferences || { method: 'sparks', auto_convert: false }),
      preferences.privacyLevel || 'standard'
    ]
  );
  return result.rows[0];
}

// ============================================================================
// REVENUE & PAYOUTS
// ============================================================================

export async function distributeRevenue(campaignId: string, totalRevenue: number) {
  const result = await query(
    `SELECT distribute_campaign_revenue($1, $2) as distribution_id`,
    [campaignId, totalRevenue]
  );
  
  const distributionId = result.rows[0].distribution_id;
  
  // Process individual payouts
  await processPayouts(distributionId);
  
  return distributionId;
}

async function processPayouts(distributionId: string) {
  // Get all pending payouts for this distribution
  const payoutsResult = await query(
    `SELECT * FROM das_user_payouts 
     WHERE distribution_id = $1 AND payout_status = 'pending'`,
    [distributionId]
  );

  for (const payout of payoutsResult.rows) {
    try {
      // Process payout based on method
      if (payout.payout_method === 'sparks') {
        // Award Sparks
        await recordTransaction({
          userId: payout.user_id,
          amount: Math.floor(payout.payout_amount),
          transactionType: 'earn',
          description: 'Ad revenue share payout',
          metadata: { 
            distributionId,
            campaignId: payout.campaign_id
          }
        });

        // Update payout status
        await query(
          `UPDATE das_user_payouts 
           SET payout_status = 'completed',
               processed_at = NOW()
           WHERE id = $1`,
          [payout.id]
        );
      }
      // Add other payout methods (credits, cash) as needed
    } catch (error) {
      console.error(`Failed to process payout ${payout.id}:`, error);
      await query(
        `UPDATE das_user_payouts 
         SET payout_status = 'failed'
         WHERE id = $1`,
        [payout.id]
      );
    }
  }
}

export async function getUserPayouts(userId: string, limit = 50) {
  const result = await query(
    `SELECT p.*, c.campaign_name, d.total_revenue
     FROM das_user_payouts p
     JOIN das_campaigns c ON p.campaign_id = c.id
     JOIN das_revenue_distribution d ON p.distribution_id = d.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function getRevenueStats() {
  const result = await query(
    `SELECT 
      SUM(total_revenue) as total_revenue,
      SUM(platform_share) as total_platform_share,
      SUM(user_pool_share) as total_user_share,
      SUM(charity_share) as total_charity_share,
      COUNT(DISTINCT id) as total_distributions,
      SUM(users_paid) as total_users_paid
     FROM das_revenue_distribution
     WHERE distribution_status = 'completed'`
  );
  return result.rows[0];
}

// ============================================================================
// BRAND FEEDBACK & ACCOUNTABILITY
// ============================================================================

export async function submitBrandFeedback(data: {
  brandId: string;
  campaignId?: string;
  userId: string;
  rating: number;
  feedbackType?: string;
  feedbackText?: string;
  isFlagged?: boolean;
  flagReason?: string;
}) {
  const result = await query(
    `INSERT INTO das_brand_feedback (
      brand_id, campaign_id, user_id, rating,
      feedback_type, feedback_text, is_flagged, flag_reason
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      data.brandId,
      data.campaignId,
      data.userId,
      data.rating,
      data.feedbackType,
      data.feedbackText,
      data.isFlagged || false,
      data.flagReason
    ]
  );

  // Award Sparks for feedback
  await recordTransaction({
    userId: data.userId,
    amount: 2,
    transactionType: 'earn',
    description: 'Provided brand feedback',
    metadata: { brandId: data.brandId }
  });

  return result.rows[0];
}

export async function reportViolation(data: {
  brandId: string;
  campaignId?: string;
  violationType: string;
  severity: string;
  description: string;
  reportedBy: string;
}) {
  const result = await query(
    `INSERT INTO das_brand_violations (
      brand_id, campaign_id, violation_type,
      severity, description, reported_by
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.brandId,
      data.campaignId,
      data.violationType,
      data.severity,
      data.description,
      data.reportedBy
    ]
  );

  // Update brand reputation
  await query(`SELECT update_brand_reputation($1)`, [data.brandId]);

  // Check if brand should be suspended
  const violationsResult = await query(
    `SELECT COUNT(*) as violation_count,
            COUNT(*) FILTER (WHERE severity IN ('major', 'critical')) as serious_violations
     FROM das_brand_violations
     WHERE brand_id = $1 AND resolved_at IS NULL`,
    [data.brandId]
  );

  const violations = violationsResult.rows[0];
  if (violations.serious_violations > 2 || violations.violation_count > 5) {
    await query(
      `UPDATE das_brands
       SET status = 'suspended',
           suspension_reason = 'Multiple violations reported',
           suspension_date = NOW()
       WHERE id = $1`,
      [data.brandId]
    );
  }

  return result.rows[0];
}

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

export async function getDashboardStats(userId?: string) {
  const userCondition = userId ? `WHERE user_id = $1` : '';
  const params = userId ? [userId] : [];

  // Get overall stats
  const overallStats = await query(
    `SELECT 
      (SELECT COUNT(*) FROM das_brands WHERE status = 'approved') as active_brands,
      (SELECT COUNT(*) FROM das_campaigns WHERE status = 'active') as active_campaigns,
      (SELECT COUNT(*) FROM das_proposals WHERE status = 'voting') as proposals_voting,
      (SELECT SUM(total_revenue) FROM das_revenue_distribution) as total_revenue_distributed`
  );

  // Get user-specific stats if userId provided
  let userStats = null;
  if (userId) {
    const userStatsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM das_votes WHERE user_id = $1) as total_votes,
        (SELECT COUNT(*) FROM das_engagements WHERE user_id = $1) as total_engagements,
        (SELECT SUM(payout_amount) FROM das_user_payouts WHERE user_id = $1 AND payout_status = 'completed') as total_earnings,
        (SELECT opt_in_ads FROM das_user_preferences WHERE user_id = $1) as opted_in`,
      [userId]
    );
    userStats = userStatsResult.rows[0];
  }

  return {
    overall: overallStats.rows[0],
    user: userStats
  };
}

export async function getTransparencyReport() {
  const result = await query(
    `SELECT 
      DATE_TRUNC('month', created_at) as month,
      SUM(total_revenue) as revenue,
      SUM(platform_share) as platform_share,
      SUM(user_pool_share) as user_share,
      SUM(charity_share) as charity_share,
      SUM(users_paid) as users_paid,
      COUNT(*) as distributions
     FROM das_revenue_distribution
     WHERE distribution_status = 'completed'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY month DESC
     LIMIT 12`
  );
  return result.rows;
}
