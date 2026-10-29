// Lesson page: a lesson shown as a path of short steps (Phase 12, D19):
// hook, warm-ups, predict, build and run, why, fair test, the changed case
// and the key idea. js/steps.js decides the steps; this file draws them and
// connects the blocks, the physics, the drawing and the feedback sheet.
// Open it as lesson.html?id=<lesson id>, or add &challenge=<challenge id>
// to start at a changed case.
import { play, setEnabled, unlock } from './audio.js';
import { defineBlocks, START_BLOCK } from './blocks.js';
import { lang, loadStrings, mountLanguageSwitch, pick, t, translatePage } from './i18n.js';
import { loadCatalog, loadLesson, outcomeOf, withChallenge } from './lesson-loader.js';
import {
  canSave, clearProgram, completeChallenge, completeLesson, DEFAULT_REWARD, getJournal, getPathPlace, getSoundOn,
  isApplied, isCompleted, loadProgram, recordExplain, recordFairComparison, recordRun, recordWarmup, saveProgram,
  setPathPlace, solvedThisWeek,
} from './progress.js';
import { drawScene, sizeCanvas } from './renderer.js';
import { stepsToWorkspaceState, workspaceToSteps } from './runner.js';
import { createSimulation, STEP_MS } from './simulation.js';
import { loadArt, onArtLoaded } from './sprites.js';
import { showError } from './show-error.js';
import { buildSteps, checkChoice, startStep } from './steps.js';
import { checkWin } from './win-conditions.js';

const { Blockly, Matter } = window;
const $ = (id) => document.getElementById(id);

await loadStrings();
translatePage();

const params = new URLSearchParams(location.search);
let main;
try {
  main = await loadLesson(params.get('id'));
} catch (error) {
  $('loading').hidden = true;
  mountLanguageSwitch($('lang-switch'));
  showError($('error'), error);
  throw error;
}

$('save-warning').hidden = canSave();
$('close').setAttribute('aria-label', t('path.close'));
$('close').title = t('path.close');
document.title = `${pick(main.title)} · ILO`;

// The version loaded now: the main task, or a changed case (its blocks and
// journal are kept apart under "lessonId:challengeId").
let lesson = main;
let challenge = null;
let saveKey = main.id;
const isWon = () => (challenge ? isApplied(main.id) : isCompleted(main.id));
const isTemperature = () => lesson.winCondition.type === 'temperature_in_band';

// ---- Sound: short effects only, after the kid's first click or key ----
setEnabled(getSoundOn());
addEventListener('pointerdown', unlock, { once: true });
addEventListener('keydown', unlock, { once: true });

// ---- Read aloud, with the browser's own voices (no files, no internet) ----
const voiceLang = lang === 'es' ? 'es' : 'en';
const hasVoice = () => 'speechSynthesis' in window && speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(voiceLang));
let readText = '';
function speak(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(voiceLang)) ?? null;
  utterance.lang = lang === 'es' ? 'es-MX' : 'en-US';
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}
function showReadAloud() {
  // Only offered when a voice for this language exists.
  $('read-aloud').hidden = !hasVoice();
  $('build-read').hidden = !hasVoice();
}
if ('speechSynthesis' in window) {
  showReadAloud();
  speechSynthesis.addEventListener?.('voiceschanged', showReadAloud);
  $('read-aloud').addEventListener('click', () => speak(readText));
  $('build-read').addEventListener('click', () => speak(`${pick(lesson.goal)} ${pick(lesson.intro)}`));
}

// ---- Blocks ----
await loadScript(`vendor/blockly/msg/${lang}.js`); // Blockly's own menus in ES or EN.
// Blockly's Spanish file leaves some visible labels in English; ours fill them in.
for (const key of ['ZOOM_IN', 'ZOOM_OUT', 'RESET_ZOOM', 'OPEN_TRASH', 'BLOCK_LABEL_BEGIN_STACK']) {
  Blockly.Msg[key] = t(`blockly.${key}`);
}
defineBlocks(Blockly, t, pick, lesson);
const toolboxFor = (l) => ({ kind: 'flyoutToolbox', contents: l.toolbox.map((type) => ({ kind: 'block', type })) });

