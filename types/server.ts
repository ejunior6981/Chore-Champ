import type { Notification } from './types';

export interface Notification extends Notification {
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
