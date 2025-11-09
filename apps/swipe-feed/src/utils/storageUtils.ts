const isBrowser = typeof window !== 'undefined';

const safeExecute = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    console.warn('SafeStorage operation failed', error);
  }
};

const getStorageSize = (storage: Storage) => {
  let total = 0;
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    const value = storage.getItem(key) ?? '';
    total += key.length + value.length;
  }
  return total;
};

export interface SafeStorageInfo {
  localStorageUsed: number;
  sessionStorageUsed: number;
  totalKeys: number;
}

export const SafeStorage = {
  clearCorruptedData(storage: Storage) {
    if (!isBrowser) return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) continue;

      try {
        storage.getItem(key);
      } catch (error) {
        console.warn('Removing corrupted storage entry:', key, error);
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => safeExecute(() => storage.removeItem(key)));
  },

  clearAppData() {
    if (!isBrowser) return;

    safeExecute(() => localStorage.clear());
    safeExecute(() => sessionStorage.clear());

    if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
      indexedDB
        .databases()
        .then((databases) => {
          databases?.forEach((db) => {
            if (db?.name) {
              safeExecute(() => indexedDB.deleteDatabase(db.name!));
            }
          });
        })
        .catch((error) => console.warn('IndexedDB cleanup failed', error));
    }
  },

  exportStorageData(): string {
    if (!isBrowser) return '{}';

    const snapshot = {
      generatedAt: new Date().toISOString(),
      localStorage: Object.fromEntries(
        Array.from({ length: localStorage.length }).map((_, index) => {
          const key = localStorage.key(index);
          return [key ?? '', key ? localStorage.getItem(key) : null];
        })
      ),
      sessionStorage: Object.fromEntries(
        Array.from({ length: sessionStorage.length }).map((_, index) => {
          const key = sessionStorage.key(index);
          return [key ?? '', key ? sessionStorage.getItem(key) : null];
        })
      )
    };

    return JSON.stringify(snapshot, null, 2);
  },

  getStorageInfo(): SafeStorageInfo {
    if (!isBrowser) {
      return { localStorageUsed: 0, sessionStorageUsed: 0, totalKeys: 0 };
    }

    const localStorageUsed = getStorageSize(localStorage);
    const sessionStorageUsed = getStorageSize(sessionStorage);
    const totalKeys = localStorage.length + sessionStorage.length;

    return { localStorageUsed, sessionStorageUsed, totalKeys };
  }
};
