/**
 * Conflict Resolver
 * Handles concurrent edits and data conflicts
 */

export interface Conflict {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  localData: any;
  remoteData: any;
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface ConflictResolution {
  action: 'accept-local' | 'accept-remote' | 'merge';
  mergedData?: any;
}

/**
 * Conflict Resolver
 */
export class ConflictResolver {
  private STORAGE_KEY = 'chore-champ-conflicts';

  private conflicts: Conflict[] = [];

  /**
   * Detect conflicts between local and remote data
   */
  async detectConflicts(
    localData: any,
    remoteData: any,
    table: string,
    recordId: string
  ): Promise<Conflict[] | null> {
    // Check if records are different
    const isDifferent = this.isDataDifferent(localData, remoteData);
    
    if (!isDifferent) {
      return null;
    }

    // Create conflict record
    const conflict: Conflict = {
      id: crypto.randomUUID(),
      type: this.getOperationType(localData, remoteData),
      table,
      localData,
      remoteData,
      timestamp: Date.now(),
      resolved: false,
    };

    this.conflicts.push(conflict);
    await this.saveConflicts();

    console.log(`Detected conflict in ${table} for ${recordId}`);
    return [conflict];
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<boolean> {
    const index = this.conflicts.findIndex(c => c.id === conflictId);
    
    if (index === -1) {
      console.log('Conflict not found:', conflictId);
      return false;
    }

    const conflict = this.conflicts[index];
    conflict.resolved = true;

    if (resolution.action === 'accept-local') {
      conflict.resolution = 'local';
    } else if (resolution.action === 'accept-remote') {
      conflict.resolution = 'remote';
    } else if (resolution.action === 'merge') {
      conflict.resolution = 'merge';
      // TODO: Implement merge logic for specific fields
    }

    await this.saveConflicts();
    console.log(`Resolved conflict ${conflictId} with action: ${resolution.action}`);
    return true;
  }

  /**
   * Get all unresolved conflicts
   */
  getUnresolvedConflicts(): Conflict[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  /**
   * Clear resolved conflicts
   */
  async clearResolved(): Promise<void> {
    this.conflicts = this.conflicts.filter(c => !c.resolved);
    await this.saveConflicts();
  }

  /**
   * Check if data is different
   */
  private isDataDifferent(local: any, remote: any): boolean {
    if (!local && !remote) {
      return false;
    }

    if (!local || !remote) {
      return true;
    }

    // Simple comparison for now
    const localKeys = Object.keys(local);
    const remoteKeys = Object.keys(remote);

    // Check if keys match
    if (JSON.stringify(localKeys.sort()) !== JSON.stringify(remoteKeys.sort())) {
      return true;
    }

    // Check if values match
    for (const key of localKeys) {
      if (local[key] !== remote[key]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine operation type from data
   */
  private getOperationType(local: any, remote: any): 'create' | 'update' | 'delete' {
    if (!remote) {
      return 'create';
    }

    if (!local) {
      return 'delete';
    }

    return 'update';
  }

  /**
   * Save conflicts to storage
   */
  private async saveConflicts(): Promise<void> {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.conflicts)
      );
    } catch (error) {
      console.error('Failed to save conflicts:', error);
    }
  }

  /**
   * Get conflicts for specific table
   */
  getConflictsForTable(table: string): Conflict[] {
    return this.conflicts.filter(c => c.table === table);
  }
}

/**
 * Singleton instance
 */
let conflictResolver: ConflictResolver | null = null;

export async function initializeConflictResolver(): Promise<ConflictResolver> {
  if (!conflictResolver) {
    conflictResolver = new ConflictResolver();
    const stored = localStorage.getItem('chore-champ-conflicts');
    if (stored) {
      conflictResolver.conflicts = JSON.parse(stored);
    }
  }
  return conflictResolver;
}

export function getConflictResolver(): ConflictResolver | null {
  return conflictResolver;
}
