// Tests for the Phase 10 learning upgrades: changed cases, predictions,
// progress states, the journal and the coin economy. Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { beforeEach, test } from 'node:test';
import { checkLesson, outcomeOf, withChallenge } from '../js/lesson-loader.js';
import { PLANETS, RUB_SURFACES, runToEnd, SURFACES } from '../js/simulation.js';
import { stampEarned } from '../js/stamps.js';
import { checkWin } from '../js/win-conditions.js';

const Matter = createRequire(import.meta.url)('matter-js');
const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const lessons = Object.fromEntries(readJson('../lessons/catalog.json').lessons.map((id) => [id, readJson(`../lessons/${id}.json`)]));

// Every group of up to `size` items from a list.
function groups(list, size) {
  if (!size || !list.length) return [[]];
  const [first, ...rest] = list;
  return [...groups(rest, size - 1).map((g) => [first, ...g]), ...groups(rest, size)];
}

// Every setting a kid can pick in a lesson, as a program.
function programs(lesson) {
  const w = lesson.world;
  if (w.model === 'rub') {
    return (w.rub.surfaces ?? Object.keys(RUB_SURFACES)).flatMap((surface) => w.rub.timesOptions.map((times) => ({
      answer: `${surface} x${times}`, steps: [{ block: 'set_rub_surface', surface }, { block: 'rub', times }],
    })));
  }
  if (w.model === 'magnet') {
    const poles = lesson.toolbox.includes('magnet_pole') ? ['N', 'S'] : [w.crane.pole ?? 'S'];
    const picks = groups(w.objects.map((o) => o.id), w.crane.trips).filter((g) => g.length);
    return poles.flatMap((pole) => picks.map((g) => ({
      answer: lesson.toolbox.includes('magnet_pole') ? `${pole}: ${g.join('+')}` : g.join('+'),
      steps: [{ block: 'magnet_pole', pole }, ...g.map((object) => ({ block: 'magnet_pick', object }))],
    })));
  }
  if (lesson.toolbox.includes('set_gravity')) {
    return Object.keys(PLANETS).map((planet) => ({ answer: planet, steps: [{ block: 'set_gravity', planet }, { block: 'drop', object: 'package' }] }));
  }
  if (lesson.toolbox.includes('set_surface')) {
    return Object.keys(SURFACES).map((surface) => ({ answer: surface, steps: [{ block: 'set_surface', surface }, { block: 'push', object: 'sled' }] }));
  }
  return lesson.world.lever.fulcrumOptions.map((position) => ({ answer: position, steps: [{ block: 'move_fulcrum', position }, { block: 'drop', object: 'sandbag' }] }));
}
const play = (lesson, steps) => checkWin(lesson, runToEnd(Matter, lesson, steps));
const winners = (lesson) => programs(lesson).filter((p) => play(lesson, p.steps).won).map((p) => p.answer);

test('every lesson has a changed case with exactly one answer, different from the main one', () => {
  for (const lesson of Object.values(lessons)) {
    assert.ok(lesson.challenges?.length, `${lesson.id} has a changed case`);
    const main = winners(lesson);
    assert.equal(main.length, 1, `${lesson.id}: one answer in the main task`);
    for (const c of lesson.challenges) {
      const changed = withChallenge(lesson, c.id);
      const answers = winners(changed);
      assert.equal(answers.length, 1, `${lesson.id}/${c.id}: exactly one answer (got ${answers})`);
      assert.notEqual(answers[0], main[0], `${lesson.id}/${c.id}: needs a different answer`);
      assert.equal(play(changed, changed.startingBlocks).won, false, `${lesson.id}/${c.id}: starting blocks do not already win`);
    }
  }
});

