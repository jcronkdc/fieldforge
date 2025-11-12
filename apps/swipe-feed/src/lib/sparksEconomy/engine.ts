/**
 * Sparks Economy Engine
 * Universal AI currency system with dynamic pricing and profitability optimization
 * Maintains ≥65% margin while ensuring affordability
 */

export interface SparksPricing {
  baseRate: number; // Sparks per dollar
  dynamicMultiplier: number; // Adjusted based on demand/costs
  tierMultipliers: {
    free: number;
    creator: number;
    guild: number;
    prime: number;
  };
}

export interface FeatureCost {
  featureId: string;
  name: string;
  category: 'ai' | 'compute' | 'storage' | 'network';
  baseCost: number; // in Sparks
  computeIntensity: 'low' | 'medium' | 'high' | 'extreme';
  actualCostUSD: number; // Real cost to us
  marginTarget: number; // Target margin percentage
}

export interface SparkTransaction {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'purchase' | 'spend' | 'refund' | 'bonus' | 'subscription';
  amount: number;
  balance: {
    before: number;
    after: number;
  };
  feature?: string;
  metadata?: Record<string, any>;
}

export interface UserSparksAccount {
  userId: string;
  balance: number;
  tier: 'free' | 'creator' | 'guild' | 'prime';
  monthlyAllocation: number;
  bonusBalance: number; // Non-expiring bonus sparks
  subscriptionSparks: number; // Monthly subscription sparks
  purchasedSparks: number; // Directly purchased
  spent: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface DynamicPricingModel {
  currentMargin: number;
  targetMargin: number;
  adjustmentFactor: number;
  demandMultiplier: number;
  costTrend: 'increasing' | 'stable' | 'decreasing';
  recommendations: PricingRecommendation[];
}

export interface PricingRecommendation {
  action: 'increase' | 'decrease' | 'maintain';
  feature: string;
  currentPrice: number;
  suggestedPrice: number;
  impact: {
    marginChange: number;
    userImpact: 'low' | 'medium' | 'high';
    revenueImpact: number;
  };
  reasoning: string;
}

export class SparksEconomyEngine {
  private readonly TARGET_MARGIN = 0.65; // 65% minimum
  private readonly SPARKS_PER_DOLLAR = 100; // Base conversion rate
  
  private pricing: SparksPricing;
  private featureCosts: Map<string, FeatureCost>;
  private userAccounts: Map<string, UserSparksAccount>;
  private transactions: SparkTransaction[] = [];
  private pricingModel: DynamicPricingModel;

  constructor() {
    this.pricing = this.initializePricing();
    this.featureCosts = this.initializeFeatureCosts();
    this.userAccounts = new Map();
    this.pricingModel = this.initializePricingModel();
    
    // Start dynamic pricing adjustment loop
    this.startDynamicPricingLoop();
  }

  /**
   * Initialize base pricing structure
   */
  private initializePricing(): SparksPricing {
    return {
      baseRate: this.SPARKS_PER_DOLLAR,
      dynamicMultiplier: 1.0,
      tierMultipliers: {
        free: 0.5,    // 50% fewer sparks
        creator: 1.0,  // Standard rate
        guild: 1.2,    // 20% bonus
        prime: 1.5     // 50% bonus
      }
    };
  }

