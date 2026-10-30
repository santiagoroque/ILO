// The world page (home): the kid walks Ilo through the rooms of the Forest,
// Savannah, Arctic and the Plaza, enters buildings to play lessons as
// minigames, talks with preset phrases and emotes, dances, throws snowballs,
// finds gems, collects stamps, walks a pet, shops and decorates their house.
import { play, playNote, setEnabled, setTheme, unlock } from './audio.js';
import { DEFAULT_LOOK } from './avatar.js';
import { drawFurniture, FURNITURE } from './furniture.js';
import { furnitureAt, placementOk } from './house.js';
import { lang, loadStrings, mountLanguageSwitch, pick, t, translatePage } from './i18n.js';
import { fetchJson } from './lesson-loader.js';
import { followAvatar } from './pet.js';
import {
  awardStamps, canSave, ownsHouse, claimDaily, claimWelcomeGift, collectGem, getActivePet, getCoins, getHouse, getLook, getPets,
  getSoundOn, getSpotted, getStamps, getStats, getTalked, getWorldPosition, isApplied, isCompleted, ownsItem, petHappiness, recordDance, recordSay,
  getPlayStats, giveItem, recordEvening, recordParty, recordGoal, recordSnowballHit, recordTalk, recordToyUse, recordVisit, spotCritter, setHouse, setSoundOn, setWorldPosition, takePetCelebration, unplacedFurniture,
  WELCOME_GIFT,
} from './progress.js';
import { openShop } from './shop.js';
import { showError } from './show-error.js';
import { loadArt, onArtLoaded, paintCanvas, reducedMotion, spriteReady, unload } from './sprites.js';
import { nearbyRooms, roomFiles } from './room-art.js';
import { createCritters, isVisible, updateCritters } from './critters.js';
import { GUIDE_ANIMALS, openFieldGuide } from './field-guide.js';
import { activeParty, decorateRooms, isPartyRoom } from './parties.js';
import { createResidents, updateResidents } from './residents.js';
import { createToys, ridePose, toyNear, updateToys, usePoint, useToy } from './toys.js';
import { createWeather, darkness, isEvening, updateWeather, weatherFor } from './weather.js';
import { drawStamp, stampEarned } from './stamps.js';
import { drawEmote, drawWorld } from './world-draw.js';
import { openWorldMap } from './world-map.js';
import {
  arrivalPoint, buildRoom, collides, exitAt, findPath, moveWithCollisions, stationNear, withFurniture,
} from './world-data.js';

const SPEED = 240; // Pixels per second.
const BUBBLE_SECONDS = 4;
const GEM_REWARD = 5; // docs/PLAN.md, A18
const DAILY_REWARD = 20;
const SNOW_GRAVITY = 900; // Pixels per second², for the snowball's arc.
const $ = (id) => document.getElementById(id);

await loadStrings();
translatePage();

// ---- Load the world: world.json, every room, items and phrases ----
let worldData;
let rooms;
let items;
let phrases;
let stamps;
let residentData;
let party = null; // Today's seasonal party, if any (js/parties.js).
try {
  worldData = await fetchJson('world/world.json');
  const roomList = await Promise.all(worldData.rooms.map((r) => fetchJson(`world/rooms/${r.id}.json`)));
  rooms = Object.fromEntries(roomList.map((r) => [r.id, r]));
  let parties;
  [items, phrases, stamps, residentData, parties] = await Promise.all(['items', 'phrases', 'stamps', 'residents', 'parties'].map((f) => fetchJson(`world/${f}.json`)));
  party = activeParty(parties.parties, new Date(), new URLSearchParams(location.search).get('party'));
  rooms = decorateRooms(rooms, party); // Party decorations, only while it lasts.
  await loadArt();
} catch (error) {
  $('loading').hidden = true;
  mountLanguageSwitch($('lang-switch'));
  showError($('error'), error, 'errors.mapTitle');
  throw error;
}
const size = { width: worldData.roomWidth, height: worldData.roomHeight };
const built = {}; // Rooms are built once and reused.
const roomById = (id) => (built[id] ??= buildRoom(rooms[id], size));

// ---- State ----
let roomId;
let world; // The current room, with furniture if it is the house.
let critters = []; // Its wild animals (js/critters.js).
let weather = []; // Falling snow, leaves or rain (js/weather.js).
let residents = []; // Residents standing in this room (js/residents.js).
const talked = new Set(getTalked()); // Residents already met (no sparkle over them).
let toys = []; // Physics toys in this room (js/toys.js).
let nearToy = null; // The toy Ilo can use right now.
let ride = null; // The toy Ilo is on (a swing, the sled), or null.
let nearPiece = null; // A piece of furniture Ilo can use right now (a sofa, a lamp).
const furnitureStates = new Map(); // What using each piece did: { on, playUntil }.
const pieceKey = (p) => `${p.id}@${p.x},${p.y}`;
// The time of day follows the clock; ?time=evening (or night, day) shows it
// any time, for testing and for a teacher's demo.
const TIME_OVERRIDE = { day: 0, evening: 0.7, night: 1 }[new URLSearchParams(location.search).get('time')];
const dayOfYear = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
function currentDarkness() {
  if (TIME_OVERRIDE !== undefined) return TIME_OVERRIDE;
  const now = new Date();
  return darkness(now.getHours() + now.getMinutes() / 60);
}
const avatar = { x: 0, y: 0, facing: 1, walk: 0, view: 'side', action: null };
let look = getLook(DEFAULT_LOOK);
let pet = null;
let bubble = null;
let target = null; // The next point to walk to.
let route = []; // The points after that.
let changingRoom = false;
const keys = new Set();
let time = 0;
let dirty = true;
let aiming = false; // Snowball mode, in the Arctic.
const snowballs = [];
const splats = [];

