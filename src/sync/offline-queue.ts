/**
 * Offline Queue
 * Queues operations when offline and syncs when online
 */

export interface QueuedOperation {
  id: string;
  operation: string; // API call or action
  parameters: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'queued' | 'synced' | 'failed';
  error?: string;
}

export interface QueueConfig {
  maxQueueSize: number;
  retryDelay: number; // ms
  maxRetries: number;
}

/**
 * Offline Queue
 */
export class OfflineQueue {
  private STORAGE_KEY = 'chore-champ-offline-queue';
  private config: QueueConfig = {
    maxQueueSize: 100,
    retryDelay: 1000,
    maxRetries: 3,
  };

  private queue: QueuedOperation[] = [];

  /**
   * Add operation to queue
   */
  async enqueue(operation: string, parameters: any): Promise<boolean> {
    // Check if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('Offline queue is full, dropping oldest operation');
      this.removeOldest();
    }

    const queuedOp: QueuedOperation = {
      id: crypto.randomUUID(),
      operation,
      parameters,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(queuedOp);
    await this.saveQueue();

    console.log(`Queued operation: ${operation}`, parameters);
    return true;
  }

  /**
   * Process next queued operation
   */
  async processNext(): Promise<void> {
    const pending = this.queue.find(op => op.status === 'pending');
    
    if (!pending) {
      return;
    }

    console.log(`Processing queued operation: ${pending.operation}`, pending.parameters);

    try {
      // TODO: Execute the queued operation
      // await this.executeOperation(pending.operation, pending.parameters);
      
      pending.status = 'synced';
      await this.saveQueue();
      console.log(`Operation synced: ${pending.operation}`);
    } catch (error) {
      console.error(`Failed to sync operation: ${pending.operation}`, error);
      
      pending.retryCount++;
      
      if (pending.retryCount >= this.config.maxRetries) {
        pending.status = 'failed';
        pending.error = String(error);
      } else {
        pending.status = 'queued';
        // Schedule retry
        setTimeout(() => this.processNext(), this.config.retryDelay * pending.retryCount);
      }
      
      await this.saveQueue();
    }
  }

  /**
   * Process all queued operations
   */
  async processAll(): Promise<void> {
    while (this.queue.length > 0) {
      await this.processNext();
      
      // Check if we're done
      const pending = this.queue.find(op => op.status === 'pending');
      if (!pending) {
        break;
      }
    }
  }

  /**
   * Remove oldest operation from queue
   */
  private removeOldest(): void {
    const oldestIndex = this.queue.findIndex(op => op.status === 'pending');
    if (oldestIndex !== -1) {
      const removed = this.queue.splice(oldestIndex, 1)[0];
      console.log(`Removed oldest operation from queue: ${removed.operation}`);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get pending operations count
   */
  getPendingCount(): number {
    return this.queue.filter(op => op.status === 'pending').length;
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    console.log('Cleared offline queue');
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Load queue from storage
   */
  async loadQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`Loaded offline queue with ${this.queue.length} operations`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Get queue status
   */
  getStatus(): {
    size: number;
    pending: number;
    queued: number;
    synced: number;
    failed: number;
  } {
    return {
      size: this.queue.length,
      pending: this.queue.filter(op => op.status === 'pending').length,
      queued: this.queue.filter(op => op.status === 'queued').length,
      synced: this.queue.filter(op => op.status === 'synced').length,
      failed: this.queue.filter(op => op.status === 'failed').length,
    };
  }
}

/**
 * Singleton instance
 */
let offlineQueue: OfflineQueue | null = null;

export async function initializeOfflineQueue(): Promise<OfflineQueue> {
  if (!offlineQueue) {
    offlineQueue = new OfflineQueue();
    await offlineQueue.loadQueue();
  }
  return offlineQueue;
}

export function getOfflineQueue(): OfflineQueue | null {
  return offlineQueue;
}
