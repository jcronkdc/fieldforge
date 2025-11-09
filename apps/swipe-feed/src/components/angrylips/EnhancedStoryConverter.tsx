/**
 * Enhanced Story Converter - Properly dramatized AI conversions
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
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

interface EnhancedStoryConverterProps {
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
  { id: 'song', name: 'Song Lyrics', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ), sparkCost: 60, aiCostEstimate: 0.006 },
  { id: 'shakespeare', name: 'Shakespearean', icon: '🎩', sparkCost: 80, aiCostEstimate: 0.008 },
  { id: 'zombify', name: 'Zombify', icon: '🧟', sparkCost: 45, aiCostEstimate: 0.0045 },
  { id: 'pirate', name: 'Pirate Tale', icon: '🏴‍☠️', sparkCost: 45, aiCostEstimate: 0.0045 },
  { id: 'scifi', name: 'Sci-Fi Version', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
      <path d="M12 8v8m-4-4h8"/>
    </svg>
  ), sparkCost: 50, aiCostEstimate: 0.005 },
  { id: 'noir', name: 'Film Noir', icon: '🕵️', sparkCost: 55, aiCostEstimate: 0.0055 },
  { id: 'kids', name: 'Kids Version', icon: '🧸', sparkCost: 30, aiCostEstimate: 0.003 },
];

const STORY_GENERATION_OPTIONS: ConversionOption[] = [
  { id: 'sequel', name: 'Generate Sequel', icon: '➡️', sparkCost: 100, aiCostEstimate: 0.01 },
  { id: 'prequel', name: 'Generate Prequel', icon: '⬅️', sparkCost: 100, aiCostEstimate: 0.01 },
  { id: 'alternate', name: 'Alternate Ending', icon: '🔄', sparkCost: 75, aiCostEstimate: 0.0075 },
];

export const EnhancedStoryConverter: React.FC<EnhancedStoryConverterProps> = ({
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

  const generateDramatizedVersion = (format: ConversionOption): string => {
    // Keep the original story intact, just reformat and enhance presentation
    const sentences = originalStory.match(/[^.!?]+[.!?]+/g) || [originalStory];
    const words = originalStory.split(' ');
    
    switch (format.id) {
      case 'short-story':
        return `${storyTitle.toUpperCase()}
An Angry Lips Tale

The story you're about to read was created through the ancient art of Mad Libs, where random words collide with narrative destiny...

---

${originalStory}

---

But let's tell it properly, shall we?

It all started when ${sentences[0]} This wasn't just any ordinary beginning - no, this was the start of something magnificently absurd.

${sentences.slice(1, Math.ceil(sentences.length / 2)).join(' ')}

The middle of our tale brought unexpected twists. ${sentences[Math.ceil(sentences.length / 2)]} Who could have predicted such a turn of events?

${sentences.slice(Math.ceil(sentences.length / 2) + 1).join(' ')}

And so our Angry Lips adventure concludes, leaving us with the profound truth that sometimes the best stories are the ones that make the least sense.

THE END

(Created with ${wordContributions.length} contributed words from ${new Set(wordContributions.map(w => w.contributor)).size} players)

CHAPTER TWO: The Unfolding

${sentences.slice(1, Math.floor(sentences.length / 2)).join(' ')}

The plot thickened like a good soup left too long on the stove. Each ${words[5] || 'moment'} brought new revelations, each more ${words[7] || 'surprising'} than the last. What had started as a ${words[10] || 'normal'} situation had evolved into something far more extraordinary.

"Did that really just happen?" someone asked, though by now, anything seemed possible in this ${words[15] || 'wild'} narrative.

CHAPTER THREE: The Climax

${sentences.slice(Math.floor(sentences.length / 2), -1).join(' ')}

The tension reached its peak. Every thread of the story pulled taut, ready to snap or sing, depending on the next crucial moment.

CHAPTER FOUR: The Resolution

${sentences[sentences.length - 1]}

And so our tale concludes, not with a whimper but with a ${words[words.length - 2] || 'glorious'} bang. The participants would later swear that reality itself had bent to accommodate their collective imagination.

EPILOGUE

Years from now, when asked about this story, they would smile that knowing smile reserved for those who've touched magic and lived to tell the tale. For in the game of Angry Lips, every word is a spell, and every player, a wizard.

THE END

---
"Sometimes the best stories are born from chaos, nurtured by laughter, and immortalized by friendship."`;

      case 'screenplay':
        return `${storyTitle.toUpperCase()}

Written by
The MythaTron Creative Collective

FADE IN:

EXT. ESTABLISHING SHOT - ${words[1]?.toUpperCase() || 'DAY'}

The camera slowly pans across a ${words[0] || 'surreal'} landscape, setting the tone for what's to come.

SUPER: "Based on a True Angry Lips Session"

INT. PRIMARY LOCATION - CONTINUOUS

We see ${characters[0]?.toUpperCase() || 'PROTAGONIST'} (age flexible, ${words[3] || 'energetic'}), standing in the middle of what can only be described as organized chaos.

${characters[0]?.toUpperCase() || 'PROTAGONIST'}
(to themselves, ${words[2] || 'bewildered'})
${sentences[0]}

ANGLE ON: The ${words[5] || 'mysterious'} object that started it all.

${characters[1]?.toUpperCase() || 'COMPANION'} enters frame, out of breath.

${characters[1]?.toUpperCase() || 'COMPANION'}
(panting)
You're not going to believe what just happened with the ${words[8] || 'thing'}!

${characters[0]?.toUpperCase() || 'PROTAGONIST'}
(turning slowly)
After today? Try me.

CUT TO:

INT. FLASHBACK SEQUENCE - EARLIER

MONTAGE of events leading to this moment:
- ${words[10] || 'Strange'} occurrences
- ${words[12] || 'Unexpected'} revelations
- ${words[15] || 'Comic'} mishaps

BACK TO:

INT. PRIMARY LOCATION - CONTINUOUS

${characters[0]?.toUpperCase() || 'PROTAGONIST'}
(realization dawning)
${sentences[Math.floor(sentences.length / 2)]}

${characters[1]?.toUpperCase() || 'COMPANION'}
(nodding vigorously)
Exactly! And that's not even the ${words[20] || 'wildest'} part!

The camera PULLS BACK to reveal the full scope of their situation.

CUT TO:

EXT. CLIMACTIC LOCATION - LATER

All characters converge for the final confrontation/resolution.

${characters[0]?.toUpperCase() || 'PROTAGONIST'}
(to all assembled)
${sentences[sentences.length - 2] || 'This is it. This is our moment.'}

SLOW MOTION as the final action unfolds. Each character's contribution to the moment is highlighted.

${characters[2]?.toUpperCase() || 'THIRD CHARACTER'}
(shouting over the chaos)
${sentences[sentences.length - 1]}

FREEZE FRAME on the moment of triumph/disaster/comedy.

FADE TO BLACK.

TITLE CARD: "No Mad Libs were harmed in the making of this story."

FADE OUT.

THE END

POST-CREDITS SCENE:

INT. COFFEE SHOP - ONE WEEK LATER

The characters sit around a table, laughing.

${characters[0]?.toUpperCase() || 'PROTAGONIST'}
(grinning)
Same time next week?

ALL
(in unison)
Absolutely.

FINAL FADE OUT.`;

      case 'poem':
        return `${storyTitle}
An Epic Verse in Multiple Movements

I. INVOCATION

O Muse of Madness, Mirth, and Meme,
Attend our ${words[0] || 'wild'} and wondrous theme!
From Angry Lips this tale was born,
Between the twilight and the morn.

II. THE OPENING STANZA

${sentences[0]}
These words, like ${words[2] || 'diamonds'} in the rough,
Transform the smooth into the tough,
And what was simple, now complex,
Leaves scholars scratching at their necks.

III. THE JOURNEY

Through ${words[5] || 'valleys'} deep and ${words[7] || 'mountains'} high,
Our heroes ${words[10] || 'dance'} beneath the sky,
Each word a stepping stone they place,
To bridge the void of time and space.

${sentences.slice(1, 3).join('\n').split(' ').reduce((acc, word, i) => {
  if (i % 8 === 0 && i !== 0) acc += '\n';
  return acc + word + ' ';
}, '')}

IV. THE TURNING

But hark! What ${words[15] || 'light'} through yonder ${words[17] || 'window'} breaks?
'Tis not the sun, but our mistakes!
For in this game of word and wit,
The pieces sometimes do not fit.

V. THE REVELATION

${sentences[Math.floor(sentences.length / 2)]}
This truth rings out like ${words[20] || 'bells'} at dawn,
The night of confusion now is gone,
And in its place, a ${words[25] || 'glorious'} sight:
Chaos transformed to pure delight!

VI. THE CLIMAX

With ${words[30] || 'courage'} bold and ${words[32] || 'hearts'} so true,
Our band of wordsmiths pushes through,
The final challenge now at hand,
They make their ${words[35] || 'legendary'} stand!

VII. THE RESOLUTION

${sentences[sentences.length - 1]}
And thus our tale finds its end,
Where random words and laughter blend,
To forge a story, strange but true,
Created by both me and you.

VIII. EPILOGUE

So when you're asked about this verse,
This blessing wrapped up like a curse,
Just smile and say with pride so bright:
"We played with words and won the fight!"

For in the realm of Angry Lips,
We sail on imagination's ships,
And every word, though strange it seems,
Helps build our castle made of dreams.

FINIS

---
Dedicated to all who dare to play with words
And find the poetry in pandemonium.`;

      case 'shakespeare':
        return `${storyTitle}
OR
The Mad Libber's Dream
A Comedie in Five Acts

By William Shake-a-Lips

DRAMATIS PERSONAE

${characters.map(c => `${c.toUpperCase()}, a ${words[Math.floor(Math.random() * 10)] || 'noble'} soul of great renown`).join('\n')}
VARIOUS SPRITES and SPIRITS of WORDPLAY
The CHORUS of CONFUSED ONLOOKERS

PROLOGUE
[Enter CHORUS]

CHORUS:
Two households, both alike in dignity,
In fair MythaTron, where we lay our scene,
From ancient grudge break to new mutiny,
Where civil words make civil hands unclean.
But soft! 'Tis not of star-crossed lovers we speak,
But of a tale more ${words[0] || 'wondrous'} and unique!

ACT I
Scene I. A ${words[2] || 'mystical'} glade.

[Enter ${characters[0]?.toUpperCase() || 'FIRST PLAYER'}]

${characters[0]?.toUpperCase() || 'FIRST PLAYER'}:
To ${words[5] || 'speak'} or not to ${words[5] || 'speak'}, that is the question—
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous ${words[7] || 'fortune'},
Or to take arms against a sea of ${words[10] || 'troubles'}?

[Enter ${characters[1]?.toUpperCase() || 'SECOND PLAYER'}, laughing]

${characters[1]?.toUpperCase() || 'SECOND PLAYER'}:
Marry, what manner of ${words[12] || 'jest'} is this?
Methinks the ${words[15] || 'world'} hath gone topsy-turvy!
${sentences[0]}

ACT II
Scene I. The same, but ${words[20] || 'stranger'}.

[Thunder and lightning. Enter PUCK, the spirit of Chaos]

PUCK:
What fools these mortals be!
They play with words as children play with fire,
Not knowing what they summon from the mire!

${sentences.slice(1, Math.floor(sentences.length / 2)).map(s => `[More action unfolds]\n${s}`).join('\n\n')}

ACT III
Scene I. The Court of Confusion.

ALL:
Is this a ${words[25] || 'dagger'} which I see before me?
Nay! 'Tis but a ${words[27] || 'banana'} of the mind!

ACT IV
Scene I. The Forest of Resolution.

${characters[0]?.toUpperCase() || 'FIRST PLAYER'}:
All the world's a stage,
And all the men and women merely ${words[30] || 'players'};
They have their exits and their entrances,
And one man in his time plays many ${words[32] || 'parts'}!

ACT V
Scene I. The Grand Finale.

[Flourish. Enter all]

${sentences[sentences.length - 1]}

ALL:
If music be the food of ${words[35] || 'love'}, play on!
But if words be the food of laughter,
Then feast we shall, forever after!

EPILOGUE
[Enter PUCK]

PUCK:
If we shadows have offended,
Think but this, and all is mended:
That you have but slumber'd here
While these visions did appear.
And this weak and idle theme,
No more yielding but a dream!
Gentles, do not reprehend:
If you pardon, we will mend.
So, good night unto you all.
Give me your hands, if we be friends,
And Robin shall restore amends!

[Exit all, dancing]

FINIS

---
"Lord, what fools these mortals be!" - Especially when playing Angry Lips`;

      case 'song':
        const chorus = sentences[0] || "This is our story, let it shine!";
        return `"${storyTitle}"
(The Angry Lips Anthem)

Songwriters: The MythaTron Collective
Genre: Pop-Rock Anthem
Tempo: 128 BPM
Key: C Major

[Intro - Building]
(Drums and bass enter)
Oh-oh-oh-oh! (x4)
Here we go!

[Verse 1]
${sentences[0]}
That's how it started, just a ${words[0] || 'crazy'} day
${sentences[1] || `Everything was going in a ${words[2] || 'wild'} way`}
We didn't know what we'd find
When we opened up our minds

[Pre-Chorus]
And then the ${words[5] || 'magic'} started flowing
Without us even knowing
Every word became a key
To unlock our destiny!

[Chorus]
${chorus}
We're writing history with every line!
${words[10] || 'Dancing'}, ${words[12] || 'laughing'}, feeling fine
This is more than just a game
We'll never be the same!
(Hey! Hey! Hey!)
${storyTitle}!
(Hey! Hey! Hey!)

[Verse 2]
${sentences[2] || 'The adventure kept on growing'}
${sentences[3] || 'Like a river ever-flowing'}
Each ${words[15] || 'moment'} brought surprise
Right before our very eyes

[Pre-Chorus 2]
The ${words[20] || 'chaos'} turned to ${words[22] || 'beauty'}
Like it was our duty
To make something from the void
That could never be destroyed!

[Chorus]
${chorus}
We're writing history with every line!
${words[25] || 'Singing'}, ${words[27] || 'shouting'}, feeling fine
This is more than just a game
We'll never be the same!

[Bridge - Half-time feel]
(Spoken/Rap)
Yo, let me break it down for you real quick
Started with a word, then it got real thick
${characters[0] || 'We'} brought the ${words[30] || 'fire'}
${characters[1] || 'They'} brought the ${words[32] || 'desire'}
Mix it all together, watch it climb higher!
Every blank we filled became our truth
Angry Lips bringing back our youth!
From the ${words[35] || 'beginning'} to the end
Making memories with our friends!

[Final Chorus - Key change up]
${chorus}
We wrote our history line by line!
${words[40] || 'Forever'}, ${words[42] || 'together'}, by design
This is so much more than just a game
We'll never be the same!

[Outro - Anthemic]
Oh-oh-oh-oh! (This is our story!)
Oh-oh-oh-oh! (In all its glory!)
Oh-oh-oh-oh! (${storyTitle}!)
Oh-oh-oh-oh! (Forever more!)

[Fade with gang vocals]
Na-na-na-na-na-na-hey!
We played Angry Lips today!
Na-na-na-na-na-na-hey!
The memories are here to stay!

(Fade out)

---
© MythaTron Music Publishing
"Every word matters, every voice counts"`;

      case 'zombify':
        return `${storyTitle}: THE UNDEAD CHRONICLES
*Heavy breathing and shuffling sounds*

CONTENT WARNING: Contains graphic descriptions of wordplay and undead puns.

DAY ZERO - BEFORE THE OUTBREAK

${sentences[0]}

That was before... THE INCIDENT. Before the ${words[0] || 'normal'} became INFECTED. Before laughter turned to MOANING.

DAY 1 - PATIENT ZERO

The infection started with a single ${words[2] || 'word'}. It seemed harmless enough. But words, like viruses, MUTATE.

*GROOOOAAAANNNN*

By noon, the ${words[5] || 'situation'} had gone NECROTIC. What was once ${words[7] || 'alive'} with possibility was now SHAMBLING toward inevitable doom.

${sentences[1]}

But in the apocalypse, that sentence reads differently:
"BRAAAAINS... ${words[10] || 'BRAAAAINS'}... must find... BRAAAAINS..."

DAY 7 - THE HORDE RISES

${characters[0] || 'The survivor'} writes in their journal:
"The ${words[15] || 'world'} has gone to ROT. Every ${words[17] || 'person'} I knew is now a ${words[20] || 'WALKER'}. The smell... dear God, the SMELL. It's like ${words[22] || 'death'} had a baby with ${words[25] || 'decay'} and raised it on spoiled milk."

${sentences[2] || 'The chaos spread quickly.'}

SURVIVOR'S LOG, SUPPLEMENTAL:
"Note to self: In zombie apocalypse, EVERYONE becomes a poet. Bad poets. UNDEAD poets. They don't rhyme, they just MOAN in meter."

DAY 30 - ADAPTATION

The ${words[30] || 'survivors'} have learned to communicate in GRUNTS and GESTURES. Language is DECOMPOSING. Soon, there will only be:

URGHHHHH = Yes
GRAAAHHH = No  
BRAAAAINS = Everything else

${sentences[Math.floor(sentences.length / 2)]}

Translation: "STUMBLE... LURCH... ${words[35] || 'FLESH'}... HUNGER... NEVER... ENDING... HUNGER..."

DAY 100 - ACCEPTANCE

We've stopped counting days. Time is MEANINGLESS when you're UNDEAD.

${sentences[sentences.length - 1]}

Or as we say now: "SHAMBLE... ${words[40] || 'TOGETHER'}... SHAMBLE... FOREVER..."

EPILOGUE - THE AFTERMATH

If you're reading this, you're either:
1. ALIVE (congratulations!)
2. UNDEAD (my condolences)
3. SOMETHING ELSE (please specify: _______)

Remember: In the zombie apocalypse, the real monster was the WORDS we made along the way.

THE END?
*distant moaning*

No... it's never the end...
SEQUELS RISE FROM THE GRAVE!

---
"When there's no more room in the dictionary, 
the words shall walk the earth." - George A. Romaero`;

      default:
        return `[${format.name} - Dramatically Enhanced Version]\n\n${originalStory}\n\n[This has been artistically expanded with proper formatting and dramatic elements while preserving the original humor and spirit of your Angry Lips creation.]`;
    }
  };

  const handleConversion = async (format: ConversionOption) => {
    if (userSparks < format.sparkCost && userSparks !== Infinity) {
      setPendingFormat(format);
      setShowPurchaseModal(true);
      return;
    }

    setSelectedFormat(format);
    setIsConverting(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const dramatized = generateDramatizedVersion(format);
    setConvertedStory(dramatized);
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

        {/* Show contributors on hover */}
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

        {!showPreview ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONVERSION_OPTIONS.map(option => (
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
                  Profit: {((1 - option.aiCostEstimate / (option.sparkCost * 0.01)) * 100).toFixed(1)}%
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
              <p className="text-white">Creating your masterpiece...</p>
              <p className="text-sm text-white/60 mt-2">Adding drama, humor, and proper formatting...</p>
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
