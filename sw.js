// Service Worker: macht die App offline-fähig.
// - Navigation & Live-Daten: Netz zuerst, bei Fehler letzter Cache-Stand
// - Statische Assets: Cache zuerst (Dateinamen sind inhaltsgehasht)
const CACHE = "wm2026-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    })
    .catch(() => caches.match(request));
}

function cacheFirst(request) {
  return caches.match(request).then(
    (hit) =>
      hit ??
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      }),
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (
    event.request.mode === "navigate" ||
    url.hostname === "raw.githubusercontent.com"
  ) {
    event.respondWith(networkFirst(event.request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
  }
});
