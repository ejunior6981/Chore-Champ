/**
 * IndexedDB wrapper for offline-first data storage
 * Replaces localStorage with persistent, queryable storage
 */

const DB_NAME = 'ChoreChampDB';
const DB_VERSION = 1;

interface DB {
  db: IDBDatabase | null;
  open(): Promise<IDBDatabase>;
  close(): void;
}

interface ChoreChampDB extends DB {
  store: IDBObjectStore;
}

export interface IndexedDBConfig {
  name: string;
  version: number;
  stores: {
    [key: string]: {
      keyPath?: string;
      autoIncrement?: boolean;
    };
  };
}

/**
 * Initialize IndexedDB database
 */
export async function openDB(config: IndexedDBConfig): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.name, config.version);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBResult).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('familyId', 'familyId', { unique: false });
        userStore.createIndex('email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('chores')) {
        const choreStore = db.createObjectStore('chores', { keyPath: 'id' });
        choreStore.createIndex('familyId', 'familyId', { unique: false });
        choreStore.createIndex('assignedTo', 'assignedTo', { unique: false });
        choreStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('rewards')) {
        const rewardStore = db.createObjectStore('rewards', { keyPath: 'id' });
        rewardStore.createIndex('familyId', 'familyId', { unique: false });
      }

      if (!db.objectStoreNames.contains('pointRequests')) {
        const requestStore = db.createObjectStore('pointRequests', { keyPath: 'id' });
        requestStore.createIndex('familyId', 'familyId', { unique: false });
        requestStore.createIndex('userId', 'userId', { unique: false });
        requestStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notificationStore.createIndex('familyId', 'familyId', { unique: false });
        notificationStore.createIndex('userId', 'userId', { unique: false });
        notificationStore.createIndex('read', 'read', { unique: false });
      }

      if (!db.objectStoreNames.contains('avatars')) {
        const avatarStore = db.createObjectStore('avatars', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'userId' });
      }

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBResult).result;
      console.log('IndexedDB database upgraded to version', config.version);
    };
  });
}

/**
 * Generic IndexedDB store operations
 */
export const Store = {
  /**
   * Get item by key
   */
  get: async <T>(db: IDBDatabase, storeName: string, key: any): Promise<T | null> => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve(request.result as T | null);
    });
  },

  /**
   * Put item
   */
  put: async <T extends { id?: string }>(db: IDBDatabase, storeName: string, item: T): Promise<void> => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.put(item);
    
    return new Promise((resolve, reject) => {
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Delete item by key
   */
  delete: async (db: IDBDatabase, storeName: string, key: any): Promise<void> => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.delete(key);
    
    return new Promise((resolve, reject) => {
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Get all items
   */
  getAll: async <T>(db: IDBDatabase, storeName: string): Promise<T[]> => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  },

  /**
   * Get all items with index
   */
  getAllByIndex: async <T>(
    db: IDBDatabase,
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    return new Promise((resolve, reject) => {
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  },

  /**
   * Count items
   */
  count: async (db: IDBDatabase, storeName: string): Promise<number> => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    const request = store.count();
    
    return new Promise((resolve, reject) => {
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve(request.result);
    });
  },
};

/**
 * IndexedDB wrapper for localStorage replacement
 */
export class IndexedDBWrapper {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB({
      name: DB_NAME,
      version: DB_VERSION,
      stores: {},
    });
    console.log('IndexedDB initialized');
  }

  async getUsers(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'users');
  }

  async getUser(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'users', id);
  }

  async saveUser(user: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'users', user);
  }

  async deleteUsers(): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.delete(this.db, 'users');
  }

  async getChores(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'chores');
  }

  async getChore(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'chores', id);
  }

  async saveChore(chore: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'chores', chore);
  }

  async deleteChore(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.delete(this.db, 'chores', id);
  }

  async getRewards(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'rewards');
  }

  async getReward(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'rewards', id);
  }

  async saveReward(reward: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'rewards', reward);
  }

  async deleteReward(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.delete(this.db, 'rewards', id);
  }

  async getPointRequests(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'pointRequests');
  }

  async getPointRequest(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'pointRequests', id);
  }

  async savePointRequest(request: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'pointRequests', request);
  }

  async deletePointRequest(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.delete(this.db, 'pointRequests', id);
  }

  async getNotifications(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'notifications');
  }

  async getNotification(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'notifications', id);
  }

  async saveNotification(notification: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'notifications', notification);
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.delete(this.db, 'notifications', id);
  }

  async getAvatars(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'avatars');
  }

  async getAvatar(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'avatars', id);
  }

  async saveAvatar(avatar: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'avatars', avatar);
  }

  async getSettings(): Promise<any[]> {
    if (!this.db) await this.initialize();
    return Store.getAll(this.db, 'settings');
  }

  async getSetting(userId: string): Promise<any | null> {
    if (!this.db) await this.initialize();
    return Store.get(this.db, 'settings', userId);
  }

  async saveSetting(setting: any): Promise<void> {
    if (!this.db) await this.initialize();
    return Store.put(this.db, 'settings', setting);
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * Singleton instance
 */
let indexedDBWrapper: IndexedDBWrapper | null = null;

export async function initializeIndexedDB(): Promise<IndexedDBWrapper> {
  if (!indexedDBWrapper) {
    indexedDBWrapper = new IndexedDBWrapper();
    await indexedDBWrapper.initialize();
  }
  return indexedDBWrapper;
}

export function getIndexedDB(): IndexedDBWrapper | null {
  return indexedDBWrapper;
}
