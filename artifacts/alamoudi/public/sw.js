const STATIC_CACHE = alamoudi-static-v5;
const DATA_CACHE = alamoudi-data-v5;
const MEDIA_CACHE = alamoudi-media-v5;

const APP_SHELL_ASSETS = [
  /,
  /index.html,
  /manifest.json,
  /logo.png,
  /icon-192.png,
  /icon-512.png,
  /favicon.svg
];

// Install: Pre-cache App Shell and activate immediately
self.addEventListener(install, (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older legacy caches & take immediate client control
self.addEventListener(activate, (event) => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message listener for skipWaiting / cache busting
self.addEventListener(message, (event) => {
  if (event.data && (event.data.type === SKIP_WAITING || event.data.action === skipWaiting)) {
    self.skipWaiting();
  }
});

// Fetch routing
self.addEventListener(fetch, (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET & non-HTTP(S)
  if (request.method !== GET || !url.protocol.startsWith(http)) {
    return;
  }

  // 1. Navigation (HTML pages / Deep links): Network-First -> Fallback to cached index.html
  if (request.mode === navigate) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(/index.html).then((indexFallback) => {
              if (indexFallback) return indexFallback;
              return caches.match(/);
            });
          });
        })
    );
    return;
  }

  // 2. Images & Media (Property photos, icons, banners): Cache-First -> Network Fallback
  if (
    request.destination === image ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|ico)(\?.*)?$/i)
  ) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((mediaCache) => {
        return mediaCache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              mediaCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // If offline and image not cached, fallback to logo
            return caches.match(/logo.png);
          });
        });
      })
    );
    return;
  }

  // 3. API Requests (/api/*): Network-First -> Fallback to cached JSON
  if (url.pathname.startsWith(/api/) || url.hostname.includes(supabase.co)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(DATA_CACHE).then((c) => c.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.open(DATA_CACHE).then((c) => c.match(request)).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ offline: true, error: Network unavailable }), {
              status: 503,
              headers: { Content-Type: application/json },
            });
          });
        })
    );
    return;
  }

  // 4. Static Assets (JS, CSS, Fonts): Stale-While-Revalidate
  if (
    request.destination === script ||
    request.destination === style ||
    request.destination === font ||
    url.pathname.startsWith(/assets/) ||
    url.hostname.includes(fonts.googleapis.com) ||
    url.hostname.includes(fonts.gstatic.com)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((staticCache) => {
        return staticCache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              staticCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // 5. Default Fallback: Network First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
