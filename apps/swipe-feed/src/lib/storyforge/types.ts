/**
 * StoryForge Type Definitions
 * © 2025 MythaTron - Production-Grade Story Development Engine
 */

// Core Branch Types
export interface StoryBranch {
  id: string;
  parentId: string | null;
  userId: string;
  title: string;
  content: string;
  metadata: BranchMetadata;
  dynamicVariables: DynamicVariables;
  continuityState: ContinuityState;
  children: string[]; // Child branch IDs
  version: number;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  isPublished: boolean;
  collaborators: string[];
  stats: BranchStats;
}

export interface BranchMetadata {
  genre: StoryGenre;
  tone: StoryTone;
  aiMask: string;
  tags: string[];
  language: string;
  contentRating: ContentRating;
  wordCount: number;
  readingTime: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'literary';
  mood: string[];
  themes: string[];
}

export interface DynamicVariables {
  worldState: WorldState;
  characters: Map<string, Character>;
  relationships: Map<string, Relationship>;
  keyDecisions: Decision[];
  unresolvedArcs: StoryArc[];
  locations: Map<string, Location>;
  timeline: TimelineEvent[];
  inventory: Map<string, Item>;
  flags: Map<string, boolean | number | string>;
}

export interface ContinuityState {
  facts: Fact[];
  contradictions: Contradiction[];
  emotionalContext: EmotionalContext;
  narrativeTension: number;
  plotThreads: PlotThread[];
  foreshadowing: Foreshadowing[];
  callbacks: Callback[];
  consistency_score: number;
}

// World Building
export interface WorldState {
  name: string;
  description: string;
  rules: WorldRule[];
  physics: 'realistic' | 'magical' | 'sci-fi' | 'surreal';
  technology_level: number; // 1-10
  magic_level: number; // 0-10
  danger_level: number; // 1-10
  political_system: string;
  economic_system: string;
  cultural_notes: string[];
}

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  personality: PersonalityTraits;
  backstory: string;
  motivations: string[];
  fears: string[];
  relationships: Map<string, RelationshipType>;
  status: 'alive' | 'dead' | 'unknown' | 'transformed';
  location: string;
  inventory: string[];
  skills: Skill[];
  dialogue_style: DialogueStyle;
  character_arc: CharacterArc;
}

export interface Relationship {
  character1Id: string;
  character2Id: string;
  type: RelationshipType;
  strength: number; // -100 to 100
  history: string[];
  tension: number;
  trust: number;
}

export interface Decision {
  id: string;
  branchId: string;
  description: string;
  options: DecisionOption[];
  chosenOption?: string;
  consequences: Consequence[];
  timestamp: number;
  importance: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface StoryArc {
  id: string;
  title: string;
  description: string;
  status: 'setup' | 'rising' | 'climax' | 'falling' | 'resolved';
  startBranchId: string;
  currentBranchId: string;
  expectedResolution?: string;
  tension_curve: number[];
  key_beats: StoryBeat[];
}

// AI Mask System
export interface AIMask {
  id: string;
  name: string;
  personality: MaskPersonality;
  writingStyle: WritingStyle;
  vocabulary: VocabularyProfile;
  narrativePreferences: NarrativePreferences;
  collaborationStyle: CollaborationStyle;
  signature_phrases: string[];
  forbidden_topics: string[];
  expertise_areas: string[];
}

export interface MaskPersonality {
  traits: PersonalityTraits;
  tone: StoryTone[];
  humor_level: number;
  formality: number;
  verbosity: number;
  creativity: number;
  darkness: number;
  optimism: number;
}

export interface WritingStyle {
  sentence_length: 'short' | 'medium' | 'long' | 'varied';
  paragraph_length: 'brief' | 'standard' | 'extended';
  vocabulary_level: 'simple' | 'intermediate' | 'advanced' | 'literary';
  pacing: 'slow' | 'moderate' | 'fast' | 'dynamic';
  description_density: number; // 0-1
  dialogue_ratio: number; // 0-1
  action_ratio: number; // 0-1
  introspection_ratio: number; // 0-1
}

// Collaboration
export interface CollaborationSession {
  id: string;
  branchId: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'completed';
  mode: 'sequential' | 'parallel' | 'voting' | 'freestyle';
  rules: CollaborationRules;
  chat_log: ChatMessage[];
  edit_history: Edit[];
  conflicts: Conflict[];
}

export interface PublicRealm {
  id: string;
  name: string;
  description: string;
  creator: string;
  moderators: string[];
  branches: string[];
  rules: RealmRules;
  lore: LoreDocument[];
  canon: CanonEntry[];
  contributors: Contributor[];
  stats: RealmStats;
}

// Testing & Validation
export interface TestResult {
  id: string;
  timestamp: number;
  module: string;
  test_name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  stack_trace?: string;
  auto_fixed: boolean;
  retry_count: number;
}

export interface ValidationReport {
  branch_id: string;
  continuity_score: number;
  consistency_errors: ConsistencyError[];
  plot_holes: PlotHole[];
  character_inconsistencies: CharacterInconsistency[];
  timeline_conflicts: TimelineConflict[];
  suggestions: Suggestion[];
  overall_quality: number;
}

// Enums
export type StoryGenre = 
  | 'fantasy' | 'sci-fi' | 'mystery' | 'thriller' | 'romance' 
  | 'horror' | 'comedy' | 'drama' | 'action' | 'adventure'
  | 'historical' | 'western' | 'noir' | 'cyberpunk' | 'steampunk'
  | 'urban-fantasy' | 'dystopian' | 'utopian' | 'slice-of-life'
  | 'psychological' | 'philosophical' | 'experimental'
  | 'literary' | 'satire' | 'tragedy';

export type StoryTone = 
  | 'dark' | 'light' | 'serious' | 'humorous' | 'satirical'
  | 'whimsical' | 'gritty' | 'romantic' | 'melancholic' | 'hopeful'
  | 'cynical' | 'mysterious' | 'tense' | 'relaxed' | 'epic'
  | 'intimate' | 'surreal' | 'realistic' | 'fantastical'
  | 'neutral' | 'engaging' | 'lyrical' | 'analytical' | 'sharp'
  | 'wise' | 'contemplative';

export type ContentRating = 
  | 'E' // Everyone
  | 'T' // Teen
  | 'M' // Mature
  | 'R' // Restricted;

export type RelationshipType = 
  | 'family' | 'friend' | 'lover' | 'rival' | 'enemy'
  | 'mentor' | 'student' | 'colleague' | 'stranger' | 'complicated';

// Supporting Types
export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  quirks: string[];
  values: string[];
  flaws: string[];
}

