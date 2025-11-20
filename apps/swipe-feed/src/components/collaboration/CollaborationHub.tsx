import React, { useState } from 'react';
import { TeamMessaging } from '../messaging/TeamMessaging';
import { ProjectCollaboration } from './ProjectCollaboration';
import { useAuthContext } from '../auth/AuthProvider';

/**
 * CollaborationHub - Unified interface for team collaboration
 * 
 * Combines:
 * - Real-time messaging (invite-only groups)
 * - Video collaboration with Daily.co
 * - Cursor control for co-working
 * - Screen sharing
 * 
 * Human Test: Can users easily switch between messaging and video?
 *              Is the invite-only concept clear?
 */

interface CollaborationHubProps {
  projectId?: string;
  conversationId?: string;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({ 
  projectId, 
  conversationId 
}) => {
  const { session, loading, isAuthenticated } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'chat' | 'video'>('chat');

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="collaboration-hub-loading">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading collaboration...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !session?.user?.id) {
    return (
      <div className="collaboration-hub-unauthorized">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔒</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You must be logged in to access collaboration features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="collaboration-hub">
      {/* Tab Navigation */}
      <div className="collaboration-tabs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <span className="tab-icon">💬</span>
          <span className="tab-label">Team Chat</span>
          <span className="tab-badge">Invite-Only</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
        >
          <span className="tab-icon">🎥</span>
          <span className="tab-label">Video Collab</span>
          <span className="tab-badge">Cursor Control</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="collaboration-content">
        {activeTab === 'chat' && (
          <div className="tab-panel fade-in">
            <div className="panel-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                💬 Team Messaging
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Invite-only groups • Real-time sync • Emergency alerts
              </p>
            </div>
            <TeamMessaging onStartVideoCall={() => setActiveTab('video')} />
          </div>
        )}

        {activeTab === 'video' && (
          <div className="tab-panel fade-in">
            <div className="panel-header mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                🎥 Video Collaboration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Screen sharing • Cursor control • Recording • Invite-only rooms
              </p>
            </div>
            <ProjectCollaboration 
              projectId={projectId || 'default'}
              conversationId={conversationId}
            />
          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="collaboration-features">
        <div className="feature-card">
          <span className="feature-icon">🔒</span>
          <h4 className="feature-title">Invite-Only</h4>
          <p className="feature-description">
            Only admins can add members to groups and video rooms
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🖱️</span>
          <h4 className="feature-title">Cursor Control</h4>
          <p className="feature-description">
            Share and control cursors for real-time co-working
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h4 className="feature-title">Real-Time</h4>
          <p className="feature-description">
            Powered by Ably + Daily.co for instant sync
          </p>
        </div>
      </div>

      <style>{`
        .collaboration-hub {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .dark .collaboration-hub {
          background: linear-gradient(135deg, #1e293b 0%, #312e81 100%);
        }

        .collaboration-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dark .collaboration-tabs {
          background: #1f2937;
        }

        .tab-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px 12px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
        }

        .dark .tab-button:hover {
          background: #374151;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }

        .tab-button.active .tab-icon,
        .tab-button.active .tab-label,
        .tab-button.active .tab-badge {
          color: white;
        }

        .tab-icon {
          font-size: 24px;
        }

        .tab-label {
          font-weight: 600;
          font-size: 14px;
          color: #374151;
        }

        .dark .tab-label {
          color: #d1d5db;
        }

        .tab-badge {
          font-size: 10px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dark .tab-badge {
          color: #9ca3af;
        }

        .collaboration-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          min-height: 500px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dark .collaboration-content {
          background: #1f2937;
        }

        .tab-panel {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .panel-header {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .dark .panel-header {
          border-bottom-color: #374151;
        }

        .collaboration-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .feature-card {
          background: white;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .dark .feature-card {
          background: #1f2937;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }

        .feature-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .dark .feature-title {
          color: #f9fafb;
        }

        .feature-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .dark .feature-description {
          color: #9ca3af;
        }

        .collaboration-hub-unauthorized {
          background: white;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .dark .collaboration-hub-unauthorized {
          background: #1f2937;
        }

        .collaboration-hub-loading {
          background: white;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .dark .collaboration-hub-loading {
          background: #1f2937;
        }

        @media (max-width: 768px) {
          .collaboration-tabs {
            flex-direction: column;
          }

          .collaboration-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CollaborationHub;