// Every lesson that has a machine somewhere in the world.
const allLessons = [...new Set(Object.values(rooms).flatMap((r) => r.stations.filter((s) => s.kind === 'lesson').map((s) => s.lesson)))];
const totalGems = Object.values(rooms).reduce((n, r) => n + (r.collectibles?.length ?? 0), 0);

// Music for each room: indoor, plaza, or the area's ground type.
const COAST = ['sand', 'jungle', 'sea', 'shallows'];
function themeOf(room) {
  if (room.kind !== 'outdoor') return 'indoor';
  if (room.areas.some((a) => a.type === 'plaza')) return 'plaza';
  return COAST.includes(room.areas[0].type) ? 'coast' : room.areas[0].type;
}
const isArctic = (room) => room.kind === 'outdoor' && room.areas[0].type === 'arctic';

// A machine or building shows one star when every lesson in it is solved
// and two when every changed case is solved too (Phase 10).
function stars(station) {
  let lessons = [];
  if (station.kind === 'lesson') lessons = [station.lesson];
  else if (station.kind === 'room') lessons = rooms[station.room].stations.filter((s) => s.kind === 'lesson').map((s) => s.lesson);
  if (!lessons.length || !lessons.every(isCompleted)) return 0;
  return lessons.every(isApplied) ? 2 : 1;
}
const isDone = (station) => stars(station) > 0;

function loadPet() {
  const kind = getActivePet();
  if (!kind) {
    pet = null;
    return;
  }
  const happy = petHappiness(getPets()[kind]);
  pet = { kind, x: avatar.x - avatar.facing * 46 * (world?.actorScale ?? 1), y: avatar.y + 6, facing: avatar.facing, hop: 0, happy, heartUntil: pet?.heartUntil ?? 0 };
}

function refreshRoom() {
  const base = roomById(roomId);
  world = base.kind === 'house' ? withFurniture(base, getHouse().placed) : withFurniture(base, []);
  dirty = true;
}

// Turns into pixels this room's pictures and its neighbors', and frees the
// rest of the rooms' pictures (old school computers have little memory).
let roomArt = null; // Every room-specific picture, once.
function loadRoomArt(id) {
  roomArt ??= [...new Set(Object.values(rooms).flatMap(roomFiles))];
  const keep = new Set([id, ...nearbyRooms(id, rooms)].flatMap((r) => roomFiles(rooms[r])));
  unload(roomArt, keep);
  for (const file of keep) spriteReady(file); // Starts loading it.
}

function enterRoom(id, point, { announce = true } = {}) {
  roomId = id;
  loadRoomArt(id);
  refreshRoom();
  avatar.x = point.x;
  avatar.y = point.y;
  target = null;
  loadPet();
  avatar.action = null;
  setWorldPosition({ room: roomId, x: avatar.x, y: avatar.y });
  $('decorate-button').hidden = world.kind !== 'house';
  $('snowball-button').hidden = !isArctic(world);
  setAiming(false);
  snowballs.length = 0;
  splats.length = 0;
  critters = createCritters(world); // The room's wild animals (Phase 13).
  residents = createResidents(world, residentData);
  toys = createToys(world);
  ride = null;
  furnitureStates.clear();
  const partyHere = isPartyRoom(party, roomId) ? party : null;
  weather = reducedMotion ? [] : createWeather(weatherFor(world, { day: dayOfYear(), party: partyHere }), size);
  if (partyHere) joinParty();
  setTheme(themeOf(world));
  recordVisit(roomId);
  if (world.kind === 'outdoor' && isEvening(currentDarkness())) recordEvening();
  if (announce) showToast(pick(world.name));
  updatePrompt();
  checkStamps();
}

// Fades to black, switches room, fades back in.
function changeRoom(id, point) {
  if (changingRoom) return;
  changingRoom = true;
  keys.clear();
  play('door');
  $('fade').classList.add('on');
  setTimeout(() => {
    enterRoom(id, point);
    $('fade').classList.remove('on');
    changingRoom = false;
  }, 260);
}

// ---- Saying things (docs/PLAN.md, D10) ----
// Everything the avatar says goes through here. When multiplayer arrives,
// this is the one place that also sends it to other players.
function say(message) {
  bubble = { ...message, until: time + BUBBLE_SECONDS };
  dirty = true;
  play('pop');
  recordSay();
  checkStamps();
}

