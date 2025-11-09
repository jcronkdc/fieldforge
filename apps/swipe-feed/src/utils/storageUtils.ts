/**
 * Storage utilities for safe localStorage and sessionStorage operations
 * with automatic corruption recovery
 */

export class SafeStorage {
  private static readonly STORAGE_VERSION_KEY = 'mythatron_storage_version';
  private static readonly CURRENT_VERSION = '1.0.0';
  
  /**
   * Safely get item from storage with corruption handling
   */
  static getItem(key: string, storage: Storage = localStorage): any {
    try {
      const item = storage.getItem(key);
      if (!item) return null;
      
      // Try to parse JSON
      try {
        return JSON.parse(item);
      } catch {
        // If it's not JSON, return as string
        return item;
      }
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      // If corrupted, remove it
      this.removeItem(key, storage);
      return null;
    }
  }
  
  /**
   * Safely set item in storage
   */
  static setItem(key: string, value: any, storage: Storage = localStorage): boolean {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      storage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
      // Storage might be full or corrupted
      this.clearCorruptedData(storage);
      return false;
    }
  }
  
  /**
   * Safely remove item from storage
   */
  static removeItem(key: string, storage: Storage = localStorage): void {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }
  
  /**
   * Clear all MythaTron-related storage
   */
  static clearAppData(): void {
    console.log('Clearing all MythaTron app data...');
    
    // Clear localStorage
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (this.isMythaTronKey(key)) {
        this.removeItem(key, localStorage);
      }
    });
    
    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (this.isMythaTronKey(key)) {
        this.removeItem(key, sessionStorage);
      }
    });
    
    // Clear Supabase auth storage
    this.clearSupabaseAuth();
    
    console.log('App data cleared successfully');
  }
  
  /**
   * Clear only corrupted or invalid data
   */
  static clearCorruptedData(storage: Storage = localStorage): void {
    const keys = Object.keys(storage);
    let corruptedCount = 0;
    
    keys.forEach(key => {
      try {
        const value = storage.getItem(key);
        if (value && value.length > 0) {
          // Try to parse if it looks like JSON
          if (value.startsWith('{') || value.startsWith('[')) {
            JSON.parse(value);
          }
        }
      } catch {
        // Data is corrupted, remove it
        console.warn(`Removing corrupted data for key: ${key}`);
        this.removeItem(key, storage);
        corruptedCount++;
      }
    });
    
    if (corruptedCount > 0) {
      console.log(`Cleared ${corruptedCount} corrupted storage entries`);
    }
  }
  
  /**
   * Check if storage version matches, clear if outdated
   */
  static checkStorageVersion(): void {
    const currentVersion = this.getItem(this.STORAGE_VERSION_KEY);
    
    if (currentVersion !== this.CURRENT_VERSION) {
      console.log('Storage version mismatch, clearing old data...');
      this.clearAppData();
      this.setItem(this.STORAGE_VERSION_KEY, this.CURRENT_VERSION);
    }
  }
  
  /**
   * Check if a key belongs to MythaTron
   */
  private static isMythaTronKey(key: string): boolean {
    const mythaTronPrefixes = [
      'mythatron',
      'professor',
      'remix',
      'draft',
      'session',
      'feed',
      'swipe',
      'angry',
      'sparks',
      'bookworm',
      'das'
    ];
    
    const lowerKey = key.toLowerCase();
    return mythaTronPrefixes.some(prefix => lowerKey.includes(prefix));
  }
  
  /**
   * Clear Supabase authentication data
   */
  private static clearSupabaseAuth(): void {
    // Supabase stores auth in localStorage with keys like 'sb-*'
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        this.removeItem(key, localStorage);
      }
    });
  }
  
  /**
   * Get storage usage info
   */
  static getStorageInfo(): {
    localStorageUsed: number;
    sessionStorageUsed: number;
    totalKeys: number;
  } {
    let localSize = 0;
    let sessionSize = 0;
    
    // Calculate localStorage size
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key) || '';
      localSize += key.length + value.length;
    });
    
    // Calculate sessionStorage size
    Object.keys(sessionStorage).forEach(key => {
      const value = sessionStorage.getItem(key) || '';
      sessionSize += key.length + value.length;
    });
    
    return {
      localStorageUsed: localSize,
      sessionStorageUsed: sessionSize,
      totalKeys: Object.keys(localStorage).length + Object.keys(sessionStorage).length
    };
  }
  
  /**
   * Export all storage data for debugging
   */
  static exportStorageData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      localStorage: {} as Record<string, any>,
      sessionStorage: {} as Record<string, any>,
      storageInfo: this.getStorageInfo()
    };
    
    // Export localStorage
    Object.keys(localStorage).forEach(key => {
      try {
        data.localStorage[key] = this.getItem(key, localStorage);
      } catch {
        data.localStorage[key] = '[CORRUPTED]';
      }
    });
    
    // Export sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      try {
        data.sessionStorage[key] = this.getItem(key, sessionStorage);
      } catch {
        data.sessionStorage[key] = '[CORRUPTED]';
      }
    });
    
    return JSON.stringify(data, null, 2);
  }
}

// Auto-check storage version on load
if (typeof window !== 'undefined') {
  SafeStorage.checkStorageVersion();
  
  // Clear corrupted data on load
  SafeStorage.clearCorruptedData(localStorage);
  SafeStorage.clearCorruptedData(sessionStorage);
}
