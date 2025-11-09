/**
 * Dashboard & Notification Layer
 * Unified UI aligned with MythaTron design language
 * Live update feeds for collaboration, remix events, and income metrics
 */

import type {
  Song,
  CollaborationSession,
  Remix,
  ProfitabilityMetrics,
  Notification,
  DashboardStats,
  ActivityFeed,
  RevenueSnapshot
} from './types';

export class DashboardEngine {
  private notifications: Map<string, Notification[]> = new Map();
  private activityFeeds: Map<string, ActivityFeed> = new Map();
  private userStats: Map<string, DashboardStats> = new Map();
  private revenueData: Map<string, RevenueSnapshot> = new Map();
  private websocketConnections: Map<string, WebSocket> = new Map();
  private updateQueue: UpdateQueue;
  private analyticsEngine: AnalyticsEngine;
  private notificationService: NotificationService;

  constructor() {
    this.updateQueue = new UpdateQueue();
    this.analyticsEngine = new AnalyticsEngine();
    this.notificationService = new NotificationService();
    this.initializeRealTimeUpdates();
  }

  /**
   * Dashboard Components
   */

  async getDashboard(userId: string): Promise<DashboardData> {
    const stats = await this.getUserStats(userId);
    const recentActivity = await this.getRecentActivity(userId);
    const notifications = await this.getNotifications(userId);
    const revenue = await this.getRevenueSnapshot(userId);
    const activeSongs = await this.getActiveSongs(userId);
    const activeCollabs = await this.getActiveCollaborations(userId);
    const remixes = await this.getUserRemixes(userId);

    return {
      user: {
        id: userId,
        tier: await this.getUserTier(userId),
        subscription: await this.getSubscriptionStatus(userId)
      },
      stats: {
        totalSongs: stats.totalSongs,
        totalCollaborations: stats.totalCollaborations,
        totalRemixes: stats.totalRemixes,
        totalPlays: stats.totalPlays,
        totalRevenue: revenue.total,
        monthlyRevenue: revenue.monthly,
        engagement: stats.engagementRate,
        trending: stats.trendingScore
      },
      activeSongs: activeSongs.map(song => ({
        id: song.id,
        title: song.metadata.title,
        status: song.status,
        lastModified: song.updatedAt,
        collaborators: song.collaborators?.length || 0,
        plays: song.stats?.plays || 0,
        revenue: song.revenue || 0,
        thumbnail: song.metadata.coverArt,
        progress: this.calculateSongProgress(song)
      })),
      activeCollaborations: activeCollabs.map(collab => ({
        sessionId: collab.id,
        songId: collab.songId,
        songTitle: collab.songTitle,
        role: collab.userRole,
        collaborators: collab.collaborators.map(c => ({
          id: c.userId,
          name: c.name,
          avatar: c.avatar,
          isActive: c.isActive,
          color: c.color
        })),
        lastActivity: collab.lastActivity,
        unreadMessages: collab.unreadMessages
      })),
      remixes: {
        created: remixes.created.map(r => this.formatRemixCard(r)),
        ofYourSongs: remixes.ofYours.map(r => this.formatRemixCard(r))
      },
      notifications: notifications.slice(0, 10),
      activityFeed: recentActivity,
      revenue: {
        current: revenue,
        history: await this.getRevenueHistory(userId, 30),
        projections: await this.getRevenueProjections(userId)
      },
      quickActions: this.getQuickActions(userId),
      recommendations: await this.getRecommendations(userId)
    };
  }

  /**
   * Real-time Activity Feed
   */

  async createActivityFeed(userId: string): Promise<ActivityFeed> {
    const feedId = `feed_${userId}`;
    
    const feed: ActivityFeed = {
      id: feedId,
      userId,
      items: [],
      lastUpdated: Date.now(),
      filters: {
        types: ['all'],
        timeRange: 'week',
        showArchived: false
      }
    };

    this.activityFeeds.set(feedId, feed);
    return feed;
  }

