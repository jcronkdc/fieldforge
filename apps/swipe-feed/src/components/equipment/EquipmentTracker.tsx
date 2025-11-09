import React, { useState, useEffect } from 'react';
import {
  Package,
  Zap,
  Search,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  FileText,
  QrCode
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { locationService } from '../../lib/services/locationService';

interface Equipment {
  id: string;
  equipmentTag: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  voltageRating: string;
  currentRating: string;
  installationDate: string | null;
  status: 'pending' | 'delivered' | 'installed' | 'energized' | 'commissioned';
  location: {
    lat: number;
    lng: number;
    description: string;
  } | null;
  testReports: any[];
  commissioningStatus: string;
}

interface TransformerData {
  windingConfiguration: string;
  tapChangerType: string;
  oilType: string;
  oilVolumeGallons: number;
  coolingType: string;
  impedancePercent: number;
}

export const EquipmentTracker: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);

  const equipmentTypes = [
    { value: 'all', label: 'All Equipment', icon: Package },
    { value: 'transformer', label: 'Transformers', icon: Zap },
    { value: 'circuit_breaker', label: 'Circuit Breakers', icon: Zap },
    { value: 'disconnect_switch', label: 'Disconnect Switches', icon: Zap },
    { value: 'current_transformer', label: 'CTs', icon: Zap },
    { value: 'potential_transformer', label: 'PTs', icon: Zap },
    { value: 'surge_arrester', label: 'Surge Arresters', icon: Zap },
    { value: 'capacitor_bank', label: 'Capacitor Banks', icon: Zap },
    { value: 'relay', label: 'Relays', icon: Zap },
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('substation_equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesType = selectedType === 'all' || item.equipmentType === selectedType;
    const matchesSearch = item.equipmentTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-400 bg-gray-800';
      case 'delivered': return 'text-blue-400 bg-blue-900/30';
      case 'installed': return 'text-yellow-400 bg-yellow-900/30';
      case 'energized': return 'text-orange-400 bg-orange-900/30';
      case 'commissioned': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <div
      onClick={() => setSelectedEquipment(item)}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-semibold text-lg">{item.equipmentTag}</h4>
          <p className="text-gray-400 text-sm">{item.manufacturer} - {item.model}</p>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Serial Number</p>
          <p className="text-gray-300">{item.serialNumber}</p>
        </div>
        <div>
          <p className="text-gray-500">Voltage Rating</p>
          <p className="text-gray-300">{item.voltageRating}</p>
        </div>
        <div>
          <p className="text-gray-500">Current Rating</p>
          <p className="text-gray-300">{item.currentRating || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Installation</p>
          <p className="text-gray-300">
            {item.installationDate ? new Date(item.installationDate).toLocaleDateString() : 'Pending'}
          </p>
        </div>
      </div>

      {item.location && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{item.location.description}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {item.testReports.length > 0 && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <FileText className="w-4 h-4" />
              {item.testReports.length} Tests
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-400 text-sm">
            <QrCode className="w-4 h-4" />
            QR
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle edit
          }}
          className="text-yellow-500 hover:text-yellow-400"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Equipment Tracking</h2>
        <p className="text-gray-400">Monitor and manage substation equipment installation</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {equipmentTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  selectedType === type.value
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tag, serial number, or manufacturer..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading equipment...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No equipment found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map(item => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Equipment Status Summary */}
      <div className="mt-8 bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-4">Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">
              {equipment.filter(e => e.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {equipment.filter(e => e.status === 'delivered').length}
            </p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {equipment.filter(e => e.status === 'installed').length}
            </p>
            <p className="text-sm text-gray-500">Installed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">
              {equipment.filter(e => e.status === 'energized').length}
            </p>
            <p className="text-sm text-gray-500">Energized</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {equipment.filter(e => e.status === 'commissioned').length}
            </p>
            <p className="text-sm text-gray-500">Commissioned</p>
          </div>
        </div>
      </div>
    </div>
  );
};
