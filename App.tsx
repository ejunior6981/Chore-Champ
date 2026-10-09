import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeIndexedDB } from './data/indexeddb';
import { initializeAuth } from './auth/auth-manager';
import { initializeSyncManager } from './sync/sync-manager';
import { initializeOfflineQueue } from './pwa/offline-queue';
import { getThemeMode, ThemeProvider, initializeTheme, ThemeMode } from './theme/theme-provider';
import { allUsers, allChores, allRewards, allPointRequests, allNotifications } from './data/indexeddb';
import { User, Chore, Reward, PointRequest, Notification } from './types';
import { ChoreStatus, ChoreRecurrence, PointRequestStatus } from './types';
import { NotificationType } from './types/notification';
import ThemeToggle from './components/ThemeToggle';
import InstallPrompt from './components/InstallPrompt';
import NotificationPanel from './components/NotificationPanel';
import MissionControlHeader from './components/MissionControlHeader';
import Modal from './components/Modal';
import AvatarDisplay from './components/AvatarDisplay';
import { UserIcon, RocketIcon, GiftIcon, InboxArrowDownIcon, BellIcon, SettingsIcon, TrashIcon, CheckIcon, XIcon, CogIcon } from './components/icons';
import { getAuthManager } from './auth/auth-manager';

// Main App Component
const App: React.FC = () => {
  // State
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
  const [db, setDb] = useState<any>(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [showFamilySelection, setShowFamilySelection] = useState(false);
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showThemeSelection, setShowThemeSelection] = useState(false);

  // Form state
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

  // Initialize IndexedDB and auth
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize IndexedDB
        const indexedDB = await initializeIndexedDB();
        setDb(indexedDB);
        setIsDbInitialized(true);

        // Initialize auth
        const authConfig = {
          clientId: 'chore-champ-web',
          apiDomain: process.env.NITRO_PREFIX || '',
        };
        const authManager = await initializeAuth(authConfig);
        setAuthManager(authManager);

        // Initialize sync
        const syncManager = await initializeSyncManager();
        setSyncManager(syncManager);

        // Initialize offline queue
        const offlineQueue = await initializeOfflineQueue();
        setOfflineQueue(offlineQueue);

        // Initialize theme
        const themeMode = await initializeTheme();
        setThemeMode(themeMode);

        console.log('App initialized');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, []);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const authManagerInstance = getAuthManager();
        if (authManagerInstance) {
          const session = await authManagerInstance.getSession?.();
          if (session) {
            setIsAuthenticated(true);
            setCurrentUser(session.user || null);
            setCurrentUserId(session.userId || null);
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      }
    };

    checkSession();
  }, []);

  // LocalStorage data for backward compatibility
  const [users, setUsers] = useLocalStorage<User[]>('chore-champ-users', allUsers);
  const [currentUserIdStr, setCurrentUserIdStr] = useLocalStorage<string | null>('chore-champ-currentUser', null);

  const childUsers = useMemo(() => users.filter(u => u.role === 'child'), [users]);
  const parentUsers = useMemo(() => users.filter(u => u.role === 'parent'), [users]);

  // Validate PIN
  const validatePin = (entered: string): boolean => {
    return entered === pin;
  };

  // Handle full screen toggle
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

  // Handle notifications panel close
  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // Handle notifications panel toggle
  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Handle opening settings
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // Handle closing settings
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // Handle install prompt
  const handleInstallPrompt = () => {
    setIsInstallPromptOpen(true);
  };

  // Handle closing install prompt
  const handleCloseInstallPrompt = () => {
    setIsInstallPromptOpen(false);
  };

  // Handle opening add chore modal
  const handleOpenAddChore = () => {
    setNewChoreName('');
    setNewChorePoints('10');
    setNewChoreRequiresApproval(false);
    setNewChoreRecurrence('NONE');
    setNewChoreDescription('');
    setNewChoreAssignedTo('unassigned');
    setShowAddChoreModal(true);
  };

  // Handle closing add chore modal
  const handleCloseAddChore = () => {
    setShowAddChoreModal(false);
  };

  // Handle adding chore
  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    const newChore: Chore = {
      id: crypto.randomUUID(),
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

  // Handle opening edit chore modal
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

  // Handle editing chore
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

  // Handle opening add reward modal
  const handleOpenAddReward = () => {
    setNewRewardName('');
    setNewRewardPoints('100');
    setShowAddRewardModal(true);
  };

  // Handle closing add reward modal
  const handleCloseAddReward = () => {
    setShowAddRewardModal(false);
  };

  // Handle adding reward
  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    const newReward: Reward = {
      id: crypto.randomUUID(),
      name: newRewardName,
      points: parseInt(newRewardPoints, 10),
    };
    setRewards(prev => [...prev, newReward]);
    closeModal();
  };

  // Handle opening add points modal
  const handleOpenAddPoints = () => {
    setManualPoints('');
    setManualPointsUser('');
    setShowAddPointsModal(true);
  };

  // Handle closing add points modal
  const handleCloseAddPoints = () => {
    setShowAddPointsModal(false);
  };

  // Handle adding points
  const handleAddPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsToAdd = parseInt(manualPoints, 10);
    const targetUserId = parseInt(manualPointsUser, 10);
    if (!isNaN(pointsToAdd) && !isNaN(targetUserId)) {
      setUsers(prev => prev.map(u => u.id === targetUserId.toString() ? { ...u, points: u.points + pointsToAdd } : u));
      closeModal();
    }
  };

  // Handle opening add request modal
  const handleOpenAddRequest = () => {
    setManualRequestDescription('');
    setManualRequestPoints('');
    setManualRequestUser('');
    setShowAddRequestModal(true);
  };

  // Handle closing add request modal
  const handleCloseAddRequest = () => {
    setShowAddRequestModal(false);
  };

  // Handle adding request
  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: PointRequest = {
      id: crypto.randomUUID(),
      userId: parseInt(manualRequestUser, 10),
      description: manualRequestDescription,
      points: parseInt(manualRequestPoints, 10),
      status: PointRequestStatus.Pending,
    };
    setRequests(prev => [...prev, newRequest]);
    closeModal();
  };

  // Handle opening profile modal
  const handleOpenProfileModal = () => {
    setCurrentAvatar(currentUser?.avatarId || null);
    setNewAvatar(currentUser?.avatarId || 'boy-robot');
    setShowProfileModal(true);
  };

  // Handle closing profile modal
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

  // Handle saving avatar
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

  // Handle opening child management
  const handleOpenChildManagement = () => {
    setShowChildManagement(true);
  };

  // Handle closing child management
  const handleCloseChildManagement = () => {
    setShowChildManagement(false);
  };

  // Handle opening avatar selection
  const handleOpenAvatarSelection = () => {
    setShowAvatarSelection(true);
  };

  // Handle closing avatar selection
  const handleCloseAvatarSelection = () => {
    setShowAvatarSelection(false);
  };

  // Handle opening theme selection
  const handleOpenThemeSelection = () => {
    setShowThemeSelection(true);
  };

  // Handle closing theme selection
  const handleCloseThemeSelection = () => {
    setShowThemeSelection(false);
  };

  // Handle saving theme
  const handleSaveTheme = (themeMode: ThemeMode) => {
    setThemeMode(themeMode);
    localStorage.setItem('chore-champ-theme', themeMode);
    handleCloseThemeSelection();
  };

  // Handle theme mode change
  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('chore-champ-theme', mode);
  };

  // Handle closing modals
  const closeModal = () => {
    setShowAddChoreModal(false);
    setShowEditChoreModal(false);
    setShowAddRewardModal(false);
    setShowAddPointsModal(false);
    setShowAddRequestModal(false);
    setShowProfileModal(false);
  };

  // Handle clearing notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
  };

  // Handle marking notification as read
  const handleMarkRead = (notificationId: number) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  // Handle deleting notification
  const handleDeleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Handle loading data from IndexedDB
  useEffect(() => {
    if (db && isDbInitialized) {
      const loadData = async () => {
        try {
          const users = await db.users.getAll();
          setAllUsers(users);
          
          const chores = await db.chores.getAll();
          setAllChores(chores);
          
          const rewards = await db.rewards.getAll();
          setAllRewards(rewards);
          
          const pointRequests = await db.pointRequests.getAll();
          setAllPointRequests(pointRequests);
          
          const notifications = await db.notifications.getAll();
          setAllNotifications(notifications);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };

      loadData();
    }
  }, [db, isDbInitialized]);

  // Render
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
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 p-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Chore Champ v1.0.0
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
          onClear={handleClearNotifications}
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

// Create root
const root = createRoot(document.getElementById('root'));
root.render(<App />);
