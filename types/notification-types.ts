/**
 * Notification Types
 * Defines all notification-related types for the app
 */

export enum NotificationType {
  ChoreCompletion = 'CHORE_COMPLETION',
  ChoreApproved = 'CHORE_APPROVED',
  ChoreDenied = 'CHORE_DENIED',
  PointRequestApproved = 'POINT_REQUEST_APPROVED',
  PointRequestDenied = 'POINT_REQUEST_DENIED',
  NewChoreAssigned = 'NEW_CHORE_ASSIGNED',
  RewardRedeemed = 'REWARD_REDEEMED',
  DailyReset = 'DAILY_RESET',
}

export interface NotificationData {
  choreId?: string;
  requestId?: string;
  rewardId?: string;
  choreName?: string;
  points?: number;
  action?: 'view' | 'complete' | 'redeem';
}

export interface Notification {
  id: string;
  familyId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    type: NotificationType;
    choreId?: string;
    requestId?: string;
    rewardId?: string;
    choreName?: string;
    points?: number;
    action?: 'view' | 'complete' | 'redeem';
    tag?: string;
  };
  clickAction: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  badge: boolean;
  alert: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  badge: boolean;
  alert: boolean;
}

export type NotificationAction = {
  action: string;
  title: string;
};

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon: string;
  badge?: string;
  data: any;
  actions?: NotificationAction[];
  silent?: boolean;
}
