/**
 * Story-Faithful Converter - Keeps original Angry Lips story intact
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * 
 * Pricing based on actual token usage:
 * - Short conversions: ~500 tokens = 50 Sparks
 * - Medium conversions: ~750 tokens = 75 Sparks  
 * - Long conversions: ~1000 tokens = 100 Sparks
 * - Sequels/Prequels: New Angry Lips generation = 150 Sparks
 */

import React, { useState } from 'react';
import { QuickPurchaseModal } from '../sparks/QuickPurchaseModal';

export interface ConversionOption {
  id: string;
  name: string;
  icon: string;
  sparkCost: number;
  aiCostEstimate: number;
}

interface StoryFaithfulConverterProps {
  originalStory: string;
  storyTitle: string;
  wordContributions?: Array<{ word: string; contributor: string; wordType: string }>;
  onConvert: (format: ConversionOption, convertedStory: string) => void;
  userSparks: number;
  onPurchaseSparks: () => void;
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  { id: 'short-story', name: 'Short Story', icon: '📖', sparkCost: 50, aiCostEstimate: 0.005 },
  { id: 'screenplay', name: 'Screenplay', icon: '🎬', sparkCost: 75, aiCostEstimate: 0.0075 },
  { id: 'poem', name: 'Poem', icon: '🎭', sparkCost: 40, aiCostEstimate: 0.004 },
  { id: 'song', name: 'Song Lyrics', icon: '🎵', sparkCost: 60, aiCostEstimate: 0.006 },
  { id: 'shakespeare', name: 'Shakespearean', icon: '🎩', sparkCost: 80, aiCostEstimate: 0.008 },
  { id: 'zombify', name: 'Zombify', icon: '🧟', sparkCost: 45, aiCostEstimate: 0.0045 },
];

const GENERATION_OPTIONS: ConversionOption[] = [
  { id: 'sequel', name: 'Generate Sequel (New Angry Lips)', icon: '➡️', sparkCost: 150, aiCostEstimate: 0.015 },
  { id: 'prequel', name: 'Generate Prequel (New Angry Lips)', icon: '⬅️', sparkCost: 150, aiCostEstimate: 0.015 },
  { id: 'alternate', name: 'Alternate Version (New Angry Lips)', icon: '🔄', sparkCost: 100, aiCostEstimate: 0.01 },
];

