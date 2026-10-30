// The ONLY file that saves or reads anything on the device.
// Today it uses the browser's localStorage, so progress stays on this
// computer. When ILO gets accounts, this file is replaced and nothing else
// has to change (see docs/PLAN.md, assumptions A3 and D8).

const KEY = 'ilo.v1';
const VERSION = 4;
export const DEFAULT_REWARD = 50;
export const WELCOME_GIFT = 100; // docs/PLAN.md, A15
export const SLOTS = ['head', 'face', 'neck', 'body', 'feet', 'hand'];
const DAY = 24 * 60 * 60 * 1000;
const HAPPINESS_MIN = 10;
const HAPPINESS_LOSS_PER_DAY = 10;
const JOURNAL_SIZE = 10; // Runs kept per lesson in the experiment journal.

// Older saves are upgraded here, so kids never lose coins or items.
export function upgrade(data) {
  if ((data.version ?? 1) < 2) {
    if (data.look && 'hat' in data.look) {
      data.look.head = data.look.hat; // Version 1 had only one item: a hat.
      delete data.look.hat;
    }
    // Version 1 positions were on one big map, not in rooms.
    if (data.position && !data.position.room) delete data.position;
  }
  // Version 3 added "explored", "applied" and the journal; nothing to convert.
  // Version 4 sells house styles (Phase 13): kids who already played had the
  // adobe and ice cabin styles for free, so they keep them.
  if ((data.version ?? 1) < 4 && data.welcomed) data.houses = [...new Set([...(data.houses ?? []), 'adobe', 'icecabin'])];
  data.version = VERSION;
  return data;
}

function read() {
  try {
    return upgrade(JSON.parse(localStorage.getItem(KEY)) || {});
  } catch {
    return upgrade({}); // Private mode or blocked storage: start fresh, never crash.
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: the game still works, it just won't remember.
  }
}

// ---- Backup file: carry progress to another computer ----
// School computers often clear browser data, so a kid can save a copy of
// their progress as a file and load it later (lessons.html).
export function exportSave() {
  return JSON.stringify({ app: 'ilo', version: VERSION, saved: new Date().toISOString(), data: read() });
}

// What each part of a save must be, so a hand-edited backup cannot break
// the game: a number, a list or a group of named values.
const isGroup = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const SAVE_KINDS = {
  number: ['version', 'coins', 'goals', 'housesBought', 'petCelebratedAt', 'said', 'snowballHits', 'danced'],
  list: ['gems', 'houses', 'parties', 'spotted', 'stamps', 'talked', 'toysUsed', 'visited'],
  group: ['explain', 'fair', 'journal', 'path', 'warmups', 'house', 'look', 'pets', 'position'],
};
function saveLooksRight(data) {
  const ok = (key, test) => !(key in data) || test(data[key]);
  return SAVE_KINDS.number.every((k) => ok(k, Number.isFinite))
    && SAVE_KINDS.list.every((k) => ok(k, Array.isArray))
    && SAVE_KINDS.group.every((k) => ok(k, isGroup))
    && (!isGroup(data.house) || !('placed' in data.house) || Array.isArray(data.house.placed));
}

// Loads a backup. Returns 'ok', 'not-ilo' (not an ILO backup, or one that
// was changed by hand into something the game cannot use) or 'too-new'
// (made by a newer ILO). Only 'ok' changes anything.
export function importSave(text) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    return 'not-ilo';
  }
  if (file?.app !== 'ilo' || !Number.isInteger(file.version) || !isGroup(file.data)) return 'not-ilo';
  if (!saveLooksRight(file.data)) return 'not-ilo';
  if (Math.max(file.version, file.data.version ?? 0) > VERSION) return 'too-new';
  let data;
  try {
    data = upgrade({ ...file.data, version: file.data.version ?? file.version });
  } catch {
    return 'not-ilo';
  }
  write(data);
  return 'ok';
}

// False when this browser cannot keep progress (private mode, blocked or
// full storage), so the page can tell the kid.
export function canSave() {
  try {
    localStorage.setItem(`${KEY}.test`, '1');
    localStorage.removeItem(`${KEY}.test`);
    return true;
  } catch {
    return false;
  }
}

// Erases everything saved on this device (for shared classroom computers).
export function resetAll() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing was saved.
  }
}

function change(fn) {
  const data = read();
  const result = fn(data);
  write(data);
  return result;
}

export function getLanguage() {
  return read().language === 'en' ? 'en' : 'es';
}

export function setLanguage(language) {
  change((d) => { d.language = language; });
}

