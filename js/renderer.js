// Draws the simulation on the canvas. All positions come in meters.
// Scenery and objects use the minigame art in assets/minigames (50 pixels
// per meter, like the canvas); shapes are drawn while it loads.
import { PLANETS } from './simulation.js';
import { artSize, drawSprite, drawSpriteBox, frameAt, spriteReady } from './sprites.js';

const SCALE = 50; // Canvas pixels per meter.
const GROUND_DEPTH = 0.8; // Meters of ground shown below y = 0.

// Sky color for each place, so kids can see where they are.
const SKIES = {
  moon: ['#1b1f3b', '#3a3f66'],
  mars: ['#d9895b', '#f2c9a0'],
  earth: ['#7cc4f2', '#d8f0ff'],
  jupiter: ['#b9895a', '#ecd2a8'],
};
const GROUNDS = { moon: '#9a9a9a', mars: '#a4512d', earth: '#5c9e4a', jupiter: '#8a6a45' };
const FONT = "'Nunito', system-ui, sans-serif";

// Background and ground pictures for each lesson model.
function sceneryFor(model, place) {
  if (model === 'slide') return ['minigames/friction/background.svg', null];
  if (model === 'lever') return ['minigames/lever/background.svg', 'minigames/lever/ground.svg'];
  return [`minigames/gravity/${place}-background.svg`, `minigames/gravity/${place}-ground.svg`];
}

function placeFor(gravity) {
  return Object.keys(PLANETS).find((p) => PLANETS[p] === gravity) ?? 'earth';
}

export function sizeCanvas(canvas, lesson) {
  canvas.width = lesson.world.width * SCALE;
  canvas.height = (lesson.world.height + GROUND_DEPTH) * SCALE;
}

