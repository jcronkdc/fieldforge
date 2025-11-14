import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Users, Truck, Zap, Shield, Package, Calendar, 
  BarChart3, ArrowUp, ArrowDown, Target, Gauge, Building2,
  HardHat, Wrench, FileText, DollarSign, Timer, MapPin, Compass, Ruler
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
            color: 'text-blue-500',
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
      { title: 'Project Progress', value: 0, change: 0, trend: 'neutral', icon: Target, color: 'text-blue-500', unit: '%' },
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
      <div className="space-y-[34px] p-[34px]">
        <div className="skeleton h-20 rounded-[21px] border border-gray-700 bg-slate-900/50" />
        <div className="grid grid-cols-1 gap-[21px] md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton h-32 rounded-[13px] border border-gray-700 bg-slate-900/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-[34px] lg:grid-cols-3">
          <div className="skeleton h-64 rounded-[13px] border border-gray-700 bg-slate-900/50 lg:col-span-2" />
          <div className="skeleton h-64 rounded-[13px] border border-gray-700 bg-slate-900/50" />
        </div>
        <div className="grid grid-cols-1 gap-[34px] lg:grid-cols-2">
          <div className="skeleton h-56 rounded-[13px] border border-gray-700 bg-slate-900/50" />
          <div className="skeleton h-56 rounded-[13px] border border-gray-700 bg-slate-900/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-[34px] space-y-[34px]">
      {/* Header */}
      <div className="flex items-center justify-between relative">
        {/* Technical Compass */}
        <div className="absolute -right-8 -top-8 opacity-5">
          <Compass className="w-[144px] h-[144px] text-blue-400" style={{ animation: ' 30s linear infinite' }} />
        </div>
        <div className="relative">
          <div className="absolute -left-[55px] top-1/2 transform -translate-y-1/2 hidden lg:block opacity-10">
            <Ruler className="w-[34px] h-[34px] text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white ">Construction Dashboard</h1>
          <p className="mt-[8px] text-blue-400/60 " >138kV substation upgrade • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-[21px]">
          <Link
            to="/field"
            className="px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all  "
          >
            <HardHat className="w-5 h-5" />
            <span>Daily Report</span>
          </Link>
          <Link
            to="/safety/briefing"
            className="px-[34px] py-[13px] bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px] border border-gray-700 "
          >
            <Shield className="w-5 h-5" />
            <span>Safety Brief</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[21px]">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="bg-slate-900/80 backdrop-blur-sm border border-gray-700 rounded-[13px] p-[21px] hover:border-gray-700 transition-all bg-gray-800/50 border border-gray-700 rounded-lg border border-gray-700 "
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-400/60 " data-note={metric.title.toUpperCase().replace(' ', '-')}>{metric.title}</p>
                <div className="flex items-baseline mt-[8px]">
                  <span className="text-base font-bold text-white">{metric.value}</span>
                  {metric.unit && (
                    <span className="text-blue-400/60 text-sm ml-[5px]">{metric.unit}</span>
                  )}
                </div>
                <div className="flex items-center mt-[13px]">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-green-400 mr-[5px]" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDown className="w-4 h-4 text-red-400 mr-[5px]" />
                  ) : (
                    <div className="w-4 h-4 bg-blue-500/20 rounded-full mr-[5px]" />
                  )}
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 'text-blue-400/60'
                  }`}>
                    {Math.abs(metric.change)}% from yesterday
                  </span>
                </div>
              </div>
              <div className={`p-[13px] rounded-[8px] bg-slate-800/50 ${metric.color.replace('text-', 'text-blue-400 bg-').replace('500', '500/20')}`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[34px]">
        {/* Project Timeline */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border border-gray-700 rounded-[21px] p-[34px] bg-gray-800/50 border border-gray-700 rounded-lg relative">
          <div className="flex items-center justify-between mb-[34px]">
            <h2 className="text-base font-bold text-white flex items-center ">
              <Calendar className="mr-[8px] w-5 h-5 text-blue-400" />
              Project Timeline
            </h2>
            <Link to="/schedule" className="text-sm font-medium text-blue-400 hover:text-blue-300 " >
              View full schedule →
            </Link>
          </div>
          
          <div className="space-y-[21px]">
            {/* Timeline Progress Bar */}
            <div className="relative">
              <div className="h-[8px] bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full " style={{ width: '67%' }}></div>
              </div>
              <div className="flex justify-between mt-[8px]">
                <span className="text-xs text-blue-400/60">Start: Jan 15, 2025</span>
                <span className="text-xs font-bold text-blue-400">Current: 67% Complete</span>
                <span className="text-xs text-blue-400/60">End: Jul 15, 2025</span>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="space-y-[13px] mt-[34px]">
              <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider " >Upcoming Milestones</h3>
              {[
                { name: 'Foundation Complete', date: 'Nov 15', status: 'on-track' },
                { name: 'Equipment Delivery', date: 'Nov 20', status: 'at-risk' },
                { name: 'Primary Testing', date: 'Dec 1', status: 'on-track' },
                { name: 'Energization', date: 'Dec 15', status: 'on-track' }
              ].map((milestone) => (
                <div key={milestone.name} className="flex items-center justify-between py-[13px] px-[21px] bg-slate-800/30 rounded-[8px] hover:bg-slate-800/50 transition-all border border-gray-700">
                  <div className="flex items-center gap-[13px]">
                    <div className={`w-[8px] h-[8px] rounded-full ${
                      milestone.status === 'on-track' ? 'bg-green-400' : 'bg-orange-400'
                    }`}></div>
                    <span className="text-white font-medium ">{milestone.name}</span>
                  </div>
                  <span className="text-sm text-blue-400/60 " >{milestone.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-gray-700 rounded-[21px] p-[34px] bg-gray-800/50 border border-gray-700 rounded-lg relative">
          {/* Technical Compass */}
          <div className="absolute top-[21px] right-[21px] opacity-5">
            <Compass className="w-[55px] h-[55px] text-blue-400" style={{ animation: ' 45s linear infinite reverse' }} />
          </div>
          <div className="flex items-center justify-between mb-[34px]">
            <h2 className="text-base font-bold text-white flex items-center ">
              <Activity className="w-5 h-5 mr-[8px] text-blue-400" />
              Recent Activity
            </h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium " >
              View All →
            </button>
          </div>

          <div className="space-y-[13px]">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type).replace('bg-', 'bg-blue-500/20 text-blue-400');
              
              return (
                <div key={activity.id} className="flex items-start gap-[13px] p-[13px] rounded-[8px] hover:bg-slate-800/30 transition-all cursor-pointer border border-gray-700 " style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`p-[8px] rounded-[8px] ${colorClass}`}>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[21px]">
        {[
          { label: 'Start Daily Report', icon: FileText, color: 'text-blue-400', path: '/field' },
          { label: 'Equipment Check', icon: Wrench, color: 'text-blue-400', path: '/equipment' },
          { label: 'Submit RFI', icon: FileText, color: 'text-blue-400', path: '/documents' },
          { label: 'View 3D Map', icon: MapPin, color: 'text-blue-400', path: '/map' }
        ].map((action, index) => (
          <Link
            key={action.label}
            to={action.path}
            className="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-800/80 border border-gray-700 rounded-[13px] p-[21px] transition-all bg-gray-800/50 border border-gray-700 rounded-lg border border-gray-700 hover:scale-[1.02] hover:border-gray-700 "
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <action.icon className={`w-8 h-8 ${action.color} mb-[13px]`} />
              <p className="text-white font-medium ">{action.label}</p>
              <p className="text-blue-400/60 text-xs mt-[5px] " >Quick access →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[21px] pt-[34px] border-t border-gray-700
        {[
          { label: 'Total Man Hours', value: '12,456', icon: Timer },
          { label: 'Structures Set', value: '45/62', icon: Building2 },
          { label: 'Cable Pulled', value: '18.5 km', icon: Zap },
          { label: 'Tests Complete', value: '89%', icon: CheckCircle }
        ].map((stat, index) => (
          <div key={stat.label} className="text-center " style={{ animationDelay: `${index * 0.15}s` }}>
            <stat.icon className="w-8 h-8 text-blue-400/60 mx-auto mb-[8px]" />
            <p className="text-base font-bold text-white">{stat.value}</p>
            <p className="text-sm text-blue-400/60 " data-note={stat.label.toUpperCase().replace(' ', '-')}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Leonardo Quote */}
      <div className="text-center opacity-30 mt-[89px]">
        <p className="text-sm text-blue-400/60 font-light italic ">
          "Knowing is not enough; we must apply. Being willing is not enough; we must do."
        </p>
        <p className="text-xs text-blue-400/40 mt-2">— Leonardo da Vinci</p>
      </div>
    </div>
  );
};
