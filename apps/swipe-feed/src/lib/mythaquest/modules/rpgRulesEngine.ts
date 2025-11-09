/**
 * RPG Rules Engine
 * D&D-inspired probability system with adaptive AI weighting
 * Integrates with existing World-Forge and Character-Forge systems
 */

import type {
  Character,
  CharacterStats,
  World,
  Genre,
  Alignment,
  CharacterClass,
  Race
} from '../types';

export interface DiceRoll {
  dice: number;      // Number of dice
  sides: number;     // Sides per die (d4, d6, d8, d10, d12, d20, d100)
  modifier: number;  // Static modifier
  advantage?: boolean;
  disadvantage?: boolean;
  criticalRange?: number; // Default 20
  fumbleRange?: number;   // Default 1
}

export interface RuleCheck {
  type: 'skill' | 'ability' | 'save' | 'attack' | 'damage' | 'initiative';
  difficulty: number;
  stat: keyof CharacterStats;
  modifiers: RuleModifier[];
  context?: any;
}

export interface RuleModifier {
  source: string;
  value: number;
  type: 'flat' | 'multiplier' | 'advantage' | 'disadvantage';
  condition?: (character: Character, context?: any) => boolean;
}

export interface CombatRound {
  participants: CombatParticipant[];
  currentTurn: number;
  round: number;
  effects: ActiveEffect[];
  terrain: TerrainEffect[];
}

export interface CombatParticipant {
  character: Character;
  initiative: number;
  actions: number;
  bonusActions: number;
  movement: number;
  reactions: number;
  concentration?: any;
  conditions: StatusCondition[];
}

export interface StatusCondition {
  name: string;
  duration: number;
  effect: (character: Character) => void;
  saveCheck?: RuleCheck;
}

export interface ActiveEffect {
  id: string;
  name: string;
  duration: number;
  targets: string[];
  effect: (targets: Character[]) => void;
}

export interface TerrainEffect {
  type: string;
  difficulty: number;
  area: any;
  effect: (character: Character) => RuleModifier[];
}

export class RPGRulesEngine {
  private aiWeightingSystem: AIWeightingSystem;
  private probabilityEngine: ProbabilityEngine;
  private combatResolver: CombatResolver;
  private skillSystem: SkillSystem;
  private conditionTracker: ConditionTracker;
  private criticalSystem: CriticalSystem;
  private activeCombats: Map<string, CombatRound> = new Map();

  constructor() {
    this.aiWeightingSystem = new AIWeightingSystem();
    this.probabilityEngine = new ProbabilityEngine();
    this.combatResolver = new CombatResolver();
    this.skillSystem = new SkillSystem();
    this.conditionTracker = new ConditionTracker();
    this.criticalSystem = new CriticalSystem();
  }

  /**
   * Roll dice with D&D-style mechanics
   */
  roll(formula: string | DiceRoll): number {
    const roll = typeof formula === 'string' ? this.parseFormula(formula) : formula;
    
    let total = 0;
    const rolls: number[] = [];
    
    // Roll the dice
    for (let i = 0; i < roll.dice; i++) {
      const result = Math.floor(Math.random() * roll.sides) + 1;
      rolls.push(result);
    }
    
    // Handle advantage/disadvantage
    if (roll.advantage || roll.disadvantage) {
      // Roll again
      const secondRolls: number[] = [];
      for (let i = 0; i < roll.dice; i++) {
        const result = Math.floor(Math.random() * roll.sides) + 1;
        secondRolls.push(result);
      }
      
      const firstTotal = rolls.reduce((a, b) => a + b, 0);
      const secondTotal = secondRolls.reduce((a, b) => a + b, 0);
      
      if (roll.advantage) {
        total = Math.max(firstTotal, secondTotal);
      } else {
        total = Math.min(firstTotal, secondTotal);
      }
    } else {
      total = rolls.reduce((a, b) => a + b, 0);
    }
    
    // Add modifier
    total += roll.modifier;
    
    // Check for critical/fumble (only on d20 rolls)
    if (roll.sides === 20 && roll.dice === 1) {
      const baseRoll = rolls[0];
      if (baseRoll >= (roll.criticalRange || 20)) {
        console.log(`⚡ CRITICAL SUCCESS! (${baseRoll})`);
        return this.handleCritical(total);
      }
      if (baseRoll <= (roll.fumbleRange || 1)) {
        console.log(`💥 CRITICAL FAILURE! (${baseRoll})`);
        return this.handleFumble(total);
      }
    }
    
    return total;
  }

