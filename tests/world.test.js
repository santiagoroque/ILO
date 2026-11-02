// Tests for the rooms, coins, clothing, pets and house. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach, test } from 'node:test';
import { hasClothingDrawing } from '../js/avatar.js';
import { FURNITURE } from '../js/furniture.js';
import { placementOk } from '../js/house.js';
import { hasPetDrawing } from '../js/pet.js';
import {
  areaOf, arrivalPoint, buildRoom, canWalk, collides, exitLabelSpot, exitSignSpot, findPath, HUD, moveWithCollisions, stationNear, withFurniture,
} from '../js/world-data.js';
import { stampEarned } from '../js/stamps.js';
import { mapButtons } from '../js/world-map.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const worldData = readJson('../world/world.json');
const rooms = Object.fromEntries(worldData.rooms.map(({ id }) => [id, readJson(`../world/rooms/${id}.json`)]));
const size = { width: worldData.roomWidth, height: worldData.roomHeight };
const built = Object.fromEntries(Object.entries(rooms).map(([id, r]) => [id, buildRoom(r, size)]));
const items = readJson('../world/items.json');

// progress.js uses the browser's localStorage; give Node a simple stand-in.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};
const progress = await import('../js/progress.js');
beforeEach(() => store.clear());
const DAY = 24 * 60 * 60 * 1000;

// ---- Rooms ----

test('there are 23 rooms: 15 outdoors (4 on the Coast, the Market street), the house and 7 building interiors', () => {
  assert.equal(worldData.rooms.length, 23);
  assert.equal(Object.values(rooms).filter((r) => r.kind === 'indoor').length, 7);
  assert.equal(Object.values(rooms).filter((r) => r.kind === 'outdoor').length, 15);
  const types = new Set(Object.values(rooms).flatMap((r) => r.areas.map((a) => a.type)));
  for (const type of ['forest', 'savannah', 'arctic', 'plaza', 'indoor', 'sand', 'jungle', 'sea', 'shallows']) assert.ok(types.has(type), type);
});

test('every room can be reached from the start room by exits and doors', () => {
  const seen = new Set([worldData.startRoom]);
  const queue = [worldData.startRoom];
  while (queue.length) {
    const room = rooms[queue.shift()];
    const next = [...room.exits.map((e) => e.to), ...room.stations.filter((s) => s.kind === 'room').map((s) => s.room)];
    for (const id of next) {
      if (!seen.has(id)) {
        seen.add(id);
        queue.push(id);
      }
    }
  }
  assert.deepEqual([...seen].sort(), Object.keys(rooms).sort());
});

test('in every room, the doors and exits can be reached on foot from the start point', () => {
  for (const [id, world] of Object.entries(built)) {
    assert.equal(collides(world, world.start.x, world.start.y), false, `${id} start is blocked`);
    for (const s of world.stations) assert.ok(canWalk(world, world.start, s.door), `${id}: ${s.id} door`);
    for (const e of world.exits) {
      assert.equal(collides(world, e.spawn.x, e.spawn.y), false, `${id}: arrival of ${e.id} is blocked`);
      assert.ok(canWalk(world, world.start, { x: e.x + e.width / 2, y: e.y + e.height / 2 }), `${id}: exit ${e.id}`);
    }
  }
});

test('walking out an exit arrives at the matching edge of the next room', () => {
  const west = rooms.plaza.exits.find((e) => e.to === 'forest-trail');
  assert.deepEqual(arrivalPoint(rooms['forest-trail'], west), rooms['forest-trail'].exits.find((e) => e.id === 'east').spawn);
  const houseDoor = rooms.house.exits[0];
  const p = arrivalPoint(rooms.plaza, houseDoor);
  const station = built.plaza.stations.find((s) => s.id === 'my-house');
  assert.ok(Math.hypot(p.x - station.door.x, p.y - station.door.y) < 20, 'leaving the house puts you at its door');
  assert.equal(collides(built.plaza, p.x, p.y), false);
});

