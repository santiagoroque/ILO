// Teacher notes page: teacher.html?id=<lesson id>. Shows the "teacher"
// section of a lesson file (docs/PLAN.md, Phase 10), ready to print.
import { loadStrings, mountLanguageSwitch, pick, t, translatePage } from './i18n.js';
import { loadLesson } from './lesson-loader.js';
import { showError } from './show-error.js';

await loadStrings();
translatePage();
mountLanguageSwitch(document.getElementById('lang-switch'));
const $ = (id) => document.getElementById(id);

function section(titleKey, ...content) {
  const box = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.textContent = t(titleKey);
  box.append(h2, ...content);
  return box;
}

const curriculumLabel = (c) => (c.grade ? t(`curriculum.${c.status}`, { grade: c.grade }) : t('curriculum.extensionNoGrade'));

const paragraph = (text) => Object.assign(document.createElement('p'), { textContent: text });

function list(items) {
  const ul = document.createElement('ul');
  ul.append(...items.map((text) => Object.assign(document.createElement('li'), { textContent: text })));
  return ul;
}

try {
  const id = new URLSearchParams(location.search).get('id');
  const lesson = await loadLesson(id);
  const notes = lesson.teacher;
  document.title = `${t('teacher.title')}: ${pick(lesson.title)} · ILO`;
  $('concept').textContent = pick(lesson.concept);
  $('title').textContent = pick(lesson.title);
  $('open-lesson').href = `lesson.html?id=${encodeURIComponent(lesson.id)}`;
  $('open-lesson').textContent = t('teacher.open');
  $('print').addEventListener('click', () => print());
  $('notes').append(
    section('teacher.curriculum', paragraph(curriculumLabel(lesson.curriculum)), paragraph(pick(lesson.curriculum.program)),
      ...(lesson.curriculum.books?.length ? [list(lesson.curriculum.books.map(pick))] : [])),
    section('teacher.objective', paragraph(pick(notes.objective))),
    section('teacher.mission', paragraph(pick(lesson.goal)), paragraph(pick(lesson.intro))),
    section('teacher.decision', paragraph(pick(notes.decision))),
    section('teacher.evidence', paragraph(pick(notes.evidence))),
    section('teacher.prerequisites', paragraph(pick(notes.prerequisites))),
    section('teacher.assumptions', paragraph(pick(notes.assumptions))),
    // Key words always in both languages.
    section('teacher.vocabulary', list(notes.vocabulary.map((word) => `${word.es} / ${word.en}`))),
    section('teacher.misconceptions', list(notes.misconceptions.map(pick))),
    section('teacher.opening', paragraph(pick(notes.opening))),
    ...(lesson.challenges ?? []).map((c) => section('teacher.changedCase', paragraph(`${pick(c.title)}. ${pick(c.intro)}`))),
    section('teacher.discussion', paragraph(pick(notes.discussion))),
    section('teacher.transfer', paragraph(pick(notes.transfer))),
    section('teacher.meaning', paragraph(pick(notes.meaning))),
  );
} catch (error) {
  showError($('error'), error);
}
