import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Users, Truck, Zap, Shield, Package, Calendar, 
  BarChart3, ArrowUp, ArrowDown, Target, Gauge, Building2,
  HardHat, Wrench, FileText, DollarSign, Timer, MapPin,
  Cpu, Radio, Wifi, Battery, Signal, Power
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  gradient: string;
  unit?: string;
}

export const FuturisticDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics] = useState<MetricCard[]>([
    {
      title: 'Grid Load',
      value: 67,
      change: 5,
      trend: 'up',
      icon: Power,
      gradient: 'from-cyan-500 to-blue-600',
      unit: 'MW'
    },
    {
      title: 'System Health',
      value: 98.5,
      change: 0.5,
      trend: 'up',
      icon: Signal,
      gradient: 'from-green-500 to-emerald-600',
      unit: '%'
    },
    {
      title: 'Active Crews',
      value: 8,
      change: 2,
      trend: 'up',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      unit: 'teams'
    },
    {
      title: 'Voltage Stability',
      value: 138.2,
      change: -0.3,
      trend: 'down',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      unit: 'kV'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setTimeout(() => setLoading(false), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-cyan-500/30 rounded-full animate-spin" />
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Zap className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slide 20s linear infinite'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                COMMAND CENTER
              </h1>
              <p className="text-cyan-400/60 mt-1">138kV Substation Control System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                  <span className="text-xs text-green-500 font-['Exo 2']">SYSTEM ONLINE</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg">
                <span className="text-cyan-400 font-['Orbitron'] text-sm">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'EMERGENCY SHUTDOWN', icon: AlertTriangle, color: 'from-red-500 to-pink-600' },
              { label: 'SYSTEM DIAGNOSTICS', icon: Activity, color: 'from-cyan-500 to-blue-600' },
              { label: 'CREW DISPATCH', icon: Users, color: 'from-purple-500 to-indigo-600' },
              { label: 'GRID ANALYSIS', icon: BarChart3, color: 'from-green-500 to-emerald-600' }
            ].map((action, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 bg-gradient-to-r ${action.color} rounded-lg flex items-center space-x-2 hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-2xl`}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-xs font-semibold font-['Orbitron']">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="relative group"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${metric.gradient} rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity`} />
              
              <div className="relative bg-slate-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${metric.gradient} rounded-lg shadow-lg`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  {metric.trend !== 'neutral' && (
                    <div className={`flex items-center space-x-1 text-xs ${
                      metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-cyan-400/80 text-xs font-medium mb-2 uppercase tracking-wider">
                  {metric.title}
                </h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold font-['Orbitron']">{metric.value}</span>
                  {metric.unit && (
                    <span className="ml-2 text-cyan-400/60 text-sm">{metric.unit}</span>
                  )}
                </div>

                {/* Mini Chart */}
                <div className="mt-4 h-8 flex items-end space-x-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-cyan-500/50 to-cyan-500/20 rounded-t"
                      style={{ height: `${30 + Math.random() * 70}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Power Grid Visualization */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-slate-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-['Orbitron'] text-cyan-400">
                    POWER GRID STATUS
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-xs text-green-500">LIVE</span>
                  </div>
                </div>

                {/* Grid Visualization */}
                <div className="h-64 bg-slate-950/50 rounded-lg p-4 relative overflow-hidden">
                  {/* Animated Power Lines */}
                  <svg className="w-full h-full">
                    <defs>
                      <linearGradient id="powerFlow">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    
                    {/* Main Transmission Lines */}
                    <line x1="10%" y1="50%" x2="90%" y2="50%" 
                      stroke="url(#powerFlow)" strokeWidth="3" opacity="0.8">
                      <animate attributeName="x1" from="10%" to="90%" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="x2" from="90%" to="170%" dur="3s" repeatCount="indefinite" />
                    </line>
                    
                    {/* Substations */}
                    <circle cx="25%" cy="50%" r="20" fill="none" stroke="#ffb800" strokeWidth="2" />
                    <circle cx="50%" cy="50%" r="20" fill="none" stroke="#ffb800" strokeWidth="2" />
                    <circle cx="75%" cy="50%" r="20" fill="none" stroke="#ffb800" strokeWidth="2" />
                    
                    {/* Power Flow Indicators */}
                    <text x="25%" y="80%" fill="#14f195" fontSize="12" fontFamily="Orbitron" textAnchor="middle">
                      45.2 MW
                    </text>
                    <text x="50%" y="80%" fill="#14f195" fontSize="12" fontFamily="Orbitron" textAnchor="middle">
                      67.8 MW
                    </text>
                    <text x="75%" y="80%" fill="#14f195" fontSize="12" fontFamily="Orbitron" textAnchor="middle">
                      52.1 MW
                    </text>
                  </svg>

                  {/* Status Indicators */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-400">Primary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-400">Secondary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-400">Distribution</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-slate-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold font-['Orbitron'] text-cyan-400 mb-6">
                SYSTEM ACTIVITY
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {[
                  { icon: Shield, text: 'Safety protocol activated', time: '2m ago', status: 'success' },
                  { icon: Zap, text: 'Voltage spike detected - Line 3', time: '5m ago', status: 'warning' },
                  { icon: Users, text: 'Crew B completed installation', time: '12m ago', status: 'info' },
                  { icon: Package, text: 'Transformer delivered to Pad 5', time: '28m ago', status: 'info' },
                  { icon: AlertTriangle, text: 'Weather alert: High winds', time: '1h ago', status: 'danger' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-950/50 rounded-lg hover:bg-slate-950/70 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-500/20' :
                      activity.status === 'warning' ? 'bg-amber-500/20' :
                      activity.status === 'danger' ? 'bg-red-500/20' :
                      'bg-cyan-500/20'
                    }`}>
                      <activity.icon className={`w-4 h-4 ${
                        activity.status === 'success' ? 'text-green-500' :
                        activity.status === 'warning' ? 'text-amber-500' :
                        activity.status === 'danger' ? 'text-red-500' :
                        'text-cyan-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Battery, label: 'CAPACITY', value: '85%', color: 'text-green-500' },
            { icon: Activity, label: 'LOAD FACTOR', value: '0.72', color: 'text-cyan-500' },
            { icon: Timer, label: 'UPTIME', value: '99.98%', color: 'text-purple-500' },
            { icon: Shield, label: 'SECURITY', value: 'MAX', color: 'text-amber-500' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 flex items-center space-x-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-xs text-gray-400 uppercase">{stat.label}</p>
                <p className="text-xl font-bold font-['Orbitron']">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};
