// Puts the designers' layered rooms (docs/DESIGN_PROMPT_3.md, revision 3) into the
// room files. Run it after importing their art:
//
//   npm run import-art -- "/path/to/delivery/assets" --add
//   npm run apply-layouts -- "/path/to/delivery/assets/world/redesign-layouts-v3.json"
//
// For each room it writes a "layout" (the ground and foreground pictures,
// where Ilo can walk, every object with its picture, size and footprint)
// and moves the doors, exits, residents, toys, animals, gems and furniture
// to the designers' spots. Names, lessons and texts stay as they are. The
// game draws a room with a layout from its pictures (js/world-draw.js) and
// walks it with its polygons (js/world-data.js).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CRITTERS } from '../js/critters.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) {
  console.error('Usage: npm run apply-layouts -- "/path/to/redesign-layouts-v3.json"');
  process.exit(1);
}
const delivery = JSON.parse(readFileSync(source, 'utf8'));
const anchors = JSON.parse(readFileSync(join(root, 'assets/anchors.json'), 'utf8'));

const round = (n) => Math.round(n * 10) / 10;
const point = ([x, y]) => ({ x: round(x), y: round(y) });
const rect = ([l, t, r, b]) => [round(l), round(t), round(r), round(b)];
const basename = (asset) => asset.split('/').pop().replace(/\.svg$/, '');
// "tree-2" -> "tree", "ripple-v3-1" -> "ripple", "dance-tile-coral-1" -> "dance-tile-coral".
const typeOf = (asset) => basename(asset).replace(/-v3(-\d+)?$/, '').replace(/-\d+$/, '');

// The picture's box in the room: [left, top, right, bottom].
function bounds(o) {
  const a = anchors[o.asset];
  if (!a) return null;
  const [w, h, ax, ay] = a;
  return rect([o.x - ax * o.scale, o.y - ay * o.scale, o.x + (w - ax) * o.scale, o.y + (h - ay) * o.scale]);
}

function footprint(fp) {
  if (!fp) return undefined;
  return Array.isArray(fp) ? { rect: rect(fp) } : { ellipse: [round(fp.x), round(fp.y), round(fp.rx), round(fp.ry)] };
}

// Pieces lying on the ground, walked over and drawn under everyone.
const FLAT_TYPES = ['rug', 'towel', 'shell', 'starfish', 'tide-pool', 'stepping-stone', 'glass-deck', 'dance-tile'];
function layerOf(o) {
  if (o.layer) return o.layer; // ground-effect (waves, ripples), ground-overlay (the pier's cap)
  if (o.mount === 'wall') return 'wall';
  if (o.mount === 'ceiling') return 'ceiling';
  const type = typeOf(o.asset);
  return FLAT_TYPES.some((f) => type === f || type.startsWith(`${f}-`)) ? 'floor' : 'stand';
}

// Furniture ids (js/furniture.js) whose picture in the layout has another name.
const FURNITURE_ART = { 'performance-stage': 'stage', 'pendulum-display': 'museum-pendulum', 'trophy-wall': 'trophy-wall' };
const SURFACE = { plaza: 'plaza', forest: 'forest', savannah: 'savannah', arctic: 'arctic', coast: 'sand', interior: 'indoor' };

// A circle that fits inside a named pond, for swimming and jumping animals
// (js/critters.js keeps them within 0.6 x and 0.42 x its radius).
function waterCircle(water, at) {
  const poly = water?.reefSwimOval ?? water?.polygon;
  if (!poly || Array.isArray(poly[0]?.[0])) return { x: at[0], y: at[1], radius: 80 };
  if (!Array.isArray(poly)) return { x: poly.x, y: poly.y, radius: Math.round(Math.min(poly.rx / 0.6, poly.ry / 0.42) * 0.85) };
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const rx = (Math.max(...xs) - Math.min(...xs)) / 2;
  const ry = (Math.max(...ys) - Math.min(...ys)) / 2;
  if (rx > 500) return { x: at[0], y: at[1], radius: 80 }; // The sea: a patch around the spot.
  return { x: round((Math.max(...xs) + Math.min(...xs)) / 2), y: round((Math.max(...ys) + Math.min(...ys)) / 2), radius: Math.round(Math.min(rx / 0.6, ry / 0.42) * 0.85) };
}

