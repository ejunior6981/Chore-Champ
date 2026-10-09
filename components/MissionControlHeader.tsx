import React from 'react';
import { UserCircleIcon, BellIcon, LogoutIcon } from './icons';
import AvatarDisplay from './AvatarDisplay';

interface MissionControlHeaderProps {
  points: number;
  currentUser: any;
  allUsers: any[];
  onUserChange: (userId: number) => void;
  onEditProfile: () => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
  isNotificationsOpen: boolean;
  notifications: any[];
  onClearNotifications: () => void;
}

const MissionControlHeader: React.FC<MissionControlHeaderProps> = ({
  points,
  currentUser,
  allUsers,
  onUserChange,
  onEditProfile,
  onLogout,
  unreadNotificationsCount,
  onToggleNotifications,
  isNotificationsOpen,
  notifications,
  onClearNotifications,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 p-2 z-40 dark:bg-slate-800/80 dark:border-slate-700">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <AvatarDisplay avatar={currentUser?.avatar} sizeClass="w-12 h-12" />
          <div>
            <div className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {currentUser?.name}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {points} fuel points
            </div>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={onEditProfile} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30">
            <UserCircleIcon className="w-6 h-6" />
          </button>
          <button onClick={onToggleNotifications} className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30">
            <BellIcon className="w-6 h-6" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30">
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button onClick={onClearNotifications} className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            Clear All
          </button>
        </div>
      </div>
    </header>
  );
};

export default MissionControlHeader;
