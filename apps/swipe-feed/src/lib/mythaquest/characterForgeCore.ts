/**
 * Character-Forge Core
 * AI-assisted character creation with persistent personas and hybrid stat system
 */

import type {
  Character,
  CharacterStats,
  AIPersonality,
  Race,
  CharacterClass,
  SkillTree,
  Alignment,
  MaskPersonality,
  ClassArchetype,
  SkillNode
} from './types';

export class CharacterForgeCore {
  private characters: Map<string, Character> = new Map();
  private races: Map<string, Race> = new Map();
  private classes: Map<string, CharacterClass> = new Map();
  private aiPersonalities: Map<string, AIPersonality> = new Map();
  private maskIntegration: MaskIntegration;
  private statCalculator: StatCalculator;
  private skillTreeBuilder: SkillTreeBuilder;
  private memorySystem: CharacterMemorySystem;

  constructor() {
    this.maskIntegration = new MaskIntegration();
    this.statCalculator = new StatCalculator();
    this.skillTreeBuilder = new SkillTreeBuilder();
    this.memorySystem = new CharacterMemorySystem();
    this.initializeRacesAndClasses();
  }

  /**
   * Create a new character with AI assistance
   */
  async createCharacter(
    playerId: string,
    config: {
      name: string;
      race?: string;
      class?: string;
      alignment?: Partial<Alignment>;
      personality?: Partial<AIPersonality>;
      backstory?: string;
    }
  ): Promise<Character> {
    console.log(`🧙 Forging character: ${config.name}`);

    // Get or generate race
    const race = config.race ? 
      this.races.get(config.race) || this.generateCustomRace(config.race) :
      this.getDefaultRace();

    // Get or generate class
    const characterClass = config.class ?
      this.classes.get(config.class) || this.generateCustomClass(config.class) :
      this.getDefaultClass();

    // Generate base stats
    const baseStats = this.statCalculator.generateBaseStats(race, characterClass);

    // Create AI personality with Mask
    const personality = await this.createAIPersonality(
      config.personality,
      config.backstory
    );

    // Generate skill tree
    const skillTree = this.skillTreeBuilder.generateSkillTree(characterClass);

    // Create character
    const character: Character = {
      id: this.generateCharacterId(),
      playerId,
      name: config.name,
      race,
      class: characterClass,
      level: 1,
      experience: 0,
      stats: baseStats,
      skills: skillTree,
      alignment: config.alignment || this.generateAlignment(personality),
      personality,
      inventory: {
        items: [],
        capacity: baseStats.strength * 10,
        gold: 100
      },
      equipment: {
        weapon: null,
        armor: null,
        accessories: []
      },
      memories: [],
      relationships: [],
      achievements: [],
      status: {
        alive: true,
        conditions: [],
        location: null
      }
    };

    // Store character
    this.characters.set(character.id, character);

    // Initialize character memory
    await this.memorySystem.initializeMemory(character);

    console.log(`✅ Character "${character.name}" created successfully`);
    return character;
  }

  /**
   * Create AI personality bound to a Mask
   */
  private async createAIPersonality(
    config?: Partial<AIPersonality>,
    backstory?: string
  ): Promise<AIPersonality> {
    // Generate or retrieve mask
    const mask = await this.maskIntegration.generateMask(backstory);

    const personality: AIPersonality = {
      maskId: mask.id,
      traits: config?.traits || this.generatePersonalityTraits(mask),
      memories: [],
      preferences: config?.preferences || this.generatePreferences(mask),
      fears: config?.fears || this.generateFears(mask),
      goals: config?.goals || this.generateGoals(mask),
      evolutionStage: 0,
      temperament: this.determineTemperament(mask)
    };

    // Store personality
    this.aiPersonalities.set(personality.maskId, personality);

    return personality;
  }

  /**
   * Train character through experiences
   */
  async trainCharacter(
    characterId: string,
    experience: {
      type: 'combat' | 'social' | 'exploration' | 'puzzle';
      outcome: 'success' | 'failure' | 'partial';
      context: any;
    }
  ): Promise<void> {
    const character = this.characters.get(characterId);
    if (!character) throw new Error('Character not found');

    console.log(`📚 Training ${character.name} through ${experience.type}`);

    // Update stats based on experience
    this.updateLearnedBehaviors(character, experience);

    // Add to character memories
    const memory = {
      id: `mem_${Date.now()}`,
      type: experience.type,
      outcome: experience.outcome,
      timestamp: Date.now(),
      emotionalImpact: this.calculateEmotionalImpact(experience),
      lesson: this.extractLesson(experience)
    };
    
    character.memories.push(memory);

    // Evolve personality based on experience
    await this.evolvePersonality(character.personality, experience);

    // Grant experience points
    const xpGained = this.calculateExperience(experience);
    character.experience += xpGained;

    // Check for level up
    if (character.experience >= this.getExperienceRequired(character.level + 1)) {
      await this.levelUp(character);
    }
  }

