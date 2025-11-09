/**
 * Revenue Projection Dashboard - Track path to millions
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * ADMIN ONLY - Not visible to regular users
 */

import React, { useState, useEffect } from 'react';

interface RevenueMetrics {
  totalUsers: number;
  freeUsers: number;
  creatorSubs: number;
  proSubs: number;
  enterpriseSubs: number;
  avgSparksPerFreeUser: number;
  monthlyRevenue: number;
  yearlyProjection: number;
  profitMargin: number;
}

export function RevenueProjection() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalUsers: 100, // Beta users
    freeUsers: 65,
    creatorSubs: 20,
    proSubs: 10,
    enterpriseSubs: 5,
    avgSparksPerFreeUser: 30,
    monthlyRevenue: 0,
    yearlyProjection: 0,
    profitMargin: 0.7, // 70% profit after costs
  });

  const [projection, setProjection] = useState({
    months3: 0,
    months6: 0,
    months12: 0,
    targetUsers: 100000,
  });

  // Calculate revenue
  useEffect(() => {
    const subRevenue = 
      (metrics.creatorSubs * 9.99) +
      (metrics.proSubs * 19.99) +
      (metrics.enterpriseSubs * 49.99);
    
    const sparksRevenue = metrics.freeUsers * metrics.avgSparksPerFreeUser;
    
    const monthly = subRevenue + sparksRevenue;
    const yearly = monthly * 12;
    
    setMetrics(prev => ({
      ...prev,
      monthlyRevenue: monthly,
      yearlyProjection: yearly,
    }));
  }, [metrics.freeUsers, metrics.creatorSubs, metrics.proSubs, metrics.enterpriseSubs, metrics.avgSparksPerFreeUser]);

  // Growth projections
  const calculateGrowth = (months: number) => {
    const growthRate = 1.5; // 50% monthly growth
    const projectedUsers = metrics.totalUsers * Math.pow(growthRate, months);
    const projectedRevenue = (metrics.monthlyRevenue / metrics.totalUsers) * projectedUsers;
    return projectedRevenue;
  };

  useEffect(() => {
    setProjection({
      months3: calculateGrowth(3),
      months6: calculateGrowth(6),
      months12: calculateGrowth(12),
      targetUsers: 100000,
    });
  }, [metrics]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const targetMetrics = {
    users: [
      { label: '10K Users', revenue: 260000, timeline: '2-3 months' },
      { label: '50K Users', revenue: 1300000, timeline: '4-6 months' },
      { label: '100K Users', revenue: 2600000, timeline: '6-9 months' },
      { label: '250K Users', revenue: 6500000, timeline: '12 months' },
    ],
    optimization: [
      { action: 'Increase Creator tier to $14.99', impact: '+50%' },
      { action: 'Add $99/mo Studio tier', impact: '+30%' },
      { action: 'Corporate/Team plans', impact: '+40%' },
      { action: 'Marketplace fees (10%)', impact: '+25%' },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Revenue Projection Dashboard
            </h1>
            <p className="text-white/60 mt-2">Path to $5M Monthly Revenue</p>
          </div>
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

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Current MRR"
            value={formatCurrency(metrics.monthlyRevenue)}
            subtitle="Monthly Recurring Revenue"
            color="from-purple-500 to-blue-500"
          />
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            subtitle={`${metrics.freeUsers} free, ${metrics.totalUsers - metrics.freeUsers} paid`}
            color="from-blue-500 to-cyan-500"
          />
          <MetricCard
            title="ARPU"
            value={formatCurrency(metrics.monthlyRevenue / metrics.totalUsers)}
            subtitle="Average Revenue Per User"
            color="from-cyan-500 to-green-500"
          />
          <MetricCard
            title="Profit Margin"
            value={`${(metrics.profitMargin * 100).toFixed(0)}%`}
            subtitle={formatCurrency(metrics.monthlyRevenue * metrics.profitMargin) + ' profit'}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Growth Projections */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-2xl font-light mb-6">Growth Projections (50% Monthly Growth)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProjectionCard
              timeline="3 Months"
              revenue={projection.months3}
              users={Math.round(metrics.totalUsers * Math.pow(1.5, 3))}
            />
            <ProjectionCard
              timeline="6 Months"
              revenue={projection.months6}
              users={Math.round(metrics.totalUsers * Math.pow(1.5, 6))}
            />
            <ProjectionCard
              timeline="12 Months"
              revenue={projection.months12}
              users={Math.round(metrics.totalUsers * Math.pow(1.5, 12))}
            />
          </div>
        </div>

        {/* Path to Millions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-light mb-4">User Milestones</h3>
            <div className="space-y-4">
              {targetMetrics.users.map((target, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium">{target.label}</div>
                    <div className="text-sm text-white/60">{target.timeline}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-light text-green-400">
                      {formatCurrency(target.revenue)}/mo
                    </div>
                    <div className="text-xs text-white/40">
                      {formatCurrency(target.revenue * 12)}/yr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-light mb-4">Revenue Optimization</h3>
            <div className="space-y-4">
              {targetMetrics.optimization.map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{opt.action}</div>
                  </div>
                  <div className="text-green-400 font-medium">
                    {opt.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Strategy */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 p-6">
          <h3 className="text-xl font-light mb-4">Optimal Pricing Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Current Pricing</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Creator: $9.99/mo (500 Sparks)</li>
                <li>✓ Professional: $19.99/mo (1,200 Sparks)</li>
                <li>✓ Enterprise: $49.99/mo (3,000 Sparks)</li>
                <li>✓ Average Spark: $0.03</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Recommended Adjustments</h4>
              <ul className="space-y-2 text-sm">
                <li>→ Raise Creator to $14.99/mo</li>
                <li>→ Add Studio tier at $99.99/mo</li>
                <li>→ Implement surge pricing for AI</li>
                <li>→ Add team plans ($199+/mo)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-black/30 rounded-lg">
            <p className="text-sm text-white/80">
              <strong>Key Insight:</strong> With optimized pricing and 100K users, you can achieve 
              <span className="text-green-400 font-bold"> $3-5M monthly revenue</span>. 
              Focus on user acquisition and retention. The pricing model supports massive scale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }: any) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h3 className="text-sm font-medium text-white/60 mb-2">{title}</h3>
        <div className="text-3xl font-light mb-1">{value}</div>
        <p className="text-xs text-white/40">{subtitle}</p>
      </div>
    </div>
  );
}

function ProjectionCard({ timeline, revenue, users }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-lg">
      <h4 className="text-sm font-medium text-white/60 mb-3">{timeline}</h4>
      <div className="text-2xl font-light text-green-400 mb-1">
        {revenue >= 1000000 ? `$${(revenue / 1000000).toFixed(1)}M` : `$${Math.round(revenue / 1000)}K`}
      </div>
      <p className="text-sm text-white/60">{users.toLocaleString()} users</p>
    </div>
  );
}
