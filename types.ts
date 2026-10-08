export enum ChoreStatus {
  Incomplete = 'INCOMPLETE',
  PendingApproval = 'PENDING_APPROVAL',
  Completed = 'COMPLETED',
  RetryRequested = 'RETRY_REQUESTED',
}

export enum ChoreRecurrence {
  None = 'NONE',
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
  Yearly = 'YEARLY',
}

export type ChoreScheduleType = 'SAME_DAY' | 'FIXED_SCHEDULE' | null;

export interface ChoreSchedule {
  type: 'DEADLINE' | 'DAY_OF_WEEK' | null;
  value: string;
  scheduleType: ChoreScheduleType;
  varianceDays: number | null;
}

export interface Chore {
  id: number;
  name: string;
  points: number;
  status: ChoreStatus;
  requiresApproval: boolean;
  recurrence: ChoreRecurrence;
  schedule?: ChoreSchedule;
  isExtraChore?: boolean;
  description?: string;
  assignedTo?: number;
  streak?: number;
  lastCompletedDate?: string;
  retryAllowed?: boolean;
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
  ActivityLog = 'ACTIVITY_LOG',
}

export type UserRole = 'parent' | 'child';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar: string | null;
  points: number;
  pin?: string;
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

export enum ActivityEventType {
  CHORE_COMPLETED = 'CHORE_COMPLETED',
  CHORE_APPROVED = 'CHORE_APPROVED',
  CHORE_DECLINED = 'CHORE_DECLINED',
  CHORE_MISSED = 'CHORE_MISSED',
  CHORE_RETRIED = 'CHORE_RETRIED',
  REWARD_REDEEMED = 'REWARD_REDEEMED',
  POINTS_AWARDED = 'POINTS_AWARDED',
  POINTS_DEDUCTED = 'POINTS_DEDUCTED',
  CHORE_CREATED = 'CHORE_CREATED',
  CHORE_EDITED = 'CHORE_EDITED',
}

export interface ActivityEvent {
  id: number;
  type: ActivityEventType;
  userId: number;
  userName: string;
  choreName?: string;
  rewardName?: string;
  points: number;
  timestamp: number;
  description?: string;
}

export interface ChildPIN {
  userId: number;
  pin: string;
}
