// Which pictures a room needs, so the world page turns into pixels only the
// room Ilo is in and the rooms next to it (old school computers have little
// memory). No drawing code here, so the tests can run it.

// Every picture a room file draws (its layout, doors and furniture).
export function roomFiles(room) {
  const files = [];
  const layout = room.layout ?? {};
  if (layout.ground) files.push(layout.ground);
  if (layout.foreground) files.push(layout.foreground);
  for (const o of layout.objects ?? []) files.push(o.asset, ...(o.animation ?? []));
  for (const s of room.stations ?? []) {
    const art = s.art;
    if (!art) continue;
    files.push(art.asset, ...Object.values(art.states ?? {}), ...(art.animation ?? []));
    for (const style of Object.values(art.houseStyles ?? {})) files.push(...Object.values(style));
  }
  for (const p of room.furniture ?? []) if (p.art) files.push(p.art, ...(p.animation ?? []));
  return [...new Set(files)];
}

// Toys whose pictures start with another name (js/toy-draw.js), and the holes
// of animals that live in one (same as HOLES in js/critters.js, which this
// file cannot import without a loop through js/sprites.js).
const TOY_ART = { 'sled-hill': 'sled', 'marimba-stones': 'marimba-stone', 'magnet-rock': 'magnet' };
const HOLE_ART = { meerkat: 'burrow', seal: 'ice-hole' };

// The start of the picture names of a room's residents, toys and animals
// (world/residents/<id>-<anim>-<n>.svg and so on), to load them with the room.
export function actorPrefixes(room) {
  const prefixes = [
    ...(room.residents ?? []).map((r) => `world/residents/${r.id}-`),
    ...(room.toys ?? []).map((t) => `world/toys/${TOY_ART[t.type] ?? t.type}`),
    ...(room.critters ?? []).map((c) => `world/critters/${c.type}-`),
    ...(room.critters ?? []).filter((c) => HOLE_ART[c.type]).map((c) => `world/critters/${HOLE_ART[c.type]}`),
  ];
  return [...new Set(prefixes)];
}

// The kid's house is drawn in the style they live in, with what they
// bought (js/world-draw.js, drawHouseRoom): those pictures, from the save.
export function houseFiles({ style, wallpaper, floor }) {
  const files = [`world/walls/${style}-wall.svg`, `world/walls/${style}-window.svg`, `world/textures/indoor-${style}.svg`];
  if (wallpaper) files.push(`world/walls/wallpaper-${wallpaper}.svg`);
  if (floor) files.push(`world/textures/floor-${floor}.svg`);
  return files;
}

// The rooms one step away: through an exit or a door.
export function nearbyRooms(roomId, rooms) {
  const room = rooms[roomId];
  const ids = [...room.exits.map((e) => e.to), ...room.stations.map((s) => s.room).filter(Boolean)];
  return [...new Set(ids)].filter((id) => id !== roomId && rooms[id]).sort();
}

// Pixels per game pixel for a picture of [width, height]: big room layers
// at 1x (they are a quarter of the memory), everything else sharp at 2x.
export const rasterScale = ([w, h]) => (w * h >= 640 * 360 ? 1 : 2);
