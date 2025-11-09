/**
 * MythaQuest Type Definitions
 * Core types for the AI-driven multiplayer RPG ecosystem
 */

// =====================================================
// WORLD TYPES
// =====================================================

export interface World {
  id: string;
  ownerId: string;
  name: string;
  genre: Genre;
  template: WorldTemplate;
  terrain: TerrainData;
  lore: WorldLore;
  factions: Faction[];
  economy: EconomyTable;
  timeFlow: TimeFlow;
  accessibility: AccessibilitySettings;
  status: 'active' | 'dormant' | 'archived' | 'merging';
  connections: WorldConnection[];
  metadata: WorldMetadata;
  createdAt: number;
  lastEvolved: number;
}

export interface TerrainData {
  biomes: Biome[];
  dimensions: {
    width: number;
    height: number;
    depth?: number; // For 3D worlds
  };
  tiles: TerrainTile[][];
  landmarks: Landmark[];
  resources: ResourceNode[];
  climate: ClimateSystem;
}

export interface WorldLore {
  history: HistoryEvent[];
  mythology: Mythology;
  languages: Language[];
  cultures: Culture[];
  conflicts: Conflict[];
  prophecies: Prophecy[];
  artifacts: LegendaryArtifact[];
}

export interface Faction {
  id: string;
  name: string;
  alignment: Alignment;
  territory: Territory[];
  relations: Map<string, RelationStatus>;
  resources: Resources;
  military: MilitaryStrength;
  culture: FactionCulture;
  aiPersonality: MaskPersonality;
}

export interface EconomyTable {
  currency: Currency[];
  tradeRoutes: TradeRoute[];
  markets: Market[];
  resources: EconomicResource[];
  inflationRate: number;
  taxSystem: TaxSystem;
}

export interface TimeFlow {
  speed: number; // Relative to real time
  currentEpoch: number;
  seasonalCycle: boolean;
  dayNightCycle: boolean;
  eventSchedule: TimedEvent[];
}

// =====================================================
// CHARACTER TYPES
// =====================================================

export interface Character {
  id: string;
  playerId: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  experience: number;
  stats: CharacterStats;
  skills: SkillTree;
  alignment: Alignment;
  personality: AIPersonality;
  inventory: Inventory;
  equipment: Equipment;
  memories: Memory[];
  relationships: Relationship[];
  achievements: Achievement[];
  status: CharacterStatus;
}

export interface CharacterStats {
  // Core stats
  strength: number;
  agility: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  constitution: number;
  
  // Derived stats
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  
  // AI-learned behaviors
  courage: number;
  greed: number;
  empathy: number;
  curiosity: number;
  aggression: number;
}

export interface AIPersonality {
  maskId: string;
  traits: PersonalityTrait[];
  memories: PersonalMemory[];
  preferences: Preference[];
  fears: string[];
  goals: Goal[];
  evolutionStage: number;
  temperament: Temperament;
}

export interface Race {
  id: string;
  name: string;
  description: string;
  baseStats: Partial<CharacterStats>;
  abilities: RacialAbility[];
  weaknesses: string[];
  lore: string;
  homeWorld?: string;
}

export interface CharacterClass {
  id: string;
  name: string;
  archetype: ClassArchetype;
  primaryStat: keyof CharacterStats;
  abilities: ClassAbility[];
  restrictions: Restriction[];
  evolutionPaths: ClassEvolution[];
}

export interface SkillTree {
  nodes: SkillNode[];
  connections: SkillConnection[];
  unlockedNodes: string[];
  skillPoints: number;
  specializations: Specialization[];
}

// =====================================================
// GENRE TYPES
// =====================================================

export type Genre = 
  | 'fantasy'
  | 'sci-fi'
  | 'cyber-noir'
  | 'mythpunk'
  | 'horror'
  | 'comedy'
  | 'realistic-survival'
  | 'steampunk'
  | 'post-apocalyptic'
  | 'cosmic-western'
  | 'hybrid';

export interface GenreMatrix {
  primary: Genre;
  secondary?: Genre;
  physicsLaws: PhysicsRules;
  languageStyle: LanguageStyle;
  rewardLogic: RewardSystem;
  translationLayer: TranslationRules;
}

export interface PhysicsRules {
  gravity: number;
  magicEnabled: boolean;
  techLevel: number; // 0-10 scale
  timeManipulation: boolean;
  dimensionalTravel: boolean;
  deathPermanence: boolean;
}

export interface TranslationRules {
  conversions: ConversionTable[];
  equivalencies: Map<string, string>;
  powerScaling: PowerScale;
}

// =====================================================
// DUNGEON TYPES
// =====================================================