  /**
   * Update learned behaviors based on experiences
   */
  private updateLearnedBehaviors(character: Character, experience: any) {
    const stats = character.stats;
    
    switch (experience.type) {
      case 'combat':
        if (experience.outcome === 'success') {
          stats.courage = Math.min(1, stats.courage + 0.01);
          stats.aggression = Math.min(1, stats.aggression + 0.005);
        } else {
          stats.courage = Math.max(0, stats.courage - 0.005);
        }
        break;
        
      case 'social':
        if (experience.outcome === 'success') {
          stats.empathy = Math.min(1, stats.empathy + 0.01);
          stats.charisma = Math.min(100, stats.charisma + 0.1);
        }
        break;
        
      case 'exploration':
        stats.curiosity = Math.min(1, stats.curiosity + 0.01);
        stats.wisdom = Math.min(100, stats.wisdom + 0.05);
        break;
        
      case 'puzzle':
        if (experience.outcome === 'success') {
          stats.intelligence = Math.min(100, stats.intelligence + 0.1);
        }
        break;
    }

    // Greed adjustment based on loot
    if (experience.context?.loot) {
      stats.greed = Math.min(1, stats.greed + 0.005);
    }
  }

  /**
   * Clone a character
   */
  async cloneCharacter(
    characterId: string,
    newPlayerId: string,
    modifications?: Partial<Character>
  ): Promise<Character> {
    const original = this.characters.get(characterId);
    if (!original) throw new Error('Character not found');

    console.log(`🧬 Cloning character: ${original.name}`);

    // Deep clone character
    const clone: Character = {
      ...JSON.parse(JSON.stringify(original)),
      id: this.generateCharacterId(),
      playerId: newPlayerId,
      name: modifications?.name || `${original.name} (Clone)`,
      ...modifications
    };

    // Create new AI personality based on original
    clone.personality = await this.clonePersonality(original.personality);

    // Store clone
    this.characters.set(clone.id, clone);

    return clone;
  }

  /**
   * Export character for use in other worlds
   */
  async exportCharacter(characterId: string): Promise<string> {
    const character = this.characters.get(characterId);
    if (!character) throw new Error('Character not found');

    const exportData = {
      version: '1.0',
      character: {
        ...character,
        exportedAt: Date.now(),
        signature: this.generateExportSignature(character)
      }
    };

    return JSON.stringify(exportData);
  }

  /**
   * Import character from export data
   */
  async importCharacter(
    exportData: string,
    newPlayerId: string
  ): Promise<Character> {
    const data = JSON.parse(exportData);
    
    if (!this.validateExportSignature(data)) {
      throw new Error('Invalid character export data');
    }

    const character: Character = {
      ...data.character,
      id: this.generateCharacterId(),
      playerId: newPlayerId,
      importedAt: Date.now()
    };

    // Restore AI personality
    character.personality = await this.restorePersonality(character.personality);

    // Store imported character
    this.characters.set(character.id, character);

    console.log(`📥 Imported character: ${character.name}`);
    return character;
  }

  /**
   * Level up character
   */
  private async levelUp(character: Character) {
    character.level++;
    console.log(`⬆️ ${character.name} reached level ${character.level}!`);

    // Increase stats
    const statIncreases = this.statCalculator.calculateLevelUpBonuses(
      character.class,
      character.level
    );

    Object.entries(statIncreases).forEach(([stat, increase]) => {
      (character.stats as any)[stat] += increase;
    });

    // Increase max health/mana/stamina
    character.stats.maxHealth += 10 + character.stats.constitution;
    character.stats.maxMana += 5 + character.stats.intelligence;
    character.stats.maxStamina += 5 + character.stats.agility;

    // Restore to max
    character.stats.health = character.stats.maxHealth;
    character.stats.mana = character.stats.maxMana;
    character.stats.stamina = character.stats.maxStamina;

    // Grant skill point
    character.skills.skillPoints++;

    // Evolve personality
    character.personality.evolutionStage++;
  }

