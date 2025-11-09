import { apiRequest } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface DasBrand {
  id: string;
  company_name: string;
  company_website?: string;
  contact_email: string;
  status: 'pending' | 'approved' | 'suspended' | 'banned';
  reputation_score: number;
  ethical_score: number;
  total_campaigns: number;
  total_revenue_generated: number;
  created_at: string;
  updated_at: string;
}

export interface DasProposal {
  id: string;
  brand_id: string;
  campaign_name: string;
  campaign_description: string;
  creative_concept: string;
  ethical_disclosure: string;
  target_audience?: any;
  proposed_budget: number;
  revenue_share_percentage: number;
  campaign_duration_days: number;
  lore_integration_plan?: string;
  interactive_elements?: any[];
  creator_partnerships?: string[];
  voting_cycle_id?: string;
  status: 'submitted' | 'voting' | 'approved' | 'rejected' | 'expired';
  approval_percentage?: number;
  rejection_reason?: string;
  submission_date: string;
  // Extended fields from join
  company_name?: string;
  reputation_score?: number;
  total_votes?: number;
  approve_votes?: number;
  reject_votes?: number;
}

export interface DasVote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: 'approve' | 'reject' | 'abstain';
  feedback?: string;
  ethical_concerns?: string;
  voted_at: string;
  voting_cycle_id?: string;
  vote_weight: number;
  // Extended fields
  campaign_name?: string;
  company_name?: string;
}

