/**
 * Beta Testing Routes
 * Endpoints for beta user management and Spark bonuses
 */

import { Router } from "express";
import {
  canRegisterNewUser,
  getBetaStatus,
  grantDailyLoginBonus,
  getBetaUserInfo,
  processReferralBonus,
  getBetaLeaderboard,
  checkBetaUserLimit,
  updateActivityScore
} from "./betaRepository.js";
import { authenticateRequest } from "../middleware/auth.js";

const router = Router();

/**
 * Check if registration is allowed (under 100 users)
 */
router.get("/can-register", async (req, res) => {
  try {
    const canRegister = await canRegisterNewUser();
    const limit = await checkBetaUserLimit();
    
    res.json({
      ...limit,
      allowed: canRegister && limit.allowed
    });
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ 
      error: "Failed to check registration status",
      allowed: false,
      message: "Registration check failed. Please try again."
    });
  }
});

/**
 * Get beta testing status and metrics
 */
router.get("/status", async (req, res) => {
  try {
    const status = await getBetaStatus();
    res.json(status);
  } catch (error) {
    console.error("Error getting beta status:", error);
    res.status(500).json({ error: "Failed to get beta status" });
  }
});

/**
 * Claim daily login bonus
 */
router.post("/daily-bonus", authenticateRequest, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const bonusAmount = await grantDailyLoginBonus(userId);
    
    if (bonusAmount === 0) {
      return res.json({
        success: false,
        message: "Daily bonus already claimed today!",
        bonusAmount: 0
      });
    }
    
    // Track activity
    await updateActivityScore(userId, "daily_login", 5);
    
    res.json({
      success: true,
      message: `Daily bonus claimed! +${bonusAmount} ✨ Sparks`,
      bonusAmount
    });
  } catch (error) {
    console.error("Error granting daily bonus:", error);
    res.status(500).json({ error: "Failed to grant daily bonus" });
  }
});

/**
 * Get beta user info
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userInfo = await getBetaUserInfo(userId);
    
    if (!userInfo) {
      return res.status(404).json({ error: "Beta user not found" });
    }
    
    res.json(userInfo);
  } catch (error) {
    console.error("Error getting beta user info:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

/**
 * Process referral code
 */
router.post("/referral", async (req, res) => {
  try {
    const { referralCode, userId } = req.body;
    
    if (!referralCode || !userId) {
      return res.status(400).json({ 
        error: "Referral code and user ID required" 
      });
    }
    
    const success = await processReferralBonus(referralCode, userId);
    
    if (!success) {
      return res.json({
        success: false,
        message: "Invalid referral code"
      });
    }
    
    // Track activity
    await updateActivityScore(userId, "referral_used", 10);
    
    res.json({
      success: true,
      message: "Referral bonus applied! You and your friend both received bonus Sparks!"
    });
  } catch (error) {
    console.error("Error processing referral:", error);
    res.status(500).json({ error: "Failed to process referral" });
  }
});

/**
 * Get beta leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await getBetaLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

/**
 * Track feature usage
 */
router.post("/track-activity", async (req, res) => {
  try {
    const { userId, action, points = 1 } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({ 
        error: "User ID and action required" 
      });
    }
    
    await updateActivityScore(userId, action, points);
    
    res.json({
      success: true,
      message: "Activity tracked"
    });
  } catch (error) {
    console.error("Error tracking activity:", error);
    res.status(500).json({ error: "Failed to track activity" });
  }
});

export default router;