export interface Skill {
  name: string;
  level: number; // 1-10
  experience: number;
  description: string;
}

export interface DialogueStyle {
  formality: 'casual' | 'formal' | 'mixed';
  accent: string;
  catchphrases: string[];
  verbal_tics: string[];
  vocabulary_level: 'simple' | 'average' | 'advanced';
}

export interface CharacterArc {
  start_state: string;
  end_goal: string;
  current_stage: 'introduction' | 'development' | 'crisis' | 'resolution';
  growth_points: GrowthPoint[];
}

export interface GrowthPoint {
  branch_id: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major';
}

export interface Location {
  id: string;
  name: string;
  description: string;
  parent_location?: string;
  sub_locations: string[];
  atmosphere: string;
  danger_level: number;
  accessibility: 'public' | 'restricted' | 'hidden' | 'locked';
  notable_features: string[];
  current_occupants: string[];
}

export interface TimelineEvent {
  id: string;
  branch_id: string;
  timestamp: number;
  description: string;
  participants: string[];
  location: string;
  importance: 'trivial' | 'minor' | 'moderate' | 'major' | 'critical';
  consequences: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  owner?: string;
  properties: Map<string, any>;
  significance: 'mundane' | 'useful' | 'important' | 'critical' | 'legendary';
}

export interface WorldRule {
  id: string;
  description: string;
  type: 'physical' | 'magical' | 'social' | 'economic' | 'political';
  enforcement: 'absolute' | 'strong' | 'moderate' | 'weak' | 'flexible';
}

export interface Fact {
  id: string;
  branch_id: string;
  statement: string;
  established_at: number;
  confidence: number; // 0-1
  references: string[];
}

export interface Contradiction {
  fact1: Fact;
  fact2: Fact;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  resolution?: string;
}

export interface EmotionalContext {
  dominant_emotion: string;
  emotional_trajectory: string[];
  reader_mood: string;
  character_moods: Map<string, string>;
  tension_level: number;
  satisfaction_level: number;
}

export interface PlotThread {
  id: string;
  description: string;
  status: 'introduced' | 'developing' | 'complicated' | 'resolving' | 'resolved';
  priority: number;
  related_characters: string[];
  expected_resolution: string;
}

export interface Foreshadowing {
  id: string;
  hint: string;
  target_event: string;
  subtlety: number; // 0-1
  planted_at: string;
  revealed_at?: string;
}

export interface Callback {
  id: string;
  reference: string;
  original_branch: string;
  callback_branch: string;
  type: 'plot' | 'character' | 'theme' | 'joke' | 'symbol';
}

export interface DecisionOption {
  id: string;
  text: string;
  requirements?: Requirement[];
  consequences: Consequence[];
  probability_weight: number;
}

export interface Requirement {
  type: 'skill' | 'item' | 'relationship' | 'flag' | 'stat';
  target: string;
  operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
  value: any;
}

