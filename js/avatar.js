// Draws Ilo, the kid's avatar: an original round mascot with a body color
// and up to six clothing items (head, face, neck, body, feet, hand).
// (x, y) is where its feet touch the ground. Every clothing id in
// world/items.json needs a drawing here (a test checks).

import { drawSprite, frameAt, hasArt, reducedMotion, spriteReady } from './sprites.js';

export const DEFAULT_LOOK ={ color: 'teal', head: null, face: null, neck: null, body: null, feet: null, hand: null };
const OUTLINE = '#2b2d42';

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(Math.min(255, Math.max(0, c + (amount > 0 ? (255 - c) : c) * amount)));
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

export function colorOf(items, colorId) {
  return items.colors.find((c) => c.id === colorId)?.color ?? items.colors[0].color;
}

function ellipse(ctx, x, y, rx, ry, fill, stroke = true) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) ctx.stroke();
}

const bodyPath = (ctx) => {
  ctx.beginPath();
  ctx.ellipse(0, -22, 18, 20, 0, 0, Math.PI * 2);
};

// Layer order from the art delivery: body, then feet, body, neck, head,
// face and hand items.
const ART_SLOTS = ['feet', 'body', 'neck', 'head', 'face', 'hand'];
const BELLY = '#ffffff66'; // See-through white, so it suits every color.

// Draws Ilo from the art in assets/. Returns false if the pictures are not
// ready yet (then the shape version below is drawn instead).
function drawAvatarArt(ctx, x, y, look, items, { facing, walk, view, action, time, scale }) {
  let anim = 'idle';
  let frame = frameAt(time, 2, 2);
  if (action?.type === 'dance') {
    view = 'front'; // Dancing always faces the kid.
    anim = 'dance';
    frame = frameAt(time, 8, 4);
  } else if (action?.type === 'sit') {
    anim = 'sit';
    frame = 1;
  } else if (walk) {
    anim = 'walk';
    frame = Math.floor(((walk % (Math.PI * 2)) / (Math.PI * 2)) * 4) + 1; // Two steps per loop.
  }
  // Wearing something not drawn yet (delivery 2): use the shape version of
  // Ilo, so the item still shows.
  if (ART_SLOTS.some((slot) => look[slot] && !hasArt(`clothing/animated/${look[slot]}-side-idle-1.svg`))) return false;
  const colors = { '#FF00FF': colorOf(items, look.color), '#FF80FF': BELLY };
  const body = `avatar/ilo-${view}-${anim}-${frame}.svg`;
  const layers = ART_SLOTS.map((slot) => look[slot] && `clothing/animated/${look[slot]}-${view}-${anim}-${frame}.svg`)
    .filter((file) => file && hasArt(file));
  if (!spriteReady(body, colors) || !layers.every((file) => spriteReady(file))) return false;
  const flip = view === 'side' && facing < 0;
  drawSprite(ctx, body, x, y, { scale, flip, colors });
  for (const file of layers) drawSprite(ctx, file, x, y, { scale, flip });
  if (anim === 'dance' && !reducedMotion) drawSprite(ctx, `avatar/music-notes-${frameAt(time, 4, 3)}.svg`, x, y, { scale });
  return true;
}