$('loading').hidden = true;
$('lesson').hidden = false;
$('build').hidden = false; // Blockly needs a visible box to measure; go() hides it again.

const workspace = Blockly.inject($('blockly'), {
  toolbox: toolboxFor(lesson),
  media: 'vendor/blockly/media/',
  renderer: 'zelos', // Rounded, Scratch-like blocks that are easy to grab.
  maxInstances: { [START_BLOCK]: 1 },
  trashcan: true,
  sounds: true,
  zoom: { controls: true, wheel: false, startScale: 0.75 },
  move: { scrollbars: true, drag: true, wheel: true },
});

function loadStartingBlocks() {
  const defaultObject = lesson.world.objects.find((o) => !o.fixed)?.id;
  workspace.clear();
  Blockly.serialization.workspaces.load(stepsToWorkspaceState(lesson.startingBlocks, defaultObject), workspace);
}

function loadSavedProgram() {
  const saved = loadProgram(saveKey);
  try {
    if (saved) Blockly.serialization.workspaces.load(saved, workspace);
    else loadStartingBlocks();
  } catch {
    loadStartingBlocks(); // A saved program from an older version of the lesson.
  }
  if (!workspace.getTopBlocks().some((b) => b.type === START_BLOCK)) loadStartingBlocks();
}
loadSavedProgram();

const save = () => saveProgram(saveKey, Blockly.serialization.workspaces.save(workspace));
let saveTimer;
workspace.addChangeListener((event) => {
  if (event.isUiEvent) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 300);
});
mountLanguageSwitch($('lang-switch'), save);
new ResizeObserver(() => Blockly.svgResize(workspace)).observe($('blockly'));

// ---- Physics and drawing ----
const canvas = $('canvas');
sizeCanvas(canvas, lesson);
let sim = createSimulation(Matter, lesson);
let previous = null; // The last run's landing mark, kept to compare (Phase 10).
const draw = () => drawScene(canvas, sim.snapshot(), lesson, { t, pick, lang, previous });

// The scene before anything runs, as the picture on a step card.
let cardScene = false;
function drawCardScene() {
  const picture = $('card-canvas');
  sizeCanvas(picture, lesson);
  drawScene(picture, createSimulation(Matter, lesson).snapshot(), lesson, { t, pick, lang });
}

await loadArt();
onArtLoaded(() => {
  if (!frame) draw();
  if (cardScene) drawCardScene();
}); // Redraw as pictures arrive.
draw();

let frame = null;
let lastTime = 0;
let pending = 0;

function animate(now) {
  pending += Math.min(now - lastTime, 100); // A slow frame never skips physics.
  lastTime = now;
  let steps = 0;
  while (pending >= STEP_MS && steps < 6 && !sim.isFinished()) {
    sim.step();
    pending -= STEP_MS;
    steps++;
  }
  draw();
  if (sim.isFinished()) finish();
  else frame = requestAnimationFrame(animate);
}

function stop() {
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  $('run').disabled = false;
}

function setMessage(text, kind = '') {
  $('message').textContent = text;
  $('message').className = `message ${kind}`;
}

// Switches between the main task and a changed case without leaving the page.
function useVariant(variant) {
  if (variant === undefined || variant === challenge) return;
  clearTimeout(saveTimer);
  save(); // Keep the program of the version being left.
  lesson = variant ? withChallenge(main, variant) : main;
  challenge = lesson.challenge ?? null;
  saveKey = challenge ? `${main.id}:${challenge}` : main.id;
  Blockly.Events.disable();
  try {
    workspace.clear();
    defineBlocks(Blockly, t, pick, lesson); // Its objects can differ (new magnet items).
    workspace.updateToolbox(toolboxFor(lesson));
    loadSavedProgram();
  } finally {
    Blockly.Events.enable();
  }
  sim = createSimulation(Matter, lesson);
  sizeCanvas(canvas, lesson);
  previous = null;
  guess = null;
  hintsShown = 0;
  $('hint-box').hidden = true;
  $('hint-box').replaceChildren();
  showJournal();
  setMessage(t('lesson.ready'));
  draw();
}

