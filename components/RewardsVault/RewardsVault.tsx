
import React from 'react';
import { Reward } from '../../types';
import { StarIcon, GiftIcon, LockIcon } from '../icons';

interface RewardsVaultProps {
  rewards: Reward[];
  userPoints: number;
  onRedeem: (id: number) => void;
  className?: string;
}

interface VaultItemProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (id: number) => void;
}

const VaultItem: React.FC<VaultItemProps> = ({ reward, userPoints, onRedeem }) => {
  const canRedeem = userPoints >= reward.points;

  return (
    <div className={`transition-all duration-300 rounded-xl shadow-lg flex flex-col p-4 ${canRedeem ? 'bg-white border-2 border-[#7C3AED]' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}>
      <div className="flex-grow mb-4">
        <h3 className="font-bold text-lg uppercase tracking-wide">{reward.name}</h3>
        <div className={`flex items-center space-x-1 mt-2 ${canRedeem ? 'text-[#FBBF24]' : 'text-slate-400'}`}>
          <StarIcon className="w-5 h-5" />
          <span className="font-bold text-lg">{reward.points} FUEL</span>
        </div>
      </div>
      <button
        onClick={() => onRedeem(reward.id)}
        disabled={!canRedeem}
        className={`w-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 uppercase tracking-wide ${canRedeem ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-slate-300 cursor-not-allowed'}`}
      >
        <GiftIcon className="w-5 h-5" />
        <span>REDEEM</span>
      </button>
    </div>
  );
};

const RewardsVault: React.FC<RewardsVaultProps> = ({ rewards, userPoints, onRedeem, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {rewards.map(reward => (
        <VaultItem 
          key={reward.id} 
          reward={reward} 
          userPoints={userPoints} 
          onRedeem={onRedeem} 
        />
      ))}
    </div>
  );
};

export default RewardsVault;
