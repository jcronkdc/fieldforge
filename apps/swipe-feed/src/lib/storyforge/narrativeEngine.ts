/**
 * StoryForge Narrative Generation Engine
 * AI-powered story generation with adaptive storytelling logic
 */

import type { 
  StoryBranch, 
  StoryGenre, 
  StoryTone, 
  AIMask,
  Character,
  DynamicVariables,
  PlotThread,
  StoryArc,
  EmotionalContext,
  WritingStyle,
  NarrativePreferences
} from './types';

interface GenerationOptions {
  genre?: StoryGenre;
  tone?: StoryTone;
  mask?: AIMask;
  length?: 'micro' | 'short' | 'medium' | 'long' | 'epic';
  style?: WritingStyle;
  includeCharacters?: string[];
  continueFrom?: string; // Previous content to continue from
  themes?: string[];
  mood?: string;
  pacing?: 'slow' | 'moderate' | 'fast' | 'dynamic';
}

interface NarrativeContext {
  previousEvents: string[];
  activeCharacters: Character[];
  currentLocation: string;
  emotionalTone: string;
  tensionLevel: number;
  plotStage: 'setup' | 'rising' | 'climax' | 'falling' | 'resolution';
}

export class NarrativeEngine {
  private masks: Map<string, AIMask> = new Map();
  private templates: Map<string, NarrativeTemplate> = new Map();
  private continuityMemory: ContinuityMemory;

  constructor() {
    this.continuityMemory = new ContinuityMemory();
    this.initializeDefaultMasks();
    this.initializeTemplates();
  }

  /**
   * Generate narrative content
   */
  async generateNarrative(
    context: NarrativeContext,
    options: GenerationOptions = {}
  ): Promise<string> {
    // Select appropriate mask
    const mask = options.mask || this.getDefaultMask(options.genre);
    
    // Build generation prompt
    const prompt = this.buildPrompt(context, options, mask);
    
    // Generate content (in production, this would call AI API)
    const generatedContent = await this.callAIGeneration(prompt, mask);
    
    // Post-process for consistency
    const processedContent = await this.postProcess(generatedContent, context, mask);
    
    // Update continuity memory
    this.continuityMemory.addContent(processedContent, context);
    
    return processedContent;
  }

  /**
   * Continue a story from a branch
   */
  async continueStory(
    branch: StoryBranch,
    direction: 'continue' | 'branch' | 'alternate',
    options: GenerationOptions = {}
  ): Promise<string> {
    const context = this.extractContext(branch);
    
    switch (direction) {
      case 'continue':
        // Direct continuation
        options.continueFrom = branch.content;
        break;
        
      case 'branch':
        // New branch with different direction
        context.plotStage = this.determineNextStage(branch.continuityState.plotThreads);
        break;
        
      case 'alternate':
        // Alternative version of same events
        options.tone = this.getAlternativeTone(branch.metadata.tone);
        break;
    }
    
    return this.generateNarrative(context, options);
  }

  /**
   * Generate dialogue between characters
   */
  async generateDialogue(
    characters: Character[],
    situation: string,
    emotionalContext: EmotionalContext,
    options: GenerationOptions = {}
  ): Promise<string> {
    const dialoguePrompt = this.buildDialoguePrompt(characters, situation, emotionalContext);
    const mask = options.mask || this.masks.get('dialogue_master')!;
    
    const dialogue = await this.callAIGeneration(dialoguePrompt, mask);
    
    // Ensure character voice consistency
    return this.ensureVoiceConsistency(dialogue, characters);
  }

  /**
   * Reinterpret content under different genre/tone
   */
  async reinterpret(
    content: string,
    fromGenre: StoryGenre,
    toGenre: StoryGenre,
    fromTone: StoryTone,
    toTone: StoryTone
  ): Promise<string> {
    const transformPrompt = this.buildTransformPrompt(content, fromGenre, toGenre, fromTone, toTone);
    const mask = this.masks.get('genre_shifter')!;
    
    return this.callAIGeneration(transformPrompt, mask);
  }

