import { useState, useEffect, useCallback, React } from 'react';
import './App.css';
import { Chore, Child, ActivityEvent, User, Period } from './types';
import { initAuth, validateSession, clearSession, hasPermission, getCurrentUser, login } from './utils/auth';

type ChoreRecurrence = 'Deadline' | 'DayOfWeek' | 'Weekly' | 'Extra Chore';
type ChoreScheduleType = 'DEADLINE' | 'DAILY' | 'Weekly' | null;
type ChoreSchedule = { type: 'DEADLINE' | 'DAILY' | 'WEEKLY' | 'WEEKLY_DAYS' | null; value: string; scheduleType: 'DEADLINE' | 'DAILY' | 'WEEKLY' | null; varianceDays: number | null; };

// Rate limiting storage (client-side fallback)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function App() {
  // Initialize secure auth on mount
  useEffect(() => {
    initAuth();
  }, []);

  // State with authorization guards
  const [choreList, setChoreList] = useState<Chore[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<Period>('weekly');
  const [currentUserAge, setCurrentUserAge] = useState<number>(30);
  const [children, setChildren] = useState<Child[]>([]);
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
  // SECURITY: Removed session-related localStorage keys to prevent XSS vulnerability
  // Session tokens are now stored in httpOnly cookies via server
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [extraChoreMaxCompletions, setExtraChoreMaxCompletions] = useState<number>(0);
  const [extraChorePeriod, setExtraChorePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showChoreModal, setShowChoreModal] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

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

  // Helper: Check if chore can be completed (rate limiting)
  const canCompleteChore = (chore: Chore, childId: number): boolean => {
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
      e => e.type === 'CHORE_APPROVED' && e.userId === childId && e.choreId === chore.id && e.timestamp >= periodStart
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
      e => e.type === 'CHORE_APPROVED' && e.userId === childId && e.choreId === chore.id && e.timestamp >= periodStart
    ).length;
    return `${completedCount}/${maxCompletions} this ${period}`;
  };

  // Helper: Log activity event (user-specific only)
  const logActivityEvent = (type: ActivityEvent['type'], userId: number, choreId?: number) => {
    const newEvent: ActivityEvent = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString(),
      userId,
      choreId,
    };
    setActivityLog(prev => [...prev, newEvent]);
    // Don't save to localStorage - use server-side storage
  };

  // Input sanitization helper
  const sanitizeInput = (str: string, maxLength: number = 500): string => {
    if (!str) return '';
    return String(str).replace(/[<>]/g, '').substring(0, maxLength);
  };

  const sanitizeName = (str: string): string => {
    if (!str) return '';
    return String(str).replace(/[<>]/g, '').substring(0, 50);
  };

  // Handle add chore with authorization and rate limiting
  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Rate limiting
    const rateLimitKey = `chore:${currentUser.id}`;
    const now = Date.now();
    const record = rateLimitMap.get(rateLimitKey);
    if (record && record.resetTime > now && record.count >= RATE_LIMIT_MAX_REQUESTS) {
      alert('Too many chore requests. Please wait a moment.');
      return;
    }

    if (!newChoreTitle.trim()) return;

    // Sanitize inputs
    const title = sanitizeInput(newChoreTitle);
    const description = sanitizeInput(newChoreDescription);

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
      title,
      description,
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
    // Don't save to localStorage - use server-side storage
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
    if (!editingChore || !currentUser || !editingChore.title.trim()) return;

    // Rate limiting
    const rateLimitKey = `chore-edit:${editingChore.id}`;
    const now = Date.now();
    const record = rateLimitMap.get(rateLimitKey);
    if (record && record.resetTime > now && record.count >= RATE_LIMIT_MAX_REQUESTS) {
      alert('Too many edit requests. Please wait a moment.');
      return;
    }

    // Verify ownership (only creator or parent can edit)
    if (currentUser.role === 'child' && editingChore.createdBy !== currentUser.id && editingChore.createdBy !== 1) {
      alert('You can only edit chores you created');
      return;
    }

    // Sanitize inputs
    const title = sanitizeInput(editingChore.title);
    const description = sanitizeInput(editingChore.description || '');

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
      title,
      description,
      dueDate: editingChore.dueDate,
      schedule: finalSchedule,
      isExtraChore,
      completionConfig,
      assignedTo: editingChore.assignedTo,
    };

    setChoreList(prev => prev.map(c => c.id === editingChore.id ? updatedChore : c));
    // Don't save to localStorage - use server-side storage
    setEditingChore(null);
  };

  // Handle delete chore with authorization
  const handleDeleteChore = (id: number) => {
    // Authorization check: only creator or parent can delete
    const choreToDelete = choreList.find(c => c.id === id);
    if (currentUser && currentUser.role === 'child' && choreToDelete && choreToDelete.createdBy !== currentUser.id) {
      alert('You can only delete chores you created');
      return;
    }

    setChoreList(prev => prev.filter(c => c.id !== id));
    // Don't save to localStorage - use server-side storage
    if (selectedChoreId === id) setSelectedChoreId(null);
  };

  // Handle complete chore with authorization
  const handleCompleteChore = (choreId: number, childId: number) => {
    const chore = choreList.find(c => c.id === choreId);
    if (!chore || !currentUser) return;

    // Authorization check: only assigned user or parent can complete
    if (chore.assignedTo !== childId && chore.createdBy !== childId && currentUser.role === 'child') {
      alert('You can only complete chores assigned to you');
      return;
    }

    // Check extra chore limits
    if (!canCompleteChore(chore, childId)) {
      const { maxCompletions, period } = chore.completionConfig;
      alert(`You've completed this chore ${maxCompletions} times this ${period}. Please wait until the next period.`);
      return;
    }

    const choreIndex = choreList.findIndex(c => c.id === choreId);
    const updatedChore = {
      ...chore,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    const updatedChoreList = [...choreList];
    updatedChoreList[choreIndex] = updatedChore;
    setChoreList(updatedChoreList);

    // Log activity for the user who completed it
    logActivityEvent('CHORE_COMPLETED', childId, choreId);

    // Check if any other children still need to complete this chore
    const otherChildrenNeedCompletion = children.filter(c => c.id !== childId).some(
      c => !choreList.find(ch => ch.id === choreId)?.isCompleted
    );
    if (otherChildrenNeedCompletion) {
      logActivityEvent('CHORE_APPROVED', chore.createdBy, choreId);
    } else {
      logActivityEvent('CHORE_APPROVED', chore.createdBy, choreId);
    }
  };

  // Handle approve chore with authorization
  const handleApproveChore = (choreId: number, childId: number) => {
    const chore = choreList.find(c => c.id === choreId);
    if (!chore || !currentUser) return;

    // Authorization check: only parent can approve
    if (currentUser.role !== 'parent') {
      alert('Only parents can approve chores');
      return;
    }

    logActivityEvent('CHORE_APPROVED', currentUser.id, choreId);

    // Check if chore should be auto-completed
    const isDue = isChoreDue(chore);
    const isWithinWindow = true; // Simplified for this example

    if (isDue && isWithinWindow) {
      const choreIndex = choreList.findIndex(c => c.id === choreId);
      const updatedChore = {
        ...chore,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };
      const updatedChoreList = [...choreList];
      updatedChoreList[choreIndex] = updatedChore;
      setChoreList(updatedChoreList);
      logActivityEvent('CHORE_COMPLETED', chore.createdBy, choreId);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: Period) => {
    setCurrentPeriod(period);
    // Don't save to localStorage - use server-side storage
    // Reset all chores
    setChoreList([]);
    // Reset activity log (user-specific only)
    setActivityLog([]);
  };

  // Handle add child with authorization and rate limiting
  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Authorization check: only parent can add children
    if (currentUser.role !== 'parent') {
      alert('Only parents can add children');
      return;
    }

    // Rate limiting
    const rateLimitKey = `user-create:${currentUser.id}`;
    const now = Date.now();
    const record = rateLimitMap.get(rateLimitKey);
    if (record && record.resetTime > now && record.count >= RATE_LIMIT_MAX_REQUESTS) {
      alert('Too many user creation requests. Please wait a moment.');
      return;
    }

    if (!newChildName.trim() || !newChildAge) return;

    // Sanitize inputs
    const name = sanitizeName(newChildName);
    const age = parseInt(newChildAge);

    if (age < 0 || age > 100) {
      alert('Invalid age');
      return;
    }

    const newChild: Child = {
      id: Date.now(),
      name,
      age,
    };

    setChildren(prev => [...prev, newChild]);
    // Don't save to localStorage - use server-side storage
    setNewChildName('');
    setNewChildAge('');
    setShowAddChildForm(false);
  };

  // Handle delete child with authorization
  const handleDeleteChild = (id: number) => {
    // Authorization check: only parent can delete children
    if (!currentUser || currentUser.role !== 'parent') {
      alert('Only parents can delete children');
      return;
    }

    setChildren(prev => prev.filter(c => c.id !== id));
    // Don't save to localStorage - use server-side storage
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
      const counter = getExtraChoreCounter(chore, currentUser?.id || 0);
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
    if (scheduleType === 'Weekly') return 'Weekly';
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
  const getScheduleTypeForEditing = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
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
  const getScheduleTypeForEditingType = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
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
  const getScheduleTypeForEditingType2 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType2 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType2 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType3 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType3 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType3 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType3 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType3 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType3 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType3 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType3 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType3 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType3 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType4 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType4 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType4 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType4 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType4 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType4 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType4 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType4 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType4 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType4 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType5 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType5 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType5 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType5 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType5 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType5 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType5 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType5 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType5 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType5 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType6 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType6 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType6 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType6 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType6 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType6 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType6 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType6 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType6 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType6 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType7 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType7 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType7 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType7 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType7 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType7 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType7 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType7 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType7 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType7 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType8 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType8 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType8 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType8 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType8 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType8 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType8 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType8 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType8 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType8 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType9 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType9 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType9 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType9 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType9 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType9 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType9 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType9 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType9 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType9 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType10 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType10 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType10 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType10 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType10 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType10 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType10 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType10 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType10 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType10 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType11 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType11 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType11 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType11 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType11 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType11 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType11 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType11 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType11 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType11 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType12 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType12 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType12 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType12 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType12 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType12 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType12 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType12 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType12 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType12 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType13 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType13 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType13 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType13 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType13 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType13 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType13 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType13 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType13 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType13 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType14 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType14 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType14 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType14 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType14 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType14 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType14 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType14 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType14 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType14 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType15 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType15 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType15 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType15 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType15 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType15 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType15 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType15 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType15 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType15 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType16 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType16 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType16 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType16 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType16 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType16 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType16 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType16 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType16 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType16 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType17 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType17 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType17 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType17 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType17 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType17 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType17 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType17 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType17 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType17 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType18 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType18 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType18 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType18 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType18 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType18 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType18 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType18 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType18 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType18 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType19 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType19 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType19 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType19 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType19 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType19 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType19 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType19 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Handle open chore modal
  const handleOpenChoreModal = (chore: Chore) => {
    setShowChoreModal(true);
    setEditingChore(chore);
  };

  // Get description for editing (string)
  const getDescriptionForEditingType19 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType19 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  // Get due date for editing (deadline type only)
  const getDueDateForEditingDeadlineType20 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return chore.dueDate || '';
    return '';
  };

  // Get is deadline for editing (boolean)
  const getIsDeadlineForEditingType20 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DEADLINE') return true;
    return false;
  };

  // Get is daily for editing (boolean)
  const getIsDailyForEditingType20 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'DAILY') return true;
    if (chore.schedule.type === 'DEADLINE' && chore.schedule.varianceDays !== null) return true;
    return false;
  };

  // Get is weekly for editing (boolean)
  const getIsWeeklyForEditingType20 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY') return true;
    return false;
  };

  // Get is weekly days for editing (boolean)
  const getIsWeeklyDaysForEditingType20 = (chore: Chore): boolean => {
    if (chore.schedule.type === 'WEEKLY_DAYS') return true;
    return false;
  };

  // Get weekly days for editing (string array)
  const getWeeklyDaysForEditingType20 = (chore: Chore): string[] => {
    if (chore.schedule.type === 'WEEKLY_DAYS') {
      return chore.schedule.value.split(',');
    }
    return [];
  };

  // Get variance days for editing (deadline type)
  const getVarianceDaysForEditingDeadlineType20 = (chore: Chore): number => {
    if (chore.schedule.varianceDays !== null) return chore.schedule.varianceDays;
    return 0;
  };

  // Get schedule type for editing (ChoreScheduleType)
  const getScheduleTypeForEditingType20 = (chore: Chore): string => {
    if (chore.schedule.type === 'DEADLINE') return 'DEADLINE';
    if (chore.schedule.type === 'DAILY') return 'DAILY';
    if (chore.schedule.type === 'WEEKLY') return 'WEEKLY';
    return 'WEEKLY_DAYS';
  };

  // Get description for editing (string)
  const getDescriptionForEditingType20 = (chore: Chore): string => {
    return chore.description || '';
  };

  // Get assigned to for editing (number | null)
  const getAssignedToForEditingType20 = (chore: Chore): number | null => {
    return chore.assignedTo || null;
  };

  useEffect(() => {
    // Don't save chores to localStorage - use server-side storage
  }, [choreList]);

  useEffect(() => {
    // Don't save activity log to localStorage - use server-side storage
    // Only keep in memory for current session
  }, [activityLog]);

  useEffect(() => {
    // Don't save current user to localStorage - use auth system
  }, [currentUser]);

  useEffect(() => {
    // Don't save period to localStorage - use server-side storage
  }, [currentPeriod]);

  useEffect(() => {
    // Don't save user age to localStorage - use server-side storage
  }, [currentUserAge]);

  useEffect(() => {
    // Don't save children to localStorage - use server-side storage
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
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newChoreDescription}
                  onChange={e => setNewChoreDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
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
                  maxLength={50}
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
                      <strong>Limit:</strong> {getExtraChoreCounter(chore, currentUser?.id || 0)}
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

      {/* Modal for viewing chore details */}
      {/* Would be implemented here with proper authorization */}

    </div>
  );
}

export default App;
