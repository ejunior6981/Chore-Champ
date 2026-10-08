// FIX: The 'React' namespace is required for the types used in the hook's return signature.
import React, { useState, useEffect } from 'react';

function getStorageValue<T,>(key: string, defaultValue: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch (e) {
      console.error('Failed to parse stored value for key', key, e);
      return defaultValue;
    }
  }
  return defaultValue;
}

export const useLocalStorage = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save value for key', key, e);
    }
  }, [key, value]);

  return [value, setValue];
};

export const useStorageReset = (): (() => void) => {
  const resetStorage = () => {
    // Verify localStorage is available
    if (!('localStorage' in window)) {
      console.error('[DEBUG-RESET] localStorage is not available!');
      return;
    }
    
    const keys = [
      'chore-champ-users',
      'chore-champ-currentUser',
      'chore-champ-chores',
      'chore-champ-rewards',
      'chore-champ-requests',
      'chore-champ-notifications',
      'chore-champ-pin',
    ];
    console.log('[DEBUG-RESET] Starting reset with keys:', keys);
    
    let success = true;
    keys.forEach(key => {
      try {
        const currentValue = localStorage.getItem(key);
        console.log(`[DEBUG-RESET] Removing: ${key}`, currentValue);
        localStorage.removeItem(key);
        const afterRemoval = localStorage.getItem(key);
        console.log(`[DEBUG-RESET] After removal: ${key} = ${afterRemoval}`);
        if (afterRemoval !== null) {
          console.error(`[DEBUG-RESET] FAILED to remove ${key}!`);
          success = false;
        }
      } catch (e) {
        console.error(`[DEBUG-RESET] Error removing ${key}:`, e);
        success = false;
      }
    });
    
    if (success) {
      console.log('[DEBUG-RESET] Reset complete - all keys cleared');
    } else {
      console.error('[DEBUG-RESET] Reset failed - some keys could not be cleared');
    }
  };
  return resetStorage;
};
