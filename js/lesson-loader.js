// Loads lesson files from the lessons/ folder and checks them, so a typo in a
// lesson shows a clear message instead of a blank page. The full check against
// schema/lesson.schema.json is `npm run check`; this one covers the mistakes
// that would break the page.
import { BLOCK_TYPES } from './blocks.js';
import { PLANETS, RUB_SURFACES, SURFACES } from './simulation.js';
import { FEEDBACK_KEYS, WIN_CONDITIONS } from './win-conditions.js';

// Thrown with a translation key, so the page can explain it in ES or EN.
export class LessonError extends Error {
  constructor(key, vars = {}) {
    super(key);
    this.key = key;
    this.vars = vars;
  }
}

export async function fetchJson(file) {
  let response;
  try {
    response = await fetch(file);
  } catch {
    throw new LessonError('errors.notFound', { file });
  }
  if (!response.ok) throw new LessonError('errors.notFound', { file });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new LessonError('errors.badJson', { file, detail: error.message });
  }
}

// lessons/catalog.json lists the lessons in the order they appear.
export async function loadCatalog() {
  const catalog = await fetchJson('lessons/catalog.json');
  return Array.isArray(catalog.lessons) ? catalog.lessons : [];
}

export async function loadLesson(id) {
  if (!id) throw new LessonError('errors.noLesson');
  const file = `lessons/${id}.json`;
  const lesson = await fetchJson(file);
  checkLesson(lesson, file);
  return lesson;
}

// A changed case (Phase 10): the main lesson with the challenge's fields
// put in place of the same fields. Everything else (blocks, physics,
// drawing) works on the result exactly as on the main lesson.
export function withChallenge(lesson, challengeId) {
  const challenge = lesson.challenges?.find((c) => c.id === challengeId);
  if (!challenge) return null;
  return {
    ...lesson,
    title: challenge.title,
    goal: challenge.goal ?? lesson.goal,
    intro: challenge.intro,
    explain: challenge.explain ?? lesson.explain,
    success: challenge.success,
    reward: challenge.reward ?? 0,
    hints: challenge.hints ?? lesson.hints,
    startingBlocks: challenge.startingBlocks ?? lesson.startingBlocks,
    world: { ...lesson.world, ...challenge.world },
    winCondition: { ...lesson.winCondition, ...challenge.winCondition },
    challenge: challenge.id,
    challenges: [],
  };
}

// Which prediction options match a run: "won" or the feedback key.
export const outcomeOf = (result) => (result.won ? 'won' : result.feedback);