export interface DasVotingCycle {
  id: string;
  cycle_name: string;
  cycle_type: 'weekly' | 'monthly' | 'seasonal' | 'special';
  start_date: string;
  end_date: string;
  min_votes_required: number;
  approval_threshold: number;
  total_proposals: number;
  total_votes_cast: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DasCampaign {
  id: string;
  proposal_id?: string;
  brand_id: string;
  campaign_name: string;
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'terminated';
  start_date?: string;
  end_date?: string;
  actual_budget_spent: number;
  total_engagements: number;
  total_revenue_generated: number;
  user_revenue_distributed: number;
  platform_revenue: number;
  charity_donation: number;
  performance_metrics?: any;
  // Extended fields
  company_name?: string;
  reputation_score?: number;
  creative_concept?: string;
  lore_integration_plan?: string;
  interactive_elements?: any[];
}

export interface DasAdContent {
  id: string;
  campaign_id: string;
  content_type: 'quest' | 'mini_game' | 'puzzle' | 'poll' | 'story' | 'challenge';
  title: string;
  description: string;
  lore_context?: string;
  difficulty_level: number;
  estimated_duration_minutes: number;
  reward_sparks: number;
  reward_multiplier: number;
  content_data: any;
  completion_criteria?: any;
  is_active: boolean;
  // Extended fields
  campaign_name?: string;
  company_name?: string;
}

export interface DasEngagement {
  id: string;
  user_id: string;
  campaign_id: string;
  content_id?: string;
  engagement_type: 'view' | 'click' | 'play' | 'complete' | 'share' | 'skip';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  completion_percentage: number;
  earned_sparks: number;
  feedback_rating?: number;
  feedback_comment?: string;
  // Extended fields
  campaign_name?: string;
  company_name?: string;
}

export interface DasUserPreferences {
  user_id: string;
  opt_in_ads: boolean;
  preferred_ad_types: string[];
  blocked_brands: string[];
  max_daily_ads: number;
  preferred_difficulty: number;
  auto_skip_after_seconds: number;
  share_analytics: boolean;
  receive_vote_notifications: boolean;
  payout_preferences: {
    method: 'sparks' | 'credits' | 'cash' | 'donation';
    auto_convert: boolean;
  };
  privacy_level: 'minimal' | 'standard' | 'maximum';
  created_at: string;
  updated_at: string;
}

export interface DasUserPayout {
  id: string;
  user_id: string;
  distribution_id: string;
  campaign_id: string;
  payout_amount: number;
  payout_weight: number;
  payout_method: 'sparks' | 'credits' | 'cash' | 'donation';
  payout_status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  transaction_id?: string;
  processed_at?: string;
  created_at: string;
  // Extended fields
  campaign_name?: string;
  total_revenue?: number;
}

export interface DasDashboardStats {
  overall: {
    active_brands: number;
    active_campaigns: number;
    proposals_voting: number;
    total_revenue_distributed: number;
  };
  user?: {
    total_votes: number;
    total_engagements: number;
    total_earnings: number;
    opted_in: boolean;
  };
}

export interface DasTransparencyReport {
  month: string;
  revenue: number;
  platform_share: number;
  user_share: number;
  charity_share: number;
  users_paid: number;
  distributions: number;
}

// ============================================================================
// BRAND FUNCTIONS
// ============================================================================

export async function registerBrand(data: {
  companyName: string;
  companyWebsite?: string;
  contactEmail: string;
}): Promise<DasBrand> {
  return apiRequest("/api/das/brands", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBrand(brandId: string): Promise<DasBrand> {
  return apiRequest(`/api/das/brands/${brandId}`);
}

export async function listBrands(status?: string): Promise<DasBrand[]> {
  const params = status ? `?status=${status}` : "";
  return apiRequest(`/api/das/brands${params}`);
}

// ============================================================================
// PROPOSAL FUNCTIONS
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
}): Promise<DasProposal> {
  return apiRequest("/api/das/proposals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProposal(proposalId: string): Promise<DasProposal> {
  return apiRequest(`/api/das/proposals/${proposalId}`);
}

export async function listProposals(
  cycleId?: string,
  status?: string
): Promise<DasProposal[]> {
  const params = new URLSearchParams();
  if (cycleId) params.append("cycleId", cycleId);
  if (status) params.append("status", status);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/api/das/proposals${queryString}`);
}

// ============================================================================
// VOTING FUNCTIONS
// ============================================================================

export async function castVote(data: {
  proposalId: string;
  voteType: 'approve' | 'reject' | 'abstain';
  feedback?: string;
  ethicalConcerns?: string;
}): Promise<DasVote> {
  return apiRequest("/api/das/votes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserVotes(
  userId: string,
  limit?: number
): Promise<DasVote[]> {
  const params = limit ? `?limit=${limit}` : "";
  return apiRequest(`/api/das/users/${userId}/votes${params}`);
}

// ============================================================================
// VOTING CYCLE FUNCTIONS
// ============================================================================

export async function createVotingCycle(data: {
  cycleName: string;
  cycleType: 'weekly' | 'monthly' | 'seasonal' | 'special';
  startDate: Date;
  endDate: Date;
  minVotesRequired?: number;
  approvalThreshold?: number;
}): Promise<DasVotingCycle> {
  return apiRequest("/api/das/voting-cycles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrentVotingCycle(): Promise<DasVotingCycle | null> {
  return apiRequest("/api/das/voting-cycles/current");
}

export async function listVotingCycles(
  status?: string
): Promise<DasVotingCycle[]> {
  const params = status ? `?status=${status}` : "";
  return apiRequest(`/api/das/voting-cycles${params}`);
}

// ============================================================================
// CAMPAIGN FUNCTIONS
// ============================================================================

export async function getCampaign(campaignId: string): Promise<DasCampaign> {
  return apiRequest(`/api/das/campaigns/${campaignId}`);
}

export async function listActiveCampaigns(): Promise<DasCampaign[]> {
  return apiRequest("/api/das/campaigns");
}

// ============================================================================
// AD CONTENT FUNCTIONS
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
}): Promise<DasAdContent> {
  return apiRequest("/api/das/ad-content", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdContent(contentId: string): Promise<DasAdContent> {
  return apiRequest(`/api/das/ad-content/${contentId}`);
}

export async function getUserEligibleAds(
  userId: string
): Promise<DasAdContent[]> {
  return apiRequest(`/api/das/users/${userId}/eligible-ads`);
}

// ============================================================================
// ENGAGEMENT FUNCTIONS
// ============================================================================

export async function recordEngagement(data: {
  campaignId: string;
  contentId?: string;
  engagementType: 'view' | 'click' | 'play' | 'complete' | 'share' | 'skip';
  durationSeconds?: number;
  completionPercentage?: number;
  feedbackRating?: number;
  feedbackComment?: string;
}): Promise<DasEngagement> {
  return apiRequest("/api/das/engagements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserEngagements(
  userId: string,
  limit?: number
): Promise<DasEngagement[]> {
  const params = limit ? `?limit=${limit}` : "";
  return apiRequest(`/api/das/users/${userId}/engagements${params}`);
}

// ============================================================================
// USER PREFERENCES FUNCTIONS
// ============================================================================

export async function getUserAdPreferences(
  userId: string
): Promise<DasUserPreferences> {
  return apiRequest(`/api/das/users/${userId}/preferences`);
}

export async function updateUserAdPreferences(
  userId: string,
  preferences: Partial<DasUserPreferences>
): Promise<DasUserPreferences> {
  return apiRequest(`/api/das/users/${userId}/preferences`, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

// ============================================================================
// PAYOUT FUNCTIONS
// ============================================================================

export async function getUserPayouts(
  userId: string,
  limit?: number
): Promise<DasUserPayout[]> {
  const params = limit ? `?limit=${limit}` : "";
  return apiRequest(`/api/das/users/${userId}/payouts${params}`);
}

export async function getRevenueStats(): Promise<{
  total_revenue: number;
  total_platform_share: number;
  total_user_share: number;
  total_charity_share: number;
  total_distributions: number;
  total_users_paid: number;
}> {
  return apiRequest("/api/das/revenue/stats");
}

// ============================================================================
// FEEDBACK & ACCOUNTABILITY FUNCTIONS
// ============================================================================

export async function submitBrandFeedback(data: {
  brandId: string;
  campaignId?: string;
  rating: number;
  feedbackType?: string;
  feedbackText?: string;
  isFlagged?: boolean;
  flagReason?: string;
}): Promise<any> {
  return apiRequest("/api/das/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reportViolation(data: {
  brandId: string;
  campaignId?: string;
  violationType: string;
  severity: string;
  description: string;
}): Promise<any> {
  return apiRequest("/api/das/violations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// DASHBOARD & ANALYTICS FUNCTIONS
// ============================================================================

export async function getDashboardStats(): Promise<DasDashboardStats> {
  return apiRequest("/api/das/dashboard/stats");
}

export async function getTransparencyReport(): Promise<DasTransparencyReport[]> {
  return apiRequest("/api/das/transparency/report");
}

// ============================================================================
// AUDIT FUNCTIONS
// ============================================================================

export async function getAuditLog(filters?: {
  eventType?: string;
  eventCategory?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/api/das/audit${queryString}`);
}

export async function verifyAuditChain(
  startDate?: string,
  endDate?: string
): Promise<{
  isChainValid: boolean;
  totalEntries: number;
  invalidEntries: number;
  results: any[];
}> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/api/das/audit/verify${queryString}`);
}
