/**
 * Dungeon Crawl System
 * Dungeon Crawler Carl-inspired AI Dungeon Master with procedural generation
 * Permadeath tension, tiered labyrinths, evolving audience
 */

import type {
  Dungeon,
  DungeonLayout,
  DungeonMaster,
  EnvironmentModifier,
  Character,
  World,
  MaskPersonality
} from '../types';

export class DungeonCrawlSystem {
  private dungeons: Map<string, Dungeon> = new Map();
  private dungeonMasters: Map<string, DungeonMaster> = new Map();
  private proceduralGenerator: ProceduralDungeonGenerator;
  private aiDungeonMaster: AIDungeonMaster;
  private hazardSystem: HazardSystem;
  private lootSystem: LootSystem;
  private audienceSystem: AudienceSystem;
  private narratorEngine: NarratorEngine;
  private activeRuns: Map<string, DungeonRun> = new Map();

  constructor() {
    this.proceduralGenerator = new ProceduralDungeonGenerator();
    this.aiDungeonMaster = new AIDungeonMaster();
    this.hazardSystem = new HazardSystem();
    this.lootSystem = new LootSystem();
    this.audienceSystem = new AudienceSystem();
    this.narratorEngine = new NarratorEngine();
  }

  /**
   * Create a new dungeon with AI Dungeon Master
   */
  async createDungeon(
    worldId: string,
    config: {
      name: string;
      tier: number;
      difficulty: 'easy' | 'normal' | 'hard' | 'nightmare' | 'impossible';
      theme?: string;
      audienceMode?: boolean;
      permadeath?: boolean;
    }
  ): Promise<Dungeon> {
    console.log(`🏰 Creating dungeon: ${config.name} (Tier ${config.tier})`);

    // Generate dungeon ID
    const dungeonId = this.generateDungeonId();

    // Create AI Dungeon Master
    const dungeonMaster = await this.createDungeonMaster(config);

    // Generate procedural layout
    const layout = await this.proceduralGenerator.generateLayout({
      tier: config.tier,
      difficulty: config.difficulty,
      theme: config.theme,
      seed: dungeonId
    });

    // Generate environmental modifiers
    const modifiers = this.generateEnvironmentModifiers(config.tier, config.difficulty);

    // Generate treasures
    const treasures = await this.lootSystem.generateTreasures(config.tier, layout);

    // Generate monsters
    const monsters = await this.generateMonsters(config.tier, config.difficulty, layout);

    // Generate traps
    const traps = await this.generateTraps(config.tier, config.difficulty);

    // Generate puzzles
    const puzzles = await this.generatePuzzles(config.tier);

    // Create dungeon
    const dungeon: Dungeon = {
      id: dungeonId,
      worldId,
      name: config.name,
      tier: config.tier,
      layout,
      master: dungeonMaster,
      modifiers,
      treasures,
      monsters,
      traps,
      puzzles,
      audienceMode: config.audienceMode || false,
      liveCommentary: [],
      deathCount: 0,
      completionRate: 0
    };

    // Store dungeon
    this.dungeons.set(dungeonId, dungeon);
    this.dungeonMasters.set(dungeonId, dungeonMaster);

    // Initialize audience if enabled
    if (config.audienceMode) {
      await this.audienceSystem.initializeAudience(dungeonId);
    }

    console.log(`✅ Dungeon "${config.name}" created with ${layout.floors.length} floors`);
    return dungeon;
  }

  /**
   * Start a dungeon run
   */
  async startDungeonRun(
    dungeonId: string,
    characters: Character[],
    options?: {
      spectators?: string[];
      streamMode?: boolean;
    }
  ): Promise<DungeonRun> {
    const dungeon = this.dungeons.get(dungeonId);
    if (!dungeon) throw new Error('Dungeon not found');

    console.log(`🎮 Starting dungeon run: ${dungeon.name}`);

    // Create run instance
    const run: DungeonRun = {
      id: `run_${Date.now()}`,
      dungeonId,
      characters: characters.map(c => ({
        ...c,
        currentHealth: c.stats.health,
        currentMana: c.stats.mana,
        currentStamina: c.stats.stamina,
        alive: true,
        inventory: c.inventory || { items: [], capacity: 100, gold: 0 }
      })),
      currentFloor: 0,
      currentRoom: 0,
      startTime: Date.now(),
      status: 'active',
      score: 0,
      treasuresFound: [],
      monstersDefeated: [],
      deathLog: [],
      spectators: options?.spectators || [],
      streamMode: options?.streamMode || false,
      audienceInfluence: 0
    };

    // Store active run
    this.activeRuns.set(run.id, run);

    // Initialize AI Dungeon Master for this run
    await this.aiDungeonMaster.initializeRun(dungeon, run);

    // Generate opening narration
    const narration = await this.narratorEngine.generateOpening(dungeon, characters);
    
    // Broadcast to spectators if streaming
    if (run.streamMode) {
      await this.broadcastNarration(run.id, narration);
    }

    // Start audience voting if enabled
    if (dungeon.audienceMode) {
      await this.audienceSystem.startVoting(dungeonId, run.id);
    }

    return run;
  }