// ---- Lessons ----
// Three progress states (docs/PLAN.md, Phase 10): explored (ran it at least
// once), completed (solved the main task) and applied (solved the changed
// case). They are records of what happened, not a grade.

export function isCompleted(lessonId) {
  return Boolean(read().completed?.[lessonId]);
}

export function isExplored(lessonId) {
  return Boolean(read().explored?.[lessonId]);
}

export function isApplied(lessonId) {
  return Boolean(read().applied?.[lessonId]);
}

export function lessonState(lessonId) {
  if (isApplied(lessonId)) return 'applied';
  if (isCompleted(lessonId)) return 'solved';
  if (isExplored(lessonId)) return 'explored';
  return 'new';
}

// Marks a changed case as won. Coins are paid only the first time.
export function completeChallenge(lessonId, reward) {
  return change((d) => {
    d.lastWinAt = Date.now();
    if (d.applied?.[lessonId]) return 0;
    d.applied = { ...d.applied, [lessonId]: true };
    d.coins = (d.coins ?? 0) + reward;
    return reward;
  });
}

// The experiment journal: the last runs of a lesson (or of its changed
// case, saved under "lessonId:challengeId"), newest first.
export function recordRun(lessonId, key, run) {
  change((d) => {
    d.explored = { ...d.explored, [lessonId]: true };
    d.journal = d.journal ?? {};
    d.journal[key] = [run, ...(d.journal[key] ?? [])].slice(0, JOURNAL_SIZE);
  });
}

export function getJournal(key) {
  return read().journal?.[key] ?? [];
}

// The kid's answer to "why?" after a win (key as in the journal). Every
// try is kept, so a teacher can see a first wrong answer that was fixed.
export function recordExplain(key, choice, correct) {
  change((d) => {
    d.explain = d.explain ?? {};
    d.explain[key] = [...(d.explain[key] ?? []), { choice, correct, at: Date.now() }];
  });
}

export function getExplain(key) {
  return read().explain?.[key] ?? [];
}

// Whether the kid picked two runs that compare one setting fairly.
export function recordFairComparison(key, correct) {
  change((d) => {
    d.fair = d.fair ?? {};
    d.fair[key] = [...(d.fair[key] ?? []), { correct, at: Date.now() }];
  });
}

export function getFairComparison(key) {
  return read().fair?.[key] ?? [];
}

// ---- Lesson path (Phase 12) ----
// Where the kid is in a lesson's steps, and the furthest step reached, so
// leaving and coming back resumes at the same place.
export function getPathPlace(lessonId) {
  const place = read().path?.[lessonId];
  return { step: place?.step ?? null, reached: place?.reached ?? 0 };
}

export function setPathPlace(lessonId, step) {
  change((d) => {
    d.path = d.path ?? {};
    const reached = Math.max(d.path[lessonId]?.reached ?? 0, Number.isInteger(step) ? step : 0);
    d.path[lessonId] = { step, reached };
  });
}

// Answers to warm-up questions, every try kept (like explain-why).
export function recordWarmup(lessonId, warmupId, choice, correct) {
  change((d) => {
    d.warmups = d.warmups ?? {};
    const key = `${lessonId}:${warmupId}`;
    d.warmups[key] = [...(d.warmups[key] ?? []), { choice, correct, at: Date.now() }];
  });
}

export function getWarmups(lessonId, warmupId) {
  return read().warmups?.[`${lessonId}:${warmupId}`] ?? [];
}

// Lessons whose main task was first solved in the last 7 days. Shown at the
// end of a lesson instead of a daily streak (docs/PLAN.md, D19).
export function solvedThisWeek(now = Date.now()) {
  return Object.values(read().solvedAt ?? {}).filter((at) => now - at < 7 * DAY).length;
}

// Marks a lesson as won. Coins are paid only the first time.
// Returns how many coins were earned now (0 if it was already completed).
export function completeLesson(lessonId, reward = DEFAULT_REWARD) {
  return change((d) => {
    d.lastWinAt = Date.now(); // The pet celebrates every win.
    if (d.completed?.[lessonId]) return 0;
    d.completed = { ...d.completed, [lessonId]: true };
    d.solvedAt = { ...d.solvedAt, [lessonId]: Date.now() };
    d.coins = (d.coins ?? 0) + reward;
    return reward;
  });
}

export function loadProgram(lessonId) {
  return read().programs?.[lessonId] ?? null;
}

export function saveProgram(lessonId, program) {
  change((d) => { d.programs = { ...d.programs, [lessonId]: program }; });
}

