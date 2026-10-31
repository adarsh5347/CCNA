const CACHE_NAME = 'ccna-prep-v76';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/core.js',
  '/assets/js/auth.js',
  '/assets/js/quiz-engine.js',
  '/assets/js/subnetting.js',
  '/assets/js/topology.js',
  '/assets/js/data.js',
  '/assets/js/qb/index.js',
  '/assets/js/qb/build.js',
  '/assets/js/qb/chapters/v1p1.js',
  '/assets/js/qb/chapters/v1p2.js',
  '/assets/js/qb/chapters/v1p3.js',
  '/assets/js/qb/chapters/v2p1.js',
  '/assets/js/qb/chapters/v2p2.js',
  '/assets/js/guide/index.js',
  '/assets/js/guide/v1p1.js',
  '/assets/js/guide/v1p2.js',
  '/assets/js/guide/v1p3.js',
  '/assets/js/guide/v2p1.js',
  '/assets/js/guide/v2p2.js',
  '/assets/js/guide-ui.js',
  '/assets/js/firebase.js',
  '/assets/js/videos.js',
  '/assets/js/config.js',
  '/assets/js/cli.js',
  '/assets/js/labs.js',
  '/assets/js/subscription.js',
  '/assets/js/account.js',
  '/assets/js/admin.js',
  '/assets/icon.svg'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only intercept GET requests from the local origin
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first strategy: always try the network, fall back to cache when offline
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