  /**
   * Perform ability check with AI weighting
   */
  async performCheck(
    character: Character,
    check: RuleCheck,
    world?: World
  ): Promise<{
    success: boolean;
    roll: number;
    total: number;
    critical: boolean;
    fumble: boolean;
    narrative: string;
  }> {
    console.log(`🎲 ${character.name} attempts ${check.type} check (DC ${check.difficulty})`);
    
    // Base ability modifier
    const stat = character.stats[check.stat];
    const abilityMod = Math.floor((stat - 10) / 2);
    
    // Gather all modifiers
    const modifiers = await this.gatherModifiers(character, check, world);
    
    // Apply AI weighting based on character personality and situation
    const aiWeight = await this.aiWeightingSystem.calculateWeight(character, check, world);
    
    // Roll the dice
    const diceRoll = this.roll({
      dice: 1,
      sides: 20,
      modifier: abilityMod,
      advantage: modifiers.some(m => m.type === 'advantage'),
      disadvantage: modifiers.some(m => m.type === 'disadvantage')
    });
    
    // Apply modifiers
    let total = diceRoll;
    for (const mod of modifiers) {
      if (mod.type === 'flat') {
        total += mod.value;
      } else if (mod.type === 'multiplier') {
        total = Math.floor(total * mod.value);
      }
    }
    
    // Apply AI weight (subtle influence)
    total += aiWeight;
    
    // Determine success
    const success = total >= check.difficulty;
    const critical = diceRoll >= 20 + abilityMod;
    const fumble = diceRoll <= 1 + abilityMod;
    
    // Generate narrative
    const narrative = await this.generateNarrative(character, check, success, critical, fumble);
    
    return {
      success,
      roll: diceRoll,
      total,
      critical,
      fumble,
      narrative
    };
  }

  /**
   * Initialize combat with initiative rolls
   */
  async initiateCombat(
    participants: Character[],
    terrain?: TerrainEffect[]
  ): Promise<CombatRound> {
    console.log(`⚔️ Combat initiated with ${participants.length} participants`);
    
    const combatId = `combat_${Date.now()}`;
    const combatParticipants: CombatParticipant[] = [];
    
    // Roll initiative for each participant
    for (const character of participants) {
      const initiativeRoll = this.roll({
        dice: 1,
        sides: 20,
        modifier: Math.floor((character.stats.agility - 10) / 2)
      });
      
      combatParticipants.push({
        character,
        initiative: initiativeRoll,
        actions: 1,
        bonusActions: 1,
        movement: 30 + (character.stats.agility - 10),
        reactions: 1,
        conditions: []
      });
    }
    
    // Sort by initiative (highest first)
    combatParticipants.sort((a, b) => b.initiative - a.initiative);
    
    const combat: CombatRound = {
      participants: combatParticipants,
      currentTurn: 0,
      round: 1,
      effects: [],
      terrain: terrain || []
    };
    
    this.activeCombats.set(combatId, combat);
    
    return combat;
  }

