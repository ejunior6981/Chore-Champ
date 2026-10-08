

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chore, Reward, View, ChoreStatus, ChoreRecurrence, UserRole, PointRequest, PointRequestStatus, User } from './types';
import type { Notification } from './types';
import { useLocalStorage, useStorageReset } from './hooks/useLocalStorage';
import Header from './components/Header';
import ChoreCard from './components/ChoreCard';
import RewardCard from './components/RewardCard';
import PointRequestCard from './components/PointRequestCard';
import Modal from './components/Modal';
import ProfileModal from './components/ProfileModal';
import { PlusIcon, GiftIcon, StarIcon, CogIcon, InboxArrowDownIcon, UsersIcon, PencilIcon, TrashIcon, LockIcon, RefreshCwIcon } from './components/icons';
import AvatarDisplay from './components/AvatarDisplay';

const DEFAULT_PIN = '6981';

const App: React.FC = () => {
  const resetStorage = useStorageReset();

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

  // PIN Authentication
  const [pin, setPin] = useLocalStorage<string>('chore-champ-pin', DEFAULT_PIN);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmNewPin, setConfirmNewPin] = useState<string>('');

  // Initialize users with PIN check
  const [users, setUsers] = useLocalStorage<User[]>('chore-champ-users', [
    { id: 1, name: 'Parent', role: 'parent', avatar: null, points: 0 },
    { id: 2, name: 'Alex', role: 'child', avatar: 'bot', points: 100 },
  ]);

  const [currentUserId, setCurrentUserId] = useLocalStorage<number | null>('chore-champ-currentUser', null);

  // Check if we need to set initial user after users are loaded
  useEffect(() => {
    if (users.length > 0 && !currentUserId) {
      // No current user set, default to parent
      const parentUser = users.find(u => u.role === 'parent');
      if (parentUser) {
        setCurrentUserId(parentUser.id);
      }
    }
  }, [users, currentUserId, setCurrentUserId]);

  const validatePin = (entered: string): boolean => {
    return entered === pin;
  };

  const handlePinLogin = () => {
    if (validatePin(enteredPin)) {
      // PIN is correct, allow access
      setIsPinLocked(false);
      setEnteredPin('');
      setShowPinModal(false);
    } else {
      // PIN is incorrect
      setIsPinLocked(true);
      setEnteredPin('');
      // Show error notification
      const newNotification: Notification = {
        id: Date.now(),
        targetRole: 'parent',
        message: 'Incorrect PIN. Please try again.',
        timestamp: Date.now(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length >= 4 && newPin.length <= 6 && newPin === confirmNewPin) {
      setPin(newPin);
      setNewPin('');
      setConfirmNewPin('');
      setShowChangePinModal(false);
    } else {
      alert('PIN must be 4-6 digits and match. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setIsPinLocked(true);
    setEnteredPin('');
    setShowPinModal(true);
  };

  const [chores, setChores] = useLocalStorage<Chore[]>('chore-champ-chores', [
    { id: 1, name: 'Tidy up your room', points: 20, status: ChoreStatus.Incomplete, requiresApproval: true, recurrence: ChoreRecurrence.Daily, assignedTo: 2, description: "Put all toys in the toy box, make your bed, and put dirty clothes in the hamper." },
    { id: 2, name: 'Do homework', points: 25, status: ChoreStatus.Incomplete, requiresApproval: false, recurrence: ChoreRecurrence.Daily, assignedTo: 2 },
    { id: 3, name: 'Feed the pet', points: 10, status: ChoreStatus.Completed, requiresApproval: false, recurrence: ChoreRecurrence.Daily },
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

  const [activeView, setActiveView] = useState<View>(View.Chores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'addChore' | 'editChore' | 'addReward' | 'addPoints' | 'requestPoints' | 'addUser' | 'editUser' | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Form State
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState('');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState<string>('unassigned');
  const [newChoreRequiresApproval, setNewChoreRequiresApproval] = useState(false);
  const [newChoreRecurrence, setNewChoreRecurrence] = useState<ChoreRecurrence>(ChoreRecurrence.None);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');
  const [manualPoints, setManualPoints] = useState('');
  const [manualPointsUser, setManualPointsUser] = useState<string>('');
  const [requestPoints, setRequestPoints] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('child');


  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);
  const childUsers = useMemo(() => users.filter(u => u.role === 'child'), [users]);
  const parentUsers = useMemo(() => users.filter(u => u.role === 'parent'), [users]);

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

  // PIN modal component
  const PinModal = () => {
    if (!showPinModal || !isPinLocked) return null;

    return (
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)}>
        <h2 className="text-2xl font-bold mb-4 text-slate-700 flex items-center gap-2">
          <LockIcon className="w-6 h-6" />
          Parent PIN Required
        </h2>
        <p className="text-slate-600 mb-4">Please enter the parent PIN to continue.</p>
        <div className="flex gap-2 mb-6">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="password"
              maxLength={1}
              value={enteredPin[i] || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 6) {
                  setEnteredPin(prev => prev + value);
                }
              }}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-sky-500 focus:outline-none"
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPinModal(false)}
            className="flex-1 bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePinLogin}
            className="flex-1 bg-sky-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => setShowChangePinModal(true)}
            className="flex-1 bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Change PIN
          </button>
        </div>
      </Modal>
    );
  };

  // Change PIN modal component
  const ChangePinModal = () => {
    if (!showChangePinModal) return null;

    return (
      <Modal isOpen={showChangePinModal} onClose={() => setShowChangePinModal(false)}>
        <h2 className="text-2xl font-bold mb-4 text-slate-700 flex items-center gap-2">
          <LockIcon className="w-6 h-6" />
          Change PIN
        </h2>
        <p className="text-slate-600 mb-4">Enter a new 4-6 digit PIN.</p>
        <form onSubmit={handleChangePin} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="New PIN"
            className="w-full p-3 border rounded-md bg-slate-50 text-slate-800 text-center text-xl font-bold tracking-widest"
            required
          />
          <input
            type="password"
            maxLength={6}
            value={confirmNewPin}
            onChange={(e) => setConfirmNewPin(e.target.value)}
            placeholder="Confirm New PIN"
            className="w-full p-3 border rounded-md bg-slate-50 text-slate-800 text-center text-xl font-bold tracking-widest"
            required
          />
          <button type="submit" className="w-full bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
            Update PIN
          </button>
          <button
            type="button"
            onClick={() => setShowChangePinModal(false)}
            className="w-full bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        </form>
      </Modal>
    );
  };

  const handleUserChange = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser?.role === 'parent') {
      // Parent users need PIN authentication
      setIsPinLocked(true);
      setEnteredPin('');
      setShowPinModal(true);
    } else {
      // Non-parent users don't need PIN
      setIsPinLocked(false);
    }
    setCurrentUserId(userId);
    setIsNotificationsOpen(false); // Close notifications on user switch
    if (selectedUser?.role === 'child' && activeView === View.Requests) {
      setActiveView(View.Chores);
    }
  };

  const handleSaveAvatar = (newAvatar: string) => {
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, avatar: newAvatar } : u));
    setIsProfileModalOpen(false);
  };

  const handleChoreStateChange = useCallback((choreId: number, newStatus: ChoreStatus) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    let updatedChore = { ...chore, status: newStatus };

    if (newStatus === ChoreStatus.Completed && chore.status !== ChoreStatus.Completed) {
      const childId = chore.assignedTo || currentUser.id;
      const child = users.find(u => u.id === childId);

      if(child && child.role === 'child') {
          setUsers(prev => prev.map(u => u.id === child.id ? {...u, points: u.points + chore.points} : u));
           if (chore.status === ChoreStatus.PendingApproval) {
            addNotification('child', `Your chore "${chore.name}" was approved! You earned ${chore.points} points.`);
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
              newStreak++; // Continued streak
            } else if (lastCompleted.getTime() < yesterday.getTime()) {
              newStreak = 1; // Broken streak, starting new one
            }
            // If lastCompleted.getTime() === today.getTime(), streak is unchanged.
          } else {
            newStreak = 1; // First ever completion
          }
        } else if (chore.recurrence === ChoreRecurrence.Weekly) {
          if (lastCompleted) {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            if (lastCompleted.getTime() >= sevenDaysAgo.getTime()) {
              newStreak++; // Continued within the week
            } else {
              newStreak = 1; // Broken streak
            }
          } else {
            newStreak = 1; // First ever completion
          }
        }
        updatedChore.streak = newStreak;
        updatedChore.lastCompletedDate = new Date().toISOString();
      }
    }
    
    if (newStatus === ChoreStatus.PendingApproval) {
        addNotification('parent', `A chore requires your approval: "${chore.name}".`);
    }

    if (newStatus === ChoreStatus.Incomplete && chore.status === ChoreStatus.PendingApproval) {
        addNotification('child', `Your chore "${chore.name}" was denied. Please try again.`);
    }

    setChores(prev => prev.map(c => c.id === choreId ? updatedChore : c));
  }, [chores, setChores, addNotification, users, setUsers, currentUser.id]);

  const handleChoreOverride = useCallback((choreId: number) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore || chore.status === ChoreStatus.Completed) return;

    let updatedChore = { ...chore, status: ChoreStatus.Completed };

    const childId = chore.assignedTo;
    if (childId) {
        const child = users.find(u => u.id === childId);
        if (child) {
            setUsers(prev => prev.map(u => u.id === child.id ? {...u, points: u.points + chore.points} : u));
            addNotification('child', `Your parent manually completed "${chore.name}" for you. You earned ${chore.points} points.`);
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
  }, [chores, setChores, addNotification, users, setUsers]);

  const handleRedeemReward = useCallback((rewardId: number) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && currentUser && currentUser.role === 'child' && currentUser.points >= reward.points) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, points: u.points - reward.points} : u));
      alert(`You've redeemed "${reward.name}"!`);
    }
  }, [rewards, currentUser, setUsers]);

  const openModal = (content: 'addChore' | 'addReward' | 'addPoints' | 'requestPoints' | 'addUser') => {
    if (content === 'addPoints') {
      setManualPointsUser(childUsers[0]?.id.toString() || '');
    }
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
    setNewRewardName('');
    setNewRewardPoints('');
    setManualPoints('');
    setManualPointsUser('');
    setRequestPoints('');
    setRequestDescription('');
    setEditingUser(null);
    setNewUserName('');
    setNewUserRole('child');
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    const newChore: Chore = {
      id: Date.now(),
      name: newChoreName,
      points: parseInt(newChorePoints, 10),
      status: ChoreStatus.Incomplete,
      requiresApproval: newChoreRequiresApproval,
      recurrence: newChoreRecurrence,
      description: newChoreDescription,
      assignedTo: newChoreAssignedTo === 'unassigned' ? undefined : parseInt(newChoreAssignedTo, 10),
    };
    setChores(prev => [...prev, newChore]);
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
    setModalContent('editChore');
    setIsModalOpen(true);
  };

  const handleEditChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore) return;

    const updatedChore: Chore = {
        ...editingChore,
        name: newChoreName,
        points: parseInt(newChorePoints, 10),
        description: newChoreDescription,
        assignedTo: newChoreAssignedTo === 'unassigned' ? undefined : parseInt(newChoreAssignedTo, 10),
        requiresApproval: newChoreRequiresApproval,
        recurrence: newChoreRecurrence,
    };

    setChores(prev => prev.map(c => c.id === editingChore.id ? updatedChore : c));
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
    if (!isNaN(pointsToAdd) && !isNaN(targetUserId)) {
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, points: u.points + pointsToAdd } : u));
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

  const handlePointRequest = (requestId: number, newStatus: PointRequestStatus.Approved | PointRequestStatus.Denied) => {
    const request = pointRequests.find(r => r.id === requestId);
    if (!request) return;

    if (newStatus === PointRequestStatus.Approved) {
      setUsers(prev => prev.map(u => u.id === request.userId ? { ...u, points: u.points + request.points} : u));
      addNotification('child', `Your request for "${request.description}" was approved! You earned ${request.points} points.`);
    } else {
      addNotification('child', `Your request for "${request.description}" was denied.`);
    }
    setPointRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
  };
  
  const handleOpenEditUserModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setNewUserName(userToEdit.name);
    setNewUserRole(userToEdit.role);
    setModalContent('editUser');
    setIsModalOpen(true);
  };
  
  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      const newUser: User = {
          id: Date.now(),
          name: newUserName,
          role: newUserRole,
          avatar: newUserRole === 'child' ? 'bot' : null,
          points: 0,
      };
      setUsers(prev => [...prev, newUser]);
      closeModal();
  };

  const handleEditUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;

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
          // If chore was not completed, reset streak to 0.
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

  const sortedChores = useMemo(() => {
    const statusOrder = {
      [ChoreStatus.Incomplete]: 1,
      [ChoreStatus.PendingApproval]: 2,
      [ChoreStatus.Completed]: 3,
    };
     const userChores = currentUser.role === 'parent' 
      ? chores 
      : chores.filter(c => c.assignedTo === currentUser.id || !c.assignedTo);

    return [...userChores].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [chores, currentUser]);

  const pendingRequestsCount = useMemo(() => {
    return pointRequests.filter(r => r.status === PointRequestStatus.Pending).length;
  }, [pointRequests]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => n.targetRole === currentUser.role && !n.read).length;
  }, [notifications, currentUser]);
  
  const currentUserNotifications = useMemo(() => {
    return notifications.filter(n => n.targetRole === currentUser.role);
  }, [notifications, currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>; // Or a better loading state
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        points={currentUser?.points || 0}
        currentUser={currentUser}
        allUsers={users}
        onUserChange={handleUserChange}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onResetData={() => {
          if (window.confirm('Are you sure you want to wipe all data? This cannot be undone!')) {
            resetStorage();
            window.location.reload();
          }
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotifications={handleToggleNotifications}
        isNotificationsOpen={isNotificationsOpen}
        notifications={currentUserNotifications}
        onClearNotifications={handleClearNotifications}
      />
      <main className="flex-grow container mx-auto p-4 pb-28">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex justify-center space-x-2 sm:space-x-4">
            <button onClick={() => setActiveView(View.Chores)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Chores ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              <StarIcon className="w-5 h-5" />
              <span>Chores</span>
            </button>
            <button onClick={() => setActiveView(View.Rewards)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Rewards ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
              <GiftIcon className="w-5 h-5" />
              <span>Rewards</span>
            </button>
            {currentUser.role === 'parent' && (
              <>
                <button onClick={() => setActiveView(View.Requests)} className={`relative flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Requests ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                  <InboxArrowDownIcon className="w-5 h-5" />
                  <span>Requests</span>
                  {pendingRequestsCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{pendingRequestsCount}</span>}
                </button>
                <button onClick={() => setActiveView(View.Users)} className={`flex-1 transition-all duration-300 ease-in-out text-sm sm:text-base font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${activeView === View.Users ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                  <UsersIcon className="w-5 h-5" />
                  <span>Family</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          {activeView === View.Chores && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedChores.map(chore => (
                <ChoreCard key={chore.id} chore={chore} onStateChange={handleChoreStateChange} currentUser={currentUser} onEdit={handleOpenEditModal} onOverride={handleChoreOverride} />
              ))}
            </div>
          )}
          {activeView === View.Rewards && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} userPoints={currentUser.points} onRedeem={handleRedeemReward} />
              ))}
            </div>
          )}
          {activeView === View.Requests && currentUser.role === 'parent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pointRequests.map(req => {
                const requestingUser = users.find(u => u.id === req.userId);
                return <PointRequestCard key={req.id} request={req} onAction={handlePointRequest} userName={requestingUser?.name} />;
              })}
            </div>
          )}
          {activeView === View.Users && currentUser.role === 'parent' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Manage Family</h2>
                  <button onClick={() => openModal('addUser')} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-sky-600 flex items-center justify-center space-x-2">
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Member</span>
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map(user => (
                      <div key={user.id} className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                              <AvatarDisplay avatar={user.avatar} sizeClass="w-12 h-12" />
                              <div>
                                  <p className="font-bold text-lg">{user.name}</p>
                                  <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                              </div>
                          </div>
                          <div className="flex space-x-2">
                              <button onClick={() => handleOpenEditUserModal(user)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" aria-label={`Edit ${user.name}`}>
                                  <PencilIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === currentUserId || (user.role === 'parent' && parentUsers.length <= 1)}
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {currentUser.role === 'parent' && (
        <div className="fixed bottom-24 right-4 z-50">
          <button onClick={() => openModal('addPoints')} className="bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-sky-50 transition-transform transform hover:scale-110" aria-label="Assign points">
            <CogIcon className="w-8 h-8" />
          </button>
        </div>
      )}
      {currentUser.role === 'child' && (
        <div className="fixed bottom-24 right-4 z-50">
          <button onClick={() => openModal('requestPoints')} className="bg-fuchsia-600 text-white rounded-full p-4 shadow-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:ring-offset-2 focus:ring-offset-sky-50 transition-transform transform hover:scale-110" aria-label="Request points">
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      {currentUser.role === 'parent' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-2 shadow-t-lg">
          <div className="container mx-auto flex justify-center items-center space-x-2">
            <button onClick={() => openModal('addChore')} className="flex-1 text-sm bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Add Chore</span></button>
            <button onClick={() => openModal('addReward')} className="flex-1 text-sm bg-green-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-green-600 flex items-center justify-center space-x-2"><PlusIcon className="w-5 h-5" /><span>Add Reward</span></button>
            <button onClick={resetDailyChores} className="flex-1 text-sm bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-amber-600">Reset Day</button>
          </div>
        </footer>
      )}
      
      {isProfileModalOpen && currentUser.role === 'child' && (
        <ProfileModal
          currentAvatar={currentUser.avatar}
          onSave={handleSaveAvatar}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
      
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent === 'addChore' && (
          <form onSubmit={handleAddChore}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Add New Chore</h2>
            <div className="space-y-4">
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
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="requiresApproval" checked={newChoreRequiresApproval} onChange={e => setNewChoreRequiresApproval(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                <label htmlFor="requiresApproval" className="ml-3 block text-sm font-medium text-slate-700">Requires parent approval</label>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md font-bold hover:bg-blue-600 transition-colors">Add Chore</button>
            </div>
          </form>
        )}
        {modalContent === 'editChore' && editingChore && (
          <form onSubmit={handleEditChore}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Edit Chore</h2>
            <div className="space-y-4">
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
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="requiresApproval" checked={newChoreRequiresApproval} onChange={e => setNewChoreRequiresApproval(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                <label htmlFor="requiresApproval" className="ml-3 block text-sm font-medium text-slate-700">Requires parent approval</label>
              </div>
              <button type="submit" className="w-full bg-sky-500 text-white p-3 rounded-md font-bold hover:bg-sky-600 transition-colors">Save Changes</button>
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
            <p className="mb-4 text-slate-600">Give extra points for a job well done or deduct points if needed (use a negative number).</p>
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
            <p className="mb-4 text-slate-600">Did something extra? Describe what you did to earn more points!</p>
            <textarea value={requestDescription} onChange={e => setRequestDescription(e.target.value)} placeholder="Description (e.g., cleaned the garage)" className="w-full p-2 border rounded mb-2 bg-slate-50 text-slate-800" required />
            <input type="number" value={requestPoints} onChange={e => setRequestPoints(e.target.value)} placeholder="Points requested" className="w-full p-2 border rounded mb-4 bg-slate-50 text-slate-800" required min="1" />
            <button type="submit" className="w-full bg-fuchsia-500 text-white p-2 rounded font-bold hover:bg-fuchsia-600">Send Request</button>
          </form>
        )}
        {modalContent === 'addUser' && (
          <form onSubmit={handleAddUser}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Add Family Member</h2>
            <div className="space-y-4">
                <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Name" className="w-full p-3 border rounded-md bg-slate-50 text-slate-800" required />
                <div className="flex items-center justify-between">
                    <label htmlFor="userRole" className="text-slate-600 font-medium">Role:</label>
                    <select id="userRole" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="p-2 border rounded-md bg-slate-50 text-slate-800">
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-md font-bold hover:bg-blue-600 transition-colors">Add Member</button>
            </div>
          </form>
        )}
        {modalContent === 'editUser' && editingUser && (
          <form onSubmit={handleEditUser}>
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Edit {editingUser.name}</h2>
            <div className="space-y-4">
                <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Name" className="w-full p-3 border rounded-md bg-slate-50 text-slate-800" required />
                <div className="flex items-center justify-between">
                    <label htmlFor="userRole" className="text-slate-600 font-medium">Role:</label>
                    <select id="userRole" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="p-2 border rounded-md bg-slate-50 text-slate-800">
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>
                <p className="text-xs text-slate-500">Changing a user's role will reset their points.</p>
                <button type="submit" className="w-full bg-sky-500 text-white p-3 rounded-md font-bold hover:bg-sky-600 transition-colors">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default App;