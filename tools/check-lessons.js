// Checks every lesson, every room and the shop items before you open ILO.  Usage: npm run check
// Revisa las lecciones, las salas y la tienda antes de abrir ILO.  Uso: npm run check
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { checkLesson, LessonError } from '../js/lesson-loader.js';
import { hasClothingDrawing } from '../js/avatar.js';
import { FURNITURE } from '../js/furniture.js';
import { hasPetDrawing } from '../js/pet.js';
import { buildRoom, canWalk, collides, exitAt } from '../js/world-data.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'locales/en.json'), 'utf8'));
const es = JSON.parse(readFileSync(join(root, 'locales/es.json'), 'utf8'));
const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const ajv = new Ajv2020({ allErrors: true });
const compile = (file) => ajv.compile(JSON.parse(readFileSync(join(root, file), 'utf8')));
const validate = compile('schema/lesson.schema.json');

let problems = 0;

// Lists every schema mistake in a file. Returns true if there were none.
function schemaOk(check, data, file) {
  if (check(data)) return true;
  for (const error of check.errors) {
    const where = error.instancePath || '(top)';
    const extra = error.params?.additionalProperty ? ` "${error.params.additionalProperty}"`
      : error.params?.allowedValues ? `: ${error.params.allowedValues.join(', ')}` : '';
    problem(file, `${where} ${error.message}${extra}`);
  }
  return false;
}

function problem(file, message) {
  problems++;
  console.log(`  ✗ ${file}: ${message}`);
}

function readJson(file) {
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
    return JSON.parse(text);
  } catch (error) {
    if (error.code === 'ENOENT') {
      problem(file, 'file not found / no se encontró el archivo');
    } else {
      // Turn "at position 1969" into a line number people can find.
      const position = Number(error.message.match(/position (\d+)/)?.[1]);
      const line = Number.isFinite(position) ? ` (line / línea ${text.slice(0, position).split('\n').length})` : '';
      problem(file, `JSON error / error de JSON${line}: ${error.message}`);
    }
    return null;
  }
}

console.log('Checking lessons / Revisando lecciones...');
const catalog = readJson('lessons/catalog.json');
const listed = Array.isArray(catalog?.lessons) ? catalog.lessons : [];
if (catalog && !Array.isArray(catalog.lessons)) problem('lessons/catalog.json', '"lessons" must be a list / "lessons" debe ser una lista');

const files = readdirSync(join(root, 'lessons')).filter((f) => f.endsWith('.json') && f !== 'catalog.json');
for (const f of files) {
  if (!listed.includes(f.replace(/\.json$/, ''))) {
    console.log(`  ! lessons/${f}: not in catalog.json, so it will not appear / no está en catalog.json, así que no aparecerá`);
  }
}

for (const id of listed) {
  const file = `lessons/${id}.json`;
  const lesson = readJson(file);
  if (!lesson) continue;
  const before = problems;
  if (lesson.id !== id) problem(file, `"id" is "${lesson.id}" but should be "${id}" / "id" debe ser "${id}"`);
  if (schemaOk(validate, lesson, file)) {
    try {
      checkLesson(lesson, file);
    } catch (error) {
      if (!(error instanceof LessonError)) throw error;
      problem(file, `${fill(en[error.key], error.vars)} / ${fill(es[error.key], error.vars)}`);
    }
  }
  if (problems === before) console.log(`  ✓ ${file}`);
}

