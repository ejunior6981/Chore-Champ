/**
 * Theme Provider
 * Manages light/dark theme state and applies to app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Component
 */
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}> = ({ children, initialTheme }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('chore-champ-theme');
    if (stored) {
      return stored as ThemeMode;
    }
    
    // Default to system preference
    return 'system';
  });

  const [isDark, setIsDark] = useState(false);

  // Function to determine if dark mode should be active
  const getShouldUseDarkMode = (): boolean => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  };

  // Update DOM based on theme
  useEffect(() => {
    const shouldUseDark = getShouldUseDarkMode();
    setIsDark(shouldUseDark);
    
    const html = document.documentElement;
    
    if (shouldUseDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // Update theme when system preference changes (if set to system)
  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const shouldUseDark = e.matches;
      const html = document.documentElement;
      
      if (shouldUseDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('chore-champ-theme', theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
