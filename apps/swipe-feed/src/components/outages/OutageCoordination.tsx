import React, { useState, useEffect } from 'react';
import { Power, AlertTriangle, Users, Clock, MapPin, Phone, Calendar, CheckCircle, XCircle, Radio, Zap, Shield, Ruler, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface Outage {
  id: string;
  outage_number: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  affected_circuits: string[];
  affected_customers: number;
  crews_required: number;
  switching_steps: SwitchingStep[];
  safety_requirements: string[];
  notifications_sent: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface SwitchingStep {
  sequence: number;
  description: string;
  location: string;
  equipment_id: string;
  safety_notes: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export const OutageCoordination: React.FC = () => {
  const { user } = useAuth();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOutage, setSelectedOutage] = useState<Outage | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    impact_level: 'medium' as const,
    affected_circuits: '',
    affected_customers: '',
    crews_required: ''
  });

  useEffect(() => {
      fetchOutages();
  }, [filter]);

  const fetchOutages = async () => {
    try {
      let query = supabase
        .from('outage_coordination')
        .select('*')
        .order('start_time', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Add mock data for demo
      const mockOutages: Outage[] = data?.length ? data : [
        {
          id: '1',
          outage_number: 'OUT-2025-001',
          title: 'Substation 12 Maintenance',
          description: 'Annual maintenance and equipment testing',
          location: 'Substation 12 - Main St & 5th Ave',
          start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          status: 'planned',
          impact_level: 'high',
          affected_circuits: ['F12-01', 'F12-02', 'F12-03'],
          affected_customers: 2500,
          crews_required: 4,
          switching_steps: [
            {
              sequence: 1,
              description: 'Open breaker CB-123',
              location: 'Substation 12 - Bay 3',
              equipment_id: 'CB-123',
              safety_notes: 'Verify zero voltage before proceeding',
              completed: false
            },
            {
              sequence: 2,
              description: 'Close tie switch TS-456',
              location: 'Pole 234 - Main St',
              equipment_id: 'TS-456',
              safety_notes: 'Check phase rotation',
              completed: false
            }
          ],
          safety_requirements: ['Lock-out/Tag-out', 'Ground equipment', 'Test before touch'],
          notifications_sent: true,
          created_by: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          outage_number: 'OUT-2025-002',
          title: 'Emergency Repair - Damaged Pole',
          description: 'Vehicle struck pole, immediate repair needed',
          location: '123 Oak Street',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          impact_level: 'critical',
          affected_circuits: ['F15-04'],
          affected_customers: 350,
          crews_required: 2,
          switching_steps: [],
          safety_requirements: ['Traffic control', 'PPE required'],
          notifications_sent: true,
          created_by: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setOutages(mockOutages);
    } catch (error) {
      console.error('Error fetching outages:', error);
      toast.error('Failed to load outages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.location || !formData.start_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const outageNumber = `OUT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
      
      const newOutage = {
          outage_number: outageNumber,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_time: formData.start_time,
        end_time: formData.end_time,
        status: 'planned' as const,
        impact_level: formData.impact_level,
        affected_circuits: formData.affected_circuits.split(',').map(c => c.trim()),
        affected_customers: parseInt(formData.affected_customers) || 0,
        crews_required: parseInt(formData.crews_required) || 1,
        switching_steps: [],
        safety_requirements: [],
        notifications_sent: false,
        created_by: user?.id
      };

      const { error } = await supabase.from('outage_coordination').insert(newOutage);
      if (error) throw error;

      toast.success('Outage created successfully');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        impact_level: 'medium',
        affected_circuits: '',
        affected_customers: '',
        crews_required: ''
      });
      fetchOutages();
    } catch (error) {
      console.error('Error creating outage:', error);
      toast.error('Failed to create outage');
    }
  };

  const updateOutageStatus = async (id: string, newStatus: Outage['status']) => {
    try {
      const { error } = await supabase
        .from('outage_coordination')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Outage ${newStatus}`);
      fetchOutages();
    } catch (error) {
      console.error('Error updating outage:', error);
      toast.error('Failed to update outage');
    }
  };

  const markStepComplete = async (outageId: string, stepSequence: number) => {
    const outage = outages.find(o => o.id === outageId);
    if (!outage) return;

    const updatedSteps = outage.switching_steps.map(step => 
      step.sequence === stepSequence
        ? { ...step, completed: true, completed_by: user?.id, completed_at: new Date().toISOString() }
        : step
    );

    try {
      const { error } = await supabase
        .from('outage_coordination')
        .update({
          switching_steps: updatedSteps,
          updated_at: new Date().toISOString()
        })
        .eq('id', outageId);

      if (error) throw error;

      toast.success('Step marked complete');
      fetchOutages();
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-400 bg-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/20';
      case 'medium':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-green-400 bg-green-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Radio className="w-5 h-5 text-red-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-slate-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  const filteredOutages = outages.filter(outage => 
    filter === 'all' || outage.status === filter
  );

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950   flex items-center justify-center">
        <div className="text-center">
          <Power className="w-[89px] h-[89px] text-blue-400 mx-auto mb-[21px] animate-pulse" />
          <p className="text-slate-400">Loading outage coordination...</p>
        </div>
      </div>
    );
  }

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Outage Planning Call</h2>
              <p className="text-sm text-red-100">Switching coordination • Multi-crew planning • Safety reviews • Customer impact discussions</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Outage Coordination
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950  ">
      <div className="p-[34px]">
        {/* Header */}
        <div className="mb-[55px] text-center relative">
          <div className="absolute top-0 right-8 opacity-20">
            <Zap className="w-[144px] h-[144px] text-blue-400" style={{ animation: ' 45s linear infinite reverse' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-[13px]">Outage Coordination</h1>
          <p className="text-base text-slate-300">Platform's Planning Brain</p>
          <button
            onClick={() => setShowCollaboration(!showCollaboration)}
            className="mt-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-[21px] py-[13px] rounded-[8px] flex items-center gap-[8px] mx-auto transition-all"
          >
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Planning Call</span>
          </button>
      </div>

      {/* Active Outages Alert */}
        {outages.some(o => o.status === 'active') && (
          <div className="mb-[34px] p-[21px] bg-red-500/20 border-2 border-red-500 rounded-[13px] flex items-center gap-[13px]">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white">Active Outages</h3>
              <p className="text-red-300">
                {outages.filter(o => o.status === 'active').length} outage(s) currently in progress
              </p>
          </div>
        </div>
      )}

      {/* Controls */}
        <div className="flex flex-wrap gap-[21px] mb-[34px]">
          <div className="flex gap-[13px]">
            {['all', 'planned', 'active', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-[21px] py-[13px] rounded-[8px] font-semibold transition-all ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="ml-auto px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-bold transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all  flex items-center gap-[8px]"
          >
            <Power className="w-5 h-5" />
            Plan Outage
          </button>
      </div>

        {/* Outage List */}
      <div className="space-y-[21px]">
          {filteredOutages.map((outage) => (
            <div
              key={outage.id}
              onClick={() => setSelectedOutage(outage)}
              className="card-vitruvian  p-[34px] rounded-[13px] cursor-pointer hover:scale-[1.01] transition-all "
            >
              <div className="flex items-start justify-between mb-[21px]">
                <div>
                  <div className="flex items-center gap-[13px] mb-[8px]">
                    {getStatusIcon(outage.status)}
                    <span className="text-sm text-slate-400 ">{outage.outage_number}</span>
                    <span className={`px-[8px] py-[3px] rounded text-xs font-semibold ${getImpactColor(outage.impact_level)}`}>
                      {outage.impact_level.toUpperCase()} IMPACT
                        </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-[5px] ">{outage.title}</h3>
                  <p className="text-slate-400">{outage.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-base font-semibold text-blue-400 mb-[5px]">
                    {outage.affected_customers.toLocaleString()} Customers
                  </div>
                  <div className="text-sm text-slate-400">
                    {outage.affected_circuits.length} Circuits
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-[21px]">
                <div className="flex items-center gap-[8px]">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{outage.location}</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {new Date(outage.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                <div className="flex items-center gap-[8px]">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{outage.crews_required} Crews Required</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Outage Details Modal */}
        {selectedOutage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-[21px] p-[34px] max-w-4xl w-full max-h-[90vh] overflow-y-auto card-vitruvian">
              <div className="flex justify-between items-start mb-[21px]">
                <div>
                  <h2 className="text-xl font-bold text-white mb-[8px]">{selectedOutage.title}</h2>
                  <p className="text-slate-400">{selectedOutage.outage_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOutage(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
                    </div>

              <div className="grid grid-cols-2 gap-[34px]">
                {/* Left Column */}
                <div className="space-y-[21px]">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <p className="text-white mt-[5px]">{selectedOutage.description}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-300">Location</label>
                    <p className="text-white mt-[5px] flex items-center gap-[8px]">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {selectedOutage.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-[13px]">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Start Time</label>
                      <p className="text-white mt-[5px]">
                        {new Date(selectedOutage.start_time).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">End Time</label>
                      <p className="text-white mt-[5px]">
                        {new Date(selectedOutage.end_time).toLocaleString()}
                      </p>
                    </div>
                    </div>

                    <div>
                    <label className="text-sm font-medium text-slate-300">Affected Circuits</label>
                    <div className="flex flex-wrap gap-[8px] mt-[5px]">
                      {selectedOutage.affected_circuits.map((circuit, i) => (
                        <span key={i} className="px-[13px] py-[5px] bg-blue-500/20 text-blue-400 rounded-[5px] text-sm font-mono">
                          {circuit}
                        </span>
                      ))}
                    </div>
                    </div>

                    <div>
                    <label className="text-sm font-medium text-slate-300">Safety Requirements</label>
                    <ul className="mt-[5px] space-y-[5px]">
                      {selectedOutage.safety_requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-[8px] text-white">
                          <Shield className="w-4 h-4 text-green-400" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-[21px]">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Switching Steps</label>
                    <div className="mt-[8px] space-y-[8px]">
                      {selectedOutage.switching_steps.map((step) => (
                        <div
                          key={step.sequence}
                          className={`p-[13px] rounded-[8px] ${
                            step.completed ? 'bg-green-500/10' : 'bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-[13px]">
                              <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.completed ? 'bg-green-500' : 'bg-slate-700'
                              }`}>
                                {step.completed ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                  <span className="text-white font-bold">{step.sequence}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-semibold">{step.description}</p>
                                <p className="text-sm text-slate-400">Location: {step.location}</p>
                                {step.safety_notes && (
                                  <p className="text-sm text-blue-400 mt-[5px] flex items-center gap-[5px]">
                                    <AlertTriangle className="w-3 h-3" />
                                    {step.safety_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            {!step.completed && selectedOutage.status === 'active' && (
                              <button
                                onClick={() => markStepComplete(selectedOutage.id, step.sequence)}
                                className="px-[13px] py-[5px] bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-[5px] font-semibold transition-all"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[13px]">
                    <div className="p-[21px] bg-slate-800/50 rounded-[13px] text-center">
                      <Users className="w-8 h-8 text-blue-400 mx-auto mb-[8px]" />
                      <div className="text-2xl font-bold text-white">{selectedOutage.crews_required}</div>
                      <div className="text-sm text-slate-400">Crews Required</div>
                    </div>
                    <div className="p-[21px] bg-slate-800/50 rounded-[13px] text-center">
                      <Phone className="w-8 h-8 text-blue-400 mx-auto mb-[8px]" />
                      <div className="text-2xl font-bold text-white">
                        {selectedOutage.notifications_sent ? 'Sent' : 'Pending'}
                      </div>
                      <div className="text-sm text-slate-400">Notifications</div>
                  </div>
                </div>

                  {selectedOutage.status === 'planned' && (
                  <button
                      onClick={() => updateOutageStatus(selectedOutage.id, 'active')}
                      className="w-full px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-bold transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all "
                  >
                      Start Outage
                  </button>
                  )}
                  {selectedOutage.status === 'active' && (
                    <button
                      onClick={() => updateOutageStatus(selectedOutage.id, 'completed')}
                      className="w-full px-[34px] py-[13px] bg-green-500 hover:bg-green-600 text-white rounded-[8px] font-bold transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Outage Form */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-[21px] p-[34px] max-w-2xl w-full max-h-[90vh] overflow-y-auto card-vitruvian">
              <h2 className="text-xl font-bold text-white mb-[21px]">Plan New Outage</h2>
              
              <div className="space-y-[21px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="Substation maintenance, Emergency repair, etc."
                  />
              </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] min-h-[89px]"
                    placeholder="Detailed description of work to be performed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="Substation name, street address, etc."
                  />
              </div>

                <div className="grid grid-cols-2 gap-[21px]">
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Start Time *
                </label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    />
                  </div>
              <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      End Time *
                </label>
                <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[21px]">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Impact Level
                    </label>
                    <select
                      value={formData.impact_level}
                      onChange={(e) => setFormData({ ...formData, impact_level: e.target.value as any })}
                      className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Crews Required
                    </label>
                    <input
                      type="number"
                      value={formData.crews_required}
                      onChange={(e) => setFormData({ ...formData, crews_required: e.target.value })}
                      className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                      placeholder="2"
                    />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Affected Circuits
                  </label>
                  <input
                    type="text"
                    value={formData.affected_circuits}
                    onChange={(e) => setFormData({ ...formData, affected_circuits: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="F12-01, F12-02, F12-03"
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Affected Customers
                  </label>
                  <input
                    type="number"
                    value={formData.affected_customers}
                    onChange={(e) => setFormData({ ...formData, affected_customers: e.target.value })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                    placeholder="500"
                  />
              </div>

                <div className="flex gap-[13px] mt-[34px]">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        title: '',
                        description: '',
                        location: '',
                        start_time: '',
                        end_time: '',
                        impact_level: 'medium',
                        affected_circuits: '',
                        affected_customers: '',
                        crews_required: ''
                      });
                    }}
                    className="flex-1 px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-[21px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all "
                  >
                    Create Outage Plan
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