// ---- The world: world.json and every room ----
console.log('Checking the world / Revisando el mundo...');
const worldFile = 'world/world.json';
const worldData = readJson(worldFile);
const rooms = {};
if (worldData && schemaOk(compile('schema/world.schema.json'), worldData, worldFile)) {
  const before = problems;
  const checkRoom = compile('schema/room.schema.json');
  for (const { id } of worldData.rooms) {
    const file = `world/rooms/${id}.json`;
    const room = readJson(file);
    if (!room) continue;
    if (room.id !== id) problem(file, `"id" is "${room.id}" but should be "${id}" / "id" debe ser "${id}"`);
    if (schemaOk(checkRoom, room, file)) rooms[id] = room;
  }
  if (worldData.rooms.every((r) => r.id !== worldData.startRoom)) {
    problem(worldFile, `startRoom "${worldData.startRoom}" is not in the list / no está en la lista`);
  }
  const size = { width: worldData.roomWidth, height: worldData.roomHeight };
  const gemIds = new Set();
  for (const [id, room] of Object.entries(rooms)) {
    const file = `world/rooms/${id}.json`;
    const roomBefore = problems;
    for (const s of room.stations) {
      if (s.kind === 'lesson' && !listed.includes(s.lesson)) {
        problem(file, `station "${s.id}" opens lesson "${s.lesson}", which is not in lessons/catalog.json / la estación "${s.id}" abre la lección "${s.lesson}", que no está en lessons/catalog.json`);
      }
      if (s.kind === 'room' && !rooms[s.room]) problem(file, `station "${s.id}" leads to room "${s.room}", which does not exist / la estación "${s.id}" lleva a la sala "${s.room}", que no existe`);
    }
    for (const exit of room.exits) {
      const target = rooms[exit.to];
      if (!target) {
        problem(file, `exit "${exit.id}" leads to room "${exit.to}", which does not exist / la salida "${exit.id}" lleva a la sala "${exit.to}", que no existe`);
        continue;
      }
      if (exit.toExit && !target.exits.some((e) => e.id === exit.toExit)) {
        problem(file, `exit "${exit.id}" arrives at exit "${exit.toExit}", which room "${exit.to}" does not have / la sala "${exit.to}" no tiene la salida "${exit.toExit}"`);
      }
      if (exit.toStation && !target.stations.some((st) => st.id === exit.toStation)) {
        problem(file, `exit "${exit.id}" arrives at station "${exit.toStation}", which room "${exit.to}" does not have / la sala "${exit.to}" no tiene la estación "${exit.toStation}"`);
      }
      const wayBack = target.exits.some((e) => e.to === id) || target.stations.some((st) => st.room === id);
      if (!wayBack) problem(file, `room "${exit.to}" has no way back to "${id}" / la sala "${exit.to}" no tiene camino de regreso a "${id}"`);
    }
    if (problems > roomBefore) continue;
    const world = buildRoom(room, size);
    const places = [['the start point / el punto de inicio', room.spawn], ...room.exits.map((e) => [`the arrival spot of exit "${e.id}" / la llegada de la salida "${e.id}"`, e.spawn])];
    for (const [label, point] of places) {
      if (collides(world, point.x, point.y)) problem(file, `${label} is blocked / está bloqueado`);
      if (exitAt(world, point.x, point.y)) problem(file, `${label} is inside an exit / está dentro de una salida`);
    }
    const goals = [
      ...world.stations.map((s) => [`the door of "${s.id}" / la puerta de "${s.id}"`, s.door]),
      ...room.exits.map((e) => [`exit "${e.id}" / la salida "${e.id}"`, { x: e.x + e.width / 2, y: e.y + e.height / 2 }]),
    ];
    for (const [label, goal] of goals) {
      if (!canWalk(world, room.spawn, goal)) problem(file, `${label} cannot be reached on foot / no se puede alcanzar caminando`);
    }
    for (const gem of room.collectibles ?? []) {
      if (gemIds.has(gem.id)) problem(file, `gem id "${gem.id}" is used twice / el id de gema "${gem.id}" está repetido`);
      gemIds.add(gem.id);
      if (collides(world, gem.x, gem.y)) problem(file, `gem "${gem.id}" is inside something solid / la gema "${gem.id}" está dentro de algo sólido`);
      else if (!canWalk(world, room.spawn, gem)) problem(file, `gem "${gem.id}" cannot be reached on foot / no se puede alcanzar la gema "${gem.id}"`);
    }
    for (const piece of room.furniture ?? []) {
      if (!FURNITURE[piece.id]) problem(file, `furniture "${piece.id}" does not exist / el mueble "${piece.id}" no existe`);
    }
    if (problems === roomBefore) console.log(`  ✓ ${file}`);
  }
  if (problems === before) console.log(`  ✓ ${worldFile}`);
}

// ---- Stamps ----
const stampFile = 'world/stamps.json';
const stampData = readJson(stampFile);
if (stampData && schemaOk(compile('schema/stamps.schema.json'), stampData, stampFile)) {
  const before = problems;
  const ids = stampData.stamps.map((st) => st.id);
  ids.filter((id, i) => ids.indexOf(id) !== i).forEach((id) => problem(stampFile, `stamp id "${id}" is used twice / el id "${id}" está repetido`));
  for (const stamp of stampData.stamps) {
    const c = stamp.condition;
    if (c.type === 'lesson' && !listed.includes(c.lesson)) problem(stampFile, `stamp "${stamp.id}" needs lesson "${c.lesson}", which is not in catalog.json / la estampa "${stamp.id}" necesita la lección "${c.lesson}"`);
    if (['rooms', 'furniture', 'said', 'snowball_hits', 'gems', 'clothing', 'spotted', 'houses', 'toys', 'goals'].includes(c.type) && !c.count) problem(stampFile, `stamp "${stamp.id}" needs a "count" / la estampa "${stamp.id}" necesita "count"`);
  }
  if (problems === before) console.log(`  ✓ ${stampFile}`);
}

