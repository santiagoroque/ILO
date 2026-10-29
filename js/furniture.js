// Furniture for the kid's house: its size, whether it blocks walking, and
// how to draw it. (x, y) is the bottom center of the piece. Prices and names
// are in world/items.json; every id there needs an entry here (a test checks).

import { drawSetFurniture, SET_FURNITURE } from './furniture-sets.js';
import { drawSprite, frameAt, reducedMotion } from './sprites.js';

const OUTLINE = '#2b2d42';

// width and depth are the floor footprint in pixels; height is how tall the
// drawing is (used to grab it with the mouse). Wall pieces hang on the back
// wall; flat pieces (rugs) can be walked over.
export const FURNITURE = {
  rug: { width: 180, depth: 90, height: 90, solid: false, flat: true },
  plant: { width: 44, depth: 24, height: 70, solid: true },
  poster: { width: 100, depth: 10, height: 70, solid: false, wall: true },
  lamp: { width: 34, depth: 20, height: 92, solid: true },
  chair: { width: 54, depth: 36, height: 80, solid: true },
  table: { width: 110, depth: 56, height: 56, solid: true },
  beanbag: { width: 70, depth: 44, height: 52, solid: true },
  globe: { width: 48, depth: 30, height: 72, solid: true },
  bookshelf: { width: 110, depth: 34, height: 132, solid: true },
  bed: { width: 150, depth: 84, height: 112, solid: true },
  telescope: { width: 64, depth: 40, height: 92, solid: true },
  aquarium: { width: 120, depth: 40, height: 102, solid: true, anim: 3 },
  ...SET_FURNITURE, // Delivery 2's six sets (js/furniture-sets.js).
};

