import React from 'react';
import { useTheme } from '../src/theme/theme-provider';
import { MoonIcon, SunIcon, MonitorIcon } from './icons';

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle Component
 * Allows users to switch between light, dark, and system themes
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'light' as const,
      label: '☀️ Light',
      icon: SunIcon,
    },
    {
      id: 'dark' as const,
      label: '🌙 Dark',
      icon: MoonIcon,
    },
    {
      id: 'system' as const,
      label: '💙 System',
      icon: MonitorIcon,
    },
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {themes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all
            ${theme === id
              ? 'bg-indigo-500 text-white shadow-md'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }
          `}
          aria-pressed={theme === id}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label.split(' ')[1]}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
