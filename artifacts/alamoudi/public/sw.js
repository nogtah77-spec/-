const CACHE_NAME = "alamoudi-cache-v4-live";

// Install: Skip waiting immediately to activate new version
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: Purge ALL old caches immediately across all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for explicit cache-busting messages
self.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "SKIP_WAITING" || event.data.action === "skipWaiting")) {
    self.skipWaiting();
  }
});

// Fetch: Strict Network-First for ALL requests (HTML, JS, CSS, Data) to guarantee instant live code execution
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET, chrome-extensions, or non-http protocols
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Network First Strategy for everything: fetch freshest from server, fallback to cache ONLY if completely offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") {
            return caches.match("/index.html") || caches.match("/");
          }
          return new Response("Network unavailable", { status: 503, statusText: "Offline" });
        });
      })
  );
});
