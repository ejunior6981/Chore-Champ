
import React, { useState } from 'react';
import { Chore, ChoreStatus, ChoreRecurrence, User } from '../../types';
import { StarIcon, CheckCircleIcon, RefreshIcon, InformationCircleIcon, PencilIcon, FireIcon, ShieldCheckIcon } from '../icons';
import OrbitBadge from './OrbitBadge';

interface MissionBriefProps {
  chore: Chore;
  onStateChange: (id: number, newStatus: ChoreStatus) => void;
  currentUser: User;
  onEdit: (chore: Chore) => void;
  onOverride: (id: number) => void;
}

const RecurrenceBadge: React.FC<{ recurrence: ChoreRecurrence }> = ({ recurrence }) => {
  if (recurrence === ChoreRecurrence.None) return null;

  return (
    <div className="absolute top-3 right-3 bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 border border-[#7C3AED]/30">
      <RefreshIcon className="w-3 h-3" />
      <span>{recurrence === ChoreRecurrence.Daily ? 'DAILY MISSION' : 'WEEKLY MISSION'}</span>
    </div>
  );
};

const MissionBrief: React.FC<MissionBriefProps> = ({ chore, onStateChange, currentUser, onEdit, onOverride }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  
  const cardStyles = {
    [ChoreStatus.Incomplete]: 'bg-[#F3F4F6] border-2 border-[#7C3AED]',
    [ChoreStatus.PendingApproval]: 'bg-[#FEF3C7] border-2 border-[#F97316]',
    [ChoreStatus.Completed]: 'bg-slate-200 text-slate-500 border-2 border-slate-300',
  };

  const titleStyles = {
    [ChoreStatus.Incomplete]: '',
    [ChoreStatus.PendingApproval]: 'text-[#92400E]',
    [ChoreStatus.Completed]: 'line-through',
  };

  const handleCompleteClick = () => {
    const nextStatus = chore.requiresApproval ? ChoreStatus.PendingApproval : ChoreStatus.Completed;
    onStateChange(chore.id, nextStatus);
  };

  const handleApproveClick = () => {
    onStateChange(chore.id, ChoreStatus.Completed);
  };

  const handleDenyClick = () => {
    onStateChange(chore.id, ChoreStatus.Incomplete);
  };

  return (
    <div className={`relative transition-all duration-300 rounded-xl shadow-lg flex flex-col p-4 ${cardStyles[chore.status]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-grow">
          <h3 className={`font-bold text-lg uppercase tracking-wide ${titleStyles[chore.status]}`}>{chore.name}</h3>
          {chore.description && (
            <button onClick={() => setIsDescriptionVisible(!isDescriptionVisible)} className="text-slate-400 hover:text-[#7C3AED]" title="Toggle description">
              <InformationCircleIcon className="w-6 h-6" />
            </button>
          )}
          {currentUser.role === 'parent' && (
            <button onClick={() => onEdit(chore)} className="text-slate-400 hover:text-[#7C3AED] p-1" title="Edit mission">
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <RecurrenceBadge recurrence={chore.recurrence} />
      </div>

      <div className="flex items-center space-x-4 mt-2">
        <div className="flex items-center space-x-1 text-[#FBBF24]">
          <StarIcon className="w-5 h-5" />
          <span className="font-bold text-lg">{chore.points} FUEL</span>
        </div>
        {chore.streak > 0 && (
          <OrbitBadge streak={chore.streak} />
        )}
      </div>
      
      <div className="mt-4">
        {chore.status === ChoreStatus.Incomplete && (
          <>
            {currentUser.role === 'parent' && chore.assignedTo ? (
              <button
                onClick={() => onOverride(chore.id)}
                className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-[#7C3AED] text-white hover:bg-[#6D28D9] flex items-center justify-center space-x-2 uppercase tracking-wide"
                aria-label="Override and mark as complete"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Override</span>
              </button>
            ) : (
              <button
                onClick={handleCompleteClick}
                className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-[#F97316] text-white hover:bg-[#EA580C] uppercase tracking-wide"
              >
                DO IT NOW!
              </button>
            )}
          </>
        )}

        {chore.status === ChoreStatus.PendingApproval && (
          <div className="text-center">
              <p className="text-[#92400E] font-bold mb-2 text-sm uppercase tracking-wide">Awaiting Approval</p>
              {currentUser.role === 'parent' && (
                  <div className="flex space-x-2">
                    <button
                        onClick={handleDenyClick}
                        className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 uppercase tracking-wide"
                    >
                        Deny
                    </button>
                    <button
                        onClick={handleApproveClick}
                        className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-[#F97316] text-white hover:bg-[#EA580C] uppercase tracking-wide"
                    >
                        Approve
                    </button>
                  </div>
              )}
          </div>
        )}

        {chore.status === ChoreStatus.Completed && (
          <button
            disabled
            className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-[#10B981] text-white cursor-not-allowed uppercase tracking-wide"
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>MISSION COMPLETE!</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default MissionBrief;
