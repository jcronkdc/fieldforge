/**
 * Purchase Audit Dashboard - Complete purchase tracking for customer support
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * ADMIN ONLY - Critical for customer support and dispute resolution
 */

import React, { useState, useEffect } from 'react';

export interface PurchaseAttempt {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  type: 'sparks' | 'subscription';
  status: 'initiated' | 'processing' | 'completed' | 'failed' | 'declined' | 'cancelled';
  amount: number;
  price: number;
  currency: string;
  paymentMethod?: string;
  errorMessage?: string;
  errorCode?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeErrorType?: string;
  ipAddress?: string;
  userAgent?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export function PurchaseAuditDashboard() {
  const [purchases, setPurchases] = useState<PurchaseAttempt[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'declined'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseAttempt | null>(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successful: 0,
    failed: 0,
    declined: 0,
    revenue: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    // Load purchase attempts from localStorage (in production, this would be from backend)
    const loadPurchases = () => {
      const stored = localStorage.getItem('mythatron_purchase_audit');
      if (stored) {
        const data: PurchaseAttempt[] = JSON.parse(stored);
        setPurchases(data.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } else {
        // Generate sample data for testing
        const sampleData: PurchaseAttempt[] = [
          {
            id: 'pa_001',
            userId: 'user_123',
            userEmail: 'john.doe@example.com',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'sparks',
            status: 'completed',
            amount: 100,
            price: 4.99,
            currency: 'USD',
            paymentMethod: 'card',
            stripePaymentIntentId: 'pi_1234567890',
            stripeChargeId: 'ch_1234567890',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 Chrome/91.0',
          },
          {
            id: 'pa_002',
            userId: 'user_456',
            userEmail: 'jane.smith@example.com',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'subscription',
            status: 'declined',
            amount: 500,
            price: 9.99,
            currency: 'USD',
            paymentMethod: 'card',
            errorMessage: 'Your card was declined',
            errorCode: 'card_declined',
            stripeErrorType: 'card_error',
            retryCount: 2,
            ipAddress: '192.168.1.2',
            userAgent: 'Mozilla/5.0 Safari/14.0',
          },
          {
            id: 'pa_003',
            userId: 'user_789',
            userEmail: 'bob.wilson@example.com',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            type: 'sparks',
            status: 'failed',
            amount: 500,
            price: 17.99,
            currency: 'USD',
            paymentMethod: 'card',
            errorMessage: 'Network error during processing',
            errorCode: 'network_error',
            ipAddress: '192.168.1.3',
            userAgent: 'Mozilla/5.0 Firefox/89.0',
          },
          {
            id: 'pa_004',
            userId: 'user_123',
            userEmail: 'john.doe@example.com',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            type: 'sparks',
            status: 'completed',
            amount: 250,
            price: 9.99,
            currency: 'USD',
            paymentMethod: 'card',
            stripePaymentIntentId: 'pi_9876543210',
            stripeChargeId: 'ch_9876543210',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 Chrome/91.0',
          },
        ];
        setPurchases(sampleData);
        localStorage.setItem('mythatron_purchase_audit', JSON.stringify(sampleData));
      }
    };

    loadPurchases();
    // Refresh every 5 seconds to catch new purchases
    const interval = setInterval(loadPurchases, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate stats
    const completed = purchases.filter(p => p.status === 'completed').length;
    const failed = purchases.filter(p => p.status === 'failed').length;
    const declined = purchases.filter(p => p.status === 'declined').length;
    const revenue = purchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.price, 0);
    
    setStats({
      totalAttempts: purchases.length,
      successful: completed,
      failed: failed,
      declined: declined,
      revenue: revenue,
      conversionRate: purchases.length > 0 ? (completed / purchases.length) * 100 : 0,
    });
  }, [purchases]);

  const filteredPurchases = purchases.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        p.userEmail.toLowerCase().includes(search) ||
        p.userId.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        p.stripePaymentIntentId?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getStatusColor = (status: PurchaseAttempt['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'declined': return 'text-orange-400 bg-orange-500/20';
      case 'cancelled': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User ID', 'Email', 'Timestamp', 'Type', 'Status', 'Amount', 'Price', 'Error', 'Stripe ID'];
    const rows = purchases.map(p => [
      p.id,
      p.userId,
      p.userEmail,
      p.timestamp,
      p.type,
      p.status,
      p.amount,
      p.price,
      p.errorMessage || '',
      p.stripePaymentIntentId || '',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-audit-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">
              Purchase Audit Dashboard
            </h1>
            <p className="text-white/60">Complete purchase tracking for customer support</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              Export CSV
            </button>
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <p className="text-xs text-white/60 mb-1">Total Attempts</p>
            <p className="text-2xl font-light text-white">{stats.totalAttempts}</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
            <p className="text-xs text-green-400 mb-1">Successful</p>
            <p className="text-2xl font-light text-green-400">{stats.successful}</p>
          </div>
          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30 p-4">
            <p className="text-xs text-red-400 mb-1">Failed</p>
            <p className="text-2xl font-light text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl border border-orange-500/30 p-4">
            <p className="text-xs text-orange-400 mb-1">Declined</p>
            <p className="text-2xl font-light text-orange-400">{stats.declined}</p>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
            <p className="text-xs text-purple-400 mb-1">Revenue</p>
            <p className="text-2xl font-light text-purple-400">${stats.revenue.toFixed(2)}</p>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4">
            <p className="text-xs text-blue-400 mb-1">Conversion</p>
            <p className="text-2xl font-light text-blue-400">{stats.conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['all', 'completed', 'failed', 'declined'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === f
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by email, user ID, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 w-96"
          />
        </div>

        {/* Purchase List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredPurchases.map(purchase => (
            <div
              key={purchase.id}
              onClick={() => setSelectedPurchase(purchase)}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(purchase.status)}`}>
                    {purchase.status.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-white font-medium">{purchase.userEmail}</p>
                    <p className="text-xs text-white/60">
                      {new Date(purchase.timestamp).toLocaleString()} • {purchase.type} • {purchase.amount} Sparks
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-light text-white">${purchase.price.toFixed(2)}</p>
                  {purchase.errorMessage && (
                    <p className="text-xs text-red-400">{purchase.errorMessage}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedPurchase && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-white">Purchase Details</h3>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Purchase ID</p>
                  <p className="text-white font-mono">{selectedPurchase.id}</p>
                </div>
                <div>
                  <p className="text-white/60">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedPurchase.status)}`}>
                    {selectedPurchase.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white/60">User ID</p>
                  <p className="text-white font-mono">{selectedPurchase.userId}</p>
                </div>
                <div>
                  <p className="text-white/60">Email</p>
                  <p className="text-white">{selectedPurchase.userEmail}</p>
                </div>
                <div>
                  <p className="text-white/60">Timestamp</p>
                  <p className="text-white">{new Date(selectedPurchase.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/60">Type</p>
                  <p className="text-white">{selectedPurchase.type}</p>
                </div>
                <div>
                  <p className="text-white/60">Amount</p>
                  <p className="text-white">{selectedPurchase.amount} Sparks</p>
                </div>
                <div>
                  <p className="text-white/60">Price</p>
                  <p className="text-white">${selectedPurchase.price.toFixed(2)} {selectedPurchase.currency}</p>
                </div>
                {selectedPurchase.stripePaymentIntentId && (
                  <div>
                    <p className="text-white/60">Stripe Payment Intent</p>
                    <p className="text-white font-mono text-xs">{selectedPurchase.stripePaymentIntentId}</p>
                  </div>
                )}
                {selectedPurchase.stripeChargeId && (
                  <div>
                    <p className="text-white/60">Stripe Charge ID</p>
                    <p className="text-white font-mono text-xs">{selectedPurchase.stripeChargeId}</p>
                  </div>
                )}
                {selectedPurchase.errorMessage && (
                  <div className="col-span-2">
                    <p className="text-white/60">Error Details</p>
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{selectedPurchase.errorMessage}</p>
                      {selectedPurchase.errorCode && (
                        <p className="text-red-400/60 text-xs mt-1">Code: {selectedPurchase.errorCode}</p>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-white/60">IP Address</p>
                  <p className="text-white font-mono text-xs">{selectedPurchase.ipAddress}</p>
                </div>
                <div>
                  <p className="text-white/60">User Agent</p>
                  <p className="text-white text-xs">{selectedPurchase.userAgent}</p>
                </div>
                {selectedPurchase.retryCount && (
                  <div>
                    <p className="text-white/60">Retry Count</p>
                    <p className="text-white">{selectedPurchase.retryCount}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedPurchase, null, 2));
                    alert('Purchase data copied to clipboard');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Copy JSON
                </button>
                {selectedPurchase.status === 'failed' || selectedPurchase.status === 'declined' ? (
                  <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all">
                    Send Support Email
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
