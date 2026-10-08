import React, { useState } from 'react';
import { Chore, ChoreStatus, ChoreRecurrence, User, ChoreSchedule } from '../types';
import { StarIcon, CheckCircleIcon, RefreshIcon, InformationCircleIcon, PencilIcon, FireIcon, ShieldCheckIcon, XCircleIcon, CalendarIcon, ClockIcon } from './icons';

interface ChoreCardProps {
  chore: Chore;
  onStateChange: (id: number, newStatus: ChoreStatus) => void;
  currentUser: User;
  onEdit: (chore: Chore) => void;
  onOverride: (id: number) => void;
}

const RecurrenceBadge: React.FC<{ recurrence: ChoreRecurrence; schedule?: ChoreSchedule }> = ({ recurrence, schedule }) => {
  if (recurrence === ChoreRecurrence.None && !schedule) return null;

  const getLabel = () => {
    switch (recurrence) {
      case ChoreRecurrence.Daily: return 'Daily';
      case ChoreRecurrence.Weekly: return 'Weekly';
      case ChoreRecurrence.Monthly:
        return `Monthly ${schedule?.scheduleType === 'SAME_DAY' ? '(Same Day)' : '(Fixed)'}`;
      case ChoreRecurrence.Yearly:
        return `Yearly ${schedule?.scheduleType === 'SAME_DAY' ? '(Same Date)' : '(Fixed)'}`;
      default:
        if (schedule?.type === 'DEADLINE') return `Due ${schedule.value}`;
        if (schedule?.type === 'DAY_OF_WEEK') return `Every ${schedule.value}`;
        return '';
    }
  };

  const getIcon = () => {
    if (recurrence === ChoreRecurrence.Monthly || recurrence === ChoreRecurrence.Yearly || schedule?.type === 'DEADLINE') {
      return <CalendarIcon className="w-3 h-3" />;
    }
    return <RefreshIcon className="w-3 h-3" />;
  };

  const getColorClass = () => {
    switch (recurrence) {
      case ChoreRecurrence.Daily: return 'bg-blue-100 text-blue-700';
      case ChoreRecurrence.Weekly: return 'bg-purple-100 text-purple-700';
      case ChoreRecurrence.Monthly:
      case ChoreRecurrence.Yearly:
        return 'bg-teal-100 text-teal-700';
      default:
        if (schedule) return 'bg-amber-100 text-amber-700';
        return 'bg-slate-100 text-slate-600';
    }
  };

  const label = getLabel();
  if (!label) return null;

  return (
    <div className={`bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1 ${getColorClass()}`}>
      {getIcon()}
      <span>{label}</span>
    </div>
  );
};

const ExtraChoreBadge: React.FC = () => (
  <div className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
    <StarIcon className="w-3 h-3" />
    <span>Extra Chore</span>
  </div>
);

const VarianceBadge: React.FC<{ schedule?: ChoreSchedule }> = ({ schedule }) => {
  if (!schedule || schedule.type !== 'DEADLINE' || !schedule.varianceDays) return null;
  return (
    <div className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
      <ClockIcon className="w-3 h-3" />
      <span>Complete by {schedule.value} (±{schedule.varianceDays} days)</span>
    </div>
  );
};

export const isWithinVarianceWindow = (schedule: ChoreSchedule | undefined): boolean => {
  if (!schedule || schedule.type !== 'DEADLINE' || !schedule.value) return true;
  const dueDate = new Date(schedule.value);
  dueDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const varianceMs = (schedule.varianceDays || 0) * 24 * 60 * 60 * 1000;
  const startWindow = new Date(dueDate.getTime() - varianceMs);
  const endWindow = new Date(dueDate.getTime() + varianceMs);
  return today >= startWindow && today <= endWindow;
};

