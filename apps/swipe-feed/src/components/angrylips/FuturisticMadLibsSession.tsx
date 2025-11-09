/**
 * FUTURISTIC MAD LIBS SESSION - Actual Gameplay
 */

import React, { useState, useEffect, useRef } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';
import { useSparks } from '../sparks/SparksContext';
import { getContextualPrompt, generateSmartStory } from '../../lib/angrylips/contextualWordPrompts';

interface Props {
  sessionId: string;
  genre: string;
  maxPlayers: number;
  playerNames: string[];
  host: string;
  onNavigate: (view: FocusedView) => void;
  onEndSession: () => void;
  onComplete?: (storyData: any) => void;
}

interface Blank {
  id: number;
  type: string;
  description: string;
  value?: string;
}

const STORY_TEMPLATES = {
  Comedy: {
    title: "The Office Disaster",
    template: "Yesterday at the {NOUN}, my {ADJECTIVE} boss decided to {VERB} during the meeting. Everyone started {VERB_ING} when the {NOUN} exploded! The {ADJECTIVE} intern tried to {VERB} but ended up {VERB_ING} on the {NOUN}. It was the most {ADJECTIVE} day ever!",
    blanks: [
      { id: 1, type: 'NOUN', description: 'A place' },
      { id: 2, type: 'ADJECTIVE', description: 'Describing word' },
      { id: 3, type: 'VERB', description: 'Action word' },
      { id: 4, type: 'VERB_ING', description: 'Action ending in -ing' },
      { id: 5, type: 'NOUN', description: 'An object' },
      { id: 6, type: 'ADJECTIVE', description: 'Describing word' },
      { id: 7, type: 'VERB', description: 'Action word' },
      { id: 8, type: 'VERB_ING', description: 'Action ending in -ing' },
      { id: 9, type: 'NOUN', description: 'An object' },
      { id: 10, type: 'ADJECTIVE', description: 'Describing word' }
    ]
  },
  Horror: {
    title: "The Haunted House",
    template: "The {ADJECTIVE} house on {NOUN} street was known for its {ADJECTIVE} {NOUN}. When we {VERB} inside, we heard {ADJECTIVE} {NOUN_PLURAL} {VERB_ING} in the darkness. Suddenly, a {ADJECTIVE} {NOUN} appeared and started {VERB_ING}!",
    blanks: [
      { id: 1, type: 'ADJECTIVE', description: 'Scary word' },
      { id: 2, type: 'NOUN', description: 'Street name' },
      { id: 3, type: 'ADJECTIVE', description: 'Spooky word' },
      { id: 4, type: 'NOUN', description: 'Scary thing' },
      { id: 5, type: 'VERB', description: 'Past tense action' },
      { id: 6, type: 'ADJECTIVE', description: 'Sound descriptor' },
      { id: 7, type: 'NOUN_PLURAL', description: 'Plural creatures' },
      { id: 8, type: 'VERB_ING', description: 'Action ending in -ing' },
      { id: 9, type: 'ADJECTIVE', description: 'Terrifying word' },
      { id: 10, type: 'NOUN', description: 'Monster or creature' },
      { id: 11, type: 'VERB_ING', description: 'Scary action -ing' }
    ]
  }
};

