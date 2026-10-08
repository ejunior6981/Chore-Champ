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
    // Keys to reset: children, rewards, requests, chores, activity log
    const keysToReset = [
      'chore-champ-users',           // Contains all users (children and parent)
      'chore-champ-currentUser',     // Current user session
      'chore-champ-chores',          // Chore tasks
      'chore-champ-rewards',         // Reward items
      'chore-champ-requests',        // Point requests
      'chore-champ-notifications',   // Notification messages
      'chore-champ-activity-log',    // Activity history
    ];
    
    // Get all chore-champ keys and filter to only reset the ones we want
    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('chore-champ-'))
      .sort();
    
    const filteredKeys = allKeys.filter(key => keysToReset.includes(key));
    
    filteredKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  };
  return resetStorage;
};