function critterList(data) {
  const out = [];
  for (const [layoutType, d] of Object.entries(data)) {
    const type = layoutType === 'pigeon-ground' ? 'pigeon' : layoutType;
    const kind = CRITTERS[type]?.kind;
    if (!kind) throw new Error(`Unknown animal "${layoutType}"`);
    if (kind === 'popper') for (const p of d.points) out.push({ type, ...point(p) });
    else if (kind === 'swimmer' || kind === 'jumper') for (const p of d.points) out.push({ type, ...d.waterCircle(p) });
    else if (kind === 'passer') {
      const ys = d.route ? d.route.map((p) => p[1]) : [(d.regions[0][1] + d.regions[0][3]) / 2];
      const entry = { type, count: d.count, y: Math.round(ys.reduce((a, b) => a + b, 0) / ys.length) };
      if (d.route) entry.x = d.route[Math.floor(d.route.length / 2)][0]; // Where the elephants stop to drink.
      out.push(entry);
    } else {
      const entry = { type, count: d.count };
      if (d.regions.length) entry.regions = d.regions.map(rect);
      out.push(entry);
    }
  }
  return out;
}

function sledSlope(lane, travel) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const top = mid(lane[0], lane[1]);
  const bottom = mid(lane[2], lane[3]);
  const length = Math.hypot(bottom[0] - top[0], bottom[1] - top[1]);
  return { dx: round((bottom[0] - top[0]) / length), dy: round((bottom[1] - top[1]) / length), length: travel?.[0] ?? 140 };
}

