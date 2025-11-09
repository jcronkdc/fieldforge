/**
 * Contextual Word Prompts for AngryLips
 * Ensures word choices actually fit the story context
 */

export interface WordPrompt {
  type: string;
  description: string;
  examples: string[];
  context?: string;
}

// Context-aware prompt categories
export const contextualPrompts: Record<string, WordPrompt[]> = {
  comedy: [
    { type: 'FUNNY ADJECTIVE', description: 'Something ridiculous', examples: ['wobbly', 'giggly', 'squishy'], context: 'humor' },
    { type: 'SILLY NOUN', description: 'Something absurd', examples: ['banana', 'unicorn', 'spaghetti'], context: 'humor' },
    { type: 'WEIRD VERB', description: 'Action that\'s funny', examples: ['wiggle', 'splat', 'boing'], context: 'humor' },
    { type: 'BODY PART', description: 'Any body part', examples: ['elbow', 'nostril', 'pinky toe'], context: 'physical' },
    { type: 'EMBARRASSING SOUND', description: 'Funny noise', examples: ['burp', 'squeak', 'whoosh'], context: 'sound' },
  ],
  horror: [
    { type: 'SCARY ADJECTIVE', description: 'Something frightening', examples: ['bloodcurdling', 'sinister', 'ghastly'], context: 'fear' },
    { type: 'DARK PLACE', description: 'Creepy location', examples: ['basement', 'graveyard', 'attic'], context: 'location' },
    { type: 'MONSTER TYPE', description: 'Scary creature', examples: ['vampire', 'zombie', 'demon'], context: 'creature' },
    { type: 'CREEPY VERB', description: 'Unsettling action', examples: ['lurk', 'crawl', 'whisper'], context: 'action' },
    { type: 'OMINOUS SOUND', description: 'Scary noise', examples: ['creak', 'howl', 'scratch'], context: 'sound' },
  ],
  romance: [
    { type: 'ROMANTIC ADJECTIVE', description: 'Something lovely', examples: ['passionate', 'tender', 'enchanting'], context: 'emotion' },
    { type: 'TERM OF ENDEARMENT', description: 'Sweet nickname', examples: ['darling', 'sweetheart', 'beloved'], context: 'affection' },
    { type: 'ROMANTIC LOCATION', description: 'Date spot', examples: ['beach', 'restaurant', 'park'], context: 'location' },
    { type: 'LOVING VERB', description: 'Affectionate action', examples: ['embrace', 'caress', 'cherish'], context: 'action' },
    { type: 'EMOTION', description: 'Feeling', examples: ['joy', 'longing', 'bliss'], context: 'emotion' },
  ],
  scifi: [
    { type: 'FUTURISTIC ADJECTIVE', description: 'High-tech descriptor', examples: ['quantum', 'cybernetic', 'holographic'], context: 'tech' },
    { type: 'ALIEN NAME', description: 'Extraterrestrial being', examples: ['Zorgon', 'Xyloth', 'Quasar'], context: 'character' },
    { type: 'SPACE LOCATION', description: 'Cosmic place', examples: ['nebula', 'space station', 'asteroid'], context: 'location' },
    { type: 'TECH VERB', description: 'Sci-fi action', examples: ['teleport', 'hack', 'scan'], context: 'action' },
    { type: 'TECHNOLOGY', description: 'Future device', examples: ['laser', 'android', 'warp drive'], context: 'tech' },
  ],
  action: [
    { type: 'INTENSE ADJECTIVE', description: 'High-energy word', examples: ['explosive', 'thunderous', 'blazing'], context: 'intensity' },
    { type: 'WEAPON', description: 'Fighting tool', examples: ['sword', 'missile', 'fist'], context: 'combat' },
    { type: 'VEHICLE', description: 'Transportation', examples: ['motorcycle', 'helicopter', 'tank'], context: 'vehicle' },
    { type: 'ACTION VERB', description: 'Dynamic movement', examples: ['leap', 'crash', 'dodge'], context: 'action' },
    { type: 'EXPLOSIVE SOUND', description: 'Loud noise', examples: ['boom', 'crash', 'bang'], context: 'sound' },
  ]
};