// `previous` is the last run's result ({ x, label }), drawn faded so the kid
// can compare two settings (Phase 10).
export function drawScene(canvas, snap, lesson, { t, pick, lang, previous = null }) {
  const ctx = canvas.getContext('2d');
  const { width, height } = lesson.world;
  const X = (m) => m * SCALE;
  const Y = (mUp) => (height - mUp) * SCALE;
  const number = (n, digits) => n.toLocaleString(lang, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  const place = placeFor(snap.gravity);
  const tools = { ctx, canvas, X, Y, t, pick, number, previous };
  if (snap.model === 'magnet') return drawMagnetScene(snap, lesson, tools);
  if (snap.model === 'rub') return drawRubScene(snap, lesson, tools);

  // Sky
  const [background, ground] = sceneryFor(snap.model, place);
  if (!drawSpriteBox(ctx, background, 0, 0, canvas.width, Y(0))) {
    const [top, bottom] = SKIES[place];
    const sky = ctx.createLinearGradient(0, 0, 0, Y(0));
    sky.addColorStop(0, top);
    sky.addColorStop(1, bottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, Y(0));
  }

  // Ground with a meter ruler (the slide's ground is snow)
  ctx.fillStyle = snap.model === 'slide' ? '#eef6fb' : GROUNDS[place];
  if (!ground || !drawSpriteBox(ctx, ground, 0, Y(0), canvas.width, canvas.height - Y(0))) {
    ctx.fillRect(0, Y(0), canvas.width, canvas.height - Y(0));
  }
  const rulerColor = snap.model === 'slide' ? '#2b2d42' : 'rgba(255,255,255,0.9)';
  ctx.fillStyle = rulerColor;
  ctx.strokeStyle = rulerColor;
  ctx.font = `700 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let m = 0; m <= width; m++) {
    ctx.beginPath();
    ctx.moveTo(X(m), Y(0));
    ctx.lineTo(X(m), Y(0) + (m % 2 === 0 ? 10 : 5));
    ctx.stroke();
    if (m % 2 === 0 && m > 0 && m < width) ctx.fillText(`${m} ${t('world.meters')}`, X(m), Y(0) + 14);
  }

  if (snap.model === 'slide') drawTrack(ctx, snap.surface, width, X, Y);
  if (snap.model === 'lever') drawLever(ctx, snap.lever, X, Y, { t });

  // Target zones
  for (const zone of lesson.world.zones) {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
    ctx.fillRect(X(zone.x), 0, X(zone.width), Y(0));
    const art = snap.model === 'slide' ? null : 'minigames/gravity/delivery-zone.svg';
    if (!art || !drawSpriteBox(ctx, art, X(zone.x), Y(0) - 240, X(zone.width), 240)) {
      ctx.fillStyle = '#1e9e57';
      ctx.fillRect(X(zone.x), Y(0) - 6, X(zone.width), 10);
    }
    if (snap.model === 'slide') drawSprite(ctx, 'minigames/friction/station.svg', X(zone.x + zone.width / 2), Y(0) + 10);
    drawPlate(ctx, pick(zone.label), X(zone.x + zone.width / 2), 82); // Below the info box.
  }

  // The last run's mark, faded, until this run lands
  if (previous && !Object.keys(snap.landed).length) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    if (!drawSprite(ctx, 'minigames/gravity/landing-marker.svg', X(previous.x), Y(0))) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(X(previous.x) - 2, Y(0) - 60, 4, 60);
    }
    ctx.restore();
    drawPlate(ctx, `${t('lesson.lastTime')}: ${previous.label}`, X(previous.x), Y(0) - 122, 0.75);
  }

  // Landing markers
  for (const [id, landing] of Object.entries(snap.landed)) {
    if (!lesson.world.objects.some((o) => o.id === id)) continue;
    if (drawSprite(ctx, 'minigames/gravity/landing-marker.svg', X(landing.x), Y(0))) {
      drawPlate(ctx, `${number(landing.x, 1)} ${t('world.meters')}`, X(landing.x), Y(0) - 122);
      continue;
    }
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(landing.x), Y(0) - 70);
    ctx.lineTo(X(landing.x), Y(0));
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${number(landing.x, 1)} ${t('world.meters')}`, X(landing.x), Y(0) - 72);
  }

  // Drone
  // The drone's hook holds the top of the package (0.6 m tall).
  if (snap.drone && !drawSprite(ctx, `minigames/gravity/drone-${frameAt(snap.time, 12, 2)}.svg`, X(snap.drone.x), Y(snap.drone.y + 0.3))) {
    const dx = X(snap.drone.x);
    const dy = Y(snap.drone.y + 0.6);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(dx - 28, dy - 6, 56, 12);
    ctx.fillRect(dx - 3, dy + 6, 6, 8);
    ctx.fillStyle = '#95a5a6';
    for (const side of [-1, 1]) {
      ctx.fillRect(dx + side * 30 - 14, dy - 12, 28, 4);
      ctx.fillRect(dx + side * 30 - 2, dy - 10, 4, 6);
    }
  }

  // Objects
  for (const obj of snap.objects) {
    if (obj.hanging) drawRope(ctx, X(obj.x), Y(obj.y) - X(obj.height ?? 0.5) / 2);
    ctx.save();
    ctx.fillStyle = obj.color ?? '#e67e22';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    if (obj.angle) {
      // Objects on the lever tilt with the plank (y up in meters, so -angle).
      ctx.translate(X(obj.x), Y(obj.y));
      ctx.rotate(-obj.angle);
      ctx.translate(-X(obj.x), -Y(obj.y));
    }
    const art = objectArt(obj, snap.model);
    const bottom = Y(obj.y) + X(obj.height ?? 0.6) / 2;
    if (art && drawSprite(ctx, art.file, X(obj.x), bottom, { scale: X(obj.width ?? 0.6) / art.width })) {
      if (obj.shape === 'sled' && obj.v > 0.5) {
        drawSprite(ctx, `minigames/friction/speed-lines-${frameAt(snap.time, 10, 2)}.svg`, X(obj.x) - 45, bottom - 2);
      }
      if (obj.mass && snap.model === 'lever') drawMassLabel(ctx, `${obj.mass} kg`, X(obj.x), bottom - X(obj.height ?? 0.6) / 2);
    } else if (obj.shape === 'sled') {
      drawSled(ctx, X(obj.x), Y(obj.y), X(obj.width ?? 1), X(obj.height ?? 0.5), obj.color);
    } else if (obj.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(X(obj.x), Y(obj.y), X(obj.radius ?? 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      const w = X(obj.width ?? 0.6);
      const h = X(obj.height ?? 0.6);
      ctx.fillRect(X(obj.x) - w / 2, Y(obj.y) - h / 2, w, h);
      ctx.strokeRect(X(obj.x) - w / 2, Y(obj.y) - h / 2, w, h);
      ctx.beginPath(); // Tape on the box
      ctx.moveTo(X(obj.x), Y(obj.y) - h / 2);
      ctx.lineTo(X(obj.x), Y(obj.y) + h / 2);
      ctx.stroke();
      if (obj.mass && snap.model === 'lever') drawMassLabel(ctx, `${obj.mass} kg`, X(obj.x), Y(obj.y));
    }
    ctx.restore();
  }

  // Current gravity and time (top right, away from the drone's start)
  const boxX = canvas.width - 238;
  ctx.fillStyle = 'rgba(255, 247, 223, 0.94)';
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(boxX, 8, 230, 52, 12);
  else ctx.rect(boxX, 8, 230, 52);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b2d42';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `800 15px ${FONT}`;
  const info = snap.model === 'slide' ? t(`surfaces.${snap.surface}`)
    : snap.model === 'lever' ? t('world.fulcrumAt', { x: number(snap.lever.fulcrum, 0) })
      : t(`planets.${place}`);
  ctx.fillText(info, boxX + 8, 14);
  ctx.font = `600 14px ${FONT}`;
  ctx.fillText(`t = ${number(snap.time, 1)} s`, boxX + 8, 36);
}

// Which picture an object uses, and how wide that picture is (to scale it
// to the object's size in meters).
function objectArt(obj, model) {
  if (obj.shape === 'sled') return { file: 'minigames/friction/sled.svg', width: 50 };
  if (model === 'lever' && obj.id === 'rock') return { file: 'minigames/lever/rock.svg', width: 40 };
  if (model === 'lever' && obj.id === 'sandbag') return { file: 'minigames/lever/sandbag.svg', width: 30 };
  if (obj.shape === 'box' && model !== 'lever') return { file: 'minigames/gravity/package.svg', width: 30 };
  return null;
}

// A small paper label with dark text (zone names, landing distances).
function drawPlate(ctx, text, x, y, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `800 14px ${FONT}`;
  const w = ctx.measureText(text).width + 20;
  x = Math.min(Math.max(x, w / 2 + 4), ctx.canvas.width - w / 2 - 4); // Keep it on screen.
  ctx.fillStyle = '#fff7df';
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 12, w, 24, 12);
  else ctx.rect(x - w / 2, y - 12, w, 24);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b2d42';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function drawMassLabel(ctx, text, x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 3;
  ctx.font = `800 12px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

// The braking track for the friction lesson, and the end of the ice slide.
const TRACKS = {
  ice: { fill: '#cfeefe', line: '#ffffff' },
  snow: { fill: '#f7fbff', line: '#d6e6f2' },
  wood: { fill: '#c8915a', line: '#9c6a3c' },
  sand: { fill: '#e8cf8f', line: '#c9ac67' },
};
function drawTrack(ctx, surface, width, X, Y) {
  // The track, and the ice slide the sled comes from (stretched to end
  // where the track starts).
  if (drawSpriteBox(ctx, `minigames/friction/track-${surface}.svg`, X(1.6), Y(0) - 6, X(width) - X(1.6), 12)
    && drawSpriteBox(ctx, 'minigames/friction/ramp.svg', 0, Y(3.5), X(1.7), Y(0) - Y(3.5))) return;
  const style = TRACKS[surface] ?? TRACKS.wood;
  ctx.fillStyle = style.fill;
  ctx.fillRect(X(1.6), Y(0) - 6, X(width), 12);
  ctx.strokeStyle = style.line;
  ctx.lineWidth = 2;
  for (let x = 2; x < width; x += 0.5) {
    ctx.beginPath();
    if (surface === 'sand') ctx.arc(X(x), Y(0) - 1, 1.5, 0, Math.PI * 2);
    else {
      ctx.moveTo(X(x), Y(0) - 6);
      ctx.lineTo(X(x + (surface === 'wood' ? 0 : 0.25)), Y(0) + 6);
    }
    ctx.stroke();
  }
  // The ice slide the sled comes from
  ctx.fillStyle = '#bfe6f5';
  ctx.strokeStyle = '#4f8fb0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, Y(3.5));
  ctx.quadraticCurveTo(X(0.9), Y(0.2), X(1.7), Y(0));
  ctx.lineTo(0, Y(0));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSled(ctx, cx, cy, w, h, color) {
  ctx.fillStyle = color ?? '#e63946';
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cx - w / 2, cy - h / 2, w, h * 0.7, 6);
  else ctx.rect(cx - w / 2, cy - h / 2, w, h * 0.7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy + h / 2 - 2);
  ctx.lineTo(cx + w / 2 + 4, cy + h / 2 - 2);
  ctx.quadraticCurveTo(cx + w / 2 + 12, cy + h / 2 - 2, cx + w / 2 + 10, cy + h / 2 - 12);
  for (const fx of [-0.3, 0.3]) {
    ctx.moveTo(cx + fx * w, cy + h * 0.2);
    ctx.lineTo(cx + fx * w, cy + h / 2 - 2);
  }
  ctx.stroke();
}

// The lever: fulcrum marks on the ground, the triangle and the tilted plank.
function drawLever(ctx, lever, X, Y, { t }) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `800 13px ${FONT}`;
  const f = lever.fulcrum;
  if (drawSprite(ctx, 'minigames/lever/fulcrum.svg', X(f), Y(0), { scale: X(lever.height) / 30 })) {
    for (const option of lever.fulcrumOptions) {
      drawSprite(ctx, `minigames/lever/marker-${option === f ? 'selected' : 'default'}.svg`, X(option), Y(0) + 11);
    }
    ctx.save();
    ctx.translate(X(f), Y(lever.height));
    ctx.rotate(-lever.theta);
    drawSpriteBox(ctx, 'minigames/lever/plank.svg', X(lever.from - f), -5, X(lever.to - lever.from), 10);
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(t('world.fulcrumLabel'), X(f), Y(0) + 24);
    return;
  }
  for (const option of lever.fulcrumOptions) {
    ctx.fillStyle = option === lever.fulcrum ? '#ffd166' : 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(X(option), Y(0) + 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#7a4e2d';
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(X(f), Y(lever.height));
  ctx.lineTo(X(f - 0.4), Y(0));
  ctx.lineTo(X(f + 0.4), Y(0));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.translate(X(f), Y(lever.height));
  ctx.rotate(-lever.theta);
  ctx.fillStyle = '#c8915a';
  ctx.fillRect(X(lever.from - f), -5, X(lever.to - lever.from), 10);
  ctx.strokeRect(X(lever.from - f), -5, X(lever.to - lever.from), 10);
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(t('world.fulcrumLabel'), X(f), Y(0) + 26);
}

function drawRope(ctx, x, y) {
  ctx.strokeStyle = '#ae7950';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = '#ae7950';
  ctx.fillRect(x - 40, 0, 80, 8);
}


// ---- Magnet lessons: a crane with a magnet over a row of objects ----
// Drawn in code in the ILO style until the designers deliver pictures
// (docs/ASSETS.md, "Needed from the designers").
const OUTLINE = '#2b2d42';
const MATERIAL_LOOK = {
  iron: { fill: '#5d5f6b', shine: '#8a8d99' },
  steel: { fill: '#a7adb7', shine: '#e3e7ec' },
  aluminum: { fill: '#d5d9de', shine: '#ffffff' },
  copper: { fill: '#c87533', shine: '#e8a46c' },
  brass: { fill: '#d4a93a', shine: '#f1d47a' },
  wood: { fill: '#b98c59', shine: '#d6b081' },
  plastic: { fill: '#4aa3e8', shine: '#9fd0f5' },
  glass: { fill: 'rgba(170, 220, 240, 0.65)', shine: '#ffffff' },
};

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

const ROOM_FLOOR = 350; // Where the game's floor line sits in the designers' room picture.

// A room for the newer games. Its picture is minigames/<folder>/background.svg
// (docs/DESIGN_PROMPT_2.md, Part 12) when it exists.
function drawRoom(ctx, canvas, floorY, folder = null) {
  // The designers' room (800 x 450) at its own size, placed so the game's
  // floor line falls on its wooden floor (350 px down); the rest of the
  // picture's floor continues below. Lessons shorter than 9 m crop its top.
  if (folder && drawSpriteBox(ctx, `minigames/${folder}/background.svg`, 0, floorY - ROOM_FLOOR, canvas.width, 450)) {
    const below = floorY - ROOM_FLOOR + 450;
    if (below < canvas.height) drawSpriteBox(ctx, `minigames/${folder}/ground.svg`, 0, below, canvas.width, canvas.height - below);
    return;
  }
  const wall = ctx.createLinearGradient(0, 0, 0, floorY);
  wall.addColorStop(0, '#e9dfc4');
  wall.addColorStop(1, '#f6eed9');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, canvas.width, floorY);
  ctx.fillStyle = '#b98c59';
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
  ctx.strokeStyle = 'rgba(43,45,66,0.25)';
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
}

function drawMagnetObject(ctx, o, x, bottom, w, h, t) {
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  if (o.material === 'magnet') {
    // A box with a magnet: the top half shows the pole facing up.
    const up = o.pole ?? 'N';
    const colors = { N: '#d9534f', S: '#4a7fc1' };
    rounded(ctx, x - w / 2, bottom - h, w, h, 6);
    ctx.fillStyle = colors[up === 'N' ? 'S' : 'N'];
    ctx.fill();
    rounded(ctx, x - w / 2, bottom - h, w, h / 2, 6);
    ctx.fillStyle = colors[up];
    ctx.fill();
    rounded(ctx, x - w / 2, bottom - h, w, h, 6);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(h * 0.38)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(up, x, bottom - h * 0.75);
  } else {
    const look = MATERIAL_LOOK[o.material] ?? MATERIAL_LOOK.plastic;
    if (o.shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x, bottom - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else {
      rounded(ctx, x - w / 2, bottom - h, w, h, 5);
    }
    ctx.fillStyle = look.fill;
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = look.shine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w / 4, bottom - h * 0.75);
    ctx.lineTo(x - w / 4 + w * 0.2, bottom - h * 0.75);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMagnetScene(snap, lesson, { ctx, canvas, X, Y, t, pick }) {
  const floor = Y(0);
  drawRoom(ctx, canvas, floor, 'magnets');
  // The crane rail and the bin
  const rail = Y(4.6); // Fixed above the crane's highest point (4 m).
  // The designers' rail runs along the top of the room (their crane is taller).
  const railArt = drawSprite(ctx, 'minigames/magnets/rail.svg', 0, -6);
  if (!railArt) {
    ctx.fillStyle = '#76512f';
    ctx.fillRect(0, rail - 5, canvas.width, 10);
  }
  const binX = X(snap.bin.x);
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  if (!drawSprite(ctx, 'minigames/magnets/recycling-bin.svg', binX, floor)) {
    ctx.fillStyle = '#73844b';
    rounded(ctx, binX - 45, floor - 60, 90, 60, 8);
    ctx.fill();
    ctx.stroke();
  }
  drawLabel(ctx, pick(snap.bin.label ?? { es: t('world.bin'), en: t('world.bin') }), binX, floor - 74);

  // Objects, with their names under them
  const inBin = snap.objects.filter((o) => o.inBin);
  snap.objects.forEach((o, i) => {
    const w = X(o.width ?? 0.6);
    const h = X(o.height ?? 0.4);
    let x = X(o.x + (o.shift ?? 0));
    let bottom = floor - X(o.lift ?? 0);
    if (o.carried) {
      x = X(o.carried.x);
      bottom = Y(o.carried.y);
    } else if (o.inBin) {
      x = binX - 25 + inBin.indexOf(o) * 22;
      bottom = floor - 30;
    }
    // Objects use the designers' pictures at their own size. The box with a
    // magnet stays drawn in code: its colors show which pole faces up.
    const art = MAGNET_OBJECT_ART[o.id];
    if (o.material === 'magnet' || !art || !drawSprite(ctx, `minigames/magnets/${art}.svg`, x, bottom)) drawMagnetObject(ctx, o, x, bottom, w, h, t);
    // Names on two rows, so long names next to each other do not overlap.
    if (!o.inBin && !o.carried) drawLabel(ctx, o.label ? pick(o.label) : o.id, X(o.x + (o.shift ?? 0)), floor + (i % 2 ? 29 : 11), 11);
  });

  // The crane: carriage on the rail, cable, and the magnet. The lesson about
  // poles keeps a bar magnet drawn in code, with the pole facing down shown;
  // the designers' horseshoe magnet has both poles down.
  const cx = X(snap.crane.x);
  const cy = Y(snap.crane.y);
  const down = snap.crane.pole;
  const poles = lesson.toolbox.includes('magnet_pole');
  const info = () => drawInfo(ctx, canvas, [t('world.tripsLeft', { used: snap.crane.used, trips: snap.crane.trips }), t('world.cranePole', { pole: down })]);
  const carriage = railArt && drawSprite(ctx, 'minigames/magnets/carriage.svg', cx, 48, { scale: 0.8 });
  const cableTop = carriage ? 40 : rail;
  const MAGNET_SCALE = 0.75; // So it fits under the rail at the crane's highest point.
  const cableBottom = poles ? cy - 22 : cy - 64 * MAGNET_SCALE;
  if (!drawSpriteBox(ctx, 'minigames/magnets/cable.svg', cx - 8, cableTop, 16, Math.max(0, cableBottom - cableTop))) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cableTop);
    ctx.lineTo(cx, cableBottom);
    ctx.stroke();
  }
  if (!poles && drawSprite(ctx, 'minigames/magnets/magnet.svg', cx, cy, { scale: MAGNET_SCALE })) {
    info();
    return;
  }
  const colors = { N: '#d9534f', S: '#4a7fc1' };
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  rounded(ctx, cx - 26, cy - 22, 52, 11, 4);
  ctx.fillStyle = colors[down === 'N' ? 'S' : 'N'];
  ctx.fill();
  ctx.stroke();
  rounded(ctx, cx - 26, cy - 11, 52, 11, 4);
  ctx.fillStyle = colors[down];
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 10px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(down, cx, cy - 5);
  info();
}

// Draws a picture with a color laid only over its own shape (not the room
// behind it). Returns false if the picture is not ready.
let tintCanvas = null;
function drawTinted(ctx, file, x, y, color) {
  const size = artSize(file);
  if (!size || !spriteReady(file)) return false;
  const [w, h, ax, ay] = size;
  tintCanvas ??= document.createElement('canvas');
  tintCanvas.width = Math.ceil(w * 2);
  tintCanvas.height = Math.ceil(h * 2);
  const c = tintCanvas.getContext('2d');
  c.setTransform(2, 0, 0, 2, 0, 0);
  drawSprite(c, file, ax, ay);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = color;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';
  ctx.drawImage(tintCanvas, x - ax, y - ay, w, h);
  return true;
}

// The designers' file for each object in the magnet lessons.
const MAGNET_OBJECT_ART = {
  clip: 'steel-paper-clip', can: 'aluminum-can', nail: 'iron-nail', key: 'brass-key', cap: 'steel-bottle-cap', spoon: 'plastic-spoon',
  foil: 'aluminum-foil-ball', nut: 'iron-nut', wire: 'copper-wire-coil', pencil: 'wooden-pencil', screw: 'steel-screw', bottle: 'glass-jar',
};

// ---- Friction-and-heat lesson: a block rubbed on a surface, a thermometer ----
const RUB_LOOK = {
  glass: { fill: '#cfeaf5', mark: '#ffffff' },
  wood: { fill: '#c79d68', mark: '#a07a4d' },
  carpet: { fill: '#b65c5c', mark: '#d98080' },
  sandpaper: { fill: '#d8b878', mark: '#a88a4c' },
};

function drawRubScene(snap, lesson, { ctx, canvas, X, Y, t, number, previous }) {
  const floor = Y(0);
  drawRoom(ctx, canvas, floor, 'heat');
  const rub = snap.rub;
  const win = lesson.winCondition;
  // The surface strip
  const look = RUB_LOOK[rub.surface] ?? RUB_LOOK.wood;
  const left = X(2);
  const right = X(10);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  // The designers' strips are 500 x 40; shown 24 tall so the pattern reads.
  const stripArt = drawSpriteBox(ctx, `minigames/heat/surface-${rub.surface}.svg`, left, floor - 24, right - left, 24);
  if (!stripArt) {
    ctx.fillStyle = look.fill;
    rounded(ctx, left, floor - 16, right - left, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = look.mark;
    for (let x = left + 6; x < right - 4; x += 9) ctx.fillRect(x, floor - 11 + ((x / 9) % 2) * 4, 3, 2);
  }

  // The block slides back and forth while rubbing
  const phase = rub.done % 1;
  const swing = rub.done < rub.times ? Math.sin(phase * Math.PI * 2) : 0;
  const bx = X(6) + swing * X(2.5);
  const warm = Math.max(0, Math.min(1, (rub.temperature - rub.startTemperature) / 20));
  const rubbing = rub.done < rub.times && snap.running;
  const seat = floor - (stripArt ? 24 : 16); // Where the block sits.
  // The picture, warmed up with a red tint as it heats; or the drawn block.
  if (!drawTinted(ctx, `minigames/heat/block-${rubbing ? frameAt(rub.done * 3, 1, 3) : 1}.svg`, bx, seat, `rgba(201, 104, 71, ${warm * 0.5})`)) {
    rounded(ctx, bx - 40, floor - 16 - 44, 80, 44, 8);
    ctx.fillStyle = `rgb(${Math.round(201 + 40 * warm)}, ${Math.round(150 - 60 * warm)}, ${Math.round(90 - 50 * warm)})`;
    ctx.fill();
    ctx.stroke();
  }
  const drawnLines = warm > 0.15 && drawSprite(ctx, `minigames/heat/heat-wiggle-${frameAt(rub.done * 2 + warm * 3, 1, 3)}.svg`, bx, seat - 46, { alpha: 0.3 + warm * 0.7 });
  if (warm > 0.15 && !drawnLines) {
    // Heat waves above the block
    ctx.strokeStyle = `rgba(201, 104, 71, ${0.3 + warm * 0.6})`;
    ctx.lineWidth = 3;
    for (const dx of [-18, 0, 18]) {
      ctx.beginPath();
      ctx.moveTo(bx + dx, floor - 66);
      ctx.bezierCurveTo(bx + dx - 8, floor - 76, bx + dx + 8, floor - 86, bx + dx, floor - 96);
      ctx.stroke();
    }
  }

  // Thermometer from 15 to 45 °C with the goal band
  const tx = X(13);
  const top = Y(height(lesson) - 1.8); // Below the info box.
  const bottom = floor - 30;
  const scale = (c) => bottom - ((c - 15) / 30) * (bottom - top);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  // The thermometer's glass (a picture stretched to fit); the level and the
  // goal band stay drawn in code so they match the numbers exactly.
  if (!drawSpriteBox(ctx, 'minigames/heat/thermometer.svg', tx - 20, top - 14, 40, bottom - top + 44)) {
    rounded(ctx, tx - 12, top - 10, 24, bottom - top + 20, 12);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(115, 132, 75, 0.35)';
  ctx.fillRect(tx - 10, scale(win.max), 20, scale(win.min) - scale(win.max));
  ctx.fillStyle = '#c96847';
  ctx.fillRect(tx - 5, scale(Math.min(45, rub.temperature)), 10, bottom - scale(Math.min(45, rub.temperature)) + 8);
  ctx.beginPath();
  ctx.arc(tx, bottom + 14, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OUTLINE;
  ctx.font = `700 11px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let c = 15; c <= 45; c += 5) {
    ctx.fillRect(tx + 12, scale(c), 6, 2);
    ctx.fillText(`${c}°`, tx + 21, scale(c));
  }
  drawLabel(ctx, `${t('world.targetBand')}: ${win.min}-${win.max} °C`, tx - 70, scale((win.min + win.max) / 2), 12);
  if (previous && !snap.running && rub.done === 0) {
    // The last run's temperature, to compare
    ctx.strokeStyle = 'rgba(43,45,66,0.55)';
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(tx - 22, scale(previous.x));
    ctx.lineTo(tx + 12, scale(previous.x));
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, `${t('lesson.lastTime')}: ${previous.label}`, tx - 120, scale(previous.x) - 14, 11);
  }

  drawInfo(ctx, canvas, [
    `${t(`rubSurfaces.${rub.surface}`)}`,
    `${t('world.rubs', { done: Math.floor(rub.done), times: rub.times })} · ${number(rub.temperature, 1)} °C`,
  ]);
}

const height = (lesson) => lesson.world.height;

function drawLabel(ctx, text, x, y, size = 13) {
  ctx.save();
  ctx.font = `800 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + 14;
  x = Math.min(Math.max(x, w / 2 + 2), ctx.canvas.width - w / 2 - 2);
  ctx.fillStyle = '#fff7df';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  rounded(ctx, x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OUTLINE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function drawInfo(ctx, canvas, lines) {
  const boxX = canvas.width - 238;
  ctx.fillStyle = 'rgba(255, 247, 223, 0.94)';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  rounded(ctx, boxX, 8, 230, 20 + lines.length * 18, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OUTLINE;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((line, i) => {
    ctx.font = `${i ? 600 : 800} ${i ? 14 : 15}px ${FONT}`;
    ctx.fillText(line, boxX + 8, 14 + i * 20);
  });
}
