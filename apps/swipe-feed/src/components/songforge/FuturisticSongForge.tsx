/**
 * FUTURISTIC SONGFORGE - Audio Visualizer Aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: string;
  plays: number;
  likes: number;
}

interface Props {
  onClose: () => void;
}

export const FuturisticSongForge: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'library' | 'collaborate'>('compose');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [selectedGenre, setSelectedGenre] = useState('Electronic');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [tracks] = useState<Track[]>([
    {
      id: '1',
      title: 'NEON DREAMS',
      artist: 'AI Composer',
      genre: 'Synthwave',
      bpm: 128,
      duration: '3:45',
      plays: 1337,
      likes: 256
    },
    {
      id: '2',
      title: 'CYBER PULSE',
      artist: 'BeatMaker',
      genre: 'Electronic',
      bpm: 140,
      duration: '4:12',
      plays: 892,
      likes: 147
    }
  ]);

  // Visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;
    const bars = 32;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * (isPlaying ? canvas.height * 0.8 : canvas.height * 0.2);
        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0.4)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 2, canvas.height - height, barWidth - 4, height);
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const genres = ['Electronic', 'Synthwave', 'Ambient', 'Trap', 'House', 'Techno', 'Dubstep', 'Drum & Bass'];
  
  const tabs = [
    { id: 'compose', label: 'COMPOSE', icon: '🎹' },
    { id: 'library', label: 'LIBRARY', icon: '💿' },
    { id: 'collaborate', label: 'COLLAB', icon: '🤝' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                SONGFORGE
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-bold uppercase">
                  STUDIO READY
                </span>
                <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-400">
                  {bpm} BPM
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-purple-500/50 hover:text-purple-400'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'compose' && (
          <div>
            {/* Visualizer */}
            <div className="h-48 bg-gradient-to-b from-purple-900/20 to-black border-b border-purple-500/20">
              <canvas 
                ref={canvasRef}
                className="w-full h-full"
              />
            </div>

            {/* Controls */}
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                {/* Transport Controls */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <button className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M6 6h2v12H6zM10 6l8 6-8 6z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all"
                  >
                    {isPlaying ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  <button className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M6 18l8-6-8-6v12zM16 6h2v12h-2z"/>
                    </svg>
                  </button>
                </div>

                {/* Track Info */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-purple-400 uppercase tracking-wider mb-1">NEW TRACK</h2>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">0:00 / 0:00</p>
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Genre */}
                  <div className="bg-black/60 border border-purple-500/20 rounded-lg p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">GENRE</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-black/60 border border-gray-800 rounded-lg text-purple-400 focus:border-purple-500 focus:outline-none"
                    >
                      {genres.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* BPM */}
                  <div className="bg-black/60 border border-purple-500/20 rounded-lg p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">BPM</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="60"
                        max="200"
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-purple-400 font-bold w-12 text-right">{bpm}</span>
                    </div>
                  </div>

                  {/* Key */}
                  <div className="bg-black/60 border border-purple-500/20 rounded-lg p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">KEY</label>
                    <select className="w-full mt-2 px-3 py-2 bg-black/60 border border-gray-800 rounded-lg text-purple-400 focus:border-purple-500 focus:outline-none">
                      <option>C Major</option>
                      <option>G Major</option>
                      <option>D Minor</option>
                      <option>A Minor</option>
                    </select>
                  </div>
                </div>

                {/* AI Tools */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                  <button className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold uppercase tracking-wider text-xs hover:from-cyan-500/20 hover:to-blue-500/20 transition-all">
                    🎼 MELODY
                  </button>
                  <button className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg text-purple-400 font-bold uppercase tracking-wider text-xs hover:from-purple-500/20 hover:to-pink-500/20 transition-all">
                    🥁 DRUMS
                  </button>
                  <button className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-green-400 font-bold uppercase tracking-wider text-xs hover:from-green-500/20 hover:to-emerald-500/20 transition-all">
                    🎸 BASS
                  </button>
                  <button className="px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg text-orange-400 font-bold uppercase tracking-wider text-xs hover:from-orange-500/20 hover:to-red-500/20 transition-all">
                    🎤 VOCALS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-4">
                {tracks.map(track => (
                  <div key={track.id} className="bg-black/60 border border-purple-500/20 rounded-lg p-6 hover:border-purple-400 transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        <div>
                          <h3 className="font-black text-purple-400 uppercase tracking-wider">{track.title}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-widest">
                            {track.artist} • {track.genre} • {track.bpm} BPM • {track.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">▶️ {track.plays}</span>
                        <span className="text-xs text-gray-500">❤️ {track.likes}</span>
                        <button className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-bold uppercase tracking-wider hover:bg-purple-500/20 transition-all opacity-0 group-hover:opacity-100">
                          REMIX →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collaborate' && (
          <div className="p-6 text-center">
            <div className="py-20">
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-2xl font-black text-purple-400 mb-2">COLLABORATE</h2>
              <p className="text-gray-500 uppercase tracking-wider">Team up with other producers</p>
              <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all">
                FIND COLLABORATORS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticSongForge;
