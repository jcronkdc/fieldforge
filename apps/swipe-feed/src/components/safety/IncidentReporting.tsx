import React, { useState, useEffect } from 'react';
import { AlertTriangle, Camera, MapPin, User, Clock, Plus, Check, X, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Incident {
  id: number;
  incident_date: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  injured_person?: string;
  witness_names?: string;
  immediate_actions: string;
  root_cause?: string;
  corrective_actions?: string;
  reported_by: number;
  reported_by_name?: string;
  company_id: number;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  photos?: string[];
  created_at: string;
  updated_at: string;
}

const INCIDENT_TYPES = [
  'Near Miss',
  'First Aid',
  'Medical Treatment',
  'Lost Time Injury',
  'Equipment Damage',
  'Environmental',
  'Fire/Explosion',
  'Vehicle Accident'
];

const SEVERITY_COLORS = {
  low: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  medium: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  high: 'bg-red-500/20 text-red-300 border-red-500/50',
  critical: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
};

export const IncidentReporting: React.FC = () => {
  const { session } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_type: '',
    severity: 'medium' as Incident['severity'],
    description: '',
    location: '',
    injured_person: '',
    witness_names: '',
    immediate_actions: '',
    root_cause: '',
    corrective_actions: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/safety/incidents', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = selectedIncident ? 'PUT' : 'POST';
      const url = selectedIncident 
        ? `/api/safety/incidents/${selectedIncident.id}`
        : '/api/safety/incidents';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save incident');

      toast.success(selectedIncident ? 'Incident updated' : 'Incident reported successfully');
      fetchIncidents();
      resetForm();
    } catch (error) {
      console.error('Error saving incident:', error);
      toast.error('Failed to save incident');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedIncident(null);
    setFormData({
      incident_date: new Date().toISOString().split('T')[0],
      incident_type: '',
      severity: 'medium',
      description: '',
      location: '',
      injured_person: '',
      witness_names: '',
      immediate_actions: '',
      root_cause: '',
      corrective_actions: ''
    });
  };

  const editIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setFormData({
      incident_date: incident.incident_date.split('T')[0],
      incident_type: incident.incident_type,
      severity: incident.severity,
      description: incident.description,
      location: incident.location,
      injured_person: incident.injured_person || '',
      witness_names: incident.witness_names || '',
      immediate_actions: incident.immediate_actions,
      root_cause: incident.root_cause || '',
      corrective_actions: incident.corrective_actions || ''
    });
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🚨 Incident Reporting</h1>
            <p className="text-slate-400">Report and track safety incidents</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <AlertTriangle className="w-5 h-5" />
            Report Incident
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Incidents</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">{incidents.length}</div>
            <div className="text-sm text-slate-400 mt-1">All time</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Open Cases</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {incidents.filter(i => i.status === 'open').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Requires action</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Critical</span>
              <AlertTriangle className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {incidents.filter(i => i.severity === 'critical').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">High priority</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Days Since Last</span>
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {incidents.length > 0 
                ? Math.floor((Date.now() - new Date(incidents[0].incident_date).getTime()) / (1000 * 60 * 60 * 24))
                : '∞'}
            </div>
            <div className="text-sm text-slate-400 mt-1">Keep it going!</div>
          </div>
        </div>

        {/* Incident Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedIncident ? 'Update Incident Report' : 'New Incident Report'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Incident Date
                    </label>
                    <input
                      type="date"
                      value={formData.incident_date}
                      onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Incident Type
                    </label>
                    <select
                      value={formData.incident_type}
                      onChange={(e) => setFormData({...formData, incident_type: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="">Select type</option>
                      {INCIDENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value as Incident['severity']})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Site location"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Describe what happened..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Injured Person (if any)
                    </label>
                    <input
                      type="text"
                      value={formData.injured_person}
                      onChange={(e) => setFormData({...formData, injured_person: e.target.value})}
                      placeholder="Name of injured"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Witnesses
                    </label>
                    <input
                      type="text"
                      value={formData.witness_names}
                      onChange={(e) => setFormData({...formData, witness_names: e.target.value})}
                      placeholder="Witness names"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Immediate Actions Taken
                  </label>
                  <textarea
                    value={formData.immediate_actions}
                    onChange={(e) => setFormData({...formData, immediate_actions: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="What was done immediately?"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (selectedIncident ? 'Update' : 'Submit')} Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Incidents List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Recent Incidents</h2>
          </div>
          
          <div className="divide-y divide-slate-700">
            {incidents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No incidents reported yet. Keep up the safe work!</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="p-4 hover:bg-slate-700/30 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[incident.severity]}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className="text-white font-medium">{incident.incident_type}</span>
                        <span className="text-slate-400 text-sm">
                          {new Date(incident.incident_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 mb-2">{incident.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {incident.location}
                        </span>
                        {incident.injured_person && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {incident.injured_person}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          incident.status === 'closed' ? 'bg-green-900/50 text-green-400' :
                          incident.status === 'resolved' ? 'bg-blue-900/50 text-blue-400' :
                          incident.status === 'investigating' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => editIncident(incident)}
                      className="ml-4 text-slate-400 hover:text-white transition"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};