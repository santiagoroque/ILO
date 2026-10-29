// Turns a room file (world/rooms/<id>.json) into a playable room: places the
// scattered decorations, works out what blocks walking (trees, buildings,
// furniture), and answers "is the avatar at an exit or next to a station?".
// No drawing code, so the tests and `npm run check` use it too.
import { FURNITURE } from './furniture.js';

export const AVATAR_RADIUS = 16;
export const RESIDENT_RADIUS = 18;
// Toys that block walking (js/toys.js), as a radius around them.
export const TOY_BLOCKING = { 'bounce-mushroom': 30, 'water-wheel': 40, 'magnet-rock': 24 };
export const STATION_SIZE = { width: 170, height: 120 }; // Building footprint, centered on x, y.
// Indoor stations are smaller: an arcade machine or a shop counter.
const STATION_SIZES = { arcade: { width: 100, height: 70 }, counter: { width: 260, height: 60 } };
export const stationSize = (s) => STATION_SIZES[s.style] ?? STATION_SIZE;
// Just in front of it; layered rooms give the spot (tools/apply-layouts.js).
const doorOf = (s) => s.door ?? { x: s.x, y: s.y + stationSize(s).height / 2 + 20 };
export const INTERACT_DISTANCE = 90; // How close to a door the kid must be to play.

// How much each decoration blocks walking (radius in pixels, 0 = walk over it).
export const BLOCKING = {
  tree: 26, pine: 24, acacia: 18, bush: 16, rock: 22, iceberg: 32, lamp: 8, fountain: 44, board: 18, target: 24, bench: 22,
  grass: 0, flowers: 0, mushroom: 0, snowpile: 0,
  // The Coast (Phase 13)
  palm: 18, 'palm-short': 16, banana: 20, monstera: 22, mangrove: 30, sandcastle: 20, 'beach-umbrella': 14,
  canoe: 30, driftwood: 18, waterfall: 70, 'rock-cliff': 40,
  // The Market street (Phase 13)
  kiosco: 70, 'market-stall': 40, 'market-stall-toys': 40, 'market-stall-crafts': 40, 'paleta-cart': 24, 'balloon-seller': 12,
  // Seasonal parties (world/parties.json)
  'decorated-pine': 24, 'star-pinata': 10, poinsettia: 14, jacaranda: 26, balloons: 10, 'model-volcano': 30, 'project-stand': 30,
  'papel-picado-string': 0, 'marigold-arch': 0, candles: 0, 'marigold-petals': 0, 'sugar-skull-tiles': 0, farolito: 0, 'string-lights': 0,
  'party-kites': 0, 'flower-garland': 0, 'fair-banner': 0,
  bromeliad: 0, hibiscus: 0, shell: 0, starfish: 0, towel: 0, 'tide-pool': 0, 'stepping-stone': 0, 'glass-deck': 0,
};
export const WATER = ['pond', 'ice-lake', 'lagoon'];
// Flat decorations: drawn on the ground, under everything that stands up.
export const FLAT = ['shell', 'starfish', 'towel', 'tide-pool', 'stepping-stone', 'glass-deck', 'marigold-petals', 'sugar-skull-tiles'];
// Decorations strung high above the ground: drawn over everything else.
export const OVERHEAD = ['papel-picado-string', 'string-lights', 'flower-garland', 'fair-banner', 'party-kites'];
// Flat pieces too big for the usual spacing: no scattered tree on them.
const WIDE_FLAT = { 'glass-deck': { r: 170, dy: -90 } };
// Areas that are water: Ilo cannot walk there, except along a path (a boardwalk).
export const WATER_AREAS = ['sea', 'shallows'];

