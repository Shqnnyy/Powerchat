const CACHE_NAME = 'gemini-powerchat-cache-v1';
// We will cache index.html and the root path. Other assets will be cached on-the-fly.
const urlsToCacheOnInstall = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching critical assets.');
        return cache.addAll(urlsToCacheOnInstall);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to intercept GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a cached response, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's not in the cache, fetch it from the network.
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response before caching
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          // This will be triggered if the network request fails, e.g., offline.
          console.log('Fetch failed for:', event.request.url, error);
          // For this app, we don't have a specific offline page, so we just let the browser show its default error.
          // Re-throw the error to ensure the promise rejects, which is the default behavior.
          throw error;
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
