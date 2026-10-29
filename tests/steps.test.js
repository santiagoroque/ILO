// Tests for the Phase 12 lesson path: the order of the steps, warm-up
// questions, where a lesson opens, and the saved place. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach, test } from 'node:test';
import { buildSteps, checkChoice, startStep } from '../js/steps.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const lessons = Object.fromEntries(readJson('../lessons/catalog.json').lessons.map((id) => [id, readJson(`../lessons/${id}.json`)]));
const art = readJson('../assets/anchors.json');

test('every lesson path: hook, warm-ups, predict, build, why, then the changed case and the key idea', () => {
  for (const lesson of Object.values(lessons)) {
    const steps = buildSteps(lesson);
    const types = steps.map((s) => s.type);
    assert.equal(types[0], 'hook', lesson.id);
    assert.equal(types.at(-1), 'keyidea', lesson.id);
    assert.deepEqual(types.slice(1, 1 + lesson.warmups.length), lesson.warmups.map(() => 'warmup'), lesson.id);
    const build = types.indexOf('build');
    assert.ok(types.indexOf('predict') < build, `${lesson.id}: predict comes before building`);
    assert.ok(types.indexOf('why') > build, `${lesson.id}: why comes after the first win`);
    assert.equal(types.includes('fair'), Boolean(lesson.fairComparison), `${lesson.id}: fair test only where the lesson has one`);
    // The changed case: its intro, then its own build step, on its own version.
    const newcase = types.indexOf('newcase');
    assert.ok(newcase > build, lesson.id);
    assert.deepEqual(steps[newcase + 1], { type: 'build', variant: lesson.challenges[0].id }, lesson.id);
    assert.ok(steps.slice(0, newcase).every((s) => s.variant === null), `${lesson.id}: main task first`);
    assert.ok(steps.length <= 12, `${lesson.id}: ${steps.length} steps is too long a path`);
  }
});

test('every warm-up has exactly one right answer, feedback for each option, and real pictures', () => {
  for (const lesson of Object.values(lessons)) {
    assert.ok(lesson.warmups?.length >= 1, `${lesson.id} has warm-ups`);
    for (const warmup of lesson.warmups) {
      const right = warmup.options.filter((o) => checkChoice(warmup, o.id).correct);
      assert.equal(right.length, 1, `${lesson.id}/${warmup.id}`);
      for (const o of warmup.options) assert.ok(o.feedback.es && o.feedback.en, `${lesson.id}/${warmup.id}/${o.id}`);
      for (const picture of [warmup.picture, ...warmup.options.map((o) => o.picture)].filter(Boolean)) {
        assert.ok(art[picture], `${lesson.id}/${warmup.id}: ${picture} is in assets/`);
      }
    }
  }
});

test('a lesson opens at the saved step, at a linked changed case, or from the top once finished', () => {
  const steps = buildSteps(lessons.friction);
  assert.equal(startStep(steps), 0);
  assert.equal(startStep(steps, { saved: 4 }), 4);
  assert.equal(startStep(steps, { saved: steps.length - 1 }), 0); // Finished: start again.
  assert.equal(startStep(steps, { saved: 99 }), 0);
  const newcase = steps.findIndex((s) => s.type === 'newcase');
  assert.equal(startStep(steps, { saved: 2, challenge: 'near-station' }), newcase);
  assert.equal(startStep(steps, { saved: 2, challenge: 'no-such-case' }), 2);
});

// ---- Saved place, warm-up answers and "solved this week" ----
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const progress = await import('../js/progress.js');
beforeEach(() => store.clear());

test('the saved place keeps the furthest step reached, even after going back', () => {
  assert.deepEqual(progress.getPathPlace('heat'), { step: null, reached: 0 });
  progress.setPathPlace('heat', 5);
  progress.setPathPlace('heat', 2);
  assert.deepEqual(progress.getPathPlace('heat'), { step: 2, reached: 5 });
});

test('an older save without a path still loads', () => {
  store.set('ilo.v1', JSON.stringify({ version: 3, coins: 40, completed: { gravity: true } }));
  assert.deepEqual(progress.getPathPlace('gravity'), { step: null, reached: 0 });
  assert.equal(progress.getCoins(), 40);
  assert.equal(progress.solvedThisWeek(), 0); // Solved before solve dates were kept.
});

test('warm-up answers keep every try', () => {
  progress.recordWarmup('magnets', 'can', 'yes', false);
  progress.recordWarmup('magnets', 'can', 'no', true);
  assert.deepEqual(progress.getWarmups('magnets', 'can').map((a) => a.correct), [false, true]);
});

test('"solved this week" counts first solves in the last 7 days only', () => {
  progress.completeLesson('heat', 50);
  progress.completeLesson('heat', 50); // A replay does not count twice.
  progress.completeLesson('friction', 50);
  assert.equal(progress.solvedThisWeek(), 2);
  assert.equal(progress.solvedThisWeek(Date.now() + 8 * 24 * 60 * 60 * 1000), 0);
});