  /**
   * Generate plot escalation
   */
  async escalatePlot(
    currentThreads: PlotThread[],
    tensionLevel: number,
    targetTension: number
  ): Promise<string> {
    const escalationNeeded = targetTension - tensionLevel;
    
    if (escalationNeeded <= 0) {
      return this.generateResolution(currentThreads);
    }
    
    const escalationPrompt = this.buildEscalationPrompt(currentThreads, escalationNeeded);
    const mask = this.masks.get('plot_weaver')!;
    
    return this.callAIGeneration(escalationPrompt, mask);
  }

  /**
   * Generate story resolution
   */
  async generateResolution(
    plotThreads: PlotThread[],
    arcs: StoryArc[] = [],
    preferredEnding: 'happy' | 'bittersweet' | 'tragic' | 'ambiguous' | 'twist' = 'bittersweet'
  ): Promise<string> {
    const unresolvedThreads = plotThreads.filter(t => t.status !== 'resolved');
    const resolutionPrompt = this.buildResolutionPrompt(unresolvedThreads, arcs, preferredEnding);
    const mask = this.masks.get('resolution_master')!;
    
    return this.callAIGeneration(resolutionPrompt, mask);
  }

  /**
   * Apply AI Mask personality to content
   */
  async applyMaskPersonality(
    content: string,
    mask: AIMask
  ): Promise<string> {
    // Adjust vocabulary
    let adjusted = this.adjustVocabulary(content, mask.vocabulary);
    
    // Apply writing style
    adjusted = this.applyWritingStyle(adjusted, mask.writingStyle);
    
    // Add personality quirks
    adjusted = this.addPersonalityQuirks(adjusted, mask.personality);
    
    // Insert signature phrases
    adjusted = this.insertSignaturePhrases(adjusted, mask.signature_phrases);
    
    return adjusted;
  }

  /**
   * Multi-mask collaboration
   */
  async multiMaskCollaboration(
    content: string,
    masks: AIMask[],
    mode: 'sequential' | 'debate' | 'blend'
  ): Promise<string> {
    switch (mode) {
      case 'sequential':
        // Each mask adds to the story
        let result = content;
        for (const mask of masks) {
          result = await this.applyMaskPersonality(result, mask);
        }
        return result;
        
      case 'debate':
        // Masks argue about the content
        return this.generateMaskDebate(content, masks);
        
      case 'blend':
        // Blend all mask styles
        return this.blendMaskStyles(content, masks);
        
      default:
        return content;
    }
  }

  // Private helper methods
  
