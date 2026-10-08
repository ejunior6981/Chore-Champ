// Type definitions for the Chore Master application

export interface Chore {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  schedule: {
    type: 'DEADLINE' | 'DAILY' | 'WEEKLY' | 'WEEKLY_DAYS' | null;
    value: string;
    scheduleType: 'DEADLINE' | 'DAILY' | 'WEEKLY' | null;
    varianceDays: number | null;
  };
  isExtraChore: boolean;
  completionConfig: {
    maxCompletions: number;
    period: 'daily' | 'weekly' | 'monthly';
  } | null;
  assignedTo: number | null;
  createdBy: number;
  createdAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Child {
  id: number;
  name: string;
  age: number;
  pin?: string; // In production, this would be hashed and stored server-side
}

export interface User {
  id: number;
  name: string;
  age: number;
  role: 'parent' | 'child';
  pinHash?: string; // In production, hashed PIN stored server-side
}

export interface ActivityEvent {
  id: number;
  type: 'CHORE_APPROVED' | 'CHORE_COMPLETED' | 'CHORE_DELETED' | 'USER_CREATED' | 'USER_DELETED';
  timestamp: string;
  userId: number;
  choreId?: number;
}

export interface Period {
  name: 'daily' | 'weekly' | 'monthly';
  value: string;
}
