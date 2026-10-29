// Translations. App text lives in locales/es.json and locales/en.json.
// Lesson text lives inside each lesson file as { "es": "...", "en": "..." }.
import { getLanguage, setLanguage } from './progress.js';

export const LANGUAGES = ['es', 'en'];
export const lang = getLanguage();

let strings = {};

export async function loadStrings() {
  const response = await fetch(`locales/${lang}.json`);
  strings = await response.json();
  document.documentElement.lang = lang;
}

// t('lesson.hintCount', { n: 1, total: 3 }) -> "Pista 1 de 3"
export function t(key, vars = {}) {
  const text = strings[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

// Picks the current language from a lesson text like { "es": "...", "en": "..." }.
export function pick(text) {
  return text?.[lang] ?? text?.es ?? '';
}

// Fills every element that has data-i18n="some.key" with its translation.
export function translatePage() {
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
}

// Builds the ES / EN switch. Changing language saves the choice and reloads,
// so every part of the page (including the blocks) switches together.
export function mountLanguageSwitch(container, beforeReload = () => {}) {
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', t('lang.label'));
  for (const code of LANGUAGES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = code.toUpperCase();
    button.className = 'lang-button';
    button.setAttribute('aria-pressed', String(code === lang));
    button.addEventListener('click', () => {
      if (code === lang) return;
      beforeReload();
      setLanguage(code);
      location.reload();
    });
    container.append(button);
  }
}
