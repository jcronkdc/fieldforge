/**
 * Session Manager - Save & Return functionality for AngryLips
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';

interface SavedSession {
  id: string;
  name: string;
  mode: string;
  genre: string;
  players: string[];
  progress: number;
  lastPlayed: number;
  storyData?: any;
  currentBlankIndex?: number;
  filledBlanks?: Record<string, string>;
}

interface Props {
  sessionId: string;
  sessionData: any;
  onSave?: () => void;
  onLoad?: (session: SavedSession) => void;
}

export const SessionManager: React.FC<Props> = ({ 
  sessionId, 
  sessionData,
  onSave,
  onLoad 
}) => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load saved sessions from localStorage
    const saved = localStorage.getItem('angry_lips_saved_sessions');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved sessions');
      }
    }
  }, []);

  const saveSession = () => {
    if (!sessionName.trim()) {
      setSaveMessage('Please enter a name for this save');
      return;
    }

    const newSave: SavedSession = {
      id: `save-${Date.now()}`,
      name: sessionName.trim(),
      mode: sessionData.mode || 'versus',
      genre: sessionData.genre || 'Comedy',
      players: sessionData.players || [],
      progress: sessionData.progress || 0,
      lastPlayed: Date.now(),
      storyData: sessionData.storyData,
      currentBlankIndex: sessionData.currentBlankIndex,
      filledBlanks: sessionData.filledBlanks
    };

    const updated = [...savedSessions, newSave];
    setSavedSessions(updated);
    localStorage.setItem('angry_lips_saved_sessions', JSON.stringify(updated));
    
    setSaveMessage('Session saved successfully!');
    setTimeout(() => {
      setShowSaveDialog(false);
      setSaveMessage('');
      setSessionName('');
    }, 2000);

    onSave?.();
  };

  const loadSession = (session: SavedSession) => {
    onLoad?.(session);
    setShowLoadDialog(false);
  };

  const deleteSession = (sessionId: string) => {
    const updated = savedSessions.filter(s => s.id !== sessionId);
    setSavedSessions(updated);
    localStorage.setItem('angry_lips_saved_sessions', JSON.stringify(updated));
  };

  return (
    <>
      {/* Save/Load Buttons */}
      <div className="fixed top-20 right-4 z-30 flex gap-2 session-manager-buttons">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all flex items-center gap-2"
        >
          <Icons.Export size={16} className="text-green-400" />
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
            Save
          </span>
        </button>
        
        <button
          onClick={() => setShowLoadDialog(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-all flex items-center gap-2"
          disabled={savedSessions.length === 0}
        >
          <Icons.Database size={16} className="text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Load
          </span>
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-cyan-500/30 rounded-xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-4">
              Save Session
            </h2>
            
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter save name..."
              className="w-full px-4 py-3 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none mb-4"
              autoFocus
            />

            {saveMessage && (
              <div className={`text-sm mb-4 ${
                saveMessage.includes('success') ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {saveMessage}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveMessage('');
                  setSessionName('');
                }}
                className="flex-1 py-2 bg-black border border-gray-700 rounded-lg hover:border-gray-600 transition-all font-bold uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveSession}
                className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all font-bold uppercase tracking-wider text-sm text-black"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-cyan-500/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-4">
              Load Session
            </h2>

            {savedSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No saved sessions found
              </div>
            ) : (
              <div className="space-y-3">
                {savedSessions.map(session => (
                  <div
                    key={session.id}
                    className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white">{session.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {session.mode} • {session.genre}
                          </span>
                          <span className="text-xs text-gray-500">
                            {session.players.length} players
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(session.lastPlayed).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSession(session)}
                          className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-all"
                        >
                          <Icons.Export size={16} className="text-blue-400 rotate-180" />
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded hover:bg-red-500/30 transition-all"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full mt-4 py-2 bg-black border border-gray-700 rounded-lg hover:border-gray-600 transition-all font-bold uppercase tracking-wider text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
