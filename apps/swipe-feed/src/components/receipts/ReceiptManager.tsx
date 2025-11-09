import React, { useState, useEffect } from 'react';
import {
  Receipt, DollarSign, Calendar, Check, X, Eye, Trash2,
  Filter, Search, Download, Plus, FileText, ChevronDown,
  Building2, User, Tag, AlertCircle, CheckCircle, Clock,
  Camera, TrendingUp, PieChart
} from 'lucide-react';
import { receiptService, Receipt as ReceiptType, CostCode } from '../../lib/services/receiptService';
import { ReceiptScanner } from './ReceiptScanner';
import { formatDistanceToNow } from 'date-fns';

interface ReceiptManagerProps {
  projectId?: string;
}

export const ReceiptManager: React.FC<ReceiptManagerProps> = ({ projectId }) => {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [receiptsData, costCodesData] = await Promise.all([
        receiptService.getReceipts(projectId),
        receiptService.getCostCodes()
      ]);
      
      setReceipts(receiptsData);
      setCostCodes(costCodesData);
      
      if (projectId) {
        const analyticsData = await receiptService.getCostCodeAnalytics(projectId);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (receiptId: string) => {
    const success = await receiptService.approveReceipt(receiptId);
    if (success) {
      loadData();
    }
  };

  const handleReject = async (receiptId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const success = await receiptService.rejectReceipt(receiptId, reason);
      if (success) {
        loadData();
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReceipts.length === 0) return;
    
    const success = await receiptService.bulkApproveReceipts(selectedReceipts);
    if (success) {
      setSelectedReceipts([]);
      loadData();
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    
    const success = await receiptService.deleteReceipt(receiptId);
    if (success) {
      loadData();
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    const matchesSearch = 
      receipt.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + (r.total_amount || r.amount || 0), 0);
  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const approvedCount = receipts.filter(r => r.status === 'approved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'processing': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Receipt Management</h1>
            <p className="text-gray-400 mt-1">Scan, track, and manage expense receipts</p>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Scan Receipt</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{receipts.length}</div>
            <p className="text-xs text-gray-400 mt-1">Receipts</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">Amount</span>
            </div>
            <div className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Total Expenses</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <p className="text-xs text-gray-400 mt-1">Awaiting Review</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">Approved</span>
            </div>
            <div className="text-2xl font-bold text-white">{approvedCount}</div>
            <p className="text-xs text-gray-400 mt-1">Processed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
          </select>

          {selectedReceipts.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Approve ({selectedReceipts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Receipt List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl">
          <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No receipts found</p>
          <button
            onClick={() => setShowScanner(true)}
            className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
          >
            Scan Your First Receipt
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReceipts.length === filteredReceipts.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReceipts(filteredReceipts.map(r => r.id));
                        } else {
                          setSelectedReceipts([]);
                        }
                      }}
                      className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Cost Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredReceipts.map((receipt) => {
                  const costCode = costCodes.find(c => c.id === receipt.company_cost_code_id);
                  return (
                    <tr key={receipt.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedReceipts.includes(receipt.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReceipts([...selectedReceipts, receipt.id]);
                            } else {
                              setSelectedReceipts(selectedReceipts.filter(id => id !== receipt.id));
                            }
                          }}
                          className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">
                          {new Date(receipt.receipt_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">
                            {receipt.vendor_name || 'Unknown Vendor'}
                          </div>
                          {receipt.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {receipt.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {costCode ? (
                          <div>
                            <div className="text-white text-sm">{costCode.code}</div>
                            <div className="text-xs text-gray-400">{costCode.name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-semibold">
                          ${(receipt.total_amount || receipt.amount || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(receipt.status)}`}>
                          {getStatusIcon(receipt.status)}
                          <span className="capitalize">{receipt.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(receipt.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedReceipt(receipt)}
                            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {receipt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(receipt.id)}
                                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(receipt.id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(receipt.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cost Code Analytics */}
      {analytics && analytics.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-6 h-6 text-purple-400" />
            <span>Cost Code Analytics</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.slice(0, 6).map((item: any) => {
              const costCode = costCodes.find(c => c.id === item.company_cost_code_id);
              return (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-gray-400">{costCode?.code}</div>
                      <div className="text-white font-medium">{costCode?.name}</div>
                    </div>
                    <Tag className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-2xl font-bold text-white">
                      ${item.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {item.receipt_count} receipts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Receipt Scanner Modal */}
      {showScanner && (
        <ReceiptScanner
          projectId={projectId}
          onSuccess={(receipt) => {
            setShowScanner(false);
            loadData();
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Receipt Details</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {selectedReceipt.image_url && (
                <img
                  src={selectedReceipt.image_url}
                  alt="Receipt"
                  className="w-full rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Vendor</label>
                  <p className="text-white">{selectedReceipt.vendor_name || 'Unknown'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Amount</label>
                  <p className="text-white text-xl font-bold">
                    ${(selectedReceipt.total_amount || selectedReceipt.amount || 0).toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Date</label>
                  <p className="text-white">
                    {new Date(selectedReceipt.receipt_date).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedReceipt.description && (
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white">{selectedReceipt.description}</p>
                  </div>
                )}
                
                {selectedReceipt.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Notes</label>
                    <p className="text-white">{selectedReceipt.notes}</p>
                  </div>
                )}
                
                {selectedReceipt.rejection_reason && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <label className="text-sm text-red-400">Rejection Reason</label>
                    <p className="text-red-300">{selectedReceipt.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
