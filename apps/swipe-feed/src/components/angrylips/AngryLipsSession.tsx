/**
 * Angry Lips Session - Active game session
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface AngryLipsSessionProps {
  sessionId: string;
  genre: string;
  maxPlayers: number;
  enableAICoHost: boolean;
  host: string;
  onNavigate: (view: FocusedView) => void;
  onEndSession: () => void;
}

export const AngryLipsSession: React.FC<AngryLipsSessionProps> = ({
  sessionId,
  genre,
  maxPlayers,
  enableAICoHost,
  host,
  onNavigate,
  onEndSession,
}) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gamePhase, setGamePhase] = useState<'prompt' | 'input' | 'voting' | 'results'>('prompt');
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState<string[]>([host]);

  // Genre-specific prompts
  const prompts: Record<string, string[]> = {
    Comedy: [
      "The worst excuse for being late is ___",
      "My therapist says I have a problem with ___",
      "The secret to happiness is ___",
    ],
    Horror: [
      "The monster under my bed is afraid of ___",
      "The scariest thing in my basement is ___",
      "I knew the house was haunted when I saw ___",
    ],
    'Sci-Fi': [
      "In the future, ___ will be illegal",
      "The aliens came to Earth for ___",
      "The robot uprising started because of ___",
    ],
    Romance: [
      "The key to my heart is ___",
      "Our first date was ruined by ___",
      "Love at first sight happened when ___",
    ],
    Mystery: [
      "The butler did it with ___",
      "The detective found ___ at the crime scene",
      "The secret was hidden inside ___",
    ],
  };

  // Timer effect
  useEffect(() => {
    if (gamePhase === 'input' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'input') {
      handleSubmit();
    }
  }, [timeLeft, gamePhase]);

  // Initialize game
  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const genrePrompts = prompts[genre] || prompts['Comedy'];
    const randomPrompt = genrePrompts[Math.floor(Math.random() * genrePrompts.length)];
    setCurrentPrompt(randomPrompt);
    setGamePhase('prompt');
    setTimeLeft(60);
    
    // Show prompt for 3 seconds, then move to input
    setTimeout(() => {
      setGamePhase('input');
    }, 3000);
  };

  const handleSubmit = () => {
    if (playerInput.trim()) {
      setSubmissions([...submissions, playerInput]);
      setPlayerInput('');
    }
    setGamePhase('voting');
    
    // Simulate voting phase
    setTimeout(() => {
      setGamePhase('results');
      setScore(score + Math.floor(Math.random() * 100) + 50);
    }, 3000);
  };

  const nextRound = () => {
    if (currentRound < 5) {
      setCurrentRound(currentRound + 1);
      startNewRound();
    } else {
      // Game over
      alert(`Game Over! Final Score: ${score}`);
      onEndSession();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-light">Angry Lips Session</h1>
                <p className="text-sm text-white/60">Genre: {genre} • Round {currentRound}/5</p>
              </div>
              
              {/* Score Display */}
              <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                <span className="text-yellow-400 font-bold">Score: {score}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {gamePhase === 'input' && (
                <div className="px-4 py-2 bg-white/10 rounded-xl">
                  <span className={`font-mono ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                    0:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              <button
                onClick={onEndSession}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all text-red-400"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Players Bar */}
        <div className="mb-8 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Players:</span>
              <div className="flex gap-2">
                {players.map((player, i) => (
                  <div key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs">
                    {player}
                  </div>
                ))}
              </div>
            </div>
            {enableAICoHost && (
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400">
                AI Co-Host Active
              </div>
            )}
          </div>
        </div>

        {/* Main Game Content */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center">
          {gamePhase === 'prompt' && (
            <div className="text-center animate-pulse">
              <h2 className="text-3xl font-light mb-4">Get Ready!</h2>
              <p className="text-xl text-white/80">{currentPrompt}</p>
            </div>
          )}

          {gamePhase === 'input' && (
            <div className="w-full max-w-2xl">
              <h2 className="text-2xl font-light mb-6 text-center">{currentPrompt}</h2>
              <div className="space-y-4">
                <textarea
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  placeholder="Enter your hilarious answer..."
                  className="w-full px-6 py-4 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                  rows={3}
                  maxLength={200}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{playerInput.length}/200 characters</span>
                  <button
                    onClick={handleSubmit}
                    disabled={!playerInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'voting' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-light">Voting in progress...</h2>
              <p className="text-white/60 mt-2">Players are voting for the best answer</p>
            </div>
          )}

          {gamePhase === 'results' && (
            <div className="w-full max-w-2xl">
              <h2 className="text-2xl font-light mb-6 text-center">Round Results</h2>
              <div className="space-y-4 mb-8">
                {submissions.map((submission, i) => (
                  <div key={i} className="p-4 bg-white/10 rounded-xl">
                    <p className="text-lg">{currentPrompt.replace('___', `"${submission}"`)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-white/60">by You</span>
                      <span className="text-yellow-400">+{Math.floor(Math.random() * 100) + 50} points</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={nextRound}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all"
                >
                  {currentRound < 5 ? 'Next Round' : 'Finish Game'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat/Comments Section */}
        <div className="mt-8 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-lg font-light mb-4">Session Chat</h3>
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            <div className="text-sm">
              <span className="text-purple-400">{host}:</span>
              <span className="ml-2 text-white/80">Welcome to the session!</span>
            </div>
            {enableAICoHost && (
              <div className="text-sm">
                <span className="text-blue-400">AI Co-Host:</span>
                <span className="ml-2 text-white/80">Let's make this interesting! 🎭</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 text-sm"
            />
            <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-all text-sm">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
