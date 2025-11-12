import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Zap,
  HardHat,
  Plus,
  Calendar,
  Activity,
  TrendingUp,
  Target,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface SafetyMetric {
  id: string;
  title: string;
  value: number | string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  unit: string;
  lastUpdated: string;
}

interface SafetyIncident {
  id: string;
  date: string;
  type: 'near_miss' | 'first_aid' | 'recordable' | 'lost_time';
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'closed';
  assignedTo: string;
  voltageLevel?: string;
}

interface SafetyTask {
  id: string;
  title: string;
  type: 'briefing' | 'inspection' | 'training' | 'permit' | 'jsa';
  dueDate: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  voltageClass?: string;
}

const safetyMetrics: SafetyMetric[] = [
  {
    id: '1',
    title: 'Days Without Incident',
    value: 127,
    target: 365,
    trend: 'up',
    status: 'good',
    unit: 'days',
    lastUpdated: 'Today'
  },
  {
    id: '2', 
    title: 'Safety Score',
    value: 98.5,
    target: 95,
    trend: 'stable',
    status: 'good',
    unit: '%',
    lastUpdated: 'Today'
  },
  {
    id: '3',
    title: 'JSAs Completed',
    value: 45,
    target: 50,
    trend: 'up',
    status: 'warning',
    unit: 'this month',
    lastUpdated: '2 hours ago'
  },
  {
    id: '4',
    title: 'Training Compliance',
    value: 94,
    target: 100,
    trend: 'down',
    status: 'warning',
    unit: '%',
    lastUpdated: 'Yesterday'
  }
];

const recentIncidents: SafetyIncident[] = [
  {
    id: '1',
    date: '2025-01-26',
    type: 'near_miss',
    description: 'Worker walked under suspended load during crane operation',
    location: 'Alpha-7 Substation - Transformer Pad',
    severity: 'medium',
    status: 'closed',
    assignedTo: 'Safety Officer',
    voltageLevel: 'N/A'
  }
];

const upcomingSafetyTasks: SafetyTask[] = [
  {
    id: '1',
    title: 'Weekly Safety Briefing',
    type: 'briefing',
    dueDate: '2025-01-28',
    assignedTo: 'Mike Rodriguez',
    priority: 'high',
    status: 'pending'
  },
  {
    id: '2',
    title: 'High Voltage Work Permit',
    type: 'permit',
    dueDate: '2025-01-27',
    assignedTo: 'Sarah Chen',
    priority: 'critical',
    status: 'in_progress',
    voltageClass: '138kV'
  },
  {
    id: '3',
    title: 'Arc Flash Boundary Update',
    type: 'inspection',
    dueDate: '2025-01-29',
    assignedTo: 'Tom Wilson',
    priority: 'high',
    status: 'pending',
    voltageClass: '138kV/25kV'
  }
];

