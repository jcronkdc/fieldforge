/**
 * SongForge Structure Engine
 * Modular song building with pattern logic and genre presets
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Song,
  SongSection,
  SongMetadata,
  SectionType,
  MusicGenre,
  MusicalKey,
  CadencePattern,
  ChordProgression,
  ProfitTier,
  ProfitabilityMetrics
} from './types';

interface GenrePreset {
  genre: MusicGenre;
  typicalStructure: SectionType[];
  defaultTempo: number;
  commonKeys: MusicalKey[];
  chordProgressions: ChordProgression[];
  rhymeSchemes: string[];
}

export class SongStructureEngine {
  private songs: Map<string, Song> = new Map();
  private genrePresets: Map<MusicGenre, GenrePreset> = new Map();
  private versionHistory: Map<string, Song[]> = new Map();

  constructor() {
    this.initializeGenrePresets();
  }

  /**
   * Create a new song with structure
   */
  async createSong(
    userId: string,
    title: string,
    genre: MusicGenre,
    sections?: SongSection[],
    metadata?: Partial<SongMetadata>
  ): Promise<Song> {
    const songId = `song_${uuidv4()}`;
    const preset = this.genrePresets.get(genre);
    
    // Build default structure if not provided
    if (!sections) {
      sections = this.buildDefaultStructure(genre);
    }

    // Calculate initial profitability
    const profitability = this.calculateProfitability(sections.length, genre);

    const song: Song = {
      id: songId,
      userId,
      title,
      sections,
      metadata: {
        genre,
        tempo: metadata?.tempo || preset?.defaultTempo || 120,
        key: metadata?.key || preset?.commonKeys[0] || 'C',
        timeSignature: metadata?.timeSignature || '4/4',
        mood: metadata?.mood || [],
        themes: metadata?.themes || [],
        language: metadata?.language || 'en',
        explicitContent: metadata?.explicitContent || false,
        aiMask: metadata?.aiMask,
        toneProfile: metadata?.toneProfile || {
          energy: 0.5,
          darkness: 0.3,
          complexity: 0.5,
          experimental: 0.2
        },
        complexity: this.calculateComplexity(sections)
      },
      collaborators: [userId],
      version: 1,
      parentId: undefined,
      profitTier: this.determineProfitTier(profitability),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: false,
      stats: {
        plays: 0,
        likes: 0,
        shares: 0,
        remixes: 0,
        collaborators: 1,
        revenue: 0,
        completionRate: 0
      },
      profitability
    };

    // Store song
    this.songs.set(songId, song);
    
    // Initialize version history
    this.versionHistory.set(songId, [song]);

    return song;
  }

  /**
   * Update song structure
   */
  async updateSongStructure(
    songId: string,
    sections: SongSection[],
    userId: string
  ): Promise<Song> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);
    
    // Check permissions
    if (!song.collaborators.includes(userId)) {
      throw new Error('Unauthorized to update this song');
    }

    // Create new version
    const updatedSong: Song = {
      ...song,
      sections,
      version: song.version + 1,
      updatedAt: Date.now(),
      metadata: {
        ...song.metadata,
        complexity: this.calculateComplexity(sections)
      },
      profitability: this.calculateProfitability(sections.length, song.metadata.genre)
    };

    // Update profit tier if needed
    updatedSong.profitTier = this.determineProfitTier(updatedSong.profitability);

    // Store updated song
    this.songs.set(songId, updatedSong);
    
    // Add to version history
    const history = this.versionHistory.get(songId) || [];
    history.push(updatedSong);
    this.versionHistory.set(songId, history);

    return updatedSong;
  }

  /**
   * Add section to song
   */
  async addSection(
    songId: string,
    sectionType: SectionType,
    position?: number
  ): Promise<SongSection> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);

    const newSection: SongSection = {
      id: `section_${uuidv4()}`,
      type: sectionType,
      order: position ?? song.sections.length,
      lyrics: '',
      duration: this.getDefaultDuration(sectionType),
      syllableCount: 0,
      cadence: this.getDefaultCadence(sectionType)
    };

    // Insert section at position
    const sections = [...song.sections];
    if (position !== undefined && position < sections.length) {
      sections.splice(position, 0, newSection);
      // Reorder subsequent sections
      for (let i = position + 1; i < sections.length; i++) {
        sections[i].order = i;
      }
    } else {
      sections.push(newSection);
    }

    // Update song
    await this.updateSongStructure(songId, sections, song.userId);

    return newSection;
  }

  /**
   * Remove section from song
   */
  async removeSection(songId: string, sectionId: string): Promise<void> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);

    const sections = song.sections.filter(s => s.id !== sectionId);
    
    // Reorder remaining sections
    sections.forEach((section, index) => {
      section.order = index;
    });

    await this.updateSongStructure(songId, sections, song.userId);
  }

  /**
   * Reorder sections
   */
  async reorderSections(
    songId: string,
    sectionIds: string[]
  ): Promise<Song> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);

    const sectionMap = new Map(song.sections.map(s => [s.id, s]));
    const reorderedSections: SongSection[] = [];

    sectionIds.forEach((id, index) => {
      const section = sectionMap.get(id);
      if (section) {
        section.order = index;
        reorderedSections.push(section);
      }
    });

    return this.updateSongStructure(songId, reorderedSections, song.userId);
  }

  /**
   * Apply genre preset
   */
  async applyGenrePreset(songId: string, genre: MusicGenre): Promise<Song> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);

    const preset = this.genrePresets.get(genre);
    if (!preset) throw new Error(`No preset for genre ${genre}`);

    // Build new structure based on preset
    const sections = this.buildDefaultStructure(genre);

    // Update metadata
    const updatedSong = await this.updateSongStructure(songId, sections, song.userId);
    updatedSong.metadata.genre = genre;
    updatedSong.metadata.tempo = preset.defaultTempo;
    updatedSong.metadata.key = preset.commonKeys[0];

    return updatedSong;
  }

  /**
   * Analyze rhyme scheme
   */
  analyzeRhymeScheme(lyrics: string): string {
    const lines = lyrics.split('\n').filter(l => l.trim());
    if (lines.length === 0) return '';

    const endWords = lines.map(line => {
      const words = line.trim().split(' ');
      return words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    });

    // Simple rhyme detection (in production, use phonetic analysis)
    const rhymeMap = new Map<string, string>();
    let currentLabel = 'A';
    let scheme = '';

    endWords.forEach(word => {
      let found = false;
      
      // Check if word rhymes with any previous
      rhymeMap.forEach((label, prevWord) => {
        if (this.doWordsRhyme(word, prevWord)) {
          scheme += label;
          found = true;
        }
      });

      if (!found) {
        scheme += currentLabel;
        rhymeMap.set(word, currentLabel);
        currentLabel = String.fromCharCode(currentLabel.charCodeAt(0) + 1);
      }
    });

    return scheme;
  }

  /**
   * Calculate syllable count
   */
  calculateSyllables(text: string): number {
    // Simple syllable counting (in production, use NLP library)
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;
      
      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      count += vowelGroups ? vowelGroups.length : 1;
      
      // Adjust for silent e
      if (word.endsWith('e') && word.length > 2) {
        count--;
      }
    });

    return Math.max(count, 1);
  }

  /**
   * Analyze cadence balance
   */
  analyzeCadence(sections: SongSection[]): number {
    // Calculate balance score 0-1
    let totalStrength = 0;
    let weightedBalance = 0;

    sections.forEach((section, index) => {
      const weight = 1 / (index + 1); // Earlier sections have more weight
      totalStrength += section.cadence.strength * weight;
      weightedBalance += weight;
    });

    return totalStrength / weightedBalance;
  }

  /**
   * Version control operations
   */
  async saveVersion(songId: string, message?: string): Promise<number> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);

    const history = this.versionHistory.get(songId) || [];
    const version = {
      ...song,
      version: history.length + 1,
      versionMessage: message
    };

    history.push(version);
    this.versionHistory.set(songId, history);

    return version.version;
  }

  async rollbackToVersion(songId: string, version: number): Promise<Song> {
    const history = this.versionHistory.get(songId);
    if (!history) throw new Error(`No version history for song ${songId}`);

    const targetVersion = history.find(v => v.version === version);
    if (!targetVersion) throw new Error(`Version ${version} not found`);

    // Restore version
    const restoredSong = {
      ...targetVersion,
      version: history.length + 1,
      updatedAt: Date.now()
    };

    this.songs.set(songId, restoredSong);
    history.push(restoredSong);

    return restoredSong;
  }

  async createBranch(songId: string, branchName: string): Promise<Song> {
    const song = this.songs.get(songId);
    if (!song) throw new Error(`Song ${songId} not found`);

    const branchedSong = await this.createSong(
      song.userId,
      `${song.title} (${branchName})`,
      song.metadata.genre,
      [...song.sections],
      song.metadata
    );

    branchedSong.parentId = songId;
    return branchedSong;
  }

  // Helper methods

  private buildDefaultStructure(genre: MusicGenre): SongSection[] {
    const preset = this.genrePresets.get(genre);
    if (!preset) return this.buildGenericStructure();

    return preset.typicalStructure.map((type, index) => ({
      id: `section_${uuidv4()}`,
      type,
      order: index,
      lyrics: '',
      duration: this.getDefaultDuration(type),
      syllableCount: 0,
      cadence: this.getDefaultCadence(type)
    }));
  }

  private buildGenericStructure(): SongSection[] {
    const structure: SectionType[] = [
      'intro', 'verse', 'chorus', 'verse', 'chorus', 
      'bridge', 'chorus', 'outro'
    ];

    return structure.map((type, index) => ({
      id: `section_${uuidv4()}`,
      type,
      order: index,
      lyrics: '',
      duration: this.getDefaultDuration(type),
      syllableCount: 0,
      cadence: this.getDefaultCadence(type)
    }));
  }

  private getDefaultDuration(type: SectionType): number {
    const durations: Record<SectionType, number> = {
      'intro': 8,
      'verse': 16,
      'chorus': 16,
      'bridge': 8,
      'pre-chorus': 8,
      'post-chorus': 8,
      'outro': 8,
      'instrumental': 16,
      'solo': 16,
      'breakdown': 8
    };
    return durations[type] || 8;
  }

  private getDefaultCadence(type: SectionType): CadencePattern {
    const cadences: Record<SectionType, CadencePattern> = {
      'chorus': { type: 'perfect', strength: 1.0 },
      'verse': { type: 'half', strength: 0.5 },
      'bridge': { type: 'deceptive', strength: 0.7 },
      'outro': { type: 'perfect', strength: 1.0 },
      'intro': { type: 'half', strength: 0.3 },
      'pre-chorus': { type: 'half', strength: 0.6 },
      'post-chorus': { type: 'plagal', strength: 0.8 },
      'instrumental': { type: 'perfect', strength: 0.5 },
      'solo': { type: 'half', strength: 0.6 },
      'breakdown': { type: 'deceptive', strength: 0.8 }
    };
    return cadences[type] || { type: 'half', strength: 0.5 };
  }

  private calculateComplexity(sections: SongSection[]): 'simple' | 'moderate' | 'complex' | 'professional' {
    const uniqueTypes = new Set(sections.map(s => s.type)).size;
    const totalSections = sections.length;
    const avgSyllables = sections.reduce((sum, s) => sum + s.syllableCount, 0) / sections.length;

    const score = (uniqueTypes * 0.3) + (totalSections * 0.2) + (avgSyllables * 0.01);

    if (score < 2) return 'simple';
    if (score < 4) return 'moderate';
    if (score < 6) return 'complex';
    return 'professional';
  }

  private calculateProfitability(sectionCount: number, genre: MusicGenre): ProfitabilityMetrics {
    // Base cost calculation
    const baseCost = 0.05; // Base cost per section
    const genreMultiplier = this.getGenreMultiplier(genre);
    const featureCost = baseCost * sectionCount * genreMultiplier;

    // Dynamic pricing
    const pricePoint = this.calculateDynamicPrice(featureCost);
    const grossMargin = (pricePoint - featureCost) / pricePoint;

    return {
      featureCost,
      pricePoint,
      grossMargin,
      conversionRate: 0.15, // 15% baseline
      elasticityIndex: 1.0,
      breakEvenUserCount: Math.ceil(100 / grossMargin),
      ltv: pricePoint * 12, // Annual value
      cac: pricePoint * 0.3, // 30% CAC
      roi: ((pricePoint - featureCost) / featureCost) * 100,
      marginStability: 0.95 // 95% stable
    };
  }

  private calculateDynamicPrice(cost: number): number {
    const targetMargin = 0.65; // 65% target
    return cost / (1 - targetMargin);
  }

  private getGenreMultiplier(genre: MusicGenre): number {
    const multipliers: Partial<Record<MusicGenre, number>> = {
      'pop': 1.0,
      'rock': 1.1,
      'metal': 1.3,
      'classical': 1.5,
      'jazz': 1.4,
      'edm': 1.2,
      'experimental': 1.6
    };
    return multipliers[genre] || 1.0;
  }

  private determineProfitTier(profitability: ProfitabilityMetrics): ProfitTier {
    if (profitability.grossMargin < 0.4) {
      return {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [],
        limits: {
          songsPerMonth: 3,
          collaboratorsPerSong: 1,
          aiGenerationsPerDay: 5,
          storageGB: 0.5,
          exportQuality: 'basic',
          remixesAllowed: false,
          commercialUse: false
        },
        margin: 0,
        userCount: 0,
        churnRate: 0.3,
        cvi: 0.5
      };
    }

    if (profitability.grossMargin < 0.6) {
      return {
        id: 'creator',
        name: 'Creator',
        price: 9.99,
        features: [],
        limits: {
          songsPerMonth: 10,
          collaboratorsPerSong: 3,
          aiGenerationsPerDay: 20,
          storageGB: 5,
          exportQuality: 'high',
          remixesAllowed: true,
          commercialUse: false
        },
        margin: profitability.grossMargin,
        userCount: 0,
        churnRate: 0.15,
        cvi: 0.7
      };
    }

    if (profitability.grossMargin < 0.75) {
      return {
        id: 'pro',
        name: 'Pro',
        price: 29.99,
        features: [],
        limits: {
          songsPerMonth: 50,
          collaboratorsPerSong: 10,
          aiGenerationsPerDay: 100,
          storageGB: 50,
          exportQuality: 'professional',
          remixesAllowed: true,
          commercialUse: true
        },
        margin: profitability.grossMargin,
        userCount: 0,
        churnRate: 0.08,
        cvi: 0.85
      };
    }

    return {
      id: 'studio',
      name: 'Studio',
      price: 99.99,
      features: [],
      limits: {
        songsPerMonth: -1, // Unlimited
        collaboratorsPerSong: -1,
        aiGenerationsPerDay: -1,
        storageGB: 500,
        exportQuality: 'master',
        remixesAllowed: true,
        commercialUse: true
      },
      margin: profitability.grossMargin,
      userCount: 0,
      churnRate: 0.05,
      cvi: 0.95
    };
  }

  private doWordsRhyme(word1: string, word2: string): boolean {
    // Simple rhyme check (in production, use phonetic library)
    if (word1.length < 2 || word2.length < 2) return false;
    
    const ending1 = word1.slice(-2);
    const ending2 = word2.slice(-2);
    
    return ending1 === ending2;
  }

  private initializeGenrePresets() {
    // Pop preset
    this.genrePresets.set('pop', {
      genre: 'pop',
      typicalStructure: ['intro', 'verse', 'pre-chorus', 'chorus', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus', 'outro'],
      defaultTempo: 120,
      commonKeys: ['C', 'G', 'D', 'A'],
      chordProgressions: [
        {
          chords: [
            { root: 'C', quality: 'maj' },
            { root: 'G', quality: 'maj' },
            { root: 'Am', quality: 'min' },
            { root: 'F', quality: 'maj' }
          ],
          progression: 'I-V-vi-IV',
          voicing: 'close',
          inversions: [0, 0, 0, 0]
        }
      ],
      rhymeSchemes: ['ABAB', 'AABB', 'ABCB']
    });

    // Rock preset
    this.genrePresets.set('rock', {
      genre: 'rock',
      typicalStructure: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'solo', 'bridge', 'chorus', 'outro'],
      defaultTempo: 140,
      commonKeys: ['E', 'A', 'D', 'G'],
      chordProgressions: [
        {
          chords: [
            { root: 'E', quality: 'maj' },
            { root: 'A', quality: 'maj' },
            { root: 'B', quality: 'maj' }
          ],
          progression: 'I-IV-V',
          voicing: 'open',
          inversions: [0, 0, 0]
        }
      ],
      rhymeSchemes: ['ABAB', 'AAAA']
    });

    // Add more genre presets...
  }

  // Public getters
  getSong(songId: string): Song | undefined {
    return this.songs.get(songId);
  }

  getUserSongs(userId: string): Song[] {
    return Array.from(this.songs.values()).filter(s => s.userId === userId);
  }

  getVersionHistory(songId: string): Song[] {
    return this.versionHistory.get(songId) || [];
  }
}
