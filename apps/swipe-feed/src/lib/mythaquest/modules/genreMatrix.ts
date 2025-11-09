/**
 * Genre Matrix - Cross-Genre Translation Engine
 * Enables seamless interaction between different genre worlds
 * Fantasy ↔ Sci-Fi ↔ Horror ↔ Mythpunk ↔ Cyber-Noir
 */

import type {
  Genre,
  GenreMatrix,
  PhysicsRules,
  TranslationRules,
  World
} from '../types';

export class GenreMatrixEngine {
  private translationTables: Map<string, TranslationRules> = new Map();
  private physicsConverters: Map<string, PhysicsConverter> = new Map();
  private combatBalancer: CombatBalancer;
  private loreAdapter: LoreAdapter;
  private conversionCache: Map<string, any> = new Map();

  constructor() {
    this.combatBalancer = new CombatBalancer();
    this.loreAdapter = new LoreAdapter();
    this.initializeTranslationTables();
    this.initializePhysicsConverters();
  }

  /**
   * Create genre matrix for a world
   */
  createGenreMatrix(
    primaryGenre: Genre,
    secondaryGenre?: Genre
  ): GenreMatrix {
    console.log(`🎭 Creating genre matrix: ${primaryGenre}${secondaryGenre ? ` + ${secondaryGenre}` : ''}`);

    const physicsLaws = this.generatePhysicsLaws(primaryGenre, secondaryGenre);
    const languageStyle = this.generateLanguageStyle(primaryGenre);
    const rewardLogic = this.generateRewardLogic(primaryGenre);
    const translationLayer = this.generateTranslationLayer(primaryGenre, secondaryGenre);

    return {
      primary: primaryGenre,
      secondary: secondaryGenre,
      physicsLaws,
      languageStyle,
      rewardLogic,
      translationLayer
    };
  }

  /**
   * Translate between genres for cross-realm interaction
   */
  async translateCrossGenre(
    sourceGenre: Genre,
    targetGenre: Genre,
    data: {
      type: 'ability' | 'item' | 'entity' | 'environment';
      source: any;
    }
  ): Promise<any> {
    const cacheKey = `${sourceGenre}_${targetGenre}_${data.type}_${JSON.stringify(data.source).substring(0, 50)}`;
    
    // Check cache
    if (this.conversionCache.has(cacheKey)) {
      return this.conversionCache.get(cacheKey);
    }

    console.log(`🔄 Translating ${data.type} from ${sourceGenre} to ${targetGenre}`);

    let translated: any;

    switch (data.type) {
      case 'ability':
        translated = await this.translateAbility(sourceGenre, targetGenre, data.source);
        break;
      case 'item':
        translated = await this.translateItem(sourceGenre, targetGenre, data.source);
        break;
      case 'entity':
        translated = await this.translateEntity(sourceGenre, targetGenre, data.source);
        break;
      case 'environment':
        translated = await this.translateEnvironment(sourceGenre, targetGenre, data.source);
        break;
    }

    // Cache result
    this.conversionCache.set(cacheKey, translated);
    
    // Clear old cache entries if too large
    if (this.conversionCache.size > 1000) {
      const firstKey = this.conversionCache.keys().next().value;
      this.conversionCache.delete(firstKey);
    }

    return translated;
  }

  /**
   * Balance cross-genre combat
   */
  async balanceCrossGenreCombat(
    attacker: {
      genre: Genre;
      stats: any;
      abilities: any[];
    },
    defender: {
      genre: Genre;
      stats: any;
      abilities: any[];
    }
  ): Promise<{
    adjustedAttacker: any;
    adjustedDefender: any;
    combatModifiers: any;
  }> {
    console.log(`⚔️ Balancing combat: ${attacker.genre} vs ${defender.genre}`);

    // Convert stats to universal scale
    const universalAttacker = await this.convertToUniversalStats(attacker);
    const universalDefender = await this.convertToUniversalStats(defender);

    // Apply genre-specific combat modifiers
    const modifiers = this.calculateCombatModifiers(attacker.genre, defender.genre);

    // Balance abilities
    const balancedAttackerAbilities = await Promise.all(
      attacker.abilities.map(ability => 
        this.translateAbility(attacker.genre, 'universal', ability)
      )
    );

    const balancedDefenderAbilities = await Promise.all(
      defender.abilities.map(ability =>
        this.translateAbility(defender.genre, 'universal', ability)
      )
    );

    return {
      adjustedAttacker: {
        ...universalAttacker,
        abilities: balancedAttackerAbilities
      },
      adjustedDefender: {
        ...universalDefender,
        abilities: balancedDefenderAbilities
      },
      combatModifiers: modifiers
    };
  }

