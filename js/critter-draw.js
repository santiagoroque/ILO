// Draws the wild animals from js/critters.js. Each one uses the designers'
// picture (world/critters/<type>-<animation>-<n>.svg) when it exists, and a
// simple shape drawing until then.
import { critterArtFile, critterFrame, HOLES, isVisible } from './critters.js';
import { drawSprite, reducedMotion } from './sprites.js';

const OUTLINE = '#2b2d42';

function ellipse(ctx, x, y, rx, ry, fill, stroke = true) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) ctx.stroke();
}

function shadow(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHole(ctx, c) {
  const hole = HOLES[c.type];
  if (drawSprite(ctx, `world/critters/${hole}.svg`, c.home.x, c.home.y + 6)) return;
  ellipse(ctx, c.home.x, c.home.y, 20, 8, hole === 'ice-hole' ? '#1f5f8b' : '#6b4a2b');
  ctx.strokeStyle = hole === 'ice-hole' ? '#ffffff' : '#c9a64c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(c.home.x, c.home.y, 22, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// Shape drawings, around the animal's ground point (0, 0), facing right.
const SHAPES = {
  butterfly(ctx, c, time) {
    const flap = Math.abs(Math.sin(time * 14 + c.variant));
    const color = ['#4ea8de', '#ffd166', '#ff8c42'][c.variant];
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) ellipse(ctx, side * 5 * (0.3 + flap), -2, 6 * (0.3 + flap), 5, color);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(-1, -6, 2, 9);
  },
  firefly(ctx, c, time) {
    const glow = 0.4 + 0.6 * Math.abs(Math.sin(time * 2 + c.variant * 2));
    ctx.fillStyle = `rgba(255, 236, 140, ${0.25 * glow})`;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 240, 160, ${glow})`;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  },
  songbird(ctx, c, time) {
    if (!c.flying) shadow(ctx, 0, 0, 9);
    const peck = c.anim === 'peck' && Math.sin(time * 6 + c.variant) > 0.6 ? 4 : 0;
    ellipse(ctx, 0, -9, 9, 7, '#a0522d');
    ellipse(ctx, 2, -7, 5, 4, '#e76f51', false);
    ellipse(ctx, 7, -14 + peck, 5, 5, '#a0522d');
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.moveTo(11, -14 + peck);
    ctx.lineTo(16, -12 + peck);
    ctx.lineTo(11, -11 + peck);
    ctx.fill();
    if (c.flying) {
      const up = Math.sin(time * 18) * 8;
      ellipse(ctx, -2, -14 - up, 8, 3, '#8b4423');
    }
  },
  pigeon(ctx, c, time) {
    if (!c.flying) shadow(ctx, 0, 0, 10);
    const peck = c.anim === 'peck' && Math.sin(time * 5 + c.variant) > 0.5 ? 5 : 0;
    ellipse(ctx, 0, -9, 10, 7, '#9aa5b1');
    ellipse(ctx, 7, -15 + peck, 5, 5, '#7d8a99');
    ellipse(ctx, 5, -11 + peck, 3, 2, '#6fb08f', false);
    ctx.fillStyle = '#e07a5f';
    ctx.fillRect(11, -15 + peck, 4, 2);
    if (c.flying) {
      const up = Math.sin(time * 16) * 9;
      ellipse(ctx, -2, -15 - up, 10, 3, '#b8c1cc');
    }
  },
  squirrel(ctx, c, time) {
    shadow(ctx, 0, 0, 12);
    const hop = c.anim === 'run' ? Math.abs(Math.sin(time * 14)) * 5 : 0;
    ctx.save();
    ctx.translate(0, -hop);
    ctx.fillStyle = '#b5651d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.bezierCurveTo(-26, -10, -24, -34, -10, -30);
    ctx.bezierCurveTo(-16, -24, -12, -16, -4, -12);
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 0, -10, 9, 7, '#c8742a');
    ellipse(ctx, 8, -17, 5, 5, '#c8742a');
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(10, -18, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  'snow-hare'(ctx, c, time) {
    shadow(ctx, 0, 0, 12);
    const hop = c.anim === 'hop' ? Math.abs(Math.sin(time * 10)) * 8 : 0;
    ctx.save();
    ctx.translate(0, -hop);
    ctx.lineWidth = 2;
    ellipse(ctx, 0, -10, 11, 8, '#ffffff');
    ellipse(ctx, 9, -17, 6, 5, '#ffffff');
    for (const dx of [6, 10]) {
      ellipse(ctx, dx, -27, 2.5, 7, '#ffffff');
      ellipse(ctx, dx, -32, 2, 2.5, OUTLINE, false);
    }
    ctx.restore();
  },
  meerkat(ctx, c) {
    const rise = c.state === 'up' ? c.progress : c.state === 'down' ? 1 - c.progress : 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-30, -60, 60, 60);
    ctx.clip();
    ctx.translate(0, (1 - rise) * 40);
    ctx.lineWidth = 2;
    ellipse(ctx, 0, -16, 7, 16, '#c9a66b');
    ellipse(ctx, 2, -34, 6, 6, '#c9a66b');
    ellipse(ctx, 4, -35, 2.5, 2, '#5b3a29', false);
    ctx.restore();
  },
  seal(ctx, c) {
    const rise = c.state === 'up' ? c.progress : c.state === 'down' ? 1 - c.progress : 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-30, -50, 60, 50);
    ctx.clip();
    ctx.translate(0, (1 - rise) * 32);
    ctx.lineWidth = 2;
    ellipse(ctx, 0, -12, 11, 14, '#8d99ae');
    ctx.fillStyle = OUTLINE;
    for (const dx of [-4, 4]) {
      ctx.beginPath();
      ctx.arc(dx, -16, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ellipse(ctx, 0, -10, 3, 2, OUTLINE, false);
    ctx.restore();
  },
  duck(ctx, c, time) {
    const bob = Math.sin(time * 3 + c.variant) * 1.5;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ellipse(ctx, 0, -5 + bob, 11, 6, '#f1faee');
    ellipse(ctx, 8, -12 + bob, 5, 5, '#2a9d8f');
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(12, -12 + bob, 5, 3);
  },
  'jumping-fish'(ctx, c) {
    ctx.save();
    ctx.translate(0, -c.z);
    ctx.rotate((c.progress - 0.5) * 1.6);
    ctx.lineWidth = 2;
    ellipse(ctx, 0, 0, 10, 5, '#ff9f1c');
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-16, -6);
    ctx.lineTo(-16, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    if (c.progress < 0.2 || c.progress > 0.8) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  elephant(ctx, c, time) {
    // A grown-up and a calf walking behind.
    for (const [dx, k] of [[0, 1], [-78, 0.6]]) {
      ctx.save();
      ctx.translate(dx, 0);
      ctx.scale(k, k);
      shadow(ctx, 0, 0, 48);
      const step = c.anim === 'walk' ? Math.sin(time * 5 + dx) * 4 : 0;
      ctx.fillStyle = '#9aa0a6';
      ctx.lineWidth = 2.5;
      for (const [lx, s] of [[-28, 1], [-12, -1], [14, 1], [28, -1]]) {
        ctx.fillRect(lx - 6 + step * s * 0.5, -30, 12, 30);
        ctx.strokeRect(lx - 6 + step * s * 0.5, -30, 12, 30);
      }
      ellipse(ctx, 0, -48, 44, 28, '#a8adb3');
      ellipse(ctx, 40, -58, 18, 18, '#a8adb3');
      ellipse(ctx, 30, -58, 12, 16, '#b9bdc2');
      const drink = c.anim === 'drink' ? 14 : 0;
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#a8adb3';
      ctx.beginPath();
      ctx.moveTo(52, -54);
      ctx.quadraticCurveTo(64, -36 + drink, 58, -18 + drink);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.restore();
    }
  },
  crab(ctx, c, time) {
    shadow(ctx, 0, 0, 12);
    const snap = c.anim === 'snap' ? Math.abs(Math.sin(time * 6)) * 3 : 0;
    const step = c.anim === 'walk' ? Math.sin(time * 16) * 2 : 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    for (const side of [-1, 1]) {
      for (const k of [0, 1, 2]) {
        ctx.beginPath();
        ctx.moveTo(side * 6, -6);
        ctx.lineTo(side * (12 + k * 2), -1 + (k % 2 ? step : -step));
        ctx.stroke();
      }
      ellipse(ctx, side * 11, -14 - snap, 4, 3, '#e5533d');
    }
    ellipse(ctx, 0, -7, 9, 6, '#e5533d');
    for (const dx of [-3, 3]) ellipse(ctx, dx, -13, 1.6, 1.6, OUTLINE, false);
  },
  heron(ctx, c, time) {
    if (!c.flying) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
    }
    const step = c.anim === 'step' ? Math.sin(time * 6) * 3 : 0;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2 + step, 0);
    ctx.lineTo(0, -22);
    ctx.moveTo(3 - step, 0);
    ctx.lineTo(2, -22);
    ctx.stroke();
    ellipse(ctx, 0, -30, 11, 8, '#c9d6df');
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c9d6df';
    ctx.beginPath();
    ctx.moveTo(6, -34);
    ctx.quadraticCurveTo(14, -42, 8, -50);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ellipse(ctx, 9, -52, 4, 4, '#c9d6df');
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.moveTo(12, -53);
    ctx.lineTo(22, -51);
    ctx.lineTo(12, -50);
    ctx.fill();
    if (c.flying) ellipse(ctx, -2, -36 - Math.sin(time * 10) * 8, 14, 4, '#b8c5ce');
  },
  toucan(ctx, c, time) {
    ctx.lineWidth = 2;
    ellipse(ctx, 0, -12, 8, 11, '#2b2d42');
    ellipse(ctx, 2, -10, 4, 5, '#fff3d6', false);
    ellipse(ctx, 2, -20, 6, 6, '#2b2d42');
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.moveTo(6, -23);
    ctx.quadraticCurveTo(20, -24, 22, -17);
    ctx.quadraticCurveTo(14, -16, 6, -17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (c.flying) ellipse(ctx, -3, -16 - Math.sin(time * 14) * 7, 10, 3, '#3d405b');
    else if (Math.sin(time * 1.3 + c.variant * 2) > 0.95) ctx.fillRect(2, -22, 3, 1); // A blink
  },
  macaw(ctx, c, time) {
    ctx.lineWidth = 2;
    ctx.fillStyle = '#4361ee';
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(-10, 12);
    ctx.lineTo(-2, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 0, -12, 8, 11, '#e63946');
    ellipse(ctx, -2, -10, 5, 6, '#f4c430', false);
    ellipse(ctx, 2, -22, 6, 6, '#e63946');
    ellipse(ctx, 4, -23, 2.5, 2, '#ffffff', false);
    ctx.fillStyle = '#3d405b';
    ctx.beginPath();
    ctx.moveTo(7, -23);
    ctx.quadraticCurveTo(12, -22, 9, -17);
    ctx.closePath();
    ctx.fill();
    if (c.flying) ellipse(ctx, -3, -18 - Math.sin(time * 14) * 8, 12, 3, '#4361ee');
  },
  'sea-turtle'(ctx, c, time) {
    const paddle = Math.sin(time * 3 + c.variant) * 0.5;
    ctx.globalAlpha *= 0.85; // Seen through the water.
    ctx.lineWidth = 2;
    for (const [x, y, a] of [[8, -8, paddle], [8, 8, -paddle], [-10, -6, -paddle], [-10, 6, paddle]]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ellipse(ctx, 0, Math.sign(y) * 4, 4, 7, '#6a994e');
      ctx.restore();
    }
    ellipse(ctx, 16, 0, 5, 4, '#6a994e');
    ellipse(ctx, 0, 0, 14, 11, '#7f5539');
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
  },
  'bird-flock'(ctx, c, time) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    const flap = Math.sin(time * 12) * 4;
    for (let i = 0; i < 7; i++) {
      const row = Math.ceil(i / 2);
      const x = -row * 18;
      const y = (i % 2 ? -1 : 1) * row * 12;
      ctx.beginPath();
      ctx.moveTo(x - 7, y - flap);
      ctx.quadraticCurveTo(x - 3, y - 4, x, y);
      ctx.quadraticCurveTo(x + 3, y - 4, x + 7, y - flap);
      ctx.stroke();
    }
  },
};

export function drawCritters(ctx, critters, time) {
  for (const c of critters) {
    if (c.home) drawHole(ctx, c);
    if (!isVisible(c)) continue;
    const t = reducedMotion ? 0 : time;
    const frame = critterFrame(c, t, c.fps); // A calf takes quicker steps.
    // Flying animals float above their spot; jumping fish handle their own height.
    const lift = c.type === 'jumping-fish' ? 0 : c.z;
    if (drawSprite(ctx, critterArtFile(c, frame), c.x, c.y - lift, { flip: c.facing < 0 })) continue;
    ctx.save();
    ctx.translate(c.x, c.y - lift);
    ctx.scale(c.facing < 0 ? -1 : 1, 1);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    SHAPES[c.type]?.(ctx, c, t);
    ctx.restore();
  }
}
