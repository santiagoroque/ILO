// The lesson path (Phase 12, decision D19): a lesson is shown as short
// steps, one at a time, with a Check or Continue button at the bottom. This
// file only decides which steps a lesson has and in what order, so it can be
// tested without a browser; lesson.js draws them.
//
// Each step has a `type` and, when it changes which version of the lesson is
// loaded, a `variant`: null for the main task, or a changed case's id.

export function buildSteps(lesson) {
  const steps = [{ type: 'hook', variant: null }];
  for (const warmup of lesson.warmups ?? []) steps.push({ type: 'warmup', id: warmup.id, variant: null });
  if (lesson.prediction) steps.push({ type: 'predict', variant: null });
  steps.push({ type: 'build', variant: null });
  if (lesson.explain) steps.push({ type: 'why', variant: null });
  if (lesson.fairComparison) steps.push({ type: 'fair', variant: null });
  const changed = lesson.challenges?.[0];
  if (changed) {
    steps.push({ type: 'newcase', variant: changed.id }, { type: 'build', variant: changed.id });
    if (changed.explain) steps.push({ type: 'why', variant: changed.id });
  }
  steps.push({ type: 'keyidea' }); // Keeps whichever version is loaded.
  return steps;
}

// Where to open the path: a link to a changed case starts at its intro; a
// finished lesson starts again from the top; otherwise the saved step.
export function startStep(steps, { saved = null, challenge = null } = {}) {
  if (challenge) {
    const i = steps.findIndex((s) => s.type === 'newcase' && s.variant === challenge);
    if (i !== -1) return i;
  }
  if (Number.isInteger(saved) && saved >= 0 && saved < steps.length - 1) return saved;
  return 0;
}

// Checks one tap answer (warm-up or "why?"): right or not, and its feedback.
export function checkChoice(question, optionId) {
  const option = question.options.find((o) => o.id === optionId);
  return { correct: optionId === question.answer, feedback: option?.feedback ?? null };
}
