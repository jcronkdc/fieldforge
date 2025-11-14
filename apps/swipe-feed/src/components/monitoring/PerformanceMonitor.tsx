import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Zap, Cpu, HardDrive, Wifi, AlertTriangle,
  CheckCircle, TrendingUp, TrendingDown, BarChart3,
  Clock, Database, Globe, Server, Users, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface NetworkMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  timestamp: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const animationFrameRef = useRef<number>();

  // Initialize performance observer
  useEffect(() => {
    if (!isMonitoring) return;

    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      const newMetrics: PerformanceMetric[] = [
        {
          id: 'page-load',
          name: 'Page Load Time',
          value: Math.round(navigation?.loadEventEnd - navigation?.fetchStart) || 0,
          unit: 'ms',
          status: navigation?.loadEventEnd - navigation?.fetchStart < 3000 ? 'good' : 'warning',
          trend: 'stable',
          icon: Globe
        },
        {
          id: 'dom-ready',
          name: 'DOM Ready',
          value: Math.round(navigation?.domContentLoadedEventEnd - navigation?.fetchStart) || 0,
          unit: 'ms',
          status: navigation?.domContentLoadedEventEnd - navigation?.fetchStart < 1500 ? 'good' : 'warning',
          trend: 'stable',
          icon: Clock
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0,
          unit: 'MB',
          status: memory && memory.usedJSHeapSize / memory.jsHeapSizeLimit < 0.7 ? 'good' : 'warning',
          trend: 'up',
          icon: HardDrive
        },
        {
          id: 'fps',
          name: 'Frame Rate',
          value: 60, // Would need actual FPS calculation
          unit: 'FPS',
          status: 'good',
          trend: 'stable',
          icon: Activity
        },
        {
          id: 'api-latency',
          name: 'API Latency',
          value: calculateAverageLatency(),
          unit: 'ms',
          status: calculateAverageLatency() < 200 ? 'good' : calculateAverageLatency() < 500 ? 'warning' : 'critical',
          trend: 'stable',
          icon: Server
        },
        {
          id: 'active-connections',
          name: 'Active Connections',
          value: networkMetrics.filter(m => Date.now() - new Date(m.timestamp).getTime() < 60000).length,
          unit: '',
          status: 'good',
          trend: 'stable',
          icon: Wifi
        }
      ];

      setMetrics(newMetrics);
    };

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [resource, config] = args;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        const metric: NetworkMetric = {
          endpoint: typeof resource === 'string' ? resource : resource.url,
          method: config?.method || 'GET',
          responseTime: Math.round(endTime - startTime),
          status: response.status,
          timestamp: new Date().toISOString()
        };
        
        setNetworkMetrics(prev => [...prev.slice(-19), metric]); // Keep last 20
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        const metric: NetworkMetric = {
          endpoint: typeof resource === 'string' ? resource : resource.url,
          method: config?.method || 'GET',
          responseTime: Math.round(endTime - startTime),
          status: 0,
          timestamp: new Date().toISOString()
        };
        
        setNetworkMetrics(prev => [...prev.slice(-19), metric]);
        throw error;
      }
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial update

    return () => {
      clearInterval(interval);
      window.fetch = originalFetch; // Restore original fetch
    };
  }, [isMonitoring, networkMetrics]);

  const calculateAverageLatency = () => {
    if (networkMetrics.length === 0) return 0;
    const sum = networkMetrics.reduce((acc, m) => acc + m.responseTime, 0);
    return Math.round(sum / networkMetrics.length);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-blue-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-400/20';
      case 'warning': return 'bg-blue-400/20';
      case 'critical': return 'bg-red-400/20';
      default: return 'bg-gray-400/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[108px] right-[34px] w-[55px] h-[55px] bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full shadow-lg flex items-center justify-center group transition-all z-40"
      >
        <Zap className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-[108px] right-[34px] w-[400px] bg-slate-900 border border-slate-700 rounded-[21px] shadow-2xl z-40"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-[21px] border-b border-slate-700">
          <div className="flex items-center gap-[13px]">
            <div className="w-[34px] h-[34px] bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Performance Monitor</h3>
              <p className="text-xs text-slate-400">Real-time metrics</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-all"
          >
            ×
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="p-[21px] grid grid-cols-2 gap-[13px]">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const TrendIcon = getTrendIcon(metric.trend);
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-[13px] rounded-[13px] ${getStatusBg(metric.status)} border border-slate-700`}
              >
                <div className="flex items-start justify-between mb-[8px]">
                  <Icon className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                  <TrendIcon className="w-3 h-3 text-slate-500" />
                </div>
                
                <div className="space-y-[2px]">
                  <p className="text-xs text-slate-400">{metric.name}</p>
                  <p className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Network Activity */}
        <div className="px-[21px] pb-[21px]">
          <h4 className="text-sm font-medium text-slate-300 mb-[8px]">Recent Network Activity</h4>
          <div className="space-y-[5px] max-h-[150px] overflow-y-auto">
            {networkMetrics.slice(-5).reverse().map((metric, index) => (
              <div
                key={`${metric.endpoint}-${index}`}
                className="flex items-center justify-between text-xs p-[8px] bg-slate-800 rounded-[8px]"
              >
                <div className="flex items-center gap-[8px]">
                  <span className={`w-2 h-2 rounded-full ${
                    metric.status >= 200 && metric.status < 300 ? 'bg-green-400' :
                    metric.status >= 300 && metric.status < 400 ? 'bg-blue-400' :
                    metric.status >= 400 && metric.status < 500 ? 'bg-blue-400' :
                    'bg-red-400'
                  }`} />
                  <span className="text-slate-400 font-mono">{metric.method}</span>
                  <span className="text-slate-500 truncate max-w-[150px]">
                    {metric.endpoint.replace(/^.*\/api\//, '/api/')}
                  </span>
                </div>
                <span className={`font-mono ${
                  metric.responseTime < 200 ? 'text-green-400' :
                  metric.responseTime < 500 ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {metric.responseTime}ms
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between p-[13px] border-t border-slate-700">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center gap-[8px] px-[13px] py-[5px] rounded-[8px] text-xs font-medium transition-all ${
              isMonitoring
                ? 'bg-green-400/20 text-green-400'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {isMonitoring ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </button>
          
          <button
            onClick={() => setNetworkMetrics([])}
            className="px-[13px] py-[5px] bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-[8px] text-xs font-medium transition-all"
          >
            Clear History
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
