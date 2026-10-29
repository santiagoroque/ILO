// The furniture sets from delivery 2 (Phase 13, DESIGN_PROMPT_2.md Part 7):
// Coast, Science lab, Crafts, Cozy, Play and Garden. Sizes, how each piece
// is placed and what it does when Ilo uses it, plus shape drawings until the
// designers' pictures arrive (furniture/<id>.svg). js/furniture.js merges
// these with the first twelve pieces.
//
//   wall     hangs on the back wall      ceiling  hangs from above the wall
//   flat     can be walked over          anim     frames of a gentle loop
//   use      what happens when Ilo uses it: sit (Ilo sits on it), toggle
//            (on/off), play (moves for a few seconds), bounce, music

import { drawStamp } from './stamps.js';

const OUTLINE = '#2b2d42';

export const SET_FURNITURE = {
  // Coast
  hammock: { width: 150, depth: 50, height: 70, solid: true, use: 'sit', seat: -34 },
  'bamboo-chair': { width: 54, depth: 36, height: 80, solid: true, use: 'sit', seat: -30 },
  'shell-lamp': { width: 30, depth: 24, height: 60, solid: true, use: 'toggle', glow: 44 },
  fishbowl: { width: 50, depth: 30, height: 50, solid: true, anim: 3 },
  surfboard: { width: 50, depth: 10, height: 120, solid: false, wall: true },
  'bird-of-paradise': { width: 44, depth: 24, height: 90, solid: true },
  // Science lab
  'lab-bench': { width: 140, depth: 56, height: 80, solid: true, anim: 3 },
  'newton-cradle': { width: 50, depth: 24, height: 40, solid: true, use: 'play', frames: 4 },
  'pendulum-clock': { width: 50, depth: 30, height: 150, solid: true, anim: 3 },
  'model-rocket': { width: 40, depth: 40, height: 100, solid: true, use: 'play', frames: 3 },
  'solar-mobile': { width: 90, depth: 10, height: 80, solid: false, wall: true, ceiling: true, anim: 3 },
  microscope: { width: 36, depth: 24, height: 50, solid: true },
  // Crafts
  'talavera-vase': { width: 34, depth: 30, height: 60, solid: true },
  alebrije: { width: 50, depth: 40, height: 60, solid: true },
  'papel-picado': { width: 200, depth: 10, height: 60, solid: false, wall: true, anim: 3 },
  'textile-cushion': { width: 60, depth: 40, height: 30, solid: false, flat: true },
  'cempasuchil-pot': { width: 40, depth: 30, height: 50, solid: true },
  pinata: { width: 50, depth: 10, height: 70, solid: false, wall: true, ceiling: true, use: 'play', frames: 3 },
  // Cozy
  sofa: { width: 160, depth: 60, height: 70, solid: true, use: 'sit', seat: -26 },
  fireplace: { width: 140, depth: 10, height: 120, solid: false, wall: true, anim: 3, glow: 60 },
  'bunk-bed': { width: 110, depth: 60, height: 160, solid: true },
  'record-player': { width: 50, depth: 40, height: 50, solid: true, use: 'music', frames: 3 },
  'wall-clock': { width: 50, depth: 10, height: 50, solid: false, wall: true },
  'window-seat': { width: 140, depth: 60, height: 70, solid: true, use: 'sit', seat: -26 },
  // Play
  trampoline: { width: 100, depth: 70, height: 40, solid: true, use: 'bounce' },
  'toy-box': { width: 70, depth: 44, height: 50, solid: true, use: 'toggle' },
  'mini-slide': { width: 120, depth: 60, height: 90, solid: true },
  'ball-pit': { width: 130, depth: 90, height: 40, solid: true },
  'ping-pong': { width: 160, depth: 90, height: 60, solid: true },
  'arcade-mini': { width: 60, depth: 40, height: 110, solid: true, anim: 3 },
  // Garden
  'potted-cactus': { width: 34, depth: 30, height: 60, solid: true },
  'hanging-plants': { width: 80, depth: 10, height: 70, solid: false, wall: true, ceiling: true },
  'aquarium-big': { width: 180, depth: 50, height: 120, solid: true, anim: 3 },
  'bird-cage-open': { width: 50, depth: 30, height: 90, solid: true, anim: 3 },
  lantern: { width: 26, depth: 26, height: 50, solid: true, anim: 3, glow: 40 },
  'fountain-small': { width: 80, depth: 50, height: 60, solid: true, anim: 3 },
  // Pieces of the hangout rooms on the Market street (not sold in the shop)
  'juice-counter': { width: 260, depth: 60, height: 90, solid: true, anim: 3 },
  stool: { width: 40, depth: 30, height: 50, solid: true, use: 'sit', seat: -36 },
  'fruit-crate': { width: 70, depth: 44, height: 50, solid: true },
  'fruit-board': { width: 200, depth: 10, height: 90, solid: false, wall: true },
  stage: { width: 400, depth: 120, height: 130, solid: true },
  'dance-floor': { width: 320, depth: 200, height: 10, solid: false, flat: true, anim: 4 },
  speaker: { width: 60, depth: 44, height: 110, solid: true, anim: 2 },
  marimba: { width: 140, depth: 50, height: 70, solid: true, use: 'melody', frames: 3 },
  'trophy-wall': { width: 420, depth: 10, height: 150, solid: false, wall: true },
  'giant-magnet': { width: 120, depth: 60, height: 130, solid: true },
  'museum-pendulum': { width: 100, depth: 100, height: 220, solid: true, anim: 4 },
  'planet-models': { width: 140, depth: 60, height: 120, solid: true, anim: 3 },
  'lever-display': { width: 160, depth: 50, height: 70, solid: true },
  'sled-exhibit': { width: 160, depth: 60, height: 60, solid: true },
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
function legs(ctx, w, h, color = '#7a4e2d') {
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2 + 4, -h, 6, h);
  ctx.fillRect(w / 2 - 10, -h, 6, h);
}
function leaf(ctx, x, y, length, width, angle, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(length / 2, 0, length / 2, width, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Draws a piece around its ground point (0, 0). `state` is what using it
// did: { on } for toggles, { playing } (0 to 1) while it moves.
export function drawSetFurniture(ctx, id, time, state = {}) {
  const wobble = Math.sin(time * 3);
  const playing = state.playing ?? 0;
  switch (id) {
    case 'hammock':
      shadow(ctx, 150);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-74, -70, 8, 70);
      ctx.fillRect(66, -70, 8, 70);
      ctx.fillStyle = '#e76f51';
      ctx.beginPath();
      ctx.moveTo(-66, -60);
      ctx.quadraticCurveTo(0, -10 + wobble * 2, 66, -60);
      ctx.quadraticCurveTo(0, -30 + wobble * 2, -66, -60);
      ctx.fill();
      ctx.stroke();
      break;
    case 'bamboo-chair':
      shadow(ctx, 54);
      box(ctx, -24, -80, 48, 46, '#d9c27a', 8);
      box(ctx, -26, -40, 52, 14, '#e9d8a6', 4);
      legs(ctx, 52, 26, '#b59a52');
      break;
    case 'shell-lamp':
      shadow(ctx, 30);
      box(ctx, -12, -10, 24, 10, '#c8754a', 3);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-2, -34, 4, 26);
      ctx.fillStyle = state.on ? '#ffe08a' : '#fff1e0';
      ctx.beginPath();
      ctx.moveTo(-16, -34);
      ctx.quadraticCurveTo(0, -70, 16, -34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'fishbowl':
      shadow(ctx, 50);
      circle(ctx, 0, -24, 23, 'rgba(111,195,240,0.75)');
      ctx.fillStyle = '#f4a261';
      for (const k of [0, 1]) {
        const fx = Math.sin(time * 1.4 + k * 2) * 10;
        ctx.beginPath();
        ctx.ellipse(fx, -26 + k * 8, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'surfboard':
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.ellipse(0, -60, 18, 58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2bb3a3';
      ctx.fillRect(-4, -110, 8, 100);
      break;
    case 'bird-of-paradise':
      shadow(ctx, 44);
      box(ctx, -15, -28, 30, 28, '#c8754a', 4);
      for (const a of [-2.3, -1.6, -0.9]) leaf(ctx, 0, -28, 46, 9, a, '#3f8f3a');
      ctx.fillStyle = '#ff8c42';
      ctx.beginPath();
      ctx.moveTo(4, -76);
      ctx.lineTo(24, -86);
      ctx.lineTo(10, -70);
      ctx.fill();
      break;
    case 'lab-bench':
      shadow(ctx, 140);
      box(ctx, -70, -60, 140, 16, '#e9ecef', 4);
      legs(ctx, 140, 44, '#8d99ae');
      for (const [x, c] of [[-40, '#2bb3a3'], [0, '#e63946'], [36, '#8e6bd6']]) {
        box(ctx, x - 8, -86, 16, 26, 'rgba(255,255,255,0.8)', 4);
        ctx.fillStyle = c;
        ctx.fillRect(x - 6, -72, 12, 10);
        if (Math.sin(time * 4 + x) > 0) circle(ctx, x + 2, -94 - (time * 20 + x) % 10, 2, c);
      }
      break;
    case 'newton-cradle': {
      shadow(ctx, 50);
      box(ctx, -24, -6, 48, 6, '#3d405b', 2);
      ctx.strokeStyle = '#8d99ae';
      ctx.strokeRect(-22, -40, 44, 34);
      ctx.strokeStyle = OUTLINE;
      const swing = playing ? Math.sin(time * 9) : 0;
      for (let i = 0; i < 5; i++) {
        let x = -16 + i * 8;
        if (i === 0 && swing < 0) x += swing * 10;
        if (i === 4 && swing > 0) x += swing * 10;
        ctx.beginPath();
        ctx.moveTo(-16 + i * 8, -40);
        ctx.lineTo(x, -16);
        ctx.stroke();
        circle(ctx, x, -14, 4, '#c0c7cf');
      }
      break;
    }
    case 'pendulum-clock': {
      shadow(ctx, 50);
      box(ctx, -24, -150, 48, 150, '#8b5a33', 6);
      circle(ctx, 0, -124, 16, '#fff3d6');
      const a = Math.sin(time * Math.PI) * 0.3; // One swing per second.
      ctx.beginPath();
      ctx.moveTo(0, -100);
      ctx.lineTo(Math.sin(a) * 50, -100 + Math.cos(a) * 50);
      ctx.stroke();
      circle(ctx, Math.sin(a) * 50, -100 + Math.cos(a) * 50, 7, '#e9c46a');
      break;
    }
    case 'model-rocket': {
      shadow(ctx, 40);
      const hop = playing ? Math.sin(playing * Math.PI) * 30 : 0;
      ctx.fillStyle = '#3d405b';
      ctx.fillRect(-16, -8, 32, 8);
      box(ctx, -10, -96 - hop, 20, 80, '#f1faee', 10);
      circle(ctx, 0, -70 - hop, 5, '#4aa3e8');
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.moveTo(-10, -96 - hop);
      ctx.lineTo(0, -114 - hop);
      ctx.lineTo(10, -96 - hop);
      ctx.fill();
      if (playing) circle(ctx, 0, -10, 10 + playing * 10, 'rgba(220,220,220,0.8)');
      break;
    }
    case 'solar-mobile':
    case 'pinata':
    case 'hanging-plants': {
      // Hangs on a string from above the wall.
      const swing = id === 'pinata' && playing ? Math.sin(time * 8) * 0.4 : Math.sin(time) * 0.05;
      ctx.save();
      ctx.rotate(swing);
      ctx.beginPath();
      ctx.moveTo(0, -80);
      ctx.lineTo(0, -40);
      ctx.stroke();
      if (id === 'pinata') {
        ctx.fillStyle = '#ff6f91';
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
          const r = i % 2 ? 10 : 24;
          ctx.lineTo(Math.cos(a) * r, -18 + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (id === 'solar-mobile') {
        ctx.beginPath();
        ctx.moveTo(-40, -40);
        ctx.lineTo(40, -40);
        ctx.stroke();
        circle(ctx, 0, -30, 9, '#ffd166');
        const turn = time * 0.6;
        [[-36, '#4aa3e8'], [-18, '#e07a5f'], [20, '#d4b483'], [38, '#a3a3a3']].forEach(([x, c]) => circle(ctx, x * Math.cos(turn), -26, 5, c));
      } else {
        box(ctx, -18, -40, 36, 22, '#c8754a', 4);
        for (const a of [0.9, 1.6, 2.2]) leaf(ctx, 0, -20, 30, 6, a, '#4fa845');
      }
      ctx.restore();
      break;
    }
    case 'microscope':
      shadow(ctx, 36);
      box(ctx, -16, -8, 32, 8, '#3d405b', 2);
      box(ctx, -4, -48, 10, 40, '#e9ecef', 3);
      box(ctx, -14, -26, 22, 5, '#8d99ae', 2);
      break;
    case 'talavera-vase':
      shadow(ctx, 34);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -22, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#1d4e89';
      ctx.lineWidth = 2;
      for (const y of [-32, -22, -12]) {
        ctx.beginPath();
        ctx.arc(0, y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.5;
      for (const [x, c] of [[-6, '#e63946'], [4, '#ffd166'], [10, '#ff6f91']]) circle(ctx, x, -50, 5, c);
      break;
    case 'alebrije':
      shadow(ctx, 50);
      ctx.fillStyle = '#8e6bd6';
      ctx.beginPath();
      ctx.ellipse(0, -26, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      circle(ctx, 20, -42, 10, '#ff8c42');
      for (const [x, c] of [[-10, '#ffd166'], [0, '#2bb3a3'], [10, '#e63946']]) circle(ctx, x, -26, 3, c);
      ctx.fillStyle = '#2bb3a3';
      ctx.beginPath();
      ctx.moveTo(-20, -28);
      ctx.lineTo(-34, -46);
      ctx.lineTo(-24, -22);
      ctx.fill();
      ctx.stroke();
      legs(ctx, 36, 14, '#e63946');
      break;
    case 'papel-picado':
      ctx.beginPath();
      ctx.moveTo(-100, -54);
      ctx.quadraticCurveTo(0, -40, 100, -54);
      ctx.stroke();
      ['#e63946', '#ffd166', '#2bb3a3', '#8e6bd6', '#ff8c42', '#4aa3e8'].forEach((c, i) => {
        const x = -85 + i * 34;
        const y = -50 + Math.abs(x) * -0.06 + 6;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(time * 2 + i) * 0.08);
        box(ctx, -12, 0, 24, 26, c, 2);
        ctx.restore();
      });
      break;
    case 'textile-cushion':
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -18, 30, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e76f51';
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = '#ffd166';
      for (let x = -30; x < 30; x += 10) ctx.fillRect(x, -34, 4, 32);
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(0, -18, 30, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'cempasuchil-pot':
      shadow(ctx, 40);
      box(ctx, -16, -24, 32, 24, '#c8754a', 4);
      for (const [x, y] of [[-10, -32], [0, -40], [10, -32], [-4, -46], [8, -46]]) circle(ctx, x, y, 7, '#f4a024');
      break;
    case 'sofa':
      shadow(ctx, 160);
      box(ctx, -80, -70, 160, 40, '#457b9d', 12);
      box(ctx, -76, -38, 152, 26, '#5b8fb9', 8);
      box(ctx, -86, -56, 18, 46, '#457b9d', 8);
      box(ctx, 68, -56, 18, 46, '#457b9d', 8);
      break;
    case 'fireplace': {
      box(ctx, -70, -120, 140, 120, '#9aa5ab', 6);
      box(ctx, -44, -76, 88, 70, '#3d405b', 30);
      const flicker = Math.sin(time * 9) * 3;
      ctx.fillStyle = '#f4a024';
      ctx.beginPath();
      ctx.moveTo(-24, -10);
      ctx.quadraticCurveTo(0, -60 - flicker, 24, -10);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.quadraticCurveTo(0, -40 + flicker, 12, -10);
      ctx.fill();
      break;
    }
    case 'bunk-bed':
      shadow(ctx, 110);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-55, -160, 8, 160);
      ctx.fillRect(47, -160, 8, 160);
      box(ctx, -52, -120, 104, 22, '#e9c46a', 6);
      box(ctx, -52, -40, 104, 22, '#4aa3e8', 6);
      for (let y = -150; y < -20; y += 22) ctx.fillRect(40, y, 14, 4); // Ladder
      break;
    case 'record-player': {
      shadow(ctx, 50);
      box(ctx, -24, -36, 48, 30, '#8b5a33', 4);
      legs(ctx, 44, 8);
      ctx.save();
      ctx.translate(-4, -38);
      ctx.scale(1, 0.4);
      circle(ctx, 0, 0, 16, '#1d2340');
      ctx.rotate(playing ? time * 6 : 0);
      ctx.fillStyle = '#e63946';
      ctx.fillRect(-2, -12, 4, 6);
      ctx.restore();
      break;
    }
    case 'wall-clock':
      circle(ctx, 0, -26, 22, '#fff3d6');
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(0, -40);
      ctx.moveTo(0, -26);
      ctx.lineTo(10, -26);
      ctx.stroke();
      break;
    case 'window-seat':
      shadow(ctx, 140);
      box(ctx, -70, -50, 140, 50, '#b5794a', 6);
      box(ctx, -66, -66, 132, 18, '#e76f51', 8);
      break;
    case 'trampoline':
      shadow(ctx, 100);
      ctx.fillStyle = '#3d405b';
      ctx.fillRect(-44, -18, 6, 18);
      ctx.fillRect(38, -18, 6, 18);
      ctx.fillStyle = '#4aa3e8';
      ctx.beginPath();
      ctx.ellipse(0, -24, 50, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1d2340';
      ctx.beginPath();
      ctx.ellipse(0, -24, 38, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'toy-box':
      shadow(ctx, 70);
      box(ctx, -34, -40, 68, 40, '#e76f51', 4);
      if (state.on) {
        box(ctx, -34, -64, 68, 14, '#f4a261', 4); // Lid open, toys peeking out
        circle(ctx, -12, -42, 7, '#4aa3e8');
        circle(ctx, 8, -44, 6, '#ffd166');
      } else {
        box(ctx, -36, -48, 72, 12, '#f4a261', 4);
      }
      break;
    case 'mini-slide':
      shadow(ctx, 120);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-56, -90, 8, 90);
      for (let y = -80; y < -10; y += 16) ctx.fillRect(-60, y, 16, 4);
      ctx.fillStyle = '#ff7f6e';
      ctx.beginPath();
      ctx.moveTo(-48, -90);
      ctx.quadraticCurveTo(10, -80, 56, -6);
      ctx.lineTo(40, -2);
      ctx.quadraticCurveTo(0, -60, -48, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'ball-pit':
      shadow(ctx, 130);
      box(ctx, -65, -40, 130, 40, '#4aa3e8', 10);
      ['#e63946', '#ffd166', '#2bb3a3', '#8e6bd6', '#ff8c42'].forEach((c, i) => {
        for (const k of [0, 1, 2]) circle(ctx, -52 + i * 26 + k * 6, -38 - (k % 2) * 6, 6, c);
      });
      break;
    case 'ping-pong':
      shadow(ctx, 160);
      box(ctx, -80, -60, 160, 22, '#2a9d8f', 4);
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(0, -38);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      box(ctx, -2, -72, 4, 14, '#ffffff', 1);
      legs(ctx, 150, 38, '#3d405b');
      break;
    case 'arcade-mini': {
      shadow(ctx, 60);
      box(ctx, -28, -110, 56, 110, '#457b9d', 8);
      const glow = 0.7 + Math.sin(time * 4) * 0.3;
      box(ctx, -20, -96, 40, 30, `rgba(111,195,240,${glow})`, 4);
      circle(ctx, -8, -52, 5, '#e63946');
      circle(ctx, 8, -52, 4, '#ffd166');
      break;
    }
    case 'potted-cactus':
      shadow(ctx, 34);
      box(ctx, -14, -22, 28, 22, '#e07a5f', 4);
      box(ctx, -8, -60, 16, 40, '#4c9a52', 8);
      box(ctx, 6, -48, 10, 16, '#4c9a52', 5);
      break;
    case 'aquarium-big': {
      shadow(ctx, 180);
      box(ctx, -86, -40, 172, 40, '#7a4e2d', 4);
      box(ctx, -88, -120, 176, 80, 'rgba(111,195,240,0.85)', 6);
      const tx = Math.sin(time * 0.6) * 50;
      ctx.fillStyle = '#6a994e';
      ctx.beginPath();
      ctx.ellipse(tx, -80, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const [x, c] of [[-60, '#ff7f6e'], [60, '#ffd166']]) circle(ctx, x, -52, 10, c);
      break;
    }
    case 'bird-cage-open':
      shadow(ctx, 50);
      ctx.fillStyle = '#7a4e2d';
      ctx.fillRect(-3, -70, 6, 70);
      box(ctx, -22, -92, 44, 26, '#e9c46a', 6);
      if (Math.sin(time * 0.5) > 0.3) circle(ctx, 8, -98, 7, '#a0522d'); // A visiting bird
      break;
    case 'lantern': {
      shadow(ctx, 26);
      box(ctx, -12, -44, 24, 36, '#c0c7cf', 4);
      const glow = 0.6 + Math.sin(time * 6) * 0.2;
      ctx.fillStyle = `rgba(255, 209, 102, ${glow})`;
      ctx.fillRect(-8, -40, 16, 28);
      break;
    }
    case 'fountain-small':
      shadow(ctx, 80);
      box(ctx, -40, -30, 80, 30, '#1d4e89', 10);
      ctx.fillStyle = '#9fd8ef';
      ctx.fillRect(-34, -28, 68, 8);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.quadraticCurveTo(10, -60 + Math.sin(time * 5) * 3, 20, -30);
      ctx.stroke();
      break;
    // ---- Hangout rooms ----
    case 'juice-counter':
      shadow(ctx, 260);
      box(ctx, -130, -70, 260, 70, '#ff9f1c', 6);
      box(ctx, -134, -78, 268, 12, '#fff3d6', 4);
      for (const [x, c] of [[-80, '#e63946'], [-20, '#ffd166'], [40, '#6a994e']]) {
        box(ctx, x - 12, -112, 24, 34, 'rgba(255,255,255,0.85)', 6);
        ctx.fillStyle = c;
        ctx.fillRect(x - 10, -100 + Math.abs(Math.sin(time * 6 + x)) * 4, 20, 16);
      }
      break;
    case 'stool':
      shadow(ctx, 40);
      ctx.fillStyle = '#3d405b';
      ctx.fillRect(-3, -40, 6, 40);
      box(ctx, -18, -48, 36, 10, '#e63946', 5);
      break;
    case 'fruit-crate':
      shadow(ctx, 70);
      box(ctx, -34, -34, 68, 34, '#c99a5e', 3);
      for (const [x, c] of [[-20, '#ff8c42'], [-4, '#e63946'], [12, '#ffd166'], [26, '#6a994e']]) circle(ctx, x, -38, 8, c);
      break;
    case 'fruit-board':
      box(ctx, -100, -90, 200, 90, '#2f3e46', 6);
      for (const [x, c] of [[-60, '#ff8c42'], [-10, '#e63946'], [40, '#ffd166']]) {
        circle(ctx, x, -50, 12, c);
        ctx.strokeStyle = '#e9ecef';
        ctx.beginPath();
        ctx.moveTo(x + 18, -50);
        ctx.lineTo(x + 34, -50);
        ctx.stroke();
        ctx.strokeStyle = OUTLINE;
      }
      break;
    case 'stage':
      shadow(ctx, 400);
      box(ctx, -200, -50, 400, 50, '#8a6238', 6);
      box(ctx, -200, -130, 30, 80, '#c1121f', 4);
      box(ctx, 170, -130, 30, 80, '#c1121f', 4);
      box(ctx, -206, -140, 412, 16, '#e63946', 6);
      break;
    case 'dance-floor': {
      // Tiles light up in patterns; under Ilo while dancing they all glow.
      const colors = ['#e63946', '#ffd166', '#2bb3a3', '#8e6bd6'];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
          const on = state.lit || Math.sin(time * 4 + row * 1.7 + col * 2.3) > 0.2;
          ctx.fillStyle = on ? colors[(row + col) % 4] : '#3d405b';
          ctx.fillRect(-160 + col * 64, -200 + row * 50, 62, 48);
        }
      }
      ctx.strokeRect(-160, -200, 320, 200);
      break;
    }
    case 'speaker': {
      shadow(ctx, 60);
      box(ctx, -30, -110, 60, 110, '#2b2d42', 6);
      const pulse = 1 + Math.abs(Math.sin(time * 8)) * 0.15;
      circle(ctx, 0, -78, 14 * pulse, '#8d99ae');
      circle(ctx, 0, -32, 20 * pulse, '#8d99ae');
      break;
    }
    case 'marimba': {
      shadow(ctx, 140);
      legs(ctx, 130, 40);
      ['#8a6238', '#9c6b3c', '#a47148', '#b5794a', '#c48a4a', '#d09c5a'].forEach((c, i) => {
        const hit = playing && Math.floor(time * 6) % 6 === i;
        box(ctx, -66 + i * 22, -66 + (hit ? 3 : 0), 18, 30 - i * 2, hit ? '#ffd166' : c, 3);
      });
      break;
    }
    case 'trophy-wall': {
      box(ctx, -210, -150, 420, 150, '#e9d8a6', 8);
      const earned = state.stamps ?? [];
      for (let i = 0; i < 16; i++) {
        const x = -180 + (i % 8) * 51;
        const y = -116 + Math.floor(i / 8) * 66;
        box(ctx, x - 22, y - 26, 44, 52, '#fff8e6', 4);
        const stamp = earned[i];
        if (stamp) drawStamp(ctx, stamp.icon, x, y, 36, true, stamp.id);
      }
      break;
    }
    case 'giant-magnet':
      shadow(ctx, 120);
      box(ctx, -40, -14, 80, 14, '#3d405b', 3);
      ctx.lineWidth = 26;
      ctx.strokeStyle = '#d9534f';
      ctx.beginPath();
      ctx.arc(0, -70, 34, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#4a7fc1';
      ctx.beginPath();
      ctx.moveTo(-34, -70);
      ctx.lineTo(-34, -30);
      ctx.moveTo(34, -70);
      ctx.lineTo(34, -30);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = OUTLINE;
      for (const [x, y] of [[-34, -16], [34, -16], [-30, -6]]) {
        ctx.strokeStyle = '#8d99ae';
        ctx.strokeRect(x - 5, y - 8, 10, 16); // Paper clips stuck to it
      }
      ctx.strokeStyle = OUTLINE;
      break;
    case 'museum-pendulum': {
      shadow(ctx, 100);
      ctx.fillStyle = '#c0c7cf';
      ctx.beginPath();
      ctx.ellipse(0, -10, 50, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const a = Math.sin(time * 1.2) * 0.35;
      const bx = Math.sin(a) * 170;
      ctx.beginPath();
      ctx.moveTo(0, -220);
      ctx.lineTo(bx, -50);
      ctx.stroke();
      circle(ctx, bx, -44, 14, '#e9c46a');
      break;
    }
    case 'planet-models': {
      shadow(ctx, 140);
      box(ctx, -70, -20, 140, 20, '#8a6238', 4);
      circle(ctx, 0, -70, 20, '#ffd166');
      [[40, '#4aa3e8', 1], [60, '#e07a5f', 0.7], [80, '#d4b483', 0.45]].forEach(([r, c, speed]) => {
        circle(ctx, Math.cos(time * speed) * r * 0.8, -70 + Math.sin(time * speed) * r * 0.3, 7, c);
      });
      break;
    }
    case 'lever-display':
      shadow(ctx, 160);
      box(ctx, -80, -20, 160, 20, '#8a6238', 4);
      ctx.fillStyle = '#3d405b';
      ctx.beginPath();
      ctx.moveTo(30, -20);
      ctx.lineTo(40, -38);
      ctx.lineTo(50, -20);
      ctx.fill();
      ctx.save();
      ctx.translate(40, -40);
      ctx.rotate(-0.15);
      box(ctx, -110, -4, 150, 8, '#e9c46a', 3);
      ctx.restore();
      box(ctx, 50, -68, 26, 22, '#9aa5ab', 8); // A rock on the short end
      break;
    case 'sled-exhibit':
      shadow(ctx, 160);
      box(ctx, -80, -24, 160, 24, '#d6eef8', 4);
      box(ctx, -40, -50, 80, 20, '#e63946', 8);
      break;
    default:
      break;
  }
}
