// Tests for the Phase 13 physics toys (js/toys.js). Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createToys, goalBox, marimbaStones, ridePose, sledHint, TOYS, updateToys, usePoint, useToy } from '../js/toys.js';
import { buildRoom, canWalk, collides } from '../js/world-data.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const worldData = readJson('../world/world.json');
const size = { width: worldData.roomWidth, height: worldData.roomHeight };
const built = Object.fromEntries(worldData.rooms.map(({ id }) => [id, buildRoom(readJson(`../world/rooms/${id}.json`), size)]));
const FAR = { x: -1000, y: -1000 };

// Kicks a ball from the left and returns how far it rolled.
function roll(world, x, y, seconds = 6) {
  const [ball] = createToys({ ...world, toys: [{ type: 'ball', x, y }] });
  updateToys([ball], world, { x: x - 20, y }, 0.02, 0);
  for (let t = 0; t < seconds; t += 0.02) {
    updateToys([ball], world, FAR, 0.02, t);
    assert.equal(collides(world, ball.x, ball.y, 12), false, 'the ball never goes into a tree or a wall');
  }
  assert.ok(Math.hypot(ball.vx, ball.vy) < 1, 'it stopped');
  return Math.hypot(ball.x - x, ball.y - y);
}

test('a kicked ball rolls farther on snow than on the plaza, and farther there than on sand', () => {
  // Open lanes in each room, with nothing in the way for a long roll.
  const snow = roll(built['snowy-ridge'], 120, 540);
  const stone = roll(built.plaza, 460, 400);
  const sand = roll(built['palm-beach'], 420, 540);
  assert.ok(snow > stone && stone > sand, `snow ${snow}, stone ${stone}, sand ${sand}`);
});

test('a ball rolling into the goal scores once, then comes back', () => {
  const world = built.plaza;
  const toys = createToys(world);
  const ball = toys.find((t) => t.type === 'ball');
  const goal = toys.find((t) => t.type === 'goal');
  const box = goalBox(goal);
  Object.assign(ball, { x: (box.x1 + box.x2) / 2, y: box.y2 - 5, vx: 0, vy: 0 });
  const events = updateToys(toys, world, FAR, 0.02, 1);
  assert.deepEqual(events.map((e) => e.type), ['goal']);
  assert.deepEqual(updateToys(toys, world, FAR, 0.02, 1.1), []);
  updateToys(toys, world, FAR, 0.02, 3);
  assert.deepEqual({ x: ball.x, y: ball.y }, ball.home);
});

test('the swing goes back and forth, and pumping it goes higher (up to a limit)', () => {
  const world = built['forest-trail'];
  const swing = createToys(world).find((t) => t.type === 'swing');
  let ride = useToy(swing, usePoint(swing), 0);
  const xs = [];
  for (let t = 0; t < 2.2; t += 0.05) xs.push(ridePose(ride, world, 0.05, t).x);
  assert.ok(Math.max(...xs) > swing.x + 15 && Math.min(...xs) < swing.x - 15);
  const before = ride.amplitude;
  for (let i = 0; i < 10; i++) ride = useToy(swing, usePoint(swing), 1, ride);
  assert.ok(ride.amplitude > before && ride.amplitude <= 0.9);
});

test('the bouncy mushroom bounces higher each time, then lets Ilo off', () => {
  const world = built['mushroom-hollow'];
  const mushroom = createToys(world).find((t) => t.type === 'bounce-mushroom');
  const ride = useToy(mushroom, usePoint(mushroom), 0);
  const peak = (n) => ridePose(ride, world, 0.01, n * 0.7 + 0.35).z;
  assert.ok(peak(3) > peak(0));
  assert.equal(ridePose(ride, world, 0.01, 9 * 0.7).done, true);
});

test('the sled speeds up down the slope, then friction on the snow stops it', () => {
  const world = built['snowy-ridge'];
  const hill = createToys(world).find((t) => t.type === 'sled-hill');
  const ride = useToy(hill, usePoint(hill), 0);
  let pose;
  let t = 0;
  for (; t < 20; t += 0.02) {
    pose = ridePose(ride, world, 0.02, t);
    if (pose.done) break;
  }
  assert.equal(pose.done, true);
  assert.ok(Math.hypot(pose.x - hill.x, pose.y - hill.y) > 200, 'it slides past the bottom of the slope');
});

test('each marimba stone plays its note once when stepped on', () => {
  const world = built['waterfall-cove'];
  const stones = createToys(world).find((t) => t.type === 'marimba-stones');
  const [, , middle, next] = marimbaStones(stones);
  assert.deepEqual(updateToys([stones], world, middle, 0.02, 0).map((e) => e.note), [64]);
  assert.deepEqual(updateToys([stones], world, middle, 0.02, 0.1), []);
  assert.deepEqual(updateToys([stones], world, next, 0.02, 0.2).map((e) => e.note), [67]);
});

test('the lost spoon slides to the magnet rock faster and faster, and sticks', () => {
  const world = built['frozen-lake'];
  const rock = createToys(world).find((t) => t.type === 'magnet-rock');
  const speeds = [];
  let stuck = false;
  updateToys([rock], world, { ...rock.spoon }, 0.02, 0);
  for (let t = 0; t < 5 && !stuck; t += 0.02) {
    stuck = updateToys([rock], world, FAR, 0.02, t).some((e) => e.type === 'stick');
    speeds.push(rock.spoonSpeed);
  }
  assert.ok(stuck);
  assert.ok(speeds.at(-1) > speeds[0] * 3);
});

test('every toy can be reached on foot and is a known kind', () => {
  for (const [id, world] of Object.entries(built)) {
    for (const toy of world.toys ?? []) {
      assert.ok(TOYS[toy.type], `${id}: ${toy.type}`);
      const spot = toy.type === 'ball' ? toy : usePoint(toy);
      if (TOYS[toy.type].use || toy.type === 'ball') assert.ok(canWalk(world, world.start, spot), `${id}: ${toy.type} unreachable`);
    }
  }
});

test('the sled starts on the hilltop, slides down the steep side and on across the snow', () => {
  const world = built['snowy-ridge'];
  const hill = createToys(world).find((t) => t.type === 'sled-hill');
  const [top, foot, end] = sledHint(hill).points;
  assert.ok(top.y < foot.y - 80, 'the top is high on the hill picture');
  assert.ok(Math.hypot(usePoint(hill).x - foot.x, usePoint(hill).y - foot.y) < 40, 'the kid presses Use at the foot');
  assert.ok(Math.hypot(end.x - foot.x, end.y - foot.y) > 150, 'the arrow runs on across the snow');
  const ride = useToy(hill, usePoint(hill), 0);
  const first = ridePose(ride, world, 0.02, 0.02);
  assert.ok(Math.hypot(first.x - top.x, first.y - top.y) < 15, 'the ride begins at the top');
  let pose = first;
  let passedFoot = false;
  for (let t = 0.04; t < 20 && !pose.done; t += 0.02) {
    pose = ridePose(ride, world, 0.02, t);
    if (Math.hypot(pose.x - foot.x, pose.y - foot.y) < 12) passedFoot = true;
  }
  assert.ok(passedFoot, 'it comes down the steep side');
  assert.equal(sledHint(hill), null, 'the arrow is gone after the first ride');
});
