// Tests for the gravity lesson. Run with: npm test
// They run the real physics with no browser, so they prove the lesson can be
// won only by the right idea.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkLesson, LessonError } from '../js/lesson-loader.js';
import { stepsToWorkspaceState } from '../js/runner.js';
import { PLANETS, runToEnd } from '../js/simulation.js';
import { checkWin } from '../js/win-conditions.js';

const Matter = createRequire(import.meta.url)('matter-js');
const lessonUrl = new URL('../lessons/gravity.json', import.meta.url);
const lesson = JSON.parse(readFileSync(lessonUrl, 'utf8'));

const program = (planet, mass) => [
  { block: 'set_gravity', planet },
  ...(mass ? [{ block: 'set_mass', object: 'package', mass }] : []),
  { block: 'drop', object: 'package' },
];
const play = (steps) => checkWin(lesson, runToEnd(Matter, lesson, steps));

test('only Mars puts the package in the delivery zone', () => {
  const outcomes = Object.fromEntries(Object.keys(PLANETS).map((p) => [p, play(program(p))]));
  assert.equal(outcomes.mars.won, true);
  assert.equal(outcomes.moon.feedback, 'tooFar');
  assert.equal(outcomes.earth.feedback, 'tooShort');
  assert.equal(outcomes.jupiter.feedback, 'tooShort');
});

test('the starting program does not already win', () => {
  assert.equal(play(lesson.startingBlocks).won, false);
});

test('landing spots match the physics formula x = x0 + v * sqrt(2h / g)', () => {
  const pkg = lesson.world.objects.find((o) => o.id === 'package');
  const fallHeight = pkg.y - pkg.height / 2; // The box's bottom edge touches the ground.
  for (const [planet, g] of Object.entries(PLANETS)) {
    const expected = pkg.x + pkg.velocityX * Math.sqrt((2 * fallHeight) / g);
    const { x } = play(program(planet));
    assert.ok(Math.abs(x - expected) < 0.1, `${planet}: landed at ${x}, expected about ${expected.toFixed(2)}`);
  }
});

test('mass does not change where the package lands', () => {
  for (const planet of Object.keys(PLANETS)) {
    const light = play(program(planet, 0.5));
    const heavy = play(program(planet, 500));
    assert.ok(Math.abs(light.x - heavy.x) < 1e-6, `${planet}: ${light.x} vs ${heavy.x}`);
  }
});

test('forgetting to drop gives the "not dropped" feedback', () => {
  assert.deepEqual(play([{ block: 'set_gravity', planet: 'mars' }]), { won: false, feedback: 'notDropped', x: null });
});

test('the same program gives the same result every time', () => {
  assert.deepEqual(play(program('mars')), play(program('mars')));
});

test('starting blocks convert to Blockly format in the right order', () => {
  const state = stepsToWorkspaceState(lesson.startingBlocks, 'package');
  const start = state.blocks.blocks[0];
  assert.equal(start.type, 'when_run');
  assert.equal(start.next.block.type, 'set_gravity');
  assert.equal(start.next.block.fields.PLANET, 'earth');
  assert.equal(start.next.block.next.block.type, 'drop');
});

test('the lesson loader explains a broken reference', () => {
  const broken = structuredClone(lesson);
  broken.winCondition.zone = 'nowhere';
  assert.throws(() => checkLesson(broken, 'lessons/gravity.json'), (error) => {
    return error instanceof LessonError && error.key === 'errors.badReference' && error.vars.value === 'nowhere';
  });
});

test('every lesson passes npm run check', () => {
  execFileSync(process.execPath, [fileURLToPath(new URL('../tools/check-lessons.js', import.meta.url))]);
});

test('Spanish and English app texts have the same keys', () => {
  const es = JSON.parse(readFileSync(new URL('../locales/es.json', import.meta.url), 'utf8'));
  const en = JSON.parse(readFileSync(new URL('../locales/en.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
});
