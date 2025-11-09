/**
 * Lyric + Melody Generation Engine
 * Dual AI layers for semantic and musical generation
 */

import type {
  Song,
  SongSection,
  LyricGenerationOptions,
  MelodyGenerationOptions,
  MelodyData,
  ChordProgression,
  Note,
  RhythmPattern,
  SongMask,
  LyricStyle,
  MusicalKey
} from './types';

export class LyricMelodyEngine {
  private lyricModel: LyricModel;
  private melodyModel: MelodyModel;
  private harmonizer: Harmonizer;
  private masks: Map<string, SongMask> = new Map();

  constructor() {
    this.lyricModel = new LyricModel();
    this.melodyModel = new MelodyModel();
    this.harmonizer = new Harmonizer();
    this.initializeMasks();
  }

  /**
   * Generate lyrics for a section
   */
  async generateLyrics(
    section: SongSection,
    options: LyricGenerationOptions = {}
  ): Promise<string> {
    const mask = options.mask || this.getDefaultMask();
    
    // Build generation context
    const context = {
      sectionType: section.type,
      theme: options.theme || 'universal',
      mood: options.mood || 'neutral',
      style: options.style || 'conversational',
      rhymeScheme: options.rhymeScheme || 'ABAB',
      syllableTarget: options.syllableTarget || 32,
      vocabulary: options.vocabulary || 'intermediate',
      emotionalIntensity: options.emotionalIntensity || 0.5
    };

    // Generate with mask personality
    let lyrics = await this.lyricModel.generate(context, mask);
    
    // Apply rhyme scheme
    if (context.rhymeScheme) {
      lyrics = this.applyRhymeScheme(lyrics, context.rhymeScheme);
    }

    // Add metaphors if requested
    if (options.includeMetaphors) {
      lyrics = this.injectMetaphors(lyrics, mask);
    }

    // Ensure syllable count
    lyrics = this.adjustSyllables(lyrics, context.syllableTarget);

    return lyrics;
  }

  /**
   * Generate melody for lyrics
   */
  async generateMelody(
    lyrics: string,
    key: MusicalKey,
    options: MelodyGenerationOptions = {}
  ): Promise<MelodyData> {
    const mask = options.mask || this.getDefaultMask();
    
    // Analyze lyrics for rhythm
    const rhythmPattern = this.analyzeRhythm(lyrics);
    
    // Generate melodic contour
    const contour = options.melodicContour || this.suggestContour(lyrics);
    
    // Generate notes
    const notes = await this.melodyModel.generate({
      lyrics,
      key,
      scale: options.scale || this.getScaleForKey(key),
      range: options.range || { low: 'C3', high: 'C5' },
      rhythmicComplexity: options.rhythmicComplexity || 0.5,
      contour,
      harmonicRichness: options.harmonicRichness || 0.5
    }, mask);

    // Create dynamics map
    const dynamics = this.generateDynamics(notes, lyrics);
    
    // Add articulation
    const articulation = this.generateArticulation(notes, rhythmPattern);

    return {
      notes,
      scale: options.scale || this.getScaleForKey(key),
      rhythm: rhythmPattern,
      dynamics,
      articulation
    };
  }

  /**
   * Generate chord progression
   */
  async generateChordProgression(
    key: MusicalKey,
    sectionType: string,
    duration: number
  ): Promise<ChordProgression> {
    const progressionTemplates = this.getProgressionTemplates(key, sectionType);
    const template = progressionTemplates[Math.floor(Math.random() * progressionTemplates.length)];
    
    return {
      chords: template.chords,
      progression: template.progression,
      voicing: template.voicing || 'close',
      inversions: template.inversions || template.chords.map(() => 0)
    };
  }

  /**
   * Harmonize melody with chords
   */
  async harmonizeMelody(
    melody: MelodyData,
    key: MusicalKey
  ): Promise<ChordProgression> {
    return this.harmonizer.harmonize(melody, key);
  }

  /**
   * Generate tempo mapping
   */
  generateTempoMap(sections: SongSection[]): Map<number, number> {
    const tempoMap = new Map<number, number>();
    let currentMeasure = 0;

    sections.forEach(section => {
      // Add tempo variations for dynamics
      if (section.type === 'bridge') {
        tempoMap.set(currentMeasure, -5); // Slight slowdown
      } else if (section.type === 'chorus') {
        tempoMap.set(currentMeasure, +3); // Slight speedup
      }
      
      currentMeasure += Math.ceil(section.duration / 4); // 4 beats per measure
    });

    return tempoMap;
  }