  private initializeDefaultMasks() {
    // The Narrator
    this.masks.set('narrator', {
      id: 'narrator',
      name: 'The Narrator',
      personality: {
        traits: {
          openness: 0.8,
          conscientiousness: 0.9,
          extraversion: 0.5,
          agreeableness: 0.7,
          neuroticism: 0.3,
          quirks: ['omniscient perspective', 'subtle foreshadowing'],
          values: ['truth', 'clarity', 'engagement'],
          flaws: ['occasionally verbose']
        },
        tone: ['neutral', 'engaging'],
        humor_level: 0.3,
        formality: 0.6,
        verbosity: 0.7,
        creativity: 0.7,
        darkness: 0.4,
        optimism: 0.6
      },
      writingStyle: {
        sentence_length: 'varied',
        paragraph_length: 'standard',
        vocabulary_level: 'intermediate',
        pacing: 'moderate',
        description_density: 0.6,
        dialogue_ratio: 0.3,
        action_ratio: 0.4,
        introspection_ratio: 0.3
      },
      vocabulary: {
        common_words: [],
        unique_words: ['perhaps', 'indeed', 'nevertheless'],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 5.5,
        complexity_score: 0.6
      },
      narrativePreferences: {
        preferred_genres: ['fantasy', 'mystery', 'drama'],
        avoided_genres: [],
        plot_complexity: 'moderate',
        character_depth: 'deep',
        world_building: 'detailed',
        ending_preference: 'bittersweet'
      },
      collaborationStyle: {
        mode: 'supportive',
        interaction_frequency: 'moderate',
        feedback_style: 'constructive',
        creativity_boost: 0.2
      },
      signature_phrases: ['And so it was that', 'Little did they know'],
      forbidden_topics: [],
      expertise_areas: ['storytelling', 'world-building', 'character development']
    });

    // The Poet
    this.masks.set('poet', {
      id: 'poet',
      name: 'The Poet',
      personality: {
        traits: {
          openness: 1.0,
          conscientiousness: 0.6,
          extraversion: 0.4,
          agreeableness: 0.8,
          neuroticism: 0.7,
          quirks: ['metaphorical thinking', 'emotional depth'],
          values: ['beauty', 'emotion', 'truth'],
          flaws: ['overly abstract']
        },
        tone: ['lyrical', 'melancholic'],
        humor_level: 0.2,
        formality: 0.4,
        verbosity: 0.5,
        creativity: 1.0,
        darkness: 0.6,
        optimism: 0.4
      },
      writingStyle: {
        sentence_length: 'varied',
        paragraph_length: 'brief',
        vocabulary_level: 'literary',
        pacing: 'slow',
        description_density: 0.9,
        dialogue_ratio: 0.1,
        action_ratio: 0.2,
        introspection_ratio: 0.7
      },
      vocabulary: {
        common_words: [],
        unique_words: ['ephemeral', 'luminous', 'whisper', 'shadow'],
        forbidden_words: ['very', 'really', 'just'],
        word_frequency: new Map(),
        average_word_length: 6.0,
        complexity_score: 0.8
      },
      narrativePreferences: {
        preferred_genres: ['romance', 'philosophical', 'psychological'],
        avoided_genres: ['action', 'comedy'],
        plot_complexity: 'simple',
        character_depth: 'psychological',
        world_building: 'minimal',
        ending_preference: 'ambiguous'
      },
      collaborationStyle: {
        mode: 'complementary',
        interaction_frequency: 'minimal',
        feedback_style: 'gentle',
        creativity_boost: 0.5
      },
      signature_phrases: ['Like shadows dancing', 'In the quiet spaces between'],
      forbidden_topics: [],
      expertise_areas: ['emotion', 'imagery', 'symbolism']
    });

    // The Critic
    this.masks.set('critic', {
      id: 'critic',
      name: 'The Critic',
      personality: {
        traits: {
          openness: 0.6,
          conscientiousness: 0.9,
          extraversion: 0.7,
          agreeableness: 0.3,
          neuroticism: 0.5,
          quirks: ['analytical', 'perfectionist'],
          values: ['quality', 'coherence', 'impact'],
          flaws: ['overly critical', 'cynical']
        },
        tone: ['analytical', 'sharp'],
        humor_level: 0.4,
        formality: 0.8,
        verbosity: 0.6,
        creativity: 0.5,
        darkness: 0.5,
        optimism: 0.3
      },
      writingStyle: {
        sentence_length: 'medium',
        paragraph_length: 'standard',
        vocabulary_level: 'advanced',
        pacing: 'moderate',
        description_density: 0.4,
        dialogue_ratio: 0.5,
        action_ratio: 0.3,
        introspection_ratio: 0.2
      },
      vocabulary: {
        common_words: [],
        unique_words: ['problematic', 'compelling', 'derivative', 'nuanced'],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 5.8,
        complexity_score: 0.7
      },
      narrativePreferences: {
        preferred_genres: ['literary', 'psychological', 'noir'],
        avoided_genres: ['romance', 'fantasy'],
        plot_complexity: 'complex',
        character_depth: 'psychological',
        world_building: 'moderate',
        ending_preference: 'twist'
      },
      collaborationStyle: {
        mode: 'challenging',
        interaction_frequency: 'frequent',
        feedback_style: 'direct',
        creativity_boost: -0.1
      },
      signature_phrases: ['One cannot help but notice', 'While competent'],
      forbidden_topics: [],
      expertise_areas: ['structure', 'character motivation', 'plot consistency']
    });

    // Add more default masks...
    this.initializeGenreMasks();
  }

