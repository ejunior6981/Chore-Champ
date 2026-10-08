export enum ChoreStatus {
  Incomplete = 'INCOMPLETE',
  PendingApproval = 'PENDING_APPROVAL',
  Completed = 'COMPLETED',
}

export enum ChoreRecurrence {
  None = 'NONE',
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
}

export interface Chore {
  id: number;
  name: string;
  points: number;
  status: ChoreStatus;
  requiresApproval: boolean;
  recurrence: ChoreRecurrence;
  description?: string;
  assignedTo?: number;
  streak?: number;
  lastCompletedDate?: string;
}

export interface Reward {
  id: number;
  name: string;
  points: number;
}

export enum View {
  Chores = 'CHORES',
  Rewards = 'REWARDS',
  Requests = 'REQUESTS',
  Users = 'USERS',
}

export type UserRole = 'parent' | 'child';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar: string | null;
  points: number;
}

export enum PointRequestStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Denied = 'DENIED',
}

export interface PointRequest {
  id: number;
  userId: number;
  description: string;
  points: number;
  status: PointRequestStatus;
}

export interface Notification {
  id: number;
  message: string;
  timestamp: number;
  read: boolean;
  targetRole: UserRole;
}
