/**
 * Spark Ecosystem Integration
 * Seamless continuity with StoryForge and Mask Framework
 * Spark chat recognizes project context and injects creative prompts
 */

import type {
  Song,
  CollaborationSession,
  MaskPersonality,
  SparkContext,
  SparkPrompt,
  SparkSuggestion,
  SparkTransaction,
  SparkBalance
} from './types';

export class SparkIntegration {
  private sparkBalance: Map<string, SparkBalance> = new Map();
  private sparkTransactions: Map<string, SparkTransaction[]> = new Map();
  private contextCache: Map<string, SparkContext> = new Map();
  private activePrompts: Map<string, SparkPrompt[]> = new Map();
  private maskIntegration: MaskFrameworkIntegration;
  private storyForgeConnector: StoryForgeConnector;
  private sparkAI: SparkAIEngine;
  private sparkEconomy: SparkEconomyManager;

  constructor() {
    this.maskIntegration = new MaskFrameworkIntegration();
    this.storyForgeConnector = new StoryForgeConnector();
    this.sparkAI = new SparkAIEngine();
    this.sparkEconomy = new SparkEconomyManager();
    this.initializeSparkSystem();
  }

  /**
   * Core Spark Integration
   */

  async initializeSparkForUser(userId: string): Promise<void> {
    // Initialize Spark balance
    if (!this.sparkBalance.has(userId)) {
      const balance = await this.sparkEconomy.getBalance(userId);
      this.sparkBalance.set(userId, balance);
    }

    // Load user's Mask preferences
    await this.maskIntegration.loadUserMasks(userId);

    // Connect to StoryForge if available
    await this.storyForgeConnector.establishConnection(userId);

    // Initialize AI context
    await this.sparkAI.initializeUserContext(userId);
  }

  /**
   * Context-Aware Spark Chat
   */

  async processSparkChat(
    userId: string,
    message: string,
    context: {
      songId?: string;
      sessionId?: string;
      sectionId?: string;
      lineId?: string;
      currentMask?: string;
      collaborators?: string[];
    }
  ): Promise<SparkChatResponse> {
    // Build comprehensive context
    const fullContext = await this.buildContext(userId, context);

    // Check Spark balance for AI features
    const cost = await this.calculateSparkCost('chat', fullContext);
    if (!await this.canAfford(userId, cost)) {
      return {
        success: false,
        message: 'Insufficient Sparks. Please purchase more to continue.',
        sparkCost: cost,
        balance: this.sparkBalance.get(userId)?.available || 0
      };
    }

    // Process with AI
    const response = await this.sparkAI.processChat(message, fullContext);

    // Generate suggestions based on context
    const suggestions = await this.generateContextualSuggestions(fullContext, response);

    // Deduct Sparks
    await this.deductSparks(userId, cost, 'chat', { message, context });

    // Cache context for future use
    this.contextCache.set(`${userId}_${context.songId || 'global'}`, fullContext);

    return {
      success: true,
      message: response.message,
      suggestions,
      sparkCost: cost,
      balance: this.sparkBalance.get(userId)?.available || 0,
      relatedContent: await this.findRelatedContent(fullContext),
      prompts: await this.generateCreativePrompts(fullContext)
    };
  }

  /**
   * Creative Prompt Injection
   */

