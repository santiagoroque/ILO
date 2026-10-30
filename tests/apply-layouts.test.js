// Tests for the room-layout converter (tools/layout-convert.js), so the next
// design delivery is applied safely. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { convertRoom } from '../tools/layout-convert.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const fixtureRoom = readJson('./fixtures/room-mini.json');
const fixtureLayout = readJson('./fixtures/layout-mini.json').rooms.mini;
const anchors = { 'world/buildings/shop.svg': [170, 260, 85, 260], 'world/decorations/tree.svg': [120, 160, 60, 158] };

test("a door, an exit and the gems move to the designers' spots", () => {
  const { room } = convertRoom(fixtureRoom, fixtureLayout, anchors, { revision: 'test' });
  assert.deepEqual(room.stations[0].door, { x: 400, y: 420 });
  assert.equal(room.exits[0].spawn.x, 1170);
  assert.deepEqual({ x: room.collectibles[0].x, y: room.collectibles[0].y }, { x: 150, y: 640 });
  assert.equal(room.layout.revision, 'test');
});

test('a start spot on a resident is moved aside and noted', () => {
  const { room, notes } = convertRoom(fixtureRoom, fixtureLayout, anchors, { revision: 'test' });
  assert.equal(room.spawn.x, 580); // Straight on the resident: 60 px to the left.
  assert.match(notes[0], /the start was on/);
});

test('the room and layout passed in are not changed', () => {
  const before = JSON.stringify([fixtureRoom, fixtureLayout]);
  convertRoom(fixtureRoom, fixtureLayout, anchors, { revision: 'test' });
  assert.equal(JSON.stringify([fixtureRoom, fixtureLayout]), before);
});

test('a door missing from the layout stops the conversion', () => {
  const lay = { ...fixtureLayout, objects: fixtureLayout.objects.filter((o) => !o.station) };
  assert.throws(() => convertRoom(fixtureRoom, lay, anchors, { revision: 'test' }), /missing from the layout/);
});
