/**
 * Sync Manager
 * Coordinates data synchronization between IndexedDB and server
 */

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  recordId?: string;
  data?: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  error?: string;
}

export interface SyncState {
  lastSync: number | null;
  pendingOperations: SyncOperation[];
  isSyncing: boolean;
}

/**
 * Sync Manager
 */
export class SyncManager {
  private STORAGE_KEY = 'chore-champ-sync';
  private PENDING_QUEUE_KEY = 'chore-champ-pending-queue';

  private state: SyncState = {
    lastSync: null,
    pendingOperations: [],
    isSyncing: false,
  };

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          ...this.state,
          ...parsed,
        };
      }
    } catch (error) {
      console.error('Failed to initialize sync state:', error);
    }
  }

  /**
   * Queue a sync operation
   */
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'status'>): Promise<void> {
    const syncOp: SyncOperation = {
      id: crypto.randomUUID(),
      ...operation,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.state.pendingOperations.push(syncOp);
    await this.saveState();
    console.log(`Queued sync operation: ${operation.type} ${operation.table}`, syncOp.recordId || '');

    // Try to sync if online
    await this.attemptSync();
  }

  /**
   * Attempt to sync pending operations
   */
  async attemptSync(): Promise<void> {
    if (navigator.onLine) {
      // Online - try to sync
      await this.syncToServer();
    } else {
      // Offline - just save state
      await this.saveState();
    }
  }

  /**
   * Sync to server
   */
  private async syncToServer(): Promise<void> {
    this.state.isSyncing = true;
    await this.saveState();

    try {
      const operations = this.state.pendingOperations.filter(op => op.status === 'pending');

      if (operations.length === 0) {
        this.state.isSyncing = false;
        await this.saveState();
        return;
      }

      console.log(`Syncing ${operations.length} operations to server...`);

      // TODO: Implement actual server sync
      // For now, just mark as synced
      for (const op of operations) {
        op.status = 'synced';
      }

      this.state.pendingOperations = this.state.pendingOperations.filter(op => op.status !== 'synced');
      this.state.lastSync = Date.now();
      
      await this.saveState();
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Mark failed operations
      for (const op of operations) {
        if (op.status === 'pending') {
          op.status = 'failed';
          op.error = String(error);
        }
      }
      
      await this.saveState();
    } finally {
      this.state.isSyncing = false;
      await this.saveState();
    }
  }

  /**
   * Get pending operations count
   */
  getPendingCount(): number {
    return this.state.pendingOperations.filter(op => op.status === 'pending').length;
  }

  /**
   * Get last sync timestamp
   */
  getLastSync(): number | null {
    return this.state.lastSync;
  }

  /**
   * Save sync state
   */
  private async saveState(): Promise<void> {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          lastSync: this.state.lastSync,
          pendingOperations: this.state.pendingOperations,
          isSyncing: this.state.isSyncing,
        })
      );
    } catch (error) {
      console.error('Failed to save sync state:', error);
    }
  }

  /**
   * Clear all pending operations
   */
  async clearPending(): Promise<void> {
    this.state.pendingOperations = [];
    this.state.lastSync = Date.now();
    await this.saveState();
    console.log('Cleared all pending operations');
  }

  /**
   * Force sync regardless of online status
   */
  async forceSync(): Promise<void> {
    await this.syncToServer();
  }

  /**
   * Get sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }
}

/**
 * Singleton instance
 */
let syncManager: SyncManager | null = null;

export async function initializeSyncManager(): Promise<SyncManager> {
  if (!syncManager) {
    syncManager = new SyncManager();
    await syncManager.initialize();
  }
  return syncManager;
}

export function getSyncManager(): SyncManager | null {
  return syncManager;
}