  async generateCreativePrompts(context: SparkContext): Promise<SparkPrompt[]> {
    const prompts: SparkPrompt[] = [];

    // Genre-specific prompts
    if (context.song?.genre) {
      const genrePrompts = await this.getGenrePrompts(context.song.genre);
      prompts.push(...genrePrompts);
    }

    // Mood-based prompts
    if (context.song?.mood) {
      const moodPrompts = await this.getMoodPrompts(context.song.mood);
      prompts.push(...moodPrompts);
    }

    // Collaboration prompts
    if (context.collaborators && context.collaborators.length > 0) {
      const collabPrompts = await this.getCollaborationPrompts(context.collaborators);
      prompts.push(...collabPrompts);
    }

    // StoryForge crossover prompts
    if (context.storyForgeConnection) {
      const storyPrompts = await this.storyForgeConnector.getCrossoverPrompts(context);
      prompts.push(...storyPrompts);
    }

    // Mask-influenced prompts
    if (context.activeMask) {
      const maskPrompts = await this.maskIntegration.getMaskPrompts(context.activeMask);
      prompts.push(...maskPrompts);
    }

    // Time-based prompts (trending, seasonal)
    const timePrompts = await this.getTimeBasedPrompts();
    prompts.push(...timePrompts);

    // Personalized prompts based on user history
    const personalizedPrompts = await this.getPersonalizedPrompts(context.userId);
    prompts.push(...personalizedPrompts);

    return this.rankAndFilterPrompts(prompts, context);
  }

  async injectPromptIntoSession(
    sessionId: string,
    prompt: SparkPrompt
  ): Promise<void> {
    // Add prompt to active session
    if (!this.activePrompts.has(sessionId)) {
      this.activePrompts.set(sessionId, []);
    }

    this.activePrompts.get(sessionId)!.push({
      ...prompt,
      injectedAt: Date.now(),
      status: 'active'
    });

    // Notify session participants
    await this.notifySessionParticipants(sessionId, {
      type: 'prompt_injected',
      prompt
    });
  }

  /**
   * Mask Framework Integration
   */

  async applyMaskToGeneration(
    content: string,
    maskId: string,
    intensity: number = 0.7
  ): Promise<MaskGenerationResult> {
    const mask = await this.maskIntegration.getMask(maskId);
    if (!mask) {
      throw new Error('Mask not found');
    }

    // Apply mask personality to content
    const maskedContent = await this.maskIntegration.applyPersonality(
      content,
      mask,
      intensity
    );

    // Adjust based on mask traits
    const adjustedContent = await this.adjustMaskTraits(maskedContent, mask);

    return {
      original: content,
      masked: adjustedContent,
      maskId,
      intensity,
      traits: mask.traits,
      sparkCost: await this.calculateSparkCost('mask_application', { maskId, intensity })
    };
  }

  async enableDualMaskMode(
    primaryMaskId: string,
    secondaryMaskId: string,
    blendRatio: number = 0.5
  ): Promise<DualMaskConfig> {
    const primaryMask = await this.maskIntegration.getMask(primaryMaskId);
    const secondaryMask = await this.maskIntegration.getMask(secondaryMaskId);

    if (!primaryMask || !secondaryMask) {
      throw new Error('One or both masks not found');
    }

    return {
      primary: primaryMask,
      secondary: secondaryMask,
      blendRatio,
      combinedTraits: this.blendMaskTraits(primaryMask, secondaryMask, blendRatio),
      sparkCost: await this.calculateSparkCost('dual_mask', { primaryMaskId, secondaryMaskId })
    };
  }

  /**
   * StoryForge Connection
   */

  async connectToStoryForge(
    songId: string,
    storyId: string,
    connectionType: 'soundtrack' | 'inspiration' | 'adaptation'
  ): Promise<StoryForgeConnection> {
    const connection = await this.storyForgeConnector.createConnection(
      songId,
      storyId,
      connectionType
    );

    // Import relevant story elements
    if (connectionType === 'soundtrack') {
      await this.importStoryMood(storyId, songId);
    } else if (connectionType === 'inspiration') {
      await this.importStoryThemes(storyId, songId);
    } else if (connectionType === 'adaptation') {
      await this.importStoryStructure(storyId, songId);
    }

    // Generate connection-specific prompts
    const prompts = await this.storyForgeConnector.generateConnectionPrompts(connection);

    return {
      id: connection.id,
      songId,
      storyId,
      type: connectionType,
      elements: connection.importedElements,
      prompts,
      sparkCost: await this.calculateSparkCost('storyforge_connection', { connectionType })
    };
  }