  /**
   * Initialize feature cost catalog
   */
  private initializeFeatureCosts(): Map<string, FeatureCost> {
    const costs = new Map<string, FeatureCost>();
    
    // StoryForge costs
    costs.set('story_generation', {
      featureId: 'story_generation',
      name: 'Story Generation',
      category: 'ai',
      baseCost: 50,
      computeIntensity: 'high',
      actualCostUSD: 0.15,
      marginTarget: 0.70
    });
    
    costs.set('story_branch', {
      featureId: 'story_branch',
      name: 'Story Branching',
      category: 'ai',
      baseCost: 30,
      computeIntensity: 'medium',
      actualCostUSD: 0.08,
      marginTarget: 0.68
    });
    
    // SongForge costs
    costs.set('song_generation', {
      featureId: 'song_generation',
      name: 'Song Generation',
      category: 'ai',
      baseCost: 60,
      computeIntensity: 'extreme',
      actualCostUSD: 0.20,
      marginTarget: 0.70
    });
    
    costs.set('lyric_generation', {
      featureId: 'lyric_generation',
      name: 'Lyric Generation',
      category: 'ai',
      baseCost: 40,
      computeIntensity: 'medium',
      actualCostUSD: 0.10,
      marginTarget: 0.75
    });
    
    // MythaQuest costs
    costs.set('world_generation', {
      featureId: 'world_generation',
      name: 'World Generation',
      category: 'compute',
      baseCost: 100,
      computeIntensity: 'extreme',
      actualCostUSD: 0.30,
      marginTarget: 0.67
    });
    
    costs.set('character_ai', {
      featureId: 'character_ai',
      name: 'Character AI',
      category: 'ai',
      baseCost: 20,
      computeIntensity: 'low',
      actualCostUSD: 0.05,
      marginTarget: 0.75
    });
    
    costs.set('dungeon_master', {
      featureId: 'dungeon_master',
      name: 'AI Dungeon Master',
      category: 'ai',
      baseCost: 80,
      computeIntensity: 'high',
      actualCostUSD: 0.25,
      marginTarget: 0.68
    });
    
    // General features
    costs.set('image_generation', {
      featureId: 'image_generation',
      name: 'Image Generation',
      category: 'ai',
      baseCost: 75,
      computeIntensity: 'high',
      actualCostUSD: 0.22,
      marginTarget: 0.66
    });
    
    costs.set('voice_synthesis', {
      featureId: 'voice_synthesis',
      name: 'Voice Synthesis',
      category: 'ai',
      baseCost: 45,
      computeIntensity: 'medium',
      actualCostUSD: 0.12,
      marginTarget: 0.73
    });
    
    costs.set('translation', {
      featureId: 'translation',
      name: 'AI Translation',
      category: 'ai',
      baseCost: 15,
      computeIntensity: 'low',
      actualCostUSD: 0.03,
      marginTarget: 0.80
    });
    
    return costs;
  }

  /**
   * Initialize dynamic pricing model
   */
  private initializePricingModel(): DynamicPricingModel {
    return {
      currentMargin: 0.683, // Starting at 68.3%
      targetMargin: this.TARGET_MARGIN,
      adjustmentFactor: 1.0,
      demandMultiplier: 1.0,
      costTrend: 'stable',
      recommendations: []
    };
  }

  /**
   * Purchase Sparks with real money
   */
  async purchaseSparks(
    userId: string,
    amountUSD: number,
    paymentMethod: string
  ): Promise<{
    success: boolean;
    sparksAdded: number;
    newBalance: number;
    transaction: SparkTransaction;
  }> {
    const account = await this.getOrCreateAccount(userId);
    const tierMultiplier = this.pricing.tierMultipliers[account.tier];
    const sparksToAdd = Math.floor(
      amountUSD * this.SPARKS_PER_DOLLAR * tierMultiplier * this.pricing.dynamicMultiplier
    );
    
    // Apply volume bonuses
    const bonusMultiplier = this.calculateVolumeBonus(amountUSD);
    const totalSparks = Math.floor(sparksToAdd * bonusMultiplier);
    
    // Update account
    account.balance += totalSparks;
    account.purchasedSparks += totalSparks;
    
    // Create transaction
    const transaction: SparkTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date(),
      type: 'purchase',
      amount: totalSparks,
      balance: {
        before: account.balance - totalSparks,
        after: account.balance
      },
      metadata: {
        amountUSD,
        paymentMethod,
        tierMultiplier,
        bonusMultiplier
      }
    };
    
    this.transactions.push(transaction);
    this.userAccounts.set(userId, account);
    
    // Track for profitability
    await this.trackRevenue(amountUSD, 'purchase');
    
    return {
      success: true,
      sparksAdded: totalSparks,
      newBalance: account.balance,
      transaction
    };
  }

