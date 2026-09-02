const STATIC_CACHE = "alamoudi-static-v6";
const DATA_CACHE = "alamoudi-data-v6";
const MEDIA_CACHE = "alamoudi-media-v6";

const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo.png",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.svg"
];

// Install: Pre-cache App Shell and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older legacy caches & take immediate client control
self.addEventListener("activate", (event) => {
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
self.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "SKIP_WAITING" || event.data.action === "skipWaiting")) {
    self.skipWaiting();
  }
});

// Fetch routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET & non-HTTP(S)
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. Navigation (HTML pages / Deep links): Network-First -> Fallback to cached index.html
  if (request.mode === "navigate") {
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
            return caches.match("/index.html").then((indexFallback) => {
              if (indexFallback) return indexFallback;
              return caches.match("/");
            });
          });
        })
    );
    return;
  }

  // 2. Images & Media (Property photos, icons, banners): Cache-First -> Network Fallback
  if (
    request.destination === "image" ||
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
            return caches.match("/logo.png");
          });
        });
      })
    );
    return;
  }

  // 3. API Requests (/api/* or Supabase): Network-First -> Fallback to cached JSON
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co")) {
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
            return new Response(JSON.stringify({ offline: true, error: "Network unavailable" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          });
        })
    );
    return;
  }

  // 4. Static Assets (JS, CSS, Fonts, Vite Chunks): Stale-While-Revalidate with Cache-First Fallback
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    url.pathname.startsWith("/assets/") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((staticCache) => {
        return staticCache.match(request).then((cached) => {
          if (cached && !navigator.onLine) {
            return cached;
          }
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              staticCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cached);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // 5. Default Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ==========================================
// Web Push Notifications Engine
// ==========================================

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    try {
      data = { title: "العمودي للتسويق العقاري", body: event.data ? event.data.text() : "فرصة عقارية جديدة" };
    } catch {}
  }

  const title = data.title || "العمودي للتسويق العقاري";
  const options = {
    body: data.body || "فرصة عقارية جديدة وحصرية متاحة الآن في المنصة.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/logo.png",
    image: data.image || undefined,
    dir: "rtl",
    lang: "ar",
    tag: data.tag || "alamoudi-property-alert",
    renotify: true,
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    actions: [
      { action: "explore", title: "معاينة العرض الآن ↗" },
      { action: "close", title: "إغلاق" }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

