// Stamps (docs/PLAN.md, D15): which ones are earned, and how to draw them.
// The stamp list, rewards and conditions are in world/stamps.json.
import { drawSprite } from './sprites.js';

const OUTLINE = '#2b2d42';

// `facts` is a summary of the kid's progress (built in world.js from
// progress.js), plus totals from the world:
// { completed, applied, lessons, visited, totalRooms, pets, placed, said, danced,
//   snowballHits, gems, totalGems, clothingOwned, spotted, totalCritters,
//   housesBought, toysUsed, goals, evening, partied }
export function stampEarned(stamp, facts) {
  const c = stamp.condition;
  switch (c.type) {
    case 'lesson': return Boolean(facts.completed[c.lesson]);
    case 'all_lessons': return facts.lessons.length > 0 && facts.lessons.every((id) => facts.completed[id]);
    case 'all_applied': return facts.lessons.length > 0 && facts.lessons.every((id) => facts.applied?.[id]);
    case 'rooms': return facts.visited.length >= c.count;
    case 'all_rooms': return facts.visited.length >= facts.totalRooms;
    case 'pet': return facts.pets > 0;
    case 'furniture': return facts.placed >= c.count;
    case 'said': return facts.said >= c.count;
    case 'danced': return facts.danced;
    case 'snowball_hits': return facts.snowballHits >= c.count;
    case 'gems': return facts.gems >= c.count;
    case 'all_gems': return facts.totalGems > 0 && facts.gems >= facts.totalGems;
    case 'clothing': return facts.clothingOwned >= c.count;
    // Phase 13
    case 'visit': return c.rooms.every((id) => facts.visited.includes(id));
    case 'spotted': return facts.spotted >= c.count;
    case 'all_spotted': return facts.totalCritters > 0 && facts.spotted >= facts.totalCritters;
    case 'houses': return facts.housesBought >= c.count;
    case 'toys': return facts.toysUsed >= c.count;
    case 'goals': return facts.goals >= c.count;
    case 'evening': return Boolean(facts.evening);
    case 'party': return Boolean(facts.partied);
    default: return false;
  }
}

export const STAMP_ICONS = ['package', 'sled', 'lever', 'flask', 'map', 'globe', 'paw', 'house', 'bubble', 'music', 'snowball', 'gem', 'crown', 'shirt',
  'shell', 'leaf', 'book', 'key', 'sofa', 'party', 'ball', 'goal', 'moon', 'column'];

