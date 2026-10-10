import type { User, Chore, Reward, PointRequest, Notification } from '../types';

export const migrateLocalStorage = async (): Promise<void> => {
  const users = JSON.parse(localStorage.getItem('chore-champ-users') || '[]');
  const chores = JSON.parse(localStorage.getItem('chore-champ-chores') || '[]');
  const rewards = JSON.parse(localStorage.getItem('chore-champ-rewards') || '[]');
  const requests = JSON.parse(localStorage.getItem('chore-champ-requests') || '[]');
  const notifications = JSON.parse(localStorage.getItem('chore-champ-notifications') || '[]');

  const indexedDB = await window.indexedDB.open('chore-champ');

  const migrateUsers = async () => {
    const transaction = indexedDB.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    users.forEach(user => store.put(user));
  };

  const migrateChores = async () => {
    const transaction = indexedDB.transaction(['chores'], 'readwrite');
    const store = transaction.objectStore('chores');
    chores.forEach(chore => store.put(chore));
  };

  const migrateRewards = async () => {
    const transaction = indexedDB.transaction(['rewards'], 'readwrite');
    const store = transaction.objectStore('rewards');
    rewards.forEach(reward => store.put(reward));
  };

  const migrateRequests = async () => {
    const transaction = indexedDB.transaction(['pointRequests'], 'readwrite');
    const store = transaction.objectStore('pointRequests');
    requests.forEach(request => store.put(request));
  };

  const migrateNotifications = async () => {
    const transaction = indexedDB.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    notifications.forEach(notification => store.put(notification));
  };

  await migrateUsers();
  await migrateChores();
  await migrateRewards();
  await migrateRequests();
  await migrateNotifications();

  // Clear localStorage
  localStorage.removeItem('chore-champ-users');
  localStorage.removeItem('chore-champ-chores');
  localStorage.removeItem('chore-champ-rewards');
  localStorage.removeItem('chore-champ-requests');
  localStorage.removeItem('chore-champ-notifications');
};