  /**
   * Process combat action
   */
  async processCombatAction(
    combatId: string,
    actorId: string,
    action: {
      type: 'attack' | 'spell' | 'move' | 'dodge' | 'help' | 'hide';
      target?: string;
      weapon?: any;
      spell?: any;
      position?: any;
    }
  ): Promise<{
    success: boolean;
    damage?: number;
    effects?: string[];
    narrative: string;
  }> {
    const combat = this.activeCombats.get(combatId);
    if (!combat) throw new Error('Combat not found');
    
    const actor = combat.participants.find(p => p.character.id === actorId);
    if (!actor) throw new Error('Actor not in combat');
    
    // Check if it's actor's turn
    if (combat.participants[combat.currentTurn].character.id !== actorId) {
      return {
        success: false,
        narrative: "It's not your turn!"
      };
    }
    
    let result: any = { success: false, narrative: '' };
    
    switch (action.type) {
      case 'attack':
        result = await this.processAttack(actor, action.target!, action.weapon, combat);
        actor.actions--;
        break;
        
      case 'spell':
        result = await this.processCastSpell(actor, action.spell, action.target, combat);
        actor.actions--;
        break;
        
      case 'move':
        result = await this.processMovement(actor, action.position, combat);
        actor.movement -= this.calculateDistance(actor.character, action.position);
        break;
        
      case 'dodge':
        actor.conditions.push({
          name: 'dodging',
          duration: 1,
          effect: (char) => console.log(`${char.name} is dodging`),
        });
        actor.actions--;
        result = { success: true, narrative: `${actor.character.name} takes the Dodge action` };
        break;
        
      case 'help':
        result = await this.processHelp(actor, action.target!, combat);
        actor.actions--;
        break;
        
      case 'hide':
        result = await this.processHide(actor, combat);
        actor.actions--;
        break;
    }
    
    // Check for end of turn
    if (actor.actions <= 0 && actor.bonusActions <= 0) {
      await this.endTurn(combatId);
    }
    
    return result;
  }

  /**
   * Process attack action
   */
  private async processAttack(
    attacker: CombatParticipant,
    targetId: string,
    weapon: any,
    combat: CombatRound
  ): Promise<any> {
    const target = combat.participants.find(p => p.character.id === targetId);
    if (!target) return { success: false, narrative: 'Invalid target' };
    
    // Attack roll
    const attackCheck: RuleCheck = {
      type: 'attack',
      difficulty: this.calculateAC(target.character),
      stat: weapon?.finesse ? 'agility' : 'strength',
      modifiers: this.getAttackModifiers(attacker, target, weapon, combat)
    };
    
    const attackResult = await this.performCheck(attacker.character, attackCheck);
    
    if (!attackResult.success && !attackResult.critical) {
      return {
        success: false,
        narrative: `${attacker.character.name} misses ${target.character.name}`
      };
    }
    
    // Damage roll
    const baseDamage = weapon?.damage || '1d4';
    const damageRoll = this.roll(baseDamage);
    const strMod = Math.floor((attacker.character.stats.strength - 10) / 2);
    let totalDamage = damageRoll + strMod;
    
    // Critical hit doubles damage dice
    if (attackResult.critical) {
      totalDamage += this.roll(baseDamage);
    }
    
    // Apply damage
    target.character.stats.health -= totalDamage;
    
    return {
      success: true,
      damage: totalDamage,
      critical: attackResult.critical,
      narrative: attackResult.critical ?
        `💥 CRITICAL HIT! ${attacker.character.name} devastates ${target.character.name} for ${totalDamage} damage!` :
        `${attacker.character.name} hits ${target.character.name} for ${totalDamage} damage`
    };
  }

