/**
 * Migration utility
 * Migrates existing localStorage data to IndexedDB
 */

import type { User, Chore, Reward, PointRequest, Notification } from '../types';

export interface MigrationResult {
  usersMigrated: number;
  choresMigrated: number;
  rewardsMigrated: number;
  requestsMigrated: number;
  notificationsMigrated: number;
  errors: string[];
}

export interface MigratedUser {
  id: number;
  name: string;
  role: 'parent' | 'child';
  avatar: string | null;
  points: number;
}

export interface MigratedChore {
  id: number;
  name: string;
  points: number;
  status: string;
  requiresApproval: boolean;
  recurrence: string;
  description?: string;
  assignedTo?: number;
  streak?: number;
}

export interface MigratedReward {
  id: number;
  name: string;
  points: number;
}

export interface MigratedPointRequest {
  id: number;
  userId: number;
  description: string;
  points: number;
  status: string;
}

/**
 * Migrate localStorage data to IndexedDB
 */
export async function migrateLocalStorage(): Promise<MigrationResult> {
  console.log('Starting migration from localStorage to IndexedDB...');

  const result: MigrationResult = {
    usersMigrated: 0,
    choresMigrated: 0,
    rewardsMigrated: 0,
    requestsMigrated: 0,
    notificationsMigrated: 0,
    errors: [],
  };

  try {
    // Migrate users
    const users = migrateUsers();
    result.usersMigrated = users.length;
    console.log(`Migrated ${users.length} users`);

    // Migrate chores
    const chores = migrateChores();
    result.choresMigrated = chores.length;
    console.log(`Migrated ${chores.length} chores`);

    // Migrate rewards
    const rewards = migrateRewards();
    result.rewardsMigrated = rewards.length;
    console.log(`Migrated ${rewards.length} rewards`);

    // Migrate point requests
    const requests = migratePointRequests();
    result.requestsMigrated = requests.length;
    console.log(`Migrated ${requests.length} requests`);

    // Migrate notifications
    const notifications = migrateNotifications();
    result.notificationsMigrated = notifications.length;
    console.log(`Migrated ${notifications.length} notifications`);

  } catch (error) {
    console.error('Migration failed:', error);
    result.errors.push(String(error));
  }

  // Clean up localStorage
  cleanupLocalStorage();

  console.log('Migration completed');
  return result;
}

/**
 * Migrate users from localStorage
 */
function migrateUsers(): MigratedUser[] {
  const users = [] as MigratedUser[];

  try {
    const storedUsers = localStorage.getItem('chore-champ-users');
    if (storedUsers) {
      const parsed = JSON.parse(storedUsers);
      users.push(...parsed);
    }
  } catch (error) {
    console.error('Failed to migrate users:', error);
  }

  return users;
}

/**
 * Migrate chores from localStorage
 */
function migrateChores(): MigratedChore[] {
  const chores = [] as MigratedChore[];

  try {
    const storedChores = localStorage.getItem('chore-champ-chores');
    if (storedChores) {
      const parsed = JSON.parse(storedChores);
      chores.push(...parsed);
    }
  } catch (error) {
    console.error('Failed to migrate chores:', error);
  }

  return chores;
}

/**
 * Migrate rewards from localStorage
 */
function migrateRewards(): MigratedReward[] {
  const rewards = [] as MigratedReward[];

  try {
    const storedRewards = localStorage.getItem('chore-champ-rewards');
    if (storedRewards) {
      const parsed = JSON.parse(storedRewards);
      rewards.push(...parsed);
    }
  } catch (error) {
    console.error('Failed to migrate rewards:', error);
  }

  return rewards;
}

/**
 * Migrate point requests from localStorage
 */
function migratePointRequests(): MigratedPointRequest[] {
  const requests = [] as MigratedPointRequest[];

  try {
    const storedRequests = localStorage.getItem('chore-champ-requests');
    if (storedRequests) {
      const parsed = JSON.parse(storedRequests);
      requests.push(...parsed);
    }
  } catch (error) {
    console.error('Failed to migrate requests:', error);
  }

  return requests;
}

/**
 * Migrate notifications from localStorage
 */
function migrateNotifications(): Notification[] {
  const notifications = [] as Notification[];

  try {
    const storedNotifications = localStorage.getItem('chore-champ-notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      notifications.push(...parsed);
    }
  } catch (error) {
    console.error('Failed to migrate notifications:', error);
  }

  return notifications;
}

/**
 * Clean up localStorage after migration
 */
function cleanupLocalStorage(): void {
  const keysToRemove = [
    'chore-champ-users',
    'chore-champ-chores',
    'chore-champ-rewards',
    'chore-champ-requests',
    'chore-champ-notifications',
    'chore-champ-pin',
    'chore-champ-currentUser',
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log('Cleaned up localStorage keys');
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const hasUserData = localStorage.getItem('chore-champ-users');
  return !!hasUserData;
}

/**
 * Check if migration has been completed
 */
export async function isMigrationComplete(): Promise<boolean> {
  try {
    const migrationStatus = localStorage.getItem('chore-champ-migration-status');
    return migrationStatus === 'completed';
  } catch {
    return false;
  }
}

/**
 * Set migration status
 */
export function setMigrationStatus(status: 'in-progress' | 'completed' | 'failed'): void {
  localStorage.setItem('chore-champ-migration-status', status);
}
