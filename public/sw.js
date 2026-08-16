// AuraOS Modern Progressive Web App Service Worker
const CACHE_NAME = 'auraos-pwa-v3';
const OFFLINE_URL = '/';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache non-fatal error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude API proxy, dynamic streaming, and external third party APIs from strict service worker caching
  if (url.pathname.startsWith('/api/proxy') || url.pathname.startsWith('/api/terminal') || url.pathname.startsWith('/api/ai')) {
    return;
  }

  // Stale-While-Revalidate / Network-First with Cache Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // If valid response, clone and update cache
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((_fetchError) => {
          // If network fails and request is for an HTML navigation, return cached root
          if (event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Support manual skip waiting message from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