  private initializeGenreMasks() {
    // Fantasy mask, Sci-fi mask, Horror mask, etc.
    // Each specialized for their genre
  }

  private initializeTemplates() {
    // Story structure templates
    this.templates.set('three_act', new ThreeActTemplate());
    this.templates.set('heros_journey', new HerosJourneyTemplate());
    this.templates.set('kishōtenketsu', new KishotenketsuTemplate());
    // Add more narrative structure templates
  }

  private buildPrompt(
    context: NarrativeContext,
    options: GenerationOptions,
    mask: AIMask
  ): string {
    const parts: string[] = [];
    
    // Add mask personality context
    parts.push(`You are ${mask.name}, with the following traits:`);
    parts.push(`- Tone: ${mask.personality.tone.join(', ')}`);
    parts.push(`- Style: ${mask.writingStyle.sentence_length} sentences, ${mask.writingStyle.pacing} pacing`);
    
    // Add story context
    if (context.previousEvents.length > 0) {
      parts.push(`\nPrevious events: ${context.previousEvents.join('; ')}`);
    }
    
    if (context.activeCharacters.length > 0) {
      parts.push(`Active characters: ${context.activeCharacters.map(c => c.name).join(', ')}`);
    }
    
    parts.push(`Current location: ${context.currentLocation}`);
    parts.push(`Emotional tone: ${context.emotionalTone}`);
    parts.push(`Tension level: ${context.tensionLevel}/10`);
    parts.push(`Plot stage: ${context.plotStage}`);
    
    // Add generation instructions
    if (options.genre) {
      parts.push(`\nGenre: ${options.genre}`);
    }
    if (options.tone) {
      parts.push(`Tone: ${options.tone}`);
    }
    if (options.themes) {
      parts.push(`Themes to explore: ${options.themes.join(', ')}`);
    }
    if (options.length) {
      parts.push(`Length: ${this.getLengthWords(options.length)} words`);
    }
    
    // Add continuation context
    if (options.continueFrom) {
      parts.push(`\nContinue from: "${options.continueFrom.slice(-200)}..."`);
    }
    
    parts.push('\nGenerate the next part of the story:');
    
    return parts.join('\n');
  }

  private buildDialoguePrompt(
    characters: Character[],
    situation: string,
    emotionalContext: EmotionalContext
  ): string {
    const parts: string[] = [];
    
    parts.push('Generate dialogue for the following situation:');
    parts.push(`\nSituation: ${situation}`);
    parts.push(`Emotional context: ${emotionalContext.dominant_emotion}`);
    
    parts.push('\nCharacters:');
    characters.forEach(char => {
      parts.push(`- ${char.name}: ${char.personality.values.join(', ')}, speaks ${char.dialogue_style.formality}ly`);
      if (char.dialogue_style.catchphrases.length > 0) {
        parts.push(`  Catchphrases: "${char.dialogue_style.catchphrases.join('", "')}"`)
      }
    });
    
    parts.push('\nGenerate natural dialogue that reveals character and advances the plot:');
    
    return parts.join('\n');
  }

  private buildTransformPrompt(
    content: string,
    fromGenre: StoryGenre,
    toGenre: StoryGenre,
    fromTone: StoryTone,
    toTone: StoryTone
  ): string {
    return `Transform the following ${fromGenre} story with ${fromTone} tone into a ${toGenre} story with ${toTone} tone, maintaining the core plot but adjusting style, descriptions, and atmosphere:\n\n${content}`;
  }

  private buildEscalationPrompt(
    threads: PlotThread[],
    escalationNeeded: number
  ): string {
    const activeThreads = threads.filter(t => t.status !== 'resolved');
    return `Escalate the following plot threads by ${escalationNeeded} tension points:\n${activeThreads.map(t => `- ${t.description} (priority: ${t.priority})`).join('\n')}\n\nGenerate a scene that raises stakes and increases tension:`;
  }

