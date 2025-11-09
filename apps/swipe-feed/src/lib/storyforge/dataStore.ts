/**
 * StoryForge Data Persistence Layer
 * Production-grade storage with offline support and conflict resolution
 */

import { openDB, DBSchema, IDBPDatabase } from '../../types/idb';
import type { StoryBranch, CollaborationSession, PublicRealm } from './types';

interface StoryForgeDB extends DBSchema {
  branches: {
    key: string;
    value: StoryBranch;
    indexes: {
      'by-user': string;
      'by-parent': string;
      'by-genre': string;
      'by-created': number;
      'by-published': string;
    };
  };
  sessions: {
    key: string;
    value: CollaborationSession;
    indexes: {
      'by-branch': string;
      'by-status': string;
    };
  };
  realms: {
    key: string;
    value: PublicRealm;
    indexes: {
      'by-creator': string;
      'by-popularity': number;
    };
  };
  cache: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
      ttl: number;
    };
  };
  sync: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      entity: 'branch' | 'session' | 'realm';
      data: any;
      timestamp: number;
      synced: boolean;
    };
  };
}

export class DataStore {
  private db: IDBPDatabase<StoryForgeDB> | null = null;
  private syncQueue: Map<string, any> = new Map();
  private conflictResolver: ConflictResolver;
  private offlineCache: Map<string, any> = new Map();

  constructor() {
    this.conflictResolver = new ConflictResolver();
    this.initializeDB();
  }

