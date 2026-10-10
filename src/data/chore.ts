import type { Chore, ChoreStatus, ChoreRecurrence } from '../types';

export const getChores = async (): Promise<Chore[]> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['chores'], 'readonly');
    const store = transaction.objectStore('chores');
    
    const request = store.getAll();
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const addChore = async (chore: Chore): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['chores'], 'readwrite');
    const store = transaction.objectStore('chores');
    
    const request = store.put(chore);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve();
    });
  });
};

export const deleteChore = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['chores'], 'readwrite');
    const store = transaction.objectStore('chores');
    
    const request = store.delete(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve();
    });
  });
};