  /**
   * Dual-mask co-writing
   */
  async coWrite(
    section: SongSection,
    mask1: SongMask,
    mask2: SongMask,
    mode: 'blend' | 'debate' | 'alternate' = 'blend'
  ): Promise<{ lyrics: string; melody: MelodyData }> {
    let lyrics: string;
    let melody: MelodyData;

    switch (mode) {
      case 'blend':
        // Blend both masks' styles
        lyrics = await this.blendMaskLyrics(section, mask1, mask2);
        melody = await this.blendMaskMelody(lyrics, mask1, mask2);
        break;
        
      case 'debate':
        // Masks provide alternatives
        const lyrics1 = await this.generateLyrics(section, { mask: mask1 });
        const lyrics2 = await this.generateLyrics(section, { mask: mask2 });
        lyrics = this.selectBestLyrics(lyrics1, lyrics2);
        melody = await this.generateMelody(lyrics, 'C', { mask: mask1 });
        break;
        
      case 'alternate':
        // Alternate between masks per line
        lyrics = await this.alternateMaskLyrics(section, mask1, mask2);
        melody = await this.generateMelody(lyrics, 'C', { mask: mask2 });
        break;
    }

    return { lyrics, melody };
  }

  /**
   * Voice synthesis preview
   */
  async synthesizeVoice(
    lyrics: string,
    melody: MelodyData,
    voiceType: 'male' | 'female' | 'child' | 'synthetic' = 'synthetic'
  ): Promise<ArrayBuffer> {
    // In production, integrate with voice synthesis API
    // For now, return mock audio data
    return new ArrayBuffer(44100 * 2 * 10); // 10 seconds of silence
  }

  // Helper methods

  private applyRhymeScheme(lyrics: string, scheme: string): string {
    const lines = lyrics.split('\n');
    const schemePattern = scheme.split('');
    
    // Group lines by rhyme pattern
    const rhymeGroups = new Map<string, string[]>();
    schemePattern.forEach((pattern, index) => {
      if (!rhymeGroups.has(pattern)) {
        rhymeGroups.set(pattern, []);
      }
      if (lines[index]) {
        rhymeGroups.get(pattern)!.push(lines[index]);
      }
    });

    // Ensure rhyming lines actually rhyme
    rhymeGroups.forEach(group => {
      if (group.length > 1) {
        const rhymeSound = this.extractRhymeSound(group[0]);
        group.forEach((line, i) => {
          if (i > 0) {
            group[i] = this.adjustLineToRhyme(line, rhymeSound);
          }
        });
      }
    });

    // Reconstruct lyrics
    const result: string[] = [];
    schemePattern.forEach((pattern, index) => {
      const group = rhymeGroups.get(pattern);
      if (group && group.length > 0) {
        result.push(group.shift()!);
      }
    });

    return result.join('\n');
  }

  private extractRhymeSound(line: string): string {
    const words = line.trim().split(' ');
    const lastWord = words[words.length - 1];
    // Simple extraction (in production, use phonetic analysis)
    return lastWord.slice(-2);
  }

  private adjustLineToRhyme(line: string, rhymeSound: string): string {
    // In production, use NLP to find rhyming word
    // For now, simple append
    return line + ' ' + this.findRhymingWord(rhymeSound);
  }

  private findRhymingWord(sound: string): string {
    const rhymes: Record<string, string[]> = {
      'ay': ['day', 'way', 'say', 'play'],
      'ight': ['night', 'light', 'sight', 'flight'],
      'ove': ['love', 'above', 'dove'],
      'eart': ['heart', 'start', 'part']
    };
    
    const words = rhymes[sound] || ['time', 'rhyme'];
    return words[Math.floor(Math.random() * words.length)];
  }

  private injectMetaphors(lyrics: string, mask: SongMask): string {
    const metaphors = this.getMetaphorsForMask(mask);
    const lines = lyrics.split('\n');
    
    // Inject metaphors at key positions
    const injectionPoints = [0, Math.floor(lines.length / 2), lines.length - 1];
    
    injectionPoints.forEach((point, index) => {
      if (lines[point] && metaphors[index]) {
        lines[point] = metaphors[index] + ', ' + lines[point].toLowerCase();
      }
    });

    return lines.join('\n');
  }

