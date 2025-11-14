import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, Wrench, Calendar, QrCode, Search, Filter, Plus, AlertTriangle, Compass, Ruler } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format, differenceInDays } from 'date-fns';

interface Equipment {
  id: string;
  equipment_type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  asset_tag?: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'in use' | 'maintenance' | 'retired';
  current_project_id?: string;
  assigned_to?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  usage_hours: number;
  location_description?: string;
  notes?: string;
  project?: {
    name: string;
  };
  assigned_user?: {
    full_name: string;
  };
}

export const EquipmentHub: React.FC = () => {
  const { session } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    fetchEquipment();
    
    // Real-time updates
    const subscription = supabase
      .channel('equipment_inventory')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'equipment_inventory' 
      }, () => {
        fetchEquipment();
      })
      .subscribe();
      
    return () => { 
      subscription.unsubscribe(); 
    };
  }, [session?.user?.id]);

  const fetchEquipment = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('equipment_inventory')
      .select(`
        *,
        project:projects(name)
      `)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setEquipment(data);
    }
    setLoading(false);
  };

  const handleQRScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // In real app, integrate with QR scanner library
    // For now, simulate QR code upload
    const file = event.target.files?.[0];
    if (file) {
      console.log('QR code file selected:', file.name);
      // Process QR code and find equipment
      setShowScanner(false);
    }
  };

  const checkOutEquipment = async (equipmentId: string) => {
    const { error } = await supabase
      .from('equipment_inventory')
      .update({ 
        status: 'in use',
        assigned_to: session?.user?.id,
        current_project_id: session?.user?.user_metadata?.current_project_id
      })
      .eq('id', equipmentId);
      
    if (!error) {
      // Log usage
      await supabase
        .from('equipment_usage_logs')
        .insert({
          equipment_id: equipmentId,
          checked_out_by: session?.user?.id,
          checked_out_at: new Date(),
          project_id: session?.user?.user_metadata?.current_project_id
        });
        
      await fetchEquipment();
    }
  };

  const checkInEquipment = async (equipmentId: string, condition: string, hours: number) => {
    const { error } = await supabase
      .from('equipment_inventory')
      .update({ 
        status: 'available',
        assigned_to: null,
        condition,
        usage_hours: (equipment.find(e => e.id === equipmentId)?.usage_hours || 0) + hours
      })
      .eq('id', equipmentId);
      
    if (!error) {
      await fetchEquipment();
    }
  };

  const getMaintenanceStatus = (nextDate?: string) => {
    if (!nextDate) return null;
    const daysUntil = differenceInDays(new Date(nextDate), new Date());
    
    if (daysUntil < 0) return { text: 'Overdue', color: 'text-red-500 bg-red-500/10' };
    if (daysUntil <= 7) return { text: `${daysUntil}d`, color: 'text-orange-500 bg-orange-500/10' };
    if (daysUntil <= 30) return { text: `${daysUntil}d`, color: 'text-yellow-500 bg-yellow-500/10' };
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/10';
      case 'in use': return 'text-amber-400 bg-amber-400/10';
      case 'maintenance': return 'text-orange-400 bg-orange-400/10';
      case 'retired': return 'text-amber-400/40 bg-amber-400/5';
      default: return 'text-amber-400/60 bg-amber-400/5';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-400';
      case 'good': return 'text-green-400/80';
      case 'fair': return 'text-amber-400';
      case 'poor': return 'text-red-400';
      default: return 'text-amber-400/60';
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.equipment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="davinci-grid p-[34px] max-w-7xl mx-auto space-y-[34px]">
      {/* Renaissance Decorations */}
      <div className="compass-rose" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[21px]">
        <div>
          <h1 className="text-golden-2xl font-bold text-white measurement-line flex items-center gap-[13px]">
            <Package className="w-8 h-8 text-amber-400" />
            Equipment Hub
          </h1>
          <p className="text-golden-base text-amber-400/60 mt-[8px] technical-annotation" data-note="INVENTORY">Track and manage equipment inventory</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="btn-blueprint px-[21px] py-[13px] flex items-center gap-[8px] field-touch"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline field-readable">Scan QR</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-davinci px-[21px] py-[13px] flex items-center gap-[8px] field-touch"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline field-readable">Add Equipment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Golden Ratio Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[21px] paper-texture">
        <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-sm text-amber-400/60 technical-annotation" data-note="INVENTORY">Total Equipment</p>
              <p className="text-golden-xl font-bold text-white mt-[8px]">{equipment.length}</p>
            </div>
            <div className="vitruvian-square">
              <Package className="w-[34px] h-[34px] text-amber-400" />
            </div>
          </div>
        </div>

        <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-sm text-amber-400/60 technical-annotation" data-note="STATUS">Available</p>
              <p className="text-golden-xl font-bold text-green-400 mt-[8px]">
                {equipment.filter(e => e.status === 'available').length}
              </p>
            </div>
            <div className="vitruvian-square">
              <Truck className="w-[34px] h-[34px] text-green-400" />
            </div>
          </div>
        </div>

        <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-sm text-amber-400/60 technical-annotation" data-note="REPAIR">In Maintenance</p>
              <p className="text-golden-xl font-bold text-orange-400 mt-[8px]">
                {equipment.filter(e => e.status === 'maintenance').length}
              </p>
            </div>
            <div className="vitruvian-square">
              <Wrench className="w-[34px] h-[34px] text-orange-400" />
            </div>
          </div>
        </div>

        <div className="card-vitruvian p-[21px] rounded-[13px] tech-border depth-layer-1 breathe" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-sm text-amber-400/60 technical-annotation" data-note="URGENT">Due Service</p>
              <p className="text-golden-xl font-bold text-red-400 mt-[8px]">
                {equipment.filter(e => {
                  if (!e.next_maintenance_date) return false;
                  return differenceInDays(new Date(e.next_maintenance_date), new Date()) <= 7;
                }).length}
              </p>
            </div>
            <div className="vitruvian-square">
              <Calendar className="w-[34px] h-[34px] text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter - Renaissance Style */}
      <div className="flex flex-col sm:flex-row gap-[21px]">
        <div className="relative flex-1">
          <Search className="absolute left-[13px] top-[13px] w-5 h-5 text-amber-400/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by type, serial, or asset tag..."
            className="w-full pl-[55px] pr-[21px] py-[13px] input-davinci bg-slate-800/50 text-white rounded-[8px] field-readable field-touch"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-[21px] py-[13px] rounded-[8px] font-medium transition-all field-touch ${
              filterStatus === 'all' 
                ? 'btn-davinci' 
                : 'tech-border bg-slate-800/50 text-amber-400/60 hover:bg-slate-700/50 hover:text-amber-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('available')}
            className={`px-[21px] py-[13px] rounded-[8px] font-medium transition-all field-touch ${
              filterStatus === 'available' 
                ? 'btn-davinci' 
                : 'tech-border bg-slate-800/50 text-amber-400/60 hover:bg-slate-700/50 hover:text-amber-400'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilterStatus('in use')}
            className={`px-[21px] py-[13px] rounded-[8px] font-medium transition-all field-touch ${
              filterStatus === 'in use' 
                ? 'btn-davinci' 
                : 'tech-border bg-slate-800/50 text-amber-400/60 hover:bg-slate-700/50 hover:text-amber-400'
            }`}
          >
            In Use
          </button>
        </div>
      </div>

      {/* Equipment Grid - Golden Ratio Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[21px]">
        {loading && filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-[55px] text-amber-400/60">
            <div className="spinner-davinci mb-[21px]" />
            <p className="technical-annotation">Loading equipment inventory...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-[55px]">
            <div className="vitruvian-square mx-auto mb-[13px]">
              <Package className="w-[55px] h-[55px] text-amber-400/40" />
            </div>
            <p className="text-amber-400/60 technical-annotation">No equipment found</p>
          </div>
        ) : (
          filteredEquipment.map(item => {
            const maintenanceStatus = getMaintenanceStatus(item.next_maintenance_date);
            
            return (
              <div
                key={item.id}
                className="card-engineering p-[21px] rounded-[13px] cursor-pointer transform hover:scale-[1.02] transition-all depth-layer-1 breathe"
                onClick={() => setSelectedEquipment(item)}
                style={{ animationDelay: `${filteredEquipment.indexOf(item) * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-[13px]">
                  <div>
                    <h3 className="text-golden-base font-medium text-white measurement-line">{item.equipment_type}</h3>
                    {item.model && (
                      <p className="text-golden-sm text-amber-400/60 technical-annotation" data-note="MODEL">{item.manufacturer} {item.model}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    {maintenanceStatus && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${maintenanceStatus.color}`}>
                        <Wrench className="w-3 h-3 inline mr-1" />
                        {maintenanceStatus.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Asset Tag</span>
                    <span className="text-white font-mono">{item.asset_tag || item.serial_number || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Condition</span>
                    <span className={`font-medium ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hours</span>
                    <span className="text-white">{item.usage_hours.toFixed(1)}h</span>
                  </div>
                  
                  {item.assigned_to && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assigned</span>
                      <span className="text-white text-xs">
                        {item.assigned_user?.full_name || 'User'}
                      </span>
                    </div>
                  )}
                  
                  {item.project && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Project</span>
                      <span className="text-white text-xs truncate max-w-[150px]">
                        {item.project.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions - Touch Friendly */}
                <div className="mt-4 flex gap-2">
                  {item.status === 'available' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        checkOutEquipment(item.id);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors min-h-[44px]"
                    >
                      Check Out
                    </button>
                  ) : item.status === 'in use' && item.assigned_to === session?.user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // In real app, show check-in form
                        checkInEquipment(item.id, 'good', 8);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors min-h-[44px]"
                    >
                      Check In
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open maintenance request
                    }}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors min-h-[44px]"
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Scanner Modal - Renaissance Style */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-[21px]">
          <div className="card-vitruvian p-[34px] rounded-[21px] max-w-md w-full depth-layer-2 corner-sketch">
            <h2 className="text-golden-lg font-bold text-white mb-[21px] measurement-line">Scan Equipment QR Code</h2>
            
            <div className="tech-border border-dashed rounded-[13px] p-[34px] text-center">
              <div className="vitruvian-square mx-auto mb-[21px]">
                <QrCode className="w-[55px] h-[55px] text-amber-400" />
              </div>
              <p className="text-amber-400/60 mb-[21px] technical-annotation" data-note="SCAN">
                Use your camera to scan the QR code on the equipment
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleQRScan}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-davinci px-[34px] py-[13px] field-touch field-readable"
              >
                Open Camera
              </button>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowScanner(false)}
                className="flex-1 px-[21px] py-[13px] btn-blueprint field-touch field-readable"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Details Modal - Renaissance Style */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-[21px]">
          <div className="card-vitruvian p-[34px] rounded-[21px] max-w-2xl w-full max-h-[90vh] overflow-y-auto depth-layer-2 corner-sketch">
            <h2 className="text-golden-lg font-bold text-white mb-[21px] measurement-line">Equipment Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">{selectedEquipment.equipment_type}</h3>
                {selectedEquipment.model && (
                  <p className="text-gray-400">
                    {selectedEquipment.manufacturer} {selectedEquipment.model}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Serial Number</span>
                  <p className="text-white font-mono">{selectedEquipment.serial_number || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Asset Tag</span>
                  <p className="text-white font-mono">{selectedEquipment.asset_tag || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Status</span>
                  <p className={`font-medium ${getStatusColor(selectedEquipment.status)}`}>
                    {selectedEquipment.status}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Condition</span>
                  <p className={`font-medium ${getConditionColor(selectedEquipment.condition)}`}>
                    {selectedEquipment.condition}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Usage Hours</span>
                  <p className="text-white">{selectedEquipment.usage_hours.toFixed(1)} hours</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Location</span>
                  <p className="text-white">{selectedEquipment.location_description || 'Not specified'}</p>
                </div>
              </div>

              {selectedEquipment.notes && (
                <div>
                  <span className="text-sm text-gray-400">Notes</span>
                  <p className="text-white mt-1">{selectedEquipment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedEquipment(null)}
                className="flex-1 px-[21px] py-[13px] btn-blueprint field-touch field-readable"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leonardo Quote */}
      <div className="text-center opacity-30 mt-[89px]">
        <p className="text-golden-sm text-amber-400/60 font-light italic">
          "Mechanics is the paradise of the mathematical sciences."
        </p>
        <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
      </div>
    </div>
  );
};