  async syncWithStoryForge(songId: string): Promise<SyncResult> {
    const connections = await this.storyForgeConnector.getConnections(songId);
    const updates: any[] = [];

    for (const connection of connections) {
      // Check for story updates
      const storyUpdates = await this.storyForgeConnector.getUpdates(connection.storyId);
      
      if (storyUpdates.length > 0) {
        // Apply relevant updates to song
        for (const update of storyUpdates) {
          if (this.shouldApplyUpdate(update, connection)) {
            await this.applyStoryUpdate(songId, update);
            updates.push(update);
          }
        }
      }
    }

    return {
      connectionsChecked: connections.length,
      updatesApplied: updates.length,
      updates,
      sparkCost: 0 // Sync is free to encourage cross-platform use
    };
  }

  /**
   * Dashboard Integration
   */

  async getDashboardSparkData(userId: string): Promise<SparkDashboardData> {
    const balance = this.sparkBalance.get(userId) || await this.sparkEconomy.getBalance(userId);
    const transactions = this.sparkTransactions.get(userId) || [];
    const usage = await this.calculateSparkUsage(userId, 30); // Last 30 days

    return {
      balance: {
        available: balance.available,
        pending: balance.pending,
        lifetime: balance.lifetime,
        tier: balance.tier
      },
      usage: {
        daily: usage.daily,
        weekly: usage.weekly,
        monthly: usage.monthly,
        byFeature: usage.byFeature,
        trend: usage.trend
      },
      transactions: transactions.slice(0, 10), // Last 10 transactions
      recommendations: await this.getSparkRecommendations(userId),
      offers: await this.sparkEconomy.getActiveOffers(userId)
    };
  }

  async notifySparkEvent(
    userId: string,
    event: {
      type: 'earned' | 'spent' | 'bonus' | 'refund';
      amount: number;
      source: string;
      description: string;
    }
  ): Promise<void> {
    // Update balance
    const balance = this.sparkBalance.get(userId)!;
    
    if (event.type === 'earned' || event.type === 'bonus' || event.type === 'refund') {
      balance.available += event.amount;
    } else if (event.type === 'spent') {
      balance.available -= event.amount;
    }

    balance.lifetime += event.type === 'earned' || event.type === 'bonus' ? event.amount : 0;

    // Record transaction
    const transaction: SparkTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: event.type,
      amount: event.amount,
      source: event.source,
      description: event.description,
      timestamp: Date.now(),
      balance: balance.available
    };

    if (!this.sparkTransactions.has(userId)) {
      this.sparkTransactions.set(userId, []);
    }
    this.sparkTransactions.get(userId)!.unshift(transaction);

