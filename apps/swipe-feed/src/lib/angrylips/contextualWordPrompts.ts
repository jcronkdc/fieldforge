/**
 * Contextual Word Prompt System
 * Ensures word prompts actually fit the story context
 */

interface WordPrompt {
  type: string;
  description: string;
  examples: string[];
  context?: string;
}

// Context-aware word categories
const CONTEXTUAL_PROMPTS: Record<string, WordPrompt[]> = {
  comedy: [
    { type: 'SILLY NOUN', description: 'something ridiculous', examples: ['rubber chicken', 'banana hammock', 'disco potato'] },
    { type: 'FUNNY VERB', description: 'silly action word', examples: ['wiggle', 'boop', 'yeet'] },
    { type: 'WEIRD ADJECTIVE', description: 'bizarre descriptor', examples: ['jiggly', 'sparkly', 'crusty'] },
    { type: 'BODY PART', description: 'any body part', examples: ['elbow', 'nostril', 'pinky toe'] },
    { type: 'EMBARRASSING SOUND', description: 'awkward noise', examples: ['SPLORT', 'PFFFFT', 'SQUISH'] },
    { type: 'FOOD ITEM', description: 'any food', examples: ['pizza', 'taco', 'cheese'] },
    { type: 'CELEBRITY NAME', description: 'famous person', examples: ['Dwayne Johnson', 'Betty White', 'Keanu Reeves'] },
  ],
  horror: [
    { type: 'SPOOKY PLACE', description: 'creepy location', examples: ['abandoned hospital', 'foggy cemetery', 'dark basement'] },
    { type: 'MONSTER NAME', description: 'scary creature', examples: ['Shadow Beast', 'The Whisperer', 'Bone Crawler'] },
    { type: 'CREEPY VERB', description: 'unsettling action', examples: ['lurk', 'crawl', 'whisper'] },
    { type: 'DARK ADJECTIVE', description: 'ominous descriptor', examples: ['bloodcurdling', 'ghastly', 'sinister'] },
    { type: 'SCARY SOUND', description: 'frightening noise', examples: ['SCREECH', 'HOWL', 'CREAK'] },
    { type: 'WEAPON', description: 'any weapon', examples: ['chainsaw', 'axe', 'cursed dagger'] },
  ],
  scifi: [
    { type: 'PLANET NAME', description: 'alien world', examples: ['Zephron-7', 'Nova Prime', 'Andromeda X'] },
    { type: 'ALIEN SPECIES', description: 'extraterrestrial race', examples: ['Zorgons', 'Quantumites', 'Nebulans'] },
    { type: 'TECH DEVICE', description: 'futuristic gadget', examples: ['quantum scanner', 'plasma rifle', 'holo-projector'] },
    { type: 'SPACE VERB', description: 'sci-fi action', examples: ['teleport', 'warp', 'digitize'] },
    { type: 'FUTURISTIC ADJECTIVE', description: 'high-tech descriptor', examples: ['cybernetic', 'holographic', 'quantum'] },
    { type: 'SPACESHIP PART', description: 'ship component', examples: ['hyperdrive', 'photon cannon', 'shield generator'] },
  ],
  romance: [
    { type: 'ROMANTIC PLACE', description: 'lovely location', examples: ['moonlit beach', 'Paris cafe', 'rooftop garden'] },
    { type: 'TERM OF ENDEARMENT', description: 'sweet nickname', examples: ['sweetheart', 'darling', 'beloved'] },
    { type: 'ROMANTIC VERB', description: 'loving action', examples: ['embrace', 'whisper', 'caress'] },
    { type: 'BEAUTIFUL ADJECTIVE', description: 'lovely descriptor', examples: ['enchanting', 'breathtaking', 'radiant'] },
    { type: 'FLOWER TYPE', description: 'any flower', examples: ['rose', 'lily', 'jasmine'] },
    { type: 'LOVE SONG', description: 'romantic song', examples: ['Endless Love', 'Your Song', 'At Last'] },
  ],
  action: [
    { type: 'VEHICLE', description: 'fast transport', examples: ['motorcycle', 'helicopter', 'speedboat'] },
    { type: 'ACTION VERB', description: 'intense action', examples: ['explode', 'leap', 'smash'] },
    { type: 'WEAPON TYPE', description: 'combat tool', examples: ['katana', 'grenade', 'sniper rifle'] },
    { type: 'TOUGH ADJECTIVE', description: 'badass descriptor', examples: ['bulletproof', 'unstoppable', 'lethal'] },
    { type: 'EXPLOSION SOUND', description: 'boom noise', examples: ['KABOOM', 'BANG', 'CRASH'] },
    { type: 'VILLAIN NAME', description: 'bad guy name', examples: ['The Viper', 'Shadowfist', 'Dr. Chaos'] },
  ]
};

