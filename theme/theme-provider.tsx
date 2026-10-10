import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}>({
  themeMode: 'system',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{
  children: ReactNode;
  themeMode?: ThemeMode;
}> = ({ children, themeMode: initialThemeMode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    initialThemeMode || 'system'
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('chore-champ-theme') as ThemeMode;
    if (savedTheme) {
      setThemeModeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeModeState('dark');
    }
  }, []);

  const themeClass = themeMode === 'dark' ? 'dark' : '';

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode: setThemeModeState }}>
      <div className={themeClass}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const getThemeMode = (): ThemeMode => {
  const savedTheme = localStorage.getItem('chore-champ-theme') as ThemeMode;
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const initializeTheme = async (): Promise<ThemeMode> => {
  const themeMode = getThemeMode();
  return themeMode;
};

export default ThemeProvider;