// Dancing lasts a few seconds; sitting lasts until the kid walks again.
function act(type) {
  avatar.action = { type, until: type === 'dance' ? time + 4 : Infinity };
  target = null;
  keys.clear();
  if (type === 'dance') {
    recordDance();
    checkStamps();
  }
  dirty = true;
}

// ---- Canvas: rooms are 1280 x 720, scaled to fit the window ----
const canvas = $('map');
const ctx = canvas.getContext('2d');
const ratio = Math.min(window.devicePixelRatio || 1, 1.5); // Sharp enough, still fast.
const view = { scale: 1, ox: 0, oy: 0 };

function resize() {
  canvas.width = Math.round(innerWidth * ratio);
  canvas.height = Math.round(innerHeight * ratio);
  // While decorating, the room shrinks to fit above the furniture panel.
  const height = innerHeight - (decorating ? $('decorator').offsetHeight + 24 : 0);
  view.scale = Math.min(innerWidth / size.width, height / size.height);
  view.ox = (innerWidth - size.width * view.scale) / 2;
  view.oy = (height - size.height * view.scale) / 2;
  dirty = true;
}

const toRoom = (event) => ({ x: (event.clientX - view.ox) / view.scale, y: (event.clientY - view.oy) / view.scale });
const panelOpen = () => !$('shop').hidden || !$('world-map').hidden || !$('stamp-book').hidden;

// ---- Input: walking ----
canvas.addEventListener('pointerdown', (event) => {
  if (panelOpen() || changingRoom) return;
  closeMenus();
  const p = toRoom(event);
  if (decorating) {
    startDragFromRoom(p, event);
    return;
  }
  if (aiming) {
    throwSnowball(p);
    return;
  }
  // Clicking a building walks to its door, around anything in the way.
  const onPicture = (s) => (s.art ? p.x > s.art.bounds[0] && p.x < s.art.bounds[2] && p.y > s.art.bounds[1] && p.y < s.door.y : Math.abs(p.x - s.x) < 100 && p.y > s.y - 130 && p.y < s.door.y);
  const station = world.stations.find(onPicture);
  route = findPath(world, avatar, station ? station.door : p);
  target = route.shift() ?? null;
  dirty = true;
});

const KEY_DIRECTIONS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};
const keyName = (event) => (event.key.length === 1 ? event.key.toLowerCase() : event.key);

addEventListener('keydown', (event) => {
  if (panelOpen() || changingRoom) return;
  if (event.key === 'Escape') closeMenus();
  if (event.key === 'Enter' && nearStation && !decorating) {
    enter(nearStation);
    return;
  }
  if (event.key === 'Enter' && nearToy && !decorating) {
    playWith(nearToy);
    return;
  }
  if (event.key === 'Enter' && nearPiece && !decorating) {
    usePiece(nearPiece);
    return;
  }
  const number = Number(event.key);
  if (event.key >= '1' && number <= phrases.emotes.length && !decorating) {
    say({ emote: phrases.emotes[number - 1].id });
    return;
  }
  if ((event.key === '9' || event.key === '0') && !decorating) {
    act(event.key === '9' ? 'dance' : 'sit');
    return;
  }
  if (keyName(event) === 'f' && isArctic(world) && !decorating) {
    setAiming(!aiming);
    return;
  }
  const key = keyName(event);
  if (KEY_DIRECTIONS[key] && !decorating) {
    keys.add(key);
    target = null;
    event.preventDefault();
  }
});
addEventListener('keyup', (event) => keys.delete(keyName(event)));
addEventListener('blur', () => keys.clear());

// ---- Stations ----
let nearStation = null;

function updatePrompt() {
  const station = decorating ? null : stationNear(world, avatar.x, avatar.y);
  const toy = station || decorating ? null : toyNear(toys, avatar);
  const piece = station || toy || decorating ? null : pieceNear();
  if (station === nearStation && toy === nearToy && piece === nearPiece && !$('prompt').hidden === Boolean(station || toy || piece)) return;
  nearStation = station;
  nearToy = toy;
  nearPiece = piece;
  const prompt = $('prompt');
  prompt.hidden = !station && !toy && !piece;
  dirty = true;
  if (piece) {
    const item = items.furniture.find((f) => f.id === piece.id);
    $('prompt-name').textContent = item ? pick(item.name) : piece.id;
    $('prompt-text').textContent = t(`furnitureUse.${FURNITURE[piece.id].use}`);
    $('prompt-action').disabled = false;
    $('prompt-action').textContent = t('world.use');
    $('prompt-hint').hidden = true;
    $('prompt-done').hidden = true;
    return;
  }
  if (toy) {
    // A toy: its name, what it does, and a Use button.
    $('prompt-name').textContent = t(`toys.${toy.type}`);
    $('prompt-text').textContent = t(`toyHelp.${toy.type}`);
    $('prompt-action').disabled = false;
    $('prompt-action').textContent = t('world.use');
    $('prompt-hint').hidden = true;
    $('prompt-done').hidden = true;
    return;
  }
  if (!station) return;
  $('prompt-name').textContent = pick(station.name);
  $('prompt-text').textContent = station.kind === 'soon' ? t('world.comingSoonText') : pick(station.description);
  const button = $('prompt-action');
  button.disabled = station.kind === 'soon';
  button.textContent = t({ shop: 'world.openShop', soon: 'world.comingSoon', room: 'world.enter' }[station.kind] ?? 'world.play');
  $('prompt-hint').hidden = station.kind === 'soon';
  $('prompt-done').hidden = !isDone(station);
}

