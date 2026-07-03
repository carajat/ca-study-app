const CACHE_NAME = 'ca-tracker-v41';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache busting on install
        return Promise.all(
          ASSETS.map(url => {
            return fetch(url + '?v=' + new Date().getTime())
              .then(response => {
                if (!response.ok) throw new Error('Network error');
                return cache.put(url, response);
              });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
      .catch(() => caches.match('/index.html', { ignoreSearch: true }))
  );
});
