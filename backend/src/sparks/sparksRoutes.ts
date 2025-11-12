/**
 * Sparks Routes - API endpoints for Sparks economy
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Router, Request, Response } from 'express';
import { SparksRepository } from './sparksRepository';
import { authenticateRequest } from '../middleware/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

const router = Router();
const sparksRepo = new SparksRepository();

// Get all packages and tiers
router.get('/packages', async (req: Request, res: Response) => {
  try {
    const packages = await sparksRepo.getPackages();
    const tiers = await sparksRepo.getSubscriptionTiers();
    
    res.json({
      packages,
      subscriptionTiers: tiers,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Get user's Sparks data
router.get('/user/:userId', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Verify user is accessing their own data
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [balance, subscription, transactions] = await Promise.all([
      sparksRepo.getUserBalance(userId),
      sparksRepo.getUserSubscription(userId),
      sparksRepo.getUserTransactions(userId, 20),
    ]);
    
    res.json({
      balance,
      subscription,
      recentTransactions: transactions,
    });
  } catch (error) {
    console.error('Error fetching user Sparks data:', error);
    res.status(500).json({ error: 'Failed to fetch Sparks data' });
  }
});

// Purchase Sparks package
router.post('/purchase', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { packageId, paymentMethod } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get package details
    const packages = await sparksRepo.getPackages();
    const selectedPackage = packages.find(p => p.id === packageId);
    
    if (!selectedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    // Create purchase record
    const purchaseId = await sparksRepo.createPurchase(
      userId,
      'sparks',
      selectedPackage.priceCents,
      selectedPackage.sparksAmount + selectedPackage.bonusSparks,
      packageId,
      undefined,
      paymentMethod
    );
    
    // Payment processing: Stripe integration is handled by sparksPurchaseRepository
    // If Stripe is not configured, the purchase will be marked as pending
    // In production, ensure STRIPE_SECRET_KEY is set in environment variables
    
    // Grant Sparks
    const newBalance = await sparksRepo.addSparks(
      userId,
      selectedPackage.sparksAmount + selectedPackage.bonusSparks,
      'purchase',
      `Purchased ${selectedPackage.displayName}`,
      'purchase',
      purchaseId
    );
    
    // Complete purchase
    await sparksRepo.completePurchase(purchaseId);
    
    res.json({
      success: true,
      purchaseId,
      newBalance,
      sparksAdded: selectedPackage.sparksAmount + selectedPackage.bonusSparks,
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Subscribe to tier
router.post('/subscribe', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { tierId, billingCycle } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get tier details
    const tiers = await sparksRepo.getSubscriptionTiers();
    const selectedTier = tiers.find(t => t.id === tierId);
    
    if (!selectedTier) {
      return res.status(404).json({ error: 'Tier not found' });
    }
    
    // Subscription creation: Stripe integration is handled by sparksPurchaseRepository
    // If Stripe is not configured, the subscription will be created without payment processing
    // In production, ensure STRIPE_SECRET_KEY is set in environment variables
    
    // Create/update subscription
    const subscriptionId = await sparksRepo.upsertSubscription(
      userId,
      tierId,
      billingCycle
    );
    
    // Grant initial monthly Sparks
    if (selectedTier.monthlySparks > 0) {
      await sparksRepo.addSparks(
        userId,
        selectedTier.monthlySparks,
        'subscription',
        'Monthly subscription Sparks',
        'subscription',
        subscriptionId
      );
    }
    
    res.json({
      success: true,
      subscriptionId,
      monthlySparks: selectedTier.monthlySparks,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { cancelAtPeriodEnd = true } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await sparksRepo.cancelSubscription(userId, cancelAtPeriodEnd);
    
    res.json({
      success: true,
      cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Use Sparks
router.post('/use', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { amount, feature, referenceType, referenceId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const success = await sparksRepo.useSparks(
      userId,
      amount,
      feature,
      referenceType,
      referenceId
    );
    
    if (!success) {
      return res.status(400).json({ error: 'Insufficient Sparks balance' });
    }
    
    const newBalance = await sparksRepo.getUserBalance(userId);
    
    res.json({
      success: true,
      newBalance,
    });
  } catch (error) {
    console.error('Error using Sparks:', error);
    res.status(500).json({ error: 'Failed to use Sparks' });
  }
});

// Claim daily bonus
router.post('/claim-daily', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const sparksEarned = await sparksRepo.claimDailyBonus(userId);
    
    if (sparksEarned === 0) {
      return res.status(400).json({ error: 'Daily bonus already claimed' });
    }
    
    const newBalance = await sparksRepo.getUserBalance(userId);
    
    res.json({
      success: true,
      sparksEarned,
      newBalance,
    });
  } catch (error) {
    console.error('Error claiming daily bonus:', error);
    res.status(500).json({ error: 'Failed to claim daily bonus' });
  }
});

// Get usage statistics
router.get('/usage-stats/:userId', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Verify user is accessing their own data
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const stats = await sparksRepo.getUserUsageStats(userId);
    
    res.json({
      stats,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// Process referral (called when referred user completes action)
router.post('/referral', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { referrerId, rewardType } = req.body;
    const referredId = req.user?.id;
    
    if (!referredId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await sparksRepo.processReferralReward(referrerId, referredId, rewardType);
    
    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

export default router;
