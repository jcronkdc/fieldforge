/**
 * Story Converter - AI-powered story format transformations
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Pricing Strategy (99% profit margin):
 * - Estimated AI cost per conversion: ~$0.002 (200-500 tokens)
 * - Target price: $0.20 per conversion = 20 Sparks
 * - Profit margin: 99%
 */

import React, { useState } from 'react';
import { QuickPurchaseModal } from '../sparks/QuickPurchaseModal';

export interface ConversionOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  sparkCost: number;
  estimatedLength: string;
}

interface StoryConverterProps {
  originalStory: string;
  storyTitle: string;
  onConvert: (format: ConversionOption, convertedStory: string) => void;
  userSparks: number;
  onPurchaseSparks: () => void;
}

export const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    id: 'short_story',
    name: 'Short Story',
    icon: '📖',
    description: 'Expand into a full narrative with descriptions and dialogue',
    sparkCost: 25, // ~$0.25 for longer output
    estimatedLength: '500-800 words'
  },
  {
    id: 'screenplay',
    name: 'Screenplay',
    icon: '🎬',
    description: 'Professional screenplay format with scene directions',
    sparkCost: 30, // More complex formatting
    estimatedLength: '2-3 pages'
  },
  {
    id: 'poem',
    name: 'Poem',
    icon: '🎭',
    description: 'Transform into rhyming verse or free verse poetry',
    sparkCost: 20, // Shorter output
    estimatedLength: '16-32 lines'
  },
  {
    id: 'song',
    name: 'Song Lyrics',
    icon: '🎵',
    description: 'Create song lyrics with verses, chorus, and bridge',
    sparkCost: 25,
    estimatedLength: '3-4 verses + chorus'
  },
  {
    id: 'shakespeare',
    name: 'Shakespearean',
    icon: '🎩',
    description: 'Rewrite in Elizabethan English with thee and thou',
    sparkCost: 35, // Complex language transformation
    estimatedLength: 'Original length'
  },
  {
    id: 'zombify',
    name: 'Zombify',
    icon: '🧟',
    description: 'Add zombies, apocalypse themes, and survival horror',
    sparkCost: 20,
    estimatedLength: 'Original length + 20%'
  },
  {
    id: 'pirate',
    name: 'Pirate Tale',
    icon: '🏴‍☠️',
    description: 'Arr matey! Transform into pirate speak and adventure',
    sparkCost: 20,
    estimatedLength: 'Original length'
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Version',
    icon: '🚀',
    description: 'Add space travel, aliens, and futuristic technology',
    sparkCost: 25,
    estimatedLength: 'Original length + 30%'
  },
  {
    id: 'noir',
    name: 'Film Noir',
    icon: '🕵️',
    description: 'Dark, cynical detective story with femme fatales',
    sparkCost: 30,
    estimatedLength: '400-600 words'
  },
  {
    id: 'kids',
    name: 'Kids Version',
    icon: '🧸',
    description: 'Simplify language and add wholesome themes',
    sparkCost: 15, // Simpler transformation
    estimatedLength: 'Original length'
  },
  {
    id: 'haiku',
    name: 'Haiku Series',
    icon: '🌸',
    description: 'Transform into a series of connected haikus',
    sparkCost: 15, // Very short output
    estimatedLength: '5-7 haikus'
  },
  {
    id: 'news',
    name: 'News Article',
    icon: '📰',
    description: 'Write as breaking news with quotes and journalism style',
    sparkCost: 25,
    estimatedLength: '300-500 words'
  }
];