  /**
   * Spend Sparks on a feature
   */
  async spendSparks(
    userId: string,
    featureId: string,
    quantity: number = 1
  ): Promise<{
    success: boolean;
    cost: number;
    remainingBalance: number;
    transaction?: SparkTransaction;
    error?: string;
  }> {
    const account = await this.getOrCreateAccount(userId);
    const feature = this.featureCosts.get(featureId);
    
    if (!feature) {
      return {
        success: false,
        cost: 0,
        remainingBalance: account.balance,
        error: 'Invalid feature'
      };
    }
    
    // Calculate dynamic cost
    const baseCost = feature.baseCost * quantity;
    const dynamicCost = this.calculateDynamicCost(feature, account.tier);
    const totalCost = Math.ceil(baseCost * dynamicCost);
    
    // Check balance
    if (account.balance < totalCost) {
      return {
        success: false,
        cost: totalCost,
        remainingBalance: account.balance,
        error: 'Insufficient Sparks balance'
      };
    }
    
    // Check limits
    if (!this.checkSpendingLimits(account, totalCost)) {
      return {
        success: false,
        cost: totalCost,
        remainingBalance: account.balance,
        error: 'Daily/Weekly spending limit exceeded'
      };
    }
    
    // Process spending
    account.balance -= totalCost;
    account.spent.today += totalCost;
    account.spent.week += totalCost;
    account.spent.month += totalCost;
    account.spent.total += totalCost;
    
    // Create transaction
    const transaction: SparkTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date(),
      type: 'spend',
      amount: -totalCost,
      balance: {
        before: account.balance + totalCost,
        after: account.balance
      },
      feature: featureId,
      metadata: {
        quantity,
        dynamicCost,
        feature: feature.name
      }
    };
    
    this.transactions.push(transaction);
    this.userAccounts.set(userId, account);
    
    // Track for profitability
    await this.trackCost(feature.actualCostUSD * quantity, featureId);
    
