// Copies the browser files of our libraries from node_modules/ into vendor/.
// Runs automatically after `npm install`. The app loads vendor/ with plain
// <script> tags, so it needs no build step and no internet at runtime.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = join(root, 'node_modules');
const vendor = join(root, 'vendor');

const files = [
  ['blockly/blockly_compressed.js', 'blockly/blockly_compressed.js'],
  ['blockly/msg/es.js', 'blockly/msg/es.js'],
  ['blockly/msg/en.js', 'blockly/msg/en.js'],
  ['blockly/LICENSE', 'blockly/LICENSE'],
  ['matter-js/build/matter.min.js', 'matter-js/matter.min.js'],
  ['matter-js/LICENSE', 'matter-js/LICENSE'],
];

rmSync(vendor, { recursive: true, force: true });
for (const [from, to] of files) {
  mkdirSync(dirname(join(vendor, to)), { recursive: true });
  cpSync(join(nm, from), join(vendor, to));
}
// Blockly's icons, cursors and sounds, so the editor works offline.
cpSync(join(nm, 'blockly/media'), join(vendor, 'blockly/media'), { recursive: true });

console.log('ILO: library files copied into vendor/');