  /**
   * Process spell casting
   */
  private async processCastSpell(
    caster: CombatParticipant,
    spell: any,
    targetId?: string,
    combat: CombatRound
  ): Promise<any> {
    // Check if caster has spell slots
    const spellLevel = spell.level || 1;
    if (caster.character.stats.mana < spellLevel * 5) {
      return {
        success: false,
        narrative: `${caster.character.name} doesn't have enough mana`
      };
    }
    
    // Deduct mana
    caster.character.stats.mana -= spellLevel * 5;
    
    // Spell save DC
    const spellSaveDC = 8 + Math.floor((caster.character.stats.intelligence - 10) / 2) + 2; // Proficiency
    
    if (targetId) {
      const target = combat.participants.find(p => p.character.id === targetId);
      if (!target) return { success: false, narrative: 'Invalid target' };
      
      // Target makes saving throw
      const saveCheck: RuleCheck = {
        type: 'save',
        difficulty: spellSaveDC,
        stat: spell.saveType || 'wisdom',
        modifiers: []
      };
      
      const saveResult = await this.performCheck(target.character, saveCheck);
      
      if (saveResult.success) {
        return {
          success: true,
          narrative: `${target.character.name} resists ${caster.character.name}'s ${spell.name}!`
        };
      }
      
      // Apply spell effect
      const damage = this.roll(spell.damage || '2d6');
      target.character.stats.health -= damage;
      
      return {
        success: true,
        damage,
        narrative: `${caster.character.name} casts ${spell.name} on ${target.character.name} for ${damage} damage`
      };
    } else {
      // Area effect or buff spell
      return {
        success: true,
        narrative: `${caster.character.name} casts ${spell.name}`
      };
    }
  }

  /**
   * Calculate Armor Class
   */
  private calculateAC(character: Character): number {
    const baseAC = 10;
    const dexMod = Math.floor((character.stats.agility - 10) / 2);
    const armorBonus = character.equipment?.armor?.ac || 0;
    
    return baseAC + dexMod + armorBonus;
  }

  /**
   * Get attack modifiers
   */
  private getAttackModifiers(
    attacker: CombatParticipant,
    target: CombatParticipant,
    weapon: any,
    combat: CombatRound
  ): RuleModifier[] {
    const modifiers: RuleModifier[] = [];
    
    // Flanking bonus
    if (this.isFlanking(attacker, target, combat)) {
      modifiers.push({
        source: 'flanking',
        value: 0,
        type: 'advantage'
      });
    }
    
    // High ground bonus
    if (attacker.character.position?.z > target.character.position?.z) {
      modifiers.push({
        source: 'high ground',
        value: 2,
        type: 'flat'
      });
    }
    
    // Weapon enchantment
    if (weapon?.enchantment) {
      modifiers.push({
        source: 'enchantment',
        value: weapon.enchantment,
        type: 'flat'
      });
    }
    
    // Conditions
    if (target.conditions.some(c => c.name === 'dodging')) {
      modifiers.push({
        source: 'target dodging',
        value: 0,
        type: 'disadvantage'
      });
    }
    
    return modifiers;
  }

  /**
   * Check if attacker is flanking target
   */
  private isFlanking(
    attacker: CombatParticipant,
    target: CombatParticipant,
    combat: CombatRound
  ): boolean {
    // Check if another ally is on opposite side of target
    const allies = combat.participants.filter(p => 
      p.character.id !== attacker.character.id &&
      p.character.alignment === attacker.character.alignment
    );
    
    // Simplified flanking check
    return allies.length > 0 && Math.random() > 0.5;
  }

  /**
   * Process movement
   */
  private async processMovement(
    actor: CombatParticipant,
    position: any,
    combat: CombatRound
  ): Promise<any> {
    const distance = this.calculateDistance(actor.character, position);
    
    if (distance > actor.movement) {
      return {
        success: false,
        narrative: `${actor.character.name} can't move that far (${distance}ft > ${actor.movement}ft)`
      };
    }
    
    // Check for opportunity attacks
    const threateningEnemies = this.getThreateningEnemies(actor, combat);
    if (threateningEnemies.length > 0 && !actor.conditions.some(c => c.name === 'disengaging')) {
      // Trigger opportunity attacks
      for (const enemy of threateningEnemies) {
        if (enemy.reactions > 0) {
          console.log(`⚔️ Opportunity attack from ${enemy.character.name}!`);
          await this.processAttack(enemy, actor.character.id, null, combat);
          enemy.reactions--;
        }
      }
    }
    
    actor.character.position = position;
    
    return {
      success: true,
      narrative: `${actor.character.name} moves to new position`
    };
  }