  private getMetaphorsForMask(mask: SongMask): string[] {
    const intensity = mask.lyricPreferences.metaphorDensity;
    
    if (intensity > 0.7) {
      return [
        'Like diamonds in the darkness',
        'Rivers of emotion flowing',
        'Mountains of dreams colliding'
      ];
    } else if (intensity > 0.3) {
      return [
        'Hearts beating together',
        'Time standing still',
        'Words unspoken'
      ];
    } else {
      return ['', '', ''];
    }
  }

  private adjustSyllables(lyrics: string, target: number): string {
    const lines = lyrics.split('\n');
    let currentCount = this.countSyllables(lyrics);
    
    if (Math.abs(currentCount - target) < 5) {
      return lyrics; // Close enough
    }

    if (currentCount < target) {
      // Add descriptive words
      lines.forEach((line, i) => {
        if (currentCount < target) {
          lines[i] = this.expandLine(line);
          currentCount = this.countSyllables(lines.join('\n'));
        }
      });
    } else {
      // Remove filler words
      lines.forEach((line, i) => {
        if (currentCount > target) {
          lines[i] = this.condenseLine(line);
          currentCount = this.countSyllables(lines.join('\n'));
        }
      });
    }

    return lines.join('\n');
  }

  private expandLine(line: string): string {
    const adjectives = ['beautiful', 'endless', 'mysterious', 'shining'];
    const words = line.split(' ');
    const insertPoint = Math.floor(words.length / 2);
    words.splice(insertPoint, 0, adjectives[Math.floor(Math.random() * adjectives.length)]);
    return words.join(' ');
  }

  private condenseLine(line: string): string {
    const fillers = ['very', 'really', 'just', 'quite', 'rather'];
    let condensed = line;
    fillers.forEach(filler => {
      condensed = condensed.replace(new RegExp(`\\b${filler}\\b`, 'g'), '');
    });
    return condensed.replace(/\s+/g, ' ').trim();
  }

