import type { User, Chore, Reward, PointRequest, Notification } from '../types';

const DB_NAME = 'chore-champ';
const DB_VERSION = 1;

export class IndexedDB {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (!this.db) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.addEventListener('error', (event) => {
          reject(event.error);
        });

        request.addEventListener('upgradeneeded', (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create users store
          if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('role', 'role', { unique: false });
            userStore.createIndex('email', 'email', { unique: true });
          }

          // Create chores store
          if (!db.objectStoreNames.contains('chores')) {
            const choreStore = db.createObjectStore('chores', { keyPath: 'id' });
            choreStore.createIndex('status', 'status', { unique: false });
          }

          // Create rewards store
          if (!db.objectStoreNames.contains('rewards')) {
            const rewardStore = db.createObjectStore('rewards', { keyPath: 'id' });
            rewardStore.createIndex('points', 'points', { unique: false });
          }

          // Create pointRequests store
          if (!db.objectStoreNames.contains('pointRequests')) {
            const requestStore = db.createObjectStore('pointRequests', { keyPath: 'id' });
            requestStore.createIndex('status', 'status', { unique: false });
          }

          // Create notifications store
          if (!db.objectStoreNames.contains('notifications')) {
            const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
            notificationStore.createIndex('read', 'read', { unique: false });
            notificationStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        });

        request.addEventListener('completed', (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        });
      });
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve(event.target.result));
    });
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve(event.target.result));
    });
  }

  async putUser(user: User): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve());
    });
  }

  async deleteUsers(): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.clear();
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve());
    });
  }

  async getAllChores(): Promise<Chore[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chores'], 'readonly');
      const store = transaction.objectStore('chores');
      const request = store.getAll();
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve(event.target.result));
    });
  }

  async getAllRewards(): Promise<Reward[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rewards'], 'readonly');
      const store = transaction.objectStore('rewards');
      const request = store.getAll();
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve(event.target.result));
    });
  }

  async getAllPointRequests(): Promise<PointRequest[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pointRequests'], 'readonly');
      const store = transaction.objectStore('pointRequests');
      const request = store.getAll();
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve(event.target.result));
    });
  }

  async getAllNotifications(): Promise<Notification[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const request = store.getAll();
      request.addEventListener('error', (event) => reject(event.error));
      request.addEventListener('complete', (event) => resolve(event.target.result));
    });
  }
}

export const initializeIndexedDB = async (): Promise<IndexedDB> => {
  const db = new IndexedDB();
  await db.initialize();
  return db;
};

export { IndexedDB };
export default IndexedDB;
