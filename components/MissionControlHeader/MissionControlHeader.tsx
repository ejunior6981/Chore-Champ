import React, { useState } from 'react';
import { BellIcon, CogIcon } from '../icons';
import NotificationPanel from '../NotificationPanel';
import AvatarDisplay from '../AvatarDisplay';

interface NotificationPanelProps {
  notifications: Array<{ id: string; message: string; timestamp: number; read: boolean; type: string }>;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    console.log('Clear notifications');
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className="fixed top-4 right-4 p-3 bg-indigo-500 text-white rounded-full shadow-lg z-40 hover:bg-indigo-600 transition-colors"
      >
        <BellIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed top-16 right-4 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              ✕
            </button>
          </div>
          <div className="p-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className="p-2 bg-slate-50 dark:bg-slate-700 rounded">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

interface MissionControlHeaderProps {
  notifications: Array<{ id: string; message: string; timestamp: number; read: boolean; type: string }>;
  onClose: () => void;
  onToggle?: () => void;
}

const MissionControlHeader: React.FC<MissionControlHeaderProps> = ({ notifications, onClose, onToggle }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ avatarId: string; name: string } | null>(null);

  const handleToggleNotifications = () => {
    if (onToggle) onToggle();
    else setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Chore Champ</h1>
          {currentUser && (
            <div className="flex items-center gap-2">
              <AvatarDisplay avatarId={currentUser.avatarId} sizeClass="w-8 h-8" />
              <span className="font-semibold">{currentUser.name || '...'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <BellIcon className="w-5 h-5" />
          </button>

          {onToggle && (
            <button
              onClick={handleToggleNotifications}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <BellIcon className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleOpenProfile}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <CogIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isNotificationsOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <NotificationPanel notifications={notifications} onClose={handleCloseNotifications} />
        </div>
      )}

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Select Your Avatar
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Choose an avatar to represent yourself in the app.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCloseProfile}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save avatar logic here
                  handleCloseProfile();
                }}
                className="flex-1 bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export { NotificationPanel, MissionControlHeader };