  private countSyllables(text: string): number {
    // Simple syllable counting
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    
    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;
      
      const vowelGroups = word.match(/[aeiouy]+/g);
      count += vowelGroups ? vowelGroups.length : 1;
      
      if (word.endsWith('e') && word.length > 2) {
        count--;
      }
    });

    return Math.max(count, 1);
  }

  private analyzeRhythm(lyrics: string): RhythmPattern {
    const syllables = this.countSyllables(lyrics);
    const lines = lyrics.split('\n').length;
    
    return {
      pattern: this.generateRhythmPattern(syllables),
      subdivision: 16, // 16th notes
      swing: 0 // No swing by default
    };
  }

  private generateRhythmPattern(syllables: number): string {
    // Generate rhythm notation
    let pattern = '';
    for (let i = 0; i < syllables; i++) {
      if (i % 4 === 0) {
        pattern += '1'; // Strong beat
      } else if (i % 2 === 0) {
        pattern += 'e'; // Medium beat
      } else {
        pattern += '.'; // Weak beat
      }
    }
    return pattern;
  }

  private suggestContour(lyrics: string): 'ascending' | 'descending' | 'arch' | 'wave' {
    const sentiment = this.analyzeSentiment(lyrics);
    
    if (sentiment > 0.5) return 'ascending';
    if (sentiment < -0.5) return 'descending';
    if (lyrics.includes('?')) return 'arch';
    return 'wave';
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment (in production, use NLP)
    const positive = ['love', 'happy', 'joy', 'beautiful', 'dream'];
    const negative = ['sad', 'pain', 'lost', 'broken', 'cry'];
    
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (positive.includes(word)) score++;
      if (negative.includes(word)) score--;
    });

    return score / words.length;
  }

  private getScaleForKey(key: MusicalKey): string {
    if (key.includes('m')) {
      return 'natural_minor';
    }
    return 'major';
  }

  private generateDynamics(notes: Note[], lyrics: string): any {
    const dynamics: any = {};
    const sentiment = this.analyzeSentiment(lyrics);
    
    // Start dynamics based on sentiment
    dynamics[0] = sentiment > 0 ? 'mf' : 'mp';
    
    // Add crescendo/decrescendo
    const midpoint = Math.floor(notes.length / 2);
    dynamics[midpoint] = sentiment > 0 ? 'f' : 'p';
    
    return dynamics;
  }

  private generateArticulation(notes: Note[], rhythm: RhythmPattern): any {
    const articulation: any = {};
    
    notes.forEach((note, index) => {
      if (rhythm.pattern[index] === '1') {
        articulation[index] = 'accent';
      } else if (note.duration < 0.25) {
        articulation[index] = 'staccato';
      } else if (note.duration > 1) {
        articulation[index] = 'tenuto';
      }
    });

    return articulation;
  }

  private getProgressionTemplates(key: MusicalKey, sectionType: string): any[] {
    // Return common progressions for key and section
    const templates = [
      {
        progression: 'I-V-vi-IV',
        chords: [
          { root: key[0], quality: 'maj' },
          { root: this.getFifth(key), quality: 'maj' },
          { root: this.getSixth(key), quality: 'min' },
          { root: this.getFourth(key), quality: 'maj' }
        ],
        voicing: 'close'
      }
    ];
    
    return templates;
  }

  private getFifth(key: MusicalKey): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(key[0]);
    return notes[(index + 7) % 12];
  }

  private getFourth(key: MusicalKey): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(key[0]);
    return notes[(index + 5) % 12];
  }

  private getSixth(key: MusicalKey): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(key[0]);
    return notes[(index + 9) % 12];
  }

  private async blendMaskLyrics(section: SongSection, mask1: SongMask, mask2: SongMask): Promise<string> {
    const lyrics1 = await this.generateLyrics(section, { mask: mask1 });
    const lyrics2 = await this.generateLyrics(section, { mask: mask2 });
    
    // Blend by alternating lines
    const lines1 = lyrics1.split('\n');
    const lines2 = lyrics2.split('\n');
    const blended: string[] = [];
    
    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      if (i % 2 === 0 && lines1[i]) {
        blended.push(lines1[i]);
      } else if (lines2[i]) {
        blended.push(lines2[i]);
      }
    }
    
    return blended.join('\n');
  }

  private async blendMaskMelody(lyrics: string, mask1: SongMask, mask2: SongMask): Promise<MelodyData> {
    const melody1 = await this.generateMelody(lyrics, 'C', { mask: mask1 });
    const melody2 = await this.generateMelody(lyrics, 'C', { mask: mask2 });
    
    // Average the melodic parameters
    return {
      notes: melody1.notes, // Use first mask's notes
      scale: melody1.scale,
      rhythm: melody1.rhythm,
      dynamics: melody1.dynamics,
      articulation: melody2.articulation // Use second mask's articulation
    };
  }

  private selectBestLyrics(lyrics1: string, lyrics2: string): string {
    // Score based on various factors
    const score1 = this.scoreLyrics(lyrics1);
    const score2 = this.scoreLyrics(lyrics2);
    
    return score1 > score2 ? lyrics1 : lyrics2;
  }

  private scoreLyrics(lyrics: string): number {
    let score = 0;
    
    // Syllable balance
    const syllables = this.countSyllables(lyrics);
    score += (syllables > 20 && syllables < 50) ? 10 : 5;
    
    // Rhyme presence
    const lines = lyrics.split('\n');
    if (lines.length >= 2) {
      const lastWords = lines.map(l => l.split(' ').pop());
      if (lastWords[0]?.slice(-2) === lastWords[1]?.slice(-2)) {
        score += 5;
      }
    }
    
    // Sentiment variety
    const sentiment = this.analyzeSentiment(lyrics);
    score += (Math.abs(sentiment) < 0.5) ? 5 : 3;
    
    return score;
  }

  private async alternateMaskLyrics(section: SongSection, mask1: SongMask, mask2: SongMask): Promise<string> {
    const lines: string[] = [];
    const lineCount = 4; // Default 4 lines per section
    
    for (let i = 0; i < lineCount; i++) {
      const mask = i % 2 === 0 ? mask1 : mask2;
      const line = await this.generateSingleLine(section, mask);
      lines.push(line);
    }
    
    return lines.join('\n');
  }

  private async generateSingleLine(section: SongSection, mask: SongMask): Promise<string> {
    // Generate a single line with mask personality
    const templates = this.getLineTemplates(mask);
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.fillTemplate(template, mask);
  }

  private getLineTemplates(mask: SongMask): string[] {
    if (mask.personality.creativity > 0.7) {
      return [
        'In the [TIME] of [EMOTION], we [ACTION]',
        '[METAPHOR] like [COMPARISON]',
        'Every [NOUN] becomes [TRANSFORMATION]'
      ];
    } else {
      return [
        'I [ACTION] when you [ACTION]',
        'This [NOUN] is [ADJECTIVE]',
        'We [ACTION] together'
      ];
    }
  }

  private fillTemplate(template: string, mask: SongMask): string {
    const replacements: Record<string, string[]> = {
      TIME: ['moment', 'silence', 'chaos', 'dawn'],
      EMOTION: ['wonder', 'sorrow', 'joy', 'fear'],
      ACTION: ['dance', 'sing', 'cry', 'laugh', 'dream'],
      METAPHOR: ['Hearts beating', 'Stars falling', 'Waves crashing'],
      COMPARISON: ['thunder', 'whispers', 'diamonds'],
      NOUN: ['love', 'dream', 'heart', 'soul'],
      TRANSFORMATION: ['light', 'shadow', 'memory', 'legend'],
      ADJECTIVE: ['eternal', 'fleeting', 'powerful', 'gentle']
    };

    let filled = template;
    Object.keys(replacements).forEach(key => {
      const values = replacements[key];
      const value = values[Math.floor(Math.random() * values.length)];
      filled = filled.replace(`[${key}]`, value);
    });

    return filled;
  }

  private initializeMasks() {
    // Initialize default masks
    this.masks.set('default', this.createDefaultMask());
    this.masks.set('poet', this.createPoetMask());
    this.masks.set('popstar', this.createPopstarMask());
    this.masks.set('rocker', this.createRockerMask());
  }

  private createDefaultMask(): SongMask {
    return {
      id: 'default',
      name: 'Default',
      personality: {
        creativity: 0.5,
        technicality: 0.5,
        emotionality: 0.5,
        humor: 0.3,
        edginess: 0.3
      },
      expertise: ['general'],
      signaturePhrases: [],
      forbiddenTopics: [],
      musicalStyle: {
        preferredGenres: ['pop'],
        rhythmicComplexity: 0.5,
        harmonicRichness: 0.5,
        melodicRange: 'moderate',
        dynamicVariation: 0.5
      },
      lyricPreferences: {
        vocabulary: 'intermediate',
        metaphorDensity: 0.5,
        emotionalDepth: 0.5,
        narrativeStyle: 'linear',
        rhymeComplexity: 'intermediate'
      },
      melodyPreferences: {
        intervalPreferences: ['3rd', '5th'],
        rhythmicPatterns: ['4/4'],
        phraseLength: 'medium',
        repetitionLevel: 0.5,
        ornamentationLevel: 0.3
      },
      collaborationStyle: 'support'
    };
  }

  private createPoetMask(): SongMask {
    return {
      ...this.createDefaultMask(),
      id: 'poet',
      name: 'The Poet',
      personality: {
        creativity: 0.9,
        technicality: 0.6,
        emotionality: 0.9,
        humor: 0.2,
        edginess: 0.4
      },
      lyricPreferences: {
        vocabulary: 'poetic',
        metaphorDensity: 0.9,
        emotionalDepth: 0.9,
        narrativeStyle: 'abstract',
        rhymeComplexity: 'complex'
      },
      collaborationStyle: 'inspire'
    };
  }

  private createPopstarMask(): SongMask {
    return {
      ...this.createDefaultMask(),
      id: 'popstar',
      name: 'The Popstar',
      personality: {
        creativity: 0.6,
        technicality: 0.4,
        emotionality: 0.7,
        humor: 0.5,
        edginess: 0.3
      },
      musicalStyle: {
        preferredGenres: ['pop', 'edm'],
        rhythmicComplexity: 0.4,
        harmonicRichness: 0.4,
        melodicRange: 'moderate',
        dynamicVariation: 0.6
      },
      collaborationStyle: 'lead'
    };
  }

  private createRockerMask(): SongMask {
    return {
      ...this.createDefaultMask(),
      id: 'rocker',
      name: 'The Rocker',
      personality: {
        creativity: 0.7,
        technicality: 0.7,
        emotionality: 0.6,
        humor: 0.4,
        edginess: 0.9
      },
      musicalStyle: {
        preferredGenres: ['rock', 'metal'],
        rhythmicComplexity: 0.7,
        harmonicRichness: 0.6,
        melodicRange: 'wide',
        dynamicVariation: 0.8
      },
      collaborationStyle: 'lead'
    };
  }

  private getDefaultMask(): SongMask {
    return this.masks.get('default')!;
  }
}

