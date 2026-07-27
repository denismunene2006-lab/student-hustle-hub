// Student Hustle Hub - Service Worker
const CACHE = 'shhub-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/config.js',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/favicons/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CDN resources: network first, fallback to cache (for Tailwind and Lucide)
  if (url.hostname === 'cdn.tailwindcss.com' || url.hostname === 'unpkg.com') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          return caches.match(request);
        })
    );
    return;
  }

  // API requests: network only, never cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com') || url.hostname === 'localhost') {
    return;
  }

  // Static assets: cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
