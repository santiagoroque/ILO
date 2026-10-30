# ILO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Twelve improvements that make ILO run on old school computers, keep kids' progress safe, finish the layered-world work and get the game in front of a pilot class.

**Architecture:** Each task stands alone and lands as its own commit, in the order below (most urgent first). The code stays plain ES modules with no build step. New logic goes in small pure functions with `node --test` tests; page code (`js/world.js`, `js/world-draw.js`) only wires them in.

**Tech Stack:** Plain JavaScript (ES modules), Canvas 2D, Blockly 13.4.0, Matter.js 0.20.0, Ajv 8.20.0 (checker only), `node --test`, GitHub.

**Spec:** No separate spec. This plan is the list of 10 to 15 improvements asked for on 2026-10-30. Background and earlier decisions are in `docs/PLAN.md`; open items are in `docs/TASKS.md`.

## Global Constraints

- No build step and no new npm dependencies; Node >=18 (`package.json` engines).
- Spanish first, English second: every new text goes in `locales/es.json` and `locales/en.json`.
- `sources/` (SEP books) never goes into git, the site or the cache.
- Update `docs/TASKS.md` at the start (in_progress) and finish (done) of every task; new task ids use the prefix `I` (I01 to I12, unused today).
- Docs and comments: plain words, no emojis, no em-dashes.
- After each task: `npm run check` prints "Everything is OK" and `npm test` shows `# fail 0`.
- Anything that publishes (making the repository public, GitHub Pages) waits for Santiago's yes.

## Review Focus

1. **A school computer with 2 to 4 GB of memory:** changing rooms must not turn every picture into pixels. Today `preload('world/')` rasterizes 471 pictures, about 743 MB at 2x. Task 1 adds a memory-budget test.
2. **A kid loads the wrong file as their backup** (a photo, an empty file, a backup from a newer ILO): nothing is overwritten, and a clear message shows. Task 3 adds rejection tests.
3. **A kid who asked for less motion on a slow computer:** lite mode must never turn loops back on. Task 2 tests `chooseQuality` with `reducedMotion`.
4. **Phone-size screens:** exit labels must stay out of the toolbar corners and off Ilo at the start spot. Task 4 tests every exit of every room.
5. **Offline after an update:** an old cached copy must not mix with new files. Task 10 tests that the cache name carries the version and that old caches are deleted.

---

### Task 1: Load only the pictures of the room you are in and its neighbors

Today `js/world.js:1024` preloads every `world/` picture at 2x (`RES = 2` in `js/sprites.js`). The 38 room layers alone are 560 MB of pixels.

**Files:**
- Create: `js/room-art.js`
- Modify: `js/sprites.js` (per-file resolution, `unload`), `js/world.js` (preload on `enterRoom` instead of at start)
- Test: `tests/room-art.test.js`

**Interfaces:**
- Produces: `roomFiles(room) -> string[]` (every picture a room file draws: `layout.ground`, `layout.foreground`, each object's `asset` and `animation`, each station's `art.asset`, `art.states`, `art.animation` and `art.houseStyles` files, each furniture `art` and `animation`).
- Produces: `nearbyRooms(roomId, rooms) -> string[]` (ids reached by an exit `to` or a station `room`, sorted, without `roomId`).
- Produces: `rasterScale([w, h]) -> 1 | 2` (1 when `w * h >= 640 * 360`, else 2).
- Produces in `js/sprites.js`: `unload(keep: Set<string>) -> void` (drops cached pixels for files not in `keep`).

- [ ] **Step 1: Write the failing tests** in `tests/room-art.test.js`, loading the rooms as `tests/world.test.js` does:

```js
test('a room lists its own layers and every house style', () => {
  const files = roomFiles(rooms.plaza);
  assert.ok(files.includes('world/rooms-v3/plaza/ground.svg'));
  assert.ok(files.includes('world/rooms-v3/plaza/foreground.svg'));
  assert.ok(files.includes('houses/adobe-exterior-night.svg'));
});
test("the Plaza's neighbors are its exits and its doors", () => {
  assert.deepEqual(nearbyRooms('plaza', rooms), ['forest-trail', 'house', 'market-street', 'palm-beach', 'savannah-trail', 'shop-inside', 'snowy-ridge']);
});
test('big layers are kept at 1x, small pictures at 2x', () => {
  assert.equal(rasterScale([1280, 720]), 1);
  assert.equal(rasterScale([64, 64]), 2);
});
test('a room and its neighbors fit in 150 MB of pixels', () => {
  const anchors = readJson('../assets/anchors.json');
  for (const id of Object.keys(rooms)) {
    const files = new Set([id, ...nearbyRooms(id, rooms)].flatMap((r) => roomFiles(rooms[r])));
    const bytes = [...files].reduce((n, f) => n + (anchors[f] ? anchors[f][0] * anchors[f][1] * 4 * rasterScale(anchors[f]) ** 2 : 0), 0);
    assert.ok(bytes < 150e6, `${id}: ${Math.round(bytes / 1e6)} MB`);
  }
});
```

- [ ] **Step 2: Run `node --test tests/room-art.test.js`.** Expected: FAIL, "Cannot find module '../js/room-art.js'".
- [ ] **Step 3: Implement `roomFiles`, `nearbyRooms` and `rasterScale` in `js/room-art.js`.** It must not import `sprites.js`, so the tests run in Node.
- [ ] **Step 4: In `js/sprites.js`,** make `rasterize` use `rasterScale(size)` instead of `RES`, and set the pattern scale to `1 / rasterScale`. Add `unload(keep)`.
- [ ] **Step 5: In `js/world.js`,** delete `preload('world/')`. In `enterRoom`, preload `roomFiles` of the room and of `nearbyRooms`, then `unload` everything else under `world/` and `houses/`. Keep the avatar, pets and UI pictures.
- [ ] **Step 6: Run `npm test` and `npm run check`.** Expected: `# fail 0` and "Everything is OK".
- [ ] **Step 7: Browser check.** Open the Plaza, walk to the Forest trail and open the map. Pictures appear with at most a short shape-drawing flash. The Performance panel's memory stays under 400 MB.
- [ ] **Step 8: Commit** `perf: load only the current room's pictures and its neighbors'`.

### Task 2: Lite mode for slow computers

**Files:**
- Create: `js/quality.js`
- Modify: `js/world.js` (measure frame times, apply the mode), `js/world-draw.js` (skip loops in lite mode), `locales/es.json`, `locales/en.json`
- Test: `tests/quality.test.js`

**Interfaces:**
- Produces: `chooseQuality(frameMs: number[], { forced = null, reducedMotion = false } = {}) -> 'full' | 'lite'`. Lite when `forced === 'lite'`, or when there are at least 60 samples and their median is above 40 ms. `forced === 'full'` wins over the median.
- Produces: `loopsOn(quality, reducedMotion) -> boolean`, false when lite or reduced motion.
- Consumes: the `?lite=1` / `?lite=0` URL flag, read in `js/world.js` as `forced`.

- [ ] **Step 1: Write the failing tests:**

```js
test('fast frames stay full; slow frames switch to lite', () => {
  assert.equal(chooseQuality(Array(60).fill(16)), 'full');
  assert.equal(chooseQuality(Array(60).fill(55)), 'lite');
  assert.equal(chooseQuality(Array(10).fill(55)), 'full'); // Too few samples
});
test('the URL flag wins', () => {
  assert.equal(chooseQuality(Array(60).fill(55), { forced: 'full' }), 'full');
  assert.equal(chooseQuality([], { forced: 'lite' }), 'lite');
});
test('reduced motion keeps loops off even in full mode', () => {
  assert.equal(loopsOn('full', true), false);
  assert.equal(loopsOn('lite', false), false);
  assert.equal(loopsOn('full', false), true);
});
```

- [ ] **Step 2: Run `node --test tests/quality.test.js`.** Expected: FAIL, module not found.
- [ ] **Step 3: Implement both functions in `js/quality.js`.**
- [ ] **Step 4: Wire lite mode into `js/world.js`.** Keep the last 60 frame times. Re-check the mode every 5 seconds. In lite mode:
  - No weather pieces.
  - Redraw at most 20 times per second.
  - Pass `loops: false` in the scene so `drawObject`, `drawLayeredStation` and `drawPiece` use still pictures.
  - Show a toast once: `world.liteOn` = "Modo ligero: menos animaciones para que vaya más rápido." / "Light mode: fewer animations so it runs faster."