export function checkLesson(lesson, file) {
  const need = (value, field) => {
    if (value === undefined || value === null) throw new LessonError('errors.missingField', { file, field });
  };
  const needText = (value, field) => {
    need(value, field);
    if (typeof value.es !== 'string' || typeof value.en !== 'string' || !value.es || !value.en) {
      throw new LessonError('errors.missingText', { file, field });
    }
  };
  const needKnown = (value, known, field) => {
    if (!known.includes(value)) throw new LessonError('errors.badValue', { file, field, value: String(value) });
  };

  for (const field of ['concept', 'title', 'goal', 'learningGoal', 'intro', 'success']) {
    needText(lesson[field], field);
  }
  need(lesson.world, 'world');
  for (const field of ['width', 'height', 'gravity', 'objects', 'zones']) {
    need(lesson.world[field], `world.${field}`);
  }
  const objectIds = lesson.world.objects.map((o) => o.id);
  const zoneIds = lesson.world.zones.map((z) => z.id);
  lesson.world.zones.forEach((zone, i) => needText(zone.label, `world.zones[${i}].label`));

  need(lesson.toolbox, 'toolbox');
  lesson.toolbox.forEach((type, i) => needKnown(type, BLOCK_TYPES, `toolbox[${i}]`));

  need(lesson.startingBlocks, 'startingBlocks');
  lesson.startingBlocks.forEach((step, i) => {
    needKnown(step.block, BLOCK_TYPES, `startingBlocks[${i}].block`);
    if (step.planet !== undefined) needKnown(step.planet, Object.keys(PLANETS), `startingBlocks[${i}].planet`);
    const surfaces = step.block === 'set_rub_surface' ? (lesson.world.rub?.surfaces ?? Object.keys(RUB_SURFACES)) : Object.keys(SURFACES);
    if (step.surface !== undefined) needKnown(step.surface, surfaces, `startingBlocks[${i}].surface`);
    if (step.times !== undefined) needKnown(step.times, lesson.world.rub?.timesOptions ?? [], `startingBlocks[${i}].times`);
    if (step.pole !== undefined) needKnown(step.pole, ['N', 'S'], `startingBlocks[${i}].pole`);
    if (step.position !== undefined) needKnown(step.position, lesson.world.lever?.fulcrumOptions ?? [], `startingBlocks[${i}].position`);
    if (step.object !== undefined && !objectIds.includes(step.object)) {
      throw new LessonError('errors.badReference', { file, field: `startingBlocks[${i}].object`, value: step.object });
    }
  });

  const win = lesson.winCondition;
  need(win, 'winCondition');
  needKnown(win.type, Object.keys(WIN_CONDITIONS), 'winCondition.type');
  if (win.object !== undefined && !objectIds.includes(win.object)) {
    throw new LessonError('errors.badReference', { file, field: 'winCondition.object', value: win.object });
  }
  (win.targets ?? []).forEach((target, i) => {
    if (!objectIds.includes(target)) throw new LessonError('errors.badReference', { file, field: `winCondition.targets[${i}]`, value: target });
  });
  if (win.zone !== undefined && !zoneIds.includes(win.zone)) {
    throw new LessonError('errors.badReference', { file, field: 'winCondition.zone', value: win.zone });
  }
  if (win.effort !== undefined && !objectIds.includes(win.effort)) {
    throw new LessonError('errors.badReference', { file, field: 'winCondition.effort', value: win.effort });
  }
  const lever = lesson.world.lever;
  if (lever) {
    for (const field of ['load', 'effort']) {
      if (!objectIds.includes(lever[field])) throw new LessonError('errors.badReference', { file, field: `world.lever.${field}`, value: lever[field] });
    }
  }
  need(win.feedback, 'winCondition.feedback');
  for (const key of FEEDBACK_KEYS[win.type]) {
    needText(win.feedback[key], `winCondition.feedback.${key}`);
  }

  need(lesson.hints, 'hints');
  lesson.hints.forEach((hint, i) => needText(hint, `hints[${i}]`));

  if (lesson.prediction) {
    needText(lesson.prediction.question, 'prediction.question');
    const outcomes = ['won', ...FEEDBACK_KEYS[win.type]];
    lesson.prediction.options.forEach((option, i) => {
      needText(option.label, `prediction.options[${i}].label`);
      option.outcomes.forEach((o, j) => needKnown(o, outcomes, `prediction.options[${i}].outcomes[${j}]`));
    });
  }

  if (lesson.explain) {
    needText(lesson.explain.question, 'explain.question');
    lesson.explain.options.forEach((option, i) => {
      needText(option.label, `explain.options[${i}].label`);
      needText(option.feedback, `explain.options[${i}].feedback`);
    });
    needKnown(lesson.explain.answer, lesson.explain.options.map((o) => o.id), 'explain.answer');
  }

  (lesson.warmups ?? []).forEach((warmup, i) => {
    needText(warmup.question, `warmups[${i}].question`);
    warmup.options.forEach((option, j) => {
      needText(option.label, `warmups[${i}].options[${j}].label`);
      needText(option.feedback, `warmups[${i}].options[${j}].feedback`);
    });
    needKnown(warmup.answer, warmup.options.map((o) => o.id), `warmups[${i}].answer`);
  });

  if (lesson.challenge) return; // A merged changed case: the rest was checked on the main lesson.
  need(lesson.curriculum, 'curriculum');
  needKnown(lesson.curriculum.status, ['direct', 'preparation', 'extension'], 'curriculum.status');
  needText(lesson.curriculum.program, 'curriculum.program');
  (lesson.curriculum.books ?? []).forEach((book, i) => needText(book, `curriculum.books[${i}]`));
  const notes = lesson.teacher;
  need(notes, 'teacher');
  for (const field of ['objective', 'decision', 'evidence', 'prerequisites', 'assumptions', 'opening', 'discussion', 'transfer', 'meaning']) {
    needText(notes[field], `teacher.${field}`);
  }
  for (const field of ['vocabulary', 'misconceptions']) {
    need(notes[field], `teacher.${field}`);
    notes[field].forEach((item, i) => needText(item, `teacher.${field}[${i}]`));
  }
  (lesson.challenges ?? []).forEach((challenge, i) => {
    for (const field of ['title', 'intro', 'success']) needText(challenge[field], `challenges[${i}].${field}`);
    checkLesson(withChallenge(lesson, challenge.id), `${file} (challenges[${i}])`);
  });
}
