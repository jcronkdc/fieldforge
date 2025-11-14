import React, { useState, useEffect } from 'react';
import { Shield, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Eye, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Permit {
  id: number;
  permit_number: string;
  permit_type: string;
  work_description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'closed';
  risk_level: 'low' | 'medium' | 'high';
  requested_by: number;
  requester_name?: string;
  approved_by?: number;
  approver_name?: string;
  safety_requirements: string[];
  hazards: string[];
  control_measures: string[];
  emergency_contacts: string;
  company_id: number;
  created_at: string;
  updated_at: string;
}

const PERMIT_TYPES = [
  'Hot Work',
  'Confined Space',
  'Working at Heights',
  'Excavation',
  'Electrical Work',
  'Lockout/Tagout',
  'Line Breaking',
  'Lifting Operations'
];

const COMMON_HAZARDS = [
  'Fire/Explosion',
  'Falls from Height',
  'Electrical Shock',
  'Confined Space',
  'Moving Equipment',
  'Chemical Exposure',
  'Extreme Temperature',
  'Noise',
  'Dust/Particulates'
];

const SAFETY_REQUIREMENTS = [
  'Fire Extinguisher',
  'Fire Watch',
  'Gas Monitor',
  'Fall Protection',
  'Lockout/Tagout',
  'Barricades',
  'Ventilation',
  'PPE - Special',
  'Spotter/Observer',
  'Emergency Rescue Plan'
];

export const PermitManagement: React.FC = () => {
  const { session } = useAuth();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    permit_type: '',
    work_description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    risk_level: 'medium' as Permit['risk_level'],
    hazards: [] as string[],
    safety_requirements: [] as string[],
    control_measures: [''] as string[],
    emergency_contacts: ''
  });

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    try {
      const response = await fetch('/api/safety/permits', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch permits');
      const data = await response.json();
      setPermits(data);
    } catch (error) {
      console.error('Error fetching permits:', error);
      toast.error('Failed to load permits');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = selectedPermit ? 'PUT' : 'POST';
      const url = selectedPermit 
        ? `/api/safety/permits/${selectedPermit.id}`
        : '/api/safety/permits';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          control_measures: formData.control_measures.filter(cm => cm.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to save permit');

      toast.success(selectedPermit ? 'Permit updated' : 'Permit created successfully');
      fetchPermits();
      resetForm();
    } catch (error) {
      console.error('Error saving permit:', error);
      toast.error('Failed to save permit');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedPermit(null);
    setFormData({
      permit_type: '',
      work_description: '',
      location: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      risk_level: 'medium',
      hazards: [],
      safety_requirements: [],
      control_measures: [''],
      emergency_contacts: ''
    });
  };

  const toggleArrayItem = (array: string[], item: string, field: 'hazards' | 'safety_requirements') => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    setFormData({ ...formData, [field]: newArray });
  };

  const getStatusColor = (status: Permit['status']) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      approved: 'bg-green-500/20 text-green-300 border-green-500/50',
      active: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      expired: 'bg-red-500/20 text-red-300 border-red-500/50',
      closed: 'bg-slate-500/20 text-slate-300 border-slate-500/50'
    };
    return colors[status];
  };

  const getRiskColor = (level: Permit['risk_level']) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
    };
    return colors[level];
  };

  const viewPermit = (permit: Permit) => {
    setSelectedPermit(permit);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🛡️ Work Permits</h1>
            <p className="text-slate-400">Manage work permits and safety authorizations</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            New Permit
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Active Permits</span>
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {permits.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Currently active</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Pending Approval</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {permits.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Awaiting review</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">High Risk</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {permits.filter(p => p.risk_level === 'high' && p.status === 'active').length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Active high risk</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Expiring Today</span>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              {permits.filter(p => {
                const endDate = new Date(p.end_date);
                const today = new Date();
                return endDate.toDateString() === today.toDateString() && p.status === 'active';
              }).length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Need renewal</div>
          </div>
        </div>

        {/* Permit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">New Work Permit</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Permit Type
                    </label>
                    <select
                      value={formData.permit_type}
                      onChange={(e) => setFormData({...formData, permit_type: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="">Select type</option>
                      {PERMIT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Risk Level
                    </label>
                    <select
                      value={formData.risk_level}
                      onChange={(e) => setFormData({...formData, risk_level: e.target.value as Permit['risk_level']})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Specific work location"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Work Description
                  </label>
                  <textarea
                    value={formData.work_description}
                    onChange={(e) => setFormData({...formData, work_description: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Describe the work to be performed..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Identified Hazards
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COMMON_HAZARDS.map(hazard => (
                      <label key={hazard} className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={formData.hazards.includes(hazard)}
                          onChange={() => toggleArrayItem(formData.hazards, hazard, 'hazards')}
                          className="rounded bg-slate-700 border-slate-600"
                        />
                        {hazard}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Safety Requirements
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SAFETY_REQUIREMENTS.map(req => (
                      <label key={req} className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={formData.safety_requirements.includes(req)}
                          onChange={() => toggleArrayItem(formData.safety_requirements, req, 'safety_requirements')}
                          className="rounded bg-slate-700 border-slate-600"
                        />
                        {req}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Control Measures
                  </label>
                  {formData.control_measures.map((measure, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={measure}
                        onChange={(e) => {
                          const newMeasures = [...formData.control_measures];
                          newMeasures[index] = e.target.value;
                          setFormData({...formData, control_measures: newMeasures});
                        }}
                        placeholder="Describe control measure"
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                      {index === formData.control_measures.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, control_measures: [...formData.control_measures, '']})}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const newMeasures = formData.control_measures.filter((_, i) => i !== index);
                            setFormData({...formData, control_measures: newMeasures});
                          }}
                          className="px-4 py-2 bg-red-900/50 hover:bg-red-900 rounded-lg transition"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Emergency Contacts
                  </label>
                  <textarea
                    value={formData.emergency_contacts}
                    onChange={(e) => setFormData({...formData, emergency_contacts: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Emergency contact information..."
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Permit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permit Details Modal */}
        {selectedPermit && !showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Permit #{selectedPermit.permit_number}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPermit.status)}`}>
                      {selectedPermit.status.toUpperCase()}
                    </span>
                    <span className={`font-medium ${getRiskColor(selectedPermit.risk_level)}`}>
                      {selectedPermit.risk_level.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPermit(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Type</label>
                    <p className="text-white">{selectedPermit.permit_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Location</label>
                    <p className="text-white">{selectedPermit.location}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Valid From</label>
                    <p className="text-white">{new Date(selectedPermit.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Valid Until</label>
                    <p className="text-white">{new Date(selectedPermit.end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Work Description</label>
                  <p className="text-white mt-1">{selectedPermit.work_description}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Hazards</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedPermit.hazards.map((hazard, index) => (
                      <span key={index} className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm">
                        {hazard}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Safety Requirements</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedPermit.safety_requirements.map((req, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-sm">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Control Measures</label>
                  <ul className="list-disc list-inside text-white mt-1 space-y-1">
                    {selectedPermit.control_measures.map((measure, index) => (
                      <li key={index}>{measure}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Emergency Contacts</label>
                  <p className="text-white mt-1 whitespace-pre-wrap">{selectedPermit.emergency_contacts}</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  {selectedPermit.status === 'pending' && (
                    <>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permits List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Active & Recent Permits</h2>
          </div>
          
          <div className="divide-y divide-slate-700">
            {permits.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No permits created yet</p>
              </div>
            ) : (
              permits.map((permit) => (
                <div 
                  key={permit.id} 
                  className="p-4 hover:bg-slate-700/30 transition cursor-pointer"
                  onClick={() => viewPermit(permit)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className={`w-5 h-5 ${getRiskColor(permit.risk_level)}`} />
                        <span className="text-white font-medium">{permit.permit_type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(permit.status)}`}>
                          {permit.status}
                        </span>
                        <span className="text-slate-400 text-sm">#{permit.permit_number}</span>
                      </div>
                      
                      <p className="text-slate-300 mb-2">{permit.work_description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{permit.location}</span>
                        <span>
                          {new Date(permit.start_date).toLocaleDateString()} - {new Date(permit.end_date).toLocaleDateString()}
                        </span>
                        {permit.requester_name && <span>By: {permit.requester_name}</span>}
                      </div>
                    </div>
                    
                    <Eye className="w-5 h-5 text-slate-400" />
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