test('the expected answers: Mars, snow and 8 m; then the Moon, wood and 7 m', () => {
  assert.deepEqual(winners(lessons.gravity), ['mars']);
  assert.deepEqual(winners(withChallenge(lessons.gravity, 'low-fast')), ['moon']);
  assert.deepEqual(winners(lessons.friction), ['snow']);
  assert.deepEqual(winners(withChallenge(lessons.friction, 'near-station')), ['wood']);
  assert.deepEqual(winners(lessons.lever), [8]);
  assert.deepEqual(winners(withChallenge(lessons.lever, 'cracked-spot')), [7]);
  assert.deepEqual(winners(lessons.heat), ['carpet x10']);
  assert.deepEqual(winners(withChallenge(lessons.heat, 'only-wood')), ['wood x15']);
  assert.deepEqual(winners(lessons.magnets), ['clip+nail+cap']);
  assert.deepEqual(winners(withChallenge(lessons.magnets, 'new-items')), ['nut+screw']);
  assert.deepEqual(winners(lessons['magnet-poles']), ['S: box']);
  assert.deepEqual(winners(withChallenge(lessons['magnet-poles'], 'flipped-box')), ['N: box']);
});

test('heat: rougher surfaces and more rubbing always make the block warmer', () => {
  const heat = withChallenge(lessons.heat, 'only-wood');
  const temperature = (lesson, surface, times) => runToEnd(null, lesson, [{ block: 'set_rub_surface', surface }, { block: 'rub', times }]).temperature;
  const bySurface = ['glass', 'wood', 'carpet', 'sandpaper'].map((s) => temperature(lessons.heat, s, 10));
  assert.deepEqual([...bySurface].sort((a, b) => a - b), bySurface);
  const byTimes = [5, 10, 15, 20].map((n) => temperature(heat, 'wood', n));
  assert.deepEqual([...byTimes].sort((a, b) => a - b), byTimes);
  assert.equal(temperature(lessons.heat, 'carpet', 10), 31); // 20 + 10 × 2 × 0.55
});

test('magnets: only iron, steel and opposite poles are lifted; like poles push away', () => {
  const run = (lesson, steps) => runToEnd(null, lesson, steps);
  const lifted = (lesson, object) => run(lesson, [{ block: 'magnet_pick', object }]).collected.includes(object);
  for (const o of lessons.magnets.world.objects) {
    assert.equal(lifted(lessons.magnets, o.id), ['iron', 'steel'].includes(o.material), o.id);
  }
  const poles = lessons['magnet-poles'];
  const pick = (pole) => run(poles, [{ block: 'magnet_pole', pole }, { block: 'magnet_pick', object: 'box' }]);
  assert.deepEqual(pick('N').repelled, ['box']); // N faces N
  assert.deepEqual(pick('S').collected, ['box']); // S faces N
});

test('the crane never makes more trips than it has', () => {
  const steps = lessons.magnets.world.objects.map((o) => ({ block: 'magnet_pick', object: o.id }));
  assert.equal(runToEnd(null, lessons.magnets, steps).picked.length, lessons.magnets.world.crane.trips);
});

test('every run outcome matches exactly one prediction option', () => {
  for (const lesson of Object.values(lessons)) {
    const cases = [lesson, ...lesson.challenges.map((c) => withChallenge(lesson, c.id))];
    for (const variant of cases) {
      for (const p of programs(variant)) {
        const outcome = outcomeOf(play(variant, p.steps));
        const matches = variant.prediction.options.filter((o) => o.outcomes.includes(outcome));
        assert.equal(matches.length, 1, `${variant.id} ${p.answer}: outcome ${outcome}`);
      }
    }
  }
});

