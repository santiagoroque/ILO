// Tests for playing offline (js/offline.js, used by sw.js): which files are
// kept, and that an update clears the old copy. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CACHE_VERSION, cacheName, fallbackFor, staleCaches, strategyFor } from '../js/offline.js';

const SITE = 'https://santiagoroque.github.io/ILO/';

test('code and data come from the internet first; pictures from the saved copy', () => {
  for (const file of ['', 'index.html', 'lesson.html?id=friction', 'js/world.js', 'css/style.css', 'world/rooms/plaza.json', 'lessons/gravity.json']) {
    assert.equal(strategyFor(`${SITE}${file}`, SITE), 'network-first', file);
  }
  assert.equal(strategyFor(`${SITE}assets/world/decorations/tree.svg`, SITE), 'cache-first');
  assert.equal(strategyFor('https://fonts.googleapis.com/css2', SITE), null);
  assert.equal(strategyFor(`${SITE}sources/libro.pdf`, SITE), null);
});

test('offline, a page opens from its saved copy whatever its question part', () => {
  assert.equal(fallbackFor(`${SITE}index.html?lite=1`), `${SITE}index.html`);
  assert.equal(fallbackFor(`${SITE}lesson.html?id=friction`), `${SITE}lesson.html`);
  assert.equal(fallbackFor(SITE), `${SITE}index.html`);
});

test('an update clears the old copy', () => {
  assert.deepEqual(staleCaches(['ilo-0.0.9', cacheName(), 'other']), ['ilo-0.0.9']);
});

test('the cache is named after the version in package.json', () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(CACHE_VERSION, version);
  assert.equal(cacheName(), `ilo-${version}`);
});