  /**
   * Process help action
   */
  private async processHelp(
    helper: CombatParticipant,
    targetId: string,
    combat: CombatRound
  ): Promise<any> {
    const target = combat.participants.find(p => p.character.id === targetId);
    if (!target) return { success: false, narrative: 'Invalid target' };
    
    // Grant advantage on next roll
    target.conditions.push({
      name: 'helped',
      duration: 1,
      effect: (char) => console.log(`${char.name} has advantage from help`)
    });
    
    return {
      success: true,
      narrative: `${helper.character.name} helps ${target.character.name}`
    };
  }

  /**
   * Process hide action
   */
  private async processHide(
    actor: CombatParticipant,
    combat: CombatRound
  ): Promise<any> {
    // Stealth check
    const stealthCheck: RuleCheck = {
      type: 'skill',
      difficulty: 15,
      stat: 'agility',
      modifiers: []
    };
    
    const result = await this.performCheck(actor.character, stealthCheck);
    
    if (result.success) {
      actor.conditions.push({
        name: 'hidden',
        duration: -1, // Until discovered
        effect: (char) => console.log(`${char.name} is hidden`)
      });
      
      return {
        success: true,
        narrative: `${actor.character.name} successfully hides`
      };
    }
    
    return {
      success: false,
      narrative: `${actor.character.name} fails to hide`
    };
  }

  /**
   * End current turn
   */
  private async endTurn(combatId: string): Promise<void> {
    const combat = this.activeCombats.get(combatId);
    if (!combat) return;
    
    const currentParticipant = combat.participants[combat.currentTurn];
    
    // Process end of turn effects
    await this.processEndOfTurnEffects(currentParticipant, combat);
    
    // Move to next turn
    combat.currentTurn++;
    
    // Check for end of round
    if (combat.currentTurn >= combat.participants.length) {
      combat.currentTurn = 0;
      combat.round++;
      
      // Reset actions for all participants
      for (const participant of combat.participants) {
        participant.actions = 1;
        participant.bonusActions = 1;
        participant.reactions = 1;
        participant.movement = 30 + (participant.character.stats.agility - 10);
        
        // Reduce condition durations
        participant.conditions = participant.conditions.filter(c => {
          if (c.duration > 0) {
            c.duration--;
            return c.duration > 0;
          }
          return c.duration === -1; // Permanent until removed
        });
      }
      
      console.log(`📍 Round ${combat.round} begins!`);
    }
    
    // Check for combat end
    const aliveTeams = new Set(
      combat.participants
        .filter(p => p.character.stats.health > 0)
        .map(p => p.character.alignment?.goodEvil > 0 ? 'good' : 'evil')
    );
    
    if (aliveTeams.size <= 1) {
      await this.endCombat(combatId);
    }
  }

  /**
   * Process end of turn effects
   */
  private async processEndOfTurnEffects(
    participant: CombatParticipant,
    combat: CombatRound
  ): Promise<void> {
    // Process conditions
    for (const condition of participant.conditions) {
      condition.effect(participant.character);
      
      // Save against ongoing conditions
      if (condition.saveCheck) {
        const result = await this.performCheck(participant.character, condition.saveCheck);
        if (result.success) {
          participant.conditions = participant.conditions.filter(c => c !== condition);
          console.log(`✅ ${participant.character.name} saves against ${condition.name}`);
        }
      }
    }
    
    // Process concentration
    if (participant.concentration) {
      // Check concentration if damaged
      // Implementation here
    }
  }

  /**
   * End combat
   */
  private async endCombat(combatId: string): Promise<void> {
    const combat = this.activeCombats.get(combatId);
    if (!combat) return;
    
    const survivors = combat.participants.filter(p => p.character.stats.health > 0);
    const defeated = combat.participants.filter(p => p.character.stats.health <= 0);
    
    console.log(`⚔️ Combat ended!`);
    console.log(`Survivors: ${survivors.map(s => s.character.name).join(', ')}`);
    console.log(`Defeated: ${defeated.map(d => d.character.name).join(', ')}`);
    
    // Award experience
    for (const survivor of survivors) {
      const xpGained = defeated.reduce((sum, d) => sum + (d.character.level * 100), 0);
      survivor.character.experience += xpGained / survivors.length;
    }
    
    this.activeCombats.delete(combatId);
  }

