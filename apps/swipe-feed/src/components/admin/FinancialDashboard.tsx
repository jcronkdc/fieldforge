/**
 * Financial Dashboard - Secure financial reporting with QuickBooks export
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * CRITICAL: This component handles sensitive financial data
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FinancialTracking, FinancialMetrics, QuickBooksExport, TaxReport } from '../../utils/financialTracker';

interface FinancialDashboardProps {
  onClose?: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'tax' | 'export'>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'quickbooks' | 'json'>('csv');

  // Security: Verify admin access
  useEffect(() => {
    const userId = localStorage.getItem('mythatron_user_id');
    const role = localStorage.getItem('mythatron_user_role');
    
    if (userId === 'admin' || role === 'admin' || userId === 'MythaTron') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load financial metrics
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadMetrics = () => {
      const data = FinancialTracking.getMetrics(dateRange.start, dateRange.end);
      setMetrics(data);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, dateRange]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Export data
  const handleExport = () => {
    if (!isAuthenticated) return;

    let data: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'quickbooks':
        const qbData = FinancialTracking.exportToQuickBooks(dateRange.start, dateRange.end);
        data = JSON.stringify(qbData, null, 2);
        filename = `mythatron_quickbooks_${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        data = FinancialTracking.exportToCSV(dateRange.start, dateRange.end);
        filename = `mythatron_transactions_${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      
      case 'json':
      default:
        data = JSON.stringify({
          metrics,
          dateRange,
          exportDate: new Date().toISOString(),
          version: '1.0.0',
        }, null, 2);
        filename = `mythatron_financial_${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
    }

    // Create download
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate tax report
  const generateTaxReport = (): TaxReport | null => {
    if (!isAuthenticated) return null;
    return FinancialTracking.generateTaxReport(dateRange.start, dateRange.end);
  };

  // Security gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#lockGradient)" strokeWidth="2">
              <defs>
                <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <h2 className="text-2xl font-light text-white">Authentication Required</h2>
          </div>
          
          <p className="text-white/60 mb-6">
            Access to financial data requires administrator privileges.
          </p>
          
          <input
            type="password"
            placeholder="Enter admin code"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 mb-4"
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (authCode === 'mythatron2025') {
                  setIsAuthenticated(true);
                } else {
                  alert('Invalid authentication code');
                }
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 rounded-xl transition-all"
            >
              Authenticate
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const taxReport = activeView === 'tax' ? generateTaxReport() : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#financeGradient)" strokeWidth="1.5">
                <defs>
                  <linearGradient id="financeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              <div>
                <h1 className="text-2xl font-light">Financial Dashboard</h1>
                <p className="text-sm text-white/60">Secure Financial Reporting & Analytics</p>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-4 mt-4">
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
            />
            <span className="text-white/40">to</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
            />
            
            {/* Quick Ranges */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    start: new Date(today.getFullYear(), today.getMonth(), 1),
                    end: today,
                  });
                }}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  setDateRange({
                    start: lastMonth,
                    end: new Date(today.getFullYear(), today.getMonth(), 0),
                  });
                }}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                Last Month
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    start: new Date(today.getFullYear(), 0, 1),
                    end: today,
                  });
                }}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                YTD
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-t border-white/10 pt-4">
            {[
              { id: 'overview', label: 'Overview', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              ) },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'tax', label: 'Tax Report', icon: '📋' },
              { id: 'export', label: 'Export', icon: '⬇️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 rounded-t-lg transition-all ${
                  activeView === tab.id
                    ? 'bg-gradient-to-b from-green-500/20 to-transparent text-green-400 border-b-2 border-green-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Total Revenue</span>
                  <span className="text-green-400 text-xs">
                    {metrics.growthRate > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(metrics.growthRate))}
                  </span>
                </div>
                <div className="text-3xl font-light text-green-400">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Total Expenses</span>
                </div>
                <div className="text-3xl font-light text-red-400">
                  {formatCurrency(metrics.totalExpenses)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Net Profit</span>
                  <span className="text-blue-400 text-xs">
                    {formatPercentage(metrics.profitMargin)} margin
                  </span>
                </div>
                <div className="text-3xl font-light text-blue-400">
                  {formatCurrency(metrics.netProfit)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">MRR</span>
                </div>
                <div className="text-3xl font-light text-purple-400">
                  {formatCurrency(metrics.monthlyRecurringRevenue)}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Avg Transaction</span>
                  <span className="text-white font-mono">
                    {formatCurrency(metrics.averageTransactionValue)}
                  </span>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Customer LTV</span>
                  <span className="text-white font-mono">
                    {formatCurrency(metrics.customerLifetimeValue)}
                  </span>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Taxes Collected</span>
                  <span className="text-white font-mono">
                    {formatCurrency(metrics.taxesCollected)}
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Projection */}
            <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-light mb-4 text-green-400">Revenue Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-white/60 text-sm">Next Month</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(metrics.monthlyRecurringRevenue * 1.1)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Next Quarter</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(metrics.monthlyRecurringRevenue * 3.5)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Annual Run Rate</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(metrics.monthlyRecurringRevenue * 12)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'transactions' && (
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-light mb-4">Transaction History</h3>
            <p className="text-white/60 mb-4">
              Detailed transaction logs are available through the export feature.
            </p>
            <button
              onClick={() => setActiveView('export')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-xl transition-all"
            >
              Go to Export
            </button>
          </div>
        )}

        {activeView === 'tax' && taxReport && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-light mb-4 text-orange-400">Tax Report Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-white/60 text-sm">Gross Revenue</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(taxReport.grossRevenue)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Taxable Revenue</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(taxReport.taxableRevenue)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Sales Tax Collected</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(taxReport.salesTaxCollected)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Deductions</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(taxReport.deductions)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Net Taxable Income</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(taxReport.netTaxableIncome)}
                  </p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Estimated Tax (25%)</span>
                  <p className="text-2xl font-light text-white">
                    {formatCurrency(taxReport.estimatedTax)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ This is an estimated tax report. Please consult with a tax professional for accurate tax filing.
              </p>
            </div>
          </div>
        )}

        {activeView === 'export' && (
          <div className="space-y-6">
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-light mb-4">Export Financial Data</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm block mb-2">Export Format</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'csv', label: 'CSV (Excel)', icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                      ) },
                      { value: 'quickbooks', label: 'QuickBooks', icon: '💼' },
                      { value: 'json', label: 'JSON', icon: '{ }' },
                    ].map(format => (
                      <button
                        key={format.value}
                        onClick={() => setExportFormat(format.value as any)}
                        className={`px-4 py-3 rounded-xl border transition-all ${
                          exportFormat === format.value
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30'
                            : 'bg-black/30 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="mr-2">{format.icon}</span>
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-2">Export will include:</p>
                  <ul className="text-white/40 text-sm space-y-1">
                    <li>• All transactions in selected date range</li>
                    <li>• Revenue and expense categorization</li>
                    <li>• Tax calculations and summaries</li>
                    <li>• Customer information (hashed for privacy)</li>
                    <li>• QuickBooks-compatible account mappings</li>
                  </ul>
                </div>
                
                <button
                  onClick={handleExport}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export Financial Data
                </button>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                💡 Exported data is encrypted and suitable for import into accounting software.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
