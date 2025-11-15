
import React from 'react';
import { Notification } from '../types';
import { BellIcon } from './icons';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onClear: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onClear }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-700">Notifications</h3>
        {notifications.length > 0 && (
            <button onClick={onClear} className="text-sm text-sky-600 hover:underline font-semibold">Clear All</button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map(notification => (
              <li key={notification.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                <p className="text-slate-700 text-sm">{notification.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <BellIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
            <p className="font-semibold">All caught up!</p>
            <p className="text-sm">You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