export const StoryFaithfulConverter: React.FC<StoryFaithfulConverterProps> = ({
  originalStory,
  storyTitle,
  wordContributions = [],
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
  const [showContributions, setShowContributions] = useState(false);
  const [showGenerationOptions, setShowGenerationOptions] = useState(false);

  const generateFaithfulVersion = (format: ConversionOption): string => {
    // Parse the original story to maintain its exact narrative
    const sentences = originalStory.match(/[^.!?]+[.!?]+/g) || [originalStory];
    const storySegments = {
      beginning: sentences.slice(0, Math.floor(sentences.length * 0.3)),
      middle: sentences.slice(Math.floor(sentences.length * 0.3), Math.floor(sentences.length * 0.7)),
      end: sentences.slice(Math.floor(sentences.length * 0.7))
    };
    
    switch (format.id) {
      case 'short-story':
        return `"${storyTitle.toUpperCase()}"
A Mad Libs Masterpiece

═══════════════════════════════

THE ORIGINAL TALE:
${originalStory}

═══════════════════════════════

THE EXPANDED VERSION:

Our story begins exactly as you created it: ${storySegments.beginning.join(' ')}

Let me pause here to appreciate the sheer absurdity of what just happened. In any other universe, this sequence of events would be impossible. But in the world of Angry Lips, this is just the beginning.

Continuing with our tale: ${storySegments.middle.join(' ')}

At this point, any reasonable person would have questions. Many questions. But we're not reasonable people - we're Angry Lips players, and we press on.

The conclusion arrives with all the grace of a ${wordContributions[wordContributions.length - 1]?.word || 'finale'}: ${storySegments.end.join(' ')}

And there you have it. A story that began with random words and ended with... well, more random words, but arranged in a way that somehow makes perfect nonsense.

[Created by ${new Set(wordContributions.map(w => w.contributor)).size} brilliant minds]`;

      case 'screenplay':
        return `"${storyTitle.toUpperCase()}"
An Angry Lips Production

FADE IN:

INT. SOMEWHERE ABSURD - DAY

We open on a scene that can only be described as:

${originalStory}

Let's break this down cinematically...

SCENE 1
${storySegments.beginning.join(' ')}

[The camera captures every ridiculous moment]

CUT TO:

SCENE 2  
${storySegments.middle.join(' ')}

[Dramatic music swells inappropriately]

SMASH CUT TO:

SCENE 3
${storySegments.end.join(' ')}

[Freeze frame on the chaos]

NARRATOR (V.O.)
And that's exactly how it happened. 
Every. Single. Word.

FADE OUT.

THE END

"Based on a true Angry Lips session"`;

      case 'poem':
        return `"${storyTitle}"
An Epic Poem of Nonsense

Listen well to this tale most strange,
Of words that came from mental range,
Where ${wordContributions[0]?.word || 'madness'} meets ${wordContributions[1]?.word || 'genius'} in the night,
And Angry Lips makes everything right.

THE ORIGINAL VERSE:
"${originalStory}"

Now in poetic form, behold:

${sentences.map((sentence, i) => {
  const words = sentence.trim().split(' ');
  if (i % 2 === 0) {
    return `${sentence.trim()}\n    So strange and yet so bold!`;
  } else {
    return `    ${sentence.trim()}\n    As our tale unfolds!`;
  }
}).join('\n\n')}

Thus ends our epic, weird but true,
Created by me and also you,
Where random words became our art,
And nonsense touched the human heart.`;

      case 'song':
        const chorus = sentences[0] || storyTitle;
        return `"${storyTitle} (The Angry Lips Song)"

[Verse 1]
${storySegments.beginning.join(' / ')}
That's how our story goes!

[Chorus]
${chorus}
This is what we chose!
Every word we picked was right,
Even though it makes no sense tonight!

[Verse 2]  
${storySegments.middle.join(' / ')}
Can you believe this prose?

[Chorus]
${chorus}
This is what we chose!
Every word we picked was right,
Even though it makes no sense tonight!

[Bridge]
${storySegments.end.join(' / ')}

[Final Chorus]
${originalStory.substring(0, 100)}...
This is our Angry Lips!
(repeat and fade)

© The Mad Libs Musicians`;

      case 'shakespeare':
        return `"${storyTitle}"
Or, "Much Ado About Nonsense"

ACT I
Enter our tale, exactly as 'twas writ:

"${originalStory}"

ACT II
But soft! Let us render it in Shakespeare's tongue:

${sentences.map(s => {
  const shakespearified = s
    .replace(/\byou\b/gi, 'thou')
    .replace(/\byour\b/gi, 'thy')
    .replace(/\bis\b/gi, 'doth be')
    .replace(/\bare\b/gi, 'art');
  return `"${shakespearified}"\n    - Forsooth, 'tis true!`;
}).join('\n\n')}

ACT III
Thus ends our play of Angry Lips,
Where modern madness meets the Bard,
And proves that even Shakespeare's quips
Could not make this less bizarre!

[Exeunt all, confused but entertained]`;

      case 'zombify':
        return `${storyTitle}: ZOMBIE EDITION

SURVIVOR'S LOG - DAY 1:
Found this story scratched on a wall:
"${originalStory}"

DAY 2:
Tried to make sense of it. Failed. Brain hurts. Wait... BRAAAAINS!

DAY 3:
The story... it's spreading... like infection...

${sentences.map(s => `${s} *GROAN* ...but zombified... ${s.replace(/\b(\w+)\b/g, (match, word) => 
  Math.random() > 0.7 ? 'BRAAAAINS' : word
)}`).join('\n\n')}

DAY ???:
We are all infected now. Not with zombie virus. With this STORY. It shambles through our minds, moaning punchlines, lurching between plot points.

THE END... is never THE END... in zombie stories...
*shuffles away*`;

      case 'sequel':
        return generateAngryLipsSequel();
      
      case 'prequel':
        return generateAngryLipsPrequel();
        
      case 'alternate':
        return generateAlternateAngryLips();

      default:
        return `[${format.name} Version]\n\n${originalStory}`;
    }
  };

  const generateAngryLipsSequel = (): string => {
    // Generate a new Mad Libs template based on the original
    const blanks = wordContributions.map(w => `{${w.wordType}}`);
    
    return `${storyTitle} 2: THE SEQUEL
A New Angry Lips Adventure

TEMPLATE FOR YOUR NEXT GAME:

"After the events of '${storyTitle}', our heroes thought they were safe. But then a {ADJECTIVE} {NOUN} appeared from the {PLACE}! 

'Not again!' shouted {NAME}, grabbing their {OBJECT}. 

The {ADJECTIVE} adventure that followed involved {PLURAL_NOUN}, a {VERB}ing {ANIMAL}, and exactly {NUMBER} {FOOD_ITEMS}.

Will they {VERB} their way to victory? Only if they can {VERB} the {ADJECTIVE} {NOUN} before it's too late!"

BLANKS NEEDED (15 total):
1. ADJECTIVE - describing word
2. NOUN - person, place or thing  
3. PLACE - a location
4. NAME - someone's name
5. OBJECT - something you can hold
6. ADJECTIVE - another describing word
7. PLURAL_NOUN - more than one thing
8. VERB - action word ending in 'ing'
9. ANIMAL - any creature
10. NUMBER - any number
11. FOOD_ITEMS - things you eat (plural)
12. VERB - action word
13. VERB - another action word
14. ADJECTIVE - describing word
15. NOUN - person, place or thing

[Save this template for your next Angry Lips session!]`;
  };

  const generateAngryLipsPrequel = (): string => {
    return `${storyTitle}: THE BEGINNING
A Prequel Angry Lips Template

"Before ${storyTitle} ever happened, there was a {ADJECTIVE} time when {NAME} was just a {OCCUPATION}. 

One {TIME_OF_DAY}, they discovered a {ADJECTIVE} {OBJECT} in their {ROOM_IN_HOUSE}. 

'This will {VERB} everything!' they {VERB_PAST_TENSE}.

Little did they know, this would lead to {NUMBER} years of {ADJECTIVE} {PLURAL_NOUN}, setting the stage for the {ADJECTIVE} events that would follow..."

BLANKS NEEDED (13 total):
[Template continues with blank types...]

[Ready to play? This prequel leads directly into your original story!]`;
  };

  const generateAlternateAngryLips = (): string => {
    return `${storyTitle}: ALTERNATE UNIVERSE
What If... Angry Lips Template

Using the SAME word types from your original story, here's a completely different tale:

"In a parallel universe, the {${wordContributions[0]?.wordType || 'ADJECTIVE'}} {${wordContributions[1]?.wordType || 'NOUN'}} never {${wordContributions[2]?.wordType || 'VERB'}}ed at all!

Instead, they became a {${wordContributions[3]?.wordType || 'OCCUPATION'}} and lived in {${wordContributions[4]?.wordType || 'PLACE'}}.

[New template with same word types but different story...]"

[Play again with the same word types for a totally different outcome!]`;
  };

  const handleConversion = async (format: ConversionOption) => {
    // Check if user is admin (unlimited sparks)
    const userId = localStorage.getItem('mythatron_user_id');
    const isAdmin = userId === 'MythaTron' || userId === 'admin';
    
    if (!isAdmin && userSparks < format.sparkCost && userSparks !== Infinity) {
      setPendingFormat(format);
      setShowPurchaseModal(true);
      return;
    }

    setSelectedFormat(format);
    setIsConverting(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const converted = generateFaithfulVersion(format);
    setConvertedStory(converted);
    setShowPreview(true);
    setIsConverting(false);
  };

  const handlePurchaseComplete = (packageId: string) => {
    setShowPurchaseModal(false);
    const newBalance = parseInt(localStorage.getItem('mythatron_sparks') || '0');
    
    if (pendingFormat && newBalance >= pendingFormat.sparkCost) {
      handleConversion(pendingFormat);
    }
    setPendingFormat(null);
  };

  const confirmConversion = () => {
    if (selectedFormat && convertedStory) {
      onConvert(selectedFormat, convertedStory);
      setShowPreview(false);
      setSelectedFormat(null);
      setConvertedStory('');
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-white">Transform Your Story</h3>
          <div className="flex items-center gap-4">
            {wordContributions.length > 0 && (
              <button
                onClick={() => setShowContributions(!showContributions)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all flex items-center gap-2"
                title="Show who contributed what"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Contributors
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400">⚡</span>
              <span className="text-sm text-yellow-400">
                {userSparks === Infinity ? '∞' : userSparks} Sparks
              </span>
            </div>
          </div>
        </div>

        {/* Show contributors */}
        {showContributions && wordContributions.length > 0 && (
          <div className="mb-4 p-4 bg-black/30 rounded-xl">
            <h4 className="text-sm text-white/60 mb-2">Word Contributors:</h4>
            <div className="flex flex-wrap gap-2">
              {wordContributions.map((contrib, idx) => (
                <div
                  key={idx}
                  className="group relative px-2 py-1 bg-white/10 rounded-lg text-xs cursor-help"
                >
                  <span className="text-yellow-400">{contrib.word}</span>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                    {contrib.contributor} ({contrib.wordType})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle between conversions and generations */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowGenerationOptions(false)}
            className={`px-4 py-2 rounded-lg transition-all ${
              !showGenerationOptions 
                ? 'bg-purple-500/30 border border-purple-500/50 text-white' 
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Format Conversions
          </button>
          <button
            onClick={() => setShowGenerationOptions(true)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showGenerationOptions 
                ? 'bg-purple-500/30 border border-purple-500/50 text-white' 
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Generate New Stories
          </button>
        </div>

        {!showPreview ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(showGenerationOptions ? GENERATION_OPTIONS : CONVERSION_OPTIONS).map(option => (
              <button
                key={option.id}
                onClick={() => handleConversion(option)}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all text-left group"
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-medium text-white">{option.name}</div>
                <div className="text-xs text-white/50 mt-1">
                  {option.sparkCost} Sparks
                </div>
                <div className="text-xs text-green-400/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  ~{option.sparkCost * 10} tokens
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">
                {selectedFormat?.icon} {selectedFormat?.name} Preview
              </h4>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white/40 hover:text-white/60"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4 bg-black/30 rounded-xl">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                {convertedStory}
              </pre>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(convertedStory);
                  alert('Copied to clipboard!');
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={confirmConversion}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all"
              >
                Save Conversion
              </button>
            </div>
          </div>
        )}

        {isConverting && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
              <p className="text-white">Transforming your story...</p>
              <p className="text-sm text-white/60 mt-2">Keeping it faithful to your original...</p>
            </div>
          </div>
        )}
      </div>

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
