// Rules for placing furniture in the kid's house (docs/PLAN.md, D12). No drawing
// or page code here, so the tests can check the rules directly.
import { FURNITURE } from './furniture.js';
import { AVATAR_RADIUS, furnitureRect } from './world-data.js';

const overlaps = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

// Can a piece `id` stand at (x, y) in this house room?
// `placed` is the furniture already in the house (not counting this piece).
// Layered houses draw the kid's furniture `room.furnitureScale` times bigger.
export function placementOk(room, placed, id, x, y, avatar) {
  const f = FURNITURE[id];
  if (!f) return false;
  const k = room.furnitureScale ?? 1;
  if (x - (f.width * k) / 2 < 10 || x + (f.width * k) / 2 > room.width - 10) return false;

  if (f.wall) return y > 100 && y < room.minY - 40; // On the back wall.

  const rect = furnitureRect(id, x, y, k);
  if (rect.y1 < room.minY - 20 || y > room.height - 20) return false;

  // Keep the door and the spot where you arrive free.
  for (const exit of room.exits) {
    const keep = { x1: exit.x - 40, x2: exit.x + exit.width + 40, y1: exit.y - 110, y2: exit.y + exit.height };
    if (overlaps(rect, keep)) return false;
  }
  if (!f.solid) return true; // Rugs can go anywhere on the floor.

  const r = AVATAR_RADIUS;
  if (avatar && avatar.x > rect.x1 - r && avatar.x < rect.x2 + r && avatar.y > rect.y1 - r && avatar.y < rect.y2 + r) return false;
  return placed.every((p) => !FURNITURE[p.id]?.solid || !overlaps(rect, furnitureRect(p.id, p.x, p.y, k)));
}

// Which placed piece (index) is under the mouse? Front pieces win.
export function furnitureAt(placed, x, y, k = 1) {
  let best = -1;
  placed.forEach((p, i) => {
    const f = FURNITURE[p.id];
    if (!f) return;
    const inside = x > p.x - (f.width * k) / 2 && x < p.x + (f.width * k) / 2 && y > p.y - f.height * k && y < p.y + 6;
    if (inside && (best === -1 || p.y >= placed[best].y)) best = i;
  });
  return best;
}