  private async initializeDB() {
    try {
      this.db = await openDB<StoryForgeDB>('storyforge', 1, {
        upgrade(db: IDBPDatabase<StoryForgeDB>) {
          // Branches store
          if (!db.objectStoreNames.contains('branches')) {
            const branchStore = db.createObjectStore('branches', { keyPath: 'id' });
            branchStore.createIndex('by-user', 'userId');
            branchStore.createIndex('by-parent', 'parentId');
            branchStore.createIndex('by-genre', 'metadata.genre');
            branchStore.createIndex('by-created', 'createdAt');
            branchStore.createIndex('by-published', 'isPublished');
          }

          // Sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
            sessionStore.createIndex('by-branch', 'branchId');
            sessionStore.createIndex('by-status', 'status');
          }

          // Realms store
          if (!db.objectStoreNames.contains('realms')) {
            const realmStore = db.createObjectStore('realms', { keyPath: 'id' });
            realmStore.createIndex('by-creator', 'creator');
            realmStore.createIndex('by-popularity', 'stats.popularity_rank');
          }

          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'id' });
          }

          // Sync queue
          if (!db.objectStoreNames.contains('sync')) {
            db.createObjectStore('sync', { keyPath: 'id', autoIncrement: true });
          }
        }
      });

      // Start sync process
      this.startSyncProcess();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Fall back to memory storage
      this.useMemoryStorage();
    }
  }

  // Branch operations
  async saveBranch(branch: StoryBranch): Promise<void> {
    if (!this.db) {
      this.offlineCache.set(branch.id, branch);
      return;
    }

    const tx = this.db.transaction('branches', 'readwrite');
    await tx.store.put(branch);
    await tx.done;

    // Queue for sync
    await this.queueSync('create', 'branch', branch);
  }

  async updateBranch(branchId: string, updates: Partial<StoryBranch>): Promise<StoryBranch> {
    if (!this.db) {
      const branch = this.offlineCache.get(branchId);
      if (branch) {
        Object.assign(branch, updates);
        this.offlineCache.set(branchId, branch);
      }
      return branch;
    }

    const tx = this.db.transaction('branches', 'readwrite');
    const branch = await tx.store.get(branchId);
    
    if (!branch) {
      throw new Error(`Branch ${branchId} not found`);
    }

    const updated = { ...branch, ...updates, updatedAt: Date.now() };
    await tx.store.put(updated);
    await tx.done;

    // Queue for sync
    await this.queueSync('update', 'branch', updated);

    return updated;
  }

  async getBranch(branchId: string): Promise<StoryBranch | undefined> {
    if (!this.db) {
      return this.offlineCache.get(branchId);
    }

    return this.db.get('branches', branchId);
  }

  async getUserBranches(userId: string): Promise<StoryBranch[]> {
    if (!this.db) {
      return Array.from(this.offlineCache.values()).filter(
        b => b.userId === userId
      );
    }

    const tx = this.db.transaction('branches', 'readonly');
    const index = tx.store.index('by-user');
    const branches = await index.getAll(userId);
    await tx.done;

    return branches;
  }

  async searchBranches(query: {
    genre?: string;
    userId?: string;
    published?: boolean;
    limit?: number;
  }): Promise<StoryBranch[]> {
    if (!this.db) {
      let results = Array.from(this.offlineCache.values());
      
      if (query.genre) {
        results = results.filter(b => b.metadata.genre === query.genre);
      }
      if (query.userId) {
        results = results.filter(b => b.userId === query.userId);
      }
      if (query.published !== undefined) {
        results = results.filter(b => b.isPublished === query.published);
      }
      if (query.limit) {
        results = results.slice(0, query.limit);
      }
      
      return results;
    }

    const tx = this.db.transaction('branches', 'readonly');
    let results: StoryBranch[] = [];

    if (query.genre) {
      const index = tx.store.index('by-genre');
      results = await index.getAll(query.genre);
    } else if (query.userId) {
      const index = tx.store.index('by-user');
      results = await index.getAll(query.userId);
    } else {
      results = await tx.store.getAll();
    }

    await tx.done;

    // Apply additional filters
    if (query.published !== undefined) {
      results = results.filter(b => b.isPublished === query.published);
    }

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async deleteBranch(branchId: string): Promise<void> {
    if (!this.db) {
      this.offlineCache.delete(branchId);
      return;
    }

    const tx = this.db.transaction('branches', 'readwrite');
    await tx.store.delete(branchId);
    await tx.done;

    // Queue for sync
    await this.queueSync('delete', 'branch', { id: branchId });
  }

  // Session operations
  async saveSession(session: CollaborationSession): Promise<void> {
    if (!this.db) {
      this.offlineCache.set(`session_${session.id}`, session);
      return;
    }

    const tx = this.db.transaction('sessions', 'readwrite');
    await tx.store.put(session);
    await tx.done;

    await this.queueSync('create', 'session', session);
  }

  async getSession(sessionId: string): Promise<CollaborationSession | undefined> {
    if (!this.db) {
      return this.offlineCache.get(`session_${sessionId}`);
    }

    return this.db.get('sessions', sessionId);
  }

  async getActiveSessions(): Promise<CollaborationSession[]> {
    if (!this.db) {
      return Array.from(this.offlineCache.values()).filter(
        v => v.status === 'active'
      );
    }

    const tx = this.db.transaction('sessions', 'readonly');
    const index = tx.store.index('by-status');
    const sessions = await index.getAll('active');
    await tx.done;

    return sessions;
  }

  // Realm operations
  async saveRealm(realm: PublicRealm): Promise<void> {
    if (!this.db) {
      this.offlineCache.set(`realm_${realm.id}`, realm);
      return;
    }

    const tx = this.db.transaction('realms', 'readwrite');
    await tx.store.put(realm);
    await tx.done;

    await this.queueSync('create', 'realm', realm);
  }

  async getRealm(realmId: string): Promise<PublicRealm | undefined> {
    if (!this.db) {
      return this.offlineCache.get(`realm_${realmId}`);
    }

    return this.db.get('realms', realmId);
  }

  async getPopularRealms(limit: number = 10): Promise<PublicRealm[]> {
    if (!this.db) {
      const realms = Array.from(this.offlineCache.values())
        .filter(v => v.stats?.popularity_rank)
        .sort((a, b) => a.stats.popularity_rank - b.stats.popularity_rank);
      return realms.slice(0, limit);
    }

    const tx = this.db.transaction('realms', 'readonly');
    const index = tx.store.index('by-popularity');
    const realms = await index.getAll(null, limit);
    await tx.done;

    return realms;
  }

  // Cache operations
  async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) {
      this.offlineCache.set(`cache_${key}`, { data, timestamp: Date.now(), ttl });
      return;
    }

    const tx = this.db.transaction('cache', 'readwrite');
    await tx.store.put({
      id: key,
      data,
      timestamp: Date.now(),
      ttl
    });
    await tx.done;
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) {
      const cached = this.offlineCache.get(`cache_${key}`);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
      return null;
    }

    const tx = this.db.transaction('cache', 'readonly');
    const cached = await tx.store.get(key);
    await tx.done;

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Cache expired
    if (cached) {
      await this.clearCache(key);
    }

    return null;
  }

  async clearCache(key?: string): Promise<void> {
    if (!this.db) {
      if (key) {
        this.offlineCache.delete(`cache_${key}`);
      } else {
        // Clear all cache entries
        Array.from(this.offlineCache.keys())
          .filter(k => k.startsWith('cache_'))
          .forEach(k => this.offlineCache.delete(k));
      }
      return;
    }

    const tx = this.db.transaction('cache', 'readwrite');
    if (key) {
      await tx.store.delete(key);
    } else {
      await tx.store.clear();
    }
    await tx.done;
  }

  // Sync operations
  private async queueSync(action: string, entity: string, data: any): Promise<void> {
    if (!this.db) {
      this.syncQueue.set(`${entity}_${data.id}`, { action, entity, data });
      return;
    }

    const tx = this.db.transaction('sync', 'readwrite');
    await tx.store.add({
      action: action as any,
      entity: entity as any,
      data,
      timestamp: Date.now(),
      synced: false
    });
    await tx.done;
  }

  private async startSyncProcess() {
    // Check online status
    if (!navigator.onLine) {
      // Retry when online
      window.addEventListener('online', () => this.startSyncProcess(), { once: true });
      return;
    }

    // Process sync queue
    await this.processSyncQueue();

    // Schedule next sync
    setTimeout(() => this.startSyncProcess(), 30000); // Every 30 seconds
  }

  private async processSyncQueue() {
    if (!this.db) return;

    const tx = this.db.transaction('sync', 'readwrite');
    const items = await tx.store.getAll();
    
    for (const item of items) {
      if (!item.synced) {
        try {
          // In production, this would call the actual API
          await this.syncToServer(item);
          
          // Mark as synced
          item.synced = true;
          await tx.store.put(item);
        } catch (error) {
          console.error('Sync failed for item:', item.id, error);
        }
      }
    }
    
    await tx.done;
  }

  private async syncToServer(item: any): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, this would be:
    // await fetch('/api/storyforge/sync', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(item)
    // });
  }

  private useMemoryStorage() {
    console.warn('Using memory storage fallback');
    // All operations will use offlineCache Map
  }

  // Export/Import for backup
  async exportData(): Promise<string> {
    if (!this.db) {
      return JSON.stringify({
        branches: Array.from(this.offlineCache.entries()),
        timestamp: Date.now()
      });
    }

    const tx = this.db.transaction(['branches', 'sessions', 'realms'], 'readonly');
    const branches = await tx.objectStore('branches').getAll();
    const sessions = await tx.objectStore('sessions').getAll();
    const realms = await tx.objectStore('realms').getAll();
    await tx.done;

    return JSON.stringify({
      branches,
      sessions,
      realms,
      timestamp: Date.now()
    });
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    if (!this.db) {
      // Import to memory
      data.branches?.forEach((b: StoryBranch) => this.offlineCache.set(b.id, b));
      return;
    }

    const tx = this.db.transaction(['branches', 'sessions', 'realms'], 'readwrite');
    
    // Import branches
    for (const branch of data.branches || []) {
      await tx.objectStore('branches').put(branch);
    }
    
    // Import sessions
    for (const session of data.sessions || []) {
      await tx.objectStore('sessions').put(session);
    }
    
    // Import realms
    for (const realm of data.realms || []) {
      await tx.objectStore('realms').put(realm);
    }
    
    await tx.done;
  }
}

/**
 * Conflict Resolution Engine
 */
class ConflictResolver {
  resolveConflict(local: any, remote: any, strategy: 'local' | 'remote' | 'merge' = 'merge'): any {
    if (strategy === 'local') return local;
    if (strategy === 'remote') return remote;
    
    // Smart merge strategy
    if (local.updatedAt > remote.updatedAt) {
      return this.mergeChanges(local, remote);
    } else {
      return this.mergeChanges(remote, local);
    }
  }

  private mergeChanges(newer: any, older: any): any {
    const merged = { ...older };
    
    // Merge non-conflicting changes
    Object.keys(newer).forEach(key => {
      if (typeof newer[key] === 'object' && typeof older[key] === 'object') {
        // Recursive merge for nested objects
        merged[key] = this.mergeChanges(newer[key], older[key]);
      } else if (newer[key] !== older[key]) {
        // Use newer value for conflicts
        merged[key] = newer[key];
      }
    });
    
    // Update metadata
    merged.updatedAt = Math.max(newer.updatedAt || 0, older.updatedAt || 0);
    merged.version = Math.max(newer.version || 0, older.version || 0) + 1;
    
    return merged;
  }
}

// Singleton instance
export const dataStore = new DataStore();
