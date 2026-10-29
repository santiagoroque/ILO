// The world map: an illustrated overview of every room. Click a room to go
// there. Room positions come from world/world.json (mapX, mapY on an
// 800 x 500 picture). The picture is assets/map/world-map.svg, with a
// landmark drawn at each room's spot; shapes are drawn while it loads.
import { drawSprite, drawSpriteBox, hasArt, paintCanvas } from './sprites.js';

const OUTLINE = '#2b2d42';
const FONT = "'Nunito', system-ui, sans-serif";
const AREA_COLORS = {
  forest: '#64a84a', savannah: '#e6c66e', arctic: '#eef6fb', plaza: '#dccdb0', indoor: '#ffe8c2', sand: '#f3dfae', jungle: '#3f9a5a',
};
// Rooms drawn on today's map picture. Newer rooms (the Coast, the Market
// street) get a round marker on top until the new map arrives
// (docs/DESIGN_PROMPT_2.md, Part 11).
const ON_PICTURE = ['plaza', 'forest-trail', 'lever-glade', 'mushroom-hollow', 'savannah-trail', 'drone-post', 'waterhole',
  'snowy-ridge', 'ice-slide', 'frozen-lake', 'house'];
const NODE_RADIUS = 26;
// The new map with every area (docs/DESIGN_PROMPT_3.md) is 1000 x 625 and uses
// each room's "map2" spot. Without it, the old 800 x 500 picture (or the
// shapes) and "mapX", "mapY" are used.
const NEW_MAP = 'map/world-map-v3.svg';
// The minigame machines, as small markers over the room whose building holds
// them (map/machine-<lesson>.svg). Clicking one goes straight to the machine.
const MACHINE_ROOMS = { 'drone-post': 'drone-post-inside', 'ice-slide': 'ice-slide-inside', 'lever-glade': 'lever-workshop-inside' };
const MACHINE_SIZE = 28;
function machineMarkers(nodes, rooms) {
  const out = [];
  for (const node of nodes) {
    const inside = rooms[MACHINE_ROOMS[node.id]];
    if (!inside) continue;
    const lessons = inside.stations.filter((s) => s.kind === 'lesson');
    lessons.forEach((s, i) => out.push({
      room: inside.id, station: s, file: `map/machine-${s.lesson}.svg`,
      x: node.mapX + (i - (lessons.length - 1) / 2) * (MACHINE_SIZE + 4), y: node.mapY - NODE_RADIUS - 26,
    }));
  }
  return out;
}

function roomType(room) {
  return room.areas.find((a) => a.type === 'plaza') ? 'plaza' : room.areas[0].type;
}