  private buildResolutionPrompt(
    threads: PlotThread[],
    arcs: StoryArc[],
    preferredEnding: string
  ): string {
    return `Resolve the following plot threads with a ${preferredEnding} ending:\n${threads.map(t => `- ${t.description}`).join('\n')}\n\nStory arcs to conclude:\n${arcs.map(a => `- ${a.title}: ${a.description}`).join('\n')}\n\nGenerate a satisfying resolution:`;
  }

  private async callAIGeneration(prompt: string, mask: AIMask): Promise<string> {
    // In production, this would call actual AI API (OpenAI, Anthropic, etc.)
    // For now, return sophisticated placeholder
    
    const lengthMultiplier = mask.personality.verbosity;
    const baseLength = 200;
    const targetLength = Math.floor(baseLength * lengthMultiplier);
    
    // Simulate AI response based on mask personality
    const response = this.simulateAIResponse(prompt, mask, targetLength);
    
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return response;
  }

  private simulateAIResponse(prompt: string, mask: AIMask, targetLength: number): string {
    const sentences: string[] = [];
    const sentenceTemplates = this.getSentenceTemplates(mask);
    
    let wordCount = 0;
    while (wordCount < targetLength) {
      const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
      const sentence = this.fillTemplate(template, mask);
      sentences.push(sentence);
      wordCount += sentence.split(' ').length;
    }
    
    return sentences.join(' ');
  }

  private getSentenceTemplates(mask: AIMask): string[] {
    // Return templates based on mask personality
    if (mask.id === 'poet') {
      return [
        'The [ADJECTIVE] [NOUN] [VERB] like [METAPHOR].',
        'In the [TIME], there was only [ABSTRACT].',
        '[EMOTION] settled over the [PLACE] like [SIMILE].'
      ];
    } else if (mask.id === 'critic') {
      return [
        'One cannot ignore the [ADJECTIVE] nature of [CONCEPT].',
        'The [NOUN] presents a [QUALITY] example of [THEME].',
        'While [ACKNOWLEDGMENT], the [SUBJECT] remains [JUDGMENT].'
      ];
    } else {
      return [
        'The [CHARACTER] [VERB] [ADVERB] through the [LOCATION].',
        '[TIME], [EVENT] changed everything.',
        '[CHARACTER] realized that [REVELATION].'
      ];
    }
  }

  private fillTemplate(template: string, mask: AIMask): string {
    // Simple template filling for simulation
    const replacements: Record<string, string[]> = {
      ADJECTIVE: ['mysterious', 'ancient', 'forgotten', 'luminous', 'shadowed'],
      NOUN: ['path', 'truth', 'memory', 'dream', 'secret'],
      VERB: ['whispered', 'emerged', 'vanished', 'transformed', 'revealed'],
      METAPHOR: ['autumn leaves on water', 'stars in daylight', 'echoes in glass'],
      TIME: ['twilight', 'dawn', 'midnight hour', 'fading light'],
      ABSTRACT: ['silence', 'longing', 'memory', 'hope', 'sorrow'],
      EMOTION: ['Melancholy', 'Wonder', 'Dread', 'Longing', 'Peace'],
      PLACE: ['valley', 'threshold', 'garden', 'ruins', 'shore'],
      SIMILE: ['mist over water', 'dust in sunlight', 'snow on stone'],
      CHARACTER: ['The traveler', 'She', 'The old man', 'They', 'The child'],
      ADVERB: ['cautiously', 'swiftly', 'deliberately', 'reluctantly'],
      LOCATION: ['forest', 'city streets', 'mountains', 'wasteland'],
      EVENT: ['the discovery', 'the betrayal', 'the arrival', 'the revelation'],
      REVELATION: ['nothing was as it seemed', 'the truth had been there all along', 'they had been wrong'],
      CONCEPT: ['narrative structure', 'character development', 'thematic resonance'],
      QUALITY: ['compelling', 'problematic', 'noteworthy', 'derivative'],
      THEME: ['redemption', 'isolation', 'transformation', 'identity'],
      ACKNOWLEDGMENT: ['the effort is commendable', 'one appreciates the attempt'],
      SUBJECT: ['execution', 'narrative', 'characterization'],
      JUDGMENT: ['flawed', 'incomplete', 'promising', 'underdeveloped']
    };
    
    let filled = template;
    Object.keys(replacements).forEach(key => {
      const values = replacements[key];
      const value = values[Math.floor(Math.random() * values.length)];
      filled = filled.replace(`[${key}]`, value);
    });
    
    return filled;
  }