// Small repeatable random generator: the same seed always gives the same
// forest, so a room looks identical on every computer.
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function insidePolygon(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function insideArea(area, x, y) {
  if (area.circle) return Math.hypot(x - area.circle.x, y - area.circle.y) <= area.circle.radius;
  return insidePolygon(area.points, x, y);
}

// Areas later in the list are drawn on top, so they win.
export function areaAt(world, x, y) {
  for (let i = world.areas.length - 1; i >= 0; i--) {
    if (insideArea(world.areas[i], x, y)) return world.areas[i];
  }
  return null;
}

function distanceToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function nearPath(paths, x, y, margin) {
  return paths.some((path) => path.points.slice(1).some((point, i) => {
    return distanceToSegment(x, y, path.points[i], point) < path.width / 2 + margin;
  }));
}

function boundsOf(area) {
  if (area.circle) {
    const { x, y, radius } = area.circle;
    return { minX: x - radius, minY: y - radius, maxX: x + radius, maxY: y + radius };
  }
  const xs = area.points.map((p) => p[0]);
  const ys = area.points.map((p) => p[1]);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

function blockRadius(decoration) {
  if (WATER.includes(decoration.type)) return decoration.radius - 12;
  return (BLOCKING[decoration.type] ?? 0) * (decoration.size ?? 1);
}

const inRect = (r, x, y, margin = 0) => x > r.x - margin && x < r.x + r.width + margin
  && y > r.y - margin && y < r.y + r.height + margin;

// ---- Layered rooms (DESIGN_PROMPT_3.md): pictures in layers and polygons ----
// The room's "layout" says where Ilo can walk ("walk", a list of polygons),
// what is in the way ("blocked" polygons, and each object's footprint: a
// rectangle [left, top, right, bottom] or an ellipse [x, y, rx, ry]) and
// how big Ilo and the other actors are drawn ("scale").

// Party decorations go to the layout's party spots: strings overhead, an
// arch at the entrance, a tree, the rest on the ground spots in turn.
const PARTY_ARCH = ['marigold-arch'];
const PARTY_TREE = ['decorated-pine', 'jacaranda'];
function placeParty(decorations, spots) {
  const ground = [...(spots.ground ?? [])];
  const band = spots.overhead?.[0];
  const seen = new Set();
  let next = 0;
  const out = [];
  for (const d of decorations) {
    if (OVERHEAD.includes(d.type)) {
      if (seen.has(d.type) || !band) continue; // One string across the band is enough.
      seen.add(d.type);
      out.push({ ...d, x: (band[0] + band[2]) / 2, y: (band[1] + band[3]) / 2 });
    } else if (PARTY_ARCH.includes(d.type) && spots.arch) out.push({ ...d, x: spots.arch[0], y: spots.arch[1] });
    else if (PARTY_TREE.includes(d.type) && spots.tree && !seen.has('tree')) {
      seen.add('tree');
      out.push({ ...d, x: spots.tree[0], y: spots.tree[1] });
    } else if (ground.length) {
      const [x, y] = ground[next++ % ground.length];
      out.push({ ...d, x, y });
    }
  }
  return out;
}

// Where perching birds sit: the crown points, standing on the tree under each.
function perchesOf(layout, scale) {
  return (layout.perches ?? []).map((p) => {
    const tree = layout.objects.filter((o) => o.layer === 'stand' && Math.abs(o.x - p.x) < 60 && o.y > p.y).sort((a, b) => a.y - b.y)[0];
    const base = tree ? tree.y + 2 : p.y;
    return { x: p.x, y: base, z: (base - p.y) / scale }; // z is drawn scaled with the bird.
  });
}

function buildLayered(room, size) {
  const layout = room.layout;
  const scale = layout.scale ?? 1;
  const stations = room.stations.map((s) => ({ ...s, door: doorOf(s) }));
  const party = layout.party ? placeParty(room.decorations, layout.party) : room.decorations;
  const world = {
    ...room,
    width: size.width,
    height: size.height,
    minY: room.minY ?? 0,
    start: room.spawn,
    stations,
    layered: true,
    actorScale: scale,
    furnitureScale: room.kind === 'house' ? 1.6 : 1, // The kid's own furniture, at the layout's furniture size.
    decorations: [...layout.objects, ...party.map((d) => ({ ...d, scale: 1.3, layer: FLAT.includes(d.type) ? 'floor' : OVERHEAD.includes(d.type) ? 'overhead' : 'stand', party: true }))],
    solids: [],
    shapes: [],
    stationRects: [],
    fixedFurniture: room.furniture ?? [],
    collectibles: room.collectibles ?? [],
    hasWaterAreas: false,
  };
  world.perches = perchesOf(layout, scale);
  for (const s of stations) if (s.art?.footprint) world.shapes.push(s.art.footprint);
  for (const o of layout.objects) if (o.footprint) world.shapes.push(o.footprint);
  for (const d of party) {
    const r = blockRadius(d) * 1.3;
    if (r > 0) world.solids.push({ x: d.x, y: d.y, r });
  }
  for (const r of room.residents ?? []) world.solids.push({ x: r.x, y: r.y, r: RESIDENT_RADIUS * (r.scale ?? 1) });
  for (const toy of room.toys ?? []) {
    const k = toy.scale ?? 1;
    if (TOY_BLOCKING[toy.type]) world.solids.push({ x: toy.x, y: toy.y - 10 * k, r: TOY_BLOCKING[toy.type] * k });
  }
  return withFurniture(world, []);
}

const inShape = (shape, x, y, mx, my) => {
  if (shape.rect) {
    const [l, t, r, b] = shape.rect;
    return x > l - mx && x < r + mx && y > t - my && y < b + my;
  }
  const [cx, cy, rx, ry] = shape.ellipse;
  return ((x - cx) / (rx + mx)) ** 2 + ((y - cy) / (ry + my)) ** 2 < 1;
};

// Is the point in water nobody walks on (the sea, the shallows, a pond)?
export function inLayoutWater(world, x, y, names = null) {
  const water = world.layout?.water ?? {};
  return Object.entries(water).some(([name, polys]) => (!names || names.includes(name)) && polys.some((p) => insidePolygon(p, x, y)));
}

// A layered room's collision: Ilo's feet (an ellipse r wide, a third as
// deep) must stay inside the walking polygons and out of every footprint.
function collidesLayered(world, x, y, r) {
  const rx = r * 1.25;
  const ry = r * 0.45;
  const walk = world.layout.walk;
  for (const [px, py] of [[x, y], [x - rx, y], [x + rx, y], [x, y - ry], [x, y + ry]]) {
    if (!walk.some((poly) => insidePolygon(poly, px, py))) return true;
  }
  if (world.layout.blocked.some((poly) => insidePolygon(poly, x, y))) return true;
  if (world.shapes.some((shape) => inShape(shape, x, y, rx * 0.6, ry))) return true;
  for (const solid of world.solids) {
    if (Math.hypot(x - solid.x, (y - solid.y) * 1.6) < solid.r + r) return true;
  }
  for (const rect of world.rects) {
    if (x > rect.x1 - rx && x < rect.x2 + rx && y > rect.y1 - ry && y < rect.y2 + ry) return true;
  }
  return false;
}

// The ground under a point, for friction (js/toys.js): a layered room has one.
export const surfaceAt = (world, x, y) => world.layout?.surface ?? areaAt(world, x, y)?.type;

// Builds a playable room. `size` comes from world/world.json.
export function buildRoom(room, size) {
  if (room.layout) return buildLayered(room, size);
  const stations = room.stations.map((s) => ({ ...s, door: doorOf(s) }));
  const world = {
    ...room,
    width: size.width,
    height: size.height,
    minY: room.minY ?? 0,
    start: room.spawn,
    stations,
    decorations: [],
    solids: [],
    stationRects: stations.map((s) => {
      const { width, height } = stationSize(s);
      return { x1: s.x - width / 2, x2: s.x + width / 2, y1: s.y - height / 2, y2: s.y + height / 2 };
    }),
    fixedFurniture: room.furniture ?? [], // Furniture that is part of the room (interiors).
    collectibles: room.collectibles ?? [],
    hasWaterAreas: room.areas.some((a) => WATER_AREAS.includes(a.type)),
  };

  const addDecoration = (decoration) => {
    world.decorations.push(decoration);
    const r = blockRadius(decoration);
    if (r > 0) world.solids.push({ x: decoration.x, y: decoration.y, r });
  };
  room.decorations.forEach((d) => addDecoration({ ...d }));
  // Residents stand still, so they block walking like a small tree; so do the bigger toys.
  for (const r of room.residents ?? []) world.solids.push({ x: r.x, y: r.y, r: RESIDENT_RADIUS });
  for (const toy of room.toys ?? []) if (TOY_BLOCKING[toy.type]) world.solids.push({ x: toy.x, y: toy.y - 10, r: TOY_BLOCKING[toy.type] });

  // Is this a good spot for a scattered decoration? Keep paths, doors,
  // exits, arrival spots and other objects clear so kids never get stuck.
  const keepClear = [room.spawn, ...room.exits.map((e) => e.spawn),
    ...(room.critters ?? []).filter((c) => c.x !== undefined), ...(room.residents ?? []), ...(room.toys ?? []), // Burrows, ice holes, residents, toys
    ...(room.toys ?? []).filter((t) => t.type === 'sled-hill') // and the sled's run down the hill.
      .flatMap((t) => [1, 2, 3, 4, 5].map((k) => ({ x: t.x + 0.6 * 80 * k, y: t.y + 0.8 * 80 * k })))];
  const clearSpot = (x, y, r, areaId) => {
    if (areaAt(world, x, y)?.id !== areaId) return false;
    if (nearPath(room.paths, x, y, r + 25)) return false;
    if (keepClear.some((p) => Math.hypot(x - p.x, y - p.y) < 110)) return false;
    if (room.exits.some((e) => inRect(e, x, y, r + 70))) return false;
    for (const s of stations) {
      const { width, height } = stationSize(s);
      if (Math.abs(x - s.x) < width / 2 + r + 50 && y > s.y - height / 2 - r - 50 && y < s.door.y + r + 60) return false;
    }
    if (world.collectibles.some((c) => Math.hypot(x - c.x, y - c.y) < r + 40)) return false;
    return world.solids.every((solid) => Math.hypot(x - solid.x, y - solid.y) > solid.r + r + 12)
      && world.decorations.every((d) => {
        const wide = WIDE_FLAT[d.type]; // Big flat pieces keep their whole floor clear.
        return wide ? Math.hypot(x - d.x, y - (d.y + wide.dy)) > wide.r : Math.hypot(x - d.x, y - d.y) > 34;
      });
  };

  for (const group of room.scatter) {
    const area = room.areas.find((a) => a.id === group.area);
    if (!area) continue;
    const box = boundsOf(area);
    const next = random(group.seed);
    let placed = 0;
    for (let tries = 0; placed < group.count && tries < group.count * 40; tries++) {
      const x = box.minX + 50 + next() * (box.maxX - box.minX - 100);
      const y = box.minY + 50 + next() * (box.maxY - box.minY - 100);
      const s = 0.85 + next() * 0.35;
      if (!clearSpot(x, y, (BLOCKING[group.type] ?? 0) * s, area.id)) continue;
      addDecoration({ type: group.type, x: Math.round(x), y: Math.round(y), size: Number(s.toFixed(2)) });
      placed++;
    }
  }
  return withFurniture(world, []);
}

// The footprint of a piece of furniture standing at (x, y) (bottom center),
// drawn `scale` times its size (layered rooms draw furniture bigger).
export function furnitureRect(id, x, y, scale = 1) {
  const f = FURNITURE[id];
  return { x1: x - (f.width * scale) / 2, x2: x + (f.width * scale) / 2, y1: y - f.depth * scale, y2: y };
}

// Returns a copy of the room with its own furniture plus the kid's placed
// furniture (in the house).
export function withFurniture(world, placed) {
  const own = world.furnitureScale ?? 1;
  const furniture = [...world.fixedFurniture, ...placed.map((p) => (own === 1 ? p : { ...p, scale: own }))].filter((p) => FURNITURE[p.id]);
  const rects = [...world.stationRects];
  for (const p of furniture) {
    if (FURNITURE[p.id].solid && !FURNITURE[p.id].wall) rects.push(furnitureRect(p.id, p.x, p.y, p.scale));
  }
  return { ...world, furniture, rects };
}

// Would an avatar standing at x, y overlap something solid?
export function collides(world, x, y, r = AVATAR_RADIUS) {
  if (world.layered) return collidesLayered(world, x, y, r);
  if (x < r || y < Math.max(r, world.minY + r) || x > world.width - r || y > world.height - r) return true;
  if (world.hasWaterAreas && WATER_AREAS.includes(areaAt(world, x, y)?.type) && !nearPath(world.paths, x, y, -4)) return true; // Ilo may lean over a boardwalk's edge a little.
  for (const solid of world.solids) {
    if (Math.hypot(x - solid.x, y - solid.y) < solid.r + r) return true;
  }
  for (const rect of world.rects) {
    if (x > rect.x1 - r && x < rect.x2 + r && y > rect.y1 - r && y < rect.y2 + r) return true;
  }
  return false;
}

// Moves from (x, y) toward (x + dx, y + dy). If blocked, slides instead of
// stopping dead: around a round obstacle (tree, fountain) it steps along the
// edge on the side that keeps heading toward the goal; along walls and
// buildings it slides on the x or y axis (stronger direction first).
export function moveWithCollisions(world, x, y, dx, dy) {
  if (!collides(world, x + dx, y + dy)) return { x: x + dx, y: y + dy, blocked: false };
  const length = Math.hypot(dx, dy);
  const slides = [];
  const r = AVATAR_RADIUS;
  const round = world.solids.find((s) => Math.hypot(x + dx - s.x, y + dy - s.y) < s.r + r);
  if (round) {
    const d = Math.hypot(x - round.x, y - round.y) || 1;
    let tx = -(y - round.y) / d;
    let ty = (x - round.x) / d;
    if (tx * dx + ty * dy < 0) {
      tx = -tx;
      ty = -ty;
    }
    slides.push([tx * length, ty * length]);
  }
  // Around an oval footprint (a fountain, a bench) in a layered room: along its edge.
  const oval = world.layered && world.shapes.find((s) => s.ellipse && inShape(s, x + dx, y + dy, r * 0.75, r * 0.45));
  if (oval) {
    const [cx, cy, rx, ry] = oval.ellipse;
    const nx = (x - cx) / (rx + r) ** 2;
    const ny = (y - cy) / (ry + r * 0.45) ** 2;
    const d = Math.hypot(nx, ny) || 1;
    let tx = -ny / d;
    let ty = nx / d;
    if (tx * dx + ty * dy < 0) {
      tx = -tx;
      ty = -ty;
    }
    slides.push([tx * length, ty * length]);
  }
  const axis = [[Math.sign(dx) * length, 0], [0, Math.sign(dy) * length]];
  if (Math.abs(dy) > Math.abs(dx)) axis.reverse();
  slides.push(...axis);
  for (const [sx, sy] of slides) {
    if ((sx || sy) && !collides(world, x + sx, y + sy)) return { x: x + sx, y: y + sy, blocked: false };
  }
  // At a corner (a bush beside an exit, a resident in the lane): if the way on
  // is free a little to one side, step sideways toward it.
  const across = Math.abs(dx) >= Math.abs(dy) ? [0, 1] : [1, 0];
  for (let k = 4; k <= 64; k += 4) {
    for (const side of [-1, 1]) {
      const ox = across[0] * side * k;
      const oy = across[1] * side * k;
      if (collides(world, x + ox, y + oy) || collides(world, x + ox + dx, y + oy + dy)) continue;
      const sx = Math.sign(ox) * Math.min(length, k);
      const sy = Math.sign(oy) * Math.min(length, k);
      if (!collides(world, x + sx, y + sy)) return { x: x + sx, y: y + sy, blocked: false };
    }
  }
  return { x, y, blocked: true };
}

export function stationNear(world, x, y) {
  let best = null;
  let bestDistance = INTERACT_DISTANCE;
  for (const s of world.stations) {
    const d = Math.hypot(x - s.door.x, y - s.door.y);
    if (d <= bestDistance) {
      best = s;
      bestDistance = d;
    }
  }
  return best;
}

export function exitAt(world, x, y) {
  return world.exits.find((e) => inRect(e, x, y, 1)) ?? null; // Its edge counts too.
}

// Where you appear when you arrive through `exit` (in the room it leads to).
export function arrivalPoint(targetRoom, exit) {
  if (exit.toExit) return { ...targetRoom.exits.find((e) => e.id === exit.toExit).spawn };
  const station = targetRoom.stations.find((s) => s.id === exit.toStation);
  return { x: doorOf(station).x, y: doorOf(station).y + 10 };
}

// Grid search used by the checker and tests: can the avatar walk from one
// point to another? Proves no door or exit is blocked by trees or water.
export function canWalk(world, from, to, cell = 16) {
  const key = (cx, cy) => `${cx},${cy}`;
  const start = [Math.round(from.x / cell), Math.round(from.y / cell)];
  const goal = [Math.round(to.x / cell), Math.round(to.y / cell)];
  const seen = new Set([key(...start)]);
  const queue = [start];
  while (queue.length) {
    const [cx, cy] = queue.shift();
    if (Math.abs(cx - goal[0]) <= 1 && Math.abs(cy - goal[1]) <= 1) return true;
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      const k = key(nx, ny);
      if (seen.has(k) || collides(world, nx * cell, ny * cell)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  return false;
}

// Can the avatar walk in a straight line from a to b without touching anything?
function clearLine(world, a, b) {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8);
  for (let i = 1; i <= steps; i++) {
    const k = i / steps;
    if (collides(world, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)) return false;
  }
  return true;
}

// Plans a walking route around obstacles (a search on a grid of 16-pixel
// cells), then keeps only the corners. If the clicked spot is blocked (a tree,
// a pond), it walks to the closest reachable spot instead.
// Returns a list of points to walk through, or [] if already there.
export function findPath(world, from, to, cell = 16) {
  if (clearLine(world, from, to) && !collides(world, to.x, to.y)) return [to];
  const key = (cx, cy) => cy * 10000 + cx;
  const start = [Math.round(from.x / cell), Math.round(from.y / cell)];
  const goal = [Math.round(to.x / cell), Math.round(to.y / cell)];
  const cameFrom = new Map([[key(...start), null]]);
  const queue = [start];
  let best = start;
  let bestDistance = Infinity;
  while (queue.length) {
    const [cx, cy] = queue.shift();
    const d = Math.hypot(cx - goal[0], cy - goal[1]);
    if (d < bestDistance) {
      best = [cx, cy];
      bestDistance = d;
      if (d === 0) break;
    }
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1], [cx + 1, cy + 1], [cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1]]) {
      const k = key(nx, ny);
      if (cameFrom.has(k) || collides(world, nx * cell, ny * cell)) continue;
      cameFrom.set(k, [cx, cy]);
      queue.push([nx, ny]);
    }
  }
  // Walk back from the best cell to the start.
  const cells = [];
  for (let c = best; c; c = cameFrom.get(key(...c))) cells.unshift({ x: c[0] * cell, y: c[1] * cell });
  if (bestDistance === 0 && !collides(world, to.x, to.y)) cells[cells.length - 1] = to;
  // Keep only the corners: from each point, jump to the farthest point in a straight line.
  const route = [];
  let here = from;
  let i = 0;
  while (i < cells.length) {
    let j = cells.length - 1;
    while (j > i && !clearLine(world, here, cells[j])) j--;
    route.push(cells[j]);
    here = cells[j];
    i = j + 1;
  }
  return route;
}

