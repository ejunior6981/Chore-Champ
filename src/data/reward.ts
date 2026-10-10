import type { Reward } from '../types';

export const getRewards = async (): Promise<Reward[]> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['rewards'], 'readonly');
    const store = transaction.objectStore('rewards');
    
    const request = store.getAll();
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const addReward = async (reward: Reward): Promise<Reward> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['rewards'], 'readwrite');
    const store = transaction.objectStore('rewards');
    
    const request = store.put(reward);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(reward);
    });
  });
};

export const deleteReward = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['rewards'], 'readwrite');
    const store = transaction.objectStore('rewards');
    
    const request = store.delete(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve();
    });
  });
};
