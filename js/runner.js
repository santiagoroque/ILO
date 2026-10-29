// Converts between the kid's blocks and a simple list of steps such as
// [{ "block": "set_gravity", "planet": "mars" }, { "block": "drop", "object": "package" }].
// Lesson files use the same step format for "startingBlocks".
// Blocks are read one by one; no JavaScript is generated or eval'd (docs/PLAN.md, D2).
import { START_BLOCK } from './blocks.js';

// Reads the blocks connected under "when Run is pressed", top to bottom.
// Loose blocks that are not connected are ignored, like in Scratch.
export function workspaceToSteps(workspace) {
  const start = workspace.getTopBlocks(true).find((b) => b.type === START_BLOCK);
  const steps = [];
  for (let block = start?.getNextBlock(); block; block = block.getNextBlock()) {
    if (!block.isEnabled()) continue;
    if (block.type === 'set_gravity') {
      steps.push({ block: 'set_gravity', planet: block.getFieldValue('PLANET') });
    } else if (block.type === 'set_mass') {
      steps.push({ block: 'set_mass', object: block.getFieldValue('OBJECT'), mass: Number(block.getFieldValue('MASS')) });
    } else if (block.type === 'drop') {
      steps.push({ block: 'drop', object: block.getFieldValue('OBJECT') });
    } else if (block.type === 'set_surface') {
      steps.push({ block: 'set_surface', surface: block.getFieldValue('SURFACE') });
    } else if (block.type === 'push') {
      steps.push({ block: 'push', object: block.getFieldValue('OBJECT') });
    } else if (block.type === 'move_fulcrum') {
      steps.push({ block: 'move_fulcrum', position: Number(block.getFieldValue('POSITION')) });
    } else if (block.type === 'magnet_pick') {
      steps.push({ block: 'magnet_pick', object: block.getFieldValue('OBJECT') });
    } else if (block.type === 'magnet_pole') {
      steps.push({ block: 'magnet_pole', pole: block.getFieldValue('POLE') });
    } else if (block.type === 'set_rub_surface') {
      steps.push({ block: 'set_rub_surface', surface: block.getFieldValue('SURFACE') });
    } else if (block.type === 'rub') {
      steps.push({ block: 'rub', times: Number(block.getFieldValue('TIMES')) });
    }
  }
  return steps;
}

// Builds Blockly's save format from a lesson's "startingBlocks".
export function stepsToWorkspaceState(steps, defaultObject) {
  let next;
  for (const step of [...steps].reverse()) {
    const fields = {};
    if (step.block === 'set_gravity') fields.PLANET = step.planet ?? 'earth';
    if (step.block === 'set_mass') fields.MASS = step.mass ?? 1;
    if (['set_mass', 'drop', 'push', 'magnet_pick'].includes(step.block)) fields.OBJECT = step.object ?? defaultObject;
    if (step.block === 'set_surface' || step.block === 'set_rub_surface') fields.SURFACE = step.surface ?? 'wood';
    if (step.block === 'move_fulcrum') fields.POSITION = String(step.position);
    if (step.block === 'magnet_pole') fields.POLE = step.pole ?? 'N';
    if (step.block === 'rub') fields.TIMES = String(step.times ?? 10);
    next = { block: { type: step.block, fields, ...(next ? { next } : {}) } };
  }
  const start = { type: START_BLOCK, x: 24, y: 24, ...(next ? { next } : {}) };
  return { blocks: { languageVersion: 0, blocks: [start] } };
}
