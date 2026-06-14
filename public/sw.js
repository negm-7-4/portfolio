/* Tiny service worker — cache-first for static assets, network-first for HTML.
   Makes repeat visits instant. */

const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

/* Precache just the shell. Vite-generated JS/CSS chunks have content hashes
   in their filenames so they'll be picked up on first request and cached
   forever by runtime caching below. */
const SHELL = ["/", "/index.html", "/favicon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests except for fonts.gstatic and prod.spline
  const sameOrigin = url.origin === self.location.origin;
  const isFontFile =
    url.host === "fonts.gstatic.com" || url.host === "fonts.googleapis.com";
  const isSpline = url.host === "prod.spline.design";

  if (!sameOrigin && !isFontFile && !isSpline) return;

  // Network-first for navigations (HTML) so we always get fresh content
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request) || caches.match("/"))
    );
    return;
  }

  // Stale-while-revalidate for everything else — instant from cache,
  // freshen in background
  e.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