export const SafetyCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'tasks' | 'training'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'critical': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-green-400" />
          <h1 className="text-3xl font-bold text-white">Safety Center</h1>
        </div>
        <p className="text-slate-300">High-voltage electrical safety management and compliance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-slate-800/30 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Safety Overview', icon: Shield },
          { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
          { key: 'tasks', label: 'Safety Tasks', icon: CheckCircle },
          { key: 'training', label: 'Training', icon: HardHat }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Safety Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Safety Metrics */}
          <div className="grid gap-6 lg:grid-cols-4">
            {safetyMetrics.map((metric) => (
              <div key={metric.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{metric.title}</h3>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="mb-2">
                  <div className={`text-3xl font-bold ${getStatusColor(metric.status).split(' ')[0]}`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-slate-400">{metric.unit}</div>
                </div>

                {metric.target && (
                  <div className="mb-3">
                    <div className="text-xs text-slate-400 mb-1">Target: {metric.target}{metric.unit.includes('%') ? '%' : ''}</div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${metric.status === 'good' ? 'bg-green-400' : metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(100, (Number(metric.value) / metric.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-400">Updated: {metric.lastUpdated}</div>
              </div>
            ))}
          </div>

          {/* Safety Alert */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-300 mb-2">High Voltage Work Notice</h3>
                <p className="text-yellow-100 mb-3">
                  138kV energization scheduled for tomorrow at 10:00 AM. All personnel must review updated 
                  arc flash study and use Category 4 PPE within the restricted area.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold rounded-lg border border-yellow-500/30 transition-all">
                    View Arc Flash Study
                  </button>
                  <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold rounded-lg border border-yellow-500/30 transition-all">
                    Acknowledge Reading
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 lg:grid-cols-4">
            <button className="p-4 bg-slate-800/50 border border-slate-700 hover:border-green-500/50 rounded-xl text-left transition-all group">
              <FileText className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Create JSA</h4>
              <p className="text-sm text-slate-400">New Job Safety Analysis</p>
            </button>

            <button className="p-4 bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 rounded-xl text-left transition-all group">
              <AlertTriangle className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Report Incident</h4>
              <p className="text-sm text-slate-400">Safety incident reporting</p>
            </button>

            <button className="p-4 bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-xl text-left transition-all group">
              <Zap className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">HV Work Permit</h4>
              <p className="text-sm text-slate-400">High voltage work authorization</p>
            </button>

            <button className="p-4 bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-all group">
              <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-1">Safety Briefing</h4>
              <p className="text-sm text-slate-400">Conduct crew briefing</p>
            </button>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Safety Incidents</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all">
              <Plus className="w-5 h-5" />
              Report Incident
            </button>
          </div>

          {recentIncidents.length === 0 ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-300 mb-2">No Recent Incidents</h3>
              <p className="text-green-200">Great safety performance! Keep up the excellent work.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        incident.type === 'near_miss' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                        incident.type === 'first_aid' ? 'bg-orange-500/20 border border-orange-500/30' :
                        'bg-red-500/20 border border-red-500/30'
                      }`}>
                        <AlertTriangle className={`w-6 h-6 ${
                          incident.type === 'near_miss' ? 'text-yellow-400' :
                          incident.type === 'first_aid' ? 'text-orange-400' :
                          'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{incident.type.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-slate-300 mb-2">{incident.description}</p>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>Location: {incident.location}</div>
                          <div>Date: {incident.date}</div>
                          {incident.voltageLevel && (
                            <div className="flex items-center gap-2">
                              Voltage Level: 
                              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono text-xs">
                                {incident.voltageLevel}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      incident.status === 'closed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      incident.status === 'investigating' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Safety Tasks</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          <div className="space-y-4">
            {upcomingSafetyTasks.map((task) => (
              <div key={task.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      task.type === 'permit' ? 'bg-red-500/20 border border-red-500/30' :
                      task.type === 'briefing' ? 'bg-blue-500/20 border border-blue-500/30' :
                      task.type === 'inspection' ? 'bg-purple-500/20 border border-purple-500/30' :
                      'bg-green-500/20 border border-green-500/30'
                    }`}>
                      {task.type === 'permit' ? <FileText className="w-5 h-5 text-red-400" /> :
                       task.type === 'briefing' ? <Users className="w-5 h-5 text-blue-400" /> :
                       task.type === 'inspection' ? <CheckCircle className="w-5 h-5 text-purple-400" /> :
                       <HardHat className="w-5 h-5 text-green-400" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{task.title}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-400">Due: {task.dueDate}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">Assigned to: {task.assignedTo}</span>
                        {task.voltageClass && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono text-xs">
                              {task.voltageClass}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                      {task.status === 'completed' ? 'View' : 'Complete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Safety Training & Certification</h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Training Requirements */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Required Training</h3>
              <div className="space-y-3">
                {[
                  { title: 'Arc Flash Safety', status: 'current', expires: '2025-06-15' },
                  { title: 'High Voltage Work', status: 'current', expires: '2025-04-20' },
                  { title: 'Crane Signal Person', status: 'expiring', expires: '2025-02-10' },
                  { title: 'Confined Space Entry', status: 'expired', expires: '2025-01-05' }
                ].map((training, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-white">{training.title}</h4>
                      <p className="text-sm text-slate-400">Expires: {training.expires}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      training.status === 'current' ? 'bg-green-400' :
                      training.status === 'expiring' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Status */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Crew Certifications</h3>
              <div className="space-y-3">
                {[
                  { level: 'Qualified Electrical Worker', count: 8, total: 8 },
                  { level: 'Arc Flash Trained', count: 8, total: 8 },
                  { level: 'High Voltage Authorized', count: 6, total: 8 },
                  { level: 'Crane Operations', count: 2, total: 2 }
                ].map((cert, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-white">{cert.level}</h4>
                      <span className="text-sm text-slate-400">{cert.count}/{cert.total}</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(cert.count / cert.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      <div className="fixed bottom-6 right-6">
        <button className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110">
          <AlertTriangle className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};
