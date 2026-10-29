// Tests for the rest of Phase 13: evening and weather, parties, residents,
// houses you can buy, furniture and the new stamps. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach, test } from 'node:test';
import { FURNITURE } from '../js/furniture.js';
import { activeParty, decorateRooms } from '../js/parties.js';
import { createResidents, updateResidents } from '../js/residents.js';
import { stampEarned } from '../js/stamps.js';
import { darkness, weatherFor } from '../js/weather.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const parties = readJson('../world/parties.json').parties;
const items = readJson('../world/items.json');
const residentData = readJson('../world/residents.json');
const room = (id) => readJson(`../world/rooms/${id}.json`);

test('the world gets dark in the evening and light again in the morning', () => {
  assert.equal(darkness(12), 0);
  assert.equal(darkness(19), 0.5);
  assert.equal(darkness(23), 1);
  assert.equal(darkness(3), 1);
  assert.equal(darkness(6.5), 0.5);
});

test('snow falls in the Arctic, leaves in the Forest, nothing in the Plaza, and petals during a party', () => {
  assert.equal(weatherFor(room('snowy-ridge')), 'snow');
  assert.equal(weatherFor(room('forest-trail')), 'leaves');
  assert.equal(weatherFor(room('plaza')), null);
  assert.equal(weatherFor(room('house')), null);
  assert.equal(weatherFor(room('waterfall-cove'), { day: 8 }), 'rain');
  assert.equal(weatherFor(room('waterfall-cove'), { day: 9 }), null);
  assert.equal(weatherFor(room('plaza'), { party: parties.find((p) => p.id === 'spring') }), 'jacaranda');
});

test('each party comes on its dates, can be shown any day, and only adds decorations', () => {
  assert.equal(activeParty(parties, new Date(2026, 9, 28)).id, 'dia-de-muertos');
  assert.equal(activeParty(parties, new Date(2026, 11, 15)).id, 'posadas');
  assert.equal(activeParty(parties, new Date(2026, 6, 1)), null);
  assert.equal(activeParty(parties, new Date(2026, 6, 1), 'science-fair').id, 'science-fair');
  assert.equal(activeParty(parties, new Date(2026, 9, 28), 'none'), null);
  const rooms = { plaza: room('plaza') };
  const decorated = decorateRooms(rooms, parties[0]);
  assert.ok(decorated.plaza.decorations.length > rooms.plaza.decorations.length);
  assert.equal(rooms.plaza.decorations.length, room('plaza').decorations.length, 'the room file is untouched');
  for (const party of parties) assert.ok(!party.gift || items.clothing.some((c) => c.id === party.gift), party.id);
});

test('a resident greets Ilo with a tip, and says the next one on the next visit', () => {
  const [profe] = createResidents(room('drone-post'), residentData);
  const near = { x: profe.x, y: profe.y + 40 };
  const far = { x: 0, y: 0 };
  const talked = [];
  updateResidents([profe], near, 0, (r) => talked.push(r.text));
  updateResidents([profe], near, 1, (r) => talked.push(r.text));
  updateResidents([profe], far, 2);
  updateResidents([profe], near, 3, (r) => talked.push(r.text));
  assert.equal(talked.length, 2);
  assert.notDeepEqual(talked[0], talked[1]);
});

test('every furniture piece sold or placed in a room has a size, and its use is known', () => {
  for (const f of items.furniture) assert.ok(FURNITURE[f.id], f.id);
  for (const [id, f] of Object.entries(FURNITURE)) {
    assert.ok(f.width > 0 && f.depth > 0 && f.height > 0, id);
    if (f.use) assert.ok(['sit', 'toggle', 'play', 'bounce', 'music', 'melody'].includes(f.use), `${id}: ${f.use}`);
  }
  assert.equal(items.furniture.filter((f) => f.set && f.set !== 'classic').length, 36);
  assert.equal(items.houseStyles.length, 8);
});

test('the new stamps are earned exactly when their goal is reached', () => {
  const stamps = readJson('../world/stamps.json').stamps;
  const get = (id) => stamps.find((s) => s.id === id);
  const base = { visited: [], spotted: 0, totalCritters: 17, housesBought: 0, toysUsed: 0, goals: 0, evening: false, partied: false, placed: 0 };
  const coast = ['palm-beach', 'mangrove-boardwalk', 'coral-lookout', 'waterfall-cove'];
  assert.equal(stampEarned(get('beachcomber'), { ...base, visited: coast.slice(0, 3) }), false);
  assert.equal(stampEarned(get('beachcomber'), { ...base, visited: coast }), true);
  assert.equal(stampEarned(get('naturalist'), { ...base, spotted: 16 }), false);
  assert.equal(stampEarned(get('naturalist'), { ...base, spotted: 17 }), true);
  assert.equal(stampEarned(get('homeowner'), { ...base, housesBought: 1 }), true);
  assert.equal(stampEarned(get('toy-tester'), { ...base, toysUsed: 4 }), false);
  assert.equal(stampEarned(get('goal-kicker'), { ...base, goals: 1 }), true);
  assert.equal(stampEarned(get('night-owl'), { ...base, evening: true }), true);
  assert.equal(stampEarned(get('party-goer'), { ...base, partied: true }), true);
  assert.equal(stampEarned(get('museum-friend'), { ...base, visited: ['museum-inside'] }), true);
});

// ---- Saves ----
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const progress = await import('../js/progress.js');
beforeEach(() => store.clear());

test('a house style costs coins once; free styles are always yours', () => {
  const cabin = items.houseStyles.find((h) => h.id === 'cabin');
  const treehouse = items.houseStyles.find((h) => h.id === 'treehouse');
  assert.equal(progress.ownsHouse(cabin), true);
  assert.equal(progress.buyHouse(treehouse), false, 'not enough coins');
  store.set('ilo.v1', JSON.stringify({ version: 4, coins: 500 }));
  assert.equal(progress.buyHouse(treehouse), true);
  assert.equal(progress.getCoins(), 500 - treehouse.price);
  assert.equal(progress.buyHouse(treehouse), true);
  assert.equal(progress.getCoins(), 500 - treehouse.price, 'paid only once');
  assert.equal(progress.getPlayStats().housesBought, 1);
});

test('kids who played before houses were sold keep the adobe and ice cabin styles', () => {
  store.set('ilo.v1', JSON.stringify({ version: 3, welcomed: true, coins: 10 }));
  const adobe = items.houseStyles.find((h) => h.id === 'adobe');
  assert.equal(progress.ownsHouse(adobe), true);
  store.set('ilo.v1', JSON.stringify({ version: 3, coins: 10 })); // Never played: nothing to keep.
  assert.equal(progress.ownsHouse(adobe), false);
});

test('a party gift is given once', () => {
  assert.equal(progress.giveItem('marigold-crown'), true);
  assert.equal(progress.giveItem('marigold-crown'), false);
  assert.equal(progress.ownsItem({ id: 'marigold-crown', price: 20 }), true);
});

test('spotting an animal pays once per kind', () => {
  assert.equal(progress.spotCritter('crab'), progress.SPOT_REWARD);
  assert.equal(progress.spotCritter('crab'), 0);
  assert.deepEqual(progress.getSpotted(), ['crab']);
});