  /**
   * Validate translation accuracy
   */
  async validateTranslation(
    original: any,
    translated: any,
    sourceGenre: Genre,
    targetGenre: Genre
  ): Promise<{
    valid: boolean;
    accuracy: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let accuracy = 1.0;

    // Check power level preservation
    const originalPower = this.calculatePowerLevel(original, sourceGenre);
    const translatedPower = this.calculatePowerLevel(translated, targetGenre);
    const powerDiff = Math.abs(originalPower - translatedPower) / originalPower;

    if (powerDiff > 0.2) {
      issues.push(`Power level variance: ${(powerDiff * 100).toFixed(1)}%`);
      accuracy -= powerDiff * 0.5;
    }

    // Check conceptual integrity
    if (!this.validateConceptualIntegrity(original, translated, sourceGenre, targetGenre)) {
      issues.push('Conceptual integrity compromised');
      accuracy -= 0.2;
    }

    // Check balance
    if (!this.validateBalance(translated, targetGenre)) {
      issues.push('Balance issues detected');
      accuracy -= 0.1;
    }

    return {
      valid: issues.length === 0,
      accuracy: Math.max(0, accuracy),
      issues
    };
  }

  /**
   * Generate physics laws for genre combination
   */
  private generatePhysicsLaws(primary: Genre, secondary?: Genre): PhysicsRules {
    const basePhysics: Record<Genre, PhysicsRules> = {
      'fantasy': {
        gravity: 1.0,
        magicEnabled: true,
        techLevel: 2,
        timeManipulation: true,
        dimensionalTravel: true,
        deathPermanence: false
      },
      'sci-fi': {
        gravity: 0.8,
        magicEnabled: false,
        techLevel: 9,
        timeManipulation: true,
        dimensionalTravel: true,
        deathPermanence: true
      },
      'horror': {
        gravity: 1.1,
        magicEnabled: true,
        techLevel: 5,
        timeManipulation: false,
        dimensionalTravel: false,
        deathPermanence: true
      },
      'cyber-noir': {
        gravity: 1.0,
        magicEnabled: false,
        techLevel: 8,
        timeManipulation: false,
        dimensionalTravel: false,
        deathPermanence: true
      },
      'mythpunk': {
        gravity: 0.9,
        magicEnabled: true,
        techLevel: 6,
        timeManipulation: true,
        dimensionalTravel: true,
        deathPermanence: false
      },
      'comedy': {
        gravity: 0.7,
        magicEnabled: true,
        techLevel: 5,
        timeManipulation: true,
        dimensionalTravel: true,
        deathPermanence: false
      },
      'realistic-survival': {
        gravity: 1.0,
        magicEnabled: false,
        techLevel: 5,
        timeManipulation: false,
        dimensionalTravel: false,
        deathPermanence: true
      },
      'steampunk': {
        gravity: 1.0,
        magicEnabled: false,
        techLevel: 4,
        timeManipulation: false,
        dimensionalTravel: false,
        deathPermanence: true
      },
      'post-apocalyptic': {
        gravity: 1.0,
        magicEnabled: false,
        techLevel: 3,
        timeManipulation: false,
        dimensionalTravel: false,
        deathPermanence: true
      },
      'cosmic-western': {
        gravity: 0.6,
        magicEnabled: true,
        techLevel: 7,
        timeManipulation: false,
        dimensionalTravel: true,
        deathPermanence: true
      },
      'hybrid': {
        gravity: 1.0,
        magicEnabled: true,
        techLevel: 5,
        timeManipulation: true,
        dimensionalTravel: true,
        deathPermanence: false
      }
    };

    let physics = basePhysics[primary] || basePhysics['hybrid'];

    // Blend with secondary genre if present
    if (secondary && basePhysics[secondary]) {
      const secondaryPhysics = basePhysics[secondary];
      physics = {
        gravity: (physics.gravity + secondaryPhysics.gravity) / 2,
        magicEnabled: physics.magicEnabled || secondaryPhysics.magicEnabled,
        techLevel: Math.round((physics.techLevel + secondaryPhysics.techLevel) / 2),
        timeManipulation: physics.timeManipulation || secondaryPhysics.timeManipulation,
        dimensionalTravel: physics.dimensionalTravel || secondaryPhysics.dimensionalTravel,
        deathPermanence: physics.deathPermanence && secondaryPhysics.deathPermanence
      };
    }

    return physics;
  }

