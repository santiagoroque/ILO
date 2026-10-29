// Draws a room: ground, paths, exits, decorations, stations, furniture, the
// avatar, its pet and speech bubbles. Pictures come from the art in assets/
// (js/sprites.js); each piece also has a simple shape version, drawn while
// its picture loads or if it is missing.
import { drawAvatar } from './avatar.js';
import { drawFurniture, FURNITURE } from './furniture.js';
import { drawPet } from './pet.js';
import { drawSprite, drawSpriteBox, frameAt, hasArt, reducedMotion, spritePattern, spriteReady } from './sprites.js';
import { drawStamp } from './stamps.js';
import { drawCritters } from './critter-draw.js';
import { drawResident, drawResidentBubble, drawTodo } from './resident-draw.js';
import { drawFlyingKite, drawSled, drawToy, FLAT_TOYS } from './toy-draw.js';
import { areaAt, FLAT, OVERHEAD, random, STATION_SIZE, stationSize, WATER, WATER_AREAS } from './world-data.js';

const OUTLINE = '#2b2d42';
const FONT = "'Nunito', system-ui, sans-serif";
const GROUND = {
  forest: { fill: '#64a84a', mark: '#4f8f3a' },
  savannah: { fill: '#e6c66e', mark: '#c9a64c' },
  arctic: { fill: '#eef6fb', mark: '#c9e0ee' },
  plaza: { fill: '#dccdb0', mark: '#c4b393' },
  indoor: { fill: '#d9b48a', mark: '#c49a6c' },
  // The Coast (Phase 13)
  sand: { fill: '#f3dfae', mark: '#dcc48a' },
  jungle: { fill: '#3f9a5a', mark: '#2f7f48' },
  sea: { fill: '#73bfc1', mark: '#b7e1d3' }, // The wave strips' water color
  shallows: { fill: '#5fb39a', mark: '#3f8f78' },
};
// Path colors per area (assets/tokens.json): fill and edge.
const PATH = {
  forest: ['#dec591', '#a98c5c'],
  savannah: ['#ce9c66', '#ad784c'],
  arctic: ['#d4e4ea', '#b1cbd6'],
  plaza: ['#dccdb0', '#b19c77'],
  sand: ['#e8cf96', '#c9a96a'],
  jungle: ['#cdb27a', '#9c8350'],
};
const BOARDWALK = ['#c99a5e', '#8a6238']; // Wooden planks, also over water.

// Wall and floor colors for each house style (world/items.json, houseStyles).
const HOUSE_STYLES = {
  cabin: { wall: '#b5794a', trim: '#7a4e2d', floor: '#d9b48a', boards: '#c49a6c' },
  adobe: { wall: '#e3a76f', trim: '#b8763f', floor: '#f0d9b5', boards: '#e0c39a' },
  icecabin: { wall: '#cfe9f6', trim: '#7fb8d8', floor: '#eef6fb', boards: '#d4e8f3' },
  shop: { wall: '#ffe8c2', trim: '#e07a5f', floor: '#e9d5b5', boards: '#d8bf98' },
  tower: { wall: '#e8f1f5', trim: '#457b9d', floor: '#cfd8dc', boards: '#b0bec5' },
  // House styles you can buy (Phase 13)
  bungalow: { wall: '#e9d8a6', trim: '#a3b18a', floor: '#f3dfae', boards: '#e0c896' },
  treehouse: { wall: '#a47148', trim: '#6b4a2b', floor: '#c89f72', boards: '#a47148' },
  hacienda: { wall: '#fff3e0', trim: '#1d4e89', floor: '#f1e3c6', boards: '#d8c39a' },
  'mushroom-house': { wall: '#fff1e0', trim: '#e63946', floor: '#7fb069', boards: '#6a994e' },
  observatory: { wall: '#1d2340', trim: '#8d99ae', floor: '#9aa5b1', boards: '#8d99ae' },
  // Hangout rooms on the Market street
  juice: { wall: '#fff1d6', trim: '#ff9f1c', floor: '#f4d6a6', boards: '#e5bd85' },
  fiesta: { wall: '#3c2a5a', trim: '#e63946', floor: '#2b2d42', boards: '#3d405b' },
  museum: { wall: '#eef1f3', trim: '#8d99ae', floor: '#d6d2c4', boards: '#c4bfae' },
};

// Wallpapers and floors you can buy (world/items.json): pictures are
// world/walls/wallpaper-<id>.svg and world/textures/floor-<id>.svg; these
// patterns are drawn until they arrive.
function wallpaperPattern(ctx, id, width, bottom) {
  const colors = {
    stripes: ['#fdf0d5', '#f4a261'], stars: ['#1d3557', '#ffd166'], jungle: ['#d8f3dc', '#40916c'],
    'papel-picado': ['#fff3e0', '#e63946'], waves: ['#caf0f8', '#0096c7'], chalkboard: ['#2f3e46', '#e9ecef'],
  }[id];
  if (!colors) return false;
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, width, bottom);
  ctx.fillStyle = colors[1];
  ctx.strokeStyle = colors[1];
  ctx.lineWidth = 3;
  for (let y = 30; y < bottom; y += 60) {
    for (let x = ((y / 60) % 2) * 40; x < width; x += 80) {
      ctx.beginPath();
      if (id === 'stripes') ctx.fillRect(x, 0, 24, bottom);
      else if (id === 'stars') ctx.arc(x + 10, y, 4, 0, Math.PI * 2);
      else if (id === 'jungle') ctx.ellipse(x + 10, y, 18, 7, -0.6, 0, Math.PI * 2);
      else if (id === 'papel-picado') ctx.rect(x, y - 16, 26, 22);
      else if (id === 'waves') {
        ctx.arc(x + 10, y, 16, Math.PI, Math.PI * 2);
        ctx.stroke();
        continue;
      } else {
        // Chalk drawings: a circle and an arrow, like a science lesson.
        ctx.arc(x + 10, y, 9, 0, Math.PI * 2);
        ctx.moveTo(x + 24, y);
        ctx.lineTo(x + 50, y);
        ctx.stroke();
        continue;
      }
      ctx.fill();
    }
  }
  return true;
}

function floorPattern(ctx, id, width, top, height) {
  const colors = {
    checkerboard: ['#f1faee', '#1d3557'], 'grass-carpet': ['#74c69d', '#52b788'], 'ocean-tiles': ['#90e0ef', '#0077b6'],
    talavera: ['#ffffff', '#1d4e89'], stone: ['#c9c9c0', '#a3a39a'], parquet: ['#e0b170', '#c48a4a'],
  }[id];
  if (!colors) return false;
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, top, width, height);
  ctx.fillStyle = colors[1];
  ctx.strokeStyle = colors[1];
  ctx.lineWidth = 2;
  const cell = 64;
  for (let y = top; y < top + height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const odd = ((x + y - top) / cell) % 2 === 1;
      if (id === 'checkerboard' && odd) ctx.fillRect(x, y, cell, cell);
      else if (id === 'grass-carpet') ctx.fillRect(x + 10, y + 20, 3, 8);
      else if (id === 'ocean-tiles' || id === 'stone') ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
      else if (id === 'talavera') {
        ctx.strokeRect(x, y, cell, cell);
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, 12, 0, Math.PI * 2);
        ctx.stroke();
      } else if (id === 'parquet') ctx.strokeRect(x, y + (odd ? cell / 2 : 0), cell, cell / 2);
    }
  }
  return true;
}

// Little grass blades, sand strokes and snow sparkles, made once per world.
const marksCache = new WeakMap();
function groundMarks(world) {
  if (!marksCache.has(world)) {
    const next = random(99);
    const marks = [];
    for (let y = 30; y < world.height; y += 70) {
      for (let x = 30; x < world.width; x += 70) {
        const mx = x + (next() - 0.5) * 50;
        const my = y + (next() - 0.5) * 50;
        marks.push({ x: mx, y: my, type: areaAt(world, mx, my)?.type, r: next() });
      }
    }
    marksCache.set(world, marks);
  }
  return marksCache.get(world);
}

// Rounded area edges; corners on the map border stay sharp.
function areaPath(ctx, world, area) {
  ctx.beginPath();
  if (area.circle) {
    ctx.arc(area.circle.x, area.circle.y, area.circle.radius, 0, Math.PI * 2);
    return;
  }
  const pts = area.points;
  const onBorder = ([x, y]) => x <= 0 || y <= 0 || x >= world.width || y >= world.height;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const first = pts[0];
  const startPoint = onBorder(first) ? first : mid(pts[pts.length - 1], first);
  ctx.moveTo(...startPoint);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[(i + (onBorder(first) ? 1 : 0)) % pts.length];
    const nextP = pts[(i + (onBorder(first) ? 2 : 1)) % pts.length];
    if (onBorder(p)) ctx.lineTo(...p);
    else ctx.quadraticCurveTo(p[0], p[1], ...mid(p, nextP));
  }
  ctx.closePath();
}

// Draws `draw` `s` times bigger around the ground point (x, y).
function scaledAt(ctx, x, y, s, draw) {
  if (s === 1) return draw();
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-x, -y);
  draw();
  ctx.restore();
}

// ---- Layered rooms (docs/DESIGN_PROMPT_3.md): the designers' pictures ----
// A scenery object: its loop if it has one (the dance floor's tiles only
// while Ilo dances on it), a wobble when a snowball hits a target.
function drawObject(ctx, o, scene) {
  if (o.party) return scaledAt(ctx, o.x, o.y, o.scale, () => drawDecoration(ctx, o, scene.time));
  const still = o.type.startsWith('dance-tile') && !scene.danceLit;
  let file = o.animation && !reducedMotion && !still ? o.animation[frameAt(scene.time, 3, o.animation.length) - 1] : o.asset;
  if (o.type === 'target' && o.hitUntil > scene.time) file = `world/decorations/target-hit-${frameAt(scene.time, 8, 2)}.svg`;
  const draw = () => drawSprite(ctx, file, o.x, o.y, { scale: o.scale }) || drawSprite(ctx, o.asset, o.x, o.y, { scale: o.scale });
  if (o.verticalScale) {
    ctx.save();
    ctx.translate(0, o.y);
    ctx.scale(1, o.verticalScale);
    ctx.translate(0, -o.y);
    draw();
    ctx.restore();
  } else draw();
}

// A piece of furniture, at its size in the room (`scale`), in the picture
// the layout gives it if that is not its own.
function drawPiece(ctx, p, scene, extra = {}) {
  if (p.tiles) return; // The dance floor is its tiles (scenery).
  const state = scene.furnitureState?.(p) ?? {};
  const s = p.scale ?? 1;
  if (p.art) {
    const busy = state.on || state.playing > 0;
    const loop = p.animation && !reducedMotion && (FURNITURE[p.id].anim || busy) ? p.animation[frameAt(scene.time, busy ? 8 : 3, p.animation.length) - 1] : null;
    if ((loop && drawSprite(ctx, loop, p.x, p.y, { scale: s })) || drawSprite(ctx, p.art, p.x, p.y, { scale: s })) {
      // The museum's wall: the kid's stamps in its frames.
      (p.frames ?? []).forEach(([l, t, r, b], i) => {
        const stamp = state.stamps?.[i];
        if (stamp) drawStamp(ctx, stamp.icon, (l + r) / 2, (t + b) / 2, Math.min(r - l, b - t) * 0.9, true, stamp.id);
      });
      return;
    }
  }
  scaledAt(ctx, p.x, p.y, s, () => drawFurniture(ctx, p.id, p.x, p.y, { time: scene.time, state, ...extra }));
}

