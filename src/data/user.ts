import type { User } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    
    const request = store.getAll();
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const addUser = async (input: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    
    const user: User = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...input,
    };

    const request = store.put(user);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(user);
    });
  });
};

export const updateUser = async (id: string, input: Partial<User>): Promise<User> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      const user = event.target.result as User;
      if (user) {
        const updated = {
          ...user,
          ...input,
          updatedAt: Date.now(),
        };
        store.put(updated);
        resolve(updated);
      } else {
        reject(new Error('User not found'));
      }
    });
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    
    const request = store.delete(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve();
    });
  });
};
