import React, { useState, useEffect, useRef } from 'react';
import { Receipt, Camera, Upload, Download, Search, Calendar, DollarSign, Building2, Tag, Loader2, CheckCircle, AlertCircle, Filter, FileText, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CollaborationHub } from '../collaboration/CollaborationHub';

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
  const [showCollaboration, setShowCollaboration] = useState(false);

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
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading receipts...</p>
        </div>
      </div>
    );
  }

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Approval Review Call</h2>
              <p className="text-sm text-green-100">Expense reviews • Approval discussions • Budget analysis • Vendor coordination</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Receipts
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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
      
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-gray-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Expense Management</p>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Receipt Manager
          </h1>
          <p className="max-w-3xl text-base text-gray-400">Track and manage expense receipts with collaborative approval workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCollaboration(!showCollaboration)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Approval Call</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:border-blue-500/50 hover:bg-gray-800/80 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Add Receipt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ${stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Pending</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                ${stats.pendingAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Approved</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ${stats.approvedAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Count</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stats.receiptCount}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Receipt className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Avg Amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                ${stats.avgAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Tag className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vendors, descriptions..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-3 rounded-lg font-medium transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReceipts.length === 0 ? (
          <div className="col-span-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center shadow-lg">
            <div className="p-6 bg-gray-700/30 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Receipt className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-lg text-gray-300 font-medium">No receipts found</p>
            <p className="text-sm text-gray-500 mt-2">Upload your first receipt to get started</p>
          </div>
        ) : (
          filteredReceipts.map(receipt => (
            <div
              key={receipt.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedReceipt(receipt)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                      {receipt.vendor_name}
                    </h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                      ${receipt.amount.toFixed(2)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadge(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(receipt.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span>{receipt.category}</span>
                  </div>
                  
                  {receipt.project_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span>{receipt.project_name}</span>
                    </div>
                  )}
                  
                  {receipt.receipt_number && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>#{receipt.receipt_number}</span>
                    </div>
                  )}
                </div>

                {receipt.description && (
                  <p className="text-sm text-gray-400 mt-4 line-clamp-2 border-t border-gray-700 pt-3">
                    {receipt.description}
                  </p>
                )}

                {/* Actions */}
                {receipt.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approveReceipt(receipt.id);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt('Rejection reason:');
                        if (reason) rejectReceipt(receipt.id, reason);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newReceipt.category}
                  onChange={(e) => setNewReceipt({...newReceipt, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
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