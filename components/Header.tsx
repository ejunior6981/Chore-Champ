import React, { useState, useEffect } from 'react';
import { BellIcon, SettingsIcon, CogIcon } from './icons';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  notifications: Array<{ id: string; message: string; timestamp: number; read: boolean; type: string }>;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ notifications, onToggleNotifications, onOpenSettings }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleClearNotifications = () => {
    // Clear notifications logic here
    console.log('Clearing notifications');
  };

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Chore Champ</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <CogIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
