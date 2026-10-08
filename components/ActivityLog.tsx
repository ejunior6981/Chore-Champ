import React, { useMemo, useState } from 'react';
import { ActivityEvent, ActivityEventType, User } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, RefreshIcon, GiftIcon, StarIcon, ArrowDownIcon, PlusIcon, PencilIcon, ChevronDownIcon, ListIcon } from './icons';

interface ActivityLogProps {
  events: ActivityEvent[];
  users: User[];
}

type EventFilterType = 'ALL' | 'CHORE' | 'REWARD' | 'POINTS';

const eventConfig: Record<ActivityEventType, { icon: React.ReactNode; color: string; label: string }> = {
  [ActivityEventType.CHORE_COMPLETED]: { icon: <CheckCircleIcon className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-50', label: 'Chore Completed' },
  [ActivityEventType.CHORE_APPROVED]: { icon: <CheckCircleIcon className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100', label: 'Chore Approved' },
  [ActivityEventType.CHORE_DECLINED]: { icon: <XCircleIcon className="w-5 h-5" />, color: 'text-red-500 bg-red-50', label: 'Chore Declined' },
  [ActivityEventType.CHORE_MISSED]: { icon: <ClockIcon className="w-5 h-5" />, color: 'text-amber-500 bg-amber-50', label: 'Chore Missed' },
  [ActivityEventType.CHORE_RETRIED]: { icon: <RefreshIcon className="w-5 h-5" />, color: 'text-blue-500 bg-blue-50', label: 'Chore Retried' },
  [ActivityEventType.REWARD_REDEEMED]: { icon: <GiftIcon className="w-5 h-5" />, color: 'text-purple-500 bg-purple-50', label: 'Reward Redeemed' },
  [ActivityEventType.POINTS_AWARDED]: { icon: <StarIcon className="w-5 h-5" />, color: 'text-amber-500 bg-amber-50', label: 'Points Awarded' },
  [ActivityEventType.POINTS_DEDUCTED]: { icon: <ArrowDownIcon className="w-5 h-5" />, color: 'text-rose-500 bg-rose-50', label: 'Points Deducted' },
  [ActivityEventType.CHORE_CREATED]: { icon: <PlusIcon className="w-5 h-5" />, color: 'text-sky-500 bg-sky-50', label: 'Chore Created' },
  [ActivityEventType.CHORE_EDITED]: { icon: <PencilIcon className="w-5 h-5" />, color: 'text-slate-500 bg-slate-100', label: 'Chore Edited' },
};

const getEventTitle = (event: ActivityEvent): string => {
  switch (event.type) {
    case ActivityEventType.CHORE_COMPLETED:
      return `Completed "${event.choreName}"`;
    case ActivityEventType.CHORE_APPROVED:
      return `"${event.choreName}" approved`;
    case ActivityEventType.CHORE_DECLINED:
      return `"${event.choreName}" declined`;
    case ActivityEventType.CHORE_MISSED:
      return `Missed "${event.choreName}"`;
    case ActivityEventType.CHORE_RETRIED:
      return `Retrying "${event.choreName}"`;
    case ActivityEventType.REWARD_REDEEMED:
      return `Redeemed "${event.rewardName}"`;
    case ActivityEventType.POINTS_AWARDED:
      return event.description || 'Points awarded';
    case ActivityEventType.POINTS_DEDUCTED:
      return event.description || 'Points deducted';
    case ActivityEventType.CHORE_CREATED:
      return `Created "${event.choreName}"`;
    case ActivityEventType.CHORE_EDITED:
      return `Edited "${event.choreName}"`;
    default:
      return event.description || 'Unknown event';
  }
};

const matchesFilter = (event: ActivityEvent, filterType: EventFilterType): boolean => {
  if (filterType === 'ALL') return true;
  switch (filterType) {
    case 'CHORE':
      return [
        ActivityEventType.CHORE_COMPLETED,
        ActivityEventType.CHORE_APPROVED,
        ActivityEventType.CHORE_DECLINED,
        ActivityEventType.CHORE_MISSED,
        ActivityEventType.CHORE_RETRIED,
        ActivityEventType.CHORE_CREATED,
        ActivityEventType.CHORE_EDITED,
      ].includes(event.type);
    case 'REWARD':
      return event.type === ActivityEventType.REWARD_REDEEMED;
    case 'POINTS':
      return event.type === ActivityEventType.POINTS_AWARDED || event.type === ActivityEventType.POINTS_DEDUCTED;
    default:
      return true;
  }
};

const ActivityLog: React.FC<ActivityLogProps> = ({ events, users }) => {
  const [childFilter, setChildFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EventFilterType>('ALL');
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const childUsers = useMemo(() => users.filter(u => u.role === 'child'), [users]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => childFilter === 'all' || event.userId === childFilter)
      .filter(event => matchesFilter(event, typeFilter))
      .slice(0, 100);
  }, [events, childFilter, typeFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => { setShowChildDropdown(!showChildDropdown); setShowTypeDropdown(false); }}
            className="w-full sm:w-auto flex items-center justify-between space-x-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>
              {childFilter === 'all' ? 'All Children' : childUsers.find(c => c.id === childFilter)?.name || 'All Children'}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {showChildDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-30">
              <button
                onClick={() => { setChildFilter('all'); setShowChildDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${childFilter === 'all' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700'}`}
              >
                All Children
              </button>
              {childUsers.map(child => (
                <button
                  key={child.id}
                  onClick={() => { setChildFilter(child.id); setShowChildDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${childFilter === child.id ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700'}`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowChildDropdown(false); }}
            className="w-full sm:w-auto flex items-center justify-between space-x-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>
              {typeFilter === 'ALL' ? 'All Events' : typeFilter === 'CHORE' ? 'Chore Events' : typeFilter === 'REWARD' ? 'Reward Events' : 'Points Events'}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-30">
              {(['ALL', 'CHORE', 'REWARD', 'POINTS'] as EventFilterType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setShowTypeDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${typeFilter === t ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700'}`}
                >
                  {t === 'ALL' ? 'All Events' : t === 'CHORE' ? 'Chore Events' : t === 'REWARD' ? 'Reward Events' : 'Points Events'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <ListIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No events found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map(event => {
            const config = eventConfig[event.type];
            const user = users.find(u => u.id === event.userId);
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{getEventTitle(event)}</p>
                  <p className="text-xs text-slate-500">{config.label}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500">{user?.name || event.userName}</p>
                  <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  {event.points !== 0 && (
                    <p className={`text-sm font-bold ${event.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {event.points > 0 ? '+' : ''}{event.points} pts
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
