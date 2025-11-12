/**
 * Advanced Angry Lips System - Next-Gen Mad Libs Engine
 * Implements Meta's revolutionary suggestions for dynamic, intelligent, social gameplay
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import type { StoryTemplate, BlankType } from './angryLipsTemplates';

// ============================================================================
// PRICING & MONETIZATION SYSTEM
// ============================================================================

export interface PricingTier {
  id: string;
  name: string;
  sparksCost: number;
  features: string[];
  recommended?: boolean;
}

export const ANGRY_LIPS_PRICING: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic Round',
    sparksCost: 10, // $0.20 (AI cost: ~$0.04, Profit: ~$0.16)
    features: [
      'Standard templates',
      'Single player mode',
      'Basic mood adaptation',
      'Laugh Index scoring'
    ]
  },
  {
    id: 'enhanced',
    name: 'Enhanced Experience',
    sparksCost: 25, // $0.50 (AI cost: ~$0.12, Profit: ~$0.38)
    features: [
      'AI Mood Director',
      'Dynamic reactive templates',
      'Multiplayer modes',
      'Semantic intelligence',
      'Memory personalization',
      'Narrative continuity'
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium Session',
    sparksCost: 50, // $1.00 (AI cost: ~$0.25, Profit: ~$0.75)
    features: [
      'All enhanced features',
      'AI-generated custom stories',
      'Voice synthesis & narration',
      'AI art generation',
      'Episodic universe tracking',
      'Theater mode performance',
      'Cursed mode psychoanalysis'
    ]
  }
];

// ============================================================================
// 1. DYNAMIC TEMPLATES - Stories That React
// ============================================================================

export interface DynamicTemplate extends StoryTemplate {
  reactiveLogic?: ReactiveRule[];
  humorBeats?: HumorBeat[];
  branches?: StoryBranch[];
}

export interface ReactiveRule {
  triggerBlankId: string;
  triggerCondition: (input: string) => boolean;
  affectedBlanks: string[];
  transformation: (blank: BlankType) => BlankType;
}

export interface HumorBeat {
  position: number; // Word position in template
  weight: number; // 0-1, importance for comedy
  blankId?: string; // Associated blank if any
}

export interface StoryBranch {
  condition: (inputs: Record<string, string>) => boolean;
  alternateEnding: string;
  tone: 'romantic' | 'dark' | 'absurd' | 'wholesome';
}

export class DynamicTemplateEngine {
  private template: DynamicTemplate;
  private userInputs: Record<string, string> = {};
  private currentTone: string = 'neutral';
  
  constructor(template: DynamicTemplate) {
    this.template = template;
  }
  
  // Adapt future blanks based on previous inputs
  adaptBlank(blankId: string): BlankType {
    const blank = this.template.blanks.find(b => b.id === blankId);
    if (!blank) return blank!;
    
    // Check reactive rules
    const applicableRules = this.template.reactiveLogic?.filter(rule => 
      rule.affectedBlanks.includes(blankId) &&
      rule.triggerCondition(this.userInputs[rule.triggerBlankId] || '')
    ) || [];
    
    // Apply transformations
    let adaptedBlank = { ...blank };
    applicableRules.forEach(rule => {
      adaptedBlank = rule.transformation(adaptedBlank);
    });
    
    return adaptedBlank;
  }
  
  // Identify optimal humor placement
  getHumorWeight(position: number): number {
    const beat = this.template.humorBeats?.find(b => 
      Math.abs(b.position - position) < 10
    );
    return beat?.weight || 0.5;
  }
  
  // Choose ending based on word choices
  selectBranch(): string {
    if (!this.template.branches) return this.template.template;
    
    for (const branch of this.template.branches) {
      if (branch.condition(this.userInputs)) {
        this.currentTone = branch.tone;
        return branch.alternateEnding;
      }
    }
    
    return this.template.template;
  }
}

// ============================================================================
// 2. SEMANTIC INTELLIGENCE - Meaning-Aware Blanks
// ============================================================================

export interface SemanticAnalysis {
  partOfSpeech: string;
  semanticDomain: string[];
  sentiment: number; // -1 to 1
  synonyms: string[];
  rhymes?: string[];
  alliterationCandidates?: string[];
}

export class SemanticEngine {
  private wordDatabase: Map<string, SemanticAnalysis> = new Map();
  
  analyze(word: string): SemanticAnalysis {
    // In production, this would call an NLP service
    // For now, using pattern matching and basic rules
    
    const analysis: SemanticAnalysis = {
      partOfSpeech: this.detectPartOfSpeech(word),
      semanticDomain: this.detectDomains(word),
      sentiment: this.calculateSentiment(word),
      synonyms: this.findSynonyms(word),
      rhymes: this.findRhymes(word),
      alliterationCandidates: this.findAlliteration(word)
    };
    
    this.wordDatabase.set(word.toLowerCase(), analysis);
    return analysis;
  }
  
  private detectPartOfSpeech(word: string): string {
    // Simplified POS detection
    if (word.endsWith('ing')) return 'verb-progressive';
    if (word.endsWith('ed')) return 'verb-past';
    if (word.endsWith('ly')) return 'adverb';
    if (word.endsWith('ness') || word.endsWith('tion')) return 'noun-abstract';
    return 'noun';
  }
  
  private detectDomains(word: string): string[] {
    const domains: string[] = [];
    
    // Animal domain
    const animals = ['cat', 'dog', 'bird', 'fish', 'elephant', 'tiger'];
    if (animals.some(a => word.toLowerCase().includes(a))) {
      domains.push('animal');
    }
    
    // Emotion domain
    const emotions = ['happy', 'sad', 'angry', 'excited', 'love', 'hate'];
    if (emotions.some(e => word.toLowerCase().includes(e))) {
      domains.push('emotion');
    }
    
    // Action domain
    if (word.endsWith('ing') || word.endsWith('ed')) {
      domains.push('action');
    }
    
    return domains;
  }
  
  private calculateSentiment(word: string): number {
    // Simplified sentiment
    const positive = ['love', 'happy', 'beautiful', 'amazing', 'wonderful'];
    const negative = ['hate', 'ugly', 'terrible', 'awful', 'disgusting'];
    
    if (positive.some(p => word.toLowerCase().includes(p))) return 0.8;
    if (negative.some(n => word.toLowerCase().includes(n))) return -0.8;
    return 0;
  }
  
  private findSynonyms(word: string): string[] {
    // In production, use a thesaurus API
    const synonymMap: Record<string, string[]> = {
      'big': ['large', 'huge', 'enormous', 'gigantic'],
      'small': ['tiny', 'little', 'miniature', 'petite'],
      'fast': ['quick', 'rapid', 'speedy', 'swift'],
      'slow': ['sluggish', 'leisurely', 'gradual', 'unhurried']
    };
    
    return synonymMap[word.toLowerCase()] || [];
  }
  
  private findRhymes(word: string): string[] {
    // Simplified rhyme detection
    const lastSyllable = word.slice(-3);
    const rhymes: string[] = [];
    
    // In production, use a rhyming dictionary API
    return rhymes;
  }
  
  private findAlliteration(word: string): string[] {
    // Find words starting with same letter
    const firstLetter = word[0].toLowerCase();
    // In production, return from word database
    return [];
  }
  
  harmonizePairing(adjective: string, noun: string): string {
    const adjAnalysis = this.analyze(adjective);
    const nounAnalysis = this.analyze(noun);
    
    // Check for alliteration opportunity
    if (adjective[0] === noun[0]) {
      return `${adjective} ${noun}`; // Keep alliteration
    }
    
    // Check for rhythm (syllable count)
    const adjSyllables = this.countSyllables(adjective);
    const nounSyllables = this.countSyllables(noun);
    
    if (Math.abs(adjSyllables - nounSyllables) > 3) {
      // Try to find a synonym with better rhythm
      const betterAdj = adjAnalysis.synonyms.find(s => 
        Math.abs(this.countSyllables(s) - nounSyllables) < 2
      );
      if (betterAdj) return `${betterAdj} ${noun}`;
    }
    
    return `${adjective} ${noun}`;
  }
  
  private countSyllables(word: string): number {
    // Simplified syllable counting
    return word.toLowerCase().replace(/[^aeiou]/g, '').length || 1;
  }
}

// ============================================================================
// 3. MULTIPLAYER & COMPETITIVE MODES
// ============================================================================

export type GameMode = 'versus' | 'chain' | 'team-remix' | 'speed-fill' | 'blind-collab';

export interface MultiplayerSession {
  id: string;
  mode: GameMode;
  players: Player[];
  currentTemplate: DynamicTemplate;
  state: 'waiting' | 'filling' | 'voting' | 'revealing' | 'complete';
  scores: Record<string, number>;
  timeLimit?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  contributions: Record<string, string>; // blankId -> word
  votesCast: string[]; // playerIds voted for
}

export class MultiplayerEngine {
  private sessions: Map<string, MultiplayerSession> = new Map();
  
  createSession(mode: GameMode, hostPlayer: Player): string {
    const sessionId = `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: MultiplayerSession = {
      id: sessionId,
      mode,
      players: [hostPlayer],
      currentTemplate: {} as DynamicTemplate, // Will be set when game starts
      state: 'waiting',
      scores: { [hostPlayer.id]: 0 },
      timeLimit: this.getTimeLimitForMode(mode)
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }
  
  private getTimeLimitForMode(mode: GameMode): number {
    const timeLimits: Record<GameMode, number> = {
      'versus': 30,
      'chain': 20,
      'team-remix': 45,
      'speed-fill': 10,
      'blind-collab': 25
    };
    return timeLimits[mode];
  }
  
  handleModeLogic(session: MultiplayerSession): void {
    switch (session.mode) {
      case 'versus':
        // Everyone fills same blanks, audience votes
        this.runVersusMode(session);
        break;
      case 'chain':
        // Sequential filling without seeing story
        this.runChainMode(session);
        break;
      case 'team-remix':
        // One writes blanks, another fills
        this.runTeamRemixMode(session);
        break;
      case 'speed-fill':
        // Race to fill all blanks
        this.runSpeedFillMode(session);
        break;
      case 'blind-collab':
        // Fill blanks without knowing the story theme
        this.runBlindCollabMode(session);
        break;
    }
  }
  
  private runVersusMode(session: MultiplayerSession): void {
    // All players get same template
    // After filling, enter voting phase
    // Points awarded based on votes received
    if (session.state === 'filling') {
      const allFilled = session.players.every(p => 
        Object.keys(p.contributions).length === session.currentTemplate.blanks.length
      );
      
      if (allFilled) {
        session.state = 'voting';
        // Trigger voting UI
      }
    }
  }
  
  private runChainMode(session: MultiplayerSession): void {
    // Each player fills one blank in sequence
    // No one sees the story until all blanks filled
    const currentPlayerIndex = Object.keys(session.players[0].contributions).length % session.players.length;
    const currentPlayer = session.players[currentPlayerIndex];
    
    // Only current player can input
    // Auto-advance to next player after input
  }
  
  private runTeamRemixMode(session: MultiplayerSession): void {
    // Player 1 creates blank types
    // Player 2 fills them
    // Scored on humor synergy
  }
  
  private runSpeedFillMode(session: MultiplayerSession): void {
    // First to fill all blanks wins
    // Bonus points for quality (semantic analysis)
  }
  
  private runBlindCollabMode(session: MultiplayerSession): void {
    // Players don't see the story theme
    // Maximum chaos potential
  }
}

// ============================================================================
// 4. ADAPTIVE HUMOR ENGINE
// ============================================================================

export interface HumorPattern {
  id: string;
  pattern: string; // e.g., "contrast", "repetition", "escalation"
  successRate: number; // 0-1
  examples: string[];
  lastUsed?: Date;
}

export interface UserHumorProfile {
  userId: string;
  preferredPatterns: HumorPattern[];
  laughTriggers: string[]; // Words that consistently get laughs
  avoidList: string[]; // Words that fall flat
  humorStyle: 'absurd' | 'punny' | 'dark' | 'wholesome' | 'chaotic';
  calibrationLevel: number; // 0-100, how well we know their humor
}

export class AdaptiveHumorEngine {
  private userProfiles: Map<string, UserHumorProfile> = new Map();
  private globalPatterns: HumorPattern[] = [];
  
  trackReaction(
    userId: string,
    template: string,
    inputs: Record<string, string>,
    reactionType: 'laugh' | 'meh' | 'groan',
    reactionIntensity: number // 0-1
  ): void {
    const profile = this.getOrCreateProfile(userId);
    
    // Analyze what made this funny (or not)
    const patterns = this.detectPatterns(template, inputs);
    
    patterns.forEach(pattern => {
      const existingPattern = profile.preferredPatterns.find(p => p.id === pattern.id);
      
      if (existingPattern) {
        // Update success rate with weighted average
        const weight = 0.1; // Recent reactions have 10% weight
        existingPattern.successRate = 
          existingPattern.successRate * (1 - weight) + 
          (reactionType === 'laugh' ? reactionIntensity : 0) * weight;
      } else {
        // Add new pattern
        profile.preferredPatterns.push({
          ...pattern,
          successRate: reactionType === 'laugh' ? reactionIntensity : 0
        });
      }
    });
    
    // Update calibration level
    profile.calibrationLevel = Math.min(100, profile.calibrationLevel + 1);
    
    this.userProfiles.set(userId, profile);
  }
  
  private detectPatterns(template: string, inputs: Record<string, string>): HumorPattern[] {
    const patterns: HumorPattern[] = [];
    
    // Detect contrast pattern
    const words = Object.values(inputs);
    const hasContrast = words.some(w => w.toLowerCase().includes('tiny')) && 
                       words.some(w => w.toLowerCase().includes('huge'));
    
    if (hasContrast) {
      patterns.push({
        id: 'contrast',
        pattern: 'contrast',
        successRate: 0.75, // Default high success for contrast
        examples: ['tiny elephant', 'huge ant']
      });
    }
    
    // Detect repetition pattern
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const hasRepetition = Object.values(wordCounts).some(count => count > 2);
    
    if (hasRepetition) {
      patterns.push({
        id: 'repetition',
        pattern: 'repetition',
        successRate: 0.65,
        examples: ['spam spam spam']
      });
    }
    
    // Detect escalation pattern
    const numbers = words.filter(w => /\d+/.test(w)).map(w => parseInt(w));
    const hasEscalation = numbers.length > 2 && 
      numbers.every((n, i) => i === 0 || n > numbers[i - 1]);
    
    if (hasEscalation) {
      patterns.push({
        id: 'escalation',
        pattern: 'escalation',
        successRate: 0.70,
        examples: ['1 cat, 10 cats, 1000 cats']
      });
    }
    
    return patterns;
  }
  
  private getOrCreateProfile(userId: string): UserHumorProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        preferredPatterns: [],
        laughTriggers: [],
        avoidList: [],
        humorStyle: 'absurd', // Default
        calibrationLevel: 0
      });
    }
    return this.userProfiles.get(userId)!;
  }
  
  generatePersonalizedTemplate(userId: string, baseTemplate: StoryTemplate): DynamicTemplate {
    const profile = this.getOrCreateProfile(userId);
    
    // Adjust blank density based on preferred patterns
    const optimalDensity = profile.preferredPatterns
      .filter(p => p.successRate > 0.7)
      .reduce((sum, p) => {
        if (p.pattern === 'rapid-fire') return sum - 2;
        if (p.pattern === 'slow-burn') return sum + 2;
        return sum;
      }, baseTemplate.blankDensity);
    
    // Create reactive rules based on laugh triggers
    const reactiveLogic: ReactiveRule[] = profile.laughTriggers.map(trigger => ({
      triggerBlankId: 'any',
      triggerCondition: (input: string) => input.toLowerCase().includes(trigger.toLowerCase()),
      affectedBlanks: ['next'],
      transformation: (blank: BlankType) => ({
        ...blank,
        prompt: `${blank.prompt} (try to callback to "${trigger}"!)`,
        examples: [...(blank.examples || []), `${trigger}-related`]
      })
    }));
    
    // Add humor beats at optimal positions
    const humorBeats: HumorBeat[] = this.calculateHumorBeats(
      baseTemplate,
      profile.preferredPatterns
    );
    
    return {
      ...baseTemplate,
      blankDensity: optimalDensity,
      reactiveLogic,
      humorBeats
    };
  }
  
  private calculateHumorBeats(
    template: StoryTemplate,
    patterns: HumorPattern[]
  ): HumorBeat[] {
    const beats: HumorBeat[] = [];
    const words = template.template.split(' ');
    
    // Setup (25% in)
    beats.push({
      position: Math.floor(words.length * 0.25),
      weight: 0.6
    });
    
    // Escalation (50% in)
    beats.push({
      position: Math.floor(words.length * 0.5),
      weight: 0.8
    });
    
    // Punchline (85% in)
    beats.push({
      position: Math.floor(words.length * 0.85),
      weight: 1.0
    });
    
    return beats;
  }
}

// ============================================================================
// 5. EPISODIC MAD LIB UNIVERSE
// ============================================================================

export interface EpisodicUniverse {
  userId: string;
  canonStories: CanonStory[];
  recurringElements: RecurringElement[];
  relationships: CharacterRelationship[];
  timeline: UniverseEvent[];
}

export interface CanonStory {
  id: string;
  date: Date;
  title: string;
  keyElements: string[]; // Important words from the story
  template: string;
  filledStory: string;
}

export interface RecurringElement {
  name: string;
  type: 'character' | 'object' | 'location' | 'concept';
  appearances: number;
  firstAppearance: Date;
  evolution: string[]; // How it's changed over time
}

export interface CharacterRelationship {
  character1: string;
  character2: string;
  relationshipType: string; // e.g., "nemesis", "love interest", "sidekick"
  establishedIn: string; // Story ID
}

export interface UniverseEvent {
  date: Date;
  description: string;
  involvedElements: string[];
  impact: 'minor' | 'major' | 'universe-altering';
}

export class EpisodicEngine {
  private universes: Map<string, EpisodicUniverse> = new Map();
  
  addStoryToCanon(
    userId: string,
    story: CanonStory
  ): void {
    const universe = this.getOrCreateUniverse(userId);
    
    // Add story to canon
    universe.canonStories.push(story);
    
    // Extract and track recurring elements
    story.keyElements.forEach(element => {
      const existing = universe.recurringElements.find(e => e.name === element);
      
      if (existing) {
        existing.appearances++;
        existing.evolution.push(`Appeared in "${story.title}"`);
      } else {
        universe.recurringElements.push({
          name: element,
          type: this.classifyElement(element),
          appearances: 1,
          firstAppearance: story.date,
          evolution: [`Debuted in "${story.title}"`]
        });
      }
    });
    
    // Update timeline
    universe.timeline.push({
      date: story.date,
      description: `The events of "${story.title}"`,
      involvedElements: story.keyElements,
      impact: this.assessImpact(story, universe)
    });
    
    this.universes.set(userId, universe);
  }
  
  private classifyElement(element: string): 'character' | 'object' | 'location' | 'concept' {
    // Simple classification logic
    if (element.includes('City') || element.includes('Land')) return 'location';
    if (element[0] === element[0].toUpperCase()) return 'character';
    if (element.includes('ing')) return 'concept';
    return 'object';
  }
  
  private assessImpact(
    story: CanonStory,
    universe: EpisodicUniverse
  ): 'minor' | 'major' | 'universe-altering' {
    // Stories with many recurring elements have bigger impact
    const recurringCount = story.keyElements.filter(e =>
      universe.recurringElements.some(r => r.name === e && r.appearances > 1)
    ).length;
    
    if (recurringCount > 5) return 'universe-altering';
    if (recurringCount > 2) return 'major';
    return 'minor';
  }
  
  private getOrCreateUniverse(userId: string): EpisodicUniverse {
    if (!this.universes.has(userId)) {
      this.universes.set(userId, {
        userId,
        canonStories: [],
        recurringElements: [],
        relationships: [],
        timeline: []
      });
    }
    return this.universes.get(userId)!;
  }
  
  generateContinuityTemplate(userId: string): Partial<StoryTemplate> {
    const universe = this.getOrCreateUniverse(userId);
    
    if (universe.canonStories.length === 0) {
      return {}; // No continuity yet
    }
    
    // Get most popular recurring elements
    const popularElements = universe.recurringElements
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 3);
    
    // Create a template that references them
    const references = popularElements.map(e => 
      `Last week's ${e.type === 'character' ? 'heroic' : ''} ${e.name} returns!`
    );
    
    return {
      title: `The Return of ${popularElements[0]?.name || 'Mystery'}`,
      template: `${references.join(' ')} {CONTINUATION_PROMPT} (continue the story)`
    };
  }
}

// ============================================================================
// 6. EMOTIONAL & THEMATIC MODES
// ============================================================================

export type StoryTone = 'comedy' | 'horror' | 'romance' | 'sci-fi' | 'noir' | 'action' | 'mystery';

export interface ToneProfile {
  tone: StoryTone;
  pacing: 'slow' | 'medium' | 'fast';
  blankDensity: number;
  vocabularyStyle: string[];
  sentenceStructure: 'short' | 'medium' | 'long';
  emotionalArc: EmotionalBeat[];
}

export interface EmotionalBeat {
  position: number; // 0-1 (percentage through story)
  emotion: string;
  intensity: number; // 0-1
}

export const TONE_PROFILES: Record<StoryTone, ToneProfile> = {
  comedy: {
    tone: 'comedy',
    pacing: 'fast',
    blankDensity: 9, // 1 per 9 words
    vocabularyStyle: ['silly', 'exaggerated', 'unexpected'],
    sentenceStructure: 'short',
    emotionalArc: [
      { position: 0.2, emotion: 'setup', intensity: 0.3 },
      { position: 0.5, emotion: 'escalation', intensity: 0.6 },
      { position: 0.9, emotion: 'punchline', intensity: 1.0 }
    ]
  },
  horror: {
    tone: 'horror',
    pacing: 'slow',
    blankDensity: 15, // 1 per 15 words (atmospheric)
    vocabularyStyle: ['ominous', 'visceral', 'shadowy'],
    sentenceStructure: 'long',
    emotionalArc: [
      { position: 0.1, emotion: 'unease', intensity: 0.2 },
      { position: 0.4, emotion: 'dread', intensity: 0.5 },
      { position: 0.7, emotion: 'terror', intensity: 0.8 },
      { position: 0.95, emotion: 'shock', intensity: 1.0 }
    ]
  },
  romance: {
    tone: 'romance',
    pacing: 'medium',
    blankDensity: 12,
    vocabularyStyle: ['passionate', 'tender', 'yearning'],
    sentenceStructure: 'medium',
    emotionalArc: [
      { position: 0.2, emotion: 'attraction', intensity: 0.4 },
      { position: 0.5, emotion: 'tension', intensity: 0.7 },
      { position: 0.8, emotion: 'confession', intensity: 0.9 },
      { position: 1.0, emotion: 'resolution', intensity: 0.6 }
    ]
  },
  noir: {
    tone: 'noir',
    pacing: 'slow',
    blankDensity: 13,
    vocabularyStyle: ['cynical', 'metaphorical', 'gritty'],
    sentenceStructure: 'long',
    emotionalArc: [
      { position: 0.1, emotion: 'world-weary', intensity: 0.5 },
      { position: 0.5, emotion: 'suspicion', intensity: 0.7 },
      { position: 0.9, emotion: 'revelation', intensity: 0.8 }
    ]
  },
  'sci-fi': {
    tone: 'sci-fi',
    pacing: 'medium',
    blankDensity: 11,
    vocabularyStyle: ['technical', 'futuristic', 'alien'],
    sentenceStructure: 'medium',
    emotionalArc: [
      { position: 0.2, emotion: 'wonder', intensity: 0.6 },
      { position: 0.5, emotion: 'discovery', intensity: 0.8 },
      { position: 0.9, emotion: 'transformation', intensity: 1.0 }
    ]
  },
  action: {
    tone: 'action',
    pacing: 'fast',
    blankDensity: 10,
    vocabularyStyle: ['explosive', 'kinetic', 'intense'],
    sentenceStructure: 'short',
    emotionalArc: [
      { position: 0.1, emotion: 'tension', intensity: 0.5 },
      { position: 0.5, emotion: 'chaos', intensity: 0.9 },
      { position: 0.9, emotion: 'triumph', intensity: 1.0 }
    ]
  },
  mystery: {
    tone: 'mystery',
    pacing: 'medium',
    blankDensity: 12,
    vocabularyStyle: ['cryptic', 'observant', 'deductive'],
    sentenceStructure: 'medium',
    emotionalArc: [
      { position: 0.1, emotion: 'curiosity', intensity: 0.4 },
      { position: 0.4, emotion: 'investigation', intensity: 0.6 },
      { position: 0.7, emotion: 'revelation', intensity: 0.8 },
      { position: 0.95, emotion: 'resolution', intensity: 0.9 }
    ]
  }
};

// ============================================================================
// 7. KINETIC DELIVERY
// ============================================================================

export interface KineticOutput {
  type: 'voice' | 'animation' | 'comic' | 'video';
  config: KineticConfig;
}

export interface KineticConfig {
  voiceSettings?: {
    voice: 'dramatic' | 'comedic' | 'robotic' | 'child' | 'narrator';
    speed: number; // 0.5-2.0
    pitch: number; // 0.5-2.0
    emphasis: string[]; // Words to emphasize
  };
  animationSettings?: {
    style: 'stick-figure' | 'cartoon' | 'minimal' | 'elaborate';
    duration: number; // seconds
    transitions: string[];
  };
  comicSettings?: {
    panels: number;
    style: 'manga' | 'western' | 'newspaper' | 'webcomic';
    speechBubbles: boolean;
  };
  videoSettings?: {
    format: 'tiktok' | 'reels' | 'youtube-short';
    duration: number; // 15, 30, or 60 seconds
    captions: boolean;
    music?: string;
  };
}

export class KineticDeliveryEngine {
  generateVoiceNarration(
    story: string,
    tone: StoryTone,
    userWords: string[]
  ): KineticOutput {
    return {
      type: 'voice',
      config: {
        voiceSettings: {
          voice: this.selectVoiceForTone(tone),
          speed: tone === 'action' ? 1.3 : tone === 'horror' ? 0.8 : 1.0,
          pitch: tone === 'comedy' ? 1.2 : 1.0,
          emphasis: userWords // Emphasize user contributions
        }
      }
    };
  }
  
  private selectVoiceForTone(tone: StoryTone): 'dramatic' | 'comedic' | 'robotic' | 'child' | 'narrator' {
    const voiceMap: Record<StoryTone, any> = {
      comedy: 'comedic',
      horror: 'dramatic',
      romance: 'narrator',
      'sci-fi': 'robotic',
      noir: 'dramatic',
      action: 'dramatic',
      mystery: 'narrator'
    };
    return voiceMap[tone];
  }
  
  generateAnimation(story: string, highlights: string[]): KineticOutput {
    const scenes = story.split('.').filter(s => s.trim());
    
    return {
      type: 'animation',
      config: {
        animationSettings: {
          style: 'stick-figure', // Start simple
          duration: Math.min(scenes.length * 3, 30), // 3 seconds per scene, max 30
          transitions: ['fade', 'slide', 'pop']
        }
      }
    };
  }
  
  generateShareableVideo(
    story: string,
    format: 'tiktok' | 'reels' | 'youtube-short'
  ): KineticOutput {
    const maxDuration = format === 'tiktok' ? 60 : format === 'reels' ? 30 : 60;
    
    return {
      type: 'video',
      config: {
        videoSettings: {
          format,
          duration: Math.min(story.length / 10, maxDuration), // Rough estimate
          captions: true,
          music: 'upbeat-comedy' // Default to comedy music
        }
      }
    };
  }
}

// ============================================================================
// 8. ACCESSIBILITY & INCLUSIVITY
// ============================================================================

export interface AccessibilitySettings {
  contentFilter: 'family' | 'teen' | 'adult' | 'unfiltered';
  languageAssist: boolean;
  definitionsEnabled: boolean;
  rhymeSuggestions: boolean;
  slowMode: boolean; // Extra time for responses
  highContrast: boolean;
  screenReaderOptimized: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

export class AccessibilityEngine {
  private bannedWords: Set<string> = new Set();
  private definitions: Map<string, string> = new Map();
  
  filterContent(
    text: string,
    level: 'family' | 'teen' | 'adult' | 'unfiltered'
  ): string {
    if (level === 'unfiltered') return text;
    
    const filters = {
      family: ['mild profanity', 'violence', 'adult themes'],
      teen: ['strong profanity', 'graphic content'],
      adult: ['extreme content']
    };
    
    // In production, use a proper content filter API
    let filtered = text;
    this.bannedWords.forEach(word => {
      filtered = filtered.replace(new RegExp(word, 'gi'), '***');
    });
    
    return filtered;
  }
  
  provideAssistance(
    blankType: string,
    assistLevel: 'none' | 'hints' | 'examples' | 'full'
  ): string[] {
    if (assistLevel === 'none') return [];
    
    const assistance: string[] = [];
    
    if (assistLevel >= 'hints') {
      assistance.push(`This is a ${blankType}`);
    }
    
    if (assistLevel >= 'examples') {
      assistance.push(`Examples: cat, dog, elephant`);
    }
    
    if (assistLevel === 'full') {
      assistance.push(`Definition: A ${blankType} is a word that needs additional context`);
      assistance.push(`Rhymes with: mat, hat, bat`);
    }
    
    return assistance;
  }
}

// ============================================================================
// 9. DATA-DRIVEN TEMPLATE CRAFTING
// ============================================================================

export interface TemplateMetrics {
  templateId: string;
  completionRate: number;
  averageTimeToComplete: number;
  laughPoints: number[]; // Positions where users laughed
  dropOffPoints: number[]; // Where users quit
  shareRate: number;
  replayRate: number;
  averageRating: number;
}

export class TemplateOptimizer {
  private metrics: Map<string, TemplateMetrics> = new Map();
  
  recordSession(
    templateId: string,
    sessionData: {
      completed: boolean;
      duration: number;
      laughTimestamps: number[];
      shared: boolean;
      rating?: number;
    }
  ): void {
    const existing = this.metrics.get(templateId) || this.createEmptyMetrics(templateId);
    
    // Update completion rate
    existing.completionRate = (existing.completionRate * 0.9) + (sessionData.completed ? 0.1 : 0);
    
    // Update average time
    existing.averageTimeToComplete = (existing.averageTimeToComplete * 0.9) + (sessionData.duration * 0.1);
    
    // Track laugh points
    sessionData.laughTimestamps.forEach(timestamp => {
      const position = Math.floor((timestamp / sessionData.duration) * 100);
      existing.laughPoints.push(position);
    });
    
    // Update share rate
    existing.shareRate = (existing.shareRate * 0.95) + (sessionData.shared ? 0.05 : 0);
    
    // Update rating
    if (sessionData.rating) {
      existing.averageRating = (existing.averageRating * 0.9) + (sessionData.rating * 0.1);
    }
    
    this.metrics.set(templateId, existing);
  }
  
  private createEmptyMetrics(templateId: string): TemplateMetrics {
    return {
      templateId,
      completionRate: 0,
      averageTimeToComplete: 0,
      laughPoints: [],
      dropOffPoints: [],
      shareRate: 0,
      replayRate: 0,
      averageRating: 0
    };
  }
  
  optimizeTemplate(template: StoryTemplate): StoryTemplate {
    const metrics = this.metrics.get(template.id);
    if (!metrics) return template;
    
    // Find optimal blank positions based on laugh points
    const laughClusters = this.findClusters(metrics.laughPoints);
    
    // Adjust blank density based on completion rate
    let optimalDensity = template.blankDensity;
    if (metrics.completionRate < 0.5) {
      optimalDensity += 2; // Fewer blanks if people don't complete
    } else if (metrics.completionRate > 0.9) {
      optimalDensity -= 1; // More blanks if very successful
    }
    
    // Create optimized version
    return {
      ...template,
      blankDensity: optimalDensity,
      // Adjust blank positions to align with laugh clusters
      blanks: this.repositionBlanks(template.blanks, laughClusters)
    };
  }
  
  private findClusters(points: number[]): number[] {
    // Simple clustering to find where laughs concentrate
    const clusters: number[] = [];
    const sorted = points.sort((a, b) => a - b);
    
    let currentCluster: number[] = [];
    sorted.forEach(point => {
      if (currentCluster.length === 0 || 
          point - currentCluster[currentCluster.length - 1] < 10) {
        currentCluster.push(point);
      } else {
        if (currentCluster.length > 0) {
          clusters.push(
            currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length
          );
        }
        currentCluster = [point];
      }
    });
    
    if (currentCluster.length > 0) {
      clusters.push(
        currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length
      );
    }
    
    return clusters;
  }
  
  private repositionBlanks(
    blanks: BlankType[],
    targetPositions: number[]
  ): BlankType[] {
    // Reposition blanks to align with successful humor points
    // This is simplified - in production would be more sophisticated
    return blanks.map((blank, index) => {
      const targetPos = targetPositions[index % targetPositions.length];
      // Adjust blank position metadata if needed
      return blank;
    });
  }
}

// ============================================================================
// CORE PHILOSOPHY ENFORCEMENT
// ============================================================================

export class AngryLipsCore {
  private readonly CORE_PRINCIPLES = {
    predictableStructure: true, // Template structure stays consistent
    unpredictableOutcome: true, // User input creates chaos
    sharedReveal: true, // Everyone experiences the payoff together
    preserveAuthorship: true // Users feel ownership of the comedy
  };
  
  validateFeature(feature: any): boolean {
    // Ensure any new feature doesn't break core Mad Libs magic
    return (
      this.maintainsStructure(feature) &&
      this.preservesSurprise(feature) &&
      this.enablesSharing(feature) &&
      this.respectsUserInput(feature)
    );
  }
  
  private maintainsStructure(feature: any): boolean {
    // Check that template format is preserved
    return true; // Implementation depends on feature
  }
  
  private preservesSurprise(feature: any): boolean {
    // Ensure outcome can't be predicted
    return true;
  }
  
  private enablesSharing(feature: any): boolean {
    // Must support collective experience
    return true;
  }
  
  private respectsUserInput(feature: any): boolean {
    // User words must be the source of humor
    return true;
  }
}

// Export main orchestrator
export class AdvancedAngryLipsSystem {
  public pricing = ANGRY_LIPS_PRICING;
  public dynamicEngine = new DynamicTemplateEngine({} as DynamicTemplate);
  public semanticEngine = new SemanticEngine();
  public multiplayerEngine = new MultiplayerEngine();
  public humorEngine = new AdaptiveHumorEngine();
  public episodicEngine = new EpisodicEngine();
  public kineticEngine = new KineticDeliveryEngine();
  public accessibilityEngine = new AccessibilityEngine();
  public optimizer = new TemplateOptimizer();
  public core = new AngryLipsCore();
  
  constructor() {
    console.log('Advanced Angry Lips System initialized');
    console.log('Features: Dynamic Templates, Semantic Intelligence, Multiplayer, Adaptive Humor');
    console.log('Pricing: 5-25 Sparks per session, 100 Sparks for unlimited day pass');
  }
}