    // Send notification
    await this.sendSparkNotification(userId, event);
  }

  /**
   * Spark Economy Management
   */

  async calculateSparkCost(
    feature: string,
    context?: any
  ): Promise<number> {
    const baseCosts: Record<string, number> = {
      'chat': 1,
      'ai_generation': 5,
      'mask_application': 3,
      'dual_mask': 5,
      'voice_synthesis': 10,
      'collaboration_boost': 2,
      'remix_creation': 3,
      'storyforge_connection': 5,
      'export_professional': 15,
      'export_master': 25
    };

    let cost = baseCosts[feature] || 1;

    // Apply context modifiers
    if (context) {
      if (context.intensity) {
        cost *= context.intensity;
      }
      if (context.quality === 'high') {
        cost *= 1.5;
      }
      if (context.quality === 'premium') {
        cost *= 2;
      }
      if (context.rush) {
        cost *= 1.3;
      }
    }

    // Apply user tier discount
    const userTier = await this.getUserTier(context?.userId);
    const discounts: Record<string, number> = {
      'free': 1.0,
      'creator': 0.9,
      'pro': 0.8,
      'studio': 0.7
    };
    cost *= discounts[userTier] || 1.0;

    return Math.ceil(cost);
  }

  async canAfford(userId: string, cost: number): Promise<boolean> {
    const balance = this.sparkBalance.get(userId);
    return balance ? balance.available >= cost : false;
  }

  async deductSparks(
    userId: string,
    amount: number,
    feature: string,
    metadata?: any
  ): Promise<boolean> {
    const balance = this.sparkBalance.get(userId);
    if (!balance || balance.available < amount) {
      return false;
    }

    balance.available -= amount;

    // Record transaction
    await this.notifySparkEvent(userId, {
      type: 'spent',
      amount,
      source: feature,
      description: `Used ${amount} Sparks for ${feature}`
    });

    // Track usage analytics
    await this.sparkEconomy.trackUsage(userId, feature, amount, metadata);

    return true;
  }

  async purchaseSparks(
    userId: string,
    packageId: string,
    paymentMethod: string
  ): Promise<PurchaseResult> {
    const result = await this.sparkEconomy.processPurchase(
      userId,
      packageId,
      paymentMethod
    );

    if (result.success) {
      // Update balance
      const balance = this.sparkBalance.get(userId)!;
      balance.available += result.sparksAdded;
      balance.lifetime += result.sparksAdded;

      // Record transaction
      await this.notifySparkEvent(userId, {
        type: 'earned',
        amount: result.sparksAdded,
        source: 'purchase',
        description: `Purchased ${result.sparksAdded} Sparks`
      });

      // Apply any bonuses
      if (result.bonus > 0) {
        await this.notifySparkEvent(userId, {
          type: 'bonus',
          amount: result.bonus,
          source: 'purchase_bonus',
          description: `Bonus ${result.bonus} Sparks`
        });
      }
    }

    return result;
  }

  // Helper methods

  private async initializeSparkSystem() {
    // Initialize Spark economy system
    await this.sparkEconomy.initialize();
    
    // Setup periodic balance sync
    setInterval(() => {
      this.syncAllBalances();
    }, 60000); // Every minute
  }

  private async buildContext(userId: string, context: any): Promise<SparkContext> {
    return {
      userId,
      songId: context.songId,
      sessionId: context.sessionId,
      song: context.songId ? await this.getSong(context.songId) : undefined,
      collaborators: context.collaborators,
      activeMask: context.currentMask,
      storyForgeConnection: await this.storyForgeConnector.hasConnection(context.songId),
      timestamp: Date.now()
    };
  }

  private async generateContextualSuggestions(
    context: SparkContext,
    response: any
  ): Promise<SparkSuggestion[]> {
    const suggestions: SparkSuggestion[] = [];

    // Generate based on context
    if (context.song) {
      // Song-specific suggestions
      if (!context.song.sections || context.song.sections.length === 0) {
        suggestions.push({
          id: `sug_${Date.now()}_1`,
          type: 'structure',
          target: 'song',
          content: 'Add a verse-chorus structure to get started',
          confidence: 0.9,
          reasoning: 'Songs typically start with structure'
        });
      }
    }

    return suggestions;
  }

  private async findRelatedContent(context: SparkContext): Promise<any[]> {
    const related = [];

    // Find related songs
    if (context.song?.genre) {
      const similarSongs = await this.findSimilarSongs(context.song.genre);
      related.push(...similarSongs);
    }

    // Find related stories if connected
    if (context.storyForgeConnection) {
      const relatedStories = await this.storyForgeConnector.findRelated(context.songId);
      related.push(...relatedStories);
    }

    return related;
  }

  private async getGenrePrompts(genre: string): Promise<SparkPrompt[]> {
    // Genre-specific prompts
    const prompts: Record<string, SparkPrompt[]> = {
      'pop': [
        {
          id: 'pop_1',
          text: 'Try a catchy hook that repeats',
          category: 'structure',
          relevance: 0.9
        }
      ],
      'rock': [
        {
          id: 'rock_1',
          text: 'Add a powerful guitar solo section',
          category: 'arrangement',
          relevance: 0.85
        }
      ]
    };

    return prompts[genre.toLowerCase()] || [];
  }

  private async getMoodPrompts(mood: string): Promise<SparkPrompt[]> {
    // Mood-based prompts
    return [];
  }

  private async getCollaborationPrompts(collaborators: string[]): Promise<SparkPrompt[]> {
    // Collaboration-specific prompts
    return [
      {
        id: 'collab_1',
        text: `With ${collaborators.length} collaborators, consider dividing sections`,
        category: 'collaboration',
        relevance: 0.8
      }
    ];
  }

  private async getTimeBasedPrompts(): Promise<SparkPrompt[]> {
    // Seasonal/trending prompts
    const month = new Date().getMonth();
    const prompts: SparkPrompt[] = [];

    if (month === 11) { // December
      prompts.push({
        id: 'seasonal_1',
        text: 'Consider a holiday theme',
        category: 'seasonal',
        relevance: 0.7
      });
    }

    return prompts;
  }

  private async getPersonalizedPrompts(userId: string): Promise<SparkPrompt[]> {
    // User history-based prompts
    return [];
  }

  private rankAndFilterPrompts(
    prompts: SparkPrompt[],
    context: SparkContext
  ): SparkPrompt[] {
    // Rank by relevance and filter
    return prompts
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 5); // Top 5 prompts
  }

  private async notifySessionParticipants(sessionId: string, notification: any) {
    // Send notification to session participants
  }

  private async adjustMaskTraits(content: string, mask: MaskPersonality): Promise<string> {
    // Apply mask personality traits to content
    return content; // Placeholder
  }

  private blendMaskTraits(
    primary: MaskPersonality,
    secondary: MaskPersonality,
    ratio: number
  ): any {
    // Blend traits from two masks
    return {};
  }

  private async importStoryMood(storyId: string, songId: string) {
    // Import mood from story
  }

  private async importStoryThemes(storyId: string, songId: string) {
    // Import themes from story
  }

  private async importStoryStructure(storyId: string, songId: string) {
    // Import structure from story
  }

  private shouldApplyUpdate(update: any, connection: any): boolean {
    // Determine if story update should affect song
    return true;
  }

  private async applyStoryUpdate(songId: string, update: any) {
    // Apply story update to song
  }

  private async calculateSparkUsage(userId: string, days: number): Promise<any> {
    // Calculate Spark usage statistics
    return {
      daily: 10,
      weekly: 70,
      monthly: 300,
      byFeature: {},
      trend: 'increasing'
    };
  }

  private async getSparkRecommendations(userId: string): Promise<string[]> {
    // Generate Spark usage recommendations
    return [
      'Use dual masks for more creative output',
      'Connect to StoryForge for narrative inspiration'
    ];
  }

  private async sendSparkNotification(userId: string, event: any) {
    // Send Spark-related notification
  }

  private async getUserTier(userId: string): Promise<string> {
    // Get user subscription tier
    return 'creator';
  }

  private async syncAllBalances() {
    // Sync all user balances with backend
    for (const [userId, balance] of this.sparkBalance) {
      const latestBalance = await this.sparkEconomy.getBalance(userId);
      if (latestBalance.available !== balance.available) {
        this.sparkBalance.set(userId, latestBalance);
      }
    }
  }

  private async getSong(songId: string): Promise<Song | undefined> {
    // Get song data
    return undefined; // Placeholder
  }

  private async findSimilarSongs(genre: string): Promise<any[]> {
    // Find similar songs by genre
    return [];
  }
}

