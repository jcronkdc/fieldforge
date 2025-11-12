import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const FullPageLoader: React.FC<{ message?: string }> = ({ message = "Loading MythaTron" }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <Sparkles className="w-16 h-16 text-purple-400 animate-pulse mx-auto" />
        <Loader2 className="w-8 h-8 text-purple-300 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="mt-4 text-purple-200 animate-pulse">{message}</p>
    </div>
  </div>
);

export const InlineLoader: React.FC<{ message?: string }> = ({ message = "Loading" }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
    <span className="text-purple-200">{message}</span>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-32 mb-1" />
        <div className="h-3 bg-gray-700 rounded w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-700 rounded w-4/5" />
      <div className="h-4 bg-gray-700 rounded w-3/5" />
    </div>
  </div>
);

export const ButtonLoader: React.FC = () => (
  <Loader2 className="w-4 h-4 animate-spin" />
);
