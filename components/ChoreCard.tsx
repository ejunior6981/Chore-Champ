

import React, { useState } from 'react';
import { Chore, ChoreStatus, ChoreRecurrence, User } from '../types.ts';
import { StarIcon, CheckCircleIcon, RefreshIcon, InformationCircleIcon, PencilIcon, FireIcon, ShieldCheckIcon } from './icons';

interface ChoreCardProps {
  chore: Chore;
  onStateChange: (id: number, newStatus: ChoreStatus) => void;
  currentUser: User;
  onEdit: (chore: Chore) => void;
  onOverride: (id: number) => void;
}

const RecurrenceBadge: React.FC<{ recurrence: ChoreRecurrence }> = ({ recurrence }) => {
  if (recurrence === ChoreRecurrence.None) return null;

  return (
    <div className="absolute top-3 right-3 bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
      <RefreshIcon className="w-3 h-3" />
      <span>{recurrence === ChoreRecurrence.Daily ? 'Daily' : 'Weekly'}</span>
    </div>
  );
};


const ChoreCard: React.FC<ChoreCardProps> = ({ chore, onStateChange, currentUser, onEdit, onOverride }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  
  const cardStyles = {
    [ChoreStatus.Incomplete]: 'bg-white',
    [ChoreStatus.PendingApproval]: 'bg-amber-50',
    [ChoreStatus.Completed]: 'bg-slate-200 text-slate-500',
  };

  const titleStyles = {
    [ChoreStatus.Incomplete]: '',
    [ChoreStatus.PendingApproval]: 'text-amber-800',
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
      <RecurrenceBadge recurrence={chore.recurrence} />
      <div className="flex-grow">
        <div className="flex items-start justify-between">
           <h3 className={`font-bold text-lg pr-2 ${titleStyles[chore.status]}`}>{chore.name}</h3>
            <div className="flex items-center space-x-2 flex-shrink-0">
               {chore.description && (
                <button onClick={() => setIsDescriptionVisible(!isDescriptionVisible)} className="text-slate-400 hover:text-sky-500">
                  <InformationCircleIcon className="w-6 h-6" />
                </button>
              )}
              {currentUser.role === 'parent' && (
                <button onClick={() => onEdit(chore)} className="text-slate-400 hover:text-sky-600">
                  <PencilIcon className="w-5 h-5" />
                </button>
              )}
           </div>
        </div>

        {isDescriptionVisible && chore.description && (
          <p className="text-sm text-slate-600 mt-2 bg-slate-100 p-2 rounded-md">{chore.description}</p>
        )}
        
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-1 text-amber-500">
            <StarIcon className="w-5 h-5" />
            <span className="font-semibold text-lg">{chore.points} Points</span>
          </div>
          {chore.streak > 0 && (
            <div className="flex items-center space-x-1 text-orange-500 font-semibold" title={`${chore.streak} day streak`}>
              <FireIcon className="w-5 h-5" />
              <span className="text-lg">{chore.streak}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        {chore.status === ChoreStatus.Incomplete && (
          <>
            {currentUser.role === 'parent' && chore.assignedTo ? (
              <button
                onClick={() => onOverride(chore.id)}
                className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center space-x-2"
                aria-label="Override and mark as complete"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Override Completion</span>
              </button>
            ) : (
              <button
                onClick={handleCompleteClick}
                className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-sky-500 text-white hover:bg-sky-600"
              >
                Mark as Done
              </button>
            )}
          </>
        )}

        {chore.status === ChoreStatus.PendingApproval && (
          <div className="text-center">
              <p className="text-amber-700 font-semibold mb-2 text-sm">Awaiting Approval</p>
              {currentUser.role === 'parent' && (
                  <div className="flex space-x-2">
                    <button
                        onClick={handleDenyClick}
                        className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                        Deny
                    </button>
                    <button
                        onClick={handleApproveClick}
                        className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-amber-500 text-white hover:bg-amber-600"
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
            className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-green-500 text-white cursor-not-allowed"
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Done!</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChoreCard;
