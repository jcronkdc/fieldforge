import React, { useState, useEffect } from 'react';
import { Power, Calendar, MapPin, Users, AlertTriangle, Clock, Phone, CheckCircle, Shield, Compass } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import '../../styles/davinci.css';

interface Outage {
  id: string;
  outage_number: string;
  project_id: string;
  title: string;
  description: string;
  outage_type: 'planned' | 'emergency' | 'rolling' | 'maintenance';
  start_datetime: string;
  end_datetime: string;
  duration_hours: number;
  affected_circuits: string[];
  affected_customers: number;
  affected_area: string;
  switching_steps: Array<{
    step: number;
    action: string;
    device: string;
    location: string;
    completed: boolean;
  }>;
  crew_requirements: {
    switching_crew: number;
    construction_crew: number;
    safety_observers: number;
  };
  safety_requirements: string[];
  notification_status: {
    customers: boolean;
    dispatch: boolean;
    field_crews: boolean;
    management: boolean;
  };
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
    project_number: string;
  };
}

export const OutageCoordination: React.FC = () => {
  const { session } = useAuth();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOutage, setSelectedOutage] = useState<Outage | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    outage_type: 'planned' as 'planned' | 'emergency' | 'rolling' | 'maintenance',
    start_datetime: '',
    end_datetime: '',
    affected_circuits: [''],
    affected_customers: 0,
    affected_area: '',
    project_id: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchOutages();
      subscribeToChanges();
    }
  }, [session?.user?.id, filter]);

  const fetchOutages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('outages')
        .select(`
          *,
          project:projects(name, project_number)
        `)
        .order('start_datetime', { ascending: true });

      if (filter === 'upcoming') {
        query = query.gte('start_datetime', new Date().toISOString());
      } else if (filter === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        query = query
          .gte('start_datetime', todayStart.toISOString())
          .lte('start_datetime', todayEnd.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setOutages(data || []);
    } catch (error) {
      console.error('Error fetching outages:', error);
      toast.error('Failed to load outages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const subscription = supabase
      .channel('outages_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'outages'
      }, () => {
        fetchOutages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  };

  const handleCreateOutage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const outageNumber = `OUT-${Date.now().toString().slice(-6)}`;
      const duration = calculateDuration(formData.start_datetime, formData.end_datetime);
      
      const { error } = await supabase
        .from('outages')
        .insert({
          ...formData,
          outage_number: outageNumber,
          duration_hours: duration,
          switching_steps: generateDefaultSwitchingSteps(),
          crew_requirements: {
            switching_crew: 2,
            construction_crew: formData.outage_type === 'maintenance' ? 4 : 6,
            safety_observers: 1
          },
          safety_requirements: [
            'Safety briefing completed',
            'LOTO procedures reviewed',
            'Arc flash boundaries established',
            'Grounding installed',
            'Barriers in place'
          ],
          notification_status: {
            customers: false,
            dispatch: false,
            field_crews: false,
            management: false
          },
          approval_status: 'draft',
          created_by: session?.user?.id
        });

      if (error) throw error;

      toast.success('Outage plan created successfully');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating outage:', error);
      toast.error('Failed to create outage');
    }
  };

  const generateDefaultSwitchingSteps = () => {
    return [
      { step: 1, action: 'Open', device: 'Circuit Breaker', location: 'Substation A', completed: false },
      { step: 2, action: 'Open', device: 'Disconnect Switch', location: 'Structure 123', completed: false },
      { step: 3, action: 'Install', device: 'Grounds', location: 'Work Zone', completed: false },
      { step: 4, action: 'Test', device: 'Voltage', location: 'All Phases', completed: false },
      { step: 5, action: 'Issue', device: 'Clearance', location: 'To Construction Crew', completed: false }
    ];
  };

  const updateNotificationStatus = async (outageId: string, type: keyof Outage['notification_status']) => {
    try {
      const outage = outages.find(o => o.id === outageId);
      if (!outage) return;

      const updatedStatus = {
        ...outage.notification_status,
        [type]: true
      };

      const { error } = await supabase
        .from('outages')
        .update({ 
          notification_status: updatedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', outageId);

      if (error) throw error;

      toast.success(`${type} notification sent`);
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const approveOutage = async (outageId: string) => {
    try {
      const { error } = await supabase
        .from('outages')
        .update({
          approval_status: 'approved',
          approved_by: session?.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', outageId);

      if (error) throw error;

      toast.success('Outage approved');
      setSelectedOutage(null);
    } catch (error) {
      console.error('Error approving outage:', error);
      toast.error('Failed to approve outage');
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      planned: 'text-blue-400 bg-blue-900/50',
      emergency: 'text-red-400 bg-red-900/50',
      rolling: 'text-amber-400 bg-amber-900/50',
      maintenance: 'text-green-400 bg-green-900/50'
    };
    return colors[type as keyof typeof colors] || 'text-slate-400 bg-slate-900/50';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-slate-400',
      pending: 'text-amber-400',
      approved: 'text-green-400',
      rejected: 'text-red-400',
      completed: 'text-blue-400'
    };
    return colors[status as keyof typeof colors] || 'text-slate-400';
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      outage_type: 'planned',
      start_datetime: '',
      end_datetime: '',
      affected_circuits: [''],
      affected_customers: 0,
      affected_area: '',
      project_id: ''
    });
  };

  const upcomingOutages = outages.filter(o => new Date(o.start_datetime) > new Date());
  const activeOutages = outages.filter(o => {
    const now = new Date();
    return new Date(o.start_datetime) <= now && new Date(o.end_datetime) >= now;
  });

  return (
    <div className="max-w-7xl mx-auto p-[34px] space-y-[34px]">
      {/* Header */}
      <div className="relative">
        <div className="absolute -left-[55px] top-1/2 transform -translate-y-1/2 hidden lg:block opacity-10">
          <Power className="w-[34px] h-[34px] text-amber-400" />
        </div>
        <h1 className="text-golden-xl font-bold text-white mb-[8px] measurement-line">Outage Coordination</h1>
        <p className="text-slate-400 technical-annotation" data-note="PLANNING">Plan and coordinate power outages safely</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[21px]">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-400/60 annotation" data-note="ACTIVE">Active Now</p>
              <p className="text-golden-base font-bold text-red-400">{activeOutages.length}</p>
            </div>
            <Power className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-400/60 annotation" data-note="NEXT 7D">Next 7 Days</p>
              <p className="text-golden-base font-bold text-amber-400">
                {upcomingOutages.filter(o => new Date(o.start_datetime) <= addDays(new Date(), 7)).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-400/60 annotation" data-note="IMPACT">Customers Today</p>
              <p className="text-golden-base font-bold text-white">
                {activeOutages.reduce((sum, o) => sum + o.affected_customers, 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[13px] p-[21px] card-vitruvian">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400/60 annotation" data-note="READY">Approved</p>
              <p className="text-golden-base font-bold text-green-400">
                {outages.filter(o => o.approval_status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Active Outages Alert */}
      {activeOutages.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-[21px] p-[21px] card-vitruvian">
          <div className="flex items-center gap-[13px]">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
            <div>
              <h3 className="text-red-400 font-semibold">Active Outages in Progress</h3>
              <p className="text-red-300/80 text-sm mt-[5px]">
                {activeOutages.length} outage{activeOutages.length !== 1 ? 's' : ''} currently affecting {activeOutages.reduce((sum, o) => sum + o.affected_customers, 0).toLocaleString()} customers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-engineering relative">
        {/* Technical Compass */}
        <div className="absolute top-[21px] right-[21px] opacity-5">
          <Compass className="w-[55px] h-[55px] text-amber-400" style={{ animation: 'gear-rotate 40s linear infinite' }} />
        </div>

        <div className="flex flex-col md:flex-row gap-[21px] items-end">
          {/* Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="VIEW">
              View Outages
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
            >
              <option value="all">All Outages</option>
              <option value="upcoming">Upcoming Only</option>
              <option value="today">Today Only</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-[34px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px] btn-davinci field-touch glow-renaissance"
          >
            <Power className="w-5 h-5" />
            Plan Outage
          </button>
        </div>
      </div>

      {/* Outages Timeline */}
      <div className="space-y-[21px]">
        {loading ? (
          <div className="text-center py-[89px]">
            <div className="inline-block w-[55px] h-[55px] border-[3px] border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : outages.length === 0 ? (
          <div className="text-center py-[89px] text-slate-400">
            <Power className="w-[89px] h-[89px] mx-auto mb-[21px] opacity-20" />
            <p className="text-golden-base">No outages scheduled</p>
          </div>
        ) : (
          outages.map((outage) => (
            <div
              key={outage.id}
              className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] hover:border-amber-500/40 transition-all card-vitruvian"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-[21px]">
                <div className="flex-1">
                  <div className="flex items-start gap-[13px] mb-[13px]">
                    <Power className={`w-6 h-6 mt-1 ${activeOutages.includes(outage) ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-[13px] flex-wrap">
                        <h3 className="text-golden-base font-semibold text-white measurement-line">
                          {outage.title}
                        </h3>
                        <span className={`px-[13px] py-[5px] rounded-full text-xs font-medium ${getTypeColor(outage.outage_type)}`}>
                          {outage.outage_type.toUpperCase()}
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(outage.approval_status)}`}>
                          {outage.approval_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-amber-400/60 text-sm mt-[5px]">
                        {outage.outage_number} • {outage.project?.project_number}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-[21px] field-readable ml-[37px]">
                    {outage.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[21px] ml-[37px]">
                    <div>
                      <p className="text-xs text-amber-400/60 mb-[5px]">Schedule</p>
                      <p className="text-sm text-white">
                        {format(new Date(outage.start_datetime), 'MMM d, h:mm a')}
                      </p>
                      <p className="text-xs text-slate-400">
                        Duration: {outage.duration_hours}h
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-amber-400/60 mb-[5px]">Impact</p>
                      <p className="text-sm text-white">
                        {outage.affected_customers.toLocaleString()} customers
                      </p>
                      <p className="text-xs text-slate-400">
                        {outage.affected_circuits.join(', ')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-amber-400/60 mb-[5px]">Area</p>
                      <p className="text-sm text-white field-readable">
                        {outage.affected_area}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-amber-400/60 mb-[5px]">Notifications</p>
                      <div className="flex gap-[8px]">
                        {Object.entries(outage.notification_status).map(([key, sent]) => (
                          <div
                            key={key}
                            className={`w-[8px] h-[8px] rounded-full ${sent ? 'bg-green-400' : 'bg-slate-600'}`}
                            title={`${key}: ${sent ? 'Sent' : 'Pending'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-[13px]">
                  <button
                    onClick={() => setSelectedOutage(outage)}
                    className="px-[21px] py-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 rounded-[8px] text-amber-400 transition-all tech-border field-touch"
                  >
                    View Details
                  </button>
                  {outage.approval_status === 'draft' && (
                    <button
                      onClick={() => approveOutage(outage.id)}
                      className="px-[21px] py-[13px] bg-green-600 hover:bg-green-700 text-white rounded-[8px] font-medium transition-all field-touch"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[21px] bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900/95 border border-amber-500/20 rounded-[21px] p-[34px] max-w-2xl w-full max-h-[90vh] overflow-y-auto card-engineering">
            <h2 className="text-golden-base font-bold text-white mb-[21px] measurement-line">
              Plan New Outage
            </h2>
            
            <form onSubmit={handleCreateOutage} className="space-y-[21px]">
              <div>
                <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="TITLE">
                  Outage Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Feeder 123 Maintenance Outage"
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
                  placeholder="Describe the work requiring this outage..."
                  className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="TYPE">
                    Outage Type
                  </label>
                  <select
                    value={formData.outage_type}
                    onChange={(e) => setFormData({ ...formData, outage_type: e.target.value as any })}
                    className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                  >
                    <option value="planned">Planned</option>
                    <option value="emergency">Emergency</option>
                    <option value="rolling">Rolling</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="AREA">
                    Affected Area
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.affected_area}
                    onChange={(e) => setFormData({ ...formData, affected_area: e.target.value })}
                    placeholder="e.g., Downtown District"
                    className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="START">
                    Start Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="END">
                    End Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="CIRCUITS">
                  Affected Circuits
                </label>
                {formData.affected_circuits.map((circuit, index) => (
                  <div key={index} className="flex gap-[13px] mb-[8px]">
                    <input
                      type="text"
                      required
                      value={circuit}
                      onChange={(e) => {
                        const newCircuits = [...formData.affected_circuits];
                        newCircuits[index] = e.target.value;
                        setFormData({ ...formData, affected_circuits: newCircuits });
                      }}
                      placeholder="e.g., FEEDER-123"
                      className="flex-1 px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                    />
                    {formData.affected_circuits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newCircuits = formData.affected_circuits.filter((_, i) => i !== index);
                          setFormData({ ...formData, affected_circuits: newCircuits });
                        }}
                        className="px-[13px] text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, affected_circuits: [...formData.affected_circuits, ''] })}
                  className="text-amber-400 hover:text-amber-300 text-sm"
                >
                  + Add Circuit
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-400 mb-[8px] technical-annotation" data-note="IMPACT">
                  Estimated Customers Affected
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.affected_customers}
                  onChange={(e) => setFormData({ ...formData, affected_customers: parseInt(e.target.value) || 0 })}
                  className="w-full px-[21px] py-[13px] bg-slate-800/50 border border-amber-500/20 rounded-[8px] text-white focus:border-amber-500 focus:outline-none input-davinci"
                />
              </div>

              <div className="flex gap-[13px] pt-[13px] border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-[34px] py-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 text-white rounded-[8px] font-medium transition-all tech-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-[34px] py-[13px] bg-amber-500 hover:bg-amber-600 text-white rounded-[8px] font-semibold transition-all btn-davinci"
                >
                  Create Outage Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOutage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[21px] bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900/95 border border-amber-500/20 rounded-[21px] p-[34px] max-w-3xl w-full max-h-[90vh] overflow-y-auto card-engineering">
            <div className="flex justify-between items-start mb-[34px]">
              <div>
                <h2 className="text-golden-base font-bold text-white measurement-line">
                  {selectedOutage.title}
                </h2>
                <p className="text-amber-400/60 mt-[8px]">
                  {selectedOutage.outage_number} • {selectedOutage.outage_type.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOutage(null)}
                className="text-amber-400 hover:text-amber-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-[34px]">
              {/* Overview */}
              <div>
                <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="OVERVIEW">
                  Outage Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-[21px]">
                  <div>
                    <p className="text-sm text-amber-400/60 mb-[5px]">Start Time</p>
                    <p className="text-white">{format(new Date(selectedOutage.start_datetime), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-400/60 mb-[5px]">Duration</p>
                    <p className="text-white">{selectedOutage.duration_hours} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-400/60 mb-[5px]">Customers Affected</p>
                    <p className="text-white">{selectedOutage.affected_customers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Switching Steps */}
              <div>
                <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="SWITCHING">
                  Switching Steps
                </h3>
                <div className="space-y-[8px]">
                  {selectedOutage.switching_steps.map((step) => (
                    <div key={step.step} className={`flex items-center gap-[13px] p-[13px] rounded-[8px] ${step.completed ? 'bg-green-900/20' : 'bg-slate-800/30'}`}>
                      <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-bold ${step.completed ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-white">
                          <span className="font-medium text-amber-400">{step.action}</span> {step.device} at {step.location}
                        </p>
                      </div>
                      {step.completed && <Check className="w-5 h-5 text-green-400" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Crew Requirements */}
              <div>
                <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="CREWS">
                  Crew Requirements
                </h3>
                <div className="grid grid-cols-3 gap-[13px]">
                  <div className="bg-slate-800/30 p-[13px] rounded-[8px]">
                    <p className="text-sm text-amber-400/60">Switching</p>
                    <p className="text-white font-medium">{selectedOutage.crew_requirements.switching_crew} persons</p>
                  </div>
                  <div className="bg-slate-800/30 p-[13px] rounded-[8px]">
                    <p className="text-sm text-amber-400/60">Construction</p>
                    <p className="text-white font-medium">{selectedOutage.crew_requirements.construction_crew} persons</p>
                  </div>
                  <div className="bg-slate-800/30 p-[13px] rounded-[8px]">
                    <p className="text-sm text-amber-400/60">Safety Observer</p>
                    <p className="text-white font-medium">{selectedOutage.crew_requirements.safety_observers} person</p>
                  </div>
                </div>
              </div>

              {/* Safety Requirements */}
              <div>
                <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="SAFETY">
                  Safety Requirements
                </h3>
                <div className="space-y-[8px]">
                  {selectedOutage.safety_requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-[8px]">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-amber-400 font-medium mb-[13px] technical-annotation" data-note="NOTIFY">
                  Notification Status
                </h3>
                <div className="grid grid-cols-2 gap-[13px]">
                  {Object.entries(selectedOutage.notification_status).map(([type, sent]) => (
                    <div key={type} className="flex items-center justify-between bg-slate-800/30 p-[13px] rounded-[8px]">
                      <span className="text-slate-300 capitalize">{type.replace('_', ' ')}</span>
                      {sent ? (
                        <span className="text-green-400 text-sm">Sent</span>
                      ) : (
                        <button
                          onClick={() => updateNotificationStatus(selectedOutage.id, type as any)}
                          className="px-[13px] py-[5px] bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-[5px] transition-all"
                        >
                          Send
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-[13px] p-[21px]">
                <div className="flex items-center gap-[8px] mb-[13px]">
                  <Phone className="w-5 h-5 text-red-400" />
                  <h3 className="text-red-400 font-medium">Emergency Contacts</h3>
                </div>
                <div className="space-y-[8px] text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-300">System Control</span>
                    <span className="text-white font-mono">1-800-XXX-XXXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Field Supervisor</span>
                    <span className="text-white font-mono">XXX-XXX-XXXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Safety Officer</span>
                    <span className="text-white font-mono">XXX-XXX-XXXX</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedOutage.approval_status !== 'approved' && (
                <div className="flex gap-[13px] pt-[21px] border-t border-amber-500/20">
                  <button
                    onClick={() => setSelectedOutage(null)}
                    className="flex-1 px-[34px] py-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 text-white rounded-[8px] font-medium transition-all tech-border"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => approveOutage(selectedOutage.id)}
                    className="flex-1 px-[34px] py-[13px] bg-green-600 hover:bg-green-700 text-white rounded-[8px] font-semibold transition-all"
                  >
                    Approve Outage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leonardo Quote */}
      <div className="text-center opacity-30 mt-[89px]">
        <p className="text-golden-sm text-amber-400/60 font-light italic technical-annotation">
          "The noblest pleasure is the joy of understanding"
        </p>
        <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
      </div>
    </div>
  );
};

export default OutageCoordination;
