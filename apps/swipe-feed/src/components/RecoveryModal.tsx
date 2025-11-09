import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Download, CheckCircle } from 'lucide-react';
import { SafeStorage } from '../utils/storageUtils';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSoftReset = async () => {
    setIsProcessing(true);
    setStatus('Clearing corrupted data...');
    
    try {
      // Clear only corrupted data
      SafeStorage.clearCorruptedData(localStorage);
      SafeStorage.clearCorruptedData(sessionStorage);
      
      setStatus('✅ Corrupted data cleared! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setStatus('❌ Error during soft reset');
      console.error('Soft reset error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleHardReset = async () => {
    if (!confirm('This will sign you out and clear all local data. Continue?')) {
      return;
    }
    
    setIsProcessing(true);
    setStatus('Clearing all app data...');
    
    try {
      // Clear everything
      SafeStorage.clearAppData();
      
      setStatus('✅ All data cleared! Redirecting to homepage...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      setStatus('❌ Error during hard reset');
      console.error('Hard reset error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleExportData = () => {
    try {
      const data = SafeStorage.exportStorageData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mythatron-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('✅ Data exported successfully');
    } catch (error) {
      setStatus('❌ Error exporting data');
      console.error('Export error:', error);
    }
  };
  
  const storageInfo = SafeStorage.getStorageInfo();
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl border border-purple-500/30 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recovery Options</h2>
              <p className="text-sm text-gray-300">Fix app issues without losing your account</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Storage Info */}
            <div className="p-3 bg-black/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Storage Status</p>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Local Storage: {(storageInfo.localStorageUsed / 1024).toFixed(1)} KB</div>
                <div>Session Storage: {(storageInfo.sessionStorageUsed / 1024).toFixed(1)} KB</div>
                <div>Total Keys: {storageInfo.totalKeys}</div>
              </div>
            </div>
            
            {/* Recovery Options */}
            <div className="space-y-3">
              {/* Soft Reset */}
              <button
                onClick={handleSoftReset}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Soft Reset</div>
                  <div className="text-sm text-gray-300">Clear corrupted data only (keeps you signed in)</div>
                </div>
              </button>
              
              {/* Hard Reset */}
              <button
                onClick={handleHardReset}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Hard Reset</div>
                  <div className="text-sm text-gray-300">Clear all data and sign out</div>
                </div>
              </button>
              
              {/* Export Debug Data */}
              <button
                onClick={handleExportData}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Export Debug Data</div>
                  <div className="text-sm text-gray-300">Download storage data for support</div>
                </div>
              </button>
            </div>
            
            {/* Status Message */}
            {status && (
              <div className="p-3 bg-black/40 rounded-lg">
                <p className="text-sm text-center text-white">{status}</p>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-3 bg-gray-700/50 hover:bg-gray-700/70 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
