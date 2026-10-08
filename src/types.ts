export interface ChoreSchedule {
  type: 'DEADLINE' | 'DAILY' | 'WEEKLY' | 'WEEKLY_DAYS' | null;
  value: string;
  scheduleType: 'DEADLINE' | 'DAILY' | 'WEEKLY' | null;
  varianceDays: number | null;
}

export interface Chore {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  schedule: ChoreSchedule;
  isExtraChore: boolean;
  completionConfig?: {
    maxCompletions: number;
    period: 'daily' | 'weekly' | 'monthly';
  } | null;
  assignedTo: number | null;
  createdBy: number;
  createdAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface User {
  id: number;
  name: string;
  age: number;
  role: 'parent' | 'child';
}

export type Period = 'weekly' | 'daily' | 'monthly';

export interface Child {
  id: number;
  name: string;
  age: number;
}

export interface ActivityEventType {
  CHORE_APPROVED: string;
  CHORE_COMPLETED: string;
}

export type ActivityEventTypeEnum = keyof ActivityEventType;

export interface ActivityEvent {
  id: number;
  type: ActivityEventTypeEnum;
  timestamp: string;
  userId: number;
  choreId?: number;
}