  /**
   * Initialize translation tables
   */
  private initializeTranslationTables() {
    // Fantasy ↔ Sci-Fi translations
    this.translationTables.set('fantasy_sci-fi', {
      conversions: [
        { from: 'magic', to: 'technology', ratio: 1.0 },
        { from: 'spell', to: 'program', ratio: 1.0 },
        { from: 'mana', to: 'energy', ratio: 1.0 },
        { from: 'wizard', to: 'scientist', ratio: 1.0 },
        { from: 'potion', to: 'nanobot injection', ratio: 1.0 },
        { from: 'enchantment', to: 'augmentation', ratio: 1.0 },
        { from: 'curse', to: 'virus', ratio: 1.0 },
        { from: 'dragon', to: 'bioengineered creature', ratio: 1.0 },
        { from: 'teleportation circle', to: 'quantum gate', ratio: 1.0 },
        { from: 'divine power', to: 'cosmic energy', ratio: 1.0 }
      ],
      equivalencies: new Map([
        ['fireball', 'plasma blast'],
        ['healing spell', 'medical nanobots'],
        ['invisibility', 'cloaking device'],
        ['telepathy', 'neural link'],
        ['resurrection', 'consciousness backup'],
        ['scrying', 'surveillance network'],
        ['golem', 'android'],
        ['familiar', 'AI companion'],
        ['artifact', 'advanced technology'],
        ['prophecy', 'predictive algorithm']
      ]),
      powerScaling: {
        magicToTech: 1.2,
        techToMagic: 0.8,
        balanceFactor: 1.0
      }
    });

    // Fantasy ↔ Horror translations
    this.translationTables.set('fantasy_horror', {
      conversions: [
        { from: 'magic', to: 'dark arts', ratio: 1.1 },
        { from: 'hero', to: 'survivor', ratio: 1.0 },
        { from: 'quest', to: 'escape', ratio: 1.0 },
        { from: 'blessing', to: 'protection', ratio: 0.8 },
        { from: 'light magic', to: 'sanity', ratio: 1.0 }
      ],
      equivalencies: new Map([
        ['healing potion', 'first aid kit'],
        ['holy water', 'blessed water'],
        ['undead', 'undead'],
        ['demon', 'eldritch horror'],
        ['paladin', 'hunter']
      ]),
      powerScaling: {
        magicToHorror: 0.7,
        horrorToMagic: 1.3,
        balanceFactor: 0.9
      }
    });

    // Sci-Fi ↔ Cyber-Noir translations
    this.translationTables.set('sci-fi_cyber-noir', {
      conversions: [
        { from: 'spaceship', to: 'hover vehicle', ratio: 0.6 },
        { from: 'alien', to: 'augmented human', ratio: 0.8 },
        { from: 'laser', to: 'smart gun', ratio: 0.9 },
        { from: 'AI', to: 'AI', ratio: 1.0 },
        { from: 'colony', to: 'megacity sector', ratio: 1.0 }
      ],
      equivalencies: new Map([
        ['space marine', 'corporate enforcer'],
        ['starship captain', 'syndicate boss'],
        ['alien artifact', 'black market tech'],
        ['galactic empire', 'megacorporation'],
        ['rebel alliance', 'underground resistance']
      ]),
      powerScaling: {
        scifiToCyber: 0.7,
        cyberToScifi: 1.4,
        balanceFactor: 1.0
      }
    });

    // Add more translation tables for all genre combinations...
  }

