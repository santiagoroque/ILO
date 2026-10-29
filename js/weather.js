// The time of day and the weather (Phase 13, DESIGN_PROMPT_2.md Part 4.4).
// ILO follows the computer's clock: from 6 pm the world turns to dusk, lamps
// and windows glow, and the Arctic shows northern lights. Weather is small
// falling things: snow in the Arctic, leaves in the Forest, a tropical
// drizzle at the Waterfall cove on some days, and petals during parties.
// No drawing code here; js/world-draw.js draws it.

// How dark it is, from 0 (day) to 1 (night), for an hour of the day (0-24).
export function darkness(hour) {
  if (hour >= 7 && hour < 18) return 0;
  if (hour >= 18 && hour < 20) return (hour - 18) / 2; // Dusk
  if (hour >= 6 && hour < 7) return 7 - hour; // Dawn
  return 1;
}
export const isEvening = (dark) => dark >= 0.5;

// Which weather a room has. `day` is the day of the year, so the drizzle
// comes on the same days on every computer.
export function weatherFor(room, { day = 0, party = null } = {}) {
  if (room.kind !== 'outdoor') return null;
  if (party?.weather) return party.weather;
  const type = room.areas[0]?.type;
  if (type === 'arctic') return 'snow';
  if (type === 'forest' && room.id !== 'plaza') return 'leaves';
  if (room.id === 'waterfall-cove' && day % 4 === 0) return 'rain';
  return null;
}

// How each weather falls: how many pieces, how fast (pixels per second),
// how much they sway, and which pictures (world/effects/<file>.svg).
export const WEATHER = {
  snow: { count: 45, fall: [30, 60], sway: 18, pictures: ['snowflake'] },
  leaves: { count: 10, fall: [25, 45], sway: 40, pictures: ['leaf-red', 'leaf-orange', 'leaf-yellow'] },
  rain: { count: 60, fall: [380, 480], sway: 0, pictures: ['raindrop'] },
  jacaranda: { count: 25, fall: [25, 45], sway: 30, pictures: ['petal-jacaranda'] },
  cempasuchil: { count: 25, fall: [25, 45], sway: 30, pictures: ['petal-cempasuchil'] },
};

export function createWeather(kind, size, rng = Math.random) {
  const w = WEATHER[kind];
  if (!w) return [];
  return Array.from({ length: w.count }, () => ({
    kind,
    x: rng() * size.width,
    y: rng() * size.height,
    speed: w.fall[0] + rng() * (w.fall[1] - w.fall[0]),
    phase: rng() * Math.PI * 2,
    picture: w.pictures[Math.floor(rng() * w.pictures.length)],
  }));
}

export function updateWeather(pieces, size, dt, time) {
  for (const p of pieces) {
    const w = WEATHER[p.kind];
    p.y += p.speed * dt;
    p.x += Math.cos(time * 1.5 + p.phase) * w.sway * dt;
    if (p.y > size.height + 10) {
      p.y = -10;
      p.x = (p.x + 397) % size.width; // Somewhere else along the top.
    }
  }
}