function enter(station) {
  if (station.kind === 'soon') return;
  if (station.kind === 'shop') {
    keys.clear();
    target = null;
    openShop($('shop'), {
      items, defaultLook: DEFAULT_LOOK, t, pick,
      onChange: () => {
        look = getLook(DEFAULT_LOOK);
        loadPet();
        updateCoins();
        checkStamps();
        dirty = true;
      },
    });
    return;
  }
  if (station.kind === 'room') {
    changeRoom(station.room, roomById(station.room).start);
    return;
  }
  setWorldPosition({ room: roomId, x: station.door.x, y: station.door.y });
  location.href = `lesson.html?id=${encodeURIComponent(station.lesson)}`;
}
$('prompt-action').addEventListener('click', () => {
  if (nearStation) enter(nearStation);
  else if (nearToy) playWith(nearToy);
  else if (nearPiece) usePiece(nearPiece);
});

// ---- Using furniture at home (Phase 13): sit, switch on, play, bounce, music ----
function pieceSpot(p) {
  return FURNITURE[p.id].wall ? { x: p.x, y: world.minY + 20 } : { x: p.x, y: p.y + 24 * (p.scale ?? 1) };
}
function pieceNear() {
  let best = null;
  let bestDistance = 70;
  for (const p of world.furniture ?? []) {
    if (!FURNITURE[p.id]?.use || (world.kind === 'house' && decorating)) continue;
    const spot = pieceSpot(p);
    const d = Math.hypot(avatar.x - spot.x, avatar.y - spot.y);
    if (d < bestDistance) {
      best = p;
      bestDistance = d;
    }
  }
  return best;
}
function usePiece(p) {
  const f = FURNITURE[p.id];
  const state = furnitureStates.get(pieceKey(p)) ?? {};
  furnitureStates.set(pieceKey(p), state);
  play('pop');
  if (f.use === 'sit') {
    endRide();
    ride = { type: 'seat', toy: { ...pieceSpot(p), type: p.id }, pose: { x: p.x, y: p.y + 1, z: -(f.seat ?? -30) * (p.scale ?? 1), sit: true, done: false } };
  } else if (f.use === 'bounce') {
    endRide();
    ride = useToy({ type: 'bounce-mushroom', x: p.x, y: p.y + 1 }, avatar, time);
  } else if (f.use === 'toggle') {
    state.on = !state.on;
  } else if (f.use === 'play') {
    state.playUntil = time + 3;
  } else if (f.use === 'melody') {
    // The marimba plays a short tune.
    state.playUntil = time + 3;
    [60, 64, 67, 69, 67, 64, 72].forEach((note, i) => setTimeout(() => playNote(note), i * 220));
  } else if (f.use === 'music') {
    // The record player plays the Coast's song; again to stop.
    state.on = !state.on;
    setTheme(state.on ? 'coast' : themeOf(world));
  }
  target = null;
  route = [];
  dirty = true;
}
function pieceState(p) {
  // Pieces that show the world: the museum's wall of the kid's stamps, and a
  // dance floor that lights up under Ilo while dancing.
  if (p.id === 'trophy-wall') return { stamps: getStamps().map((id) => stamps.stamps.find((s) => s.id === id)).filter(Boolean) };
  if (p.id === 'dance-floor') {
    const f = FURNITURE[p.id];
    const on = Math.abs(avatar.x - p.x) < (f.width * (p.scale ?? 1)) / 2 && avatar.y < p.y && avatar.y > p.y - f.depth * (p.scale ?? 1);
    return { lit: on && avatar.action?.type === 'dance' };
  }
  const state = furnitureStates.get(pieceKey(p));
  if (!state) return {};
  const left = (state.playUntil ?? 0) - time;
  return { on: state.on, playing: left > 0 ? Math.min(1, left / 3) : 0 };
}

// ---- Physics toys (Phase 13) ----
function playWith(toy) {
  const next = useToy(toy, avatar, time, ride);
  recordToyUse(toy.type);
  checkStamps();
  play('pop');
  if (next !== ride) endRide(); // Getting off one toy before the next.
  ride = next;
  if (ride) {
    target = null;
    route = [];
  }
  dirty = true;
}

// Off the toy: Ilo stands next to it again (or where the sled stopped).
function endRide(pose = null) {
  if (!ride) return;
  const spot = pose ?? usePoint(ride.toy);
  if (!collides(world, spot.x, spot.y)) {
    avatar.x = spot.x;
    avatar.y = spot.y;
  }
  avatar.pose = null;
  avatar.action = null;
  ride = null;
}