export const FuturisticMadLibsSession: React.FC<Props> = ({
  sessionId,
  genre,
  maxPlayers,
  playerNames,
  host,
  onNavigate,
  onEndSession,
  onComplete
}) => {
  const { addSparks } = useSparks();
  const [gamePhase, setGamePhase] = useState<'filling' | 'reveal' | 'voting' | 'complete'>('filling');
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get template based on genre
  const template = STORY_TEMPLATES[genre as keyof typeof STORY_TEMPLATES] || STORY_TEMPLATES.Comedy;
  const currentBlank = template.blanks[currentBlankIndex];

  useEffect(() => {
    // Focus input when blank changes
    inputRef.current?.focus();
  }, [currentBlankIndex]);

  useEffect(() => {
    // Timer countdown
    if (gamePhase === 'filling' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentBlankIndex < template.blanks.length - 1) {
      // Auto-advance if time runs out
      handleSubmitBlank();
    }
  }, [timeLeft, gamePhase]);

  const handleSubmitBlank = () => {
    if (inputValue.trim() || timeLeft === 0) {
      // Save the blank value
      setFilledBlanks(prev => ({
        ...prev,
        [currentBlank.id]: inputValue.trim() || `[${currentBlank.type}]`
      }));

      // Add points for filling
      if (inputValue.trim()) {
        const points = Math.max(10, timeLeft * 2); // More points for faster answers
        setScore(prev => prev + points);
      }

      // Move to next blank or complete
      if (currentBlankIndex < template.blanks.length - 1) {
        setCurrentBlankIndex(prev => prev + 1);
        setInputValue('');
        setTimeLeft(30); // Reset timer
      } else {
        // All blanks filled
        setGamePhase('reveal');
        // Trigger post-game remix
        if (onComplete) {
          const storyData = {
            title: template.title,
            content: generateFilledStory(),
            genre,
            players: playerNames,
            filledWords: filledBlanks
          };
          onComplete(storyData);
        }
      }
    }
  };

  const generateFilledStory = () => {
    let story = template.template;
    template.blanks.forEach(blank => {
      const value = filledBlanks[blank.id] || `[${blank.type}]`;
      story = story.replace(`{${blank.type}}`, `**${value}**`);
    });
    return story;
  };

  const handleEndSession = () => {
    // Calculate final score
    const finalScore = score + (Object.keys(filledBlanks).length * 5);
    
    // Save session data
    const sessionData = {
      id: sessionId,
      genre,
      players: playerNames,
      story: generateFilledStory(),
      blanks: filledBlanks,
      score: finalScore,
      completed: gamePhase === 'reveal',
      completedAt: Date.now()
    };
    
    // Store in completed sessions
    const completedSessions = JSON.parse(localStorage.getItem('angry_lips_completed') || '[]');
    completedSessions.push(sessionData);
    localStorage.setItem('angry_lips_completed', JSON.stringify(completedSessions));
    
    // Remove from active sessions
    const activeSessions = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
    const filtered = activeSessions.filter((s: any) => s.id !== sessionId);
    localStorage.setItem('angry_lips_sessions', JSON.stringify(filtered));
    
    // Award completion bonus
    const bonusSparks = Math.max(10, Math.floor(finalScore / 10));
    addSparks(bonusSparks);
    
    // Show success message
    const message = `
      🎉 SESSION COMPLETE!
      Final Score: ${finalScore}
      Sparks Earned: ${bonusSparks}
      ${gamePhase === 'reveal' ? 'Story saved successfully!' : 'Progress saved for later!'}
    `;
    
    // Display notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AngryLips Session Ended', {
        body: `You earned ${bonusSparks} Sparks! Final score: ${finalScore}`,
        icon: '/icon-192x192.png'
      });
    }
    
    console.log(message);
    
    // Clean up and exit
    onEndSession();
  };

  const handlePlayAgain = () => {
    setGamePhase('filling');
    setCurrentBlankIndex(0);
    setFilledBlanks({});
    setInputValue('');
    setTimeLeft(30);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-cyan-400 uppercase tracking-wider">
                {template.title}
              </h1>
              <p className="text-sm text-gray-500 uppercase tracking-widest">
                SESSION: {sessionId.slice(-6)} • HOST: {host}
              </p>
            </div>
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold uppercase tracking-wider text-xs hover:bg-red-500/20 transition-all"
            >
              END SESSION
            </button>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {gamePhase === 'filling' && (
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="bg-gray-900 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                style={{ width: `${((currentBlankIndex + 1) / template.blanks.length) * 100}%` }}
              />
            </div>

            {/* Timer and Score */}
            <div className="flex justify-between items-center">
              <div className="text-2xl font-black text-cyan-400">
                SCORE: {score}
              </div>
              <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                TIME: {timeLeft}s
              </div>
            </div>

            {/* Current Blank */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 uppercase tracking-widest mb-2">
                  BLANK {currentBlankIndex + 1} OF {template.blanks.length}
                </div>
                <div className="text-4xl font-black text-cyan-400 mb-2">
                  {currentBlank.type.replace('_', ' ')}
                </div>
                <div className="text-lg text-gray-400">
                  {currentBlank.description}
                </div>
              </div>

              <div className="flex gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitBlank()}
                  placeholder={`ENTER ${currentBlank.type}...`}
                  className="flex-1 px-6 py-4 bg-black/60 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-gray-600 focus:border-cyan-400 focus:outline-none text-xl uppercase tracking-wider"
                  autoFocus
                />
                <button
                  onClick={handleSubmitBlank}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
                >
                  SUBMIT
                </button>
              </div>
            </div>

            {/* Previous Entries */}
            {currentBlankIndex > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm text-gray-500 uppercase tracking-widest">YOUR ENTRIES</h3>
                <div className="flex flex-wrap gap-2">
                  {template.blanks.slice(0, currentBlankIndex).map(blank => (
                    <span key={blank.id} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400">
                      {filledBlanks[blank.id] || `[${blank.type}]`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {gamePhase === 'reveal' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-cyan-400 mb-2">STORY COMPLETE!</h2>
              <p className="text-lg text-gray-500 uppercase tracking-widest">Final Score: {score}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8">
              <h3 className="text-xl font-black text-purple-400 mb-4">{template.title}</h3>
              <div className="text-lg leading-relaxed text-gray-300"
                dangerouslySetInnerHTML={{ 
                  __html: generateFilledStory().replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400 font-bold">$1</span>')
                }}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePlayAgain}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => {
                  // Award bonus sparks
                  addSparks(Math.floor(score / 10));
                  onEndSession();
                }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
              >
                CLAIM {Math.floor(score / 10)} SPARKS & EXIT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticMadLibsSession;
