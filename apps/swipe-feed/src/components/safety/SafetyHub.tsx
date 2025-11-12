import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, FileText, Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format, differenceInDays } from 'date-fns';

interface SafetyMetrics {
  daysWithoutIncident: number;
  totalIncidents: number;
  openInvestigations: number;
  safetyScore: number;
  nearMisses: number;
  activePermits: number;
  trainingsExpiring: number;
  monthlyTrend: 'up' | 'down' | 'stable';
}

interface SafetyIncident {
  id: string;
  project_id: string;
  incident_date: string;
  incident_type: string;
  severity: string;
  description: string;
  status: string;
  reported_by: string;
  project?: {
    name: string;
  };
}

export const SafetyHub: React.FC = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    daysWithoutIncident: 0,
    totalIncidents: 0,
    openInvestigations: 0,
    safetyScore: 100,
    nearMisses: 0,
    activePermits: 0,
    trainingsExpiring: 0,
    monthlyTrend: 'stable'
  });
  
  const [recentIncidents, setRecentIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    fetchSafetyData();
    fetchProjects();
    
    // Real-time subscriptions
    const channels = [
      supabase.channel('safety_incidents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_incidents' }, 
          () => fetchSafetyData()),
      supabase.channel('work_permits')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'work_permits' }, 
          () => fetchSafetyData()),
      supabase.channel('safety_training_completions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_training_completions' }, 
          () => fetchSafetyData())
    ];
    
    channels.forEach(ch => ch.subscribe());
    
    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, [session?.user?.id]);

  const fetchSafetyData = async () => {
    setLoading(true);
    
    // Fetch incidents
    const { data: incidents } = await supabase
      .from('safety_incidents')
      .select(`
        *,
        project:projects(name)
      `)
      .order('incident_date', { ascending: false })
      .limit(10);
      
    if (incidents) {
      setRecentIncidents(incidents);
      
      // Calculate metrics
      const openIncidents = incidents.filter(i => i.status === 'open');
      const nearMisses = incidents.filter(i => i.incident_type === 'near miss');
      
      // Get last incident date
      const lastIncidentDate = incidents
        .filter(i => i.incident_type !== 'near miss')
        .sort((a, b) => new Date(b.incident_date).getTime() - new Date(a.incident_date).getTime())[0]?.incident_date;
      
      const daysWithoutIncident = lastIncidentDate 
        ? differenceInDays(new Date(), new Date(lastIncidentDate))
        : 365;
      
      // Fetch active permits
      const { data: permits } = await supabase
        .from('work_permits')
        .select('id')
        .eq('status', 'approved')
        .gte('valid_to', new Date().toISOString());
        
      // Fetch expiring trainings
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: expiringTrainings } = await supabase
        .from('safety_training_completions')
        .select('id')
        .gte('expires_at', new Date().toISOString())
        .lte('expires_at', thirtyDaysFromNow.toISOString());
      
      // Calculate safety score (simplified)
      let safetyScore = 100;
      safetyScore -= openIncidents.length * 5;
      safetyScore -= incidents.filter(i => i.severity === 'critical').length * 10;
      safetyScore -= incidents.filter(i => i.severity === 'high').length * 5;
      safetyScore = Math.max(0, safetyScore);
      
      setMetrics({
        daysWithoutIncident,
        totalIncidents: incidents.length,
        openInvestigations: openIncidents.length,
        safetyScore,
        nearMisses: nearMisses.length,
        activePermits: permits?.length || 0,
        trainingsExpiring: expiringTrainings?.length || 0,
        monthlyTrend: incidents.length > 5 ? 'down' : incidents.length < 2 ? 'up' : 'stable'
      });
    }
    
    setLoading(false);
  };

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active');
      
    if (data) {
      setProjects(data);
    }
  };

  const reportIncident = async (incident: any) => {
    const { data, error } = await supabase
      .from('safety_incidents')
      .insert({
        ...incident,
        reported_by: session?.user?.id,
        status: 'open'
      })
      .select()
      .single();
      
    if (!error) {
      // Send alerts for critical incidents
      if (incident.severity === 'critical') {
        // In real app, this would trigger notifications
        console.log('CRITICAL INCIDENT REPORTED - Alerting safety team');
      }
      
      setShowReportForm(false);
      await fetchSafetyData();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Safety Hub</h1>
          <p className="text-gray-400">Monitor safety performance and manage incidents</p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Days Without Incident</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.daysWithoutIncident}</p>
              <p className="text-xs text-green-500 mt-2">Target: 365 days</p>
            </div>
            <Shield className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Safety Score</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.safetyScore}%</p>
              <div className="flex items-center mt-2">
                {metrics.monthlyTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                {metrics.monthlyTrend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />}
                <span className={`text-xs ${
                  metrics.monthlyTrend === 'up' ? 'text-green-500' : 
                  metrics.monthlyTrend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {metrics.monthlyTrend === 'up' ? 'Improving' : 
                   metrics.monthlyTrend === 'down' ? 'Declining' : 
                   'Stable'}
                </span>
              </div>
            </div>
            <Activity className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Open Investigations</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.openInvestigations}</p>
              <p className="text-xs text-yellow-500 mt-2">{metrics.nearMisses} near misses</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Permits</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.activePermits}</p>
              <p className="text-xs text-orange-500 mt-2">{metrics.trainingsExpiring} trainings expiring</p>
            </div>
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-white">Request Permit</h3>
              <p className="text-sm text-gray-400">Hot work, confined space, etc.</p>
            </div>
          </div>
        </button>

        <button className="p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-white">Safety Training</h3>
              <p className="text-sm text-gray-400">View and complete trainings</p>
            </div>
          </div>
        </button>

        <button className="p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium text-white">Toolbox Talks</h3>
              <p className="text-sm text-gray-400">Schedule daily briefings</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Incidents */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Recent Incidents</h3>
        
        {loading && recentIncidents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading incidents...</div>
        ) : recentIncidents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-400">No recent incidents reported</p>
            <p className="text-sm text-gray-500 mt-1">Keep up the great work!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentIncidents.map(incident => (
              <div 
                key={incident.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{incident.incident_type}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {incident.project?.name} • {format(new Date(incident.incident_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    incident.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' :
                    incident.status === 'investigating' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {incident.status}
                  </span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Incident Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Report Safety Incident</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              reportIncident({
                project_id: formData.get('project_id'),
                incident_date: formData.get('incident_date'),
                incident_type: formData.get('incident_type'),
                severity: formData.get('severity'),
                description: formData.get('description'),
                location_description: formData.get('location_description'),
                immediate_actions: formData.get('immediate_actions')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
                <select
                  name="project_id"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Incident Date</label>
                  <input
                    type="date"
                    name="incident_date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Incident Type</label>
                  <select
                    name="incident_type"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="near miss">Near Miss</option>
                    <option value="minor injury">Minor Injury</option>
                    <option value="major injury">Major Injury</option>
                    <option value="property damage">Property Damage</option>
                    <option value="environmental">Environmental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                <select
                  name="severity"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location_description"
                  required
                  placeholder="e.g., Building A, Level 2, Near Electrical Panel"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe what happened..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Immediate Actions Taken</label>
                <textarea
                  name="immediate_actions"
                  rows={3}
                  placeholder="What was done immediately after the incident?"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