function updateToyWorld(dt) {
  if (ride) {
    const pose = ride.pose ?? ridePose(ride, world, dt, time);
    if (pose?.done) endRide(pose);
    else avatar.pose = pose;
    dirty = true;
  }
  if (!toys.length) return;
  for (const event of updateToys(toys, world, avatar, dt, time, ride)) {
    if (event.type === 'kick') {
      play('throw');
      recordToyUse('ball');
    } else if (event.type === 'goal') {
      play('coin');
      recordGoal();
      showToast(t('world.goal'));
      checkStamps();
    } else if (event.type === 'note') {
      playNote(event.note);
      recordToyUse('marimba-stones');
    } else if (event.type === 'stick') {
      play('hit');
      recordToyUse('magnet-rock');
    }
  }
  dirty = true;
}

// ---- Menus: phrases, emotes, world map ----
function closeMenus() {
  $('say-menu').hidden = true;
  $('emote-menu').hidden = true;
}

function toggleMenu(id) {
  const menu = $(id);
  const open = menu.hidden;
  closeMenus();
  menu.hidden = !open;
}

for (const phrase of phrases.phrases) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = pick(phrase);
  b.addEventListener('click', () => {
    say({ text: pick(phrase) });
    closeMenus();
  });
  $('say-menu').append(b);
}
phrases.emotes.forEach((emote, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.title = `${pick(emote.name)} (${i + 1})`;
  b.setAttribute('aria-label', pick(emote.name));
  const icon = document.createElement('canvas');
  icon.width = 40;
  icon.height = 40;
  paintCanvas(icon, (c) => drawEmote(c, emote.id, 20, 20, 32));
  b.append(icon);
  b.addEventListener('click', () => {
    say({ emote: emote.id });
    closeMenus();
  });
  $('emote-menu').append(b);
});
for (const type of ['dance', 'sit']) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'action-button';
  b.textContent = `${t(`world.${type}`)} (${type === 'dance' ? 9 : 0})`;
  b.addEventListener('click', () => {
    act(type);
    closeMenus();
  });
  $('emote-menu').append(b);
}
$('say-button').addEventListener('click', () => toggleMenu('say-menu'));
$('emote-button').addEventListener('click', () => toggleMenu('emote-menu'));
$('map-button').addEventListener('click', () => {
  closeMenus();
  keys.clear();
  openWorldMap($('world-map'), {
    worldData, rooms, current: roomId, pick, t,
    // With a station id, arrive in front of that machine.
    onGo: (id, stationId) => changeRoom(id, stationId ? arrivalPoint(rooms[id], { toStation: stationId }) : roomById(id).start),
  });
});

// ---- Decorating the house (docs/PLAN.md, D12) ----
let decorating = false;
let dragging = null; // { id, x, y, from } where `from` is the placed index, or -1 if from the box

function renderInventory() {
  const box = $('inventory-items');
  box.replaceChildren();
  const left = unplacedFurniture();
  const ids = items.furniture.map((f) => f.id).filter((id) => left[id]);
  $('inventory-empty').hidden = ids.length > 0;
  for (const id of ids) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'inventory-item';
    b.title = pick(items.furniture.find((f) => f.id === id).name);
    const icon = document.createElement('canvas');
    icon.width = 64;
    icon.height = 64;
    paintCanvas(icon, (c) => {
      c.translate(32, 58);
      c.scale(0.38, 0.38);
      drawFurniture(c, id, 0, 0);
    });
    const count = document.createElement('span');
    count.textContent = `x${left[id]}`;
    b.append(icon, count);
    b.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      dragging = { id, ...toRoom(event), from: -1 };
      startWindowDrag();
    });
    box.append(b);
  }
  const styles = $('house-styles');
  styles.replaceChildren();
  const house = getHouse();
  for (const style of items.houseStyles.filter((h) => ownsHouse(h) || h.id === house.style)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'button small';
    b.textContent = pick(style.name);
    b.setAttribute('aria-pressed', String(house.style === style.id));
    b.addEventListener('click', () => {
      setHouse({ ...getHouse(), style: style.id });
      renderInventory();
      dirty = true;
    });
    styles.append(b);
  }
}

function setDecorating(on) {
  decorating = on;
  dragging = null;
  target = null;
  keys.clear();
  $('decorator').hidden = !on;
  $('decorate-button').textContent = t(on ? 'world.doneDecorating' : 'world.decorate');
  if (on) renderInventory();
  resize();
  updatePrompt();
}
$('decorate-button').addEventListener('click', () => setDecorating(!decorating));

function startDragFromRoom(p, event) {
  const placed = getHouse().placed;
  const index = furnitureAt(placed, p.x, p.y, world.furnitureScale ?? 1);
  if (index === -1) return;
  dragging = { ...placed[index], from: index };
  dragging.offsetY = placed[index].y - p.y;
  event.preventDefault();
  startWindowDrag();
}

function startWindowDrag() {
  const move = (event) => {
    const p = toRoom(event);
    dragging.x = Math.round(p.x);
    dragging.y = Math.round(p.y + (dragging.offsetY ?? 0));
    dirty = true;
  };
  const up = (event) => {
    removeEventListener('pointermove', move);
    removeEventListener('pointerup', up);
    finishDrag(event);
  };
  addEventListener('pointermove', move);
  addEventListener('pointerup', up);
  dirty = true;
}

