// Checks that the art in assets/ covers everything the game draws, so a new
// delivery (npm run import-art) cannot quietly drop a picture. Missing art is
// not a crash (the shape version is drawn), but it should be noticed.
// Run with: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { critterArtFile, CRITTER_FRAMES, HOLES } from '../js/critters.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const art = readJson('../assets/anchors.json');
const items = readJson('../world/items.json');
const stamps = readJson('../world/stamps.json');
const worldData = readJson('../world/world.json');
const rooms = worldData.rooms.map(({ id }) => readJson(`../world/rooms/${id}.json`));
const missing = (files) => files.filter((file) => !art[file]);
// What the first delivery (Direction 06) drew. Everything added for delivery 2
// (DESIGN_PROMPT_2.md) is drawn as shapes until its pictures arrive, so only
// the first delivery's pieces must have art here.
const FIRST = {
  clothing: ['cap', 'flower', 'beanie', 'explorer', 'crown', 'glasses', 'sunglasses', 'goggles', 'scarf', 'bowtie', 'medal', 'hoodie',
    'labcoat', 'vest', 'sneakers', 'boots', 'magnifier', 'wrench'],
  pets: ['fox', 'meerkat', 'hare'],
  houseStyles: ['cabin', 'adobe', 'icecabin'],
  rooms: ['plaza', 'forest-trail', 'lever-glade', 'mushroom-hollow', 'savannah-trail', 'drone-post', 'waterhole', 'snowy-ridge', 'ice-slide',
    'frozen-lake', 'house', 'shop-inside', 'drone-post-inside', 'ice-slide-inside', 'lever-workshop-inside',
    'palm-beach', 'mangrove-boardwalk', 'coral-lookout', 'waterfall-cove'], // The Coast's missing pieces are in AWAITING_ART.
  stamps: ['first-delivery', 'smooth-stopper', 'lever-pro', 'young-scientist', 'applied-scientist', 'explorer', 'world-traveler', 'pet-friend',
    'decorator', 'chatterbox', 'dancer', 'snow-champion', 'gem-finder', 'gem-master', 'stylish'],
};
const first = (list, kind) => list.filter((x) => FIRST[kind].includes(x.id));

test('every avatar frame and every clothing item in every frame has art', () => {
  const frames = [];
  for (const view of ['side', 'front', 'back']) {
    for (const [anim, count] of [['idle', 2], ['walk', 4], ['sit', 1]]) {
      for (let i = 1; i <= count; i++) frames.push(`${view}-${anim}-${i}`);
    }
  }
  for (let i = 1; i <= 4; i++) frames.push(`front-dance-${i}`);
  assert.deepEqual(missing(frames.map((f) => `avatar/ilo-${f}.svg`)), []);
  assert.deepEqual(missing(first(items.clothing, 'clothing').flatMap((c) => frames.map((f) => `clothing/animated/${c.id}-${f}.svg`))), []);
});

test('every pet, furniture piece, stamp and emote has art', () => {
  const pets = first(items.pets, 'pets').flatMap((p) => ['idle-1', 'idle-2', 'hop-1', 'hop-2', 'hop-3', 'happy-1', 'happy-2', 'sad-1'].map((s) => `pets/${p.id}-${s}.svg`));
  assert.deepEqual(missing(pets), []);
  const classic = items.furniture.filter((f) => (f.set ?? 'classic') === 'classic');
  assert.deepEqual(missing(classic.flatMap((f) => [`furniture/${f.id}.svg`, `furniture/ghost/${f.id}.svg`])), []);
  assert.deepEqual(missing(first(stamps.stamps, 'stamps').flatMap((s) => [`stamps/${s.icon}.svg`, `stamps/${s.icon}-locked.svg`])), []);
  const phrases = readJson('../world/phrases.json');
  assert.deepEqual(missing(phrases.emotes.map((e) => `avatar/emotes/${e.id}.svg`)), []);
});

test('every room piece has art: ground, decorations, buildings, arcades, interiors', () => {
  const files = new Set();
  for (const room of rooms.filter((r) => FIRST.rooms.includes(r.id))) {
    // Indoor rooms use a wall and floor instead (below); the sea is drawn in code with wave strips.
    for (const area of room.areas ?? []) if (!['indoor', 'sea'].includes(area.type)) files.add(`world/textures/${area.type}.svg`);
    for (const d of [...(room.decorations ?? []), ...(room.scatter ?? [])]) {
      if (d.type === 'waterfall') files.add('world/water/waterfall-1.svg'); // An animation only
      else files.add(['pond', 'ice-lake', 'lagoon'].includes(d.type) ? `world/water/${d.type}.svg` : `world/decorations/${d.type}.svg`);
    }
    for (const s of room.stations ?? []) {
      if (s.style === 'arcade') ['', '-highlight', '-1', '-2', '-3'].forEach((state) => files.add(`world/stations/arcade-${s.lesson}${state}.svg`));
      else if (s.style === 'counter') files.add('world/stations/counter.svg');
      else ['', '-highlight', '-soon'].forEach((state) => files.add(`world/buildings/${s.style}${state}.svg`));
    }
    if (room.interior) {
      files.add(`world/walls/${room.interior}-wall.svg`);
      files.add(`world/textures/indoor-${room.interior}.svg`);
    }
  }
  for (const style of first(items.houseStyles, 'houseStyles')) files.add(`world/walls/${style.id}-wall.svg`);
  assert.deepEqual(missing([...files]), []);
});

test('every frame of the animals delivered in round A has its picture, under the designers\' names', () => {
  const roundA = ['butterfly', 'songbird', 'squirrel', 'firefly', 'meerkat', 'bird-flock', 'elephant', 'snow-hare', 'seal', 'pigeon', 'duck', 'jumping-fish'];
  const files = roundA.flatMap((type) => Object.entries(CRITTER_FRAMES[type]).flatMap(([anim, count]) => [0, 1, 2].flatMap((variant) =>
    Array.from({ length: count }, (_, i) => critterArtFile({ type, anim, variant }, i + 1)))));
  assert.deepEqual(missing([...new Set(files)]), []);
  assert.deepEqual(missing(Object.values(HOLES).map((h) => `world/critters/${h}.svg`)), []);
});

test('the lesson pictures from round A are all there', () => {
  const lessonsDir = ['gravity', 'friction', 'heat', 'magnets', 'magnet-poles', 'lever'].map((id) => readJson(`../lessons/${id}.json`));
  assert.deepEqual(missing(lessonsDir.flatMap((l) => l.warmups.map((w) => w.picture).filter(Boolean))), []); // Some are hidden until redrawn (K08).
  assert.deepEqual(missing(['stamps/applied-scientist.svg', 'stamps/applied-scientist-locked.svg', 'minigames/magnets/background.svg',
    'minigames/heat/background.svg', 'minigames/heat/thermometer.svg', 'world/water/sea-edge-1.svg']), []);
});
