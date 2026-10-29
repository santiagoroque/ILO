// Physics toys in the world (Phase 13, docs/DESIGN_PROMPT_2.md Part 5). Small
// things to play with that quietly show the lessons' ideas: a ball that
// rolls farther on ice than on sand (friction), a seesaw (lever), a swing
// (pendulum), a sled hill, a water wheel, a magnet rock and more. A room
// lists its toys under "toys". No drawing code here, so the tests can run
// it; js/toy-draw.js draws them. A toy's "scale" (layered rooms draw toys
// bigger) stretches its sizes and distances along with its picture.
import { collides, surfaceAt, TOY_BLOCKING } from './world-data.js';

// use: the kid walks up and presses Use (or Enter). ride: Ilo gets on it.
// (Which toys block walking is in js/world-data.js, TOY_BLOCKING.)
export const TOYS = {
  ball: { use: false },
  goal: { use: false },
  seesaw: { use: true, ride: true },
  swing: { use: true, ride: true },
  'bounce-mushroom': { use: true, ride: true },
  'sled-hill': { use: true, ride: true },
  'water-wheel': { use: true },
  'marimba-stones': { use: false },
  'paper-boat': { use: true },
  'magnet-rock': { use: false },
  kite: { use: true, ride: true },
};
export const USE_DISTANCE = 80;

// How much each ground slows a rolling ball (a friction coefficient, as in
// the friction lesson: smaller rolls farther).
export const GROUND_FRICTION = {
  arctic: 0.12, plaza: 0.3, savannah: 0.55, forest: 0.6, jungle: 0.65, sand: 0.9, indoor: 0.35,
};
const G = 600; // Pixels per second squared, for the ball's slowing down.
const KICK_SPEED = 330;
const BALL_RADIUS = 13;
const MARIMBA_NOTES = [60, 62, 64, 67, 69]; // C D E G A: any order sounds nice.
const MARIMBA_GAP = 34;

const k = (toy) => toy.scale ?? 1;

export function createToys(world) {
  return (world.toys ?? []).map((spot, i) => {
    const toy = { ...spot, index: i, used: false };
    if (spot.type === 'ball') Object.assign(toy, { home: { x: spot.x, y: spot.y }, vx: 0, vy: 0, spin: 0, resetAt: null });
    if (spot.type === 'seesaw') toy.tilt = 0;
    if (spot.type === 'water-wheel') Object.assign(toy, { angle: 0, speed: 0, openUntil: 0 });
    if (spot.type === 'marimba-stones') Object.assign(toy, { pressed: -1 });
    if (spot.type === 'paper-boat') toy.boat = null;
    if (spot.type === 'magnet-rock') {
      const home = spot.spoon ?? { x: spot.x - 150, y: spot.y + 40 };
      Object.assign(toy, { spoon: { ...home }, spoonHome: { ...home }, stuck: false, spoonSpeed: 0, stuckAt: 0 });
    }
    return toy;
  });
}

// Where the kid stands to use a toy.
export function usePoint(toy) {
  if (toy.type === 'sled-hill') return { x: toy.x, y: toy.y };
  return { x: toy.x, y: toy.y + ((TOY_BLOCKING[toy.type] ?? 0) + 24) * k(toy) }; // In front of it.
}

export function toyNear(toys, avatar) {
  let best = null;
  let bestDistance = USE_DISTANCE;
  for (const toy of toys) {
    if (!TOYS[toy.type].use) continue;
    const p = usePoint(toy);
    const d = Math.hypot(avatar.x - p.x, avatar.y - p.y);
    if (d < bestDistance) {
      best = toy;
      bestDistance = d;
    }
  }
  return best;
}

// Ilo gets on (or uses) a toy. Returns a ride, or null for toys that just
// do something (the water wheel, the paper boat).
export function useToy(toy, avatar, time, ride = null) {
  toy.used = true;
  switch (toy.type) {
    case 'seesaw':
      return { toy, type: 'seesaw', start: time };
    case 'swing':
      // Pressing Use again while swinging pumps it higher.
      if (ride?.toy === toy) {
        ride.amplitude = Math.min(0.9, ride.amplitude + 0.18);
        return ride;
      }
      return { toy, type: 'swing', start: time, amplitude: 0.35 };
    case 'bounce-mushroom':
      return { toy, type: 'bounce', start: time };
    case 'sled-hill':
      return { toy, type: 'sled', start: time, x: toy.x, y: toy.y, speed: 0, done: false, slope: { ...SLOPE, ...toy.slope } };
    case 'kite':
      if (ride?.toy === toy) return null; // Use again: put the kite away.
      return { toy, type: 'kite', start: time };
    case 'water-wheel':
      toy.openUntil = time + 8;
      return ride;
    case 'paper-boat':
      toy.boat = { x: toy.x, y: toy.y - 10 * k(toy), start: time };
      return ride;
    default:
      return ride;
  }
}

