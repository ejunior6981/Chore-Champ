/**
 * Notification Handler
 * Platform-specific notification logic
 */

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  badge: boolean;
  alert: boolean;
}

export interface NotificationEvent {
  type: 'create' | 'update' | 'delete' | 'view';
  data: any;
}

/**
 * Platform detection
 */
function getPlatform(): 'mobile' | 'tablet' | 'web' {
  const userAgent = navigator.userAgent;
  
  // Mobile devices
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    // Check screen size
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (width < 768 && height < 800) {
      return 'mobile';
    }
    return 'tablet';
  }
  
  // Desktop
  return 'web';
}

/**
 * Check if notifications are supported
 */
export function isNotificationsSupported(): boolean {
  return 'Notification' in window && Notification.permission !== 'denied';
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationsSupported()) {
    console.warn('Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Get notification settings
 */
export function getNotificationSettings(): NotificationConfig {
  try {
    const settings = localStorage.getItem('chore-champ-notification-settings');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Failed to get notification settings:', error);
  }

  return {
    enabled: true,
    sound: true,
    badge: true,
    alert: true,
  };
}

/**
 * Set notification settings
 */
export function setNotificationSettings(settings: NotificationConfig): void {
  try {
    localStorage.setItem(
      'chore-champ-notification-settings',
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error('Failed to set notification settings:', error);
  }
}

/**
 * Show notification for mobile/tablet (installed app)
 */
export async function showInstalledAppNotification(
  title: string,
  body: string,
  data: any
): Promise<void> {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return showBrowserNotification(title, body, data);
  }

  // For installed mobile/tablet apps, use native notifications
  if (isNotificationsSupported()) {
    const notification = new Notification(title, {
      body,
      data,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      silent: !getNotificationSettings().sound,
    });

    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      // TODO: Open app to relevant screen
      console.log('Notification clicked:', data);
    };

    // Close on click
    notification.onclose = () => {
      console.log('Notification closed');
    };
  }
}

/**
 * Show browser notification for web
 */
async function showBrowserNotification(
  title: string,
  body: string,
  data: any
): Promise<void> {
  if (!isNotificationsSupported()) {
    return;
  }

  const notification = new Notification(title, {
    body,
    data,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  });

  // Handle click
  notification.onclick = (event) => {
    event.preventDefault();
    // TODO: Open app to relevant screen
    console.log('Browser notification clicked:', data);
  };

  // Close on click
  notification.onclose = () => {
    console.log('Browser notification closed');
  };
}

/**
 * Handle notification events
 */
export function handleNotificationEvent(event: NotificationEvent): void {
  console.log('Notification event:', event);
  
  // TODO: Implement event handling logic
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  const notifications = document.querySelectorAll('.notification');
  notifications.forEach((notification) => {
    notification.remove();
  });
  console.log('Cleared all notifications');
}

/**
 * Get notification count
 */
export function getNotificationCount(): number {
  try {
    const count = localStorage.getItem('chore-champ-notification-count');
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set notification count
 */
export function setNotificationCount(count: number): void {
  try {
    localStorage.setItem('chore-champ-notification-count', count.toString());
  } catch (error) {
    console.error('Failed to set notification count:', error);
  }
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  const platform = getPlatform();
  
  // Web always has browser notification support
  if (platform === 'web') {
    return isNotificationsSupported();
  }

  // Mobile/tablet check
  return isNotificationsSupported();
}

/**
 * Get platform-specific notification implementation
 */
export function getNotificationImplementation(): 'browser' | 'native' {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return 'browser';
  }
  
  return 'native';
}