function drawName(ctx, node, pick, r = NODE_RADIUS) {
  ctx.font = `800 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const label = pick(node.room.name);
  const w = ctx.measureText(label).width + 12;
  const top = Math.min(node.mapY + r + 4, ctx.canvas.height - 20); // Rooms at the bottom edge keep their name inside.
  ctx.fillStyle = 'rgba(255,247,223,0.95)';
  ctx.fillRect(node.mapX - w / 2, top, w, 18);
  ctx.fillStyle = OUTLINE;
  ctx.fillText(label, node.mapX, top + 2);
}

// On the picture: names under each landmark and a pin on the current room.
function drawLabels(ctx, nodes, { current, pick, all = false, machines = [] }) {
  const extra = (node) => !all && !ON_PICTURE.includes(node.id); // The new map draws every room.
  for (const node of nodes) if (extra(node)) drawMarker(ctx, node, false, SMALL_RADIUS);
  for (const node of nodes) drawName(ctx, node, pick, extra(node) ? SMALL_RADIUS : NODE_RADIUS);
  for (const m of machines) drawSprite(ctx, m.file, m.x, m.y);
  const here = nodes.find((n) => n.id === current);
  if (here && !(all && drawSprite(ctx, 'map/you-are-here-v3.svg', here.mapX, here.mapY - 14))) drawSprite(ctx, 'map/you-are-here.svg', here.mapX, here.mapY - 14);
}

const SMALL_RADIUS = 14; // Markers added on top of the picture.
function drawMarker(ctx, node, here, r = NODE_RADIUS) {
  ctx.fillStyle = AREA_COLORS[roomType(node.room)];
  ctx.strokeStyle = here ? '#e63946' : OUTLINE;
  ctx.lineWidth = here ? 6 : 3;
  ctx.beginPath();
  ctx.arc(node.mapX, node.mapY, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// Without the picture: the areas as soft islands, dotted roads and round
// room markers.
function drawShapes(ctx, nodes, { current, pick, t }) {
  ctx.fillStyle = '#5b9bd5';
  ctx.fillRect(0, 0, 800, 500);
  const blob = (x, y, rx, ry, color) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
  blob(190, 230, 190, 190, AREA_COLORS.forest);
  blob(620, 120, 200, 120, AREA_COLORS.arctic);
  blob(630, 390, 190, 110, AREA_COLORS.savannah);
  blob(310, 460, 230, 50, AREA_COLORS.sand);
  blob(400, 300, 90, 80, AREA_COLORS.plaza);

  ctx.strokeStyle = '#b8955a';
  ctx.lineWidth = 8;
  ctx.setLineDash([2, 12]);
  ctx.lineCap = 'round';
  for (const node of nodes) {
    for (const exit of node.room.exits) {
      const other = nodes.find((n) => n.id === exit.to);
      if (!other) continue;
      ctx.beginPath();
      ctx.moveTo(node.mapX, node.mapY);
      ctx.lineTo(other.mapX, other.mapY);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  for (const node of nodes) {
    const here = node.id === current;
    drawMarker(ctx, node, here);
    drawName(ctx, node, pick);
    if (here) {
      ctx.fillStyle = '#e63946';
      ctx.font = `800 12px ${FONT}`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(t('world.youAreHere'), node.mapX, node.mapY - NODE_RADIUS - 4);
    }
  }
}

export function openWorldMap(panel, { worldData, rooms, current, pick, t, onGo }) {
  panel.replaceChildren();
  const head = document.createElement('div');
  head.className = 'shop-head';
  const title = document.createElement('h2');
  title.textContent = t('world.mapTitle');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'button';
  close.textContent = t('shop.close');
  head.append(title, close);

  const v2 = hasArt(NEW_MAP);
  const W = v2 ? 1000 : 800;
  const H = v2 ? 625 : 500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.className = 'world-map';
  const nodes = worldData.rooms.filter((r) => r.mapX !== undefined) // Interiors are not on the map.
    .map((r) => ({ ...r, room: rooms[r.id], ...(v2 && r.map2 ? { mapX: r.map2[0], mapY: r.map2[1] } : {}) }));
  const machines = v2 ? machineMarkers(nodes, rooms) : [];
  // The same places as buttons, for keyboards and screen readers (Phase 10):
  // every room on the map, then every minigame machine.
  const listTitle = document.createElement('h3');
  listTitle.className = 'place-list-title';
  listTitle.textContent = t('world.places');
  const list = document.createElement('div');
  list.className = 'place-list';
  const place = (label, go) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'button small';
    b.textContent = label;
    b.addEventListener('click', () => {
      closeMap();
      go();
    });
    list.append(b);
  };
  for (const node of nodes) if (node.id !== current) place(pick(node.room.name), () => onGo(node.id));
  for (const room of Object.values(rooms)) {
    for (const s of room.stations) if (s.kind === 'lesson') place(`${pick(s.name)} (${pick(room.name)})`, () => onGo(room.id, s.id));
  }
  panel.append(head, canvas, listTitle, list);
  paintCanvas(canvas, (ctx) => {
    if (v2 && drawSpriteBox(ctx, NEW_MAP, 0, 0, W, H)) drawLabels(ctx, nodes, { current, pick, all: true, machines });
    else if (drawSpriteBox(ctx, 'map/world-map.svg', 0, 0, 800, 500)) drawLabels(ctx, nodes, { current, pick });
    else drawShapes(ctx, nodes, { current, pick, t });
  });

  // The canvas is scaled by CSS, so convert the click back to map pixels.
  const toMap = (event) => {
    const box = canvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * W, y: ((event.clientY - box.top) / box.height) * H };
  };
  const machineAt = (event) => {
    const p = toMap(event);
    return machines.find((m) => Math.abs(p.x - m.x) < MACHINE_SIZE / 2 + 2 && Math.abs(p.y - m.y) < MACHINE_SIZE / 2 + 2);
  };
  const nodeAt = (event) => {
    const p = toMap(event);
    return nodes.find((n) => Math.hypot(p.x - n.mapX, p.y - n.mapY) < NODE_RADIUS + 8);
  };
  canvas.addEventListener('mousemove', (event) => {
    canvas.style.cursor = machineAt(event) || nodeAt(event) ? 'pointer' : 'default';
  });
  canvas.addEventListener('click', (event) => {
    const machine = machineAt(event);
    const node = machine ? null : nodeAt(event);
    if (!machine && !node) return;
    closeMap();
    if (machine) onGo(machine.room, machine.station.id);
    else if (node.id !== current) onGo(node.id);
  });

  function closeMap() {
    panel.hidden = true;
    document.removeEventListener('keydown', onKey);
  }
  function onKey(event) {
    if (event.key === 'Escape') closeMap();
  }
  close.addEventListener('click', closeMap);
  document.addEventListener('keydown', onKey);
  panel.hidden = false;
  close.focus();
}