  /**
   * Process player action in dungeon
   */
  async processAction(
    runId: string,
    characterId: string,
    action: {
      type: 'move' | 'attack' | 'use_item' | 'interact' | 'flee';
      target?: string;
      direction?: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
      item?: string;
    }
  ): Promise<ActionResult> {
    const run = this.activeRuns.get(runId);
    if (!run) throw new Error('Run not found');

    const dungeon = this.dungeons.get(run.dungeonId);
    if (!dungeon) throw new Error('Dungeon not found');

    const character = run.characters.find(c => c.id === characterId);
    if (!character) throw new Error('Character not found');

    console.log(`⚔️ Processing action: ${character.name} - ${action.type}`);

    // Check if character is alive
    if (!character.alive) {
      return {
        success: false,
        message: 'Character is dead',
        consequences: []
      };
    }

    // Process action based on type
    let result: ActionResult;

    switch (action.type) {
      case 'move':
        result = await this.processMovement(run, character, action.direction!);
        break;
        
      case 'attack':
        result = await this.processCombat(run, character, action.target!);
        break;
        
      case 'use_item':
        result = await this.processItemUse(run, character, action.item!);
        break;
        
      case 'interact':
        result = await this.processInteraction(run, character, action.target!);
        break;
        
      case 'flee':
        result = await this.processFlee(run, character);
        break;
        
      default:
        result = { success: false, message: 'Unknown action', consequences: [] };
    }

    // Apply environmental modifiers
    await this.applyEnvironmentEffects(run, character, dungeon);

    // Check for traps
    if (result.success && action.type === 'move') {
      await this.checkForTraps(run, character, dungeon);
    }

    // Update AI Dungeon Master's narrative
    const narration = await this.aiDungeonMaster.narrateAction(dungeon, run, character, action, result);
    result.narration = narration;

    // Audience reactions if enabled
    if (dungeon.audienceMode) {
      const audienceReaction = await this.audienceSystem.reactToAction(run.id, action, result);
      result.audienceReaction = audienceReaction;
      
      // Apply audience influence
      if (audienceReaction.influence > 0.5) {
        await this.applyAudienceInfluence(run, audienceReaction);
      }
    }

    // Check for death
    if (character.currentHealth <= 0) {
      await this.handleCharacterDeath(run, character, dungeon);
    }

    // Check win conditions
    if (await this.checkWinCondition(run, dungeon)) {
      await this.completeDungeon(run, dungeon);
    }

    return result;
  }

  /**
   * Create AI Dungeon Master
   */
  private async createDungeonMaster(config: any): Promise<DungeonMaster> {
    // Generate unique personality for DM
    const personality = await this.generateDMPersonality(config);

    return {
      id: `dm_${Date.now()}`,
      maskPersonality: personality,
      narrationStyle: this.selectNarrationStyle(config),
      difficulty: {
        base: config.difficulty,
        scaling: true,
        adaptiveAI: true
      },
      adaptivePacing: true,
      audienceInfluence: config.audienceMode ? 0.3 : 0
    };
  }

  /**
   * Generate DM personality using Mask system
   */
  private async generateDMPersonality(config: any): Promise<MaskPersonality> {
    const archetypes = ['tyrant', 'trickster', 'sage', 'destroyer'];
    const selectedArchetype = config.difficulty === 'impossible' ? 'tyrant' :
                            config.difficulty === 'nightmare' ? 'destroyer' :
                            config.difficulty === 'hard' ? 'trickster' :
                            'sage';

    return {
      id: `dm_mask_${Date.now()}`,
      name: `Dungeon Master ${config.name}`,
      archetype: selectedArchetype as any,
      traits: {
        heroism: 0,
        trickery: config.difficulty === 'hard' ? 0.8 : 0.5,
        wisdom: config.difficulty === 'easy' ? 0.8 : 0.3,
        tyranny: config.difficulty === 'impossible' ? 1.0 : 0.4,
        chaos: Math.random() * 0.5 + 0.3,
        order: 1 - (Math.random() * 0.5 + 0.3)
      },
      evolution: {
        stage: config.tier,
        experience: 0,
        reinforcements: []
      },
      memories: [],
      relationships: [],
      fusionCompatibility: []
    };
  }

  /**
   * Select narration style based on config
   */
  private selectNarrationStyle(config: any): any {
    const styles = {
      'easy': 'casual',
      'normal': 'epic',
      'hard': 'dark',
      'nightmare': 'mysterious',
      'impossible': 'comedic' // Ironic comedy for impossible difficulty
    };

    return styles[config.difficulty as keyof typeof styles] || 'epic';
  }

  /**
   * Generate environment modifiers
   */
  private generateEnvironmentModifiers(tier: number, difficulty: string): EnvironmentModifier[] {
    const modifiers: EnvironmentModifier[] = [];
    const modifierCount = Math.min(tier, 5);

    const availableModifiers: EnvironmentModifier['type'][] = [
      'gravity-shift', 'light-decay', 'mind-fog', 'time-dilation', 'reality-warp'
    ];

    for (let i = 0; i < modifierCount; i++) {
      const type = availableModifiers[Math.floor(Math.random() * availableModifiers.length)];
      
      modifiers.push({
        type,
        intensity: this.calculateIntensity(tier, difficulty),
        duration: type === 'time-dilation' ? undefined : Math.random() * 300 + 60, // 1-6 minutes
        area: {
          floors: [Math.floor(Math.random() * tier)],
          rooms: []
        },
        effects: this.getModifierEffects(type)
      });
    }

    return modifiers;
  }

  /**
   * Calculate modifier intensity
   */
  private calculateIntensity(tier: number, difficulty: string): number {
    const base = tier * 0.1;
    const difficultyMultiplier = {
      'easy': 0.5,
      'normal': 1.0,
      'hard': 1.5,
      'nightmare': 2.0,
      'impossible': 3.0
    };

    return Math.min(1, base * (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1));
  }