// ---- What the kid chose, in words ----
const number = (n) => n.toLocaleString(lang, { maximumFractionDigits: 1 });
const sentence = (text) => text.charAt(0).toLocaleUpperCase(lang) + text.slice(1); // "la Tierra" starts a sentence.

function settingOf(steps) {
  const last = (block, field) => steps.filter((s) => s.block === block).at(-1)?.[field];
  const picks = steps.filter((s) => s.block === 'magnet_pick').map((s) => s.object);
  const rubs = steps.filter((s) => s.block === 'rub').reduce((sum, s) => sum + s.times, 0);
  return {
    planet: last('set_gravity', 'planet'),
    surface: last('set_surface', 'surface') ?? last('set_rub_surface', 'surface'),
    position: last('move_fulcrum', 'position'),
    mass: last('set_mass', 'mass'),
    pole: last('magnet_pole', 'pole'),
    times: rubs || undefined,
    picks: picks.length ? picks : undefined,
  };
}

const objectName = (id) => {
  const o = lesson.world.objects.find((x) => x.id === id);
  return o?.label ? pick(o.label) : id;
};

function settingText(setting) {
  const parts = [];
  if (setting.planet) parts.push(t(`planets.${setting.planet}`));
  if (setting.surface) parts.push(t(`${lesson.world.model === 'rub' ? 'rubSurfaces' : 'surfaces'}.${setting.surface}`));
  if (setting.times !== undefined) parts.push(t('lesson.timesSetting', { n: setting.times }));
  if (setting.pole) parts.push(t('lesson.poleSetting', { pole: setting.pole }));
  if (setting.picks) parts.push(t('lesson.pickSetting', { list: setting.picks.map(objectName).join(', ') }));
  if (setting.position !== undefined) parts.push(t('world.fulcrumAt', { x: setting.position }));
  if (setting.mass !== undefined) parts.push(t('lesson.massSetting', { n: number(setting.mass) }));
  return parts.join(', ') || t('lesson.noSetting');
}

// A plain-text result, also read out by screen readers (role="status").
function resultText(setting, outcome) {
  if (outcome.x === null) return `${sentence(settingText(setting))}.`;
  if (isTemperature()) {
    const band = t('lesson.bandRange', { from: number(lesson.winCondition.min), to: number(lesson.winCondition.max) });
    return `${t('lesson.resultTemp', { setting: sentence(settingText(setting)), x: number(outcome.x) })} ${band}`;
  }
  const zone = lesson.world.zones.find((z) => z.id === lesson.winCondition.zone);
  const range = zone ? ` ${t('lesson.zoneRange', { from: number(zone.x), to: number(zone.x + zone.width) })}` : '';
  return `${t('lesson.resultAt', { setting: sentence(settingText(setting)), x: number(outcome.x) })}${range}`;
}

// ---- Prediction (asked as a step, never graded) ----
let guess = null;
const optionLabel = (optionId) => pick(lesson.prediction.options.find((o) => o.id === optionId).label);

function predictionText(outcome) {
  if (!guess || !lesson.prediction) return '';
  const actual = lesson.prediction.options.find((o) => o.outcomes.includes(outcomeOf(outcome)));
  if (!actual) return '';
  return `${t(actual.id === guess ? 'lesson.predictRight' : 'lesson.predictWrong', { guess: optionLabel(guess), actual: pick(actual.label) })} `;
}

// ---- Experiment journal (inside the build step) ----
function describeRun(run) {
  const result = run.outcome === 'won' ? t('lesson.journalWon') : t('lesson.journalTry');
  const where = run.x === null ? '' : ` ${t(isTemperature() ? 'lesson.journalTemp' : 'lesson.journalAt', { x: number(run.x) })}`;
  const predicted = run.guess && lesson.prediction?.options.some((o) => o.id === run.guess)
    ? ` (${t('lesson.journalGuess', { guess: optionLabel(run.guess) })})` : '';
  return `${sentence(settingText(run.setting))}:${where} ${result}${predicted}`;
}