  async addActivityItem(
    userId: string,
    item: {
      type: 'song_created' | 'collab_joined' | 'remix_created' | 'comment_received' | 
            'song_published' | 'milestone_reached' | 'payment_received' | 'mention';
      title: string;
      description?: string;
      entityId: string;
      entityType: 'song' | 'collaboration' | 'remix' | 'user';
      actors?: Array<{ id: string; name: string; avatar?: string }>;
      metadata?: any;
    }
  ): Promise<void> {
    const feedId = `feed_${userId}`;
    let feed = this.activityFeeds.get(feedId);
    
    if (!feed) {
      feed = await this.createActivityFeed(userId);
    }

    const activityItem: ActivityItem = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      timestamp: Date.now(),
      read: false,
      archived: false
    };

    // Add to feed (newest first)
    feed.items.unshift(activityItem);
    
    // Limit feed size
    if (feed.items.length > 100) {
      feed.items = feed.items.slice(0, 100);
    }

    feed.lastUpdated = Date.now();

    // Send real-time update
    this.sendRealTimeUpdate(userId, {
      type: 'activity_update',
      data: activityItem
    });
  }

  /**
   * Notification System
   */

  async sendNotification(
    userId: string,
    notification: {
      type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'invite' | 'payment';
      title: string;
      message: string;
      actionUrl?: string;
      actionLabel?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      metadata?: any;
    }
  ): Promise<void> {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...notification,
      timestamp: Date.now(),
      read: false,
      priority: notification.priority || 'normal'
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.unshift(notif);

    // Send push notification if high priority
    if (notif.priority === 'high' || notif.priority === 'urgent') {
      await this.notificationService.sendPush(userId, notif);
    }

    // Send real-time update
    this.sendRealTimeUpdate(userId, {
      type: 'notification',
      data: notif
    });

    // Add to activity feed
    await this.addActivityItem(userId, {
      type: 'mention',
      title: notification.title,
      description: notification.message,
      entityId: notif.id,
      entityType: 'user'
    });
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return;

    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.readAt = Date.now();
    }
  }

  async getNotifications(
    userId: string,
    filters?: {
      unreadOnly?: boolean;
      types?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    let notifications = this.notifications.get(userId) || [];

    // Apply filters
    if (filters?.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    if (filters?.types && filters.types.length > 0) {
      notifications = notifications.filter(n => filters.types!.includes(n.type));
    }

    // Apply pagination
    const start = filters?.offset || 0;
    const end = start + (filters?.limit || 50);
    
    return notifications.slice(start, end);
  }

  /**
   * Revenue & Profitability Tracking
   */

  async updateRevenueSnapshot(userId: string): Promise<RevenueSnapshot> {
    const snapshot: RevenueSnapshot = {
      userId,
      timestamp: Date.now(),
      total: 0,
      monthly: 0,
      weekly: 0,
      daily: 0,
      sources: {
        subscriptions: 0,
        songSales: 0,
        remixRevenue: 0,
        collaborationSplits: 0,
        tips: 0
      },
      breakdown: {
        gross: 0,
        platformFees: 0,
        processingFees: 0,
        taxes: 0,
        net: 0
      },
      currency: 'USD',
      projectedMonthly: 0,
      growthRate: 0
    };

    // Calculate revenue from various sources
    snapshot.sources.subscriptions = await this.calculateSubscriptionRevenue(userId);
    snapshot.sources.songSales = await this.calculateSongSales(userId);
    snapshot.sources.remixRevenue = await this.calculateRemixRevenue(userId);
    snapshot.sources.collaborationSplits = await this.calculateCollabSplits(userId);
    snapshot.sources.tips = await this.calculateTips(userId);

    // Calculate totals
    snapshot.total = Object.values(snapshot.sources).reduce((sum, val) => sum + val, 0);
    
    // Calculate time-based metrics
    snapshot.monthly = await this.getMonthlyRevenue(userId);
    snapshot.weekly = await this.getWeeklyRevenue(userId);
    snapshot.daily = await this.getDailyRevenue(userId);

    // Calculate breakdown
    snapshot.breakdown.gross = snapshot.total;
    snapshot.breakdown.platformFees = snapshot.total * 0.1; // 10% platform fee
    snapshot.breakdown.processingFees = snapshot.total * 0.029 + 0.30; // Stripe fees
    snapshot.breakdown.taxes = snapshot.total * 0.15; // Estimated taxes
    snapshot.breakdown.net = snapshot.breakdown.gross - 
                           snapshot.breakdown.platformFees - 
                           snapshot.breakdown.processingFees - 
                           snapshot.breakdown.taxes;

    // Calculate projections
    snapshot.projectedMonthly = this.projectMonthlyRevenue(snapshot);
    snapshot.growthRate = await this.calculateGrowthRate(userId);

    // Store snapshot
    this.revenueData.set(userId, snapshot);

    // Send update if significant change
    const previousSnapshot = this.revenueData.get(userId);
    if (previousSnapshot && Math.abs(snapshot.total - previousSnapshot.total) > 10) {
      await this.sendNotification(userId, {
        type: 'payment',
        title: 'Revenue Update',
        message: `Your revenue has ${snapshot.total > previousSnapshot.total ? 'increased' : 'decreased'} to $${snapshot.total.toFixed(2)}`,
        priority: 'normal'
      });
    }

    return snapshot;
  }

  async getRevenueHistory(userId: string, days: number): Promise<RevenueHistory> {
    const history: RevenueHistory = {
      userId,
      period: `${days} days`,
      dataPoints: [],
      total: 0,
      average: 0,
      peak: 0,
      low: Infinity
    };

    // Get historical data points
    const endDate = Date.now();
    const startDate = endDate - (days * 24 * 60 * 60 * 1000);
    
    for (let d = 0; d < days; d++) {
      const date = startDate + (d * 24 * 60 * 60 * 1000);
      const dayRevenue = await this.getRevenueForDate(userId, date);
      
      history.dataPoints.push({
        date,
        revenue: dayRevenue,
        sources: await this.getRevenueSourcesForDate(userId, date)
      });

      history.total += dayRevenue;
      history.peak = Math.max(history.peak, dayRevenue);
      history.low = Math.min(history.low, dayRevenue);
    }

    history.average = history.total / days;
    
    return history;
  }

  async getRevenueProjections(userId: string): Promise<RevenueProjection> {
    const currentRevenue = this.revenueData.get(userId);
    const history = await this.getRevenueHistory(userId, 30);
    
    // Calculate growth trend
    const growthRate = this.calculateGrowthTrend(history.dataPoints);
    
    return {
      nextMonth: currentRevenue?.monthly || 0 * (1 + growthRate),
      nextQuarter: (currentRevenue?.monthly || 0) * 3 * Math.pow(1 + growthRate, 3),
      nextYear: (currentRevenue?.monthly || 0) * 12 * Math.pow(1 + growthRate, 12),
      confidence: this.calculateProjectionConfidence(history),
      factors: {
        seasonality: await this.getSeasonalityFactor(),
        userGrowth: await this.getUserGrowthFactor(userId),
        engagement: await this.getEngagementFactor(userId),
        marketTrends: await this.getMarketTrendsFactor()
      }
    };
  }

  /**
   * Live Updates & WebSocket Management
   */

  private initializeRealTimeUpdates() {
    // Initialize WebSocket server for real-time updates
    this.updateQueue.on('update', (update) => {
      this.processUpdate(update);
    });

    // Start periodic sync
    setInterval(() => {
      this.syncAllDashboards();
    }, 5000); // Every 5 seconds
  }

  private sendRealTimeUpdate(userId: string, update: any) {
    const connection = this.websocketConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(update));
    }
    
    // Queue update if connection not available
    this.updateQueue.add(userId, update);
  }

  async connectUser(userId: string, ws: WebSocket) {
    this.websocketConnections.set(userId, ws);
    
    // Send initial dashboard data
    const dashboard = await this.getDashboard(userId);
    ws.send(JSON.stringify({
      type: 'dashboard_init',
      data: dashboard
    }));

    // Setup heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      } else {
        clearInterval(heartbeat);
        this.websocketConnections.delete(userId);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Analytics & Insights
   */

  async generateInsights(userId: string): Promise<DashboardInsights> {
    const stats = await this.getUserStats(userId);
    const revenue = this.revenueData.get(userId);
    const activity = await this.getActivityMetrics(userId);

    return {
      topPerformingSongs: await this.getTopPerformingSongs(userId, 5),
      collaborationSuccess: await this.getCollaborationSuccessRate(userId),
      remixImpact: await this.getRemixImpact(userId),
      audienceGrowth: await this.getAudienceGrowth(userId),
      revenueOptimization: await this.getRevenueOptimizationTips(userId),
      creativePatterns: await this.analyzeCreativePatterns(userId),
      recommendations: {
        features: await this.recommendFeatures(userId),
        collaborators: await this.recommendCollaborators(userId),
        genres: await this.recommendGenres(userId),
        timingOptimal: await this.getOptimalPostingTimes(userId)
      }
    };
  }

  // Helper methods

  private async getUserStats(userId: string): Promise<DashboardStats> {
    let stats = this.userStats.get(userId);
    
    if (!stats || Date.now() - stats.lastUpdated > 60000) { // Refresh every minute
      stats = await this.calculateUserStats(userId);
      this.userStats.set(userId, stats);
    }
    
    return stats;
  }

  private async calculateUserStats(userId: string): Promise<DashboardStats> {
    return {
      userId,
      totalSongs: await this.countUserSongs(userId),
      totalCollaborations: await this.countUserCollaborations(userId),
      totalRemixes: await this.countUserRemixes(userId),
      totalPlays: await this.countTotalPlays(userId),
      engagementRate: await this.calculateEngagementRate(userId),
      trendingScore: await this.calculateTrendingScore(userId),
      lastUpdated: Date.now()
    };
  }

  private async getRecentActivity(userId: string): Promise<ActivityItem[]> {
    const feed = this.activityFeeds.get(`feed_${userId}`);
    return feed?.items.slice(0, 20) || [];
  }

  private async getRevenueSnapshot(userId: string): Promise<RevenueSnapshot> {
    let snapshot = this.revenueData.get(userId);
    
    if (!snapshot || Date.now() - snapshot.timestamp > 3600000) { // Refresh hourly
      snapshot = await this.updateRevenueSnapshot(userId);
    }
    
    return snapshot;
  }

  private async getActiveSongs(userId: string): Promise<Song[]> {
    // Get user's active songs
    // Placeholder implementation
    return [];
  }

  private async getActiveCollaborations(userId: string): Promise<any[]> {
    // Get user's active collaborations
    return [];
  }

  private async getUserRemixes(userId: string): Promise<any> {
    // Get user's remixes
    return {
      created: [],
      ofYours: []
    };
  }

  private async getUserTier(userId: string): Promise<string> {
    // Get user's subscription tier
    return 'creator';
  }

  private async getSubscriptionStatus(userId: string): Promise<any> {
    // Get subscription status
    return {
      tier: 'creator',
      status: 'active',
      renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
  }

  private calculateSongProgress(song: Song): number {
    // Calculate completion percentage
    let progress = 0;
    if (song.metadata?.title) progress += 10;
    if (song.sections?.length > 0) progress += 30;
    if (song.lyrics) progress += 30;
    if (song.melody) progress += 20;
    if (song.metadata?.coverArt) progress += 10;
    return Math.min(100, progress);
  }

  private formatRemixCard(remix: any): any {
    // Format remix for dashboard card
    return {
      id: remix.id,
      title: remix.title,
      thumbnail: remix.thumbnail,
      stats: remix.stats,
      createdAt: remix.createdAt
    };
  }

  private getQuickActions(userId: string): QuickAction[] {
    return [
      {
        id: 'new_song',
        label: 'New Song',
        icon: 'music-note',
        action: 'create_song',
        color: '#4ECDC4'
      },
      {
        id: 'start_collab',
        label: 'Start Collaboration',
        icon: 'users',
        action: 'create_collaboration',
        color: '#45B7D1'
      },
      {
        id: 'browse_remixes',
        label: 'Browse Remixes',
        icon: 'remix',
        action: 'browse_remixes',
        color: '#96CEB4'
      },
      {
        id: 'view_analytics',
        label: 'Analytics',
        icon: 'chart',
        action: 'view_analytics',
        color: '#FFEAA7'
      }
    ];
  }

  private async getRecommendations(userId: string): Promise<string[]> {
    const recommendations: string[] = [];
    const stats = await this.getUserStats(userId);
    
    if (stats.totalSongs < 5) {
      recommendations.push('Create more songs to build your portfolio');
    }
    if (stats.totalCollaborations === 0) {
      recommendations.push('Try collaborating with other artists');
    }
    if (stats.engagementRate < 0.1) {
      recommendations.push('Share your songs to increase engagement');
    }
    
    return recommendations;
  }

  private async calculateSubscriptionRevenue(userId: string): Promise<number> {
    // Calculate revenue from subscriptions
    return 0; // Placeholder
  }

  private async calculateSongSales(userId: string): Promise<number> {
    // Calculate revenue from song sales
    return 0;
  }

  private async calculateRemixRevenue(userId: string): Promise<number> {
    // Calculate revenue from remixes
    return 0;
  }

  private async calculateCollabSplits(userId: string): Promise<number> {
    // Calculate revenue from collaboration splits
    return 0;
  }

  private async calculateTips(userId: string): Promise<number> {
    // Calculate revenue from tips
    return 0;
  }

  private async getMonthlyRevenue(userId: string): Promise<number> {
    // Get monthly revenue
    return 0;
  }

  private async getWeeklyRevenue(userId: string): Promise<number> {
    // Get weekly revenue
    return 0;
  }

  private async getDailyRevenue(userId: string): Promise<number> {
    // Get daily revenue
    return 0;
  }

  private projectMonthlyRevenue(snapshot: RevenueSnapshot): number {
    // Project monthly revenue based on current trends
    return snapshot.monthly * 1.05; // 5% growth projection
  }

  private async calculateGrowthRate(userId: string): Promise<number> {
    // Calculate revenue growth rate
    return 0.05; // 5% growth
  }

  private async getRevenueForDate(userId: string, date: number): Promise<number> {
    // Get revenue for specific date
    return Math.random() * 100; // Placeholder
  }

  private async getRevenueSourcesForDate(userId: string, date: number): Promise<any> {
    // Get revenue sources breakdown for date
    return {};
  }

  private calculateGrowthTrend(dataPoints: any[]): number {
    // Calculate growth trend from data points
    if (dataPoints.length < 2) return 0;
    
    const firstWeek = dataPoints.slice(0, 7).reduce((sum, p) => sum + p.revenue, 0) / 7;
    const lastWeek = dataPoints.slice(-7).reduce((sum, p) => sum + p.revenue, 0) / 7;
    
    return (lastWeek - firstWeek) / firstWeek;
  }

  private calculateProjectionConfidence(history: RevenueHistory): number {
    // Calculate confidence in projections based on historical variance
    const variance = this.calculateVariance(history.dataPoints.map(p => p.revenue));
    return Math.max(0, Math.min(1, 1 - (variance / history.average)));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length);
  }

  private async getSeasonalityFactor(): Promise<number> {
    // Calculate seasonality impact
    return 1.0; // No seasonality adjustment
  }

  private async getUserGrowthFactor(userId: string): Promise<number> {
    // Calculate user growth factor
    return 1.05; // 5% growth
  }

  private async getEngagementFactor(userId: string): Promise<number> {
    // Calculate engagement factor
    return 1.0;
  }

  private async getMarketTrendsFactor(): Promise<number> {
    // Calculate market trends factor
    return 1.0;
  }

  private processUpdate(update: any) {
    // Process queued update
    const { userId, data } = update;
    const connection = this.websocketConnections.get(userId);
    
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(data));
    }
  }

  private async syncAllDashboards() {
    // Sync all active dashboards
    for (const [userId, connection] of this.websocketConnections) {
      if (connection.readyState === WebSocket.OPEN) {
        const updates = await this.getIncrementalUpdates(userId);
        if (updates.length > 0) {
          connection.send(JSON.stringify({
            type: 'incremental_update',
            data: updates
          }));
        }
      }
    }
  }

  private async getIncrementalUpdates(userId: string): Promise<any[]> {
    // Get incremental updates since last sync
    return [];
  }

  private async countUserSongs(userId: string): Promise<number> {
    // Count user's songs
    return 0;
  }

  private async countUserCollaborations(userId: string): Promise<number> {
    // Count user's collaborations
    return 0;
  }

  private async countUserRemixes(userId: string): Promise<number> {
    // Count user's remixes
    return 0;
  }

  private async countTotalPlays(userId: string): Promise<number> {
    // Count total plays
    return 0;
  }

  private async calculateEngagementRate(userId: string): Promise<number> {
    // Calculate engagement rate
    return 0.15; // 15% engagement
  }

  private async calculateTrendingScore(userId: string): Promise<number> {
    // Calculate trending score
    return 0.5;
  }

  private async getActivityMetrics(userId: string): Promise<any> {
    // Get activity metrics
    return {};
  }

  private async getTopPerformingSongs(userId: string, limit: number): Promise<any[]> {
    // Get top performing songs
    return [];
  }

  private async getCollaborationSuccessRate(userId: string): Promise<number> {
    // Calculate collaboration success rate
    return 0.75; // 75% success rate
  }

  private async getRemixImpact(userId: string): Promise<any> {
    // Calculate remix impact
    return {};
  }

  private async getAudienceGrowth(userId: string): Promise<any> {
    // Calculate audience growth
    return {};
  }

  private async getRevenueOptimizationTips(userId: string): Promise<string[]> {
    // Generate revenue optimization tips
    return [
      'Increase collaboration frequency',
      'Publish songs during peak hours',
      'Enable remix options for wider reach'
    ];
  }

  private async analyzeCreativePatterns(userId: string): Promise<any> {
    // Analyze creative patterns
    return {};
  }

  private async recommendFeatures(userId: string): Promise<string[]> {
    // Recommend features
    return ['AI Melody Generation', 'Voice Synthesis'];
  }

  private async recommendCollaborators(userId: string): Promise<any[]> {
    // Recommend potential collaborators
    return [];
  }

  private async recommendGenres(userId: string): Promise<string[]> {
    // Recommend genres to explore
    return ['Pop', 'Electronic'];
  }

  private async getOptimalPostingTimes(userId: string): Promise<any> {
    // Get optimal posting times
    return {
      weekday: '7PM - 9PM',
      weekend: '2PM - 4PM'
    };
  }
}

