/**
 * Background Sync
 * Handles periodic sync and offline operations
 */

export interface SyncTask {
  id: string;
  name: string;
  description: string;
  lastRun: number | null;
  nextRun: number | null;
  enabled: boolean;
  type: 'data' | 'push' | 'manual';
}

export interface SyncConfig {
  syncInterval: number; // ms
  maxQueueSize: number;
  retryDelay: number; // ms
}

/**
 * Background Sync Manager
 */
export class BackgroundSyncManager {
  private STORAGE_KEY = 'chore-champ-sync-config';
  private TASKS_KEY = 'chore-champ-sync-tasks';

  private config: SyncConfig = {
    syncInterval: 60000, // 1 minute
    maxQueueSize: 100,
    retryDelay: 1000,
  };

  private tasks: SyncTask[] = [
    {
      id: 'chores',
      name: 'Chores',
      description: 'Sync chore data',
      lastRun: null,
      nextRun: null,
      enabled: true,
      type: 'data',
    },
    {
      id: 'rewards',
      name: 'Rewards',
      description: 'Sync reward data',
      lastRun: null,
      nextRun: null,
      enabled: true,
      type: 'data',
    },
    {
      id: 'requests',
      name: 'Point Requests',
      description: 'Sync point requests',
      lastRun: null,
      nextRun: null,
      enabled: true,
      type: 'data',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Sync notifications',
      lastRun: null,
      nextRun: null,
      enabled: true,
      type: 'data',
    },
  ];

  /**
   * Initialize background sync
   */
  async initialize(): Promise<void> {
    try {
      // Load config
      const storedConfig = localStorage.getItem(this.STORAGE_KEY);
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        this.config = { ...this.config, ...parsed };
      }

      // Load tasks
      const storedTasks = localStorage.getItem(this.TASKS_KEY);
      if (storedTasks) {
        this.tasks = JSON.parse(storedTasks);
      }

      // Register background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        registration.sync.register('chore-champ-sync');
        console.log('Background sync registered');
      }
    } catch (error) {
      console.error('Failed to initialize background sync:', error);
    }
  }

  /**
   * Schedule sync task
   */
  async scheduleTask(taskId: string, delay: number): Promise<void> {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.nextRun = Date.now() + delay;
        await this.saveTasks();
        console.log(`Scheduled ${taskId} sync in ${delay}ms`);
      }
    } catch (error) {
      console.error('Failed to schedule sync task:', error);
    }
  }

  /**
   * Execute sync task
   */
  async executeTask(taskId: string): Promise<void> {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        const now = Date.now();
        task.lastRun = now;
        task.nextRun = now + this.config.syncInterval;
        await this.saveTasks();
        console.log(`Executed ${taskId} sync`);
      }
    } catch (error) {
      console.error('Failed to execute sync task:', error);
    }
  }

  /**
   * Get next sync time
   */
  getNextSyncTime(): number | null {
    const now = Date.now();
    const task = this.tasks.find(t => t.enabled && t.nextRun && t.nextRun > now);
    if (task) {
      return task.nextRun;
    }
    return null;
  }

  /**
   * Check if sync is needed
   */
  isSyncNeeded(): boolean {
    const now = Date.now();
    const nextSync = this.getNextSyncTime();
    return nextSync && now >= nextSync;
  }

  /**
   * Enable/disable sync task
   */
  async enableTask(taskId: string, enabled: boolean): Promise<void> {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.enabled = enabled;
        await this.saveTasks();
        console.log(`${taskId} sync ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Failed to enable/disable sync task:', error);
    }
  }

  /**
   * Get sync tasks
   */
  getTasks(): SyncTask[] {
    return this.tasks;
  }

  /**
   * Save tasks
   */
  private async saveTasks(): Promise<void> {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save sync tasks:', error);
    }
  }

  /**
   * Handle background sync event
   */
  public async handleSyncEvent(event: any): Promise<void> {
    console.log('Background sync event:', (event as any).tag);
    
    // Execute all enabled tasks
    for (const task of this.tasks) {
      if (task.enabled) {
        await this.executeTask(task.id);
      }
    }
  }

  /**
   * Reset sync schedule
   */
  async resetSchedule(): Promise<void> {
    try {
      for (const task of this.tasks) {
        if (task.enabled) {
          task.nextRun = Date.now() + this.config.syncInterval;
        }
      }
      await this.saveTasks();
      console.log('Sync schedule reset');
    } catch (error) {
      console.error('Failed to reset sync schedule:', error);
    }
  }

  /**
   * Clear all tasks
   */
  async clearTasks(): Promise<void> {
    try {
      this.tasks = [];
      await this.saveTasks();
      console.log('All sync tasks cleared');
    } catch (error) {
      console.error('Failed to clear sync tasks:', error);
    }
  }
}

/**
 * Singleton instance
 */
let backgroundSyncManager: BackgroundSyncManager | null = null;

export async function initializeBackgroundSync(): Promise<BackgroundSyncManager> {
  if (!backgroundSyncManager) {
    backgroundSyncManager = new BackgroundSyncManager();
    await backgroundSyncManager.initialize();
  }
  return backgroundSyncManager;
}

export function getBackgroundSync(): BackgroundSyncManager | null {
  return backgroundSyncManager;
}
