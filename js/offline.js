// Playing without internet after the first visit (sw.js uses this). Many
// schools have weak internet: once a kid has opened the game, its files are
// kept in the browser and served from there, and refreshed in the background
// when the internet is back. No drawing code here, so the tests can run it.

// Change with "version" in package.json at each release (a test checks):
// a new name makes the browser drop the old copy.
export const CACHE_VERSION = '0.1.0';
export const cacheName = () => `ilo-${CACHE_VERSION}`;

// Keep only the game's own files: not other sites, not the SEP books, and not
// the teacher's demo addresses (?time=, ?party=, ?lite=).
export function shouldCache(url, scope) {
  if (!url.startsWith(scope)) return false;
  const { pathname, searchParams } = new URL(url);
  if (pathname.includes('/sources/')) return false;
  return !['time', 'party', 'lite'].some((key) => searchParams.has(key));
}

// Copies from older versions of ILO, to delete.
export const staleCaches = (names) => names.filter((name) => name.startsWith('ilo-') && name !== cacheName());
