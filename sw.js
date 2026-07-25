const CACHE_NAME = 'ca-final-companion-v194';
const ASSETS = [
  '/',
  '/index.html?v=194',
  '/style.css?v=194',
  '/data.js?v=194',
  '/sync.js?v=194',
  '/Sortable.min.js',
  '/manifest.json',
  '/js/main.js?v=194',
  '/js/utils.js?v=194',
  '/js/state.js?v=194',
  '/js/modals.js?v=194',
  '/js/edit-mode.js?v=194',
  '/js/dashboard.js?v=194',
  '/js/exams.js?v=194',
  '/js/schedule.js?v=194',
  '/js/planner.js?v=194',
  '/js/syllabus.js?v=194',
  '/js/tracker.js?v=194',
  '/js/journal.js?v=194',
  '/js/theme.js?v=194'
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
