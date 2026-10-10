import React from 'react';

interface InstallPromptProps {
  deferredPrompt: Promise<any> | null;
  onDismiss: () => void;
  onInstall: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ deferredPrompt, onDismiss, onInstall }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const promptEvent = window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setShowPrompt(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', promptEvent);
    };
  }, []);

  const handleInstallPrompt = () => {
    setShowPrompt(true);
  };

  const handleCloseInstallPrompt = () => {
    setShowPrompt(false);
  };

  return (
    <>
      {showPrompt && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:rounded-lg md:shadow-lg md:max-w-md z-50 bg-white dark:bg-slate-800 p-4">
          <h3 className="font-semibold mb-2">Install Chore Champ</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Install the app for an offline experience and receive push notifications.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => deferredPrompt.prompt()}
              className="flex-1 bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleCloseInstallPrompt}
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
