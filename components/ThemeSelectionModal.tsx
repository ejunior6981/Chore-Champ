import React from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from './icons';

interface ThemeSelectionModalProps {
  theme: 'light' | 'dark' | 'system';
  onSetTheme: (mode: 'light' | 'dark' | 'system') => void;
  onClose: () => void;
  className?: string;
}

const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  theme,
  onSetTheme,
  onClose,
  className = '',
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Choose Your Theme</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Select your preferred theme
          </p>
        </div>

        {/* Theme Options */}
        <div className="space-y-3">
          <button
            onClick={() => { onSetTheme('light'); onClose(); }}
            className="w-full p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-3"
          >
            <SunIcon className="w-8 h-8 text-yellow-500" />
            <div className="text-left flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">☀️ Light Mode</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Bright and clean interface</p>
            </div>
          </button>

          <button
            onClick={() => { onSetTheme('dark'); onClose(); }}
            className="w-full p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-3"
          >
            <MoonIcon className="w-8 h-8 text-indigo-400" />
            <div className="text-left flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">🌙 Dark Mode</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Easy on the eyes at night</p>
            </div>
          </button>

          <button
            onClick={() => { onSetTheme('system'); onClose(); }}
            className="w-full p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-3"
          >
            <MonitorIcon className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            <div className="text-left flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">💙 System (Auto)</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Follows your device's theme</p>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-sm text-indigo-800 dark:text-indigo-300 text-center">
            Your theme preference will be saved and applied automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectionModal;
