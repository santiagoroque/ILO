// Wild animals that make the rooms feel alive (Phase 13, docs/DESIGN_PROMPT_2.md
// Part 4.1). They are scenery, not pets: they wander, pop out of holes, swim
// or cross the room, and most of them run, hide or fly away when Ilo comes
// close. A room lists its animals under "critters". No drawing code here,
// so the tests can run it; js/critter-draw.js draws them.
import { collides, inLayoutWater, WATER, WATER_AREAS } from './world-data.js';

// How each animal behaves. Speeds are in pixels per second; `flee` is how
// close Ilo can come before it reacts.
//   flyer    flutters around anywhere (drawn above everything)
//   hopper   walks or hops between spots (`move` and `idle` are its two
//            animations); flies away (fly) or runs off. `water` ones wade
//            in the sea and the shallows instead of walking on land
//   percher  sits on top of a palm; flies to another palm when Ilo comes
//   popper   lives in a hole: pops up, looks around, ducks down
//   swimmer  drifts around a pond or lagoon
//   jumper   jumps out of a pond or lagoon now and then
//   passer   crosses the whole room now and then
export const CRITTERS = {
  butterfly: { kind: 'flyer', speed: 45 },
  firefly: { kind: 'flyer', speed: 18 },
  songbird: { kind: 'hopper', speed: 60, flee: 110, fly: true, move: 'hop', idle: 'peck' },
  pigeon: { kind: 'hopper', speed: 45, flee: 100, fly: true, move: 'peck', idle: 'peck' },
  squirrel: { kind: 'hopper', speed: 120, flee: 120, move: 'run', idle: 'sit' },
  'snow-hare': { kind: 'hopper', speed: 140, flee: 130, move: 'hop', idle: 'sit' },
  crab: { kind: 'hopper', speed: 50, flee: 90, move: 'walk', idle: 'snap' },
  heron: { kind: 'hopper', speed: 30, flee: 130, fly: true, water: true, move: 'step', idle: 'stand' },
  toucan: { kind: 'percher', flee: 120 },
  macaw: { kind: 'percher', flee: 120 },
  'sea-turtle': { kind: 'swimmer', speed: 0.15 },
  meerkat: { kind: 'popper', flee: 140 },
  seal: { kind: 'popper', flee: 150 },
  duck: { kind: 'swimmer', speed: 0.25 },
  'jumping-fish': { kind: 'jumper' },
  elephant: { kind: 'passer', speed: 34, every: 40 },
  'bird-flock': { kind: 'passer', speed: 130, every: 22, flying: true },
};

// Animation frames each animal needs (the designers' file names are
// world/critters/<type>-<animation>-<n>.svg).
export const CRITTER_FRAMES = {
  butterfly: { fly: 2 },
  firefly: { glow: 3 },
  songbird: { hop: 2, peck: 2, fly: 3 },
  pigeon: { peck: 2, fly: 3 },
  squirrel: { run: 4, sit: 2 },
  'snow-hare': { hop: 3, sit: 2 },
  meerkat: { up: 3, look: 2, down: 2 },
  seal: { up: 3, look: 2, down: 2 },
  duck: { swim: 2 },
  'jumping-fish': { jump: 4 },
  elephant: { walk: 4, drink: 2 },
  'bird-flock': { fly: 3 },
  crab: { walk: 3, snap: 2 },
  heron: { stand: 2, step: 2, fly: 3 },
  toucan: { perch: 2, fly: 3 },
  macaw: { perch: 2, fly: 3 },
  'sea-turtle': { swim: 4 },
};
// The designers' names for some animations (delivery 2, round A), where
// they differ from the names above; and butterflies come in three colors.
const ART_ANIM = {
  meerkat: { up: 'pop-up', look: 'look-around', down: 'duck-down' },
  seal: { up: 'pop', down: 'dive' },
  pigeon: { fly: 'flutter-away' },
  squirrel: { sit: 'sit-nibble' },
};
const ART_VARIANTS = { butterfly: ['blue', 'yellow', 'orange'] };

// The picture for an animal's current frame.
export function critterArtFile(c, frame) {
  const anim = ART_ANIM[c.type]?.[c.anim] ?? c.anim;
  const colors = ART_VARIANTS[c.type];
  return `world/critters/${c.type}${colors ? `-${colors[c.variant % colors.length]}` : ''}-${anim}-${frame}.svg`;
}