// Options: facing (1 right, -1 left), walk (step phase, 0 when standing),
// view ('side', 'front' walking down, 'back' walking up), action
// ({ type: 'dance' } or { type: 'sit' }), time (seconds, for dancing), scale.
export function drawAvatar(ctx, x, y, look, items, { facing = 1, walk = 0, view = 'side', action = null, time = 0, scale = 1 } = {}) {
  if (drawAvatarArt(ctx, x, y, look, items, { facing, walk, view, action, time, scale })) return;
  const body = colorOf(items, look.color);
  const f = view === 'side' ? facing : 0; // Where the face and belly point.
  const hand = view === 'side' ? facing : 1; // Which side the held item is on.
  const back = view === 'back';
  const sitting = action?.type === 'sit';
  const dancing = action?.type === 'dance';
  let bob = Math.abs(Math.sin(walk)) * 3;
  let tilt = walk ? Math.sin(walk) * 0.08 : 0; // A little waddle.
  if (dancing) {
    bob = Math.abs(Math.sin(time * 9)) * 8;
    tilt = Math.sin(time * 9) * 0.22;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(tilt);
  if (sitting) ctx.translate(0, 7); // Sit down a little lower.

  // Feet (and shoes). Sitting: feet stick out in front.
  for (const side of [-1, 1]) {
    const lift = walk ? Math.max(0, Math.sin(walk + (side > 0 ? Math.PI : 0))) * 4 : 0;
    const fx = sitting ? side * 10 : side * 8;
    ellipse(ctx, fx, sitting ? -1 : -3 - lift, 6, 4, shade(body, -0.35));
    if (look.feet) CLOTHING[look.feet]?.(ctx, f, side, sitting ? -2 : lift);
  }

  ctx.translate(0, -bob);

  // Ears
  for (const side of [-1, 1]) {
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(side * 11, -38, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Body and belly (no belly from behind)
  ctx.fillStyle = body;
  bodyPath(ctx);
  ctx.fill();
  if (!back) ellipse(ctx, f * 2, -16, 11, 11, shade(body, 0.55), false);

  // Body clothing is clipped to the round body.
  if (look.body && CLOTHING[look.body]) {
    ctx.save();
    bodyPath(ctx);
    ctx.clip();
    CLOTHING[look.body](ctx, f);
    ctx.restore();
  }
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  bodyPath(ctx);
  ctx.stroke();

  if (back) {
    // A small tail is all you see of the back.
    ellipse(ctx, 0, -8, 5, 4, shade(body, -0.2));
  } else {
    const eyeShift = f * 3;
    for (const side of [-1, 1]) {
      ctx.lineWidth = 1.5;
      ellipse(ctx, side * 6 + eyeShift, -28, 4.5, 5.5, '#ffffff');
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(side * 6 + eyeShift + f * 1.5, -27.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const side of [-1, 1]) ellipse(ctx, side * 11 + eyeShift, -20, 3.5, 2.2, 'rgba(255,120,140,0.55)', false);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (dancing) ctx.arc(eyeShift, -22, 4, 0, Math.PI); // Big happy smile.
    else ctx.arc(eyeShift, -22, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  ctx.lineWidth = 2.5;
  for (const slot of ['neck', 'face', 'head', 'hand']) {
    if (!look[slot] || (back && slot === 'face')) continue;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    CLOTHING[look[slot]]?.(ctx, slot === 'hand' ? hand : (back ? -facing : f));
    ctx.restore();
  }
  ctx.restore();

  // Music notes while dancing
  if (dancing) {
    ctx.save();
    ctx.fillStyle = OUTLINE;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    for (const [dx, phase] of [[-26, 0], [26, 0.5]]) {
      const p = (time * 0.8 + phase) % 1;
      const nx = x + dx * scale;
      const ny = y - (55 + p * 30) * scale;
      ctx.globalAlpha = 1 - p;
      ctx.beginPath();
      ctx.ellipse(nx, ny, 4, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(nx + 3.5, ny);
      ctx.lineTo(nx + 3.5, ny - 13);
      ctx.lineTo(nx + 9, ny - 10);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function hasClothingDrawing(id) {
  return id in CLOTHING;
}

// One small drawing function per clothing item. The avatar's face is
// around y = -28, its neck around y = -15 and its feet at y = 0.
const CLOTHING = {
  // ---- Head ----
  cap(ctx, f) {
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(0, -37, 13, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, f * 14, -37, 9, 3, '#e63946');
  },
  beanie(ctx) {
    ctx.fillStyle = '#457b9d';
    ctx.beginPath();
    ctx.arc(0, -36, 14, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f1faee';
    ctx.fillRect(-14, -39, 28, 5);
    ctx.strokeRect(-14, -39, 28, 5);
    ellipse(ctx, 0, -51, 5, 5, '#f1faee');
  },
  explorer(ctx) {
    ellipse(ctx, 0, -37, 22, 5, '#c8a165');
    ctx.fillStyle = '#c8a165';
    ctx.beginPath();
    ctx.ellipse(0, -43, 12, 9, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6b4f2a';
    ctx.fillRect(-12, -41, 24, 3);
  },
  flower(ctx, f) {
    ctx.save();
    ctx.translate(-f * 10, -39);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.lineWidth = 1.2;
      ellipse(ctx, Math.cos(a) * 5, Math.sin(a) * 5, 4, 4, '#ff8fab');
    }
    ellipse(ctx, 0, 0, 3.5, 3.5, '#ffd166');
    ctx.restore();
  },
  crown(ctx) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(-12, -36);
    ctx.lineTo(-12, -48);
    ctx.lineTo(-6, -42);
    ctx.lineTo(0, -51);
    ctx.lineTo(6, -42);
    ctx.lineTo(12, -48);
    ctx.lineTo(12, -36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 0, -41, 2.2, 2.2, '#e63946', false);
  },
  // ---- Face ----
  glasses(ctx, f) {
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * 6 + f * 3, -28, 5.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(f * 3 - 0.5, -28);
    ctx.lineTo(f * 3 + 0.5, -28);
    ctx.stroke();
  },
  sunglasses(ctx, f) {
    for (const side of [-1, 1]) ellipse(ctx, side * 6 + f * 3, -28, 6, 4.5, '#1d1d2c');
    ctx.beginPath();
    ctx.moveTo(f * 3 - 1, -29);
    ctx.lineTo(f * 3 + 1, -29);
    ctx.stroke();
  },
  goggles(ctx, f) {
    ctx.fillStyle = '#3d405b';
    ctx.fillRect(-18, -31, 36, 5);
    ctx.fillStyle = 'rgba(111,195,240,0.85)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(f * 3 - 13, -34, 26, 11, 5);
    else ctx.rect(f * 3 - 13, -34, 26, 11);
    ctx.fill();
    ctx.stroke();
  },
  // ---- Neck ----
  scarf(ctx, f) {
    ellipse(ctx, 0, -14, 16, 4.5, '#e63946');
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-f * 9 - 4, -14, 8, 14, 2);
    else ctx.rect(-f * 9 - 4, -14, 8, 14);
    ctx.fill();
    ctx.stroke();
  },
  bowtie(ctx, f) {
    ctx.fillStyle = '#e63946';
    const cx = f * 2;
    ctx.beginPath();
    ctx.moveTo(cx, -14);
    ctx.lineTo(cx - 8, -19);
    ctx.lineTo(cx - 8, -9);
    ctx.closePath();
    ctx.moveTo(cx, -14);
    ctx.lineTo(cx + 8, -19);
    ctx.lineTo(cx + 8, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, cx, -14, 2.5, 2.5, '#b02a35');
  },
  medal(ctx, f) {
    ctx.strokeStyle = '#457b9d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.lineTo(f * 2, -8);
    ctx.lineTo(10, -18);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    ellipse(ctx, f * 2, -6, 5, 5, '#ffd166');
  },
  // ---- Body (clipped to the body circle) ----
  hoodie(ctx, f) {
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(-20, -20, 40, 22);
    ctx.fillStyle = '#d65a3c';
    ctx.fillRect(f * 2 - 8, -10, 16, 7);
    ctx.strokeStyle = '#fff4e6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(f * 2 - 3, -19);
    ctx.lineTo(f * 2 - 3, -13);
    ctx.moveTo(f * 2 + 3, -19);
    ctx.lineTo(f * 2 + 3, -13);
    ctx.stroke();
  },
  labcoat(ctx, f) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-20, -21, 40, 23);
    ctx.strokeStyle = '#b8c4d0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(f * 2 - 7, -21);
    ctx.lineTo(f * 2, -12);
    ctx.lineTo(f * 2 + 7, -21);
    ctx.moveTo(f * 2, -12);
    ctx.lineTo(f * 2, 2);
    ctx.stroke();
    ctx.fillStyle = '#4aa3e8';
    ctx.fillRect(f * 2 + 5, -11, 3, 6);
  },
  vest(ctx, f) {
    ctx.fillStyle = '#c8a165';
    ctx.fillRect(-20, -21, 14 + f * 2, 23);
    ctx.fillRect(6 + f * 2, -21, 14, 23);
    ctx.fillStyle = '#a8844d';
    ctx.fillRect(-16, -10, 8, 6);
    ctx.fillRect(10 + f * 2, -10, 8, 6);
  },
  // ---- Feet (drawn once per foot) ----
  sneakers(ctx, f, side, lift) {
    ellipse(ctx, side * 8 + f * 1, -3 - lift, 7, 4.5, '#ffffff');
    ctx.fillStyle = '#e63946';
    ctx.fillRect(side * 8 + f * 1 - 4, -4 - lift, 8, 2);
  },
  boots(ctx, f, side, lift) {
    ctx.fillStyle = '#7a4e2d';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(side * 8 - 6, -11 - lift, 12, 12, 3);
    else ctx.rect(side * 8 - 6, -11 - lift, 12, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f1faee';
    ctx.fillRect(side * 8 - 6, -12 - lift, 12, 3);
  },
  // ---- Hand (held at the side) ----
  magnifier(ctx, f) {
    const hx = f * 22;
    ctx.strokeStyle = '#7a4e2d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hx, -8);
    ctx.lineTo(hx + f * 4, -18);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;
    ellipse(ctx, hx + f * 7, -25, 7, 7, 'rgba(180,225,250,0.8)');
  },
  wrench(ctx, f) {
    const hx = f * 22;
    ctx.strokeStyle = '#8d99ae';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hx, -6);
    ctx.lineTo(hx + f * 4, -24);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    ctx.fillStyle = '#8d99ae';
    ctx.beginPath();
    ctx.arc(hx + f * 5, -27, 6, Math.PI * 0.2, Math.PI * 1.8);
    ctx.fill();
    ctx.stroke();
  },

  // ---- Delivery 2 (Phase 13, DESIGN_PROMPT_2.md Part 9) ----
  'sun-hat'(ctx) {
    ellipse(ctx, 0, -37, 24, 5, '#e9c46a');
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.ellipse(0, -42, 12, 8, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff7f6e';
    ctx.fillRect(-12, -41, 24, 3);
  },
  'party-hat'(ctx) {
    ctx.fillStyle = '#8e6bd6';
    ctx.beginPath();
    ctx.moveTo(-10, -37);
    ctx.lineTo(0, -60);
    ctx.lineTo(10, -37);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 0, -61, 4, 4, '#ffd166');
    ellipse(ctx, -2, -46, 2, 2, '#ffd166', false);
  },
  'marigold-crown'(ctx) {
    for (const x of [-12, -6, 0, 6, 12]) {
      ctx.lineWidth = 1.2;
      ellipse(ctx, x, -38 - (Math.abs(x) < 7 ? 3 : 0), 4.5, 4.5, '#f4a024');
      ellipse(ctx, x, -38 - (Math.abs(x) < 7 ? 3 : 0), 2, 2, '#e76f51', false);
    }
  },
  headlamp(ctx, f) {
    ctx.fillStyle = '#3d405b';
    ctx.fillRect(-14, -40, 28, 4);
    ellipse(ctx, f * 6, -38, 5, 4, '#ffd166');
  },
  snorkel(ctx, f) {
    ctx.lineWidth = 2;
    ellipse(ctx, f * 3, -28, 13, 7, 'rgba(160, 220, 245, 0.7)');
    ctx.strokeStyle = '#ff9f1c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-f * 12, -28);
    ctx.lineTo(-f * 14, -48);
    ctx.stroke();
  },
  'star-glasses'(ctx, f) {
    for (const side of [-1, 1]) {
      const cx = side * 6 + f * 3;
      ctx.fillStyle = '#ff8fab';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        const r = i % 2 ? 2.5 : 6;
        ctx.lineTo(cx + Math.cos(a) * r, -28 + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  },
  'shell-necklace'(ctx) {
    ctx.strokeStyle = '#c99a5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -18, 10, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.2;
    for (const a of [0.3, 0.5, 0.7]) ellipse(ctx, Math.cos(a * Math.PI) * 10, -18 + Math.sin(a * Math.PI) * 10, 2.5, 2, '#fff1e0');
  },
  bandana(ctx, f) {
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(10, -18);
    ctx.lineTo(f * 2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, f * 2, -14, 1.5, 1.5, '#ffd166', false);
  },
  'rash-guard'(ctx) {
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(-30, -30, 60, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-30, -12, 60, 4);
  },
  poncho(ctx) {
    ['#e63946', '#ffd166', '#2a9d8f', '#8e6bd6'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(-30, -24 + i * 7, 60, 7);
    });
  },
  sandals(ctx, f, side, lift) {
    ellipse(ctx, side * 8 + f, -2 - lift, 7, 3, '#c99a5e');
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(side * 8 - 4, -5 - lift, 8, 2);
  },
  'rain-boots'(ctx, f, side, lift) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(side * 8 - 6, -13 - lift, 12, 14, 3);
    else ctx.rect(side * 8 - 6, -13 - lift, 12, 14);
    ctx.fill();
    ctx.stroke();
  },
  'butterfly-net'(ctx, f) {
    const hx = f * 22;
    ctx.strokeStyle = '#7a4e2d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hx, -4);
    ctx.lineTo(hx + f * 6, -40);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    ellipse(ctx, hx + f * 8, -48, 8, 9, 'rgba(255,255,255,0.7)');
  },
  'juice-cup'(ctx, f) {
    const hx = f * 22;
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(hx - 6, -26);
    ctx.lineTo(hx + 6, -26);
    ctx.lineTo(hx + 4, -8);
    ctx.lineTo(hx - 4, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(hx + 2, -26);
    ctx.lineTo(hx + 6, -36);
    ctx.stroke();
  },
};
