// Draws residents, their speech bubbles (with a small portrait) and the
// bouncing "something to do here" sparkle. Pictures: world/residents/
// <id>-<animation>-<n>.svg and <id>-portrait.svg; shapes until they exist.
import { RESIDENT_FRAMES, residentAnim } from './residents.js';
import { drawSprite, frameAt, reducedMotion } from './sprites.js';

const OUTLINE = '#2b2d42';
const FONT = "'Nunito', system-ui, sans-serif";

function ellipse(ctx, x, y, rx, ry, fill, stroke = true) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) ctx.stroke();
}

// Body color, belly color and a few extras per species.
const LOOK = {
  owl: { body: '#8d6e63', belly: '#ffffff', head: '#8d6e63' },
  tortoise: { body: '#6a994e', belly: '#e9d8a6', head: '#a3b18a' },
  capybara: { body: '#a47148', belly: '#c89f72', head: '#a47148' },
  manatee: { body: '#9aa5b1', belly: '#c9d1d9', head: '#9aa5b1' },
  hummingbird: { body: '#2a9d8f', belly: '#e76f51', head: '#2a9d8f' },
  'snowy-owl': { body: '#f1faee', belly: '#ffffff', head: '#f1faee' },
};

function drawShape(ctx, r, anim, time) {
  const look = LOOK[r.info.species] ?? LOOK.capybara;
  const bob = anim === 'talk' ? Math.sin(time * 10) * 2 : Math.sin(time * 2) * 1;
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  const small = r.info.species === 'hummingbird';
  const k = small ? 0.6 : 1;
  ctx.save();
  if (small) ctx.translate(0, -40 + Math.sin(time * 4) * 4); // It hovers.
  ellipse(ctx, 0, -32 * k + bob, 26 * k, 32 * k, look.body);
  ellipse(ctx, 0, -26 * k + bob, 16 * k, 20 * k, look.belly, false);
  ellipse(ctx, 0, -72 * k + bob, 20 * k, 18 * k, look.head);
  for (const dx of [-7, 7]) ellipse(ctx, dx * k, -74 * k + bob, 3 * k, 3.5 * k, OUTLINE, false);
  // A waving arm
  const wave = anim === 'wave' ? Math.sin(time * 14) * 0.6 : 0;
  ctx.save();
  ctx.translate(22 * k, -40 * k + bob);
  ctx.rotate(-0.8 + wave);
  ellipse(ctx, 0, -10 * k, 6 * k, 14 * k, look.body);
  ctx.restore();
  // What each one wears or carries
  switch (r.info.species) {
    case 'owl':
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      for (const dx of [-7, 7]) {
        ctx.beginPath();
        ctx.arc(dx, -74 + bob, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-26, -46 + bob, 8, 30);
      ctx.fillRect(18, -46 + bob, 8, 30); // Lab coat edges
      break;
    case 'tortoise':
      ellipse(ctx, 0, -84 + bob, 28, 6, '#e9c46a'); // Straw hat
      ellipse(ctx, 0, -92 + bob, 13, 9, '#e9c46a');
      break;
    case 'capybara':
      ctx.fillStyle = '#6b8f3a';
      ctx.fillRect(-20, -52 + bob, 40, 20); // Ranger vest
      ctx.strokeRect(-20, -52 + bob, 40, 20);
      break;
    case 'manatee':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-16, -96 + bob, 32, 10); // Captain's cap
      ctx.strokeRect(-16, -96 + bob, 32, 10);
      ctx.fillStyle = '#1d3557';
      ctx.fillRect(-18, -88 + bob, 36, 5);
      break;
    case 'hummingbird':
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.moveTo(10, -44 + bob);
      ctx.lineTo(28, -42 + bob);
      ctx.lineTo(10, -40 + bob);
      ctx.fill();
      ellipse(ctx, -14, -28 + bob, 14, 4 + Math.abs(Math.sin(time * 30)) * 6, 'rgba(255,255,255,0.6)');
      break;
    case 'snowy-owl':
      ellipse(ctx, 0, -86 + bob, 18, 10, '#e63946'); // Wool hat
      ctx.fillStyle = '#457b9d';
      ctx.fillRect(-20, -58 + bob, 40, 8); // Scarf
      ctx.strokeRect(-20, -58 + bob, 40, 8);
      break;
    default:
      break;
  }
  ctx.restore();
}

export function drawResident(ctx, r, time) {
  const t = reducedMotion ? 0 : time;
  const anim = residentAnim(r, time);
  const frame = frameAt(t, 6, RESIDENT_FRAMES[anim]);
  if (drawSprite(ctx, `world/residents/${r.id}-${anim}-${frame}.svg`, r.x, r.y)) return;
  ctx.save();
  ctx.translate(r.x, r.y);
  drawShape(ctx, r, anim, t);
  ctx.restore();
}

// Splits text into lines that fit `width`.
function wrap(ctx, text, width) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// A speech bubble over a resident: portrait on the left, then the words.
export function drawResidentBubble(ctx, r, text, name, scale = 1) {
  ctx.font = `700 15px ${FONT}`;
  const lines = wrap(ctx, text, 230);
  const w = 64 + Math.max(...lines.map((l) => ctx.measureText(l).width), ctx.measureText(name).width) + 16;
  const h = Math.max(58, 30 + lines.length * 19);
  const x = Math.min(Math.max(r.x - w / 2, 8), 1280 - w - 8);
  const y = Math.max(r.y - 120 * scale - h, 8); // Above the resident, drawn `scale` times its size.
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 16);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
  // Portrait
  if (!drawSprite(ctx, `world/residents/${r.id}-portrait.svg`, x + 32, y + 50, { scale: 0.45 })) {
    const look = LOOK[r.info.species] ?? LOOK.capybara;
    ellipse(ctx, x + 32, y + 29, 20, 20, look.head);
    for (const dx of [-6, 6]) ellipse(ctx, x + 32 + dx, y + 27, 3, 3.5, OUTLINE, false);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#28617e';
  ctx.font = `800 13px ${FONT}`;
  ctx.fillText(name, x + 62, y + 8);
  ctx.fillStyle = OUTLINE;
  ctx.font = `700 15px ${FONT}`;
  lines.forEach((l, i) => ctx.fillText(l, x + 62, y + 25 + i * 19));
}

// A small bouncing sparkle: something here the kid has not tried yet
// (ui/todo-sparkle-<n>.svg).
export function drawTodo(ctx, x, y, time) {
  const t = reducedMotion ? 0 : time;
  const bounce = Math.abs(Math.sin(t * 3)) * 6;
  if (drawSprite(ctx, `ui/todo-sparkle-${frameAt(t, 4, 3)}.svg`, x, y - bounce)) return;
  ctx.save();
  ctx.translate(x, y - 10 - bounce);
  ctx.fillStyle = '#ffd166';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    const rr = i % 2 ? 4 : 10;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
