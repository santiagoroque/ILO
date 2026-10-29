// Draws the physics toys from js/toys.js. Pictures are world/toys/<file>.svg
// (names below and in DESIGN_PROMPT_2.md, Part 12.6); shapes until then.
import { drawSprite, frameAt, reducedMotion } from './sprites.js';
import { goalBox, marimbaStones } from './toys.js';

const OUTLINE = '#2b2d42';

function ellipse(ctx, x, y, rx, ry, fill, stroke = true) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) ctx.stroke();
}
function shadow(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Toys lying flat on the ground are drawn under everything (`flat`).
export const FLAT_TOYS = ['goal', 'marimba-stones', 'sled-hill'];

// Pictures are drawn `toy.scale` times their size (layered rooms), each
// around its own ground point, so moving parts stay where js/toys.js says.
export function drawToy(ctx, toy, time, ride = null) {
  const art = (file, x, y) => drawSprite(ctx, `world/toys/${file}.svg`, x, y, { scale: toy.scale ?? 1 });
  const t = reducedMotion ? 0 : time;
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  switch (toy.type) {
    case 'ball': {
      if (toy.resetAt) break; // In the goal: it comes back in a moment.
      const frame = 1 + (Math.floor(toy.spin * 2) % 4);
      if (art(`ball-${frame}`, toy.x, toy.y + 13)) break;
      shadow(ctx, toy.x, toy.y + 11, 12);
      ellipse(ctx, toy.x, toy.y, 13, 13, '#ffffff');
      ctx.save();
      ctx.beginPath();
      ctx.arc(toy.x, toy.y, 13, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#e63946';
      ctx.fillRect(toy.x - 13 + ((toy.spin * 6) % 26) - 13, toy.y - 13, 9, 26);
      ctx.restore();
      break;
    }
    case 'goal': {
      if (art('goal', toy.x, toy.y)) break;
      const box = goalBox(toy);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      for (let x = box.x1; x <= box.x2; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, box.y1);
        ctx.lineTo(x, box.y2);
        ctx.stroke();
      }
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = '#c99a5e';
      ctx.fillRect(box.x1 - 4, box.y1 - 40, 6, 40);
      ctx.fillRect(box.x2 - 2, box.y1 - 40, 6, 40);
      ctx.fillRect(box.x1 - 4, box.y1 - 44, box.x2 - box.x1 + 10, 6);
      ctx.strokeRect(box.x1 - 4, box.y1 - 44, box.x2 - box.x1 + 10, 6);
      break;
    }
    case 'seesaw': {
      const state = toy.tilt < -0.1 ? 'left' : toy.tilt > 0.1 ? 'right' : 'level';
      if (art(`seesaw-${state}`, toy.x, toy.y)) break;
      shadow(ctx, toy.x, toy.y, 70);
      ctx.fillStyle = '#8a6238';
      ctx.beginPath();
      ctx.moveTo(toy.x - 14, toy.y);
      ctx.lineTo(toy.x, toy.y - 22);
      ctx.lineTo(toy.x + 14, toy.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(toy.x, toy.y - 22);
      ctx.rotate(toy.tilt);
      ctx.fillStyle = '#e9c46a';
      ctx.fillRect(-80, -5, 160, 10);
      ctx.strokeRect(-80, -5, 160, 10);
      ctx.restore();
      break;
    }
    case 'swing': {
      const angle = ride?.toy === toy ? ride.angle ?? 0 : Math.sin(t * 1.2) * 0.04;
      if (!reducedMotion && art(`swing-${3 + Math.round(Math.max(-2, Math.min(2, angle * 2.5)))}`, toy.x, toy.y)) break;
      if (art('swing-3', toy.x, toy.y)) break;
      shadow(ctx, toy.x, toy.y, 50);
      ctx.fillStyle = '#7a4e2d';
      for (const dx of [-46, 46]) {
        ctx.fillRect(toy.x + dx - 4, toy.y - 110, 8, 110);
        ctx.strokeRect(toy.x + dx - 4, toy.y - 110, 8, 110);
      }
      ctx.fillRect(toy.x - 52, toy.y - 114, 104, 8);
      ctx.strokeRect(toy.x - 52, toy.y - 114, 104, 8);
      const sx = toy.x + 60 * Math.sin(angle);
      const sy = toy.y - 110 + 82 * Math.cos(angle);
      ctx.beginPath();
      ctx.moveTo(toy.x - 14, toy.y - 106);
      ctx.lineTo(sx - 14, sy);
      ctx.moveTo(toy.x + 14, toy.y - 106);
      ctx.lineTo(sx + 14, sy);
      ctx.stroke();
      ctx.fillStyle = '#c99a5e';
      ctx.fillRect(sx - 18, sy - 3, 36, 6);
      ctx.strokeRect(sx - 18, sy - 3, 36, 6);
      break;
    }
    case 'bounce-mushroom': {
      const state = ride?.toy === toy ? (ride.squash ? 'squash' : 'stretch') : 'idle';
      if (art(`bounce-mushroom-${state}`, toy.x, toy.y)) break;
      const k = state === 'squash' ? 0.8 : state === 'stretch' ? 1.08 : 1;
      shadow(ctx, toy.x, toy.y, 40);
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(toy.x - 12, toy.y - 34 * k, 24, 34 * k);
      ctx.strokeRect(toy.x - 12, toy.y - 34 * k, 24, 34 * k);
      ellipse(ctx, toy.x, toy.y - 40 * k, 40, 20 / k, '#e63946');
      for (const [dx, dy] of [[-18, -4], [8, -10], [20, 2]]) ellipse(ctx, toy.x + dx, toy.y - 40 * k + dy, 5, 4, '#ffffff', false);
      break;
    }
    case 'sled-hill': {
      if (art('sled-hill', toy.x, toy.y)) break;
      ctx.fillStyle = 'rgba(200, 225, 240, 0.9)';
      ctx.strokeStyle = '#a9cde0';
      ctx.beginPath();
      ctx.moveTo(toy.x - 50, toy.y - 20);
      ctx.lineTo(toy.x + 30, toy.y - 30);
      ctx.lineTo(toy.x + 150, toy.y + 110);
      ctx.lineTo(toy.x + 60, toy.y + 130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ellipse(ctx, toy.x - 20, toy.y + 6, 22, 9, '#e63946'); // A red sled waiting at the top
      break;
    }
    case 'water-wheel': {
      const frame = 1 + (Math.floor((toy.angle / (Math.PI / 2)) * 4) % 4 + 4) % 4;
      if (art(`water-wheel-${frame}`, toy.x, toy.y)) {
        if (toy.speed > 0.5) art('water-wheel-splash', toy.x, toy.y);
        break;
      }
      shadow(ctx, toy.x, toy.y, 50);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(toy.x - 50, toy.y - 70, 10, 70);
      ctx.fillRect(toy.x + 40, toy.y - 70, 10, 70);
      ctx.save();
      ctx.translate(toy.x, toy.y - 62);
      ctx.rotate(toy.angle);
      ellipse(ctx, 0, 0, 44, 44, '#c99a5e');
      ctx.fillStyle = '#8a6238';
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4, -48, 8, 18);
        ctx.strokeRect(-4, -48, 8, 18);
      }
      ellipse(ctx, 0, 0, 8, 8, '#5b3a29');
      ctx.restore();
      if (toy.speed > 0.5) {
        ctx.strokeStyle = 'rgba(160, 220, 245, 0.9)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(toy.x - 60, toy.y - 130);
        ctx.quadraticCurveTo(toy.x - 30, toy.y - 120, toy.x - 20, toy.y - 100);
        ctx.stroke();
      }
      break;
    }
    case 'marimba-stones':
      for (const [i, stone] of marimbaStones(toy).entries()) {
        if (art(`marimba-stone-${i + 1}${stone.pressed ? '-pressed' : ''}`, stone.x, stone.y + 8)) continue;
        const r = 18 - i * 1.5;
        ellipse(ctx, stone.x, stone.y + (stone.pressed ? 3 : 0), r, r * 0.55, stone.pressed ? '#ffd166' : ['#9aa5ab', '#a3a9a1', '#8f9aa0', '#a7b0a8', '#99a39b'][i]);
      }
      break;
    case 'paper-boat': {
      if (!toy.boat) {
        // A folded boat waiting on the bank
        if (art('paper-boat-1', toy.x, toy.y)) break;
        drawBoat(ctx, toy.x, toy.y, 0);
      } else {
        const frame = 1 + (Math.floor(t * 2) % 2);
        if (art(`paper-boat-${frame}`, toy.boat.x, toy.boat.y)) break;
        drawBoat(ctx, toy.boat.x, toy.boat.y, Math.sin(t * 2) * 0.1);
      }
      break;
    }
    case 'magnet-rock': {
      const glowing = toy.stuck || toy.spoonSpeed > 0;
      if (!art(glowing ? `magnet-rock-glow-${frameAt(t, 4, 2)}` : 'magnet-rock', toy.x, toy.y)) {
        shadow(ctx, toy.x, toy.y, 30);
        ellipse(ctx, toy.x, toy.y - 20, 30, 24, '#3d405b');
        if (glowing) {
          ctx.strokeStyle = `rgba(150, 120, 255, ${0.4 + Math.sin(t * 8) * 0.3})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(toy.x, toy.y - 20, 36, 30, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      if (!art('magnet-spoon', toy.spoon.x, toy.spoon.y)) {
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2;
        ellipse(ctx, toy.spoon.x + 8, toy.spoon.y - 4, 6, 4, '#c0c7cf');
        ctx.fillStyle = '#c0c7cf';
        ctx.fillRect(toy.spoon.x - 12, toy.spoon.y - 5, 16, 3);
      }
      break;
    }
    case 'kite':
      if (ride?.toy === toy) break; // Flying: drawn with Ilo.
      if (art('kite-1', toy.x, toy.y)) break;
      drawKiteShape(ctx, toy.x, toy.y - 4, 0.7);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawBoat(ctx, x, y, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-14, -6);
  ctx.lineTo(14, -6);
  ctx.lineTo(9, 2);
  ctx.lineTo(-9, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(0, -20);
  ctx.lineTo(6, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawKiteShape(ctx, x, y, k = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#ff7f6e';
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(16, 0);
  ctx.lineTo(0, 30);
  ctx.lineTo(-16, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(16, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// The kite flying above Ilo, with its string to Ilo's hand (`scale`: how
// big Ilo is drawn).
export function drawFlyingKite(ctx, avatar, time, scale = 1) {
  const t = reducedMotion ? 0 : time;
  ctx.save();
  ctx.translate(avatar.x, avatar.y);
  ctx.scale(scale, scale);
  ctx.translate(-avatar.x, -avatar.y);
  const kx = avatar.x + 70 * (avatar.facing ?? 1) + Math.sin(t * 0.9) * 18;
  const ky = avatar.y - 170 + Math.sin(t * 1.7) * 14;
  ctx.save();
  ctx.strokeStyle = 'rgba(43,45,66,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(avatar.x + 12 * (avatar.facing ?? 1), avatar.y - 30);
  ctx.quadraticCurveTo(kx - 20, ky + 80, kx, ky + 26);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  if (!drawSprite(ctx, `world/toys/kite-${frameAt(t, 4, 3)}.svg`, kx, ky + 30)) drawKiteShape(ctx, kx, ky);
  ctx.restore();
  ctx.restore();
}

// The sled under Ilo while sliding (world/toys/sled-<n>.svg).
export function drawSled(ctx, x, y, time) {
  if (drawSprite(ctx, `world/toys/sled-${frameAt(time, 8, 2)}.svg`, x, y + 6)) return;
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ellipse(ctx, x, y + 2, 24, 9, '#e63946');
  ctx.restore();
}
