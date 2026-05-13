const CACHE_NAME = 'ga4-dash-cache-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg'
];

// Instalación: Cacheamos activos estáticos básicos (no HTML)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Network First para documentos (HTML), Cache First para activos estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Para navegaciones (HTML), usamos Network First para evitar estilos rotos por caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Opcional: Actualizar el caché con la nueva versión del HTML
          return response;
        })
        .catch(() => caches.match(request)) // Solo devolvemos caché si falla la red
    );
    return;
  }

  // Para otros activos (imágenes, fuentes, etc.) usamos Cache First
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
