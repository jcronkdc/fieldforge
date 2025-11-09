/**
 * SongForge Type Definitions
 * © 2025 MythaTron - Production-Grade Songwriting Platform with Profitability Intelligence
 */

// Core Song Types
export interface Song {
  id: string;
  userId: string;
  title: string;
  sections: SongSection[];
  metadata: SongMetadata;
  collaborators: string[];
  version: number;
  parentId?: string; // For remixes
  profitTier: ProfitTier;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  isPublished: boolean;
  stats: SongStats;
  profitability: ProfitabilityMetrics;
}

export interface SongSection {
  id: string;
  type: SectionType;
  order: number;
  lyrics: string;
  melody?: MelodyData;
  chords?: ChordProgression;
  duration: number; // in seconds
  rhymeScheme?: string;
  syllableCount: number;
  cadence: CadencePattern;
}

export interface SongMetadata {
  genre: MusicGenre;
  tempo: number; // BPM
  key: MusicalKey;
  timeSignature: string;
  mood: string[];
  themes: string[];
  language: string;
  explicitContent: boolean;
  aiMask?: string;
  toneProfile: ToneProfile;
  complexity: 'simple' | 'moderate' | 'complex' | 'professional';
}

export interface MelodyData {
  notes: Note[];
  scale: string;
  rhythm: RhythmPattern;
  dynamics: DynamicsMap;
  articulation: ArticulationMap;
}

export interface ChordProgression {
  chords: Chord[];
  progression: string; // e.g., "I-V-vi-IV"
  voicing: VoicingType;
  inversions: number[];
}

export interface LyricGenerationOptions {
  theme?: string;
  mood?: string;
  style?: LyricStyle;
  rhymeScheme?: string;
  syllableTarget?: number;
  vocabulary?: 'simple' | 'intermediate' | 'advanced' | 'poetic';
  mask?: AIMask;
  includeMetaphors?: boolean;
  emotionalIntensity?: number; // 0-1
}

export interface MelodyGenerationOptions {
  scale?: string;
  range?: { low: string; high: string };
  rhythmicComplexity?: number; // 0-1
  melodicContour?: 'ascending' | 'descending' | 'arch' | 'wave';
  harmonicRichness?: number; // 0-1
  mask?: AIMask;
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  songId: string;
  participants: Collaborator[];
  status: 'active' | 'paused' | 'completed';
  mode: 'realtime' | 'async' | 'review';
  editHistory: Edit[];
  chatMessages: ChatMessage[];
  aiSuggestions: AISuggestion[];
  createdAt: number;
  lastActivity: number;
}

export interface Collaborator {
  userId: string;
  username: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  permissions: Permission[];
  contributionScore: number;
  joinedAt: number;
  isOnline: boolean;
  cursorPosition?: { section: string; position: number };
}

export interface Remix {
  id: string;
  originalSongId: string;
  remixerId: string;
  title: string;
  changes: RemixChange[];
  lineageDepth: number;
  approval?: 'pending' | 'approved' | 'rejected';
  royaltyPercentage: number;
  stats: RemixStats;
}

// Profitability Types
export interface ProfitabilityMetrics {
  featureCost: number; // Cost to generate/maintain
  pricePoint: number; // What user pays
  grossMargin: number; // (price - cost) / price
  conversionRate: number; // % of users who pay
  elasticityIndex: number; // Price sensitivity
  breakEvenUserCount: number; // Users needed to profit
  ltv: number; // Lifetime value
  cac: number; // Customer acquisition cost
  roi: number; // Return on investment
  marginStability: number; // Variance over time
}

export interface ProfitTier {
  id: 'free' | 'creator' | 'pro' | 'studio';
  name: string;
  price: number; // Monthly
  features: FeatureAccess[];
  limits: TierLimits;
  margin: number;
  userCount: number;
  churnRate: number;
  cvi: number; // Customer Value Index
}

export interface FeatureAccess {
  featureId: string;
  name: string;
  enabled: boolean;
  usageLimit?: number;
  costPerUse: number;
  userValue: number; // Perceived value 0-1
}

export interface TierLimits {
  songsPerMonth: number;
  collaboratorsPerSong: number;
  aiGenerationsPerDay: number;
  storageGB: number;
  exportQuality: 'basic' | 'high' | 'professional' | 'master';
  remixesAllowed: boolean;
  commercialUse: boolean;
}

export interface PricingStrategy {
  basePrice: number;
  elasticityCurve: ElasticityPoint[];
  segmentMultipliers: Map<string, number>;
  promotions: Promotion[];
  dynamicAdjustment: boolean;
  marginTarget: number;
  optimizationInterval: number; // hours
}

export interface CostProfile {
  tokenCost: number; // Per 1K tokens
  storageCost: number; // Per GB/month
  computeCost: number; // Per CPU hour
  bandwidthCost: number; // Per GB transfer
  overheadAllocation: number; // Fixed %
  apiCallCost: Map<string, number>;
}

// AI Mask Integration
export interface SongMask extends AIMask {
  musicalStyle: MusicalStyle;
  lyricPreferences: LyricPreferences;
  melodyPreferences: MelodyPreferences;
  collaborationStyle: 'lead' | 'support' | 'critique' | 'inspire';
}

export interface AIMask {
  id: string;
  name: string;
  personality: MaskPersonality;
  expertise: string[];
  signaturePhrases: string[];
  forbiddenTopics: string[];
}

export interface MaskPersonality {
  creativity: number; // 0-1
  technicality: number; // 0-1
  emotionality: number; // 0-1
  humor: number; // 0-1
  edginess: number; // 0-1
}