// Smart prompt generator that considers story flow
export class SmartPromptGenerator {
  private usedPrompts: Set<string> = new Set();
  private storyContext: string[] = [];
  
  constructor(private genre: string) {}

  /**
   * Get next contextual prompt based on story flow
   */
  getNextPrompt(previousWords: string[]): WordPrompt {
    const prompts = contextualPrompts[this.genre.toLowerCase()] || contextualPrompts.comedy;
    
    // Analyze previous words to determine best prompt type
    const needsNoun = this.shouldPromptNoun(previousWords);
    const needsVerb = this.shouldPromptVerb(previousWords);
    const needsAdjective = this.shouldPromptAdjective(previousWords);
    
    // Filter prompts based on what the story needs
    let filteredPrompts = prompts.filter(p => {
      if (needsNoun && p.type.includes('NOUN')) return true;
      if (needsVerb && p.type.includes('VERB')) return true;
      if (needsAdjective && p.type.includes('ADJECTIVE')) return true;
      return !this.usedPrompts.has(p.type);
    });
    
    // If all filtered, reset and use all
    if (filteredPrompts.length === 0) {
      this.usedPrompts.clear();
      filteredPrompts = prompts;
    }
    
    // Select prompt that hasn't been used recently
    const prompt = filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
    this.usedPrompts.add(prompt.type);
    
    return prompt;
  }
  
  /**
   * Determine if story needs a noun
   */
  private shouldPromptNoun(previousWords: string[]): boolean {
    const lastWord = previousWords[previousWords.length - 1]?.toLowerCase() || '';
    const articles = ['a', 'an', 'the'];
    const prepositions = ['in', 'on', 'at', 'with', 'by', 'for'];
    
    return articles.includes(lastWord) || prepositions.includes(lastWord);
  }
  
  /**
   * Determine if story needs a verb
   */
  private shouldPromptVerb(previousWords: string[]): boolean {
    const lastWord = previousWords[previousWords.length - 1]?.toLowerCase() || '';
    const helpers = ['to', 'will', 'would', 'could', 'should', 'must'];
    
    return helpers.includes(lastWord);
  }
  
  /**
   * Determine if story needs an adjective
   */
  private shouldPromptAdjective(previousWords: string[]): boolean {
    const lastWord = previousWords[previousWords.length - 1]?.toLowerCase() || '';
    const intensifiers = ['very', 'really', 'quite', 'extremely', 'super'];
    
    return intensifiers.includes(lastWord);
  }
  
  /**
   * Validate if a word fits the context
   */
  validateWord(word: string, promptType: string): boolean {
    // Basic validation
    if (!word || word.trim().length === 0) return false;
    if (word.length > 30) return false; // Too long
    
    // Check if it matches the prompt type expectations
    const prompt = contextualPrompts[this.genre.toLowerCase()]?.find(p => p.type === promptType);
    if (!prompt) return true; // If no prompt found, allow it
    
    // More validation could be added here
    return true;
  }
}

/**
 * Generate story-appropriate blanks
 */
export function generateStoryBlanks(storyTemplate: string, genre: string): string[] {
  const generator = new SmartPromptGenerator(genre);
  const blanks: string[] = [];
  
  // Parse template to find blank positions
  const blankPattern = /\[([^\]]+)\]/g;
  let match;
  
  while ((match = blankPattern.exec(storyTemplate)) !== null) {
    // Get words before this blank for context
    const textBefore = storyTemplate.substring(0, match.index);
    const wordsBefore = textBefore.split(/\s+/).slice(-5); // Last 5 words
    
    // Generate contextual prompt
    const prompt = generator.getNextPrompt(wordsBefore);
    blanks.push(prompt.type);
  }
  
  return blanks;
}
