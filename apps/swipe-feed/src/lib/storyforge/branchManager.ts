/**
 * StoryForge Branch Manager
 * Handles all branch operations including creation, versioning, merging, and continuity
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  StoryBranch, 
  BranchMetadata, 
  DynamicVariables, 
  ContinuityState,
  ValidationReport,
  BranchModification,
  Decision,
  StoryArc,
  Fact,
  Contradiction,
  PlotThread,
  TimelineEvent,
  Character,
  Location,
  WorldState,
  EmotionalContext
} from './types';

export class BranchManager {
  private branches: Map<string, StoryBranch> = new Map();
  private branchIndex: Map<string, Set<string>> = new Map(); // userId -> branchIds
  private continuityEngine: ContinuityEngine;
  private versionControl: VersionControl;

  constructor() {
    this.continuityEngine = new ContinuityEngine();
    this.versionControl = new VersionControl();
  }

  /**
   * Create a new story branch
   */
  async createBranch(
    userId: string,
    title: string,
    content: string,
    metadata: Partial<BranchMetadata>,
    parentId?: string
  ): Promise<StoryBranch> {
    const branchId = `branch_${uuidv4()}`;
    
    // Inherit from parent if exists
    let dynamicVariables: DynamicVariables;
    let continuityState: ContinuityState;
    
    if (parentId) {
      const parent = this.branches.get(parentId);
      if (!parent) throw new Error(`Parent branch ${parentId} not found`);
      
      // Deep clone parent's state
      dynamicVariables = this.cloneDynamicVariables(parent.dynamicVariables);
      continuityState = this.cloneContinuityState(parent.continuityState);
      
      // Add to parent's children
      parent.children.push(branchId);
    } else {
      // Initialize new story world
      dynamicVariables = this.initializeDynamicVariables();
      continuityState = this.initializeContinuityState();
    }

    // Calculate metadata
    const fullMetadata: BranchMetadata = {
      genre: metadata.genre || 'fantasy',
      tone: metadata.tone || 'neutral',
      aiMask: metadata.aiMask || 'default',
      tags: metadata.tags || [],
      language: metadata.language || 'en',
      contentRating: metadata.contentRating || 'T',
      wordCount: content.split(/\s+/).length,
      readingTime: Math.ceil(content.split(/\s+/).length / 200), // 200 words per minute
      complexity: this.calculateComplexity(content),
      mood: metadata.mood || [],
      themes: metadata.themes || []
    };

    const branch: StoryBranch = {
      id: branchId,
      parentId: parentId || null,
      userId,
      title,
      content,
      metadata: fullMetadata,
      dynamicVariables,
      continuityState,
      children: [],
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: false,
      collaborators: [userId],
      stats: {
        views: 0,
        likes: 0,
        shares: 0,
        branches_created: 0,
        average_rating: 0,
        completion_rate: 0,
        reading_time: fullMetadata.readingTime,
        engagement_score: 0
      }
    };

    // Validate continuity
    if (parentId) {
      const validation = await this.continuityEngine.validateBranch(branch, this.branches.get(parentId)!);
      branch.continuityState.consistency_score = validation.continuity_score;
      
      // Auto-fix critical issues
      if (validation.consistency_errors.filter(e => e.severity === 'major').length > 0) {
        branch.content = await this.continuityEngine.autoFixContent(branch.content, validation);
      }
    }

    // Store branch
    this.branches.set(branchId, branch);
    
    // Update index
    if (!this.branchIndex.has(userId)) {
      this.branchIndex.set(userId, new Set());
    }
    this.branchIndex.get(userId)!.add(branchId);

    // Create version snapshot
    await this.versionControl.createSnapshot(branch);

    return branch;
  }

  /**
   * Update an existing branch
   */
  async updateBranch(
    branchId: string,
    updates: Partial<StoryBranch>,
    userId: string
  ): Promise<StoryBranch> {
    const branch = this.branches.get(branchId);
    if (!branch) throw new Error(`Branch ${branchId} not found`);
    
    // Check permissions
    if (!branch.collaborators.includes(userId)) {
      throw new Error('Unauthorized to update this branch');
    }

    // Create new version
    const oldVersion = branch.version;
    branch.version++;
    
    // Apply updates
    Object.assign(branch, updates, {
      updatedAt: Date.now()
    });

    // Recalculate metadata if content changed
    if (updates.content) {
      branch.metadata.wordCount = updates.content.split(/\s+/).length;
      branch.metadata.readingTime = Math.ceil(branch.metadata.wordCount / 200);
      branch.metadata.complexity = this.calculateComplexity(updates.content);
    }

    // Validate continuity
    if (branch.parentId) {
      const parent = this.branches.get(branch.parentId);
      if (parent) {
        const validation = await this.continuityEngine.validateBranch(branch, parent);
        branch.continuityState.consistency_score = validation.continuity_score;
      }
    }

    // Save version
    await this.versionControl.createSnapshot(branch);

    return branch;
  }

  /**
   * Merge two branches
   */
  async mergeBranches(
    sourceBranchId: string,
    targetBranchId: string,
    userId: string,
    strategy: 'manual' | 'auto' | 'smart' = 'smart'
  ): Promise<StoryBranch> {
    const source = this.branches.get(sourceBranchId);
    const target = this.branches.get(targetBranchId);
    
    if (!source || !target) {
      throw new Error('Source or target branch not found');
    }

    // Check permissions
    if (!target.collaborators.includes(userId)) {
      throw new Error('Unauthorized to merge into target branch');
    }

    let mergedContent: string;
    let mergedVariables: DynamicVariables;

    switch (strategy) {
      case 'manual':
        // Return conflict markers for manual resolution
        mergedContent = this.createConflictMarkers(source.content, target.content);
        mergedVariables = target.dynamicVariables; // Keep target variables
        break;
        
      case 'auto':
        // Simple concatenation
        mergedContent = target.content + '\n\n' + source.content;
        mergedVariables = this.mergeDynamicVariables(source.dynamicVariables, target.dynamicVariables);
        break;
        
      case 'smart':
        // AI-assisted merge
        mergedContent = await this.smartMergeContent(source, target);
        mergedVariables = this.intelligentMergeVariables(source.dynamicVariables, target.dynamicVariables);
        break;
    }

    // Create new branch for merge result
    const mergedBranch = await this.createBranch(
      userId,
      `Merged: ${target.title}`,
      mergedContent,
      target.metadata,
      target.parentId
    );

    mergedBranch.dynamicVariables = mergedVariables;
    
    // Update continuity
    const validation = await this.continuityEngine.validateMerge(source, target, mergedBranch);
    mergedBranch.continuityState.consistency_score = validation.continuity_score;

    return mergedBranch;
  }

  /**
   * Create a branch from a specific version
   */
  async branchFromVersion(
    branchId: string,
    version: number,
    userId: string
  ): Promise<StoryBranch> {
    const snapshot = await this.versionControl.getSnapshot(branchId, version);
    if (!snapshot) {
      throw new Error(`Version ${version} not found for branch ${branchId}`);
    }

    return this.createBranch(
      userId,
      `${snapshot.title} (v${version})`,
      snapshot.content,
      snapshot.metadata,
      snapshot.parentId
    );
  }

  /**
   * Delete a branch (soft delete)
   */
  async deleteBranch(branchId: string, userId: string): Promise<void> {
    const branch = this.branches.get(branchId);
    if (!branch) throw new Error(`Branch ${branchId} not found`);
    
    // Check permissions
    if (branch.userId !== userId) {
      throw new Error('Unauthorized to delete this branch');
    }

    // Don't actually delete, just mark as deleted
    branch.metadata.tags.push('deleted');
    branch.isPublished = false;
    
    // Remove from index
    this.branchIndex.get(userId)?.delete(branchId);
  }

  /**
   * Get branch by ID
   */
  getBranch(branchId: string): StoryBranch | undefined {
    return this.branches.get(branchId);
  }

  /**
   * Get all branches for a user
   */
  getUserBranches(userId: string): StoryBranch[] {
    const branchIds = this.branchIndex.get(userId);
    if (!branchIds) return [];
    
    return Array.from(branchIds)
      .map(id => this.branches.get(id))
      .filter(Boolean) as StoryBranch[];
  }

  /**
   * Search branches
   */
  searchBranches(query: {
    genre?: string;
    tone?: string;
    tags?: string[];
    userId?: string;
    published?: boolean;
  }): StoryBranch[] {
    let results = Array.from(this.branches.values());
    
    if (query.genre) {
      results = results.filter(b => b.metadata.genre === query.genre);
    }
    if (query.tone) {
      results = results.filter(b => b.metadata.tone === query.tone);
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter(b => 
        query.tags!.some(tag => b.metadata.tags.includes(tag))
      );
    }
    if (query.userId) {
      results = results.filter(b => b.userId === query.userId);
    }
    if (query.published !== undefined) {
      results = results.filter(b => b.isPublished === query.published);
    }
    
    return results;
  }

  /**
   * Get branch tree (all descendants)
   */
  getBranchTree(rootBranchId: string): Map<string, StoryBranch> {
    const tree = new Map<string, StoryBranch>();
    const queue = [rootBranchId];
    
    while (queue.length > 0) {
      const branchId = queue.shift()!;
      const branch = this.branches.get(branchId);
      
      if (branch) {
        tree.set(branchId, branch);
        queue.push(...branch.children);
      }
    }
    
    return tree;
  }

  // Helper methods
  private initializeDynamicVariables(): DynamicVariables {
    return {
      worldState: {
        name: 'New World',
        description: 'An undiscovered realm',
        rules: [],
        physics: 'realistic',
        technology_level: 5,
        magic_level: 0,
        danger_level: 3,
        political_system: 'unknown',
        economic_system: 'unknown',
        cultural_notes: []
      },
      characters: new Map(),
      relationships: new Map(),
      keyDecisions: [],
      unresolvedArcs: [],
      locations: new Map(),
      timeline: [],
      inventory: new Map(),
      flags: new Map()
    };
  }

  private initializeContinuityState(): ContinuityState {
    return {
      facts: [],
      contradictions: [],
      emotionalContext: {
        dominant_emotion: 'neutral',
        emotional_trajectory: [],
        reader_mood: 'curious',
        character_moods: new Map(),
        tension_level: 0,
        satisfaction_level: 0
      },
      narrativeTension: 0,
      plotThreads: [],
      foreshadowing: [],
      callbacks: [],
      consistency_score: 100
    };
  }

  private cloneDynamicVariables(vars: DynamicVariables): DynamicVariables {
    return {
      worldState: { ...vars.worldState },
      characters: new Map(vars.characters),
      relationships: new Map(vars.relationships),
      keyDecisions: [...vars.keyDecisions],
      unresolvedArcs: [...vars.unresolvedArcs],
      locations: new Map(vars.locations),
      timeline: [...vars.timeline],
      inventory: new Map(vars.inventory),
      flags: new Map(vars.flags)
    };
  }

  private cloneContinuityState(state: ContinuityState): ContinuityState {
    return {
      facts: [...state.facts],
      contradictions: [...state.contradictions],
      emotionalContext: {
        ...state.emotionalContext,
        character_moods: new Map(state.emotionalContext.character_moods)
      },
      narrativeTension: state.narrativeTension,
      plotThreads: [...state.plotThreads],
      foreshadowing: [...state.foreshadowing],
      callbacks: [...state.callbacks],
      consistency_score: state.consistency_score
    };
  }

  private calculateComplexity(content: string): 'simple' | 'moderate' | 'complex' | 'literary' {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const avgSentenceLength = words.length / sentences.length;
    
    const complexityScore = (avgWordLength * 0.5) + (avgSentenceLength * 0.5);
    
    if (complexityScore < 8) return 'simple';
    if (complexityScore < 12) return 'moderate';
    if (complexityScore < 16) return 'complex';
    return 'literary';
  }

  private createConflictMarkers(source: string, target: string): string {
    return `<<<<<<< TARGET\n${target}\n=======\n${source}\n>>>>>>> SOURCE`;
  }

  private async smartMergeContent(source: StoryBranch, target: StoryBranch): Promise<string> {
    // This would use AI to intelligently merge content
    // For now, simple implementation
    return target.content + '\n\n[Merged Content]\n\n' + source.content;
  }

  private mergeDynamicVariables(source: DynamicVariables, target: DynamicVariables): DynamicVariables {
    const merged = this.cloneDynamicVariables(target);
    
    // Merge characters
    source.characters.forEach((char, id) => {
      if (!merged.characters.has(id)) {
        merged.characters.set(id, char);
      }
    });
    
    // Merge locations
    source.locations.forEach((loc, id) => {
      if (!merged.locations.has(id)) {
        merged.locations.set(id, loc);
      }
    });
    
    // Merge timeline events
    merged.timeline.push(...source.timeline);
    merged.timeline.sort((a, b) => a.timestamp - b.timestamp);
    
    // Merge decisions
    merged.keyDecisions.push(...source.keyDecisions);
    
    return merged;
  }

  private intelligentMergeVariables(source: DynamicVariables, target: DynamicVariables): DynamicVariables {
    const merged = this.mergeDynamicVariables(source, target);
    
    // Resolve conflicts intelligently
    // Check for character status conflicts
    merged.characters.forEach((char, id) => {
      const sourceChar = source.characters.get(id);
      const targetChar = target.characters.get(id);
      
      if (sourceChar && targetChar) {
        // If character died in one branch but not the other, mark as uncertain
        if (sourceChar.status === 'dead' && targetChar.status === 'alive') {
          char.status = 'unknown';
        }
      }
    });
    
    return merged;
  }
}

