/**
 * Sparks Display Component
 * Shows user's Sparks balance and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import { sparksEconomy } from '../../lib/sparksEconomy/engine';

interface Props {
  userId: string;
  compact?: boolean;
  showActions?: boolean;
  onPurchase?: () => void;
}

export const SparksDisplay: React.FC<Props> = ({ 
  userId, 
  compact = false, 
  showActions = true,
  onPurchase 
}) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const fetchBalance = async () => {
    try {
      const userBalance = await sparksEconomy.getUserBalance(userId);
      setBalance(userBalance);
    } catch (error) {
      console.error('Failed to fetch Sparks balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-lg p-2 w-24 h-8"></div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 px-3 py-1.5 rounded-full transition-all"
      >
        <Icons.Spark size={16} className="text-yellow-500" />
        <span className="font-bold text-yellow-500">{formatBalance(balance)}</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icons.Spark size={24} className="text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">Sparks Balance</h3>
        </div>
        {showActions && (
          <button
            onClick={onPurchase}
            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg text-sm transition-colors"
          >
            Buy Sparks
          </button>
        )}
      </div>
      
      <div className="text-center py-4">
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          {balance.toLocaleString()}
        </div>
        <p className="text-gray-400 text-sm mt-1">Available Sparks</p>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Monthly Allocation</span>
            <span className="text-white">1,500</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Purchased</span>
            <span className="text-white">500</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Bonus</span>
            <span className="text-green-500">+250</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparksDisplay;
