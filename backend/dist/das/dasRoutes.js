"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDasRouter = createDasRouter;
const express_1 = require("express");
const dasRepository = __importStar(require("./dasRepository.js"));
const dasAudit_js_1 = require("./dasAudit.js");
function createDasRouter() {
    const router = (0, express_1.Router)();
    // ============================================================================
    // BRAND ENDPOINTS
    // ============================================================================
    // Register a new brand
    router.post("/brands", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "User ID required" });
            }
            const brand = await dasRepository.registerBrand({
                ...req.body,
                userId
            });
            res.json(brand);
        }
        catch (error) {
            console.error("Error registering brand:", error);
            res.status(500).json({ error: "Failed to register brand" });
        }
    });
    // Get brand by ID
    router.get("/brands/:brandId", async (req, res) => {
        try {
            const brand = await dasRepository.getBrandById(req.params.brandId);
            if (!brand) {
                return res.status(404).json({ error: "Brand not found" });
            }
            res.json(brand);
        }
        catch (error) {
            console.error("Error fetching brand:", error);
            res.status(500).json({ error: "Failed to fetch brand" });
        }
    });
    // List brands
    router.get("/brands", async (req, res) => {
        try {
            const { status } = req.query;
            const brands = await dasRepository.listBrands(status);
            res.json(brands);
        }
        catch (error) {
            console.error("Error listing brands:", error);
            res.status(500).json({ error: "Failed to list brands" });
        }
    });
    // ============================================================================
    // PROPOSAL ENDPOINTS
    // ============================================================================
    // Submit a proposal
    router.post("/proposals", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "User ID required" });
            }
            const proposal = await dasRepository.submitProposal({
                ...req.body,
                userId
            });
            res.json(proposal);
        }
        catch (error) {
            console.error("Error submitting proposal:", error);
            res.status(500).json({ error: "Failed to submit proposal" });
        }
    });
    // Get proposal by ID
    router.get("/proposals/:proposalId", async (req, res) => {
        try {
            const proposal = await dasRepository.getProposalById(req.params.proposalId);
            if (!proposal) {
                return res.status(404).json({ error: "Proposal not found" });
            }
            res.json(proposal);
        }
        catch (error) {
            console.error("Error fetching proposal:", error);
            res.status(500).json({ error: "Failed to fetch proposal" });
        }
    });
    // List proposals
    router.get("/proposals", async (req, res) => {
        try {
            const { cycleId, status } = req.query;
            const proposals = await dasRepository.listProposals(cycleId, status);
            res.json(proposals);
        }
        catch (error) {
            console.error("Error listing proposals:", error);
            res.status(500).json({ error: "Failed to list proposals" });
        }
    });
    // ============================================================================
    // VOTING ENDPOINTS
    // ============================================================================
    // Cast a vote
    router.post("/votes", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "User ID required" });
            }
            const vote = await dasRepository.castVote({
                ...req.body,
                userId
            });
            res.json(vote);
        }
        catch (error) {
            console.error("Error casting vote:", error);
            if (error.message === "User cannot vote on this proposal") {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to cast vote" });
        }
    });
    // Get user's votes
    router.get("/users/:userId/votes", async (req, res) => {
        try {
            const { limit } = req.query;
            const votes = await dasRepository.getUserVotes(req.params.userId, limit ? parseInt(limit) : 50);
            res.json(votes);
        }
        catch (error) {
            console.error("Error fetching user votes:", error);
            res.status(500).json({ error: "Failed to fetch user votes" });
        }
    });
    // ============================================================================
    // VOTING CYCLE ENDPOINTS
    // ============================================================================
    // Create voting cycle
    router.post("/voting-cycles", async (req, res) => {
        try {
            const cycle = await dasRepository.createVotingCycle(req.body);
            res.json(cycle);
        }
        catch (error) {
            console.error("Error creating voting cycle:", error);
            res.status(500).json({ error: "Failed to create voting cycle" });
        }
    });
    // Get current voting cycle
    router.get("/voting-cycles/current", async (req, res) => {
        try {
            const cycle = await dasRepository.getCurrentVotingCycle();
            res.json(cycle);
        }
        catch (error) {
            console.error("Error fetching current voting cycle:", error);
            res.status(500).json({ error: "Failed to fetch current voting cycle" });
        }
    });
    // List voting cycles
    router.get("/voting-cycles", async (req, res) => {
        try {
            const { status } = req.query;
            const cycles = await dasRepository.listVotingCycles(status);
            res.json(cycles);
        }
        catch (error) {
            console.error("Error listing voting cycles:", error);
            res.status(500).json({ error: "Failed to list voting cycles" });
        }
    });
    // ============================================================================
    // CAMPAIGN ENDPOINTS
    // ============================================================================
    // Get campaign by ID
    router.get("/campaigns/:campaignId", async (req, res) => {
        try {
            const campaign = await dasRepository.getCampaignById(req.params.campaignId);
            if (!campaign) {
                return res.status(404).json({ error: "Campaign not found" });
            }
            res.json(campaign);
        }
        catch (error) {
            console.error("Error fetching campaign:", error);
            res.status(500).json({ error: "Failed to fetch campaign" });
        }
    });
    // List active campaigns
    router.get("/campaigns", async (req, res) => {
        try {
            const campaigns = await dasRepository.listActiveCampaigns();
            res.json(campaigns);
        }
        catch (error) {
            console.error("Error listing campaigns:", error);
            res.status(500).json({ error: "Failed to list campaigns" });
        }
    });
    // ============================================================================
    // AD CONTENT ENDPOINTS
    // ============================================================================
    // Create ad content
    router.post("/ad-content", async (req, res) => {
        try {
            const content = await dasRepository.createAdContent(req.body);
            res.json(content);
        }
        catch (error) {
            console.error("Error creating ad content:", error);
            res.status(500).json({ error: "Failed to create ad content" });
        }
    });
    // Get ad content
    router.get("/ad-content/:contentId", async (req, res) => {
        try {
            const content = await dasRepository.getAdContent(req.params.contentId);
            if (!content) {
                return res.status(404).json({ error: "Content not found" });
            }
            res.json(content);
        }
        catch (error) {
            console.error("Error fetching ad content:", error);
            res.status(500).json({ error: "Failed to fetch ad content" });
        }
    });
    // Get user's eligible ads
    router.get("/users/:userId/eligible-ads", async (req, res) => {
        try {
            const ads = await dasRepository.listUserEligibleAds(req.params.userId);
            res.json(ads);
        }
        catch (error) {
            console.error("Error fetching eligible ads:", error);
            res.status(500).json({ error: "Failed to fetch eligible ads" });
        }
    });
    // ============================================================================
    // ENGAGEMENT ENDPOINTS
    // ============================================================================
    // Record engagement
    router.post("/engagements", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "User ID required" });
            }
            const engagement = await dasRepository.recordEngagement({
                ...req.body,
                userId
            });
            res.json(engagement);
        }
        catch (error) {
            console.error("Error recording engagement:", error);
            res.status(500).json({ error: "Failed to record engagement" });
        }
    });
    // Get user's engagements
    router.get("/users/:userId/engagements", async (req, res) => {
        try {
            const { limit } = req.query;
            const engagements = await dasRepository.getUserEngagements(req.params.userId, limit ? parseInt(limit) : 50);
            res.json(engagements);
        }
        catch (error) {
            console.error("Error fetching user engagements:", error);
            res.status(500).json({ error: "Failed to fetch user engagements" });
        }
    });
    // ============================================================================
    // USER PREFERENCES ENDPOINTS
    // ============================================================================
    // Get user preferences
    router.get("/users/:userId/preferences", async (req, res) => {
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
        }
        catch (error) {
            console.error("Error fetching user preferences:", error);
            res.status(500).json({ error: "Failed to fetch user preferences" });
        }
    });
    // Update user preferences
    router.put("/users/:userId/preferences", async (req, res) => {
        try {
            const preferences = await dasRepository.updateUserPreferences(req.params.userId, req.body);
            res.json(preferences);
        }
        catch (error) {
            console.error("Error updating user preferences:", error);
            res.status(500).json({ error: "Failed to update user preferences" });
        }
    });
    // ============================================================================
    // REVENUE & PAYOUT ENDPOINTS
    // ============================================================================
    // Distribute revenue (admin endpoint)
    router.post("/revenue/distribute", async (req, res) => {
        try {
            const { campaignId, totalRevenue } = req.body;
            const distributionId = await dasRepository.distributeRevenue(campaignId, totalRevenue);
            res.json({ distributionId });
        }
        catch (error) {
            console.error("Error distributing revenue:", error);
            res.status(500).json({ error: "Failed to distribute revenue" });
        }
    });
    // Get user payouts
    router.get("/users/:userId/payouts", async (req, res) => {
        try {
            const { limit } = req.query;
            const payouts = await dasRepository.getUserPayouts(req.params.userId, limit ? parseInt(limit) : 50);
            res.json(payouts);
        }
        catch (error) {
            console.error("Error fetching user payouts:", error);
            res.status(500).json({ error: "Failed to fetch user payouts" });
        }
    });
    // Get revenue statistics
    router.get("/revenue/stats", async (req, res) => {
        try {
            const stats = await dasRepository.getRevenueStats();
            res.json(stats);
        }
        catch (error) {
            console.error("Error fetching revenue stats:", error);
            res.status(500).json({ error: "Failed to fetch revenue stats" });
        }
    });
    // ============================================================================
    // FEEDBACK & ACCOUNTABILITY ENDPOINTS
    // ============================================================================
    // Submit brand feedback
    router.post("/feedback", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "User ID required" });
            }
            const feedback = await dasRepository.submitBrandFeedback({
                ...req.body,
                userId
            });
            res.json(feedback);
        }
        catch (error) {
            console.error("Error submitting feedback:", error);
            res.status(500).json({ error: "Failed to submit feedback" });
        }
    });
    // Report violation
    router.post("/violations", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "User ID required" });
            }
            const violation = await dasRepository.reportViolation({
                ...req.body,
                reportedBy: userId
            });
            res.json(violation);
        }
        catch (error) {
            console.error("Error reporting violation:", error);
            res.status(500).json({ error: "Failed to report violation" });
        }
    });
    // ============================================================================
    // DASHBOARD & ANALYTICS ENDPOINTS
    // ============================================================================
    // Get dashboard stats
    router.get("/dashboard/stats", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            const stats = await dasRepository.getDashboardStats(userId);
            res.json(stats);
        }
        catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(500).json({ error: "Failed to fetch dashboard stats" });
        }
    });
    // Get transparency report
    router.get("/transparency/report", async (req, res) => {
        try {
            const report = await dasRepository.getTransparencyReport();
            res.json(report);
        }
        catch (error) {
            console.error("Error fetching transparency report:", error);
            res.status(500).json({ error: "Failed to fetch transparency report" });
        }
    });
    // ============================================================================
    // AUDIT LOG ENDPOINTS
    // ============================================================================
    // Get audit log
    router.get("/audit", async (req, res) => {
        try {
            const filters = {
                eventType: req.query.eventType,
                eventCategory: req.query.eventCategory,
                actorId: req.query.actorId,
                entityType: req.query.entityType,
                entityId: req.query.entityId,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : 100
            };
            const log = await (0, dasAudit_js_1.getAuditLog)(filters);
            res.json(log);
        }
        catch (error) {
            console.error("Error fetching audit log:", error);
            res.status(500).json({ error: "Failed to fetch audit log" });
        }
    });
    // Verify audit chain
    router.get("/audit/verify", async (req, res) => {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const verification = await (0, dasAudit_js_1.verifyAuditChain)(startDate, endDate);
            res.json(verification);
        }
        catch (error) {
            console.error("Error verifying audit chain:", error);
            res.status(500).json({ error: "Failed to verify audit chain" });
        }
    });
    return router;
}
