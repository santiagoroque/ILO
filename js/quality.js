// Lite mode for slow computers: when frames take too long, the world page
// stops its decorative loops and weather and redraws less often. A teacher
// can force it with ?lite=1 (or keep everything with ?lite=0). No drawing
// code here, so the tests can run it.

const SAMPLES = 60; // About a second of frames.
const SLOW_MS = 40; // Slower than 25 frames per second.

// 'full' or 'lite', from the last frame times (milliseconds).
export function chooseQuality(frameMs, { forced = null, reducedMotion = false } = {}) {
  if (forced === 'lite' || forced === 'full') return forced;
  if (frameMs.length < SAMPLES) return 'full';
  const sorted = [...frameMs.slice(-SAMPLES)].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] > SLOW_MS ? 'lite' : 'full';
}

// Whether decorative loops (fountains, trees, flags) play.
export const loopsOn = (quality, reducedMotion) => quality === 'full' && !reducedMotion;