  /**
   * Get modifier effects
   */
  private getModifierEffects(type: EnvironmentModifier['type']): any[] {
    const effects: Record<EnvironmentModifier['type'], any[]> = {
      'gravity-shift': [
        { stat: 'movement', multiplier: 0.5 },
        { stat: 'jump', multiplier: 2.0 }
      ],
      'light-decay': [
        { stat: 'vision', multiplier: 0.3 },
        { stat: 'accuracy', multiplier: 0.7 }
      ],
      'mind-fog': [
        { stat: 'intelligence', multiplier: 0.5 },
        { stat: 'mana_regen', multiplier: 0.3 }
      ],
      'time-dilation': [
        { stat: 'speed', multiplier: 0.5 },
        { stat: 'cooldowns', multiplier: 2.0 }
      ],
      'reality-warp': [
        { stat: 'random', multiplier: 'chaos' }
      ]
    };

    return effects[type] || [];
  }

  /**
   * Generate monsters for dungeon
   */
  private async generateMonsters(tier: number, difficulty: string, layout: DungeonLayout): Promise<any[]> {
    const monsters: any[] = [];
    const monsterCount = tier * 10 * (difficulty === 'impossible' ? 3 : difficulty === 'nightmare' ? 2 : 1);

    for (let i = 0; i < monsterCount; i++) {
      const floor = Math.floor(Math.random() * layout.floors.length);
      const room = Math.floor(Math.random() * (layout.floors[floor].rooms?.length || 10));
      
      monsters.push({
        id: `monster_${i}`,
        name: this.generateMonsterName(tier),
        type: this.selectMonsterType(tier),
        level: tier + Math.floor(Math.random() * 3),
        health: 50 * tier + Math.random() * 100,
        damage: 10 * tier + Math.random() * 20,
        abilities: this.generateMonsterAbilities(tier),
        loot: await this.lootSystem.generateMonsterLoot(tier),
        location: { floor, room },
        behavior: this.generateMonsterBehavior(),
        alive: true
      });
    }

    // Add boss monsters
    for (const bossRoom of layout.bossRooms || []) {
      monsters.push({
        id: `boss_${bossRoom.floor}`,
        name: this.generateBossName(tier),
        type: 'boss',
        level: tier * 2,
        health: 500 * tier,
        damage: 30 * tier,
        abilities: this.generateBossAbilities(tier),
        loot: await this.lootSystem.generateBossLoot(tier),
        location: bossRoom,
        behavior: 'aggressive',
        alive: true,
        isBoss: true
      });
    }

    return monsters;
  }

  /**
   * Generate traps for dungeon
   */
  private async generateTraps(tier: number, difficulty: string): Promise<any[]> {
    const traps: any[] = [];
    const trapCount = tier * 5 * (difficulty === 'impossible' ? 3 : 1);

    const trapTypes = [
      'spike_pit', 'poison_dart', 'flame_jet', 'crushing_wall',
      'teleporter', 'illusion', 'gravity_well', 'time_loop'
    ];

    for (let i = 0; i < trapCount; i++) {
      const type = trapTypes[Math.floor(Math.random() * trapTypes.length)];
      
      traps.push({
        id: `trap_${i}`,
        type,
        damage: this.calculateTrapDamage(type, tier),
        detectDifficulty: 10 + tier * 2,
        disarmDifficulty: 15 + tier * 3,
        triggered: false,
        location: {
          floor: Math.floor(Math.random() * tier),
          room: Math.floor(Math.random() * 10)
        },
        effect: this.getTrapEffect(type)
      });
    }

    return traps;
  }

  /**
   * Generate puzzles for dungeon
   */
  private async generatePuzzles(tier: number): Promise<any[]> {
    const puzzles: any[] = [];
    const puzzleCount = Math.max(1, Math.floor(tier / 2));

    const puzzleTypes = [
      'riddle', 'pattern', 'mechanism', 'logic', 'memory',
      'spatial', 'musical', 'elemental', 'temporal'
    ];

    for (let i = 0; i < puzzleCount; i++) {
      const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
      
      puzzles.push({
        id: `puzzle_${i}`,
        type,
        difficulty: 10 + tier * 3,
        reward: await this.lootSystem.generatePuzzleReward(tier),
        hint: this.generatePuzzleHint(type),
        solution: this.generatePuzzleSolution(type),
        attempts: 0,
        solved: false,
        location: {
          floor: Math.floor(tier / 2) + i,
          room: 'puzzle_chamber'
        }
      });
    }

    return puzzles;
  }

  /**
   * Process movement action
   */
  private async processMovement(
    run: DungeonRun,
    character: any,
    direction: string
  ): Promise<ActionResult> {
    const dungeon = this.dungeons.get(run.dungeonId)!;
    const currentFloor = dungeon.layout.floors[run.currentFloor];
    
    // Check if movement is valid
    const canMove = await this.validateMovement(currentFloor, run.currentRoom, direction);
    
    if (!canMove) {
      return {
        success: false,
        message: `Cannot move ${direction} from here`,
        consequences: []
      };
    }

    // Calculate stamina cost
    const staminaCost = 5;
    if (character.currentStamina < staminaCost) {
      return {
        success: false,
        message: 'Not enough stamina to move',
        consequences: []
      };
    }

    // Move to new room
    const newRoom = this.calculateNewRoom(run.currentRoom, direction);
    run.currentRoom = newRoom;
    character.currentStamina -= staminaCost;

    // Check for encounters
    const encounter = await this.checkForEncounter(run, dungeon, newRoom);
    
    return {
      success: true,
      message: `Moved ${direction}`,
      consequences: encounter ? [encounter] : [],
      newLocation: { floor: run.currentFloor, room: newRoom }
    };
  }

