import React, { useState } from 'react';
import { UserCircleIcon, LockIcon, ShieldCheckIcon } from './icons';

interface User {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatarId: string;
  points: number;
}

interface AccountSwitcherProps {
  users: User[];
  currentUser: User | null;
  onSwitchUser: (userId: string, role: 'parent' | 'child') => void;
  onSwitchToParent: () => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  users,
  currentUser,
  onSwitchUser,
  onSwitchToParent,
}) => {
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const avatars = {
    'boy-robot': '🤖',
    'boy-astronaut': '👨‍🚀',
    'boy-gamer': '🎮',
    'boy-scientist': '🧑‍🔬',
    'girl-princess': '👸',
    'girl-artist': '👩‍🎨',
    'girl-explorer': '🧭',
    'girl-musician': '👩‍🎤',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSwitchModal(true)}
        className="flex items-center gap-2 p-2 pr-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="text-2xl">{avatars[currentUser?.avatarId] || '👤'}</div>
        <div className="text-left">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {currentUser?.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {currentUser?.role}
          </p>
        </div>
      </button>

      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Switch Account
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Choose another account to use
            </p>

            <div className="space-y-3 mb-6">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSwitchUser(user.id, user.role);
                    setShowSwitchModal(false);
                  }}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4
                    ${user.id === currentUser?.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }
                  `}
                >
                  <div className="text-4xl">{avatars[user.avatarId] || '👤'}</div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {user.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Points</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                      {user.points}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {users.length === 1 && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Only one account available
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;
