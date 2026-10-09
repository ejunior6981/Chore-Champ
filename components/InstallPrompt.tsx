import React, { useEffect, useState } from 'react';

interface InstallPromptProps {
  onInstall: () => void;
}

/**
 * InstallPrompt Component
 * Shows install prompt when PWA is not installed
 */
const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if PWA is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // Already installed, don't show prompt
      return;
    }

    // Check for install prompt
    if ('beforeinstallprompt' in window) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent actual install for now
        e.preventDefault();
        // Store install prompt
        setDeferredPrompt(e);
        // Show prompt
        setShowPrompt(true);
      });
    }

    // Also show prompt on first visit if not installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (!isInstalled) {
      // Check if we've already shown the prompt recently
      const shownRecently = localStorage.getItem('chore-champ-install-prompt-shown');
      if (!shownRecently) {
        setShowPrompt(true);
        localStorage.setItem('chore-champ-install-prompt-shown', 'true');
      }
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = deferredPrompt.result;
        console.log('Install prompt dismissed with outcome:', outcome);
        
        // Clear deferred prompt
        deferredPrompt = null;
        
        onInstall();
      } catch (error) {
        console.error('Failed to install PWA:', error);
      }
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Install Chore Champ
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Install the app to get notifications, use offline, and keep it always accessible.
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
