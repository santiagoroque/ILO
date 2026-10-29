// Tests for the friction and lever lessons. Run with: npm test
// They check the physics models against the textbook formulas (docs/PLAN.md, D13).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { checkLesson } from '../js/lesson-loader.js';
import { runToEnd, SURFACES } from '../js/simulation.js';
import { checkWin } from '../js/win-conditions.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const friction = readJson('../lessons/friction.json');
const lever = readJson('../lessons/lever.json');
const play = (lesson, steps) => checkWin(lesson, runToEnd(null, lesson, steps));

test('both new lessons pass the loader checks', () => {
  checkLesson(friction, 'lessons/friction.json');
  checkLesson(lever, 'lessons/lever.json');
});

// ---- Friction ----
const slide = (surface, mass) => [
  { block: 'set_surface', surface },
  ...(mass ? [{ block: 'set_mass', object: 'sled', mass }] : []),
  { block: 'push', object: 'sled' },
];

test('only snow stops the sled at the station', () => {
  const outcome = Object.fromEntries(Object.keys(SURFACES).map((s) => [s, play(friction, slide(s))]));
  assert.equal(outcome.snow.won, true);
  assert.equal(outcome.ice.feedback, 'tooFar');
  assert.equal(outcome.wood.feedback, 'tooShort');
  assert.equal(outcome.sand.feedback, 'tooShort');
});

test('the starting program does not already win', () => {
  assert.equal(play(friction, friction.startingBlocks).won, false);
});

test('stopping distance matches the textbook formula d = v² / (2 μ g)', () => {
  const sled = friction.world.objects[0];
  for (const [surface, mu] of Object.entries(SURFACES)) {
    if (surface === 'ice') continue; // Slides off the screen before stopping.
    const expected = sled.x + (sled.velocityX ** 2) / (2 * mu * friction.world.gravity);
    const { x } = play(friction, slide(surface));
    assert.ok(Math.abs(x - expected) < 0.01, `${surface}: ${x} vs ${expected}`);
  }
});

test('more friction always stops the sled sooner', () => {
  const stops = ['snow', 'wood', 'sand'].map((s) => play(friction, slide(s)).x);
  assert.ok(stops[0] > stops[1] && stops[1] > stops[2]);
});

test('mass does not change where the sled stops', () => {
  for (const surface of ['snow', 'wood', 'sand']) {
    assert.equal(play(friction, slide(surface, 2)).x, play(friction, slide(surface, 500)).x);
  }
});

test('forgetting to push gives the "not pushed" feedback', () => {
  assert.equal(play(friction, [{ block: 'set_surface', surface: 'snow' }]).feedback, 'notPushed');
});

// ---- Lever ----
const leverRun = (position) => [{ block: 'move_fulcrum', position }, { block: 'drop', object: 'sandbag' }];

test('only the fulcrum closest to the rock lets the sandbag lift it', () => {
  for (const position of lever.world.lever.fulcrumOptions) {
    assert.equal(play(lever, leverRun(position)).won, position === 8, `fulcrum at ${position}`);
  }
});

test('the lever result agrees with the balance of torques (mass x arm)', () => {
  const { from, to, mass } = lever.world.lever;
  const rock = lever.world.objects.find((o) => o.id === 'rock');
  const bag = lever.world.objects.find((o) => o.id === 'sandbag');
  for (const f of lever.world.lever.fulcrumOptions) {
    const effortSide = bag.mass * (f - bag.x) + mass * (f - (from + to) / 2);
    const loadSide = rock.mass * (rock.x - f);
    assert.equal(play(lever, leverRun(f)).won, effortSide > loadSide, `fulcrum at ${f}`);
  }
});

test('the starting program does not already win, and forgetting to drop is explained', () => {
  assert.equal(play(lever, lever.startingBlocks).won, false);
  assert.equal(play(lever, [{ block: 'move_fulcrum', position: 8 }]).feedback, 'notDropped');
});

test('the lever lifts the rock off the ground when it wins', () => {
  const result = runToEnd(null, lever, leverRun(8));
  assert.equal(result.tipped, true);
  assert.ok(result.lift > 0);
});