  /**
   * Process combat action
   */
  private async processCombat(
    run: DungeonRun,
    character: any,
    targetId: string
  ): Promise<ActionResult> {
    const dungeon = this.dungeons.get(run.dungeonId)!;
    const monster = dungeon.monsters.find(m => m.id === targetId);
    
    if (!monster || !monster.alive) {
      return {
        success: false,
        message: 'Invalid target',
        consequences: []
      };
    }

    // Calculate damage
    const damage = character.stats.strength * 2 + Math.random() * 20;
    monster.health -= damage;

    // Monster retaliation
    let retaliation = null;
    if (monster.health > 0) {
      const monsterDamage = monster.damage + Math.random() * 10;
      character.currentHealth -= monsterDamage;
      retaliation = {
        type: 'damage',
        amount: monsterDamage,
        source: monster.name
      };
    } else {
      // Monster defeated
      monster.alive = false;
      run.monstersDefeated.push(monster.id);
      run.score += monster.level * 100;
      
      // Drop loot
      if (monster.loot) {
        character.inventory.items.push(...monster.loot);
      }
    }

    return {
      success: true,
      message: `Attacked ${monster.name} for ${damage.toFixed(0)} damage`,
      consequences: retaliation ? [retaliation] : [],
      combat: {
        damage,
        targetHealth: Math.max(0, monster.health),
        targetDefeated: !monster.alive
      }
    };
  }

  /**
   * Process item use
   */
  private async processItemUse(
    run: DungeonRun,
    character: any,
    itemId: string
  ): Promise<ActionResult> {
    const item = character.inventory.items.find((i: any) => i.id === itemId);
    
    if (!item) {
      return {
        success: false,
        message: 'Item not found',
        consequences: []
      };
    }

    // Apply item effect
    const effect = await this.applyItemEffect(character, item);
    
    // Remove consumable items
    if (item.consumable) {
      character.inventory.items = character.inventory.items.filter((i: any) => i.id !== itemId);
    }

    return {
      success: true,
      message: `Used ${item.name}`,
      consequences: [effect]
    };
  }

  /**
   * Process interaction
   */
  private async processInteraction(
    run: DungeonRun,
    character: any,
    targetId: string
  ): Promise<ActionResult> {
    const dungeon = this.dungeons.get(run.dungeonId)!;
    
    // Check for puzzle
    const puzzle = dungeon.puzzles.find(p => p.id === targetId);
    if (puzzle && !puzzle.solved) {
      return await this.solvePuzzle(run, character, puzzle);
    }

    // Check for treasure
    const treasure = dungeon.treasures.find(t => t.id === targetId);
    if (treasure && !treasure.collected) {
      return await this.collectTreasure(run, character, treasure);
    }

    return {
      success: false,
      message: 'Nothing to interact with',
      consequences: []
    };
  }

  /**
   * Process flee action
   */
  private async processFlee(
    run: DungeonRun,
    character: any
  ): Promise<ActionResult> {
    // Check if flee is possible
    const fleeChance = character.stats.agility / 100;
    const success = Math.random() < fleeChance;

    if (success) {
      // Move to previous room
      run.currentRoom = Math.max(0, run.currentRoom - 1);
      return {
        success: true,
        message: 'Successfully fled',
        consequences: []
      };
    } else {
      // Failed to flee, take damage
      const damage = 10 + Math.random() * 20;
      character.currentHealth -= damage;
      
      return {
        success: false,
        message: 'Failed to flee',
        consequences: [{
          type: 'damage',
          amount: damage,
          source: 'failed_flee'
        }]
      };
    }
  }

  /**
   * Apply environmental effects
   */
  private async applyEnvironmentEffects(
    run: DungeonRun,
    character: any,
    dungeon: Dungeon
  ): Promise<void> {
    for (const modifier of dungeon.modifiers) {
      if (modifier.area.floors.includes(run.currentFloor)) {
        for (const effect of modifier.effects) {
          if (effect.stat === 'random') {
            // Random chaos effect
            const randomStat = ['health', 'mana', 'stamina'][Math.floor(Math.random() * 3)];
            const randomChange = (Math.random() - 0.5) * 20;
            (character as any)[`current${randomStat.charAt(0).toUpperCase() + randomStat.slice(1)}`] += randomChange;
          } else {
            // Apply multiplier to stat
            if (character.stats[effect.stat]) {
              character.stats[effect.stat] *= effect.multiplier;
            }
          }
        }
      }
    }
  }

  /**
   * Check for traps
   */
  private async checkForTraps(
    run: DungeonRun,
    character: any,
    dungeon: Dungeon
  ): Promise<void> {
    const trap = dungeon.traps.find(t => 
      !t.triggered &&
      t.location.floor === run.currentFloor &&
      t.location.room === run.currentRoom
    );

    if (trap) {
      // Detection check
      const detectRoll = Math.random() * 20 + character.stats.wisdom / 10;
      
      if (detectRoll < trap.detectDifficulty) {
        // Trap triggered
        trap.triggered = true;
        character.currentHealth -= trap.damage;
        
        console.log(`💀 ${character.name} triggered ${trap.type}! ${trap.damage} damage!`);
        
        // Apply trap effect
        if (trap.effect) {
          await this.applyTrapEffect(character, trap.effect);
        }
      } else {
        console.log(`👁️ ${character.name} detected and avoided ${trap.type}`);
      }
    }
  }