// Draws a round stamp with its icon, centered on (x, y). Locked stamps are grey.
export function drawStamp(ctx, icon, x, y, size, earned, stampId = null) {
  // Stamp pictures are 96 x 96 with the ground point at the bottom middle. A
  // stamp's own picture (stamps/<stamp id>.svg) wins over the shared icon.
  const state = earned ? '' : '-locked';
  if (stampId && drawSprite(ctx, `stamps/${stampId}${state}.svg`, x, y + size / 2, { scale: size / 96 })) return;
  if (drawSprite(ctx, `stamps/${icon}${state}.svg`, x, y + size / 2, { scale: size / 96 })) return;
  const s = size / 64;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  // Wavy stamp edge
  ctx.fillStyle = earned ? '#ffd166' : '#d9dee5';
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 28 : 31;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = earned ? '#fff8e6' : '#eef1f5';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  if (!earned) ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2.5;
  const fill = (c) => { ctx.fillStyle = c; ctx.fill(); ctx.stroke(); };
  const rect = (x0, y0, w, h, c) => { ctx.beginPath(); ctx.rect(x0, y0, w, h); fill(c); };
  const circle = (cx, cy, r, c) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); fill(c); };
  switch (icon) {
    case 'package':
      rect(-11, -9, 22, 18, '#c98a3d');
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.stroke();
      break;
    case 'sled':
      rect(-13, -6, 26, 8, '#e63946');
      ctx.beginPath();
      ctx.moveTo(-14, 8);
      ctx.lineTo(14, 8);
      ctx.quadraticCurveTo(19, 8, 17, 2);
      ctx.stroke();
      break;
    case 'lever':
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(0, 0);
      ctx.lineTo(6, 10);
      ctx.closePath();
      fill('#7a4e2d');
      ctx.save();
      ctx.rotate(-0.25);
      rect(-16, -3, 32, 5, '#c8915a');
      ctx.restore();
      break;
    case 'flask':
      ctx.beginPath();
      ctx.moveTo(-4, -13);
      ctx.lineTo(-4, -3);
      ctx.lineTo(-12, 11);
      ctx.lineTo(12, 11);
      ctx.lineTo(4, -3);
      ctx.lineTo(4, -13);
      ctx.closePath();
      fill('#6fc3f0');
      break;
    case 'map':
      ctx.beginPath();
      ctx.moveTo(-14, -9);
      ctx.lineTo(-5, -12);
      ctx.lineTo(5, -9);
      ctx.lineTo(14, -12);
      ctx.lineTo(14, 9);
      ctx.lineTo(5, 12);
      ctx.lineTo(-5, 9);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      fill('#e9d5b5');
      circle(4, -1, 3, '#e63946');
      break;
    case 'globe':
      circle(0, 0, 13, '#4aa3e8');
      ctx.beginPath();
      ctx.ellipse(-3, -3, 5, 4, 0.4, 0, Math.PI * 2);
      fill('#6cbf4b');
      break;
    case 'paw':
      circle(0, 4, 7, '#c8754a');
      for (const [px, py] of [[-8, -5], [-3, -9], [3, -9], [8, -5]]) circle(px, py, 3, '#c8754a');
      break;
    case 'house':
      rect(-10, -2, 20, 13, '#ffe8c2');
      ctx.beginPath();
      ctx.moveTo(-14, -1);
      ctx.lineTo(0, -13);
      ctx.lineTo(14, -1);
      ctx.closePath();
      fill('#457b9d');
      break;
    case 'bubble':
      ctx.beginPath();
      ctx.ellipse(0, -2, 14, 10, 0, 0, Math.PI * 2);
      fill('#ffffff');
      ctx.beginPath();
      ctx.moveTo(-4, 7);
      ctx.lineTo(-8, 13);
      ctx.lineTo(1, 8);
      ctx.stroke();
      break;
    case 'music':
      circle(-6, 7, 5, OUTLINE);
      ctx.beginPath();
      ctx.moveTo(-1, 7);
      ctx.lineTo(-1, -12);
      ctx.lineTo(10, -8);
      ctx.stroke();
      break;
    case 'snowball':
      circle(0, 0, 12, '#ffffff');
      circle(-4, -4, 3, '#d4e8f3');
      break;
    case 'gem':
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(11, -2);
      ctx.lineTo(0, 13);
      ctx.lineTo(-11, -2);
      ctx.closePath();
      fill('#b388ff');
      break;
    case 'crown':
      ctx.beginPath();
      ctx.moveTo(-13, 9);
      ctx.lineTo(-13, -8);
      ctx.lineTo(-6, 0);
      ctx.lineTo(0, -11);
      ctx.lineTo(6, 0);
      ctx.lineTo(13, -8);
      ctx.lineTo(13, 9);
      ctx.closePath();
      fill('#ffd166');
      break;
    case 'shirt':
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(-14, -6);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-7, -2);
      ctx.lineTo(-7, 12);
      ctx.lineTo(7, 12);
      ctx.lineTo(7, -2);
      ctx.lineTo(10, 0);
      ctx.lineTo(14, -6);
      ctx.lineTo(6, -12);
      ctx.closePath();
      fill('#e76f51');
      break;
    // Phase 13 stamps: simple shapes until their pictures arrive.
    case 'shell':
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2);
      fill('#fff1e0');
      ctx.beginPath();
      ctx.arc(-2, 0, 5, 0, Math.PI * 1.5);
      ctx.stroke();
      break;
    case 'leaf':
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 7, -0.6, 0, Math.PI * 2);
      fill('#6a994e');
      break;
    case 'book':
      ctx.beginPath();
      ctx.rect(-13, -10, 26, 20);
      fill('#457b9d');
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();
      break;
    case 'key':
      ctx.beginPath();
      ctx.arc(-6, 0, 6, 0, Math.PI * 2);
      fill('#ffd166');
      ctx.beginPath();
      ctx.rect(0, -2, 14, 4);
      fill('#ffd166');
      break;
    case 'sofa':
      ctx.beginPath();
      ctx.rect(-14, -6, 28, 12);
      fill('#457b9d');
      break;
    case 'party':
      ctx.beginPath();
      ctx.moveTo(-10, 12);
      ctx.lineTo(0, -14);
      ctx.lineTo(10, 12);
      ctx.closePath();
      fill('#8e6bd6');
      break;
    case 'ball':
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      fill('#ffffff');
      break;
    case 'goal':
      ctx.beginPath();
      ctx.rect(-14, -8, 28, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, 2, 4, 0, Math.PI * 2);
      fill('#ffffff');
      break;
    case 'moon':
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0.6, Math.PI * 2 - 0.6);
      ctx.arc(6, 0, 8, Math.PI * 2 - 1.2, 1.2, true);
      ctx.closePath();
      fill('#ffd166');
      break;
    case 'column':
      ctx.beginPath();
      ctx.rect(-6, -12, 12, 24);
      fill('#f1faee');
      break;
    default:
      break;
  }
  ctx.restore();
}