// Smart prompt generation based on story context
export function getContextualPrompt(
  genre: string, 
  storyContext: string, 
  previousWords: string[]
): WordPrompt {
  const genrePrompts = CONTEXTUAL_PROMPTS[genre.toLowerCase()] || CONTEXTUAL_PROMPTS.comedy;
  
  // Avoid repeating similar prompt types
  const usedTypes = new Set(previousWords.map(w => w.split(':')[0]));
  const availablePrompts = genrePrompts.filter(p => !usedTypes.has(p.type));
  
  // If all types used, reset
  if (availablePrompts.length === 0) {
    return genrePrompts[Math.floor(Math.random() * genrePrompts.length)];
  }
  
  // Analyze story context for better prompt selection
  const contextWords = storyContext.toLowerCase().split(' ');
  
  // Smart selection based on context
  if (contextWords.includes('suddenly') || contextWords.includes('then')) {
    // Action needed
    const actionPrompts = availablePrompts.filter(p => p.type.includes('VERB'));
    if (actionPrompts.length > 0) {
      return actionPrompts[Math.floor(Math.random() * actionPrompts.length)];
    }
  }
  
  if (contextWords.includes('the') || contextWords.includes('a')) {
    // Noun likely needed
    const nounPrompts = availablePrompts.filter(p => 
      p.type.includes('NOUN') || p.type.includes('PLACE') || p.type.includes('NAME')
    );
    if (nounPrompts.length > 0) {
      return nounPrompts[Math.floor(Math.random() * nounPrompts.length)];
    }
  }
  
  if (contextWords.includes('was') || contextWords.includes('felt')) {
    // Adjective likely needed
    const adjPrompts = availablePrompts.filter(p => p.type.includes('ADJECTIVE'));
    if (adjPrompts.length > 0) {
      return adjPrompts[Math.floor(Math.random() * adjPrompts.length)];
    }
  }
  
  // Default to random available prompt
  return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
}

// Validate if a word fits the prompt type
export function validateWordFit(word: string, promptType: string): boolean {
  const trimmed = word.trim().toLowerCase();
  
  // Basic validation rules
  if (trimmed.length < 2) return false;
  
  if (promptType.includes('VERB')) {
    // Check if it could be a verb (very basic)
    const verbEndings = ['ing', 'ed', 's', 'es'];
    return true; // Accept most things as verbs
  }
  
  if (promptType.includes('ADJECTIVE')) {
    // Check if it could be an adjective
    const adjEndings = ['ly', 'ful', 'ous', 'ive', 'able', 'y'];
    return true; // Accept most things
  }
  
  if (promptType.includes('SOUND')) {
    // Should be uppercase or onomatopoeia
    return word === word.toUpperCase() || trimmed.includes('!');
  }
  
  if (promptType.includes('NUMBER')) {
    return !isNaN(Number(word));
  }
  
  // Default accept
  return true;
}

// Get example for a prompt type
export function getPromptExample(promptType: string, genre: string): string {
  const genrePrompts = CONTEXTUAL_PROMPTS[genre.toLowerCase()] || CONTEXTUAL_PROMPTS.comedy;
  const prompt = genrePrompts.find(p => p.type === promptType);
  
  if (prompt && prompt.examples.length > 0) {
    return prompt.examples[Math.floor(Math.random() * prompt.examples.length)];
  }
  
  return 'example';
}

