const CACHE_NAME = 'ga4-dash-cache-v1';
const urlsToCache = [
  '/',
  '/login',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si falla la red y es una navegación, podríamos devolver una página de offline
          // En este momento solo hacemos pass-through con fallback básico
        });
      })
  );
});
