/**
 * Report Content Modal
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'user' | 'comment' | 'session';
  contentId: string;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or misleading' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'hate', label: 'Hate speech or discrimination' },
  { id: 'violence', label: 'Violence or dangerous content' },
  { id: 'sexual', label: 'Sexual or adult content' },
  { id: 'copyright', label: 'Copyright violation' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' },
];

export function ReportModal({ isOpen, onClose, contentType, contentId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save report locally for now
    const report = {
      id: `report-${Date.now()}`,
      contentType,
      contentId,
      reason: selectedReason,
      details,
      timestamp: new Date().toISOString(),
    };
    
    const existingReports = JSON.parse(localStorage.getItem('mythatron_reports') || '[]');
    localStorage.setItem('mythatron_reports', JSON.stringify([...existingReports, report]));
    
    setSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setSelectedReason('');
      setDetails('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-white">Report {contentType}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/60 mt-2">
            Help us understand what's wrong with this {contentType}
          </p>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Thank you for reporting</h3>
            <p className="text-sm text-white/60">
              We'll review this {contentType} and take appropriate action
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {/* Reason Selection */}
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-purple-500 bg-white/10 border-white/20"
                    />
                    <span className="text-sm text-white/80">{reason.label}</span>
                  </label>
                ))}
              </div>

              {/* Additional Details */}
              {selectedReason && (
                <div className="space-y-2">
                  <label className="text-sm text-white/60">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide more context about this report..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 focus:outline-none resize-none h-24"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || submitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