  /**
   * Get character by ID
   */
  getCharacter(characterId: string): Character | undefined {
    return this.characters.get(characterId);
  }

  /**
   * Get all characters for a player
   */
  getPlayerCharacters(playerId: string): Character[] {
    return Array.from(this.characters.values())
      .filter(c => c.playerId === playerId);
  }

  /**
   * Update character stats
   */
  async updateCharacterStats(
    characterId: string,
    updates: Partial<CharacterStats>
  ): Promise<void> {
    const character = this.characters.get(characterId);
    if (!character) throw new Error('Character not found');

    Object.assign(character.stats, updates);

    // Ensure values stay within bounds
    character.stats.health = Math.min(character.stats.health, character.stats.maxHealth);
    character.stats.mana = Math.min(character.stats.mana, character.stats.maxMana);
    character.stats.stamina = Math.min(character.stats.stamina, character.stats.maxStamina);
  }

  // Helper methods

  private initializeRacesAndClasses() {
    // Initialize default races
    this.races.set('human', {
      id: 'human',
      name: 'Human',
      description: 'Versatile and adaptable',
      baseStats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        constitution: 10
      },
      abilities: [{ id: 'adaptable', name: 'Adaptable', description: '+1 to all stats' }],
      weaknesses: [],
      lore: 'The most common race in the realms'
    });

    this.races.set('elf', {
      id: 'elf',
      name: 'Elf',
      description: 'Graceful and wise',
      baseStats: {
        agility: 12,
        intelligence: 11,
        wisdom: 12,
        constitution: 8
      },
      abilities: [{ id: 'keen_senses', name: 'Keen Senses', description: 'Enhanced perception' }],
      weaknesses: ['iron'],
      lore: 'Ancient beings of the forest'
    });

    this.races.set('dwarf', {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Sturdy and strong',
      baseStats: {
        strength: 12,
        constitution: 14,
        agility: 8
      },
      abilities: [{ id: 'stone_skin', name: 'Stone Skin', description: 'Natural armor' }],
      weaknesses: ['magic'],
      lore: 'Masters of forge and stone'
    });

    // Initialize default classes
    this.classes.set('warrior', {
      id: 'warrior',
      name: 'Warrior',
      archetype: 'warrior',
      primaryStat: 'strength',
      abilities: [
        { id: 'power_strike', name: 'Power Strike', damage: 20, cooldown: 5 }
      ],
      restrictions: [],
      evolutionPaths: [
        { level: 10, options: ['berserker', 'guardian'] }
      ]
    });

    this.classes.set('mage', {
      id: 'mage',
      name: 'Mage',
      archetype: 'mage',
      primaryStat: 'intelligence',
      abilities: [
        { id: 'fireball', name: 'Fireball', damage: 15, manaCost: 10 }
      ],
      restrictions: ['no_heavy_armor'],
      evolutionPaths: [
        { level: 10, options: ['elementalist', 'necromancer'] }
      ]
    });

