// Every block ILO knows. A lesson's "toolbox" picks which ones the kid sees.
// To add a block: add it to BLOCK_TYPES, define it in defineBlocks(), teach
// runner.js how to read it, teach simulation.js what it does, and add it to
// schema/lesson.schema.json.
import { PLANETS, RUB_SURFACES, SURFACES } from './simulation.js';

export const BLOCK_TYPES = [
  'set_gravity', 'set_mass', 'drop', 'set_surface', 'push', 'move_fulcrum',
  'magnet_pick', 'magnet_pole', 'set_rub_surface', 'rub',
];
export const START_BLOCK = 'when_run';

// Block colors from the design delivery (assets/tokens.json, blockly), all
// checked for white text contrast.
const ACTION_COLOR = '#28617e';
const START_COLOR = '#76512f';

// Blockly is passed in (instead of imported) because it is loaded as a
// plain <script> from vendor/.
export function defineBlocks(Blockly, t, pick, lesson) {
  const movable = lesson.world.objects.filter((o) => !o.fixed);
  const objectOptions = () => movable.map((o) => [o.label ? pick(o.label) : o.id, o.id]);
  const planetOptions = () => Object.keys(PLANETS).map((p) => [t(`planets.${p}`), p]);
  const surfaceOptions = () => Object.keys(SURFACES).map((k) => [t(`surfaces.${k}`), k]);
  const fulcrumOptions = () => (lesson.world.lever?.fulcrumOptions ?? [0]).map((n) => [`${n} m`, String(n)]);
  const allObjectOptions = () => lesson.world.objects.map((o) => [o.label ? pick(o.label) : o.id, o.id]);
  const poleOptions = () => ['N', 'S'].map((p) => [t(`poles.${p}`), p]);
  const rub = lesson.world.rub;
  const rubSurfaceOptions = () => (rub?.surfaces ?? Object.keys(RUB_SURFACES)).map((k) => [t(`rubSurfaces.${k}`), k]);
  const timesOptions = () => (rub?.timesOptions ?? [10]).map((n) => [String(n), String(n)]);

  // Builds a block row from a translated sentence like "drop %1", putting
  // each field where its %1, %2 ... appears, so word order can differ per language.
  function sentence(block, text, fields) {
    const input = block.appendDummyInput();
    for (const part of text.split(/(%\d)/)) {
      const match = part.match(/^%(\d)$/);
      if (match) {
        const [name, field] = fields[Number(match[1]) - 1];
        input.appendField(field, name);
      } else if (part.trim()) {
        input.appendField(part.trim());
      }
    }
  }

  Blockly.Blocks[START_BLOCK] = {
    init() {
      this.appendDummyInput().appendField(t('blocks.whenRun'));
      this.setNextStatement(true);
      this.setColour(START_COLOR);
      this.setTooltip(t('blocks.whenRunTooltip'));
      this.setDeletable(false);
    },
  };

  Blockly.Blocks.set_gravity = {
    init() {
      sentence(this, t('blocks.setGravity'), [['PLANET', new Blockly.FieldDropdown(planetOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.setGravityTooltip'));
    },
  };

  Blockly.Blocks.set_mass = {
    init() {
      sentence(this, t('blocks.setMass'), [
        ['OBJECT', new Blockly.FieldDropdown(objectOptions)],
        ['MASS', new Blockly.FieldNumber(1, 0.1, 1000, 0.1)],
      ]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.setMassTooltip'));
    },
  };

  Blockly.Blocks.drop = {
    init() {
      sentence(this, t('blocks.drop'), [['OBJECT', new Blockly.FieldDropdown(objectOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.dropTooltip'));
    },
  };

  Blockly.Blocks.set_surface = {
    init() {
      sentence(this, t('blocks.setSurface'), [['SURFACE', new Blockly.FieldDropdown(surfaceOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.setSurfaceTooltip'));
    },
  };

  Blockly.Blocks.push = {
    init() {
      sentence(this, t('blocks.push'), [['OBJECT', new Blockly.FieldDropdown(objectOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.pushTooltip'));
    },
  };

  // Magnet lessons: the crane picks an object; the magnet's lower pole.
  Blockly.Blocks.magnet_pick = {
    init() {
      sentence(this, t('blocks.magnetPick'), [['OBJECT', new Blockly.FieldDropdown(allObjectOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.magnetPickTooltip'));
    },
  };

  Blockly.Blocks.magnet_pole = {
    init() {
      sentence(this, t('blocks.magnetPole'), [['POLE', new Blockly.FieldDropdown(poleOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.magnetPoleTooltip'));
    },
  };

  // Friction-and-heat lesson.
  Blockly.Blocks.set_rub_surface = {
    init() {
      sentence(this, t('blocks.setRubSurface'), [['SURFACE', new Blockly.FieldDropdown(rubSurfaceOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.setRubSurfaceTooltip'));
    },
  };

  Blockly.Blocks.rub = {
    init() {
      sentence(this, t('blocks.rub'), [['TIMES', new Blockly.FieldDropdown(timesOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.rubTooltip'));
    },
  };

  Blockly.Blocks.move_fulcrum = {
    init() {
      sentence(this, t('blocks.moveFulcrum'), [['POSITION', new Blockly.FieldDropdown(fulcrumOptions)]]);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(ACTION_COLOR);
      this.setTooltip(t('blocks.moveFulcrumTooltip'));
    },
  };
}
