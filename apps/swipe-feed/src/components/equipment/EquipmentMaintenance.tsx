import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Shield, Zap, Filter, Plus, FileText } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import toast from 'react-hot-toast';

interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  equipment_name: string;
  equipment_code: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  description: string;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  labor_hours: number;
  parts_used?: string[];
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  next_maintenance_due?: string;
  created_by: number;
  company_id: number;
  created_at: string;
}

interface Equipment {
  id: number;
  name: string;
  code: string;
  type: string;
  current_hours: number;
  maintenance_interval_hours: number;
  last_maintenance_date?: string;
  next_maintenance_due?: string;
  status: 'operational' | 'maintenance' | 'repair' | 'out_of_service';
  health_score: number;
}

const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive', color: 'text-blue-400', bgColor: 'bg-blue-900/50' },
  { value: 'corrective', label: 'Corrective', color: 'text-yellow-400', bgColor: 'bg-yellow-900/50' },
  { value: 'predictive', label: 'Predictive', color: 'text-purple-400', bgColor: 'bg-purple-900/50' },
  { value: 'emergency', label: 'Emergency', color: 'text-red-400', bgColor: 'bg-red-900/50' }
];

export const EquipmentMaintenance: React.FC = () => {
  const { session } = useAuthContext();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'overdue' | 'completed'>('all');
  const [formData, setFormData] = useState({
    equipment_id: 0,
    maintenance_type: 'preventive' as MaintenanceRecord['maintenance_type'],
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    performed_by: '',
    labor_hours: 0,
    parts_used: [''] as string[],
    cost: 0,
    priority: 'medium' as MaintenanceRecord['priority'],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenanceRes, equipmentRes] = await Promise.all([
        fetch('/api/equipment/maintenance', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch('/api/equipment', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ]);

      if (!maintenanceRes.ok || !equipmentRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const maintenanceData = await maintenanceRes.json();
      const equipmentData = await equipmentRes.json();

      // Calculate health scores and next maintenance dates
      const enhancedEquipment = equipmentData.map((eq: any) => {
        const recentMaintenance = maintenanceData
          .filter((m: MaintenanceRecord) => m.equipment_id === eq.id && m.status === 'completed')
          .sort((a: MaintenanceRecord, b: MaintenanceRecord) => 
            new Date(b.completed_date || b.scheduled_date).getTime() - 
            new Date(a.completed_date || a.scheduled_date).getTime()
          )[0];

        const hoursSinceMaintenance = eq.current_hours - (eq.last_maintenance_hours || 0);
        const maintenanceProgress = hoursSinceMaintenance / eq.maintenance_interval_hours;
        const healthScore = Math.max(0, Math.min(100, 100 - (maintenanceProgress * 100)));

        return {
          ...eq,
          health_score: Math.round(healthScore),
          last_maintenance_date: recentMaintenance?.completed_date || eq.last_maintenance_date,
          next_maintenance_due: eq.next_maintenance_due || calculateNextMaintenanceDate(eq, recentMaintenance)
        };
      });

      setMaintenanceRecords(maintenanceData);
      setEquipment(enhancedEquipment);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextMaintenanceDate = (equipment: any, lastMaintenance?: MaintenanceRecord) => {
    if (!lastMaintenance?.completed_date) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    const lastDate = new Date(lastMaintenance.completed_date);
    const hoursPerDay = 8; // Assuming 8 hours of operation per day
    const daysUntilNext = equipment.maintenance_interval_hours / hoursPerDay;
    
    lastDate.setDate(lastDate.getDate() + daysUntilNext);
    return lastDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingRecord ? 'PUT' : 'POST';
      const url = editingRecord 
        ? `/api/equipment/maintenance/${editingRecord.id}`
        : '/api/equipment/maintenance';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          parts_used: formData.parts_used.filter(p => p.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to save maintenance record');

      toast.success(editingRecord ? 'Record updated' : 'Maintenance scheduled');
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast.error('Failed to save maintenance record');
    }
  };

  const updateMaintenanceStatus = async (recordId: number, status: MaintenanceRecord['status'], completedDate?: string) => {
    try {
      const response = await fetch(`/api/equipment/maintenance/${recordId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          status,
          completed_date: completedDate || (status === 'completed' ? new Date().toISOString() : undefined)
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setShowMaintenanceForm(false);
    setEditingRecord(null);
    setFormData({
      equipment_id: 0,
      maintenance_type: 'preventive',
      description: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      performed_by: '',
      labor_hours: 0,
      parts_used: [''],
      cost: 0,
      priority: 'medium',
      notes: ''
    });
  };

  const getFilteredRecords = () => {
    switch (filter) {
      case 'scheduled':
        return maintenanceRecords.filter(r => r.status === 'scheduled');
      case 'overdue':
        return maintenanceRecords.filter(r => {
          if (r.status !== 'scheduled') return false;
          return new Date(r.scheduled_date) < new Date();
        });
      case 'completed':
        return maintenanceRecords.filter(r => r.status === 'completed');
      default:
        return maintenanceRecords;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const stats = {
    scheduled: maintenanceRecords.filter(r => r.status === 'scheduled').length,
    overdue: maintenanceRecords.filter(r => r.status === 'scheduled' && new Date(r.scheduled_date) < new Date()).length,
    completed: maintenanceRecords.filter(r => r.status === 'completed').length,
    avgHealth: equipment.length > 0 
      ? Math.round(equipment.reduce((sum, eq) => sum + eq.health_score, 0) / equipment.length)
      : 0
  };

  const filteredRecords = getFilteredRecords();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🔧 Equipment Maintenance</h1>
            <p className="text-slate-400">Predictive maintenance and repair tracking</p>
          </div>
          
          <button
            onClick={() => setShowMaintenanceForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Schedule Maintenance
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Scheduled</span>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.scheduled}</div>
            <div className="text-sm text-slate-400 mt-1">Upcoming tasks</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Overdue</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.overdue}</div>
            <div className="text-sm text-red-400 mt-1">Need attention</div>
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
              <span className="text-slate-400">Fleet Health</span>
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div className={`text-3xl font-bold ${getHealthColor(stats.avgHealth)}`}>
              {stats.avgHealth}%
            </div>
            <div className="text-sm text-slate-400 mt-1">Average score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Health Dashboard */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Equipment Health Status</h2>
              <select
                value={selectedEquipment || ''}
                onChange={(e) => setSelectedEquipment(Number(e.target.value) || null)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="">All Equipment</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {equipment
                .filter(eq => !selectedEquipment || eq.id === selectedEquipment)
                .map((eq) => (
                  <div key={eq.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white">{eq.name}</h3>
                        <p className="text-sm text-slate-400">Code: {eq.code} • Type: {eq.type}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getHealthColor(eq.health_score)}`}>
                          {eq.health_score}%
                        </div>
                        <p className="text-xs text-slate-400">Health Score</p>
                      </div>
                    </div>

                    {/* Health Bar */}
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full ${getHealthBgColor(eq.health_score)} rounded-full transition-all duration-500`}
                        style={{ width: `${eq.health_score}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400 block">Current Hours</span>
                        <span className="text-white font-medium">{eq.current_hours}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Service Interval</span>
                        <span className="text-white font-medium">{eq.maintenance_interval_hours}h</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Last Service</span>
                        <span className="text-white font-medium">
                          {eq.last_maintenance_date 
                            ? new Date(eq.last_maintenance_date).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Next Due</span>
                        <span className={`font-medium ${
                          new Date(eq.next_maintenance_due!) < new Date() 
                            ? 'text-red-400' 
                            : 'text-green-400'
                        }`}>
                          {eq.next_maintenance_due 
                            ? new Date(eq.next_maintenance_due).toLocaleDateString()
                            : 'TBD'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        eq.status === 'operational' ? 'bg-green-900/50 text-green-400' :
                        eq.status === 'maintenance' ? 'bg-yellow-900/50 text-yellow-400' :
                        eq.status === 'repair' ? 'bg-orange-900/50 text-orange-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {eq.status.toUpperCase()}
                      </span>
                      
                      <button
                        onClick={() => {
                          setFormData({ ...formData, equipment_id: eq.id });
                          setShowMaintenanceForm(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        <Wrench className="w-4 h-4" />
                        Schedule Service
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Maintenance Tasks</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No maintenance records found</p>
                </div>
              ) : (
                filteredRecords.map((record) => {
                  const typeConfig = MAINTENANCE_TYPES.find(t => t.value === record.maintenance_type);
                  const isOverdue = record.status === 'scheduled' && new Date(record.scheduled_date) < new Date();
                  
                  return (
                    <div
                      key={record.id}
                      className="bg-slate-700/30 rounded-lg p-3 cursor-pointer hover:bg-slate-700/50 transition"
                      onClick={() => {
                        setEditingRecord(record);
                        setFormData({
                          equipment_id: record.equipment_id,
                          maintenance_type: record.maintenance_type,
                          description: record.description,
                          scheduled_date: record.scheduled_date.split('T')[0],
                          performed_by: record.performed_by || '',
                          labor_hours: record.labor_hours,
                          parts_used: record.parts_used?.length ? record.parts_used : [''],
                          cost: record.cost,
                          priority: record.priority,
                          notes: record.notes || ''
                        });
                        setShowMaintenanceForm(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-white text-sm">{record.equipment_name}</h4>
                          <p className="text-xs text-slate-400">{record.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${typeConfig?.bgColor} ${typeConfig?.color}`}>
                          {typeConfig?.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(record.scheduled_date).toLocaleDateString()}
                          </span>
                          {record.labor_hours > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {record.labor_hours}h
                            </span>
                          )}
                        </div>
                        
                        {record.status === 'scheduled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaintenanceStatus(record.id, 'completed');
                            }}
                            className="text-green-400 hover:text-green-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isOverdue && (
                        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue by {Math.floor((Date.now() - new Date(record.scheduled_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Form Modal */}
        {showMaintenanceForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingRecord ? 'Update Maintenance Record' : 'Schedule Maintenance'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Equipment
                    </label>
                    <select
                      value={formData.equipment_id}
                      onChange={(e) => setFormData({...formData, equipment_id: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                      disabled={editingRecord !== null}
                    >
                      <option value="">Select equipment</option>
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Maintenance Type
                    </label>
                    <select
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({...formData, maintenance_type: e.target.value as MaintenanceRecord['maintenance_type']})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      {MAINTENANCE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Brief description of work"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as MaintenanceRecord['priority']})}
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
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.labor_hours}
                      onChange={(e) => setFormData({...formData, labor_hours: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Performed By
                  </label>
                  <input
                    type="text"
                    value={formData.performed_by}
                    onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
                    placeholder="Technician name"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Parts Used
                  </label>
                  {formData.parts_used.map((part, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={part}
                        onChange={(e) => {
                          const newParts = [...formData.parts_used];
                          newParts[index] = e.target.value;
                          setFormData({...formData, parts_used: newParts});
                        }}
                        placeholder="Part name/number"
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                      {formData.parts_used.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              parts_used: formData.parts_used.filter((_, i) => i !== index)
                            });
                          }}
                          className="px-3 py-2 bg-red-900/50 hover:bg-red-900 rounded-lg transition"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, parts_used: [...formData.parts_used, '']})}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    + Add part
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Additional notes..."
                  />
                </div>

                {editingRecord && (
                  <div className="border-t border-slate-700 pt-4">
                    <label className="text-sm font-medium text-slate-400">Quick Status Update</label>
                    <div className="flex gap-2 mt-2">
                      {(['scheduled', 'in_progress', 'completed', 'cancelled'] as const).map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            updateMaintenanceStatus(editingRecord.id, status);
                            resetForm();
                          }}
                          className={`px-3 py-1 rounded text-sm ${
                            status === 'completed' ? 'bg-green-600 hover:bg-green-700' :
                            status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700' :
                            status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' :
                            'bg-slate-600 hover:bg-slate-700'
                          } text-white transition`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {editingRecord ? 'Update' : 'Schedule'} Maintenance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
