import React, { useState, useEffect, useRef } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface CollaborationRoom {
  id: string;
  roomName: string;
  url: string;
  projectId: string;
  conversationId?: string;
  createdBy: string;
  settings: {
    enableCursorControl: boolean;
    enableScreenShare: boolean;
    enableRecording: boolean;
    maxParticipants: number;
  };
}

interface ProjectCollaborationProps {
  projectId: string;
  conversationId?: string;
  onClose?: () => void;
}

export const ProjectCollaboration: React.FC<ProjectCollaborationProps> = ({ 
  projectId, 
  conversationId,
  onClose 
}) => {
  const { session } = useAuth();
  const [room, setRoom] = useState<CollaborationRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const callFrameRef = useRef<HTMLDivElement>(null);

  // Create a new collaboration room
  const createRoom = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a collaboration room');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/collaboration/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          conversationId,
          createdBy: session.user.id,
          roomName: `Project ${projectId} Collaboration`,
          privacy: 'private' // Invite-only
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create collaboration room');
      }

      const data = await response.json();
      setRoom(data.room);
      toast.success('Collaboration room created!');
      
      // Join the room after creating
      await joinRoom(data.room.dailyRoomUrl, data.room.id);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create collaboration room');
    } finally {
      setLoading(false);
    }
  };

  // Join a collaboration room
  const joinRoom = async (roomUrl: string, roomId: string) => {
    try {
      // Get a meeting token for secure access
      const tokenResponse = await fetch(`/api/collaboration/rooms/${roomId}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          userName: session?.user?.user_metadata?.full_name || session?.user?.email || 'Guest',
          permissions: {
            canScreenShare: true,
            canRecord: false,
            isOwner: room?.createdBy === session?.user?.id
          }
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get meeting token');
      }

      const { token } = await tokenResponse.json();

      // Create Daily call object
      const daily = DailyIframe.createFrame(callFrameRef.current!, {
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '600px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        }
      });

      // Event listeners
      daily.on('joined-meeting', () => {
        console.log('[collaboration] Joined meeting');
        setIsInCall(true);
        toast.success('Joined collaboration room');
      });

      daily.on('left-meeting', () => {
        console.log('[collaboration] Left meeting');
        setIsInCall(false);
        toast('Left collaboration room');
      });

      daily.on('participant-joined', (event: any) => {
        console.log('[collaboration] Participant joined:', event.participant);
        updateParticipants(daily);
        toast(`${event.participant.user_name || 'Someone'} joined the call`);
      });

      daily.on('participant-left', (event: any) => {
        console.log('[collaboration] Participant left:', event.participant);
        updateParticipants(daily);
      });

      daily.on('error', (event: any) => {
        console.error('[collaboration] Daily error:', event);
        toast.error('Video call error');
      });

      // Join the call
      await daily.join({ url: roomUrl, token });
      setCallObject(daily);
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('Failed to join collaboration room');
    }
  };

  // Update participants list
  const updateParticipants = (daily: DailyCall) => {
    const participantsList = Object.values(daily.participants());
    setParticipants(participantsList);
  };

  // Leave the call
  const leaveCall = async () => {
    if (callObject) {
      await callObject.leave();
      await callObject.destroy();
      setCallObject(null);
      setIsInCall(false);
      setParticipants([]);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObject) {
        callObject.destroy();
      }
    };
  }, [callObject]);

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!callObject) return;

    try {
      const { screen } = callObject.localParticipant().tracks;
      if (screen.state === 'playable') {
        await callObject.stopScreenShare();
        toast('Screen sharing stopped');
      } else {
        await callObject.startScreenShare();
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast.error('Failed to toggle screen share');
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (!callObject) return;

    try {
      const isRecording = callObject.isRecording();
      if (isRecording) {
        await callObject.stopRecording();
        toast('Recording stopped');
      } else {
        await callObject.startRecording();
        toast.success('Recording started');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to toggle recording');
    }
  };

  return (
    <div className="collaboration-container">
      <div className="collaboration-header">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🎥 Project Collaboration
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      <div className="collaboration-content">
        {!room && !loading && (
          <div className="text-center py-12">
            <div className="mb-6">
              <span className="text-6xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Start Collaborating
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a video room to collaborate with your team in real-time.
              Share your screen, control cursors, and work together seamlessly.
            </p>
            <button
              onClick={createRoom}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Room...' : 'Create Collaboration Room'}
            </button>
          </div>
        )}

        {room && (
          <>
            <div className="video-container" ref={callFrameRef}></div>

            {isInCall && (
              <div className="collaboration-controls mt-4">
                <div className="flex items-center justify-between">
                  <div className="participants-list">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      👥 {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="control-buttons flex gap-2">
                    <button
                      onClick={toggleScreenShare}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      🖥️ Share Screen
                    </button>
                    
                    {room?.createdBy === session?.user?.id && (
                      <button
                        onClick={toggleRecording}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                      >
                        ⏺️ Record
                      </button>
                    )}

                    <button
                      onClick={leaveCall}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      📞 Leave Call
                    </button>
                  </div>
                </div>

                {/* Cursor Control Info */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Cursor Control:</strong> When you share your screen, 
                    participants can request cursor control to help you navigate and edit together.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .collaboration-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .dark .collaboration-container {
          background: #1f2937;
        }

        .collaboration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .dark .collaboration-header {
          border-bottom-color: #374151;
        }

        .collaboration-content {
          min-height: 400px;
        }

        .video-container {
          width: 100%;
          min-height: 600px;
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectCollaboration;

