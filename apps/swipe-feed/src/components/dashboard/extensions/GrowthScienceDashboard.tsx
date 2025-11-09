/**
 * Growth Science Dashboard
 * Advanced growth metrics, experimentation, and user behavior analytics
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons/Icons';

export interface GrowthMetrics {
  viralCoefficient: number;
  viralCycle: number; // days
  activationRate: number;
  referralRate: number;
  nps: number; // Net Promoter Score
  productMarketFit: number; // 0-100 scale
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  dailyActiveUsers: number;
  stickiness: number; // DAU/MAU ratio
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'planning' | 'running' | 'completed' | 'failed';
  startDate: Date;
  endDate?: Date;
  variants: ExperimentVariant[];
  metrics: ExperimentMetrics;
  significance: number;
  winner?: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  allocation: number; // percentage
  users: number;
  conversions: number;
  revenue: number;
}

export interface ExperimentMetrics {
  primaryMetric: string;
  secondaryMetrics: string[];
  successCriteria: string;
  minimumSampleSize: number;
  currentSampleSize: number;
  confidence: number;
}

export interface UserSegment {
  id: string;
  name: string;
  size: number;
  growthRate: number;
  retentionRate: number;
  ltv: number;
  characteristics: string[];
  behaviors: string[];
}

interface Props {
  onExport?: (data: any, format: string) => void;
  dateRange?: { start: Date; end: Date };
}

export const GrowthScienceDashboard: React.FC<Props> = ({ onExport, dateRange }) => {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [selectedView, setSelectedView] = useState<'metrics' | 'experiments' | 'segments' | 'funnels'>('metrics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowthData();
  }, [dateRange]);

  const fetchGrowthData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API calls
      const mockMetrics: GrowthMetrics = {
        viralCoefficient: 1.3,
        viralCycle: 7,
        activationRate: 68.5,
        referralRate: 24.3,
        nps: 72,
        productMarketFit: 78,
        weeklyActiveUsers: 5420,
        monthlyActiveUsers: 12800,
        dailyActiveUsers: 2100,
        stickiness: 16.4,
        growthRate: {
          daily: 2.3,
          weekly: 8.7,
          monthly: 22.5
        }
      };

      const mockExperiments: Experiment[] = [
        {
          id: 'exp-001',
          name: 'Onboarding Flow Optimization',
          hypothesis: 'Simplified onboarding will increase activation by 15%',
          status: 'running',
          startDate: new Date('2024-01-15'),
          variants: [
            {
              id: 'control',
              name: 'Control',
              allocation: 50,
              users: 1250,
              conversions: 856,
              revenue: 15840
            },
            {
              id: 'variant-a',
              name: 'Simplified Flow',
              allocation: 50,
              users: 1248,
              conversions: 982,
              revenue: 18168
            }
          ],
          metrics: {
            primaryMetric: 'Activation Rate',
            secondaryMetrics: ['Time to First Value', 'D7 Retention'],
            successCriteria: '15% lift in activation',
            minimumSampleSize: 2000,
            currentSampleSize: 2498,
            confidence: 95
          },
          significance: 0.98,
          winner: 'variant-a'
        },
        {
          id: 'exp-002',
          name: 'Pricing Page Redesign',
          hypothesis: 'New pricing page will increase paid conversions by 20%',
          status: 'planning',
          startDate: new Date('2024-02-01'),
          variants: [
            {
              id: 'control',
              name: 'Current Design',
              allocation: 33,
              users: 0,
              conversions: 0,
              revenue: 0
            },
            {
              id: 'variant-a',
              name: 'Value-focused',
              allocation: 33,
              users: 0,
              conversions: 0,
              revenue: 0
            },
            {
              id: 'variant-b',
              name: 'Social Proof',
              allocation: 34,
              users: 0,
              conversions: 0,
              revenue: 0
            }
          ],
          metrics: {
            primaryMetric: 'Paid Conversion Rate',
            secondaryMetrics: ['ARPU', 'Tier Distribution'],
            successCriteria: '20% lift in conversions',
            minimumSampleSize: 3000,
            currentSampleSize: 0,
            confidence: 0
          },
          significance: 0
        }
      ];

      const mockSegments: UserSegment[] = [
        {
          id: 'power-users',
          name: 'Power Users',
          size: 850,
          growthRate: 5.2,
          retentionRate: 94.3,
          ltv: 847.20,
          characteristics: ['Daily active', 'Multiple features used', 'High engagement'],
          behaviors: ['Creates content daily', 'Invites friends', 'Premium subscriber']
        },
        {
          id: 'casual-creators',
          name: 'Casual Creators',
          size: 3200,
          growthRate: 12.8,
          retentionRate: 76.5,
          ltv: 234.50,
          characteristics: ['Weekly active', 'Single feature focus', 'Medium engagement'],
          behaviors: ['Creates weekly', 'Consumes content', 'Free tier']
        },
        {
          id: 'lurkers',
          name: 'Lurkers',
          size: 5800,
          growthRate: 18.3,
          retentionRate: 42.1,
          ltv: 12.30,
          characteristics: ['Monthly active', 'Read-only', 'Low engagement'],
          behaviors: ['Browses content', 'Rarely interacts', 'No creation']
        },
        {
          id: 'enterprise',
          name: 'Enterprise Users',
          size: 120,
          growthRate: 8.9,
          retentionRate: 98.2,
          ltv: 4250.00,
          characteristics: ['Team accounts', 'API usage', 'High volume'],
          behaviors: ['Bulk operations', 'Integrations', 'Premium support']
        }
      ];

      setMetrics(mockMetrics);
      setExperiments(mockExperiments);
      setSegments(mockSegments);
    } catch (error) {
      console.error('Failed to fetch growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportGrowthData = (format: 'csv' | 'json') => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      experiments,
      segments,
      insights: generateGrowthInsights()
    };

    if (onExport) {
      onExport(exportData, format);
    } else {
      downloadData(exportData, format);
    }
  };

  const generateGrowthInsights = () => {
    if (!metrics) return [];

    const insights = [];

    if (metrics.viralCoefficient > 1) {
      insights.push({
        type: 'positive',
        message: `Viral coefficient of ${metrics.viralCoefficient} indicates organic growth potential`
      });
    }

    if (metrics.stickiness < 20) {
      insights.push({
        type: 'warning',
        message: 'Low DAU/MAU ratio suggests engagement issues'
      });
    }

    if (metrics.nps > 70) {
      insights.push({
        type: 'positive',
        message: 'Excellent NPS score indicates strong user satisfaction'
      });
    }

    return insights;
  };

  const downloadData = (data: any, format: string) => {
    const content = format === 'csv' ? convertToCSV(data) : JSON.stringify(data, null, 2);
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `growth_science_${Date.now()}.${format}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any): string => {
    const rows: string[] = [];
    
    // Growth Metrics
    rows.push('Growth Metrics');
    rows.push('Metric,Value');
    if (metrics) {
      rows.push(`Viral Coefficient,${metrics.viralCoefficient}`);
      rows.push(`Viral Cycle (days),${metrics.viralCycle}`);
      rows.push(`Activation Rate,${metrics.activationRate}%`);
      rows.push(`Referral Rate,${metrics.referralRate}%`);
      rows.push(`NPS,${metrics.nps}`);
      rows.push(`Product-Market Fit,${metrics.productMarketFit}%`);
      rows.push(`DAU,${metrics.dailyActiveUsers}`);
      rows.push(`WAU,${metrics.weeklyActiveUsers}`);
      rows.push(`MAU,${metrics.monthlyActiveUsers}`);
      rows.push(`Stickiness,${metrics.stickiness}%`);
    }

    // Experiments
    rows.push('');
    rows.push('Active Experiments');
    rows.push('Name,Status,Confidence,Winner');
    experiments.forEach(exp => {
      rows.push(`${exp.name},${exp.status},${exp.confidence}%,${exp.winner || 'TBD'}`);
    });

    // Segments
    rows.push('');
    rows.push('User Segments');
    rows.push('Segment,Size,Growth Rate,Retention,LTV');
    segments.forEach(seg => {
      rows.push(`${seg.name},${seg.size},${seg.growthRate}%,${seg.retentionRate}%,$${seg.ltv}`);
    });

    return rows.join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icons.Analytics size={24} />
            Growth Science Dashboard
          </h2>
          <p className="text-gray-400 mt-1">Experimentation, segmentation, and growth analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportGrowthData('csv')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
          >
            <Icons.Export size={16} />
            Export CSV
          </button>
          <button
            onClick={() => exportGrowthData('json')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <Icons.Export size={16} />
            Export JSON
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {(['metrics', 'experiments', 'segments', 'funnels'] as const).map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 capitalize ${
              selectedView === view 
                ? 'border-b-2 border-purple-500 text-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Metrics View */}
      {selectedView === 'metrics' && metrics && (
        <div className="space-y-6">
          {/* Key Growth Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GrowthCard
              title="Viral Coefficient"
              value={metrics.viralCoefficient.toFixed(2)}
              subtitle={`${metrics.viralCycle} day cycle`}
              status={metrics.viralCoefficient > 1 ? 'excellent' : 'warning'}
            />
            <GrowthCard
              title="Activation Rate"
              value={`${metrics.activationRate}%`}
              subtitle="New user activation"
              status={metrics.activationRate > 60 ? 'excellent' : 'warning'}
            />
            <GrowthCard
              title="NPS Score"
              value={metrics.nps.toString()}
              subtitle="Net Promoter Score"
              status={metrics.nps > 70 ? 'excellent' : metrics.nps > 30 ? 'good' : 'warning'}
            />
            <GrowthCard
              title="Product-Market Fit"
              value={`${metrics.productMarketFit}%`}
              subtitle="PMF Score"
              status={metrics.productMarketFit > 75 ? 'excellent' : 'good'}
            />
          </div>

          {/* Growth Rates */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Growth Rates</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Daily Growth</p>
                <p className="text-2xl font-bold text-green-500">+{metrics.growthRate.daily}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Weekly Growth</p>
                <p className="text-2xl font-bold text-green-500">+{metrics.growthRate.weekly}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Monthly Growth</p>
                <p className="text-2xl font-bold text-green-500">+{metrics.growthRate.monthly}%</p>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Activity</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400 text-sm">DAU</p>
                <p className="text-2xl font-bold">{metrics.dailyActiveUsers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">WAU</p>
                <p className="text-2xl font-bold">{metrics.weeklyActiveUsers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">MAU</p>
                <p className="text-2xl font-bold">{metrics.monthlyActiveUsers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Stickiness</p>
                <p className="text-2xl font-bold">{metrics.stickiness}%</p>
                <p className="text-xs text-gray-500">DAU/MAU</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experiments View */}
      {selectedView === 'experiments' && (
        <div className="space-y-4">
          {experiments.map(experiment => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      )}

      {/* Segments View */}
      {selectedView === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {segments.map(segment => (
            <SegmentCard key={segment.id} segment={segment} />
          ))}
        </div>
      )}

      {/* Funnels View */}
      {selectedView === 'funnels' && (
        <div className="space-y-6">
          <FunnelVisualization
            title="Activation Funnel"
            steps={[
              { name: 'Sign Up', users: 10000, rate: 100 },
              { name: 'Email Verified', users: 8500, rate: 85 },
              { name: 'Profile Created', users: 7200, rate: 72 },
              { name: 'First Action', users: 6850, rate: 68.5 },
              { name: 'Activated', users: 6850, rate: 68.5 }
            ]}
          />
          <FunnelVisualization
            title="Monetization Funnel"
            steps={[
              { name: 'Active Users', users: 6850, rate: 100 },
              { name: 'Trial Started', users: 2055, rate: 30 },
              { name: 'Payment Added', users: 1370, rate: 20 },
              { name: 'Converted', users: 959, rate: 14 }
            ]}
          />
        </div>
      )}
    </div>
  );
};

// Growth Card Component
const GrowthCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  status?: 'excellent' | 'good' | 'warning';
}> = ({ title, value, subtitle, status = 'good' }) => {
  const statusColors = {
    excellent: 'text-green-500 bg-green-500/10',
    good: 'text-blue-500 bg-blue-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10'
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${statusColors[status].split(' ')[1]}`}>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${statusColors[status].split(' ')[0]}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// Experiment Card Component
const ExperimentCard: React.FC<{ experiment: Experiment }> = ({ experiment }) => {
  const statusColors = {
    planning: 'text-gray-400',
    running: 'text-blue-500',
    completed: 'text-green-500',
    failed: 'text-red-500'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{experiment.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{experiment.hypothesis}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[experiment.status]}`}>
          {experiment.status.toUpperCase()}
        </span>
      </div>

      {experiment.status === 'running' && (
        <>
          {/* Variant Performance */}
          <div className="space-y-2 mb-4">
            {experiment.variants.map(variant => {
              const conversionRate = variant.users > 0 
                ? ((variant.conversions / variant.users) * 100).toFixed(1)
                : '0';
              
              return (
                <div key={variant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{variant.name}</span>
                    {experiment.winner === variant.id && (
                      <span className="text-xs text-green-500 font-semibold">WINNER</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{conversionRate}%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({variant.conversions}/{variant.users})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Sample Size</span>
              <span>{experiment.metrics.currentSampleSize}/{experiment.metrics.minimumSampleSize}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ 
                  width: `${Math.min(100, (experiment.metrics.currentSampleSize / experiment.metrics.minimumSampleSize) * 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Statistical Confidence</span>
            <span className={experiment.metrics.confidence >= 95 ? 'text-green-500' : 'text-yellow-500'}>
              {experiment.metrics.confidence}%
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// Segment Card Component
const SegmentCard: React.FC<{ segment: UserSegment }> = ({ segment }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{segment.name}</h3>
          <p className="text-gray-400 text-sm">{segment.size.toLocaleString()} users</p>
        </div>
        <span className="text-2xl font-bold text-green-500">+{segment.growthRate}%</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-xs">Retention</p>
          <p className="text-lg font-semibold">{segment.retentionRate}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">LTV</p>
          <p className="text-lg font-semibold">${segment.ltv.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-2">Key Behaviors</p>
        <div className="flex flex-wrap gap-1">
          {segment.behaviors.slice(0, 3).map((behavior, i) => (
            <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded">
              {behavior}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Funnel Visualization Component
const FunnelVisualization: React.FC<{
  title: string;
  steps: Array<{ name: string; users: number; rate: number }>;
}> = ({ title, steps }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{step.name}</span>
              <span>{step.users.toLocaleString()} ({step.rate}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-8">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-8 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${step.rate}%` }}
              >
                <span className="text-xs text-white font-semibold">{step.rate}%</span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="text-xs text-gray-500 mt-1">
                ↓ {((steps[index].users - steps[index + 1].users) / steps[index].users * 100).toFixed(1)}% drop
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowthScienceDashboard;
