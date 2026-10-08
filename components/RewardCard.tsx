
import React from 'react';
import { Reward } from '../types.ts';
import { StarIcon, GiftIcon } from './icons';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (id: number) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, userPoints, onRedeem }) => {
  const canRedeem = userPoints >= reward.points;

  return (
    <div className={`transition-all duration-300 rounded-xl shadow-lg flex flex-col p-4 ${canRedeem ? 'bg-white' : 'bg-slate-100 text-slate-500'}`}>
      <div className="flex-grow mb-4">
        <h3 className="font-bold text-lg">{reward.name}</h3>
        <div className={`flex items-center space-x-1 mt-2 ${canRedeem ? 'text-amber-500' : 'text-slate-400'}`}>
          <StarIcon className="w-5 h-5" />
          <span className="font-semibold text-lg">{reward.points} Points</span>
        </div>
      </div>
      <button
        onClick={() => onRedeem(reward.id)}
        disabled={!canRedeem}
        className={`w-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${canRedeem ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-300 cursor-not-allowed'}`}
      >
        <GiftIcon className="w-5 h-5" />
        <span>Redeem</span>
      </button>
    </div>
  );
};

export default RewardCard;