  /**
   * Initialize physics converters
   */
  private initializePhysicsConverters() {
    // Magic ↔ Technology converter
    this.physicsConverters.set('magic_tech', new PhysicsConverter(
      (magic: number) => magic * 1.2, // Magic to tech
      (tech: number) => tech * 0.8    // Tech to magic
    ));

    // Gravity converters
    this.physicsConverters.set('gravity', new PhysicsConverter(
      (source: number) => source,
      (target: number) => target
    ));
  }

  /**
   * Translate ability between genres
   */
  private async translateAbility(
    sourceGenre: Genre,
    targetGenre: Genre,
    ability: any
  ): Promise<any> {
    const tableKey = `${sourceGenre}_${targetGenre}`;
    const reverseKey = `${targetGenre}_${sourceGenre}`;
    
    let translationRules = this.translationTables.get(tableKey);
    let reversed = false;
    
    if (!translationRules) {
      translationRules = this.translationTables.get(reverseKey);
      reversed = true;
    }
    
    if (!translationRules) {
      // No direct translation, use universal intermediary
      return this.translateViaUniversal(sourceGenre, targetGenre, ability);
    }

    // Check for direct equivalency
    const directTranslation = translationRules.equivalencies.get(ability.name?.toLowerCase());
    if (directTranslation) {
      return {
        ...ability,
        name: directTranslation,
        genre: targetGenre,
        translated: true
      };
    }

    // Apply conversion rules
    let translated = { ...ability };
    for (const conversion of translationRules.conversions) {
      const source = reversed ? conversion.to : conversion.from;
      const target = reversed ? conversion.from : conversion.to;
      
      if (ability.type?.includes(source) || ability.name?.toLowerCase().includes(source)) {
        translated.type = ability.type?.replace(source, target);
        translated.name = ability.name?.replace(source, target);
        translated.power = ability.power * conversion.ratio;
      }
    }

    // Apply power scaling
    if (translationRules.powerScaling) {
      const scalingKey = reversed ? 
        `${targetGenre}To${this.capitalize(sourceGenre)}` :
        `${sourceGenre}To${this.capitalize(targetGenre)}`;
      
      const scaling = (translationRules.powerScaling as any)[scalingKey] || 1.0;
      translated.power = (translated.power || ability.power || 0) * scaling;
    }

    translated.genre = targetGenre;
    translated.translated = true;
    translated.originalGenre = sourceGenre;

    return translated;
  }

  /**
   * Translate item between genres
   */
  private async translateItem(
    sourceGenre: Genre,
    targetGenre: Genre,
    item: any
  ): Promise<any> {
    // Item translation logic
    const itemMap: Record<string, Record<string, string>> = {
      'fantasy': {
        'sword': 'sword',
        'staff': 'staff',
        'potion': 'potion',
        'armor': 'armor'
      },
      'sci-fi': {
        'sword': 'energy blade',
        'staff': 'tech staff',
        'potion': 'stim pack',
        'armor': 'power armor'
      },
      'cyber-noir': {
        'sword': 'mono-blade',
        'staff': 'shock baton',
        'potion': 'booster',
        'armor': 'kevlar suit'
      },
      'horror': {
        'sword': 'cursed blade',
        'staff': 'bone staff',
        'potion': 'strange vial',
        'armor': 'protective gear'
      }
    };

    const sourceMap = itemMap[sourceGenre] || {};
    const targetMap = itemMap[targetGenre] || {};
    
    // Find item type in source
    let itemType = 'unknown';
    for (const [type, name] of Object.entries(sourceMap)) {
      if (item.name?.toLowerCase().includes(name)) {
        itemType = type;
        break;
      }
    }

    return {
      ...item,
      name: targetMap[itemType] || item.name,
      genre: targetGenre,
      translated: true
    };
  }

