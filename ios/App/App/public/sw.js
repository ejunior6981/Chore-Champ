const CACHE_NAME = 'chore-champ-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/*',
  '/static/*'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  return self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('[Service Worker] Cleaned up old caches');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Don't cache 404s
        if (response.status === 404) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  // Get data from the push event
  const data = event.data ? JSON.parse(event.data.text()) : {
    title: 'Chore Champ',
    body: 'You have a new notification!'
  };
  
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'chore-champ',
    vibrate: [100, 50, 100],
    data: {
      url: '/',
      ...data
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Chore Champ', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event - handle PWA lifecycle
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle sync messages
  if (event.data && event.data.type === 'SYNC') {
    console.log('[Service Worker] Sync triggered');
  }
});
