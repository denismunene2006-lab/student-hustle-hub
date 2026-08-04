// Student Hustle Hub - Service Worker
// Increment this version string on each deploy to trigger updates
const SW_VERSION = '2026-08-04-v1';
const CACHE = 'shhub-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/config.js',
  '/manifest.json',
  '/sw.js',
  '/vendor/tailwind.js',
  '/vendor/lucide.js',
  '/assets/fonts/manrope.css',
  '/assets/fonts/manrope-400.ttf',
  '/assets/fonts/manrope-500.ttf',
  '/assets/fonts/manrope-600.ttf',
  '/assets/fonts/manrope-700.ttf',
  '/assets/fonts/manrope-800.ttf',
  '/assets/images/campus-bg.jpg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon.svg',
  '/assets/favicons/favicon.ico',
  '/js/seo.js',
  '/js/loadServices.js',
];

// HTML pages that should always check network first
const HTML_PAGES = new Set([
  '/index.html', '/login.html', '/register.html', '/dashboard.html',
  '/profile.html', '/create-service.html', '/service.html', '/admin.html',
  '/settings.html', '/guidelines.html', '/terms.html',
]);

// External origins that should be cached on fetch (network-first with cache fallback)
const CACHEABLE_EXTERNAL_ORIGINS = [
  'cdn.tailwindcss.com',
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'images.unsplash.com',
  'i.pravatar.cc',
];

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

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // API requests: network only, never cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com') || url.hostname === 'localhost') {
    return;
  }

  // Google OAuth: network only, never cache (requires live connection)
  if (url.hostname === 'accounts.google.com' || url.hostname === 'google.com' || url.hostname === 'gstatic.com') {
    return;
  }

  // External CDN resources: network first, fallback to cache
  if (CACHEABLE_EXTERNAL_ORIGINS.some((origin) => url.hostname === origin || url.hostname.endsWith('.' + origin))) {
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

  // JS, CSS files: network first, cache fallback (ensures fresh scripts/styles after update)
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
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

  // Font files: cache first, network fallback (fonts rarely change)
  if (url.pathname.endsWith('.ttf') || url.pathname.endsWith('.woff') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.otf')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Other static assets (images, manifest, etc.): cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
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