- [ ] **Step 5: Run `npm test`.** Expected: `# fail 0`.
- [ ] **Step 6: Browser check with `index.html?lite=1`.** The fountain and trees are still and there is no snow in the Snowy ridge. Walking and doors still work.
- [ ] **Step 7: Commit** `feat: lite mode for slow computers`.

### Task 3: Save a backup file and load it on another computer

School computers often clear browser data, and `js/progress.js` keeps everything in `localStorage` (`ilo.v1`).

**Files:**
- Modify: `js/progress.js`, `lessons.html`, `js/home.js`, `locales/es.json`, `locales/en.json`
- Test: `tests/save-backup.test.js` (same `localStorage` stand-in as `tests/living-world.test.js`)

**Interfaces:**
- Produces: `exportSave() -> string`, JSON of `{ app: 'ilo', version: VERSION, saved: <ISO date>, data }`.
- Produces: `importSave(text: string) -> 'ok' | 'not-ilo' | 'too-new'`. Only `'ok'` writes anything; the data goes through `upgrade(data)` first.

- [ ] **Step 1: Write the failing tests:**

```js
test('a backup brings back coins and stamps', () => {
  store.set('ilo.v1', JSON.stringify({ version: 4, coins: 321, stamps: ['explorer'] }));
  const file = progress.exportSave();
  store.clear();
  assert.equal(progress.importSave(file), 'ok');
  assert.equal(progress.getCoins(), 321);
  assert.deepEqual(progress.getStamps(), ['explorer']);
});
test('a file that is not an ILO backup changes nothing', () => {
  store.set('ilo.v1', JSON.stringify({ version: 4, coins: 7 }));
  for (const bad of ['', 'hola', '{}', '{"app":"other","data":{}}']) assert.equal(progress.importSave(bad), 'not-ilo');
  assert.equal(progress.getCoins(), 7);
});
test('a backup from a newer ILO is refused', () => {
  assert.equal(progress.importSave(JSON.stringify({ app: 'ilo', version: 99, data: {} })), 'too-new');
});
```

- [ ] **Step 2: Run `node --test tests/save-backup.test.js`.** Expected: FAIL, "progress.exportSave is not a function".
- [ ] **Step 3: Implement `exportSave` and `importSave` in `js/progress.js`.**
- [ ] **Step 4: Add two buttons at the foot of `lessons.html`, wired in `js/home.js`:**
  - "Guardar copia de mi avance" / "Save a copy of my progress" downloads `ilo-avance-<YYYY-MM-DD>.json` through a Blob link.
  - "Cargar copia" / "Load a copy" uses a file input.
  - After a load, show `save.imported`, `save.notIlo` or `save.tooNew`, then reload the page on success.
- [ ] **Step 5: Run `npm test`.** Expected: `# fail 0`.
- [ ] **Step 6: Browser check.** Save a copy, clear site data, load the copy: the coins and the room are back.
- [ ] **Step 7: Commit** `feat: progress backup file`.

### Task 4: Exit labels at the designers' sign spots

`drawExit` (`js/world-draw.js`, around line 2019) ignores the layout's `exit.sign`. In the Frozen lake the label sits under Ilo at the start spot.

**Files:**
- Modify: `js/world-data.js`, `js/world-draw.js` (`drawExit`, `drawExitLabel`)
- Test: `tests/world.test.js`

**Interfaces:**
- Produces: `exitLabelSpot(world, exit) -> { x, y }`. Start from `exit.sign` (the old arrow-based spot when there is none). If that is within 90 px of `world.start`, move it 130 px sideways toward the room's middle. Then clamp it out of the toolbar corners `HUD = [[0, 0, 300, 60], [980, 0, 1280, 60], [0, 670, 380, 720], [780, 660, 1280, 720]]`, also exported from `js/world-data.js`.

- [ ] **Step 1: Write the failing test:**

