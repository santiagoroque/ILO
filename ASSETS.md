# ILO asset and license register

Every outside file ILO uses, where it came from and under which license. Add a row whenever you bring in a new picture, sound, font or library (research report, section 6). This register is a record, not a legal clearance.

## Art, sound and font

| What | Folder | Source | License | Received | Changes made by ILO |
|---|---|---|---|---|---|
| All pictures: Ilo, clothing, pets, world, buildings, furniture, stamps, map, minigames, interface icons, logo | `assets/` (SVG) | ILO design delivery "Direction 06", made for ILO from DESIGN_PROMPT.md | CC0 1.0 (`assets/LICENSE.txt`) | 2026-10-27 | Copied with `npm run import-art`; only SVGs used, PNG exports left out. Ilo's placeholder colors are replaced at runtime. |
| Sound effects and area music | `assets/audio/` (OGG and MP3) | Same delivery, original compositions | CC0 1.0 | 2026-10-27 | Sound effects used as delivered. The area music files are kept but no longer played: the music is now composed in `js/audio.js` (PLAN.md, D18). |
| Nunito font | `assets/fonts/nunito-variable.ttf` | Google Fonts (github.com/google/fonts, ofl/nunito), via the delivery | SIL Open Font License 1.1 (`assets/fonts/OFL.txt`) | 2026-10-27 | None. Not relicensed under CC0. |
| Design tokens (colors, sizes) | `assets/tokens.json` | Same delivery | CC0 1.0 | 2026-10-27 | Colors copied into `css/style.css` and the drawing code. |
| Fallback shape drawings | `js/*.js` | Written for ILO | Same as the ILO code | 2026-10-27 | Drawn while a picture loads or if one is missing. |
| Synthesized fallback sounds | `js/audio.js` | Written for ILO | Same as the ILO code | 2026-10-27 | Played until the recordings load. |
| Delivery 2, round A: lesson art (3 arcade screens, magnet crane and rubbing scenes, 12 warm-up pictures, applied-scientist stamp), the Coast kit (grounds, wave strips, lagoon, waterfall, 18 decorations, boathouse, reef hut), 12 wild animals and the spotted sparkle | `assets/` (209 SVG; added with `npm run import-art -- <round>/assets --add`) | ILO delivery 2, round A (`~/Documents/Codex/2026-10-27/files-pasted-by-the-user-lo/outputs/ilo-round-a`) | CC0 1.0 (`assets/LICENSE-delivery-2.txt`) | 2026-10-28 | The magnet room and rubbing room are drawn at their own size with the top cropped; the crane magnet and carriage are scaled down; the block is tinted as it warms; wave strips are laid in one row. Room previews, sheets, PNG exports and the painted concept are not copied. |
| World redesign, revision 3: all 23 rooms in layers (ground and foreground pictures for each room), a v3 fountain, giant mushroom, pier cap, ripples and workshop tools, a trophy wall with 16 frames, exhibit plinths, the 1000 x 625 world map with its pin and 6 machine markers, and the resident and toy pictures | `assets/` (441 SVG; added with `npm run import-art -- <delivery>/assets --add`), room data in `world/rooms/*.json` (`npm run apply-layouts`) | ILO room redesign revision 3 (`~/Documents/Codex/2026-10-27/files-pasted-by-the-user-lo/outputs/ilo-room-redesign-v3.zip`) | CC0 1.0 (designers' notes; earlier ILO art keeps its CC0 terms) | 2026-10-29 | The 168 files that were already in the game were byte-identical. Previews, flattened stages, PNG exports and the review page are not copied. |
| Delivery 2 shape drawings (Coast, animals, residents, toys, houses, furniture sets, Market street, parties, new clothing and pets) | `js/world-draw.js`, `js/critter-draw.js`, `js/resident-draw.js`, `js/toy-draw.js`, `js/furniture-sets.js`, `js/avatar.js`, `js/pet.js`, `js/stamps.js` | Written for ILO (Phase 13) | Same as the ILO code | 2026-10-28 | Drawn until delivery 2's pictures arrive (DESIGN_PROMPT_2.md, Part 16 lists every file name). |
| Coast music theme | `js/audio.js` | Composed for ILO (Phase 13) | Same as the ILO code | 2026-10-28 | Original melody, played live. |

The original delivery folder (with PNG exports, painted concepts and mockups) was at `~/Documents/Codex/2026-10-27/files-pasted-by-the-user-lo/outputs/ilo-complete`. Keep a copy: it is the editable source.

### Needed from the designers

Everything still missing is listed in **DESIGN_PROMPT_2.md** (delivery 2); Part 16 lists every file name the game looks for. All of delivery 2 is ready in code and drawn with shapes until the pictures arrive, for example:
- The stamp "Applied scientist", the three newer arcade screens, the magnet crane and rubbing scenes, and the 12 warm-up pictures (Part 12).
- The Coast: grounds, water, 19 decorations and 2 buildings (Part 3). `tests/art.test.js` lists them in `AWAITING_ART`; remove each one as it arrives.
- Wild animals for the first areas (Part 4.1).

## Code libraries

| Library | Version | Folder | License | Notes |
|---|---|---|---|---|
| Blockly | 13.4.0 | `vendor/blockly/` (copied from `node_modules` by `npm install`) | Apache-2.0 | Includes Blockly's own media (icons, sounds). |
| Matter.js | 0.20.0 | `vendor/matter-js/` | MIT | Used for the gravity lesson. |
| Ajv | 8.20.0 | `node_modules/` only (checker and tests) | MIT | Not shipped to the browser. |

## Originality

ILO is inspired by the virtual-world genre but copies no other game's characters, art, names, logos or layouts (PLAN.md, A10 to A14). Before a public launch, have someone qualified review names and the logo for trademark conflicts.
