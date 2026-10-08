
import React, { useState, useRef, useEffect } from 'react';
import { RocketIcon, BellIcon, ChevronDownIcon, LogoutIcon } from '../icons';
import { User, Notification } from '../../types';
import AvatarDisplay from '../AvatarDisplay';
import NotificationPanel from '../NotificationPanel';
import { RefreshCwIcon } from '../icons';

interface MissionControlHeaderProps {
  points: number;
  currentUser: User | undefined;
  allUsers: User[];
  onUserChange: (userId: number) => void;
  onEditProfile: () => void;
  onLogout: () => void;
  onResetData: () => void;
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
  isNotificationsOpen: boolean;
  notifications: Notification[];
  onClearNotifications: () => void;
  resetButton?: boolean;
}

const MissionControlHeader: React.FC<MissionControlHeaderProps> = ({ 
  points, 
  currentUser, 
  allUsers, 
  onUserChange, 
  onEditProfile, 
  onLogout, 
  onResetData, 
  unreadNotificationsCount, 
  onToggleNotifications, 
  isNotificationsOpen, 
  notifications, 
  onClearNotifications,
  resetButton = false 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (userId: number) => {
    onUserChange(userId);
    setIsUserMenuOpen(false);
  };
  
  // Calculate orb pulse intensity based on pending chores
  const pendingChores = 0; // Would be passed as prop in real implementation
  const pulseIntensity = Math.min(pendingChores * 2, 100); // Max 100% intensity

  return (
    <header className="bg-gradient-to-r from-[#1E3A5F] to-[#7C3AED] text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase">
          Mission Control
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Points display with rocket icon */}
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <RocketIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FBBF24]" />
            <span className="text-2xl sm:text-3xl font-bold text-white">{currentUser?.role === 'child' ? points : '–'}</span>
            <span className="text-xs sm:text-sm text-white/80 font-medium">FUEL</span>
          </div>
          
          {/* Notifications bell */}
          <div className="relative">
            <button 
              onClick={onToggleNotifications} 
              className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'}`}
              aria-label="Toggle notifications"
            >
              <BellIcon className="w-6 h-6 text-white"/>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#7C3AED]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <NotificationPanel
                notifications={notifications}
                onClose={onToggleNotifications}
                onClear={onClearNotifications}
              />
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
             <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center space-x-2 text-white bg-white/20 hover:bg-white/30 rounded-full pl-3 pr-2 py-2 text-sm font-medium transition-colors"
              >
                <AvatarDisplay avatar={currentUser?.avatar} sizeClass="w-8 h-8" />
                <span className="font-semibold">{currentUser?.name || '...'}</span>
                <ChevronDownIcon className="w-5 h-5 opacity-70"/>
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <ul>
                    {allUsers.map(user => (
                      <li key={user.id}>
                        <button
                          onClick={() => handleUserSelect(user.id)}
                          className={`w-full text-left flex items-center space-x-3 p-3 transition-colors ${currentUser?.id === user.id ? 'bg-[#EC4899]/10 text-[#7C3AED] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                          <AvatarDisplay avatar={user.avatar} sizeClass="w-8 h-8" />
                          <span>{user.name}</span>
                        </button>
                      </li>
                    ))}
                     {currentUser?.role === 'child' && (
                      <>
                        <hr className="my-1" />
                         <li>
                            <button
                                onClick={() => { onEditProfile(); setIsUserMenuOpen(false); }}
                                className="w-full text-left p-3 text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Edit Profile
                            </button>
                        </li>
                      </>
                    )}
                    {currentUser?.role === 'parent' && (
                      <>
                        <hr className="my-1" />
                        <li>
                            <button
                                onClick={onLogout}
                                className="w-full text-left p-3 text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                                <LogoutIcon className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </li>
                        <hr className="my-1" />
                        <li>
                            <button
                                onClick={onResetData}
                                className="w-full text-left p-3 text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
                            >
                                <RefreshCwIcon className="h-5 w-5" />
                                <span>Reset All Data</span>
                            </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MissionControlHeader;