```js
test('every exit label is away from the start spot and the toolbar corners', () => {
  for (const [id, world] of Object.entries(built)) for (const exit of world.exits) {
    const p = exitLabelSpot(world, exit);
    assert.ok(Math.hypot(p.x - world.start.x, p.y - world.start.y) >= 90, `${id} -> ${exit.to}`);
    assert.ok(!HUD.some(([l, t, r, b]) => p.x > l && p.x < r && p.y > t && p.y < b), `${id} -> ${exit.to} under the toolbar`);
  }
});
```

- [ ] **Step 2: Run `node --test tests/world.test.js`.** Expected: FAIL, "exitLabelSpot is not a function".
- [ ] **Step 3: Implement `exitLabelSpot` and `HUD`;** `drawExit` draws the label there and keeps its arrow.
- [ ] **Step 4: Run `npm test`.** Expected: `# fail 0`.
- [ ] **Step 5: Browser check.** In the Frozen lake, Plaza and Market street, labels are readable and not under Ilo or the buttons, at 1366 x 768 and 844 x 390.
- [ ] **Step 6: Commit** `fix: exit labels at the designers' sign spots`.

### Task 5: The sea turtle swims under the glass deck

The turtle in the Coral lookout is drawn on top of the glass deck.

**Files:**
- Modify: `tools/apply-layouts.js` (mark animals living in walkable water), `world/rooms/coral-lookout.json`, `js/critters.js`, `js/world-draw.js`, `schema/room.schema.json` (`critters[].under: boolean`)
- Test: `tests/critters.test.js`

**Interfaces:**
- Produces: a room critter entry may have `under: true`; `createCritters` copies it onto the animal as `c.under`.
- Consumes: in the converter, `lay.water[d.water].walkable === true` means `under: true`.

- [ ] **Step 1: Write the failing test:**

```js
test('the sea turtle swims under the glass deck', () => {
  const turtle = createCritters(built['coral-lookout'], random(3)).find((c) => c.type === 'sea-turtle');
  assert.equal(turtle.under, true);
});
```

- [ ] **Step 2: Run `node --test tests/critters.test.js`.** Expected: FAIL, `undefined !== true`.
- [ ] **Step 3: Implement it.**
  - In the converter, copy the walkable-water flag as `under: true`.
  - Add `"under": true` to the sea-turtle entry in `world/rooms/coral-lookout.json` (same result as re-running the converter).
  - `createCritters` copies `entry.under`.
  - `drawWorld` draws `under` animals after the `ground-overlay` layer and before `floor`, and leaves them out of the depth-sorted list.
- [ ] **Step 4: Run `npm test` and `npm run check`.** Expected: both pass.
- [ ] **Step 5: Browser check.** The turtle shows through the glass, with the deck's rim drawn over it.
- [ ] **Step 6: Commit** `fix: sea turtle under the glass deck`.

### Task 6: Elephants walk to the waterhole as a herd

`createCritters` gives each of the 3 elephants its own random timer, so they can overlap or arrive one at a time.

**Files:**
- Modify: `js/critters.js` (passer `count > 1`)
- Test: `tests/critters.test.js`

**Interfaces:**
- Produces: the first passer of an entry leads. The others get `c.leader` (the leader object) and `c.gap = 110 * k`, where `k` is their place in line. They follow at `leader.x - leader.facing * c.gap`, with `y = leader.line + (k % 2 ? 18 : -18)`, and share its state (`walk`, `drink`, `away`).

- [ ] **Step 1: Write the failing test:**

```js
test('elephants come as a herd, one behind another', () => {
  const world = built.waterhole;
  const herd = createCritters(world, random(5)).filter((c) => c.type === 'elephant');
  assert.equal(herd.length, 3);
  let together = 0;
  run(herd, world, FAR, 120, (list) => {
    const seen = list.filter(isVisible);
    if (seen.length > 1) together++;
    for (const a of seen) for (const b of seen) if (a !== b) assert.ok(Math.abs(a.x - b.x) >= 60);
  });
  assert.ok(together > 0, 'they were seen together');
});
```

- [ ] **Step 2: Run `node --test tests/critters.test.js`.** Expected: FAIL (`together` is 0, or they overlap).
- [ ] **Step 3: Implement the leader and followers** in `createCritters` and the `passer` branch of `updateCritters`.
- [ ] **Step 4: Run `npm test`.** Expected: `# fail 0`.
- [ ] **Step 5: Commit** `feat: elephants walk as a herd`.

