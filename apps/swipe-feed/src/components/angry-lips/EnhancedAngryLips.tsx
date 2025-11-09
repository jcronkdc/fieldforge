/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Enhanced Angry Lips with Timer, Personalization, and Social Features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GlassCard, 
  NeonButton, 
  HoloBadge,
  LoadingSpinner,
  Toast,
  AnimatedCounter,
  SparkleText,
  ProgressBar
} from '../ui/ModernUI';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import './EnhancedAngryLips.css';

interface Participant {
  id: string;
  name: string;
  avatar_url?: string;
  is_ready: boolean;
  response?: string;
}

interface EnhancedAngryLipsProps {
  sessionId: string;
  onClose?: () => void;
  onComplete?: (finalStory: string) => void;
}

export const EnhancedAngryLips: React.FC<EnhancedAngryLipsProps> = ({
  sessionId,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Session state
  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [template, setTemplate] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [finalStory, setFinalStory] = useState('');
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [allReady, setAllReady] = useState(false);
  
  // Features state
  const [usePersonalization, setUsePersonalization] = useState(false);
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showConvertMenu, setShowConvertMenu] = useState(false);
  const [converting, setConverting] = useState(false);
  const [redoCount, setRedoCount] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadSession();
    setupRealtimeSubscription();
    
    return () => {
      cleanupRecording();
    };
  }, [sessionId]);

  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimerExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [timerActive, timerSeconds]);

  const loadSession = async () => {
    try {
      const data = await apiRequest(`/api/angry-lips/session/${sessionId}`);
      setSession(data);
      setParticipants(data.participants || []);
      setTemplate(data.template);
      setResponses(data.responses || []);
      setCurrentTurn(data.current_turn || 0);
      setUsePersonalization(data.use_personalization || false);
      setParticipantNames(data.participant_names || []);
      setRedoCount(data.redo_count || 0);
      
      // Check ready states
      checkAllParticipantsReady();
    } catch (error) {
      console.error('Failed to load session:', error);
      setToast({ message: 'Failed to load session', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to Ably/Supabase realtime updates
    // This would listen for:
    // - Participant ready state changes
    // - New responses
    // - Timer updates
    // - Session status changes
  };

  const checkAllParticipantsReady = async () => {
    try {
      const response = await apiRequest(`/api/angry-lips/session/${sessionId}/ready-check`);
      setAllReady(response.allReady);
      
      if (response.allReady && !timerActive) {
        setToast({ message: 'All players ready! Click START to begin!', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to check ready status:', error);
    }
  };

  const handleReady = async () => {
    try {
      await apiRequest(`/api/angry-lips/session/${sessionId}/ready`, {
        method: 'POST',
        body: { participantId: user?.id }
      });
      
      // Update local state
      setParticipants(prev => prev.map(p => 
        p.id === user?.id ? { ...p, is_ready: true } : p
      ));
      
      checkAllParticipantsReady();
    } catch (error) {
      console.error('Failed to mark as ready:', error);
      setToast({ message: 'Failed to update ready status', type: 'error' });
    }
  };

  const handleStartSession = async () => {
    if (!allReady) {
      setToast({ message: 'Waiting for all players to be ready', type: 'info' });
      return;
    }
    
    try {
      await apiRequest(`/api/angry-lips/session/${sessionId}/start`, {
        method: 'POST',
        body: { timerSeconds }
      });
      
      setTimerActive(true);
      setToast({ message: 'Session started! Timer is running!', type: 'success' });
      
      // Send notifications to all participants
      sendTurnNotification();
    } catch (error) {
      console.error('Failed to start session:', error);
      setToast({ message: 'Failed to start session', type: 'error' });
    }
  };

  const handleTimerExpired = () => {
    setToast({ message: "Time's up! Moving to next turn...", type: 'info' });
    // Auto-submit current response or skip turn
    handleSubmitResponse('');
  };

  const handleSubmitResponse = async (response: string) => {
    try {
      await apiRequest(`/api/angry-lips/session/${sessionId}/response`, {
        method: 'POST',
        body: { 
          turnIndex: currentTurn,
          response: response || '[SKIPPED]'
        }
      });
      
      setResponses(prev => [...prev, response || '[SKIPPED]']);
      setCurrentTurn(prev => prev + 1);
      
      // Reset timer for next turn
      if (currentTurn < template.split('[').length - 1) {
        setTimerSeconds(300);
        setTimerActive(true);
        sendTurnNotification();
      } else {
        // Session complete
        handleSessionComplete();
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
      setToast({ message: 'Failed to submit response', type: 'error' });
    }
  };

  const handleSessionComplete = async () => {
    setTimerActive(false);
    
    try {
      // Generate final story with AI personalization
      const result = await apiRequest(`/api/angry-lips/session/${sessionId}/complete`, {
        method: 'POST',
        body: {
          usePersonalization,
          participantNames
        }
      });
      
      setFinalStory(result.finalStory);
      onComplete?.(result.finalStory);
      
      setToast({ message: '🎉 Story complete! Great job everyone!', type: 'success' });
      
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      setToast({ message: 'Failed to complete session', type: 'error' });
    }
  };

  const handleRedo = async () => {
    if (redoCount >= 3) {
      setToast({ message: 'Maximum redo limit reached', type: 'error' });
      return;
    }
    
    try {
      await apiRequest(`/api/angry-lips/session/${sessionId}/redo`, {
        method: 'POST'
      });
      
      // Reset session state
      setResponses([]);
      setCurrentTurn(0);
      setFinalStory('');
      setTimerSeconds(300);
      setTimerActive(false);
      setRedoCount(prev => prev + 1);
      
      // Reset all ready states
      setParticipants(prev => prev.map(p => ({ ...p, is_ready: false })));
      setAllReady(false);
      
      setToast({ message: 'Session reset! Get ready to play again!', type: 'success' });
    } catch (error) {
      console.error('Failed to redo session:', error);
      setToast({ message: 'Failed to reset session', type: 'error' });
    }
  };

  const handleConvert = async (type: string) => {
    setConverting(true);
    
    try {
      const result = await apiRequest(`/api/angry-lips/session/${sessionId}/convert`, {
        method: 'POST',
        body: { 
          conversionType: type,
          content: finalStory
        }
      });
      
      setToast({ message: `Successfully converted to ${type}!`, type: 'success' });
      
      // Open converted content in new modal or download
      downloadContent(result.convertedContent, `angry-lips-${type}.txt`);
    } catch (error) {
      console.error('Failed to convert:', error);
      setToast({ message: `Failed to convert to ${type}`, type: 'error' });
    } finally {
      setConverting(false);
      setShowConvertMenu(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        uploadRecording(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      setToast({ message: '🎬 Recording started!', type: 'success' });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setToast({ message: 'Failed to access camera/microphone', type: 'error' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setToast({ message: '🎬 Recording stopped! Processing...', type: 'info' });
    }
  };

  const uploadRecording = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('video', blob, `angry-lips-${sessionId}.webm`);
    formData.append('sessionId', sessionId);
    
    try {
      const result = await apiRequest('/api/angry-lips/upload-recording', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
      
      setToast({ message: '🎉 Recording saved! Ready to share!', type: 'success' });
      
      // Show sharing options
      showSharingOptions(result.videoUrl);
    } catch (error) {
      console.error('Failed to upload recording:', error);
      setToast({ message: 'Failed to save recording', type: 'error' });
    }
  };

  const showSharingOptions = (videoUrl: string) => {
    // Show modal with sharing options for YouTube, TikTok, Instagram, etc.
    const shareText = `Check out our hilarious Angry Lips story! 😂 #MythaTron #AngryLips`;
    
    // Open share dialog or copy link
    if (navigator.share) {
      navigator.share({
        title: 'Angry Lips Story',
        text: shareText,
        url: videoUrl
      });
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(videoUrl);
      setToast({ message: 'Video link copied to clipboard!', type: 'success' });
    }
  };

  const sendTurnNotification = () => {
    // Send push notification to current player
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Your turn in Angry Lips!', {
        body: `It's your turn to add to the story! Timer: ${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`,
        icon: '/angry-lips-icon.png',
        tag: 'angry-lips-turn',
        requireInteraction: true
      });
    }
  };

  const cleanupRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading Angry Lips session..." />;
  }

  return (
    <div className="enhanced-angry-lips">
      {/* Header */}
      <div className="angry-lips-header">
        <SparkleText size="xl">🎭 Angry Lips</SparkleText>
        {redoCount > 0 && <HoloBadge text={`REDO ${redoCount}/3`} type="beta" />}
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Timer Display */}
      {timerActive && (
        <div className="timer-display">
          <div className={`timer-circle ${timerSeconds < 60 ? 'timer-urgent' : ''}`}>
            <AnimatedCounter 
              value={timerSeconds} 
              duration={0}
            />
          </div>
          <div className="timer-label">Time Remaining</div>
          <ProgressBar 
            progress={(timerSeconds / 300) * 100}
            color={timerSeconds < 60 ? 'gold' : 'green'}
            animated
            showPercentage={false}
          />
        </div>
      )}

      {/* Participants Ready Status */}
      <GlassCard className="participants-card">
        <h3>Players ({participants.filter(p => p.is_ready).length}/{participants.length} Ready)</h3>
        <div className="participants-grid">
          {participants.map((participant) => (
            <div key={participant.id} className={`participant-item ${participant.is_ready ? 'ready' : ''}`}>
              <img 
                src={participant.avatar_url || '/default-avatar.png'} 
                alt={participant.name}
                className="participant-avatar"
              />
              <span className="participant-name">{participant.name}</span>
              {participant.is_ready && <span className="ready-check">✓</span>}
            </div>
          ))}
        </div>
        
        {!allReady && (
          <NeonButton 
            color="green" 
            onClick={handleReady}
            disabled={participants.find(p => p.id === user?.id)?.is_ready}
          >
            {participants.find(p => p.id === user?.id)?.is_ready ? 'Waiting for others...' : "I'm Ready!"}
          </NeonButton>
        )}
        
        {allReady && !timerActive && currentTurn === 0 && (
          <NeonButton 
            color="purple" 
            size="lg"
            onClick={handleStartSession}
            pulse
          >
            🚀 START GAME
          </NeonButton>
        )}
      </GlassCard>

      {/* Personalization Settings */}
      <GlassCard className="personalization-card">
        <label className="toggle-label">
          <input 
            type="checkbox"
            checked={usePersonalization}
            onChange={(e) => setUsePersonalization(e.target.checked)}
            disabled={timerActive}
          />
          <span>Use AI Personalization (includes player names in story)</span>
        </label>
        
        {usePersonalization && (
          <div className="names-input">
            <input 
              type="text"
              placeholder="Enter participant names (comma separated)"
              value={participantNames.join(', ')}
              onChange={(e) => setParticipantNames(e.target.value.split(',').map(n => n.trim()))}
              disabled={timerActive}
            />
          </div>
        )}
      </GlassCard>

      {/* Current Turn Display */}
      {timerActive && (
        <GlassCard className="current-turn-card">
          <h2>Current Blank #{currentTurn + 1}</h2>
          <div className="blank-prompt">
            Fill in: <strong>{getBlankType(currentTurn)}</strong>
          </div>
          <input 
            type="text"
            className="response-input"
            placeholder="Type your response..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmitResponse((e.target as HTMLInputElement).value);
              }
            }}
            autoFocus
          />
          <NeonButton 
            color="blue"
            onClick={() => {
              const input = document.querySelector('.response-input') as HTMLInputElement;
              handleSubmitResponse(input.value);
            }}
          >
            Submit Response
          </NeonButton>
        </GlassCard>
      )}

      {/* Story Preview */}
      {responses.length > 0 && (
        <GlassCard className="story-preview">
          <h3>Story So Far...</h3>
          <div className="story-text">
            {buildStoryPreview(template, responses)}
          </div>
        </GlassCard>
      )}

      {/* Recording Controls */}
      <div className="recording-controls">
        {!isRecording ? (
          <NeonButton 
            color="pink"
            onClick={startRecording}
            icon="🎬"
          >
            Record Performance
          </NeonButton>
        ) : (
          <NeonButton 
            color="orange"
            onClick={stopRecording}
            icon="⏹️"
            pulse
          >
            Stop Recording
          </NeonButton>
        )}
        
        {isRecording && (
          <video 
            ref={videoRef}
            autoPlay
            muted
            className="recording-preview"
          />
        )}
      </div>

      {/* Final Story & Actions */}
      {finalStory && (
        <GlassCard className="final-story-card">
          <h2>🎉 Complete Story!</h2>
          <div className="final-story-text">
            {finalStory}
          </div>
          
          <div className="story-actions">
            <NeonButton color="green" onClick={handleRedo}>
              🔄 Play Again
            </NeonButton>
            
            <NeonButton 
              color="purple"
              onClick={() => setShowConvertMenu(!showConvertMenu)}
            >
              ✨ Convert Story
            </NeonButton>
            
            <NeonButton color="blue" onClick={() => showSharingOptions(finalStory)}>
              📤 Share
            </NeonButton>
          </div>
          
          {showConvertMenu && (
            <div className="convert-menu">
              <h4>Convert to:</h4>
              <div className="convert-options">
                {['poem', 'song', 'screenplay', 'short_story', 'comedy_sketch', 'news_article'].map(type => (
                  <NeonButton
                    key={type}
                    size="sm"
                    onClick={() => handleConvert(type)}
                    disabled={converting}
                  >
                    {type.replace('_', ' ').toUpperCase()}
                  </NeonButton>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Helper functions
function getBlankType(turnIndex: number): string {
  const types = ['NOUN', 'VERB', 'ADJECTIVE', 'PLACE', 'PERSON', 'OBJECT', 'EMOTION', 'ACTION'];
  return types[turnIndex % types.length];
}

function buildStoryPreview(template: string, responses: string[]): string {
  let story = template;
  responses.forEach((response, index) => {
    story = story.replace(/\[.*?\]/, `**${response}**`);
  });
  return story;
}