test('each building opens an interior whose machine plays its lesson, and its door leads back', () => {
  const expected = { 'drone-post': ['gravity', 'magnets', 'magnet-poles'], 'ice-slide': ['friction'], 'lever-glade': ['lever', 'heat'] };
  for (const [outdoor, lessons] of Object.entries(expected)) {
    const building = rooms[outdoor].stations.find((s) => s.kind === 'room');
    const inside = rooms[building.room];
    assert.deepEqual(inside.stations.filter((s) => s.kind === 'lesson').map((s) => s.lesson), lessons, outdoor);
    assert.equal(inside.exits[0].to, outdoor);
    assert.equal(inside.exits[0].toStation, building.id);
  }
  const catalog = readJson('../lessons/catalog.json').lessons;
  const machines = Object.values(rooms).flatMap((r) => r.stations.filter((s) => s.kind === 'lesson').map((s) => s.lesson));
  assert.deepEqual([...machines].sort(), [...catalog].sort(), 'every lesson has exactly one machine');
});

test('the shop counter is inside the shop', () => {
  assert.equal(rooms['shop-inside'].stations[0].kind, 'shop');
  assert.equal(rooms.plaza.stations.find((s) => s.id === 'shop').room, 'shop-inside');
});

test('there are 25 hidden gems (two per room in the first areas, one in each newer room), all reachable', () => {
  const gems = Object.values(rooms).flatMap((r) => r.collectibles ?? []);
  assert.equal(gems.length, 25);
  assert.equal(new Set(gems.map((g) => g.id)).size, 25);
  for (const [id, world] of Object.entries(built)) {
    for (const gem of world.collectibles) {
      assert.equal(collides(world, gem.x, gem.y), false, `${gem.id} is blocked`);
      assert.ok(canWalk(world, world.start, gem), `${id}: ${gem.id} unreachable`);
    }
  }
});

test('clicking a spot behind obstacles plans a route that never touches them', () => {
  const world = built.plaza;
  const route = findPath(world, world.start, { x: 1150, y: 620 });
  assert.ok(route.length >= 1);
  assert.deepEqual(route.at(-1), { x: 1150, y: 620 });
  let here = world.start;
  for (const point of route) {
    for (let k = 0; k <= 1; k += 0.02) {
      assert.equal(collides(world, here.x + (point.x - here.x) * k, here.y + (point.y - here.y) * k), false);
    }
    here = point;
  }
});

test('clicking on a solid thing walks to the closest free spot instead', () => {
  const world = built.plaza;
  const route = findPath(world, world.start, { x: 640, y: 420 }); // The fountain.
  const end = route.at(-1);
  assert.equal(collides(world, end.x, end.y), false);
  assert.ok(Math.hypot(end.x - 640, end.y - 420) < 90);
});

test('rooms are the same every time they are built', () => {
  assert.deepEqual(buildRoom(rooms['forest-trail'], size).decorations, built['forest-trail'].decorations);
});

test('the avatar slides along a building wall instead of stopping', () => {
  const world = built['drone-post'];
  const [left, top, , bottom] = world.stations[0].art.footprint.rect;
  const x = left - 13; // Touching the wall (the feet reach 12 to the side).
  const y = (top + bottom) / 2;
  assert.equal(collides(world, x + 4, y + 3), true);
  const moved = moveWithCollisions(world, x, y, 4, 3);
  assert.equal(moved.blocked, false);
  assert.equal(moved.x, x);
  assert.ok(moved.y > y);
});

test('the avatar walks around the fountain to reach the shop door', () => {
  const world = built.plaza;
  const door = world.stations.find((s) => s.id === 'shop').door;
  let { x, y } = world.start; // Straight below the fountain.
  for (let i = 0; i < 400 && Math.hypot(door.x - x, door.y - y) > 5; i++) {
    const dx = door.x - x;
    const dy = door.y - y;
    const len = Math.hypot(dx, dy);
    const step = Math.min(4, len);
    ({ x, y } = moveWithCollisions(world, x, y, (dx / len) * step, (dy / len) * step));
  }
  assert.ok(Math.hypot(door.x - x, door.y - y) <= 5, `stopped at ${Math.round(x)}, ${Math.round(y)}`);
});

