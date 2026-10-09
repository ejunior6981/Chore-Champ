import React, { useState } from 'react';
import { UsersIcon, PlusIcon, TrashIcon, PencilIcon, ShieldCheckIcon } from './icons';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  points: number;
  avatarId: string;
  lastActiveAt: number;
}

interface FamilyManagementProps {
  members: FamilyMember[];
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
  onResetPoints: (memberId: string) => void;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onResetPoints,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

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
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Family Members
          </h2>
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{avatars[member.avatarId] || '👤'}</div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {member.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30"
                    aria-label={`Edit ${member.name}`}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {member.role === 'parent' && (
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30"
                      aria-label={`Delete ${member.name}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Points</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {member.points}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Last Active</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(member.lastActiveAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onResetPoints(member.id)}
                  className="flex-1 bg-sky-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Reset Points
                </button>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No family members yet. Add one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyManagement;
