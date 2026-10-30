// Tests for loading a room's pictures (js/room-art.js): only the room Ilo is
// in and its neighbors are turned into pixels, so old school computers do
// not run out of memory. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { actorPrefixes, houseFiles, nearbyRooms, rasterScale, roomFiles } from '../js/room-art.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const worldData = readJson('../world/world.json');
const rooms = Object.fromEntries(worldData.rooms.map(({ id }) => [id, readJson(`../world/rooms/${id}.json`)]));

test('a room lists its own layers and every house style', () => {
  const files = roomFiles(rooms.plaza);
  assert.ok(files.includes('world/rooms-v3/plaza/ground.svg'));
  assert.ok(files.includes('world/rooms-v3/plaza/foreground.svg'));
  assert.ok(files.includes('houses/adobe-exterior-night.svg'));
});

test("the Plaza's neighbors are its exits and its doors", () => {
  assert.deepEqual(nearbyRooms('plaza', rooms), ['forest-trail', 'house', 'market-street', 'palm-beach', 'savannah-trail', 'shop-inside', 'snowy-ridge']);
});

test('big layers are kept at 1x, small pictures at 2x', () => {
  assert.equal(rasterScale([1280, 720]), 1);
  assert.equal(rasterScale([64, 64]), 2);
});

test('a room and its neighbors fit in 150 MB of pixels', () => {
  const anchors = readJson('../assets/anchors.json');
  for (const id of Object.keys(rooms)) {
    const files = new Set([id, ...nearbyRooms(id, rooms)].flatMap((r) => roomFiles(rooms[r])));
    const bytes = [...files].reduce((n, f) => n + (anchors[f] ? anchors[f][0] * anchors[f][1] * 4 * rasterScale(anchors[f]) ** 2 : 0), 0);
    assert.ok(bytes < 150e6, `${id}: ${Math.round(bytes / 1e6)} MB`);
  }
});

test("a room's residents, toys and animals load with it", () => {
  const prefixes = actorPrefixes(rooms['snowy-ridge']);
  for (const p of ['world/residents/snow-guide-', 'world/toys/sled', 'world/critters/snow-hare-']) assert.ok(prefixes.includes(p), p);
  assert.deepEqual(actorPrefixes(rooms.house), []);
});

test("the kid's house loads its style's wall, floor and window, and what they bought", () => {
  assert.deepEqual(houseFiles({ style: 'adobe', wallpaper: null, floor: null }), ['world/walls/adobe-wall.svg', 'world/walls/adobe-window.svg', 'world/textures/indoor-adobe.svg']);
  assert.deepEqual(houseFiles({ style: 'cabin', wallpaper: 'stars', floor: 'talavera' }).slice(3), ['world/walls/wallpaper-stars.svg', 'world/textures/floor-talavera.svg']);
});
