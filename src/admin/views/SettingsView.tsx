import React, { useState } from 'react';
import { CogIcon } from './icons';

interface SettingsViewProps {
  onSaveSettings: (settings: any) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSaveSettings }) => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundEnabled: true,
    badgeEnabled: true,
    darkMode: false,
    weeklyReset: false,
    pointMultiplier: 1,
  });

  const [showSaveModal, setShowSaveModal] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSaveSettings(settings);
    setShowSaveModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Settings
        </h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Show notifications for chore completions and approvals
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('notificationsEnabled')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Sound
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Play sounds for notifications
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('soundEnabled')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Badge
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Show notification badge
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('badgeEnabled')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${settings.badgeEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${settings.badgeEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              App Settings
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Dark Mode
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enable dark theme
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('darkMode')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Weekly Reset
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Reset daily chores every Sunday
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting('weeklyReset')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${settings.weeklyReset ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${settings.weeklyReset ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Point Multiplier
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Point Multiplier
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.pointMultiplier}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      pointMultiplier: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Multiply all chore points by this factor
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Save Settings
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to save these settings?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
