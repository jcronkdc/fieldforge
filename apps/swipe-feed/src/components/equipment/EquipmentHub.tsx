import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, Wrench, Calendar, QrCode, Search, Filter, Plus, AlertTriangle } from 'lucide-react';
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
        project:projects(name),
        assigned_user:auth.users!assigned_to(raw_user_meta_data->full_name)
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
        usage_hours: equipment.find(e => e.id === equipmentId)?.usage_hours + hours
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
      case 'available': return 'text-green-500 bg-green-500/10';
      case 'in use': return 'text-blue-500 bg-blue-500/10';
      case 'maintenance': return 'text-orange-500 bg-orange-500/10';
      case 'retired': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-600';
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Equipment Hub</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">Track and manage equipment inventory</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors min-h-[44px]"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Equipment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Equipment</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{equipment.length}</p>
            </div>
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Available</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {equipment.filter(e => e.status === 'available').length}
              </p>
            </div>
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">In Maintenance</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {equipment.filter(e => e.status === 'maintenance').length}
              </p>
            </div>
            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Due Service</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {equipment.filter(e => {
                  if (!e.next_maintenance_date) return false;
                  return differenceInDays(new Date(e.next_maintenance_date), new Date()) <= 7;
                }).length}
              </p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by type, serial, or asset tag..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none text-base min-h-[44px]"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              filterStatus === 'all' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('available')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              filterStatus === 'available' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilterStatus('in use')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              filterStatus === 'in use' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            In Use
          </button>
        </div>
      </div>

      {/* Equipment Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            Loading equipment...
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No equipment found</p>
          </div>
        ) : (
          filteredEquipment.map(item => {
            const maintenanceStatus = getMaintenanceStatus(item.next_maintenance_date);
            
            return (
              <div
                key={item.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedEquipment(item)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.equipment_type}</h3>
                    {item.model && (
                      <p className="text-sm text-gray-400">{item.manufacturer} {item.model}</p>
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

      {/* QR Scanner Modal - Mobile Friendly */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Scan Equipment QR Code</h2>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
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
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium min-h-[44px]"
              >
                Open Camera
              </button>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowScanner(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Details Modal - Mobile Optimized */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Equipment Details</h2>
            
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
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors min-h-[44px]"
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