    this.classes.set('rogue', {
      id: 'rogue',
      name: 'Rogue',
      archetype: 'rogue',
      primaryStat: 'agility',
      abilities: [
        { id: 'sneak_attack', name: 'Sneak Attack', damage: 25, requirement: 'hidden' }
      ],
      restrictions: ['no_heavy_armor'],
      evolutionPaths: [
        { level: 10, options: ['assassin', 'trickster'] }
      ]
    });
  }

  private generateCustomRace(name: string): Race {
    return {
      id: `custom_${name}`,
      name,
      description: 'A unique race',
      baseStats: {
        strength: 8 + Math.floor(Math.random() * 8),
        agility: 8 + Math.floor(Math.random() * 8),
        intelligence: 8 + Math.floor(Math.random() * 8),
        wisdom: 8 + Math.floor(Math.random() * 8),
        charisma: 8 + Math.floor(Math.random() * 8),
        constitution: 8 + Math.floor(Math.random() * 8)
      },
      abilities: [],
      weaknesses: [],
      lore: 'A mysterious race from distant lands'
    };
  }

  private generateCustomClass(name: string): CharacterClass {
    const archetypes: ClassArchetype[] = ['warrior', 'mage', 'rogue', 'healer'];
    const stats: (keyof CharacterStats)[] = ['strength', 'agility', 'intelligence', 'wisdom'];
    
    return {
      id: `custom_${name}`,
      name,
      archetype: archetypes[Math.floor(Math.random() * archetypes.length)],
      primaryStat: stats[Math.floor(Math.random() * stats.length)],
      abilities: [],
      restrictions: [],
      evolutionPaths: []
    };
  }

  private getDefaultRace(): Race {
    return this.races.get('human')!;
  }

  private getDefaultClass(): CharacterClass {
    return this.classes.get('warrior')!;
  }

  private generateCharacterId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlignment(personality: AIPersonality): Alignment {
    // Generate alignment based on personality
    let lawChaos = 0;
    let goodEvil = 0;

    personality.traits.forEach(trait => {
      if (trait.name === 'orderly') lawChaos += trait.value;
      if (trait.name === 'chaotic') lawChaos -= trait.value;
      if (trait.name === 'compassionate') goodEvil += trait.value;
      if (trait.name === 'cruel') goodEvil -= trait.value;
    });

    return {
      lawChaos: Math.max(-1, Math.min(1, lawChaos)),
      goodEvil: Math.max(-1, Math.min(1, goodEvil))
    };
  }

  private generatePersonalityTraits(mask: MaskPersonality): any[] {
    const traits = [];
    const traitNames = ['brave', 'cautious', 'curious', 'stubborn', 'kind', 'cruel'];
    
    traitNames.forEach(name => {
      if (Math.random() > 0.5) {
        traits.push({
          name,
          value: Math.random(),
          origin: 'innate'
        });
      }
    });

    return traits;
  }

  private generatePreferences(mask: MaskPersonality): any[] {
    return [
      { type: 'combat_style', value: Math.random() > 0.5 ? 'aggressive' : 'defensive' },
      { type: 'social_approach', value: Math.random() > 0.5 ? 'diplomatic' : 'direct' }
    ];
  }

  private generateFears(mask: MaskPersonality): string[] {
    const allFears = ['darkness', 'heights', 'magic', 'death', 'betrayal', 'failure'];
    const fearCount = Math.floor(Math.random() * 3) + 1;
    const fears: string[] = [];
    
    for (let i = 0; i < fearCount; i++) {
      const fear = allFears[Math.floor(Math.random() * allFears.length)];
      if (!fears.includes(fear)) {
        fears.push(fear);
      }
    }
    
    return fears;
  }

  private generateGoals(mask: MaskPersonality): any[] {
    return [
      { type: 'short_term', description: 'Gain power', priority: Math.random() },
      { type: 'long_term', description: 'Become legendary', priority: Math.random() }
    ];
  }

  private determineTemperament(mask: MaskPersonality): any {
    return {
      aggression: mask.traits.tyranny || 0,
      patience: mask.traits.wisdom || 0,
      humor: mask.traits.trickery || 0,
      seriousness: mask.traits.order || 0
    };
  }

  private calculateEmotionalImpact(experience: any): number {
    let impact = 0.5; // Neutral
    
    if (experience.outcome === 'success') impact += 0.3;
    if (experience.outcome === 'failure') impact -= 0.3;
    if (experience.type === 'combat') impact += 0.2;
    
    return Math.max(0, Math.min(1, impact));
  }

  private extractLesson(experience: any): string {
    const lessons = {
      combat: {
        success: 'Victory through strength',
        failure: 'Defeat teaches humility'
      },
      social: {
        success: 'Words can be mightier than swords',
        failure: 'Not all can be persuaded'
      },
      exploration: {
        success: 'Discovery rewards the curious',
        failure: 'Some paths lead nowhere'
      },
      puzzle: {
        success: 'Intelligence conquers obstacles',
        failure: 'Some mysteries remain unsolved'
      }
    };

    return lessons[experience.type]?.[experience.outcome] || 'Experience shapes us';
  }

  private async evolvePersonality(personality: AIPersonality, experience: any) {
    // Evolve personality based on experience
    if (experience.outcome === 'success') {
      personality.evolutionStage += 0.1;
    }

    // Add to personality memories
    personality.memories.push({
      id: `pmem_${Date.now()}`,
      experience,
      impact: this.calculateEmotionalImpact(experience),
      timestamp: Date.now()
    });

    // Adjust traits based on experience
    if (experience.type === 'combat' && experience.outcome === 'success') {
      const braveTrait = personality.traits.find(t => t.name === 'brave');
      if (braveTrait) {
        braveTrait.value = Math.min(1, braveTrait.value + 0.05);
      }
    }
  }

  private calculateExperience(experience: any): number {
    let xp = 10; // Base XP
    
    if (experience.outcome === 'success') xp *= 2;
    if (experience.outcome === 'partial') xp *= 1.5;
    if (experience.type === 'combat') xp *= 1.2;
    
    return Math.floor(xp);
  }

  private getExperienceRequired(level: number): number {
    return level * level * 100; // Quadratic scaling
  }

  private async clonePersonality(original: AIPersonality): Promise<AIPersonality> {
    const clone = JSON.parse(JSON.stringify(original));
    clone.maskId = `${original.maskId}_clone_${Date.now()}`;
    
    // Add some variation
    clone.traits.forEach(trait => {
      trait.value += (Math.random() - 0.5) * 0.1;
      trait.value = Math.max(0, Math.min(1, trait.value));
    });
    
    return clone;
  }

  private generateExportSignature(character: Character): string {
    // Generate a signature for validation
    const data = `${character.id}${character.name}${character.level}`;
    return Buffer.from(data).toString('base64');
  }

  private validateExportSignature(data: any): boolean {
    // Validate export signature
    // In production, this would use proper cryptographic signing
    return data.version === '1.0' && data.character;
  }

  private async restorePersonality(personality: AIPersonality): Promise<AIPersonality> {
    // Restore personality and reconnect to Mask system
    const restoredMask = await this.maskIntegration.restoreMask(personality.maskId);
    personality.maskId = restoredMask.id;
    return personality;
  }
}