  /**
   * Translate entity between genres
   */
  private async translateEntity(
    sourceGenre: Genre,
    targetGenre: Genre,
    entity: any
  ): Promise<any> {
    const entityMap: Record<string, Record<string, string>> = {
      'fantasy': {
        'dragon': 'dragon',
        'goblin': 'goblin',
        'wizard': 'wizard',
        'knight': 'knight'
      },
      'sci-fi': {
        'dragon': 'bio-weapon',
        'goblin': 'mutant',
        'wizard': 'psion',
        'knight': 'space marine'
      },
      'horror': {
        'dragon': 'ancient horror',
        'goblin': 'ghoul',
        'wizard': 'cultist',
        'knight': 'hunter'
      },
      'cyber-noir': {
        'dragon': 'corp AI',
        'goblin': 'street thug',
        'wizard': 'hacker',
        'knight': 'enforcer'
      }
    };

    const sourceMap = entityMap[sourceGenre] || {};
    const targetMap = entityMap[targetGenre] || {};
    
    let entityType = 'unknown';
    for (const [type, name] of Object.entries(sourceMap)) {
      if (entity.type?.toLowerCase().includes(name) || entity.name?.toLowerCase().includes(name)) {
        entityType = type;
        break;
      }
    }

    return {
      ...entity,
      type: targetMap[entityType] || entity.type,
      genre: targetGenre,
      translated: true
    };
  }

  /**
   * Translate environment between genres
   */
  private async translateEnvironment(
    sourceGenre: Genre,
    targetGenre: Genre,
    environment: any
  ): Promise<any> {
    const envMap: Record<string, Record<string, string>> = {
      'fantasy': {
        'forest': 'enchanted forest',
        'mountain': 'mystic peaks',
        'dungeon': 'ancient dungeon',
        'city': 'kingdom'
      },
      'sci-fi': {
        'forest': 'bio-dome',
        'mountain': 'terraformed peaks',
        'dungeon': 'underground facility',
        'city': 'space colony'
      },
      'horror': {
        'forest': 'dark woods',
        'mountain': 'cursed peaks',
        'dungeon': 'nightmare realm',
        'city': 'abandoned town'
      },
      'cyber-noir': {
        'forest': 'virtual forest',
        'mountain': 'corporate tower',
        'dungeon': 'underground lab',
        'city': 'neon metropolis'
      }
    };

    const sourceMap = envMap[sourceGenre] || {};
    const targetMap = envMap[targetGenre] || {};
    
    let envType = environment.type || 'unknown';
    for (const [type, name] of Object.entries(sourceMap)) {
      if (environment.name?.toLowerCase().includes(name)) {
        envType = type;
        break;
      }
    }

    return {
      ...environment,
      name: targetMap[envType] || environment.name,
      genre: targetGenre,
      atmosphere: this.translateAtmosphere(sourceGenre, targetGenre),
      translated: true
    };
  }

  /**
   * Translate via universal intermediary
   */
  private async translateViaUniversal(
    sourceGenre: Genre,
    targetGenre: Genre,
    data: any
  ): Promise<any> {
    // First convert to universal format
    const universal = await this.convertToUniversal(sourceGenre, data);
    
    // Then convert from universal to target
    return this.convertFromUniversal(targetGenre, universal);
  }

  /**
   * Convert to universal format
   */
  private async convertToUniversal(genre: Genre, data: any): Promise<any> {
    return {
      ...data,
      universal: true,
      originalGenre: genre,
      power: this.calculatePowerLevel(data, genre),
      category: this.categorizeUniversal(data)
    };
  }

  /**
   * Convert from universal format
   */
  private async convertFromUniversal(genre: Genre, universal: any): Promise<any> {
    const genreTemplates: Record<string, any> = {
      'fantasy': { prefix: 'Mystic', suffix: 'of Power' },
      'sci-fi': { prefix: 'Quantum', suffix: 'Module' },
      'horror': { prefix: 'Cursed', suffix: 'of Dread' },
      'cyber-noir': { prefix: 'Neural', suffix: 'Interface' }
    };

    const template = genreTemplates[genre] || { prefix: '', suffix: '' };

    return {
      ...universal,
      name: `${template.prefix} ${universal.name || 'Unknown'} ${template.suffix}`.trim(),
      genre,
      power: universal.power,
      translated: true
    };
  }