export interface Dungeon {
  id: string;
  worldId: string;
  name: string;
  tier: number;
  layout: DungeonLayout;
  master: DungeonMaster;
  modifiers: EnvironmentModifier[];
  treasures: Treasure[];
  monsters: Monster[];
  traps: Trap[];
  puzzles: Puzzle[];
  audienceMode: boolean;
  liveCommentary: Commentary[];
  deathCount: number;
  completionRate: number;
}

export interface DungeonLayout {
  floors: Floor[];
  connections: FloorConnection[];
  safeZones: SafeZone[];
  bossRooms: BossRoom[];
  secretAreas: SecretArea[];
  proceduralSeed: string;
}

export interface DungeonMaster {
  id: string;
  maskPersonality: MaskPersonality;
  narrationStyle: NarrationStyle;
  difficulty: DifficultySettings;
  adaptivePacing: boolean;
  audienceInfluence: number; // 0-1 scale
}

export interface EnvironmentModifier {
  type: 'gravity-shift' | 'light-decay' | 'mind-fog' | 'time-dilation' | 'reality-warp';
  intensity: number;
  duration?: number;
  area: Area;
  effects: Effect[];
}

// =====================================================
// COMBAT & CONFLICT TYPES
// =====================================================

export interface CombatEngine {
  system: 'turn-based' | 'real-time' | 'hybrid';
  physics: CombatPhysics;
  abilities: AbilitySystem;
  combos: ComboSystem;
  criticals: CriticalSystem;
  elementalInteractions: ElementalMatrix;
}

export interface CrossRealmConflict {
  id: string;
  world1: string;
  world2: string;
  type: 'war' | 'trade' | 'alliance';
  status: 'pending' | 'active' | 'resolved';
  stakes: ConflictStakes;
  participants: Participant[];
  battles: Battle[];
  outcome?: ConflictOutcome;
  arbitration: AIArbitration;
}

export interface AIArbitration {
  conflictingRules: RuleConflict[];
  resolutions: Resolution[];
  mergedPhysics: PhysicsRules;
  loreJustification: string;
}

// =====================================================
// AI MASK TYPES
// =====================================================

export interface MaskPersonality {
  id: string;
  name: string;
  archetype: MaskArchetype;
  traits: {
    heroism: number;
    trickery: number;
    wisdom: number;
    tyranny: number;
    chaos: number;
    order: number;
  };
  evolution: {
    stage: number;
    experience: number;
    reinforcements: Reinforcement[];
  };
  memories: MaskMemory[];
  relationships: MaskRelationship[];
  fusionCompatibility: string[]; // Other mask IDs
}

export type MaskArchetype = 
  | 'hero'
  | 'trickster'
  | 'oracle'
  | 'tyrant'
  | 'sage'
  | 'fool'
  | 'guardian'
  | 'destroyer'
  | 'creator'
  | 'wanderer';

export interface MaskFusion {
  masks: string[];
  resultingPersonality: MaskPersonality;
  instability: number; // 0-1, higher = more unpredictable
  duration?: number;
  legendaryStatus: boolean;
}

// =====================================================
// ECONOMY & PROFITABILITY TYPES
// =====================================================

export interface ProfitabilityMetrics {
  worldCost: number;
  sessionCost: number;
  aiCallCost: number;
  storageCost: number;
  bandwidthCost: number;
  totalCost: number;
  revenue: number;
  margin: number;
  cvi: number; // Customer Value Index
  elasticity: number;
}

export interface TierSystem {
  free: TierConfig;
  creator: TierConfig;
  guild: TierConfig;
  prime: TierConfig;
}

export interface TierConfig {
  name: string;
  price: number;
  features: TierFeatures;
  limits: TierLimits;
  revenueShare: number;
}

export interface TierFeatures {
  worldBuilding: boolean;
  aiDMAccess: boolean;
  privateServers: boolean;
  customAudio: boolean;
  commercialLicense: boolean;
  apiAccess: boolean;
  analyticsAccess: boolean;
}

export interface TierLimits {
  maxWorlds: number;
  maxCharacters: number;
  maxPlayers: number;
  storageGB: number;
  aiCallsPerDay: number;
  bandwidthGB: number;
}

export interface Marketplace {
  worlds: MarketplaceListing[];
  characters: MarketplaceListing[];
  soundtracks: MarketplaceListing[];
  items: MarketplaceListing[];
  revenue: MarketplaceRevenue;
}

export interface MarketplaceListing {
  id: string;
  type: 'world' | 'character' | 'soundtrack' | 'item';
  creatorId: string;
  price: number;
  currency: 'sparks' | 'usd';
  sales: number;
  rating: number;
  reviews: Review[];
}