function finishDrag(event) {
  const house = getHouse();
  const others = house.placed.filter((_, i) => i !== dragging.from);
  const bar = $('decorator').getBoundingClientRect();
  const overBar = event.clientY >= bar.top && event.clientX >= bar.left && event.clientX <= bar.right;
  if (overBar) {
    setHouse({ ...house, placed: others }); // Put it back in the box.
  } else if (placementOk(roomById(roomId), others, dragging.id, dragging.x, dragging.y, avatar)) {
    setHouse({ ...house, placed: [...others, { id: dragging.id, x: dragging.x, y: dragging.y }] });
  }
  // Otherwise it stays where it was (or back in the box).
  dragging = null;
  refreshRoom();
  renderInventory();
  checkStamps();
}

// ---- Snowballs (Arctic rooms) ----
function setAiming(on) {
  aiming = on;
  $('snowball-button').setAttribute('aria-pressed', String(on));
  canvas.style.cursor = on ? 'crosshair' : '';
}
$('snowball-button').addEventListener('click', () => setAiming(!aiming));

// The snowball flies in an arc: it starts at hand height and lands exactly
// where the kid clicked, pulled down by gravity on the way.
function throwSnowball(p) {
  const distance = Math.hypot(p.x - avatar.x, p.y - avatar.y);
  const flight = Math.max(0.35, distance / 450);
  const z0 = 40;
  snowballs.push({
    x0: avatar.x, y0: avatar.y, tx: p.x, ty: p.y, t: 0, flight, z0,
    vz: (0.5 * SNOW_GRAVITY * flight * flight - z0) / flight,
    x: avatar.x, y: avatar.y, z: z0,
  });
  avatar.facing = p.x >= avatar.x ? 1 : -1;
  avatar.action = null;
  play('throw');
  dirty = true;
}

function updateSnowballs(dt) {
  for (const ball of [...snowballs]) {
    ball.t = Math.min(ball.t + dt, ball.flight);
    const k = ball.t / ball.flight;
    ball.x = ball.x0 + (ball.tx - ball.x0) * k;
    ball.y = ball.y0 + (ball.ty - ball.y0) * k;
    ball.z = ball.z0 + ball.vz * ball.t - 0.5 * SNOW_GRAVITY * ball.t * ball.t;
    if (ball.t >= ball.flight) {
      snowballs.splice(snowballs.indexOf(ball), 1);
      // A hit counts anywhere on the target's picture: its stand and its round face above it.
      const struck = world.decorations.find((d) => d.type === 'target' && Math.abs(ball.x - d.x) < 30 * (d.scale ?? 1) && ball.y > d.y - 80 * (d.scale ?? 1) && ball.y < d.y + 20);
      const hit = Boolean(struck);
      if (struck) struck.hitUntil = time + 0.6; // The target wobbles.
      splats.push({ x: ball.x, y: ball.y, until: time + 1, hit });
      play(hit ? 'hit' : 'splat');
      if (hit) {
        recordSnowballHit();
        checkStamps();
      }
    }
  }
  for (const splat of [...splats]) if (splat.until < time) splats.splice(splats.indexOf(splat), 1);
  if (snowballs.length || splats.length) dirty = true;
}

// ---- Gems ----
function gemsHere() {
  const found = getStats().gems;
  return world.collectibles.filter((g) => !found.includes(g.id));
}

function checkGems() {
  for (const gem of gemsHere()) {
    if (Math.hypot(avatar.x - gem.x, avatar.y - gem.y) < 30) {
      const earned = collectGem(gem.id, GEM_REWARD);
      if (earned) {
        play('coin');
        showToast(t('world.gemFound', { n: earned }));
        updateCoins();
        checkStamps();
      }
    }
  }
}

// ---- Stamps (docs/PLAN.md, D15) ----
function stampFacts() {
  const stats = getStats();
  const play = getPlayStats();
  return {
    completed: Object.fromEntries(allLessons.map((id) => [id, isCompleted(id)])),
    applied: Object.fromEntries(allLessons.map((id) => [id, isApplied(id)])),
    lessons: allLessons,
    visited: stats.visited,
    totalRooms: worldData.rooms.length,
    pets: Object.keys(getPets()).length,
    placed: getHouse().placed.length,
    said: stats.said,
    danced: stats.danced,
    snowballHits: stats.snowballHits,
    gems: stats.gems.length,
    totalGems,
    clothingOwned: items.clothing.filter((c) => ownsItem(c)).length,
    ...play,
    partied: play.parties.length > 0,
    totalCritters: GUIDE_ANIMALS.length,
  };
}

function checkStamps() {
  const facts = stampFacts();
  const fresh = awardStamps(stamps.stamps.filter((s) => stampEarned(s, facts)));
  for (const stamp of fresh) {
    showToast(t('world.newStamp', { name: pick(stamp.name), n: stamp.reward }));
    play('stamp');
  }
  if (fresh.length) updateCoins();
}

