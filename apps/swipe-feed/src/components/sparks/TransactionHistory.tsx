/**
 * Transaction History - Clear, detailed transaction records
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'reward' | 'subscription' | 'refund';
  amount: number;
  price?: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
  status?: 'completed' | 'pending' | 'failed';
  category?: string;
}

interface TransactionHistoryProps {
  userId?: string;
  limit?: number;
  compact?: boolean;
}

export function TransactionHistory({ 
  userId, 
  limit = 50, 
  compact = false 
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'usage' | 'rewards'>('all');
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'all'>('month');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  useEffect(() => {
    // Load transactions from localStorage (demo)
    const stored = localStorage.getItem('mythatron_transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      // Generate sample transactions
      const sampleTx: Transaction[] = [
        {
          id: 'tx_1',
          type: 'purchase',
          amount: 100,
          price: 4.99,
          description: 'Quick reload - 100 Sparks',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          balanceAfter: 100,
          status: 'completed',
        },
        {
          id: 'tx_2',
          type: 'usage',
          amount: -10,
          description: 'AI Story Generation',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          balanceAfter: 90,
          status: 'completed',
          category: 'AI Features',
        },
        {
          id: 'tx_3',
          type: 'reward',
          amount: 25,
          description: 'Referral bonus - friend joined',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          balanceAfter: 115,
          status: 'completed',
        },
        {
          id: 'tx_4',
          type: 'subscription',
          amount: 500,
          price: 9.99,
          description: 'Creator subscription - Monthly Sparks',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          balanceAfter: 615,
          status: 'completed',
        },
      ];
      setTransactions(sampleTx);
      localStorage.setItem('mythatron_transactions', JSON.stringify(sampleTx));
    }
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    // Filter by type
    if (filter !== 'all') {
      if (filter === 'purchases' && tx.type !== 'purchase' && tx.type !== 'subscription') return false;
      if (filter === 'usage' && tx.type !== 'usage') return false;
      if (filter === 'rewards' && tx.type !== 'reward') return false;
    }

    // Filter by date
    const txDate = new Date(tx.timestamp);
    const now = new Date();
    if (dateRange === 'day' && (now.getTime() - txDate.getTime()) > 86400000) return false;
    if (dateRange === 'week' && (now.getTime() - txDate.getTime()) > 604800000) return false;
    if (dateRange === 'month' && (now.getTime() - txDate.getTime()) > 2592000000) return false;

    return true;
  }).slice(0, limit);

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
      case 'subscription':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <polyline points="17 6 12 1 7 6"/>
          </svg>
        );
      case 'usage':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <polyline points="7 18 12 23 17 18"/>
          </svg>
        );
      case 'reward':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      case 'refund':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
        );
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTotalSpent = () => {
    return transactions
      .filter(tx => tx.type === 'purchase' || tx.type === 'subscription')
      .reduce((sum, tx) => sum + (tx.price || 0), 0)
      .toFixed(2);
  };

  const getTotalEarned = () => {
    return transactions
      .filter(tx => tx.type === 'reward')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTotalUsed = () => {
    return Math.abs(
      transactions
        .filter(tx => tx.type === 'usage')
        .reduce((sum, tx) => sum + tx.amount, 0)
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredTransactions.slice(0, 5).map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              {getTypeIcon(tx.type)}
              <div>
                <p className="text-sm text-white">{tx.description}</p>
                <p className="text-xs text-white/40">{formatDate(tx.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${
                tx.amount > 0 ? 'text-green-400' : 'text-orange-400'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} Sparks
              </p>
              {tx.price && (
                <p className="text-xs text-white/40">${tx.price.toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Transaction History</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Complete record of all Sparks activity</p>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-white/60 mb-1">Total Spent</p>
          <p className="text-xl font-light text-white">${getTotalSpent()}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-white/60 mb-1">Sparks Earned</p>
          <p className="text-xl font-light text-green-400">{getTotalEarned()}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-white/60 mb-1">Sparks Used</p>
          <p className="text-xl font-light text-orange-400">{getTotalUsed()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['all', 'purchases', 'usage', 'rewards'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === f
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Transactions */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map(tx => (
            <div
              key={tx.id}
              className="group relative p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(tx.type)}
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{formatDate(tx.timestamp)}</span>
                      {tx.category && (
                        <>
                          <span>•</span>
                          <span>{tx.category}</span>
                        </>
                      )}
                      {tx.status && (
                        <>
                          <span>•</span>
                          <span className={
                            tx.status === 'completed' ? 'text-green-400' :
                            tx.status === 'pending' ? 'text-yellow-400' :
                            'text-red-400'
                          }>
                            {tx.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-medium ${
                    tx.amount > 0 ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  {tx.price && (
                    <p className="text-xs text-white/40">${tx.price.toFixed(2)}</p>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedTx === tx.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60">Transaction ID</p>
                      <p className="text-white font-mono">{tx.id}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Balance After</p>
                      <p className="text-white">{tx.balanceAfter} Sparks</p>
                    </div>
                    <div>
                      <p className="text-white/60">Date & Time</p>
                      <p className="text-white">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                    {tx.price && (
                      <div>
                        <p className="text-white/60">Amount Paid</p>
                        <p className="text-white">${tx.price.toFixed(2)} USD</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {transactions.length > filteredTransactions.length && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}
