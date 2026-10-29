// Win conditions. A lesson names one by its "type". To add a new type, add a
// function here, list its feedback messages in FEEDBACK_KEYS, and add it to
// schema/lesson.schema.json.
// Each function returns { won, feedback, x } where feedback is a key of the
// lesson's winCondition.feedback (or null when the kid won).

// The feedback messages each type needs in the lesson file.
export const FEEDBACK_KEYS = {
  lands_in_zone: ['tooShort', 'tooFar', 'notDropped'],
  stops_in_zone: ['tooShort', 'tooFar', 'notPushed'],
  lever_tips: ['tooHeavy', 'notDropped'],
  collects_magnetic: ['notPicked', 'repelled', 'wrongPick', 'missed'],
  temperature_in_band: ['tooCold', 'tooHot', 'notRubbed'],
};

function inZone(lesson, zoneId, x) {
  const zone = lesson.world.zones.find((z) => z.id === zoneId);
  return { inside: x >= zone.x && x <= zone.x + zone.width, before: x < zone.x };
}

export const WIN_CONDITIONS = {
  // The object must touch the ground inside the zone.
  lands_in_zone(condition, lesson, result) {
    if (!result.dropped[condition.object]) return { won: false, feedback: 'notDropped', x: null };
    const landing = result.landed[condition.object];
    const x = landing ? landing.x : result.positions[condition.object];
    const { inside, before } = inZone(lesson, condition.zone, x);
    if (landing && inside) return { won: true, feedback: null, x };
    return { won: false, feedback: before ? 'tooShort' : 'tooFar', x };
  },

  // The pushed object must come to a stop inside the zone.
  stops_in_zone(condition, lesson, result) {
    if (!result.pushed[condition.object]) return { won: false, feedback: 'notPushed', x: null };
    const stop = result.stopped[condition.object];
    const x = stop ? stop.x : result.positions[condition.object];
    const { inside, before } = inZone(lesson, condition.zone, x);
    if (stop && inside) return { won: true, feedback: null, x };
    return { won: false, feedback: before ? 'tooShort' : 'tooFar', x };
  },

  // The dropped weight must tip the lever and lift the load.
  lever_tips(condition, lesson, result) {
    if (!result.dropped[condition.effort]) return { won: false, feedback: 'notDropped', x: null };
    if (result.tipped) return { won: true, feedback: null, x: null };
    return { won: false, feedback: 'tooHeavy', x: null };
  },

  // The crane must put exactly the target objects in the bin, without
  // wasting a trip on something the magnet does not pull.
  collects_magnetic(condition, lesson, result) {
    if (!result.picked.length) return { won: false, feedback: 'notPicked', x: null };
    if (result.repelled.length) return { won: false, feedback: 'repelled', x: null };
    if (result.picked.some((id) => !result.collected.includes(id))) return { won: false, feedback: 'wrongPick', x: null };
    const all = condition.targets.every((id) => result.collected.includes(id));
    if (!all) return { won: false, feedback: 'missed', x: null };
    return { won: true, feedback: null, x: null };
  },

  // The rubbed block must end inside the temperature band (°C).
  temperature_in_band(condition, lesson, result) {
    if (!result.rubbed) return { won: false, feedback: 'notRubbed', x: null };
    const x = result.temperature;
    if (x < condition.min) return { won: false, feedback: 'tooCold', x };
    if (x > condition.max) return { won: false, feedback: 'tooHot', x };
    return { won: true, feedback: null, x };
  },
};

export function checkWin(lesson, result) {
  const condition = lesson.winCondition;
  return WIN_CONDITIONS[condition.type](condition, lesson, result);
}
