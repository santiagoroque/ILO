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

// The rooms one step away: through an exit or a door.
export function nearbyRooms(roomId, rooms) {
  const room = rooms[roomId];
  const ids = [...room.exits.map((e) => e.to), ...room.stations.map((s) => s.room).filter(Boolean)];
  return [...new Set(ids)].filter((id) => id !== roomId && rooms[id]).sort();
}

// Pixels per game pixel for a picture of [width, height]: big room layers
// at 1x (they are a quarter of the memory), everything else sharp at 2x.
export const rasterScale = ([w, h]) => (w * h >= 640 * 360 ? 1 : 2);
