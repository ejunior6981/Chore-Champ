import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Chore, Child, ActivityEvent, User, Period } from './types';

type ChoreRecurrence = 'Deadline' | 'DayOfWeek' | 'Weekly' | 'Extra Chore';
type ChoreScheduleType = 'DEADLINE' | 'DAILY' | 'WEEKLY' | null;

function App() {
  const [choreList, setChoreList] = useState<Chore[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({ id: 1, name: 'Parent', age: 30 });
  const [currentPeriod, setCurrentPeriod] = useState<Period>('weekly');
  const [currentUserAge, setCurrentUserAge] = useState<number>(30);
  const [children, setChildren] = useState<Child[]>([
    { id: 1, name: 'Child 1', age: 8 },
    { id: 2, name: 'Child 2', age: 10 },
    { id: 3, name: 'Child 3', age: 12 },
  ]);
  const [selectedChoreId, setSelectedChoreId] = useState<number | null>(null);
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChoreDueDate, setNewChoreDueDate] = useState('');
  const [newChoreRecurrence, setNewChoreRecurrence] = useState<ChoreRecurrence>('Deadline');
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState<number | null>(null);
  const [showAddChoreForm, setShowAddChoreForm] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [varianceDays, setVarianceDays] = useState<number>(0);
  const [showVarianceSelector, setShowVarianceSelector] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [extraChoreMaxCompletions, setExtraChoreMaxCompletions] = useState<number>(0);
  const [extraChorePeriod, setExtraChorePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showChoreModal, setShowChoreModal] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  // Parse functions
  const parseChoreList = (): Chore[] => {
    const saved = localStorage.getItem('choreList');
    return saved ? JSON.parse(saved) : [];
  };

  const parseActivityLog = (): ActivityEvent[] => {
    const saved = localStorage.getItem('activityLog');
    return saved ? JSON.parse(saved) : [];
  };

  const parseCurrentUser = (): User => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : { id: 1, name: 'Parent', age: 30 };
  };

  const parseCurrentPeriod = (): Period => {
    const saved = localStorage.getItem('currentPeriod');
    return saved ? JSON.parse(saved) : 'weekly';
  };

  const parseCurrentUserAge = (): number => {
    const saved = localStorage.getItem('currentUserAge');
    return saved ? parseInt(saved) : 30;
  };

  const parseChildren = (): Child[] => {
    const saved = localStorage.getItem('children');
    return saved ? JSON.parse(saved) : [{ id: 1, name: 'Child 1', age: 8 }];
  };

  // Save functions
  const saveChoreList = (choreList: Chore[]) => {
    localStorage.setItem('choreList', JSON.stringify(choreList));
  };

  const saveActivityLog = (log: ActivityEvent[]) => {
    localStorage.setItem('activityLog', JSON.stringify(log));
  };

  const saveCurrentUser = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const saveCurrentPeriod = (period: Period) => {
    localStorage.setItem('currentPeriod', JSON.stringify(period));
  };

  const saveCurrentUserAge = (age: number) => {
    localStorage.setItem('currentUserAge', JSON.stringify(age));
  };

  const saveChildren = (children: Child[]) => {
    localStorage.setItem('children', JSON.stringify(children));
  };

  // Helper: Get today's day of week (0-6, Sunday=0)
  const getTodayDayOfWeek = (): number => {
    const today = new Date();
    return today.getDay();
  };

  // Helper: Get day name from index (0-6, Sunday=0)
  const getDayNameFromIndex = (index: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[index];
  };

  // Helper: Check if chore is due
  const isChoreDue = (chore: Chore): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (chore.schedule.type === 'DEADLINE') {
      const dueDate = new Date(chore.dueDate || '');
      return dueDate <= today;
    }

    if (chore.schedule.type === 'DAILY') {
      return true;
    }

    if (chore.schedule.type === 'WEEKLY') {
      const todayIndex = getTodayDayOfWeek();
      const targetDay = chore.schedule.value ? parseInt(chore.schedule.value) : 0;
      const variance = chore.schedule.varianceDays || 0;
      const diff = Math.abs(todayIndex - targetDay);
      const wrappedDiff = Math.min(diff, 7 - diff);
      return wrappedDiff <= variance;
    }

    return false;
  };

  // Helper: Check if child is within weekly variance window
  const isWithinVarianceWindow = (schedule: ChoreSchedule | undefined, choreId: number): boolean => {
    if (!schedule || schedule.type === 'WEEKLY_DAYS') {
      const selectedDays = schedule.value.split(',');
      const today = new Date();
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const todayName = dayNames[today.getDay()];
      if (selectedDays.includes(todayName)) return true;
      const variance = schedule.varianceDays || 0;
      const dayIndex = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
      const todayIdx = today.getDay();
      for (const day of selectedDays) {
        const dayIdx = dayIndex[day];
        const diff = Math.abs(todayIdx - dayIdx);
        const wrappedDiff = Math.min(diff, 7 - diff);
        if (wrappedDiff <= variance) return true;
      }
      return false;
    }

    if (schedule.type === 'WEEKLY') {
      const todayIndex = getTodayDayOfWeek();
      const targetDay = schedule.value ? parseInt(schedule.value) : 0;
      const variance = schedule.varianceDays || 0;
      const diff = Math.abs(todayIndex - targetDay);
      const wrappedDiff = Math.min(diff, 7 - diff);
      return wrappedDiff <= variance;
    }

    return true;
  };

  // Helper: Check if extra chore can be completed
  const canCompleteExtraChore = (chore: Chore, childId: number): boolean => {
    if (!chore.isExtraChore || !chore.completionConfig) return true;
    const { maxCompletions, period } = chore.completionConfig;
    const now = Date.now();
    const msInPeriod = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    }[period];
    const periodStart = now - msInPeriod;
    const completedCount = activityLog.filter(
      e => e.type === 'CHORE_APPROVED' &&
           e.userId === childId &&
           e.choreId === chore.id &&
           e.timestamp >= periodStart
    ).length;
    return completedCount < maxCompletions;
  };

  // Helper: Get counter display for extra chores
  const getExtraChoreCounter = (chore: Chore, childId: number): string => {
    if (!chore.isExtraChore || !chore.completionConfig) return '';
    const { maxCompletions, period } = chore.completionConfig;
    const now = Date.now();
    const msInPeriod = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    }[period];
    const periodStart = now - msInPeriod;
    const completedCount = activityLog.filter(
      e => e.type === 'CHORE_APPROVED' &&
           e.userId === childId &&
           e.choreId === chore.id &&
           e.timestamp >= periodStart
    ).length;
    return `${completedCount}/${maxCompletions} this ${period}`;
  };

  // Helper: Log activity event
  const logActivityEvent = (type: ActivityEvent['type'], userId: number, choreId?: number) => {
    const newEvent: ActivityEvent = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString(),
      userId,
      choreId,
    };
    setActivityLog(prev => [...prev, newEvent]);
    saveActivityLog([...activityLog, newEvent]);
  };

  // Handle add chore
  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;

    let finalSchedule: ChoreSchedule;
    let isExtraChore = false;
    let completionConfig: Chore['completionConfig'] = null;

    if (newChoreRecurrence === 'Extra Chore') {
      isExtraChore = true;
      if (extraChoreMaxCompletions === 0) {
        alert('Please set max completions per period for extra chores');
        return;
      }
      completionConfig = {
        maxCompletions: extraChoreMaxCompletions,
        period: extraChorePeriod,
      };
    }

    if (newChoreRecurrence === 'Deadline') {
      finalSchedule = {
        type: 'DEADLINE',
        value: newChoreDueDate || '',
        scheduleType: 'DEADLINE',
        varianceDays: null,
      };
    } else if (newChoreRecurrence === 'DayOfWeek') {
      const todayIndex = getTodayDayOfWeek();
      finalSchedule = {
        type: 'DAILY',
        value: '',
        scheduleType: 'DAILY',
        varianceDays: null,
      };
      if (varianceDays > 0) {
        finalSchedule = {
          type: 'DEADLINE',
          value: '',
          scheduleType: 'DEADLINE',
          varianceDays: varianceDays,
        };
      }
    } else if (newChoreRecurrence === 'Weekly') {
      if (weeklyDays.length === 0) {
        alert('Please select at least one day of the week');
        return;
      }
      finalSchedule = {
        type: 'WEEKLY_DAYS',
        value: weeklyDays.join(','),
        scheduleType: 'WEEKLY',
        varianceDays: varianceDays || 0,
      };
    }

    const newChore: Chore = {
      id: Date.now(),
      title: newChoreTitle,
      description: newChoreDescription,
      dueDate: newChoreDueDate,
      schedule: finalSchedule,
      isExtraChore,
      completionConfig,
      assignedTo: newChoreAssignedTo || null,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };

    setChoreList(prev => [...prev, newChore]);
    saveChoreList([...choreList, newChore]);
    setNewChoreTitle('');
    setNewChoreDescription('');
    setNewChoreDueDate('');
    setNewChoreRecurrence('Deadline');
    setNewChoreAssignedTo(null);
    setShowAddChoreForm(false);
    setWeeklyDays([]);
    setVarianceDays(0);
    setExtraChoreMaxCompletions(0);
    setExtraChorePeriod('weekly');
  };

  // Handle edit chore
  const handleEditChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore || !editingChore.title.trim()) return;

    let finalSchedule: ChoreSchedule;
    let isExtraChore = editingChore.isExtraChore;
    let completionConfig = editingChore.completionConfig;

    if (editingChore.isExtraChore && editingChore.completionConfig) {
      if (extraChoreMaxCompletions === 0) {
        alert('Please set max completions per period for extra chores');
        return;
      }
      completionConfig = {
        maxCompletions: extraChoreMaxCompletions,
        period: editingChore.completionConfig.period,
      };
    }

    if (editingChore.schedule.type === 'DEADLINE') {
      finalSchedule = {
        type: 'DEADLINE',
        value: editingChore.dueDate || '',
        scheduleType: 'DEADLINE',
        varianceDays: editingChore.schedule.varianceDays,
      };
    } else if (editingChore.schedule.type === 'DAILY') {
      finalSchedule = {
        type: 'DAILY',
        value: '',
        scheduleType: 'DAILY',
        varianceDays: null,
      };
      if (editingChore.schedule.varianceDays && editingChore.schedule.varianceDays > 0) {
        finalSchedule = {
          type: 'DEADLINE',
          value: '',
          scheduleType: 'DEADLINE',
          varianceDays: editingChore.schedule.varianceDays,
        };
      }
    } else if (editingChore.schedule.type === 'WEEKLY_DAYS') {
      finalSchedule = {
        type: 'WEEKLY_DAYS',
        value: editingChore.schedule.value.split(',').join(','),
        scheduleType: 'WEEKLY',
        varianceDays: editingChore.schedule.varianceDays || 0,
      };
    }

    const updatedChore: Chore = {
      ...editingChore,
      title: editingChore.title,
      description: editingChore.description,
      dueDate: editingChore.dueDate,
      schedule: finalSchedule,
      isExtraChore,
      completionConfig,
      assignedTo: editingChore.assignedTo,
    };

    setChoreList(prev => prev.map(c => c.id === editingChore.id ? updatedChore : c));
    saveChoreList(choreList.map(c => c.id === editingChore.id ? updatedChore : c));
    setEditingChore(null);
  };

  // Handle delete chore
  const handleDeleteChore = (id: number) => {
    setChoreList(prev => prev.filter(c => c.id !== id));
    saveChoreList(choreList.filter(c => c.id !== id));
    if (selectedChoreId === id) setSelectedChoreId(null);
  };

  // Handle complete chore
  const handleCompleteChore = (choreId: number, childId: number) => {
    const chore = choreList.find(c => c.id === choreId);
    if (!chore) return;

    const assignedUser = chore.assignedTo || currentUser.id;
    const now = new Date();

    // Check if child can complete extra chore
    if (chore.isExtraChore && !canCompleteExtraChore(chore, childId)) {
      const { maxCompletions, period } = chore.completionConfig;
      alert(`You've completed this chore ${maxCompletions} times this ${period}. Please wait until the next period.`);
      return;
    }

    const choreIndex = choreList.findIndex(c => c.id === choreId);
    const updatedChore = {
      ...chore,
      isCompleted: true,
      completedAt: now.toISOString(),
    };
    const updatedChoreList = [...choreList];
    updatedChoreList[choreIndex] = updatedChore;
    setChoreList(updatedChoreList);
    saveChoreList(updatedChoreList);

    logActivityEvent('CHORE_COMPLETED', childId, choreId);

    // Check if any other children still need to complete this chore
    const otherChildrenNeedCompletion = children.filter(c => c.id !== childId).some(
      c => !choreList.find(ch => ch.id === choreId)?.isCompleted
    );
    if (otherChildrenNeedCompletion) {
      logActivityEvent('CHORE_APPROVED', assignedUser, choreId);
    } else {
      logActivityEvent('CHORE_APPROVED', assignedUser, choreId);
    }
  };

  // Handle approve chore
  const handleApproveChore = (choreId: number, childId: number) => {
    const chore = choreList.find(c => c.id === choreId);
    if (!chore) return;

    const assignedUser = chore.assignedTo || currentUser.id;
    logActivityEvent('CHORE_APPROVED', assignedUser, choreId);

    // Check if chore should be auto-completed
    const now = new Date();
    const isDue = isChoreDue(chore);
    const isWithinWindow = isWithinVarianceWindow(chore.schedule, choreId);

    if (isDue && isWithinWindow) {
      const choreIndex = choreList.findIndex(c => c.id === choreId);
      const updatedChore = {
        ...chore,
        isCompleted: true,
        completedAt: now.toISOString(),
      };
      const updatedChoreList = [...choreList];
      updatedChoreList[choreIndex] = updatedChore;
      setChoreList(updatedChoreList);
      saveChoreList(updatedChoreList);
      logActivityEvent('CHORE_COMPLETED', assignedUser, choreId);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: Period) => {
    setCurrentPeriod(period);
    saveCurrentPeriod(period);
    // Reset all chores
    setChoreList([]);
    saveChoreList([]);
    // Reset activity log
    setActivityLog([]);
    saveActivityLog([]);
  };

  // Handle add child
  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildAge) return;

    const newChild: Child = {
      id: Date.now(),
      name: newChildName,
      age: parseInt(newChildAge),
    };

    setChildren(prev => [...prev, newChild]);
    saveChildren([...children, newChild]);
    setNewChildName('');
    setNewChildAge('');
    setShowAddChildForm(false);
  };

  // Handle delete child
  const handleDeleteChild = (id: number) => {
    setChildren(prev => prev.filter(c => c.id !== id));
    saveChildren(children.filter(c => c.id !== id));
  };

  // Handle open chore modal
  const handleOpenChoreModal = (chore: Chore | null) => {
    setEditingChore(chore);
    setShowChoreModal(true);
  };

  // Handle close chore modal
  const handleCloseChoreModal = () => {
    setShowChoreModal(false);
    setEditingChore(null);
  };

  // Get due date display
  const getDueDateDisplay = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') {
      if (chore.dueDate) {
        const date = new Date(chore.dueDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } else if (chore.schedule.type === 'WEEKLY_DAYS') {
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const selectedDays = chore.schedule.value.split(',');
      return `Every ${selectedDays.join(', ')}`;
    }

    return 'Daily';
  };

  // Get recurrence badge
  const getRecurrenceBadge = (chore: Chore): React.ReactNode => {
    if (chore.isExtraChore) {
      const counter = getExtraChoreCounter(chore, currentUser.id);
      return (
        <span className="badge badge-secondary">
          Extra Chore • {counter}
        </span>
      );
    }

    if (chore.schedule.type === 'WEEKLY_DAYS') {
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const selectedDays = chore.schedule.value.split(',');
      return (
        <span className="badge badge-secondary">
          Weekly • {selectedDays.join(', ')}
        </span>
      );
    }

    if (chore.schedule.type === 'WEEKLY') {
      const dayIndex = parseInt(chore.schedule.value);
      const dayName = getDayNameFromIndex(dayIndex);
      return (
        <span className="badge badge-secondary">
          Weekly • {dayName}
        </span>
      );
    }

    if (chore.schedule.type === 'DEADLINE') {
      if (chore.dueDate) {
        const date = new Date(chore.dueDate);
        return (
          <span className="badge badge-secondary">
            Due {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        );
      }
    }

    return <span className="badge badge-secondary">Daily</span>;
  };

  // Get schedule type for display
  const getScheduleTypeDisplay = (schedule: ChoreSchedule): string => {
    if (schedule.type === 'DEADLINE') return 'deadline';
    if (schedule.type === 'DAILY') return 'daily';
    if (schedule.type === 'WEEKLY') return 'weekly';
    return 'unknown';
  };

  // Get schedule type label
  const getScheduleTypeLabel = (scheduleType: ChoreScheduleType): string => {
    if (scheduleType === 'DEADLINE') return 'Deadline';
    if (scheduleType === 'DAILY') return 'Daily';
    if (scheduleType === 'WEEKLY') return 'Weekly';
    return 'Unknown';
  };

  // Get due date for editing
  const getDueDateForEditing = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get recurrence for editing
  const getRecurrenceForEditing = (chore: Chore): ChoreRecurrence => {
    if (chore.isExtraChore) return 'Extra Chore';
    if (chore.schedule.type === 'WEEKLY_DAYS') return 'Weekly';
    if (chore.schedule.type === 'WEEKLY') return 'Weekly';
    if (chore.schedule.type === 'DEADLINE') return 'Deadline';
    return 'DayOfWeek';
  };

  // Get schedule value for editing
  const getScheduleValueForEditing = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    if (chore.schedule.type === 'WEEKLY_DAYS') return chore.schedule.value;
    if (chore.schedule.type === 'WEEKLY') return chore.schedule.value || '';
    return '';
  };

  // Get variance days for editing
  const getVarianceDaysForEditing = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get is extra chore for editing
  const getIsExtraChoreForEditing = (chore: Chore): boolean => {
    return chore.isExtraChore;
  };

  // Get completion config for editing
  const getCompletionConfigForEditing = (chore: Chore): { maxCompletions: number; period: 'daily' | 'weekly' | 'monthly' } | null => {
    if (chore.completionConfig) {
      return {
        maxCompletions: chore.completionConfig.maxCompletions,
        period: chore.completionConfig.period,
      };
    }
    return null;
  };

  // Get assigned to for editing
  const getAssignedToForEditing = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type)
  const getDueDateForEditingDeadline = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing
  const getIsDeadlineForEditing = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing
  const getIsDailyForEditing = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing
  const getIsWeeklyForEditing = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing
  const getIsWeeklyDaysForEditing = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing
  const getWeeklyDaysForEditing = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadline = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing
  const getScheduleTypeForEditing = (chore: Chore): ChoreScheduleType => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return null;
  };

  // Get description for editing
  const getDescriptionForEditing = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (null if unassigned)
  const getAssignedToForEditingOrNull = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType = (chore: Chore): ChoreScheduleType => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return null;
  };

  // Get description for editing (string)
  const getDescriptionForEditingType = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType2 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType2 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType2 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType2 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType2 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType2 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType2 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType2 = (chore: Chore): ChoreScheduleType => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return null;
  };

  // Get description for editing (string)
  const getDescriptionForEditingType2 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType2 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  useEffect(() => {
    saveChoreList(choreList);
  }, [choreList]);

  useEffect(() => {
    saveActivityLog(activityLog);
  }, [activityLog]);

  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveCurrentPeriod(currentPeriod);
  }, [currentPeriod]);

  useEffect(() => {
    saveCurrentUserAge(currentUserAge);
  }, [currentUserAge]);

  useEffect(() => {
    saveChildren(children);
  }, [children]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chore Master</h1>
        <div className="header-controls">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddChoreForm(true)}
          >
            Add Chore
          </button>
          <button
            className="btn"
            onClick={() => setShowPeriodSelector(true)}
          >
            Change Period
          </button>
          <button
            className="btn"
            onClick={() => setShowAddChildForm(true)}
          >
            Add Child
          </button>
        </div>
      </header>

      {showAddChoreForm && (
        <div className="modal-overlay" onClick={() => setShowAddChoreForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Chore</h2>
            <form onSubmit={handleAddChore}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newChoreTitle}
                  onChange={e => setNewChoreTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newChoreDescription}
                  onChange={e => setNewChoreDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Due Date (optional)</label>
                <input
                  type="date"
                  value={newChoreDueDate}
                  onChange={e => setNewChoreDueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Recurrence Type</label>
                <select
                  value={newChoreRecurrence}
                  onChange={e => setNewChoreRecurrence(e.target.value as ChoreRecurrence)}
                >
                  <option value="Deadline">Deadline</option>
                  <option value="DayOfWeek">Day of Week</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Extra Chore">Extra Chore</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To (optional)</label>
                <select
                  value={newChoreAssignedTo || ''}
                  onChange={e => setNewChoreAssignedTo(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Unassigned</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {newChoreRecurrence === 'Weekly' && (
                <div className="form-group">
                  <label>Select Days of the Week</label>
                  <div className="day-checkboxes">
                    {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                      <label key={day} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={weeklyDays.includes(day)}
                          onChange={e => {
                            if (e.target.checked) {
                              setWeeklyDays(prev => [...prev, day]);
                            } else {
                              setWeeklyDays(prev => prev.filter(d => d !== day));
                            }
                          }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {newChoreRecurrence === 'Weekly' && (
                <div className="form-group">
                  <label>Variance (± days from selected days)</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={varianceDays}
                    onChange={e => setVarianceDays(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {newChoreRecurrence === 'Extra Chore' && (
                <div className="form-group">
                  <label>Max Completions per Period</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={extraChoreMaxCompletions}
                    onChange={e => setExtraChoreMaxCompletions(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              )}

              {newChoreRecurrence === 'Extra Chore' && extraChoreMaxCompletions > 0 && (
                <div className="form-group">
                  <label>Period</label>
                  <select
                    value={extraChorePeriod}
                    onChange={e => setExtraChorePeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Chore</button>
                <button type="button" className="btn" onClick={() => setShowAddChoreForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddChildForm && (
        <div className="modal-overlay" onClick={() => setShowAddChildForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Child</h2>
            <form onSubmit={handleAddChild}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newChildAge}
                  onChange={e => setNewChildAge(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Child</button>
                <button type="button" className="btn" onClick={() => setShowAddChildForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPeriodSelector && (
        <div className="modal-overlay" onClick={() => setShowPeriodSelector(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Change Period</h2>
            <div className="period-selector">
              <button
                className={`btn ${currentPeriod === 'weekly' ? 'btn-primary' : ''}`}
                onClick={() => handlePeriodChange('weekly')}
              >
                Weekly
              </button>
              <button
                className={`btn ${currentPeriod === 'daily' ? 'btn-primary' : ''}`}
                onClick={() => handlePeriodChange('daily')}
              >
                Daily
              </button>
              <button
                className={`btn ${currentPeriod === 'monthly' ? 'btn-primary' : ''}`}
                onClick={() => handlePeriodChange('monthly')}
              >
                Monthly
              </button>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setShowPeriodSelector(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="app-main">
        <section className="chore-list">
          <h2>Chores</h2>
          {choreList.length === 0 ? (
            <p>No chores yet. Click "Add Chore" to create one.</p>
          ) : (
            choreList.map(chore => (
              <div
                key={chore.id}
                className={`chore-card ${chore.isCompleted ? 'completed' : ''}`}
              >
                <div className="chore-header">
                  <h3>{chore.title}</h3>
                  {getRecurrenceBadge(chore)}
                </div>
                {chore.description && (
                  <p className="chore-description">{chore.description}</p>
                )}
                <div className="chore-meta">
                  <span className="meta-item">
                    <strong>Due:</strong> {getDueDateDisplay(chore)}
                  </span>
                  <span className="meta-item">
                    <strong>Assigned:</strong> {chore.assignedTo ? children.find(c => c.id === chore.assignedTo)?.name || 'Unassigned' : 'Unassigned'}
                  </span>
                  {chore.isExtraChore && (
                    <span className="meta-item">
                      <strong>Limit:</strong> {getExtraChoreCounter(chore, currentUser.id)}
                    </span>
                  )}
                </div>
                <div className="chore-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenChoreModal(chore)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteChore(chore.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="children-section">
          <h2>Children</h2>
          {children.map(child => (
            <div key={child.id} className="child-card">
              <span>{child.name} ({child.age})</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteChild(child.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </section>

        <section className="activity-log">
          <h2>Activity Log</h2>
          {activityLog.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            activityLog.slice().reverse().map(event => (
              <div key={event.id} className="activity-item">
                <span>{new Date(event.timestamp).toLocaleString()}</span>
                <span className={`activity-type ${event.type === 'CHORE_APPROVED' ? 'approved' : 'completed'}`}>
                  {event.type === 'CHORE_APPROVED' ? 'Approved' : 'Completed'}
                </span>
                <span>by User {event.userId}</span>
                {event.choreId && (
                  <span>for Chore {choreList.find(c => c.id === event.choreId)?.title}</span>
                )}
              </div>
            ))
          )}
        </section>
      </main>

      {showChoreModal && editingChore && (
        <div className="modal-overlay" onClick={handleCloseChoreModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Chore</h2>
            <form onSubmit={handleEditChore}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingChore.title}
                  onChange={e => setEditingChore({ ...editingChore, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingChore.description || ''}
                  onChange={e => setEditingChore({ ...editingChore, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={getDueDateForEditingDeadline(editingChore)}
                  onChange={e => setEditingChore({ ...editingChore, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Recurrence Type</label>
                <select
                  value={getRecurrenceForEditing(editingChore)}
                  onChange={e => setEditingChore({ ...editingChore, recurrence: e.target.value as ChoreRecurrence })}
                >
                  <option value="Deadline">Deadline</option>
                  <option value="DayOfWeek">Day of Week</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Extra Chore">Extra Chore</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={getAssignedToForEditing(editingChore) || ''}
                  onChange={e => setEditingChore({ ...editingChore, assignedTo: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Unassigned</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {getRecurrenceForEditing(editingChore) === 'Weekly' && (
                <div className="form-group">
                  <label>Select Days of the Week</label>
                  <div className="day-checkboxes">
                    {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                      <label key={day} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={getWeeklyDaysForEditing(editingChore).includes(day)}
                          onChange={e => {
                            const days = getWeeklyDaysForEditing(editingChore);
                            if (e.target.checked) {
                              setEditingChore({ ...editingChore, schedule: { ...editingChore.schedule, value: [...days, day].join(',') } });
                            } else {
                              setEditingChore({ ...editingChore, schedule: { ...editingChore.schedule, value: days.filter(d => d !== day).join(',') } });
                            }
                          }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {getRecurrenceForEditing(editingChore) === 'Weekly' && (
                <div className="form-group">
                  <label>Variance (± days)</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={getVarianceDaysForEditing(editingChore)}
                    onChange={e => setEditingChore({ ...editingChore, schedule: { ...editingChore.schedule, varianceDays: parseInt(e.target.value) || null } })}
                  />
                </div>
              )}

              {getRecurrenceForEditing(editingChore) === 'Extra Chore' && (
                <div className="form-group">
                  <label>Max Completions per Period</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={getCompletionConfigForEditing(editingChore)?.maxCompletions || 0}
                    onChange={e => setEditingChore({ ...editingChore, completionConfig: { ...editingChore.completionConfig, maxCompletions: parseInt(e.target.value) || 0 } })}
                    required
                  />
                </div>
              )}

              {getRecurrenceForEditing(editingChore) === 'Extra Chore' && (
                <div className="form-group">
                  <label>Period</label>
                  <select
                    value={getCompletionConfigForEditing(editingChore)?.period || 'weekly'}
                    onChange={e => setEditingChore({ ...editingChore, completionConfig: { ...editingChore.completionConfig, period: e.target.value as 'daily' | 'weekly' | 'monthly' } })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn" onClick={handleCloseChoreModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
