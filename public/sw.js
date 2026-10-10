/* EagleGlow service worker.
 * Caches only static, non-personal assets. Page loads always use the network
 * (offline page if it fails). Logged-in/dynamic routes are never touched.
 * Bump CACHE_VERSION to force devices to drop old caches. */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `eagleglow-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

const NEVER_HANDLE_PREFIXES = [
  "/api",
  "/auth",
  "/admin",
  "/dashboard",
  "/profile",
  "/tutorials",
];

const STATIC_PREFIXES = ["/_next/static/", "/images/", "/fonts/", "/icons/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("eagleglow-static-") && k !== STATIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  if (NEVER_HANDLE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (res) =>
            res ||
            new Response("You are offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
        )
      )
    );
    return;
  }

  if (STATIC_PREFIXES.some((p) => path.startsWith(p))) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const refresh = fetch(request)
            .then((response) => {
              if (response && response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || refresh;
        })
      )
    );
  }
});