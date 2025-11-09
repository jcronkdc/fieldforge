/**
 * Analytics Tracker - Comprehensive engagement and revenue tracking
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

export interface AnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  category: 'engagement' | 'revenue' | 'feature' | 'navigation' | 'error';
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface EngagementMetrics {
  pageViews: Record<string, number>;
  featureUsage: Record<string, number>;
  sessionDuration: number;
  clickEvents: number;
  scrollDepth: number;
  bounceRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueByFeature: Record<string, number>;
  topSpenders: Array<{ userId: string; total: number }>;
  purchaseFrequency: number;
}

export interface FeatureMetrics {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  averageTimeSpent: number;
  conversionToRevenue: number;
  errorRate: number;
  satisfactionScore?: number;
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStart: number;
  private lastActivity: number;
  private pageViewStart: Record<string, number> = {};

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
    this.loadStoredEvents();
    this.setupActivityTracking();
    this.setupVisibilityTracking();
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  /**
   * Track page view
   */
  trackPageView(page: string, metadata?: Record<string, any>): void {
    // End previous page view
    const previousPage = Object.keys(this.pageViewStart)[0];
    if (previousPage && previousPage !== page) {
      const duration = Date.now() - this.pageViewStart[previousPage];
      this.track('engagement', 'page_exit', previousPage, duration);
      delete this.pageViewStart[previousPage];
    }

    // Start new page view
    this.pageViewStart[page] = Date.now();
    this.track('navigation', 'page_view', page, 1, metadata);
  }

  /**
   * Track feature usage
   */
  trackFeature(feature: string, action: string, value?: number, metadata?: Record<string, any>): void {
    this.track('feature', action, feature, value, {
      ...metadata,
      feature,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track revenue event
   */
  trackRevenue(action: string, amount: number, metadata?: Record<string, any>): void {
    this.track('revenue', action, 'purchase', amount, {
      ...metadata,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track engagement event
   */
  trackEngagement(action: string, label: string, value?: number, metadata?: Record<string, any>): void {
    this.track('engagement', action, label, value, metadata);
  }

  /**
   * Track error
   */
  trackError(error: string, context: string, metadata?: Record<string, any>): void {
    this.track('error', 'error_occurred', context, 1, {
      ...metadata,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Core tracking method
   */
  private track(
    category: AnalyticsEvent['category'],
    action: string,
    label: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    const userId = localStorage.getItem('mythatron_user_id') || 'anonymous';
    
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      category,
      action,
      label,
      value,
      metadata,
    };

    this.events.push(event);
    this.lastActivity = Date.now();
    this.saveEvents();
    
    console.log(`[ANALYTICS] ${category}:${action}`, { label, value, metadata });
  }

  /**
   * Get engagement metrics
   */
  getEngagementMetrics(timeRange?: { start: Date; end: Date }): EngagementMetrics {
    const filtered = this.filterEventsByTime(timeRange);
    const engagementEvents = filtered.filter(e => e.category === 'engagement' || e.category === 'navigation');

    const pageViews: Record<string, number> = {};
    const featureUsage: Record<string, number> = {};
    
    engagementEvents.forEach(event => {
      if (event.action === 'page_view' && event.label) {
        pageViews[event.label] = (pageViews[event.label] || 0) + 1;
      }
      if (event.category === 'feature' && event.label) {
        featureUsage[event.label] = (featureUsage[event.label] || 0) + 1;
      }
    });

    const sessionDuration = Date.now() - this.sessionStart;
    const clickEvents = engagementEvents.filter(e => e.action === 'click').length;
    const scrollEvents = engagementEvents.filter(e => e.action === 'scroll');
    const maxScroll = scrollEvents.length > 0 
      ? Math.max(...scrollEvents.map(e => e.value || 0))
      : 0;

    // Calculate bounce rate (left within 10 seconds without interaction)
    const hasInteraction = engagementEvents.length > 1;
    const bounceRate = !hasInteraction && sessionDuration < 10000 ? 1 : 0;

    return {
      pageViews,
      featureUsage,
      sessionDuration,
      clickEvents,
      scrollDepth: maxScroll,
      bounceRate,
    };
  }

  /**
   * Get revenue metrics
   */
  getRevenueMetrics(timeRange?: { start: Date; end: Date }): RevenueMetrics {
    const filtered = this.filterEventsByTime(timeRange);
    const revenueEvents = filtered.filter(e => e.category === 'revenue');

    const totalRevenue = revenueEvents.reduce((sum, e) => sum + (e.value || 0), 0);
    const purchaseCount = revenueEvents.filter(e => e.action === 'purchase_completed').length;
    const averageOrderValue = purchaseCount > 0 ? totalRevenue / purchaseCount : 0;

    // Revenue by feature
    const revenueByFeature: Record<string, number> = {};
    revenueEvents.forEach(event => {
      const feature = event.metadata?.feature || 'unknown';
      revenueByFeature[feature] = (revenueByFeature[feature] || 0) + (event.value || 0);
    });

    // Top spenders
    const spenderMap: Record<string, number> = {};
    revenueEvents.forEach(event => {
      spenderMap[event.userId] = (spenderMap[event.userId] || 0) + (event.value || 0);
    });
    
    const topSpenders = Object.entries(spenderMap)
      .map(([userId, total]) => ({ userId, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Conversion rate (users who made a purchase / total users)
    const uniqueUsers = new Set(filtered.map(e => e.userId)).size;
    const purchasers = new Set(revenueEvents.map(e => e.userId)).size;
    const conversionRate = uniqueUsers > 0 ? (purchasers / uniqueUsers) * 100 : 0;

    // Purchase frequency (purchases per user)
    const purchaseFrequency = purchasers > 0 ? purchaseCount / purchasers : 0;

    return {
      totalRevenue,
      averageOrderValue,
      conversionRate,
      revenueByFeature,
      topSpenders,
      purchaseFrequency,
    };
  }

  /**
   * Get feature-specific metrics
   */
  getFeatureMetrics(timeRange?: { start: Date; end: Date }): FeatureMetrics[] {
    const filtered = this.filterEventsByTime(timeRange);
    const featureMap: Record<string, FeatureMetrics> = {};

    filtered.forEach(event => {
      if (event.category === 'feature' && event.label) {
        const feature = event.label;
        
        if (!featureMap[feature]) {
          featureMap[feature] = {
            feature,
            usageCount: 0,
            uniqueUsers: 0,
            averageTimeSpent: 0,
            conversionToRevenue: 0,
            errorRate: 0,
          };
        }

        featureMap[feature].usageCount++;
      }
    });

    // Calculate unique users per feature
    Object.keys(featureMap).forEach(feature => {
      const featureEvents = filtered.filter(e => e.label === feature);
      const uniqueUsers = new Set(featureEvents.map(e => e.userId)).size;
      const errors = featureEvents.filter(e => e.category === 'error').length;
      const revenue = filtered
        .filter(e => e.category === 'revenue' && e.metadata?.feature === feature)
        .reduce((sum, e) => sum + (e.value || 0), 0);

      featureMap[feature].uniqueUsers = uniqueUsers;
      featureMap[feature].errorRate = featureMap[feature].usageCount > 0 
        ? (errors / featureMap[feature].usageCount) * 100 
        : 0;
      featureMap[feature].conversionToRevenue = revenue;
    });

    return Object.values(featureMap).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get user journey
   */
  getUserJourney(userId: string): AnalyticsEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get funnel analysis
   */
  getFunnelAnalysis(steps: string[]): Array<{ step: string; users: number; dropoff: number }> {
    const result: Array<{ step: string; users: number; dropoff: number }> = [];
    let previousUsers = 0;

    steps.forEach((step, index) => {
      const users = new Set(
        this.events
          .filter(e => e.label === step || e.action === step)
          .map(e => e.userId)
      ).size;

      const dropoff = index > 0 && previousUsers > 0 
        ? ((previousUsers - users) / previousUsers) * 100 
        : 0;

      result.push({ step, users, dropoff });
      previousUsers = users;
    });

    return result;
  }

  /**
   * Get heatmap data
   */
  getHeatmapData(): Array<{ element: string; clicks: number; x?: number; y?: number }> {
    const clickEvents = this.events.filter(e => e.action === 'click');
    const heatmap: Record<string, { clicks: number; positions: Array<{ x: number; y: number }> }> = {};

    clickEvents.forEach(event => {
      const element = event.label || 'unknown';
      if (!heatmap[element]) {
        heatmap[element] = { clicks: 0, positions: [] };
      }
      heatmap[element].clicks++;
      if (event.metadata?.x && event.metadata?.y) {
        heatmap[element].positions.push({ x: event.metadata.x, y: event.metadata.y });
      }
    });

    return Object.entries(heatmap).map(([element, data]) => ({
      element,
      clicks: data.clicks,
      x: data.positions.length > 0 ? data.positions[0].x : undefined,
      y: data.positions.length > 0 ? data.positions[0].y : undefined,
    }));
  }

  /**
   * Helper methods
   */
  private filterEventsByTime(timeRange?: { start: Date; end: Date }): AnalyticsEvent[] {
    if (!timeRange) return this.events;
    
    return this.events.filter(e => {
      const eventTime = new Date(e.timestamp);
      return eventTime >= timeRange.start && eventTime <= timeRange.end;
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('mythatron_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
        // Keep only last 1000 events
        if (this.events.length > 1000) {
          this.events = this.events.slice(-1000);
        }
      }
    } catch (error) {
      console.error('Error loading analytics events:', error);
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem('mythatron_analytics_events', JSON.stringify(this.events.slice(-1000)));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  private setupActivityTracking(): void {
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const label = target.getAttribute('data-analytics') || target.innerText?.substring(0, 50) || 'unknown';
      this.trackEngagement('click', label, 1, {
        x: e.clientX,
        y: e.clientY,
        element: target.tagName,
      });
    });

    // Track scroll
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        this.trackEngagement('scroll', 'page', Math.round(scrollPercentage));
      }, 100);
    });
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const sessionDuration = Date.now() - this.sessionStart;
        this.trackEngagement('session', 'background', sessionDuration);
      } else {
        this.trackEngagement('session', 'foreground', 1);
      }
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionStart;
      this.trackEngagement('session', 'end', sessionDuration);
    });
  }

  /**
   * Export data for analysis
   */
  exportData(): string {
    const data = {
      events: this.events,
      engagement: this.getEngagementMetrics(),
      revenue: this.getRevenueMetrics(),
      features: this.getFeatureMetrics(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }
}

export const Analytics = AnalyticsTracker.getInstance();
