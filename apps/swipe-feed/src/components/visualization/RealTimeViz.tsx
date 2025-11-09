import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, TrendingUp, TrendingDown, Zap, Users, Clock,
  DollarSign, Shield, AlertTriangle, CheckCircle, BarChart3,
  Gauge, Cpu, Waves, Network, Atom, Binary, Orbit,
  ArrowUp, ArrowDown, Minus, Building2, HardHat
} from 'lucide-react';
import { HolographicCard } from '../holographic/HolographicCard';

interface Metric {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ReactNode;
}

interface LiveDataPoint {
  timestamp: Date;
  value: number;
}

export const RealTimeViz: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: 'Productivity',
      value: 87,
      unit: '%',
      change: 5.2,
      trend: 'up',
      color: 'from-cyan-500 to-blue-600',
      icon: <Activity className="w-5 h-5" />
    },
    {
      label: 'Safety Score',
      value: 94,
      unit: '/100',
      change: 2.1,
      trend: 'up',
      color: 'from-green-500 to-emerald-600',
      icon: <Shield className="w-5 h-5" />
    },
    {
      label: 'Active Workers',
      value: 47,
      unit: '',
      change: -3,
      trend: 'down',
      color: 'from-purple-500 to-pink-600',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Energy Usage',
      value: 342,
      unit: 'kW',
      change: 12.5,
      trend: 'up',
      color: 'from-yellow-500 to-orange-600',
      icon: <Zap className="w-5 h-5" />
    },
    {
      label: 'Completion',
      value: 68,
      unit: '%',
      change: 1.8,
      trend: 'up',
      color: 'from-indigo-500 to-purple-600',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      label: 'Budget Used',
      value: 62,
      unit: '%',
      change: 0,
      trend: 'stable',
      color: 'from-pink-500 to-rose-600',
      icon: <DollarSign className="w-5 h-5" />
    }
  ]);

  const [liveData, setLiveData] = useState<LiveDataPoint[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (19 - i) * 3000),
      value: 50 + Math.random() * 50
    }))
  );

  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics with random changes
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 2)),
        change: (Math.random() - 0.5) * 5
      })));

      // Update live data
      setLiveData(prev => [
        ...prev.slice(1),
        {
          timestamp: new Date(),
          value: 50 + Math.random() * 50
        }
      ]);

      // Trigger pulse animation
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4" />;
      case 'down': return <ArrowDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isGood: boolean) => {
    if (trend === 'stable') return 'text-gray-400';
    if (trend === 'up') return isGood ? 'text-green-400' : 'text-red-400';
    return isGood ? 'text-red-400' : 'text-green-400';
  };

  // Mini chart component
  const MiniChart: React.FC<{ data: LiveDataPoint[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="relative h-16 w-full">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area */}
          <path
            d={`
              M 0,${16}
              ${data.map((point, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 16 - ((point.value - minValue) / range) * 16;
                return `L ${x},${y}`;
              }).join(' ')}
              L 100,${16}
              Z
            `}
            fill="url(#gradient)"
            className="animate-pulse-slow"
          />
          
          {/* Line */}
          <path
            d={data.map((point, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 16 - ((point.value - minValue) / range) * 16;
              return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((point, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 16 - ((point.value - minValue) / range) * 16;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === data.length - 1 ? "3" : "1.5"}
                fill="rgb(168, 85, 247)"
                className={i === data.length - 1 ? 'animate-pulse' : ''}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Real-Time Analytics
          </h2>
          <p className="text-gray-400 mt-1">Live project metrics updated every 3 seconds</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 bg-green-500 rounded-full ${pulseAnimation ? 'animate-ping' : ''}`}></div>
          <span className="text-sm text-gray-400">LIVE</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            onClick={() => setSelectedMetric(selectedMetric === index ? null : index)}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedMetric === index ? 'scale-105' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r opacity-10 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl"
              style={{
                backgroundImage: `linear-gradient(to right, ${metric.color.replace('from-', '').replace(' to-', ', ')})`
              }}
            ></div>
            
            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors">
              {/* Metric Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-gradient-to-r ${metric.color} rounded-lg text-white`}>
                    {metric.icon}
                  </div>
                  <span className="text-gray-400 text-sm font-medium">{metric.label}</span>
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.trend === 'up')}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs font-semibold">
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Metric Value */}
              <div className="mb-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-white">
                    {metric.value.toFixed(metric.unit === '%' ? 0 : 1)}
                  </span>
                  <span className="text-gray-500 text-sm">{metric.unit}</span>
                </div>
              </div>

              {/* Mini Chart */}
              <MiniChart data={liveData} />

              {/* Hover Effect */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Activity Stream */}
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Network className="w-6 h-6 text-purple-400" />
            <span>Activity Stream</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs text-gray-400">STREAMING</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: <HardHat />, text: 'Crew A completed foundation pour', time: 'Just now', type: 'success' },
            { icon: <Shield />, text: 'Safety inspection passed - Zone 3', time: '2 min ago', type: 'info' },
            { icon: <AlertTriangle />, text: 'Weather alert: High winds expected', time: '5 min ago', type: 'warning' },
            { icon: <CheckCircle />, text: 'Milestone reached: Phase 2 complete', time: '8 min ago', type: 'success' },
            { icon: <Users />, text: '5 workers checked in - East entrance', time: '12 min ago', type: 'info' }
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className={`p-2 rounded-lg ${
                activity.type === 'success' ? 'bg-green-500/20 text-green-400' :
                activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.text}</p>
                <p className="text-gray-500 text-xs">{activity.time}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Health Score */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Overall Project Health</h3>
            <div className="flex items-center space-x-4">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 * (1 - 0.89)}
                    className="text-purple-400 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">89%</div>
                    <div className="text-xs text-purple-400">Excellent</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">On Schedule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Within Budget</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Minor Issues</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Next Update</div>
            <div className="text-2xl font-mono text-purple-400">00:02:47</div>
          </div>
        </div>
      </div>
    </div>
  );
};
