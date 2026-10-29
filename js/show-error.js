// Shows a lesson problem in plain language, in the current language.
import { t } from './i18n.js';
import { LessonError } from './lesson-loader.js';

export function showError(box, error, titleKey = 'errors.title') {
  console.error(error);
  const message = error instanceof LessonError ? t(error.key, error.vars) : String(error);
  box.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = t(titleKey);
  const text = document.createElement('p');
  text.textContent = message;
  const tip = document.createElement('p');
  tip.className = 'muted';
  tip.textContent = t('errors.checkHint');
  box.append(title, text, tip);
  box.hidden = false;
}
