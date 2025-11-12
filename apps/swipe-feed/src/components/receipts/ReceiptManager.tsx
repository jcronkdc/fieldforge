import React, { useState, useEffect, useRef } from 'react';
import { Receipt, Camera, Upload, Download, Search, Calendar, DollarSign, Building2, Tag, Loader2, CheckCircle, AlertCircle, Filter, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ReceiptData {
  id: string;
  vendor_name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  project_id?: string;
  project_name?: string;
  receipt_number?: string;
  tax_amount?: number;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

interface ReceiptStats {
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  receiptCount: number;
  avgAmount: number;
}

export const ReceiptManager: React.FC = () => {
  const { session } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [stats, setStats] = useState<ReceiptStats>({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    receiptCount: 0,
    avgAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [newReceipt, setNewReceipt] = useState({
    vendor_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Materials',
    description: '',
    project_id: '',
    receipt_number: '',
    tax_amount: ''
  });

  useEffect(() => {
    if (session) {
      fetchReceipts();
      fetchStats();
    }
  }, [session, filterStatus, searchTerm]);

  const fetchReceipts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/receipts?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts || []);
      }
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/receipts/stats', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('vendor_name', newReceipt.vendor_name);
    formData.append('amount', newReceipt.amount);
    formData.append('date', newReceipt.date);
    formData.append('category', newReceipt.category);
    formData.append('description', newReceipt.description);
    formData.append('project_id', newReceipt.project_id);
    formData.append('receipt_number', newReceipt.receipt_number);
    formData.append('tax_amount', newReceipt.tax_amount);

    try {
      setUploadProgress(30);
      const response = await fetch('/api/receipts/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });

      setUploadProgress(90);

      if (response.ok) {
        setUploadProgress(100);
        toast.success('Receipt uploaded successfully!');
        setShowUploadModal(false);
        resetForm();
        fetchReceipts();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const createReceiptWithoutImage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReceipt.vendor_name || !newReceipt.amount || !newReceipt.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...newReceipt,
          amount: parseFloat(newReceipt.amount),
          tax_amount: newReceipt.tax_amount ? parseFloat(newReceipt.tax_amount) : null
        })
      });

      if (response.ok) {
        toast.success('Receipt created successfully!');
        setShowUploadModal(false);
        resetForm();
        fetchReceipts();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create receipt');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast.error('Failed to create receipt');
    }
  };

  const approveReceipt = async (receiptId: string) => {
    try {
      const response = await fetch(`/api/receipts/${receiptId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Receipt approved');
        fetchReceipts();
        fetchStats();
      } else {
        toast.error('Failed to approve receipt');
      }
    } catch (error) {
      console.error('Error approving receipt:', error);
      toast.error('Failed to approve receipt');
    }
  };

  const rejectReceipt = async (receiptId: string, reason: string) => {
    try {
      const response = await fetch(`/api/receipts/${receiptId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Receipt rejected');
        fetchReceipts();
        fetchStats();
      } else {
        toast.error('Failed to reject receipt');
      }
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      toast.error('Failed to reject receipt');
    }
  };

  const resetForm = () => {
    setNewReceipt({
      vendor_name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Materials',
      description: '',
      project_id: '',
      receipt_number: '',
      tax_amount: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = [
    'Materials',
    'Equipment',
    'Tools',
    'Safety',
    'Fuel',
    'Office',
    'Travel',
    'Meals',
    'Other'
  ];

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = searchTerm === '' || 
      receipt.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Receipt Manager</h1>
          <p className="text-gray-600 mt-1">Track and manage expense receipts</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Upload className="w-4 h-4" />
          Add Receipt
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">
                ${stats.pendingAmount.toFixed(2)}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-xl font-bold text-green-600">
                ${stats.approvedAmount.toFixed(2)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Count</p>
              <p className="text-xl font-bold text-gray-900">{stats.receiptCount}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Amount</p>
              <p className="text-xl font-bold text-gray-900">
                ${stats.avgAmount.toFixed(2)}
              </p>
            </div>
            <Tag className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vendors, descriptions..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                  filterStatus === status
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReceipts.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No receipts found</p>
            <p className="text-sm text-gray-500 mt-2">Upload your first receipt to get started</p>
          </div>
        ) : (
          filteredReceipts.map(receipt => (
            <div
              key={receipt.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedReceipt(receipt)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{receipt.vendor_name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${receipt.amount.toFixed(2)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(receipt.date).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    {receipt.category}
                  </div>
                  
                  {receipt.project_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      {receipt.project_name}
                    </div>
                  )}
                  
                  {receipt.receipt_number && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      #{receipt.receipt_number}
                    </div>
                  )}
                </div>

                {receipt.description && (
                  <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                    {receipt.description}
                  </p>
                )}

                {/* Actions */}
                {receipt.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approveReceipt(receipt.id);
                      }}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors min-h-[36px]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt('Rejection reason:');
                        if (reason) rejectReceipt(receipt.id, reason);
                      }}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors min-h-[36px]"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Receipt</h2>
            
            <form onSubmit={createReceiptWithoutImage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  value={newReceipt.vendor_name}
                  onChange={(e) => setNewReceipt({...newReceipt, vendor_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                  placeholder="e.g., Home Depot"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={newReceipt.amount}
                    onChange={(e) => setNewReceipt({...newReceipt, amount: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newReceipt.tax_amount}
                    onChange={(e) => setNewReceipt({...newReceipt, tax_amount: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={newReceipt.date}
                  onChange={(e) => setNewReceipt({...newReceipt, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newReceipt.category}
                  onChange={(e) => setNewReceipt({...newReceipt, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Number
                </label>
                <input
                  type="text"
                  value={newReceipt.receipt_number}
                  onChange={(e) => setNewReceipt({...newReceipt, receipt_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                  placeholder="e.g., INV-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newReceipt.description}
                  onChange={(e) => setNewReceipt({...newReceipt, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="What was purchased?"
                />
              </div>

              {/* Upload Image Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Upload receipt image (optional)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Select Image
                </button>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 min-h-[44px]"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedReceipt.vendor_name}</h2>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${selectedReceipt.amount.toFixed(2)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(selectedReceipt.status)}`}>
                {selectedReceipt.status}
              </span>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(selectedReceipt.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Category</span>
                <span className="font-medium">{selectedReceipt.category}</span>
              </div>

              {selectedReceipt.receipt_number && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Receipt #</span>
                  <span className="font-medium">{selectedReceipt.receipt_number}</span>
                </div>
              )}

              {selectedReceipt.tax_amount && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="font-medium">
                    ${selectedReceipt.tax_amount.toFixed(2)}
                  </span>
                </div>
              )}

              {selectedReceipt.project_name && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Project</span>
                  <span className="font-medium">{selectedReceipt.project_name}</span>
                </div>
              )}
            </div>

            {selectedReceipt.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{selectedReceipt.description}</p>
              </div>
            )}

            {/* Receipt Image */}
            {selectedReceipt.image_url && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Receipt Image</p>
                <img
                  src={selectedReceipt.image_url}
                  alt="Receipt"
                  className="w-full rounded-lg border"
                />
              </div>
            )}

            {/* Approval Info */}
            {selectedReceipt.status === 'approved' && selectedReceipt.approved_by && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Approved by {selectedReceipt.approved_by} on{' '}
                  {selectedReceipt.approved_at && 
                    new Date(selectedReceipt.approved_at).toLocaleDateString()
                  }
                </p>
              </div>
            )}

            {selectedReceipt.status === 'rejected' && selectedReceipt.rejection_reason && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Rejection reason: {selectedReceipt.rejection_reason}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};