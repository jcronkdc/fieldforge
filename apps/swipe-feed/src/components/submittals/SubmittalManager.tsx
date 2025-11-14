import React, { useState, useEffect } from 'react';
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Compass, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Submittal {
  id: string;
  project_id: string;
  submittal_number: string;
  title: string;
  spec_section: string;
  description: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revise_resubmit';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string;
  submitted_date: string;
  required_date: string;
  approved_date?: string;
  reviewer_comments?: string;
  revision_number: number;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export const SubmittalManager: React.FC = () => {
  const { user } = useAuth();
  const [submittals, setSubmittals] = useState<Submittal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmittal, setSelectedSubmittal] = useState<Submittal | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    spec_section: '',
    description: '',
    priority: 'medium' as const,
    required_date: ''
  });

  useEffect(() => {
    fetchSubmittals();
  }, [filter]);

  const fetchSubmittals = async () => {
    try {
      let query = supabase
        .from('submittals')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setSubmittals(data || []);
    } catch (error) {
      console.error('Error fetching submittals:', error);
      toast.error('Failed to load submittals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.spec_section) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const submittalNumber = `SUB-${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase.from('submittals').insert({
        project_id: '00000000-0000-0000-0000-000000000000', // TODO: Get from context
        submittal_number: submittalNumber,
        title: formData.title,
        spec_section: formData.spec_section,
        description: formData.description,
        status: 'draft',
        priority: formData.priority,
        submitted_by: user?.id,
        submitted_date: new Date().toISOString(),
        required_date: formData.required_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revision_number: 1,
        attachments: []
      });

      if (error) throw error;

      toast.success('Submittal created successfully');
      setShowUploadForm(false);
      setFormData({
        title: '',
        spec_section: '',
        description: '',
        priority: 'medium',
        required_date: ''
      });
      fetchSubmittals();
    } catch (error) {
      console.error('Error creating submittal:', error);
      toast.error('Failed to create submittal');
    }
  };

  const updateStatus = async (id: string, newStatus: Submittal['status'], comments?: string) => {
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (comments) {
        updates.reviewer_comments = comments;
      }

      if (newStatus === 'approved') {
        updates.approved_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('submittals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Submittal ${newStatus.replace('_', ' ')}`);
      fetchSubmittals();
      setSelectedSubmittal(null);
    } catch (error) {
      console.error('Error updating submittal:', error);
      toast.error('Failed to update submittal');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'revise_resubmit':
        return <RefreshCw className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/20';
      case 'medium':
        return 'text-amber-400 bg-amber-400/20';
      default:
        return 'text-green-400 bg-green-400/20';
    }
  };

  const filteredSubmittals = submittals.filter(sub =>
    sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.spec_section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture flex items-center justify-center">
        <div className="text-center">
          <Compass className="w-[89px] h-[89px] text-amber-400 mx-auto mb-[21px] animate-spin" />
          <p className="text-slate-400">Loading submittals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture">
      <div className="p-[34px]">
        {/* Header */}
        <div className="mb-[55px] text-center relative">
          <div className="absolute top-0 left-8 opacity-20">
            <Compass className="w-[144px] h-[144px] text-amber-400" style={{ animation: 'gear-rotate 60s linear infinite' }} />
          </div>
          <h1 className="text-golden-2xl font-bold text-white mb-[13px]">Submittal Manager</h1>
          <p className="text-golden-base text-slate-300">Platform's Memory System</p>
          <p className="text-golden-sm text-amber-400/60 font-light italic technical-annotation mt-[8px]">
            "Learning never exhausts the mind" — Leonardo da Vinci
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-[21px] mb-[34px]">
          <div className="flex-1 min-w-[233px]">
            <div className="relative">
              <Search className="absolute left-[13px] top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full input-davinci bg-slate-800/50 text-white pl-[55px] pr-[21px] py-[13px] rounded-[8px] tech-border"
                placeholder="Search submittals..."
              />
            </div>
          </div>

          <div className="flex gap-[13px]">
            {['all', 'draft', 'submitted', 'under_review', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-[21px] py-[13px] rounded-[8px] font-semibold transition-all ${
                  filter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowUploadForm(true)}
            className="px-[34px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-bold transition-all btn-davinci breathe flex items-center gap-[8px]"
          >
            <Upload className="w-5 h-5" />
            New Submittal
          </button>
        </div>

        {/* Submittal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
          {filteredSubmittals.map((submittal) => (
            <div
              key={submittal.id}
              onClick={() => setSelectedSubmittal(submittal)}
              className="card-vitruvian corner-sketch p-[21px] rounded-[13px] cursor-pointer hover:scale-[1.02] transition-all depth-layer-1"
            >
              <div className="flex items-start justify-between mb-[13px]">
                <div className="flex items-center gap-[8px]">
                  {getStatusIcon(submittal.status)}
                  <span className="text-sm text-slate-400 measurement-line">{submittal.submittal_number}</span>
                </div>
                <span className={`px-[8px] py-[3px] rounded text-xs font-semibold ${getPriorityColor(submittal.priority)}`}>
                  {submittal.priority.toUpperCase()}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-[8px] field-readable">{submittal.title}</h3>
              <p className="text-sm text-slate-400 mb-[13px]">Spec: {submittal.spec_section}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Rev {submittal.revision_number}
                </span>
                <span className="text-slate-400 annotation" data-note="DUE">
                  {new Date(submittal.required_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submittal Details Modal */}
        {selectedSubmittal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-[21px] p-[34px] max-w-2xl w-full max-h-[90vh] overflow-y-auto card-vitruvian">
              <div className="flex justify-between items-start mb-[21px]">
                <div>
                  <h2 className="text-golden-xl font-bold text-white mb-[8px]">{selectedSubmittal.title}</h2>
                  <p className="text-slate-400">{selectedSubmittal.submittal_number} • Rev {selectedSubmittal.revision_number}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmittal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-[21px]">
                <div>
                  <label className="text-sm font-medium text-slate-300">Spec Section</label>
                  <p className="text-white technical-annotation" data-note="SPEC">{selectedSubmittal.spec_section}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <p className="text-white">{selectedSubmittal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-[21px]">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <div className="flex items-center gap-[8px] mt-[5px]">
                      {getStatusIcon(selectedSubmittal.status)}
                      <span className="text-white">{selectedSubmittal.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Priority</label>
                    <span className={`inline-block px-[13px] py-[5px] rounded mt-[5px] font-semibold ${getPriorityColor(selectedSubmittal.priority)}`}>
                      {selectedSubmittal.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[21px]">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Submitted Date</label>
                    <p className="text-white">{new Date(selectedSubmittal.submitted_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Required Date</label>
                    <p className="text-white">{new Date(selectedSubmittal.required_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedSubmittal.reviewer_comments && (
                  <div>
                    <label className="text-sm font-medium text-slate-300">Reviewer Comments</label>
                    <p className="text-white bg-slate-800/50 p-[13px] rounded-[8px] mt-[5px]">
                      {selectedSubmittal.reviewer_comments}
                    </p>
                  </div>
                )}

                {selectedSubmittal.status !== 'approved' && selectedSubmittal.status !== 'rejected' && (
                  <div className="flex gap-[13px] mt-[34px]">
                    <button
                      onClick={() => updateStatus(selectedSubmittal.id, 'approved')}
                      className="flex-1 px-[21px] py-[13px] bg-green-500 hover:bg-green-600 text-white rounded-[8px] font-semibold transition-all btn-davinci"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selectedSubmittal.id, 'revise_resubmit', 'Please see comments for required revisions')}
                      className="flex-1 px-[21px] py-[13px] bg-orange-500 hover:bg-orange-600 text-white rounded-[8px] font-semibold transition-all"
                    >
                      Revise & Resubmit
                    </button>
                    <button
                      onClick={() => updateStatus(selectedSubmittal.id, 'rejected')}
                      className="flex-1 px-[21px] py-[13px] bg-red-500 hover:bg-red-600 text-white rounded-[8px] font-semibold transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Submittal Form */}
        {showUploadForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-[21px] p-[34px] max-w-lg w-full card-vitruvian">
              <h2 className="text-golden-xl font-bold text-white mb-[21px]">New Submittal</h2>
              
              <div className="space-y-[21px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="Electrical Panel Specifications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Spec Section *
                  </label>
                  <input
                    type="text"
                    value={formData.spec_section}
                    onChange={(e) => setFormData({ ...formData, spec_section: e.target.value })}
                    className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="26 24 16"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] min-h-[89px]"
                    placeholder="Detailed description of submittal..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-[21px]">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Required Date
                    </label>
                    <input
                      type="date"
                      value={formData.required_date}
                      onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                      className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="flex gap-[13px] mt-[34px]">
                  <button
                    onClick={() => {
                      setShowUploadForm(false);
                      setFormData({
                        title: '',
                        spec_section: '',
                        description: '',
                        priority: 'medium',
                        required_date: ''
                      });
                    }}
                    className="flex-1 px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-[21px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-semibold transition-all btn-davinci glow-renaissance"
                  >
                    Create Submittal
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