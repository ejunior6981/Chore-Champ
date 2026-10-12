import type { ThemeMode } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

export const initializeTheme = async (): Promise<ThemeMode> => {
  const saved = localStorage.getItem('chore-champ-theme');
  if (saved) {
    return saved as ThemeMode;
  }
  
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return systemPrefersDark ? 'dark' : 'light';
};

export const getThemeMode = (): ThemeMode => {
  return localStorage.getItem('chore-champ-theme') || 'system';
};

export const ThemeProvider: React.FC<{ 
  themeMode: ThemeMode;
  children: React.ReactNode;
}> = ({ themeMode, children }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <>{children}</>;
  }
  
  const themeClass = themeMode === 'dark' ? 'dark' : '';
  
  return (
    <div className={themeClass}>
      {children}
    </div>
  );
};

export const ThemeToggle: React.FC<{
  onToggle: () => void;
}> = ({ onToggle }) => {
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handleChange = () => setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);
  
  return (
    <button onClick={onToggle} className="p-2">
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
