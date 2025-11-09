/**
 * Saved Sessions Widget for Dashboard
 * Shows incomplete AngryLips sessions
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
  completed: boolean;
}

interface Props {
  onResume: (sessionId: string) => void;
}

export const SavedSessionsWidget: React.FC<Props> = ({ onResume }) => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('angry_lips_saved_sessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved);
        // Filter to show only incomplete sessions
        setSavedSessions(sessions.filter((s: SavedSession) => !s.completed));
      } catch (e) {
        console.error('Failed to load saved sessions');
      }
    }
  }, []);

  if (savedSessions.length === 0) return null;

  return (
    <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
          INCOMPLETE SESSIONS
        </h3>
        <span className="text-xs text-gray-500">
          {savedSessions.length} saved
        </span>
      </div>
      
      <div className="space-y-2">
        {savedSessions.slice(0, 3).map(session => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 bg-black/40 border border-gray-800 rounded-lg hover:border-cyan-500/30 transition-all cursor-pointer"
            onClick={() => onResume(session.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                <Icons.Fire size={20} className="text-orange-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{session.name}</div>
                <div className="text-xs text-gray-500">
                  {session.mode} • {session.genre} • {Math.round(session.progress)}% complete
                </div>
              </div>
            </div>
            <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs font-bold text-cyan-400 uppercase tracking-wider hover:bg-cyan-500/30 transition-all">
              Resume
            </button>
          </div>
        ))}
      </div>
      
      {savedSessions.length > 3 && (
        <div className="mt-3 text-center">
          <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            View all {savedSessions.length} sessions →
          </button>
        </div>
      )}
    </div>
  );
};
