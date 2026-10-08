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
    const keys = [
      'chore-champ-users',
      'chore-champ-currentUser',
      'chore-champ-chores',
      'chore-champ-rewards',
      'chore-champ-requests',
      'chore-champ-notifications',
      'chore-champ-pin',
    ];
    keys.forEach(key => localStorage.removeItem(key));
  };
  return resetStorage;
};
