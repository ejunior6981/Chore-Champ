import React from 'react';
import AvatarDisplay from './AvatarDisplay';

interface Child {
  id: string;
  name: string;
  avatarId: string;
  points: number;
  lastActiveAt?: number;
}

interface ChildManagementProps {
  children: Child[];
  onAddChild: () => void;
  onEditChild: (child: Child) => void;
  onDeleteChild: (childId: string) => void;
  onResetPoints: (childId: string) => void;
  className?: string;
}

const ChildManagement: React.FC<ChildManagementProps> = ({
  children,
  onAddChild,
  onEditChild,
  onDeleteChild,
  onResetPoints,
  className = '',
}) => {
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Family Members
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your family members and their points
        </p>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <AvatarDisplay avatar={child.avatarId} sizeClass="w-16 h-16" />
              
              <div className="flex-1">
                <div className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  {child.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Child Account
                </div>
                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {child.points} pts
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Last active: {formatTime(child.lastActiveAt)}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onEditChild(child)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30"
                  aria-label={`Edit ${child.name}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => onResetPoints(child.id)}
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-amber-900/30"
                  aria-label={`Reset points for ${child.name}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteChild(child.id)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30"
                  aria-label={`Delete ${child.name}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Child Button */}
      <div className="flex justify-center">
        <button
          onClick={onAddChild}
          className="
            bg-sky-500 hover:bg-sky-600 text-white font-semibold
            py-3 px-8 rounded-lg shadow-md transition-all
            transform hover:scale-105
          "
        >
          + Add Family Member
        </button>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Parents can manage children from this screen. Children can use their accounts from any device.
        </p>
      </div>
    </div>
  );
};

export default ChildManagement;
