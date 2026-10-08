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
    // Keep ONLY parent user and PIN - reset everything else
    const keysToKeep = [
      'chore-champ-users',           // Keep the parent user
      'chore-champ-pin',             // Keep the PIN
    ];
    
    // Get all chore-champ keys
    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('chore-champ-'))
      .sort();
    
    // Remove keys that are NOT in the keep list
    const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  };
  return resetStorage;
};
