// Copies the art delivery into assets/ so the game can use it.
// Run it again whenever the designers send new files:
//
//   npm run import-art -- "/path/to/delivery/assets"
//
// A delivery that only adds pictures (delivery 2 comes in rounds) is added
// on top of what is there, keeping every picture already imported:
//
//   npm run import-art -- "/path/to/round/assets" --add
//
// It copies only what the game loads (SVG pictures, sounds, the font and the
// logo), never the big PNG exports, paintings or mockups. It also writes
// assets/anchors.json: for every picture, its size and the point that sits
// on the ground (see the delivery's README, "Files, coordinates and layering").
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets');
const source = process.argv[2];
const adding = process.argv.includes('--add');

if (!source || !existsSync(join(source, 'manifest.json'))) {
  console.error('Usage: npm run import-art -- "/path/to/delivery/assets" (the folder with manifest.json)');
  process.exit(1);
}

// Folders that are only for looking at, not for the game.
const SKIP = ['avatar/previews', 'clothing/combination-test', 'ui/sheets', 'ui/proofs', 'ui/mockups', 'ui/components', 'world/rooms', 'world/concept',
  'world/paths', 'delivery-2', 'world/stages', 'world/stages-v3'];
const skipped = (file) => SKIP.some((dir) => file.startsWith(`${dir}/`)) || file.includes('scene-preview') || file.includes('preview-source');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const before = adding && existsSync(join(out, 'anchors.json')) ? JSON.parse(readFileSync(join(out, 'anchors.json'), 'utf8')) : {};
if (!adding) rmSync(out, { recursive: true, force: true });
let count = 0;
let bytes = 0;
function copy(file) {
  const to = join(out, file);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(join(source, file), to);
  count++;
  bytes += statSync(to).size;
}

for (const path of walk(source)) {
  const file = relative(source, path).split('\\').join('/');
  const keep = (file.endsWith('.svg') && !skipped(file))
    || /^audio\/.*\.(ogg|mp3)$/.test(file)
    || file.startsWith('fonts/')
    || file === 'logo/favicon.ico'
    || file === 'LICENSE.txt'
    || file === 'tokens.json';
  if (keep) copy(file);
}

// Size and ground point of every copied picture.
const manifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'));
const anchors = { ...before };
for (const entry of manifest) {
  if (!existsSync(join(out, entry.file))) continue;
  const [, , width, height] = entry.viewBox;
  anchors[entry.file] = [width, height, ...entry.anchor];
}
writeFileSync(join(out, 'anchors.json'), `${JSON.stringify(anchors)}\n`);

console.log(`ILO: ${adding ? 'added' : 'copied'} ${count} art files (${(bytes / 1024 / 1024).toFixed(1)} MB) into assets/`);
