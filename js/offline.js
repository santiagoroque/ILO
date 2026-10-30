// Playing without internet after the first visit (sw.js uses this). Many
// schools have weak internet: once a kid has opened the game, its files are
// kept in the browser. Code and data always come from the internet when
// there is one, so a page never mixes old and new code after an update; the
// saved copy is only used offline. Pictures, sounds and the font come from
// the saved copy first (they change rarely and are most of the download).
// No drawing code here, so the tests can run it.

// Change with "version" in package.json at each release (a test checks):
// a new name makes the browser drop the old copy.
export const CACHE_VERSION = '0.1.0';
export const cacheName = () => `ilo-${CACHE_VERSION}`;

// How to get a file: 'network-first' (pages, code, data), 'cache-first'
// (assets/), or null to leave it alone (other sites, the SEP books).
export function strategyFor(url, scope) {
  if (!url.startsWith(scope)) return null;
  const path = new URL(url).pathname;
  if (path.includes('/sources/')) return null;
  return path.startsWith(new URL(scope).pathname + 'assets/') ? 'cache-first' : 'network-first';
}

// The saved copy of a page, without its question part (?id=, ?lite=1):
// a folder address means its index.html.
export function fallbackFor(url) {
  const u = new URL(url);
  u.search = '';
  u.hash = '';
  return u.href.endsWith('/') ? `${u.href}index.html` : u.href;
}

// Copies from older versions of ILO, to delete.
export const staleCaches = (names) => names.filter((name) => name.startsWith('ilo-') && name !== cacheName());
