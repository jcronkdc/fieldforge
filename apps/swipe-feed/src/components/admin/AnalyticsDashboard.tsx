/**
 * Analytics Dashboard - Comprehensive engagement and revenue analytics
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * ADMIN ONLY - Critical business intelligence
 */

import React, { useState, useEffect } from 'react';
import { Analytics } from '../../utils/analyticsTracker';
import type { EngagementMetrics, RevenueMetrics, FeatureMetrics } from '../../utils/analyticsTracker';

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [featureMetrics, setFeatureMetrics] = useState<FeatureMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'revenue' | 'features'>('engagement');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadMetrics = () => {
      const range = getTimeRange(timeRange);
      
      // Load engagement metrics
      const engagement = Analytics.getEngagementMetrics(range);
      setEngagementMetrics(engagement);
      
      // Load revenue metrics
      const revenue = Analytics.getRevenueMetrics(range);
      setRevenueMetrics(revenue);
      
      // Load feature metrics
      const features = Analytics.getFeatureMetrics(range);
      setFeatureMetrics(features);
    };

    loadMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      loadMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange, refreshKey]);

  const getTimeRange = (range: string): { start: Date; end: Date } | undefined => {
    if (range === 'all') return undefined;
    
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
    }
    
    return { start, end };
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMostEngagedFeatures = (): ChartData[] => {
    if (!engagementMetrics) return [];
    
    return Object.entries(engagementMetrics.featureUsage)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const getLeastEngagedFeatures = (): ChartData[] => {
    const allFeatures = [
      'Story Branches',
      'Angry Lips',
      'RPG System',
      'Screenplay Conversion',
      'Poem Generation',
      'Song Creation',
      'Messaging',
      'Democratic Ads',
    ];
    
    const usage = engagementMetrics?.featureUsage || {};
    
    return allFeatures
      .map(feature => ({
        label: feature,
        value: usage[feature] || 0,
      }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 5);
  };

  const getRevenueByFeature = (): ChartData[] => {
    if (!revenueMetrics) return [];
    
    return Object.entries(revenueMetrics.revenueByFeature)
      .map(([label, value]) => ({
        label,
        value,
        percentage: revenueMetrics.totalRevenue > 0 
          ? (value / revenueMetrics.totalRevenue) * 100 
          : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const exportAnalytics = () => {
    const data = Analytics.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-white/60">Engagement and revenue insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={exportAnalytics}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              Export Data
            </button>
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {engagementMetrics && (
            <>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <p className="text-xs text-white/60 mb-1">Session Duration</p>
                <p className="text-2xl font-light text-white">
                  {formatDuration(engagementMetrics.sessionDuration)}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <p className="text-xs text-white/60 mb-1">Page Views</p>
                <p className="text-2xl font-light text-white">
                  {Object.values(engagementMetrics.pageViews).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <p className="text-xs text-white/60 mb-1">Click Events</p>
                <p className="text-2xl font-light text-white">
                  {engagementMetrics.clickEvents}
                </p>
              </div>
            </>
          )}
          {revenueMetrics && (
            <>
              <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
                <p className="text-xs text-green-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-light text-green-400">
                  {formatCurrency(revenueMetrics.totalRevenue)}
                </p>
              </div>
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
                <p className="text-xs text-purple-400 mb-1">Avg Order Value</p>
                <p className="text-2xl font-light text-purple-400">
                  {formatCurrency(revenueMetrics.averageOrderValue)}
                </p>
              </div>
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4">
                <p className="text-xs text-blue-400 mb-1">Conversion Rate</p>
                <p className="text-2xl font-light text-blue-400">
                  {revenueMetrics.conversionRate.toFixed(1)}%
                </p>
              </div>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {(['engagement', 'revenue', 'features'] as const).map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-6 py-2 rounded-lg text-sm capitalize transition-all ${
                selectedMetric === metric
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-2 gap-6">
          {selectedMetric === 'engagement' && engagementMetrics && (
            <>
              {/* Most Engaged Features */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  🔥 Highest Engagement
                </h3>
                <div className="space-y-3">
                  {getMostEngagedFeatures().map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-light text-white/40">#{index + 1}</span>
                        <span className="text-white">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-medium">{item.value}</span>
                        <span className="text-xs text-white/40">uses</span>
                      </div>
                    </div>
                  ))}
                  {getMostEngagedFeatures().length === 0 && (
                    <p className="text-white/40">No engagement data yet</p>
                  )}
                </div>
              </div>

              {/* Least Engaged Features */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  ⚠️ Needs Attention
                </h3>
                <div className="space-y-3">
                  {getLeastEngagedFeatures().map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.value === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {item.value}
                        </span>
                        <span className="text-xs text-white/40">uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Views */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  📊 Page Views
                </h3>
                <div className="space-y-3">
                  {Object.entries(engagementMetrics.pageViews)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([page, views]) => (
                      <div key={page} className="flex items-center justify-between">
                        <span className="text-white">{page}</span>
                        <span className="text-blue-400 font-medium">{views}</span>
                      </div>
                    ))}
                  {Object.keys(engagementMetrics.pageViews).length === 0 && (
                    <p className="text-white/40">No page view data yet</p>
                  )}
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  📈 Engagement Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Bounce Rate</span>
                    <span className={`font-medium ${engagementMetrics.bounceRate > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                      {(engagementMetrics.bounceRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Scroll Depth</span>
                    <span className="text-white font-medium">{engagementMetrics.scrollDepth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Clicks</span>
                    <span className="text-white font-medium">{engagementMetrics.clickEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Session Time</span>
                    <span className="text-white font-medium">
                      {formatDuration(engagementMetrics.sessionDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedMetric === 'revenue' && revenueMetrics && (
            <>
              {/* Revenue by Feature */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  💰 Revenue by Feature
                </h3>
                <div className="space-y-3">
                  {getRevenueByFeature().map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white">{item.label}</span>
                        <span className="text-green-400 font-medium">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {getRevenueByFeature().length === 0 && (
                    <p className="text-white/40">No revenue data yet</p>
                  )}
                </div>
              </div>

              {/* Top Spenders */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  🏆 Top Spenders
                </h3>
                <div className="space-y-3">
                  {revenueMetrics.topSpenders.slice(0, 5).map((spender, index) => (
                    <div key={spender.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <span className="text-white font-mono text-sm">
                          {spender.userId.substring(0, 8)}...
                        </span>
                      </div>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(spender.total)}
                      </span>
                    </div>
                  ))}
                  {revenueMetrics.topSpenders.length === 0 && (
                    <p className="text-white/40">No purchase data yet</p>
                  )}
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 col-span-2">
                <h3 className="text-xl font-light text-white mb-4">
                  📊 Revenue Statistics
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Total Revenue</p>
                    <p className="text-2xl font-light text-green-400">
                      {formatCurrency(revenueMetrics.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Average Order</p>
                    <p className="text-2xl font-light text-blue-400">
                      {formatCurrency(revenueMetrics.averageOrderValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Conversion Rate</p>
                    <p className="text-2xl font-light text-purple-400">
                      {revenueMetrics.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Purchase Frequency</p>
                    <p className="text-2xl font-light text-orange-400">
                      {revenueMetrics.purchaseFrequency.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedMetric === 'features' && (
            <>
              {/* Feature Performance Table */}
              <div className="col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  Feature Performance Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/60 font-normal">Feature</th>
                        <th className="text-right py-3 px-4 text-white/60 font-normal">Usage Count</th>
                        <th className="text-right py-3 px-4 text-white/60 font-normal">Unique Users</th>
                        <th className="text-right py-3 px-4 text-white/60 font-normal">Revenue</th>
                        <th className="text-right py-3 px-4 text-white/60 font-normal">Error Rate</th>
                        <th className="text-right py-3 px-4 text-white/60 font-normal">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureMetrics.map((feature) => {
                        const health = feature.errorRate < 1 ? 'good' : feature.errorRate < 5 ? 'warning' : 'bad';
                        return (
                          <tr key={feature.feature} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-white">{feature.feature}</td>
                            <td className="py-3 px-4 text-right text-white">{feature.usageCount}</td>
                            <td className="py-3 px-4 text-right text-white">{feature.uniqueUsers}</td>
                            <td className="py-3 px-4 text-right text-green-400">
                              {formatCurrency(feature.conversionToRevenue)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={feature.errorRate > 5 ? 'text-red-400' : 'text-white'}>
                                {feature.errorRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                health === 'good' ? 'bg-green-400' :
                                health === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                              }`} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {featureMetrics.length === 0 && (
                    <p className="text-center py-8 text-white/40">No feature data available</p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="col-span-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
                <h3 className="text-xl font-light text-white mb-4">
                  💡 Recommendations
                </h3>
                <div className="space-y-3">
                  {getLeastEngagedFeatures().slice(0, 3).map((feature) => (
                    <div key={feature.label} className="p-3 bg-white/5 rounded-lg">
                      <p className="text-white mb-1">
                        <span className="text-yellow-400">⚠️</span> {feature.label} has low engagement
                      </p>
                      <p className="text-sm text-white/60">
                        Consider adding tutorials, improving UX, or promoting this feature
                      </p>
                    </div>
                  ))}
                  {revenueMetrics && revenueMetrics.conversionRate < 2 && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-white mb-1">
                        <span className="text-orange-400">💰</span> Low conversion rate detected
                      </p>
                      <p className="text-sm text-white/60">
                        Consider optimizing pricing, adding promotions, or improving checkout flow
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
