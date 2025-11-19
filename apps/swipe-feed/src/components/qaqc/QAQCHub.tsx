import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp, Users, FileText, Camera, Download, Upload, Loader2, Plus, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface Inspection {
  id: string;
  project_id: string;
  project_name?: string;
  inspection_type: string;
  scheduled_date: string;
  completed_date?: string;
  inspector_id: string;
  inspector_name?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  score?: number;
  findings: Finding[];
  photos: string[];
  report_url?: string;
  created_at: string;
}

interface Finding {
  id: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'resolved' | 'verified';
  corrective_action?: string;
  resolution_date?: string;
  photos: string[];
}

interface QualityMetrics {
  totalInspections: number;
  passRate: number;
  openFindings: number;
  avgScore: number;
  overdueInspections: number;
  completionRate: number;
}

export const QAQCHub: React.FC = () => {
  const { session } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics>({
    totalInspections: 0,
    passRate: 0,
    openFindings: 0,
    avgScore: 0,
    overdueInspections: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  // Form state for new inspection
  const [newInspection, setNewInspection] = useState({
    inspection_type: 'Concrete Pour',
    scheduled_date: new Date().toISOString().split('T')[0],
    project_id: '',
    notes: ''
  });

  useEffect(() => {
    if (session) {
      fetchInspections();
      fetchMetrics();
      // Get current project from session or context
      const projectId = session.user?.user_metadata?.current_project_id || '';
      setCurrentProjectId(projectId);
      setNewInspection(prev => ({ ...prev, project_id: projectId }));
    }
  }, [filterStatus, session]);

  const fetchInspections = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/qaqc/inspections?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInspections(data.inspections || []);
      }
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/qaqc/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const createInspection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/qaqc/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newInspection)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewInspection({
          inspection_type: 'Concrete Pour',
          scheduled_date: new Date().toISOString().split('T')[0],
          project_id: currentProjectId,
          notes: ''
        });
        fetchInspections();
        fetchMetrics();
        toast.success('Inspection scheduled successfully!');
      } else {
        const error = await response.json();
        toast.error(`Failed to create inspection: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to create inspection');
    }
  };

  const startInspection = async (inspectionId: string) => {
    try {
      const response = await fetch(`/api/qaqc/inspections/${inspectionId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        fetchInspections();
        toast.success('Inspection started!');
      }
    } catch (error) {
      console.error('Error starting inspection:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'scheduled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'major': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'minor': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const inspectionTypes = [
    'Concrete Pour',
    'Structural Steel',
    'Electrical Installation',
    'Mechanical Systems',
    'Fire Protection',
    'Waterproofing',
    'Insulation',
    'Final Walkthrough'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If showing collaboration, render fullscreen
  if (showCollaboration) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowCollaboration(false)}
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            ← Back to QA/QC Hub
          </button>
        </div>
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-blue-300">Collaborative Inspection Review</h3>
              <p className="text-sm text-blue-400/80">
                Video inspections • Remote quality checks • Finding discussions
              </p>
            </div>
          </div>
        </div>
        <CollaborationHub projectId="qaqc-hub" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-gray-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Quality Assurance</p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              QA/QC Hub
            </h1>
            <p className="max-w-3xl text-base text-gray-400">
              Track inspections, maintain quality standards, and collaborate with your team on quality checks.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCollaboration(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
              title="Start collaborative inspection review"
            >
              <Video className="w-5 h-5" />
              <span className="hidden sm:inline">Inspection Call</span>
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-blue-500/50 hover:bg-gray-800/80 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          </div>
        </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.totalInspections}</p>
          <p className="text-sm text-gray-400 mt-1">Inspections</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Rate</span>
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(metrics.passRate).replace('text-', 'text-')}`}>
            {metrics.passRate}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Pass Rate</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Open</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.openFindings}</p>
          <p className="text-sm text-gray-400 mt-1">Findings</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(metrics.avgScore).replace('text-', 'text-')}`}>
            {metrics.avgScore}
          </p>
          <p className="text-sm text-gray-400 mt-1">Avg Score</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-6 h-6 text-red-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Due</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.overdueInspections}</p>
          <p className="text-sm text-gray-400 mt-1">Overdue</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.completionRate}%</p>
          <p className="text-sm text-gray-400 mt-1">Complete</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'scheduled', 'in_progress', 'completed', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* Inspections List */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Inspections</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {inspections.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No inspections found</p>
              <p className="text-sm text-gray-500 mt-2">Schedule your first inspection to get started</p>
            </div>
          ) : (
            inspections.map(inspection => (
              <div
                key={inspection.id}
                className="p-6 hover:bg-gray-900/50 transition-colors cursor-pointer"
                onClick={() => setSelectedInspection(inspection)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{inspection.inspection_type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(inspection.status)}`}>
                        {inspection.status.replace('_', ' ')}
                      </span>
                      {inspection.score !== undefined && (
                        <span className={`text-sm font-bold ${getScoreColor(inspection.score)}`}>
                          {inspection.score}%
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Scheduled: {new Date(inspection.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {inspection.completed_date && (
                          <span className="text-green-400">
                            • Completed: {new Date(inspection.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </p>
                      {inspection.project_name && (
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          {inspection.project_name}
                        </p>
                      )}
                      {inspection.inspector_name && (
                        <p className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          Inspector: {inspection.inspector_name}
                        </p>
                      )}
                    </div>

                    {/* Findings Summary */}
                    {inspection.findings && inspection.findings.length > 0 && (
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        {['critical', 'major', 'minor'].map(severity => {
                          const count = inspection.findings.filter(f => f.severity === severity).length;
                          if (count === 0) return null;
                          return (
                            <div key={severity} className="flex items-center gap-2">
                              {getSeverityIcon(severity)}
                              <span className="text-gray-400">{count} {severity}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {inspection.status === 'scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startInspection(inspection.id);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Start
                      </button>
                    )}
                    {inspection.report_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(inspection.report_url, '_blank');
                        }}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:border-blue-500/50 transition-all text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  </div>

      {/* Create Inspection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Schedule New Inspection</h2>
            <form onSubmit={createInspection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Type
                </label>
                <select
                  value={newInspection.inspection_type}
                  onChange={(e) => setNewInspection({...newInspection, inspection_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  {inspectionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={newInspection.scheduled_date}
                  onChange={(e) => setNewInspection({...newInspection, scheduled_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newInspection.notes}
                  onChange={(e) => setNewInspection({...newInspection, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any special requirements or areas of focus..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Details Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedInspection.inspection_type}</h2>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedInspection.status)}`}>
                  {selectedInspection.status.replace('_', ' ')}
                </span>
              </div>
              {selectedInspection.score !== undefined && (
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(selectedInspection.score)}`}>
                    {selectedInspection.score}%
                  </p>
                  <p className="text-xs text-gray-600">Score</p>
                </div>
              )}
            </div>

            {/* Findings */}
            {selectedInspection.findings && selectedInspection.findings.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Findings</h3>
                <div className="space-y-3">
                  {selectedInspection.findings.map((finding, idx) => (
                    <div key={finding.id || idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(finding.severity)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{finding.description}</p>
                          {finding.corrective_action && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Action:</span> {finding.corrective_action}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded ${
                              finding.status === 'resolved' ? 'bg-green-100 text-green-700' :
                              finding.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {finding.status}
                            </span>
                            {finding.resolution_date && (
                              <span>Resolved: {new Date(finding.resolution_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedInspection(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};