export interface MusicalStyle {
  preferredGenres: MusicGenre[];
  rhythmicComplexity: number;
  harmonicRichness: number;
  melodicRange: 'narrow' | 'moderate' | 'wide';
  dynamicVariation: number;
}

export interface LyricPreferences {
  vocabulary: 'simple' | 'intermediate' | 'advanced' | 'poetic';
  metaphorDensity: number;
  emotionalDepth: number;
  narrativeStyle: 'linear' | 'abstract' | 'stream-of-consciousness';
  rhymeComplexity: 'basic' | 'intermediate' | 'complex' | 'internal';
}

export interface MelodyPreferences {
  intervalPreferences: string[];
  rhythmicPatterns: string[];
  phraseLength: 'short' | 'medium' | 'long';
  repetitionLevel: number;
  ornamentationLevel: number;
}

// Dashboard & Analytics
export interface SongforgeStats {
  totalSongs: number;
  activeCollaborations: number;
  remixCount: number;
  totalRevenue: number;
  averageMargin: number;
  userRetention: number;
  popularGenres: GenreStats[];
  peakUsageHours: number[];
  featureUsage: Map<string, number>;
}

export interface UserActivity {
  userId: string;
  songsCreated: number;
  collaborations: number;
  remixes: number;
  aiGenerations: number;
  sparksSpent: number;
  tier: ProfitTier;
  joinDate: number;
  lastActive: number;
  churnRisk: number; // 0-1
}

// Testing & Validation
export interface TestScenario {
  id: string;
  name: string;
  userCount: number;
  tierDistribution: Map<string, number>;
  usagePattern: UsagePattern;
  expectedMargin: number;
  actualMargin?: number;
  passed?: boolean;
}

export interface UsagePattern {
  sessionsPerDay: number;
  songsPerSession: number;
  aiCallsPerSong: number;
  collaborationRate: number;
  remixRate: number;
  exportRate: number;
}

export interface ValidationReport {
  timestamp: number;
  scenarios: TestScenario[];
  averageMargin: number;
  marginStability: number;
  elasticityOptimal: boolean;
  churnRate: number;
  cviScore: number;
  recommendations: string[];
  passed: boolean;
}

// Enums
export type SectionType = 
  | 'intro' | 'verse' | 'chorus' | 'bridge' | 'pre-chorus' 
  | 'post-chorus' | 'outro' | 'instrumental' | 'solo' | 'breakdown';

export type MusicGenre = 
  | 'pop' | 'rock' | 'metal' | 'country' | 'rap' | 'hip-hop'
  | 'edm' | 'ballad' | 'jazz' | 'blues' | 'folk' | 'classical'
  | 'r&b' | 'soul' | 'reggae' | 'punk' | 'indie' | 'electronic'
  | 'ambient' | 'experimental';

export type MusicalKey = 
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'
  | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Em' | 'Fm' | 'F#m' | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bm';

export type LyricStyle = 
  | 'narrative' | 'abstract' | 'conversational' | 'poetic' 
  | 'minimalist' | 'verbose' | 'metaphorical' | 'literal';

export type VoicingType = 
  | 'close' | 'open' | 'drop2' | 'drop3' | 'spread' | 'quartal';

// Supporting Types
export interface Note {
  pitch: string;
  duration: number;
  velocity: number;
  articulation?: string;
}

export interface Chord {
  root: string;
  quality: string;
  extensions?: string[];
  bass?: string;
}

export interface RhythmPattern {
  pattern: string;
  subdivision: number;
  swing?: number;
}

export interface DynamicsMap {
  [measureNumber: number]: 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff';
}

export interface ArticulationMap {
  [noteIndex: number]: 'staccato' | 'legato' | 'accent' | 'tenuto' | 'marcato';
}

export interface CadencePattern {
  type: 'perfect' | 'plagal' | 'half' | 'deceptive';
  strength: number;
}

export interface ToneProfile {
  energy: number; // 0-1
  darkness: number; // 0-1
  complexity: number; // 0-1
  experimental: number; // 0-1
}

export interface Permission {
  action: 'read' | 'write' | 'delete' | 'publish' | 'remix';
  scope: 'own' | 'song' | 'all';
}

export interface Edit {
  id: string;
  userId: string;
  timestamp: number;
  sectionId: string;
  before: string;
  after: string;
  type: 'lyrics' | 'melody' | 'chords' | 'structure';
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'suggestion' | 'critique' | 'approval';
}

export interface AISuggestion {
  id: string;
  type: 'lyrics' | 'melody' | 'structure' | 'arrangement';
  content: string;
  confidence: number;
  mask?: string;
  accepted?: boolean;
}

export interface RemixChange {
  sectionId: string;
  type: 'replace' | 'modify' | 'add' | 'remove';
  original?: string;
  modified: string;
}

export interface RemixStats {
  plays: number;
  likes: number;
  shares: number;
  revenue: number;
}

export interface SongStats {
  plays: number;
  likes: number;
  shares: number;
  remixes: number;
  collaborators: number;
  revenue: number;
  completionRate: number;
}

export interface GenreStats {
  genre: MusicGenre;
  count: number;
  revenue: number;
  averageMargin: number;
}

export interface ElasticityPoint {
  price: number;
  demand: number;
  elasticity: number;
}

export interface Promotion {
  id: string;
  type: 'discount' | 'trial' | 'bundle' | 'referral';
  value: number;
  startDate: number;
  endDate: number;
  conditions: string[];
}