// Where Ilo is while riding: position, height above the ground (z), and
// whether the ride is over. Riding toys keep Ilo sitting.
const SWING_LENGTH = 60;
const SWING_PERIOD = 2.2; // Seconds for one swing there and back.
const BOUNCE_SECONDS = 0.7;
const BOUNCES = 8;
const SLOPE = { dx: 0.6, dy: 0.8, length: 140, accel: 320 };
export function ridePose(ride, world, dt, time) {
  const toy = ride.toy;
  const t = time - ride.start;
  const s = k(toy);
  switch (ride.type) {
    case 'seesaw':
      return { x: toy.x - 62 * s, y: toy.y + 2, z: (10 - toy.tilt * 40) * s, sit: true, done: false };
    case 'swing': {
      ride.amplitude = Math.max(0.12, ride.amplitude * (1 - 0.04 * dt)); // Slowly runs down.
      const angle = ride.amplitude * Math.cos((2 * Math.PI * t) / SWING_PERIOD);
      ride.angle = angle;
      return { x: toy.x + SWING_LENGTH * s * Math.sin(angle), y: toy.y + 4, z: (26 + SWING_LENGTH * (1 - Math.cos(angle))) * s, sit: true, done: false };
    }
    case 'bounce': {
      const n = Math.floor(t / BOUNCE_SECONDS);
      const height = Math.min(90, 25 + n * 13) * (n >= BOUNCES ? 0 : 1);
      ride.squash = (t % BOUNCE_SECONDS) / BOUNCE_SECONDS < 0.12;
      const z = (46 + height * Math.sin(Math.PI * ((t % BOUNCE_SECONDS) / BOUNCE_SECONDS))) * s;
      if (n >= BOUNCES) return { x: toy.x + 56 * s, y: toy.y + 24 * s, z: 0, sit: false, done: true };
      return { x: toy.x, y: toy.y + 2, z, sit: false, done: false };
    }
    case 'sled': {
      // Down the slope it speeds up; on the flat snow friction slows it.
      const slope = ride.slope ?? SLOPE;
      const travelled = Math.hypot(ride.x - toy.x, ride.y - toy.y);
      const friction = GROUND_FRICTION[surfaceAt(world, ride.x, ride.y)] ?? 0.3;
      ride.speed += (travelled < slope.length ? slope.accel : -friction * G) * dt;
      const nx = ride.x + slope.dx * Math.max(0, ride.speed) * dt;
      const ny = ride.y + slope.dy * Math.max(0, ride.speed) * dt;
      if (ride.speed <= 0 || collides(world, nx, ny)) return { x: ride.x, y: ride.y, z: 0, sit: false, done: true };
      ride.x = nx;
      ride.y = ny;
      return { x: nx, y: ny, z: 0, sit: true, sled: true, done: false };
    }
    case 'kite':
      return null; // Ilo walks normally holding the string.
    default:
      return null;
  }
}

function bounceBall(world, ball, nx, ny) {
  const r = BALL_RADIUS * k(ball);
  if (!collides(world, nx, ny, r)) return { x: nx, y: ny };
  // Hit something: bounce back on whichever axis frees it, losing speed.
  if (!collides(world, ball.x, ny, r)) {
    ball.vx *= -0.6;
    return { x: ball.x, y: ny };
  }
  if (!collides(world, nx, ball.y, r)) {
    ball.vy *= -0.6;
    return { x: nx, y: ball.y };
  }
  ball.vx *= -0.6;
  ball.vy *= -0.6;
  return { x: ball.x, y: ball.y };
}

// The mouth of a goal: the ball scores inside this box.
export const goalBox = (goal) => ({ x1: goal.x - 44 * k(goal), x2: goal.x + 44 * k(goal), y1: goal.y - 30 * k(goal), y2: goal.y });

