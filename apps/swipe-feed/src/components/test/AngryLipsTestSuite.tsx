/**
 * Comprehensive test suite for Angry Lips functionality
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import {
  mockUsers,
  generateMockSession,
  progressSession,
  pauseSession,
  resumeSession,
  generateFinalStory,
  convertStory,
  saveSessionToStorage,
  loadSessionFromStorage,
  getAllSavedSessions,
  clearAllSessions,
  type MockSession,
} from '../../test/mockAngryLipsData';

export const AngryLipsTestSuite: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<MockSession | null>(null);
  const [savedSessions, setSavedSessions] = useState<MockSession[]>([]);
  const [userInput, setUserInput] = useState('');
  const [finalStory, setFinalStory] = useState('');
  const [convertedStory, setConvertedStory] = useState('');
  const [conversionFormat, setConversionFormat] = useState<'screenplay' | 'poem' | 'song'>('screenplay');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    // Load saved sessions on mount
    setSavedSessions(getAllSavedSessions());
  }, []);

  useEffect(() => {
    // Timer countdown
    if (timerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
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
  }, [timerActive, timer]);

  const handleTimerExpired = () => {
    addTestResult('⏰ Timer expired! Auto-submitting turn...');
    if (currentSession && currentSession.status === 'active') {
      handleSubmitTurn('[Timer Expired - AI Fill]');
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleCreateSession = (genre: 'heist' | 'scifi' | 'fantasy' | 'romance' | 'horror') => {
    const session = generateMockSession(genre, 'draft');
    setCurrentSession(session);
    saveSessionToStorage(session);
    setSavedSessions(getAllSavedSessions());
    addTestResult(`✅ Created new ${genre} session: ${session.title}`);
  };

  const handleStartSession = () => {
    if (!currentSession) return;
    
    const updatedSession = { ...currentSession, status: 'active' as const };
    setCurrentSession(updatedSession);
    saveSessionToStorage(updatedSession);
    setTimerActive(true);
    setTimer(300); // Reset timer
    addTestResult('🚀 Session started! Timer is running.');
  };

  const handleSubmitTurn = (response?: string) => {
    if (!currentSession) return;

    const responseText = response || userInput || `[Auto-generated response ${currentSession.currentTurn + 1}]`;
    const updatedSession = progressSession(currentSession, responseText);
    
    setCurrentSession(updatedSession);
    saveSessionToStorage(updatedSession);
    setUserInput('');
    
    addTestResult(`📝 Turn ${currentSession.currentTurn + 1} submitted: "${responseText}"`);

    if (updatedSession.status === 'completed') {
      setTimerActive(false);
      handleSessionComplete(updatedSession);
    }
  };

  const handleSessionComplete = (session: MockSession) => {
    const story = generateFinalStory(session);
    setFinalStory(story);
    addTestResult('🎉 Session complete! Story generated.');
    
    // Auto-save to session history
    saveSessionToStorage(session);
    setSavedSessions(getAllSavedSessions());
  };

  const handlePauseSession = () => {
    if (!currentSession || currentSession.status !== 'active') return;
    
    const pausedSession = pauseSession(currentSession);
    setCurrentSession(pausedSession);
    saveSessionToStorage(pausedSession);
    setTimerActive(false);
    addTestResult('⏸️ Session paused. Progress saved!');
  };

  const handleResumeSession = () => {
    if (!currentSession || currentSession.status !== 'paused') return;
    
    const resumedSession = resumeSession(currentSession);
    setCurrentSession(resumedSession);
    saveSessionToStorage(resumedSession);
    setTimerActive(true);
    addTestResult('▶️ Session resumed from where you left off.');
  };

  const handleLoadSession = (sessionId: string) => {
    const session = loadSessionFromStorage(sessionId);
    if (session) {
      setCurrentSession(session);
      if (session.status === 'completed' && session.responses.length === session.totalTurns) {
        setFinalStory(generateFinalStory(session));
      }
      addTestResult(`📂 Loaded session: ${session.title}`);
    }
  };

  const handleConvertStory = () => {
    if (!finalStory) return;
    
    const converted = convertStory(finalStory, conversionFormat);
    setConvertedStory(converted);
    addTestResult(`🎭 Converted story to ${conversionFormat} format.`);
  };

  const handleAIAssist = () => {
    if (!currentSession || currentSession.status !== 'active') return;
    
    // Simulate AI generating a response
    const aiResponses = [
      'a quantum-entangled burrito',
      'seventeen confused penguins',
      'the lost city of Atlantis\'s WiFi password',
      'a time-traveling toaster',
      'an existentially anxious robot',
    ];
    
    const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    handleSubmitTurn(`[AI Assist] ${aiResponse}`);
    addTestResult('🤖 AI Co-Host provided assistance!');
  };

  const handleClearAll = () => {
    clearAllSessions();
    setSavedSessions([]);
    setCurrentSession(null);
    setFinalStory('');
    setConvertedStory('');
    setTestResults([]);
    addTestResult('🗑️ Cleared all sessions and data.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🎮 Angry Lips Test Suite
        </h1>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Session Creation */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Create New Session</h2>
            <div className="space-y-2">
              {['heist', 'scifi', 'fantasy', 'romance', 'horror'].map(genre => (
                <button
                  key={genre}
                  onClick={() => handleCreateSession(genre as any)}
                  className="w-full px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg transition-colors capitalize"
                >
                  {genre} Adventure
                </button>
              ))}
            </div>
          </div>

          {/* Current Session */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Current Session</h2>
            {currentSession ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p><strong>Title:</strong> {currentSession.title}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                    currentSession.status === 'active' ? 'bg-green-500/30' :
                    currentSession.status === 'paused' ? 'bg-yellow-500/30' :
                    currentSession.status === 'completed' ? 'bg-blue-500/30' :
                    'bg-gray-500/30'
                  }`}>{currentSession.status}</span></p>
                  <p><strong>Turn:</strong> {currentSession.currentTurn}/{currentSession.totalTurns}</p>
                  <p><strong>Players:</strong> {currentSession.participants.length}</p>
                </div>

                {/* Timer */}
                {currentSession.status === 'active' && (
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-mono font-bold text-yellow-400">
                      {formatTime(timer)}
                    </div>
                    <div className="text-xs text-gray-400">Time Remaining</div>
                  </div>
                )}

                {/* Session Controls */}
                <div className="flex gap-2">
                  {currentSession.status === 'draft' && (
                    <button
                      onClick={handleStartSession}
                      className="flex-1 px-3 py-2 bg-green-600/50 hover:bg-green-600/70 rounded-lg text-sm"
                    >
                      Start
                    </button>
                  )}
                  {currentSession.status === 'active' && (
                    <>
                      <button
                        onClick={handlePauseSession}
                        className="flex-1 px-3 py-2 bg-yellow-600/50 hover:bg-yellow-600/70 rounded-lg text-sm"
                      >
                        Pause
                      </button>
                      <button
                        onClick={handleAIAssist}
                        className="flex-1 px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 rounded-lg text-sm"
                      >
                        AI Help
                      </button>
                    </>
                  )}
                  {currentSession.status === 'paused' && (
                    <button
                      onClick={handleResumeSession}
                      className="flex-1 px-3 py-2 bg-green-600/50 hover:bg-green-600/70 rounded-lg text-sm"
                    >
                      Resume
                    </button>
                  )}
                </div>

                {/* Participants */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Participants:</p>
                  <div className="flex -space-x-2">
                    {currentSession.participants.map((user, i) => (
                      <div
                        key={user.id}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-black flex items-center justify-center text-xs font-bold"
                        title={user.displayName}
                      >
                        {user.displayName[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No active session. Create one to start!</p>
            )}
          </div>

          {/* Saved Sessions */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Saved Sessions</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedSessions.length > 0 ? (
                savedSessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => handleLoadSession(session.id)}
                    className="w-full text-left px-3 py-2 bg-black/30 hover:bg-black/50 rounded-lg text-sm transition-colors"
                  >
                    <div className="font-semibold">{session.title}</div>
                    <div className="text-xs text-gray-400">
                      {session.status} • {session.responses.length}/{session.totalTurns} turns
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No saved sessions yet.</p>
              )}
            </div>
            {savedSessions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="w-full mt-3 px-3 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg text-sm"
              >
                Clear All Sessions
              </button>
            )}
          </div>
        </div>

        {/* Game Play Area */}
        {currentSession && currentSession.status === 'active' && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Turn</h2>
            
            {/* Template with blanks filled */}
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-lg leading-relaxed">
                {currentSession.templateText.split(/(\[BLANK_\d+\])/).map((part, i) => {
                  const blankMatch = part.match(/\[BLANK_(\d+)\]/);
                  if (blankMatch) {
                    const blankIndex = parseInt(blankMatch[1]) - 1;
                    if (blankIndex < currentSession.responses.length) {
                      return <span key={i} className="text-yellow-400 font-bold">{currentSession.responses[blankIndex]}</span>;
                    } else if (blankIndex === currentSession.currentTurn) {
                      return <span key={i} className="text-purple-400 font-bold animate-pulse">[YOUR TURN]</span>;
                    } else {
                      return <span key={i} className="text-gray-500">{part}</span>;
                    }
                  }
                  return <span key={i}>{part}</span>;
                })}
              </p>
            </div>

            {/* Input for current turn */}
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitTurn()}
                placeholder="Enter your creative response..."
                className="flex-1 px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={() => handleSubmitTurn()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold"
              >
                Submit Turn
              </button>
            </div>
          </div>
        )}

        {/* Final Story Display */}
        {finalStory && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold mb-4">Completed Story</h2>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{finalStory}</p>
            </div>

            {/* Conversion Options */}
            <div className="flex gap-3">
              <select
                value={conversionFormat}
                onChange={(e) => setConversionFormat(e.target.value as any)}
                className="px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg"
              >
                <option value="screenplay">Screenplay</option>
                <option value="poem">Poem</option>
                <option value="song">Song</option>
              </select>
              <button
                onClick={handleConvertStory}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg"
              >
                Convert to {conversionFormat}
              </button>
            </div>

            {/* Converted Story */}
            {convertedStory && (
              <div className="mt-4 bg-black/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Converted to {conversionFormat}:</h3>
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{convertedStory}</pre>
              </div>
            )}
          </div>
        )}

        {/* Test Results Log */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Test Results Log</h2>
          <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            {testResults.length > 0 ? (
              <div className="space-y-1 text-sm font-mono">
                {testResults.map((result, i) => (
                  <div key={i} className="text-green-400">{result}</div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Test results will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
