

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
  assignedTo?: number; // User ID
  streak?: number;
  lastCompletedDate?: string; // ISO date string
}

export interface Reward {
  id: number;
  name:string;
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
  familyId: string;
  email: string;
  passwordHash: string;
  avatarId: string;
  pinHash?: string;
  settings?: string;
}

export enum PointRequestStatus {
    Pending = 'PENDING',
    Approved = 'APPROVED',
    Denied = 'DENIED',
}

export interface PointRequest {
    id: number;
    userId: number; // User ID of child who made the request
    description: string;
    points: number;
    status: PointRequestStatus;
}

export interface Notification {
  id: string;
  familyId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: NotificationData;
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

export interface NotificationData {
  choreId?: string;
  requestId?: string;
  rewardId?: string;
  choreName?: string;
  points?: number;
  action?: 'view' | 'complete' | 'redeem';
}