// Supporting classes

class MaskIntegration {
  async generateMask(backstory?: string): Promise<MaskPersonality> {
    return {
      id: `mask_${Date.now()}`,
      name: 'Generated Mask',
      archetype: this.selectArchetype(backstory),
      traits: {
        heroism: Math.random(),
        trickery: Math.random(),
        wisdom: Math.random(),
        tyranny: Math.random(),
        chaos: Math.random(),
        order: Math.random()
      },
      evolution: {
        stage: 0,
        experience: 0,
        reinforcements: []
      },
      memories: [],
      relationships: [],
      fusionCompatibility: []
    };
  }

  async restoreMask(maskId: string): Promise<MaskPersonality> {
    // In production, this would retrieve from database
    return this.generateMask();
  }

  private selectArchetype(backstory?: string): any {
    const archetypes = ['hero', 'trickster', 'oracle', 'tyrant', 'sage'];
    
    if (backstory) {
      if (backstory.includes('hero') || backstory.includes('brave')) return 'hero';
      if (backstory.includes('trick') || backstory.includes('clever')) return 'trickster';
      if (backstory.includes('wise') || backstory.includes('knowledge')) return 'sage';
    }
    
    return archetypes[Math.floor(Math.random() * archetypes.length)];
  }
}

class StatCalculator {
  generateBaseStats(race: Race, characterClass: CharacterClass): CharacterStats {
    const base: CharacterStats = {
      strength: 10,
      agility: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      constitution: 10,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      stamina: 50,
      maxStamina: 50,
      courage: 0.5,
      greed: 0.3,
      empathy: 0.5,
      curiosity: 0.6,
      aggression: 0.4
    };

    // Apply race modifiers
    if (race.baseStats) {
      Object.assign(base, race.baseStats);
    }

    // Apply class modifiers
    const classModifiers = this.getClassModifiers(characterClass);
    Object.entries(classModifiers).forEach(([stat, modifier]) => {
      (base as any)[stat] += modifier;
    });

    // Calculate derived stats
    base.maxHealth = 50 + (base.constitution * 10);
    base.maxMana = 20 + (base.intelligence * 5);
    base.maxStamina = 30 + (base.agility * 3);
    
    base.health = base.maxHealth;
    base.mana = base.maxMana;
    base.stamina = base.maxStamina;

    return base;
  }

  calculateLevelUpBonuses(characterClass: CharacterClass, level: number): Partial<CharacterStats> {
    const bonuses: Partial<CharacterStats> = {};
    
    // Primary stat gets +2
    bonuses[characterClass.primaryStat] = 2;
    
    // Other stats get +1
    ['strength', 'agility', 'intelligence', 'wisdom', 'charisma', 'constitution'].forEach(stat => {
      if (stat !== characterClass.primaryStat) {
        bonuses[stat as keyof CharacterStats] = 1;
      }
    });

    return bonuses;
  }

