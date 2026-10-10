import type { Notification as AppNotification } from './notification';

export interface Notification extends AppNotification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: NotificationType;
}

export interface PointRequest {
  id: string;
  userId: number;
  description: string;
  points: number;
  status: PointRequestStatus;
}

export type PointRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface Chore {
  id: string;
  name: string;
  points: number;
  status: ChoreStatus;
  requiresApproval: boolean;
  recurrence: ChoreRecurrence;
  description?: string;
  assignedTo?: number;
}

export type ChoreStatus = 'INCOMPLETE' | 'COMPLETED' | 'APPROVED';
export type ChoreRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Reward {
  id: string;
  name: string;
  points: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'child';
  points: number;
  avatarId: string;
  familyId: string;
}
