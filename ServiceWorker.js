const CACHE_NAME = "psycho-quest-pwa-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./Build/2WEBAPP220826.loader.js",
  "./Build/2WEBAPP220826.data.unityweb",
  "./Build/2WEBAPP220826.framework.js.unityweb",
  "./Build/2WEBAPP220826.wasm.unityweb"
];

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching app files...");
        return cache.addAll(FILES_TO_CACHE);
      })
  );

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log(
                "[Service Worker] Removing old cache:",
                name
              );

              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});


self.addEventListener("fetch", (event) => {

  const request = event.request;

  // Δεν αποθηκεύουμε POST requests.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Δεν αποθηκεύουμε εξωτερικά requests,
  // π.χ. Wix Save / Load.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {

            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === "opaque"
            ) {
              return networkResponse;
            }

            const responseCopy =
              networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(
                  request,
                  responseCopy
                );
              });

            return networkResponse;
          });
      })
  );
});