function showJournal() {
  const runs = getJournal(saveKey);
  $('journal-empty').hidden = runs.length > 0;
  $('journal-list').replaceChildren(...runs.map((run) => {
    const li = document.createElement('li');
    li.textContent = describeRun(run);
    return li;
  }));
}

// ---- The feedback sheet ----
let sheetNext = null;
function showSheet({ kind, title, body = '', retry = null, onContinue = null }) {
  $('sheet').className = `sheet ${kind}`; // right, wrong or info
  $('sheet-title').textContent = title;
  $('sheet-body').textContent = body;
  $('sheet-retry').hidden = !retry;
  $('sheet-retry').textContent = retry ?? '';
  $('sheet-continue').hidden = !onContinue;
  sheetNext = onContinue;
  $('sheet').hidden = false;
  (onContinue ? $('sheet-continue') : $('sheet-retry')).focus();
}
function hideSheet() {
  $('sheet').hidden = true;
  sheetNext = null;
}
$('sheet-retry').addEventListener('click', () => {
  hideSheet();
  ($('build').hidden ? $('choices').querySelector('button:not(:disabled)') : $('run'))?.focus();
});
$('sheet-continue').addEventListener('click', () => {
  const nextStep = sheetNext;
  hideSheet();
  nextStep?.();
});

// ---- The step card and its answer tiles ----
let selected = new Set();
let pickCount = 1;
let onCheck = () => {};

function setCard({ kicker, title, text = '', note = '', more = null, scene = false, picture = null }) {
  $('card-kicker').textContent = kicker;
  $('card-title').textContent = title;
  $('card-text').textContent = text;
  $('card-text').hidden = !text;
  $('card-note').textContent = note;
  $('card-note').hidden = !note;
  $('card-more').hidden = !more;
  $('card-more').open = false;
  $('card-more-text').textContent = more ?? '';
  cardScene = scene;
  $('card-canvas').hidden = !scene;
  if (scene) drawCardScene();
  $('card-picture').hidden = !picture;
  if (picture) $('card-picture').src = `assets/${picture}`;
  $('choices').replaceChildren();
  $('choices').className = 'choices';
  readText = [title, text].filter(Boolean).join('. ');
}

// Big tap tiles (a word, and a picture when there is one). `count` is how
// many must be picked before Check works.
function setChoices(options, { count = 1 } = {}) {
  selected = new Set();
  pickCount = count;
  const box = $('choices');
  box.className = `choices${options.some((o) => o.picture) ? ' with-pictures' : ''}${count > 1 ? ' list' : ''}`;
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', $('card-title').textContent);
  box.replaceChildren(...options.map((option) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.dataset.id = option.id;
    b.setAttribute('aria-pressed', 'false');
    if (option.picture) {
      const img = document.createElement('img');
      img.src = `assets/${option.picture}`;
      img.alt = '';
      b.append(img);
    }
    const label = document.createElement('span');
    label.textContent = option.label;
    b.append(label);
    b.addEventListener('click', () => {
      if (selected.has(option.id)) selected.delete(option.id);
      else {
        if (selected.size >= pickCount) selected.delete([...selected][0]); // Tapping another swaps it.
        selected.add(option.id);
      }
      for (const tile of box.children) tile.setAttribute('aria-pressed', String(selected.has(tile.dataset.id)));
      $('check').disabled = selected.size !== pickCount;
      play('click');
    });
    return b;
  }));
  readText += `. ${options.map((o) => o.label).join('. ')}`;
  $('check').hidden = false;
  $('check').disabled = true;
}

const tileFor = (optionId) => [...$('choices').children].find((tile) => tile.dataset.id === optionId);

