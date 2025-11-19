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
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);
  const callFrameRef = useRef<HTMLDivElement>(null);

  // Load available rooms for this project (MF-39: Room Discovery)
  const loadAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await fetch(`/api/collaboration/projects/${projectId}/rooms`);
      if (!response.ok) {
        throw new Error('Failed to load rooms');
      }
      const data = await response.json();
      setAvailableRooms(data.rooms || []);
    } catch (error) {
      console.error('Failed to load available rooms:', error);
      toast.error('Could not load available rooms');
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Load rooms on mount
  useEffect(() => {
    if (projectId) {
      loadAvailableRooms();
    }
  }, [projectId]);

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
        {!room && !loading && !showRoomBrowser && (
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
            <div className="flex gap-4 justify-center">
              <button
                onClick={createRoom}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating Room...' : 'Create New Room'}
              </button>
              {availableRooms.length > 0 && (
                <button
                  onClick={() => setShowRoomBrowser(true)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Browse {availableRooms.length} Active Room{availableRooms.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* MF-39: Room Discovery UI - Browse all project rooms before joining */}
        {showRoomBrowser && !room && (
          <div className="room-browser">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  🏠 Available Collaboration Rooms
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {availableRooms.length} active room{availableRooms.length !== 1 ? 's' : ''} in this project
                </p>
              </div>
              <button
                onClick={() => setShowRoomBrowser(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Back
              </button>
            </div>

            {loadingRooms ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-600 dark:text-gray-400">No active rooms in this project</p>
                <button
                  onClick={() => {
                    setShowRoomBrowser(false);
                    createRoom();
                  }}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Room
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRooms.map((availableRoom: any) => {
                  const createdAt = new Date(availableRoom.createdAt);
                  const participantCount = availableRoom.participants?.length || 0;
                  const isHost = availableRoom.createdBy === session?.user?.id;
                  
                  return (
                    <div 
                      key={availableRoom.id} 
                      className="room-card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {availableRoom.roomName || 'Collaboration Room'}
                            </h4>
                            {isHost && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                Host
                              </span>
                            )}
                            {availableRoom.status === 'active' && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                              <span>👥</span>
                              <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>Created {createdAt.toLocaleTimeString()}</span>
                            </div>
                          </div>

                          {availableRoom.settings && (
                            <div className="flex gap-2 text-xs">
                              {availableRoom.settings.enableCursorControl && (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                  🖱️ Cursor Control
                                </span>
                              )}
                              {availableRoom.settings.enableScreenShare && (
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                                  🖥️ Screen Share
                                </span>
                              )}
                              {availableRoom.settings.enableRecording && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                                  ⏺️ Recording
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setRoom(availableRoom);
                            setShowRoomBrowser(false);
                            joinRoom(availableRoom.dailyRoomUrl, availableRoom.id);
                          }}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          Join Room →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                🔒 <strong>Invite-Only:</strong> You can see all rooms for transparency, but only project members with permissions can join.
                Room hosts control who can participate.
              </p>
            </div>
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

        .room-browser {
          animation: fadeIn 0.3s ease-in;
        }

        .room-card {
          transition: all 0.2s ease;
        }

        .room-card:hover {
          transform: translateY(-2px);
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
      `}</style>
    </div>
  );
};

export default ProjectCollaboration;