  /**
   * Calculate distance between positions
   */
  private calculateDistance(from: any, to: any): number {
    const dx = (to.x || 0) - (from.position?.x || 0);
    const dy = (to.y || 0) - (from.position?.y || 0);
    const dz = (to.z || 0) - (from.position?.z || 0);
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz) * 5; // 5ft squares
  }

  /**
   * Get enemies threatening a character
   */
  private getThreateningEnemies(
    actor: CombatParticipant,
    combat: CombatRound
  ): CombatParticipant[] {
    return combat.participants.filter(p => {
      if (p.character.id === actor.character.id) return false;
      if (p.character.alignment === actor.character.alignment) return false;
      if (p.character.stats.health <= 0) return false;
      
      const distance = this.calculateDistance(actor.character, p.character.position);
      return distance <= 5; // Within melee range
    });
  }

  /**
   * Parse dice formula string (e.g., "2d6+3")
   */
  private parseFormula(formula: string): DiceRoll {
    const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) {
      return { dice: 1, sides: 20, modifier: 0 };
    }
    
    return {
      dice: parseInt(match[1]),
      sides: parseInt(match[2]),
      modifier: match[3] ? parseInt(match[3]) : 0
    };
  }

  /**
   * Handle critical success
   */
  private handleCritical(baseTotal: number): number {
    // Double damage or auto-success with style
    return baseTotal * 2;
  }

  /**
   * Handle critical failure
   */
  private handleFumble(baseTotal: number): number {
    // Automatic failure, possible self-damage
    return 0;
  }

  /**
   * Gather all applicable modifiers
   */
  private async gatherModifiers(
    character: Character,
    check: RuleCheck,
    world?: World
  ): Promise<RuleModifier[]> {
    const modifiers: RuleModifier[] = [...check.modifiers];
    
    // Class bonuses
    if (character.class.archetype === 'rogue' && check.type === 'skill') {
      modifiers.push({
        source: 'expertise',
        value: 2,
        type: 'flat'
      });
    }
    
    // Race bonuses
    if (character.race.id === 'elf' && check.stat === 'agility') {
      modifiers.push({
        source: 'elven grace',
        value: 1,
        type: 'flat'
      });
    }
    
    // Environmental modifiers
    if (world?.genre === 'horror' && check.type === 'save') {
      modifiers.push({
        source: 'horror atmosphere',
        value: -2,
        type: 'flat'
      });
    }
    
    // Condition modifiers
    const conditions = (character as any).conditions || [];
    for (const condition of conditions) {
      if (condition.name === 'blessed' && check.type === 'attack') {
        modifiers.push({
          source: 'blessing',
          value: 0,
          type: 'advantage'
        });
      }
    }
    
    return modifiers;
  }

  /**
   * Generate narrative for check result
   */
  private async generateNarrative(
    character: Character,
    check: RuleCheck,
    success: boolean,
    critical: boolean,
    fumble: boolean
  ): Promise<string> {
    if (critical) {
      return `✨ ${character.name} achieves a LEGENDARY ${check.type} success!`;
    }
    
    if (fumble) {
      return `💥 ${character.name} suffers a CATASTROPHIC ${check.type} failure!`;
    }
    
    if (success) {
      return `✅ ${character.name} succeeds at the ${check.type} check`;
    }
    
    return `❌ ${character.name} fails the ${check.type} check`;
  }

  /**
   * Get active combat by ID
   */
  getCombat(combatId: string): CombatRound | undefined {
    return this.activeCombats.get(combatId);
  }

  /**
   * Get all active combats
   */
  getActiveCombats(): CombatRound[] {
    return Array.from(this.activeCombats.values());
  }
}