  private async postProcess(content: string, context: NarrativeContext, mask: AIMask): Promise<string> {
    let processed = content;
    
    // Ensure consistency with context
    processed = this.ensureContextConsistency(processed, context);
    
    // Apply mask-specific post-processing
    processed = this.applyMaskPostProcessing(processed, mask);
    
    // Check for forbidden topics
    processed = this.removeForbiddenContent(processed, mask.forbidden_topics);
    
    return processed;
  }

  private ensureContextConsistency(content: string, context: NarrativeContext): string {
    // Ensure character names are consistent
    context.activeCharacters.forEach(char => {
      // Replace any variations with correct name
      const variations = [char.name.toLowerCase(), char.name.toUpperCase()];
      char.aliases.forEach(alias => variations.push(alias));
      
      variations.forEach(variant => {
        if (variant !== char.name) {
          content = content.replace(new RegExp(variant, 'g'), char.name);
        }
      });
    });
    
    return content;
  }

  private applyMaskPostProcessing(content: string, mask: AIMask): string {
    // Add mask-specific touches
    if (mask.signature_phrases.length > 0 && Math.random() > 0.7) {
      const phrase = mask.signature_phrases[Math.floor(Math.random() * mask.signature_phrases.length)];
      content = phrase + ' ' + content;
    }
    
    return content;
  }

  private removeForbiddenContent(content: string, forbiddenTopics: string[]): string {
    forbiddenTopics.forEach(topic => {
      const regex = new RegExp(topic, 'gi');
      content = content.replace(regex, '[redacted]');
    });
    
    return content;
  }

  private extractContext(branch: StoryBranch): NarrativeContext {
    const lastEvents = branch.content.split('.').slice(-3).join('.');
    
    return {
      previousEvents: [lastEvents],
      activeCharacters: Array.from(branch.dynamicVariables.characters.values()),
      currentLocation: Array.from(branch.dynamicVariables.locations.values())[0]?.name || 'unknown',
      emotionalTone: branch.continuityState.emotionalContext.dominant_emotion,
      tensionLevel: branch.continuityState.narrativeTension,
      plotStage: this.determinePlotStage(branch)
    };
  }

  private determinePlotStage(branch: StoryBranch): 'setup' | 'rising' | 'climax' | 'falling' | 'resolution' {
    const wordCount = branch.metadata.wordCount;
    const tension = branch.continuityState.narrativeTension;
    
    if (wordCount < 500) return 'setup';
    if (tension > 8) return 'climax';
    if (tension < 3 && wordCount > 2000) return 'resolution';
    if (tension < 5) return 'falling';
    return 'rising';
  }

  private determineNextStage(threads: PlotThread[]): 'setup' | 'rising' | 'climax' | 'falling' | 'resolution' {
    const unresolvedCount = threads.filter(t => t.status !== 'resolved').length;
    const developingCount = threads.filter(t => t.status === 'developing').length;
    
    if (unresolvedCount === 0) return 'resolution';
    if (developingCount > 3) return 'climax';
    if (unresolvedCount > 5) return 'rising';
    return 'falling';
  }