/**
 * Continuity Engine - Ensures story consistency
 */
class ContinuityEngine {
  async validateBranch(branch: StoryBranch, parent: StoryBranch): Promise<ValidationReport> {
    const errors: any[] = [];
    const plotHoles: any[] = [];
    const characterInconsistencies: any[] = [];
    const timelineConflicts: any[] = [];
    const suggestions: any[] = [];

    // Check character consistency
    branch.dynamicVariables.characters.forEach((char, id) => {
      const parentChar = parent.dynamicVariables.characters.get(id);
      if (parentChar) {
        // Check for impossible status changes
        if (parentChar.status === 'dead' && char.status === 'alive') {
          characterInconsistencies.push({
            character_id: id,
            inconsistency: 'Character resurrection without explanation',
            branches: [parent.id, branch.id],
            suggested_fix: 'Add explanation for resurrection or change status'
          });
        }
      }
    });

    // Check timeline consistency
    const parentLastEvent = parent.dynamicVariables.timeline[parent.dynamicVariables.timeline.length - 1];
    const branchFirstEvent = branch.dynamicVariables.timeline[0];
    
    if (parentLastEvent && branchFirstEvent) {
      if (branchFirstEvent.timestamp < parentLastEvent.timestamp) {
        timelineConflicts.push({
          event1: parentLastEvent,
          event2: branchFirstEvent,
          conflict: 'Timeline goes backwards',
          resolution: 'Adjust timestamps to maintain chronological order'
        });
      }
    }

    // Check fact consistency
    branch.continuityState.facts.forEach(fact => {
      const conflictingFact = parent.continuityState.facts.find(
        pFact => this.factsContradict(fact, pFact)
      );
      
      if (conflictingFact) {
        branch.continuityState.contradictions.push({
          fact1: fact,
          fact2: conflictingFact,
          severity: 'moderate',
          resolution: 'Reconcile facts or explain change'
        });
      }
    });

    // Calculate overall score
    const continuity_score = 100 - 
      (errors.length * 5) - 
      (plotHoles.length * 10) - 
      (characterInconsistencies.length * 7) - 
      (timelineConflicts.length * 8);

    return {
      branch_id: branch.id,
      continuity_score: Math.max(0, continuity_score),
      consistency_errors: errors,
      plot_holes: plotHoles,
      character_inconsistencies: characterInconsistencies,
      timeline_conflicts: timelineConflicts,
      suggestions,
      overall_quality: this.calculateQuality(branch)
    };
  }

