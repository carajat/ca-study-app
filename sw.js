const CACHE_NAME = 'ca-final-companion-v186';
const ASSETS = [
  '/',
  '/index.html?v=186',
  '/style.css?v=186',
  '/data.js?v=186',
  '/app.js?v=186',
  '/sync.js?v=186',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300,0,0',
  'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css',
  'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache busting on install
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignore requests with query params for caching matching
  const request = event.request;
  const url = new URL(request.url);
  
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(response => {
      return response || fetch(request).catch(() => {
        // Fallback for offline if needed
      });
    })
  );
});