const ChoreCard: React.FC<ChoreCardProps> = ({ chore, onStateChange, currentUser, onEdit, onOverride }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);

  const cardStyles = {
    [ChoreStatus.Incomplete]: 'bg-white',
    [ChoreStatus.PendingApproval]: 'bg-amber-50',
    [ChoreStatus.Completed]: 'bg-slate-200 text-slate-500',
    [ChoreStatus.RetryRequested]: 'bg-blue-50',
  };

  const titleStyles = {
    [ChoreStatus.Incomplete]: '',
    [ChoreStatus.PendingApproval]: 'text-amber-800',
    [ChoreStatus.Completed]: 'line-through',
    [ChoreStatus.RetryRequested]: 'text-blue-800',
  };

  const handleCompleteClick = () => {
    if (chore.schedule && !isWithinVarianceWindow(chore.schedule)) {
      if (chore.schedule.type === 'DEADLINE') {
        const dueDate = new Date(chore.schedule.value);
        dueDate.setHours(0, 0, 0, 0);
        const variance = chore.schedule.varianceDays || 0;
        const start = new Date(dueDate.getTime() - variance * 24 * 60 * 60 * 1000);
        const end = new Date(dueDate.getTime() + variance * 24 * 60 * 60 * 1000);
        alert(`This chore must be completed between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`);
        return;
      }
    }
    const nextStatus = chore.requiresApproval ? ChoreStatus.PendingApproval : ChoreStatus.Completed;
    onStateChange(chore.id, nextStatus);
  };

  const handleApproveClick = () => {
    if (chore.schedule && !isWithinVarianceWindow(chore.schedule)) {
      if (chore.schedule.type === 'DEADLINE') {
        const dueDate = new Date(chore.schedule.value);
        dueDate.setHours(0, 0, 0, 0);
        const variance = chore.schedule.varianceDays || 0;
        const start = new Date(dueDate.getTime() - variance * 24 * 60 * 60 * 1000);
        const end = new Date(dueDate.getTime() + variance * 24 * 60 * 60 * 1000);
        alert(`Can only approve within the completion window (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`);
        return;
      }
    }
    onStateChange(chore.id, ChoreStatus.Completed);
  };

  const handleDenyClick = () => {
    setShowDenyModal(true);
  };

  const handleDenyAndRemove = () => {
    setShowDenyModal(false);
    onStateChange(chore.id, ChoreStatus.Incomplete);
  };

  const handleDenyAndRetry = () => {
    setShowDenyModal(false);
    onStateChange(chore.id, ChoreStatus.RetryRequested);
  };

  return (
    <div className={`relative transition-all duration-300 rounded-xl shadow-lg flex flex-col p-4 ${cardStyles[chore.status]} ${chore.isExtraChore ? 'ring-2 ring-pink-300' : ''}`}>
      <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
        <RecurrenceBadge recurrence={chore.recurrence} schedule={chore.schedule} />
        {chore.isExtraChore && <ExtraChoreBadge />}
        <VarianceBadge schedule={chore.schedule} />
      </div>
      <div className="flex-grow">
        <div className="flex items-start justify-between pr-2">
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

        {chore.status === ChoreStatus.RetryRequested && (
          <div className="text-center">
            <p className="text-blue-700 font-semibold mb-2 text-sm">The chore was not complete. Please complete the chore and submit.</p>
            {currentUser.role === 'parent' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onStateChange(chore.id, ChoreStatus.Incomplete)}
                  className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Cancel Retry
                </button>
                <button
                  onClick={() => onStateChange(chore.id, ChoreStatus.Completed)}
                  className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600"
                >
                  Approve Retry
                </button>
              </div>
            )}
            {currentUser.role === 'child' && (
              <button
                onClick={handleCompleteClick}
                className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600"
              >
                Complete (Retry)
              </button>
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

      {showDenyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setShowDenyModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Deny Chore</h3>
              <p className="text-slate-600 mb-6">
                How would you like to deny <strong>"{chore.name}"</strong>?
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDenyAndRemove}
                  className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Deny & Remove
                </button>
                <button
                  onClick={handleDenyAndRetry}
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Deny & Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoreCard;