// =====================================================
// SOCIAL TYPES
// =====================================================

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  members: GuildMember[];
  treasury: Treasury;
  headquarters: WorldLocation;
  reputation: number;
  wars: GuildWar[];
  alliances: Alliance[];
  events: GuildEvent[];
}

export interface Raid {
  id: string;
  dungeonId: string;
  guildId?: string;
  participants: RaidParticipant[];
  startTime: number;
  duration: number;
  status: 'forming' | 'active' | 'completed' | 'failed';
  loot: LootDistribution;
  spectators: Spectator[];
}

export interface Tavern {
  id: string;
  worldId: string;
  name: string;
  owner: string;
  patrons: Patron[];
  conversations: Conversation[];
  questBoard: Quest[];
  atmosphere: TavernAtmosphere;
}

// =====================================================
// UX & INTERFACE TYPES
// =====================================================

export interface ViewMode {
  type: 'grid' | '3d' | 'vr';
  camera: CameraSettings;
  ui: UIConfiguration;
  accessibility: AccessibilitySettings;
}

export interface CameraSettings {
  mode: 'first-person' | 'third-person' | 'isometric' | 'cinematic';
  fov: number;
  distance: number;
  cinematicAI: boolean;
  autoFraming: boolean;
}

export interface AccessibilitySettings {
  colorBlindMode?: 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: number;
  highContrast: boolean;
  screenReader: boolean;
  languageSimplification: boolean;
  motionReduction: boolean;
}

export interface LiveLoreFeed {
  worldId: string;
  events: LoreEvent[];
  updates: WorldUpdate[];
  playerActions: SignificantAction[];
  aiNarration: string[];
}

// =====================================================
// INTEGRATION TYPES
// =====================================================

export interface StoryForgeIntegration {
  questArcs: QuestArc[];
  dialogueTrees: DialogueTree[];
  worldHistory: HistoryGeneration;
  narrativeTone: NarrativeTone;
}

export interface SongForgeIntegration {
  soundtrack: AdaptiveSoundtrack;
  ambientCues: AmbientSound[];
  voiceSynthesis: VoiceConfig;
  emotionalModulation: EmotionMapping;
}

export interface SparkIntegration {
  chatChannels: ChatChannel[];
  voiceRooms: VoiceRoom[];
  notifications: NotificationStream;
  achievements: AchievementSystem;
}

// =====================================================
// TESTING & VALIDATION TYPES
// =====================================================

export interface TestScenario {
  id: string;
  name: string;
  worldCount: number;
  userCount: number;
  duration: number;
  loadPattern: LoadPattern;
  expectedMetrics: ExpectedMetrics;
}

export interface ValidationReport {
  functionalPass: boolean;
  marginAchieved: number;
  elasticity: number;
  uptime: number;
  userSatisfaction: number;
  recommendations: string[];
}

// Supporting type definitions

export interface Biome {
  type: string;
  climate: string;
  flora: string[];
  fauna: string[];
  resources: string[];
}

export interface TerrainTile {
  x: number;
  y: number;
  z?: number;
  type: string;
  elevation: number;
  traversable: boolean;
  resources?: string[];
}

export interface Landmark {
  id: string;
  name: string;
  type: string;
  location: Coordinates;
  significance: string;
  quests?: string[];
}

export interface Coordinates {
  x: number;
  y: number;
  z?: number;
}

export interface Alignment {
  lawChaos: number; // -1 (chaotic) to 1 (lawful)
  goodEvil: number; // -1 (evil) to 1 (good)
}

export interface WorldTemplate {
  id: string;
  name: string;
  description: string;
  baseGenre: Genre;
  defaultBiomes: string[];
  startingFactions: number;
}

export interface WorldMetadata {
  playerCount: number;
  totalPlaytime: number;
  rating: number;
  tags: string[];
  visibility: 'public' | 'private' | 'invite-only';
}

export interface WorldConnection {
  targetWorldId: string;
  type: 'portal' | 'bridge' | 'merge';
  bidirectional: boolean;
  requirements?: string[];
}

// Additional supporting types...
export type ClassArchetype = 'warrior' | 'mage' | 'rogue' | 'healer' | 'ranger' | 'paladin' | 'necromancer' | 'bard';
export type NarrationStyle = 'epic' | 'comedic' | 'dark' | 'mysterious' | 'casual' | 'poetic';
export type RelationStatus = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
export type LoadPattern = 'steady' | 'burst' | 'gradual' | 'spike';

export interface ExpectedMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  margin: number;
}
