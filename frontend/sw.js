// Student Hustle Hub - Service Worker
// Increment this version string on each deploy to trigger updates
const SW_VERSION = '2026-07-30-v2';
const CACHE = 'shhub-v4';
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

// HTML pages that should always check network first
const HTML_PAGES = new Set([
  '/index.html', '/login.html', '/register.html', '/dashboard.html',
  '/profile.html', '/create-service.html', '/service.html', '/admin.html',
  '/settings.html', '/guidelines.html', '/terms.html',
]);

self.addEventListener('install', (event) => {
  // Do NOT call self.skipWaiting() here — we want the new SW to wait
  // so the page can show the "Update Now" prompt and let the user control activation.
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
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
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // API requests: network only, never cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com') || url.hostname === 'localhost') {
    return;
  }

  // HTML pages: network first, cache fallback (ensures fresh content after deploy)
  if (HTML_PAGES.has(url.pathname) || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Other static assets (CSS, JS, images): cache first, network fallback
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

// Listen for skip-waiting message from the page (user clicked "Update Now")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});