import React from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-slide-down">
      <WifiOff className="w-5 h-5" />
      <span className="font-medium">Offline Mode - Changes will sync when connected</span>
    </div>
  );
};
