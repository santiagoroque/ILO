// Residents (Phase 13, DESIGN_PROMPT_2.md Part 4.3): friendly animals who
// live in the world. Each stands in one place; when Ilo walks up they wave
// and say a short tip. Every visit brings their next line. Names and lines
// are in world/residents.json; rooms say who stands where ("residents").
// No drawing code here; js/resident-draw.js draws them.

export const TALK_DISTANCE = 110;
const WAVE_SECONDS = 0.9;
const nextLine = {}; // Which line each resident says next (for this visit to ILO).

export function createResidents(world, data) {
  return (world.residents ?? []).map((spot) => {
    const info = data.residents.find((r) => r.id === spot.id);
    return info ? { ...spot, info, talking: false, waveUntil: 0, text: null } : null;
  }).filter(Boolean);
}

// Starts or ends a chat as Ilo comes and goes. Calls onTalk(resident) when
// one starts talking. Returns true if anything changed (to redraw).
export function updateResidents(residents, avatar, time, onTalk = () => {}) {
  let changed = false;
  for (const r of residents) {
    const near = Math.hypot(avatar.x - r.x, avatar.y - r.y) < TALK_DISTANCE;
    if (near && !r.talking) {
      const i = nextLine[r.id] ?? 0;
      Object.assign(r, { talking: true, waveUntil: time + WAVE_SECONDS, text: r.info.lines[i % r.info.lines.length] });
      nextLine[r.id] = i + 1;
      onTalk(r);
      changed = true;
    } else if (!near && r.talking) {
      Object.assign(r, { talking: false, text: null });
      changed = true;
    }
  }
  return changed;
}

// Which animation to show: waving as Ilo arrives, talking while near, idle.
export function residentAnim(r, time) {
  if (r.waveUntil > time) return 'wave';
  return r.talking ? 'talk' : 'idle';
}
export const RESIDENT_FRAMES = { idle: 2, wave: 3, talk: 2 };