// Moves everything by `dt`. Returns a list of things that happened, for
// sounds and stamps: kick, goal, note, stick, wheel, boat.
export function updateToys(toys, world, avatar, dt, time, ride = null) {
  const events = [];
  for (const toy of toys) {
    if (toy.type === 'ball') {
      if (toy.resetAt && time > toy.resetAt) Object.assign(toy, { x: toy.home.x, y: toy.home.y, vx: 0, vy: 0, resetAt: null });
      const d = Math.hypot(toy.x - avatar.x, toy.y - avatar.y);
      if (d < (BALL_RADIUS + 18) * k(toy) && !toy.resetAt) {
        const kick = (KICK_SPEED * k(toy)) / (d || 1);
        toy.vx = (toy.x - avatar.x || 1) * kick;
        toy.vy = (toy.y - avatar.y) * kick;
        toy.used = true;
        events.push({ type: 'kick', toy });
      }
      const speed = Math.hypot(toy.vx, toy.vy);
      if (speed > 0) {
        const friction = GROUND_FRICTION[surfaceAt(world, toy.x, toy.y)] ?? 0.4;
        const slower = Math.max(0, speed - friction * G * dt);
        toy.vx *= slower / speed;
        toy.vy *= slower / speed;
        Object.assign(toy, bounceBall(world, toy, toy.x + toy.vx * dt, toy.y + toy.vy * dt));
        toy.spin += (slower * dt) / (BALL_RADIUS * k(toy));
      }
      for (const goal of toys.filter((g) => g.type === 'goal')) {
        const box = goalBox(goal);
        if (!toy.resetAt && toy.x > box.x1 && toy.x < box.x2 && toy.y > box.y1 && toy.y < box.y2) {
          toy.resetAt = time + 1.5;
          toy.vx = 0;
          toy.vy = 0;
          events.push({ type: 'goal', toy: goal });
        }
      }
    } else if (toy.type === 'seesaw') {
      const target = ride?.toy === toy ? -0.3 : 0; // Ilo's end goes down.
      toy.tilt += (target - toy.tilt) * Math.min(1, dt * 4);
    } else if (toy.type === 'water-wheel') {
      const open = toy.openUntil > time;
      toy.speed += ((open ? 4 : 0) - toy.speed) * Math.min(1, dt * (open ? 0.8 : 0.4));
      toy.angle += toy.speed * dt;
    } else if (toy.type === 'marimba-stones') {
      // Five stones in a row; stepping onto one plays its note once.
      let on = -1;
      marimbaStones(toy).forEach((stone, i) => {
        if (Math.hypot(avatar.x - stone.x, avatar.y - stone.y) < 16 * k(toy)) on = i;
      });
      if (on !== -1 && on !== toy.pressed) {
        toy.used = true;
        events.push({ type: 'note', toy, note: MARIMBA_NOTES[on] });
      }
      toy.pressed = on;
    } else if (toy.type === 'paper-boat' && toy.boat) {
      const age = time - toy.boat.start;
      toy.boat.x = toy.x + age * 22 * k(toy);
      toy.boat.y = toy.y + (-10 - age * 12 + Math.sin(age * 2) * 3) * k(toy);
      if (age > 9) toy.boat = null;
    } else if (toy.type === 'magnet-rock') {
      // The lost spoon slides to the rock once Ilo nudges it; the pull is
      // stronger the closer it gets. It goes back after a while.
      const s = toy.spoon;
      if (toy.stuck) {
        if (time - toy.stuckAt > 20) Object.assign(toy, { stuck: false, spoon: { ...toy.spoonHome }, spoonSpeed: 0 });
      } else if (toy.spoonSpeed > 0 || Math.hypot(avatar.x - s.x, avatar.y - s.y) < 40 * k(toy)) {
        const dx = toy.x - s.x;
        const dy = toy.y - s.y;
        const dist = Math.hypot(dx, dy);
        toy.spoonSpeed += (60000 / Math.max(dist, 30) ** 2) * 60 * dt;
        const reach = 26 * k(toy); // The spoon sticks to the rock's side.
        const step = Math.min(dist - reach, toy.spoonSpeed * dt);
        s.x += (dx / dist) * step;
        s.y += (dy / dist) * step;
        if (dist - step <= reach + 1) {
          Object.assign(toy, { stuck: true, stuckAt: time, used: true });
          events.push({ type: 'stick', toy });
        }
      }
    }
  }
  return events;
}

export const marimbaStones = (toy) => MARIMBA_NOTES.map((_, i) => ({ ...(toy.stones?.[i] ?? { x: toy.x + (i - 2) * MARIMBA_GAP, y: toy.y }), pressed: toy.pressed === i }));
