import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, CheckCircle, Clock, FileText, Plus, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import toast from 'react-hot-toast';

interface SafetyTopic {
  id: string;
  topic: string;
  description: string;
  hazards: string[];
  mitigations: string[];
}

interface Briefing {
  id: string;
  title: string;
  description: string;
  project_id: string;
  project_name?: string;
  conducted_by: string;
  conductor_name?: string;
  attendees: string[];
  date_conducted: string;
  topics_covered: string[];
  signature_image_url?: string;
  created_at: string;
}

interface Attendee {
  id: string;
  name: string;
  role: string;
  signed: boolean;
}

export const SafetyBriefing: React.FC = () => {
  const { session } = useAuthContext();
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    topics: [] as string[],
    attendees: [] as Attendee[]
  });

  const [newAttendee, setNewAttendee] = useState({ name: '', role: '' });

  const commonTopics = [
    'PPE Requirements',
    'Job Hazards Analysis',
    'Emergency Procedures',
    'Equipment Safety',
    'Fall Protection',
    'Electrical Safety',
    'Confined Space',
    'Hot Work Permits',
    'Lock Out Tag Out',
    'Working at Heights',
    'Manual Handling',
    'Environmental Hazards'
  ];

  useEffect(() => {
    if (session) {
      fetchBriefings();
      // Set default project from user context
      const projectId = session.user?.user_metadata?.current_project_id || '';
      setFormData(prev => ({ ...prev, project_id: projectId }));
    }
  }, [session]);

  const fetchBriefings = async () => {
    try {
      const response = await fetch('/api/safety/briefings', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBriefings(data);
      }
    } catch (error) {
      console.error('Failed to fetch briefings:', error);
      toast.error('Failed to load safety briefings');
    } finally {
      setLoading(false);
    }
  };

  const createBriefing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.topics.length === 0 || formData.attendees.length === 0) {
      toast.error('Please fill all required fields and add attendees');
      return;
    }

    try {
      const response = await fetch('/api/safety/briefings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          project_id: formData.project_id || session?.user?.user_metadata?.current_project_id,
          conducted_by: session?.user?.id,
          attendees: formData.attendees.map(a => a.name),
          date_conducted: new Date().toISOString(),
          topics_covered: formData.topics
        })
      });

      if (response.ok) {
        toast.success('Safety briefing recorded successfully');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          project_id: formData.project_id,
          topics: [],
          attendees: []
        });
        fetchBriefings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create briefing');
      }
    } catch (error) {
      console.error('Error creating briefing:', error);
      toast.error('Failed to create briefing');
    }
  };

  const addAttendee = () => {
    if (newAttendee.name && newAttendee.role) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, {
          id: Date.now().toString(),
          name: newAttendee.name,
          role: newAttendee.role,
          signed: true
        }]
      }));
      setNewAttendee({ name: '', role: '' });
    }
  };

  const removeAttendee = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.id !== id)
    }));
  };

  const toggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Safety Briefings</h1>
          <p className="text-gray-600 mt-1">Conduct and document daily safety talks</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          New Briefing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-6 h-6 text-green-500" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {briefings.filter(b => 
              new Date(b.date_conducted).toDateString() === new Date().toDateString()
            ).length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Briefings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {briefings.reduce((sum, b) => sum + (b.attendees?.length || 0), 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">Attendees</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-purple-500" />
            <span className="text-xs text-gray-500">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {briefings.filter(b => {
              const briefingDate = new Date(b.date_conducted);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return briefingDate >= weekAgo;
            }).length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Briefings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-gray-500">Compliance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">100%</p>
          <p className="text-xs text-gray-600 mt-1">Rate</p>
        </div>
      </div>

      {/* Briefings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Briefings</h2>
        </div>
        <div className="divide-y">
          {briefings.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No safety briefings recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">Start by conducting your first briefing</p>
            </div>
          ) : (
            briefings.map(briefing => (
              <div
                key={briefing.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedBriefing(briefing)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{briefing.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{briefing.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {briefing.topics_covered?.map(topic => (
                        <span key={topic} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(briefing.date_conducted).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(briefing.date_conducted).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {briefing.attendees?.length || 0} attendees
                      </div>
                      {briefing.project_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {briefing.project_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Briefing Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Conduct Safety Briefing</h2>
            </div>
            
            <form onSubmit={createBriefing} className="p-6 space-y-6">
              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Briefing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Morning Safety Talk - Electrical Hazards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Brief summary of the safety briefing..."
                  />
                </div>
              </div>

              {/* Topics Covered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics Covered * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {commonTopics.map(topic => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.topics.includes(topic)
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendees *
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({...newAttendee, name: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={newAttendee.role}
                    onChange={(e) => setNewAttendee({...newAttendee, role: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                
                {formData.attendees.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {attendee.name} - {attendee.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttendee(attendee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Briefing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Briefing Modal */}
      {selectedBriefing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{selectedBriefing.title}</h2>
              <p className="text-gray-600 mt-1">{selectedBriefing.description}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBriefing.topics_covered?.map(topic => (
                    <span key={topic} className="px-3 py-1 bg-green-100 text-green-700 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Attendees ({selectedBriefing.attendees?.length || 0})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBriefing.attendees?.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Conducted by: {selectedBriefing.conductor_name || 'Unknown'}</span>
                  <span>{new Date(selectedBriefing.date_conducted).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBriefing(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