// Generate smart story templates with contextual blanks
export function generateSmartStory(genre: string, mode: string): {
  template: string;
  prompts: WordPrompt[];
} {
  const templates: Record<string, Record<string, string>> = {
    comedy: {
      versus: `Once upon a time, a [SILLY NOUN] decided to [FUNNY VERB] all the way to [SILLY PLACE]. 
               Everyone thought this was [WEIRD ADJECTIVE], especially the [BODY PART] inspector who made a [EMBARRASSING SOUND] sound.
               "Holy [FOOD ITEM]!" shouted [CELEBRITY NAME], "I've never seen anything so [WEIRD ADJECTIVE] in my life!"
               The [SILLY NOUN] just [FUNNY VERB]ed harder and yelled "[EXCLAMATION]!"`,
      chain: `The [WEIRD ADJECTIVE] [SILLY NOUN] loved to [FUNNY VERB] every [TIME PERIOD].
              This made their [BODY PART] feel [WEIRD ADJECTIVE] and [WEIRD ADJECTIVE].
              One day, they met [CELEBRITY NAME] at the [SILLY PLACE] who was eating [FOOD ITEM].
              Together they decided to [FUNNY VERB] until the [SILLY NOUN] went [EMBARRASSING SOUND]!`
    },
    horror: {
      versus: `In the [SPOOKY PLACE], something began to [CREEPY VERB]. 
               The [MONSTER NAME] emerged from the [DARK ADJECTIVE] shadows, holding a [WEAPON].
               "[SCARY SOUND]!" it screamed, making everyone's [BODY PART] freeze with terror.
               The only way to survive was to [CREEPY VERB] faster than the [DARK ADJECTIVE] creature.`,
      chain: `The [DARK ADJECTIVE] night at [SPOOKY PLACE] was eerily quiet until...
              [SCARY SOUND]! The [MONSTER NAME] had arrived, ready to [CREEPY VERB].
              Its [DARK ADJECTIVE] [BODY PART] dripped with [LIQUID], and it wielded a [WEAPON].
              No one could [VERB] fast enough to escape the [DARK ADJECTIVE] fate.`
    },
    scifi: {
      versus: `Captain [NAME] of the starship [SPACESHIP NAME] detected a [FUTURISTIC ADJECTIVE] signal from [PLANET NAME].
               The [ALIEN SPECIES] were trying to [SPACE VERB] our [TECH DEVICE]!
               "Set [SPACESHIP PART] to maximum!" ordered the captain as they prepared to [SPACE VERB].
               The [FUTURISTIC ADJECTIVE] battle would determine the fate of [NUMBER] galaxies.`,
      chain: `In the year [YEAR], the [ALIEN SPECIES] discovered how to [SPACE VERB] through [SUBSTANCE].
              Their [TECH DEVICE] was [FUTURISTIC ADJECTIVE] and could [SPACE VERB] anything.
              The [SPACESHIP PART] on their ship began to [VERB] uncontrollably.
              Only [NAME] knew how to stop the [FUTURISTIC ADJECTIVE] disaster.`
    }
  };
  
  const template = templates[genre.toLowerCase()]?.[mode] || templates.comedy.versus;
  
  // Extract prompts from template
  const promptMatches = template.match(/\[([^\]]+)\]/g) || [];
  const prompts = promptMatches.map(match => {
    const type = match.slice(1, -1);
    const genrePrompts = CONTEXTUAL_PROMPTS[genre.toLowerCase()] || CONTEXTUAL_PROMPTS.comedy;
    return genrePrompts.find(p => p.type === type) || {
      type,
      description: type.toLowerCase(),
      examples: ['example']
    };
  });
  
  return { template, prompts };
}

export default {
  getContextualPrompt,
  validateWordFit,
  getPromptExample,
  generateSmartStory,
  CONTEXTUAL_PROMPTS
};