### Task 7: Remove the drawing code from before the layered rooms

All 23 rooms have a `layout`, so the procedural ground no longer runs: areas, paths, scattered trees, plaza tiles, waves, shore strips, planks and water. `js/world-draw.js` is 2,358 lines.

**Files:**
- Modify: `js/world-draw.js`, `js/world-data.js`, `js/world.js` (`themeOf`, `isArctic`), `js/weather.js`, `js/world-map.js` (`roomType`), `js/toys.js` (via `surfaceAt`), `schema/room.schema.json` (`layout` required; `areas`, `paths`, `scatter`, `decorations` optional)
- Test: `tests/world.test.js`, `tests/living-world.test.js`

**Interfaces:**
- Produces in `js/world-data.js`: `areaOf(room) -> 'plaza' | 'forest' | 'savannah' | 'arctic' | 'coast' | 'indoor'`, from `room.layout.surface` (`sand` -> `coast`). It replaces every `room.areas[0].type` read in `js/world.js`, `js/weather.js` and `js/world-map.js`.
- Removes from `js/world-draw.js`: `GROUND` marks, `PATH`, `BOARDWALK`, `groundMarks`, `areaPath`, `drawMark`, `drawPlazaTiles`, `drawWaves`, `shoreY`, `drawShoreStrips`, `drawPlanks`, `drawWater`, and the non-layout branches in `drawWorld`.
- Removes from `js/world-data.js`: `scatter`, `random`-placed decorations, `nearPath` water rules, and the non-layered `buildRoom` and `collides` branches.
- Keeps: `drawDecoration` (party decorations still use it) and `drawHouseRoom`.

- [ ] **Step 1: Write the failing tests:**

```js
test('every room is a layered room', () => {
  for (const [id, room] of Object.entries(rooms)) assert.ok(room.layout, id);
});
test('each room knows its area from its layout', () => {
  assert.equal(areaOf(rooms['palm-beach']), 'coast');
  assert.equal(areaOf(rooms['snowy-ridge']), 'arctic');
  assert.equal(areaOf(rooms.house), 'indoor');
  assert.equal(areaOf(rooms.plaza), 'plaza');
});
```

- [ ] **Step 2: Run `node --test tests/world.test.js`.** Expected: FAIL, "areaOf is not a function".
- [ ] **Step 3: Add `areaOf` and switch every `areas[0].type` read to it.** Run `npm test`: `# fail 0`.
- [ ] **Step 4: Delete the listed code.** `git grep` each removed name: no matches. The weather and party tests in `tests/living-world.test.js` still pass.
- [ ] **Step 5: Run `npm run check` and `npm test`.** Expected: both pass. `wc -l js/world-draw.js` is well under 2,000.
- [ ] **Step 6: Browser check.**
  - The Plaza, Palm beach, Snowy ridge (snow falls) and the house look the same as before.
  - The music changes between areas.
- [ ] **Step 7: Commit** `refactor: remove pre-layout room drawing`.

### Task 8: Run the checks on GitHub for every push

**Files:**
- Create: `.github/workflows/check.yml`
- Modify: `README.md` (one line under "Commands": the green check means the tests passed)

- [ ] **Step 1: Write the workflow:**
  - Runs `on: [push, pull_request]` on `ubuntu-latest`.
  - Steps: `actions/checkout` and `actions/setup-node` (current majors, confirmed on their GitHub release pages before writing them), `node-version: 20`, `cache: npm`, then `npm ci`, `npm run check`, `npm test`.
- [ ] **Step 2: Check it runs the same as on this computer:** `npm ci && npm run check && npm test` passes locally.
- [ ] **Step 3: Commit** `ci: run the checker and tests on GitHub`.
- [ ] **Step 4: Santiago pushes** with GitHub Desktop (Push origin). Expected: the Actions tab shows a green "check" run on `main`.

### Task 9: Publish the game with GitHub Pages (needs Santiago's yes)

Pages on a free account needs a public repository, which also makes the code and `docs/` public. `sources/` is not in git.

**Files:**
- Create: `.nojekyll` (empty, so GitHub serves every file as is)
- Modify: `README.md` (the address and how to update it), `docs/TASKS.md` (N5)

