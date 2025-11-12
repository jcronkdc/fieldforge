import { Router, Request, Response } from "express";
import * as dasRepository from "./dasRepository.js";
import { getAuditLog, verifyAuditChain } from "./dasAudit.js";
import { authenticateRequest } from "../middleware/auth.js";

export function createDasRouter(): Router {
  const router = Router();

  // ============================================================================
  // BRAND ENDPOINTS
  // ============================================================================

  // Register a new brand
  router.post("/brands", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const brand = await dasRepository.registerBrand({
        ...req.body,
        userId
      });
      res.json(brand);
    } catch (error) {
      console.error("Error registering brand:", error);
      res.status(500).json({ error: "Failed to register brand" });
    }
  });

  // Get brand by ID
  router.get("/brands/:brandId", async (req: Request, res: Response) => {
    try {
      const brand = await dasRepository.getBrandById(req.params.brandId);
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  });

  // List brands
  router.get("/brands", async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const brands = await dasRepository.listBrands(status as string);
      res.json(brands);
    } catch (error) {
      console.error("Error listing brands:", error);
      res.status(500).json({ error: "Failed to list brands" });
    }
  });

  // ============================================================================
  // PROPOSAL ENDPOINTS
  // ============================================================================

  // Submit a proposal
  router.post("/proposals", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const proposal = await dasRepository.submitProposal({
        ...req.body,
        userId
      });
      res.json(proposal);
    } catch (error) {
      console.error("Error submitting proposal:", error);
      res.status(500).json({ error: "Failed to submit proposal" });
    }
  });

  // Get proposal by ID
  router.get("/proposals/:proposalId", async (req: Request, res: Response) => {
    try {
      const proposal = await dasRepository.getProposalById(req.params.proposalId);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  // List proposals
  router.get("/proposals", async (req: Request, res: Response) => {
    try {
      const { cycleId, status } = req.query;
      const proposals = await dasRepository.listProposals(
        cycleId as string,
        status as string
      );
      res.json(proposals);
    } catch (error) {
      console.error("Error listing proposals:", error);
      res.status(500).json({ error: "Failed to list proposals" });
    }
  });

  // ============================================================================
  // VOTING ENDPOINTS
  // ============================================================================

  // Cast a vote
  router.post("/votes", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const vote = await dasRepository.castVote({
        ...req.body,
        userId
      });
      res.json(vote);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      if (error.message === "User cannot vote on this proposal") {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to cast vote" });
    }
  });

  // Get user's votes
  router.get("/users/:userId/votes", async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const votes = await dasRepository.getUserVotes(
        req.params.userId,
        limit ? parseInt(limit as string) : 50
      );
      res.json(votes);
    } catch (error) {
      console.error("Error fetching user votes:", error);
      res.status(500).json({ error: "Failed to fetch user votes" });
    }
  });

  // ============================================================================
  // VOTING CYCLE ENDPOINTS
  // ============================================================================

  // Create voting cycle
  router.post("/voting-cycles", async (req: Request, res: Response) => {
    try {
      const cycle = await dasRepository.createVotingCycle(req.body);
      res.json(cycle);
    } catch (error) {
      console.error("Error creating voting cycle:", error);
      res.status(500).json({ error: "Failed to create voting cycle" });
    }
  });

  // Get current voting cycle
  router.get("/voting-cycles/current", async (req: Request, res: Response) => {
    try {
      const cycle = await dasRepository.getCurrentVotingCycle();
      res.json(cycle);
    } catch (error) {
      console.error("Error fetching current voting cycle:", error);
      res.status(500).json({ error: "Failed to fetch current voting cycle" });
    }
  });

  // List voting cycles
  router.get("/voting-cycles", async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const cycles = await dasRepository.listVotingCycles(status as string);
      res.json(cycles);
    } catch (error) {
      console.error("Error listing voting cycles:", error);
      res.status(500).json({ error: "Failed to list voting cycles" });
    }
  });

  // ============================================================================
  // CAMPAIGN ENDPOINTS
  // ============================================================================

  // Get campaign by ID
  router.get("/campaigns/:campaignId", async (req: Request, res: Response) => {
    try {
      const campaign = await dasRepository.getCampaignById(req.params.campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  // List active campaigns
  router.get("/campaigns", async (req: Request, res: Response) => {
    try {
      const campaigns = await dasRepository.listActiveCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error listing campaigns:", error);
      res.status(500).json({ error: "Failed to list campaigns" });
    }
  });

  // ============================================================================
  // AD CONTENT ENDPOINTS
  // ============================================================================

  // Create ad content
  router.post("/ad-content", async (req: Request, res: Response) => {
    try {
      const content = await dasRepository.createAdContent(req.body);
      res.json(content);
    } catch (error) {
      console.error("Error creating ad content:", error);
      res.status(500).json({ error: "Failed to create ad content" });
    }
  });

  // Get ad content
  router.get("/ad-content/:contentId", async (req: Request, res: Response) => {
    try {
      const content = await dasRepository.getAdContent(req.params.contentId);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching ad content:", error);
      res.status(500).json({ error: "Failed to fetch ad content" });
    }
  });

  // Get user's eligible ads
  router.get("/users/:userId/eligible-ads", async (req: Request, res: Response) => {
    try {
      const ads = await dasRepository.listUserEligibleAds(req.params.userId);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching eligible ads:", error);
      res.status(500).json({ error: "Failed to fetch eligible ads" });
    }
  });

  // ============================================================================
  // ENGAGEMENT ENDPOINTS
  // ============================================================================

  // Record engagement
  router.post("/engagements", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const engagement = await dasRepository.recordEngagement({
        ...req.body,
        userId
      });
      res.json(engagement);
    } catch (error) {
      console.error("Error recording engagement:", error);
      res.status(500).json({ error: "Failed to record engagement" });
    }
  });

  // Get user's engagements
  router.get("/users/:userId/engagements", async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const engagements = await dasRepository.getUserEngagements(
        req.params.userId,
        limit ? parseInt(limit as string) : 50
      );
      res.json(engagements);
    } catch (error) {
      console.error("Error fetching user engagements:", error);
      res.status(500).json({ error: "Failed to fetch user engagements" });
    }
  });

  // ============================================================================
  // USER PREFERENCES ENDPOINTS
  // ============================================================================

  // Get user preferences
  router.get("/users/:userId/preferences", async (req: Request, res: Response) => {
    try {
      const preferences = await dasRepository.getUserPreferences(req.params.userId);
      res.json(preferences || {
        opt_in_ads: false,
        preferred_ad_types: [],
        blocked_brands: [],
        max_daily_ads: 5,
        preferred_difficulty: 2,
        privacy_level: 'standard'
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  // Update user preferences
  router.put("/users/:userId/preferences", async (req: Request, res: Response) => {
    try {
      const preferences = await dasRepository.updateUserPreferences(
        req.params.userId,
        req.body
      );
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  // ============================================================================
  // REVENUE & PAYOUT ENDPOINTS
  // ============================================================================

  // Distribute revenue (admin endpoint)
  router.post("/revenue/distribute", async (req: Request, res: Response) => {
    try {
      const { campaignId, totalRevenue } = req.body;
      const distributionId = await dasRepository.distributeRevenue(
        campaignId,
        totalRevenue
      );
      res.json({ distributionId });
    } catch (error) {
      console.error("Error distributing revenue:", error);
      res.status(500).json({ error: "Failed to distribute revenue" });
    }
  });

  // Get user payouts
  router.get("/users/:userId/payouts", async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const payouts = await dasRepository.getUserPayouts(
        req.params.userId,
        limit ? parseInt(limit as string) : 50
      );
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching user payouts:", error);
      res.status(500).json({ error: "Failed to fetch user payouts" });
    }
  });

  // Get revenue statistics
  router.get("/revenue/stats", async (req: Request, res: Response) => {
    try {
      const stats = await dasRepository.getRevenueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ error: "Failed to fetch revenue stats" });
    }
  });

  // ============================================================================
  // FEEDBACK & ACCOUNTABILITY ENDPOINTS
  // ============================================================================

  // Submit brand feedback
  router.post("/feedback", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const feedback = await dasRepository.submitBrandFeedback({
        ...req.body,
        userId
      });
      res.json(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Report violation
  router.post("/violations", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const violation = await dasRepository.reportViolation({
        ...req.body,
        reportedBy: userId
      });
      res.json(violation);
    } catch (error) {
      console.error("Error reporting violation:", error);
      res.status(500).json({ error: "Failed to report violation" });
    }
  });

  // ============================================================================
  // DASHBOARD & ANALYTICS ENDPOINTS
  // ============================================================================

  // Get dashboard stats
  router.get("/dashboard/stats", authenticateRequest, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const stats = await dasRepository.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get transparency report
  router.get("/transparency/report", async (req: Request, res: Response) => {
    try {
      const report = await dasRepository.getTransparencyReport();
      res.json(report);
    } catch (error) {
      console.error("Error fetching transparency report:", error);
      res.status(500).json({ error: "Failed to fetch transparency report" });
    }
  });

  // ============================================================================
  // AUDIT LOG ENDPOINTS
  // ============================================================================

  // Get audit log
  router.get("/audit", async (req: Request, res: Response) => {
    try {
      const filters = {
        eventType: req.query.eventType as string,
        eventCategory: req.query.eventCategory as any,
        actorId: req.query.actorId as string,
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100
      };

      const log = await getAuditLog(filters);
      res.json(log);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ error: "Failed to fetch audit log" });
    }
  });

  // Verify audit chain
  router.get("/audit/verify", async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const verification = await verifyAuditChain(startDate, endDate);
      res.json(verification);
    } catch (error) {
      console.error("Error verifying audit chain:", error);
      res.status(500).json({ error: "Failed to verify audit chain" });
    }
  });

  return router;
}
