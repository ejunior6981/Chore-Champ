import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { getThemeMode, ThemeProvider, initializeTheme, ThemeMode } from './theme/theme-provider';
import { User, Chore, Reward, PointRequest, Notification } from './types';
import { ChoreStatus, ChoreRecurrence, PointRequestStatus } from './types';
import ThemeToggle from './components/ThemeToggle';
import InstallPrompt from './components/InstallPrompt';
import NotificationPanel from './components/NotificationPanel';
import MissionControlHeader from './components/MissionControlHeader';
import Modal from './components/Modal';
import AvatarDisplay from './components/AvatarDisplay';
import { UsersIcon, RocketIcon, GiftIcon, InboxArrowDownIcon, BellIcon, SettingsIcon, TrashIcon, CheckIcon, XIcon, CogIcon } from './components/icons';

// Local database utility for development
const createLocalDatabase = async (): Promise<IDbDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChoreChampLocalDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('name', 'name', { unique: false });
        userStore.createIndex('role', 'role', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('chores')) {
        const choreStore = db.createObjectStore('chores', { keyPath: 'id', autoIncrement: true });
        choreStore.createIndex('name', 'name', { unique: false });
        choreStore.createIndex('status', 'status', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('rewards')) {
        const rewardStore = db.createObjectStore('rewards', { keyPath: 'id', autoIncrement: true });
        rewardStore.createIndex('name', 'name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('pointRequests')) {
        const requestStore = db.createObjectStore('pointRequests', { keyPath: 'id', autoIncrement: true });
        requestStore.createIndex('status', 'status', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        notificationStore.createIndex('read', 'read', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('avatars')) {
        db.createObjectStore('avatars', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [choreId, setChoreId] = useState<number | null>(null);
  const [rewardId, setRewardId] = useState<number | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [notificationId, setNotificationId] = useState<number | null>(null);
  const [pin, setPin] = useState<string>('');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAddChoreModal, setShowAddChoreModal] = useState(false);
  const [showEditChoreModal, setShowEditChoreModal] = useState(false);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  const [modalContent, setModalContent] = useState<'addChore' | 'editChore' | 'addReward' | 'addPoints' | 'addRequest' | 'profile'>('addChore');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallPromptOpen, setIsInstallPromptOpen] = useState(false);
  const [db, setDb] = useState<IDbDatabase | null>(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [showFamilySelection, setShowFamilySelection] = useState(false);
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showThemeSelection, setShowThemeSelection] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState('10');
  const [newChoreRequiresApproval, setNewChoreRequiresApproval] = useState(false);
  const [newChoreRecurrence, setNewChoreRecurrence] = useState<ChoreRecurrence>('NONE');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState('unassigned');
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('100');
  const [manualPoints, setManualPoints] = useState('');
  const [manualPointsUser, setManualPointsUser] = useState('');
  const [manualRequestDescription, setManualRequestDescription] = useState('');
  const [manualRequestPoints, setManualRequestPoints] = useState('');
  const [manualRequestUser, setManualRequestUser] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<string>('boy-robot');
  const [newTheme, setNewTheme] = useState<ThemeMode>('system');
  const [users, setUsers] = useState<User[]>([]);
  const [choreList, setChoreList] = useState<Chore[]>([]);
  const [rewardList, setRewardList] = useState<Reward[]>([]);
  const [requestList, setRequestList] = useState<PointRequest[]>([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const localDb = await createLocalDatabase();
        setDb(localDb);
        setIsDbInitialized(true);
        
        // Load sample data for testing
        const sampleUsers: User[] = [
          { id: 1, name: 'Mom', role: 'parent', avatarId: 'girl-robot', points: 500, theme: 'system' },
          { id: 2, name: 'Dad', role: 'parent', avatarId: 'boy-robot', points: 450, theme: 'system' },
          { id: 3, name: 'Alex', role: 'child', avatarId: 'boy-robot', points: 200, theme: 'system' },
          { id: 4, name: 'Sam', role: 'child', avatarId: 'girl-robot', points: 150, theme: 'system' },
        ];
        setUsers(sampleUsers);
        
        const sampleChores: Chore[] = [
          { id: 1, name: 'Feed the pets', points: 10, status: ChoreStatus.Incomplete, requiresApproval: true, recurrence: 'DAILY', description: 'Feed the dog and cat', assignedTo: 3 },
          { id: 2, name: 'Take out trash', points: 15, status: ChoreStatus.Incomplete, requiresApproval: false, recurrence: 'WEEKLY', description: 'Take out kitchen trash', assignedTo: 4 },
          { id: 3, name: 'Make bed', points: 5, status: ChoreStatus.Incomplete, requiresApproval: false, recurrence: 'DAILY', description: 'Make your bed each morning', assignedTo: 3 },
          { id: 4, name: 'Clean room', points: 20, status: ChoreStatus.Incomplete, requiresApproval: true, recurrence: 'WEEKLY', description: 'Clean and organize your room', assignedTo: 4 },
        ];
        setChoreList(sampleChores);
        
        const sampleRewards: Reward[] = [
          { id: 1, name: 'Extra Screen Time', points: 100 },
          { id: 2, name: 'Choose Dinner', points: 50 },
          { id: 3, name: 'Sleepover', points: 200 },
          { id: 4, name: 'Toy Store Visit', points: 150 },
        ];
        setRewardList(sampleRewards);
        
        console.log('App initialized with sample data');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    initApp();
  }, []);

  const validatePin = (entered: string): boolean => {
    return entered === pin;
  };

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(console.error);
    }
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleInstallPrompt = () => {
    setIsInstallPromptOpen(true);
  };

  const handleCloseInstallPrompt = () => {
    setIsInstallPromptOpen(false);
  };

  const handleOpenAddChore = () => {
    setNewChoreName('');
    setNewChorePoints('10');
    setNewChoreRequiresApproval(false);
    setNewChoreRecurrence('NONE');
    setNewChoreDescription('');
    setNewChoreAssignedTo('unassigned');
    setShowAddChoreModal(true);
  };

  const handleCloseAddChore = () => {
    setShowAddChoreModal(false);
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    const newChore: Chore = {
      id: Date.now() as unknown as number,
      name: newChoreName,
      points: parseInt(newChorePoints, 10),
      status: ChoreStatus.Incomplete,
      requiresApproval: newChoreRequiresApproval,
      recurrence: newChoreRecurrence,
      description: newChoreDescription,
      assignedTo: newChoreAssignedTo === 'unassigned' ? undefined : parseInt(newChoreAssignedTo, 10),
    };
    setChoreList(prev => [...prev, newChore]);
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

    setChoreList(prev => prev.map(c => c.id === editingChore.id ? updatedChore : c));
    closeModal();
  };

  const handleOpenAddReward = () => {
    setNewRewardName('');
    setNewRewardPoints('100');
    setShowAddRewardModal(true);
  };

  const handleCloseAddReward = () => {
    setShowAddRewardModal(false);
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    const newReward: Reward = {
      id: Date.now() as unknown as number,
      name: newRewardName,
      points: parseInt(newRewardPoints, 10),
    };
    setRewardList(prev => [...prev, newReward]);
    closeModal();
  };

  const handleOpenAddPoints = () => {
    setManualPoints('');
    setManualPointsUser('');
    setShowAddPointsModal(true);
  };

  const handleCloseAddPoints = () => {
    setShowAddPointsModal(false);
  };

  const handleAddPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsToAdd = parseInt(manualPoints, 10);
    const targetUserId = parseInt(manualPointsUser, 10);
    if (!isNaN(pointsToAdd) && !isNaN(targetUserId)) {
      setUsers(prev => prev.map(u => u.id === targetUserId.toString() ? { ...u, points: u.points + pointsToAdd } : u));
      closeModal();
    }
  };

  const handleOpenAddRequest = () => {
    setManualRequestDescription('');
    setManualRequestPoints('');
    setManualRequestUser('');
    setShowAddRequestModal(true);
  };

  const handleCloseAddRequest = () => {
    setShowAddRequestModal(false);
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: PointRequest = {
      id: Date.now() as unknown as number,
      userId: parseInt(manualRequestUser, 10),
      description: manualRequestDescription,
      points: parseInt(manualRequestPoints, 10),
      status: PointRequestStatus.Pending,
    };
    setRequestList(prev => [...prev, newRequest]);
    closeModal();
  };

  const handleOpenProfileModal = () => {
    setCurrentAvatar(currentUser?.avatarId || null);
    setNewAvatar(currentUser?.avatarId || 'boy-robot');
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

  const handleSaveAvatar = (avatarId: string) => {
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        avatarId: avatarId,
      };
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        setUsers([...users]);
      }
    }
  };

  const handleOpenChildManagement = () => {
    setShowChildManagement(true);
  };

  const handleCloseChildManagement = () => {
    setShowChildManagement(false);
  };

  const handleOpenAvatarSelection = () => {
    setShowAvatarSelection(true);
  };

  const handleCloseAvatarSelection = () => {
    setShowAvatarSelection(false);
  };

  const handleOpenThemeSelection = () => {
    setShowThemeSelection(true);
  };

  const handleCloseThemeSelection = () => {
    setShowThemeSelection(false);
  };

  const handleSaveTheme = (themeMode: ThemeMode) => {
    setThemeMode(themeMode);
    localStorage.setItem('chore-champ-theme', themeMode);
    handleCloseThemeSelection();
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('chore-champ-theme', mode);
  };

  const closeModal = () => {
    setShowAddChoreModal(false);
    setShowEditChoreModal(false);
    setShowAddRewardModal(false);
    setShowAddPointsModal(false);
    setShowAddRequestModal(false);
    setShowProfileModal(false);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
  };

  const handleMarkRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  useEffect(() => {
    if (db && isDbInitialized) {
      const loadData = async () => {
        try {
          const users = await db.transaction(['users'], 'readonly').objectStore('users').getAll();
          setUsers(users);
          const chores = await db.transaction(['chores'], 'readonly').objectStore('chores').getAll();
          setChoreList(chores);
          const rewards = await db.transaction(['rewards'], 'readonly').objectStore('rewards').getAll();
          setRewardList(rewards);
          const pointRequests = await db.transaction(['pointRequests'], 'readonly').objectStore('pointRequests').getAll();
          setRequestList(pointRequests);
          const notifications = await db.transaction(['notifications'], 'readonly').objectStore('notifications').getAll();
          setNotifications(notifications);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      loadData();
    }
  }, [db, isDbInitialized]);

  // Initialize theme
  useEffect(() => {
    const initTheme = async () => {
      const theme = getThemeMode();
      setThemeMode(theme);
      await initializeTheme(theme);
    };
    initTheme();
  }, []);

  return (
    <ThemeProvider themeMode={themeMode}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <header className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Chore Champ</h1>
            {currentUser && (
              <div className="flex items-center gap-2">
                <AvatarDisplay avatarId={currentUser.avatarId || 'boy-robot'} sizeClass="w-8 h-8" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {currentUser.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleFullScreen}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <CogIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleNotifications}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <BellIcon className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={handleOpenSettings}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {showFamilySelection && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Family Selection</h2>
              <p className="text-slate-600 dark:text-slate-400">Select a family member to continue</p>
            </div>
          )}

          {showChildManagement && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Child Management</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage child accounts here</p>
            </div>
          )}

          {showAvatarSelection && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Select Avatar</h2>
              <p className="text-slate-600 dark:text-slate-400">Choose your avatar</p>
            </div>
          )}

          {showThemeSelection && (
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">Select Theme</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleSaveTheme('light')}
                  className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  <h3 className="font-semibold mb-2">Light</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Light theme</p>
                </button>

                <button
                  onClick={() => handleSaveTheme('dark')}
                  className="p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors text-center"
                >
                  <h3 className="font-semibold mb-2">Dark</h3>
                  <p className="text-sm text-slate-300">Dark theme</p>
                </button>

                <button
                  onClick={() => handleSaveTheme('system')}
                  className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  <h3 className="font-semibold mb-2">System</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Follow system</p>
                </button>
              </div>
            </div>
          )}

          {/* User List Display */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Family Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(user => (
                <div key={user.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <AvatarDisplay avatarId={user.avatarId || 'boy-robot'} sizeClass="w-10 h-10" />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.role === 'parent' ? 'Parent' : 'Child'} • {user.points} points
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chore List Display */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Chores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {choreList.map(chore => (
                <div key={chore.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{chore.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{chore.points} points</p>
                      {chore.description && <p className="text-xs text-slate-400 mt-1">{chore.description}</p>}
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                          {chore.recurrence}
                        </span>
                        {chore.requiresApproval && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                            Approval Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(chore)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <CogIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards List Display */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardList.map(reward => (
                <div key={reward.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 shadow-sm border-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">{reward.name}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{reward.points} points</p>
                    </div>
                    <GiftIcon className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 p-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Chore Champ v1.0.0 - Local Development Mode
        </footer>

        {/* Modals */}
        {showAddChoreModal && (
          <Modal
            title="Add Chore"
            onClose={handleCloseAddChore}
            onSubmit={handleAddChore}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newChoreName}
                  onChange={(e) => setNewChoreName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter chore name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={newChorePoints}
                  onChange={(e) => setNewChorePoints(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter points"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={newChoreRequiresApproval}
                  onChange={(e) => setNewChoreRequiresApproval(e.target.checked)}
                />
                <label htmlFor="requiresApproval">Requires approval</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={newChoreRecurrence}
                  onChange={(e) => setNewChoreRecurrence(e.target.value as ChoreRecurrence)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="NONE">One-time</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <select
                  value={newChoreAssignedTo}
                  onChange={(e) => setNewChoreAssignedTo(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="unassigned">Anyone</option>
                  {users.filter(u => u.role === 'child').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newChoreDescription}
                  onChange={(e) => setNewChoreDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
          </Modal>
        )}

        {showAddRewardModal && (
          <Modal
            title="Add Reward"
            onClose={handleCloseAddReward}
            onSubmit={handleAddReward}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter reward name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={newRewardPoints}
                  onChange={(e) => setNewRewardPoints(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter points"
                />
              </div>
            </div>
          </Modal>
        )}

        {showAddPointsModal && (
          <Modal
            title="Add Points"
            onClose={handleCloseAddPoints}
            onSubmit={handleAddPoints}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={manualPoints}
                  onChange={(e) => setManualPoints(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter points to add"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select
                  value={manualPointsUser}
                  onChange={(e) => setManualPointsUser(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {users.filter(u => u.role === 'child').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Modal>
        )}

        {showAddRequestModal && (
          <Modal
            title="Add Point Request"
            onClose={handleCloseAddRequest}
            onSubmit={handleAddRequest}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={manualRequestDescription}
                  onChange={(e) => setManualRequestDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={manualRequestPoints}
                  onChange={(e) => setManualRequestPoints(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter points"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select
                  value={manualRequestUser}
                  onChange={(e) => setManualRequestUser(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {users.filter(u => u.role === 'child').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Modal>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                Select Your Avatar
              </h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Current Avatar
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currentUser?.avatarId || 'boy-robot'}
                    </p>
                  </div>
                  <AvatarDisplay avatarId={currentUser?.avatarId || 'boy-robot'} sizeClass="w-16 h-16" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Selected Avatar
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {newAvatar}
                    </p>
                  </div>
                  <AvatarDisplay avatarId={newAvatar} sizeClass="w-16 h-16" />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseProfileModal}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSaveAvatar(newAvatar);
                    handleCloseProfileModal();
                  }}
                  className="flex-1 bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isNotificationsOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={handleCloseNotifications}
        />
      )}

      <InstallPrompt
        deferredPrompt={null}
        onDismiss={handleCloseInstallPrompt}
        onInstall={() => {
          console.log('App installed');
          handleCloseInstallPrompt();
        }}
      />
    </ThemeProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