// Supporting classes

class AIWeightingSystem {
  async calculateWeight(
    character: Character,
    check: RuleCheck,
    world?: World
  ): Promise<number> {
    let weight = 0;
    
    // Personality-based weighting
    if (character.personality) {
      // Brave characters get bonus on fear saves
      if (check.type === 'save' && character.stats.courage > 0.7) {
        weight += 2;
      }
      
      // Curious characters get bonus on investigation
      if (check.type === 'skill' && character.stats.curiosity > 0.7) {
        weight += 1;
      }
    }
    
    // Alignment-based weighting
    if (character.alignment) {
      // Lawful characters get bonus on discipline checks
      if (character.alignment.lawChaos > 0.5 && check.type === 'save') {
        weight += 1;
      }
    }
    
    // World genre influence
    if (world) {
      switch (world.genre) {
        case 'fantasy':
          if (check.type === 'ability' && check.stat === 'wisdom') {
            weight += 1; // Magic world favors wisdom
          }
          break;
        case 'sci-fi':
          if (check.type === 'skill' && check.stat === 'intelligence') {
            weight += 1; // Tech world favors intelligence
          }
          break;
        case 'horror':
          if (check.type === 'save' && check.stat === 'wisdom') {
            weight -= 2; // Horror world penalizes sanity
          }
          break;
      }
    }
    
    // Dramatic moment detection
    if (character.stats.health < character.stats.maxHealth * 0.2) {
      weight += 3; // Heroes get stronger when desperate
    }
    
    return Math.max(-5, Math.min(5, weight)); // Cap at ±5
  }
}

class ProbabilityEngine {
  calculateOdds(
    roll: DiceRoll,
    targetNumber: number
  ): number {
    // Calculate probability of meeting or exceeding target
    const maxRoll = roll.dice * roll.sides + roll.modifier;
    const minRoll = roll.dice + roll.modifier;
    
    if (targetNumber <= minRoll) return 1.0;
    if (targetNumber > maxRoll) return 0.0;
    
    // Simplified probability calculation
    // In production, this would use proper combinatorics
    const range = maxRoll - minRoll;
    const needed = maxRoll - targetNumber;
    
    return needed / range;
  }
}

class CombatResolver {
  resolveAreaEffect(
    origin: any,
    radius: number,
    effect: (target: Character) => void,
    combat: CombatRound
  ): void {
    for (const participant of combat.participants) {
      const distance = Math.sqrt(
        Math.pow(participant.character.position?.x - origin.x, 2) +
        Math.pow(participant.character.position?.y - origin.y, 2)
      );
      
      if (distance <= radius) {
        effect(participant.character);
      }
    }
  }
}

class SkillSystem {
  private skills: Map<string, SkillDefinition> = new Map();
  
  constructor() {
    this.initializeSkills();
  }
  
  private initializeSkills() {
    // D&D-style skills
    this.skills.set('acrobatics', { stat: 'agility', description: 'Balance and tumbling' });
    this.skills.set('athletics', { stat: 'strength', description: 'Climbing and jumping' });
    this.skills.set('deception', { stat: 'charisma', description: 'Lying and disguise' });
    this.skills.set('history', { stat: 'intelligence', description: 'Knowledge of the past' });
    this.skills.set('insight', { stat: 'wisdom', description: 'Reading people' });
    this.skills.set('intimidation', { stat: 'charisma', description: 'Frightening others' });
    this.skills.set('investigation', { stat: 'intelligence', description: 'Finding clues' });
    this.skills.set('medicine', { stat: 'wisdom', description: 'Healing and diagnosis' });
    this.skills.set('perception', { stat: 'wisdom', description: 'Noticing things' });
    this.skills.set('persuasion', { stat: 'charisma', description: 'Convincing others' });
    this.skills.set('sleight_of_hand', { stat: 'agility', description: 'Pickpocketing' });
    this.skills.set('stealth', { stat: 'agility', description: 'Moving unseen' });
    this.skills.set('survival', { stat: 'wisdom', description: 'Wilderness skills' });
  }
  
