import React, { useState } from 'react';
import { BellIcon, CheckIcon, XIcon } from './icons';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkRead: (notificationId: string) => void;
  onDeleteNotification: (notificationId: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkRead,
  onDeleteNotification,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const typeLabels = {
    CHORE_COMPLETION: 'Chore Completed',
    CHORE_APPROVED: 'Chore Approved',
    CHORE_DENIED: 'Chore Denied',
    POINT_REQUEST_APPROVED: 'Point Request Approved',
    POINT_REQUEST_DENIED: 'Point Request Denied',
    NEW_CHORE_ASSIGNED: 'New Chore Assigned',
    REWARD_REDEEMED: 'Reward Redeemed',
    DAILY_RESET: 'Daily Reset',
  };

  const typeIcons = {
    CHORE_COMPLETION: '✅',
    CHORE_APPROVED: '👍',
    CHORE_DENIED: '❌',
    POINT_REQUEST_APPROVED: '💰',
    POINT_REQUEST_DENIED: '📝',
    NEW_CHORE_ASSIGNED: '📋',
    REWARD_REDEEMED: '🎁',
    DAILY_RESET: '🔄',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Notifications
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors
                ${notification.read ? 'opacity-75' : 'opacity-100'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{typeIcons[notification.type] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {typeLabels[notification.type] || notification.type}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {notification.body}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => onMarkRead(notification.id)}
                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30"
                      aria-label="Mark as read"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(notification.id)}
                    className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30"
                    aria-label="Delete notification"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-8">
            <BellIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No notifications yet.
            </p>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Delete Notification
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteNotification(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
