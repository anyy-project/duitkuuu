const CACHE_NAME = 'financeflow-app-v1';
const urlsToCache = [
  '/duitkuuu/',
  '/duitkuuu/index.html',
  '/duitkuuu/style.css',
  '/duitkuuu/app.js',
  '/duitkuuu/manifest.json',
  '/duitkuuu/favicon.svg',
  '/duitkuuu/icon.svg',
  '/duitkuuu/icon-192.png',
  '/duitkuuu/icon-512.png',
  '/duitkuuu/favicon.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All files cached');
        return self.skipWaiting();
      })
  );
});

// Fetch from Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});