// The hole a popper lives in (world/critters/<hole>.svg).
export const HOLES = { meerkat: 'burrow', seal: 'ice-hole' };

const between = (rng, a, b) => a + rng() * (b - a);
const HERD_GAP = 140; // Pixels between animals walking in a line (elephants).
const MARGIN = 50;

// Wading birds stand in the sea or the shallows, away from boardwalks.
const inShallowWater = (world, x, y) => inLayoutWater(world, x, y, WATER_AREAS) && collides(world, x, y, 30);

// A random point in one of an animal's home regions ([left, top, right, bottom]).
function inRegion(regions, rng) {
  const [l, t, r, b] = regions[Math.floor(rng() * regions.length)];
  return { x: between(rng, l, r), y: between(rng, t, b) };
}

// A free spot on the ground (or in the water for waders), away from
// `avoid` (Ilo) when given. Animals with home regions stay in them.
function groundSpot(world, rng, avoid = null, near = null, reach = 160, water = false, regions = null) {
  for (let tries = 0; tries < 40; tries++) {
    const home = regions && (!near || tries > 20) ? inRegion(regions, rng) : null;
    const x = home ? home.x : near ? near.x + between(rng, -reach, reach) : between(rng, MARGIN, world.width - MARGIN);
    const y = home ? home.y : near ? near.y + between(rng, -reach * 0.6, reach * 0.6) : between(rng, Math.max(MARGIN, (world.minY ?? 0) + MARGIN), world.height - MARGIN);
    if (regions && !home && !regions.some(([l, t, r, b]) => x > l - 60 && x < r + 60 && y > t - 40 && y < b + 40)) continue;
    if (water ? !inShallowWater(world, x, y) : collides(world, x, y, 10)) continue;
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < 260) continue;
    return { x, y };
  }
  return null;
}

// Where a bird can sit: the top of each tall palm (a layered room lists its perches).
const palmTops = (world) => world.perches ?? world.decorations.filter((d) => d.type === 'palm')
  .map((d) => ({ x: d.x + 17 * (d.size ?? 1), y: d.y, z: 138 * (d.size ?? 1) }));

const watersOf = (world) => world.decorations.filter((d) => WATER.includes(d.type) && d.type !== 'ice-lake');

// A point inside a pond or lagoon (`f` from 0, the middle, to 1, near the rim).
function inWater(water, angle, f) {
  return { x: water.x + Math.cos(angle) * water.radius * 0.6 * f, y: water.y + Math.sin(angle) * water.radius * 0.42 * f };
}

// Makes the animals for a room from its "critters" list.
export function createCritters(world, rng = Math.random) {
  const critters = [];
  const waters = watersOf(world);
  let index = 0;
  for (const entry of world.critters ?? []) {
    const def = CRITTERS[entry.type];
    if (!def) continue;
    for (let n = 0; n < (entry.count ?? 1); n++, index++) {
      const c = { type: entry.type, kind: def.kind, facing: rng() < 0.5 ? -1 : 1, variant: index % 3, timer: between(rng, 0.5, 4), progress: null, flying: false, z: 0 };
      if (entry.regions) c.regions = entry.regions;
      if (entry.under) c.under = true; // Under the glass deck: drawn below the floor.
      if (def.kind === 'flyer') {
        const spot = c.regions ? inRegion(c.regions, rng) : { x: between(rng, MARGIN, world.width - MARGIN), y: between(rng, 120, world.height - MARGIN) };
        Object.assign(c, spot, { anim: def.speed > 20 ? 'fly' : 'glow', flying: true, z: 26 });
        c.goal = { x: c.x, y: c.y };
      } else if (def.kind === 'hopper') {
        const spot = groundSpot(world, rng, null, null, 160, def.water, c.regions);
        if (!spot) continue;
        Object.assign(c, spot, { state: 'idle', anim: def.idle });
      } else if (def.kind === 'percher') {
        const perches = palmTops(world);
        if (!perches.length) continue;
        Object.assign(c, perches[index % perches.length], { state: 'perch', anim: 'perch' });
      } else if (def.kind === 'popper') {
        Object.assign(c, { x: entry.x, y: entry.y, home: { x: entry.x, y: entry.y }, state: 'hidden', anim: 'up', progress: 0 });
      } else if (def.kind === 'swimmer' || def.kind === 'jumper') {
        // A spot given in the room file (in the sea or the shallows), or the room's next pond.
        const water = entry.x !== undefined ? { x: entry.x, y: entry.y, radius: entry.radius ?? 80 } : waters[index % waters.length];
        if (!water) continue;
        const angle = rng() * Math.PI * 2;
        Object.assign(c, { water, angle, f: between(rng, 0.3, 0.9), ...inWater(water, angle, 0.6), anim: def.kind === 'swimmer' ? 'swim' : 'jump', state: 'wait' });
      } else if (def.kind === 'passer') {
        const y = entry.y ?? (def.flying ? between(rng, 70, 200) : world.height - 70);
        Object.assign(c, { x: -200, y, line: y, stopAt: entry.x ?? null, state: 'away', anim: def.flying ? 'fly' : 'walk', flying: Boolean(def.flying), z: 0 });
        c.timer = between(rng, 3, def.every * 0.6);
        // A herd: the first one leads, the others walk in a line behind it.
        if (n > 0) Object.assign(c, { leader: critters[critters.length - n], gap: HERD_GAP * n, y: y + (n % 2 ? 18 : -18) });
        else c.tail = HERD_GAP * ((entry.count ?? 1) - 1);
      }
      critters.push(c);
    }
  }
  return critters;
}

