/**
 * StoryForge API Layer
 * REST and GraphQL endpoints for story management
 */

import { dataStore } from './dataStore';
import type { 
  StoryBranch, 
  CollaborationSession, 
  PublicRealm,
  ValidationReport 
} from './types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;

// REST API Client
export class StoryForgeAPI {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers
    };

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });
  }

  // Branch endpoints
  async createBranch(branch: Partial<StoryBranch>): Promise<StoryBranch> {
    const response = await this.fetchWithAuth('/api/branches', {
      method: 'POST',
      body: JSON.stringify(branch)
    });

    if (!response.ok) {
      throw new Error(`Failed to create branch: ${response.statusText}`);
    }

    const created = await response.json();
    
    // Save to local store
    await dataStore.saveBranch(created);
    
    return created;
  }

  async updateBranch(branchId: string, updates: Partial<StoryBranch>): Promise<StoryBranch> {
    const response = await this.fetchWithAuth(`/api/branches/${branchId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update branch: ${response.statusText}`);
    }

    const updated = await response.json();
    
    // Update local store
    await dataStore.updateBranch(branchId, updated);
    
    return updated;
  }

  async getBranch(branchId: string): Promise<StoryBranch> {
    // Try local first
    const cached = await dataStore.getBranch(branchId);
    if (cached) return cached;

    const response = await this.fetchWithAuth(`/api/branches/${branchId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get branch: ${response.statusText}`);
    }

    const branch = await response.json();
    
    // Cache locally
    await dataStore.saveBranch(branch);
    
    return branch;
  }

  async deleteBranch(branchId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/branches/${branchId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.statusText}`);
    }

    // Remove from local store
    await dataStore.deleteBranch(branchId);
  }

  async searchBranches(query: any): Promise<StoryBranch[]> {
    const params = new URLSearchParams(query);
    const response = await this.fetchWithAuth(`/api/branches?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search branches: ${response.statusText}`);
    }

    return response.json();
  }

  async mergeBranches(sourceId: string, targetId: string, strategy: string): Promise<StoryBranch> {
    const response = await this.fetchWithAuth('/api/branches/merge', {
      method: 'POST',
      body: JSON.stringify({ sourceId, targetId, strategy })
    });

    if (!response.ok) {
      throw new Error(`Failed to merge branches: ${response.statusText}`);
    }

    return response.json();
  }

  async validateBranch(branchId: string): Promise<ValidationReport> {
    const response = await this.fetchWithAuth(`/api/branches/${branchId}/validate`);
    
    if (!response.ok) {
      throw new Error(`Failed to validate branch: ${response.statusText}`);
    }

    return response.json();
  }

  async publishBranch(branchId: string, options: any): Promise<void> {
    const response = await this.fetchWithAuth(`/api/branches/${branchId}/publish`, {
      method: 'POST',
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`Failed to publish branch: ${response.statusText}`);
    }
  }

  // AI Generation endpoints
  async generateNarrative(context: any, options: any): Promise<string> {
    const response = await this.fetchWithAuth('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ context, options })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate narrative: ${response.statusText}`);
    }

    const result = await response.json();
    return result.content;
  }

  async continueStory(branchId: string, direction: string, options: any): Promise<string> {
    const response = await this.fetchWithAuth(`/api/ai/continue/${branchId}`, {
      method: 'POST',
      body: JSON.stringify({ direction, options })
    });

    if (!response.ok) {
      throw new Error(`Failed to continue story: ${response.statusText}`);
    }

    const result = await response.json();
    return result.content;
  }

  // Collaboration endpoints
  async createSession(branchId: string, options: any): Promise<CollaborationSession> {
    const response = await this.fetchWithAuth('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ branchId, ...options })
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const session = await response.json();
    
    // Save locally
    await dataStore.saveSession(session);
    
    return session;
  }

  async joinSession(sessionId: string): Promise<CollaborationSession> {
    const response = await this.fetchWithAuth(`/api/sessions/${sessionId}/join`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to join session: ${response.statusText}`);
    }

    return response.json();
  }

  async leaveSession(sessionId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/sessions/${sessionId}/leave`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to leave session: ${response.statusText}`);
    }
  }

  // Realm endpoints
  async createRealm(realm: Partial<PublicRealm>): Promise<PublicRealm> {
    const response = await this.fetchWithAuth('/api/realms', {
      method: 'POST',
      body: JSON.stringify(realm)
    });

    if (!response.ok) {
      throw new Error(`Failed to create realm: ${response.statusText}`);
    }

    const created = await response.json();
    
    // Save locally
    await dataStore.saveRealm(created);
    
    return created;
  }

  async joinRealm(realmId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/realms/${realmId}/join`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to join realm: ${response.statusText}`);
    }
  }

  async getPopularRealms(): Promise<PublicRealm[]> {
    // Try local first
    const cached = await dataStore.getCachedData('popular_realms');
    if (cached) return cached;

    const response = await this.fetchWithAuth('/api/realms/popular');
    
    if (!response.ok) {
      throw new Error(`Failed to get popular realms: ${response.statusText}`);
    }

    const realms = await response.json();
    
    // Cache for 5 minutes
    await dataStore.cacheData('popular_realms', realms, 300000);
    
    return realms;
  }

  // Export/Import
  async exportUserData(): Promise<string> {
    const response = await this.fetchWithAuth('/api/export');
    
    if (!response.ok) {
      throw new Error(`Failed to export data: ${response.statusText}`);
    }

    return response.text();
  }

  async importUserData(data: string): Promise<void> {
    const response = await this.fetchWithAuth('/api/import', {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to import data: ${response.statusText}`);
    }
  }
}

