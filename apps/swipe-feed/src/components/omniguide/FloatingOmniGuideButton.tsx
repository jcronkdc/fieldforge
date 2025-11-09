/**
 * Floating OmniGuide Button - Always visible AI assistant trigger
 */

import React from 'react';
import { Icons } from '../icons/Icons';
import { useOmniGuide } from '../../context/OmniGuideContext';

export const FloatingOmniGuideButton: React.FC = () => {
  const { isOpen, toggleOmniGuide } = useOmniGuide();
  
  // Don't show the button if OmniGuide is already open
  if (isOpen) return null;
  
  return (
    <button
      onClick={toggleOmniGuide}
      className="fixed bottom-6 right-6 z-50 group floating-omniguide-button floating-elements"
      title="Open OmniGuide AI Assistant (Cmd/Ctrl + K)"
    >
      {/* Pulse animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 animate-pulse"></div>
      
      {/* Button */}
      <div className="relative w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)] group-hover:shadow-[0_0_40px_rgba(147,51,234,0.7)] transition-all transform group-hover:scale-110">
        <Icons.AIAssistant size={28} className="text-white" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg whitespace-nowrap border border-purple-500/30">
          AI Assistant
        </div>
      </div>
    </button>
  );
};
