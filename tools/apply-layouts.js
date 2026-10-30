// Puts the designers' layered rooms (docs/DESIGN_PROMPT_3.md, revision 3) into the
// room files. Run it after importing their art:
//
//   npm run import-art -- "/path/to/delivery/assets" --add
//   npm run apply-layouts -- "/path/to/delivery/assets/world/redesign-layouts-v3.json"
//
// The conversion itself is in tools/layout-convert.js. The game draws a room
// with a layout from its pictures (js/world-draw.js) and walks it with its
// polygons (js/world-data.js).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertRoom } from './layout-convert.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) {
  console.error('Usage: npm run apply-layouts -- "/path/to/redesign-layouts-v3.json"');
  process.exit(1);
}
const delivery = JSON.parse(readFileSync(source, 'utf8'));
const anchors = JSON.parse(readFileSync(join(root, 'assets/anchors.json'), 'utf8'));

let changed = 0;
for (const [id, lay] of Object.entries(delivery.rooms)) {
  const file = join(root, `world/rooms/${id}.json`);
  const { room, notes } = convertRoom(JSON.parse(readFileSync(file, 'utf8')), lay, anchors, { revision: delivery.revision });
  for (const note of notes) console.log(`  ${note}`);
  writeFileSync(file, `${JSON.stringify(room, null, 2)}\n`);
  changed++;
}
console.log(`ILO: ${changed} rooms now use the layered layout "${delivery.revision}"`);
