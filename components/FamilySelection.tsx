import React, { useState, useEffect } from 'react';
import { UsersIcon, ShieldCheckIcon, LockIcon } from './icons';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  points: number;
  avatarId: string;
}

interface FamilySelectionProps {
  members: FamilyMember[];
  onSelectMember: (memberId: string, role: 'parent' | 'child') => void;
  onAddMember: () => void;
}

const FamilySelection: React.FC<FamilySelectionProps> = ({
  members,
  onSelectMember,
  onAddMember,
}) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-full mb-4">
            <UsersIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Select Family Member
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Choose who's using Chore Champ today
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id, member.role)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${selectedMember === member.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{avatars[member.avatarId] || '👤'}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    {member.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {member.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Points</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">
                    {member.points}
                  </p>
                </div>
              </div>

              {member.role === 'parent' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Manage Family
                </div>
              )}

              {member.role === 'child' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <LockIcon className="w-4 h-4" />
                  Child Account
                </div>
              )}
            </button>
          ))}

          <button
            onClick={() => setShowAddModal(true)}
            className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <p className="font-medium text-slate-600 dark:text-slate-400">
              Add New Member
            </p>
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Add Family Member
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Add a new family member to the app.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  // TODO: Implement add member logic
                }}
                className="flex-1 bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilySelection;
