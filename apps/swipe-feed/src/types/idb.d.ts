// Type declarations for idb library
  export interface DBSchema {
    [storeName: string]: any;
  }

  export interface IDBPDatabase<T = any> {
    transaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBPTransaction<T>;
    get(storeName: string, key: any): Promise<any>;
    put(storeName: string, value: any): Promise<any>;
    delete(storeName: string, key: any): Promise<void>;
    clear(storeName: string): Promise<void>;
    getAll(storeName: string): Promise<any[]>;
    getAllKeys(storeName: string): Promise<any[]>;
    count(storeName: string): Promise<number>;
    close(): void;
  }

  export interface IDBPTransaction<T = any> {
    store: IDBPObjectStore<T>;
    objectStore(name: string): IDBPObjectStore<T>;
    done: Promise<void>;
  }

  export interface IDBPObjectStore<T = any> {
    put(value: any, key?: any): Promise<any>;
    get(key: any): Promise<any>;
    getAll(query?: any, count?: number): Promise<any[]>;
    delete(key: any): Promise<void>;
    clear(): Promise<void>;
    index(name: string): IDBPIndex<T>;
  }

  export interface IDBPIndex<T = any> {
    get(key: any): Promise<any>;
    getAll(query?: any, count?: number): Promise<any[]>;
    getAllKeys(query?: any, count?: number): Promise<any[]>;
    count(query?: any): Promise<number>;
  }

  export interface OpenDBCallbacks<T> {
    upgrade?(db: IDBPDatabase<T>, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction<T>): void;
    blocked?(): void;
    blocking?(): void;
    terminated?(): void;
  }

  export function openDB<T = any>(
    name: string,
    version?: number,
    callbacks?: OpenDBCallbacks<T>
  ): Promise<IDBPDatabase<T>>;

  export function deleteDB(name: string): Promise<void>;
