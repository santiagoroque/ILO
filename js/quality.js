// Lite mode for slow computers: when frames take too long, the world page
// stops its decorative loops and weather and redraws less often. A teacher
// can force it with ?lite=1 (or keep everything with ?lite=0). No drawing
// code here, so the tests can run it.

const SAMPLES = 60; // About a second of frames.
const SLOW_MS = 40; // Slower than 25 frames per second.

// 'full' or 'lite', from the last frame times (milliseconds).
export function chooseQuality(frameMs, { forced = null } = {}) {
  if (forced === 'lite' || forced === 'full') return forced;
  if (frameMs.length < SAMPLES) return 'full';
  const sorted = [...frameMs.slice(-SAMPLES)].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] > SLOW_MS ? 'lite' : 'full';
}

// The mode after a new measurement. Lite is one-way for the session: with
// fewer animations the frames get faster, which must not switch them back on.
export function nextQuality(current, frameMs, { forced = null } = {}) {
  if (forced) return forced;
  return current === 'lite' ? 'lite' : chooseQuality(frameMs);
}

// Whether decorative loops (fountains, trees, flags) play; reduced motion turns them off too.
export const loopsOn = (quality, reducedMotion) => quality === 'full' && !reducedMotion;