export function clearProgram(lessonId) {
  change((d) => { if (d.programs) delete d.programs[lessonId]; });
}

// ---- Coins ----

export function getCoins() {
  return read().coins ?? 0;
}

// Gives the welcome gift once. Returns true the first time.
export function claimWelcomeGift() {
  return change((d) => {
    if (d.welcomed) return false;
    d.welcomed = true;
    d.coins = (d.coins ?? 0) + WELCOME_GIFT;
    return true;
  });
}

function spend(d, price) {
  const coins = d.coins ?? 0;
  if (coins < price) return false;
  d.coins = coins - price;
  return true;
}

// ---- Clothing and colors ----

// Free items (price 0) are always owned.
export function ownsItem(item) {
  return item.price === 0 || Boolean(read().owned?.[item.id]);
}

// Returns true if the item was bought (or already owned).
export function buyItem(item) {
  if (ownsItem(item)) return true;
  return change((d) => {
    if (!spend(d, item.price)) return false;
    d.owned = { ...d.owned, [item.id]: true };
    return true;
  });
}

export function getLook(defaultLook) {
  return { ...defaultLook, ...read().look };
}

export function setLook(look) {
  change((d) => { d.look = look; });
}

// ---- Pets ----

export function getPets() {
  return read().pets ?? {};
}

export function getActivePet() {
  const d = read();
  return d.activePet && d.pets?.[d.activePet] ? d.activePet : null;
}

export function adoptPet(pet, name, now = Date.now()) {
  return change((d) => {
    if (d.pets?.[pet.id]) return true;
    if (!spend(d, pet.price)) return false;
    d.pets = { ...d.pets, [pet.id]: { name, happiness: 80, updatedAt: now } };
    d.activePet = pet.id;
    return true;
  });
}

export function setActivePet(petId) {
  change((d) => { d.activePet = petId; });
}

// Happiness drops a little each real day, but never below a floor:
// a pet is never sad forever.
export function petHappiness(pet, now = Date.now()) {
  if (!pet) return 0;
  const days = Math.max(0, now - pet.updatedAt) / DAY;
  return Math.max(HAPPINESS_MIN, Math.round(pet.happiness - days * HAPPINESS_LOSS_PER_DAY));
}

export function feedPet(petId, price, now = Date.now()) {
  return change((d) => {
    const pet = d.pets?.[petId];
    if (!pet || !spend(d, price)) return false;
    pet.happiness = Math.min(100, petHappiness(pet, now) + 20);
    pet.updatedAt = now;
    return true;
  });
}

// True once after each lesson win, so the pet can show a heart.
export function takePetCelebration() {
  return change((d) => {
    if (!d.lastWinAt || d.lastWinAt <= (d.petCelebratedAt ?? 0)) return false;
    d.petCelebratedAt = d.lastWinAt;
    return true;
  });
}

// ---- House and furniture ----

export function getFurnitureOwned() {
  return read().furniture ?? {};
}

// Furniture can be bought more than once (two chairs, three plants).
export function buyFurniture(item) {
  return change((d) => {
    if (!spend(d, item.price)) return false;
    d.furniture = { ...d.furniture, [item.id]: (d.furniture?.[item.id] ?? 0) + 1 };
    return true;
  });
}

export function getHouse() {
  const house = read().house ?? {};
  return { style: house.style ?? 'cabin', wallpaper: house.wallpaper ?? null, floor: house.floor ?? null, placed: house.placed ?? [] };
}

// House styles (Phase 13): free ones (price 0) are always owned.
export function ownsHouse(style) {
  return style.price === 0 || (read().houses ?? []).includes(style.id);
}

export function buyHouse(style) {
  if (ownsHouse(style)) return true;
  return change((d) => {
    if (!spend(d, style.price)) return false;
    d.houses = [...(d.houses ?? []), style.id];
    d.housesBought = (d.housesBought ?? 0) + 1; // For the "New home" stamp.
    return true;
  });
}

// Wallpapers and floors are kept with the clothes, under their own names.
export const decorKey = (kind, id) => `${kind}:${id}`;

export function setHouse(house) {
  change((d) => { d.house = house; });
}

// How many of each piece are still in the box (owned but not placed).
export function unplacedFurniture() {
  const owned = getFurnitureOwned();
  const left = { ...owned };
  for (const p of getHouse().placed) left[p.id] = (left[p.id] ?? 0) - 1;
  return Object.fromEntries(Object.entries(left).filter(([, n]) => n > 0));
}

// ---- Place in the world ----

export function getWorldPosition() {
  const p = read().position;
  return p && p.room && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : null;
}

