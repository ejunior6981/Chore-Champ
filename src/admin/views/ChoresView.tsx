import React, { useState } from 'react';
import { RocketIcon, CheckCircleIcon, PlusIcon, TrashIcon, PencilIcon } from './icons';

interface Chore {
  id: string;
  name: string;
  description?: string;
  points: number;
  status: 'INCOMPLETE' | 'PENDING_APPROVAL' | 'COMPLETED';
  requiresApproval: boolean;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY';
  assignedTo?: string;
  assignedByName?: string;
  streak: number;
  lastCompletedDate?: string;
}

interface ChoresViewProps {
  chores: Chore[];
  onAddChore: () => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
  onCompleteChore: (choreId: string) => void;
  onApproveChore: (choreId: string) => void;
  onDenyChore: (choreId: string) => void;
}

const ChoresView: React.FC<ChoresViewProps> = ({
  chores,
  onAddChore,
  onEditChore,
  onDeleteChore,
  onCompleteChore,
  onApproveChore,
  onDenyChore,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const statusColors = {
    INCOMPLETE: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  const recurrenceLabels = {
    NONE: 'One-time',
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Chores
          </h2>
          <button
            onClick={onAddChore}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Chore</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chores.map((chore) => (
            <div
              key={chore.id}
              className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    {chore.name}
                  </h3>
                  {chore.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {chore.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingChore(chore);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30"
                    aria-label={`Edit ${chore.name}`}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteChore(chore.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30"
                    aria-label={`Delete ${chore.name}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Points</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {chore.points}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Frequency</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {recurrenceLabels[chore.recurrence]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Streak</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {chore.streak}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[chore.status]}`}
                >
                  {chore.status.replace('_', ' ')}
                </span>
                {chore.requiresApproval && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Requires approval
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {chore.status === 'INCOMPLETE' && (
                  <button
                    onClick={() => onCompleteChore(chore.id)}
                    className="flex-1 bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                {chore.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => onApproveChore(chore.id)}
                      className="flex-1 bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onDenyChore(chore.id)}
                      className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Deny
                    </button>
                  </>
                )}
                {chore.status === 'COMPLETED' && (
                  <span className="flex-1 text-sm text-slate-500 dark:text-slate-400">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {chores.length === 0 && (
          <div className="text-center py-8">
            <RocketIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No chores yet. Add one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoresView;
