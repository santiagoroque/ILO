// Loads the art in assets/ (SVG pictures from the design delivery) and draws
// it on a canvas. Each picture is turned into pixels once, so drawing it
// every frame is fast on old computers.
//
// Pictures load in the background. Until one is ready, drawSprite returns
// false and the caller draws its simple shape version instead, so the game
// still works if a file is missing or slow.

const ROOT = new URL('../assets/', import.meta.url);
const RES = 2; // Pixels per game pixel when turning a picture into pixels.

let anchors = {};
const listeners = new Set();
const cache = new Map();

// Turns off decorative loops (fountain water, glowing exits) for kids who
// asked their computer for less motion.
export const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runs `fn` whenever a picture finishes loading, so the page can redraw.
// Returns a function that stops it.
export function onArtLoaded(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Call once at start, before drawing.
export async function loadArt() {
  try {
    const response = await fetch(new URL('anchors.json', ROOT));
    if (response.ok) anchors = await response.json();
  } catch {
    // No art folder: everything is drawn with simple shapes.
  }
}

export const hasArt = (file) => Boolean(anchors[file]);

// Width, height and ground point of a picture: [w, h, anchorX, anchorY].
export const artSize = (file) => anchors[file] ?? null;

function rasterize(image, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * RES);
  canvas.height = Math.ceil(h * RES);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// The avatar is drawn in placeholder colors; swap them for the kid's color.
async function recoloredUrl(file, colors) {
  const response = await fetch(new URL(file, ROOT));
  if (!response.ok) throw new Error(file);
  let svg = await response.text();
  for (const [placeholder, color] of Object.entries(colors)) svg = svg.split(placeholder).join(color);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function load(file, colors) {
  const key = colors ? `${file}|${Object.values(colors).join()}` : file;
  if (cache.has(key)) return cache.get(key);
  const entry = { canvas: null };
  cache.set(key, entry);
  const size = anchors[file];
  if (!size) return entry;
  (colors ? recoloredUrl(file, colors) : Promise.resolve(new URL(file, ROOT).href))
    .then((src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    }))
    .then((image) => {
      entry.canvas = rasterize(image, size[0], size[1]);
      listeners.forEach((fn) => fn());
    })
    .catch(() => {}); // Stay on the shape version.
  return entry;
}

// True when `file` is ready to draw (and starts loading it if not).
export function spriteReady(file, colors = null) {
  return Boolean(anchors[file]) && Boolean(load(file, colors).canvas);
}

// Draws `file` with its ground point at (x, y). Options: scale, flip (mirror
// left-right around the ground point), alpha, colors (placeholder -> color),
// rotate (radians, around the ground point). Returns false if not ready yet.
export function drawSprite(ctx, file, x, y, { scale = 1, flip = false, alpha = 1, colors = null, rotate = 0 } = {}) {
  const size = anchors[file];
  if (!size) return false;
  const { canvas } = load(file, colors);
  if (!canvas) return false;
  const [w, h, ax, ay] = size;
  ctx.save();
  ctx.translate(x, y);
  if (rotate) ctx.rotate(rotate);
  ctx.scale(flip ? -scale : scale, scale);
  if (alpha !== 1) ctx.globalAlpha *= alpha;
  ctx.drawImage(canvas, -ax, -ay, w, h);
  ctx.restore();
  return true;
}

// Draws `file` stretched to fill a box (used for backgrounds and walls).
export function drawSpriteBox(ctx, file, x, y, width, height) {
  if (!anchors[file]) return false;
  const { canvas } = load(file);
  if (!canvas) return false;
  ctx.drawImage(canvas, x, y, width, height);
  return true;
}

// A repeating fill (ground textures). Returns null if not ready yet.
const patterns = new WeakMap();
export function spritePattern(ctx, file) {
  if (!anchors[file]) return null;
  const { canvas } = load(file);
  if (!canvas) return null;
  if (!patterns.has(canvas)) {
    const pattern = ctx.createPattern(canvas, 'repeat');
    if (pattern.setTransform) pattern.setTransform(new DOMMatrix().scale(1 / RES));
    patterns.set(canvas, pattern);
  }
  return patterns.get(canvas);
}

// For small canvases in menus (shop cards, emote buttons): draws now and
// again each time a picture loads, while the canvas is on the page.
export function paintCanvas(canvas, draw) {
  const ctx = canvas.getContext('2d');
  const paint = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    draw(ctx);
    ctx.restore();
  };
  paint();
  const stop = onArtLoaded(() => (canvas.isConnected ? paint() : stop()));
}

// Starts loading every picture whose path starts with `prefix` (for
// example 'world/'), before it is needed.
export function preload(prefix) {
  for (const file of Object.keys(anchors)) if (file.startsWith(prefix)) load(file);
}

// The address of a picture, for <img> tags in menus.
export const artUrl = (file) => new URL(file, ROOT).href;

// Which frame of a loop to show at `time` seconds.
export function frameAt(time, fps, count) {
  if (reducedMotion || !fps) return 1;
  return (Math.floor(time * fps) % count) + 1;
}
