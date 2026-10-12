/**
 * Users View - Admin Portal
 * Manages family members
 */

import React from 'react';
import AvatarDisplay from '../../components/AvatarDisplay';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'child';
  avatarId: string;
  points: number;
  lastActiveAt: number;
  createdAt: number;
}

const UsersView: React.FC = () => {
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Family Members
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage family members, reset points, and configure settings.
        </p>
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-sm text-indigo-800 dark:text-indigo-300">
            This feature will be available in the next release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersView;