// ---- Phrases and emotes ----
const phrases = readJson('world/phrases.json');
if (phrases && schemaOk(compile('schema/phrases.schema.json'), phrases, 'world/phrases.json')) console.log('  ✓ world/phrases.json');

// ---- Seasonal parties (Phase 13) ----
// Each party adds decorations to some rooms: they must not block a door, an
// exit or a gem, and the gift must be a real clothing item.
const parties = readJson('world/parties.json');
if (parties) {
  const file = 'world/parties.json';
  const before = problems;
  const clothingIds = (readJson('world/items.json')?.clothing ?? []).map((c) => c.id);
  if (schemaOk(compile('schema/parties.schema.json'), parties, file)) {
    const size = { width: worldData.roomWidth, height: worldData.roomHeight };
    for (const party of parties.parties) {
      if (party.gift && !clothingIds.includes(party.gift)) problem(file, `party "${party.id}": gift "${party.gift}" is not a clothing item / el regalo "${party.gift}" no es ropa`);
      for (const [id, extra] of Object.entries(party.decorations)) {
        const room = rooms[id];
        if (!room) {
          problem(file, `party "${party.id}" decorates room "${id}", which does not exist / la sala "${id}" no existe`);
          continue;
        }
        const world = buildRoom({ ...room, decorations: [...room.decorations, ...extra] }, size);
        const goals = [...world.stations.map((s) => s.door), ...room.exits.map((e) => ({ x: e.x + e.width / 2, y: e.y + e.height / 2 })), ...(room.collectibles ?? [])];
        if (collides(world, room.spawn.x, room.spawn.y) || goals.some((g) => !canWalk(world, room.spawn, g))) {
          problem(file, `party "${party.id}" blocks a door, exit or gem in "${id}" / la fiesta "${party.id}" bloquea una puerta, salida o gema en "${id}"`);
        }
      }
    }
  }
  if (problems === before) console.log(`  ✓ ${file}`);
}

// ---- Residents (Phase 13) ----
const residents = readJson('world/residents.json');
if (residents) {
  const file = 'world/residents.json';
  const before = problems;
  if (schemaOk(compile('schema/residents.schema.json'), residents, file)) {
    const ids = residents.residents.map((r) => r.id);
    for (const room of Object.values(rooms)) {
      for (const r of room.residents ?? []) {
        if (!ids.includes(r.id)) problem(`world/rooms/${room.id}.json`, `resident "${r.id}" is not in ${file} / el residente "${r.id}" no está en ${file}`);
      }
    }
  }
  if (problems === before) console.log(`  ✓ ${file}`);
}

// ---- Shop items ----
const items = readJson('world/items.json');
if (items) {
  const file = 'world/items.json';
  const before = problems;
  if (schemaOk(compile('schema/items.schema.json'), items, file)) {
    const ids = [...items.colors, ...items.clothing].map((i) => i.id);
    ids.filter((id, i) => ids.indexOf(id) !== i).forEach((id) => problem(file, `item id "${id}" is used twice / el id "${id}" está repetido`));
    if (items.colors[0].price !== 0) problem(file, 'the first color must be free (price 0) / el primer color debe ser gratis (precio 0)');
    // Every item needs a drawing in the code.
    const missing = [
      ...items.clothing.filter((c) => !hasClothingDrawing(c.id)).map((c) => c.id),
      ...items.pets.filter((p) => !hasPetDrawing(p.id)).map((p) => p.id),
      ...items.furniture.filter((f) => !FURNITURE[f.id]).map((f) => f.id),
    ];
    missing.forEach((id) => problem(file, `"${id}" has no drawing in js/ (a programmer must add one) / "${id}" no tiene dibujo en js/ (lo debe agregar un programador)`));
  }
  if (problems === before) console.log(`  ✓ ${file}`);
}

if (problems) {
  console.log(`\n${problems} problem(s) found / problema(s) encontrado(s).`);
  process.exit(1);
}
console.log('\nEverything is OK / Todo está bien.');