// Supporting classes

class MaskFrameworkIntegration {
  private masks: Map<string, MaskPersonality> = new Map();
  private userMasks: Map<string, string[]> = new Map();

  async loadUserMasks(userId: string) {
    // Load user's available masks
  }

  async getMask(maskId: string): Promise<MaskPersonality | undefined> {
    return this.masks.get(maskId);
  }

  async applyPersonality(
    content: string,
    mask: MaskPersonality,
    intensity: number
  ): Promise<string> {
    // Apply mask personality to content
    return content; // Placeholder
  }

  async getMaskPrompts(maskId: string): Promise<SparkPrompt[]> {
    // Get mask-specific prompts
    return [];
  }
}

class StoryForgeConnector {
  private connections: Map<string, any> = new Map();

  async establishConnection(userId: string) {
    // Connect to StoryForge
  }

  async createConnection(
    songId: string,
    storyId: string,
    type: string
  ): Promise<any> {
    return {
      id: `conn_${Date.now()}`,
      songId,
      storyId,
      type,
      importedElements: []
    };
  }

  async getCrossoverPrompts(context: SparkContext): Promise<SparkPrompt[]> {
    // Get StoryForge crossover prompts
    return [];
  }

  async generateConnectionPrompts(connection: any): Promise<SparkPrompt[]> {
    // Generate connection-specific prompts
    return [];
  }