    return {
      success: true,
      cost: totalCost,
      remainingBalance: account.balance,
      transaction
    };
  }

  /**
   * Grant monthly subscription Sparks
   */
  async grantSubscriptionSparks(userId: string): Promise<void> {
    const account = await this.getOrCreateAccount(userId);
    
    const monthlyAllocation = this.getMonthlyAllocation(account.tier);
    account.balance += monthlyAllocation;
    account.subscriptionSparks = monthlyAllocation;
    account.monthlyAllocation = monthlyAllocation;
    
    const transaction: SparkTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date(),
      type: 'subscription',
      amount: monthlyAllocation,
      balance: {
        before: account.balance - monthlyAllocation,
        after: account.balance
      },
      metadata: {
        tier: account.tier,
        allocation: monthlyAllocation
      }
    };
    
    this.transactions.push(transaction);
    this.userAccounts.set(userId, account);
  }

  /**
   * Get monthly Sparks allocation by tier
   */
  private getMonthlyAllocation(tier: string): number {
    const allocations = {
      free: 100,      // Very limited
      creator: 1500,  // ~$15 worth
      guild: 3500,    // ~$35 worth
      prime: 10000    // ~$100 worth
    };
    
    return allocations[tier as keyof typeof allocations] || 0;
  }

  /**
   * Calculate volume bonus for bulk purchases
   */
  private calculateVolumeBonus(amountUSD: number): number {
    if (amountUSD >= 100) return 1.25;  // 25% bonus
    if (amountUSD >= 50) return 1.15;   // 15% bonus
    if (amountUSD >= 25) return 1.08;   // 8% bonus
    if (amountUSD >= 10) return 1.03;   // 3% bonus
    return 1.0;
  }

  /**
   * Calculate dynamic cost based on current system state
   */
  private calculateDynamicCost(feature: FeatureCost, tier: string): number {
    let multiplier = 1.0;
    
    // Apply tier discount
    const tierDiscounts = {
      free: 1.2,     // 20% more expensive
      creator: 1.0,  // Base price
      guild: 0.9,    // 10% discount
      prime: 0.75    // 25% discount
    };
    
    multiplier *= tierDiscounts[tier as keyof typeof tierDiscounts] || 1.0;
    
    // Apply demand-based pricing
    multiplier *= this.pricingModel.demandMultiplier;
    
    // Apply margin protection
    if (this.pricingModel.currentMargin < this.TARGET_MARGIN) {
      multiplier *= 1.1; // Increase prices if margin is low
    }
    
    // Apply compute intensity factor
    const intensityFactors = {
      low: 0.9,
      medium: 1.0,
      high: 1.15,
      extreme: 1.3
    };
    
    multiplier *= intensityFactors[feature.computeIntensity] || 1.0;
    
    return multiplier;
  }

  /**
   * Check if user is within spending limits
   */
  private checkSpendingLimits(account: UserSparksAccount, cost: number): boolean {
    if (account.spent.today + cost > account.limits.daily) return false;
    if (account.spent.week + cost > account.limits.weekly) return false;
    if (account.spent.month + cost > account.limits.monthly) return false;
    return true;
  }

  /**
   * Get or create user Sparks account
   */
  private async getOrCreateAccount(userId: string): Promise<UserSparksAccount> {
    let account = this.userAccounts.get(userId);
    
    if (!account) {
      // Fetch user tier from database (mock for now)
      const tier = await this.getUserTier(userId);
      
      account = {
        userId,
        balance: 0,
        tier,
        monthlyAllocation: this.getMonthlyAllocation(tier),
        bonusBalance: 0,
        subscriptionSparks: 0,
        purchasedSparks: 0,
        spent: {
          today: 0,
          week: 0,
          month: 0,
          total: 0
        },
        limits: this.getSpendingLimits(tier)
      };
      
      this.userAccounts.set(userId, account);
    }
    
    return account;
  }

  /**
   * Get user tier (mock implementation)
   */
  private async getUserTier(userId: string): Promise<'free' | 'creator' | 'guild' | 'prime'> {
    // In production, fetch from database
    return 'creator';
  }

  /**
   * Get spending limits by tier
   */
  private getSpendingLimits(tier: string): { daily: number; weekly: number; monthly: number } {
    const limits = {
      free: { daily: 50, weekly: 200, monthly: 500 },
      creator: { daily: 500, weekly: 2000, monthly: 5000 },
      guild: { daily: 1000, weekly: 5000, monthly: 15000 },
      prime: { daily: -1, weekly: -1, monthly: -1 } // Unlimited
    };
    
    return limits[tier as keyof typeof limits] || limits.free;
  }

  /**
   * Track revenue for profitability
   */
  private async trackRevenue(amountUSD: number, source: string): Promise<void> {
    // Update profitability metrics
    console.log(`Revenue tracked: $${amountUSD} from ${source}`);
    
    // In production, update database and analytics
  }

  /**
   * Track costs for profitability
   */
  private async trackCost(costUSD: number, feature: string): Promise<void> {
    // Update profitability metrics
    console.log(`Cost tracked: $${costUSD} for ${feature}`);
    
    // Calculate current margin
    this.updateCurrentMargin();
  }

  /**
   * Update current margin calculation
   */
  private updateCurrentMargin(): void {
    // In production, calculate from actual revenue and costs
    // For now, simulate
    const revenue = 10000; // Mock monthly revenue
    const costs = 3170;    // Mock monthly costs
    
    this.pricingModel.currentMargin = (revenue - costs) / revenue;
    
    // Generate recommendations if margin is below target
    if (this.pricingModel.currentMargin < this.TARGET_MARGIN) {
      this.generatePricingRecommendations();
    }
  }

  /**
   * Generate pricing recommendations
   */
  private generatePricingRecommendations(): void {
    this.pricingModel.recommendations = [];
    
    // Analyze each feature's profitability
    this.featureCosts.forEach((feature, featureId) => {
      const currentMargin = this.calculateFeatureMargin(feature);
      
      if (currentMargin < feature.marginTarget) {
        const suggestedPrice = feature.baseCost * (feature.marginTarget / currentMargin);
        
        this.pricingModel.recommendations.push({
          action: 'increase',
          feature: feature.name,
          currentPrice: feature.baseCost,
          suggestedPrice: Math.ceil(suggestedPrice),
          impact: {
            marginChange: feature.marginTarget - currentMargin,
            userImpact: suggestedPrice / feature.baseCost > 1.2 ? 'high' : 'medium',
            revenueImpact: (suggestedPrice - feature.baseCost) * 1000 // Estimated monthly
          },
          reasoning: `Current margin ${(currentMargin * 100).toFixed(1)}% below target ${(feature.marginTarget * 100).toFixed(1)}%`
        });
      }
    });
  }

  /**
   * Calculate margin for a specific feature
   */
  private calculateFeatureMargin(feature: FeatureCost): number {
    const revenuePerUse = feature.baseCost / this.SPARKS_PER_DOLLAR;
    const margin = (revenuePerUse - feature.actualCostUSD) / revenuePerUse;
    return margin;
  }

  /**
   * Start dynamic pricing adjustment loop
   */
  private startDynamicPricingLoop(): void {
    // Run every hour
    setInterval(() => {
      this.adjustDynamicPricing();
    }, 60 * 60 * 1000);
    
    // Initial adjustment
    this.adjustDynamicPricing();
  }

  /**
   * Adjust dynamic pricing based on current metrics
   */
  private adjustDynamicPricing(): void {
    console.log('🔄 Adjusting dynamic pricing');
    
    // Update margin calculation
    this.updateCurrentMargin();
    
    // Adjust multiplier based on margin
    if (this.pricingModel.currentMargin < this.TARGET_MARGIN) {
      // Increase prices gradually
      this.pricing.dynamicMultiplier = Math.min(1.5, this.pricing.dynamicMultiplier * 1.02);
      this.pricingModel.adjustmentFactor = 1.02;
    } else if (this.pricingModel.currentMargin > this.TARGET_MARGIN + 0.1) {
      // Can afford to decrease prices slightly for growth
      this.pricing.dynamicMultiplier = Math.max(0.8, this.pricing.dynamicMultiplier * 0.98);
      this.pricingModel.adjustmentFactor = 0.98;
    }
    
    // Update demand multiplier based on usage patterns
    this.updateDemandMultiplier();
    
    console.log(`Current margin: ${(this.pricingModel.currentMargin * 100).toFixed(1)}%`);
    console.log(`Dynamic multiplier: ${this.pricing.dynamicMultiplier.toFixed(2)}`);
  }

  /**
   * Update demand multiplier based on usage
   */
  private updateDemandMultiplier(): void {
    // In production, analyze actual usage patterns
    // For now, simulate based on time of day
    const hour = new Date().getHours();
    
    if (hour >= 18 && hour <= 22) {
      // Peak hours
      this.pricingModel.demandMultiplier = 1.15;
    } else if (hour >= 2 && hour <= 6) {
      // Off-peak
      this.pricingModel.demandMultiplier = 0.85;
    } else {
      // Normal
      this.pricingModel.demandMultiplier = 1.0;
    }
  }

  /**
   * Get current pricing for a feature
   */
  getFeaturePrice(featureId: string, tier: string = 'creator'): number {
    const feature = this.featureCosts.get(featureId);
    if (!feature) return 0;
    
    const dynamicCost = this.calculateDynamicCost(feature, tier);
    return Math.ceil(feature.baseCost * dynamicCost);
  }

  /**
   * Get user's current balance
   */
  async getUserBalance(userId: string): Promise<number> {
    const account = await this.getOrCreateAccount(userId);
    return account.balance;
  }

  /**
   * Get pricing recommendations
   */
  getPricingRecommendations(): PricingRecommendation[] {
    return this.pricingModel.recommendations;
  }

  /**
   * Get current profitability metrics
   */
  getProfitabilityMetrics(): {
    currentMargin: number;
    targetMargin: number;
    status: 'healthy' | 'warning' | 'critical';
    recommendations: number;
  } {
    const status = 
      this.pricingModel.currentMargin >= this.TARGET_MARGIN ? 'healthy' :
      this.pricingModel.currentMargin >= this.TARGET_MARGIN - 0.05 ? 'warning' :
      'critical';
    
    return {
      currentMargin: this.pricingModel.currentMargin,
      targetMargin: this.TARGET_MARGIN,
      status,
      recommendations: this.pricingModel.recommendations.length
    };
  }

  /**
   * Export transaction history
   */
  exportTransactions(userId?: string, dateRange?: { start: Date; end: Date }): SparkTransaction[] {
    let transactions = [...this.transactions];
    
    if (userId) {
      transactions = transactions.filter(t => t.userId === userId);
    }
    
    if (dateRange) {
      transactions = transactions.filter(t => 
        t.timestamp >= dateRange.start && t.timestamp <= dateRange.end
      );
    }
    
    return transactions;
  }
}

// Export singleton instance
export const sparksEconomy = new SparksEconomyEngine();