  /**
   * Convert stats to universal scale
   */
  private async convertToUniversalStats(character: any): Promise<any> {
    const universalStats = {
      power: 0,
      defense: 0,
      speed: 0,
      intelligence: 0,
      special: 0
    };

    // Map genre-specific stats to universal
    switch (character.genre) {
      case 'fantasy':
        universalStats.power = character.stats.strength || 0;
        universalStats.defense = character.stats.constitution || 0;
        universalStats.speed = character.stats.agility || 0;
        universalStats.intelligence = character.stats.wisdom || 0;
        universalStats.special = character.stats.mana || 0;
        break;
      
      case 'sci-fi':
        universalStats.power = character.stats.weaponry || 0;
        universalStats.defense = character.stats.shields || 0;
        universalStats.speed = character.stats.thrusters || 0;
        universalStats.intelligence = character.stats.ai || 0;
        universalStats.special = character.stats.tech || 0;
        break;
      
      case 'horror':
        universalStats.power = character.stats.terror || 0;
        universalStats.defense = character.stats.sanity || 0;
        universalStats.speed = character.stats.escape || 0;
        universalStats.intelligence = character.stats.awareness || 0;
        universalStats.special = character.stats.willpower || 0;
        break;
      
      default:
        // Direct mapping for unknown genres
        universalStats.power = character.stats.power || character.stats.strength || 10;
        universalStats.defense = character.stats.defense || character.stats.constitution || 10;
        universalStats.speed = character.stats.speed || character.stats.agility || 10;
        universalStats.intelligence = character.stats.intelligence || 10;
        universalStats.special = character.stats.special || 10;
    }

    return {
      ...character,
      universalStats,
      originalStats: character.stats
    };
  }

  /**
   * Calculate combat modifiers for cross-genre combat
   */
  private calculateCombatModifiers(attackerGenre: Genre, defenderGenre: Genre): any {
    const modifiers = {
      damageMultiplier: 1.0,
      defenseMultiplier: 1.0,
      speedMultiplier: 1.0,
      specialEffects: []
    };

    // Genre advantage/disadvantage matrix
    const advantages: Record<string, string[]> = {
      'fantasy': ['horror', 'mythpunk'],
      'sci-fi': ['fantasy', 'steampunk'],
      'horror': ['comedy', 'realistic-survival'],
      'cyber-noir': ['post-apocalyptic', 'steampunk'],
      'mythpunk': ['realistic-survival', 'cyber-noir']
    };

    const disadvantages: Record<string, string[]> = {
      'fantasy': ['sci-fi', 'cyber-noir'],
      'sci-fi': ['mythpunk', 'horror'],
      'horror': ['fantasy', 'comedy'],
      'realistic-survival': ['fantasy', 'sci-fi', 'horror']
    };

    // Apply advantages
    if (advantages[attackerGenre]?.includes(defenderGenre)) {
      modifiers.damageMultiplier *= 1.2;
      modifiers.specialEffects.push('genre_advantage');
    }

    // Apply disadvantages
    if (disadvantages[attackerGenre]?.includes(defenderGenre)) {
      modifiers.damageMultiplier *= 0.8;
      modifiers.defenseMultiplier *= 0.9;
    }

    // Special interactions
    if (attackerGenre === 'fantasy' && defenderGenre === 'sci-fi') {
      modifiers.specialEffects.push('magic_vs_tech');
    }
    
    if (attackerGenre === 'horror' && defenderGenre === 'comedy') {
      modifiers.specialEffects.push('fear_negated');
      modifiers.damageMultiplier *= 0.5;
    }

    return modifiers;
  }

  /**
   * Calculate power level for balancing
   */
  private calculatePowerLevel(entity: any, genre: Genre): number {
    let power = 0;

    // Base power from stats
    if (entity.stats) {
      power += Object.values(entity.stats)
        .filter(v => typeof v === 'number')
        .reduce((sum: number, val: any) => sum + val, 0);
    }

    // Power from abilities
    if (entity.abilities) {
      power += entity.abilities.length * 10;
    }

    // Genre-specific multipliers
    const genreMultipliers: Record<Genre, number> = {
      'fantasy': 1.0,
      'sci-fi': 1.2,
      'horror': 0.8,
      'cyber-noir': 1.1,
      'mythpunk': 1.3,
      'comedy': 0.6,
      'realistic-survival': 0.7,
      'steampunk': 0.9,
      'post-apocalyptic': 0.8,
      'cosmic-western': 1.15,
      'hybrid': 1.0
    };

    power *= genreMultipliers[genre] || 1.0;

    return power;
  }