  async validateMerge(source: StoryBranch, target: StoryBranch, merged: StoryBranch): Promise<ValidationReport> {
    // Validate merge result against both parents
    const sourceValidation = await this.validateBranch(merged, source);
    const targetValidation = await this.validateBranch(merged, target);
    
    // Combine validations
    return {
      branch_id: merged.id,
      continuity_score: Math.min(sourceValidation.continuity_score, targetValidation.continuity_score),
      consistency_errors: [...sourceValidation.consistency_errors, ...targetValidation.consistency_errors],
      plot_holes: [...sourceValidation.plot_holes, ...targetValidation.plot_holes],
      character_inconsistencies: [...sourceValidation.character_inconsistencies, ...targetValidation.character_inconsistencies],
      timeline_conflicts: [...sourceValidation.timeline_conflicts, ...targetValidation.timeline_conflicts],
      suggestions: [...sourceValidation.suggestions, ...targetValidation.suggestions],
      overall_quality: this.calculateQuality(merged)
    };
  }

  async autoFixContent(content: string, validation: ValidationReport): Promise<string> {
    let fixed = content;
    
    // Apply automatic fixes for critical issues
    validation.consistency_errors.forEach(error => {
      if (error.suggested_fix) {
        // Apply fix (simplified for now)
        fixed = fixed + `\n\n[Auto-fix applied: ${error.suggested_fix}]`;
      }
    });
    
    return fixed;
  }

