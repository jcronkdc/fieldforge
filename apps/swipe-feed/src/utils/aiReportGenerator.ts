/**
 * AI Report Generator - Intelligent analytics summarization
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import { Analytics } from './analyticsTracker';
import { FinancialTracker } from './financialTracker';
import { PurchaseLogger } from './purchaseLogger';

export interface AIReportConfig {
  dateRange: { start: Date; end: Date };
  includeFinancials: boolean;
  includeEngagement: boolean;
  includePurchases: boolean;
  includeRecommendations: boolean;
  format: 'summary' | 'detailed' | 'executive';
}

export interface AIGeneratedReport {
  id: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: string;
  keyMetrics: Record<string, any>;
  insights: string[];
  recommendations: string[];
  warnings: string[];
  projections: Record<string, any>;
  rawData?: any;
}

export class AIReportGenerator {
  private static instance: AIReportGenerator;

  private constructor() {}

  static getInstance(): AIReportGenerator {
    if (!AIReportGenerator.instance) {
      AIReportGenerator.instance = new AIReportGenerator();
    }
    return AIReportGenerator.instance;
  }

  /**
   * Generate comprehensive AI report
   */
  async generateReport(config: AIReportConfig): Promise<AIGeneratedReport> {
    const reportId = `report_${Date.now()}`;
    
    // Gather all data
    const engagementData = config.includeEngagement 
      ? Analytics.getEngagementMetrics(config.dateRange)
      : null;
    
    const revenueData = config.includeFinancials
      ? Analytics.getRevenueMetrics(config.dateRange)
      : null;
    
    const featureData = Analytics.getFeatureMetrics(config.dateRange);
    
    const purchaseData = config.includePurchases
      ? PurchaseLogger.getAttempts()
      : [];

    // Generate insights
    const insights = this.generateInsights(engagementData, revenueData, featureData, purchaseData);
    
    // Generate recommendations
    const recommendations = config.includeRecommendations
      ? this.generateRecommendations(engagementData, revenueData, featureData)
      : [];
    
    // Generate warnings
    const warnings = this.detectWarnings(engagementData, revenueData, purchaseData);
    
    // Generate projections
    const projections = this.generateProjections(revenueData, featureData);
    
    // Generate summary based on format
    const summary = this.generateSummary(config.format, {
      engagement: engagementData,
      revenue: revenueData,
      features: featureData,
      purchases: purchaseData,
      insights,
      recommendations,
      warnings,
    });

    // Compile key metrics
    const keyMetrics = this.compileKeyMetrics(engagementData, revenueData, featureData);

    return {
      id: reportId,
      generatedAt: new Date(),
      period: config.dateRange,
      summary,
      keyMetrics,
      insights,
      recommendations,
      warnings,
      projections,
      rawData: config.format === 'detailed' ? {
        engagement: engagementData,
        revenue: revenueData,
        features: featureData,
      } : undefined,
    };
  }

  /**
   * Generate human-readable insights
   */
  private generateInsights(
    engagement: any,
    revenue: any,
    features: any[],
    purchases: any[]
  ): string[] {
    const insights: string[] = [];

    // Revenue insights
    if (revenue) {
      if (revenue.totalRevenue > 0) {
        insights.push(
          `Generated $${revenue.totalRevenue.toFixed(2)} in total revenue with an average order value of $${revenue.averageOrderValue.toFixed(2)}.`
        );
        
        if (revenue.conversionRate > 5) {
          insights.push(
            `Excellent conversion rate of ${revenue.conversionRate.toFixed(1)}% indicates strong product-market fit.`
          );
        } else if (revenue.conversionRate < 2) {
          insights.push(
            `Low conversion rate of ${revenue.conversionRate.toFixed(1)}% suggests need for pricing or UX optimization.`
          );
        }

        // Top revenue features
        const topRevenueFeature = Object.entries(revenue.revenueByFeature)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0];
        if (topRevenueFeature) {
          insights.push(
            `${topRevenueFeature[0]} is your top revenue generator at $${(topRevenueFeature[1] as number).toFixed(2)}.`
          );
        }
      }
    }

    // Engagement insights
    if (engagement) {
      const sessionMinutes = Math.floor(engagement.sessionDuration / 60000);
      if (sessionMinutes > 5) {
        insights.push(
          `Strong user engagement with average session duration of ${sessionMinutes} minutes.`
        );
      }

      if (engagement.bounceRate < 0.3) {
        insights.push(
          `Low bounce rate of ${(engagement.bounceRate * 100).toFixed(1)}% indicates compelling content.`
        );
      }

      // Most visited pages
      const topPage = Object.entries(engagement.pageViews)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      if (topPage) {
        insights.push(
          `"${topPage[0]}" is your most visited page with ${topPage[1]} views.`
        );
      }
    }

    // Feature insights
    if (features && features.length > 0) {
      const mostUsedFeature = features[0];
      insights.push(
        `${mostUsedFeature.feature} is your most used feature with ${mostUsedFeature.usageCount} uses.`
      );

      const underutilized = features.filter(f => f.usageCount < 10);
      if (underutilized.length > 0) {
        insights.push(
          `${underutilized.length} features have low usage and may need better discovery or promotion.`
        );
      }
    }

    // Purchase insights
    if (purchases && purchases.length > 0) {
      const failureRate = purchases.filter(p => p.status === 'failed' || p.status === 'declined').length / purchases.length;
      if (failureRate > 0.1) {
        insights.push(
          `Payment failure rate of ${(failureRate * 100).toFixed(1)}% is above industry average - investigate payment flow.`
        );
      }
    }

    return insights;
  }

  /**
   * Generate AI recommendations
   */
  private generateRecommendations(
    engagement: any,
    revenue: any,
    features: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Revenue recommendations
    if (revenue) {
      if (revenue.averageOrderValue < 10) {
        recommendations.push(
          '💰 Consider introducing premium tier packages to increase average order value.'
        );
      }

      if (revenue.purchaseFrequency < 2) {
        recommendations.push(
          '🔄 Implement retention campaigns to increase repeat purchases.'
        );
      }

      // Identify monetization opportunities
      const zeroRevenueFeatures = features.filter(f => f.conversionToRevenue === 0 && f.usageCount > 50);
      if (zeroRevenueFeatures.length > 0) {
        recommendations.push(
          `💡 ${zeroRevenueFeatures[0].feature} has high usage but no revenue - consider monetization.`
        );
      }
    }

    // Engagement recommendations
    if (engagement) {
      if (engagement.scrollDepth < 50) {
        recommendations.push(
          '📜 Low scroll depth suggests content above the fold needs improvement.'
        );
      }

      if (engagement.clickEvents < 10) {
        recommendations.push(
          '👆 Low click engagement - make CTAs more prominent and compelling.'
        );
      }

      // Page optimization
      const lowTrafficPages = Object.entries(engagement.pageViews)
        .filter(([,views]) => (views as number) < 5);
      if (lowTrafficPages.length > 0) {
        recommendations.push(
          `🔍 "${lowTrafficPages[0][0]}" has low traffic - improve navigation or merge with other content.`
        );
      }
    }

    // Feature recommendations
    if (features && features.length > 0) {
      const highErrorFeatures = features.filter(f => f.errorRate > 5);
      if (highErrorFeatures.length > 0) {
        recommendations.push(
          `⚠️ ${highErrorFeatures[0].feature} has ${highErrorFeatures[0].errorRate.toFixed(1)}% error rate - requires immediate attention.`
        );
      }

      const lowEngagementFeatures = features.filter(f => f.usageCount < 20).slice(0, 3);
      if (lowEngagementFeatures.length > 0) {
        recommendations.push(
          `📈 Create tutorials or onboarding for: ${lowEngagementFeatures.map(f => f.feature).join(', ')}`
        );
      }
    }

    // Growth recommendations
    if (revenue && revenue.totalRevenue > 100) {
      const projectedMonthly = revenue.totalRevenue * 30;
      if (projectedMonthly < 1000000) {
        const neededUsers = Math.ceil((1000000 - projectedMonthly) / revenue.averageOrderValue);
        recommendations.push(
          `🚀 To reach $1M monthly, acquire ${neededUsers.toLocaleString()} more users at current conversion rates.`
        );
      }
    }

    return recommendations;
  }

  /**
   * Detect warnings and issues
   */
  private detectWarnings(
    engagement: any,
    revenue: any,
    purchases: any[]
  ): string[] {
    const warnings: string[] = [];

    // Revenue warnings
    if (revenue) {
      if (revenue.churnRate > 10) {
        warnings.push(
          `⚠️ High churn rate of ${revenue.churnRate.toFixed(1)}% detected - investigate user satisfaction.`
        );
      }

      if (revenue.totalRevenue === 0) {
        warnings.push(
          '🚨 No revenue generated in this period - check payment systems.'
        );
      }
    }

    // Purchase warnings
    if (purchases && purchases.length > 0) {
      const recentFailures = purchases.filter(p => 
        p.status === 'failed' && 
        new Date(p.timestamp) > new Date(Date.now() - 86400000)
      );
      if (recentFailures.length > 5) {
        warnings.push(
          `🚨 ${recentFailures.length} payment failures in last 24 hours - investigate immediately.`
        );
      }

      const declinedCards = purchases.filter(p => p.errorCode === 'card_declined');
      if (declinedCards.length > purchases.length * 0.2) {
        warnings.push(
          '💳 High card decline rate - consider alternative payment methods.'
        );
      }
    }

    // Engagement warnings
    if (engagement) {
      if (engagement.bounceRate > 0.7) {
        warnings.push(
          '📉 Very high bounce rate - landing page needs immediate improvement.'
        );
      }

      if (engagement.sessionDuration < 30000) {
        warnings.push(
          '⏱️ Very short session duration - users leaving quickly.'
        );
      }
    }

    return warnings;
  }

  /**
   * Generate future projections
   */
  private generateProjections(revenue: any, features: any[]): Record<string, any> {
    if (!revenue) return {};

    const currentMonthlyRevenue = revenue.totalRevenue * 4; // Assuming weekly data
    const growthRate = 0.15; // 15% monthly growth assumption

    return {
      nextMonth: currentMonthlyRevenue * (1 + growthRate),
      nextQuarter: currentMonthlyRevenue * Math.pow(1 + growthRate, 3),
      nextYear: currentMonthlyRevenue * Math.pow(1 + growthRate, 12),
      breakEvenUsers: Math.ceil(50000 / revenue.averageOrderValue), // Assuming $50k monthly costs
      targetUsers: {
        for100k: Math.ceil(100000 / revenue.averageOrderValue),
        for500k: Math.ceil(500000 / revenue.averageOrderValue),
        for1M: Math.ceil(1000000 / revenue.averageOrderValue),
      },
    };
  }

  /**
   * Generate formatted summary
   */
  private generateSummary(
    format: 'summary' | 'detailed' | 'executive',
    data: any
  ): string {
    const { engagement, revenue, features, insights, recommendations, warnings } = data;

    if (format === 'executive') {
      return this.generateExecutiveSummary(revenue, insights, warnings);
    } else if (format === 'detailed') {
      return this.generateDetailedSummary(engagement, revenue, features, insights, recommendations, warnings);
    } else {
      return this.generateBasicSummary(engagement, revenue, insights);
    }
  }

  private generateExecutiveSummary(revenue: any, insights: string[], warnings: string[]): string {
    return `
EXECUTIVE SUMMARY
═══════════════════

FINANCIAL PERFORMANCE
• Total Revenue: $${revenue?.totalRevenue?.toFixed(2) || '0.00'}
• Profit Margin: ${revenue?.profitMargin?.toFixed(1) || '0.0'}%
• Customer Lifetime Value: $${revenue?.customerLifetimeValue?.toFixed(2) || '0.00'}

KEY INSIGHTS
${insights.slice(0, 3).map(i => `• ${i}`).join('\n')}

CRITICAL ISSUES
${warnings.length > 0 ? warnings.slice(0, 2).map(w => `• ${w}`).join('\n') : '• No critical issues detected'}

RECOMMENDATION
Focus on ${revenue?.totalRevenue > 10000 ? 'scaling user acquisition' : 'improving conversion rates'} to reach revenue targets.
    `.trim();
  }

  private generateDetailedSummary(
    engagement: any,
    revenue: any,
    features: any[],
    insights: string[],
    recommendations: string[],
    warnings: string[]
  ): string {
    return `
COMPREHENSIVE ANALYTICS REPORT
══════════════════════════════

📊 ENGAGEMENT METRICS
────────────────────
• Session Duration: ${engagement ? Math.floor(engagement.sessionDuration / 60000) : 0} minutes
• Page Views: ${engagement ? Object.values(engagement.pageViews).reduce((a: any, b: any) => a + b, 0) : 0}
• Bounce Rate: ${engagement ? (engagement.bounceRate * 100).toFixed(1) : 0}%
• Click Events: ${engagement?.clickEvents || 0}

💰 REVENUE METRICS
─────────────────
• Total Revenue: $${revenue?.totalRevenue?.toFixed(2) || '0.00'}
• Average Order Value: $${revenue?.averageOrderValue?.toFixed(2) || '0.00'}
• Conversion Rate: ${revenue?.conversionRate?.toFixed(1) || '0.0'}%
• Recurring Revenue: $${revenue?.recurringRevenue?.toFixed(2) || '0.00'}

🔧 TOP FEATURES BY USAGE
───────────────────────
${features?.slice(0, 5).map(f => 
  `• ${f.feature}: ${f.usageCount} uses, $${f.conversionToRevenue.toFixed(2)} revenue`
).join('\n') || 'No feature data available'}

💡 KEY INSIGHTS
──────────────
${insights.map(i => `• ${i}`).join('\n')}

📈 RECOMMENDATIONS
─────────────────
${recommendations.map(r => `• ${r}`).join('\n')}

⚠️ WARNINGS & ALERTS
───────────────────
${warnings.length > 0 ? warnings.map(w => `• ${w}`).join('\n') : '• All systems operating normally'}
    `.trim();
  }

  private generateBasicSummary(engagement: any, revenue: any, insights: string[]): string {
    return `
ANALYTICS SUMMARY
═════════════════

Revenue: $${revenue?.totalRevenue?.toFixed(2) || '0.00'}
Users: ${revenue?.topSpenders?.length || 0}
Engagement: ${engagement ? Math.floor(engagement.sessionDuration / 60000) : 0} min average session

KEY FINDINGS:
${insights.slice(0, 5).map(i => `• ${i}`).join('\n')}
    `.trim();
  }

  /**
   * Compile key metrics
   */
  private compileKeyMetrics(engagement: any, revenue: any, features: any[]): Record<string, any> {
    return {
      financial: {
        revenue: revenue?.totalRevenue || 0,
        averageOrderValue: revenue?.averageOrderValue || 0,
        conversionRate: revenue?.conversionRate || 0,
        recurringRevenue: revenue?.recurringRevenue || 0,
      },
      engagement: {
        sessionDuration: engagement?.sessionDuration || 0,
        pageViews: engagement ? Object.values(engagement.pageViews).reduce((a: any, b: any) => a + b, 0) : 0,
        bounceRate: engagement?.bounceRate || 0,
        clickEvents: engagement?.clickEvents || 0,
      },
      features: {
        totalFeatures: features?.length || 0,
        activeFeatures: features?.filter(f => f.usageCount > 0).length || 0,
        topFeature: features?.[0]?.feature || 'None',
        topFeatureUsage: features?.[0]?.usageCount || 0,
      },
    };
  }

  /**
   * Export report to CSV
   */
  exportToCSV(report: AIGeneratedReport): string {
    const rows: string[][] = [
      ['MythaTron Analytics Report'],
      ['Generated', report.generatedAt.toISOString()],
      ['Period', `${report.period.start.toISOString()} to ${report.period.end.toISOString()}`],
      [],
      ['KEY METRICS'],
      ...Object.entries(report.keyMetrics.financial || {}).map(([key, value]) => 
        [key, String(value)]
      ),
      [],
      ['INSIGHTS'],
      ...report.insights.map(i => [i]),
      [],
      ['RECOMMENDATIONS'],
      ...report.recommendations.map(r => [r]),
      [],
      ['WARNINGS'],
      ...report.warnings.map(w => [w]),
    ];

    return rows.map(row => row.map(cell => 
      cell.includes(',') || cell.includes('"') ? `"${cell.replace(/"/g, '""')}"` : cell
    ).join(',')).join('\n');
  }

  /**
   * Generate email-ready HTML report
   */
  generateEmailHTML(report: AIGeneratedReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    h1 { color: #333; border-bottom: 3px solid #a855f7; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #a855f7; }
    .metric-label { font-size: 12px; color: #999; }
    .insight { background: #f8f8f8; padding: 10px; margin: 10px 0; border-left: 4px solid #a855f7; }
    .warning { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ffc107; }
    .recommendation { background: #d1f2eb; padding: 10px; margin: 10px 0; border-left: 4px solid #28a745; }
  </style>
</head>
<body>
  <div class="container">
    <h1>MythaTron Analytics Report</h1>
    <p>Generated: ${report.generatedAt.toLocaleString()}</p>
    
    <h2>Key Metrics</h2>
    <div>
      <div class="metric">
        <div class="metric-value">$${report.keyMetrics.financial?.revenue?.toFixed(2) || '0'}</div>
        <div class="metric-label">Total Revenue</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.keyMetrics.financial?.conversionRate?.toFixed(1) || '0'}%</div>
        <div class="metric-label">Conversion Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value">${Math.floor((report.keyMetrics.engagement?.sessionDuration || 0) / 60000)} min</div>
        <div class="metric-label">Avg Session</div>
      </div>
    </div>
    
    <h2>Key Insights</h2>
    ${report.insights.map(i => `<div class="insight">${i}</div>`).join('')}
    
    ${report.warnings.length > 0 ? `
      <h2>Warnings</h2>
      ${report.warnings.map(w => `<div class="warning">${w}</div>`).join('')}
    ` : ''}
    
    ${report.recommendations.length > 0 ? `
      <h2>Recommendations</h2>
      ${report.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
    ` : ''}
    
    <p style="margin-top: 30px; color: #999; font-size: 12px;">
      This is an automated report from MythaTron Analytics. 
      For detailed analysis, please log into your dashboard.
    </p>
  </div>
</body>
</html>
    `;
  }
}

export const AIReporter = AIReportGenerator.getInstance();