// A door of a layered room: highlighted when Ilo is at it, lit windows in
// the evening, its loop, or its picture. The kid's house is the style they live in.
function drawLayeredStation(ctx, world, s, scene) {
  const art = s.art;
  const house = s.room === 'house' ? art.houseStyles?.[scene.houseStyle] : null;
  const base = house?.normal ?? art.asset;
  const states = house ?? art.states ?? {};
  const near = scene.nearStation?.id === s.id && s.kind !== 'soon';
  const files = [];
  if (near) files.push(states.highlight ?? base.replace(/\.svg$/, '-highlight.svg'));
  if (scene.evening && world.kind === 'outdoor') files.push(states.night);
  if (art.animation && !reducedMotion && !house) files.push(art.animation[frameAt(scene.time, 3, art.animation.length) - 1]);
  files.push(base);
  for (const file of files) if (file && drawSprite(ctx, file, s.x, s.y, { scale: art.scale })) return;
  const { height } = stationSize(s);
  scaledAt(ctx, s.x, s.y, art.scale, () => drawStation(ctx, { ...s, y: s.y - height / 2 }, scene));
}

export function drawWorld(ctx, world, scene) {
  const layout = world.layered ? world.layout : null;
  const S = world.actorScale ?? 1; // How big Ilo, the pet, residents and animals are drawn.
  const danceFloor = world.furniture.find((p) => p.tiles);
  scene.danceLit = Boolean(danceFloor && scene.furnitureState?.(danceFloor)?.lit);
  // Ground
  if (layout && world.kind !== 'house') {
    if (!drawSpriteBox(ctx, layout.ground, 0, 0, world.width, world.height)) {
      ctx.fillStyle = GROUND[layout.surface]?.fill ?? GROUND.plaza.fill;
      ctx.fillRect(0, 0, world.width, world.height);
    }
  } else if (world.kind === 'house' || world.kind === 'indoor') {
    drawHouseRoom(ctx, world, world.kind === 'house' ? scene.houseStyle : world.interior, world.kind === 'house' ? scene.houseDecor : {});
  } else {
    let textured = true;
    for (const area of world.areas) {
      const texture = spritePattern(ctx, `world/textures/${area.type}.svg`);
      textured &&= Boolean(texture);
      areaPath(ctx, world, area);
      ctx.fillStyle = texture ?? GROUND[area.type].fill;
      ctx.fill();
      if (area.circle) {
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.stroke();
      }
    }
    drawPlazaTiles(ctx, world);
    for (const area of world.areas) if (WATER_AREAS.includes(area.type)) drawWaves(ctx, world, area, scene.time);
    if (!textured) {
      for (const m of groundMarks(world)) {
        if (m.type && m.type !== 'plaza' && m.type !== 'indoor') drawMark(ctx, m);
      }
    }
  }

  // Paths, in the colors of the area around their first stretch (paths
  // often start on the room's edge, outside every area)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const path of world.paths) {
    const [a, b] = path.points;
    const type = areaAt(world, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2)?.type ?? world.areas[0]?.type;
    const [fill, edge] = path.style === 'boardwalk' ? BOARDWALK : PATH[type] ?? PATH.forest;
    for (const [width, color] of [[path.width + 6, edge], [path.width, fill]]) {
      ctx.beginPath();
      ctx.moveTo(...path.points[0]);
      path.points.slice(1).forEach((p) => ctx.lineTo(...p));
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    if (path.style === 'boardwalk') drawPlanks(ctx, path);
  }

  // Flat things under everything else: water, rugs, exits
  if (layout) {
    for (const layer of ['ground-effect', 'ground-overlay', 'floor', 'wall']) {
      for (const o of world.decorations) if (o.layer === layer) drawObject(ctx, o, scene);
    }
  } else {
    for (const d of world.decorations) {
      if (WATER.includes(d.type)) drawWater(ctx, d, scene.time);
      else if (FLAT.includes(d.type)) drawDecoration(ctx, d, scene.time);
    }
  }
  for (const p of world.furniture) {
    if ((FURNITURE[p.id].flat || FURNITURE[p.id].wall) && p.layer !== 'ceiling') drawPiece(ctx, p, scene);
  }
  for (const toy of scene.toys ?? []) if (FLAT_TOYS.includes(toy.type)) drawToy(ctx, toy, scene.time, scene.ride);
  for (const exit of world.exits) drawExit(ctx, world, exit, scene);
  for (const gem of scene.gems ?? []) drawGem(ctx, gem, scene.time);

  // Things that stand up, back to front, so nearer things overlap farther ones.
  const things = [];
  for (const d of world.decorations) {
    if (layout) {
      if (d.layer === 'stand') things.push({ y: d.sortY ?? d.y, draw: () => drawObject(ctx, d, scene) });
    } else if (!WATER.includes(d.type) && !FLAT.includes(d.type) && !OVERHEAD.includes(d.type)) things.push({ y: d.y, draw: () => drawDecoration(ctx, d, scene.time) });
  }
  for (const s of world.stations) {
    if (s.art) things.push({ y: s.y, draw: () => drawLayeredStation(ctx, world, s, scene) });
    else things.push({ y: s.y + stationSize(s).height / 2, draw: () => drawStation(ctx, s, scene) });
  }
  for (const p of world.furniture) {
    if (!FURNITURE[p.id].flat && !FURNITURE[p.id].wall && p.layer !== 'ceiling') things.push({ y: p.sortY ?? p.y, draw: () => drawPiece(ctx, p, scene) });
  }
  for (const toy of scene.toys ?? []) if (!FLAT_TOYS.includes(toy.type)) things.push({ y: toy.y, draw: () => drawToy(ctx, toy, scene.time, scene.ride) });
  const a = scene.avatar;
  const pose = a.pose; // On a toy: where Ilo sits, and how high (z).
  const ax = pose ? pose.x : a.x;
  const ay = pose ? pose.y : a.y;
  things.push({
    y: ay + 1, // Just in front of the toy Ilo is on.
    draw: () => scaledAt(ctx, ax, ay, S, () => {
      if (pose?.z) shadow(ctx, ax, ay, 14);
      if (pose?.sled) drawSled(ctx, ax, ay, scene.time);
      drawAvatar(ctx, ax, ay - (pose?.z ?? 0) / S, scene.look, scene.items, {
        facing: a.facing, walk: pose ? 0 : a.walk, view: pose ? 'side' : a.view, action: pose?.sit ? { type: 'sit' } : a.action, time: scene.time,
      });
    }),
  });
  if (scene.pet) {
    const pet = scene.pet;
    things.push({ y: pet.y, draw: () => drawPet(ctx, pet.kind, pet.x, pet.y, {
      facing: pet.facing, hop: pet.hop, time: scene.time, scale: S, mood: pet.heartUntil > scene.time ? 'happy' : pet.happy < 30 ? 'sad' : null,
    }) });
  }
  const drawCritter = (c) => scaledAt(ctx, c.x, c.y, S, () => drawCritters(ctx, [c], scene.time));
  for (const c of scene.critters ?? []) if (!c.flying) things.push({ y: c.y, draw: () => drawCritter(c) });
  for (const r of scene.residents ?? []) things.push({ y: r.y, draw: () => scaledAt(ctx, r.x, r.y, r.scale ?? 1, () => drawResident(ctx, r, scene.time)) });
  things.sort((p, q) => p.y - q.y).forEach((thing) => thing.draw());
  (scene.critters ?? []).filter((c) => c.flying).forEach(drawCritter);
  if (layout?.foreground) drawSpriteBox(ctx, layout.foreground, 0, 0, world.width, world.height);
  for (const d of world.decorations) {
    if (layout ? d.layer === 'overhead' : OVERHEAD.includes(d.type)) layout ? drawObject(ctx, d, scene) : drawDecoration(ctx, d, scene.time);
  }
  for (const p of world.furniture) if (p.layer === 'ceiling') drawPiece(ctx, p, scene);
  if (scene.ride?.type === 'kite') drawFlyingKite(ctx, a, scene.time, S);

  // Snowballs in flight (with their shadow on the ground) and splats
  for (const ball of scene.snowballs ?? []) {
    if (drawSprite(ctx, 'world/effects/snowball-shadow.svg', ball.x, ball.y + 3)
      && drawSprite(ctx, 'world/effects/snowball.svg', ball.x, ball.y - ball.z + 7)) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#7fb8d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y - ball.z, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  for (const splat of scene.splats ?? []) {
    if (!drawSprite(ctx, 'world/effects/splat.svg', splat.x, splat.y + 6, { scale: 1.4 })) {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(splat.x + Math.cos(a) * 9, splat.y + Math.sin(a) * 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (splat.hit) {
      drawSprite(ctx, 'world/effects/hit-pop.svg', splat.x, splat.y - 24);
      ctx.fillStyle = '#c96847';
      ctx.font = `800 18px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('+1', splat.x, splat.y - 70);
    }
  }

  // Falling weather, then the evening: a dusk tint with glowing lamps,
  // doors and fireflies, and northern lights in the Arctic.
  for (const s of scene.sparkles ?? []) drawSparkle(ctx, s, scene.time);
  for (const p of scene.weather ?? []) drawWeatherPiece(ctx, p, scene.time);
  if (scene.darkness > 0 && world.kind === 'outdoor') drawEvening(ctx, world, scene);

  // On top: name plates, the piece being dragged, bubbles, the walk target
  for (const s of world.stations) drawNamePlate(ctx, s, scene);
  if (scene.dragging) {
    const k = world.furnitureScale ?? 1;
    scaledAt(ctx, scene.dragging.x, scene.dragging.y, k, () => drawFurniture(ctx, scene.dragging.id, scene.dragging.x, scene.dragging.y, { ghost: true }));
    if (!scene.dragging.valid) drawNoSign(ctx, scene.dragging.x, scene.dragging.y - 30 * k);
  }
  if (scene.pet?.heartUntil > scene.time) drawEmote(ctx, 'heart', scene.pet.x, scene.pet.y - 66 * S, 30);
  if (scene.bubble && scene.bubble.until > scene.time) drawBubble(ctx, a.x, a.y - 62 * S, scene.bubble);
  for (const r of scene.residents ?? []) {
    const k = r.scale ?? 1;
    if (r.talking) drawResidentBubble(ctx, r, scene.pick(r.text), scene.pick(r.info.name), k);
    else if (!scene.talked?.has(r.id)) drawTodo(ctx, r.x, r.y - 110 * k, scene.time);
  }
  if (scene.target) drawTarget(ctx, scene.target, scene.time);
}

// A star burst where a new animal was spotted (world/effects/spotted-<n>.svg).
function drawSparkle(ctx, s, time) {
  const k = 1 - Math.max(0, s.until - time) / 1.2; // 0 -> 1 over its life
  if (drawSprite(ctx, `world/effects/spotted-${Math.min(3, 1 + Math.floor(k * 3))}.svg`, s.x, s.y + 12)) return;
  ctx.save();
  ctx.strokeStyle = `rgba(255, 209, 102, ${1 - k})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(s.x + Math.cos(a) * (6 + k * 10), s.y + Math.sin(a) * (6 + k * 10));
    ctx.lineTo(s.x + Math.cos(a) * (12 + k * 18), s.y + Math.sin(a) * (12 + k * 18));
    ctx.stroke();
  }
  ctx.restore();
}

function drawWeatherPiece(ctx, p, time) {
  if (drawSprite(ctx, `world/effects/${p.picture}.svg`, p.x, p.y, { rotate: p.kind === 'rain' ? 0 : Math.sin(time * 2 + p.phase) * 0.6 })) return;
  ctx.save();
  if (p.kind === 'rain') {
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 10);
    ctx.lineTo(p.x - 2, p.y);
    ctx.stroke();
  } else {
    const color = { snowflake: '#ffffff', 'leaf-red': '#c8553d', 'leaf-orange': '#e9963e', 'leaf-yellow': '#e9c46a', 'petal-jacaranda': '#9d7ad8', 'petal-cempasuchil': '#f4a024' }[p.picture];
    ctx.fillStyle = color;
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(time * 2 + p.phase));
    ctx.beginPath();
    if (p.kind === 'snow') ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
    else ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// A warm round light (a lamp, a lit door). Uses world/effects/lamp-glow.svg
// when it exists.
function glow(ctx, x, y, radius, strength) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (!drawSprite(ctx, 'world/effects/lamp-glow.svg', x, y + radius / 2, { scale: radius / 60, alpha: strength })) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(255, 210, 120, ${0.55 * strength})`);
    g.addColorStop(1, 'rgba(255, 210, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  ctx.restore();
}

const GLOWING = { lamp: 60, lantern: 34, farolito: 16, candles: 14, 'string-lights': 150, kiosco: 150 };

function drawEvening(ctx, world, scene) {
  const dark = scene.darkness;
  ctx.fillStyle = `rgba(28, 30, 78, ${0.42 * dark})`;
  ctx.fillRect(0, 0, world.width, world.height);
  if (world.areas[0]?.type === 'arctic' && dark > 0.5) {
    // Northern lights near the top of the room
    const k = (dark - 0.5) * 2;
    const frame = reducedMotion ? 1 : frameAt(scene.time, 1, 3);
    if (!drawSpriteBox(ctx, `world/effects/aurora-${frame}.svg`, 0, 0, world.width, 240)) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // Soft ribbons: wide and faint, then narrower and a little brighter.
      for (const [rgb, y0] of [['80, 230, 160', 70], ['170, 110, 230', 120]]) {
        for (const [width, alpha] of [[44, 0.05], [18, 0.08]]) {
          ctx.lineWidth = width;
          ctx.strokeStyle = `rgba(${rgb}, ${alpha * k})`;
          ctx.beginPath();
          for (let x = 0; x <= world.width; x += 40) {
            const y = y0 + Math.sin(x / 140 + scene.time * 0.4) * 24;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  for (const d of world.decorations) {
    const height = GLOWING[d.type] * (d.scale ?? d.size ?? 1);
    if (height) glow(ctx, d.x, d.y - height, height * 1.4, dark);
  }
  for (const s of world.stations) {
    if (s.style === 'arcade' || s.style === 'counter' || s.kind === 'soon') continue;
    if (s.art) glow(ctx, s.door.x, s.door.y - 26 * s.art.scale, 50 * s.art.scale, dark);
    else glow(ctx, s.x, s.y + STATION_SIZE.height / 2 - 26, 50, dark); // Light from the door
  }
  drawCritters(ctx, (scene.critters ?? []).filter((c) => c.type === 'firefly'), scene.time);
}

function drawMark(ctx, m) {
  const g = GROUND[m.type];
  ctx.strokeStyle = g.mark;
  ctx.fillStyle = g.mark;
  ctx.lineWidth = 2;
  if (m.type === 'forest') {
    ctx.beginPath();
    ctx.moveTo(m.x - 4, m.y);
    ctx.lineTo(m.x - 2, m.y - 7);
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x + 1, m.y - 9);
    ctx.moveTo(m.x + 4, m.y);
    ctx.lineTo(m.x + 5, m.y - 6);
    ctx.stroke();
  } else if (m.type === 'savannah') {
    ctx.beginPath();
    ctx.moveTo(m.x - 6, m.y);
    ctx.quadraticCurveTo(m.x, m.y - 3, m.x + 6, m.y);
    ctx.stroke();
  } else if (m.type === 'arctic') {
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, 8 + m.r * 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (m.type === 'sand') {
    ctx.beginPath();
    ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
    ctx.arc(m.x + 7, m.y + 3, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (m.type === 'jungle') {
    ctx.beginPath();
    ctx.ellipse(m.x - 4, m.y - 3, 6, 2.5, -0.6, 0, Math.PI * 2);
    ctx.ellipse(m.x + 4, m.y - 3, 6, 2.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlazaTiles(ctx, world) {
  const plaza = world.areas.find((a) => a.type === 'plaza' && a.circle);
  if (!plaza) return;
  const { x, y, radius } = plaza.circle;
  ctx.strokeStyle = GROUND.plaza.mark;
  ctx.lineWidth = 3;
  for (let r = 60; r < radius; r += 60) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// The sea and the shallows: soft moving ripples, and on the sea a foam line
// that slides along the shore. Edges on the room's border are clipped away.
function drawWaves(ctx, world, area, time) {
  const t = reducedMotion ? 0 : time;
  ctx.save();
  areaPath(ctx, world, area);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let y = 20; y < world.height; y += 46) {
    for (let x = ((y / 46) % 2) * 60; x < world.width + 80; x += 120) {
      const wx = x + ((t * 14) % 120) - 60;
      ctx.beginPath();
      ctx.arc(wx, y + Math.sin(t * 1.5 + x) * 2, 12, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  }
  ctx.restore();
  if (area.type !== 'sea') return;
  if (drawShoreStrips(ctx, world, area, t)) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(6, 6, world.width - 12, world.height - 12);
  ctx.clip();
  areaPath(ctx, world, area);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 8 + Math.sin(t * 1.6) * 3;
  ctx.setLineDash([22, 12]);
  ctx.lineDashOffset = -t * 12;
  ctx.stroke();
  ctx.restore();
}

// Where the sea's top edge is at `x` (the shore), or null.
function shoreY(area, x) {
  let best = null;
  const pts = area.points;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    if (ax === bx || x < Math.min(ax, bx) || x > Math.max(ax, bx)) continue;
    const y = ay + ((by - ay) * (x - ax)) / (bx - ax);
    if (best === null || y < best) best = y;
  }
  return best;
}

// The designers' wave strips (world/water/sea-edge-<n>.svg, 256 x 160, tiling
// sideways) along a shore that runs across the room. A shore that turns
// steeply (Coral lookout) keeps the drawn foam line. Returns true if drawn.
const STRIP = 256;
function drawShoreStrips(ctx, world, area, time) {
  if (!area.points || !hasArt('world/water/sea-edge-1.svg')) return false;
  const ys = [];
  for (let x = 0; x < world.width; x += STRIP) ys.push(shoreY(area, x + STRIP / 2));
  if (ys.some((y, i) => y === null || (i && Math.abs(y - ys[i - 1]) > 60))) return false;
  const frame = reducedMotion ? 1 : frameAt(time, 4, 4);
  // One straight row (steps between strips would show): the strips' water
  // starts 47 px below their top, at the highest point of the shore.
  const shore = Math.min(...ys);
  for (let i = 0; i < ys.length; i++) drawSprite(ctx, `world/water/sea-edge-${frame}.svg`, i * STRIP + STRIP / 2, shore - 47 + 160);
  return true;
}

// Planks across a boardwalk path.
function drawPlanks(ctx, path) {
  ctx.strokeStyle = 'rgba(90, 60, 30, 0.45)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'butt';
  for (let i = 1; i < path.points.length; i++) {
    const [ax, ay] = path.points[i - 1];
    const [bx, by] = path.points[i];
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const [ux, uy] = [(bx - ax) / length, (by - ay) / length];
    const [nx, ny] = [-uy * (path.width / 2 - 2), ux * (path.width / 2 - 2)];
    for (let k = 8; k < length; k += 14) {
      const [px, py] = [ax + ux * k, ay + uy * k];
      ctx.beginPath();
      ctx.moveTo(px + nx, py + ny);
      ctx.lineTo(px - nx, py - ny);
      ctx.stroke();
    }
  }
  ctx.lineCap = 'round';
}

function drawWater(ctx, d, time = 0) {
  // The picture's water is 115 wide at scale 1, drawn around its center.
  const scale = (d.radius + 8) / 125;
  const frame = reducedMotion ? 0 : frameAt(time, 2, 3); // A slow shimmer or glint.
  if (frame && drawSprite(ctx, `world/water/${d.type}-${frame}.svg`, d.x, d.y + 75 * scale, { scale })) return;
  if (drawSprite(ctx, `world/water/${d.type}.svg`, d.x, d.y + 75 * scale, { scale })) return;
  const ice = d.type === 'ice-lake';
  const lagoon = d.type === 'lagoon';
  ctx.fillStyle = ice ? '#d3ecf7' : lagoon ? '#9fe3df' : '#7cc0e6';
  ctx.beginPath();
  ctx.ellipse(d.x, d.y, d.radius + 8, d.radius * 0.72 + 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ice ? '#b5dcef' : lagoon ? '#2fb3b8' : '#3f8fd0';
  ctx.beginPath();
  ctx.ellipse(d.x, d.y, d.radius, d.radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = ice ? '#ffffff' : '#a9dcf5';
  ctx.beginPath();
  if (ice) {
    ctx.moveTo(d.x - d.radius * 0.5, d.y - 10);
    ctx.lineTo(d.x - 10, d.y + 5);
    ctx.lineTo(d.x + d.radius * 0.4, d.y - 20);
    ctx.moveTo(d.x - 10, d.y + 5);
    ctx.lineTo(d.x + 5, d.y + d.radius * 0.4);
  } else {
    ctx.ellipse(d.x - d.radius * 0.3, d.y - d.radius * 0.25, d.radius * 0.25, 6, 0, Math.PI, Math.PI * 2);
  }
  ctx.stroke();
}

function shadow(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

function blob(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// Shape drawings for the Coast and Market street pieces (Phase 13), used
// until the designers' pictures arrive (docs/DESIGN_PROMPT_2.md, Parts 3 and 8). Each draws around its ground
// point (0, 0); `time` is 0 when the computer asks for less motion.
function leaf(ctx, x, y, length, width, angle, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(length / 2, 0, length / 2, width, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function palmShape(ctx, time, d, height) {
  const sway = Math.sin(time * 1.2 + d.x * 0.01) * 0.06;
  shadow(ctx, 0, 0, height > 100 ? 30 : 22);
  ctx.save();
  ctx.rotate(sway);
  const topX = height * 0.12;
  ctx.fillStyle = '#a0703e';
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.quadraticCurveTo(-4, -height * 0.5, topX - 4, -height);
  ctx.lineTo(topX + 4, -height);
  ctx.quadraticCurveTo(6, -height * 0.5, 7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  for (let y = -12; y > -height + 8; y -= 12) {
    ctx.beginPath();
    ctx.moveTo(-6 + (topX * -y) / height, y);
    ctx.lineTo(6 + (topX * -y) / height, y + 3);
    ctx.stroke();
  }
  ctx.strokeStyle = OUTLINE;
  const span = height > 100 ? 52 : 38;
  for (const [angle, color] of [[-2.6, '#2f8a4a'], [-0.5, '#2f8a4a'], [-1.9, '#3fae5c'], [-1.2, '#3fae5c'], [-3.0, '#3fae5c'], [-0.15, '#3fae5c']]) {
    leaf(ctx, topX, -height, span, 9, angle + Math.sin(time * 2 + angle) * 0.05, color);
  }
  if (height > 100) for (const [cx, cy] of [[-6, 6], [5, 8], [0, 12]]) blob(ctx, topX + cx, -height + cy, 6, '#7a4e2d');
  ctx.restore();
}
function stall(ctx, colors, goods) {
  shadow(ctx, 0, 0, 56);
  ctx.fillStyle = '#b5794a';
  roundRect(ctx, -54, -46, 108, 46, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#7a4e2d';
  ctx.fillRect(-52, -110, 6, 64);
  ctx.fillRect(46, -110, 6, 64);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = colors[i % 2];
    ctx.beginPath();
    ctx.moveTo(-60 + i * 20, -112);
    ctx.lineTo(-40 + i * 20, -112);
    ctx.lineTo(-40 + i * 20, -94);
    ctx.arc(-50 + i * 20, -94, 10, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  goods.forEach((c, i) => blob(ctx, -36 + i * 18, -52, 8, c));
}

// A string of small things hung across the room between two posts.
function garland(ctx, time, colors, piece, span = 300, height = 150) {
  ctx.fillStyle = '#7a4e2d';
  ctx.fillRect(-span - 3, -height, 6, height);
  ctx.fillRect(span - 3, -height, 6, height);
  ctx.beginPath();
  ctx.moveTo(-span, -height);
  ctx.quadraticCurveTo(0, -height + 40, span, -height);
  ctx.stroke();
  const n = 14;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = -span + 2 * span * t;
    const y = (1 - t) * (1 - t) * -height + 2 * (1 - t) * t * (-height + 40) + t * t * -height;
    piece(x, y, colors[i % colors.length], i, Math.sin(time * 2 + i) * 0.1);
  }
}

const COAST_SHAPES = {
  // ---- Seasonal parties ----
  'papel-picado-string': (ctx, time) => garland(ctx, time, ['#e63946', '#ff8c42', '#ffd166', '#8e6bd6', '#2bb3a3', '#ff6f91'], (x, y, c, i, sway) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.fillStyle = c;
    ctx.fillRect(-12, 0, 24, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(-4, 8, 8, 8); // The cut-out pattern
    ctx.restore();
  }),
  'string-lights': (ctx, time) => garland(ctx, time, ['#ffd166', '#e63946', '#2bb3a3', '#ffffff'], (x, y, c, i) => {
    blob(ctx, x, y + 6, 4, Math.sin(time * 3 + i) > -0.5 ? c : '#5c5c5c');
  }),
  'flower-garland': (ctx, time) => garland(ctx, time, ['#ff8fab', '#ffd166', '#ffffff', '#c77dff'], (x, y, c) => blob(ctx, x, y + 4, 6, c)),
  'fair-banner': (ctx) => {
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(-203, -150, 6, 150);
    ctx.fillRect(197, -150, 6, 150);
    ctx.fillStyle = '#4361ee';
    roundRect(ctx, -200, -150, 400, 40, 8);
    ctx.fill();
    ctx.stroke();
    ['#ffd166', '#e63946', '#2bb3a3'].forEach((c, i) => blob(ctx, -120 + i * 120, -130, 8, c)); // Pictures, no words
  },
  'party-kites': (ctx, time) => {
    ['#ff7f6e', '#4aa3e8', '#ffd166'].forEach((c, i) => {
      const x = -160 + i * 160 + Math.sin(time + i) * 14;
      const y = -170 + Math.sin(time * 1.3 + i) * 10;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x, y + 24);
      ctx.lineTo(x - 14, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  },
  'marigold-arch': (ctx) => {
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#f4a024';
    ctx.beginPath();
    ctx.arc(0, -40, 80, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = OUTLINE;
    for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 8) blob(ctx, Math.cos(a) * 80, -40 + Math.sin(a) * 80, 7, '#ff8c42');
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(-84, -40, 8, 40);
    ctx.fillRect(76, -40, 8, 40);
  },
  candles: (ctx, time) => {
    for (const x of [-14, 0, 14]) {
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(x - 4, -24, 8, 22);
      ctx.strokeRect(x - 4, -24, 8, 22);
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(x, -30 + Math.sin(time * 9 + x) * 1, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  'marigold-petals': (ctx) => {
    ctx.fillStyle = '#f4a024';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.ellipse(((i * 37) % 160) - 80, -((i * 53) % 60), 4, 2, i, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  'sugar-skull-tiles': (ctx) => {
    for (let i = 0; i < 4; i++) {
      const x = -60 + i * 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 18, -36, 36, 36);
      ctx.strokeRect(x - 18, -36, 36, 36);
      blob(ctx, x, -18, 9, ['#ff6f91', '#4cc9f0', '#ffd166', '#8e6bd6'][i]); // A flower pattern
    }
  },
  'decorated-pine': (ctx, time) => {
    shadow(ctx, 0, 0, 30);
    for (const [w, top, bottom] of [[40, -80, -14], [32, -110, -50], [22, -134, -86]]) {
      ctx.fillStyle = '#2f6f57';
      ctx.beginPath();
      ctx.moveTo(-w, bottom);
      ctx.lineTo(0, top);
      ctx.lineTo(w, bottom);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ['#e63946', '#ffd166', '#4aa3e8', '#ffffff'].forEach((c, i) => blob(ctx, -20 + i * 13, -40 - (i % 2) * 34, 4, Math.sin(time * 3 + i) > 0 ? c : '#888'));
    blob(ctx, 0, -138, 7, '#ffd166');
  },
  'star-pinata': (ctx, time) => {
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(-3, -150, 6, 150);
    ctx.fillRect(-3, -150, 60, 5);
    ctx.save();
    ctx.translate(54, -100);
    ctx.rotate(Math.sin(time * 1.5) * 0.15);
    ctx.fillStyle = '#ff6f91';
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI / 2 + (i / 14) * Math.PI * 2;
      const r = i % 2 ? 10 : 26;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
  farolito: (ctx, time) => {
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-8, -22);
    ctx.lineTo(8, -22);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 180, 60, ${0.6 + Math.sin(time * 7) * 0.2})`;
    ctx.fillRect(-4, -14, 8, 8);
  },
  poinsettia: (ctx) => {
    shadow(ctx, 0, 0, 18);
    ctx.fillStyle = '#c8754a';
    ctx.fillRect(-12, -18, 24, 18);
    ctx.strokeRect(-12, -18, 24, 18);
    for (let i = 0; i < 6; i++) leaf(ctx, 0, -28, 18, 6, (i / 6) * Math.PI * 2, '#d62828');
    blob(ctx, 0, -28, 3, '#ffd166');
  },
  jacaranda: (ctx) => {
    shadow(ctx, 0, 0, 28);
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(-6, -30, 12, 30);
    ctx.strokeRect(-6, -30, 12, 30);
    for (const [x, y, r] of [[-16, -46, 20], [16, -46, 20], [0, -64, 24]]) blob(ctx, x, y, r, '#9d7ad8');
  },
  balloons: (ctx, time) => COAST_SHAPES['balloon-seller'](ctx, time),
  'model-volcano': (ctx, time) => {
    shadow(ctx, 0, 0, 40);
    ctx.fillStyle = '#8a6238';
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(-10, -50);
    ctx.lineTo(10, -50);
    ctx.lineTo(40, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const puff = (time * 0.7) % 1;
    ctx.fillStyle = `rgba(230, 230, 230, ${1 - puff})`;
    ctx.beginPath();
    ctx.arc(0, -56 - puff * 40, 8 + puff * 14, 0, Math.PI * 2);
    ctx.fill();
  },
  'project-stand': (ctx) => {
    shadow(ctx, 0, 0, 40);
    ctx.fillStyle = '#b5794a';
    ctx.fillRect(-40, -34, 80, 34);
    ctx.strokeRect(-40, -34, 80, 34);
    for (const [x, w] of [[-38, 22], [-16, 32], [16, 22]]) {
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(x, -84, w, 48);
      ctx.strokeRect(x, -84, w, 48);
    }
    blob(ctx, 0, -64, 8, '#4aa3e8');
  },
  kiosco: (ctx, time) => {
    // A Mexican-style bandstand: round floor, thin columns, a dome, string lights.
    shadow(ctx, 0, 0, 110);
    ctx.fillStyle = '#e9d8a6';
    ctx.beginPath();
    ctx.ellipse(0, -20, 110, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3d405b';
    for (const x of [-90, -45, 0, 45, 90]) ctx.fillRect(x - 3, -170, 6, 150);
    ctx.fillStyle = '#2a9d8f';
    ctx.beginPath();
    ctx.ellipse(0, -170, 120, 36, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(120, -170);
    ctx.ellipse(0, -170, 120, 14, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    blob(ctx, 0, -210, 10, '#ffd166');
    ['#e63946', '#ffd166', '#2bb3a3', '#8e6bd6'].forEach((c, i) => {
      for (let k = 0; k < 6; k++) {
        const x = -110 + k * 44 + i * 10;
        const on = Math.sin(time * 3 + k + i) > -0.3;
        ctx.fillStyle = on ? c : 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(x, -156 + Math.abs(x) * 0.08, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
  'market-stall': (ctx) => stall(ctx, ['#e63946', '#fff3d6'], ['#ff8c42', '#e63946', '#ffd166', '#6a994e', '#ff8c42']),
  'market-stall-toys': (ctx) => stall(ctx, ['#4361ee', '#fff3d6'], ['#8e6bd6', '#2bb3a3', '#ffd166', '#e63946', '#4aa3e8']),
  'market-stall-crafts': (ctx) => stall(ctx, ['#2a9d8f', '#fff3d6'], ['#1d4e89', '#e76f51', '#f4a024', '#9d4edd', '#1d4e89']),
  'paleta-cart': (ctx) => {
    shadow(ctx, 0, 0, 40);
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, -34, -50, 68, 40, 8);
    ctx.fill();
    ctx.stroke();
    blob(ctx, -20, -6, 8, '#3d405b');
    blob(ctx, 20, -6, 8, '#3d405b');
    ctx.fillStyle = '#8a6238';
    ctx.fillRect(-2, -100, 4, 50);
    ctx.fillStyle = '#ff8fab';
    ctx.beginPath();
    ctx.arc(0, -96, 30, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },
  'balloon-seller': (ctx, time) => {
    shadow(ctx, 0, 0, 16);
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(-3, -60, 6, 60);
    ['#e63946', '#ffd166', '#4aa3e8', '#8e6bd6', '#2bb3a3'].forEach((c, i) => {
      const x = -24 + i * 12 + Math.sin(time * 1.5 + i) * 3;
      const y = -96 - (i % 2) * 18;
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(x, y + 12);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(x, y, 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  },
  palm: (ctx, time, d) => palmShape(ctx, time, d, 140),
  'palm-short': (ctx, time, d) => palmShape(ctx, time, d, 70),
  banana: (ctx) => {
    shadow(ctx, 0, 0, 22);
    ctx.fillStyle = '#6aa84f';
    ctx.fillRect(-5, -40, 10, 40);
    ctx.strokeRect(-5, -40, 10, 40);
    for (const angle of [-2.7, -2.0, -1.2, -0.4]) leaf(ctx, 0, -40, 46, 12, angle, '#58b368');
    blob(ctx, 8, -30, 7, '#d4c24a');
  },
  monstera: (ctx) => {
    shadow(ctx, 0, 0, 26);
    for (const [x, angle] of [[-14, -2.4], [0, -1.6], [14, -0.8], [-6, -2.0], [8, -1.2]]) leaf(ctx, x, -4, 38, 15, angle, '#2e7d4f');
  },
  bromeliad: (ctx) => {
    ctx.fillStyle = '#4c9a52';
    for (const angle of [-2.6, -2.1, -1.6, -1.1, -0.6]) {
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    blob(ctx, 0, -6, 5, '#e63946');
  },
  hibiscus: (ctx) => {
    for (const [x, y, color] of [[-8, -4, '#ff6f91'], [6, -8, '#e63946'], [10, 2, '#ff8fab']]) {
      ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      blob(ctx, x, y, 1.8, '#ffd166');
    }
  },
  mangrove: (ctx) => {
    shadow(ctx, 0, 0, 40);
    ctx.strokeStyle = '#6b4a2b';
    ctx.lineWidth = 5;
    for (const x of [-34, -18, 0, 18, 34]) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x * 0.6, -30, 0, -46);
      ctx.stroke();
    }
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;
    for (const [x, y, r] of [[-26, -66, 24], [24, -66, 24], [0, -86, 28]]) blob(ctx, x, y, r, '#2f7a45');
  },
  shell: (ctx, time, d) => {
    ctx.fillStyle = ['#fff1e0', '#ffd6c9', '#f4e3b5'][Math.abs(Math.round(d.x)) % 3];
    ctx.beginPath();
    ctx.ellipse(0, -5, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-1, -5, 3, 0, Math.PI * 1.5);
    ctx.stroke();
  },
  starfish: (ctx) => {
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
      const r = i % 2 ? 4 : 9;
      ctx.lineTo(Math.cos(a) * r, -6 + Math.sin(a) * r * 0.7);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },
  sandcastle: (ctx) => {
    shadow(ctx, 0, 0, 26);
    ctx.fillStyle = '#e8c88a';
    roundRect(ctx, -24, -26, 48, 26, 3);
    ctx.fill();
    ctx.stroke();
    for (const x of [-22, 6]) {
      ctx.fillRect(x, -40, 16, 14);
      ctx.strokeRect(x, -40, 16, 14);
    }
    ctx.beginPath();
    ctx.moveTo(14, -40);
    ctx.lineTo(14, -54);
    ctx.stroke();
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(14, -54);
    ctx.lineTo(24, -50);
    ctx.lineTo(14, -46);
    ctx.closePath();
    ctx.fill();
  },
  'beach-umbrella': (ctx) => {
    ctx.fillStyle = '#ffd6c9';
    roundRect(ctx, -30, -8, 60, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#8a6238';
    ctx.fillRect(-2, -88, 4, 84);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#fff3d6' : '#ff7f6e';
      ctx.beginPath();
      ctx.moveTo(0, -96);
      ctx.arc(0, -86, 44, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  },
  towel: (ctx, time, d) => {
    const colors = [['#4ecdc4', '#ffffff'], ['#ff7f6e', '#ffd166'], ['#9b5de5', '#f4c430']][Math.abs(Math.round(d.y)) % 3];
    ctx.save();
    roundRect(ctx, -34, -14, 68, 28, 4);
    ctx.fillStyle = colors[0];
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = colors[1];
    for (let x = -30; x < 34; x += 14) ctx.fillRect(x, -14, 5, 28);
    ctx.restore();
    roundRect(ctx, -34, -14, 68, 28, 4);
    ctx.stroke();
  },
  canoe: (ctx, time) => {
    const bob = Math.sin(time * 2) * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 64, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9c6b3c';
    ctx.beginPath();
    ctx.moveTo(-60, -14 + bob);
    ctx.quadraticCurveTo(0, 8 + bob, 60, -14 + bob);
    ctx.quadraticCurveTo(0, -4 + bob, -60, -14 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-20, -18 + bob);
    ctx.lineTo(30, -2 + bob);
    ctx.stroke();
  },
  driftwood: (ctx) => {
    shadow(ctx, 0, 0, 28);
    ctx.fillStyle = '#cbb79a';
    roundRect(ctx, -30, -12, 60, 12, 6);
    ctx.fill();
    ctx.stroke();
  },
  'tide-pool': (ctx) => {
    ctx.fillStyle = '#9aa5ab';
    ctx.beginPath();
    ctx.ellipse(0, -10, 40, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5ec8d8';
    ctx.beginPath();
    ctx.ellipse(0, -10, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    blob(ctx, 8, -12, 4, '#ff8fab');
  },
  'stepping-stone': (ctx) => {
    ctx.fillStyle = '#a3a9a1';
    ctx.beginPath();
    ctx.ellipse(0, -8, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  },
  'glass-deck': (ctx, time) => {
    // A round glass floor over the reef, with fish swimming under it.
    ctx.fillStyle = '#b07a45';
    ctx.beginPath();
    ctx.ellipse(0, -90, 150, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -90, 136, 78, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5fd0e0';
    ctx.fill();
    ctx.clip();
    for (const [x, y, r, color] of [[-80, -50, 22, '#ff7f6e'], [70, -40, 26, '#f4a261'], [20, -140, 18, '#e76f91'], [-40, -120, 14, '#ffd166']]) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 4; i++) {
      const x = ((time * (20 + i * 6) + i * 90) % 320) - 160;
      const y = -120 + i * 22 + Math.sin(time * 2 + i) * 4;
      ctx.fillStyle = ['#ffd166', '#4361ee', '#ff9f1c', '#ffffff'][i];
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 5, 0, 0, Math.PI * 2);
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x - 15, y - 5);
      ctx.lineTo(x - 15, y + 5);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-50, -130, 40, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  'rock-cliff': (ctx) => {
    shadow(ctx, 0, 0, 70);
    ctx.fillStyle = '#7d8a80';
    roundRect(ctx, -75, -110, 150, 110, 30);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4f9a5a';
    roundRect(ctx, -70, -114, 140, 22, 11);
    ctx.fill();
    ctx.stroke();
  },
  waterfall: (ctx, time) => {
    ctx.fillStyle = '#7d8a80';
    roundRect(ctx, -130, -320, 260, 300, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4f9a5a';
    roundRect(ctx, -126, -326, 252, 30, 15);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    roundRect(ctx, -40, -300, 80, 290, 10);
    ctx.fillStyle = '#8fd8ec';
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    for (const x of [-28, -12, 6, 22]) {
      for (let y = -300 + ((time * 140 + x * 7) % 40); y < 0; y += 40) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 18);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [x, r] of [[-36, 14], [-14, 18], [10, 16], [32, 13]]) {
      ctx.beginPath();
      ctx.arc(x, -10 + Math.sin(time * 3 + x) * 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

const DECORATION_VARIANTS = { shell: ['cream', 'ochre', 'pink'], towel: ['coral', 'purple', 'teal'] };

// Decorations that animate: [frames, frames per second].
const DECORATION_LOOPS = {
  fountain: [3, 4], palm: [3, 3], 'palm-short': [3, 3], waterfall: [4, 8], canoe: [2, 2], 'glass-deck': [3, 4],
  // Gentle sways (docs/DESIGN_PROMPT_2.md, Part 4.2): frame 1 matches the still picture.
  tree: [3, 2], pine: [3, 2], acacia: [3, 2], bush: [3, 2], grass: [3, 3], flowers: [3, 3],
};

function drawDecoration(ctx, d, time) {
  const s = d.size ?? 1;
  const loop = DECORATION_LOOPS[d.type];
  // An animated frame if there is one, else the still picture, else shapes.
  // The waterfall's frames are with the water pictures.
  const folder = d.type === 'waterfall' ? 'world/water' : 'world/decorations';
  const frame = loop && !reducedMotion ? `${folder}/${d.type}-${frameAt(time, loop[1], loop[0])}.svg` : null;
  if (d.type === 'target' && d.hitUntil > time) {
    if (drawSprite(ctx, `world/decorations/target-hit-${frameAt(time, 8, 2)}.svg`, d.x, d.y, { scale: s })) return;
  } else if (frame && drawSprite(ctx, frame, d.x, d.y, { scale: s })) return;
  if (DECORATION_VARIANTS[d.type]) {
    // Shells and towels come in colors; pick one from the spot, so it never changes.
    const list = DECORATION_VARIANTS[d.type];
    if (drawSprite(ctx, `world/decorations/${d.type}-${list[Math.abs(Math.round(d.x + d.y)) % list.length]}.svg`, d.x, d.y, { scale: s })) return;
  }
  if (drawSprite(ctx, `${folder}/${d.type}${d.type === 'waterfall' ? '-1' : ''}.svg`, d.x, d.y, { scale: s })) return;
  if (COAST_SHAPES[d.type]) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(s, s);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = OUTLINE;
    COAST_SHAPES[d.type](ctx, reducedMotion ? 0 : time, d);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.scale(s, s);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  switch (d.type) {
    case 'tree':
      shadow(ctx, 0, 0, 26);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-6, -26, 12, 26);
      ctx.strokeRect(-6, -26, 12, 26);
      blob(ctx, -14, -40, 18, '#3f8f3a');
      blob(ctx, 14, -40, 18, '#3f8f3a');
      blob(ctx, 0, -56, 22, '#4fa845');
      break;
    case 'pine':
      shadow(ctx, 0, 0, 22);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-5, -16, 10, 16);
      for (const [w, top, bottom] of [[30, -62, -14], [24, -80, -38], [16, -96, -60]]) {
        ctx.fillStyle = '#2f6f57';
        ctx.beginPath();
        ctx.moveTo(-w, bottom);
        ctx.lineTo(0, top);
        ctx.lineTo(w, bottom);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-w * 0.35, top + (bottom - top) * 0.35);
        ctx.lineTo(0, top);
        ctx.lineTo(w * 0.35, top + (bottom - top) * 0.35);
        ctx.closePath();
        ctx.fill();
      }
      break;
    case 'acacia':
      shadow(ctx, 0, 0, 34);
      ctx.strokeStyle = '#6b4a2b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -30);
      ctx.lineTo(-14, -52);
      ctx.moveTo(0, -30);
      ctx.lineTo(14, -54);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = OUTLINE;
      ctx.fillStyle = '#7fa83c';
      ctx.beginPath();
      ctx.ellipse(0, -60, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'bush':
      shadow(ctx, 0, 0, 20);
      blob(ctx, -10, -10, 11, '#4c9a3f');
      blob(ctx, 10, -10, 11, '#4c9a3f');
      blob(ctx, 0, -18, 13, '#5bb24b');
      break;
    case 'rock':
      shadow(ctx, 0, 2, 22);
      ctx.fillStyle = '#9aa0a6';
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-16, -18);
      ctx.lineTo(2, -26);
      ctx.lineTo(20, -14);
      ctx.lineTo(22, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c2c7cc';
      ctx.beginPath();
      ctx.moveTo(-12, -16);
      ctx.lineTo(2, -22);
      ctx.lineTo(8, -14);
      ctx.closePath();
      ctx.fill();
      break;
    case 'iceberg':
      shadow(ctx, 0, 2, 32);
      ctx.fillStyle = '#bfe6f5';
      ctx.strokeStyle = '#4f8fb0';
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(-24, -34);
      ctx.lineTo(-6, -52);
      ctx.lineTo(12, -38);
      ctx.lineTo(28, -44);
      ctx.lineTo(34, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-20, -30);
      ctx.lineTo(-6, -46);
      ctx.lineTo(-2, -28);
      ctx.closePath();
      ctx.fill();
      break;
    case 'fountain':
      shadow(ctx, 0, 4, 50);
      ctx.fillStyle = '#9fb3c8';
      ctx.beginPath();
      ctx.ellipse(0, -6, 48, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#6fc3f0';
      ctx.beginPath();
      ctx.ellipse(0, -8, 38, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9fb3c8';
      ctx.fillRect(-6, -40, 12, 32);
      ctx.strokeRect(-6, -40, 12, 32);
      blob(ctx, 0, -44, 12, '#b9cadb');
      ctx.fillStyle = '#a9dcf5';
      ctx.beginPath();
      ctx.arc(0, -56, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'board':
      shadow(ctx, 0, 0, 30);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-26, -30, 6, 30);
      ctx.fillRect(20, -30, 6, 30);
      ctx.fillStyle = '#c8a165';
      ctx.fillRect(-34, -70, 68, 44);
      ctx.strokeRect(-34, -70, 68, 44);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-26, -64, 24, 16);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(4, -62, 22, 26);
      ctx.fillStyle = '#ff8fab';
      ctx.fillRect(-24, -44, 20, 12);
      break;
    case 'target':
      shadow(ctx, 0, 0, 26);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-3, -30, 6, 30);
      for (const [r, c] of [[24, '#e63946'], [17, '#ffffff'], [10, '#e63946'], [4, '#ffffff']]) blob(ctx, 0, -50, r, c);
      break;
    case 'bench':
      shadow(ctx, 0, 0, 40);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-34, -16, 6, 16);
      ctx.fillRect(28, -16, 6, 16);
      ctx.fillStyle = '#b5794a';
      ctx.fillRect(-40, -22, 80, 10);
      ctx.strokeRect(-40, -22, 80, 10);
      ctx.fillRect(-40, -44, 80, 10);
      ctx.strokeRect(-40, -44, 80, 10);
      break;
    case 'lamp':
      ctx.fillStyle = '#3d405b';
      ctx.fillRect(-3, -50, 6, 50);
      blob(ctx, 0, -56, 9, '#ffe08a');
      break;
    case 'grass':
      ctx.strokeStyle = '#b08d2f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (const dx of [-6, -2, 2, 6]) {
        ctx.moveTo(dx, 0);
        ctx.quadraticCurveTo(dx, -10, dx * 2, -16);
      }
      ctx.stroke();
      break;
    case 'flowers':
      for (const [dx, dy, c] of [[-8, -3, '#ff8fab'], [6, -6, '#ffd166'], [0, 4, '#ffffff']]) {
        ctx.lineWidth = 1.2;
        blob(ctx, dx, dy, 4, c);
      }
      break;
    case 'mushroom':
      ctx.fillStyle = '#fff4e6';
      ctx.fillRect(-3, -10, 6, 10);
      ctx.strokeRect(-3, -10, 6, 10);
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.ellipse(0, -10, 11, 8, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -14, 2, 0, Math.PI * 2);
      ctx.arc(4, -12, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'snowpile':
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#a9cde0';
      ctx.beginPath();
      ctx.ellipse(-6, -4, 14, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(8, -6, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    default:
      break;
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h); // Older browsers: square corners.
}

// The building pictures are 220 x 260 with a name plate drawn on the roof.
const BUILDING_PLATE_Y = 260 - 22; // From the ground point up to the plate's middle.

function drawStation(ctx, s, scene) {
  if (s.style === 'arcade') return drawArcade(ctx, s, scene);
  if (s.style === 'counter') return drawCounter(ctx, s, scene);
  const { width: W, height: H } = STATION_SIZE;
  const near = scene.nearStation?.id === s.id;
  const state = s.kind === 'soon' ? '-soon' : near ? '-highlight' : '';
  const folder = scene.buildingArt?.(s) ?? 'world/buildings';
  const style = scene.buildingStyle?.(s) ?? s.style; // The kid's house shows the style they chose.
  // In the evening, lit windows; otherwise a small loop (a flag, a blinking light) if drawn.
  if (!state && scene.evening && drawSprite(ctx, `${folder}/${style}-night.svg`, s.x, s.y + H / 2)) return;
  if (state === '-soon' && scene.evening && drawSprite(ctx, `${folder}/${style}-soon-night.svg`, s.x, s.y + H / 2)) return;
  if (!state && !reducedMotion && drawSprite(ctx, `${folder}/${style}-${frameAt(scene.time, 3, 3)}.svg`, s.x, s.y + H / 2)) return;
  if (drawSprite(ctx, `${folder}/${style}${state}.svg`, s.x, s.y + H / 2)) return;
  if (s.style === 'house' && scene.houseStyle && scene.houseStyle !== 'cabin') return drawHouseExterior(ctx, s, scene.houseStyle, state, scene);
  if (folder !== 'world/buildings' && drawSprite(ctx, `world/buildings/${s.style}${state}.svg`, s.x, s.y + H / 2)) return; // The first delivery's house
  const left = s.x - W / 2;
  const top = s.y - H / 2;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  shadow(ctx, s.x, s.y + H / 2, W * 0.6);

  const walls = {
    tower: '#f4f1de', cabin: '#b5794a', slide: '#d6eef8', shop: '#fff3d6', house: '#ffe8c2', boathouse: '#c99a5e', 'reef-hut': '#7fd1d1',
    'juice-bar': '#ffd6a5', stage: '#cdb4db', museum: '#f1faee',
  }[s.style];
  const roof = {
    tower: '#e07a5f', cabin: '#5b3a29', slide: '#7fb8d8', shop: '#e63946', house: '#457b9d', boathouse: '#d9b26a', 'reef-hut': '#2f8f9d',
    'juice-bar': '#ff9f1c', stage: '#8e6bd6', museum: '#adb5bd',
  }[s.style];
  if (s.style === 'boathouse') {
    // Short stilts under the floor
    ctx.fillStyle = '#6b4a2b';
    for (const x of [left + 12, left + W - 22]) {
      ctx.fillRect(x, top + H - 6, 10, 12);
      ctx.strokeRect(x, top + H - 6, 10, 12);
    }
  }

  // Style extras behind the walls
  if (s.style === 'tower') {
    ctx.fillStyle = walls;
    ctx.fillRect(s.x + 20, top - 90, 44, 100);
    ctx.strokeRect(s.x + 20, top - 90, 44, 100);
    ctx.fillStyle = '#3d405b';
    ctx.fillRect(s.x + 40, top - 130, 4, 40);
    blob(ctx, s.x + 42, top - 134, 6, '#e63946');
  } else if (s.style === 'slide') {
    ctx.fillStyle = '#a8daf0';
    ctx.beginPath();
    ctx.moveTo(left + W - 10, top - 40);
    ctx.quadraticCurveTo(left + W + 70, top + 10, left + W + 80, top + H);
    ctx.lineTo(left + W + 50, top + H);
    ctx.quadraticCurveTo(left + W + 40, top + 30, left + W - 10, top);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Walls
  ctx.fillStyle = walls;
  roundRect(ctx, left, top, W, H, 10);
  ctx.fill();
  ctx.stroke();
  if (s.style === 'cabin') {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    for (let y = top + 20; y < top + H; y += 20) {
      ctx.beginPath();
      ctx.moveTo(left + 4, y);
      ctx.lineTo(left + W - 4, y);
      ctx.stroke();
    }
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
  }
  if (s.style === 'slide') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let x = left + 34; x < left + W; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, top + 4);
      ctx.lineTo(x, top + H - 4);
      ctx.stroke();
    }
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
  }

  // Roof
  ctx.fillStyle = roof;
  if (s.style === 'shop') {
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff' : roof;
      ctx.beginPath();
      ctx.moveTo(left - 10 + (i * (W + 20)) / 6, top + 4);
      ctx.lineTo(left - 10 + ((i + 1) * (W + 20)) / 6, top + 4);
      ctx.lineTo(left - 10 + ((i + 1) * (W + 20)) / 6, top + 30);
      ctx.arc(left - 10 + ((i + 0.5) * (W + 20)) / 6, top + 30, (W + 20) / 12, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(left - 14, top + 6);
    ctx.lineTo(s.x, top - 50);
    ctx.lineTo(left + W + 14, top + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Emblem
  ctx.lineWidth = 2;
  if (s.style === 'tower') {
    ctx.fillStyle = '#c98a3d';
    ctx.fillRect(left + 22, top + 30, 26, 22);
    ctx.strokeRect(left + 22, top + 30, 26, 22);
  } else if (s.style === 'cabin') {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(left + 20, top + 50);
    ctx.lineTo(left + 54, top + 50);
    ctx.lineTo(left + 37, top + 38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(left + 14, top + 50, 46, 5);
    ctx.strokeRect(left + 14, top + 50, 46, 5);
  } else if (s.style === 'house') {
    for (const wx of [left + 22, left + W - 52]) {
      ctx.fillStyle = '#a9dcf5';
      ctx.fillRect(wx, top + 30, 30, 26);
      ctx.strokeRect(wx, top + 30, 30, 26);
      ctx.beginPath();
      ctx.moveTo(wx + 15, top + 30);
      ctx.lineTo(wx + 15, top + 56);
      ctx.moveTo(wx, top + 43);
      ctx.lineTo(wx + 30, top + 43);
      ctx.stroke();
    }
  } else if (s.style === 'boathouse') {
    // Thatch lines on the roof and an anchor-like emblem
    ctx.strokeStyle = '#a8853f';
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(s.x, top - 50);
      ctx.lineTo(left - 14 + (i * (W + 28)) / 6, top + 6);
      ctx.stroke();
    }
    ctx.strokeStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(left + 34, top + 50, 10, 0.2, Math.PI - 0.2);
    ctx.moveTo(left + 34, top + 34);
    ctx.lineTo(left + 34, top + 60);
    ctx.stroke();
  } else if (s.style === 'juice-bar') {
    blob(ctx, s.x, top - 60, 18, '#ff9f1c'); // A giant orange on the roof
    ctx.fillStyle = '#6a994e';
    ctx.fillRect(s.x - 2, top - 84, 4, 8);
  } else if (s.style === 'stage') {
    ['#e63946', '#ffd166', '#2bb3a3', '#4aa3e8'].forEach((c, i) => blob(ctx, left + 20 + i * 42, top + 14, 4, c));
  } else if (s.style === 'museum') {
    ctx.fillStyle = '#ffffff';
    for (const x of [left + 16, left + 46, left + W - 56, left + W - 26]) {
      ctx.fillRect(x, top + 14, 10, H - 20);
      ctx.strokeRect(x, top + 14, 10, H - 20);
    }
  } else if (s.style === 'reef-hut') {
    blob(ctx, left + 34, top + 46, 14, '#bdeff5');
    ctx.beginPath();
    ctx.arc(left + 34, top + 46, 9, 0, Math.PI * 2);
    ctx.stroke();
  } else if (s.style === 'shop') {
    blob(ctx, left + 34, top + 60, 13, '#ffd166');
    ctx.fillStyle = OUTLINE;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', left + 34, top + 61);
  }

  // Door
  ctx.lineWidth = 3;
  ctx.fillStyle = s.kind === 'soon' ? '#8d99ae' : '#5b3a29';
  roundRect(ctx, s.x - 20, top + H - 52, 40, 52, [16, 16, 0, 0]);
  ctx.fill();
  ctx.stroke();
  if (s.kind === 'soon') {
    ctx.strokeStyle = '#c8a165';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(s.x - 24, top + H - 44);
    ctx.lineTo(s.x + 24, top + H - 12);
    ctx.moveTo(s.x + 24, top + H - 44);
    ctx.lineTo(s.x - 24, top + H - 12);
    ctx.stroke();
  }
  if (near && s.kind !== 'soon') {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    roundRect(ctx, s.x - 25, top + H - 57, 50, 57, [20, 20, 0, 0]);
    ctx.stroke();
  }
  ctx.restore();
}

// A square sample of a wallpaper or floor for the catalog (`id` null: the
// house style's own wall or floor).
export function drawDecorSwatch(ctx, kind, id, styleId, size) {
  const style = HOUSE_STYLES[styleId] ?? HOUSE_STYLES.cabin;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.clip();
  if (kind === 'wallpaper') {
    if (!id || !drawSpriteBox(ctx, `world/walls/wallpaper-${id}.svg`, 0, 0, size * 4, size)) {
      ctx.fillStyle = style.wall;
      ctx.fillRect(0, 0, size, size);
      if (id) wallpaperPattern(ctx, id, size, size);
    }
  } else {
    const art = id && spritePattern(ctx, `world/textures/floor-${id}.svg`);
    ctx.fillStyle = art || style.floor;
    ctx.fillRect(0, 0, size, size);
    if (id && !art) floorPattern(ctx, id, size, 0, size);
  }
  ctx.restore();
}

// A small picture of a house style for the catalog: its card picture
// (houses/<style>-card.svg), else its outside drawn small.
export function drawHousePreview(ctx, style, width, height) {
  if (drawSpriteBox(ctx, `houses/${style}-card.svg`, 0, 0, width, height)) return;
  ctx.fillStyle = '#cfe8c9';
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height - 8);
  ctx.scale(0.42, 0.42);
  const s = { x: 0, y: -STATION_SIZE.height / 2, style: 'house', kind: 'room' };
  if (style === 'cabin') {
    if (!drawSprite(ctx, 'world/buildings/house.svg', 0, 0)) drawHouseExterior(ctx, s, 'adobe', '', {});
  } else {
    drawHouseExterior(ctx, s, style, '', {});
  }
  ctx.restore();
}

// The kid's house in the style they bought, as shapes until the pictures
// (houses/<style>-exterior.svg) arrive.
const EXTERIOR = {
  adobe: { walls: '#e3a76f', roof: '#b8763f', door: '#457b9d' },
  icecabin: { walls: '#d6eef8', roof: '#7fb8d8', door: '#8a6238' },
  bungalow: { walls: '#e9d8a6', roof: '#c9a65a', door: '#2a9d8f' },
  treehouse: { walls: '#b5794a', roof: '#3f8f3a', door: '#5b3a29' },
  hacienda: { walls: '#fff3e0', roof: '#c8553d', door: '#1d4e89' },
  'mushroom-house': { walls: '#fff1e0', roof: '#e63946', door: '#8a6238' },
  observatory: { walls: '#f1faee', roof: '#c0c7cf', door: '#457b9d' },
};
function drawHouseExterior(ctx, s, style, state, scene) {
  const look = EXTERIOR[style] ?? EXTERIOR.adobe;
  const { width: W, height: H } = STATION_SIZE;
  const left = s.x - W / 2;
  const top = s.y - H / 2;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  shadow(ctx, s.x, s.y + H / 2, W * 0.6);
  const lift = style === 'treehouse' ? 70 : style === 'bungalow' ? 24 : 0; // Up in a tree, on stilts
  if (style === 'treehouse') {
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(s.x - 18, top + H - 80, 36, 80);
    ctx.strokeRect(s.x - 18, top + H - 80, 36, 80);
    blob(ctx, s.x - 70, top - 70, 40, '#3f8f3a');
    blob(ctx, s.x + 70, top - 70, 40, '#3f8f3a');
  }
  if (style === 'bungalow') {
    ctx.fillStyle = '#6b4a2b';
    for (const x of [left + 14, left + W - 24]) ctx.fillRect(x, top + H - lift, 10, lift);
  }
  const wallTop = top - lift;
  const wallH = H - (style === 'treehouse' ? 40 : 0);
  ctx.fillStyle = look.walls;
  roundRect(ctx, left + (style === 'treehouse' ? 20 : 0), wallTop, W - (style === 'treehouse' ? 40 : 0), wallH - 10, style === 'mushroom-house' ? 40 : 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = look.roof;
  ctx.beginPath();
  if (style === 'mushroom-house') {
    ctx.ellipse(s.x, wallTop + 4, W / 2 + 24, 60, 0, Math.PI, Math.PI * 2);
  } else if (style === 'observatory') {
    ctx.arc(s.x, wallTop + 4, W / 2 - 10, Math.PI, Math.PI * 2);
  } else if (style === 'adobe') {
    ctx.rect(left - 8, wallTop - 14, W + 16, 18);
  } else {
    ctx.moveTo(left - 14, wallTop + 6);
    ctx.lineTo(s.x, wallTop - 50);
    ctx.lineTo(left + W + 14, wallTop + 6);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (style === 'mushroom-house') for (const [dx, dy] of [[-40, -30], [10, -44], [50, -24]]) blob(ctx, s.x + dx, wallTop + dy, 9, '#ffffff');
  if (style === 'observatory') {
    ctx.fillStyle = '#1d2340';
    ctx.fillRect(s.x - 8, wallTop - 70, 16, 60); // The slot in the dome
  }
  if (style === 'hacienda') {
    ctx.strokeStyle = '#1d4e89';
    for (const x of [left + 20, left + W - 50]) {
      ctx.beginPath();
      ctx.arc(x + 15, wallTop + 40, 15, Math.PI, Math.PI * 2);
      ctx.lineTo(x + 30, wallTop + 70);
      ctx.lineTo(x, wallTop + 70);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.strokeStyle = OUTLINE;
  }
  if (style === 'icecabin') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let y = wallTop + 24; y < wallTop + wallH - 10; y += 24) {
      ctx.beginPath();
      ctx.moveTo(left + 4, y);
      ctx.lineTo(left + W - 4, y);
      ctx.stroke();
    }
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
  }
  // Door, with the usual highlight and the evening glow
  ctx.fillStyle = look.door;
  roundRect(ctx, s.x - 20, wallTop + wallH - 62, 40, 52, [16, 16, 0, 0]);
  ctx.fill();
  ctx.stroke();
  if (state === '-highlight') {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    roundRect(ctx, s.x - 25, wallTop + wallH - 67, 50, 57, [20, 20, 0, 0]);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNamePlate(ctx, s, scene) {
  const done = scene.isDone(s);
  const starCount = scene.stars?.(s) ?? (done ? 1 : 0);
  const label = scene.pick(s.name);
  const ground = s.art ? s.y : s.y + stationSize(s).height / 2;
  // Buildings with pictures have their own plate on the roof: write on it.
  const roofPlate = s.art ? s.art.asset.startsWith('world/buildings/') : s.style !== 'arcade' && s.style !== 'counter' && spriteReady(`world/buildings/${s.style}.svg`);
  if (roofPlate) {
    const k = s.art?.scale ?? 1;
    const y = ground - BUILDING_PLATE_Y * k;
    ctx.save();
    ctx.translate(s.x, y);
    ctx.scale(k, k);
    ctx.translate(-s.x, -y);
    ctx.font = `800 15px ${FONT}`;
    const w = Math.max(91, ctx.measureText(label).width + 26);
    ctx.fillStyle = '#fff7df';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
    roundRect(ctx, s.x - w / 2, y - 12.5, w, 25, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = OUTLINE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, s.x, y + 1);
    for (let i = 0; i < starCount; i++) drawSprite(ctx, 'world/buildings/completed.svg', s.x + w / 2 + 2 + i * 26, y + 14);
    if (s.kind === 'soon') {
      ctx.font = `800 13px ${FONT}`;
      ctx.fillStyle = '#88431c';
      ctx.fillText(scene.t('world.soonTag'), s.x, y - 24);
    }
    ctx.restore();
    return;
  }
  const above = { tower: 150, arcade: 118, counter: 70 }[s.style] ?? 82;
  // Over a layered room's picture: just above its top.
  const top = s.art ? Math.max(s.art.bounds[1] - 18, 46) : s.y - stationSize(s).height / 2 - above;
  ctx.font = `bold 16px ${FONT}`;
  const text = `${label}${starCount ? `  ${'★'.repeat(starCount)}` : ''}`;
  const w = ctx.measureText(text).width + 24;
  ctx.fillStyle = s.kind === 'soon' ? 'rgba(255,255,255,0.75)' : '#ffffff';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  roundRect(ctx, s.x - w / 2, top - 15, w, 30, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = done ? '#b7791f' : OUTLINE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, s.x, top + 1);
  if (s.kind === 'soon') {
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillStyle = '#b45309';
    ctx.fillText(scene.t('world.soonTag'), s.x, top - 26);
  }
}

function drawTarget(ctx, target, time) {
  if (drawSprite(ctx, `world/effects/target-ring-${frameAt(time, 6, 3)}.svg`, target.x, target.y + 8, { scale: 0.6 })) return;
  const pulse = 1 + Math.sin(time * 8) * 0.15;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(target.x, target.y, 14 * pulse, 6 * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// Where the window hangs: the layout's spot, or near the right end of the wall.
const windowSpot = (world) => (world.layout?.window ? [world.layout.window.x, world.layout.window.y] : [world.width - 220, Math.min(160, world.minY - 60)]);

// The inside of the kid's house: back wall with a window, wooden floor.
function drawHouseRoom(ctx, world, styleId, decor = {}) {
  const style = HOUSE_STYLES[styleId] ?? HOUSE_STYLES.cabin;
  const wallBottom = world.minY - 30;
  if (decor.wallpaper || decor.floor) {
    // Bought wallpaper or floor: the picture if there is one, else a pattern;
    // the part not changed keeps the house style.
    drawHouseRoom(ctx, world, styleId);
    const floorArt = decor.floor && spritePattern(ctx, `world/textures/floor-${decor.floor}.svg`);
    if (floorArt) {
      ctx.fillStyle = floorArt;
      ctx.fillRect(0, wallBottom, world.width, world.height - wallBottom);
    } else if (decor.floor) floorPattern(ctx, decor.floor, world.width, wallBottom, world.height - wallBottom);
    if (decor.wallpaper && !drawSpriteBox(ctx, `world/walls/wallpaper-${decor.wallpaper}.svg`, 0, wallBottom - 220, world.width, 220)) {
      wallpaperPattern(ctx, decor.wallpaper, world.width, wallBottom);
    }
    ctx.fillStyle = style.trim;
    ctx.fillRect(0, wallBottom - 8, world.width, 16);
    if (!drawSprite(ctx, `world/walls/${styleId}-window.svg`, ...windowSpot(world))) drawWindow(ctx, world);
    return;
  }
  const floor = spritePattern(ctx, `world/textures/indoor-${styleId}.svg`);
  if (floor && drawSpriteBox(ctx, `world/walls/${styleId}-wall.svg`, 0, wallBottom - 220, world.width, 220)) {
    ctx.fillStyle = floor;
    ctx.fillRect(0, wallBottom, world.width, world.height - wallBottom);
    if (wallBottom > 220) {
      ctx.fillStyle = style.wall;
      ctx.fillRect(0, 0, world.width, wallBottom - 220);
    }
    drawSprite(ctx, `world/walls/${styleId}-window.svg`, ...windowSpot(world));
    return;
  }
  ctx.fillStyle = style.floor;
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.strokeStyle = style.boards;
  ctx.lineWidth = 3;
  for (let y = wallBottom + 50; y < world.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
  ctx.fillStyle = style.wall;
  ctx.fillRect(0, 0, world.width, wallBottom);
  if (styleId === 'icecabin') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    for (let y = 50; y < wallBottom; y += 50) {
      for (let x = (y / 50) % 2 ? 0 : 50; x < world.width; x += 100) ctx.strokeRect(x, y - 50, 100, 50);
    }
  } else if (styleId === 'cabin') {
    ctx.strokeStyle = style.trim;
    ctx.lineWidth = 3;
    for (let y = 40; y < wallBottom; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(world.width, y);
      ctx.stroke();
    }
  }
  ctx.fillStyle = style.trim;
  ctx.fillRect(0, wallBottom - 8, world.width, 16);
  drawWindow(ctx, world);
}

function drawWindow(ctx, world) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4;
  ctx.fillStyle = '#a9dcf5';
  ctx.fillRect(world.width - 300, 50, 160, 110);
  ctx.strokeRect(world.width - 300, 50, 160, 110);
  ctx.beginPath();
  ctx.moveTo(world.width - 220, 50);
  ctx.lineTo(world.width - 220, 160);
  ctx.moveTo(world.width - 300, 105);
  ctx.lineTo(world.width - 140, 105);
  ctx.stroke();
}

// An exit: a soft glowing patch at the edge, an arrow and a sign with the
// name of the room it leads to.
function drawExit(ctx, world, exit, scene) {
  const cx = exit.x + exit.width / 2;
  const cy = exit.y + exit.height / 2;
  const toLeft = exit.x <= 0;
  const toRight = exit.x + exit.width >= world.width;
  const toTop = exit.y <= 0;
  const angle = toLeft ? Math.PI : toRight ? 0 : toTop ? -Math.PI / 2 : Math.PI / 2;
  const pulse = reducedMotion ? 0.25 : 0.25 + Math.sin(scene.time * 3) * 0.1;
  ctx.fillStyle = `rgba(255, 238, 170, ${pulse})`;
  ctx.fillRect(exit.x, exit.y, exit.width, exit.height);

  // Arrow, a little inside the room so it is fully visible
  const inset = 70;
  const ax = toLeft ? inset : toRight ? world.width - inset : cx;
  const ay = toTop ? inset : (!toLeft && !toRight) ? world.height - inset : cy;
  // Side exits use the sign picture: an arrow pointing right over a blank
  // plate for the room name (mirrored for the left side).
  if ((toLeft || toRight) && drawSprite(ctx, 'world/effects/exit-arrow.svg', ax, ay + 24, { scale: 0.8, flip: toLeft })) {
    drawExitLabel(ctx, world, scene.exitLabel(exit), ax, ay + 13);
    return;
  }
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(angle);
  ctx.fillStyle = '#fff7df';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -16);
  ctx.lineTo(16, 0);
  ctx.lineTo(-14, 16);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawExitLabel(ctx, world, scene.exitLabel(exit), ax, toTop ? ay + 34 : ay - 34);
}

function drawExitLabel(ctx, world, label, ax, ly) {
  ctx.font = `800 14px ${FONT}`;
  const w = ctx.measureText(label).width + 18;
  const lx = Math.min(Math.max(ax, w / 2 + 6), world.width - w / 2 - 6);
  ctx.fillStyle = '#fff7df';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(lx - w / 2, ly - 12, w, 24, 12);
  else ctx.rect(lx - w / 2, ly - 12, w, 24);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OUTLINE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, lx, ly + 1);
}

// A speech bubble above the avatar: a phrase or an emote.
function drawBubble(ctx, x, y, bubble) {
  ctx.font = `700 16px ${FONT}`;
  const w = bubble.emote ? 54 : Math.min(ctx.measureText(bubble.text).width + 26, 320);
  const h = bubble.emote ? 50 : 34;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h, w, h, 16);
  else ctx.rect(x - w / 2, y - h, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 1);
  ctx.lineTo(x, y + 10);
  ctx.lineTo(x + 8, y - 1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x, y + 10);
  ctx.lineTo(x + 8, y);
  ctx.stroke();
  if (bubble.emote) {
    drawEmote(ctx, bubble.emote, x, y - h / 2, 34);
  } else {
    ctx.fillStyle = OUTLINE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bubble.text, x, y - h / 2 + 1, w - 16);
  }
}

function drawNoSign(ctx, x, y) {
  if (drawSprite(ctx, 'furniture/cant-place.svg', x, y + 30, { scale: 0.6 })) return;
  ctx.strokeStyle = '#e63946';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.moveTo(x - 11, y - 11);
  ctx.lineTo(x + 11, y + 11);
  ctx.stroke();
}

export const EMOTE_IDS = ['happy', 'laugh', 'heart', 'star', 'idea', 'question', 'coin', 'wave'];

// Emotes drawn in code, centered on (x, y), about `size` pixels across.
// Also used to draw the emote menu buttons.
export function drawEmote(ctx, id, x, y, size = 32) {
  // The emote pictures are 34 x 34 with the ground point at the bottom middle.
  if (drawSprite(ctx, `avatar/emotes/${id}.svg`, x, y + size / 2, { scale: size / 34 })) return;
  const s = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  const face = () => blob(ctx, 0, 0, 14, '#ffd166');
  switch (id) {
    case 'happy':
      face();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(-5, -3, 2, 0, Math.PI * 2);
      ctx.arc(5, -3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 2, 7, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    case 'laugh':
      face();
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-3, -2);
      ctx.moveTo(8, -4);
      ctx.lineTo(3, -2);
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(0, 3, 7, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      break;
    case 'heart':
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-18, 0, -12, -16, 0, -6);
      ctx.bezierCurveTo(12, -16, 18, 0, 0, 12);
      ctx.fill();
      ctx.stroke();
      break;
    case 'star':
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 6 : 14;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'idea':
      blob(ctx, 0, -3, 10, '#fff3a3');
      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(-5, 7, 10, 6);
      ctx.strokeRect(-5, 7, 10, 6);
      ctx.beginPath();
      for (const a of [-2.4, -1.57, -0.7]) {
        ctx.moveTo(Math.cos(a) * 13, -3 + Math.sin(a) * 13);
        ctx.lineTo(Math.cos(a) * 17, -3 + Math.sin(a) * 17);
      }
      ctx.stroke();
      break;
    case 'question':
      blob(ctx, 0, 0, 14, '#4aa3e8');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 1);
      break;
    case 'coin':
      blob(ctx, 0, 0, 13, '#ffd166');
      ctx.strokeStyle = '#b7791f';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'wave':
      ctx.fillStyle = '#ffd6a5';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-8, -6, 16, 18, 6);
      else ctx.rect(-8, -6, 16, 18);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-8 + i * 4.3, -16, 4, 12, 2);
        else ctx.rect(-8 + i * 4.3, -16, 4, 12);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-14, -12);
      ctx.lineTo(-18, -16);
      ctx.moveTo(14, -12);
      ctx.lineTo(18, -16);
      ctx.stroke();
      break;
    default:
      break;
  }
  ctx.restore();
}

// A minigame arcade machine (inside buildings).
function drawArcade(ctx, s, scene) {
  const x = s.x;
  const bottom = s.y + 35;
  const near = scene.nearStation?.id === s.id;
  const screen = near ? 'highlight' : reducedMotion ? null : frameAt(scene.time, 3, 3);
  // Each game's own screen picture.
  if (drawSprite(ctx, `world/stations/arcade-${s.lesson}${screen ? `-${screen}` : ''}.svg`, x, bottom)) return;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  shadow(ctx, x, bottom, 60);
  ctx.fillStyle = '#457b9d';
  ctx.beginPath();
  ctx.moveTo(x - 48, bottom);
  ctx.lineTo(x - 48, bottom - 120);
  ctx.lineTo(x - 36, bottom - 150);
  ctx.lineTo(x + 36, bottom - 150);
  ctx.lineTo(x + 48, bottom - 120);
  ctx.lineTo(x + 48, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Glowing screen
  const glow = 0.75 + Math.sin(scene.time * 4) * 0.25;
  ctx.fillStyle = `rgba(111, 195, 240, ${glow})`;
  ctx.fillRect(x - 34, bottom - 132, 68, 50);
  ctx.strokeRect(x - 34, bottom - 132, 68, 50);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(x, bottom - 107, 10, 0, Math.PI * 2);
  ctx.fill();
  // Buttons and joystick
  ctx.fillStyle = '#2b2d42';
  ctx.fillRect(x - 44, bottom - 72, 88, 16);
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(x + 14, bottom - 64, 5, 0, Math.PI * 2);
  ctx.arc(x + 28, bottom - 64, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f1faee';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 22, bottom - 64);
  ctx.lineTo(x - 18, bottom - 78);
  ctx.stroke();
  if (scene.nearStation?.id === s.id) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 54, bottom - 156, 108, 160);
  }
  ctx.restore();
}

// The shop counter (inside the shop).
function drawCounter(ctx, s, scene) {
  const { width } = stationSize(s);
  const bottom = s.y + 30;
  const near = scene.nearStation?.id === s.id;
  if (drawSprite(ctx, `world/stations/counter${near ? '-highlight' : ''}.svg`, s.x, bottom)) return;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  shadow(ctx, s.x, bottom, width * 0.55);
  ctx.fillStyle = '#b5794a';
  ctx.fillRect(s.x - width / 2, bottom - 70, width, 70);
  ctx.strokeRect(s.x - width / 2, bottom - 70, width, 70);
  ctx.fillStyle = '#e07a5f';
  ctx.fillRect(s.x - width / 2 - 8, bottom - 82, width + 16, 14);
  ctx.strokeRect(s.x - width / 2 - 8, bottom - 82, width + 16, 14);
  // A cash box and a coin
  ctx.fillStyle = '#3d405b';
  ctx.fillRect(s.x + 50, bottom - 108, 50, 26);
  ctx.strokeRect(s.x + 50, bottom - 108, 50, 26);
  blob(ctx, s.x - 60, bottom - 92, 10, '#ffd166');
  if (scene.nearStation?.id === s.id) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    ctx.strokeRect(s.x - width / 2 - 12, bottom - 88, width + 24, 92);
  }
  ctx.restore();
}

// A hidden gem: a small sparkling crystal.
function drawGem(ctx, gem, time) {
  if (drawSprite(ctx, `world/effects/gem-${frameAt(time + gem.x, 4, 3)}.svg`, gem.x, gem.y)) return;
  const bob = Math.sin(time * 3 + gem.x) * 3;
  const y = gem.y - 14 + bob;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(gem.x, gem.y, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b388ff';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gem.x, y - 12);
  ctx.lineTo(gem.x + 9, y - 3);
  ctx.lineTo(gem.x, y + 9);
  ctx.lineTo(gem.x - 9, y - 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.moveTo(gem.x - 3, y - 7);
  ctx.lineTo(gem.x, y - 10);
  ctx.lineTo(gem.x + 1, y - 3);
  ctx.closePath();
  ctx.fill();
  const sparkle = (Math.sin(time * 5 + gem.y) + 1) / 2;
  ctx.strokeStyle = `rgba(255,255,255,${sparkle})`;
  ctx.beginPath();
  ctx.moveTo(gem.x + 12, y - 14);
  ctx.lineTo(gem.x + 12, y - 6);
  ctx.moveTo(gem.x + 8, y - 10);
  ctx.lineTo(gem.x + 16, y - 10);
  ctx.stroke();
  ctx.restore();
}