// A tap answer was checked: right locks the tiles; wrong crosses that tile
// out so the kid can try another. A wrong answer never costs anything.
function answered(optionId, correct, feedback) {
  const tile = tileFor(optionId);
  if (correct) {
    for (const other of $('choices').children) other.disabled = true;
    tile.classList.add('right');
    $('check').hidden = true;
    $('continue').hidden = false;
    play('pop');
    showSheet({ kind: 'right', title: t('path.right'), body: feedback, onContinue: next });
  } else {
    tile.classList.add('wrong');
    tile.disabled = true;
    tile.setAttribute('aria-pressed', 'false');
    selected.clear();
    $('check').disabled = true;
    showSheet({ kind: 'wrong', title: t('path.notQuite'), body: feedback, retry: t('path.tryAgain') });
  }
}

$('check').addEventListener('click', () => {
  if (selected.size === pickCount) onCheck([...selected]);
});

// ---- The path ----
const steps = buildSteps(main);
const place = getPathPlace(main.id);
let at = startStep(steps, { saved: place.step, challenge: params.get('challenge') });
let reached = Math.min(Math.max(place.reached, at), steps.length - 1);
let earnedHere = 0; // Coins won in this visit, for the last card.
let continueAction = null;
const catalog = await loadCatalog().catch(() => []);
const nextLesson = catalog[catalog.indexOf(main.id) + 1] ?? null;

const next = () => go(Math.min(at + 1, steps.length - 1));
$('continue').addEventListener('click', () => (continueAction ?? next)());
$('back-to-build').addEventListener('click', () => go(steps.findIndex((s) => s.type === 'build' && s.variant === challenge)));

function renderProgress() {
  const list = $('progress');
  list.setAttribute('aria-label', t('path.progress'));
  list.replaceChildren(...steps.map((step, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `segment${i < at ? ' done' : ''}${i === at ? ' current' : ''}${i > at && i <= reached ? ' seen' : ''}`;
    b.disabled = i > reached; // Steps already reached can be visited again.
    b.setAttribute('aria-label', t('path.stepOf', { n: i + 1, total: steps.length }));
    if (i === at) b.setAttribute('aria-current', 'step');
    b.addEventListener('click', () => go(i));
    li.append(b);
    return li;
  }));
}

function go(i) {
  stop();
  hideSheet();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  at = i;
  reached = Math.max(reached, i);
  setPathPlace(main.id, i);
  const step = steps[i];
  useVariant(step.variant);
  renderProgress();
  const building = step.type === 'build';
  $('card').hidden = building;
  $('build').hidden = !building;
  for (const button of ['hint', 'reset', 'run', 'check', 'continue', 'back-to-build', 'to-map']) $(button).hidden = true;
  $('continue').textContent = t('path.continue');
  continueAction = null;
  cardScene = false;
  $('action-bar').hidden = false;
  // A step answered on an earlier visit can be passed straight away.
  $('continue').hidden = i >= reached && !['hook', 'newcase'].includes(step.type);
  RENDER[step.type](step);
  const shown = building ? $('build') : $('card');
  if (step.type !== 'keyidea') $('card').classList.remove('celebrate');
  shown.classList.remove('enter');
  void shown.offsetWidth; // Restart the slide-in.
  shown.classList.add('enter');
  (building ? $('mission-goal') : $('card-title')).focus({ preventScroll: true });
}

const curriculumText = () => (main.curriculum.grade
  ? t(`curriculum.${main.curriculum.status}`, { grade: main.curriculum.grade })
  : t('curriculum.extensionNoGrade'));

