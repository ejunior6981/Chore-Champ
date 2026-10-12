import type { FamilyMember } from '../types';

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['familyMembers'], 'readonly');
    const store = transaction.objectStore('familyMembers');
    
    const request = store.getAll();
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const addFamilyMember = async (input: Omit<FamilyMember, 'id' | 'lastActiveAt'>): Promise<FamilyMember> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['familyMembers'], 'readwrite');
    const store = transaction.objectStore('familyMembers');
    
    const member: FamilyMember = {
      id: crypto.randomUUID(),
      lastActiveAt: Date.now(),
      ...input,
    };

    const request = store.put(member);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(member);
    });
  });
};

export const updateFamilyMember = async (id: string, input: Partial<FamilyMember>): Promise<FamilyMember> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['familyMembers'], 'readwrite');
    const store = transaction.objectStore('familyMembers');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      const member = event.target.result;
      if (member) {
        const updated = { ...member, ...input, lastActiveAt: Date.now() };
        store.put(updated);
        resolve(updated);
      } else {
        reject(new Error('Member not found'));
      }
    });
  });
};

export const deleteFamilyMember = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['familyMembers'], 'readwrite');
    const store = transaction.objectStore('familyMembers');
    
    const request = store.delete(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve();
    });
  });
};

export const resetMemberPoints = async (id: string, points: number): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['familyMembers'], 'readwrite');
    const store = transaction.objectStore('familyMembers');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      const member = event.target.result;
      if (member) {
        const updated = { ...member, points };
        store.put(updated);
        resolve();
      } else {
        reject(new Error('Member not found'));
      }
    });
  });
};