- [ ] **Step 1: Confirm with Santiago:** a public repository is OK, and the address will be `https://santiagoroque.github.io/ILO/`.
- [ ] **Step 2: Check that no page uses an absolute `/` path that breaks under `/ILO/`:**

```bash
git grep -nE "(src|href)=\"/|fetch\('/|new URL\('/" -- '*.html' js
```

  Expected: no matches.
- [ ] **Step 3: Add `.nojekyll`, commit** `chore: ready for GitHub Pages`, and push.
- [ ] **Step 4: Santiago sets it up on GitHub:** Settings, General, change visibility to Public. Then Settings, Pages, Deploy from a branch, `main`, `/ (root)`.
- [ ] **Step 5: Browser check of the live address:**
  - The world loads.
  - A lesson opens, runs and wins.
  - `teacher.html` prints.
  - `sources/` gives 404.

### Task 10: Work without internet after the first visit

Many schools have weak internet. This task needs Task 9 first (service workers need https or localhost).

**Files:**
- Create: `sw.js` (at the top, next to `index.html`), `js/offline.js`
- Modify: the five pages (register the worker), `tools/build-site.js` (copy `sw.js`), `tools/serve.js` (serve `sw.js` with `Service-Worker-Allowed: /`)
- Test: `tests/offline.test.js`

**Interfaces:**
- Produces in `js/offline.js`:
  - `CACHE_VERSION`, taken from `package.json` `version` at the next release bump.
  - `cacheName() -> 'ilo-' + CACHE_VERSION`.
  - `shouldCache(url: string) -> boolean`: true for files under the site's own folder; false for other hosts, `sources/` and `?` URLs with `time=`, `party=` or `lite=`.
  - `staleCaches(names: string[]) -> string[]`: every `ilo-*` name that is not `cacheName()`.
- Consumes in `sw.js`: those three functions (imported with `importScripts` of a classic copy, or as a module worker).

- [ ] **Step 1: Write the failing tests:**

```js
test("only the game's own files are cached", () => {
  assert.equal(shouldCache('https://santiagoroque.github.io/ILO/assets/world/decorations/tree.svg'), true);
  assert.equal(shouldCache('https://fonts.googleapis.com/css2'), false);
  assert.equal(shouldCache('https://santiagoroque.github.io/ILO/sources/libro.pdf'), false);
});
test('an update clears the old copy', () => {
  assert.deepEqual(staleCaches(['ilo-0.0.9', cacheName(), 'other']), ['ilo-0.0.9']);
});
```

- [ ] **Step 2: Run `node --test tests/offline.test.js`.** Expected: FAIL, module not found.
- [ ] **Step 3: Implement `js/offline.js` and `sw.js`.**
  - Cache on first fetch, then serve from the cache and refresh it in the background.
  - On `activate`, delete `staleCaches`.
  - Do not precache all 1,800 files.
- [ ] **Step 4: Run `npm test`.** Expected: `# fail 0`.
- [ ] **Step 5: Browser check on the live site.** Visit the Plaza and one lesson, set DevTools to offline and reload: both still open.
- [ ] **Step 6: Commit** `feat: play offline after the first visit`.

### Task 11: The map itself is the place picker (needs Santiago's yes)

This is the open question from 2026-10-29. Today the map has clickable spots and machine markers, and the "Ir directo a un lugar" buttons sit below it.

**Files:**
- Modify: `js/world-map.js`, `css/style.css`
- Test: `tests/world.test.js`

**Interfaces:**
- Produces: `mapButtons(worldData, rooms) -> { label, room, station, left, top }[]`, one per map room (16) and one per machine marker (6). `left` and `top` are percentages of the 1000 x 625 picture, so a real `<button>` can sit over each spot for keyboards and screen readers.

- [ ] **Step 1: Write the failing test:**

```js
test('the map has a button for each of the 16 places and 6 machines', () => {
  const buttons = mapButtons(worldData, rooms);
  assert.equal(buttons.filter((b) => !b.station).length, 16);
  assert.equal(buttons.filter((b) => b.station).length, 6);
  for (const b of buttons) assert.ok(b.left >= 0 && b.left <= 100 && b.top >= 0 && b.top <= 100, b.label);
});
```