function openStampBook() {
  const panel = $('stamp-book');
  panel.replaceChildren();
  const earned = getStamps();
  const head = document.createElement('div');
  head.className = 'shop-head';
  const title = document.createElement('h2');
  title.textContent = t('world.stampBook');
  const count = document.createElement('span');
  count.className = 'coins';
  count.textContent = t('world.stampCount', { n: earned.length, total: stamps.stamps.length });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'button';
  close.textContent = t('shop.close');
  const closeBook = () => {
    panel.hidden = true;
    removeEventListener('keydown', onKey);
  };
  const onKey = (event) => { if (event.key === 'Escape') closeBook(); };
  close.addEventListener('click', closeBook);
  addEventListener('keydown', onKey);
  head.append(title, count, close);
  const grid = document.createElement('div');
  grid.className = 'stamp-grid';
  for (const stamp of stamps.stamps) {
    const has = earned.includes(stamp.id);
    const card = document.createElement('div');
    card.className = `stamp-card${has ? ' earned' : ''}`;
    const icon = document.createElement('canvas');
    icon.width = 72;
    icon.height = 72;
    paintCanvas(icon, (c) => drawStamp(c, stamp.icon, 36, 36, 68, has, stamp.id));
    const name = document.createElement('p');
    name.className = 'shop-name';
    name.textContent = pick(stamp.name);
    const desc = document.createElement('p');
    desc.className = 'muted small';
    desc.textContent = `${pick(stamp.description)} (+${stamp.reward})`;
    card.append(icon, name, desc);
    grid.append(card);
  }
  panel.append(head, grid);
  panel.hidden = false;
  close.focus();
}
// ---- Seasonal parties (Phase 13) ----
let partyGreeted = false;
function joinParty() {
  recordParty(party.id);
  if (!partyGreeted) showToast(t('world.partyWelcome', { name: pick(party.name) }));
  partyGreeted = true;
  const gift = party.gift && items.clothing.find((c) => c.id === party.gift);
  if (gift && giveItem(gift.id)) {
    showToast(t('world.partyGift', { name: pick(gift.name) }));
    play('stamp');
  }
}

// ---- Spotting wild animals for the Field guide (Phase 13) ----
const SPOT_DISTANCE = 300;
let sparkles = []; // { x, y, until }: a little burst where a new animal was spotted.
function checkSpotting() {
  sparkles = sparkles.filter((s) => s.until > time);
  for (const c of critters) {
    if (!isVisible(c) || Math.hypot(c.x - avatar.x, c.y - avatar.y) > SPOT_DISTANCE) continue;
    const coins = spotCritter(c.type);
    if (!coins) continue;
    sparkles.push({ x: c.x, y: c.y - c.z - 20, until: time + 1.2 });
    showToast(t('world.spotted', { name: t(`critters.${c.type}`), n: coins }));
    play('pop');
    updateCoins();
    checkStamps();
  }
}

$('guide-button').addEventListener('click', () => {
  closeMenus();
  openFieldGuide($('field-guide'), { spotted: getSpotted(), t });
});

$('stamps-button').addEventListener('click', () => {
  closeMenus();
  keys.clear();
  openStampBook();
});

// ---- Sound ----
function showSoundState() {
  const on = getSoundOn();
  $('sound-button').textContent = t(on ? 'world.soundOn' : 'world.soundOff');
  $('sound-button').dataset.on = on;
  $('sound-button').setAttribute('aria-pressed', String(on));
}
$('sound-button').addEventListener('click', () => {
  setSoundOn(!getSoundOn());
  setEnabled(getSoundOn());
  showSoundState();
});
// Browsers allow sound only after the first click or key press.
addEventListener('pointerdown', unlock);
addEventListener('keydown', unlock);

// ---- HUD ----
function updateCoins() {
  $('coins').textContent = getCoins();
}

// Messages at the top, shown one after another.
const toasts = [];
let toastBusy = false;
function showToast(text) {
  toasts.push(text);
  if (!toastBusy) nextToast();
}
function nextToast() {
  const toast = $('area-toast');
  if (!toasts.length) {
    toastBusy = false;
    return;
  }
  toastBusy = true;
  toast.textContent = toasts.shift();
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(nextToast, 350);
  }, 2200);
}

// ---- Game loop ----
let last = performance.now();