// Supporting classes

class LyricModel {
  async generate(context: any, mask: SongMask): Promise<string> {
    // In production, call AI API
    // For now, generate based on context
    const lines: string[] = [];
    const lineCount = context.sectionType === 'chorus' ? 4 : 2;
    
    for (let i = 0; i < lineCount; i++) {
      lines.push(this.generateLine(context, mask, i));
    }
    
    return lines.join('\n');
  }

  private generateLine(context: any, mask: SongMask, index: number): string {
    const templates = [
      `In this ${context.mood} ${context.theme}`,
      `We ${this.getAction(mask)} through the ${this.getNoun(mask)}`,
      `Every ${this.getNoun(mask)} feels ${this.getAdjective(mask)}`,
      `${this.getMetaphor(mask)} in the ${this.getTime()}`
    ];
    
    return templates[index % templates.length];
  }

  private getAction(mask: SongMask): string {
    const actions = mask.personality.edginess > 0.5
      ? ['fight', 'scream', 'rage', 'burn']
      : ['walk', 'dream', 'hope', 'sing'];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private getNoun(mask: SongMask): string {
    const nouns = mask.personality.emotionality > 0.5
      ? ['heart', 'soul', 'tears', 'love']
      : ['road', 'sky', 'world', 'time'];
    return nouns[Math.floor(Math.random() * nouns.length)];
  }

  private getAdjective(mask: SongMask): string {
    const adjectives = mask.personality.creativity > 0.5
      ? ['ethereal', 'infinite', 'crystalline', 'iridescent']
      : ['strong', 'real', 'true', 'bright'];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  private getMetaphor(mask: SongMask): string {
    const metaphors = mask.lyricPreferences.metaphorDensity > 0.5
      ? ['Stars colliding', 'Oceans breathing', 'Mountains singing']
      : ['Hearts beating', 'Time passing', 'Life flowing'];
    return metaphors[Math.floor(Math.random() * metaphors.length)];
  }

  private getTime(): string {
    const times = ['night', 'dawn', 'twilight', 'moment'];
    return times[Math.floor(Math.random() * times.length)];
  }
}

class MelodyModel {
  async generate(context: any, mask: SongMask): Promise<Note[]> {
    const notes: Note[] = [];
    const noteCount = context.lyrics.split(' ').length;
    
    for (let i = 0; i < noteCount; i++) {
      notes.push(this.generateNote(context, mask, i));
    }
    
    return notes;
  }

  private generateNote(context: any, mask: SongMask, index: number): Note {
    const scale = this.getScaleNotes(context.key, context.scale);
    const range = this.parseRange(context.range);
    
    // Select pitch based on contour
    const pitch = this.selectPitch(scale, range, context.contour, index);
    
    // Determine duration based on rhythm complexity
    const duration = this.selectDuration(context.rhythmicComplexity);
    
    // Set velocity based on mask personality
    const velocity = Math.floor(64 + mask.personality.emotionality * 63);
    
    return {
      pitch,
      duration,
      velocity
    };
  }

  private getScaleNotes(key: string, scale: string): string[] {
    // Simplified scale generation
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    return notes.map(note => note + '4'); // Middle octave
  }

  private parseRange(range: { low: string; high: string }): { low: number; high: number } {
    // Convert note names to MIDI numbers
    return {
      low: 48, // C3
      high: 72  // C5
    };
  }

  private selectPitch(scale: string[], range: any, contour: string, index: number): string {
    const scaleIndex = Math.floor(Math.random() * scale.length);
    return scale[scaleIndex];
  }

  private selectDuration(complexity: number): number {
    if (complexity > 0.7) {
      return 0.125; // Eighth note
    } else if (complexity > 0.3) {
      return 0.25; // Quarter note
    } else {
      return 0.5; // Half note
    }
  }
}

class Harmonizer {
  harmonize(melody: MelodyData, key: MusicalKey): ChordProgression {
    // Simple harmonization
    const chords = [
      { root: key[0], quality: 'maj' },
      { root: this.getFifth(key), quality: 'maj' },
      { root: this.getSixth(key), quality: 'min' },
      { root: this.getFourth(key), quality: 'maj' }
    ];
    
    return {
      chords,
      progression: 'I-V-vi-IV',
      voicing: 'close',
      inversions: [0, 0, 0, 0]
    };
  }

  private getFifth(key: MusicalKey): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(key[0]);
    return notes[(index + 7) % 12];
  }

  private getFourth(key: MusicalKey): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(key[0]);
    return notes[(index + 5) % 12];
  }

  private getSixth(key: MusicalKey): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const index = notes.indexOf(key[0]);
    return notes[(index + 9) % 12];
  }
}
