import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chore, Reward, View, ChoreStatus, ChoreRecurrence, UserRole, PointRequest, PointRequestStatus, User, ActivityEvent, ActivityEventType, ChoreSchedule, ChoreScheduleType } from './types';
import type { Notification } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import ChoreCard from './components/ChoreCard';
import RewardCard from './components/RewardCard';
import PointRequestCard from './components/PointRequestCard';
import LoginScreen from './components/LoginScreen';
import ActivityLog from './components/ActivityLog';
import Modal from './components/Modal';
import ProfileModal from './components/ProfileModal';
import { PlusIcon, GiftIcon, StarIcon, CogIcon, InboxArrowDownIcon, UsersIcon, PencilIcon, TrashIcon, ListIcon } from './components/icons';
import AvatarDisplay from './components/AvatarDisplay';

const App: React.FC = () => {
  // Register service worker for PWA support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered:', registration);
          })
          .catch(error => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  // Persistent States
  const [users, setUsers] = useLocalStorage<User[]>('chore-champ-users', [
    { id: 1, name: 'Parent', role: 'parent', avatar: null, points: 0 },
    { id: 2, name: 'Alex', role: 'child', avatar: 'bot', points: 100, pin: '1234' },
    { id: 3, name: 'Emma', role: 'child', avatar: 'cat', points: 80, pin: '5678' },
  ]);
  const [currentUserId, setCurrentUserId] = useLocalStorage<number>('chore-champ-currentUser', 1);
  const [isParentViewingAsChild, setIsParentViewingAsChild] = useLocalStorage<boolean>('chore-champ-parent-viewing-as-child', false);
  const [parentUserId, setParentUserId] = useLocalStorage<number | null>('chore-champ-parent-user-id', 1);

  const [chores, setChores] = useLocalStorage<Chore[]>('chore-champ-chores', [
    { id: 1, name: 'Tidy up your room', points: 20, status: ChoreStatus.Incomplete, requiresApproval: true, recurrence: ChoreRecurrence.Daily, assignedTo: 2, description: "Put all toys in the toy box, make your bed, and put dirty clothes in the hamper." },
    { id: 2, name: 'Do homework', points: 25, status: ChoreStatus.Incomplete, requiresApproval: false, recurrence: ChoreRecurrence.Daily, assignedTo: 2 },
    { id: 3, name: 'Feed the pet', points: 10, status: ChoreStatus.Completed, requiresApproval: false, recurrence: ChoreRecurrence.Daily, assignedTo: 2 },
    { id: 4, name: 'Help with dinner', points: 15, status: ChoreStatus.Incomplete, requiresApproval: false, recurrence: ChoreRecurrence.None, description: "Help set the table before dinner." },
  ]);
  const [rewards, setRewards] = useLocalStorage<Reward[]>('chore-champ-rewards', [
    { id: 1, name: '1 hour of screen time', points: 50 },
    { id: 2, name: 'A trip to the park', points: 100 },
    { id: 3, name: 'Choose a movie for movie night', points: 75 },
    { id: 4, name: 'One scoop of ice cream', points: 30 },
  ]);
  const [pointRequests, setPointRequests] = useLocalStorage<PointRequest[]>('chore-champ-requests', []);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('chore-champ-notifications', []);
  const [activityLog, setActivityLog] = useLocalStorage<ActivityEvent[]>('chore-champ-activity-log', [
    { id: Date.now() - 3600000, type: ActivityEventType.POINTS_AWARDED, userId: 2, userName: 'Alex', points: 100, timestamp: Date.now() - 3600000, description: 'Welcome points!' },
    { id: Date.now() - 7200000, type: ActivityEventType.CHORE_COMPLETED, userId: 2, userName: 'Alex', choreName: 'Feed the pet', points: 10, timestamp: Date.now() - 7200000 }
  ]);

  // View States
  const [activeView, setActiveView] = useState<View>(View.Chores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'addChore' | 'editChore' | 'addReward' | 'addPoints' | 'requestPoints' | 'addUser' | 'editUser' | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedUserId = localStorage.getItem('chore-champ-currentUser');
    if (storedUserId) {
      const parsedId = parseInt(JSON.parse(storedUserId), 10);
      const usersList = localStorage.getItem('chore-champ-users');
      if (usersList) {
        const parsedUsers = JSON.parse(usersList) as User[];
        const user = parsedUsers.find(u => u.id === parsedId);
        if (user) {
          if (user.role === 'parent') return true;
          // If viewing as child under parent supervision, also authenticate
          const storedViewingAsChild = localStorage.getItem('chore-champ-parent-viewing-as-child');
          if (storedViewingAsChild === 'true') return true;
          // For regular child logins, check persistent session flag
          const sessionAuth = localStorage.getItem('chore-champ-session-auth');
          if (sessionAuth === 'true') return true;
        }
      }
    }
    return false;
  });

  // Form State
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState('');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState<string>('unassigned');
  const [newChoreRequiresApproval, setNewChoreRequiresApproval] = useState(false);
  const [newChoreRecurrence, setNewChoreRecurrence] = useState<ChoreRecurrence>(ChoreRecurrence.None);
  const [isExtraChore, setIsExtraChore] = useState(false);

  // Schedule Custom Fields State
  const [scheduleType, setScheduleType] = useState<'DEADLINE' | 'DAY_OF_WEEK' | 'NONE'>('NONE');
  const [scheduleValue, setScheduleValue] = useState('');
  const [choreScheduleType, setChoreScheduleType] = useState<ChoreScheduleType>(null);
  const [varianceDays, setVarianceDays] = useState<number>(0);

  // Reward Form State
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');

  // Manual Points Form State
  const [manualPoints, setManualPoints] = useState('');
  const [manualPointsUser, setManualPointsUser] = useState<string>('');

  // Point Request Form State
  const [requestPoints, setRequestPoints] = useState('');
  const [requestDescription, setRequestDescription] = useState('');

  // User Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('child');
  const [newUserPIN, setNewUserPIN] = useState('');
  const [pinError, setPinError] = useState('');

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || users[0], [users, currentUserId]);
  const childUsers = useMemo(() => users.filter(u => u.role === 'child'), [users]);
  const parentUsers = useMemo(() => users.filter(u => u.role === 'parent'), [users]);

  // Helper to log activity events
  const logActivityEvent = useCallback((type: ActivityEventType, userId: number, userName: string, details: { choreName?: string; rewardName?: string; points: number; description?: string }) => {
    const newEvent: ActivityEvent = {
      id: Date.now(),
      type,
      userId,
      userName,
      choreName: details.choreName,
      rewardName: details.rewardName,
      points: details.points,
      timestamp: Date.now(),
      description: details.description,
    };
    setActivityLog(prev => [newEvent, ...prev].slice(0, 100));
  }, [setActivityLog]);

  // PIN Validation Logic
  const validatePIN = (pin: string, userIdToIgnore?: number): string | null => {
    if (!/^\d{4,8}$/.test(pin)) {
      return 'PIN must be 4 to 8 digits and contain numbers only.';
    }
    if (/^(\d)\1+$/.test(pin)) {
      return 'PIN cannot have all the same digits (e.g., 1111).';
    }
    const hasDuplicate = users.some(u => u.id !== userIdToIgnore && u.pin === pin);
    if (hasDuplicate) {
      return 'This PIN is already in use by another family member.';
    }
    return null;
  };

  // Run auto-expiration and recurrence reset check (pure computation, applied once)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let changed = false;
    const missedChores: Chore[] = [];

    const nextChores = chores.map(chore => {
      // 1. Streak reset for incomplete daily/weekly chores
      if (chore.status === ChoreStatus.Incomplete && (chore.recurrence === ChoreRecurrence.Daily || chore.recurrence === ChoreRecurrence.Weekly)) {
        if (chore.lastCompletedDate) {
          const lastCompleted = new Date(chore.lastCompletedDate);
          lastCompleted.setHours(0, 0, 0, 0);
          const daysDiff = (today.getTime() - lastCompleted.getTime()) / (24 * 60 * 60 * 1000);
          const breakStreak = (chore.recurrence === ChoreRecurrence.Daily && daysDiff >= 2) ||
                              (chore.recurrence === ChoreRecurrence.Weekly && daysDiff >= 14);
          if (breakStreak && (chore.streak ?? 0) !== 0) {
            changed = true;
            return { ...chore, streak: 0 };
          }
        }
      }

      // 2. Custom deadline expiration
      if (chore.status === ChoreStatus.Incomplete && chore.schedule?.type === 'DEADLINE' && chore.schedule.value) {
        const dueDate = new Date(chore.schedule.value);
        dueDate.setHours(0, 0, 0, 0);
        const variance = chore.schedule.varianceDays || 0;
        const expiryDate = new Date(dueDate.getTime() + (variance + 1) * 24 * 60 * 60 * 1000);
        if (today >= expiryDate) {
          changed = true;
          missedChores.push(chore);
          return { ...chore, status: ChoreStatus.Completed };
        }
      }

      // 3. Monthly / Yearly resetting on reset date
      if (chore.status === ChoreStatus.Completed && (chore.recurrence === ChoreRecurrence.Monthly || chore.recurrence === ChoreRecurrence.Yearly)) {
        if (chore.schedule?.value) {
          const baseDate = new Date(chore.schedule.value);
          baseDate.setHours(0, 0, 0, 0);
          const resetDate = new Date(baseDate);

          if (chore.schedule.scheduleType === 'SAME_DAY') {
            if (chore.recurrence === ChoreRecurrence.Monthly) {
              resetDate.setMonth(resetDate.getMonth() + 1);
            } else {
              resetDate.setFullYear(resetDate.getFullYear() + 1);
            }
          } else {
            const daysToAdd = chore.recurrence === ChoreRecurrence.Monthly ? 30 : 365;
            resetDate.setDate(resetDate.getDate() + daysToAdd);
          }

          if (today >= resetDate) {
            changed = true;
            const updatedSchedule = {
              ...chore.schedule,
              value: resetDate.toISOString().split('T')[0]
            };
            return {
              ...chore,
              status: ChoreStatus.Incomplete,
              schedule: updatedSchedule,
              lastCompletedDate: undefined
            };
          }
        }
      }

      return chore;
    });

    if (changed) {
      setChores(nextChores);
      missedChores.forEach(chore => {
        const assignedUser = users.find(u => u.id === chore.assignedTo);
        logActivityEvent(
          ActivityEventType.CHORE_MISSED,
          chore.assignedTo || 1,
          assignedUser?.name || 'Unassigned',
          { choreName: chore.name, points: 0, description: 'Deadline passed without completion.' }
        );
      });
    }
  }, [chores, users, logActivityEvent, setChores]);

  const addNotification = useCallback((targetRole: UserRole, message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      targetRole,
      message,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [setNotifications]);

  // Session login / switches
  const handleLoginSuccess = (userId: number) => {
    setCurrentUserId(userId);
    setIsAuthenticated(true);
    setIsParentViewingAsChild(false);
    localStorage.setItem('chore-champ-session-auth', 'true');
  };

  const handleParentLoginBypass = () => {
    // Find first parent to login
    const parent = parentUsers[0];
    if (parent) {
      setCurrentUserId(parent.id);
      setIsAuthenticated(true);
      setIsParentViewingAsChild(false);
      localStorage.setItem('chore-champ-session-auth', 'true');
    }
  };

  const handleUserChange = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (!selectedUser) return;

    setIsNotificationsOpen(false);

    // If current authenticated user is parent, allow toggling seamlessly without typing PIN
    if (currentUser.role === 'parent' || isParentViewingAsChild) {
      if (selectedUser.role === 'child') {
        setIsParentViewingAsChild(true);
        if (currentUser.role === 'parent') {
          setParentUserId(currentUser.id);
        }
      } else {
        setIsParentViewingAsChild(false);
        setParentUserId(selectedUser.id);
      }
      setCurrentUserId(userId);
      setIsAuthenticated(true);
    } else {
      // Child toggling - requires PIN
      setCurrentUserId(userId);
      if (selectedUser.role === 'child') {
        setIsAuthenticated(false);
        localStorage.removeItem('chore-champ-session-auth');
      } else {
        // Going to parent requires no PIN, but authenticates automatically as parent
        setIsAuthenticated(true);
        setIsParentViewingAsChild(false);
        localStorage.setItem('chore-champ-session-auth', 'true');
      }
    }

    // If a parent switches into a child while on a parent-only view, fall back to Chores
    if (selectedUser.role === 'child' && (activeView === View.Users || activeView === View.ActivityLog)) {
      setActiveView(View.Chores);
    }
  };

  const handleLogoutChild = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chore-champ-session-auth');
  };

  const handleSaveAvatar = (newAvatar: string) => {
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, avatar: newAvatar } : u));
    setIsProfileModalOpen(false);
  };

  const handleChoreStateChange = useCallback((choreId: number, newStatus: ChoreStatus) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    let updatedChore = { ...chore, status: newStatus };

    // 1. Completion & Points Logic
    if (newStatus === ChoreStatus.Completed && chore.status !== ChoreStatus.Completed) {
      const childId = chore.assignedTo || currentUser.id;
      const child = users.find(u => u.id === childId);

      if (child && child.role === 'child') {
        setUsers(prev => prev.map(u => u.id === child.id ? { ...u, points: u.points + chore.points } : u));
        
        logActivityEvent(
          ActivityEventType.CHORE_APPROVED,
          child.id,
          child.name,
          { choreName: chore.name, points: chore.points }
        );

        if (chore.status === ChoreStatus.PendingApproval) {
          addNotification('child', `Your chore "${chore.name}" was approved! You earned ${chore.points} points.`);
        }
      }

      // Streak logic (only daily / weekly)
      if (chore.recurrence === ChoreRecurrence.Daily || chore.recurrence === ChoreRecurrence.Weekly) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let newStreak = chore.streak || 0;
        const lastCompleted = chore.lastCompletedDate ? new Date(chore.lastCompletedDate) : null;
        if (lastCompleted) {
          lastCompleted.setHours(0, 0, 0, 0);
        }

        if (chore.recurrence === ChoreRecurrence.Daily) {
          if (lastCompleted) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            if (lastCompleted.getTime() === yesterday.getTime()) {
              newStreak++;
            } else if (lastCompleted.getTime() < yesterday.getTime()) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
        } else if (chore.recurrence === ChoreRecurrence.Weekly) {
          if (lastCompleted) {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            if (lastCompleted.getTime() >= sevenDaysAgo.getTime()) {
              newStreak++;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
        }
        updatedChore.streak = newStreak;
        updatedChore.lastCompletedDate = new Date().toISOString();
      }
    }
    
    // 2. Pending Approval notification
    if (newStatus === ChoreStatus.PendingApproval) {
      const childId = chore.assignedTo || currentUser.id;
      const child = users.find(u => u.id === childId);
      addNotification('parent', `A chore requires your approval: "${chore.name}".`);
      logActivityEvent(
        ActivityEventType.CHORE_COMPLETED,
        childId,
        child?.name || 'Child',
        { choreName: chore.name, points: 0 }
      );
    }

    // 3. Deny and Retry / Deny and Remove logic
    if (newStatus === ChoreStatus.Incomplete && chore.status === ChoreStatus.PendingApproval) {
      const childId = chore.assignedTo || currentUser.id;
      const child = users.find(u => u.id === childId);
      addNotification('child', `Your chore "${chore.name}" was denied and removed from list.`);
      logActivityEvent(
        ActivityEventType.CHORE_DECLINED,
        childId,
        child?.name || 'Child',
        { choreName: chore.name, points: 0, description: 'Deny and Remove chosen by parent.' }
      );
    }

    if (newStatus === ChoreStatus.RetryRequested && chore.status === ChoreStatus.PendingApproval) {
      const childId = chore.assignedTo || currentUser.id;
      const child = users.find(u => u.id === childId);
      addNotification('child', `Your chore "${chore.name}" needs a retry! Please check and resubmit.`);
      logActivityEvent(
        ActivityEventType.CHORE_RETRIED,
        childId,
        child?.name || 'Child',
        { choreName: chore.name, points: 0, description: 'Deny & Retry requested by parent.' }
      );
    }

    setChores(prev => prev.map(c => c.id === choreId ? updatedChore : c));
  }, [chores, setChores, addNotification, users, setUsers, currentUser.id, logActivityEvent]);

  const handleChoreOverride = useCallback((choreId: number) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore || chore.status === ChoreStatus.Completed) return;

    let updatedChore = { ...chore, status: ChoreStatus.Completed };

    const childId = chore.assignedTo;
    if (childId) {
      const child = users.find(u => u.id === childId);
      if (child) {
        setUsers(prev => prev.map(u => u.id === child.id ? { ...u, points: u.points + chore.points } : u));
        addNotification('child', `Your parent manually completed "${chore.name}" for you. You earned ${chore.points} points.`);
        logActivityEvent(
          ActivityEventType.CHORE_APPROVED,
          child.id,
          child.name,
          { choreName: chore.name, points: chore.points, description: 'Parent manually completed chore.' }
        );
      }
    }

    // Streak logic
    if (chore.recurrence === ChoreRecurrence.Daily || chore.recurrence === ChoreRecurrence.Weekly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newStreak = chore.streak || 0;
      const lastCompleted = chore.lastCompletedDate ? new Date(chore.lastCompletedDate) : null;
      if (lastCompleted) {
        lastCompleted.setHours(0, 0, 0, 0);
      }

      if (chore.recurrence === ChoreRecurrence.Daily) {
        if (lastCompleted) {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          if (lastCompleted.getTime() === yesterday.getTime()) {
            newStreak++;
          } else if (lastCompleted.getTime() < yesterday.getTime()) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      } else if (chore.recurrence === ChoreRecurrence.Weekly) {
        if (lastCompleted) {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          if (lastCompleted.getTime() >= sevenDaysAgo.getTime()) {
            newStreak++;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }
      updatedChore.streak = newStreak;
      updatedChore.lastCompletedDate = new Date().toISOString();
    }

    setChores(prev => prev.map(c => c.id === choreId ? updatedChore : c));
    addNotification('parent', `You manually completed the chore "${chore.name}".`);
  }, [chores, setChores, addNotification, users, setUsers, logActivityEvent]);

  const handleRedeemReward = useCallback((rewardId: number) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && currentUser && currentUser.role === 'child' && currentUser.points >= reward.points) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, points: u.points - reward.points } : u));
      addNotification('parent', `${currentUser.name} redeemed the reward: "${reward.name}"`);
      logActivityEvent(
        ActivityEventType.REWARD_REDEEMED,
        currentUser.id,
        currentUser.name,
        { rewardName: reward.name, points: -reward.points }
      );
      alert(`You've redeemed "${reward.name}"!`);
    }
  }, [rewards, currentUser, setUsers, logActivityEvent, addNotification]);

  const openModal = (content: 'addChore' | 'addReward' | 'addPoints' | 'requestPoints' | 'addUser') => {
    if (content === 'addPoints') {
      setManualPointsUser(childUsers[0]?.id.toString() || '');
    }
    setPinError('');
    setIsModalOpen(true);
    setModalContent(content);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setEditingChore(null);
    setNewChoreName('');
    setNewChorePoints('');
    setNewChoreDescription('');
    setNewChoreAssignedTo('unassigned');
    setNewChoreRequiresApproval(false);
    setNewChoreRecurrence(ChoreRecurrence.None);
    setIsExtraChore(false);
    setScheduleType('NONE');
    setScheduleValue('');
    setChoreScheduleType(null);
    setVarianceDays(0);
    setNewRewardName('');
    setNewRewardPoints('');
    setManualPoints('');
    setManualPointsUser('');
    setRequestPoints('');
    setRequestDescription('');
    setEditingUser(null);
    setNewUserName('');
    setNewUserRole('child');
    setNewUserPIN('');
    setPinError('');
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();

    let finalSchedule: ChoreSchedule | undefined = undefined;
    if (newChoreRecurrence === ChoreRecurrence.Monthly || newChoreRecurrence === ChoreRecurrence.Yearly) {
      finalSchedule = {
        type: 'DEADLINE',
        value: scheduleValue || new Date().toISOString().split('T')[0],
        scheduleType: choreScheduleType || 'SAME_DAY',
        varianceDays: null
      };
    } else if (scheduleType === 'DEADLINE') {
      finalSchedule = {
        type: 'DEADLINE',
        value: scheduleValue || new Date().toISOString().split('T')[0],
        scheduleType: null,
        varianceDays: varianceDays || 0
      };
    } else if (scheduleType === 'DAY_OF_WEEK') {
      finalSchedule = {
        type: 'DAY_OF_WEEK',
        value: scheduleValue || 'Monday',
        scheduleType: null,
        varianceDays: null
      };
    }

    const newChore: Chore = {
      id: Date.now(),
      name: newChoreName,
      points: parseInt(newChorePoints, 10),
      status: ChoreStatus.Incomplete,
      requiresApproval: newChoreRequiresApproval,
      recurrence: newChoreRecurrence,
      isExtraChore: isExtraChore,
      description: newChoreDescription,
      assignedTo: newChoreAssignedTo === 'unassigned' ? undefined : parseInt(newChoreAssignedTo, 10),
      schedule: finalSchedule
    };

    setChores(prev => [...prev, newChore]);
    logActivityEvent(
      ActivityEventType.CHORE_CREATED,
      currentUser.id,
      currentUser.name,
      { choreName: newChore.name, points: newChore.points, description: `Assigned to: ${newChoreAssignedTo === 'unassigned' ? 'Anyone' : users.find(u => u.id === newChore.assignedTo)?.name}` }
    );
    closeModal();
  };

  const handleOpenEditModal = (choreToEdit: Chore) => {
    setEditingChore(choreToEdit);
    setNewChoreName(choreToEdit.name);
    setNewChorePoints(choreToEdit.points.toString());
    setNewChoreDescription(choreToEdit.description || '');
    setNewChoreAssignedTo(choreToEdit.assignedTo?.toString() || 'unassigned');
    setNewChoreRequiresApproval(choreToEdit.requiresApproval);
    setNewChoreRecurrence(choreToEdit.recurrence);
    setIsExtraChore(choreToEdit.isExtraChore || false);

    if (choreToEdit.schedule) {
      if (choreToEdit.recurrence === ChoreRecurrence.Monthly || choreToEdit.recurrence === ChoreRecurrence.Yearly) {
        setScheduleType('DEADLINE');
        setScheduleValue(choreToEdit.schedule.value);
        setChoreScheduleType(choreToEdit.schedule.scheduleType);
      } else {
        setScheduleType(choreToEdit.schedule.type || 'NONE');
        setScheduleValue(choreToEdit.schedule.value);
        setVarianceDays(choreToEdit.schedule.varianceDays || 0);
      }
    } else {
      setScheduleType('NONE');
      setScheduleValue('');
      setVarianceDays(0);
      setChoreScheduleType(null);
    }

    setModalContent('editChore');
    setIsModalOpen(true);
  };

  const handleEditChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore) return;

    let finalSchedule: ChoreSchedule | undefined = undefined;
    if (newChoreRecurrence === ChoreRecurrence.Monthly || newChoreRecurrence === ChoreRecurrence.Yearly) {
      finalSchedule = {
        type: 'DEADLINE',
        value: scheduleValue || new Date().toISOString().split('T')[0],
        scheduleType: choreScheduleType || 'SAME_DAY',
        varianceDays: null
      };
    } else if (scheduleType === 'DEADLINE') {
      finalSchedule = {
        type: 'DEADLINE',
        value: scheduleValue || new Date().toISOString().split('T')[0],
        scheduleType: null,
        varianceDays: varianceDays || 0
      };
    } else if (scheduleType === 'DAY_OF_WEEK') {
      finalSchedule = {
        type: 'DAY_OF_WEEK',
        value: scheduleValue || 'Monday',
        scheduleType: null,
        varianceDays: null
      };
    }

    const updatedChore: Chore = {
      ...editingChore,
      name: newChoreName,
      points: parseInt(newChorePoints, 10),
      description: newChoreDescription,
      assignedTo: newChoreAssignedTo === 'unassigned' ? undefined : parseInt(newChoreAssignedTo, 10),
      requiresApproval: newChoreRequiresApproval,
      recurrence: newChoreRecurrence,
      isExtraChore: isExtraChore,
      schedule: finalSchedule
    };

    setChores(prev => prev.map(c => c.id === editingChore.id ? updatedChore : c));
    logActivityEvent(
      ActivityEventType.CHORE_EDITED,
      currentUser.id,
      currentUser.name,
      { choreName: updatedChore.name, points: updatedChore.points }
    );
    closeModal();
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    const newReward: Reward = {
      id: Date.now(),
      name: newRewardName,
      points: parseInt(newRewardPoints, 10),
    };
    setRewards(prev => [...prev, newReward]);
    closeModal();
  };

  const handleAddPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsToAdd = parseInt(manualPoints, 10);
    const targetUserId = parseInt(manualPointsUser, 10);
    const targetUser = users.find(u => u.id === targetUserId);

    if (!isNaN(pointsToAdd) && !isNaN(targetUserId) && targetUser) {
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, points: u.points + pointsToAdd } : u));
      
      logActivityEvent(
        pointsToAdd >= 0 ? ActivityEventType.POINTS_AWARDED : ActivityEventType.POINTS_DEDUCTED,
        targetUserId,
        targetUser.name,
        { points: pointsToAdd, description: `Parent manually adjusted points (${pointsToAdd >= 0 ? '+' : ''}${pointsToAdd}).` }
      );
      closeModal();
    }
  };

  const handleRequestPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: PointRequest = {
      id: Date.now(),
      userId: currentUser.id,
      description: requestDescription,
      points: parseInt(requestPoints, 10),
      status: PointRequestStatus.Pending,
    };
    setPointRequests(prev => [...prev, newRequest]);
    addNotification('parent', `${currentUser.name} sent a new point request.`);
    closeModal();
    alert("Your request has been sent to your parent for approval!");
  };

  const handlePointRequest = (requestId: number, newStatus: PointRequestStatus.Approved | PointRequestStatus.Denied, adjustedPoints?: number) => {
    const request = pointRequests.find(r => r.id === requestId);
    if (!request) return;

    const requestUser = users.find(u => u.id === request.userId);
    const finalPoints = adjustedPoints !== undefined ? adjustedPoints : request.points;

    if (newStatus === PointRequestStatus.Approved) {
      setUsers(prev => prev.map(u => u.id === request.userId ? { ...u, points: u.points + finalPoints } : u));
      addNotification('child', `Your request for "${request.description}" was approved! You earned ${finalPoints} points.`);
      
      logActivityEvent(
        ActivityEventType.POINTS_AWARDED,
        request.userId,
        requestUser?.name || 'Child',
        { points: finalPoints, description: `Request Approved: "${request.description}" (${finalPoints} pts)` }
      );
    } else {
      addNotification('child', `Your request for "${request.description}" was denied.`);
      logActivityEvent(
        ActivityEventType.POINTS_DEDUCTED,
        request.userId,
        requestUser?.name || 'Child',
        { points: 0, description: `Request Denied: "${request.description}"` }
      );
    }
    setPointRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus, points: finalPoints } : r));
  };
  
  const handleOpenEditUserModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setNewUserName(userToEdit.name);
    setNewUserRole(userToEdit.role);
    setNewUserPIN(userToEdit.pin || '');
    setPinError('');
    setModalContent('editUser');
    setIsModalOpen(true);
  };
  
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (newUserRole === 'child') {
      const error = validatePIN(newUserPIN);
      if (error) {
        setPinError(error);
        return;
      }
    }

    const newUser: User = {
      id: Date.now(),
      name: newUserName,
      role: newUserRole,
      avatar: newUserRole === 'child' ? 'bot' : null,
      points: 0,
      pin: newUserRole === 'child' ? newUserPIN : undefined,
    };

    setUsers(prev => [...prev, newUser]);
    closeModal();
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (newUserRole === 'child') {
      const error = validatePIN(newUserPIN, editingUser.id);
      if (error) {
        setPinError(error);
        return;
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === editingUser.id) {
        const wasChild = editingUser.role === 'child';
        const isNowParent = newUserRole === 'parent';
        
        if (wasChild && isNowParent) {
          setChores(chores => chores.map(c => c.assignedTo === u.id ? { ...c, assignedTo: undefined } : c));
        }

        return {
          ...u,
          name: newUserName,
          role: newUserRole,
          points: u.role !== newUserRole ? 0 : u.points,
          avatar: isNowParent ? null : (u.avatar || 'bot'),
          pin: newUserRole === 'child' ? newUserPIN : undefined,
        };
      }
      return u;
    }));
    
    closeModal();
  };

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (userId === currentUserId) {
      alert("You cannot delete the account you are currently using.");
      return;
    }

    if (userToDelete.role === 'parent' && parentUsers.length <= 1) {
      alert("You cannot delete the last parent account.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This will also remove their assigned chores and cannot be undone.`)) {
      if (userToDelete.role === 'child') {
        setChores(prev => prev.map(c => c.assignedTo === userId ? { ...c, assignedTo: undefined } : c));
        setPointRequests(prev => prev.filter(r => r.userId !== userId));
      }
      
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const resetDailyChores = () => {
    if (window.confirm("Are you sure you want to reset all daily chores?")) {
      setChores(prev => prev.map(c => {
        if (c.recurrence === ChoreRecurrence.Daily) {
          const newStreak = c.status === ChoreStatus.Incomplete ? 0 : c.streak;
          return { ...c, status: ChoreStatus.Incomplete, streak: newStreak };
        }
        return c;
      }));
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen) {
      setNotifications(prev => prev.map(n => n.targetRole === currentUser.role ? { ...n, read: true } : n));
    }
  };

  const handleClearNotifications = () => {
    setNotifications(prev => prev.filter(n => n.targetRole !== currentUser.role));
  };

  // Group and Filter Chores
  const sortedChores = useMemo(() => {
    const statusOrder = {
      [ChoreStatus.Incomplete]: 1,
      [ChoreStatus.RetryRequested]: 2,
      [ChoreStatus.PendingApproval]: 3,
      [ChoreStatus.Completed]: 4,
    };
    const userChores = (currentUser.role === 'parent' && !isParentViewingAsChild)
      ? chores 
      : chores.filter(c => c.assignedTo === currentUser.id || !c.assignedTo);

    return [...userChores].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [chores, currentUser, isParentViewingAsChild]);

  // Split into required vs extra chores
  const requiredChores = useMemo(() => sortedChores.filter(c => !c.isExtraChore), [sortedChores]);
  const extraChores = useMemo(() => sortedChores.filter(c => c.isExtraChore), [sortedChores]);

  const pendingRequestsCount = useMemo(() => {
    return pointRequests.filter(r => r.status === PointRequestStatus.Pending).length;
  }, [pointRequests]);

  const childRequests = useMemo(() => {
    return pointRequests
      .filter(r => r.userId === currentUser.id)
      .sort((a, b) => b.id - a.id);
  }, [pointRequests, currentUser.id]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => n.targetRole === currentUser.role && !n.read).length;
  }, [notifications, currentUser]);
  
  const currentUserNotifications = useMemo(() => {
    return notifications.filter(n => n.targetRole === currentUser.role);
  }, [notifications, currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Auth Guard
  if (!isAuthenticated && currentUser.role === 'child' && !isParentViewingAsChild) {
    return (
      <LoginScreen
        users={users}
        onLogin={handleLoginSuccess}
        onParentLogin={handleParentLoginBypass}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header
        points={currentUser.points}
        currentUser={currentUser}
        allUsers={users}
        onUserChange={handleUserChange}
        onEditProfile={() => setIsProfileModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotifications={handleToggleNotifications}
        isNotificationsOpen={isNotificationsOpen}
        notifications={currentUserNotifications}
        onClearNotifications={handleClearNotifications}
        isParentViewingAsChild={isParentViewingAsChild}
        onReturnToParent={() => {
          if (parentUserId) {
            handleUserChange(parentUserId);
          } else {
            const firstParent = parentUsers[0];
            if (firstParent) handleUserChange(firstParent.id);
          }
        }}
      />
      <main className="flex-grow container mx-auto p-4 pb-28">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button onClick={() => setActiveView(View.Chores)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Chores ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              <StarIcon className="w-5 h-5" />
              <span>Chores</span>
            </button>
            <button onClick={() => setActiveView(View.Rewards)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Rewards ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              <GiftIcon className="w-5 h-5" />
              <span>Rewards</span>
            </button>
            <button onClick={() => setActiveView(View.Requests)} className={`relative flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Requests ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              <InboxArrowDownIcon className="w-5 h-5" />
              <span>Requests</span>
              {currentUser.role === 'parent' && !isParentViewingAsChild && pendingRequestsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{pendingRequestsCount}</span>
              )}
            </button>

            {(currentUser.role === 'parent' && !isParentViewingAsChild) && (
              <>
                <button onClick={() => setActiveView(View.Users)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Users ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                  <UsersIcon className="w-5 h-5" />
                  <span>Family</span>
                </button>
                <button onClick={() => setActiveView(View.ActivityLog)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.ActivityLog ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                  <ListIcon className="w-5 h-5" />
                  <span>Activity Log</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          {activeView === View.Chores && (
            <div className="space-y-8">
              {/* Required Chores */}
              <div>
                <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2 flex items-center space-x-2">
                  <StarIcon className="w-5 h-5 text-sky-500" />
                  <span>Required Chores</span>
                </h2>
                {requiredChores.length === 0 ? (
                  <p className="text-slate-500 italic py-4">No required chores at the moment.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requiredChores.map(chore => (
                      <ChoreCard key={chore.id} chore={chore} onStateChange={handleChoreStateChange} currentUser={currentUser} onEdit={handleOpenEditModal} onOverride={handleChoreOverride} />
                    ))}
                  </div>
                )}
              </div>

              {/* Extra Chores */}
              <div>
                <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2 flex items-center space-x-2">
                  <StarIcon className="w-5 h-5 text-pink-500" />
                  <span>Bonus Extra Chores</span>
                </h2>
                {extraChores.length === 0 ? (
                  <p className="text-slate-500 italic py-4">No extra bonus chores available right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {extraChores.map(chore => (
                      <ChoreCard key={chore.id} chore={chore} onStateChange={handleChoreStateChange} currentUser={currentUser} onEdit={handleOpenEditModal} onOverride={handleChoreOverride} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === View.Rewards && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} userPoints={currentUser.points} onRedeem={handleRedeemReward} />
              ))}
            </div>
          )}

          {activeView === View.Requests && (
            <>
              {currentUser.role === 'parent' && !isParentViewingAsChild ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pointRequests.length === 0 ? (
                    <p className="text-slate-500 italic col-span-full py-4 text-center">No point requests yet.</p>
                  ) : (
                    pointRequests.map(req => {
                      const requestingUser = users.find(u => u.id === req.userId);
                      return <PointRequestCard key={req.id} request={req} onAction={handlePointRequest} userName={requestingUser?.name} />;
                    })
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">My Point Requests</h2>
                  {childRequests.length === 0 ? (
                    <p className="text-slate-500 italic py-4">You haven't sent any point requests yet. Use the "+" button to request points for extra work!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {childRequests.map(req => (
                        <PointRequestCard key={req.id} request={req} onAction={() => {}} canApprove={false} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeView === View.ActivityLog && (currentUser.role === 'parent' && !isParentViewingAsChild) && (
            <ActivityLog events={activityLog} users={users} />
          )}

          {activeView === View.Users && (currentUser.role === 'parent' && !isParentViewingAsChild) && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Manage Family</h2>
                <button onClick={() => openModal('addUser')} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-sky-600 flex items-center justify-center space-x-2">
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Member</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between border border-slate-100">
                    <div className="flex items-center space-x-4">
                      <AvatarDisplay avatar={user.avatar} sizeClass="w-12 h-12" />
                      <div>
                        <p className="font-bold text-lg text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                        {user.role === 'child' && (
                          <p className="text-xs text-sky-600 font-mono mt-0.5">PIN: {user.pin || 'None'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleOpenEditUserModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" aria-label={`Edit ${user.name}`}>
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUserId || (user.role === 'parent' && parentUsers.length <= 1)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete ${user.name}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Buttons */}
      {(currentUser.role === 'parent' && !isParentViewingAsChild) && (
        <div className="fixed bottom-24 right-4 z-30">
          <button onClick={() => openModal('addPoints')} className="bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-transform transform hover:scale-110" aria-label="Assign points">
            <CogIcon className="w-8 h-8" />
          </button>
        </div>
      )}
      {((currentUser.role === 'child' || isParentViewingAsChild) && activeView !== View.Rewards) && (
        <div className="fixed bottom-24 right-4 z-30 flex flex-col space-y-2">
          {currentUser.role === 'child' && (
            <button onClick={handleLogoutChild} className="bg-slate-600 text-white rounded-full p-4 shadow-lg hover:bg-slate-700 transition-transform transform hover:scale-110" title="Logout session">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          )}
          <button onClick={() => openModal('requestPoints')} className="bg-fuchsia-600 text-white rounded-full p-4 shadow-lg hover:bg-fuchsia-700 transition-transform transform hover:scale-110" aria-label="Request points">
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Parent Footer Actions */}
      {(currentUser.role === 'parent' && !isParentViewingAsChild) && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-2 shadow-t-lg z-30">
          <div className="container mx-auto flex justify-center items-center space-x-2">
            <button onClick={() => openModal('addChore')} className="flex-1 text-sm bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Add Chore</span></button>
            <button onClick={() => openModal('addReward')} className="flex-1 text-sm bg-green-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-green-600 flex items-center justify-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Add Reward</span></button>
            <button onClick={resetDailyChores} className="flex-1 text-sm bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-amber-600">Reset Day</button>
          </div>
        </footer>
      )}
      
      {isProfileModalOpen && (currentUser.role === 'child' || isParentViewingAsChild) && (
        <ProfileModal
          currentAvatar={currentUser.avatar}
          onSave={handleSaveAvatar}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
      
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {(modalContent === 'addChore' || modalContent === 'editChore') && (
          <form onSubmit={modalContent === 'addChore' ? handleAddChore : handleEditChore}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">
              {modalContent === 'addChore' ? 'Add New Chore' : 'Edit Chore'}
            </h2>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <input type="text" value={newChoreName} onChange={e => setNewChoreName(e.target.value)} placeholder="Chore name" className="w-full p-3 border rounded-md bg-slate-50 text-slate-800" required />
              <textarea value={newChoreDescription} onChange={e => setNewChoreDescription(e.target.value)} placeholder="Description (optional)" className="w-full p-3 border rounded-md bg-slate-50 text-slate-800" rows={3}></textarea>
              <input type="number" value={newChorePoints} onChange={e => setNewChorePoints(e.target.value)} placeholder="Points" className="w-full p-3 border rounded-md bg-slate-50 text-slate-800" required min="1" />
              
              <div className="flex items-center justify-between">
                <label htmlFor="assignTo" className="text-slate-600 font-medium">Assign To:</label>
                <select id="assignTo" value={newChoreAssignedTo} onChange={e => setNewChoreAssignedTo(e.target.value)} className="p-2 border rounded-md bg-slate-50 text-slate-800">
                  <option value="unassigned">Anyone</option>
                  {childUsers.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="recurrence" className="text-slate-600 font-medium">Frequency:</label>
                <select id="recurrence" value={newChoreRecurrence} onChange={e => setNewChoreRecurrence(e.target.value as ChoreRecurrence)} className="p-2 border rounded-md bg-slate-50 text-slate-800">
                  <option value={ChoreRecurrence.None}>One-time</option>
                  <option value={ChoreRecurrence.Daily}>Daily</option>
                  <option value={ChoreRecurrence.Weekly}>Weekly</option>
                  <option value={ChoreRecurrence.Monthly}>Monthly</option>
                  <option value={ChoreRecurrence.Yearly}>Yearly</option>
                </select>
              </div>

              {/* Monthly / Yearly specific config */}
              {(newChoreRecurrence === ChoreRecurrence.Monthly || newChoreRecurrence === ChoreRecurrence.Yearly) && (
                <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Monthly/Yearly Reset Type:</p>
                  <div className="flex space-x-4">
                    <label className="flex items-center text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="choreScheduleType"
                        checked={choreScheduleType === 'SAME_DAY'}
                        onChange={() => setChoreScheduleType('SAME_DAY')}
                        className="h-4 w-4 text-sky-600 mr-2"
                      />
                      Same day next month/year
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="choreScheduleType"
                        checked={choreScheduleType === 'FIXED_SCHEDULE'}
                        onChange={() => setChoreScheduleType('FIXED_SCHEDULE')}
                        className="h-4 w-4 text-sky-600 mr-2"
                      />
                      Fixed schedule (30/365 days)
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start / Scheduled Date:</label>
                    <input
                      type="date"
                      value={scheduleValue}
                      onChange={e => setScheduleValue(e.target.value)}
                      className="w-full p-2 border rounded bg-white text-slate-800 text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* One-time Custom Schedule Config */}
              {newChoreRecurrence === ChoreRecurrence.None && (
                <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Custom Schedule Options:</p>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <label className="flex items-center text-sm font-medium text-slate-700">
                      <input type="radio" checked={scheduleType === 'NONE'} onChange={() => { setScheduleType('NONE'); setScheduleValue(''); }} className="mr-2 h-4 w-4 text-sky-600" />
                      None
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700">
                      <input type="radio" checked={scheduleType === 'DEADLINE'} onChange={() => { setScheduleType('DEADLINE'); setScheduleValue(new Date().toISOString().split('T')[0]); }} className="mr-2 h-4 w-4 text-sky-600" />
                      Deadline
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700">
                      <input type="radio" checked={scheduleType === 'DAY_OF_WEEK'} onChange={() => { setScheduleType('DAY_OF_WEEK'); setScheduleValue('Monday'); }} className="mr-2 h-4 w-4 text-sky-600" />
                      Day of Week
                    </label>
                  </div>

                  {scheduleType === 'DEADLINE' && (
                    <div className="space-y-2 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date:</label>
                        <input
                          type="date"
                          value={scheduleValue}
                          onChange={e => setScheduleValue(e.target.value)}
                          className="w-full p-2 border rounded bg-white text-slate-800 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Variance Window (± days):</label>
                        <select
                          value={varianceDays}
                          onChange={e => setVarianceDays(parseInt(e.target.value, 10))}
                          className="w-full p-2 border rounded bg-white text-slate-800 text-sm"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                            <option key={d} value={d}>{d === 0 ? 'Exact Due Date (0 days)' : `± ${d} days`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {scheduleType === 'DAY_OF_WEEK' && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Day:</label>
                      <select
                        value={scheduleValue}
                        onChange={e => setScheduleValue(e.target.value)}
                        className="w-full p-2 border rounded bg-white text-slate-800 text-sm"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-2 pt-2">
                <div className="flex items-center">
                  <input type="checkbox" id="isExtraChore" checked={isExtraChore} onChange={e => setIsExtraChore(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                  <label htmlFor="isExtraChore" className="ml-3 block text-sm font-medium text-slate-700">This is a bonus Extra Chore (one-time extra points)</label>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="requiresApproval" checked={newChoreRequiresApproval} onChange={e => setNewChoreRequiresApproval(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                  <label htmlFor="requiresApproval" className="ml-3 block text-sm font-medium text-slate-700">Requires parent approval</label>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md font-bold hover:bg-blue-600 transition-colors">
                {modalContent === 'addChore' ? 'Add Chore' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {modalContent === 'addReward' && (
          <form onSubmit={handleAddReward}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Add New Reward</h2>
            <input type="text" value={newRewardName} onChange={e => setNewRewardName(e.target.value)} placeholder="Reward name" className="w-full p-2 border rounded mb-2 bg-slate-50 text-slate-800" required />
            <input type="number" value={newRewardPoints} onChange={e => setNewRewardPoints(e.target.value)} placeholder="Points cost" className="w-full p-2 border rounded mb-4 bg-slate-50 text-slate-800" required min="1" />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded font-bold hover:bg-green-600">Add Reward</button>
          </form>
        )}

        {modalContent === 'addPoints' && (
          <form onSubmit={handleAddPoints}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Assign Points</h2>
            <p className="mb-4 text-slate-600 text-sm">Give extra points for a job well done or deduct points if needed (use a negative number).</p>
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="assignTo" className="text-slate-600 font-medium">For:</label>
              <select id="assignTo" value={manualPointsUser} onChange={e => setManualPointsUser(e.target.value)} className="p-2 border rounded-md bg-slate-50 text-slate-800">
                {childUsers.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
            <input type="number" value={manualPoints} onChange={e => setManualPoints(e.target.value)} placeholder="Enter points (e.g., 50 or -10)" className="w-full p-2 border rounded mb-4 bg-slate-50 text-slate-800" required />
            <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded font-bold hover:bg-purple-600">Assign Points</button>
          </form>
        )}

        {modalContent === 'requestPoints' && (
          <form onSubmit={handleRequestPoints}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Request Points</h2>
            <p className="mb-4 text-slate-600 text-sm">Did something extra? Describe what you did to earn more points!</p>
            <textarea value={requestDescription} onChange={e => setRequestDescription(e.target.value)} placeholder="Description (e.g., cleaned the garage)" className="w-full p-2 border rounded mb-2 bg-slate-50 text-slate-800" required />
            <input type="number" value={requestPoints} onChange={e => setRequestPoints(e.target.value)} placeholder="Points requested" className="w-full p-2 border rounded mb-4 bg-slate-50 text-slate-800" required min="1" />
            <button type="submit" className="w-full bg-fuchsia-500 text-white p-2 rounded font-bold hover:bg-fuchsia-600">Send Request</button>
          </form>
        )}

        {(modalContent === 'addUser' || modalContent === 'editUser') && (
          <form onSubmit={modalContent === 'addUser' ? handleAddUser : handleEditUser}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">
              {modalContent === 'addUser' ? 'Add Family Member' : `Edit ${editingUser?.name}`}
            </h2>
            <div className="space-y-4">
              <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Name" className="w-full p-3 border rounded-md bg-slate-50 text-slate-800" required />
              
              <div className="flex items-center justify-between">
                <label htmlFor="userRole" className="text-slate-600 font-medium">Role:</label>
                <select id="userRole" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="p-2 border rounded-md bg-slate-50 text-slate-800">
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {newUserRole === 'child' && (
                <div className="space-y-1">
                  <label htmlFor="userPIN" className="block text-sm font-medium text-slate-600">Child Login PIN (4-8 digits):</label>
                  <input
                    type="password"
                    id="userPIN"
                    value={newUserPIN}
                    onChange={e => { setNewUserPIN(e.target.value); setPinError(''); }}
                    placeholder="Enter numeric PIN"
                    className="w-full p-3 border rounded-md bg-slate-50 text-slate-800 font-mono tracking-widest text-lg"
                    maxLength={8}
                    required
                  />
                  {pinError && (
                    <p className="text-xs text-red-500 font-semibold mt-1">{pinError}</p>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500">Changing a user's role will reset their points.</p>
              <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md font-bold hover:bg-blue-600 transition-colors">
                {modalContent === 'addUser' ? 'Add Member' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default App;