export interface Consequence {
  type: 'immediate' | 'delayed' | 'permanent';
  description: string;
  effects: Effect[];
  branch_modifications?: BranchModification[];
}

export interface Effect {
  target: 'character' | 'world' | 'relationship' | 'item' | 'flag';
  target_id: string;
  property: string;
  operation: 'set' | 'add' | 'multiply' | 'toggle';
  value: any;
}

export interface BranchModification {
  type: 'add_character' | 'remove_character' | 'change_location' | 'add_item' | 'modify_world';
  details: any;
}

export interface StoryBeat {
  id: string;
  type: 'inciting_incident' | 'rising_action' | 'climax' | 'falling_action' | 'resolution';
  description: string;
  branch_id: string;
  impact: number;
}

export interface VocabularyProfile {
  common_words: string[];
  unique_words: string[];
  forbidden_words: string[];
  word_frequency: Map<string, number>;
  average_word_length: number;
  complexity_score: number;
}

export interface NarrativePreferences {
  preferred_genres: StoryGenre[];
  avoided_genres: StoryGenre[];
  plot_complexity: 'simple' | 'moderate' | 'complex' | 'labyrinthine';
  character_depth: 'shallow' | 'moderate' | 'deep' | 'psychological';
  world_building: 'minimal' | 'moderate' | 'detailed' | 'exhaustive';
  ending_preference: 'happy' | 'bittersweet' | 'tragic' | 'ambiguous' | 'twist';
}

export interface CollaborationStyle {
  mode: 'supportive' | 'challenging' | 'complementary' | 'contrarian';
  interaction_frequency: 'minimal' | 'moderate' | 'frequent' | 'constant';
  feedback_style: 'gentle' | 'constructive' | 'direct' | 'harsh';
  creativity_boost: number; // -1 to 1
}

export interface Participant {
  user_id: string;
  role: 'author' | 'editor' | 'reviewer' | 'viewer';
  permissions: Permission[];
  contribution_count: number;
  last_active: number;
}

export interface Permission {
  action: 'read' | 'write' | 'delete' | 'branch' | 'merge' | 'publish';
  scope: 'own' | 'branch' | 'realm' | 'all';
}

export interface CollaborationRules {
  min_participants: number;
  max_participants: number;
  turn_duration?: number;
  voting_threshold?: number;
  edit_approval_required: boolean;
  branch_approval_required: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'suggestion' | 'vote' | 'system';
}

export interface Edit {
  id: string;
  editor: string;
  branch_id: string;
  timestamp: number;
  before: string;
  after: string;
  reason?: string;
  approved: boolean;
  approved_by?: string[];
}

export interface Conflict {
  id: string;
  type: 'edit' | 'branch' | 'merge' | 'continuity';
  participants: string[];
  description: string;
  resolution?: string;
  resolved: boolean;
}

export interface RealmRules {
  content_guidelines: string[];
  branch_approval_process: 'automatic' | 'moderated' | 'community';
  quality_threshold: number;
  canon_modification: 'locked' | 'proposal' | 'voting';
  contribution_requirements: Requirement[];
}

export interface LoreDocument {
  id: string;
  title: string;
  content: string;
  category: 'history' | 'culture' | 'geography' | 'magic' | 'technology' | 'politics';
  canon_level: 'core' | 'accepted' | 'disputed' | 'apocryphal';
  references: string[];
}

export interface CanonEntry {
  id: string;
  fact: string;
  source_branch: string;
  established_by: string;
  timestamp: number;
  certainty: 'absolute' | 'strong' | 'probable' | 'possible';
}

export interface Contributor {
  user_id: string;
  contribution_count: number;
  quality_score: number;
  specialties: string[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned_at: number;
}

export interface BranchStats {
  views: number;
  likes: number;
  shares: number;
  branches_created: number;
  average_rating: number;
  completion_rate: number;
  reading_time: number;
  engagement_score: number;
}

export interface RealmStats {
  total_branches: number;
  active_contributors: number;
  daily_activity: number;
  quality_score: number;
  popularity_rank: number;
  total_words: number;
  average_branch_quality: number;
}

export interface ConsistencyError {
  type: 'character' | 'timeline' | 'location' | 'fact';
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  suggested_fix?: string;
}

export interface PlotHole {
  description: string;
  affected_branches: string[];
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  suggested_resolution?: string;
}

export interface CharacterInconsistency {
  character_id: string;
  inconsistency: string;
  branches: string[];
  suggested_fix?: string;
}

export interface TimelineConflict {
  event1: TimelineEvent;
  event2: TimelineEvent;
  conflict: string;
  resolution?: string;
}

export interface Suggestion {
  type: 'improvement' | 'fix' | 'enhancement';
  target: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  implementation?: string;
}
