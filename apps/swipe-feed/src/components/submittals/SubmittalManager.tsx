import React, { useState, useEffect } from 'react';
import { FileText, Upload, Check, AlertCircle, Clock, Search, Filter, Eye, Download, MessageSquare, Compass, Archive } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import '../../styles/davinci.css';

interface Submittal {
  id: string;
  project_id: string;
  submittal_number: string;
  title: string;
  description: string;
  spec_section: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revised';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string;
  submitted_date: string;
  required_date: string;
  approved_date?: string;
  reviewer_comments?: string;
  revision_count: number;
  attachments: Array<{
    id: string;
    filename: string;
    file_size: number;
    uploaded_at: string;
  }>;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
    project_number: string;
  };
}

export const SubmittalManager: React.FC = () => {
  const { session } = useAuth();
  const [submittals, setSubmittals] = useState<Submittal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubmittal, setSelectedSubmittal] = useState<Submittal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    spec_section: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    required_date: '',
    project_id: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubmittals();
      subscribeToChanges();
    }
  }, [session?.user?.id, filter]);

  const fetchSubmittals = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('submittals')
        .select(`
          *,
          project:projects(name, project_number)
        `)
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

  const subscribeToChanges = () => {
    const subscription = supabase
      .channel('submittals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submittals'
      }, () => {
        fetchSubmittals();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleCreateSubmittal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submittalNumber = `SUB-${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from('submittals')
        .insert({
          ...formData,
          submittal_number: submittalNumber,
          status: 'draft',
          submitted_by: session?.user?.id,
          submitted_date: new Date().toISOString(),
          revision_count: 0
        });

      if (error) throw error;

      toast.success('Submittal created successfully');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        spec_section: '',
        priority: 'medium',
        required_date: '',
        project_id: ''
      });
    } catch (error) {
      console.error('Error creating submittal:', error);
      toast.error('Failed to create submittal');
    }
  };

  const updateSubmittalStatus = async (id: string, status: string, comments?: string) => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      
      if (status === 'approved') {
        updates.approved_date = new Date().toISOString();
      }
      
      if (comments) {
        updates.reviewer_comments = comments;
      }

      const { error } = await supabase
        .from('submittals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Submittal ${status}`);
      setSelectedSubmittal(null);
    } catch (error) {
      console.error('Error updating submittal:', error);
      toast.error('Failed to update submittal');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-slate-400 bg-slate-900/50',
      submitted: 'text-blue-400 bg-blue-900/50',
      under_review: 'text-amber-400 bg-amber-900/50',
      approved: 'text-green-400 bg-green-900/50',
      rejected: 'text-red-400 bg-red-900/50',
      revised: 'text-purple-400 bg-purple-900/50'
    };
    return colors[status as keyof typeof colors] || 'text-slate-400 bg-slate-900/50';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-slate-400',
      medium: 'text-amber-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[priority as keyof typeof colors] || 'text-slate-400';
  };

  const filteredSubmittals = submittals.filter(submittal =>
    submittal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submittal.submittal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submittal.spec_section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-[34px] space-y-[34px]">
      {/* Header */}
      <div className="relative">
        <div className="absolute -left-[55px] top-1/2 transform -translate-y-1/2 hidden lg:block opacity-10">
          <Archive className="w-[34px] h-[34px] text-amber-400" />
        </div>
        <h1 className="text-golden-xl font-bold text-white mb-[8px] measurement-line">Submittal Manager</h1>
        <p className="text-slate-400 technical-annotation" data-note="MEMORY">Track and manage all project submittals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[21px]">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-400/60 annotation" data-note="TOTAL">Total Submittals</p>
              <p className="text-golden-base font-bold text-white">{submittals.length}</p>
            </div>
            <FileText className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-400/60 annotation" data-note="PENDING">Under Review</p>
              <p className="text-golden-base font-bold text-amber-400">
                {submittals.filter(s => s.status === 'under_review').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400/60 annotation" data-note="SUCCESS">Approved</p>
              <p className="text-golden-base font-bold text-green-400">
                {submittals.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-400/60 annotation" data-note="ACTION">Rejected</p>
              <p className="text-golden-base font-bold text-red-400">
                {submittals.filter(s => s.status === 'rejected').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-engineering">
        {/* Technical Compass */}
        <div className="absolute top-[21px] right-[21px] opacity-5">
          <Compass className="w-[55px] h-[55px] text-amber-400" style={{ animation: 'gear-rotate 30s linear infinite' }} />
        </div>

        <div className="flex flex-col md:flex-row gap-[21px] items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="SEARCH">
              Search Submittals
            </label>
            <div className="relative">
              <Search className="absolute left-[13px] top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400/60" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, number, or spec section..."
                className="w-full pl-[44px] pr-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none input-davinci"
              />
            </div>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="FILTER">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="revised">Revised</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-[34px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px] btn-davinci field-touch glow-renaissance"
          >
            <Upload className="w-5 h-5" />
            New Submittal
          </button>
        </div>
      </div>

      {/* Submittals List */}
      <div className="space-y-[21px]">
        {loading ? (
          <div className="text-center py-[89px]">
            <div className="inline-block w-[55px] h-[55px] border-[3px] border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : filteredSubmittals.length === 0 ? (
          <div className="text-center py-[89px] text-slate-400">
            <Archive className="w-[89px] h-[89px] mx-auto mb-[21px] opacity-20" />
            <p className="text-golden-base">No submittals found</p>
          </div>
        ) : (
          filteredSubmittals.map((submittal) => (
            <div
              key={submittal.id}
              className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] hover:border-amber-500/40 transition-all card-vitruvian"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[21px]">
                <div className="flex-1">
                  <div className="flex items-start gap-[13px] mb-[13px]">
                    <FileText className="w-6 h-6 text-amber-400 mt-1" />
                    <div>
                      <h3 className="text-golden-base font-semibold text-white measurement-line">
                        {submittal.title}
                      </h3>
                      <p className="text-amber-400/60 text-sm mt-[5px]">
                        {submittal.submittal_number} • Section {submittal.spec_section}
                      </p>
                    </div>
                    <span className={`px-[13px] py-[5px] rounded-full text-xs font-medium ${getStatusColor(submittal.status)}`}>
                      {submittal.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 mb-[13px] field-readable ml-[37px]">
                    {submittal.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-[21px] text-sm text-slate-400 ml-[37px]">
                    <span className="flex items-center gap-[8px]">
                      <Clock className="w-4 h-4 text-amber-400/60" />
                      Required: {format(new Date(submittal.required_date), 'MMM d, yyyy')}
                    </span>
                    <span className={`flex items-center gap-[8px] ${getPriorityColor(submittal.priority)}`}>
                      <AlertCircle className="w-4 h-4" />
                      {submittal.priority.toUpperCase()} Priority
                    </span>
                    <span className="flex items-center gap-[8px]">
                      <MessageSquare className="w-4 h-4 text-amber-400/60" />
                      {submittal.revision_count} Revisions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-[13px]">
                  <button
                    onClick={() => setSelectedSubmittal(submittal)}
                    className="p-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 rounded-[8px] text-amber-400 transition-all tech-border"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 rounded-[8px] text-amber-400 transition-all tech-border">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[21px] bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900/95 border border-amber-500/20 rounded-[21px] p-[34px] max-w-lg w-full card-engineering">
            <h2 className="text-golden-base font-bold text-white mb-[21px] measurement-line">
              Create New Submittal
            </h2>
            
            <form onSubmit={handleCreateSubmittal} className="space-y-[21px]">
              <div>
                <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="TITLE">
                  Submittal Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="DESC">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="SPEC">
                    Spec Section
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 26 05 00"
                    value={formData.spec_section}
                    onChange={(e) => setFormData({ ...formData, spec_section: e.target.value })}
                    className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="PRIORITY">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="DUE">
                  Required Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.required_date}
                  onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                  className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                />
              </div>

              <div className="flex gap-[13px] pt-[13px]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-[34px] py-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 text-white rounded-[8px] font-medium transition-all tech-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-[34px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-semibold transition-all btn-davinci"
                >
                  Create Submittal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmittal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[21px] bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900/95 border border-amber-500/20 rounded-[21px] p-[34px] max-w-2xl w-full max-h-[90vh] overflow-y-auto card-engineering">
            <div className="flex justify-between items-start mb-[34px]">
              <div>
                <h2 className="text-golden-base font-bold text-white measurement-line">
                  {selectedSubmittal.title}
                </h2>
                <p className="text-amber-400/60 mt-[8px]">
                  {selectedSubmittal.submittal_number} • {selectedSubmittal.spec_section}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmittal(null)}
                className="text-amber-400 hover:text-amber-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-[34px]">
              <div>
                <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="DETAILS">
                  Submittal Details
                </h3>
                <p className="text-slate-300 field-readable">{selectedSubmittal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-[21px]">
                <div>
                  <p className="text-sm text-amber-400/60 mb-[5px]">Status</p>
                  <span className={`px-[13px] py-[5px] rounded-full text-sm font-medium inline-block ${getStatusColor(selectedSubmittal.status)}`}>
                    {selectedSubmittal.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-amber-400/60 mb-[5px]">Priority</p>
                  <span className={`text-sm font-medium ${getPriorityColor(selectedSubmittal.priority)}`}>
                    {selectedSubmittal.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-amber-400/60 mb-[5px]">Required Date</p>
                  <p className="text-white">{format(new Date(selectedSubmittal.required_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-400/60 mb-[5px]">Revisions</p>
                  <p className="text-white">{selectedSubmittal.revision_count}</p>
                </div>
              </div>

              {selectedSubmittal.reviewer_comments && (
                <div>
                  <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="REVIEW">
                    Reviewer Comments
                  </h3>
                  <p className="text-slate-300 field-readable bg-slate-800/30 p-[21px] rounded-[13px]">
                    {selectedSubmittal.reviewer_comments}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedSubmittal.status !== 'approved' && (
                <div className="flex gap-[13px] pt-[21px] border-t border-amber-500/20">
                  {selectedSubmittal.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => updateSubmittalStatus(selectedSubmittal.id, 'under_review')}
                        className="flex-1 px-[34px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-semibold transition-all btn-davinci"
                      >
                        Start Review
                      </button>
                    </>
                  )}
                  {selectedSubmittal.status === 'under_review' && (
                    <>
                      <button
                        onClick={() => updateSubmittalStatus(selectedSubmittal.id, 'approved')}
                        className="flex-1 px-[34px] py-[13px] bg-green-600 hover:bg-green-700 text-white rounded-[8px] font-semibold transition-all btn-davinci"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateSubmittalStatus(selectedSubmittal.id, 'rejected', 'Requires revision')}
                        className="flex-1 px-[34px] py-[13px] bg-red-600 hover:bg-red-700 text-white rounded-[8px] font-semibold transition-all btn-davinci"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leonardo Quote */}
      <div className="text-center opacity-30 mt-[89px]">
        <p className="text-golden-sm text-amber-400/60 font-light italic technical-annotation">
          "Learning never exhausts the mind"
        </p>
        <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
      </div>
    </div>
  );
};

export default SubmittalManager;
