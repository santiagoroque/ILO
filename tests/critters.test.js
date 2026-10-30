// Tests for Phase 13 round A: the Coast's water and boardwalks, and the wild
// animals (js/critters.js). Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createCritters, CRITTER_FRAMES, CRITTERS, isVisible, updateCritters } from '../js/critters.js';
import { buildRoom, canWalk, collides, random } from '../js/world-data.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const worldData = readJson('../world/world.json');
const size = { width: worldData.roomWidth, height: worldData.roomHeight };
const built = Object.fromEntries(worldData.rooms.map(({ id }) => [id, buildRoom(readJson(`../world/rooms/${id}.json`), size)]));
const FAR = { x: -1000, y: -1000 }; // Ilo far away.

// Runs the animals for `seconds`, checking `check` after every step.
function run(critters, world, avatar, seconds, check = () => {}) {
  const rng = random(7);
  for (let t = 0; t < seconds; t += 0.05) {
    updateCritters(critters, world, avatar, 0.05, rng);
    check(critters);
  }
}

test('the sea and the shallows block walking, except on a boardwalk', () => {
  const beach = built['palm-beach'];
  assert.equal(collides(beach, 640, 680), true, 'in the sea');
  assert.equal(collides(beach, 640, 400), false, 'on the sand');
  assert.equal(collides(beach, 980, 620), false, 'on the pier');
  const mangrove = built['mangrove-boardwalk'];
  assert.equal(collides(mangrove, 300, 600), true, 'in the shallows');
  assert.equal(collides(mangrove, 700, 520), false, 'on the boardwalk');
  // The whole boardwalk is walkable from one end to the other.
  const coral = mangrove.exits.find((e) => e.to === 'coral-lookout');
  assert.ok(canWalk(mangrove, mangrove.start, coral.spawn));
});

test('every animal in the rooms is a known kind with its animation frames listed', () => {
  for (const [id, world] of Object.entries(built)) {
    for (const entry of world.critters ?? []) {
      assert.ok(CRITTERS[entry.type], `${id}: ${entry.type}`);
      assert.ok(CRITTER_FRAMES[entry.type], `${id}: frames for ${entry.type}`);
      if (CRITTERS[entry.type].kind === 'popper') assert.ok(entry.x !== undefined, `${id}: ${entry.type} needs a home`);
    }
  }
  const alive = Object.values(built).filter((w) => w.kind === 'outdoor' && w.critters?.length).length;
  assert.ok(alive >= 12, `animals live in ${alive} outdoor rooms`);
});

test('ground animals only stand where Ilo could stand, and waders only in the water', () => {
  for (const [id, world] of Object.entries(built)) {
    const critters = createCritters(world, random(3));
    run(critters, world, FAR, 30, (list) => {
      for (const c of list) {
        if (c.kind !== 'hopper' || c.flying || c.state === 'gone') continue;
        // Waders (herons) stand in the water instead, never on a boardwalk.
        const blocked = collides(world, c.x, c.y, 4);
        assert.equal(blocked, Boolean(CRITTERS[c.type].water), `${id}: ${c.type} at ${Math.round(c.x)}, ${Math.round(c.y)}`);
      }
    });
  }
});

test('a bird flies away when Ilo walks up, and comes back somewhere else later', () => {
  const world = built.plaza;
  const critters = createCritters(world, random(5)).filter((c) => c.type === 'pigeon').slice(0, 1);
  const bird = critters[0];
  run(critters, world, { x: bird.x + 20, y: bird.y }, 0.2);
  assert.equal(bird.state, 'flyaway');
  const avatar = { x: bird.x, y: bird.y };
  run(critters, world, avatar, 2.5);
  assert.equal(bird.state, 'gone');
  assert.equal(isVisible(bird), false);
  run(critters, world, avatar, 15);
  assert.notEqual(bird.state, 'gone');
  assert.ok(Math.hypot(bird.x - avatar.x, bird.y - avatar.y) > 200, 'it lands away from Ilo');
});

test('a meerkat ducks into its burrow while Ilo is close', () => {
  const world = built['savannah-trail'];
  const meerkat = createCritters(world, random(1)).find((c) => c.type === 'meerkat');
  run([meerkat], world, FAR, 8);
  run([meerkat], world, meerkat.home, 1);
  assert.equal(meerkat.state, 'hidden');
  run([meerkat], world, meerkat.home, 10, ([c]) => assert.equal(isVisible(c), false));
});

test('the elephants cross the waterhole and stop to drink', () => {
  const world = built.waterhole;
  const elephant = createCritters(world, random(2)).find((c) => c.type === 'elephant');
  const seen = new Set();
  run([elephant], world, FAR, 200, ([c]) => seen.add(c.state));
  for (const state of ['away', 'walk', 'drink']) assert.ok(seen.has(state), state);
});

test('ducks and fish stay in their pond', () => {
  const world = built['forest-trail'];
  const pond = world.critters.find((c) => c.type === 'duck'); // Its pond: x, y and radius.
  const swimmers = createCritters(world, random(4)).filter((c) => c.kind === 'swimmer' || c.kind === 'jumper');
  assert.ok(swimmers.length >= 2);
  run(swimmers, world, FAR, 30, (list) => {
    for (const c of list) assert.ok(Math.hypot(c.x - pond.x, (c.y - pond.y) / 0.72) < pond.radius + 30, c.type);
  });
});

test('toucans and macaws sit on palms and fly to another palm when Ilo comes', () => {
  const world = built['palm-beach'];
  const bird = createCritters(world, random(6)).find((c) => c.type === 'toucan');
  assert.equal(bird.state, 'perch');
  assert.ok(bird.z > 100, 'up in the palm');
  const start = { x: bird.x, y: bird.y };
  run([bird], world, start, 0.1);
  assert.equal(bird.state, 'fly');
  run([bird], world, start, 10);
  assert.equal(bird.state, 'perch');
  assert.ok(Math.hypot(bird.x - start.x, bird.y - start.y) > 250);
});

test('the sea turtle swims under the glass deck', () => {
  const turtle = createCritters(built['coral-lookout'], random(3)).find((c) => c.type === 'sea-turtle');
  assert.equal(turtle.under, true);
});

test('elephants come as a herd, one behind another', () => {
  const world = built.waterhole;
  const herd = createCritters(world, random(5)).filter((c) => c.type === 'elephant');
  assert.equal(herd.length, 3);
  let together = 0;
  run(herd, world, FAR, 120, (list) => {
    const seen = list.filter(isVisible);
    if (seen.length > 1) together++;
    for (const a of seen) for (const b of seen) if (a !== b) assert.ok(Math.abs(a.x - b.x) >= 60, `${Math.round(a.x)} and ${Math.round(b.x)}`);
  });
  assert.ok(together > 0, 'they were seen together');
});
