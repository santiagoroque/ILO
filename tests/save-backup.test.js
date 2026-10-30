// Tests for the progress backup file (js/progress.js): a kid can save a copy
// of their progress and load it on another computer. Run with: npm test
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const progress = await import('../js/progress.js');
beforeEach(() => store.clear());

test('a backup brings back coins and stamps', () => {
  store.set('ilo.v1', JSON.stringify({ version: 4, coins: 321, stamps: ['explorer'] }));
  const file = progress.exportSave();
  store.clear();
  assert.equal(progress.importSave(file), 'ok');
  assert.equal(progress.getCoins(), 321);
  assert.deepEqual(progress.getStamps(), ['explorer']);
});

test('a file that is not an ILO backup changes nothing', () => {
  store.set('ilo.v1', JSON.stringify({ version: 4, coins: 7 }));
  for (const bad of ['', 'hola', '{}', '{"app":"other","data":{}}', '{"app":"ilo","data":{}}', '{"app":"ilo","version":4,"data":[]}']) assert.equal(progress.importSave(bad), 'not-ilo', bad);
  assert.equal(progress.getCoins(), 7);
});

test('a backup from a newer ILO is refused', () => {
  assert.equal(progress.importSave(JSON.stringify({ app: 'ilo', version: 99, data: {} })), 'too-new');
});
