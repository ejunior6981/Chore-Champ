import React from 'react';

export interface InstallPromptProps {
  onDismiss: () => void;
  onInstall: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss, onInstall }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      const deferredPrompt = window.__deferredPrompt;
      if (deferredPrompt) {
        window.__deferredPrompt = null;
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-indigo-500 text-white p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RocketIcon className="w-5 h-5" />
          <div>
            <p className="font-semibold">Install Chore Champ</p>
            <p className="text-sm text-indigo-100">Get the full experience without ads!</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDismiss} className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Dismiss
          </button>
          <button onClick={onInstall} className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800">
            Install
          </button>
        </div>
      </div>
    </div>
  );
};