export function setWorldPosition(position) {
  change((d) => {
    d.position = { room: position.room, x: Math.round(position.x), y: Math.round(position.y) };
  });
}

// ---- Activity counters (for stamps) ----

export function getStats() {
  const d = read();
  return {
    visited: d.visited ?? [],
    said: d.said ?? 0,
    danced: Boolean(d.danced),
    snowballHits: d.snowballHits ?? 0,
    gems: d.gems ?? [],
  };
}

export function recordVisit(roomId) {
  change((d) => {
    d.visited = d.visited ?? [];
    if (!d.visited.includes(roomId)) d.visited.push(roomId);
  });
}

export function recordSay() {
  change((d) => { d.said = (d.said ?? 0) + 1; });
}

export function recordDance() {
  change((d) => { d.danced = true; });
}

export function recordSnowballHit() {
  change((d) => { d.snowballHits = (d.snowballHits ?? 0) + 1; });
}

// Picks up a hidden gem. Returns the coins earned (0 if already found).
export function collectGem(gemId, reward) {
  return change((d) => {
    d.gems = d.gems ?? [];
    if (d.gems.includes(gemId)) return 0;
    d.gems.push(gemId);
    d.coins = (d.coins ?? 0) + reward;
    return reward;
  });
}

// The daily reward: paid once per calendar day. `day` is like "2026-10-27".
// Returns the coins paid now (0 if already paid today).
export function claimDaily(day, amount) {
  return change((d) => {
    if (d.lastDaily === day) return 0;
    d.lastDaily = day;
    d.coins = (d.coins ?? 0) + amount;
    return amount;
  });
}

// ---- Field guide (Phase 13) ----
export const SPOT_REWARD = 2; // Coins for spotting a new kind of animal.

// Records that the kid saw this kind of animal. Returns the coins earned
// now (0 if it was already in the field guide).
export function spotCritter(type) {
  return change((d) => {
    d.spotted = d.spotted ?? [];
    if (d.spotted.includes(type)) return 0;
    d.spotted.push(type);
    d.coins = (d.coins ?? 0) + SPOT_REWARD;
    return SPOT_REWARD;
  });
}

export function getSpotted() {
  return read().spotted ?? [];
}

// Residents the kid has talked to (for the "something to do" sparkle).
export function recordTalk(residentId) {
  change((d) => {
    d.talked = d.talked ?? [];
    if (!d.talked.includes(residentId)) d.talked.push(residentId);
  });
}

export function getTalked() {
  return read().talked ?? [];
}

// Toys the kid has played with, and goals scored (Phase 13).
export function recordToyUse(type) {
  change((d) => {
    d.toysUsed = d.toysUsed ?? [];
    if (!d.toysUsed.includes(type)) d.toysUsed.push(type);
  });
}

export function recordGoal() {
  change((d) => { d.goals = (d.goals ?? 0) + 1; });
}

// Walked in the world in the evening (a stamp), and joined a party.
export function recordEvening() {
  change((d) => { d.evening = true; });
}

// A free item (a party gift). Returns true the first time.
export function giveItem(itemId) {
  return change((d) => {
    if (d.owned?.[itemId]) return false;
    d.owned = { ...d.owned, [itemId]: true };
    return true;
  });
}

export function recordParty(partyId) {
  change((d) => {
    d.parties = d.parties ?? [];
    if (!d.parties.includes(partyId)) d.parties.push(partyId);
  });
}

// Everything the Phase 13 stamps look at.
export function getPlayStats() {
  const d = read();
  return {
    spotted: (d.spotted ?? []).length, housesBought: d.housesBought ?? 0, toysUsed: (d.toysUsed ?? []).length,
    goals: d.goals ?? 0, evening: Boolean(d.evening), parties: d.parties ?? [],
  };
}

// ---- Stamps ----

export function getStamps() {
  return read().stamps ?? [];
}

// Gives every stamp in `earned` that the kid does not have yet, with its
// coin reward. Returns the newly given stamps.
export function awardStamps(earned) {
  return change((d) => {
    d.stamps = d.stamps ?? [];
    const fresh = earned.filter((stamp) => !d.stamps.includes(stamp.id));
    for (const stamp of fresh) {
      d.stamps.push(stamp.id);
      d.coins = (d.coins ?? 0) + stamp.reward;
    }
    return fresh;
  });
}

// ---- Settings ----

export function getSoundOn() {
  return read().sound !== false;
}

export function setSoundOn(on) {
  change((d) => { d.sound = on; });
}

