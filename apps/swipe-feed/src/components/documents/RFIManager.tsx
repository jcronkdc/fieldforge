import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Paperclip,
  Calendar,
  DollarSign,
  Send,
  Eye,
  Video
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../EmptyState';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface RFI {
  id: string;
  rfiNumber: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'open' | 'in_review' | 'responded' | 'closed' | 'void';
  question: string;
  submittedDate: string | null;
  requiredResponseDate: string | null;
  responseDate: string | null;
  daysOutstanding: number;
  costImpact: number | null;
  scheduleImpactDays: number | null;
  ballInCourt: string;
}

export const RFIManager: React.FC = () => {
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(false);

  const [newRFI, setNewRFI] = useState({
    title: '',
    category: 'design',
    priority: 'medium' as const,
    question: '',
    background: '',
    suggestedSolution: '',
    specSection: '',
    drawingReferences: [] as string[],
    requiredResponseDate: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    fetchRFIs();
  }, []);

  const fetchRFIs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRfis(data || []);
    } catch (error) {
      console.error('Error fetching RFIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRFI = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const rfiData = {
        rfi_number: `RFI-${Date.now().toString().slice(-6)}`,
        title: newRFI.title,
        category: newRFI.category,
        priority: newRFI.priority,
        status: 'open',
        question: newRFI.question,
        background: newRFI.background,
        suggested_solution: newRFI.suggestedSolution,
        spec_section: newRFI.specSection,
        drawing_references: newRFI.drawingReferences,
        submitted_by: userData.user?.id,
        submitted_date: new Date().toISOString(),
        required_response_date: newRFI.requiredResponseDate
      };

      const { data, error } = await supabase
        .from('rfis')
        .insert(rfiData);

      if (error) throw error;
      
      alert('RFI submitted. Review the details before distribution.');
      setIsCreatingNew(false);
      fetchRFIs();
    } catch (error) {
      console.error('Error submitting RFI:', error);
      alert('Submission failed. Try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-800';
      case 'open': return 'text-yellow-400 bg-yellow-900/30';
      case 'in_review': return 'text-blue-400 bg-blue-900/30';
      case 'responded': return 'text-green-400 bg-green-900/30';
      case 'closed': return 'text-gray-400 bg-gray-800';
      case 'void': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredRFIs = rfis.filter(rfi => {
    const matchesSearch = rfi.rfiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfi.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const categories = [
    'design', 'specification', 'material', 'construction_method',
    'schedule', 'safety', 'testing', 'commissioning', 'other'
  ];

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">RFI Resolution Call</h2>
              <p className="text-sm text-yellow-100">Question clarification • Design discussions • Specification reviews • Impact analysis</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to RFIs
          </button>
        </div>

        {/* Collaboration Hub */}
        <div className="flex-1 overflow-hidden">
          <CollaborationHub />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FileQuestion className="w-6 h-6 text-yellow-500" />
              RFI Management
            </h2>
            <p className="text-gray-400">Track and manage Requests for Information</p>
          </div>
          <button
            onClick={() => setShowCollaboration(!showCollaboration)}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Resolution Call</span>
          </button>
        </div>
      </div>

      {!isCreatingNew ? (
        <>
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search RFIs"
                  className="w-full rounded-md bg-gray-800 pl-10 pr-4 py-2 text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md bg-gray-800 px-4 py-2 text-white"
              >
                <option value="all">All status</option>
                <option value="open">Open</option>
                <option value="in_review">In review</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5" />
                Create RFI
              </button>
            </div>
          </div>

          {/* RFI Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total RFIs</p>
              <p className="text-2xl font-bold text-white">{rfis.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Open</p>
              <p className="text-2xl font-bold text-yellow-400">
                {rfis.filter(r => r.status === 'open').length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-white">3.2 days</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-400">
                {rfis.filter(r => r.priority === 'critical').length}
              </p>
            </div>
          </div>

          {/* RFI List */}
          {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="skeleton h-24 rounded-lg border border-gray-800 bg-gray-800/50" />
            ))}
          </div>
          ) : filteredRFIs.length === 0 ? (
          <EmptyState
            title="No RFIs found"
            body={searchTerm ? 'Change your search to see other RFIs.' : 'Create an RFI to capture field questions.'}
            action={
              !searchTerm ? (
                <button onClick={() => setIsCreatingNew(true)} className="btn btn-primary">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create RFI
                </button>
              ) : null
            }
          />
          ) : (
            <div className="space-y-3">
              {filteredRFIs.map(rfi => (
                <div
                  key={rfi.id}
                  onClick={() => setSelectedRFI(rfi)}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-semibold">{rfi.rfiNumber}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(rfi.status)}`}>
                          {rfi.status.toUpperCase()}
                        </span>
                        <span className={getPriorityColor(rfi.priority)}>
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{rfi.title}</p>
                    </div>
                    {rfi.daysOutstanding > 0 && rfi.status === 'open' && (
                      <div className="text-right">
                        <p className="text-red-400 text-sm font-medium">
                          {rfi.daysOutstanding} days
                        </p>
                        <p className="text-gray-500 text-xs">Outstanding</p>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{rfi.question}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rfi.submittedDate ? new Date(rfi.submittedDate).toLocaleDateString() : 'Draft'}
                      </span>
                      {rfi.costImpact && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${rfi.costImpact.toLocaleString()}
                        </span>
                      )}
                      {rfi.scheduleImpactDays && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rfi.scheduleImpactDays} days
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">
                      {rfi.ballInCourt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Create new RFI form */
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white">Create new RFI</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newRFI.category}
                  onChange={(e) => setNewRFI(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newRFI.priority}
                  onChange={(e) => setNewRFI(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title/Subject
              </label>
              <input
                type="text"
                value={newRFI.title}
                onChange={(e) => setNewRFI(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question
              </label>
              <textarea
                value={newRFI.question}
                onChange={(e) => setNewRFI(prev => ({ ...prev, question: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                rows={4}
                placeholder="Clearly state your question or request for information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background
              </label>
              <textarea
                value={newRFI.background}
                onChange={(e) => setNewRFI(prev => ({ ...prev, background: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                rows={3}
                placeholder="Provide context and background information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Suggested Solution (Optional)
              </label>
              <textarea
                value={newRFI.suggestedSolution}
                onChange={(e) => setNewRFI(prev => ({ ...prev, suggestedSolution: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                rows={2}
                placeholder="If you have a suggested solution, describe it here"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Spec Section
                </label>
                <input
                  type="text"
                  value={newRFI.specSection}
                  onChange={(e) => setNewRFI(prev => ({ ...prev, specSection: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="e.g., 26 05 00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Response Date
                </label>
                <input
                  type="date"
                  value={newRFI.requiredResponseDate}
                  onChange={(e) => setNewRFI(prev => ({ ...prev, requiredResponseDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Drawing References
              </label>
              <input
                type="text"
                placeholder="Enter drawing numbers separated by commas"
                onChange={(e) => setNewRFI(prev => ({
                  ...prev,
                  drawingReferences: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attachments
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        setNewRFI(prev => ({
                          ...prev,
                          attachments: [...prev.attachments, ...Array.from(files)]
                        }));
                      }
                    }}
                    className="hidden"
                  />
                  <Paperclip className="inline w-4 h-4 mr-2" />
                  Attach Files
                </label>
                <span className="text-gray-400 text-sm">
                  {newRFI.attachments.length} file(s) attached
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={submitRFI}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit RFI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
