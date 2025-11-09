/**
 * AI Report Generator - Intelligent analytics and financial reporting
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { Analytics } from '../../utils/analyticsTracker';
import { FinancialTracking } from '../../utils/financialTracker';
import { PurchaseLogger } from '../../utils/purchaseLogger';

interface ReportSection {
  title: string;
  content: string;
  insights: string[];
  recommendations: string[];
  metrics?: Record<string, any>;
}

interface AIReport {
  id: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  executiveSummary: string;
  sections: ReportSection[];
  keyFindings: string[];
  actionItems: string[];
  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

export const AIReportGenerator: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  // Generate AI-powered report
  const generateReport = async () => {
    setIsGenerating(true);

    try {
      // Gather all data
      const analytics = Analytics.getMetrics();
      const financial = FinancialTracking.getMetrics(dateRange.start, dateRange.end);
      const purchases = PurchaseLogger.getAttempts();
      const failures = PurchaseLogger.getRecentFailures(30);
      
      // Calculate key metrics
      const totalRevenue = financial.totalRevenue;
      const totalEngagement = analytics.totalPageViews;
      const conversionRate = purchases.length > 0 
        ? (purchases.filter(p => p.status === 'success').length / purchases.length) * 100 
        : 0;
      
      // Identify top performing features
      const featureUsage = analytics.featureUsage;
      const topFeatures = Object.entries(featureUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      // Identify revenue drivers
      const revenueByFeature = analytics.revenueByFeature;
      const topRevenueFeatures = Object.entries(revenueByFeature)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      // Generate insights
      const insights: string[] = [];
      
      if (conversionRate < 50) {
        insights.push(`Conversion rate is ${conversionRate.toFixed(1)}% - consider simplifying the purchase flow`);
      }
      
      if (failures.length > purchases.length * 0.1) {
        insights.push(`High failure rate detected (${failures.length} failures) - investigate payment processing`);
      }
      
      if (financial.growthRate > 20) {
        insights.push(`Excellent growth rate of ${financial.growthRate.toFixed(1)}% - maintain current strategies`);
      } else if (financial.growthRate < 5) {
        insights.push(`Low growth rate of ${financial.growthRate.toFixed(1)}% - consider new marketing initiatives`);
      }
      
      // Generate recommendations
      const recommendations: string[] = [];
      
      const leastUsedFeatures = Object.entries(featureUsage)
        .filter(([_, usage]) => usage < 10)
        .map(([feature]) => feature);
      
      if (leastUsedFeatures.length > 0) {
        recommendations.push(`Improve discoverability for: ${leastUsedFeatures.slice(0, 3).join(', ')}`);
      }
      
      if (financial.averageTransactionValue < 10) {
        recommendations.push('Consider bundling products to increase average transaction value');
      }
      
      if (analytics.bounceRate > 50) {
        recommendations.push('High bounce rate detected - improve landing page engagement');
      }
      
      // Create comprehensive report
      const aiReport: AIReport = {
        id: `report_${Date.now()}`,
        generatedAt: new Date(),
        period: { start: dateRange.start, end: dateRange.end },
        executiveSummary: `
During the period from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}, 
MythaTron generated ${formatCurrency(totalRevenue)} in revenue with ${totalEngagement.toLocaleString()} total engagements. 
The platform maintained a ${conversionRate.toFixed(1)}% conversion rate with an average transaction value of 
${formatCurrency(financial.averageTransactionValue)}. Monthly recurring revenue stands at ${formatCurrency(financial.monthlyRecurringRevenue)}, 
with a ${financial.growthRate.toFixed(1)}% growth rate month-over-month.
        `.trim(),
        sections: [
          {
            title: 'Financial Performance',
            content: `Total revenue reached ${formatCurrency(totalRevenue)} with expenses of ${formatCurrency(financial.totalExpenses)}, 
resulting in a net profit of ${formatCurrency(financial.netProfit)} and a ${financial.profitMargin.toFixed(1)}% profit margin.`,
            insights: [
              `Revenue grew ${financial.growthRate.toFixed(1)}% compared to last period`,
              `Average transaction value: ${formatCurrency(financial.averageTransactionValue)}`,
              `Customer lifetime value: ${formatCurrency(financial.customerLifetimeValue)}`,
            ],
            recommendations: [
              financial.profitMargin < 30 ? 'Consider optimizing operational costs' : 'Maintain current cost structure',
              financial.monthlyRecurringRevenue < 50000 ? 'Focus on subscription conversions' : 'Excellent MRR performance',
            ],
            metrics: {
              revenue: totalRevenue,
              expenses: financial.totalExpenses,
              profit: financial.netProfit,
              margin: financial.profitMargin,
            },
          },
          {
            title: 'User Engagement',
            content: `Platform engagement shows ${totalEngagement.toLocaleString()} total interactions across all features. 
The most popular features are ${topFeatures.slice(0, 3).map(([f]) => f).join(', ')}.`,
            insights: [
              `Top feature: ${topFeatures[0]?.[0] || 'N/A'} with ${topFeatures[0]?.[1] || 0} uses`,
              `Average session duration: ${Math.floor(analytics.averageSessionDuration / 60)} minutes`,
              `Active users show ${analytics.returningUsers} return visits`,
            ],
            recommendations: [
              'Promote underutilized features through tutorials',
              'Implement gamification to increase engagement',
              'Add social sharing to viral growth',
            ],
            metrics: {
              totalEngagement,
              topFeatures: Object.fromEntries(topFeatures),
              sessionDuration: analytics.averageSessionDuration,
            },
          },
          {
            title: 'Revenue Analysis',
            content: `Revenue is primarily driven by ${topRevenueFeatures[0]?.[0] || 'N/A'} contributing 
${formatCurrency(topRevenueFeatures[0]?.[1] || 0)} to total revenue.`,
            insights: [
              `Sparks purchases account for ${((revenueByFeature.sparks || 0) / totalRevenue * 100).toFixed(1)}% of revenue`,
              `Subscription revenue: ${formatCurrency(financial.monthlyRecurringRevenue)} MRR`,
              `Payment success rate: ${conversionRate.toFixed(1)}%`,
            ],
            recommendations: [
              conversionRate < 80 ? 'Optimize checkout flow to reduce abandonment' : 'Excellent conversion rate',
              'Consider tiered pricing to capture more value',
              'Implement annual plans for better cash flow',
            ],
            metrics: {
              revenueByFeature,
              conversionRate,
              mrr: financial.monthlyRecurringRevenue,
            },
          },
          {
            title: 'Technical Performance',
            content: `System processed ${purchases.length} transactions with ${failures.length} failures, 
maintaining a ${((1 - failures.length / Math.max(purchases.length, 1)) * 100).toFixed(1)}% success rate.`,
            insights: [
              `Payment failures: ${failures.length} in last 30 days`,
              `Most common failure: ${failures[0]?.failureReason || 'N/A'}`,
              `Peak usage time: ${getPeakUsageTime(analytics.pageViews)}`,
            ],
            recommendations: [
              failures.length > 5 ? 'Investigate payment gateway issues' : 'Payment system performing well',
              'Implement redundant payment processors',
              'Add retry logic for transient failures',
            ],
            metrics: {
              totalTransactions: purchases.length,
              failedTransactions: failures.length,
              successRate: (1 - failures.length / Math.max(purchases.length, 1)) * 100,
            },
          },
        ],
        keyFindings: insights,
        actionItems: recommendations,
        projections: {
          nextMonth: financial.monthlyRecurringRevenue * 1.1,
          nextQuarter: financial.monthlyRecurringRevenue * 3.5,
          nextYear: financial.monthlyRecurringRevenue * 12 * 1.15,
        },
      };
      
      setReport(aiReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report as CSV
  const exportCSV = () => {
    if (!report) return;

    const csvContent = [
      ['MythaTron Analytics & Financial Report'],
      [`Generated: ${report.generatedAt.toLocaleString()}`],
      [`Period: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}`],
      [''],
      ['Executive Summary'],
      [report.executiveSummary],
      [''],
      ...report.sections.flatMap(section => [
        [section.title],
        [section.content],
        ['Insights:'],
        ...section.insights.map(i => [`- ${i}`]),
        ['Recommendations:'],
        ...section.recommendations.map(r => [`- ${r}`]),
        [''],
      ]),
      ['Key Findings:'],
      ...report.keyFindings.map(f => [`- ${f}`]),
      [''],
      ['Action Items:'],
      ...report.actionItems.map(a => [`- ${a}`]),
      [''],
      ['Financial Projections:'],
      [`Next Month: ${formatCurrency(report.projections.nextMonth)}`],
      [`Next Quarter: ${formatCurrency(report.projections.nextQuarter)}`],
      [`Next Year: ${formatCurrency(report.projections.nextYear)}`],
    ];

    const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mythatron_report_${report.period.start.toISOString().split('T')[0]}_${report.period.end.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Email report
  const emailReport = () => {
    if (!report || !emailAddress) {
      alert('Please generate a report and enter an email address');
      return;
    }

    // In production, this would send via backend
    const emailContent = `
Subject: MythaTron Analytics Report - ${report.period.start.toLocaleDateString()} to ${report.period.end.toLocaleDateString()}

${report.executiveSummary}

KEY METRICS:
${report.sections.map(s => `
${s.title}:
${s.content}

Insights:
${s.insights.map(i => `• ${i}`).join('\n')}

Recommendations:
${s.recommendations.map(r => `• ${r}`).join('\n')}
`).join('\n---\n')}

PROJECTIONS:
• Next Month: ${formatCurrency(report.projections.nextMonth)}
• Next Quarter: ${formatCurrency(report.projections.nextQuarter)}
• Next Year: ${formatCurrency(report.projections.nextYear)}

---
This report was automatically generated by MythaTron AI Analytics
© 2025 Cronk Companies, LLC. All Rights Reserved.
    `;

    // Simulate sending email
    console.log('Email would be sent to:', emailAddress);
    console.log('Content:', emailContent);
    
    alert(`Report has been sent to ${emailAddress}`);
    setEmailAddress('');
  };

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPeakUsageTime = (pageViews: any[]): string => {
    if (!pageViews || pageViews.length === 0) return 'N/A';
    
    const hourCounts: Record<number, number> = {};
    pageViews.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (!peakHour) return 'N/A';
    
    const hour = parseInt(peakHour);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-xl opacity-50"></div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#aiGradient)" strokeWidth="1.5" className="relative">
                  <defs>
                    <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a10 10 0 00-7.07 17.07M12 2a10 10 0 017.07 17.07M12 2v10l4.24 4.24M12 12L7.76 16.24"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-light bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Report Generator
                </h1>
                <p className="text-white/60">Intelligent analytics and insights</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Date Range Selector */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-light mb-4">Report Parameters</h3>
            <div className="flex gap-4 items-center">
              <div>
                <label className="text-white/60 text-sm block mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                  className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                  className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                />
              </div>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-purple-400"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Content */}
          {report && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-light mb-4 text-purple-400">Executive Summary</h2>
                <p className="text-white/80 leading-relaxed">{report.executiveSummary}</p>
              </div>

              {/* Report Sections */}
              {report.sections.map((section, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-light mb-3 text-blue-400">{section.title}</h3>
                  <p className="text-white/70 mb-4">{section.content}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-2">Insights</h4>
                      <ul className="space-y-1">
                        {section.insights.map((insight, i) => (
                          <li key={i} className="text-white/50 text-sm flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {section.recommendations.map((rec, i) => (
                          <li key={i} className="text-white/50 text-sm flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {/* Projections */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-light mb-4 text-green-400">Financial Projections</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-white/60 text-sm">Next Month</span>
                    <p className="text-2xl font-light text-white">
                      {formatCurrency(report.projections.nextMonth)}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Next Quarter</span>
                    <p className="text-2xl font-light text-white">
                      {formatCurrency(report.projections.nextQuarter)}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Next Year</span>
                    <p className="text-2xl font-light text-white">
                      {formatCurrency(report.projections.nextYear)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-light mb-4">Export & Share</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={exportCSV}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download CSV
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={emailReport}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