// Moves toward `goal`; returns true on arrival. With `world`, it stops
// (and counts as arrived) instead of walking into a tree, a bench or water.
function moveToward(c, goal, speed, dt, world = null) {
  const dx = goal.x - c.x;
  const dy = goal.y - c.y;
  const d = Math.hypot(dx, dy);
  if (Math.abs(dx) > 2) c.facing = dx > 0 ? 1 : -1;
  const done = d < speed * dt || d < 1;
  const x = done ? goal.x : c.x + (dx / d) * speed * dt;
  const y = done ? goal.y : c.y + (dy / d) * speed * dt;
  if (world && collides(world, x, y, 6)) return true;
  c.x = x;
  c.y = y;
  return done;
}

// Moves every animal by `dt` seconds. `avatar` is Ilo ({ x, y }).
export function updateCritters(critters, world, avatar, dt, rng = Math.random) {
  for (const c of critters) {
    const def = CRITTERS[c.type];
    const near = Math.hypot(avatar.x - c.x, avatar.y - c.y) < (def.flee ?? 0);
    c.timer -= dt;
    if (def.kind === 'flyer') {
      if (moveToward(c, c.goal, def.speed, dt) || c.timer < 0) {
        c.goal = c.regions ? inRegion(c.regions, rng) : { x: between(rng, MARGIN, world.width - MARGIN), y: between(rng, 120, world.height - MARGIN) };
        c.timer = between(rng, 3, 7);
      }
    } else if (def.kind === 'hopper') {
      if (c.state === 'gone') {
        if (c.timer > 0) continue;
        const spot = groundSpot(world, rng, avatar, null, 160, def.water, c.regions);
        if (!spot) continue;
        Object.assign(c, spot, { state: 'idle', flying: false, z: 0, timer: between(rng, 1, 3), anim: def.idle });
      } else if (c.state === 'flyaway') {
        c.x += c.facing * 220 * dt;
        c.z += 160 * dt;
        if (c.timer < 0) Object.assign(c, { state: 'gone', timer: between(rng, 6, 12) });
      } else if (near && c.state !== 'flee') {
        if (def.fly) {
          Object.assign(c, { state: 'flyaway', flying: true, anim: 'fly', timer: 1.8, facing: c.x >= avatar.x ? 1 : -1 });
        } else {
          const away = { x: c.x + Math.sign(c.x - avatar.x || 1) * 200, y: c.y + Math.sign(c.y - avatar.y || 1) * 80 };
          const spot = groundSpot(world, rng, avatar, away, 80, false, c.regions);
          if (spot) Object.assign(c, { state: 'flee', goal: spot, anim: def.move });
        }
      } else if (c.state === 'move' || c.state === 'flee') {
        if (moveToward(c, c.goal, def.speed * (c.state === 'flee' ? 1.8 : 1), dt, def.water ? null : world)) {
          Object.assign(c, { state: 'idle', timer: between(rng, 1.5, 4), anim: def.idle });
        }
      } else if (c.timer < 0) {
        const spot = groundSpot(world, rng, null, c, 140, def.water, c.regions);
        if (spot) Object.assign(c, { state: 'move', goal: spot, anim: def.move });
        else c.timer = 2;
      }
    } else if (def.kind === 'percher') {
      // perch -> (Ilo close) fly to another palm -> perch
      if (c.state === 'fly') {
        if (moveToward(c, c.goal, 160, dt)) {
          c.z = c.goal.z;
          Object.assign(c, { state: 'perch', anim: 'perch', flying: false });
        } else {
          c.z += (c.goal.z - c.z) * Math.min(1, dt * 2);
        }
      } else if (near) {
        const perches = palmTops(world).filter((p) => Math.hypot(p.x - avatar.x, p.y - avatar.y) > 250);
        const goal = perches[Math.floor(rng() * perches.length)];
        if (goal) Object.assign(c, { state: 'fly', anim: 'fly', flying: true, goal });
      }
    } else if (def.kind === 'popper') {
      // hidden -> up -> look -> down -> hidden; Ilo nearby sends it down.
      if (c.state === 'up' || c.state === 'down') {
        c.progress = Math.min(1, c.progress + dt / 0.35);
        if (c.progress >= 1) {
          if (c.state === 'up') Object.assign(c, { state: 'look', anim: 'look', progress: null, timer: between(rng, 2, 4) });
          else Object.assign(c, { state: 'hidden', anim: 'up', progress: 0, timer: between(rng, 2, 5) });
        }
      } else if (c.state === 'look' && (near || c.timer < 0)) {
        Object.assign(c, { state: 'down', anim: 'down', progress: 0 });
      } else if (c.state === 'hidden' && c.timer < 0 && !near) {
        Object.assign(c, { state: 'up', anim: 'up', progress: 0, facing: rng() < 0.5 ? -1 : 1 });
      }
    } else if (def.kind === 'swimmer') {
      c.angle += def.speed * dt * (c.variant % 2 ? 1 : -1);
      const p = inWater(c.water, c.angle, c.f);
      c.facing = p.x > c.x ? 1 : -1;
      c.x = p.x;
      c.y = p.y;
    } else if (def.kind === 'jumper') {
      if (c.state === 'jump') {
        c.progress = Math.min(1, c.progress + dt / 0.9);
        c.x += c.facing * 50 * dt;
        c.z = Math.sin(c.progress * Math.PI) * 42;
        if (c.progress >= 1) Object.assign(c, { state: 'wait', progress: null, z: 0, timer: between(rng, 3, 8) });
      } else if (c.timer < 0) {
        const angle = rng() * Math.PI * 2;
        Object.assign(c, inWater(c.water, angle, 0.5), { state: 'jump', progress: 0, facing: Math.cos(angle) > 0 ? -1 : 1 });
      }
    } else if (def.kind === 'passer' && c.leader) {
      // Followers copy the leader, a few steps behind it.
      const l = c.leader;
      Object.assign(c, { state: l.state, anim: l.anim, facing: l.facing, x: l.x - l.facing * c.gap });
    } else if (def.kind === 'passer') {
      if (c.state === 'away') {
        if (c.timer < 0) {
          c.facing = rng() < 0.5 ? 1 : -1;
          Object.assign(c, { state: 'walk', anim: def.flying ? 'fly' : 'walk', x: c.facing > 0 ? -160 : world.width + 160, y: c.line, stopped: false });
        }
      } else if (c.state === 'drink') {
        if (c.timer < 0) Object.assign(c, { state: 'walk', anim: 'walk' });
      } else {
        c.x += c.facing * def.speed * dt;
        if (c.stopAt !== null && !c.stopped && Math.abs(c.x - c.stopAt) < 4) {
          Object.assign(c, { state: 'drink', anim: 'drink', stopped: true, timer: 4 });
        }
        const tail = c.tail ?? 0; // The whole herd leaves before it turns back.
        if (c.x < -220 - tail || c.x > world.width + 220 + tail) Object.assign(c, { state: 'away', timer: between(rng, def.every * 0.6, def.every * 1.4) });
      }
    }
  }
}

// Which frame to show: one-shot moves (popping up, jumping) follow their
// progress; loops follow the clock.
export function critterFrame(c, time, fps = 8) {
  const count = CRITTER_FRAMES[c.type][c.anim] ?? 1;
  if (c.progress !== null && c.progress !== undefined) return Math.min(count, 1 + Math.floor(c.progress * count));
  return (Math.floor(time * fps + c.variant) % count) + 1;
}

// Hidden animals (in their hole, out of the room) are not drawn.
export const isVisible = (c) => !['hidden', 'gone', 'away'].includes(c.state) && !(c.kind === 'jumper' && c.state !== 'jump');
