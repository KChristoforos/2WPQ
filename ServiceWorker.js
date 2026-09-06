const CACHE_NAME = "psycho-quest-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // Never intercept Firebase Storage requests.
  if (event.request.url.includes("firebasestorage.googleapis.com")) {
    return;
  }

  // Network first; cached response only as fallback.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
