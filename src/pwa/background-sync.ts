// Background sync registration for PWA
// Note: sync registration is not available in all browsers and requires HTTPS

export const registerBackgroundSync = async (): Promise<void> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if ('sync' in registration) {
      await registration.sync.register('chore-champ-sync');
      console.log('Background sync registered');
    } else {
      console.log('Background sync not supported by this browser');
    }
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
};

export const unregisterBackgroundSync = async (): Promise<void> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if ('sync' in registration) {
      await registration.sync.unregister('chore-champ-sync');
      console.log('Background sync unregistered');
    }
  } catch (error) {
    console.error('Failed to unregister background sync:', error);
  }
};
