import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, FileText, Users, TrendingUp, Calendar, Bell, Activity, ChevronRight, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SafetyMetrics {
  daysWithoutIncident: number;
  totalIncidents: number;
  openInvestigations: number;
  safetyScore: number;
  weeklyBriefings: number;
  activePermits: number;
}

interface SafetyIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location_description: string;
  description: string;
  project_id?: string;
  project_name?: string;
  immediate_actions?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_by: string;
  reporter_name?: string;
  created_at: string;
}

interface WorkPermit {
  id: string;
  type: string;
  work_description: string;
  hazards: string[];
  controls: string[];
  valid_until: string;
  project_id?: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}

export const SafetyManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    daysWithoutIncident: 0,
    totalIncidents: 0,
    openInvestigations: 0,
    safetyScore: 100,
    weeklyBriefings: 0,
    activePermits: 0
  });

  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [activePermits, setActivePermits] = useState<WorkPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [showBriefingForm, setShowBriefingForm] = useState(false);

  // Form states
  const [incidentForm, setIncidentForm] = useState({
    type: '',
    severity: 'medium' as const,
    location_description: '',
    description: '',
    immediate_actions: ''
  });

  const [permitForm, setPermitForm] = useState({
    type: '',
    work_description: '',
    hazards: '',
    controls: '',
    valid_until: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchSafetyData();
    const interval = setInterval(fetchSafetyData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSafetyData = async () => {
    try {
      const [metricsRes, incidentsRes, permitsRes] = await Promise.all([
        fetch('/api/safety/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'x-company-id': localStorage.getItem('company_id') || ''
          }
        }),
        fetch('/api/safety/incidents?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'x-company-id': localStorage.getItem('company_id') || ''
          }
        }),
        fetch('/api/safety/permits?status=active', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'x-company-id': localStorage.getItem('company_id') || ''
          }
        })
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData.incidents || []);
      }

      if (permitsRes.ok) {
        const permitsData = await permitsRes.json();
        setActivePermits(permitsData.permits || []);
      }
    } catch (error) {
      console.error('Failed to fetch safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/safety/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-company-id': localStorage.getItem('company_id') || ''
        },
        body: JSON.stringify({
          ...incidentForm,
          project_id: localStorage.getItem('current_project_id')
        })
      });

      if (response.ok) {
        setShowIncidentForm(false);
        setIncidentForm({
          type: '',
          severity: 'medium',
          location_description: '',
          description: '',
          immediate_actions: ''
        });
        fetchSafetyData();
        
        // Show success notification
        alert('Safety incident reported successfully');
      } else {
        const error = await response.json();
        alert(`Failed to report incident: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
      alert('Failed to submit incident report');
    }
  };

  const submitPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/safety/permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-company-id': localStorage.getItem('company_id') || ''
        },
        body: JSON.stringify({
          ...permitForm,
          hazards: permitForm.hazards.split(',').map(h => h.trim()).filter(Boolean),
          controls: permitForm.controls.split(',').map(c => c.trim()).filter(Boolean),
          project_id: localStorage.getItem('current_project_id'),
          authorized_workers: []
        })
      });

      if (response.ok) {
        setShowPermitForm(false);
        setPermitForm({
          type: '',
          work_description: '',
          hazards: '',
          controls: '',
          valid_until: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        });
        fetchSafetyData();
        alert('Work permit created successfully');
      } else {
        const error = await response.json();
        alert(`Failed to create permit: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting permit:', error);
      alert('Failed to create work permit');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600';
      case 'investigating': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Safety Management</h1>
          <p className="text-gray-600 mt-1">Monitor safety metrics and manage incidents</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBriefingForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Safety Briefing</span>
          </button>
          <button
            onClick={() => setShowPermitForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">New Permit</span>
          </button>
          <button
            onClick={() => setShowIncidentForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Report Incident</span>
          </button>
        </div>
      </div>

      {/* Safety Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Days</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.daysWithoutIncident}</p>
          <p className="text-sm text-gray-600 mt-1">Without Incident</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`w-8 h-8 ${getSafetyScoreColor(metrics.safetyScore)}`} />
            <span className="text-sm text-gray-500">Score</span>
          </div>
          <p className={`text-3xl font-bold ${getSafetyScoreColor(metrics.safetyScore)}`}>
            {metrics.safetyScore}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Safety Score</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalIncidents}</p>
          <p className="text-sm text-gray-600 mt-1">Incidents</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-red-500" />
            <span className="text-sm text-gray-500">Open</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.openInvestigations}</p>
          <p className="text-sm text-gray-600 mt-1">Investigations</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-500">Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.weeklyBriefings}</p>
          <p className="text-sm text-gray-600 mt-1">Briefings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.activePermits}</p>
          <p className="text-sm text-gray-600 mt-1">Permits</p>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Recent Safety Incidents
          </h2>
        </div>
        <div className="divide-y">
          {incidents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>No recent incidents reported</p>
            </div>
          ) : (
            incidents.map(incident => (
              <div key={incident.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>
                        • {incident.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{incident.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(incident.created_at), 'MMM d, yyyy')}
                      </span>
                      <span>{incident.location_description}</span>
                      {incident.reporter_name && (
                        <span>Reported by {incident.reporter_name}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Work Permits */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Active Work Permits
          </h2>
        </div>
        <div className="divide-y">
          {activePermits.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No active work permits</p>
            </div>
          ) : (
            activePermits.map(permit => (
              <div key={permit.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{permit.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{permit.work_description}</p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Hazards:</span> {permit.hazards.join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Controls:</span> {permit.controls.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Valid until {format(new Date(permit.valid_until), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Incident Report Modal */}
      {showIncidentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Report Safety Incident</h2>
            <form onSubmit={submitIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Type
                </label>
                <input
                  type="text"
                  required
                  value={incidentForm.type}
                  onChange={(e) => setIncidentForm({...incidentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="e.g., Slip and Fall, Equipment Malfunction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={incidentForm.location_description}
                  onChange={(e) => setIncidentForm({...incidentForm, location_description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="Specific location of incident"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what happened..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Immediate Actions Taken
                </label>
                <textarea
                  value={incidentForm.immediate_actions}
                  onChange={(e) => setIncidentForm({...incidentForm, immediate_actions: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="What was done immediately after the incident?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIncidentForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px]"
                >
                  Report Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Permit Modal */}
      {showPermitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Work Permit</h2>
            <form onSubmit={submitPermit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Type
                </label>
                <input
                  type="text"
                  required
                  value={permitForm.type}
                  onChange={(e) => setPermitForm({...permitForm, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="e.g., Hot Work, Confined Space, Working at Heights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Description
                </label>
                <textarea
                  required
                  value={permitForm.work_description}
                  onChange={(e) => setPermitForm({...permitForm, work_description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the work to be performed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hazards (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={permitForm.hazards}
                  onChange={(e) => setPermitForm({...permitForm, hazards: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="e.g., Fire, Electrical, Fall from height"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control Measures (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={permitForm.controls}
                  onChange={(e) => setPermitForm({...permitForm, controls: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="e.g., Fire extinguisher, Lock out tag out, Safety harness"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  required
                  value={permitForm.valid_until}
                  onChange={(e) => setPermitForm({...permitForm, valid_until: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPermitForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[44px]"
                >
                  Create Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TODO: Safety Briefing Modal - Will implement next */}
    </div>
  );
};