function update(dt) {
  let dx = 0;
  let dy = 0;
  for (const key of keys) {
    dx += KEY_DIRECTIONS[key][0];
    dy += KEY_DIRECTIONS[key][1];
  }
  if (!dx && !dy && target) {
    dx = target.x - avatar.x;
    dy = target.y - avatar.y;
    if (Math.hypot(dx, dy) < 4) {
      target = route.shift() ?? null;
      dx = dy = 0;
    }
  }
  const length = Math.hypot(dx, dy);
  // Walking gets Ilo off a toy (the kite stays in hand).
  if (length && ride && ride.type !== 'kite') endRide();
  if (length && !changingRoom && !decorating) {
    const step = Math.min(SPEED * dt, target && !keys.size ? length : Infinity);
    const moved = moveWithCollisions(world, avatar.x, avatar.y, (dx / length) * step, (dy / length) * step);
    if (moved.blocked) {
      target = null;
      route = [];
    }
    if (dx) avatar.facing = dx > 0 ? 1 : -1;
    // Which way Ilo looks: back when walking up, front when walking down.
    avatar.view = Math.abs(dy) > Math.abs(dx) * 1.2 ? (dy < 0 ? 'back' : 'front') : 'side';
    avatar.action = null;
    avatar.x = moved.x;
    avatar.y = moved.y;
    const before = avatar.walk;
    avatar.walk += dt * 12;
    if (Math.floor(before / Math.PI) !== Math.floor(avatar.walk / Math.PI)) play('step');
    dirty = true;
    checkGems();
    const exit = exitAt(world, avatar.x, avatar.y);
    if (exit) changeRoom(exit.to, arrivalPoint(rooms[exit.to], exit));
  } else if (avatar.walk) {
    avatar.walk = 0;
    avatar.view = avatar.view === 'back' ? 'back' : 'side';
    dirty = true;
  }
  if (avatar.action?.type === 'dance') {
    dirty = true;
    if (avatar.action.until < time) avatar.action = null;
  }
  updateSnowballs(dt);
  if (critters.length && !reducedMotion) {
    updateCritters(critters, world, avatar, dt);
    dirty = true;
  }
  if (Math.floor(time * 4) !== Math.floor((time - dt) * 4)) checkSpotting();
  updateToyWorld(dt);
  if (residents.length) {
    updateResidents(residents, avatar, time, (r) => {
      recordTalk(r.id);
      talked.add(r.id);
      play('pop');
    });
    dirty = true; // They breathe and wave.
  }
  if (weather.length) {
    updateWeather(weather, size, dt, time);
    dirty = true;
  }
  if (pet && followAvatar(pet, avatar, dt * (pet.happy > 60 ? 1.15 : 1), world.actorScale ?? 1)) dirty = true;
  if (bubble && bubble.until < time) {
    bubble = null;
    dirty = true;
  }
  if (pet?.heartUntil && pet.heartUntil > time - 0.1) dirty = true;
  updatePrompt();
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  time += dt;
  update(dt);
  // Exits glow gently, so redraw a few times a second even when idle.
  if (dirty || target || Math.floor(time * 6) !== Math.floor((time - dt) * 6)) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1d2340';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(ratio * view.scale, 0, 0, ratio * view.scale, ratio * view.ox, ratio * view.oy);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, size.width, size.height);
    ctx.clip();
    const dark = currentDarkness();
    const house = getHouse();
    const valid = dragging ? placementOk(roomById(roomId), getHouse().placed.filter((_, i) => i !== dragging.from), dragging.id, dragging.x, dragging.y, avatar) : false;
    drawWorld(ctx, world, {
      avatar, look, items, pet, bubble, time, nearStation, pick, t,
      target: route.length ? route[route.length - 1] : target, // Show where the walk ends.
      houseStyle: house.style,
      houseDecor: { wallpaper: house.wallpaper, floor: house.floor },
      // The kid's house outside shows the style they live in (houses/<style>-exterior.svg).
      buildingArt: (s) => (s.room === 'house' ? 'houses' : null),
      buildingStyle: (s) => (s.room === 'house' ? `${house.style}-exterior` : null),
      furnitureState: pieceState,
      dragging: dragging && { ...dragging, valid },
      isDone,
      stars,
      gems: gemsHere(),
      snowballs,
      splats,
      critters,
      residents,
      talked,
      toys,
      ride,
      sparkles,
      weather,
      darkness: dark,
      evening: isEvening(dark),
      exitLabel: (exit) => pick(rooms[exit.to].name),
    });
    ctx.restore();
    dirty = false;
  }
  requestAnimationFrame(frame);
}

// ---- Start ----
onArtLoaded(() => { dirty = true; });
const saved = getWorldPosition();
const startRoom = saved && rooms[saved.room] ? saved.room : worldData.startRoom;
roomId = startRoom;
refreshRoom();
const startPoint = saved && rooms[saved.room] && !collides(world, saved.x, saved.y) ? saved : world.start;

const savePosition = () => setWorldPosition({ room: roomId, x: avatar.x, y: avatar.y });
mountLanguageSwitch($('lang-switch'), savePosition);
addEventListener('pagehide', savePosition);
setEnabled(getSoundOn());
showSoundState();
addEventListener('resize', resize);
resize();
enterRoom(startRoom, startPoint);
updateCoins();
if (claimWelcomeGift()) showToast(t('world.welcomeGift', { n: WELCOME_GIFT }));
const today = new Date();
const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const daily = claimDaily(dayKey, DAILY_REWARD);
if (daily) showToast(t('world.dailyReward', { n: daily }));
updateCoins();
if (pet && takePetCelebration()) pet.heartUntil = 4;
$('loading').hidden = true;
$('save-warning').hidden = canSave();
$('hud').hidden = false;
$('toolbar').hidden = false;
document.documentElement.lang = lang;
requestAnimationFrame(frame);
