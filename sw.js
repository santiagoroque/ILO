// The offline worker (js/offline.js has the rules). It keeps each of the
// game's files the first time it is fetched, serves it from that copy next
// time (also without internet), and refreshes the copy in the background.
import { cacheName, shouldCache, staleCaches } from './js/offline.js';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of staleCaches(await caches.keys())) await caches.delete(name);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !shouldCache(request.url, self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName());
    const kept = await cache.match(request);
    const fresh = fetch(request)
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
      .catch(() => kept ?? Response.error());
    if (!kept) return fresh;
    event.waitUntil(fresh); // Refresh the copy for next time.
    return kept;
  })());
});
