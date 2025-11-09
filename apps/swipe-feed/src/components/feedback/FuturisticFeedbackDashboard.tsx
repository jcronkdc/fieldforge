/**
 * FUTURISTIC FEEDBACK DASHBOARD - Admin Feedback Center
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface FeedbackItem {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  message: string;
  userId: string;
  view: string;
  timestamp: number;
  context?: any;
}

interface Props {
  onNavigate: (view: FocusedView) => void;
}

export const FuturisticFeedbackDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature' | 'improvement' | 'general'>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Load feedback from localStorage
    const stored = localStorage.getItem('omniguide_feedback');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        // Sort by timestamp, newest first
        setFeedback(items.sort((a: FeedbackItem, b: FeedbackItem) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error('Failed to load feedback');
      }
    }
  }, []);

  const filteredFeedback = filter === 'all' 
    ? feedback 
    : feedback.filter(item => item.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'red';
      case 'feature': return 'purple';
      case 'improvement': return 'blue';
      case 'general': return 'cyan';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'improvement': return '🚀';
      case 'general': return '💬';
      default: return '📝';
    }
  };

  const exportFeedback = () => {
    const dataStr = JSON.stringify(filteredFeedback, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `feedback-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowExportModal(false);
  };

  const clearFeedback = () => {
    if (confirm('Are you sure you want to clear all feedback? This cannot be undone.')) {
      localStorage.removeItem('omniguide_feedback');
      setFeedback([]);
    }
  };

  const stats = {
    total: feedback.length,
    bugs: feedback.filter(f => f.type === 'bug').length,
    features: feedback.filter(f => f.type === 'feature').length,
    improvements: feedback.filter(f => f.type === 'improvement').length,
    general: feedback.filter(f => f.type === 'general').length
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                FEEDBACK CENTRAL
              </h1>
              <p className="text-sm text-cyan-500/60 uppercase tracking-widest">
                USER INSIGHTS & REPORTS
              </p>
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-900/50 to-black border border-gray-700 rounded-xl p-6">
            <div className="text-3xl font-black text-white mb-2">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">TOTAL FEEDBACK</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/30 rounded-xl p-6">
            <div className="text-3xl font-black text-red-400 mb-2">{stats.bugs}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">BUG REPORTS</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-black border border-purple-500/30 rounded-xl p-6">
            <div className="text-3xl font-black text-purple-400 mb-2">{stats.features}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">FEATURE REQUESTS</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-black border border-blue-500/30 rounded-xl p-6">
            <div className="text-3xl font-black text-blue-400 mb-2">{stats.improvements}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">IMPROVEMENTS</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 to-black border border-cyan-500/30 rounded-xl p-6">
            <div className="text-3xl font-black text-cyan-400 mb-2">{stats.general}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">GENERAL</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'bug', 'feature', 'improvement', 'general'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  filter === type
                    ? `bg-gradient-to-r from-${getTypeColor(type)}-500/20 to-${getTypeColor(type)}-500/10 border border-${getTypeColor(type)}-400 text-${getTypeColor(type)}-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]`
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                {type === 'all' ? 'ALL' : getTypeIcon(type)} {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-green-400 font-bold uppercase tracking-wider text-xs hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
            >
              📥 EXPORT
            </button>
            <button
              onClick={clearFeedback}
              className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg text-red-400 font-bold uppercase tracking-wider text-xs hover:from-red-500/30 hover:to-orange-500/30 transition-all"
            >
              🗑️ CLEAR ALL
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <div className="bg-black/60 border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-black text-gray-400 mb-2">NO FEEDBACK YET</h3>
              <p className="text-sm text-gray-600 uppercase tracking-widest">
                Feedback will appear here when users submit it through OmniGuide
              </p>
            </div>
          ) : (
            filteredFeedback.map((item, idx) => (
              <div 
                key={idx}
                className={`bg-black/60 border border-${getTypeColor(item.type)}-500/20 rounded-xl p-6 hover:border-${getTypeColor(item.type)}-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <span className={`px-3 py-1 bg-${getTypeColor(item.type)}-500/20 border border-${getTypeColor(item.type)}-500/30 rounded-sm text-xs font-black uppercase tracking-wider text-${getTypeColor(item.type)}-400`}>
                        {item.type}
                      </span>
                      <span className="ml-3 text-xs text-gray-500 uppercase tracking-widest">
                        FROM: {item.userId} • VIEW: {item.view}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
                  <p className="text-gray-300">{item.message}</p>
                </div>

                {item.context && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-gray-500 uppercase tracking-widest hover:text-cyan-400 transition-colors">
                      VIEW CONTEXT
                    </summary>
                    <pre className="mt-2 p-3 bg-black/40 border border-gray-800 rounded-lg text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(item.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <h3 className="text-2xl font-black text-cyan-400 mb-4">EXPORT FEEDBACK</h3>
            <p className="text-gray-400 mb-6">
              Export {filteredFeedback.length} {filter === 'all' ? '' : filter} feedback items as JSON
            </p>
            
            <div className="space-y-3">
              <button
                onClick={exportFeedback}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
              >
                📥 DOWNLOAD JSON
              </button>
              
              <button
                onClick={() => {
                  const emailBody = encodeURIComponent(JSON.stringify(filteredFeedback, null, 2));
                  window.location.href = `mailto:jwcronk82@gmail.com?subject=MythaTron Feedback Export&body=${emailBody}`;
                  setShowExportModal(false);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all"
              >
                📧 EMAIL TO YOU
              </button>
              
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full px-6 py-3 bg-black border border-gray-700 rounded-lg text-gray-400 font-bold uppercase tracking-wider hover:border-gray-600 hover:text-white transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturisticFeedbackDashboard;
