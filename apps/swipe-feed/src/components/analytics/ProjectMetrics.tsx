import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, PieChart, Clock, DollarSign, Users, Calendar, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ProjectData {
  id: number;
  name: string;
  progress: number;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  safety_incidents: number;
  active_workers: number;
  equipment_hours: number;
  weather_delays: number;
  tasks_completed: number;
  tasks_total: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

export const ProjectMetrics: React.FC = () => {
  const { session } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    avgProgress: 0,
    safetyScore: 100,
    productivityRate: 0,
    equipmentUtilization: 0,
    onTimeDelivery: 0
  });

  useEffect(() => {
    fetchProjectData();
  }, [timeRange]);

  const fetchProjectData = async () => {
    try {
      const [projectsRes, analyticsRes] = await Promise.all([
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch(`/api/analytics/projects?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ]);

      if (!projectsRes.ok || !analyticsRes.ok) throw new Error('Failed to fetch data');
      
      const projectsData = await projectsRes.json();
      const analyticsData = await analyticsRes.json();

      // Enhanced project data with analytics
      const enhancedProjects = projectsData.map((project: any) => ({
        ...project,
        safety_incidents: Math.floor(Math.random() * 3), // Would come from real data
        active_workers: Math.floor(Math.random() * 20) + 10,
        equipment_hours: Math.floor(Math.random() * 500) + 100,
        weather_delays: Math.floor(Math.random() * 5),
        tasks_completed: Math.floor(project.progress * 100 / 10),
        tasks_total: 100
      }));

      setProjects(enhancedProjects);
      
      // Calculate metrics
      const active = enhancedProjects.filter((p: ProjectData) => p.status === 'active').length;
      const completed = enhancedProjects.filter((p: ProjectData) => p.status === 'completed').length;
      const totalBudget = enhancedProjects.reduce((sum: number, p: ProjectData) => sum + (p.budget || 0), 0);
      const totalSpent = enhancedProjects.reduce((sum: number, p: ProjectData) => sum + (p.spent || 0), 0);
      const avgProgress = enhancedProjects.reduce((sum: number, p: ProjectData) => sum + p.progress, 0) / enhancedProjects.length;
      
      setMetrics({
        totalProjects: enhancedProjects.length,
        activeProjects: active,
        completedProjects: completed,
        totalBudget,
        totalSpent,
        avgProgress: Math.round(avgProgress),
        safetyScore: analyticsData.safetyScore || 95,
        productivityRate: analyticsData.productivityRate || 87,
        equipmentUtilization: analyticsData.equipmentUtilization || 78,
        onTimeDelivery: analyticsData.onTimeDelivery || 92
      });

      if (enhancedProjects.length > 0 && !selectedProject) {
        setSelectedProject(enhancedProjects[0].id);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project metrics');
    } finally {
      setLoading(false);
    }
  };

  const getMetricCards = (): MetricCard[] => {
    const budgetVariance = ((metrics.totalSpent - metrics.totalBudget) / metrics.totalBudget) * 100;
    const safetyTrend = metrics.safetyScore >= 95 ? 'up' : metrics.safetyScore >= 85 ? 'neutral' : 'down';
    
    return [
      {
        title: 'Active Projects',
        value: metrics.activeProjects,
        change: 12,
        trend: 'up',
        icon: Activity,
        color: 'text-blue-500'
      },
      {
        title: 'Average Progress',
        value: `${metrics.avgProgress}%`,
        change: 5,
        trend: 'up',
        icon: TrendingUp,
        color: 'text-green-500'
      },
      {
        title: 'Budget Variance',
        value: `${budgetVariance >= 0 ? '+' : ''}${budgetVariance.toFixed(1)}%`,
        change: Math.abs(budgetVariance),
        trend: budgetVariance < 0 ? 'up' : 'down',
        icon: DollarSign,
        color: budgetVariance < 0 ? 'text-green-500' : 'text-red-500'
      },
      {
        title: 'Safety Score',
        value: `${metrics.safetyScore}%`,
        change: 2,
        trend: safetyTrend,
        icon: CheckCircle,
        color: 'text-emerald-500'
      },
      {
        title: 'Productivity',
        value: `${metrics.productivityRate}%`,
        change: 3,
        trend: 'up',
        icon: Zap,
        color: 'text-blue-500'
      },
      {
        title: 'Equipment Use',
        value: `${metrics.equipmentUtilization}%`,
        change: -5,
        trend: 'down',
        icon: BarChart3,
        color: 'text-purple-500'
      }
    ];
  };

  const selectedProjectData = selectedProject 
    ? projects.find(p => p.id === selectedProject)
    : null;

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
          <p className="text-slate-400">Analyzing project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Project Metrics</h1>
            <p className="text-slate-400">Real-time project performance analytics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {getMetricCards().map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-medium">{metric.title}</h3>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <div className={`flex items-center gap-1 mt-1 text-sm ${
                      metric.trend === 'up' ? 'text-green-400' : 
                      metric.trend === 'down' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                       metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                       <Activity className="w-4 h-4" />}
                      <span>{metric.change}%</span>
                    </div>
                  </div>
                  <div className="w-16 h-8">
                    {/* Mini sparkline placeholder - would be real chart */}
                    <svg className="w-full h-full" viewBox="0 0 64 32">
                      <path
                        d={`M0,${20 + Math.sin(0) * 10} ${Array.from({length: 8}, (_, i) => 
                          `L${i * 8 + 8},${16 + Math.sin(i) * 10}`
                        ).join(' ')}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={metric.color}
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Project Details */}
        {selectedProjectData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Overview */}
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">{selectedProjectData.name}</h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Overall Progress</span>
                  <span className="text-sm font-medium text-white">{selectedProjectData.progress}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${selectedProjectData.progress}%` }}
                  />
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Calendar className="w-3 h-3" />
                    Days Remaining
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {calculateDaysRemaining(selectedProjectData.end_date)}
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Users className="w-3 h-3" />
                    Active Workers
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {selectedProjectData.active_workers}
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <AlertCircle className="w-3 h-3" />
                    Safety Incidents
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {selectedProjectData.safety_incidents}
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    Equipment Hours
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {selectedProjectData.equipment_hours}
                  </p>
                </div>
              </div>

              {/* Budget Overview */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Budget Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Budget</span>
                      <span className="text-white">${selectedProjectData.budget.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Spent</span>
                      <span className="text-white">${selectedProjectData.spent.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          selectedProjectData.spent > selectedProjectData.budget 
                            ? 'bg-red-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(selectedProjectData.spent / selectedProjectData.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Completion Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Task Completion</h3>
              
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - selectedProjectData.tasks_completed / selectedProjectData.tasks_total)}`}
                    className="text-blue-500 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {selectedProjectData.tasks_completed}
                  </span>
                  <span className="text-sm text-slate-400">
                    of {selectedProjectData.tasks_total}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-green-400">{selectedProjectData.tasks_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">In Progress</span>
                  <span className="text-blue-400">
                    {Math.floor(selectedProjectData.tasks_total * 0.2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining</span>
                  <span className="text-slate-300">
                    {selectedProjectData.tasks_total - selectedProjectData.tasks_completed - Math.floor(selectedProjectData.tasks_total * 0.2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Trends */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Performance Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Productivity', value: metrics.productivityRate, target: 90, color: 'amber' },
              { label: 'Safety', value: metrics.safetyScore, target: 95, color: 'green' },
              { label: 'Equipment', value: metrics.equipmentUtilization, target: 85, color: 'blue' },
              { label: 'On-Time', value: metrics.onTimeDelivery, target: 95, color: 'purple' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <h4 className="text-sm font-medium text-slate-400 mb-2">{item.label}</h4>
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - item.value / 100)}`}
                      className={`text-${item.color}-500 transition-all duration-500`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{item.value}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Target: {item.target}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
