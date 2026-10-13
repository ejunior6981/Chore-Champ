import React from 'react';
import { StarIcon, GiftIcon, InboxArrowDownIcon, UsersIcon, PencilIcon, TrashIcon, ListIcon, CogIcon, UserPlusIcon, UserCogIcon } from './icons';

interface HeaderProps {
  points: number;
  currentUser: any;
  allUsers: any[];
  onUserChange: (userId: number) => void;
  onEditProfile: () => void;
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
  isNotificationsOpen: boolean;
  notifications: any[];
  onClearNotifications: () => void;
  isParentViewingAsChild: boolean;
  onReturnToParent: () => void;
}

const Header: React.FC<HeaderProps> = ({
  points,
  currentUser,
  allUsers,
  onUserChange,
  onEditProfile,
  unreadNotificationsCount,
  onToggleNotifications,
  isNotificationsOpen,
  notifications,
  onClearNotifications,
  isParentViewingAsChild,
  onReturnToParent
}) => {
  const [isEditingAvatar, setIsEditingAvatar] = React.useState(false);
  const [newAvatar, setNewAvatar] = React.useState<string>(currentUser.avatar || '');

  const handleSaveAvatar = () => {
    onUserChange(currentUser.id);
    setIsEditingAvatar(false);
  };

  const handleCancelAvatar = () => {
    setIsEditingAvatar(false);
  };

  return (
    <header className="bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          {/* Left: User Info */}
          <div className="flex items-center space-x-4 flex-1">
            {isEditingAvatar ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onClick={() => setIsEditingAvatar(true)}
                  />
                </div>
                <input
                  type="text"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="bg-white/20 text-white font-mono text-sm px-3 py-1.5 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter avatar name (e.g., 'cat', 'dog')"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/50 bg-white/20 transition-transform group-hover:scale-105`}>{' '}</div>
                  <button
                    onClick={() => setIsEditingAvatar(true)}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{currentUser.name}</h1>
                  <p className="text-sm opacity-90 capitalize">{currentUser.role}</p>
                  {currentUser.role === 'child' && (
                    <p className="text-xs bg-white/20 inline-block px-2 py-0.5 rounded mt-1 font-mono">PIN: {currentUser.pin || 'None'}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2 ml-4">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg font-bold">
                <StarIcon className="w-4 h-4 inline mr-1" />
                {points}
              </div>
              {unreadNotificationsCount > 0 && (
                <div className="relative">
                  <button
                    onClick={onToggleNotifications}
                    className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors relative"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.7a8.967 8.967 0 01-2.312 6.022c1.135.27 2.31.434 3.5.499M16.06 9.055a2 2 0 11-3.694 0 2 2 0 013.694 0z" />
                    </svg>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadNotificationsCount}</span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 p-3 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <button onClick={onClearNotifications} className="text-sm text-sky-600 hover:text-sky-700">Clear All</button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-slate-500 text-sm">No notifications yet.</p>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg mb-2 ${notification.read ? 'bg-slate-50' : 'bg-sky-50'}`}
                          >
                            <p className="text-sm text-slate-700">{notification.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                      {isParentViewingAsChild && (
                        <button
                          onClick={onReturnToParent}
                          className="w-full mt-2 bg-sky-100 text-sky-700 text-sm font-semibold py-2 rounded-lg hover:bg-sky-200 transition-colors"
                        >
                          Return to Parent View
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {currentUser.role === 'parent' && !isParentViewingAsChild && (
                <button
                  onClick={onEditProfile}
                  className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                  title="Edit Profile"
                >
                  <UserCogIcon className="w-5 h-5" />
                </button>
              )}
              {currentUser.role === 'child' && (
                <button
                  onClick={() => onUserChange(currentUser.id)}
                  className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right: Quick Actions */}
          {(currentUser.role === 'parent' && !isParentViewingAsChild) && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const firstChild = allUsers.find(u => u.role === 'child');
                  if (firstChild) onUserChange(firstChild.id);
                }}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.25a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v2.25a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25zM15 12h.008v.008H15V12zm0 3h.008v.008H15v-.008zm0 3h.008v.008H15v-.008zm-3 6h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm-3 6h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm-3-18h.008v.008H6V12zm0 3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008zm-3 6h.008v.008H3v-.008zm0 3h.008v.008H3v-.008z" />
                </svg>
                <span>View as {allUsers.find(u => u.role === 'child')?.name || 'Child'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;