  private getClassModifiers(characterClass: CharacterClass): Partial<CharacterStats> {
    const modifiers: Record<string, Partial<CharacterStats>> = {
      warrior: { strength: 3, constitution: 2 },
      mage: { intelligence: 3, wisdom: 2 },
      rogue: { agility: 3, charisma: 1 },
      healer: { wisdom: 3, constitution: 1 }
    };

    return modifiers[characterClass.archetype] || {};
  }
}

class SkillTreeBuilder {
  generateSkillTree(characterClass: CharacterClass): SkillTree {
    const nodes = this.generateSkillNodes(characterClass);
    const connections = this.generateConnections(nodes);

    return {
      nodes,
      connections,
      unlockedNodes: [nodes[0].id], // Start with first skill unlocked
      skillPoints: 0,
      specializations: []
    };
  }

  private generateSkillNodes(characterClass: CharacterClass): SkillNode[] {
    const nodes: SkillNode[] = [];
    const skillCount = 15; // 15 skills per class
    
    for (let i = 0; i < skillCount; i++) {
      const tier = Math.floor(i / 5) + 1; // 3 tiers of skills
      
      nodes.push({
        id: `skill_${characterClass.id}_${i}`,
        name: this.generateSkillName(characterClass.archetype, tier),
        description: 'A powerful ability',
        tier,
        requirements: tier > 1 ? [`skill_${characterClass.id}_${i - 5}`] : [],
        cost: tier,
        effects: this.generateSkillEffects(characterClass.archetype, tier)
      });
    }

    return nodes;
  }

  private generateConnections(nodes: SkillNode[]): any[] {
    const connections: any[] = [];
    
    nodes.forEach((node, index) => {
      if (index < nodes.length - 5) {
        // Connect to next tier
        connections.push({
          from: node.id,
          to: nodes[index + 5].id
        });
      }
      
      // Horizontal connections within tier
      if (index % 5 < 4) {
        connections.push({
          from: node.id,
          to: nodes[index + 1].id
        });
      }
    });

    return connections;
  }

  private generateSkillName(archetype: string, tier: number): string {
    const skillNames: Record<string, string[]> = {
      warrior: ['Strike', 'Bash', 'Charge', 'Whirlwind', 'Execute'],
      mage: ['Bolt', 'Shield', 'Teleport', 'Meteor', 'Time Stop'],
      rogue: ['Stealth', 'Backstab', 'Poison', 'Shadow Clone', 'Assassinate'],
      healer: ['Heal', 'Bless', 'Purify', 'Resurrect', 'Divine Light']
    };

    const names = skillNames[archetype] || ['Ability'];
    const tierPrefix = ['Basic', 'Advanced', 'Master'][tier - 1] || '';
    
    return `${tierPrefix} ${names[Math.floor(Math.random() * names.length)]}`;
  }

  private generateSkillEffects(archetype: string, tier: number): any {
    return {
      damage: tier * 10,
      cost: tier * 5,
      cooldown: tier * 2,
      range: tier * 3
    };
  }
}

class CharacterMemorySystem {
  private memories: Map<string, any[]> = new Map();

  async initializeMemory(character: Character) {
    this.memories.set(character.id, []);
    
    // Add initial memory based on backstory
    if (character.personality.memories.length === 0) {
      character.personality.memories.push({
        id: `mem_init_${Date.now()}`,
        content: 'The beginning of my journey',
        emotionalWeight: 0.5,
        timestamp: Date.now()
      });
    }
  }

  async addMemory(characterId: string, memory: any) {
    const characterMemories = this.memories.get(characterId) || [];
    characterMemories.push(memory);
    
    // Limit memory size (forget old, less important memories)
    if (characterMemories.length > 100) {
      // Sort by emotional weight and recency
      characterMemories.sort((a, b) => {
        const scoreA = a.emotionalWeight * (1 / (Date.now() - a.timestamp));
        const scoreB = b.emotionalWeight * (1 / (Date.now() - b.timestamp));
        return scoreB - scoreA;
      });
      
      // Keep top 100
      this.memories.set(characterId, characterMemories.slice(0, 100));
    }
  }

  async recallMemory(characterId: string, context: string): Promise<any> {
    const characterMemories = this.memories.get(characterId) || [];
    
    // Find most relevant memory based on context
    // In production, this would use vector similarity search
    return characterMemories.find(m => m.content.includes(context)) || null;
  }
}

// Export singleton instance
export const characterForgeCore = new CharacterForgeCore();