  /**
   * Handle character death
   */
  private async handleCharacterDeath(
    run: DungeonRun,
    character: any,
    dungeon: Dungeon
  ): Promise<void> {
    character.alive = false;
    dungeon.deathCount++;
    
    run.deathLog.push({
      characterId: character.id,
      characterName: character.name,
      floor: run.currentFloor,
      room: run.currentRoom,
      cause: 'combat', // or trap, environment, etc.
      timestamp: Date.now()
    });

    console.log(`☠️ ${character.name} has died in the dungeon!`);

    // Generate death narration
    const deathNarration = await this.narratorEngine.generateDeathScene(character, dungeon, run);
    
    // Audience reaction
    if (dungeon.audienceMode) {
      await this.audienceSystem.reactToDeath(run.id, character);
    }

    // Check for total party kill
    if (run.characters.every(c => !c.alive)) {
      await this.endDungeonRun(run, dungeon, 'failed');
    }
  }

  /**
   * Check win condition
   */
  private async checkWinCondition(run: DungeonRun, dungeon: Dungeon): Promise<boolean> {
    // Check if all bosses are defeated
    const allBossesDefeated = dungeon.monsters
      .filter(m => m.isBoss)
      .every(boss => !boss.alive);

    // Check if reached final floor
    const onFinalFloor = run.currentFloor === dungeon.layout.floors.length - 1;

    // Check if collected key treasures
    const keyTreasuresCollected = dungeon.treasures
      .filter(t => t.isKey)
      .every(t => t.collected);

    return allBossesDefeated && onFinalFloor && keyTreasuresCollected;
  }

  /**
   * Complete dungeon successfully
   */
  private async completeDungeon(run: DungeonRun, dungeon: Dungeon): Promise<void> {
    run.status = 'completed';
    const completionTime = Date.now() - run.startTime;
    
    // Calculate completion rate
    const survivorCount = run.characters.filter(c => c.alive).length;
    const survivalRate = survivorCount / run.characters.length;
    dungeon.completionRate = (dungeon.completionRate * 0.9) + (survivalRate * 0.1); // Moving average

    // Calculate final score
    run.score += survivorCount * 1000;
    run.score += Math.floor(100000 / (completionTime / 1000)); // Time bonus
    
    console.log(`🎉 Dungeon completed! Score: ${run.score}`);

    // Generate victory narration
    const victoryNarration = await this.narratorEngine.generateVictoryScene(run, dungeon);

    // Audience celebration
    if (dungeon.audienceMode) {
      await this.audienceSystem.celebrateVictory(run.id);
    }

    // Award loot and experience
    for (const character of run.characters.filter(c => c.alive)) {
      character.experience += dungeon.tier * 1000;
      character.inventory.gold += dungeon.tier * 500;
    }

    await this.endDungeonRun(run, dungeon, 'completed');
  }

  /**
   * End dungeon run
   */
  private async endDungeonRun(
    run: DungeonRun,
    dungeon: Dungeon,
    result: 'completed' | 'failed' | 'abandoned'
  ): Promise<void> {
    run.status = result;
    run.endTime = Date.now();

    // Generate final report
    const report = {
      dungeonName: dungeon.name,
      result,
      duration: run.endTime - run.startTime,
      score: run.score,
      survivors: run.characters.filter(c => c.alive).map(c => c.name),
      deaths: run.deathLog,
      treasuresFound: run.treasuresFound.length,
      monstersDefeated: run.monstersDefeated.length,
      floorsExplored: run.currentFloor + 1
    };

    console.log('📊 Dungeon Run Report:', report);

    // Clean up active run
    this.activeRuns.delete(run.id);

    // Stop audience voting
    if (dungeon.audienceMode) {
      await this.audienceSystem.endVoting(run.id);
    }
  }

  /**
   * Apply audience influence
   */
  private async applyAudienceInfluence(run: DungeonRun, reaction: any): Promise<void> {
    run.audienceInfluence += reaction.influence;

    // Audience can affect difficulty
    if (run.audienceInfluence > 1.0) {
      // Make it harder
      const dungeon = this.dungeons.get(run.dungeonId)!;
      for (const monster of dungeon.monsters) {
        if (monster.alive) {
          monster.health *= 1.1;
          monster.damage *= 1.1;
        }
      }
      run.audienceInfluence = 0;
      console.log('👥 Audience demands more challenge!');
    } else if (run.audienceInfluence < -1.0) {
      // Make it easier
      const dungeon = this.dungeons.get(run.dungeonId)!;
      for (const character of run.characters) {
        if (character.alive) {
          character.currentHealth = Math.min(character.stats.maxHealth, character.currentHealth + 20);
        }
      }
      run.audienceInfluence = 0;
      console.log('👥 Audience shows mercy!');
    }
  }

  /**
   * Broadcast narration to spectators
   */
  private async broadcastNarration(runId: string, narration: string): Promise<void> {
    const run = this.activeRuns.get(runId);
    if (!run) return;

    // In production, this would use WebSocket
    console.log(`📢 Narration: ${narration}`);
    
    for (const spectatorId of run.spectators) {
      // Send to spectator
      // await sendToSpectator(spectatorId, narration);
    }
  }

  // Helper methods for generation

