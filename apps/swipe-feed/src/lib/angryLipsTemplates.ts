/**
 * Enhanced Angry Lips Templates based on Mad Libs success formula
 * Implements Meta's feedback on optimal blank density and story structure
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

export interface BlankType {
  id: string;
  prompt: string;
  category: 'noun' | 'verb' | 'adjective' | 'adverb' | 'exclamation' | 'duration' | 'place' | 'person' | 'emotion' | 'bodyPart' | 'food' | 'animal' | 'color' | 'time' | 'object' | 'amount' | 'measurement';
  hint?: string;
  examples?: string[];
}

export interface StoryTemplate {
  id: string;
  title: string;
  genre: string;
  length: 'micro' | 'short' | 'medium' | 'long';
  wordCount: number;
  blankCount: number;
  blankDensity: number; // blanks per word ratio
  template: string;
  blanks: BlankType[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Based on Meta's Mad Libs analysis:
// Micro: 25-50 words, 5-8 blanks, 1 blank per ~6 words
// Short: 75-150 words, 10-15 blanks, 1 per ~8-10 words  
// Medium: 200-350 words, 15-25 blanks, 1 per ~12-15 words
// Long: 400-700 words, 25-35 blanks, 1 per ~15-20 words

export const COMEDY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'social-media-meltdown-micro',
    title: 'Quick Post Disaster',
    genre: 'comedy',
    length: 'micro',
    wordCount: 45,
    blankCount: 7,
    blankDensity: 6.4,
    template: `I posted a photo of my [ADJECTIVE_1] [NOUN_1] on Instagram and accidentally tagged my [PERSON_1]. Within [AMOUNT_1] seconds, it got [DURATION_1] likes from [ADJECTIVE_2] people. My [RELATIVE_1] commented "[EXCLAMATION_1]!" and now I'm viral.`,
    blanks: [
      { id: 'ADJECTIVE_1', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['ugly', 'beautiful', 'weird'] },
      { id: 'NOUN_1', prompt: 'Give me a NOUN', category: 'noun', examples: ['sandwich', 'cat', 'homework'] },
      { id: 'PERSON_1', prompt: 'Give me a PERSON', category: 'person', examples: ['ex', 'boss', 'teacher'] },
      { id: 'AMOUNT_1', prompt: 'Give me an AMOUNT of something', category: 'amount', examples: ['a handful', 'too many', 'barely any'] },
      { id: 'DURATION_1', prompt: 'Give me a TIME DURATION', category: 'duration', examples: ['forever', 'a hot minute', 'ages'] },
      { id: 'ADJECTIVE_2', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['random', 'famous', 'confused'] },
      { id: 'RELATIVE_1', prompt: 'Give me a RELATIVE', category: 'person', examples: ['mom', 'uncle', 'cousin'] },
      { id: 'EXCLAMATION_1', prompt: 'Give me an EXCLAMATION', category: 'exclamation', examples: ['OMG', 'Yikes', 'Bruh'] }
    ],
    tags: ['social-media', 'viral', 'family'],
    difficulty: 'easy'
  },
  {
    id: 'social-media-meltdown-short',
    title: 'Viral Catastrophe',
    genre: 'comedy',
    length: 'short',
    wordCount: 120,
    blankCount: 14,
    blankDensity: 8.6,
    template: `Last [TIME_1] at [TIME_2], I posted about [TOPIC_1] on [PLATFORM_1]. I was wearing my [ADJECTIVE_1] [CLOTHING_1] when I accidentally [VERB_PAST_1] on livestream. The chat went wild with "[EXCLAMATION_1]!" and "[EMOJI_DESC_1]" reactions. My [ADJECTIVE_2] ex [PERSON_1] texted me "[PHRASE_1]" followed by [AMOUNT_1] [EMOJI_DESC_2]. The video was already trending at #[HASHTAG_1] when [CELEBRITY_1] dueted it doing the [DANCE_1] while [VERB_ING_1] around. Things got worse when my [RELATIVE_1] shared it to their [GROUP_1] group chat with the caption "[CAPTION_1]". Someone made a [ADJECTIVE_3] meme using my [BODY_PART_1] face and it got [DURATION_2] reposts.`,
    blanks: [
      { id: 'TIME_1', prompt: 'Give me a DAY', category: 'time', examples: ['Tuesday', 'Friday', 'Yesterday'] },
      { id: 'TIME_2', prompt: 'Give me a TIME', category: 'time', examples: ['3am', 'midnight', 'lunchtime'] },
      { id: 'TOPIC_1', prompt: 'Give me a TOPIC', category: 'noun', examples: ['politics', 'my breakfast', 'dating'] },
      { id: 'PLATFORM_1', prompt: 'Give me a SOCIAL PLATFORM', category: 'noun', examples: ['TikTok', 'Twitter', 'BeReal'] },
      { id: 'ADJECTIVE_1', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['dirty', 'favorite', 'inside-out'] },
      { id: 'CLOTHING_1', prompt: 'Give me CLOTHING', category: 'noun', examples: ['pajamas', 'swimsuit', 'costume'] },
      { id: 'VERB_PAST_1', prompt: 'Give me a PAST TENSE VERB', category: 'verb', examples: ['sneezed', 'fell', 'screamed'] },
      { id: 'EXCLAMATION_1', prompt: 'Give me an EXCLAMATION', category: 'exclamation', examples: ['DEAD', 'NO WAY', 'HELP'] },
      { id: 'EMOJI_DESC_1', prompt: 'Describe an EMOJI', category: 'noun', examples: ['crying-laughing', 'skull', 'fire'] },
      { id: 'ADJECTIVE_2', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['crazy', 'toxic', 'sweet'] },
      { id: 'PERSON_1', prompt: 'Give me a PERSON', category: 'person', examples: ['boyfriend', 'roommate', 'crush'] },
      { id: 'PHRASE_1', prompt: 'Give me a SHORT PHRASE', category: 'exclamation', examples: ['we need to talk', 'I cant even', 'this you?'] },
      { id: 'AMOUNT_1', prompt: 'Give me an AMOUNT', category: 'amount', examples: ['a ton of', 'barely any', 'infinite'] },
      { id: 'EMOJI_DESC_2', prompt: 'Give me EMOJI TYPE (plural)', category: 'noun', examples: ['hearts', 'flags', 'vegetables'] }
    ],
    tags: ['social-media', 'embarrassing', 'viral'],
    difficulty: 'medium'
  },
  {
    id: 'social-media-meltdown-medium',
    title: 'The Ultimate Social Media Disaster',
    genre: 'comedy',
    length: 'medium',
    wordCount: 280,
    blankCount: 22,
    blankDensity: 12.7,
    template: `It started when I was [VERB_ING_1] at [PLACE_1] on a [ADJECTIVE_1] [DAY_1]. I decided to post a [ADJECTIVE_2] selfie with my [OBJECT_1], but accidentally included my [EMBARRASSING_ITEM_1] in the background. Within [AMOUNT_1] minutes, [CELEBRITY_1] had commented "[COMMENT_1]" and my notifications went [ADJECTIVE_3].

The post somehow got cross-posted to [PLATFORM_1] where my [RELATIVE_1] saw it and immediately called my [RELATIVE_2]. "Why is there a [WEIRD_OBJECT_1] next to your [BODY_PART_1]?" they asked. I tried to delete it but [INFLUENCER_1] had already screenshot it and posted it with the caption "[CAPTION_1] 💀".

My [FRIEND_1] tried to help by posting a distraction photo of their [PET_1] wearing a [CLOTHING_1], but that just made things worse when people started comparing me to a [ANIMAL_1] that had been [VERB_PAST_1]. The memes spread to [PLATFORM_2] where someone edited my face onto [FICTIONAL_CHARACTER_1] doing the [DANCE_MOVE_1].

By [TIME_1], I had [DURATION_2] DMs, including one from my [AUTHORITY_FIGURE_1] saying "[STERN_MESSAGE_1]". My [APP_1] crashed [AMOUNT_2] times from all the [NOTIFICATION_TYPE_1]. The worst part? My [CRUSH_1] saw it and just replied with a single [EMOJI_1] emoji.

I tried damage control by posting an apology video where I [VERB_PAST_2] for [RANK_1] minutes straight, but I accidentally had the [FILTER_1] filter on, so now I'm known as the person who apologized while looking like a [FOOD_1]. At least I got [DURATION_3] new followers, even if they all call me "[NICKNAME_1]" now.`,
    blanks: [
      { id: 'VERB_ING_1', prompt: 'Give me a VERB ending in -ING', category: 'verb', examples: ['eating', 'dancing', 'crying'] },
      { id: 'PLACE_1', prompt: 'Give me a PLACE', category: 'place', examples: ['the gym', 'Walmart', 'my bathroom'] },
      { id: 'ADJECTIVE_1', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['boring', 'crazy', 'normal'] },
      { id: 'DAY_1', prompt: 'Give me a DAY', category: 'time', examples: ['Monday', 'Saturday', 'holiday'] },
      { id: 'ADJECTIVE_2', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['cute', 'professional', 'artistic'] },
      { id: 'OBJECT_1', prompt: 'Give me an OBJECT', category: 'object', examples: ['coffee', 'plant', 'laptop'] },
      { id: 'EMBARRASSING_ITEM_1', prompt: 'Give me an EMBARRASSING ITEM', category: 'object', examples: ['underwear', 'diary', 'medication'] },
      { id: 'AMOUNT_1', prompt: 'Give me a SMALL AMOUNT', category: 'amount', examples: ['a tiny bit', 'a smidge', 'barely any'] },
      { id: 'CELEBRITY_1', prompt: 'Give me a CELEBRITY', category: 'person', examples: ['Beyonce', 'Elon Musk', 'Gordon Ramsay'] },
      { id: 'COMMENT_1', prompt: 'Give me a SHORT COMMENT', category: 'exclamation', examples: ['Delete this', 'Im screaming', 'Bestie no'] },
      { id: 'ADJECTIVE_3', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['insane', 'nuclear', 'wild'] },
      { id: 'PLATFORM_1', prompt: 'Give me a SOCIAL PLATFORM', category: 'noun', examples: ['Facebook', 'LinkedIn', 'Reddit'] },
      { id: 'RELATIVE_1', prompt: 'Give me a RELATIVE', category: 'person', examples: ['mom', 'grandma', 'cousin'] },
      { id: 'RELATIVE_2', prompt: 'Give me another RELATIVE', category: 'person', examples: ['dad', 'aunt', 'sibling'] },
      { id: 'WEIRD_OBJECT_1', prompt: 'Give me a WEIRD OBJECT', category: 'object', examples: ['mannequin', 'inflatable dinosaur', 'traffic cone'] },
      { id: 'BODY_PART_1', prompt: 'Give me a BODY PART', category: 'bodyPart', examples: ['head', 'foot', 'elbow'] },
      { id: 'INFLUENCER_1', prompt: 'Give me an INFLUENCER NAME', category: 'person', examples: ['Jake Paul', 'Emma Chamberlain', 'MrBeast'] },
      { id: 'CAPTION_1', prompt: 'Give me a SASSY CAPTION', category: 'exclamation', examples: ['This u?', 'No words', 'I cant'] },
      { id: 'FRIEND_1', prompt: 'Give me a FRIEND\'S NAME', category: 'person', examples: ['Sarah', 'Mike', 'bestie'] },
      { id: 'PET_1', prompt: 'Give me a PET TYPE', category: 'animal', examples: ['dog', 'cat', 'hamster'] },
      { id: 'CLOTHING_1', prompt: 'Give me CLOTHING', category: 'noun', examples: ['tutu', 'tuxedo', 'onesie'] },
      { id: 'ANIMAL_1', prompt: 'Give me an ANIMAL', category: 'animal', examples: ['raccoon', 'giraffe', 'penguin'] }
    ],
    tags: ['social-media', 'viral', 'embarrassing', 'memes'],
    difficulty: 'medium'
  },
  {
    id: 'social-media-meltdown-long',
    title: 'The Social Media Apocalypse Saga',
    genre: 'comedy',
    length: 'long',
    wordCount: 450,
    blankCount: 30,
    blankDensity: 15,
    template: `It was [TIME_1] on a [ADJECTIVE_1] [DAY_1] when I made the [ADJECTIVE_2] mistake of my life. I was at [PLACE_1] trying to impress [PERSON_1] by showing off my [SKILL_1] skills. I decided to livestream the whole thing on [PLATFORM_1] with the title "[STREAM_TITLE_1]."

Everything was going [ADVERB_1] until my [RELATIVE_1] walked in wearing nothing but [CLOTHING_1] and [CLOTHING_2], screaming about [TOPIC_1]. The viewers immediately started spamming [EMOJI_1] and [EMOJI_2] emojis. Someone donated [AMOUNT_1] dollars with the message "[DONATION_MESSAGE_1]."

I tried to play it cool by [VERB_ING_1] even harder, but then I accidentally knocked over my [BEVERAGE_1], which splashed all over my [EXPENSIVE_ITEM_1]. The sound I made was somewhere between a [ANIMAL_1] and a [ANIMAL_2] being [VERB_PAST_1]. This exact moment was clipped by [USERNAME_1] and posted to [PLATFORM_2] with the caption "[MEME_CAPTION_1]."

Within [DURATION_2] hours, the clip had [AMOUNT_2] views. [CELEBRITY_1] quote-tweeted it saying "[CELEB_QUOTE_1]," and suddenly I was trending at number [RANK_1] worldwide. My [DEVICE_1] wouldn't stop [VERB_ING_2]. Every notification sounded like [SOUND_1] mixed with [SOUND_2].

The memes evolved quickly. First, someone photoshopped my face onto [MOVIE_CHARACTER_1] in the scene where they [MOVIE_ACTION_1]. Then came the remixes - my scream autotuned to [SONG_1] by [ARTIST_1]. A famous [YOUTUBER_TYPE_1] YouTuber made a [DURATION_3]-minute reaction video titled "[VIDEO_TITLE_1]" that got [AMOUNT_3] million views.

My [BOSS_1] called me into their office the next [TIME_PERIOD_1]. "Explain this," they said, showing me a PowerPoint presentation someone made called "[PRESENTATION_TITLE_1]: A Case Study in [ABSTRACT_CONCEPT_1]." Slide [POSITION_1] was just my face next to a [FOOD_1] with the word "[WORD_1]" in Comic Sans.

I tried to salvage my reputation by going on [PODCAST_1] to tell my side of the story, but I accidentally called the host [WRONG_NAME_1] and knocked over their [STUDIO_EQUIPMENT_1]. That clip went viral too, spawning the "[HASHTAG_1]" challenge where people [CHALLENGE_ACTION_1] while [CHALLENGE_ACTION_2].

By the end of the week, I had been invited to [TV_SHOW_1], received a sponsorship offer from [WEIRD_COMPANY_1], and somehow became the face of [PRODUCT_1]. My [FAMILY_MEMBER_1] won't stop sending me [ITEM_1] with my meme printed on them. 

The internet nicknamed me "[INTERNET_NICKNAME_1]" and I now have [AMOUNT_4] followers who only communicate in [COMMUNICATION_STYLE_1]. My dating profile just says "[BIO_TEXT_1]" because what else is there to say? At least my [PET_1] still loves me, though they now respond better to "[PET_NICKNAME_1]" than their actual name.

Next week I'm appearing on [GAME_SHOW_1] as the "[SPECIAL_GUEST_TITLE_1]." My life is now a [ADJECTIVE_3] combination of [CONCEPT_1] and [CONCEPT_2], and honestly? I'm starting to [VERB_1] it.`,
    blanks: [
      { id: 'TIME_1', prompt: 'Give me a TIME OF DAY', category: 'time', examples: ['3:47 AM', 'noon', 'midnight'] },
      { id: 'ADJECTIVE_1', prompt: 'Give me an ADJECTIVE', category: 'adjective', examples: ['regular', 'cursed', 'beautiful'] },
      { id: 'DAY_1', prompt: 'Give me a DAY', category: 'time', examples: ['Tuesday', 'Christmas', 'weekend'] },
      { id: 'ADJECTIVE_2', prompt: 'Give me an ADJECTIVE (negative)', category: 'adjective', examples: ['worst', 'stupidest', 'biggest'] },
      { id: 'PLACE_1', prompt: 'Give me a PUBLIC PLACE', category: 'place', examples: ['the mall', 'Starbucks', 'the DMV'] },
      { id: 'PERSON_1', prompt: 'Give me a PERSON', category: 'person', examples: ['my crush', 'my ex', 'a stranger'] },
      { id: 'SKILL_1', prompt: 'Give me a SKILL', category: 'noun', examples: ['juggling', 'cooking', 'beatboxing'] },
      { id: 'PLATFORM_1', prompt: 'Give me a STREAMING PLATFORM', category: 'noun', examples: ['Twitch', 'Instagram Live', 'TikTok'] },
      { id: 'STREAM_TITLE_1', prompt: 'Give me a CLICKBAIT TITLE', category: 'exclamation', examples: ['GONE WRONG', 'You wont believe', 'INSANE CHALLENGE'] },
      { id: 'ADVERB_1', prompt: 'Give me an ADVERB', category: 'adverb', examples: ['smoothly', 'terribly', 'surprisingly'] },
      { id: 'RELATIVE_1', prompt: 'Give me a RELATIVE', category: 'person', examples: ['uncle', 'mom', 'cousin'] },
      { id: 'CLOTHING_1', prompt: 'Give me CLOTHING ITEM', category: 'noun', examples: ['socks', 'a hat', 'a cape'] },
      { id: 'CLOTHING_2', prompt: 'Give me another CLOTHING ITEM', category: 'noun', examples: ['crocs', 'a tie', 'sunglasses'] },
      { id: 'TOPIC_1', prompt: 'Give me a RANDOM TOPIC', category: 'noun', examples: ['cryptocurrency', 'their ex', 'conspiracy theories'] },
      { id: 'EMOJI_1', prompt: 'Give me an EMOJI NAME', category: 'noun', examples: ['skull', 'fire', 'clown'] },
      { id: 'EMOJI_2', prompt: 'Give me another EMOJI NAME', category: 'noun', examples: ['crying', 'heart', 'eggplant'] },
      { id: 'AMOUNT_1', prompt: 'Give me an AMOUNT of money', category: 'amount', examples: ['all the money', 'pocket change', 'a fortune'] },
      { id: 'DONATION_MESSAGE_1', prompt: 'Give me a WEIRD MESSAGE', category: 'exclamation', examples: ['Show feet', 'Is this real', 'Mom get the camera'] },
      { id: 'VERB_ING_1', prompt: 'Give me a VERB ending in -ING', category: 'verb', examples: ['dancing', 'flexing', 'concentrating'] },
      { id: 'BEVERAGE_1', prompt: 'Give me a BEVERAGE', category: 'food', examples: ['coffee', 'energy drink', 'kombucha'] },
      { id: 'EXPENSIVE_ITEM_1', prompt: 'Give me an EXPENSIVE ITEM', category: 'object', examples: ['laptop', 'phone', 'gaming setup'] },
      { id: 'ANIMAL_1', prompt: 'Give me an ANIMAL', category: 'animal', examples: ['goose', 'whale', 'chihuahua'] },
      { id: 'ANIMAL_2', prompt: 'Give me another ANIMAL', category: 'animal', examples: ['pterodactyl', 'cat', 'bear'] },
      { id: 'VERB_PAST_1', prompt: 'Give me a PAST TENSE VERB', category: 'verb', examples: ['stepped on', 'tickled', 'microwaved'] },
      { id: 'USERNAME_1', prompt: 'Give me an INTERNET USERNAME', category: 'person', examples: ['xXDarkLord69', 'potato_queen', 'dave'] },
      { id: 'PLATFORM_2', prompt: 'Give me another SOCIAL PLATFORM', category: 'noun', examples: ['Twitter', 'Reddit', 'YouTube'] },
      { id: 'MEME_CAPTION_1', prompt: 'Give me a MEME CAPTION', category: 'exclamation', examples: ['Me when', 'Nobody:', 'It be like that'] },
      { id: 'DURATION_2', prompt: 'Give me a SHORT DURATION', category: 'duration', examples: ['a split second', 'a heartbeat', 'instantly'] },
      { id: 'AMOUNT_2', prompt: 'Give me a MASSIVE AMOUNT', category: 'amount', examples: ['infinite', 'countless', 'gazillions of'] },
      { id: 'CELEBRITY_1', prompt: 'Give me a CELEBRITY', category: 'person', examples: ['Rihanna', 'The Rock', 'Ryan Reynolds'] },
      { id: 'RANK_1', prompt: 'Give me a RANKING or POSITION', category: 'measurement', examples: ['first', 'dead last', 'somewhere in the middle'] },
      { id: 'POSITION_1', prompt: 'Give me a SLIDE POSITION', category: 'measurement', examples: ['the very last', 'number whatever', 'somewhere near the end'] },
      { id: 'AMOUNT_3', prompt: 'Give me a HUGE AMOUNT', category: 'amount', examples: ['a bajillion', 'way too many', 'an ungodly amount of'] },
      { id: 'AMOUNT_4', prompt: 'Give me a FOLLOWER COUNT', category: 'amount', examples: ['like twelve', 'somehow millions of', 'exactly zero'] },
      { id: 'DURATION_3', prompt: 'Give me a TIME LENGTH', category: 'duration', examples: ['an eternity of', 'approximately forever', 'way too long'] }
    ],
    tags: ['social-media', 'viral', 'disaster', 'redemption'],
    difficulty: 'hard'
  }
];

// Function to get templates by length
export function getTemplatesByLength(length: 'micro' | 'short' | 'medium' | 'long'): StoryTemplate[] {
  return COMEDY_TEMPLATES.filter(t => t.length === length);
}

// Function to get optimal blank density info
export function getBlankDensityInfo(length: 'micro' | 'short' | 'medium' | 'long'): {
  optimalDensity: number;
  minBlanks: number;
  maxBlanks: number;
  targetWords: number;
} {
  const densityMap = {
    micro: { optimalDensity: 6, minBlanks: 5, maxBlanks: 8, targetWords: 40 },
    short: { optimalDensity: 9, minBlanks: 10, maxBlanks: 15, targetWords: 110 },
    medium: { optimalDensity: 13, minBlanks: 15, maxBlanks: 25, targetWords: 275 },
    long: { optimalDensity: 17, minBlanks: 25, maxBlanks: 35, targetWords: 550 }
  };
  
  return densityMap[length];
}

// Function to validate template meets Mad Libs standards
export function validateTemplate(template: StoryTemplate): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const densityInfo = getBlankDensityInfo(template.length);
  
  // Check blank count
  if (template.blankCount < densityInfo.minBlanks) {
    issues.push(`Too few blanks: ${template.blankCount} (minimum: ${densityInfo.minBlanks})`);
  }
  if (template.blankCount > densityInfo.maxBlanks) {
    issues.push(`Too many blanks: ${template.blankCount} (maximum: ${densityInfo.maxBlanks})`);
  }
  
  // Check word count
  const wordRange = {
    micro: [25, 50],
    short: [75, 150],
    medium: [200, 350],
    long: [400, 700]
  };
  
  const [minWords, maxWords] = wordRange[template.length];
  if (template.wordCount < minWords || template.wordCount > maxWords) {
    issues.push(`Word count ${template.wordCount} outside range ${minWords}-${maxWords}`);
  }
  
  // Check blank density
  const actualDensity = template.wordCount / template.blankCount;
  const optimalDensity = densityInfo.optimalDensity;
  const densityTolerance = 2; // Allow ±2 words per blank variance
  
  if (Math.abs(actualDensity - optimalDensity) > densityTolerance) {
    issues.push(`Blank density ${actualDensity.toFixed(1)} words/blank (optimal: ${optimalDensity})`);
  }
  
  // Check that all blanks in template have corresponding BlankType definitions
  const templateBlanks = (template.template.match(/\[([^\]]+)\]/g) || []).map(b => b.slice(1, -1));
  const definedBlanks = template.blanks.map(b => b.id);
  
  templateBlanks.forEach(blank => {
    if (!definedBlanks.includes(blank)) {
      issues.push(`Template references undefined blank: ${blank}`);
    }
  });
  
  definedBlanks.forEach(blank => {
    if (!templateBlanks.includes(blank)) {
      issues.push(`Defined blank not used in template: ${blank}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Export default for convenience
export default {
  templates: COMEDY_TEMPLATES,
  getTemplatesByLength,
  getBlankDensityInfo,
  validateTemplate
};