  /**
   * Validate conceptual integrity
   */
  private validateConceptualIntegrity(
    original: any,
    translated: any,
    sourceGenre: Genre,
    targetGenre: Genre
  ): boolean {
    // Check if core concept is preserved
    if (!translated.name || !translated.type) return false;
    
    // Check if abilities make sense in target genre
    if (translated.abilities) {
      for (const ability of translated.abilities) {
        if (!this.isConceptValid(ability, targetGenre)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if concept is valid in genre
   */
  private isConceptValid(concept: any, genre: Genre): boolean {
    const invalidConcepts: Record<Genre, string[]> = {
      'realistic-survival': ['magic', 'teleportation', 'resurrection'],
      'sci-fi': ['divine', 'curse', 'demon'],
      'cyber-noir': ['magic', 'dragon', 'divine']
    };

    const invalid = invalidConcepts[genre] || [];
    const conceptStr = JSON.stringify(concept).toLowerCase();
    
    return !invalid.some(term => conceptStr.includes(term));
  }

  /**
   * Validate balance
   */
  private validateBalance(entity: any, genre: Genre): boolean {
    const power = this.calculatePowerLevel(entity, genre);
    
    // Check if power is within acceptable range for genre
    const powerRanges: Record<Genre, [number, number]> = {
      'fantasy': [10, 1000],
      'sci-fi': [20, 1200],
      'horror': [5, 800],
      'cyber-noir': [15, 1100],
      'realistic-survival': [5, 500],
      'comedy': [1, 600],
      'mythpunk': [20, 1300],
      'steampunk': [10, 900],
      'post-apocalyptic': [5, 700],
      'cosmic-western': [15, 1150],
      'hybrid': [10, 1000]
    };

    const [min, max] = powerRanges[genre] || [1, 1500];
    return power >= min && power <= max;
  }

  /**
   * Generate language style for genre
   */
  private generateLanguageStyle(genre: Genre): any {
    const styles: Record<Genre, any> = {
      'fantasy': {
        formality: 'archaic',
        vocabulary: 'mystical',
        tone: 'epic'
      },
      'sci-fi': {
        formality: 'technical',
        vocabulary: 'scientific',
        tone: 'analytical'
      },
      'horror': {
        formality: 'ominous',
        vocabulary: 'dark',
        tone: 'suspenseful'
      },
      'cyber-noir': {
        formality: 'street',
        vocabulary: 'tech-slang',
        tone: 'cynical'
      },
      'comedy': {
        formality: 'casual',
        vocabulary: 'humorous',
        tone: 'lighthearted'
      },
      'realistic-survival': {
        formality: 'practical',
        vocabulary: 'survival',
        tone: 'serious'
      },
      'mythpunk': {
        formality: 'modern-myth',
        vocabulary: 'hybrid',
        tone: 'rebellious'
      },
      'steampunk': {
        formality: 'victorian',
        vocabulary: 'mechanical',
        tone: 'adventurous'
      },
      'post-apocalyptic': {
        formality: 'sparse',
        vocabulary: 'survival',
        tone: 'grim'
      },
      'cosmic-western': {
        formality: 'frontier',
        vocabulary: 'space-western',
        tone: 'rugged'
      },
      'hybrid': {
        formality: 'mixed',
        vocabulary: 'varied',
        tone: 'adaptive'
      }
    };

    return styles[genre] || styles['hybrid'];
  }

  /**
   * Generate reward logic for genre
   */
  private generateRewardLogic(genre: Genre): any {
    const rewards: Record<Genre, any> = {
      'fantasy': {
        currency: 'gold',
        items: ['magical items', 'potions', 'artifacts'],
        experience: 'quests',
        progression: 'levels'
      },
      'sci-fi': {
        currency: 'credits',
        items: ['technology', 'upgrades', 'data'],
        experience: 'missions',
        progression: 'ranks'
      },
      'horror': {
        currency: 'sanity',
        items: ['tools', 'clues', 'protection'],
        experience: 'survival',
        progression: 'resilience'
      },
      'cyber-noir': {
        currency: 'crypto',
        items: ['cyberware', 'data', 'connections'],
        experience: 'jobs',
        progression: 'reputation'
      },
      'realistic-survival': {
        currency: 'resources',
        items: ['supplies', 'tools', 'shelter'],
        experience: 'days survived',
        progression: 'skills'
      },
      'comedy': {
        currency: 'laughs',
        items: ['gags', 'props', 'costumes'],
        experience: 'jokes',
        progression: 'fame'
      },
      'mythpunk': {
        currency: 'belief',
        items: ['relics', 'tech', 'myths'],
        experience: 'legends',
        progression: 'influence'
      },
      'steampunk': {
        currency: 'gears',
        items: ['inventions', 'steam-tech', 'blueprints'],
        experience: 'discoveries',
        progression: 'innovation'
      },
      'post-apocalyptic': {
        currency: 'scrap',
        items: ['salvage', 'weapons', 'medicine'],
        experience: 'survival days',
        progression: 'adaptation'
      },
      'cosmic-western': {
        currency: 'star-dust',
        items: ['alien-tech', 'bounties', 'claims'],
        experience: 'frontier-justice',
        progression: 'notoriety'
      },
      'hybrid': {
        currency: 'universal',
        items: ['mixed'],
        experience: 'achievements',
        progression: 'power'
      }
    };

    return rewards[genre] || rewards['hybrid'];
  }

  /**
   * Generate translation layer
   */
  private generateTranslationLayer(primary: Genre, secondary?: Genre): TranslationRules {
    const key = secondary ? `${primary}_${secondary}` : `${primary}_universal`;
    
    return this.translationTables.get(key) || {
      conversions: [],
      equivalencies: new Map(),
      powerScaling: { balanceFactor: 1.0 }
    };
  }

  /**
   * Translate atmosphere between genres
   */
  private translateAtmosphere(sourceGenre: Genre, targetGenre: Genre): string {
    const atmosphereMap: Record<string, Record<string, string>> = {
      'fantasy': {
        'fantasy': 'mystical',
        'sci-fi': 'techno-magical',
        'horror': 'dark fantasy',
        'cyber-noir': 'neon-enchanted'
      },
      'sci-fi': {
        'fantasy': 'science-fantasy',
        'sci-fi': 'futuristic',
        'horror': 'cosmic horror',
        'cyber-noir': 'cyberpunk'
      },
      'horror': {
        'fantasy': 'gothic',
        'sci-fi': 'alien horror',
        'horror': 'terrifying',
        'cyber-noir': 'tech-horror'
      },
      'cyber-noir': {
        'fantasy': 'techno-mystic',
        'sci-fi': 'dystopian future',
        'horror': 'digital nightmare',
        'cyber-noir': 'neon-noir'
      }
    };

    return atmosphereMap[sourceGenre]?.[targetGenre] || 'hybrid atmosphere';
  }

  /**
   * Categorize for universal system
   */
  private categorizeUniversal(data: any): string {
    if (data.damage || data.power) return 'offensive';
    if (data.defense || data.armor) return 'defensive';
    if (data.heal || data.restore) return 'support';
    if (data.speed || data.movement) return 'mobility';
    return 'utility';
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Clear conversion cache
   */
  clearCache(): void {
    this.conversionCache.clear();
    console.log('🗑️ Genre translation cache cleared');
  }

  /**
   * Get translation statistics
   */
  getTranslationStats(): any {
    return {
      cacheSize: this.conversionCache.size,
      translationTables: this.translationTables.size,
      physicsConverters: this.physicsConverters.size
    };
  }
}

// Supporting classes

class PhysicsConverter {
  constructor(
    private toUniversal: (value: number) => number,
    private fromUniversal: (value: number) => number
  ) {}

  convert(value: number, direction: 'to' | 'from'): number {
    return direction === 'to' ? this.toUniversal(value) : this.fromUniversal(value);
  }
}

class CombatBalancer {
  balance(attacker: any, defender: any): any {
    // Combat balancing logic
    return {
      attackerModified: attacker,
      defenderModified: defender,
      balanced: true
    };
  }
}

class LoreAdapter {
  adaptLore(sourceLore: any, targetGenre: Genre): any {
    // Lore adaptation logic
    return {
      ...sourceLore,
      adapted: true,
      targetGenre
    };
  }
}

// Export singleton instance
export const genreMatrix = new GenreMatrixEngine();
