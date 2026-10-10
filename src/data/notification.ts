import type { Notification, NotificationType } from '../types';

export const getNotifications = async (): Promise<Notification[]> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['notifications'], 'readonly');
    const store = transaction.objectStore('notifications');
    
    const request = store.getAll();
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      const notification = event.target.result as Notification;
      if (notification) {
        const updated = { ...notification, read: true };
        store.put(updated);
        resolve();
      } else {
        reject(new Error('Notification not found'));
      }
    });
  });
};

export const deleteNotification = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    const request = store.delete(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve();
    });
  });
};
