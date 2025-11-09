/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Non-obtrusive feedback widget for user suggestions and bug reports
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { apiRequest } from "../../lib/api";

interface FeedbackWidgetProps {
  pageContext?: string;
}

export function FeedbackWidget({ pageContext }: FeedbackWidgetProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'idea'>('suggestion');
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Auto-hide after 5 seconds of inactivity
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, content]);

  async function submitFeedback() {
    if (!content.trim()) return;

    setSending(true);
    setMessage("");

    try {
      await apiRequest("/api/feedback/submit", {
        method: "POST",
        body: JSON.stringify({
          feedbackType,
          subject: subject || `${feedbackType} from ${pageContext || 'app'}`,
          content,
          pageContext: pageContext || window.location.hash,
          username: profile?.username || user?.email || 'Anonymous'
        })
      });

      setMessage("✅ Thank you for your feedback!");
      setContent("");
      setSubject("");
      
      setTimeout(() => {
        setIsOpen(false);
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setMessage("❌ Failed to send feedback");
    } finally {
      setSending(false);
    }
  }

  // Don't show if user hasn't been on the page for at least 10 seconds
  const [canShow, setCanShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setCanShow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!canShow) return null;

  return (
    <>
      {/* Floating Button - Non-obtrusive, bottom-right corner */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-purple-600/90 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-40"
          title="Send feedback"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl transition-all z-50 ${
          isMinimized ? 'w-64' : 'w-96'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <h3 className="font-semibold text-sm">Quick Feedback</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 rounded p-1"
              >
                {isMinimized ? '⬆' : '⬇'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-4 space-y-3">
              {/* Type Selection */}
              <div className="flex gap-2">
                {[
                  { value: 'suggestion' as const, label: '💡 Idea', color: 'blue' },
                  { value: 'bug' as const, label: '🐛 Bug', color: 'red' },
                  { value: 'idea' as const, label: '✨ Feature', color: 'green' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all ${
                      feedbackType === type.value
                        ? `bg-${type.color}-100 text-${type.color}-700 border-2 border-${type.color}-300`
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Subject (Optional) */}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />

              {/* Content */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  feedbackType === 'bug' 
                    ? "Describe the bug you encountered..."
                    : feedbackType === 'suggestion'
                    ? "Share your suggestion..."
                    : "What feature would you like to see?"
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 resize-none"
                rows={3}
              />

              {/* Message */}
              {message && (
                <div className={`text-xs text-center py-1 ${
                  message.includes('✅') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={submitFeedback}
                disabled={sending || !content.trim()}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                  sending || !content.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {sending ? 'Sending...' : 'Send Feedback'}
              </button>

              {/* Privacy Note */}
              <p className="text-xs text-gray-500 text-center">
                Your feedback helps improve MythaTron
              </p>
            </div>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-2 text-xs text-gray-600 text-center">
              Click ⬆ to expand
            </div>
          )}
        </div>
      )}
    </>
  );
}
