const CACHE_NAME = 'ca-final-companion-v204';
const ASSETS = [
  '/',
  '/index.html?v=204',
  '/style.css?v=204',
  '/app.js?v=204',
  '/data.js?v=204',
  '/sync.js?v=204',
  '/Sortable.min.js',
  '/manifest.json'
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