const RENDER = {
  hook() {
    setCard({ kicker: pick(main.concept), title: pick(lesson.title), text: pick(lesson.goal), note: curriculumText(), more: pick(lesson.intro), scene: true });
    $('continue').hidden = false;
    $('continue').textContent = t('path.start');
  },

  warmup(step) {
    const warmup = main.warmups.find((w) => w.id === step.id);
    setCard({ kicker: t('path.warmup'), title: pick(warmup.question), picture: warmup.picture ?? null });
    setChoices(warmup.options.map((o) => ({ id: o.id, label: pick(o.label), picture: o.picture })));
    onCheck = ([choice]) => {
      const { correct, feedback } = checkChoice(warmup, choice);
      recordWarmup(main.id, warmup.id, choice, correct);
      answered(choice, correct, pick(feedback));
    };
  },

  predict() {
    setCard({ kicker: t('path.predict'), title: pick(lesson.prediction.question), scene: true });
    setChoices(lesson.prediction.options.map((o) => ({ id: o.id, label: pick(o.label) })));
    onCheck = ([choice]) => {
      guess = choice;
      play('pop');
      showSheet({ kind: 'info', title: t('path.predictSaved'), body: t('path.predictSavedText', { guess: optionLabel(choice) }), onContinue: next });
    };
  },

  build() {
    $('mission-goal').textContent = pick(lesson.goal);
    $('challenge-tag').hidden = !challenge;
    for (const button of ['hint', 'reset', 'run']) $(button).hidden = false;
    $('continue').hidden = !isWon();
    Blockly.svgResize(workspace);
    workspace.scrollCenter(); // The box was hidden, so bring the program into view.
    showJournal();
    draw();
  },

  why() {
    const explain = lesson.explain;
    setCard({ kicker: t('path.why'), title: pick(explain.question) });
    setChoices(explain.options.map((o) => ({ id: o.id, label: pick(o.label) })));
    onCheck = ([choice]) => {
      const { correct, feedback } = checkChoice(explain, choice);
      recordExplain(saveKey, choice, correct);
      answered(choice, correct, pick(feedback));
    };
  },

  fair() {
    const fair = main.fairComparison;
    const variable = t(`variables.${fair.variable}`);
    const runs = getJournal(saveKey);
    const ready = new Set(runs.map((r) => String(r.setting[fair.variable]))).size >= 2;
    setCard({ kicker: t('path.fair'), title: t('lesson.fairQuestion', { variable }), text: t(ready ? 'path.fairHelp' : 'path.fairNeedRuns', { variable }) });
    if (!ready) {
      // Needs another run first; the fair test is offered, not required.
      $('back-to-build').hidden = false;
      $('continue').hidden = false;
      $('continue').textContent = t('path.skip');
      return;
    }
    setChoices(runs.map((run, i) => ({ id: String(i), label: describeRun(run) })), { count: 2 });
    onCheck = (picked) => {
      const [a, b] = picked.map((i) => runs[Number(i)]);
      const same = (field) => String(a.setting[field] ?? '') === String(b.setting[field] ?? '');
      const changed = !same(fair.variable);
      const correct = changed && fair.keep.every(same);
      recordFairComparison(saveKey, correct);
      if (correct) {
        for (const tile of $('choices').children) tile.disabled = true;
        $('check').hidden = true;
        $('continue').hidden = false;
        play('pop');
        showSheet({ kind: 'right', title: t('path.right'), body: t('lesson.fairRight'), onContinue: next });
        return;
      }
      selected.clear();
      for (const tile of $('choices').children) tile.setAttribute('aria-pressed', 'false');
      $('check').disabled = true;
      const why = !changed ? t('lesson.fairSameVariable', { variable })
        : t('lesson.fairNotKept', { list: fair.keep.map((k) => t(`variables.${k}`)).join(', ') });
      showSheet({ kind: 'wrong', title: t('path.notQuite'), body: why, retry: t('path.tryAgain') });
    };
  },

  newcase(step) {
    const changed = main.challenges.find((c) => c.id === step.variant);
    setCard({ kicker: pick(main.concept), title: pick(changed.title), text: pick(lesson.goal), more: pick(changed.intro), scene: true });
    $('continue').hidden = false;
  },

  keyidea() {
    const coins = earnedHere ? t('path.coins', { n: earnedHere }) : '';
    setCard({ kicker: t('path.keyIdea'), title: t('path.keyIdeaTitle'), text: pick(main.learningGoal), picture: 'stamps/flask.svg', note: [coins, t('path.week', { n: solvedThisWeek() })].filter(Boolean).join(' ') });
    $('card').classList.add('celebrate');
    $('to-map').hidden = false;
    $('continue').hidden = false;
    $('continue').textContent = t(nextLesson ? 'path.nextLesson' : 'lesson.back');
    continueAction = () => { location.href = nextLesson ? `lesson.html?id=${encodeURIComponent(nextLesson)}` : 'index.html'; };
    play('stamp');
  },
};