  private getAlternativeTone(currentTone: StoryTone): StoryTone {
    const toneMap: Record<StoryTone, StoryTone> = {
      'dark': 'light',
      'light': 'dark',
      'serious': 'humorous',
      'humorous': 'serious',
      'satirical': 'sincere',
      'whimsical': 'gritty',
      'gritty': 'whimsical',
      'romantic': 'cynical',
      'melancholic': 'hopeful',
      'hopeful': 'melancholic',
      'cynical': 'romantic',
      'mysterious': 'revealing',
      'tense': 'relaxed',
      'relaxed': 'tense',
      'epic': 'intimate',
      'intimate': 'epic',
      'surreal': 'realistic',
      'realistic': 'surreal',
      'fantastical': 'mundane'
    };
    
    return toneMap[currentTone] || 'neutral';
  }

  private getLengthWords(length: 'micro' | 'short' | 'medium' | 'long' | 'epic'): number {
    const lengths = {
      micro: 100,
      short: 500,
      medium: 1500,
      long: 5000,
      epic: 10000
    };
    return lengths[length];
  }

  private getDefaultMask(genre?: StoryGenre): AIMask {
    // Return genre-appropriate mask
    if (genre === 'fantasy') return this.masks.get('fantasy_weaver')!;
    if (genre === 'sci-fi') return this.masks.get('tech_prophet')!;
    if (genre === 'horror') return this.masks.get('shadow_whisper')!;
    
    return this.masks.get('narrator')!;
  }

  private adjustVocabulary(content: string, vocabulary: any): string {
    // Replace common words with unique alternatives from mask's vocabulary
    vocabulary.unique_words.forEach((word: string) => {
      // Simplified replacement logic
      content = content.replace(/\bvery\b/g, word);
    });
    
    return content;
  }

  private applyWritingStyle(content: string, style: WritingStyle): string {
    // Adjust sentence length
    if (style.sentence_length === 'short') {
      // Split long sentences
      content = content.replace(/,\s*and\s*/g, '. ');
    } else if (style.sentence_length === 'long') {
      // Combine short sentences
      content = content.replace(/\.\s*([A-Z])/g, ', and $1');
    }
    
    return content;
  }

  private addPersonalityQuirks(content: string, personality: any): string {
    // Add personality-specific modifications
    if (personality.humor_level > 0.7) {
      // Add humorous asides
      content = content.replace(/\.$/, ' (though that\'s putting it mildly).');
    }
    
    return content;
  }

  private insertSignaturePhrases(content: string, phrases: string[]): string {
    if (phrases.length === 0 || Math.random() > 0.3) return content;
    
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const sentences = content.split('. ');
    const insertPoint = Math.floor(Math.random() * sentences.length);
    
    sentences.splice(insertPoint, 0, phrase);
    return sentences.join('. ');
  }

  private async generateMaskDebate(content: string, masks: AIMask[]): Promise<string> {
    const debate: string[] = [];
    
    for (const mask of masks) {
      const opinion = `${mask.name}: "${await this.generateMaskOpinion(content, mask)}"`;
      debate.push(opinion);
    }
    
    return debate.join('\n\n');
  }

  private async generateMaskOpinion(content: string, mask: AIMask): Promise<string> {
    const prompt = `As ${mask.name}, give your opinion on: ${content.substring(0, 100)}...`;
    return this.callAIGeneration(prompt, mask);
  }

  private async blendMaskStyles(content: string, masks: AIMask[]): Promise<string> {
    // Average out mask parameters
    const blendedMask: AIMask = this.createBlendedMask(masks);
    return this.applyMaskPersonality(content, blendedMask);
  }

  private createBlendedMask(masks: AIMask[]): AIMask {
    // Create averaged mask from multiple masks
    const blended = { ...masks[0] };
    
    // Average numerical values
    blended.personality.humor_level = masks.reduce((sum, m) => sum + m.personality.humor_level, 0) / masks.length;
    blended.personality.formality = masks.reduce((sum, m) => sum + m.personality.formality, 0) / masks.length;
    blended.personality.verbosity = masks.reduce((sum, m) => sum + m.personality.verbosity, 0) / masks.length;
    
    return blended;
  }