- [ ] **Step 2: Run `node --test tests/world.test.js`.** Expected: FAIL, "mapButtons is not a function".
- [ ] **Step 3: Implement `mapButtons`.** `openWorldMap` places transparent buttons over the canvas, each with its own `aria-label` and a visible focus ring. Remove the list and its "Ir directo a un lugar" title.
- [ ] **Step 4: Run `npm test`.** Expected: `# fail 0`.
- [ ] **Step 5: Browser check.**
  - Tab moves through the places in map order, and Enter goes there.
  - A machine button lands in front of that machine.
  - Check at 1366 x 768 and at 844 x 390.
- [ ] **Step 6: Commit** `feat: the map is the place picker`.

### Task 12: Test the room-layout converter so the next delivery is safe

`tools/apply-layouts.js` has no tests, and it only runs as a script.

**Files:**
- Create: `tools/layout-convert.js` (the conversion, no file writing), `tests/fixtures/layout-mini.json` (one small room: a building with a door, an exit, a resident standing on the start spot, two dance tiles), `tests/fixtures/room-mini.json`
- Modify: `tools/apply-layouts.js` (reads files, calls the converter, writes rooms)
- Test: `tests/apply-layouts.test.js`

**Interfaces:**
- Produces: `convertRoom(room, lay, anchors, { revision }) -> { room, notes: string[] }`. It does not change its inputs, and it throws `Error` with the same messages the script uses today.

- [ ] **Step 1: Write the failing tests:**

```js
test("a door, an exit and the gems move to the designers' spots", () => {
  const { room } = convertRoom(fixtureRoom, fixtureLayout, anchors, { revision: 'test' });
  assert.deepEqual(room.stations[0].door, { x: 400, y: 420 });
  assert.equal(room.exits[0].spawn.x, 1170);
  assert.equal(room.layout.revision, 'test');
});
test('a start spot on a resident is moved aside and noted', () => {
  const { room, notes } = convertRoom(fixtureRoom, fixtureLayout, anchors, { revision: 'test' });
  assert.equal(room.spawn.x, 580); // Straight on the resident: 60 px to the left.
  assert.match(notes[0], /the start was on/);
});
test('a door missing from the layout stops the conversion', () => {
  const lay = { ...fixtureLayout, objects: fixtureLayout.objects.filter((o) => !o.station) };
  assert.throws(() => convertRoom(fixtureRoom, lay, anchors, { revision: 'test' }), /missing from the layout/);
});
```

  The fixture values: door `[400, 420]`, exit arrival `[1170, 510]`, start `[640, 560]`, resident at `[640, 530]`.

- [ ] **Step 2: Run `node --test tests/apply-layouts.test.js`.** Expected: FAIL, module not found.
- [ ] **Step 3: Move the per-room body of `tools/apply-layouts.js` into `convertRoom`.** Keep the script's output and messages the same.
- [ ] **Step 4: Check the move changed nothing.**
  - Re-run the converter from the pre-layout room backup on the v3 layout file, if it is still at hand.
  - `git diff --stat world/rooms` shows no change.
  - Run `npm test`: `# fail 0`.
- [ ] **Step 5: Commit** `test: cover the room-layout converter`.

---

## Not code: decisions and checks only people can do

These stay in `docs/TASKS.md`. Some unblock tasks above.

| Item | Who | Unblocks |
|---|---|---|
| Push the folder tidy-up commit (GitHub Desktop, Push origin) | Santiago | Tasks 8 and 9 |
| Public repository and GitHub Pages: yes or not yet (N5) | Santiago | Tasks 9 and 10 |
| The map as the place picker: yes or no | Santiago | Task 11 |
| Try ILO on an old school computer and on Windows (N3), before and after Tasks 1 and 2 | Santiago or the team | Confirms Tasks 1 and 2 |
| Final prices (B11) | Santiago | Shop balance |
| Listen to the sounds and music (B12, N6) | A person with speakers | Sound polish |
| Ask the designers for the round A fixes and the 5 hidden warm-up pictures (K08) | Santiago | Lesson warm-ups |
| Kendra or Manu adds a lesson using only the README (N1); educator review (N8) | Team | Pilot readiness |
