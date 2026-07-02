const CACHE_NAME = 'gymify-cache-v3'; // Bumped version to force update
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/plan',
  '/workout',
  '/history',
  '/coach',
  '/measurements',
  '/nutrition',
  '/progress',
  '/leaderboard',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  // Always skip waiting to immediately install the new service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // On activation, ALWAYS clear all caches to ensure we don't serve stale development files
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Completely bypass service worker caching on localhost (development)
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }

  // Only handle GET requests and exclude next dynamic HMR / API endpoints
  if (event.request.method !== 'GET' || event.request.url.includes('/api/') || event.request.url.includes('/_next/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch and update cache in the background (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {}); // ignore network issues when revalidating
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for document pages when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
