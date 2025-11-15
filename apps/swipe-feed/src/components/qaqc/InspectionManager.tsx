import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Calendar, Clock, AlertCircle, CheckCircle, Camera, FileText, Users, MapPin, TrendingUp, Eye, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Inspection {
  id: number;
  inspection_type: string;
  title: string;
  description?: string;
  scheduled_date: string;
  completed_date?: string;
  inspector_id: number;
  inspector_name?: string;
  project_id: number;
  project_name?: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  result?: 'pass' | 'fail' | 'conditional';
  findings: Finding[];
  checklist_items: ChecklistItem[];
  photos?: string[];
  weather_conditions?: string;
  temperature?: number;
  witnesses?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

interface Finding {
  id: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  corrective_action?: string;
  responsible_party?: string;
  due_date?: string;
  status: 'open' | 'in_progress' | 'resolved';
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  result: 'pass' | 'fail' | 'na' | '';
  notes?: string;
}

const INSPECTION_TYPES = [
  { value: 'foundation', label: 'Foundation', icon: '🏗️' },
  { value: 'concrete', label: 'Concrete Pour', icon: '🪨' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'mechanical', label: 'Mechanical', icon: '⚙️' },
  { value: 'structural', label: 'Structural', icon: '🏢' },
  { value: 'safety', label: 'Safety Compliance', icon: '🦺' },
  { value: 'quality', label: 'Quality Assurance', icon: '✅' },
  { value: 'final', label: 'Final Inspection', icon: '🏁' }
];

const DEFAULT_CHECKLIST_ITEMS = {
  foundation: [
    { category: 'Excavation', item: 'Proper depth and dimensions' },
    { category: 'Excavation', item: 'Soil conditions verified' },
    { category: 'Reinforcement', item: 'Rebar placement and spacing' },
    { category: 'Reinforcement', item: 'Concrete cover requirements' },
    { category: 'Formwork', item: 'Form alignment and bracing' },
    { category: 'Drainage', item: 'Waterproofing applied' }
  ],
  electrical: [
    { category: 'Conduit', item: 'Proper sizing and routing' },
    { category: 'Conduit', item: 'Secure mounting and support' },
    { category: 'Wiring', item: 'Wire gauge appropriate' },
    { category: 'Wiring', item: 'Proper terminations' },
    { category: 'Grounding', item: 'Ground rods installed' },
    { category: 'Grounding', item: 'Bonding connections secure' }
  ]
};

export const InspectionManager: React.FC = () => {
  const { session } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [viewingInspection, setViewingInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'failed'>('all');
  const [formData, setFormData] = useState({
    inspection_type: 'quality',
    title: '',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    project_id: 0,
    location: '',
    weather_conditions: '',
    temperature: 70,
    witnesses: [''] as string[],
    checklist_items: [] as ChecklistItem[],
    findings: [] as Finding[]
  });

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await fetch('/api/qaqc/inspections', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      
      // Parse JSON fields if needed
      const parsedData = data.map((inspection: any) => ({
        ...inspection,
        findings: inspection.findings || [],
        checklist_items: inspection.checklist_items || [],
        witnesses: inspection.witnesses || []
      }));
      
      setInspections(parsedData);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = selectedInspection ? 'PUT' : 'POST';
      const url = selectedInspection 
        ? `/api/qaqc/inspections/${selectedInspection.id}`
        : '/api/qaqc/inspections';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          witnesses: formData.witnesses.filter(w => w.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to save inspection');

      toast.success(selectedInspection ? 'Inspection updated' : 'Inspection scheduled');
      fetchInspections();
      resetForm();
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast.error('Failed to save inspection');
    }
  };

  const startInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    
    // Initialize checklist based on inspection type
    const checklistTemplate = DEFAULT_CHECKLIST_ITEMS[inspection.inspection_type as keyof typeof DEFAULT_CHECKLIST_ITEMS] || 
      DEFAULT_CHECKLIST_ITEMS.electrical;
    
    const initializedChecklist = checklistTemplate.map((item, index) => ({
      id: `item-${index}`,
      category: item.category,
      item: item.item,
      result: '' as const,
      notes: ''
    }));

    setFormData({
      inspection_type: inspection.inspection_type,
      title: inspection.title,
      description: inspection.description || '',
      scheduled_date: inspection.scheduled_date.split('T')[0],
      project_id: inspection.project_id,
      location: inspection.location,
      weather_conditions: '',
      temperature: 70,
      witnesses: [''],
      checklist_items: initializedChecklist,
      findings: []
    });
    setShowForm(true);
  };

  const addFinding = () => {
    const newFinding: Finding = {
      id: `finding-${Date.now()}`,
      description: '',
      severity: 'minor',
      corrective_action: '',
      responsible_party: '',
      due_date: '',
      status: 'open'
    };
    
    setFormData({
      ...formData,
      findings: [...formData.findings, newFinding]
    });
  };

  const updateFinding = (index: number, field: keyof Finding, value: any) => {
    const newFindings = [...formData.findings];
    newFindings[index] = { ...newFindings[index], [field]: value };
    setFormData({ ...formData, findings: newFindings });
  };

  const removeFinding = (index: number) => {
    setFormData({
      ...formData,
      findings: formData.findings.filter((_, i) => i !== index)
    });
  };

  const updateChecklistItem = (index: number, field: keyof ChecklistItem, value: any) => {
    const newChecklist = [...formData.checklist_items];
    newChecklist[index] = { ...newChecklist[index], [field]: value };
    setFormData({ ...formData, checklist_items: newChecklist });
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedInspection(null);
    setFormData({
      inspection_type: 'quality',
      title: '',
      description: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      project_id: 0,
      location: '',
      weather_conditions: '',
      temperature: 70,
      witnesses: [''],
      checklist_items: [],
      findings: []
    });
  };

  const getFilteredInspections = () => {
    switch (filter) {
      case 'scheduled':
        return inspections.filter(i => i.status === 'scheduled');
      case 'completed':
        return inspections.filter(i => i.status === 'completed');
      case 'failed':
        return inspections.filter(i => i.result === 'fail');
      default:
        return inspections;
    }
  };

  const getStatusColor = (status: Inspection['status']) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      in_progress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      completed: 'bg-green-500/20 text-green-300 border-green-500/50',
      cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      failed: 'bg-red-500/20 text-red-300 border-red-500/50'
    };
    return colors[status];
  };

  const getResultIcon = (result: Inspection['result']) => {
    if (result === 'pass') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (result === 'fail') return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (result === 'conditional') return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return null;
  };

  const calculateChecklistScore = (checklist: ChecklistItem[]) => {
    if (checklist.length === 0) return 0;
    const passed = checklist.filter(item => item.result === 'pass').length;
    return Math.round((passed / checklist.length) * 100);
  };

  const stats = {
    total: inspections.length,
    scheduled: inspections.filter(i => i.status === 'scheduled').length,
    completed: inspections.filter(i => i.status === 'completed').length,
    passRate: inspections.filter(i => i.status === 'completed').length > 0
      ? Math.round((inspections.filter(i => i.result === 'pass').length / inspections.filter(i => i.status === 'completed').length) * 100)
      : 100
  };

  const filteredInspections = getFilteredInspections();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🔍 Inspection Manager</h1>
            <p className="text-slate-400">Quality control and compliance verification</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Schedule Inspection
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Inspections</span>
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400 mt-1">All time</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Scheduled</span>
              <Calendar className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.scheduled}</div>
            <div className="text-sm text-slate-400 mt-1">Upcoming</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
            <div className="text-sm text-slate-400 mt-1">This month</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Pass Rate</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.passRate}%</div>
            <div className="text-sm text-emerald-400 mt-1">Quality score</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'completed', 'failed'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Inspections List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading inspections...</p>
            </div>
          ) : filteredInspections.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg">No inspections found</p>
              <p className="text-sm mt-2">Schedule your first inspection to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredInspections.map((inspection) => {
                const inspectionType = INSPECTION_TYPES.find(t => t.value === inspection.inspection_type);
                return (
                  <div key={inspection.id} className="p-6 hover:bg-slate-700/30 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{inspectionType?.icon || '📋'}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{inspection.title}</h3>
                            <p className="text-sm text-slate-400">{inspectionType?.label}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inspection.status)}`}>
                            {inspection.status}
                          </span>
                          {inspection.result && getResultIcon(inspection.result)}
                        </div>

                        {inspection.description && (
                          <p className="text-slate-300 mb-3">{inspection.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>Scheduled: {new Date(inspection.scheduled_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span>{inspection.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{inspection.inspector_name || 'Unassigned'}</span>
                          </div>
                        </div>

                        {inspection.checklist_items.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-slate-400">Checklist Progress</span>
                              <span className="text-sm font-medium text-white">
                                {calculateChecklistScore(inspection.checklist_items)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-amber-600 rounded-full transition-all duration-500"
                                style={{ width: `${calculateChecklistScore(inspection.checklist_items)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {inspection.findings.length > 0 && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="text-slate-400">Findings:</span>
                            <div className="flex gap-2">
                              {inspection.findings.filter(f => f.severity === 'critical').length > 0 && (
                                <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded">
                                  {inspection.findings.filter(f => f.severity === 'critical').length} Critical
                                </span>
                              )}
                              {inspection.findings.filter(f => f.severity === 'major').length > 0 && (
                                <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded">
                                  {inspection.findings.filter(f => f.severity === 'major').length} Major
                                </span>
                              )}
                              {inspection.findings.filter(f => f.severity === 'minor').length > 0 && (
                                <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded">
                                  {inspection.findings.filter(f => f.severity === 'minor').length} Minor
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {inspection.status === 'scheduled' && (
                          <button
                            onClick={() => startInspection(inspection)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Start
                          </button>
                        )}
                        {inspection.status === 'completed' && (
                          <button
                            onClick={() => setViewingInspection(inspection)}
                            className="text-slate-400 hover:text-white transition"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inspection Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedInspection ? 'Conduct Inspection' : 'Schedule New Inspection'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!selectedInspection && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Inspection Type
                      </label>
                      <select
                        value={formData.inspection_type}
                        onChange={(e) => setFormData({...formData, inspection_type: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      >
                        {INSPECTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Inspection title"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Inspection location"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedInspection && (
                  <>
                    {/* Weather Conditions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Weather Conditions
                        </label>
                        <input
                          type="text"
                          value={formData.weather_conditions}
                          onChange={(e) => setFormData({...formData, weather_conditions: e.target.value})}
                          placeholder="Clear, Rainy, etc."
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Temperature (°F)
                        </label>
                        <input
                          type="number"
                          value={formData.temperature}
                          onChange={(e) => setFormData({...formData, temperature: Number(e.target.value)})}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>

                    {/* Checklist */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Inspection Checklist</h3>
                      <div className="space-y-4">
                        {formData.checklist_items.map((item, index) => (
                          <div key={item.id} className="bg-slate-800/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-xs text-blue-400 uppercase">{item.category}</span>
                                <p className="text-white">{item.item}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateChecklistItem(index, 'result', 'pass')}
                                  className={`px-3 py-1 rounded ${
                                    item.result === 'pass' 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                  } transition`}
                                >
                                  Pass
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateChecklistItem(index, 'result', 'fail')}
                                  className={`px-3 py-1 rounded ${
                                    item.result === 'fail' 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                  } transition`}
                                >
                                  Fail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateChecklistItem(index, 'result', 'na')}
                                  className={`px-3 py-1 rounded ${
                                    item.result === 'na' 
                                      ? 'bg-gray-600 text-white' 
                                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                  } transition`}
                                >
                                  N/A
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => updateChecklistItem(index, 'notes', e.target.value)}
                              placeholder="Notes (optional)"
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm mt-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Findings */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">Findings</h3>
                        <button
                          type="button"
                          onClick={addFinding}
                          className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Finding
                        </button>
                      </div>
                      
                      {formData.findings.map((finding, index) => (
                        <div key={finding.id} className="bg-slate-800/30 rounded-lg p-4 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <input
                              type="text"
                              value={finding.description}
                              onChange={(e) => updateFinding(index, 'description', e.target.value)}
                              placeholder="Finding description"
                              className="md:col-span-2 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                            />
                            <select
                              value={finding.severity}
                              onChange={(e) => updateFinding(index, 'severity', e.target.value)}
                              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                            >
                              <option value="minor">Minor</option>
                              <option value="major">Major</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                          
                          <input
                            type="text"
                            value={finding.corrective_action || ''}
                            onChange={(e) => updateFinding(index, 'corrective_action', e.target.value)}
                            placeholder="Corrective action required"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white mb-3"
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={finding.responsible_party || ''}
                              onChange={(e) => updateFinding(index, 'responsible_party', e.target.value)}
                              placeholder="Responsible party"
                              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                            />
                            <input
                              type="date"
                              value={finding.due_date || ''}
                              onChange={(e) => updateFinding(index, 'due_date', e.target.value)}
                              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeFinding(index)}
                            className="text-red-400 hover:text-red-300 text-sm mt-2"
                          >
                            Remove Finding
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Photos Section */}
                    <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">Add Photos</p>
                        <p className="text-sm text-slate-400">Document findings with photos</p>
                      </div>
                      <button
                        type="button"
                        className="ml-auto bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        Upload Photos
                      </button>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {selectedInspection ? 'Complete Inspection' : 'Schedule Inspection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Inspection Modal */}
        {viewingInspection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{viewingInspection.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingInspection.status)}`}>
                      {viewingInspection.status}
                    </span>
                    {viewingInspection.result && (
                      <div className="flex items-center gap-1">
                        {getResultIcon(viewingInspection.result)}
                        <span className="text-sm font-medium text-white">
                          {viewingInspection.result.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setViewingInspection(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Date</label>
                    <p className="text-white">{new Date(viewingInspection.scheduled_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Inspector</label>
                    <p className="text-white">{viewingInspection.inspector_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Location</label>
                    <p className="text-white">{viewingInspection.location}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Weather</label>
                    <p className="text-white">{viewingInspection.weather_conditions || 'N/A'}</p>
                  </div>
                </div>

                {viewingInspection.checklist_items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Checklist Results</h3>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Overall Score</span>
                          <span className="text-white font-medium">
                            {calculateChecklistScore(viewingInspection.checklist_items)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-amber-600 rounded-full"
                            style={{ width: `${calculateChecklistScore(viewingInspection.checklist_items)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {viewingInspection.checklist_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-xs text-blue-400 uppercase">{item.category}</span>
                              <p className="text-sm text-white">{item.item}</p>
                              {item.notes && <p className="text-xs text-slate-400 mt-1">{item.notes}</p>}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.result === 'pass' ? 'bg-green-900/50 text-green-400' :
                              item.result === 'fail' ? 'bg-red-900/50 text-red-400' :
                              'bg-gray-900/50 text-gray-400'
                            }`}>
                              {item.result.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {viewingInspection.findings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Findings</h3>
                    <div className="space-y-3">
                      {viewingInspection.findings.map(finding => (
                        <div key={finding.id} className="bg-slate-800/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{finding.description}</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              finding.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                              finding.severity === 'major' ? 'bg-orange-900/50 text-orange-400' :
                              'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              {finding.severity.toUpperCase()}
                            </span>
                          </div>
                          {finding.corrective_action && (
                            <p className="text-sm text-slate-300 mb-2">
                              <strong>Action:</strong> {finding.corrective_action}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            {finding.responsible_party && (
                              <span>Assigned to: {finding.responsible_party}</span>
                            )}
                            {finding.due_date && (
                              <span>Due: {new Date(finding.due_date).toLocaleDateString()}</span>
                            )}
                            <span className={`px-2 py-1 rounded ${
                              finding.status === 'resolved' ? 'bg-green-900/50 text-green-400' :
                              finding.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400' :
                              'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              {finding.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition">
                    <FileText className="w-4 h-4" />
                    Export Report
                  </button>
                  <button
                    onClick={() => setViewingInspection(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