let changed = 0;
for (const [id, lay] of Object.entries(delivery.rooms)) {
  const file = join(root, `world/rooms/${id}.json`);
  const room = JSON.parse(readFileSync(file, 'utf8'));
  const scale = lay.avatarScale;
  const used = new Set();

  // Doors: buildings, arcade machines, counters.
  for (const o of lay.objects.filter((x) => x.station)) {
    const s = room.stations.find((st) => st.id === o.station);
    if (!s) throw new Error(`${id}: the layout has a door "${o.station}" that the room does not`);
    used.add(o);
    Object.assign(s, { x: round(o.x), y: round(o.y), door: point(o.door) });
    s.art = { asset: o.asset, scale: o.scale, bounds: bounds(o), footprint: footprint(o.footprint) };
    if (o.states) s.art.states = o.states;
    if (o.animation) s.art.animation = o.animation;
    if (o.houseStyles) s.art.houseStyles = o.houseStyles;
  }
  for (const s of room.stations) if (!s.art) throw new Error(`${id}: door "${s.id}" is missing from the layout`);

  // Fixed furniture (interiors), matched by its picture's name in order.
  for (const piece of room.furniture ?? []) {
    let o;
    if (piece.id === 'dance-floor') {
      // The floor is made of tiles in the layout: the piece covers them all.
      const tiles = lay.objects.filter((x) => typeOf(x.asset).startsWith('dance-tile'));
      const boxes = tiles.map(bounds);
      Object.assign(piece, { x: round((Math.min(...boxes.map((b) => b[0])) + Math.max(...boxes.map((b) => b[2]))) / 2), y: Math.max(...boxes.map((b) => b[3])), scale: 1, tiles: true });
      continue;
    }
    o = lay.objects.find((x) => !used.has(x) && !x.station && (FURNITURE_ART[typeOf(x.asset)] ?? typeOf(x.asset)) === piece.id);
    if (!o) throw new Error(`${id}: furniture "${piece.id}" is missing from the layout`);
    used.add(o);
    Object.assign(piece, { x: round(o.x), y: round(o.y), scale: o.scale });
    if (o.asset !== `furniture/${piece.id}.svg`) piece.art = o.asset;
    if (o.animation && piece.art) piece.animation = o.animation;
    if (o.mount === 'ceiling') piece.layer = 'ceiling';
    const plinth = o.onPlinth && lay.objects.find((x) => x.id === o.onPlinth);
    if (plinth) piece.sortY = plinth.y + 1; // Drawn in front of its plinth.
    if (piece.id === 'trophy-wall' && lay.spots.trophyFrames) piece.frames = lay.spots.trophyFrames.map(rect);
  }

  // Everything else is scenery.
  const objects = lay.objects.filter((o) => !used.has(o) && !(id === 'house' && o.mount === 'wall')).map((o) => {
    const out = { type: typeOf(o.asset), asset: o.asset, x: round(o.x), y: round(o.y), scale: o.scale, layer: layerOf(o) };
    if (o.verticalScale) out.verticalScale = o.verticalScale;
    if (o.animation) out.animation = o.animation;
    if (o.footprint && !o.walkable) out.footprint = footprint(o.footprint);
    if (o.onPlinth) out.sortY = lay.objects.find((x) => x.id === o.onPlinth).y + 1;
    return out;
  });

  // Exits: the same exits, at the designers' edges, with their arrival spots.
  for (const e of lay.exits) {
    const exit = room.exits.find((x) => x.to === e.to);
    if (!exit) throw new Error(`${id}: the layout has an exit to "${e.to}" that the room does not`);
    const [l, t, r, b] = e.rect;
    Object.assign(exit, { x: l, y: t, width: r - l, height: b - t, spawn: point(e.arrive), sign: point(e.sign) });
  }

  for (const r of room.residents ?? []) {
    const d = lay.residentData.find((x) => x.id === r.id);
    if (!d) throw new Error(`${id}: resident "${r.id}" is missing from the layout`);
    Object.assign(r, point(d.point), { scale: d.scale });
    // Arriving (or starting) on top of a resident: step to the side, away from them.
    for (const [spot, what] of [...room.exits.map((e) => [e.spawn, `the arrival from "${e.to}"`]), [lay.start, 'the start']]) {
      const [sx, sy] = Array.isArray(spot) ? spot : [spot.x, spot.y];
      const dx = sx - r.x;
      if (Math.abs(dx) < 60 && Math.abs(sy - r.y) < 50) {
        const x = r.x + (dx > 0 ? 1 : -1) * 60;
        console.log(`  ${id}: ${what} was on ${r.id}; moved from x ${sx} to ${x}`);
        if (Array.isArray(spot)) spot[0] = x;
        else spot.x = x;
      }
    }
  }

  for (const toy of room.toys ?? []) {
    const d = lay.toyData[toy.type];
    if (!d) throw new Error(`${id}: toy "${toy.type}" is missing from the layout`);
    Object.assign(toy, point(d.point), { scale: d.scale });
    if (toy.type === 'magnet-rock' && lay.toyData['lost-spoon']) toy.spoon = point(lay.toyData['lost-spoon'].point);
    if (toy.type === 'marimba-stones' && d.stonePoints) toy.stones = d.stonePoints.map(point);
    if (toy.type === 'sled-hill' && d.lanePolygon) toy.slope = sledSlope(d.lanePolygon, d.travelPixels);
  }

  const gems = lay.spots.gems;
  if (gems.length !== (room.collectibles ?? []).length) throw new Error(`${id}: ${gems.length} gem spots for ${(room.collectibles ?? []).length} gems`);
  (room.collectibles ?? []).forEach((g, i) => Object.assign(g, point(gems[i])));

  const critterData = Object.fromEntries(Object.entries(lay.critterData).map(([k, d]) => [k, { ...d, waterCircle: (p) => waterCircle(lay.water[d.water], p) }]));
  if (room.critters) room.critters = critterList(critterData);

  room.spawn = point(lay.start);
  room.decorations = []; // The layout's objects replace the drawn and scattered ones.
  room.scatter = [];
  room.paths = [];
  if (lay.floorLine) room.minY = lay.floorLine + 30;
  room.layout = {
    revision: delivery.revision,
    ground: lay.ground,
    ...(lay.foreground ? { foreground: lay.foreground } : {}),
    scale,
    surface: SURFACE[lay.area] ?? 'plaza',
    walk: (Array.isArray(lay.walk[0][0]) ? lay.walk : [lay.walk]).map((poly) => poly.map(([x, y]) => [round(x), round(y)])),
    blocked: lay.blocked.map((b) => b.points.map(([x, y]) => [round(x), round(y)])),
    water: Object.fromEntries(Object.entries(lay.water).filter(([, w]) => !w.walkable).map(([name, w]) => [name, (w.polygons ?? [w.polygon]).map((p) => p.map(([x, y]) => [round(x), round(y)]))])),
    objects,
    ...(lay.spots.perches.length ? { perches: lay.spots.perches.map(point) } : {}),
    ...(Object.keys(lay.spots.party ?? {}).length ? { party: lay.spots.party } : {}),
    ...(lay.windowRect && id === 'house' ? { window: { x: (lay.windowRect[0] + lay.windowRect[2]) / 2, y: lay.windowRect[3] } } : {}),
  };
  writeFileSync(file, `${JSON.stringify(room, null, 2)}\n`);
  changed++;
}
console.log(`ILO: ${changed} rooms now use the layered layout "${delivery.revision}"`);
