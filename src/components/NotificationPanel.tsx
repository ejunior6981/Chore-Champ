import React from 'react';
import { Notification } from '../types';

export interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notifications</h2>
          <button onClick={onClose} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2">
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">No notifications</p>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-slate-800 dark:text-slate-100">{notification.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