test('every exit label is away from the start spot and the toolbar corners', () => {
  for (const [id, world] of Object.entries(built)) for (const exit of world.exits) {
    const p = exitLabelSpot(world, exit);
    assert.ok(Math.hypot(p.x - world.start.x, p.y - world.start.y) >= 90, `${id} -> ${exit.to}`);
    assert.ok(!HUD.some(([l, t, r, b]) => p.x > l && p.x < r && p.y > t && p.y < b), `${id} -> ${exit.to} under the toolbar`);
    // On a phone the toolbar runs along the whole bottom: labels stay above it.
    assert.ok(p.y <= world.height - 130, `${id} -> ${exit.to} too low for a phone (${p.y})`);
  }
});

test('a side exit\'s sign picture carries its name on the plate', () => {
  for (const [id, world] of Object.entries(built)) for (const exit of world.exits) {
    if (exit.x > 0 && exit.x + exit.width < world.width) continue; // Top and bottom exits have an arrow, not a sign.
    const label = exitLabelSpot(world, exit);
    const sign = exitSignSpot(world, exit);
    assert.deepEqual({ x: sign.x, y: sign.y - 11 }, label, `${id} -> ${exit.to}`);
  }
});

test("a room's own extras add scenery that blocks walking, and move the designers' pieces", () => {
  const glade = rooms['lever-glade'];
  const tree = glade.layout.objects.find((o) => o.type === 'tree');
  const world = buildRoom({
    ...glade,
    extras: { add: [{ type: 'rock', x: 300, y: 600, scale: 1.5 }], move: [{ type: 'tree', index: 0, x: tree.x + 40, y: tree.y + 10 }] },
  }, size);
  const rock = world.decorations.find((d) => d.type === 'rock');
  assert.deepEqual({ asset: rock.asset, layer: rock.layer, scale: rock.scale }, { asset: 'world/decorations/rock.svg', layer: 'stand', scale: 1.5 });
  assert.equal(collides(world, 300, 600), true, 'the rock is solid');
  const moved = world.decorations.find((d) => d.type === 'tree');
  assert.deepEqual([moved.x, moved.y], [tree.x + 40, tree.y + 10]);
  assert.deepEqual(moved.footprint.ellipse.slice(0, 2), [tree.footprint.ellipse[0] + 40, tree.footprint.ellipse[1] + 10], 'its footprint moves with it');
  assert.equal(glade.layout.objects.find((o) => o.type === 'tree').x, tree.x, 'the room file is untouched');
});

test('every room is a layered room', () => {
  for (const [id, room] of Object.entries(rooms)) assert.ok(room.layout, id);
});

test('each room knows its area from its layout', () => {
  assert.equal(areaOf(rooms['palm-beach']), 'coast');
  assert.equal(areaOf(rooms['snowy-ridge']), 'arctic');
  assert.equal(areaOf(rooms.house), 'indoor');
  assert.equal(areaOf(rooms.plaza), 'plaza');
});

test('the map has a button for each of the 16 places and 6 machines', () => {
  const buttons = mapButtons(worldData, rooms);
  assert.equal(buttons.filter((b) => !b.station).length, 16);
  assert.equal(buttons.filter((b) => b.station).length, 6);
  for (const b of buttons) assert.ok(b.left >= 0 && b.left <= 100 && b.top >= 0 && b.top <= 100, b.label);
});

test('a station prompt appears only near its door', () => {
  const s = built.plaza.stations[0];
  assert.equal(stationNear(built.plaza, s.door.x, s.door.y)?.id, s.id);
  assert.equal(stationNear(built.plaza, s.door.x + 400, s.door.y + 300), null);
});

// ---- Saves, coins and clothing ----

test('an old save is upgraded: the hat moves to the head, coins are kept', () => {
  store.set('ilo.v1', JSON.stringify({ coins: 20, look: { color: 'coral', hat: 'cap' }, owned: { cap: true }, position: { x: 900, y: 800 } }));
  assert.deepEqual(progress.getLook({ color: 'teal', head: null }), { color: 'coral', head: 'cap' });
  assert.equal(progress.getCoins(), 20);
  assert.equal(progress.getWorldPosition(), null, 'old big-map positions are dropped');
});

test('the welcome gift is given only once', () => {
  assert.equal(progress.claimWelcomeGift(), true);
  assert.equal(progress.claimWelcomeGift(), false);
  assert.equal(progress.getCoins(), progress.WELCOME_GIFT);
});

