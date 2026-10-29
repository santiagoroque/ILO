// Teacher summary: what this computer has saved for each lesson and changed
// case (docs/PLAN.md, Phase 11). No accounts: one computer, one kid at a time
// (erase between kids from the lesson list). Exports a CSV spreadsheet file.
import { loadStrings, mountLanguageSwitch, pick, t, translatePage } from './i18n.js';
import { loadCatalog, loadLesson, withChallenge } from './lesson-loader.js';
import { getExplain, getFairComparison, getJournal, getWarmups, lessonState } from './progress.js';
import { showError } from './show-error.js';

await loadStrings();
translatePage();
mountLanguageSwitch(document.getElementById('lang-switch'));
const $ = (id) => document.getElementById(id);
const yes = (value) => (value ? t('summary.yes') : t('summary.no'));

// One row per lesson and per changed case.
function row(lesson, key, title) {
  const runs = getJournal(key); // Newest first, last 10 only.
  const oldestFirst = [...runs].reverse();
  const firstWin = oldestFirst.findIndex((r) => r.outcome === 'won');
  const beforeWin = firstWin === -1 ? oldestFirst : oldestFirst.slice(0, firstWin);
  const settingsTried = new Set(beforeWin.map((r) => JSON.stringify(r.setting))).size;
  const guesses = runs.filter((r) => r.guess);
  const rightGuesses = guesses.filter((r) => lesson.prediction?.options.find((o) => o.id === r.guess)?.outcomes.includes(r.outcome));
  const explain = getExplain(key);
  const fair = getFairComparison(key);
  // Warm-ups belong to the main task: how many were right on the first try.
  const warmups = key.includes(':') ? [] : (lesson.warmups ?? []).map((w) => getWarmups(lesson.id, w.id)).filter((tries) => tries.length);
  return [
    title,
    String(runs.length),
    firstWin === -1 ? t('summary.notYet') : t('summary.winAfter', { n: firstWin + 1 }),
    firstWin === -1 ? '' : String(oldestFirst[firstWin].hints ?? 0),
    // Trying most of the options before the first win looks like guessing.
    firstWin !== -1 && settingsTried >= 3 ? t('summary.manyOptions', { n: settingsTried }) : '',
    warmups.length ? `${warmups.filter((tries) => tries[0].correct).length} / ${warmups.length}` : '',
    guesses.length ? `${rightGuesses.length} / ${guesses.length}` : '',
    explain.length ? (explain[0].correct ? t('summary.explainFirst') : explain.some((e) => e.correct) ? t('summary.explainLater') : t('summary.explainWrong')) : '',
    fair.length ? yes(fair.some((f) => f.correct)) : '',
  ];
}

const HEADINGS = ['lesson', 'runs', 'firstWin', 'hints', 'pattern', 'warmups', 'predictions', 'explain', 'fair'];

try {
  const rows = [];
  for (const id of await loadCatalog()) {
    const lesson = await loadLesson(id);
    rows.push(row(lesson, id, `${pick(lesson.title)} (${t(`home.state.${lessonState(id)}`)})`));
    for (const c of lesson.challenges ?? []) {
      rows.push(row(withChallenge(lesson, c.id), `${id}:${c.id}`, `  ${pick(c.title)}`));
    }
  }
  const table = $('summary-table');
  const head = table.createTHead().insertRow();
  for (const h of HEADINGS) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = t(`summary.col.${h}`);
    head.append(th);
  }
  const body = table.createTBody();
  for (const cells of rows) {
    const tr = body.insertRow();
    cells.forEach((text, i) => {
      const cell = i === 0 ? document.createElement('th') : document.createElement('td');
      if (i === 0) cell.scope = 'row';
      cell.textContent = text;
      tr.append(cell);
    });
  }
  // CSV for a spreadsheet: quoted cells, UTF-8 with a BOM so Excel shows accents.
  const csv = [HEADINGS.map((h) => t(`summary.col.${h}`)), ...rows]
    .map((cells) => cells.map((c) => `"${String(c).trim().replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  $('export').href = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  $('print').addEventListener('click', () => print());
} catch (error) {
  showError($('error'), error);
}
