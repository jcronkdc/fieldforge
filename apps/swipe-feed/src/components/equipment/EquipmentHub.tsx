import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, Wrench, Calendar, QrCode, Search, Filter, Plus, AlertTriangle, Compass, Ruler, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../auth/AuthProvider';
import { format, differenceInDays } from 'date-fns';
import { CollaborationHub } from '../collaboration/CollaborationHub';

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
  const { session } = useAuthContext();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
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
      case 'in use': return 'text-blue-400 bg-blue-400/10';
      case 'maintenance': return 'text-orange-400 bg-orange-400/10';
      case 'retired': return 'text-blue-400/40 bg-blue-400/5';
      default: return 'text-blue-400/60 bg-blue-400/5';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-400';
      case 'good': return 'text-green-400/80';
      case 'fair': return 'text-blue-400';
      case 'poor': return 'text-red-400';
      default: return 'text-blue-400/60';
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

  // If showing collaboration, render it fullscreen
  if (showCollaboration) {
    return (
      <div className="p-[34px] max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowCollaboration(false)}
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            ← Back to Equipment Hub
          </button>
        </div>
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-blue-300">Equipment Team Collaboration</h3>
              <p className="text-sm text-blue-400/80">
                Video inspections • Remote equipment reviews • Maintenance coordination
              </p>
            </div>
          </div>
        </div>
        <CollaborationHub projectId="equipment-hub" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
      
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-gray-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Equipment Management</p>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-4">
            <Package className="w-12 h-12 text-blue-400" />
            Equipment Hub
          </h1>
          <p className="max-w-3xl text-base text-gray-400">Track and manage equipment inventory with QR scanning and video inspections.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCollaboration(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
            title="Start video inspection or equipment discussion"
          >
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Video Inspection</span>
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-blue-500/50 hover:bg-gray-800/80 transition-all flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-blue-500/50 hover:bg-gray-800/80 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Equipment</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{equipment.length}</p>
          <p className="text-sm text-gray-400 mt-1">Equipment</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Truck className="w-8 h-8 text-green-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Available</span>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {equipment.filter(e => e.status === 'available').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Ready to use</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Wrench className="w-8 h-8 text-orange-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Maintenance</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">
            {equipment.filter(e => e.status === 'maintenance').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">In service</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-red-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">Due Soon</span>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {equipment.filter(e => {
              if (!e.next_maintenance_date) return false;
              return differenceInDays(new Date(e.next_maintenance_date), new Date()) <= 7;
            }).length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Next 7 days</p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by type, serial, or asset tag..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filterStatus === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-blue-500/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('available')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filterStatus === 'available' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-blue-500/50'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilterStatus('in use')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filterStatus === 'in use' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-blue-500/50'
            }`}
          >
            In Use
          </button>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading equipment inventory...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No equipment found</p>
          </div>
        ) : (
          filteredEquipment.map(item => {
            const maintenanceStatus = getMaintenanceStatus(item.next_maintenance_date);
            
            return (
              <div
                key={item.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/80 transition-all"
                onClick={() => setSelectedEquipment(item)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.equipment_type}</h3>
                    {item.model && (
                      <p className="text-sm text-gray-400">{item.manufacturer} {item.model}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    {maintenanceStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${maintenanceStatus.color}`}>
                        <Wrench className="w-3 h-3" />
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
      </section>

      {/* QR Scanner Modal - Renaissance Style */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-[21px]">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] max-w-md w-full  ">
            <h2 className="text-lg font-bold text-white mb-[21px] ">Scan Equipment QR Code</h2>
            
            <div className="border border-gray-700 border-dashed rounded-[13px] p-[34px] text-center">
              <div className=" mx-auto mb-[21px]">
                <QrCode className="w-[55px] h-[55px] text-blue-400" />
              </div>
              <p className="text-blue-400/60 mb-[21px] " >
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
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all px-[34px] py-[13px]  "
              >
                Open Camera
              </button>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowScanner(false)}
                className="flex-1 px-[21px] py-[13px] btn-blueprint  "
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
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] max-w-2xl w-full max-h-[90vh] overflow-y-auto  ">
            <h2 className="text-lg font-bold text-white mb-[21px] ">Equipment Details</h2>
            
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
                className="flex-1 px-[21px] py-[13px] btn-blueprint  "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
};



