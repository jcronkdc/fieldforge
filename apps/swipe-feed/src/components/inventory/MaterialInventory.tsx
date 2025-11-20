import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Edit2, Search, Filter, BarChart3, Video } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import toast from 'react-hot-toast';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface Material {
  id: number;
  item_code: string;
  name: string;
  category: string;
  unit_of_measure: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  total_value: number;
  supplier: string;
  location: string;
  project_id?: number;
  last_restocked?: string;
  company_id: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  material_id: number;
  transaction_type: 'receipt' | 'issue' | 'return' | 'adjustment';
  quantity: number;
  reference_number?: string;
  notes?: string;
  performed_by: number;
  created_at: string;
}

const CATEGORIES = [
  'Electrical',
  'Mechanical', 
  'Structural',
  'Safety Equipment',
  'Tools',
  'Consumables',
  'Hardware',
  'Other'
];

export const MaterialInventory: React.FC = () => {
  const { session } = useAuthContext();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [transactionData, setTransactionData] = useState({
    material_id: 0,
    transaction_type: 'issue' as Transaction['transaction_type'],
    quantity: 0,
    reference_number: '',
    notes: ''
  });
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    category: '',
    unit_of_measure: '',
    quantity_on_hand: 0,
    reorder_point: 0,
    reorder_quantity: 0,
    unit_cost: 0,
    supplier: '',
    location: '',
    project_id: null as number | null
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    // Filter materials based on search and category
    let filtered = materials;
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }
    
    setFilteredMaterials(filtered);
  }, [materials, searchTerm, categoryFilter]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/inventory/materials', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = selectedMaterial ? 'PUT' : 'POST';
      const url = selectedMaterial 
        ? `/api/inventory/materials/${selectedMaterial.id}`
        : '/api/inventory/materials';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save material');

      toast.success(selectedMaterial ? 'Material updated' : 'Material added successfully');
      fetchMaterials();
      resetForm();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Failed to save material');
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) throw new Error('Failed to record transaction');

      toast.success('Transaction recorded successfully');
      fetchMaterials();
      resetTransactionForm();
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error('Failed to record transaction');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedMaterial(null);
    setFormData({
      item_code: '',
      name: '',
      category: '',
      unit_of_measure: '',
      quantity_on_hand: 0,
      reorder_point: 0,
      reorder_quantity: 0,
      unit_cost: 0,
      supplier: '',
      location: '',
      project_id: null
    });
  };

  const resetTransactionForm = () => {
    setShowTransactionForm(false);
    setSelectedMaterial(null);
    setTransactionData({
      material_id: 0,
      transaction_type: 'issue',
      quantity: 0,
      reference_number: '',
      notes: ''
    });
  };

  const editMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      item_code: material.item_code,
      name: material.name,
      category: material.category,
      unit_of_measure: material.unit_of_measure,
      quantity_on_hand: material.quantity_on_hand,
      reorder_point: material.reorder_point,
      reorder_quantity: material.reorder_quantity,
      unit_cost: material.unit_cost,
      supplier: material.supplier,
      location: material.location,
      project_id: material.project_id || null
    });
    setShowForm(true);
  };

  const startTransaction = (material: Material) => {
    setSelectedMaterial(material);
    setTransactionData({
      ...transactionData,
      material_id: material.id
    });
    setShowTransactionForm(true);
  };

  // Calculate stats
  const stats = {
    totalItems: materials.length,
    lowStock: materials.filter(m => m.quantity_available <= m.reorder_point).length,
    totalValue: materials.reduce((sum, m) => sum + m.total_value, 0),
    outOfStock: materials.filter(m => m.quantity_available <= 0).length
  };

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Procurement Coordination</h2>
              <p className="text-sm text-blue-100">Material planning • Supplier coordination • Stock discussions • Order reviews</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Inventory
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📦 Material Inventory</h1>
            <p className="text-slate-400">Track and manage construction materials</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              <Video className="w-5 h-5" />
              <span className="hidden sm:inline">Procurement Call</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Material
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Items</span>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalItems}</div>
            <div className="text-sm text-slate-400 mt-1">Material types</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Low Stock</span>
              <TrendingDown className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.lowStock}</div>
            <div className="text-sm text-slate-400 mt-1">Need reorder</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Out of Stock</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.outOfStock}</div>
            <div className="text-sm text-slate-400 mt-1">Critical</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Value</span>
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">
              ${stats.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400 mt-1">Inventory value</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, code, or supplier..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Material Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedMaterial ? 'Edit Material' : 'Add New Material'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Item Code
                    </label>
                    <input
                      type="text"
                      value={formData.item_code}
                      onChange={(e) => setFormData({...formData, item_code: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Material Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Unit of Measure
                    </label>
                    <input
                      type="text"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({...formData, unit_of_measure: e.target.value})}
                      placeholder="EA, FT, LB, etc"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={formData.quantity_on_hand}
                      onChange={(e) => setFormData({...formData, quantity_on_hand: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Unit Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData({...formData, unit_cost: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      value={formData.reorder_point}
                      onChange={(e) => setFormData({...formData, reorder_point: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.reorder_quantity}
                      onChange={(e) => setFormData({...formData, reorder_quantity: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Warehouse, Jobsite, etc"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

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
                    {selectedMaterial ? 'Update' : 'Add'} Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && selectedMaterial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Record Transaction: {selectedMaterial.name}
              </h2>

              <form onSubmit={handleTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={transactionData.transaction_type}
                    onChange={(e) => setTransactionData({...transactionData, transaction_type: e.target.value as Transaction['transaction_type']})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="issue">Issue (Out)</option>
                    <option value="receipt">Receipt (In)</option>
                    <option value="return">Return</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={transactionData.quantity}
                    onChange={(e) => setTransactionData({...transactionData, quantity: Number(e.target.value)})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Current stock: {selectedMaterial.quantity_available} {selectedMaterial.unit_of_measure}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={transactionData.reference_number}
                    onChange={(e) => setTransactionData({...transactionData, reference_number: e.target.value})}
                    placeholder="PO#, Work Order#, etc"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={transactionData.notes}
                    onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetTransactionForm}
                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Record Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Materials Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">On Hand</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Available</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Value</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      <Package className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p>No materials found</p>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 text-sm text-white font-medium">
                        {material.item_code}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {material.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {material.category}
                      </td>
                      <td className="py-3 px-4 text-sm text-white text-right">
                        {material.quantity_on_hand} {material.unit_of_measure}
                      </td>
                      <td className="py-3 px-4 text-sm text-white text-right">
                        {material.quantity_available} {material.unit_of_measure}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {material.location}
                      </td>
                      <td className="py-3 px-4 text-sm text-white text-right">
                        ${material.total_value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {material.quantity_available <= 0 ? (
                          <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">
                            Out of Stock
                          </span>
                        ) : material.quantity_available <= material.reorder_point ? (
                          <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startTransaction(material)}
                            className="text-blue-400 hover:text-blue-300 transition"
                            title="Record transaction"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => editMaterial(material)}
                            className="text-slate-400 hover:text-white transition"
                            title="Edit material"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};