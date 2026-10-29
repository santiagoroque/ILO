// The kid's pet: three original baby animals (docs/PLAN.md, A16), how to draw
// them, and how they follow the avatar around. (x, y) is where the pet's
// feet touch the ground.

import { drawSprite, frameAt } from './sprites.js';

const OUTLINE = '#2b2d42';
export const PET_KINDS = ['fox', 'meerkat', 'hare', 'axolotl', 'macaw', 'armadillo'];
const FOLLOW_GAP = 46; // How far behind the avatar the pet walks.

function ellipse(ctx, x, y, rx, ry, fill, stroke = true) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) ctx.stroke();
}

function eyes(ctx, x, y, facing, gap = 5) {
  for (const side of [-1, 1]) {
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(x + side * gap + facing * 2, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + side * gap + facing * 2 + 0.8, y - 0.8, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Options: facing, hop (hop phase, 0 when still), scale, time (seconds),
// mood ('happy' after a win, 'sad' when hungry, otherwise null).
export function drawPet(ctx, kind, x, y, { facing = 1, hop = 0, scale = 1, time = 0, mood = null } = {}) {
  let file = `pets/${kind}-idle-${frameAt(time, 2, 2)}.svg`;
  if (hop) file = `pets/${kind}-hop-${(Math.floor(hop / 2) % 3) + 1}.svg`;
  else if (mood === 'happy') file = `pets/${kind}-happy-${frameAt(time, 4, 2)}.svg`;
  else if (mood === 'sad') file = `pets/${kind}-sad-1.svg`;
  if (drawSprite(ctx, file, x, y, { scale, flip: facing < 0 })) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(0, -Math.abs(Math.sin(hop)) * 6);
  ctx.scale(facing, 1); // Drawn facing right; flip to face left.
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;

  if (kind === 'fox') {
    // Bushy tail
    ctx.fillStyle = '#e8873a';
    ctx.beginPath();
    ctx.ellipse(-16, -14, 12, 7, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, -24, -20, 4, 3, '#ffffff', false);
    ellipse(ctx, 0, -12, 13, 10, '#e8873a');
    ellipse(ctx, 3, -10, 6, 6, '#fff4e6', false);
    // Head and pointy ears
    for (const ex of [-1, 1]) {
      ctx.fillStyle = '#e8873a';
      ctx.beginPath();
      ctx.moveTo(6 + ex * 9, -32);
      ctx.lineTo(6 + ex * 4, -44);
      ctx.lineTo(6 + ex * 1, -32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ellipse(ctx, 6, -28, 11, 9, '#e8873a');
    ellipse(ctx, 10, -24, 6, 4, '#fff4e6', false);
    eyes(ctx, 6, -30, 1, 4);
    ellipse(ctx, 15, -25, 2, 1.6, OUTLINE, false);
  } else if (kind === 'meerkat') {
    // Stands upright like a lookout.
    ellipse(ctx, -8, -4, 10, 3, '#b08a5a');
    ellipse(ctx, 0, -18, 9, 15, '#d8b682');
    ellipse(ctx, 1, -16, 5, 10, '#f1dfbf', false);
    ellipse(ctx, 2, -38, 9, 8, '#d8b682');
    ellipse(ctx, -5, -42, 3, 3, '#b08a5a');
    for (const side of [-1, 1]) ellipse(ctx, 2 + side * 4, -39, 3.5, 3, '#6b4f2a', false);
    eyes(ctx, 2, -39, 1, 4);
    ellipse(ctx, 9, -36, 1.8, 1.4, OUTLINE, false);
    // Little arms
    ctx.beginPath();
    ctx.moveTo(-4, -22);
    ctx.lineTo(4, -20);
    ctx.stroke();
  } else if (kind === 'hare') {
    ellipse(ctx, -12, -12, 5, 5, '#ffffff');
    ellipse(ctx, 0, -12, 13, 10, '#f4f6fa');
    // Long ears
    for (const [ex, tilt] of [[-2, -0.2], [5, 0.15]]) {
      ctx.save();
      ctx.translate(4 + ex, -34);
      ctx.rotate(tilt);
      ellipse(ctx, 0, -12, 4, 13, '#f4f6fa');
      ellipse(ctx, 0, -12, 2, 9, '#ffb3c1', false);
      ctx.restore();
    }
    ellipse(ctx, 6, -26, 10, 9, '#f4f6fa');
    eyes(ctx, 6, -28, 1, 4);
    ellipse(ctx, 14, -24, 2, 1.6, '#ff8fab', false);
  } else if (kind === 'axolotl') {
    // Pink, with frilly gills and a big smile (Phase 13).
    ellipse(ctx, -14, -8, 9, 4, '#ffb3c6');
    ellipse(ctx, 0, -10, 14, 8, '#ffc8dd');
    for (const [gx, gy] of [[-4, -30], [-2, -24], [12, -30], [14, -24]]) ellipse(ctx, gx, gy, 4, 2.5, '#ff70a6');
    ellipse(ctx, 5, -22, 11, 9, '#ffc8dd');
    eyes(ctx, 5, -24, 1, 5);
    ctx.beginPath();
    ctx.arc(8, -20, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else if (kind === 'macaw') {
    ellipse(ctx, -8, -4, 4, 12, '#4361ee');
    ellipse(ctx, 0, -16, 10, 13, '#e63946');
    ellipse(ctx, -3, -14, 6, 8, '#ffd166', false);
    const flap = mood === 'happy' ? Math.sin(time * 18) * 6 : 0;
    ellipse(ctx, -6, -18 - flap, 8, 4, '#4361ee');
    ellipse(ctx, 4, -32, 8, 8, '#e63946');
    ellipse(ctx, 6, -33, 3, 2.5, '#ffffff');
    ctx.fillStyle = '#3d405b';
    ctx.beginPath();
    ctx.moveTo(10, -33);
    ctx.quadraticCurveTo(17, -31, 12, -25);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'armadillo') {
    // Rolls into a ball while hopping.
    if (hop) {
      ellipse(ctx, 0, -12, 12, 12, '#a68a64');
      for (const a of [-0.6, 0, 0.6]) {
        ctx.beginPath();
        ctx.arc(0, -12, 12, -Math.PI / 2 + a - 0.2, -Math.PI / 2 + a + 0.2);
        ctx.stroke();
      }
    } else {
      ellipse(ctx, 0, -12, 15, 10, '#a68a64');
      for (const x of [-8, -2, 4]) {
        ctx.beginPath();
        ctx.moveTo(x, -21);
        ctx.lineTo(x, -3);
        ctx.stroke();
      }
      ellipse(ctx, 15, -10, 6, 5, '#c2a878');
      ellipse(ctx, 13, -16, 2, 4, '#c2a878');
      eyes(ctx, 16, -11, 1, 3);
    }
  }
  ctx.restore();
}

export function hasPetDrawing(kind) {
  return PET_KINDS.includes(kind);
}

// Moves the pet a step toward its spot behind the avatar. Returns true if
// it moved (so the screen needs redrawing).
// `scale`: how big Ilo and the pet are drawn (a bigger pet keeps a bigger gap).
export function followAvatar(pet, avatar, dt, scale = 1) {
  const tx = avatar.x - avatar.facing * FOLLOW_GAP * scale;
  const ty = avatar.y + 6;
  const dx = tx - pet.x;
  const dy = ty - pet.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 3) {
    pet.hop = 0;
    return false;
  }
  const speed = Math.min(distance * 4, 320) * dt;
  pet.x += (dx / distance) * Math.min(speed, distance);
  pet.y += (dy / distance) * Math.min(speed, distance);
  if (Math.abs(dx) > 2) pet.facing = dx > 0 ? 1 : -1;
  pet.hop += dt * 14;
  return true;
}
