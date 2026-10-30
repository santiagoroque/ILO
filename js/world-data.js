// Turns a room file (world/rooms/<id>.json) into a playable room: reads its
// layout (docs/DESIGN_PROMPT_3.md), works out what blocks walking (footprints,
// furniture, residents, toys), and answers "is the avatar at an exit or next
// to a station?".
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

function blockRadius(decoration) {
  if (WATER.includes(decoration.type)) return decoration.radius - 12;
  return (BLOCKING[decoration.type] ?? 0) * (decoration.size ?? 1);
}

const inRect = (r, x, y, margin = 0) => x > r.x - margin && x < r.x + r.width + margin
  && y > r.y - margin && y < r.y + r.height + margin;

// ---- Layered rooms (docs/DESIGN_PROMPT_3.md): pictures in layers and polygons ----
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

// The room's area, for its music, weather and map color: 'plaza', 'forest',
// 'savannah', 'arctic', 'coast' or 'indoor' (from its layout's ground).
export const areaOf = (room) => (room.layout.surface === 'sand' ? 'coast' : room.layout.surface);

// The ground under a point, for friction (js/toys.js): a layered room has one.
export const surfaceAt = (world) => world.layout.surface;

// Builds a playable room. `size` comes from world/world.json.
export function buildRoom(room, size) {
  return buildLayered(room, size);
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
  return collidesLayered(world, x, y, r);
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

// The screen corners the toolbar buttons cover, [left, top, right, bottom]
// (the designers' HUDReserved, DESIGN_PROMPT_3.md).
export const HUD = [[0, 0, 300, 60], [980, 0, 1280, 60], [0, 670, 380, 720], [780, 660, 1280, 720]];

// Where an exit's name is written: the designers' sign spot, moved aside
// when Ilo starts on it, and out from under the toolbar.
export function exitLabelSpot(world, exit) {
  const toLeft = exit.x <= 0;
  const toRight = exit.x + exit.width >= world.width;
  const toTop = exit.y <= 0;
  let p = exit.sign ? { ...exit.sign } : {
    x: toLeft ? 70 : toRight ? world.width - 70 : exit.x + exit.width / 2,
    y: toLeft || toRight ? exit.y + exit.height / 2 + 13 : toTop ? 104 : world.height - 104,
  };
  p.y = Math.min(p.y, world.height - 130); // On a phone the toolbar runs along the whole bottom.
  if (Math.hypot(p.x - world.start.x, p.y - world.start.y) < 90) p.x += p.x <= world.width / 2 ? 130 : -130;
  const under = HUD.find(([l, t, r, b]) => p.x > l && p.x < r && p.y > t && p.y < b);
  if (under) p = { x: p.x, y: under[1] === 0 ? under[3] + 14 : under[1] - 14 };
  return p;
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

