import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Users, Truck, Zap, Shield, Package, Calendar, 
  BarChart3, ArrowUp, ArrowDown, Target, Gauge, Building2,
  HardHat, Wrench, FileText, DollarSign, Timer, MapPin
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  unit?: string;
}

interface ActivityItem {
  id: string;
  type: 'safety' | 'equipment' | 'inspection' | 'crew' | 'weather' | 'document';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  user: string;
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch REAL data from analytics API
      const session = await supabase.auth.getSession();
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiMetrics = data.metrics || [];
        
        // Transform API response to dashboard format
        setMetrics([
          {
            title: 'Project Progress',
            value: apiMetrics.find((m: any) => m.title === 'Avg. Completion')?.value || 0,
            change: 5,
            trend: 'up',
            icon: Target,
            color: 'text-amber-500',
            unit: '%'
          },
          {
            title: 'Safety Score',
            value: apiMetrics.find((m: any) => m.title === 'Safety Score')?.value || 100,
            change: 0.5,
            trend: 'up',
            icon: Shield,
            color: 'text-green-500',
            unit: '%'
          },
          {
            title: 'Active Crews',
            value: apiMetrics.find((m: any) => m.title === 'Total Crews')?.value || 0,
            change: 2,
            trend: 'up',
            icon: Users,
            color: 'text-blue-500',
            unit: 'teams'
          },
          {
            title: 'Equipment Count',
            value: apiMetrics.find((m: any) => m.title === 'Total Equipment')?.value || 0,
            change: -3,
            trend: 'neutral',
            icon: Truck,
            color: 'text-purple-500',
            unit: 'units'
          },
          {
            title: 'Days Without Incident',
            value: apiMetrics.find((m: any) => m.title === 'Days Incident-Free')?.value || 0,
            change: 1,
            trend: 'up',
            icon: HardHat,
            color: 'text-emerald-500',
            unit: 'days'
          },
          {
            title: 'Total Projects',
            value: apiMetrics.find((m: any) => m.title === 'Total Projects')?.value || 0,
            change: -2,
            trend: 'neutral',
            icon: FileText,
            color: 'text-orange-500',
            unit: 'projects'
          },
          {
            title: 'Active Projects',
            value: apiMetrics.find((m: any) => m.title === 'Active Projects')?.value || 0,
            change: 1,
            trend: 'neutral',
            icon: Calendar,
            color: 'text-red-500',
            unit: 'projects'
          },
          {
            title: 'Budget Spent',
            value: Math.round(parseFloat(apiMetrics.find((m: any) => m.title === 'Budget Spent')?.value || '0')),
            change: 3,
            trend: 'neutral',
            icon: DollarSign,
            color: 'text-cyan-500',
            unit: '$'
          }
        ]);
      } else {
        console.error('Failed to fetch dashboard metrics');
        setDefaultMetrics();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDefaultMetrics();
    }

    // Fetch recent activities from real endpoints
    await fetchRecentActivities();
    
    setLoading(false);
  };

  const setDefaultMetrics = () => {
    // Fallback metrics with zero values
    setMetrics([
      { title: 'Project Progress', value: 0, change: 0, trend: 'neutral', icon: Target, color: 'text-amber-500', unit: '%' },
      { title: 'Safety Score', value: 100, change: 0, trend: 'neutral', icon: Shield, color: 'text-green-500', unit: '%' },
      { title: 'Active Crews', value: 0, change: 0, trend: 'neutral', icon: Users, color: 'text-blue-500', unit: 'teams' },
      { title: 'Equipment Count', value: 0, change: 0, trend: 'neutral', icon: Truck, color: 'text-purple-500', unit: 'units' },
      { title: 'Days Without Incident', value: 0, change: 0, trend: 'neutral', icon: HardHat, color: 'text-emerald-500', unit: 'days' },
      { title: 'Total Projects', value: 0, change: 0, trend: 'neutral', icon: FileText, color: 'text-orange-500', unit: 'projects' },
      { title: 'Active Projects', value: 0, change: 0, trend: 'neutral', icon: Calendar, color: 'text-red-500', unit: 'projects' },
      { title: 'Budget Spent', value: 0, change: 0, trend: 'neutral', icon: DollarSign, color: 'text-cyan-500', unit: '$' }
    ]);
  };

  const fetchRecentActivities = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const [safetyRes, projectRes] = await Promise.all([
        fetch('/api/safety/incidents?limit=3', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/projects?limit=2', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const activities: ActivityItem[] = [];
      
      // Add safety incidents
      if (safetyRes.ok) {
        const incidents = await safetyRes.json();
        incidents.forEach((incident: any, idx: number) => {
          activities.push({
            id: incident.id,
            type: 'safety',
            title: `${incident.type} - ${incident.severity}`,
            description: incident.description || 'Safety incident reported',
            timestamp: new Date(incident.reported_date || incident.created_at),
            priority: incident.severity === 'critical' ? 'critical' : incident.severity === 'high' ? 'high' : 'medium',
            user: incident.reported_by_name || 'Safety Team'
          });
        });
      }

      // Add project updates
      if (projectRes.ok) {
        const data = await projectRes.json();
        const projects = data.projects || [];
        projects.slice(0, 2).forEach((project: any) => {
          activities.push({
            id: project.id,
            type: 'document',
            title: `${project.name}`,
            description: `Progress: ${project.completion_percentage || 0}% complete`,
            timestamp: new Date(project.updated_at || project.created_at),
            priority: 'medium',
            user: 'Project Manager'
          });
        });
      }

      // Sort by timestamp and take most recent 5
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'safety': return Shield;
      case 'equipment': return Package;
      case 'inspection': return CheckCircle;
      case 'weather': return AlertTriangle;
      case 'document': return FileText;
      case 'crew': return Users;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'safety': return 'text-green-500 bg-green-500/10';
      case 'equipment': return 'text-blue-500 bg-blue-500/10';
      case 'inspection': return 'text-purple-500 bg-purple-500/10';
      case 'weather': return 'text-orange-500 bg-orange-500/10';
      case 'document': return 'text-cyan-500 bg-cyan-500/10';
      case 'crew': return 'text-indigo-500 bg-indigo-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="skeleton h-20 rounded-2xl border border-slate-800 bg-slate-900/50" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton h-32 rounded-xl border border-slate-800 bg-slate-900/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="skeleton h-64 rounded-xl border border-slate-800 bg-slate-900/50 lg:col-span-2" />
          <div className="skeleton h-64 rounded-xl border border-slate-800 bg-slate-900/50" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="skeleton h-56 rounded-xl border border-slate-800 bg-slate-900/50" />
          <div className="skeleton h-56 rounded-xl border border-slate-800 bg-slate-900/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold on-surface">Construction dashboard</h1>
          <p className="mt-1 on-surface-muted">Demo 138kV substation upgrade • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/field"
            className="btn btn-primary bg-amber-500 text-white hover:bg-amber-600"
          >
            <HardHat className="w-5 h-5" />
            <span>Daily report</span>
          </Link>
          <Link
            to="/safety/briefing"
            className="btn btn-secondary bg-green-500 text-white hover:bg-green-600"
          >
            <Shield className="w-5 h-5" />
            <span>Safety brief</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-800/70 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="on-surface-muted text-sm font-medium">{metric.title}</p>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold on-surface">{metric.value}</span>
                  {metric.unit && (
                    <span className="on-surface-muted text-sm ml-1">{metric.unit}</span>
                  )}
                </div>
                <div className="flex items-center mt-3">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  ) : (
                    <div className="w-4 h-4 bg-slate-600 rounded-full mr-1" />
                  )}
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 'text-slate-500'
                  }`}>
                    {Math.abs(metric.change)}% from yesterday
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-slate-700/50 ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Timeline */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Calendar className="mr-2 w-5 h-5 text-amber-500" />
              Project timeline
            </h2>
            <Link to="/schedule" className="text-sm font-medium text-amber-500 hover:text-amber-400">
              View full schedule →
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Timeline Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '67%' }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs on-surface-muted">Start: Jan 15, 2025</span>
                <span className="text-xs font-bold text-amber-500">Current: 67% Complete</span>
                <span className="text-xs on-surface-muted">End: Jul 15, 2025</span>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-medium on-surface-muted uppercase tracking-wider">Upcoming Milestones</h3>
              {[
                { name: 'Foundation Complete', date: 'Nov 15', status: 'on-track' },
                { name: 'Equipment Delivery', date: 'Nov 20', status: 'at-risk' },
                { name: 'Primary Testing', date: 'Dec 1', status: 'on-track' },
                { name: 'Energization', date: 'Dec 15', status: 'on-track' }
              ].map((milestone) => (
                <div key={milestone.name} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      milestone.status === 'on-track' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="on-surface font-medium">{milestone.name}</span>
                  </div>
                  <span className="text-sm on-surface-muted">{milestone.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold on-surface flex items-center">
              <Activity className="w-5 h-5 mr-2 text-amber-500" />
              Recent Activity
            </h2>
            <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="on-surface font-medium text-sm">{activity.title}</p>
                    <p className="on-surface-muted text-xs mt-0.5">{activity.description}</p>
                    <div className="flex items-center mt-2 text-xs on-surface-muted">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Start Daily Report', icon: FileText, color: 'bg-blue-500', path: '/field' },
          { label: 'Equipment Check', icon: Wrench, color: 'bg-purple-500', path: '/equipment' },
          { label: 'Submit RFI', icon: FileText, color: 'bg-cyan-500', path: '/documents' },
          { label: 'View 3D Map', icon: MapPin, color: 'bg-emerald-500', path: '/map' }
        ].map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="group relative overflow-hidden bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative z-10">
              <action.icon className={`w-8 h-8 ${action.color.replace('bg-', 'text-')} mb-3`} />
              <p className="text-white font-medium">{action.label}</p>
              <p className="text-slate-400 text-xs mt-1">Quick access →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-700">
        {[
          { label: 'Total Man Hours', value: '12,456', icon: Timer },
          { label: 'Structures Set', value: '45/62', icon: Building2 },
          { label: 'Cable Pulled', value: '18.5 km', icon: Zap },
          { label: 'Tests Complete', value: '89%', icon: CheckCircle }
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
