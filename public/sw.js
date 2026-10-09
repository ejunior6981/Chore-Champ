// Service Worker for Chore Champ PWA
// Handles caching, push notifications, and offline support

const CACHE_NAME = 'chore-champ-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/index-[hash].js',
  '/assets/index-[hash].css',
  '/assets/vendor-[hash].js',
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep only current version caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Old caches deleted');
      return self.clients.claim();
    })
  );
});

// Fetch event: implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension:// requests
  if (url.origin !== location.origin) {
    return;
  }

  // Static assets: cache-first strategy
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset.substring(0, asset.lastIndexOf('/'))))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API requests: network-first strategy with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML and JSON: network-first with cache fallback
  if (request.headers.get('accept')?.includes('text/html') ||
      request.headers.get('accept')?.includes('application/json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else: cache-first
  event.respondWith(cacheFirst(request));
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Try to fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the response
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fall back to cache if network fails
    const cachedResponse = await cache.match(request);
    return cachedResponse || response;
  }
}

// Network-first strategy for API and dynamic content
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try to fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the successful response
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fall back to cache if network fails
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return a friendly offline page
    return caches.match('/offline.html');
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data;
  
  try {
    data = event.data?.json() || {};
  } catch (error) {
    console.error('[SW] Failed to parse push data:', error);
    data = {};
  }
  
  const title = data.title || 'Chore Champ';
  const options = {
    body: data.body || 'Check out Chore Champ!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.data || {},
    tag: data.tag || 'notification',
    requireInteraction: true,
    actions: data.actions || [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const { action } = event.notification.data || {};
  
  if (action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for sync and other commands
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'SYNC_DATA') {
    // Handle sync data if needed
    console.log('[SW] Sync data received');
  }
});

// Background sync event
if ('SyncManager' in window) {
  self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync event:', event.tag);
    
    if (event.tag === 'chore-champ-sync') {
      // Trigger sync in main thread
      event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SYNC_NOW' });
          });
        })
      );
    }
  });
}

// Periodic sync (optional)
// self.addEventListener('periodicsync', (event) => {
//   console.log('[SW] Periodic sync event:', event.tag);
// });