  private generateDungeonId(): string {
    return `dungeon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMonsterName(tier: number): string {
    const prefixes = ['Shadow', 'Cursed', 'Ancient', 'Twisted', 'Void'];
    const names = ['Goblin', 'Skeleton', 'Spider', 'Wraith', 'Demon'];
    const suffixes = tier > 5 ? [' Lord', ' King', ' Ancient'] : [''];
    
    return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' +
           names[Math.floor(Math.random() * names.length)] +
           suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  private generateBossName(tier: number): string {
    const titles = ['The Destroyer', 'The Eternal', 'The Forgotten', 'The Corrupted'];
    const names = ['Azathoth', 'Morgrim', 'Vex\'thor', 'Shadowmaw'];
    
    return names[Math.floor(Math.random() * names.length)] + ', ' +
           titles[Math.floor(Math.random() * titles.length)];
  }

  private selectMonsterType(tier: number): string {
    const types = ['undead', 'beast', 'demon', 'construct', 'aberration'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateMonsterAbilities(tier: number): any[] {
    const abilities = [];
    const abilityCount = Math.min(tier, 3);
    
    for (let i = 0; i < abilityCount; i++) {
      abilities.push({
        name: ['Bite', 'Claw', 'Spell', 'Charge', 'Roar'][Math.floor(Math.random() * 5)],
        damage: tier * 5 + Math.random() * 10,
        cooldown: Math.random() * 5 + 2
      });
    }
    
    return abilities;
  }

  private generateBossAbilities(tier: number): any[] {
    return [
      { name: 'Devastating Strike', damage: tier * 20, cooldown: 10 },
      { name: 'Area Attack', damage: tier * 10, cooldown: 5, aoe: true },
      { name: 'Summon Minions', damage: 0, cooldown: 15, summon: true },
      { name: 'Enrage', damage: 0, cooldown: 20, buff: true }
    ];
  }

  private generateMonsterBehavior(): string {
    const behaviors = ['aggressive', 'defensive', 'cunning', 'cowardly', 'berserk'];
    return behaviors[Math.floor(Math.random() * behaviors.length)];
  }

  private calculateTrapDamage(type: string, tier: number): number {
    const baseDamage: Record<string, number> = {
      'spike_pit': 20,
      'poison_dart': 15,
      'flame_jet': 25,
      'crushing_wall': 40,
      'teleporter': 0,
      'illusion': 5,
      'gravity_well': 10,
      'time_loop': 0
    };
    
    return (baseDamage[type] || 10) * tier;
  }

  private getTrapEffect(type: string): any {
    const effects: Record<string, any> = {
      'poison_dart': { type: 'poison', duration: 30, damage_per_second: 2 },
      'teleporter': { type: 'teleport', destination: 'random' },
      'illusion': { type: 'confusion', duration: 10 },
      'gravity_well': { type: 'slow', duration: 20, multiplier: 0.5 },
      'time_loop': { type: 'reset', target: 'room' }
    };
    
    return effects[type] || null;
  }

  private generatePuzzleHint(type: string): string {
    const hints: Record<string, string> = {
      'riddle': 'Think carefully about the words...',
      'pattern': 'Look for the sequence...',
      'mechanism': 'Every gear has its place...',
      'logic': 'Eliminate the impossible...',
      'memory': 'Remember what you\'ve seen...',
      'spatial': 'Consider all dimensions...',
      'musical': 'Listen to the rhythm...',
      'elemental': 'Fire, water, earth, air...',
      'temporal': 'Time is of the essence...'
    };
    
    return hints[type] || 'Think outside the box...';
  }

  private generatePuzzleSolution(type: string): any {
    // Generate appropriate solution based on type
    return {
      type,
      answer: 'solution_' + Math.random().toString(36).substr(2, 9)
    };
  }

  private async validateMovement(floor: any, currentRoom: number, direction: string): Promise<boolean> {
    // Check if movement is valid based on dungeon layout
    // In production, this would check actual room connections
    return true;
  }

  private calculateNewRoom(currentRoom: number, direction: string): number {
    const roomChange: Record<string, number> = {
      'north': -10,
      'south': 10,
      'east': 1,
      'west': -1,
      'up': -100,
      'down': 100
    };
    
    return Math.max(0, currentRoom + (roomChange[direction] || 0));
  }

  private async checkForEncounter(run: DungeonRun, dungeon: Dungeon, room: number): Promise<any> {
    // Check if there's a monster in the new room
    const monster = dungeon.monsters.find(m => 
      m.alive &&
      m.location.floor === run.currentFloor &&
      m.location.room === room
    );
    
    if (monster) {
      return {
        type: 'monster_encounter',
        monster: monster.name,
        monsterId: monster.id
      };
    }
    
    return null;
  }

  private async applyItemEffect(character: any, item: any): Promise<any> {
    const effect: any = { type: 'item_effect', item: item.name };
    
    if (item.type === 'potion') {
      const healAmount = item.power || 50;
      character.currentHealth = Math.min(character.stats.maxHealth, character.currentHealth + healAmount);
      effect.heal = healAmount;
    } else if (item.type === 'mana_potion') {
      const manaAmount = item.power || 30;
      character.currentMana = Math.min(character.stats.maxMana, character.currentMana + manaAmount);
      effect.mana = manaAmount;
    }
    
    return effect;
  }

  private async solvePuzzle(run: DungeonRun, character: any, puzzle: any): Promise<ActionResult> {
    puzzle.attempts++;
    
    // Intelligence check
    const solveRoll = Math.random() * 20 + character.stats.intelligence / 5;
    
    if (solveRoll >= puzzle.difficulty) {
      puzzle.solved = true;
      character.inventory.items.push(...puzzle.reward);
      run.score += 500 * puzzle.difficulty;
      
      return {
        success: true,
        message: `Solved the ${puzzle.type} puzzle!`,
        consequences: [{
          type: 'reward',
          items: puzzle.reward
        }]
      };
    } else {
      return {
        success: false,
        message: `Failed to solve the puzzle. Hint: ${puzzle.hint}`,
        consequences: []
      };
    }
  }

  private async collectTreasure(run: DungeonRun, character: any, treasure: any): Promise<ActionResult> {
    treasure.collected = true;
    character.inventory.items.push(...treasure.items);
    character.inventory.gold += treasure.gold || 0;
    run.treasuresFound.push(treasure.id);
    run.score += treasure.value || 100;
    
    return {
      success: true,
      message: `Found ${treasure.name}!`,
      consequences: [{
        type: 'treasure',
        items: treasure.items,
        gold: treasure.gold
      }]
    };
  }

  private async applyTrapEffect(character: any, effect: any): Promise<void> {
    if (effect.type === 'poison') {
      // Apply poison over time
      // In production, this would use a timer system
      character.conditions = character.conditions || [];
      character.conditions.push({
        type: 'poison',
        duration: effect.duration,
        damagePerSecond: effect.damage_per_second
      });
    } else if (effect.type === 'slow') {
      character.stats.agility *= effect.multiplier;
    }
  }
}

// Supporting classes

interface DungeonRun {
  id: string;
  dungeonId: string;
  characters: any[];
  currentFloor: number;
  currentRoom: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  score: number;
  treasuresFound: string[];
  monstersDefeated: string[];
  deathLog: any[];
  spectators: string[];
  streamMode: boolean;
  audienceInfluence: number;
}

interface ActionResult {
  success: boolean;
  message: string;
  consequences: any[];
  narration?: string;
  audienceReaction?: any;
  newLocation?: any;
  combat?: any;
}

class ProceduralDungeonGenerator {
  async generateLayout(config: any): Promise<DungeonLayout> {
    const floors = [];
    
    for (let i = 0; i < config.tier; i++) {
      floors.push({
        level: i,
        rooms: this.generateRooms(config),
        connections: this.generateConnections(),
        theme: this.selectFloorTheme(i, config.theme)
      });
    }
    
    return {
      floors,
      connections: this.generateFloorConnections(floors),
      safeZones: this.generateSafeZones(config.tier),
      bossRooms: this.generateBossRooms(config.tier),
      secretAreas: this.generateSecretAreas(config.tier),
      proceduralSeed: config.seed
    };
  }
  
  private generateRooms(config: any): any[] {
    const roomCount = 10 + config.tier * 5;
    const rooms = [];
    
    for (let i = 0; i < roomCount; i++) {
      rooms.push({
        id: `room_${i}`,
        type: this.selectRoomType(),
        size: this.selectRoomSize(),
        exits: this.generateExits()
      });
    }
    
    return rooms;
  }
  
  private generateConnections(): any[] {
    return [];
  }
  
  private selectFloorTheme(level: number, baseTheme?: string): string {
    const themes = ['stone', 'crystal', 'shadow', 'fire', 'ice', 'void'];
    return baseTheme || themes[level % themes.length];
  }
  
  private generateFloorConnections(floors: any[]): any[] {
    return floors.map((floor, i) => ({
      from: i,
      to: i + 1,
      type: i === floors.length - 2 ? 'boss_door' : 'stairs'
    })).filter(c => c.to < floors.length);
  }
  
  private generateSafeZones(tier: number): any[] {
    return Array.from({ length: Math.max(1, Math.floor(tier / 3)) }, (_, i) => ({
      floor: i * 3,
      room: 0,
      type: 'rest_area'
    }));
  }
  
  private generateBossRooms(tier: number): any[] {
    return [{
      floor: tier - 1,
      room: 'boss_chamber',
      type: 'boss'
    }];
  }
  
  private generateSecretAreas(tier: number): any[] {
    return Array.from({ length: Math.floor(tier / 2) }, (_, i) => ({
      floor: i * 2,
      room: 'secret',
      type: 'treasure',
      hidden: true
    }));
  }
  
  private selectRoomType(): string {
    const types = ['combat', 'puzzle', 'treasure', 'trap', 'empty', 'shrine'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private selectRoomSize(): string {
    const sizes = ['small', 'medium', 'large', 'huge'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }
  
  private generateExits(): string[] {
    const allExits = ['north', 'south', 'east', 'west'];
    const exitCount = Math.floor(Math.random() * 3) + 1;
    const exits: string[] = [];
    
    for (let i = 0; i < exitCount; i++) {
      const exit = allExits[Math.floor(Math.random() * allExits.length)];
      if (!exits.includes(exit)) {
        exits.push(exit);
      }
    }
    
    return exits;
  }
}

class AIDungeonMaster {
  private currentNarrative: string = '';
  
  async initializeRun(dungeon: Dungeon, run: DungeonRun): Promise<void> {
    this.currentNarrative = `The ${dungeon.name} awaits...`;
  }
  
  async narrateAction(
    dungeon: Dungeon,
    run: DungeonRun,
    character: any,
    action: any,
    result: ActionResult
  ): Promise<string> {
    // Generate contextual narration based on action and result
    const style = dungeon.master.narrationStyle;
    
    if (style === 'epic') {
      return `${character.name} ${action.type}s with heroic determination. ${result.message}`;
    } else if (style === 'dark') {
      return `In the shadows, ${character.name} ${action.type}s. ${result.message} The darkness grows...`;
    } else if (style === 'comedic') {
      return `${character.name} attempts to ${action.type}. ${result.message} How amusing!`;
    }
    
    return `${character.name} ${action.type}s. ${result.message}`;
  }
}

class HazardSystem {
  generateHazards(tier: number): any[] {
    return [];
  }
}

class LootSystem {
  async generateTreasures(tier: number, layout: DungeonLayout): Promise<any[]> {
    const treasures = [];
    const treasureCount = tier * 3;
    
    for (let i = 0; i < treasureCount; i++) {
      treasures.push({
        id: `treasure_${i}`,
        name: this.generateTreasureName(tier),
        items: await this.generateItems(tier),
        gold: Math.floor(Math.random() * 100 * tier),
        value: Math.floor(Math.random() * 500 * tier),
        collected: false,
        isKey: i === 0 // First treasure is key item
      });
    }
    
    return treasures;
  }
  
  async generateMonsterLoot(tier: number): Promise<any[]> {
    if (Math.random() > 0.3) {
      return this.generateItems(Math.max(1, tier - 1));
    }
    return [];
  }
  
  async generateBossLoot(tier: number): Promise<any[]> {
    return this.generateItems(tier + 1, true);
  }
  
  async generatePuzzleReward(tier: number): Promise<any[]> {
    return this.generateItems(tier);
  }
  
  private generateTreasureName(tier: number): string {
    const prefixes = ['Ancient', 'Lost', 'Forgotten', 'Mystic', 'Cursed'];
    const items = ['Chest', 'Vault', 'Cache', 'Hoard', 'Trove'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${items[Math.floor(Math.random() * items.length)]}`;
  }
  