function box(ctx, x, y, w, h, fill, r = 6) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function shadow(ctx, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, -2, w / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

// `state` is what using the piece did: { on } or { playing } (0 to 1).
export function drawFurniture(ctx, id, x, y, { ghost = false, time = 0, state = {} } = {}) {
  const f = FURNITURE[id];
  if (!f) return;
  // The picture for its state (furniture/<id>-on.svg, <id>-play-<n>.svg),
  // or its idle loop (<id>-<n>.svg), or the still picture.
  const files = [];
  if (!ghost && state.on) files.push(`furniture/${id}-on.svg`);
  if (!ghost && state.playing && f.frames) files.push(`furniture/${id}-play-${frameAt(time, 8, f.frames)}.svg`);
  if (!ghost && f.anim && !reducedMotion) files.push(`furniture/${id}-${frameAt(time, 3, f.anim)}.svg`);
  files.push(`furniture/${ghost ? 'ghost/' : ''}${id}.svg`);
  if (files.some((file) => drawSprite(ctx, file, x, y))) return;
  ctx.save();
  ctx.translate(x, y);
  if (ghost) ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  switch (id) {
    case 'rug':
      ctx.fillStyle = '#c0504d';
      ctx.beginPath();
      ctx.ellipse(0, -45, 90, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f2d16b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, -45, 66, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'plant':
      shadow(ctx, 44);
      box(ctx, -16, -30, 32, 30, '#c8754a', 4);
      circle(ctx, -10, -42, 12, '#4fa845');
      circle(ctx, 10, -44, 12, '#4fa845');
      circle(ctx, 0, -56, 14, '#5bb24b');
      break;
    case 'poster':
      box(ctx, -50, -70, 100, 70, '#1d2340', 4);
      circle(ctx, -30, -35, 9, '#ffd166');
      for (const [px, r, c] of [[-10, 4, '#a3a3a3'], [6, 5, '#4aa3e8'], [24, 7, '#e07a5f'], [40, 5, '#d4b483']]) {
        ctx.lineWidth = 1.2;
        circle(ctx, px, -35, r, c);
      }
      break;
    case 'lamp':
      shadow(ctx, 34);
      ctx.fillStyle = '#3d405b';
      ctx.fillRect(-3, -70, 6, 66);
      box(ctx, -14, -8, 28, 8, '#3d405b', 3);
      ctx.fillStyle = '#ffe08a';
      ctx.beginPath();
      ctx.moveTo(-18, -66);
      ctx.lineTo(18, -66);
      ctx.lineTo(10, -90);
      ctx.lineTo(-10, -90);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'chair':
      shadow(ctx, 54);
      box(ctx, -22, -78, 44, 44, '#a26b3c', 6);
      box(ctx, -26, -40, 52, 14, '#b5794a', 4);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-22, -26, 6, 26);
      ctx.fillRect(16, -26, 6, 26);
      break;
    case 'table':
      shadow(ctx, 110);
      box(ctx, -55, -52, 110, 16, '#b5794a', 6);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-46, -36, 8, 36);
      ctx.fillRect(38, -36, 8, 36);
      break;
    case 'beanbag':
      shadow(ctx, 70);
      ctx.fillStyle = '#8e6bd6';
      ctx.beginPath();
      ctx.ellipse(0, -24, 35, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a98ae3';
      ctx.beginPath();
      ctx.ellipse(-6, -30, 18, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'globe':
      shadow(ctx, 48);
      box(ctx, -16, -8, 32, 8, '#7a4e2d', 3);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-2, -26, 4, 20);
      circle(ctx, 0, -48, 22, '#4aa3e8');
      ctx.fillStyle = '#6cbf4b';
      ctx.beginPath();
      ctx.ellipse(-6, -54, 9, 6, 0.4, 0, Math.PI * 2);
      ctx.ellipse(8, -40, 7, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'bookshelf':
      shadow(ctx, 110);
      box(ctx, -55, -130, 110, 130, '#8b5a33', 4);
      for (const shelfY of [-90, -48]) {
        ctx.fillStyle = '#6b4226';
        ctx.fillRect(-50, shelfY, 100, 6);
      }
      ['#e63946', '#457b9d', '#f4c430', '#2bb3a3', '#8e6bd6', '#f2765b'].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(-46 + i * 15, -124, 11, 32);
        ctx.fillRect(-44 + i * 15, -82, 11, 32);
      });
      break;
    case 'bed':
      shadow(ctx, 150);
      box(ctx, -75, -110, 26, 110, '#7a4e2d', 6);
      box(ctx, -70, -62, 145, 50, '#f1faee', 8);
      box(ctx, -10, -66, 85, 54, '#4aa3e8', 8);
      box(ctx, -64, -70, 46, 24, '#ffffff', 10);
      break;
    case 'telescope':
      shadow(ctx, 64);
      ctx.strokeStyle = '#3d405b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(-22, 0);
      ctx.moveTo(0, -50);
      ctx.lineTo(22, 0);
      ctx.moveTo(0, -50);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.save();
      ctx.translate(0, -56);
      ctx.rotate(-0.6);
      box(ctx, -34, -9, 68, 18, '#e9ecef', 6);
      box(ctx, 28, -11, 10, 22, '#3d405b', 3);
      ctx.restore();
      break;
    case 'aquarium':
      shadow(ctx, 120);
      box(ctx, -56, -36, 112, 36, '#7a4e2d', 4);
      box(ctx, -58, -100, 116, 64, 'rgba(111,195,240,0.85)', 6);
      ctx.fillStyle = '#f4a261';
      for (const [fx, fy] of [[-20, -74], [18, -60]]) {
        ctx.beginPath();
        ctx.ellipse(fx, fy, 10, 6, 0, 0, Math.PI * 2);
        ctx.moveTo(fx - 8, fy);
        ctx.lineTo(fx - 18, fy - 6);
        ctx.lineTo(fx - 18, fy + 6);
        ctx.fill();
      }
      ctx.strokeStyle = '#2e8b57';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, -38);
      ctx.quadraticCurveTo(30, -60, 42, -84);
      ctx.stroke();
      break;
    default:
      drawSetFurniture(ctx, id, reducedMotion ? 0 : time, state);
      break;
  }
  ctx.restore();
}