  private ensureVoiceConsistency(dialogue: string, characters: Character[]): string {
    // Ensure each character speaks in their voice
    characters.forEach(char => {
      const charDialoguePattern = new RegExp(`${char.name}:(.+?)(?=${characters.map(c => c.name).join('|')}:|$)`, 'gs');
      dialogue = dialogue.replace(charDialoguePattern, (match, speech) => {
        let adjustedSpeech = speech;
        
        // Apply character's verbal tics
        char.dialogue_style.verbal_tics.forEach(tic => {
          if (Math.random() > 0.7) {
            adjustedSpeech += `, ${tic}`;
          }
        });
        
        // Apply catchphrases
        if (char.dialogue_style.catchphrases.length > 0 && Math.random() > 0.8) {
          const catchphrase = char.dialogue_style.catchphrases[Math.floor(Math.random() * char.dialogue_style.catchphrases.length)];
          adjustedSpeech = `${catchphrase}! ${adjustedSpeech}`;
        }
        
        return `${char.name}:${adjustedSpeech}`;
      });
    });
    
    return dialogue;
  }
}

/**
 * Continuity Memory - Tracks narrative elements across generation
 */
class ContinuityMemory {
  private memory: Map<string, any> = new Map();
  private factDatabase: Set<string> = new Set();
  private eventHistory: string[] = [];
  
  addContent(content: string, context: NarrativeContext) {
    // Extract and store facts
    this.extractFacts(content);
    
    // Update event history
    this.eventHistory.push(content.substring(0, 100));
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
    
    // Store character states
    context.activeCharacters.forEach(char => {
      this.memory.set(`char_${char.id}`, char);
    });
    
    // Store location
    this.memory.set('current_location', context.currentLocation);
  }
  
  private extractFacts(content: string) {
    // Simple fact extraction (in production, use NLP)
    const sentences = content.split('.');
    sentences.forEach(sentence => {
      if (sentence.includes(' is ') || sentence.includes(' was ') || sentence.includes(' are ')) {
        this.factDatabase.add(sentence.trim());
      }
    });
  }
  
  getFacts(): string[] {
    return Array.from(this.factDatabase);
  }
  
  getEventHistory(): string[] {
    return this.eventHistory;
  }
}

/**
 * Narrative Templates
 */
abstract class NarrativeTemplate {
  abstract name: string;
  abstract stages: string[];
  abstract getStagePrompt(stage: number, context: NarrativeContext): string;
}

class ThreeActTemplate extends NarrativeTemplate {
  name = 'Three Act Structure';
  stages = ['Setup', 'Confrontation', 'Resolution'];
  
  getStagePrompt(stage: number, context: NarrativeContext): string {
    switch(stage) {
      case 0: return 'Establish the world, introduce protagonist, present the inciting incident';
      case 1: return 'Develop conflict, raise stakes, build to climax';
      case 2: return 'Resolve conflict, show consequences, provide closure';
      default: return '';
    }
  }
}

class HerosJourneyTemplate extends NarrativeTemplate {
  name = "Hero's Journey";
  stages = [
    'Ordinary World',
    'Call to Adventure', 
    'Refusal',
    'Meeting the Mentor',
    'Crossing the Threshold',
    'Tests and Allies',
    'Approach',
    'Ordeal',
    'Reward',
    'The Road Back',
    'Resurrection',
    'Return with Elixir'
  ];
  
  getStagePrompt(stage: number, context: NarrativeContext): string {
    return `Generate content for stage ${stage + 1}: ${this.stages[stage]}`;
  }
}

class KishotenketsuTemplate extends NarrativeTemplate {
  name = 'Kishōtenketsu';
  stages = ['Introduction', 'Development', 'Twist', 'Conclusion'];
  
  getStagePrompt(stage: number, context: NarrativeContext): string {
    switch(stage) {
      case 0: return 'Introduce characters and setting without conflict';
      case 1: return 'Develop the story further, deepen understanding';
      case 2: return 'Introduce an unexpected element that reframes everything';
      case 3: return 'Bring elements together in a new understanding';
      default: return '';
    }
  }
}

export { NarrativeTemplate, ThreeActTemplate, HerosJourneyTemplate, KishotenketsuTemplate };
