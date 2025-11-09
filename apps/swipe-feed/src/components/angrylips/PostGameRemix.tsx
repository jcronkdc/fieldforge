/**
 * POST-GAME REMIX OPTIONS
 * Transform your AngryLips story into other creative formats
 */

import React, { useState } from 'react';
import { Icons } from '../icons/Icons';
import aiGenerator from '../../lib/ai/imageVideoGenerator';
import { useSparks } from '../sparks/SparksContext';

interface Props {
  storyData: {
    title?: string;
    content: string;
    genre: string;
    players: string[];
    filledWords: Record<string, string>;
  };
  onClose: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export const PostGameRemix: React.FC<Props> = ({ storyData, onClose, onNavigate }) => {
  const { balance: sparksBalance, deductSparks, isAdmin } = useSparks();
  const [selectedOption, setSelectedOption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const remixOptions = [
    {
      id: 'song',
      name: 'EPIC SONG',
      desc: 'Transform into lyrics & melody',
      icon: Icons.SongForge,
      sparksCost: 50,
      color: 'pink'
    },
    {
      id: 'poem',
      name: 'POETIC VERSE',
      desc: 'Create beautiful poetry',
      icon: Icons.StoryForge,
      sparksCost: 30,
      color: 'purple'
    },
    {
      id: 'screenplay',
      name: 'MOVIE SCRIPT',
      desc: 'Write a screenplay scene',
      icon: Icons.Screenplay,
      sparksCost: 40,
      color: 'blue'
    },
    {
      id: 'comic',
      name: 'COMIC STRIP',
      desc: 'Generate visual panels',
      icon: Icons.Fire,
      sparksCost: 60,
      color: 'orange'
    },
    {
      id: 'ai-image',
      name: 'AI ARTWORK',
      desc: 'Create stunning visuals',
      icon: Icons.Sparkle,
      sparksCost: 75,
      color: 'cyan'
    },
    {
      id: 'ai-video',
      name: 'AI VIDEO',
      desc: 'Animate your story',
      icon: Icons.Export,
      sparksCost: 100,
      color: 'green'
    },
    {
      id: 'nft',
      name: 'MINT NFT',
      desc: 'Blockchain immortality',
      icon: Icons.Database,
      sparksCost: 150,
      color: 'yellow'
    },
    {
      id: 'game',
      name: 'MINI GAME',
      desc: 'Playable adventure',
      icon: Icons.MythaQuest,
      sparksCost: 80,
      color: 'red'
    }
  ];

  const handleRemix = async (option: typeof remixOptions[0]) => {
    if (!isAdmin && sparksBalance < option.sparksCost) {
      alert(`Need ${option.sparksCost} Sparks. Current balance: ${sparksBalance}`);
      return;
    }

    setSelectedOption(option.id);
    setIsProcessing(true);

    // Deduct sparks
    if (!isAdmin) {
      deductSparks(option.sparksCost);
    }

    // Simulate processing
    setTimeout(() => {
      let processedResult: any = {};

      switch (option.id) {
        case 'song':
          processedResult = {
            type: 'song',
            title: `The Ballad of ${storyData.title || 'Madness'}`,
            lyrics: generateLyrics(storyData.content),
            genre: storyData.genre === 'horror' ? 'Dark Metal' : 'Pop Rock',
            tempo: 120,
            key: 'C Major'
          };
          break;

        case 'poem':
          processedResult = {
            type: 'poem',
            title: storyData.title || 'Untitled Verse',
            content: generatePoem(storyData.content),
            style: 'Free Verse'
          };
          break;

        case 'screenplay':
          processedResult = {
            type: 'screenplay',
            title: `${storyData.title || 'Scene'} - The Movie`,
            content: generateScreenplay(storyData.content, storyData.players),
            pages: 3
          };
          break;

        case 'ai-image':
          // Generate AI image
          aiGenerator.generateImage({
            type: 'image',
            storyContent: storyData.content,
            genre: storyData.genre,
            filledWords: storyData.filledWords || {},
            style: 'digital art'
          }).then(result => {
            if (result.status === 'completed' && result.url) {
              window.open(result.url, '_blank');
            }
          });
          
          processedResult = {
            type: 'image',
            prompt: generateImagePrompt(storyData),
            style: 'Digital Art',
            dimensions: '1024x1024',
            url: `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`,
            status: 'Generating AI artwork...'
          };
          break;

        case 'ai-video':
          // Generate AI video
          aiGenerator.generateVideo({
            type: 'video',
            storyContent: storyData.content,
            genre: storyData.genre,
            filledWords: storyData.filledWords || {},
            style: 'cinematic'
          }).then(result => {
            if (result.status === 'completed' && result.url) {
              window.open(result.url, '_blank');
            }
          });
          
          processedResult = {
            type: 'video',
            title: storyData.title || 'Animated Story',
            duration: '30 seconds',
            fps: 24,
            resolution: '1080p',
            status: 'Generating AI video... (2-3 minutes)'
          };
          break;

        default:
          processedResult = {
            type: option.id,
            status: 'Coming Soon!',
            message: 'This feature is being built by our AI overlords...'
          };
      }

      setResult(processedResult);
      setIsProcessing(false);
    }, 3000);
  };

  const generateLyrics = (content: string) => {
    const lines = content.split('.').filter(l => l.trim());
    return `[Verse 1]\n${lines[0]}\n${lines[1] || 'Oh what a day'}\n\n[Chorus]\n${lines[2] || 'This is our story'}\nIt's legendary!\n\n[Verse 2]\n${lines[3] || 'The adventure continues'}\n${lines[4] || 'Forever and always'}`;
  };

  const generatePoem = (content: string) => {
    const words = content.split(' ').filter(w => w.length > 4);
    return `${words[0] || 'Whispers'} in the ${words[5] || 'darkness'}\n${words[10] || 'Echo'} through the ${words[15] || 'void'}\n${words[20] || 'Dreams'} of ${words[25] || 'tomorrow'}\n${words[30] || 'Forever'} ${words[35] || 'intertwined'}`;
  };

  const generateScreenplay = (content: string, players: string[]) => {
    return `FADE IN:\n\nINT. MYSTERIOUS LOCATION - DAY\n\n${players[0] || 'CHARACTER 1'}\n${content.substring(0, 100)}...\n\n${players[1] || 'CHARACTER 2'}\n(laughing)\nThat's incredible!\n\nCUT TO:`;
  };

  const generateImagePrompt = (data: any) => {
    return `${data.genre} themed artwork featuring ${Object.values(data.filledWords).slice(0, 3).join(', ')}, digital art, highly detailed, cinematic lighting`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-cyan-500/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-tight">
                REMIX YOUR MASTERPIECE
              </h2>
              <p className="text-gray-400 mt-1">Transform your story into something legendary</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result ? (
            <>
              {/* Original Story Preview */}
              <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-2">YOUR STORY</h3>
                <p className="text-white line-clamp-3">{storyData.content}</p>
              </div>

              {/* Remix Options Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {remixOptions.map(option => {
                  const IconComponent = option.icon;
                  const canAfford = isAdmin || sparksBalance >= option.sparksCost;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleRemix(option)}
                      disabled={!canAfford || isProcessing}
                      className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        selectedOption === option.id
                          ? `bg-${option.color}-500/20 border-${option.color}-400 shadow-[0_0_30px_rgba(147,51,234,0.5)]`
                          : canAfford
                            ? 'bg-black/40 border-gray-700 hover:border-gray-600'
                            : 'bg-black/20 border-gray-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing && selectedOption === option.id && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                        </div>
                      )}
                      
                      <IconComponent size={28} className={`text-${option.color}-400 mx-auto mb-2`} />
                      <h4 className="font-black text-xs text-white uppercase tracking-wider mb-1">
                        {option.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {option.desc}
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <Icons.Spark size={12} className="text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">{option.sparksCost}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sparks Balance */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Your Sparks: <span className="text-yellow-400 font-bold">{sparksBalance}</span>
                </p>
              </div>
            </>
          ) : (
            /* Result Display */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-2xl font-black text-white mb-4">
                  {result.type === 'song' ? '🎵 YOUR SONG IS READY!' :
                   result.type === 'poem' ? '📜 YOUR POEM IS COMPLETE!' :
                   result.type === 'screenplay' ? '🎬 SCREENPLAY GENERATED!' :
                   result.type === 'image' ? '🎨 AI ARTWORK CREATED!' :
                   'TRANSFORMATION COMPLETE!'}
                </h3>

                {result.type === 'song' && (
                  <div className="space-y-4">
                    <h4 className="text-xl text-purple-400">{result.title}</h4>
                    <pre className="text-white whitespace-pre-wrap font-mono text-sm">{result.lyrics}</pre>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Genre: {result.genre}</span>
                      <span>Tempo: {result.tempo} BPM</span>
                      <span>Key: {result.key}</span>
                    </div>
                  </div>
                )}

                {result.type === 'poem' && (
                  <div className="space-y-4">
                    <h4 className="text-xl text-purple-400 italic">{result.title}</h4>
                    <pre className="text-white whitespace-pre-wrap italic">{result.content}</pre>
                    <p className="text-sm text-gray-400">Style: {result.style}</p>
                  </div>
                )}

                {result.type === 'screenplay' && (
                  <div className="space-y-4">
                    <h4 className="text-xl text-blue-400">{result.title}</h4>
                    <pre className="text-white whitespace-pre-wrap font-mono text-sm">{result.content}</pre>
                    <p className="text-sm text-gray-400">Pages: {result.pages}</p>
                  </div>
                )}

                {result.type === 'image' && (
                  <div className="space-y-4">
                    <div className="bg-black/60 rounded-lg p-4">
                      <img src={result.url} alt="AI Generated" className="w-full rounded-lg" />
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>Prompt: {result.prompt}</p>
                      <p>Style: {result.style} | Size: {result.dimensions}</p>
                    </div>
                  </div>
                )}

                {result.status === 'Coming Soon!' && (
                  <div className="text-center py-8">
                    <p className="text-xl text-cyan-400 mb-2">{result.status}</p>
                    <p className="text-gray-500">{result.message}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-3 bg-black border border-gray-700 rounded-lg hover:border-gray-600 transition-all font-bold uppercase tracking-wider"
                >
                  Try Another
                </button>
                {result.type === 'song' && (
                  <button
                    onClick={() => onNavigate?.('songforge', { importedLyrics: result.lyrics })}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all font-bold uppercase tracking-wider"
                  >
                    Open in SongForge
                  </button>
                )}
                {result.type === 'poem' || result.type === 'screenplay' && (
                  <button
                    onClick={() => onNavigate?.('stories', { importedContent: result.content })}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-400 hover:to-blue-400 transition-all font-bold uppercase tracking-wider"
                  >
                    Open in StoryForge
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-bold uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
