import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

export const SyncStatus: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    // Simulate periodic syncing
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => {
        setSyncing(false);
        setLastSync(new Date());
      }, 2000);
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 flex items-center space-x-2">
      {syncing ? (
        <>
          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-400">Syncing</span>
        </>
      ) : (
        <>
          <Cloud className="w-4 h-4 text-green-500" />
          <span className="text-xs text-slate-400">
            Synced {Math.round((Date.now() - lastSync.getTime()) / 60000)}m ago
          </span>
        </>
      )}
    </div>
  );
};
