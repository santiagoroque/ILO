# ILO: Tasks

Status values: todo / in_progress / done. Milestones (M1 to M5) are defined in PLAN.md.

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1 | Phase 1: Clarify questions and record assumptions | done | Assumptions A1 to A8 are in PLAN.md |
| P2 | Phase 2: Compare stacks and record decision | done | D1: Blockly + Matter.js + plain canvas |
| P3 | Phase 3: Write PLAN.md and this task list | done | D2 to D5 added |
| T01 | Create folder structure and package.json with pinned versions | done | M1. blockly 13.4.0, matter-js 0.20.0 |
| T02 | Install dependencies and copy library files into vendor/ | done | M1. postinstall copy step (D4) |
| T03 | Write tools/serve.js (zero-dependency local server) | done | M1. `npm start` on port 8080 |
| T04 | Add translations (locales/es.json, en.json) and js/i18n.js | done | M1. Spanish default, choice remembered |
| T05 | Build home page with lesson list from lessons/catalog.json | done | M1 |
| T06 | Save schema/lesson.schema.json and write tools/check-lessons.js | done | M2. `npm run check` |
| T07 | Write lessons/gravity.json (full ES/EN text) and catalog entry | done | M2 |
| T08 | Write js/lesson-loader.js with friendly errors and file:// warning | done | M2 |
| T09 | Define blocks in js/blocks.js (when run, set gravity, set mass, drop) | done | M3. Labels come from locales |
| T10 | Write js/runner.js (blocks to command list) | done | M3. No eval (D2) |
| T11 | Write the physics world: js/simulation.js (Matter.js, fixed time step) + js/renderer.js (canvas, drone) | done | M3. Split in two so tests run without a browser |
| T12 | Write js/win-conditions.js (lands_in_zone + feedback) | done | M4 |
| T13 | Lesson page UI: Run, Reset, Hint, messages, layout for 1366x768 | done | M4 |
| T14 | Write js/progress.js (completed lessons + saved blocks in localStorage) | done | M4. Only file that touches storage (A3) |
| T15 | Headless tests in tests/ (only Mars wins, mass has no effect, schema valid) | done | M5. `npm test` |
| T16 | Write README.md for non-programmers (run locally, add a lesson) | done | M5 |
| T17 | Phase 5: run in browser, test all planets, check both languages | done | M5. Earth, Mars, Moon played in browser; all four planets + no-drop in `npm test` |
| T18 | Phase 5: report checklist pass/fail and fix failures | done | M5. Fixed: hints erased by last click; Blockly zoom/trash labels in English. Results in PLAN.md |
| P6 | Phase 6: Plan the world (map, stations, coins, shop) | done | A10 to A14, D6 to D8 in PLAN.md. Approved 2026-10-27 |
| W01 | Write world/map.json (Forest, Savannah, Arctic, plaza, stations) and schema/map.schema.json | done | D7 |
| W02 | Extend npm run check for the map (station lessons exist, ES/EN names) | done | |
| W03 | Map page: camera, click-to-walk, arrow/WASD keys, collisions | done | js/world.js. Draw only what is on screen |
| W04 | Draw the three areas, decorations and stations in a cartoon style | done | js/world-draw.js, original art only (A10) |
| W05 | Original avatar mascot with color + item | done | js/avatar.js (A14) |
| W06 | Station prompt and Play; coming-soon stations; lesson back button returns to the map | done | |
| W07 | Coins: lesson "reward" field (default 50), paid once per lesson | done | Schema + progress.js (D8) |
| W08 | Shop: world/items.json, buy, equip, preview | done | js/shop.js |
| W09 | Save avatar, coins, items and map position in progress.js | done | D8, keeps A3 |
| W10 | Move the old lesson list to lessons.html behind an "All lessons" button | done | For teachers |
| W11 | Tests: map checks, coin rules (paid once), shop rules | done | npm test |
| W12 | Update README (map, stations, adding a station) and verify in browser | done | Frame timing measured (2.2 ms median); real old hardware still N3 |
| P7 | Phase 7: Plan rooms, emotes, clothing slots, pets, house | done | A15 to A17, D9 to D12 in PLAN.md. Approved and built 2026-10-27 |
| R01 | Room format: world/world.json, world/rooms/*.json, schemas; move the current map into 11 rooms | done | D9 |
| R02 | Room switching: exits, fade, spawn points, room saved in progress | done | R1 |
| R03 | World map overlay with clickable rooms | done | R1 |
| R04 | Checker: exits lead to real rooms, way back exists, doors and exits reachable | done | R1 |
| R05 | Phrases + emotes data, menus, bubbles over the avatar, keys 1-8 | done | R2, D10 |
| R06 | items.json v2 (slots, pets, furniture) + schema; old-save upgrade in progress.js | done | R3, D11 |
| R07 | Draw 18 clothing items on six slots; shop tabs per slot with Remove | done | R3 |
| R08 | Pets: draw 3 pets, adopt, name list, follow, feed, happiness over days, switch | done | R4, A16 |
| R09 | House room: style choice, furniture drawing, decorate mode (place, move, put away) | done | R5, D12 |
| R10 | Welcome gift of 100 coins | done | A15 |
| R11 | Tests: rooms reachable, save upgrade, slots, pet happiness, furniture rules, every item has a drawing | done | R6 |
| R12 | README + browser walkthrough in ES/EN + frame timing | done | R6 |
| P8 | Phase 8: Plan lessons, interiors, avatar, stamps, extras, sound | done | A18, D13 to D16 in PLAN.md. Approved 2026-10-27 |
| L01 | Physics models: slide (friction) and lever in simulation.js, new blocks and win conditions | done | D13 |
| L02 | Friction lesson (lessons/friction.json) + renderer | done | L1 |
| L03 | Lever lesson (lessons/lever.json) + renderer | done | L2 |
| U01 | Interiors: 4 indoor rooms, arcade and counter stations, fixed furniture | done | U1, D14 |
| U02 | Avatar views, waddle, dance and sit | done | U2 |
| U03 | Stamps: stamps.json, stamps.js, book panel, toasts | done | U3, D15 |
| U04 | Gems, daily coins, snowballs and targets | done | U4, A18 |
| U05 | Synthesized sound effects, area music, mute | done | U5, D16 |
| U06 | Checker, tests, README, browser walkthrough in ES/EN | done | |

| P9 | Phase 9: Apply the design delivery (Direction 06 art kit) | done | Requested 2026-10-28 ("here are the designs apply them"). D17 in PLAN.md |
| A01 | Import tool: copy runtime SVGs, OGG audio, font and logo into assets/, build anchors file | done | tools/import-art.js |
| A02 | Sprite loader with pre-rendering and body recolor; code drawings stay as fallback | done | js/sprites.js |
| A03 | Avatar, clothing, pets, emotes and music notes from sprites | done | |
| A04 | World: ground textures, paths, water, decorations, buildings, stations, exits, gems, snowballs, interiors, furniture | done | |
| A05 | Minigame scenes: gravity, friction, lever pieces | done | renderer.js |
| A06 | Interface: Nunito font, colors, toolbar icons, logo, favicon, stamps, shop icons, world map | done | |
| A07 | Recorded sound effects and music with synth fallback | done | |
| A08 | Checker, tests, README, browser check in ES/EN | done | |

| P10 | Phase 10: Learning-first upgrades from the research report | done | Approved 2026-10-28. Results in PLAN.md |
| E01 | Optional prediction before a run, compared after it | done | |
| E02 | Keep the last run's mark on screen to compare settings | done | |
| E03 | Changed-case challenge per lesson (`challenges` in lesson JSON) | done | Exactly one answer, different from the main one |
| E04 | Explored / Solved / Applied progress, save version 3 | done | |
| E05 | Four-step hint ladder in each lesson, ES and EN | done | |
| E06 | Simulator and test-track story text | done | |
| E07 | Teacher notes in lesson JSON + teacher.html | done | |
| E08 | Experiment journal (last 10 runs per lesson) | done | |
| E09 | Economy: Applied rewards, new stamp, lower prices | done | One-time coins cover about 2/3 of the shop |
| E10 | Keyboard place list in the map; text result after each run; check Blockly keyboard support | done | Tab reaches the blocks with spoken labels; a full program built by keyboard alone not tried |
| E11 | Warning when saving is impossible; "Start over" with confirmation | done | |
| E12 | PILOT.md, ASSETS.md, privacy note; tests; browser check ES/EN | done | |

| P11 | Phase 11: grades 4 and 5 classroom pilot | done | Approved 2026-10-28. Results in PLAN.md |
| G01 | Magnets lesson (5th grade, SEP direct) | done | Two lessons: magnets (materials) and magnet-poles. Drawn in code |
| G02 | Friction makes heat lesson (4th grade, SEP direct) | done | New lesson type |
| G03 | Fair-comparison step in the sled lesson | done | |
| G04 | `curriculum` label per lesson; grade filter | done | |
| G05 | Design-card fields in teacher notes | done | |
| G06 | Read SEP books 4th and 5th; link lessons to pages | done | Original text only |
| G07 | Short goal cards and read-aloud | done | |
| G08 | Explain-why question after a win | done | |
| G09 | Teacher summary per computer, with export | done | |
| G10 | Classroom start screen by grade | done | |
| G11 | Prepare hosting and offline copy | done | `npm run build-site` makes dist/. Not published: the user does that |

| P12 | Phase 12: lessons as a guided path of short steps (Brilliant-style UI/UX) | done | Approved 2026-10-28. D19. Results in PLAN.md |
| S01 | Step engine (js/steps.js) and restructured lesson.html; resume at the saved step | done | |
| S02 | Step UI: progress bar, cards, answer tiles, bottom bar, feedback sheet | done | ILO tokens and art only |
| S03 | Warm-up questions: `warmups` field, schema, checker, 2 per lesson in ES/EN | done | Original text. Named `warmups`, not `steps` |
| S04 | Rewire hook, predict, build and run, why, fair test, new case and key idea as steps | done | Saves and teacher summary kept |
| S05 | Course path page (lessons.html) with node states and grade sections | done | |
| S06 | End-of-lesson card; "solved this week" instead of streaks | done | |
| S07 | Tests and browser checks (ES/EN, keyboard, 1366x768) | done | 72 tests. Touch and screen reader not checked |


## Next (after the MVP)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| N1 | Have Kendra or Manu add a lesson using only the README | todo | The real non-programmer test |
| N2 | Open index.html by double-click in Chrome and Edge to confirm the warning shows | todo | Could not be checked in the preview browser |
| N3 | Try ILO on an old school computer and on Windows | todo | Performance and setup steps |
| N6 | Listen to the sound effects and the new area music on a real computer | todo | Music rewritten 2026-10-28 (D18) in a peaceful game-music style; not heard yet |
| N7 | Choose the pilot group (age, school, devices) and run PILOT.md | todo | Research report, Gates A and B |
| N8 | Educator review of the lesson sequence and teacher notes | todo | Report section 3 |
| N9 | Legal review for launch countries before accounts or hosting | todo | Report section 13 |
| N10 | Test whether shared play adds value before any multiplayer | todo | Report Gate E |
| N11 | Build a whole program with the keyboard only, and try a screen reader end to end | todo | Phase 10: only partly checked |
| N12 | New stamp icon for "Applied scientist" from the designers | todo | Reuses the flask icon (ASSETS.md) |
| N13 | Designer art for the magnet, poles and heat scenes and their machines | todo | Drawn in code for now (ASSETS.md) |
| N14 | Check Proyectos Escolares and Comunitarios 4th grade for a friction-and-heat activity | todo | Not in Nuestros saberes or Proyectos de Aula 4th |
| N15 | Publish dist/ (GitHub Pages or another host) | todo | User's account; free tier is non-commercial |
| N16 | Designer art for warm-up questions (pictures or small animations) | todo | Phase 12: only 2 of 12 warm-ups have a picture |
| P13 | Phase 13: bigger, livelier world (Coast, living world, houses to buy, hangouts, parties) | in_progress | Proposed 2026-10-28. Art brief DESIGN_PROMPT_2.md (includes N12, N13, N16). Round A code approved 2026-10-28 ("okay prepare the code") |
| K01 | Coast in code: sand, jungle, sea, shallows, boardwalks, lagoon, 19 decoration shapes, Boathouse and Reef hut (soon) | done | Round A. Drawn as shapes until delivery 2 |
| K02 | Four Coast rooms, a south exit from the Plaza, map spots, coast music theme | done | 19 rooms, 24 gems |
| K03 | Wild animals: js/critters.js (behavior) and js/critter-draw.js (drawing), 12 kinds in 13 rooms | done | Most flee or hide when Ilo comes close |
| K04 | Hooks for the missing lesson art: own arcade screens, magnet and heat scenes, warm-up pictures, stamp art | done | Exact file names in DESIGN_PROMPT_2.md 12.6 |
| K05 | Tests and browser check | done | 79 tests. Animals' look checked as shapes only |
| K06 | Import delivery 2 art as it arrives (`npm run import-art -- <round>/assets --add`), check each piece in the browser | in_progress | Round A imported 2026-10-28 (209 SVG). Rounds B to E to come |
| K07 | New world map art with the Coast (DESIGN_PROMPT_2.md Part 11) | done | 2026-10-29: `map/world-map-v3.svg` from the room redesign revision 3, with its pin and 6 machine markers (a click on a marker goes to that machine) |
| B01 | Moving scenery (plant, water and building loops), evening by the clock (night buildings, lamp glow, northern lights), weather | done | "code everything prepare it for the art" (2026-10-28) |
| B02 | Coast animals (crab, toucan, macaw, heron, sea turtle), "spotted" animals and the Field guide | done | |
| B03 | Residents (6) with tip lines | done | |
| B04 | Physics toys (10) | done | |
| B05 | Houses to buy (8 styles), wallpapers, floors, 36 furniture pieces, house catalog | done | |
| B06 | Market street with the hangout rooms (juice bar, fiesta hall, museum), kiosco, stalls | done | |
| B07 | 14 clothing items, 3 pets | done | |
| B08 | 10 new stamps, support for the new map | done | |
| B09 | Seasonal parties (4) | done | |
| B10 | Economy, tests, browser check, docs | done | |
| B11 | Decide final prices: houses 150 to 500, wallpapers and floors 30 (long-term goals need daily rewards) | todo | Numbers in PLAN.md, Phase 13 results |
| B12 | Hear the new sounds and music on a real computer (coast theme, marimba, record player) | todo | Not heard by a person |
| K08 | Ask the designers for round A fixes: pole versions of the crane magnet and the magnet box, and warm-up pictures that don't show the answer | todo | DESIGN_PROMPT_2.md Part 15. Hidden for now (2026-10-28): heat-hands, heat-surfaces, magnet-poles-opposites, magnet-poles-like, lever-plank-log; put each back as `"picture"` in its lesson's warm-up when redrawn |
| K09 | World redesign round 2: brief sent to the design team (DESIGN_PROMPT_3.md); integrate their layered rooms when they arrive | done | 2026-10-29: revision 3 (`ilo-room-redesign-v3.zip`, wide camera, Ilo at 1.5) applied to all 23 rooms with `npm run apply-layouts`. The first redesign zip was not applied (the user cancelled). See PLAN.md, "World redesign revision 3: applied" |
| H01 | Put ILO on GitHub | done | 2026-10-29: private repository github.com/santiagoroque/ILO, published with GitHub Desktop. `.gitignore` keeps out sources/ (SEP books), node_modules/ and dist/ |
| H02 | Tidy the project folder | done | 2026-10-29: the documents (PLAN, TASKS, PILOT, ASSETS, DESIGN_PROMPT 1 to 3) moved to docs/; README.md and the five pages stay at the top. References updated; check, tests and site build pass |
| N4 | Plan accounts (teachers, students) | todo | A3. Replace js/progress.js |
| N5 | Publish on GitHub Pages | todo | A6. Static files, no code changes. Free non-commercial pilot only (report S44) |
