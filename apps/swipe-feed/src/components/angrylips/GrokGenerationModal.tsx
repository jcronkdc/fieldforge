/**
 * Grok Generation Modal - Image & Video generation with strict cost controls
 * CRITICAL: Every generation requires explicit user consent and Sparks payment
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState } from 'react';
import { useSparks } from '../sparks/SparksContext';
import { GrokGenerationController } from '../../lib/xaiGrokIntegration';

interface GrokGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyText: string;
  userWords: Record<string, string>;
  onGenerated?: (url: string, type: 'image' | 'video') => void;
}

export const GrokGenerationModal: React.FC<GrokGenerationModalProps> = ({
  isOpen,
  onClose,
  storyText,
  userWords,
  onGenerated
}) => {
  const { balance, deductSparks, isAdmin } = useSparks();
  const [controller] = useState(() => new GrokGenerationController());
  const [selectedType, setSelectedType] = useState<'image' | 'video' | 'bundle'>('image');
  const [selectedResolution, setSelectedResolution] = useState<'standard' | 'hd' | 'ultra' | '4k'>('standard');
  const [selectedDuration, setSelectedDuration] = useState<'3_seconds' | '5_seconds' | '10_seconds' | '15_seconds'>('3_seconds');
  const [selectedStyle, setSelectedStyle] = useState<'comic' | 'realistic' | 'surreal' | 'anime' | 'cartoon' | 'stopmotion'>('comic');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const pricing = controller.getPricingInfo();
  
  // Get current cost based on selection
  const getCurrentCost = (): { sparks: number; usd: string } => {
    if (selectedType === 'bundle') {
      // Bundle pricing: 25% discount on combined cost
      const imagePrice = pricing.image.find(p => p.resolution === selectedResolution) || { sparks: 0 };
      const videoPrice = pricing.video.find(p => p.duration === selectedDuration.replace('_', ' ')) || { sparks: 0 };
      const totalSparks = Math.floor((imagePrice.sparks + videoPrice.sparks) * 0.75); // 25% discount
      return { sparks: totalSparks, usd: `$${(totalSparks * 0.02).toFixed(2)}` };
    } else if (selectedType === 'image') {
      const price = pricing.image.find(p => p.resolution === selectedResolution);
      return price || { sparks: 0, usd: '$0' };
    } else {
      const price = pricing.video.find(p => p.duration === selectedDuration.replace('_', ' '));
      return price || { sparks: 0, usd: '$0' };
    }
  };

  const currentCost = getCurrentCost();
  const canAfford = isAdmin || balance >= currentCost.sparks;

  const handleGenerate = async () => {
    if (!canAfford) {
      setError(`You need ${currentCost.sparks} Sparks. Current balance: ${balance}`);
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmedGeneration = async () => {
    setShowConfirmation(false);
    setIsGenerating(true);
    setError(null);

    try {
      if (selectedType === 'bundle') {
        // Generate both image and video for bundle
        const imageResult = await controller.requestImageGeneration(
          'user_id', // Would get from auth context
          balance,
          storyText,
          userWords,
          {
            resolution: selectedResolution,
            style: selectedStyle as any,
            userConsent: true
          }
        );

        if (!imageResult.success) {
          setError(imageResult.error || 'Image generation failed');
          setIsGenerating(false);
          return;
        }

        const highlight = storyText.split('.')[0] + '.';
        const videoResult = await controller.requestVideoGeneration(
          'user_id',
          balance,
          highlight,
          {
            duration: selectedDuration,
            style: selectedStyle as any,
            userConsent: true
          }
        );

        if (!videoResult.success) {
          setError(videoResult.error || 'Video generation failed');
          setIsGenerating(false);
          return;
        }

        // Deduct bundle cost
        if (!isAdmin) {
          deductSparks(currentCost.sparks);
        }

        setGeneratedUrl(imageResult.imageUrl || null);
        setGeneratedVideoUrl(videoResult.videoUrl || null);
        
        if (onGenerated) {
          if (imageResult.imageUrl) onGenerated(imageResult.imageUrl, 'image');
          if (videoResult.videoUrl) onGenerated(videoResult.videoUrl, 'video');
        }
        
      } else {
        let result;
        
        if (selectedType === 'image') {
          result = await controller.requestImageGeneration(
            'user_id',
            balance,
            storyText,
            userWords,
            {
              resolution: selectedResolution,
              style: selectedStyle as any,
              userConsent: true
            }
          );
        } else {
          const highlight = storyText.split('.')[0] + '.';
          result = await controller.requestVideoGeneration(
            'user_id',
            balance,
            highlight,
            {
              duration: selectedDuration,
              style: selectedStyle as any,
              userConsent: true
            }
          );
        }

        if (result.success && result.sparksCharged) {
          if (!isAdmin) {
            deductSparks(result.sparksCharged);
          }
          
          setGeneratedUrl(result.imageUrl || result.videoUrl || null);
          
          if (onGenerated && (result.imageUrl || result.videoUrl)) {
            onGenerated(result.imageUrl || result.videoUrl || '', selectedType);
          }
        } else {
          setError(result.error || 'Generation failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Bring Your Story to Life! 🎨
            </h2>
            <p className="text-white/70">
              Generate stunning visuals with Grok 2 AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Premium Feature</h3>
              <p className="text-sm text-yellow-300/80">
                Image and video generation uses advanced AI and requires Sparks. 
                Each generation is non-refundable once processed.
              </p>
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Choose Generation Type</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <button
              onClick={() => setSelectedType('image')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'image'
                  ? 'bg-purple-500/30 border-purple-400 scale-105'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">🖼️</div>
              <div className="font-semibold text-white">Image</div>
              <div className="text-xs text-white/60 mt-1">Static artwork</div>
            </button>
            <button
              onClick={() => setSelectedType('video')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'video'
                  ? 'bg-purple-500/30 border-purple-400 scale-105'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">🎬</div>
              <div className="font-semibold text-white">Video</div>
              <div className="text-xs text-white/60 mt-1">Animated clip</div>
            </button>
          </div>
          
          {/* Bundle Option */}
          <button
            onClick={() => setSelectedType('bundle' as any)}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedType === 'bundle'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 scale-[1.02]'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎨✨</div>
                <div className="text-left">
                  <div className="font-semibold text-white">Complete Bundle</div>
                  <div className="text-xs text-white/60">Image + Video combo</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs line-through text-gray-500">200 Sparks</div>
                <div className="text-sm font-bold text-green-400">150 Sparks</div>
                <div className="text-xs text-purple-400 font-semibold">SAVE 25%!</div>
              </div>
            </div>
          </button>
        </div>

        {/* Resolution/Duration Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            {selectedType === 'bundle' ? 'Bundle Options' : selectedType === 'image' ? 'Image Quality' : 'Video Duration'}
          </h3>
          {selectedType === 'bundle' ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">Image Quality</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pricing.image.map(option => (
                    <button
                      key={option.resolution}
                      onClick={() => setSelectedResolution(option.resolution as any)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedResolution === option.resolution
                          ? 'bg-purple-500/30 border-purple-400'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{option.resolution}</div>
                      <div className="text-xs text-white/60 mt-1">{option.sparks} Sparks</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">Video Duration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pricing.video.map(option => (
                    <button
                      key={option.duration}
                      onClick={() => setSelectedDuration(option.duration.replace(' ', '_') as any)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedDuration === option.duration.replace(' ', '_')
                          ? 'bg-purple-500/30 border-purple-400'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{option.duration}</div>
                      <div className="text-xs text-white/60 mt-1">{option.sparks} Sparks</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedType === 'image' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pricing.image.map(option => (
                <button
                  key={option.resolution}
                  onClick={() => setSelectedResolution(option.resolution as any)}
                  disabled={!isAdmin && balance < option.sparks}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedResolution === option.resolution
                      ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-blue-400'
                      : !isAdmin && balance < option.sparks
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-white capitalize">{option.resolution}</div>
                  <div className="text-xl font-bold text-purple-400">{option.sparks}</div>
                  <div className="text-xs text-white/60">{option.usd}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pricing.video.map(option => (
                <button
                  key={option.duration}
                  onClick={() => setSelectedDuration(option.duration.replace(' ', '_') as any)}
                  disabled={!isAdmin && balance < option.sparks}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedDuration === option.duration.replace(' ', '_')
                      ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-blue-400'
                      : !isAdmin && balance < option.sparks
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-white">{option.duration}</div>
                  <div className="text-xl font-bold text-purple-400">{option.sparks}</div>
                  <div className="text-xs text-white/60">{option.usd}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Art Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedType === 'image' ? (
              <>
                {['comic', 'realistic', 'surreal', 'anime'].map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style as any)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedStyle === style
                        ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-pink-400'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="capitalize text-white">{style}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {style === 'comic' && '💥 Action-packed'}
                      {style === 'realistic' && '📸 Photorealistic'}
                      {style === 'surreal' && '🌀 Dreamlike'}
                      {style === 'anime' && '🎌 Japanese style'}
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <>
                {['cartoon', 'realistic', 'stopmotion'].map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style as any)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedStyle === style
                        ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-pink-400'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="capitalize text-white">{style}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {style === 'cartoon' && '🎨 Animated'}
                      {style === 'realistic' && '🎬 Cinematic'}
                      {style === 'stopmotion' && '🎭 Claymation'}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/70">Generation Cost:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">{currentCost.sparks} Sparks</div>
              <div className="text-sm text-white/60">{currentCost.usd}</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Your Balance:</span>
            <div className="text-right">
              <div className="text-xl font-semibold text-white">{balance} Sparks</div>
              {isAdmin && <div className="text-xs text-green-400">Admin (Free)</div>}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">❌</span>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Generated Result */}
        {(generatedUrl || generatedVideoUrl) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              {selectedType === 'bundle' ? 'Your Complete Bundle!' : 'Your Creation!'}
            </h3>
            
            {selectedType === 'bundle' && generatedUrl && generatedVideoUrl ? (
              <div className="space-y-4">
                {/* Image Result */}
                <div className="bg-black/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">🖼️ Artwork</h4>
                  <img 
                    src={generatedUrl} 
                    alt="Generated artwork" 
                    className="w-full rounded-lg"
                  />
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedUrl;
                      link.download = `angry-lips-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    Save Image
                  </button>
                </div>
                
                {/* Video Result */}
                <div className="bg-black/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">🎬 Animation</h4>
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    className="w-full rounded-lg"
                  />
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedVideoUrl;
                      link.download = `angry-lips-video-${Date.now()}.mp4`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Save Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/50 rounded-xl p-4">
                {selectedType === 'image' ? (
                  <img 
                    src={generatedUrl} 
                    alt="Generated artwork" 
                    className="w-full rounded-lg"
                    id="generated-image"
                  />
                ) : (
                  <video 
                    src={generatedUrl} 
                    controls 
                    className="w-full rounded-lg"
                    id="generated-video"
                  />
                )}
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => {
                      // Download functionality
                      const link = document.createElement('a');
                      link.href = generatedUrl;
                      link.download = `angry-lips-${selectedType}-${Date.now()}.${selectedType === 'image' ? 'png' : 'mp4'}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Save to Device
                  </span>
                </button>
                <button 
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: 'My Angry Lips Creation',
                        text: 'Check out what I created with Angry Lips!',
                        url: window.location.href
                      });
                    } else {
                      // Fallback: Copy to clipboard
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share
                  </span>
                </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-white font-semibold"
          >
            {generatedUrl ? 'Close' : 'Cancel'}
          </button>
          {!generatedUrl && (
            <button
              onClick={handleGenerate}
              disabled={!canAfford || isGenerating}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                canAfford && !isGenerating
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-white/10 border border-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Generating...
                </span>
              ) : (
                `Generate for ${currentCost.sparks} Sparks`
              )}
            </button>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/50">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Generation</h3>
              <p className="text-white/80 mb-6">
                You are about to spend <span className="font-bold text-purple-400">{currentCost.sparks} Sparks</span> ({currentCost.usd}) 
                to generate {selectedType === 'image' ? 'an image' : 'a video'}.
                This action cannot be undone.
              </p>
              <div className="bg-black/30 rounded-lg p-3 mb-6">
                <div className="text-sm text-white/60">
                  <div>Type: {selectedType === 'image' ? `${selectedResolution} image` : selectedDuration.replace('_', ' ') + ' video'}</div>
                  <div>Style: {selectedStyle}</div>
                  <div>Cost: {currentCost.sparks} Sparks</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedGeneration}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold transition-all"
                >
                  Confirm & Generate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
