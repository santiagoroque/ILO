// The course path (the classroom start page, Phase 12): every lesson from
// lessons/catalog.json as a node on a winding path, grouped by SEP grade,
// with its progress state and teacher notes. Nothing is locked: a teacher
// can open any lesson. lessons.html?grade=4 shows one grade first, so a
// teacher can share a link that skips the world.
import { loadStrings, mountLanguageSwitch, pick, t, translatePage } from './i18n.js';
import { loadCatalog, loadLesson } from './lesson-loader.js';
import { canSave, exportSave, getPathPlace, importSave, lessonState, resetAll } from './progress.js';
import { showError } from './show-error.js';
import { buildSteps } from './steps.js';

await loadStrings();
translatePage();
mountLanguageSwitch(document.getElementById('lang-switch'));

const $ = (id) => document.getElementById(id);
$('save-warning').hidden = canSave();
$('reset-all').addEventListener('click', () => {
  if (!confirm(t('home.resetConfirm'))) return;
  resetAll();
  location.reload(); // Every node goes back to "new".
});

// A backup file of the kid's progress, for school computers that forget.
$('save-copy').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([exportSave()], { type: 'application/json' }));
  link.download = `ilo-avance-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});
$('load-copy-button').addEventListener('click', () => $('load-copy').click()); // A real button, so Tab reaches it.
$('load-copy').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  event.target.value = ''; // The same file can be picked again.
  if (!file || !confirm(t('save.importConfirm'))) return;
  const result = importSave(await file.text());
  alert(t({ ok: 'save.imported', 'not-ilo': 'save.notIlo', 'too-new': 'save.tooNew' }[result]));
  if (result === 'ok') location.reload();
});

const params = new URLSearchParams(location.search);
const grade = Number(params.get('grade')) || null;

// Grade buttons: All, 4th, 5th (the pilot grades, docs/PLAN.md Phase 11).
for (const option of [null, 4, 5]) {
  const a = document.createElement('a');
  a.className = 'button small';
  a.href = option ? `lessons.html?grade=${option}` : 'lessons.html';
  a.textContent = option ? t('home.grade.n', { n: option }) : t('home.grade.all');
  if (option === grade) a.setAttribute('aria-current', 'page');
  $('grade-buttons').append(a);
}

// How far along the path a lesson is, from 0 to 1 (full once solved).
function progressOf(id, lesson, state) {
  if (state === 'solved' || state === 'applied') return 1;
  const total = buildSteps(lesson).length;
  const { reached } = getPathPlace(id);
  return reached ? Math.min(reached / total, 0.95) : 0;
}

// The winding shape: each node shifts sideways a little.
const SHIFTS = [0, 1, 1.5, 1, 0, -1, -1.5, -1];

function node(id, lesson, index, current) {
  const state = lessonState(id);
  const c = lesson.curriculum;
  const href = `lesson.html?id=${encodeURIComponent(id)}`;
  const item = document.createElement('li');
  item.className = `node state-${state}${current ? ' current' : ''}`;
  item.style.setProperty('--shift', SHIFTS[index % SHIFTS.length]);
  item.style.setProperty('--progress', progressOf(id, lesson, state));
  item.innerHTML = `
    <a class="node-dot" href="${href}"><span class="node-mark" aria-hidden="true"></span></a>
    <div class="node-info">
      <p class="concept"></p>
      <h3><a class="node-title" href="${href}"></a></h3>
      <p class="muted small node-meta"></p>
      <div class="node-actions">
        <a class="button small node-start" href="${href}"></a>
        <a class="link-button" href="teacher.html?id=${encodeURIComponent(id)}"></a>
      </div>
    </div>`;
  const stateText = t(`home.state.${state}`);
  item.querySelector('.node-dot').setAttribute('aria-label', `${pick(lesson.title)}: ${stateText}`);
  item.querySelector('.node-mark').textContent = state === 'applied' ? '★' : state === 'solved' ? '✓' : String(index + 1);
  item.querySelector('.concept').textContent = pick(lesson.concept);
  item.querySelector('.node-title').textContent = pick(lesson.title);
  const where = c.grade ? t(`curriculum.${c.status}`, { grade: c.grade }) : t('curriculum.extensionNoGrade');
  item.querySelector('.node-meta').textContent = `${state === 'new' ? '' : `${stateText} · `}${where}`;
  const start = item.querySelector('.node-start');
  const started = state === 'explored' || getPathPlace(id).reached > 0;
  start.textContent = t(['solved', 'applied'].includes(state) ? 'home.continue' : started ? 'home.resume' : 'home.start');
  if (current) start.classList.add('primary');
  item.querySelector('.link-button').textContent = t('home.teacherNotes');
  return item;
}

function section(title, entries) {
  const box = document.createElement('section');
  box.className = 'course-section';
  const h2 = document.createElement('h2');
  h2.textContent = title;
  const list = document.createElement('ol');
  list.className = 'course-path';
  box.append(h2, list);
  return { box, list, entries };
}

try {
  const lessons = [];
  for (const id of await loadCatalog()) lessons.push({ id, lesson: await loadLesson(id) });
  const isExtension = ({ lesson }) => lesson.curriculum.status === 'extension';
  const sections = grade
    // With a grade chosen, its lessons come first and the rest follow.
    ? [section(t('home.grade.n', { n: grade }), lessons.filter((l) => l.lesson.curriculum.grade === grade && !isExtension(l))),
      section(t('home.otherLessons'), lessons.filter((l) => l.lesson.curriculum.grade !== grade || isExtension(l)))]
    : [...[4, 5].map((g) => section(t('home.grade.n', { n: g }), lessons.filter((l) => l.lesson.curriculum.grade === g && !isExtension(l)))),
      section(t('home.extensions'), lessons.filter(isExtension))];
  // The next lesson to do: the first one not solved yet, in path order.
  const next = sections.flatMap((s) => s.entries).find(({ id }) => ['new', 'explored'].includes(lessonState(id)));
  let index = 0;
  for (const s of sections) {
    if (!s.entries.length) continue;
    for (const { id, lesson } of s.entries) s.list.append(node(id, lesson, index++, id === next?.id));
    $('course').append(s.box);
  }
} catch (error) {
  showError($('error'), error);
}