// GraphQL Client
export class StoryForgeGraphQL {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async query(query: string, variables?: any): Promise<any> {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`GraphQL query failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  // Common queries
  async getBranchTree(rootId: string): Promise<any> {
    const query = `
      query GetBranchTree($rootId: ID!) {
        branch(id: $rootId) {
          id
          title
          content
          metadata {
            genre
            tone
            wordCount
          }
          children {
            id
            title
            children {
              id
              title
            }
          }
        }
      }
    `;

    return this.query(query, { rootId });
  }

  async getUserStats(userId: string): Promise<any> {
    const query = `
      query GetUserStats($userId: ID!) {
        user(id: $userId) {
          id
          stats {
            totalBranches
            totalWords
            totalReadingTime
            averageQuality
            genreDistribution {
              genre
              count
            }
          }
        }
      }
    `;

    return this.query(query, { userId });
  }

  async searchStories(searchQuery: string, filters: any): Promise<any> {
    const query = `
      query SearchStories($query: String!, $filters: SearchFilters) {
        searchStories(query: $query, filters: $filters) {
          results {
            id
            title
            excerpt
            author {
              id
              name
            }
            metadata {
              genre
              wordCount
              rating
            }
          }
          totalCount
          hasMore
        }
      }
    `;

    return this.query(query, { query: searchQuery, filters });
  }

  // Subscriptions (WebSocket)
  subscribeToSession(sessionId: string, onMessage: (msg: any) => void): () => void {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/sessions/${sessionId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  }
}

// Mock implementations for development
class MockStoryForgeAPI extends StoryForgeAPI {
  async createBranch(branch: Partial<StoryBranch>): Promise<StoryBranch> {
    const created = {
      ...branch,
      id: `branch_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as StoryBranch;
    
    await dataStore.saveBranch(created);
    return created;
  }

  async generateNarrative(context: any, options: any): Promise<string> {
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `Once upon a time in a ${options.genre || 'mysterious'} world, where ${options.tone || 'adventure'} filled the air, our story begins. The ${context.currentLocation || 'ancient castle'} stood tall against the ${options.mood || 'stormy'} sky, waiting for heroes to arrive.

The journey ahead would be filled with ${options.themes?.join(' and ') || 'wonder and danger'}. Characters would face their deepest fears and discover strengths they never knew they had.

As the sun set on the horizon, painting the sky in shades of gold and crimson, it was clear that this was just the beginning of an epic tale that would be remembered for generations to come.`;
  }

  async validateBranch(branchId: string): Promise<ValidationReport> {
    return {
      branch_id: branchId,
      continuity_score: 85 + Math.random() * 15,
      consistency_errors: [],
      plot_holes: [],
      character_inconsistencies: [],
      timeline_conflicts: [],
      suggestions: [
        {
          type: 'improvement',
          target: 'pacing',
          description: 'Consider adding more dialogue in the middle section',
          priority: 'medium'
        }
      ],
      overall_quality: 80 + Math.random() * 20
    };
  }
}

// Export singleton instances
export const storyForgeAPI = import.meta.env.DEV 
  ? new MockStoryForgeAPI() 
  : new StoryForgeAPI();

export const storyForgeGraphQL = new StoryForgeGraphQL();
