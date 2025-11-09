import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';

export const BetaBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-purple-900/95 backdrop-blur-lg border-b border-purple-500/30 shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-sm font-bold text-white bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                BETA
              </span>
            </div>
            
            <p className="text-sm text-purple-100">
              Welcome to MythaTron Beta! You're among the first to experience our creative platform.
            </p>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <div>
                  <p className="text-purple-100 font-semibold">What's Working:</p>
                  <p className="text-purple-200">Core features, Angry Lips, Messaging, Feed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">⚡</span>
                <div>
                  <p className="text-purple-100 font-semibold">Coming Soon:</p>
                  <p className="text-purple-200">MythaQuest RPG, Marketplace, Advanced AI</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-purple-100 font-semibold">Found a bug?</p>
                  <p className="text-purple-200">Use the feedback widget in the corner!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