export const StoryConverter: React.FC<StoryConverterProps> = ({
  originalStory,
  storyTitle,
  onConvert,
  userSparks,
  onPurchaseSparks
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ConversionOption | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedStory, setConvertedStory] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ConversionOption | null>(null);

  const handleConversion = async (format: ConversionOption) => {
    if (userSparks < format.sparkCost && userSparks !== Infinity) {
      setPendingFormat(format);
      setShowPurchaseModal(true);
      return;
    }

    setSelectedFormat(format);
    setIsConverting(true);

    // Simulate AI conversion with format-specific transformations
    setTimeout(() => {
      let converted = '';
      
      switch (format.id) {
        case 'screenplay':
          converted = `FADE IN:

INT. ${storyTitle.toUpperCase()} - DAY

${originalStory.split('.').map(sentence => {
  if (sentence.trim()) {
    return `\n${sentence.trim().toUpperCase()}\n\n(beat)\n`;
  }
  return '';
}).join('')}

FADE OUT.

THE END`;
          break;

        case 'poem':
          const words = originalStory.split(' ');
          converted = `${storyTitle}\n\n`;
          for (let i = 0; i < words.length; i += 5) {
            converted += words.slice(i, i + 5).join(' ') + ',\n';
            if ((i / 5) % 4 === 3) converted += '\n';
          }
          converted = converted.replace(/,\n$/, '.');
          break;

        case 'shakespeare':
          converted = originalStory
            .replace(/\byou\b/gi, 'thee')
            .replace(/\byour\b/gi, 'thy')
            .replace(/\bare\b/gi, 'art')
            .replace(/\bwas\b/gi, 'wast')
            .replace(/\bhave\b/gi, 'hath')
            .replace(/\bdo\b/gi, 'dost')
            .replace(/\bwill\b/gi, 'shall')
            .replace(/\b(\w+)ing\b/g, '$1eth')
            + '\n\n- Thus ends our tale, forsooth!';
          break;

        case 'zombify':
          converted = originalStory
            .replace(/\bpeople\b/gi, 'survivors')
            .replace(/\bfood\b/gi, 'brains')
            .replace(/\bwalked\b/gi, 'shambled')
            .replace(/\bran\b/gi, 'fled in terror')
            .replace(/\bhappy\b/gi, 'infected')
            .replace(/\bsad\b/gi, 'undead')
            + '\n\n...and then the zombies came. BRAAAAAAINS!';
          break;

        case 'pirate':
          converted = 'Ahoy! ' + originalStory
            .replace(/\bhello\b/gi, 'ahoy')
            .replace(/\byes\b/gi, 'aye')
            .replace(/\bfriend\b/gi, 'matey')
            .replace(/\bmoney\b/gi, 'doubloons')
            .replace(/\btreasure\b/gi, 'booty')
            + ' Arr arr arr!';
          break;

        case 'haiku':
          const sentences = originalStory.split('.');
          converted = sentences.slice(0, 5).map((s, i) => {
            const words = s.trim().split(' ').slice(0, 5);
            return `${words.slice(0, 2).join(' ')}\n${words.slice(2, 4).join(' ')} and ${words[4] || 'more'}\n${['Spring', 'Summer', 'Autumn', 'Winter', 'Morning'][i]} ${['breeze', 'rain', 'snow', 'sun', 'moon'][i]}`;
          }).join('\n\n');
          break;

        case 'song':
          const lines = originalStory.split('.');
          converted = `(Verse 1)\n${lines[0]}\n${lines[1] || 'La la la'}\n\n`;
          converted += `(Chorus)\n${storyTitle}, ${storyTitle}\nOh what a story to tell\n${storyTitle}, ${storyTitle}\nEverything turned out well\n\n`;
          converted += `(Verse 2)\n${lines[2] || 'The story goes on'}\n${lines[3] || 'And on and on'}\n\n`;
          converted += `(Chorus)\n${storyTitle}, ${storyTitle}\nOh what a story to tell\n${storyTitle}, ${storyTitle}\nEverything turned out well\n\n`;
          converted += `(Bridge)\nOoh, ooh, ooh\n${lines[4] || 'What a tale'}\n\n(Repeat Chorus and Fade)`;
          break;

        case 'short_story':
          converted = `${storyTitle}\n\nChapter 1: The Beginning\n\n${originalStory}\n\nAs our heroes reflected on their adventure, they realized that the real treasure was the friends they made along the way. The sun set on another extraordinary day in their remarkable lives.\n\nThe End.`;
          break;

        case 'news':
          converted = `BREAKING NEWS: ${storyTitle}\n\nIn an extraordinary turn of events today, ${originalStory}\n\nWitnesses at the scene reported being "completely amazed" by what transpired. Local authorities are investigating the incident, though no charges are expected to be filed.\n\n"We've never seen anything quite like this," said one official who wished to remain anonymous.\n\nMore details as this story develops.`;
          break;

        case 'scifi':
          converted = `Stardate 2425.3: ${originalStory.replace(/\bcar\b/gi, 'hovercraft').replace(/\bphone\b/gi, 'neural implant').replace(/\bhouse\b/gi, 'space station').replace(/\bEarth\b/gi, 'Terra Prime')}\n\nThe quantum flux capacitor hummed softly as our story concluded in the Andromeda sector.`;
          break;

        case 'noir':
          converted = `The rain fell on the city like bullets from heaven. ${originalStory}\n\nI lit another cigarette and watched the smoke curl up toward the ceiling fan. In this city, everyone's got a story. This was just another one of them. The dame was trouble, but aren't they always?`;
          break;

        case 'kids':
          converted = originalStory
            .replace(/\bbad\b/gi, 'not very nice')
            .replace(/\bscary\b/gi, 'a little spooky')
            .replace(/\bdied\b/gi, 'went to sleep')
            .replace(/\bkilled\b/gi, 'sent away')
            + '\n\n🌈 And they all lived happily ever after! The end! 🌈';
          break;

        default:
          converted = originalStory + '\n\n[Converted to ' + format.name + ']';
      }

      setConvertedStory(converted);
      setShowPreview(true);
      setIsConverting(false);
    }, 1500);
  };

  const confirmConversion = () => {
    if (selectedFormat && convertedStory) {
      onConvert(selectedFormat, convertedStory);
      setShowPreview(false);
      setSelectedFormat(null);
      setConvertedStory('');
    }
  };

  const handlePurchaseComplete = (packageId: string) => {
    setShowPurchaseModal(false);
    // Refresh sparks balance
    const newBalance = parseInt(localStorage.getItem('mythatron_sparks') || '0');
    
    // Try the conversion again with the new balance
    if (pendingFormat && newBalance >= pendingFormat.sparkCost) {
      handleConversion(pendingFormat);
    }
    setPendingFormat(null);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-white">Transform Your Story</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-400">⚡</span>
            <span className="text-sm text-yellow-400">
              {userSparks === Infinity ? '∞' : userSparks} Sparks
            </span>
          </div>
        </div>

      {!showPreview ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CONVERSION_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => handleConversion(option)}
              disabled={isConverting}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white group-hover:text-purple-300">
                    {option.name}
                  </h4>
                  <p className="text-xs text-white/40 mt-1">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-white/60">
                      {option.estimatedLength}
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">
                      {option.sparkCost} ⚡
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg text-white">
              {selectedFormat?.icon} {selectedFormat?.name} Preview
            </h4>
            <button
              onClick={() => setShowPreview(false)}
              className="text-white/40 hover:text-white/60"
            >
              ✕
            </button>
          </div>

          <div className="p-4 bg-black/30 rounded-xl max-h-96 overflow-y-auto">
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
              {convertedStory}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={confirmConversion}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all"
            >
              Save Conversion ({selectedFormat?.sparkCost} Sparks)
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

        {isConverting && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
              <p className="text-white">Transforming your story...</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Purchase Modal */}
      {showPurchaseModal && pendingFormat && (
        <QuickPurchaseModal
          requiredSparks={pendingFormat.sparkCost}
          currentSparks={userSparks === Infinity ? 0 : userSparks}
          onPurchase={handlePurchaseComplete}
          onClose={() => {
            setShowPurchaseModal(false);
            setPendingFormat(null);
          }}
        />
      )}
    </>
  );
};