// ---- Build step: run, reset, hints ----
let lastSteps = [];
function finish() {
  stop();
  const outcome = checkWin(lesson, sim.result());
  const setting = settingOf(lastSteps);
  const before = predictionText(outcome);
  recordRun(main.id, saveKey, { setting, x: outcome.x, outcome: outcomeOf(outcome), guess, hints: hintsShown });
  showJournal();
  const unit = isTemperature() ? '°C' : t('world.meters');
  previous = outcome.x === null ? null : { x: outcome.x, label: `${settingText(setting)}: ${number(outcome.x)} ${unit}` };
  guess = null;
  const result = resultText(setting, outcome);
  if (outcome.won) {
    // Coins are paid only the first time.
    const earned = challenge ? completeChallenge(main.id, lesson.reward) : completeLesson(main.id, lesson.reward ?? DEFAULT_REWARD);
    earnedHere += earned;
    const coins = earned ? ` ${t('lesson.coinsEarned', { n: earned })}` : '';
    setMessage(`${before}${result}`, 'success');
    $('continue').hidden = false;
    play(earned ? 'coin' : 'pop');
    showSheet({
      kind: 'right',
      title: `${t(challenge ? 'lesson.challengeWon' : 'lesson.won')}${coins}`,
      body: `${before}${result} ${pick(lesson.success)}`,
      retry: t('path.keepTrying'),
      onContinue: next,
    });
  } else {
    setMessage(`${before}${result}`, 'retry');
    showSheet({ kind: 'wrong', title: t('path.notYet'), body: `${before}${result} ${pick(lesson.winCondition.feedback[outcome.feedback])}`, retry: t('path.tryAgain') });
  }
}

$('run').addEventListener('click', () => {
  stop();
  hideSheet();
  lastSteps = workspaceToSteps(workspace);
  sim.start(lastSteps);
  $('run').disabled = true;
  setMessage(t('lesson.running'));
  pending = 0;
  lastTime = performance.now();
  frame = requestAnimationFrame(animate);
});

$('reset').addEventListener('click', () => {
  stop();
  hideSheet();
  sim.reset();
  draw();
  setMessage(t('lesson.ready'));
});

let hintsShown = 0;
$('hint').addEventListener('click', () => {
  const box = $('hint-box');
  box.hidden = false;
  if (hintsShown >= lesson.hints.length) {
    // Keep the hints on screen and add the note once.
    if (!box.querySelector('.no-more')) {
      const note = document.createElement('p');
      note.className = 'no-more';
      note.textContent = t('lesson.noMoreHints');
      box.append(note);
    }
    return;
  }
  hintsShown++;
  box.replaceChildren();
  lesson.hints.slice(0, hintsShown).forEach((hint, i) => {
    const p = document.createElement('p');
    const label = document.createElement('strong');
    label.textContent = `${t('lesson.hintCount', { n: i + 1, total: lesson.hints.length })}: `;
    p.append(label, pick(hint));
    box.append(p);
  });
});

$('start-over').addEventListener('click', () => {
  if (!confirm(t('lesson.startOverConfirm'))) return;
  clearProgram(saveKey);
  loadStartingBlocks();
});

// Enter works the main button (unless a control has the focus); Escape
// closes a "try again" sheet.
document.addEventListener('keydown', (event) => {
  if (event.target.closest?.('button, a, input, select, textarea, summary, .blocklyDiv')) return;
  if (event.key === 'Escape' && !$('sheet').hidden && !$('sheet-retry').hidden) {
    $('sheet-retry').click();
    return;
  }
  if (event.key !== 'Enter') return;
  const target = !$('sheet').hidden
    ? (sheetNext ? $('sheet-continue') : $('sheet-retry'))
    : [$('check'), $('continue')].find((b) => !b.hidden && !b.disabled);
  if (!target) return;
  event.preventDefault();
  target.click();
});

setMessage(t('lesson.ready'));
showJournal();
go(at);

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
}
