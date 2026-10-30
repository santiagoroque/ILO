// The offline worker (js/offline.js has the rules). Pages, code and data
// come from the internet when there is one, and a copy is kept for when
// there is not. Pictures and sounds come from the kept copy first. After a
// page opens online, every kept code and data file is refreshed too, so an
// offline visit later never mixes an old file with a new one.
import { cacheName, fallbackFor, staleCaches, strategyFor } from './js/offline.js';

const REFRESH_EVERY = 10 * 60 * 1000; // At most every 10 minutes.
let refreshedAt = 0;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of staleCaches(await caches.keys())) await caches.delete(name);
    await self.clients.claim(); // The first visit's files are kept too.
  })());
});

const keep = (cache, key, response) => cache.put(key, response).catch(() => {}); // A full disk: just play online.

async function refreshCode(cache) {
  refreshedAt = Date.now();
  for (const request of await cache.keys()) {
    if (strategyFor(request.url, self.registration.scope) !== 'network-first') continue;
    try {
      const response = await fetch(request.url, { cache: 'no-cache' });
      if (response.ok) await keep(cache, request.url, response);
    } catch {
      return; // Offline again: try next time.
    }
  }
}

async function networkFirst(event, cache) {
  const key = fallbackFor(event.request.url);
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      event.waitUntil(keep(cache, key, response.clone()));
      if (event.request.mode === 'navigate' && Date.now() - refreshedAt > REFRESH_EVERY) event.waitUntil(refreshCode(cache));
    }
    return response;
  } catch {
    return (await cache.match(key)) ?? Response.error();
  }
}

async function cacheFirst(event, cache) {
  const kept = await cache.match(event.request);
  if (kept) return kept;
  const response = await fetch(event.request);
  if (response.ok) event.waitUntil(keep(cache, event.request, response.clone()));
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const strategy = strategyFor(event.request.url, self.registration.scope);
  if (!strategy) return;
  event.respondWith(caches.open(cacheName()).then((cache) => (strategy === 'network-first' ? networkFirst(event, cache) : cacheFirst(event, cache))));
});