  private factsContradict(fact1: Fact, fact2: Fact): boolean {
    // Simple contradiction detection
    // In production, this would use NLP
    return fact1.statement.includes('not') && 
           fact2.statement.includes(fact1.statement.replace('not ', ''));
  }

  private calculateQuality(branch: StoryBranch): number {
    let quality = 50; // Base score
    
    // Add points for content
    quality += Math.min(20, branch.metadata.wordCount / 100);
    
    // Add points for continuity
    quality += branch.continuityState.consistency_score * 0.2;
    
    // Add points for character development
    quality += branch.dynamicVariables.characters.size * 2;
    
    // Add points for plot threads
    quality += branch.continuityState.plotThreads.length;
    
    return Math.min(100, quality);
  }
}

/**
 * Version Control System
 */
class VersionControl {
  private snapshots: Map<string, StoryBranch[]> = new Map();

  async createSnapshot(branch: StoryBranch): Promise<void> {
    const branchId = branch.id;
    
    if (!this.snapshots.has(branchId)) {
      this.snapshots.set(branchId, []);
    }
    
    // Deep clone the branch for snapshot
    const snapshot = JSON.parse(JSON.stringify(branch));
    this.snapshots.get(branchId)!.push(snapshot);
    
    // Keep only last 50 versions
    const snapshots = this.snapshots.get(branchId)!;
    if (snapshots.length > 50) {
      snapshots.shift();
    }
  }

  async getSnapshot(branchId: string, version: number): Promise<StoryBranch | null> {
    const snapshots = this.snapshots.get(branchId);
    if (!snapshots) return null;
    
    // Version is 1-indexed
    const index = version - 1;
    if (index < 0 || index >= snapshots.length) return null;
    
    return snapshots[index];
  }

  async getVersionHistory(branchId: string): Promise<number[]> {
    const snapshots = this.snapshots.get(branchId);
    if (!snapshots) return [];
    
    return snapshots.map((_, index) => index + 1);
  }

  async rollback(branchId: string, version: number): Promise<StoryBranch | null> {
    const snapshot = await this.getSnapshot(branchId, version);
    if (!snapshot) return null;
    
    // Create new snapshot of current state before rollback
    const current = this.snapshots.get(branchId)![this.snapshots.get(branchId)!.length - 1];
    await this.createSnapshot(current);
    
    return snapshot;
  }
}