// Supporting classes

class UpdateQueue extends EventTarget {
  private queue: Map<string, any[]> = new Map();
  
  add(userId: string, update: any) {
    if (!this.queue.has(userId)) {
      this.queue.set(userId, []);
    }
    this.queue.get(userId)!.push(update);
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('update', { detail: { userId, data: update } }));
  }
  
  getAndClear(userId: string): any[] {
    const updates = this.queue.get(userId) || [];
    this.queue.delete(userId);
    return updates;
  }
}

class AnalyticsEngine {
  // Analytics implementation
}

class NotificationService {
  async sendPush(userId: string, notification: Notification): Promise<void> {
    // Send push notification implementation
    console.log(`Push notification sent to ${userId}:`, notification);
  }
}

// Supporting interfaces

interface DashboardData {
  user: {
    id: string;
    tier: string;
    subscription: any;
  };
  stats: {
    totalSongs: number;
    totalCollaborations: number;
    totalRemixes: number;
    totalPlays: number;
    totalRevenue: number;
    monthlyRevenue: number;
    engagement: number;
    trending: number;
  };
  activeSongs: any[];
  activeCollaborations: any[];
  remixes: {
    created: any[];
    ofYourSongs: any[];
  };
  notifications: Notification[];
  activityFeed: ActivityItem[];
  revenue: {
    current: RevenueSnapshot;
    history: RevenueHistory;
    projections: RevenueProjection;
  };
  quickActions: QuickAction[];
  recommendations: string[];
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  entityId: string;
  entityType: string;
  actors?: Array<{ id: string; name: string; avatar?: string }>;
  metadata?: any;
  timestamp: number;
  read: boolean;
  archived: boolean;
}

interface RevenueHistory {
  userId: string;
  period: string;
  dataPoints: Array<{
    date: number;
    revenue: number;
    sources: any;
  }>;
  total: number;
  average: number;
  peak: number;
  low: number;
}

interface RevenueProjection {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  confidence: number;
  factors: {
    seasonality: number;
    userGrowth: number;
    engagement: number;
    marketTrends: number;
  };
}

interface DashboardInsights {
  topPerformingSongs: any[];
  collaborationSuccess: number;
  remixImpact: any;
  audienceGrowth: any;
  revenueOptimization: string[];
  creativePatterns: any;
  recommendations: {
    features: string[];
    collaborators: any[];
    genres: string[];
    timingOptimal: any;
  };
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
}

// Export singleton instance
export const dashboardEngine = new DashboardEngine();