test('winning a lesson pays coins only the first time', () => {
  assert.equal(progress.completeLesson('gravity', 50), 50);
  assert.equal(progress.completeLesson('gravity', 50), 0);
  assert.equal(progress.getCoins(), 50);
});

test('clothing is bought once and worn in its own slot', () => {
  progress.claimWelcomeGift();
  const cap = items.clothing.find((c) => c.id === 'cap');
  const scarf = items.clothing.find((c) => c.id === 'scarf');
  assert.equal(progress.buyItem(cap), true);
  assert.equal(progress.buyItem(scarf), true);
  assert.equal(progress.buyItem(cap), true, 'buying again costs nothing');
  assert.equal(progress.getCoins(), 100 - cap.price - scarf.price);
  progress.setLook({ color: 'teal', head: 'cap', neck: 'scarf' });
  assert.deepEqual(progress.getLook({ color: 'teal', head: null, neck: null, face: null }), { color: 'teal', head: 'cap', neck: 'scarf', face: null });
  // Keep buying the cheapest item left until the next one costs too much.
  const left = items.clothing.filter((c) => !progress.ownsItem(c)).sort((p, q) => p.price - q.price);
  while (left.length && left[0].price <= progress.getCoins()) assert.equal(progress.buyItem(left.shift()), true);
  const coins = progress.getCoins();
  assert.ok(left.length, 'the welcome gift does not buy every item');
  assert.equal(progress.buyItem(left[0]), false, 'not enough coins left');
  assert.equal(progress.getCoins(), coins, 'a failed purchase costs nothing');
});

test('every item in items.json has a drawing, and slots are valid', () => {
  for (const c of items.clothing) assert.ok(hasClothingDrawing(c.id), c.id);
  for (const p of items.pets) assert.ok(hasPetDrawing(p.id), p.id);
  for (const f of items.furniture) assert.ok(FURNITURE[f.id], f.id);
  assert.deepEqual([...new Set(items.clothing.map((c) => c.slot))].sort(), [...progress.SLOTS].sort());
});

// ---- Pets ----

test('adopting a pet costs coins and makes it walk with you', () => {
  progress.claimWelcomeGift();
  const fox = items.pets.find((p) => p.id === 'fox');
  assert.equal(progress.adoptPet(fox, 'Chispa'), true);
  assert.equal(progress.getCoins(), 100 - fox.price);
  assert.equal(progress.getActivePet(), 'fox');
  assert.equal(progress.getPets().fox.name, 'Chispa');
  const hare = items.pets.find((p) => p.id === 'hare');
  assert.equal(progress.adoptPet(hare, 'Nube'), false, 'not enough coins for a second pet');
});

test('pet happiness drops over days but never below 10, and food raises it', () => {
  const now = Date.now();
  progress.claimWelcomeGift();
  progress.adoptPet(items.pets[0], 'Kiwi', now);
  const pet = () => progress.getPets()[items.pets[0].id];
  assert.equal(progress.petHappiness(pet(), now), 80);
  assert.equal(progress.petHappiness(pet(), now + 2 * DAY), 60);
  assert.equal(progress.petHappiness(pet(), now + 60 * DAY), 10);
  assert.equal(progress.feedPet(items.pets[0].id, 5, now + 2 * DAY), true);
  assert.equal(progress.petHappiness(pet(), now + 2 * DAY), 80);
});

test('the pet celebrates once after each lesson win', () => {
  assert.equal(progress.takePetCelebration(), false);
  progress.completeLesson('gravity', 50);
  assert.equal(progress.takePetCelebration(), true);
  assert.equal(progress.takePetCelebration(), false);
});

// ---- House ----

test('furniture can be bought more than once and is counted until placed', () => {
  progress.claimWelcomeGift();
  const chair = items.furniture.find((f) => f.id === 'chair');
  progress.buyFurniture(chair);
  progress.buyFurniture(chair);
  assert.deepEqual(progress.unplacedFurniture(), { chair: 2 });
  progress.setHouse({ style: 'adobe', placed: [{ id: 'chair', x: 300, y: 500 }] });
  assert.deepEqual(progress.unplacedFurniture(), { chair: 1 });
  assert.equal(progress.getHouse().style, 'adobe');
});

