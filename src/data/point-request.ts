import type { PointRequest, PointRequestStatus } from '../types';

export const getPointRequests = async (): Promise<PointRequest[]> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['pointRequests'], 'readonly');
    const store = transaction.objectStore('pointRequests');
    
    const request = store.getAll();
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      resolve(event.target.result);
    });
  });
};

export const addPointRequest = async (request: PointRequest): Promise<PointRequest> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['pointRequests'], 'readwrite');
    const store = transaction.objectStore('pointRequests');
    
    const reqRequest = store.put(request);
    reqRequest.addEventListener('error', (event) => {
      reject(event.error);
    });
    reqRequest.addEventListener('complete', (event) => {
      resolve(request);
    });
  });
};

export const approvePointRequest = async (id: string, points: number): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['pointRequests'], 'readwrite');
    const store = transaction.objectStore('pointRequests');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      const pointRequest = event.target.result as PointRequest;
      if (pointRequest) {
        const updated = {
          ...pointRequest,
          status: 'APPROVED',
        };
        store.put(updated);
        resolve();
      } else {
        reject(new Error('Request not found'));
      }
    });
  });
};

export const denyPointRequest = async (id: string): Promise<void> => {
  const indexedDB = await window.indexedDB.open('chore-champ');
  return new Promise((resolve, reject) => {
    indexedDB.addEventListener('error', (event) => {
      reject(event.error);
    });

    const transaction = indexedDB!.transaction(['pointRequests'], 'readwrite');
    const store = transaction.objectStore('pointRequests');
    
    const request = store.get(id);
    request.addEventListener('error', (event) => {
      reject(event.error);
    });
    request.addEventListener('complete', (event) => {
      const pointRequest = event.target.result as PointRequest;
      if (pointRequest) {
        const updated = {
          ...pointRequest,
          status: 'DENIED',
        };
        store.put(updated);
        resolve();
      } else {
        reject(new Error('Request not found'));
      }
    });
  });
};
