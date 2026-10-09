import React, { useState } from 'react';
import { GiftIcon, PlusIcon, TrashIcon, PencilIcon } from './icons';

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  quantityLimit?: number;
  cooldownDays?: number;
}

interface RewardsViewProps {
  rewards: Reward[];
  onAddReward: () => void;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (rewardId: string) => void;
}

const RewardsView: React.FC<RewardsViewProps> = ({
  rewards,
  onAddReward,
  onEditReward,
  onDeleteReward,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const categories = {
    entertainment: '🎬 Entertainment',
    food: '🍕 Food',
    privilege: '⭐ Privilege',
    experience: '🎨 Experience',
    custom: '🎁 Custom',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Rewards
          </h2>
          <button
            onClick={onAddReward}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Reward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎁</div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {reward.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {categories[reward.category] || reward.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingReward(reward);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-blue-900/30"
                    aria-label={`Edit ${reward.name}`}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteReward(reward.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30"
                    aria-label={`Delete ${reward.name}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {reward.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Points</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {reward.points}
                  </span>
                </div>
                {reward.quantityLimit && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Quantity Limit
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {reward.quantityLimit}
                    </span>
                  </div>
                )}
                {reward.cooldownDays && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Cooldown
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {reward.cooldownDays} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-8">
            <GiftIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No rewards yet. Add one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsView;
