/**
 * Profitability Deep Dive Dashboard Extension
 * Advanced financial analytics and margin optimization
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons/Icons';

export interface ProfitabilityMetrics {
  grossMargin: number;
  netMargin: number;
  ebitda: number;
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  ltvCacRatio: number;
  paybackPeriod: number; // months
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number;
  retentionRate: number;
  arpu: number; // Average Revenue Per User
  unitEconomics: {
    revenuePerUser: number;
    costPerUser: number;
    marginPerUser: number;
  };
}

export interface CohortAnalysis {
  cohortId: string;
  cohortMonth: string;
  userCount: number;
  revenue: number[];
  retention: number[];
  ltv: number;
  paybackMonth: number;
}

export interface ProfitabilitySegment {
  segment: string;
  userCount: number;
  revenue: number;
  costs: number;
  margin: number;
  marginPercent: number;
  growth: number;
}

interface Props {
  onExport?: (data: any, format: string) => void;
  dateRange?: { start: Date; end: Date };
}

export const ProfitabilityDeepDive: React.FC<Props> = ({ onExport, dateRange }) => {
  const [metrics, setMetrics] = useState<ProfitabilityMetrics | null>(null);
  const [cohorts, setCohorts] = useState<CohortAnalysis[]>([]);
  const [segments, setSegments] = useState<ProfitabilitySegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'cohorts' | 'segments' | 'forecast'>('overview');

  useEffect(() => {
    fetchProfitabilityData();
  }, [dateRange]);

  const fetchProfitabilityData = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      const mockMetrics: ProfitabilityMetrics = {
        grossMargin: 68.3,
        netMargin: 45.2,
        ebitda: 2850000,
        cac: 47.50,
        ltv: 389.70,
        ltvCacRatio: 8.2,
        paybackPeriod: 3.2,
        mrr: 148920,
        arr: 1787040,
        churnRate: 2.8,
        retentionRate: 97.2,
        arpu: 18.50,
        unitEconomics: {
          revenuePerUser: 18.50,
          costPerUser: 5.89,
          marginPerUser: 12.61
        }
      };

      const mockCohorts: CohortAnalysis[] = [
        {
          cohortId: '2024-01',
          cohortMonth: 'January 2024',
          userCount: 1250,
          revenue: [18500, 17800, 17200, 16900, 16500, 16200],
          retention: [100, 95, 91, 88, 85, 82],
          ltv: 389.70,
          paybackMonth: 3
        },
        {
          cohortId: '2024-02',
          cohortMonth: 'February 2024',
          userCount: 1380,
          revenue: [20100, 19500, 18900, 18400, 18000],
          retention: [100, 96, 92, 89, 86],
          ltv: 412.30,
          paybackMonth: 3
        }
      ];

      const mockSegments: ProfitabilitySegment[] = [
        {
          segment: 'Free Tier',
          userCount: 7000,
          revenue: 0,
          costs: 19600,
          margin: -19600,
          marginPercent: 0,
          growth: 12.5
        },
        {
          segment: 'Creator Tier',
          userCount: 2000,
          revenue: 29980,
          costs: 11780,
          margin: 18200,
          marginPercent: 60.7,
          growth: 8.3
        },
        {
          segment: 'Guild Tier',
          userCount: 800,
          revenue: 23992,
          costs: 7040,
          margin: 16952,
          marginPercent: 70.6,
          growth: 15.2
        },
        {
          segment: 'Prime Tier',
          userCount: 200,
          revenue: 19998,
          costs: 3520,
          margin: 16478,
          marginPercent: 82.4,
          growth: 22.1
        }
      ];

      setMetrics(mockMetrics);
      setCohorts(mockCohorts);
      setSegments(mockSegments);
    } catch (error) {
      console.error('Failed to fetch profitability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportProfitabilityData = (format: 'csv' | 'json' | 'pdf') => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      cohorts,
      segments,
      analysis: generateAnalysis()
    };

    if (onExport) {
      onExport(exportData, format);
    } else {
      // Default export handling
      downloadData(exportData, format);
    }
  };

  const generateAnalysis = () => {
    if (!metrics) return null;

    return {
      health: metrics.ltvCacRatio > 3 ? 'Excellent' : metrics.ltvCacRatio > 2 ? 'Good' : 'Needs Improvement',
      recommendations: [
        metrics.churnRate > 5 ? 'Focus on retention - churn rate is high' : null,
        metrics.paybackPeriod > 12 ? 'Optimize CAC - payback period is too long' : null,
        metrics.grossMargin < 65 ? 'Increase pricing or reduce costs to improve margins' : null
      ].filter(Boolean),
      opportunities: [
        'Upsell Creator tier users to Guild tier',
        'Implement annual billing for 20% discount',
        'Launch referral program to reduce CAC'
      ]
    };
  };

  const downloadData = (data: any, format: string) => {
    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(data);
        mimeType = 'text/csv';
        filename = `profitability_${Date.now()}.csv`;
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename = `profitability_${Date.now()}.json`;
        break;
      default:
        return;
    }

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
    
    // Metrics section
    rows.push('Profitability Metrics');
    rows.push('Metric,Value');
    if (metrics) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            rows.push(`${key}_${subKey},${subValue}`);
          });
        } else {
          rows.push(`${key},${value}`);
        }
      });
    }

    // Segments section
    rows.push('');
    rows.push('Segment Analysis');
    rows.push('Segment,Users,Revenue,Costs,Margin,Margin%,Growth%');
    segments.forEach(segment => {
      rows.push(`${segment.segment},${segment.userCount},${segment.revenue},${segment.costs},${segment.margin},${segment.marginPercent},${segment.growth}`);
    });

    return rows.join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icons.Revenue size={24} />
            Profitability Deep Dive
          </h2>
          <p className="text-gray-400 mt-1">Advanced financial analytics and margin optimization</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportProfitabilityData('csv')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
          >
            <Icons.Export size={16} />
            Export CSV
          </button>
          <button
            onClick={() => exportProfitabilityData('json')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <Icons.Export size={16} />
            Export JSON
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {(['overview', 'cohorts', 'segments', 'forecast'] as const).map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 capitalize ${
              selectedView === view 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedView === 'overview' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Key Metrics Cards */}
          <MetricCard
            title="Gross Margin"
            value={`${metrics.grossMargin}%`}
            trend={metrics.grossMargin >= 65 ? 'up' : 'down'}
            target="≥65%"
            status={metrics.grossMargin >= 65 ? 'good' : 'warning'}
          />
          <MetricCard
            title="LTV/CAC Ratio"
            value={metrics.ltvCacRatio.toFixed(1)}
            trend={metrics.ltvCacRatio > 3 ? 'up' : 'down'}
            target=">3.0"
            status={metrics.ltvCacRatio > 3 ? 'good' : 'warning'}
          />
          <MetricCard
            title="MRR"
            value={`$${(metrics.mrr / 1000).toFixed(1)}k`}
            trend="up"
            growth="+12.3%"
            status="good"
          />
          <MetricCard
            title="Churn Rate"
            value={`${metrics.churnRate}%`}
            trend={metrics.churnRate < 5 ? 'down' : 'up'}
            target="<5%"
            status={metrics.churnRate < 5 ? 'good' : 'warning'}
          />

          {/* Unit Economics */}
          <div className="col-span-full bg-gray-800 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Unit Economics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Revenue per User</p>
                <p className="text-2xl font-bold text-green-500">
                  ${metrics.unitEconomics.revenuePerUser.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cost per User</p>
                <p className="text-2xl font-bold text-red-500">
                  ${metrics.unitEconomics.costPerUser.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Margin per User</p>
                <p className="text-2xl font-bold text-blue-500">
                  ${metrics.unitEconomics.marginPerUser.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'segments' && (
        <div className="space-y-4">
          {segments.map(segment => (
            <div key={segment.segment} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{segment.segment}</h3>
                  <p className="text-gray-400 text-sm">{segment.userCount.toLocaleString()} users</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{
                    color: segment.marginPercent > 65 ? '#10b981' : 
                           segment.marginPercent > 30 ? '#f59e0b' : '#ef4444'
                  }}>
                    {segment.marginPercent.toFixed(1)}%
                  </p>
                  <p className="text-gray-400 text-sm">margin</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-gray-400 text-sm">Revenue</p>
                  <p className="font-semibold">${segment.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Costs</p>
                  <p className="font-semibold">${segment.costs.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Margin</p>
                  <p className="font-semibold">${segment.margin.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Growth</p>
                  <p className="font-semibold text-green-500">+{segment.growth}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === 'cohorts' && (
        <div className="space-y-4">
          {cohorts.map(cohort => (
            <div key={cohort.cohortId} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">{cohort.cohortMonth}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Users</p>
                  <p className="text-xl font-bold">{cohort.userCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">LTV</p>
                  <p className="text-xl font-bold">${cohort.ltv.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payback</p>
                  <p className="text-xl font-bold">{cohort.paybackMonth} months</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">6M Retention</p>
                  <p className="text-xl font-bold">{cohort.retention[5] || 'N/A'}%</p>
                </div>
              </div>
              {/* Retention curve mini chart */}
              <div className="mt-4">
                <div className="flex items-end gap-1 h-20">
                  {cohort.retention.map((ret, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-blue-600"
                      style={{ height: `${ret}%` }}
                      title={`Month ${i}: ${ret}%`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Retention by month</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === 'forecast' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Profitability Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">3 Month Projection</p>
              <p className="text-3xl font-bold text-green-500">72.1%</p>
              <p className="text-sm text-gray-400">Gross Margin</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">6 Month Projection</p>
              <p className="text-3xl font-bold text-green-500">75.8%</p>
              <p className="text-sm text-gray-400">Gross Margin</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">12 Month Projection</p>
              <p className="text-3xl font-bold text-green-500">78.2%</p>
              <p className="text-sm text-gray-400">Gross Margin</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-700 rounded">
            <p className="text-sm text-gray-300">
              Based on current growth trends and cost optimization initiatives, 
              profitability is projected to improve steadily. Key drivers include 
              tier migration, reduced infrastructure costs, and improved retention.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  trend?: 'up' | 'down';
  target?: string;
  growth?: string;
  status?: 'good' | 'warning' | 'critical';
}> = ({ title, value, trend, target, growth, status = 'good' }) => {
  const statusColors = {
    good: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${statusColors[status]}`}>{value}</p>
      {target && (
        <p className="text-xs text-gray-500 mt-1">Target: {target}</p>
      )}
      {growth && (
        <p className="text-xs text-green-400 mt-1">{growth}</p>
      )}
      {trend && (
        <div className={`inline-block mt-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
};

export default ProfitabilityDeepDive;
