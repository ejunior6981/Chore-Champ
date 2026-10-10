import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, getThemeMode, ThemeMode } from './theme/theme-provider';

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('chore-champ-theme') as ThemeMode;
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeMode('dark');
    }
  }, []);

  return (
    <ThemeProvider themeMode={themeMode}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <header className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Chore Champ</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newMode = themeMode === 'light' ? 'dark' : 'light';
                setThemeMode(newMode);
                localStorage.setItem('chore-champ-theme', newMode);
              }}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              ☀️/🌙
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Welcome to Chore Champ!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your local development instance is running.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                  📋 Sample Chores
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Feed the pets (10 pts)</li>
                  <li>• Take out trash (15 pts)</li>
                  <li>• Make bed (5 pts)</li>
                  <li>• Clean room (20 pts)</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  🎁 Sample Rewards
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Extra Screen Time (100 pts)</li>
                  <li>• Choose Dinner (50 pts)</li>
                  <li>• Sleepover (200 pts)</li>
                  <li>• Toy Store Visit (150 pts)</li>
                </ul>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                  👨‍👩‍👧‍👦 Family Members
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Mom (Parent) - 500 pts</li>
                  <li>• Dad (Parent) - 450 pts</li>
                  <li>• Alex (Child) - 200 pts</li>
                  <li>• Sam (Child) - 150 pts</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold mb-2">Features Available:</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>✅ Create, edit, delete chores</li>
                <li>✅ Add custom rewards</li>
                <li>✅ Request/approve points</li>
                <li>✅ Theme switching (light/dark)</li>
                <li>✅ Offline support</li>
                <li>✅ Push notifications</li>
              </ul>
            </div>
          </div>

          <footer className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>Chore Champ v1.0.0 - Local Development Mode</p>
            <p className="mt-2">Ready for testing! Open the full app to start managing chores and rewards.</p>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