test('lessons, their changed cases and teacher notes pass the loader checks', () => {
  for (const lesson of Object.values(lessons)) checkLesson(lesson, `lessons/${lesson.id}.json`);
  const broken = structuredClone(lessons.gravity);
  delete broken.teacher.transfer;
  assert.throws(() => checkLesson(broken, 'x.json'), /missingField/);
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

test('a version 2 save keeps its coins and wins after the upgrade to version 3', () => {
  store.set('ilo.v1', JSON.stringify({ version: 2, coins: 70, completed: { gravity: true } }));
  assert.equal(progress.getCoins(), 70);
  assert.equal(progress.lessonState('gravity'), 'solved');
  assert.equal(progress.lessonState('lever'), 'new');
});

test('progress goes from new to explored, solved and applied, and the changed case pays once', () => {
  assert.equal(progress.lessonState('gravity'), 'new');
  progress.recordRun('gravity', 'gravity', { setting: { planet: 'earth' }, x: 4.8, outcome: 'tooShort', guess: null });
  assert.equal(progress.lessonState('gravity'), 'explored');
  progress.completeLesson('gravity', 50);
  assert.equal(progress.lessonState('gravity'), 'solved');
  assert.equal(progress.completeChallenge('gravity', 30), 30);
  assert.equal(progress.completeChallenge('gravity', 30), 0);
  assert.equal(progress.lessonState('gravity'), 'applied');
  assert.equal(progress.getCoins(), 80);
});

test('the journal keeps the newest 10 runs, apart for each changed case', () => {
  for (let i = 0; i < 12; i++) progress.recordRun('friction', 'friction', { setting: {}, x: i, outcome: 'tooShort', guess: null });
  progress.recordRun('friction', 'friction:near-station', { setting: {}, x: 99, outcome: 'won', guess: 'in' });
  const runs = progress.getJournal('friction');
  assert.equal(runs.length, 10);
  assert.equal(runs[0].x, 11);
  assert.equal(progress.getJournal('friction:near-station').length, 1);
});

test('"Start over" erases everything', () => {
  progress.claimWelcomeGift();
  progress.resetAll();
  assert.equal(progress.getCoins(), 0);
  assert.equal(progress.canSave(), true);
});

// ---- Stamps and economy ----
test('the applied scientist stamp needs every changed case', () => {
  const stamp = readJson('../world/stamps.json').stamps.find((s) => s.condition.type === 'all_applied');
  const facts = (applied) => ({ lessons: ['gravity', 'friction', 'lever'], applied });
  assert.equal(stampEarned(stamp, facts({ gravity: true, friction: true })), false);
  assert.equal(stampEarned(stamp, facts({ gravity: true, friction: true, lever: true })), true);
});

test('coins earned once (no daily gifts) buy most, but not all, of the everyday shop; houses are long-term goals', () => {
  const items = readJson('../world/items.json');
  const stamps = readJson('../world/stamps.json').stamps;
  const world = readJson('../world/world.json');
  const gems = world.rooms.flatMap(({ id }) => readJson(`../world/rooms/${id}.json`).collectibles ?? []).length;
  const GEM_REWARD = 5; // world.js, PLAN.md A18
  const animals = 17; // js/critters.js: each kind spotted once pays progress.SPOT_REWARD
  const lessonCoins = Object.values(lessons).reduce((sum, l) => sum + (l.reward ?? 50) + l.challenges.reduce((s, c) => s + (c.reward ?? 0), 0), 0);
  const once = progress.WELCOME_GIFT + lessonCoins + gems * GEM_REWARD + stamps.reduce((sum, s) => sum + s.reward, 0) + animals * progress.SPOT_REWARD;
  const price = (list) => list.reduce((s, i) => s + i.price, 0);
  // Everyday shop: colors, clothes, pets and the first twelve furniture pieces.
  const everyday = price(items.colors) + price(items.clothing) + price(items.pets) + price(items.furniture.filter((f) => (f.set ?? 'classic') === 'classic'));
  // Long-term goals (Phase 13): houses, wallpapers, floors and the newer furniture sets, reached with daily rewards.
  const longTerm = price(items.houseStyles) + price(items.wallpapers) + price(items.floors) + price(items.furniture.filter((f) => (f.set ?? 'classic') !== 'classic'));
  assert.equal(once, 1099);
  assert.equal(everyday, 1570);
  assert.equal(longTerm, 3835);
  assert.ok(once / everyday > 0.55 && once / everyday < 0.9, 'most of the everyday shop is reachable without daily visits, not all of it');
});