  private async generateItems(tier: number, legendary: boolean = false): Promise<any[]> {
    const items = [];
    const itemCount = legendary ? 1 : Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: `item_${Date.now()}_${i}`,
        name: legendary ? this.generateLegendaryName() : this.generateItemName(),
        type: this.selectItemType(),
        power: tier * (legendary ? 20 : 10) + Math.random() * 20,
        rarity: legendary ? 'legendary' : this.selectRarity(),
        consumable: Math.random() > 0.7
      });
    }
    
    return items;
  }
  
  private generateItemName(): string {
    const prefixes = ['Iron', 'Steel', 'Crystal', 'Shadow', 'Mystic'];
    const items = ['Sword', 'Shield', 'Potion', 'Ring', 'Amulet'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${items[Math.floor(Math.random() * items.length)]}`;
  }
  
  private generateLegendaryName(): string {
    const names = ['Excalibur', 'Aegis', 'Mjolnir', 'Glamdring', 'Sting'];
    const titles = ['the Destroyer', 'of Eternity', 'the Worldbreaker', 'of Legends'];
    
    return `${names[Math.floor(Math.random() * names.length)]}, ${titles[Math.floor(Math.random() * titles.length)]}`;
  }
  
  private selectItemType(): string {
    const types = ['weapon', 'armor', 'potion', 'accessory', 'artifact'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private selectRarity(): string {
    const rarities = ['common', 'uncommon', 'rare', 'epic'];
    const weights = [0.5, 0.3, 0.15, 0.05];
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < rarities.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return rarities[i];
      }
    }
    
    return 'common';
  }
}

class AudienceSystem {
  private activeVotes: Map<string, any> = new Map();
  
  async initializeAudience(dungeonId: string): Promise<void> {
    console.log(`👥 Audience mode activated for dungeon ${dungeonId}`);
  }
  
  async startVoting(dungeonId: string, runId: string): Promise<void> {
    this.activeVotes.set(runId, {
      difficulty: 0,
      mercy: 0,
      chaos: 0
    });
  }
  
  async reactToAction(runId: string, action: any, result: ActionResult): Promise<any> {
    const votes = this.activeVotes.get(runId) || { difficulty: 0, mercy: 0, chaos: 0 };
    
    // Simulate audience reaction
    if (result.success) {
      votes.difficulty += Math.random() * 0.2;
    } else {
      votes.mercy += Math.random() * 0.2;
    }
    
    return {
      influence: votes.difficulty - votes.mercy,
      mood: votes.difficulty > votes.mercy ? 'bloodthirsty' : 'sympathetic',
      cheer: result.success ? Math.random() : 0
    };
  }
  
  async reactToDeath(runId: string, character: any): Promise<void> {
    console.log(`👥 Audience gasps as ${character.name} falls!`);
  }
  
  async celebrateVictory(runId: string): Promise<void> {
    console.log('👥 The audience erupts in celebration!');
  }
  
  async endVoting(runId: string): Promise<void> {
    this.activeVotes.delete(runId);
  }
}

class NarratorEngine {
  async generateOpening(dungeon: Dungeon, characters: Character[]): Promise<string> {
    const characterNames = characters.map(c => c.name).join(', ');
    return `${characterNames} stand before the entrance of ${dungeon.name}. The air is thick with danger and the promise of treasure. The dungeon awaits...`;
  }
  
  async generateDeathScene(character: any, dungeon: Dungeon, run: DungeonRun): Promise<string> {
    return `${character.name} draws their last breath in the depths of ${dungeon.name}. Their sacrifice will be remembered... if anyone survives to tell the tale.`;
  }
  
  async generateVictoryScene(run: DungeonRun, dungeon: Dungeon): Promise<string> {
    const survivors = run.characters.filter(c => c.alive).map(c => c.name).join(', ');
    return `Victory! ${survivors} emerge from ${dungeon.name}, bloodied but triumphant. The dungeon has been conquered, its treasures claimed, its monsters vanquished!`;
  }
}

// Export singleton instance
export const dungeonCrawlSystem = new DungeonCrawlSystem();
