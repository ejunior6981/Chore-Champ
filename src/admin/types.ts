/**
 * Admin Portal Types
 * Defines types for admin portal functionality
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'child';
  avatarId: string;
  points: number;
  lastActiveAt: number;
  createdAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: string;
}

export interface AdminChore {
  id: string;
  name: string;
  description?: string;
  points: number;
  status: 'INCOMPLETE' | 'PENDING_APPROVAL' | 'COMPLETED';
  requiresApproval: boolean;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY';
  assignedTo?: string;
  assignedByName?: string;
  streak: number;
  lastCompletedDate?: string;
  createdAt: number;
}

export interface AdminReward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'entertainment' | 'food' | 'privilege' | 'experience' | 'custom';
  quantityLimit?: number;
  cooldownDays?: number;
  createdAt: number;
}

export interface AdminPointRequest {
  id: string;
  userId: string;
  userName: string;
  description: string;
  pointsRequested: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: number;
  notes?: string;
  createdAt: number;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export interface AdminFamily {
  id: string;
  name?: string;
  memberCount: number;
  parentCount: number;
  childCount: number;
  createdAt: number;
}

export interface AdminStats {
  totalUsers: number;
  totalChores: number;
  totalRewards: number;
  pendingRequests: number;
  completedChores: number;
}
