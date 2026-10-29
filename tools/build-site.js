// Builds dist/: the files a browser needs to run ILO, ready to publish
// (GitHub Pages or any static host) or to copy to a USB stick.
//
//   npm run build-site
//
// It leaves out everything that is only for building or checking ILO
// (node_modules, tests, tools, schema, plans) and, on purpose, sources/:
// the SEP textbook PDFs stay on this computer (PLAN.md, Phase 11).
// A copy of the small local server is included, because browsers do not
// run ILO from a double-clicked file.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const PAGES = ['index.html', 'lesson.html', 'lessons.html', 'teacher.html', 'summary.html'];
const FOLDERS = ['css', 'js', 'lessons', 'world', 'locales', 'assets', 'vendor'];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const page of PAGES) cpSync(join(root, page), join(dist, page));
for (const folder of FOLDERS) cpSync(join(root, folder), join(dist, folder), { recursive: true });
mkdirSync(join(dist, 'tools'));
cpSync(join(root, 'tools/serve.js'), join(dist, 'tools/serve.js'));
writeFileSync(join(dist, '.nojekyll'), ''); // GitHub Pages: serve files as they are.
writeFileSync(join(dist, 'LEEME.txt'), [
  'ILO - copia para publicar o usar sin internet / copy to publish or use offline',
  '',
  'ES: En una computadora con Node.js, abre una terminal en esta carpeta y escribe:',
  '    node tools/serve.js',
  '    Luego abre http://localhost:8080 en Chrome o Edge.',
  '    Para publicarla en internet, sube el contenido de esta carpeta (por ejemplo a GitHub Pages).',
  '',
  'EN: On a computer with Node.js, open a terminal in this folder and type:',
  '    node tools/serve.js',
  '    Then open http://localhost:8080 in Chrome or Edge.',
  '    To publish it online, upload the contents of this folder (for example to GitHub Pages).',
  '',
].join('\n'));
console.log('ILO: site built in dist/ (without sources/)');