test('placement rules: floor pieces on the floor, posters on the wall, the door stays free', () => {
  const house = built.house;
  const door = house.exits[0];
  assert.equal(placementOk(house, [], 'bed', 300, 500, null), true);
  assert.equal(placementOk(house, [], 'bed', door.x + door.width / 2, door.y + 10, null), false, 'not on the door');
  assert.equal(placementOk(house, [], 'bed', 300, 150, null), false, 'beds do not go on the wall');
  assert.equal(placementOk(house, [], 'poster', 300, 150, null), true);
  assert.equal(placementOk(house, [], 'poster', 300, 500, null), false, 'posters only on the wall');
  const bed = { id: 'bed', x: 300, y: 500 };
  assert.equal(placementOk(house, [bed], 'table', 320, 490, null), false, 'no solid pieces on top of each other');
  assert.equal(placementOk(house, [bed], 'rug', 320, 520, null), true, 'rugs can go under things');
  assert.equal(placementOk(house, [], 'table', 640, 520, { x: 640, y: 500 }), false, 'not on top of the avatar');
});

test('placed furniture blocks walking, but rugs do not', () => {
  const world = withFurniture(built.house, [{ id: 'bed', x: 300, y: 500 }, { id: 'rug', x: 800, y: 560 }]);
  assert.equal(collides(world, 300, 470), true);
  assert.equal(collides(world, 800, 520), false);
  assert.equal(collides(built.house, 300, 470), false, 'the empty house is free');
});

// ---- Stamps, gems and the daily reward ----

const stampList = readJson('../world/stamps.json').stamps;
const noFacts = {
  completed: {}, lessons: ['gravity', 'friction', 'lever'], visited: [], totalRooms: 15, pets: 0, placed: 0,
  said: 0, danced: false, snowballHits: 0, gems: 0, totalGems: 20, clothingOwned: 0,
};

test('no stamp is earned at the very start', () => {
  assert.deepEqual(stampList.filter((s) => stampEarned(s, noFacts)), []);
});

test('each stamp is earned exactly when its goal is reached', () => {
  const earned = (facts) => stampList.filter((s) => stampEarned(s, { ...noFacts, ...facts })).map((s) => s.id).sort();
  assert.deepEqual(earned({ completed: { gravity: true } }), ['first-delivery']);
  assert.deepEqual(earned({ completed: { gravity: true, friction: true, lever: true } }), ['first-delivery', 'lever-pro', 'smooth-stopper', 'young-scientist']);
  assert.deepEqual(earned({ visited: new Array(7).fill('x') }), []);
  assert.deepEqual(earned({ visited: new Array(8).fill('x') }), ['explorer']);
  assert.deepEqual(earned({ visited: new Array(15).fill('x') }), ['explorer', 'world-traveler']);
  assert.deepEqual(earned({ pets: 1 }), ['pet-friend']);
  assert.deepEqual(earned({ placed: 5 }), ['decorator']);
  assert.deepEqual(earned({ said: 10 }), ['chatterbox']);
  assert.deepEqual(earned({ danced: true }), ['dancer']);
  assert.deepEqual(earned({ snowballHits: 5 }), ['snow-champion']);
  assert.deepEqual(earned({ gems: 20 }), ['gem-finder', 'gem-master']);
  assert.deepEqual(earned({ clothingOwned: 3 }), ['stylish']);
});

test('a stamp pays its reward only once', () => {
  const dancer = stampList.find((s) => s.id === 'dancer');
  assert.deepEqual(progress.awardStamps([dancer]).map((s) => s.id), ['dancer']);
  assert.deepEqual(progress.awardStamps([dancer]), []);
  assert.equal(progress.getCoins(), dancer.reward);
});

test('a gem pays once, and the daily reward pays once per day', () => {
  assert.equal(progress.collectGem('gem-plaza-1', 5), 5);
  assert.equal(progress.collectGem('gem-plaza-1', 5), 0);
  assert.equal(progress.claimDaily('2026-10-27', 20), 20);
  assert.equal(progress.claimDaily('2026-10-27', 20), 0);
  assert.equal(progress.claimDaily('2026-10-28', 20), 20);
  assert.equal(progress.getCoins(), 45);
});

