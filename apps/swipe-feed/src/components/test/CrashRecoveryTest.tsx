/**
 * Crash Recovery Test Suite - Tests data persistence and recovery
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect, useRef } from 'react';

interface ContentInProgress {
  type: 'story' | 'screenplay' | 'poem' | 'song' | 'angry-lips';
  title: string;
  content: string;
  lastSaved: string;
  wordCount: number;
  autoSaveEnabled: boolean;
  sessionId: string;
}

interface AutoSaveLog {
  timestamp: string;
  type: string;
  status: 'success' | 'failed';
  dataSize: string;
}

export const CrashRecoveryTest: React.FC = () => {
  const [isWriting, setIsWriting] = useState(false);
  const [crashSimulated, setCrashSimulated] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentInProgress | null>(null);
  const [autoSaveLog, setAutoSaveLog] = useState<AutoSaveLog[]>([]);
  const [recoveredContent, setRecoveredContent] = useState<ContentInProgress | null>(null);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>('');

  // Simulate auto-save every 5 seconds
  const autoSave = () => {
    if (!currentContent) return;
    
    const saveData = {
      ...currentContent,
      content: contentRef.current,
      lastSaved: new Date().toISOString(),
      wordCount: contentRef.current.split(' ').length,
    };

    // Save to localStorage (simulating backend save)
    localStorage.setItem(`mythatron_autosave_${currentContent.sessionId}`, JSON.stringify(saveData));
    localStorage.setItem('mythatron_last_session', currentContent.sessionId);

    // Log the save
    setAutoSaveLog(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type: currentContent.type,
      status: 'success',
      dataSize: `${(JSON.stringify(saveData).length / 1024).toFixed(2)}KB`,
    }]);

    console.log('Auto-saved:', saveData);
  };

  // Start creating content
  const startWriting = (type: ContentInProgress['type']) => {
    const sessionId = `session_${Date.now()}`;
    const newContent: ContentInProgress = {
      type,
      title: `Test ${type} - ${new Date().toLocaleDateString()}`,
      content: '',
      lastSaved: new Date().toISOString(),
      wordCount: 0,
      autoSaveEnabled: true,
      sessionId,
    };

    setCurrentContent(newContent);
    setIsWriting(true);
    setCrashSimulated(false);
    setRecoveryAttempted(false);
    setRecoveredContent(null);

    // Start auto-save interval
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }
    autoSaveInterval.current = setInterval(autoSave, 5000);

    // Start simulating content creation
    simulateContentCreation(type);
  };

  // Simulate content being written
  const simulateContentCreation = (type: ContentInProgress['type']) => {
    let content = '';
    
    switch (type) {
      case 'story':
        content = `Chapter 1: The Quantum Realm

The neon lights of Neo Tokyo flickered in the rain as Maya stepped out of the hover-taxi. Her cybernetic implants hummed softly, scanning the area for threats. She had come too far to turn back now.

"The data core is in the vault," her AI companion whispered through the neural link. "Security is tight, but not impossible."

Maya smiled. Nothing was impossible in the quantum realm. She activated her phase-shift module and walked straight through the wall.

Inside, the facility was a maze of laser grids and motion sensors. But Maya had something they didn't expect - the ability to exist in multiple quantum states simultaneously.`;
        break;

      case 'screenplay':
        content = `FADE IN:

EXT. NEO TOKYO - NIGHT

Rain falls on neon-lit streets. MAYA (30s, cybernetic implants glowing) exits a hover-taxi.

MAYA
(to her neural link)
Status report.

AI COMPANION (V.O.)
(filtered, digital)
Target acquired. Quantum vault, 
sublevel seven.

INT. QUANTUM FACILITY - CONTINUOUS

Maya phases through the wall. The room pulses with energy.

MAYA
(whispered)
Time to dance.

She activates her multi-state generator. Multiple versions of Maya appear.`;
        break;

      case 'poem':
        content = `In quantum dreams where data streams,
Through neon nights and laser beams,
A thief walks through the solid walls,
While rain on Neo Tokyo falls.

Her mind is linked to circuits bright,
Her body shifts through space and light,
In multiple states she does exist,
A ghost within the data mist.

The vault awaits with treasures locked,
But quantum laws cannot be blocked,
She dances through security,
A digital divinity.`;
        break;

      case 'song':
        content = `[Verse 1]
Walking through the neon rain
Neo Tokyo's calling out my name
Cybernetic heart beats in time
With the city's digital rhyme

[Pre-Chorus]
Phase shift activated, I'm breaking through
Multiple dimensions, which one is true?

[Chorus]
I'm a quantum ghost in the machine
Living in spaces in between
Dancing through your laser walls
When the neon city calls
I exist in every state
Master of my quantum fate`;
        break;

      case 'angry-lips':
        content = `Session: The Quantum Heist
Players: Maya_Player, AI_Host, Quantum_Bot

Round 1:
Prompt: "Maya walked into the [ADJECTIVE] vault carrying a [NOUN]"
Maya_Player: "glitching"
AI_Host: "rubber duck"

Result: "Maya walked into the glitching vault carrying a rubber duck"

Round 2:
Prompt: "The security guard screamed '[EXCLAMATION]!' and pulled out his [WEAPON]"
Quantum_Bot: "Great Scott!"
Maya_Player: "banana phone"

Result: "The security guard screamed 'Great Scott!' and pulled out his banana phone"`;
        break;
    }

    // Simulate typing effect
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < content.length && !crashSimulated) {
        contentRef.current = content.substring(0, index + 1);
        setCurrentContent(prev => prev ? {
          ...prev,
          content: contentRef.current,
          wordCount: contentRef.current.split(' ').length,
        } : null);
        index += 5; // Type 5 characters at a time
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
  };

  // Simulate a crash
  const simulateCrash = () => {
    setCrashSimulated(true);
    setIsWriting(false);
    
    // Clear intervals
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }

    // Save crash state
    localStorage.setItem('mythatron_crash_detected', 'true');
    localStorage.setItem('mythatron_crash_time', new Date().toISOString());

    // Log the crash
    setAutoSaveLog(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type: 'CRASH',
      status: 'failed',
      dataSize: '0KB',
    }]);
  };

  // Attempt recovery
  const attemptRecovery = () => {
    setRecoveryAttempted(true);
    
    // Check for last session
    const lastSessionId = localStorage.getItem('mythatron_last_session');
    
    if (lastSessionId) {
      const savedData = localStorage.getItem(`mythatron_autosave_${lastSessionId}`);
      
      if (savedData) {
        const recovered = JSON.parse(savedData) as ContentInProgress;
        setRecoveredContent(recovered);
        
        // Log successful recovery
        setAutoSaveLog(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'RECOVERY',
          status: 'success',
          dataSize: `${(savedData.length / 1024).toFixed(2)}KB`,
        }]);

        // Clear crash flag
        localStorage.removeItem('mythatron_crash_detected');
        
        return true;
      }
    }
    
    return false;
  };

  // Continue from recovered content
  const continueFromRecovery = () => {
    if (recoveredContent) {
      setCurrentContent(recoveredContent);
      contentRef.current = recoveredContent.content;
      setIsWriting(true);
      setCrashSimulated(false);
      
      // Restart auto-save
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
      autoSaveInterval.current = setInterval(autoSave, 5000);
    }
  };

  // Clear all saved data
  const clearAllData = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('mythatron_'));
    keys.forEach(key => localStorage.removeItem(key));
    setAutoSaveLog([]);
    setCurrentContent(null);
    setRecoveredContent(null);
    setCrashSimulated(false);
    setRecoveryAttempted(false);
  };

  // Check for crash on mount
  useEffect(() => {
    const crashDetected = localStorage.getItem('mythatron_crash_detected');
    if (crashDetected === 'true') {
      setCrashSimulated(true);
      const crashTime = localStorage.getItem('mythatron_crash_time');
      setAutoSaveLog([{
        timestamp: new Date(crashTime || '').toLocaleTimeString(),
        type: 'CRASH DETECTED',
        status: 'failed',
        dataSize: '0KB',
      }]);
    }

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Crash Recovery Test Suite
          </h1>
          <p className="text-white/60">Testing data persistence and recovery after system crashes</p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Content Creation */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-light mb-4">Create Content</h2>
            <div className="space-y-2">
              {['story', 'screenplay', 'poem', 'song', 'angry-lips'].map((type) => (
                <button
                  key={type}
                  onClick={() => startWriting(type as ContentInProgress['type'])}
                  disabled={isWriting}
                  className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                >
                  Create {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Crash Simulation */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-light mb-4">Crash Controls</h2>
            <div className="space-y-4">
              <button
                onClick={simulateCrash}
                disabled={!isWriting || crashSimulated}
                className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔥 Simulate Crash
              </button>
              <button
                onClick={attemptRecovery}
                disabled={!crashSimulated || recoveryAttempted}
                className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Attempt Recovery
              </button>
              <button
                onClick={clearAllData}
                className="w-full px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg transition-all"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-light mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Writing:</span>
                <span className={isWriting ? 'text-green-400' : 'text-white/40'}>
                  {isWriting ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Auto-Save:</span>
                <span className={currentContent?.autoSaveEnabled ? 'text-blue-400' : 'text-white/40'}>
                  {currentContent?.autoSaveEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Crash:</span>
                <span className={crashSimulated ? 'text-red-400' : 'text-white/40'}>
                  {crashSimulated ? 'Detected' : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Recovery:</span>
                <span className={recoveredContent ? 'text-green-400' : 'text-white/40'}>
                  {recoveredContent ? 'Available' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Content */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-light mb-4">Current Content</h2>
            {currentContent ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Type: {currentContent.type}</span>
                  <span>Words: {currentContent.wordCount}</span>
                </div>
                <div className="p-4 bg-black/30 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-white/80">
                    {currentContent.content || 'Starting...'}
                  </pre>
                </div>
                <div className="text-xs text-white/40">
                  Last saved: {new Date(currentContent.lastSaved).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/40 py-8">
                No content being created
              </div>
            )}
          </div>

          {/* Auto-Save Log */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-light mb-4">Auto-Save Log</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {autoSaveLog.length > 0 ? (
                autoSaveLog.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      log.status === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                      log.type === 'RECOVERY' ? 'bg-blue-500/10 border border-blue-500/20' :
                      'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{log.type}</span>
                      <span className="text-white/60">{log.timestamp}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      Size: {log.dataSize}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/40 py-8">
                  No auto-save activity yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recovery Panel */}
        {recoveredContent && (
          <div className="glass rounded-2xl p-6 border-2 border-green-500/50">
            <h2 className="text-xl font-light mb-4 text-green-400">
              ✅ Content Recovered Successfully!
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-light mb-2">Recovery Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Type:</span>
                    <span className="capitalize">{recoveredContent.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Title:</span>
                    <span>{recoveredContent.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Words Recovered:</span>
                    <span className="text-green-400">{recoveredContent.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Last Save:</span>
                    <span>{new Date(recoveredContent.lastSaved).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-light mb-2">Recovered Content Preview</h3>
                <div className="p-3 bg-black/30 rounded-lg max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-white/70">
                    {recoveredContent.content.substring(0, 200)}...
                  </pre>
                </div>
                <button
                  onClick={continueFromRecovery}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 rounded-lg transition-all"
                >
                  Continue Writing From Recovery
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-8 p-6 bg-white/5 rounded-2xl">
          <h3 className="text-lg font-light mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Content is auto-saved every 5 seconds to localStorage</li>
            <li>• Each session has a unique ID for recovery</li>
            <li>• Crash simulation stops all writing and saves crash state</li>
            <li>• Recovery attempts to restore the last saved session</li>
            <li>• All content types are fully recoverable</li>
            <li>• Users can continue from exactly where they left off</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
