// Tests for playing offline (js/offline.js, used by sw.js): which files are
// kept, and that an update clears the old copy. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CACHE_VERSION, cacheName, shouldCache, staleCaches } from '../js/offline.js';

const SITE = 'https://santiagoroque.github.io/ILO/';

test("only the game's own files are cached", () => {
  assert.equal(shouldCache(`${SITE}assets/world/decorations/tree.svg`, SITE), true);
  assert.equal(shouldCache(`${SITE}index.html`, SITE), true);
  assert.equal(shouldCache('https://fonts.googleapis.com/css2', SITE), false);
  assert.equal(shouldCache(`${SITE}sources/libro.pdf`, SITE), false);
  assert.equal(shouldCache(`${SITE}index.html?time=night`, SITE), false);
});

test('an update clears the old copy', () => {
  assert.deepEqual(staleCaches(['ilo-0.0.9', cacheName(), 'other']), ['ilo-0.0.9']);
});

test('the cache is named after the version in package.json', () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(CACHE_VERSION, version);
  assert.equal(cacheName(), `ilo-${version}`);
});