  getSkill(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }
}

interface SkillDefinition {
  stat: keyof CharacterStats;
  description: string;
}

class ConditionTracker {
  private conditions: Map<string, StatusCondition> = new Map();
  
  constructor() {
    this.initializeConditions();
  }
  
  private initializeConditions() {
    // D&D-style conditions
    this.conditions.set('blinded', {
      name: 'blinded',
      duration: -1,
      effect: (char) => {
        // Disadvantage on attack rolls
        console.log(`${char.name} is blinded`);
      }
    });
    
    this.conditions.set('charmed', {
      name: 'charmed',
      duration: -1,
      effect: (char) => {
        // Can't attack charmer
        console.log(`${char.name} is charmed`);
      },
      saveCheck: {
        type: 'save',
        difficulty: 15,
        stat: 'wisdom',
        modifiers: []
      }
    });
    
    this.conditions.set('frightened', {
      name: 'frightened',
      duration: -1,
      effect: (char) => {
        // Disadvantage while source of fear is visible
        console.log(`${char.name} is frightened`);
      },
      saveCheck: {
        type: 'save',
        difficulty: 13,
        stat: 'wisdom',
        modifiers: []
      }
    });
    
    this.conditions.set('paralyzed', {
      name: 'paralyzed',
      duration: -1,
      effect: (char) => {
        // Can't move or act
        char.stats.agility = 0;
        console.log(`${char.name} is paralyzed`);
      },
      saveCheck: {
        type: 'save',
        difficulty: 15,
        stat: 'constitution',
        modifiers: []
      }
    });
    
    this.conditions.set('poisoned', {
      name: 'poisoned',
      duration: 10,
      effect: (char) => {
        // Disadvantage on attacks and ability checks
        char.stats.health -= 2; // Ongoing damage
        console.log(`${char.name} takes poison damage`);
      },
      saveCheck: {
        type: 'save',
        difficulty: 12,
        stat: 'constitution',
        modifiers: []
      }
    });
    
    this.conditions.set('stunned', {
      name: 'stunned',
      duration: 1,
      effect: (char) => {
        // Can't move, speak clearly, or act
        console.log(`${char.name} is stunned`);
      }
    });
  }
  
  getCondition(name: string): StatusCondition | undefined {
    return this.conditions.get(name);
  }
}

class CriticalSystem {
  generateCriticalEffect(type: string): string {
    const effects = {
      'attack': [
        'Devastating blow!',
        'Armor piercing strike!',
        'Vital organ hit!',
        'Weapon mastery displayed!'
      ],
      'spell': [
        'Magical surge!',
        'Perfect incantation!',
        'Elemental overload!',
        'Arcane perfection!'
      ],
      'skill': [
        'Flawless execution!',
        'Masterful performance!',
        'Legendary skill!',
        'Unprecedented success!'
      ]
    };
    
    const typeEffects = effects[type as keyof typeof effects] || ['Critical success!'];
    return typeEffects[Math.floor(Math.random() * typeEffects.length)];
  }
  
  generateFumbleEffect(type: string): string {
    const effects = {
      'attack': [
        'Weapon slips!',
        'Hit ally instead!',
        'Weapon damaged!',
        'Fall prone!'
      ],
      'spell': [
        'Magical backfire!',
        'Spell fizzles!',
        'Mana burn!',
        'Wild magic surge!'
      ],
      'skill': [
        'Complete failure!',
        'Made it worse!',
        'Embarrassing mistake!',
        'Catastrophic error!'
      ]
    };
    
    const typeEffects = effects[type as keyof typeof effects] || ['Critical failure!'];
    return typeEffects[Math.floor(Math.random() * typeEffects.length)];
  }
}

// Export singleton instance
export const rpgRulesEngine = new RPGRulesEngine();