  async getConnections(songId: string): Promise<any[]> {
    // Get all connections for a song
    return [];
  }

  async getUpdates(storyId: string): Promise<any[]> {
    // Get story updates
    return [];
  }

  async hasConnection(songId?: string): Promise<boolean> {
    // Check if song has StoryForge connection
    return false;
  }

  async findRelated(songId?: string): Promise<any[]> {
    // Find related stories
    return [];
  }
}

class SparkAIEngine {
  async initializeUserContext(userId: string) {
    // Initialize AI context for user
  }

  async processChat(message: string, context: SparkContext): Promise<any> {
    // Process chat with AI
    return {
      message: 'AI response placeholder'
    };
  }
}

class SparkEconomyManager {
  async initialize() {
    // Initialize economy system
  }

  async getBalance(userId: string): Promise<SparkBalance> {
    return {
      available: 100,
      pending: 0,
      lifetime: 500,
      tier: 'creator'
    };
  }

  async getActiveOffers(userId: string): Promise<any[]> {
    // Get active Spark offers
    return [];
  }

  async trackUsage(
    userId: string,
    feature: string,
    amount: number,
    metadata?: any
  ) {
    // Track Spark usage
  }

  async processPurchase(
    userId: string,
    packageId: string,
    paymentMethod: string
  ): Promise<PurchaseResult> {
    // Process Spark purchase
    return {
      success: true,
      sparksAdded: 100,
      bonus: 10,
      transactionId: `tx_${Date.now()}`
    };
  }
}

// Supporting interfaces

interface SparkChatResponse {
  success: boolean;
  message: string;
  suggestions?: SparkSuggestion[];
  sparkCost?: number;
  balance?: number;
  relatedContent?: any[];
  prompts?: SparkPrompt[];
}

interface MaskGenerationResult {
  original: string;
  masked: string;
  maskId: string;
  intensity: number;
  traits: any;
  sparkCost: number;
}

interface DualMaskConfig {
  primary: MaskPersonality;
  secondary: MaskPersonality;
  blendRatio: number;
  combinedTraits: any;
  sparkCost: number;
}

interface StoryForgeConnection {
  id: string;
  songId: string;
  storyId: string;
  type: string;
  elements: any[];
  prompts: SparkPrompt[];
  sparkCost: number;
}

interface SyncResult {
  connectionsChecked: number;
  updatesApplied: number;
  updates: any[];
  sparkCost: number;
}

interface SparkDashboardData {
  balance: {
    available: number;
    pending: number;
    lifetime: number;
    tier: string;
  };
  usage: {
    daily: number;
    weekly: number;
    monthly: number;
    byFeature: Record<string, number>;
    trend: string;
  };
  transactions: SparkTransaction[];
  recommendations: string[];
  offers: any[];
}

interface PurchaseResult {
  success: boolean;
  sparksAdded: number;
  bonus: number;
  transactionId: string;
}

// Export singleton instance
export const sparkIntegration = new SparkIntegration();
