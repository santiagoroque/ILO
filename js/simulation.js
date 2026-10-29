// The physics of a lesson. It has no drawing code, so the same simulation
// runs in the browser and in the Node tests. The model is chosen by the
// lesson's world.model (docs/PLAN.md, D13):
//   matter  falling and landing, using Matter.js (the gravity lesson)
//   slide   an object braking on a surface with a = -μg (the friction lesson)
//   lever   a plank turning about a fulcrum from torques (the lever lesson)
//   magnet  a magnet crane that lifts what a magnet attracts (magnet lessons)
//   rub     a block rubbed on a surface warms up (the friction-and-heat lesson)
// Matter.js friction does not follow the textbook law, so friction and
// levers use small exact models instead.
//
// Lesson files use meters, with y measured UP from the ground. Matter.js works
// in pixels with y measured DOWN, so the matter model converts between the two.

// Surface gravity in m/s² (common textbook values).
export const PLANETS = {
  moon: 1.62,
  mars: 3.71,
  earth: 9.81,
  jupiter: 24.79,
};

// Approximate friction coefficients of a sled on each surface.
export const SURFACES = {
  ice: 0.03,
  snow: 0.12,
  wood: 0.3,
  sand: 0.6,
};

// Materials for the magnet lessons: does a magnet pull on them? "magnet" is
// itself a magnet, with a pole facing up (game model, docs/PLAN.md Phase 11).
export const MATERIALS = {
  iron: 'magnetic',
  steel: 'magnetic',
  aluminum: 'none',
  copper: 'none',
  brass: 'none',
  wood: 'none',
  plastic: 'none',
  glass: 'none',
  magnet: 'magnet',
};

// How rough each rubbing surface is (game values, not measurements).
export const RUB_SURFACES = {
  glass: 0.15,
  wood: 0.35,
  carpet: 0.55,
  sandpaper: 0.85,
};
export const HEAT_PER_RUB = 2; // °C for one rub on a surface of roughness 1.

export const STEP_MS = 1000 / 60; // Fixed time step: same result on every computer.
const PX = 50; // Pixels per meter inside Matter.js. Only affects precision, not results.
const SETTLE_SECONDS = 0.8; // Keep simulating briefly after landing, so the kid sees it.

export function createSimulation(Matter, lesson) {
  const model = lesson.world.model ?? 'matter';
  if (model === 'slide') return createSlide(lesson);
  if (model === 'lever') return createLever(lesson);
  if (model === 'magnet') return createMagnet(lesson);
  if (model === 'rub') return createRub(lesson);
  return createMatter(Matter, lesson);
}

// Shared by every model: apply set_gravity steps.
function gravityFrom(steps, start) {
  let g = start;
  for (const step of steps) {
    if (step.block === 'set_gravity' && step.planet in PLANETS) g = PLANETS[step.planet];
  }
  return g;
}

function createMatter(Matter, lesson) {
  const { Bodies, Body, Composite, Engine, Events } = Matter;
  const world = lesson.world;
  const toPx = (meters) => meters * PX;
  const toPxY = (metersUp) => (world.height - metersUp) * PX;

  let engine, bodies, carried, state;

  function reset() {
    engine = Engine.create();
    setGravity(world.gravity);

    // The ground: its top edge is y = 0, and it is wider than the screen so
    // objects that fly past the edge still land somewhere.
    const ground = Bodies.rectangle(toPx(world.width / 2), toPxY(-0.5), toPx(world.width * 3), toPx(1), {
      isStatic: true,
      friction: 1,
      label: 'ground',
    });
    Composite.add(engine.world, ground);

    bodies = {};
    carried = {};
    for (const obj of world.objects) {
      const options = {
        isStatic: Boolean(obj.fixed),
        friction: 0.9,
        frictionAir: 0, // No air resistance, so only gravity matters.
        restitution: 0, // No bouncing, so the landing spot is clear.
        inertia: Infinity, // No spinning.
        label: obj.id,
      };
      const body = obj.shape === 'circle'
        ? Bodies.circle(toPx(obj.x), toPxY(obj.y), toPx(obj.radius ?? 0.3), options)
        : Bodies.rectangle(toPx(obj.x), toPxY(obj.y), toPx(obj.width ?? 0.6), toPx(obj.height ?? 0.6), options);
      if (obj.mass) Body.setMass(body, obj.mass);
      bodies[obj.id] = body;
      // Objects carried by the drone join the physics only when dropped.
      if (obj.carriedByDrone) carried[obj.id] = obj;
      else Composite.add(engine.world, body);
    }

    Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        for (const [a, b] of [[pair.bodyA, pair.bodyB], [pair.bodyB, pair.bodyA]]) {
          if (b.isStatic && a.label in bodies && !(a.label in state.landed)) {
            state.landed[a.label] = { x: a.position.x / PX, time: state.time };
          }
        }
      }
    });

    const drone = Object.values(carried)[0];
    state = {
      time: 0,
      running: false,
      finished: false,
      gravity: world.gravity,
      drone: drone ? { x0: drone.x, y: drone.y, speed: drone.velocityX ?? 0 } : null,
      dropped: {},
      landed: {},
    };
  }

  function setGravity(metersPerSecond2) {
    // Matter.js adds  gravity.y * gravity.scale  pixels/ms² every step.
    engine.gravity.x = 0;
    engine.gravity.y = 1;
    engine.gravity.scale = (metersPerSecond2 * PX) / 1e6;
  }

  function droneX() {
    return state.drone ? state.drone.x0 + state.drone.speed * state.time : 0;
  }

  function drop(id) {
    const obj = carried[id];
    if (!obj || state.dropped[id]) return;
    const body = bodies[id];
    Body.setPosition(body, { x: toPx(droneX()), y: toPxY(obj.y) });
    Composite.add(engine.world, body);
    // Matter.js velocity is pixels per 1/60 s. It keeps the drone's speed.
    Body.setVelocity(body, { x: (toPx(obj.velocityX ?? 0) * STEP_MS) / 1000, y: 0 });
    state.dropped[id] = true;
  }

  // Runs the kid's program. Every step happens at time 0, in order.
  function start(steps) {
    reset();
    state.running = true;
    for (const step of steps) {
      if (step.block === 'set_gravity' && step.planet in PLANETS) {
        state.gravity = PLANETS[step.planet];
        setGravity(state.gravity);
      } else if (step.block === 'set_mass' && bodies[step.object] && step.mass > 0) {
        Body.setMass(bodies[step.object], step.mass);
      } else if (step.block === 'drop') {
        drop(step.object);
      }
    }
  }

  function isDone() {
    if (state.time >= lesson.winCondition.timeLimit) return true;
    return Object.keys(carried).every((id) => {
      if (state.dropped[id]) {
        const landing = state.landed[id];
        return landing && state.time - landing.time >= SETTLE_SECONDS;
      }
      return droneX() > world.width + 1; // Never dropped and the drone has left.
    });
  }

  function step() {
    if (!state.running || state.finished) return;
    Engine.update(engine, STEP_MS);
    state.time += STEP_MS / 1000;
    if (isDone()) {
      state.running = false;
      state.finished = true;
    }
  }

  // Everything the drawing code needs, in meters.
  function snapshot() {
    return {
      model: 'matter',
      time: state.time,
      running: state.running,
      finished: state.finished,
      gravity: state.gravity,
      drone: state.drone ? { x: droneX(), y: state.drone.y } : null,
      objects: world.objects.map((obj) => {
        const held = obj.carriedByDrone && !state.dropped[obj.id];
        const body = bodies[obj.id];
        return {
          ...obj,
          held,
          x: held ? droneX() : body.position.x / PX,
          y: held ? obj.y : world.height - body.position.y / PX,
        };
      }),
      landed: { ...state.landed },
    };
  }

  // What the win checker needs.
  function result() {
    const positions = Object.fromEntries(snapshot().objects.map((o) => [o.id, o.x]));
    return { dropped: { ...state.dropped }, landed: { ...state.landed }, positions };
  }

  reset();
  return { reset, start, step, snapshot, result, isFinished: () => state.finished };
}

// ---- Slide model: a pushed object braking on a surface ----
function createSlide(lesson) {
  const world = lesson.world;
  let state;

  function reset() {
    state = {
      time: 0,
      running: false,
      finished: false,
      gravity: world.gravity,
      surface: world.surface ?? 'wood',
      objects: world.objects.map((o) => ({ ...o, v: 0 })),
      pushed: {},
      stopped: {},
      quietSince: null,
    };
  }

  function start(steps) {
    reset();
    state.running = true;
    state.gravity = gravityFrom(steps, world.gravity);
    for (const step of steps) {
      if (step.block === 'set_surface' && step.surface in SURFACES) state.surface = step.surface;
      if (step.block === 'set_mass') {
        const o = state.objects.find((x) => x.id === step.object);
        if (o && step.mass > 0) o.mass = step.mass; // Mass is stored but does not change a = -μg.
      }
      if (step.block === 'push') {
        const o = state.objects.find((x) => x.id === step.object);
        if (o && !o.fixed) {
          o.v = o.velocityX ?? 0;
          state.pushed[o.id] = true;
        }
      }
    }
  }

  function step() {
    if (!state.running || state.finished) return;
    const dt = STEP_MS / 1000;
    const decel = SURFACES[state.surface] * state.gravity;
    for (const o of state.objects) {
      if (!o.v) continue;
      const v = Math.max(0, o.v - decel * dt);
      o.x += ((o.v + v) / 2) * dt; // Average speed over the step: exact for constant braking.
      o.v = v;
      if (v === 0) state.stopped[o.id] = { x: o.x, time: state.time };
    }
    state.time += dt;
    const moving = state.objects.some((o) => o.v > 0 && o.x < world.width + 1);
    const nothingPushed = Object.keys(state.pushed).length === 0;
    if (!moving) state.quietSince ??= state.time;
    const settled = !moving && state.time - state.quietSince >= (nothingPushed ? 1.2 : SETTLE_SECONDS);
    if (settled || state.time >= lesson.winCondition.timeLimit) {
      state.running = false;
      state.finished = true;
    }
  }

  function snapshot() {
    return {
      model: 'slide',
      time: state.time,
      running: state.running,
      finished: state.finished,
      gravity: state.gravity,
      surface: state.surface,
      drone: null,
      objects: state.objects.map((o) => ({ ...o })),
      landed: { ...state.stopped },
    };
  }

  function result() {
    const positions = Object.fromEntries(state.objects.map((o) => [o.id, o.x]));
    return { pushed: { ...state.pushed }, stopped: { ...state.stopped }, positions };
  }

  reset();
  return { reset, start, step, snapshot, result, isFinished: () => state.finished };
}

// ---- Lever model: a plank turning about a fulcrum ----
// Angles: theta > 0 means the LEFT end goes down. The plank's height at a
// distance along the ground is  y(x) = h + (x - f) * sin(theta).
function createLever(lesson) {
  const world = lesson.world;
  const lever = world.lever;
  const objects = Object.fromEntries(world.objects.map((o) => [o.id, o]));
  const load = objects[lever.load];
  const effort = objects[lever.effort];
  const plankCenter = (lever.from + lever.to) / 2;
  const plankLength = lever.to - lever.from;
  let state;

  const limits = (f) => ({
    max: Math.asin(Math.min(1, lever.height / (f - lever.from))), // Left end on the ground.
    min: -Math.asin(Math.min(1, lever.height / (lever.to - f))), // Right end on the ground.
  });
  const plankY = (x) => lever.height + (x - state.f) * Math.sin(state.theta);

  // Each mass on the plank: [mass, x position along the ground when level].
  function masses() {
    const list = [[lever.mass, plankCenter], [load.mass, load.x]];
    if (state.bag.attached) list.push([state.bag.mass, effort.x]);
    return list;
  }

  function torque() {
    const g = state.gravity;
    return masses().reduce((sum, [m, x]) => sum + g * m * (state.f - x) * Math.cos(state.theta), 0);
  }

  function inertia() {
    const plankOwn = (lever.mass * plankLength * plankLength) / 12;
    return plankOwn + masses().reduce((sum, [m, x]) => sum + m * (state.f - x) ** 2, 0);
  }

  // The resting angle before the sandbag lands: whichever side is heavier.
  function settle() {
    const { min, max } = limits(state.f);
    state.theta = 0;
    const t = torque();
    state.theta = t > 0 ? max : t < 0 ? min : 0;
    state.omega = 0;
  }

  function reset() {
    state = {
      time: 0,
      running: false,
      finished: false,
      gravity: world.gravity,
      f: lever.fulcrum,
      theta: 0,
      omega: 0,
      dropped: {},
      bag: { y: effort.y, vy: 0, attached: false, mass: effort.mass ?? 10 },
      quietSince: null,
    };
    settle();
  }

  function start(steps) {
    reset();
    state.running = true;
    state.gravity = gravityFrom(steps, world.gravity);
    for (const step of steps) {
      if (step.block === 'move_fulcrum' && lever.fulcrumOptions.includes(step.position)) state.f = step.position;
      if (step.block === 'set_mass' && step.object === lever.effort && step.mass > 0) state.bag.mass = step.mass;
      if (step.block === 'drop' && step.object === lever.effort) state.dropped[lever.effort] = true;
    }
    settle();
  }

  function step() {
    if (!state.running || state.finished) return;
    const dt = STEP_MS / 1000;
    const bag = state.bag;
    if (state.dropped[lever.effort] && !bag.attached) {
      bag.vy -= state.gravity * dt;
      bag.y += bag.vy * dt;
      const surface = plankY(effort.x) + 0.05;
      if (bag.y <= surface) {
        // The falling bag hits the plank: its momentum gives the plank a spin.
        bag.attached = true;
        bag.y = surface;
        const arm = state.f - effort.x;
        state.omega += (bag.mass * -bag.vy * arm * Math.cos(state.theta)) / inertia();
      }
    }
    const { min, max } = limits(state.f);
    state.omega += (torque() / inertia()) * dt;
    state.theta += state.omega * dt;
    if (state.theta >= max) {
      state.theta = max;
      state.omega = Math.min(0, state.omega);
    } else if (state.theta <= min) {
      state.theta = min;
      state.omega = Math.max(0, state.omega);
    }
    state.time += dt;
    const quiet = (bag.attached || !state.dropped[lever.effort]) && Math.abs(state.omega) < 1e-3;
    if (quiet) state.quietSince ??= state.time;
    else state.quietSince = null;
    const settled = quiet && state.time - state.quietSince >= SETTLE_SECONDS;
    if (settled || state.time >= lesson.winCondition.timeLimit) {
      state.running = false;
      state.finished = true;
    }
  }

  function snapshot() {
    const { theta, f } = state;
    const onPlank = (o, extraLift = 0) => ({
      ...o,
      x: f + (o.x - f) * Math.cos(theta),
      y: plankY(o.x) + 0.05 + (o.height ?? 0.6) / 2 + extraLift,
      angle: theta,
    });
    const bag = state.bag.attached
      ? onPlank(effort)
      : { ...effort, x: effort.x, y: state.bag.y + (effort.height ?? 0.5) / 2, angle: 0, hanging: !state.dropped[lever.effort] };
    return {
      model: 'lever',
      time: state.time,
      running: state.running,
      finished: state.finished,
      gravity: state.gravity,
      drone: null,
      lever: { ...lever, fulcrum: f, theta },
      objects: [onPlank(load), { ...bag, mass: state.bag.mass }],
      landed: {},
    };
  }

  function result() {
    const { max } = limits(state.f);
    return {
      dropped: { ...state.dropped },
      tipped: state.theta >= max - 1e-9,
      lift: plankY(load.x) - lever.height,
      fulcrum: state.f,
    };
  }

  reset();
  return { reset, start, step, snapshot, result, isFinished: () => state.finished };
}

// ---- Magnet model: a crane with a magnet picks objects up ----
// The crane hangs at CRANE_TOP. For each "pick" step it moves over the
// object, lowers its magnet to HOVER above it (the magnet acts at a
// distance, without touching), and then: a magnetic object jumps up and is
// carried to the bin; a magnet with the same pole facing up is pushed away;
// anything else stays put and the trip is wasted. world.crane.trips limits
// how many picks run.
const CRANE_TOP = 4;
const HOVER = 0.6; // Meters between the magnet and the object's top.
const CRANE_SPEED = 4; // Meters per second, sideways and up/down.
const REACT_SECONDS = 0.6;

export function magnetReaction(object, cranePole) {
  const kind = MATERIALS[object.material];
  if (kind === 'magnetic') return 'attract';
  if (kind === 'magnet') return object.pole === cranePole ? 'repel' : 'attract'; // Like poles push apart.
  return 'none';
}

function createMagnet(lesson) {
  const world = lesson.world;
  const crane = world.crane;
  let state;

  function reset() {
    state = {
      time: 0,
      running: false,
      finished: false,
      pole: crane.pole ?? 'S',
      crane: { x: crane.x ?? 1, y: CRANE_TOP },
      objects: world.objects.map((o) => ({ ...o, lift: 0, shift: 0, inBin: false })),
      queue: [],
      phase: null,
      holding: null,
      picked: [],
      collected: [],
      repelled: [],
      quietSince: null,
    };
  }

  function start(steps) {
    reset();
    state.running = true;
    for (const step of steps) {
      if (step.block === 'magnet_pole' && (step.pole === 'N' || step.pole === 'S')) state.pole = step.pole;
      if (step.block === 'magnet_pick' && state.objects.some((o) => o.id === step.object)) state.queue.push(step.object);
    }
    state.queue = state.queue.slice(0, crane.trips);
    nextPick();
  }

  const objectById = (id) => state.objects.find((o) => o.id === id);
  const hoverY = (o) => (o.height ?? 0.4) + HOVER;

  function nextPick() {
    const id = state.queue.shift();
    if (!id) {
      state.phase = { name: 'home', target: { x: crane.x ?? 1, y: CRANE_TOP } };
      return;
    }
    const o = objectById(id);
    state.picked.push(id);
    state.phase = { name: 'over', id, target: { x: o.x + o.shift, y: CRANE_TOP } };
  }

  // Moves the crane toward a point; true when it arrives.
  function moveTo(target, dt) {
    const c = state.crane;
    const dx = target.x - c.x;
    const dy = target.y - c.y;
    const distance = Math.hypot(dx, dy);
    const stepLength = CRANE_SPEED * dt;
    if (distance <= stepLength) {
      c.x = target.x;
      c.y = target.y;
      return true;
    }
    c.x += (dx / distance) * stepLength;
    c.y += (dy / distance) * stepLength;
    return false;
  }

  function step() {
    if (!state.running || state.finished) return;
    const dt = STEP_MS / 1000;
    const phase = state.phase;
    const o = phase?.id ? objectById(phase.id) : null;
    if (phase?.name === 'over' && moveTo(phase.target, dt)) {
      state.phase = { name: 'lower', id: phase.id, target: { x: phase.target.x, y: hoverY(o) } };
    } else if (phase?.name === 'lower' && moveTo(phase.target, dt)) {
      state.phase = { name: 'react', id: phase.id, reaction: magnetReaction(o, state.pole), t: 0 };
    } else if (phase?.name === 'react') {
      phase.t += dt;
      const k = Math.min(1, phase.t / REACT_SECONDS);
      if (phase.reaction === 'attract') o.lift = k * HOVER; // Jumps up to the magnet across the gap.
      if (phase.reaction === 'repel') o.shift = k * 0.5; // Slides away from the magnet.
      if (k >= 1) {
        if (phase.reaction === 'attract') state.holding = o.id;
        if (phase.reaction === 'repel') state.repelled.push(o.id);
        state.phase = { name: 'raise', id: phase.id, target: { x: state.crane.x, y: CRANE_TOP } };
      }
    } else if (phase?.name === 'raise' && moveTo(phase.target, dt)) {
      state.phase = state.holding ? { name: 'carry', id: phase.id, target: { x: world.bin.x, y: CRANE_TOP } } : null;
      if (!state.phase) nextPick();
    } else if (phase?.name === 'carry' && moveTo(phase.target, dt)) {
      o.inBin = true;
      state.collected.push(o.id);
      state.holding = null;
      nextPick();
    } else if (phase?.name === 'home' && moveTo(phase.target, dt)) {
      state.phase = { name: 'done' };
    }
    // A held object hangs from the magnet.
    if (state.holding) {
      const held = objectById(state.holding);
      held.carried = { x: state.crane.x, y: state.crane.y - (held.height ?? 0.4) - 0.1 };
    }
    state.time += dt;
    if (state.phase?.name === 'done') state.quietSince ??= state.time;
    const settled = state.phase?.name === 'done' && state.time - state.quietSince >= SETTLE_SECONDS;
    if (settled || state.time >= lesson.winCondition.timeLimit) {
      state.running = false;
      state.finished = true;
    }
  }

  function snapshot() {
    return {
      model: 'magnet',
      time: state.time,
      running: state.running,
      finished: state.finished,
      gravity: world.gravity,
      drone: null,
      crane: { ...state.crane, pole: state.pole, trips: crane.trips, used: state.picked.length },
      bin: world.bin,
      objects: state.objects.map((o) => ({ ...o })),
      landed: {},
    };
  }

  function result() {
    return {
      picked: [...state.picked],
      collected: [...state.collected],
      repelled: [...state.repelled],
      pole: state.pole,
    };
  }

  reset();
  return { reset, start, step, snapshot, result, isFinished: () => state.finished };
}

// ---- Rub model: rubbing a block on a surface warms it ----
// Each rub warms the block by HEAT_PER_RUB × roughness °C: rougher surfaces
// and more rubbing make more heat (friction turns motion into heat). The
// heat is shown rising during the rubbing. Simplified: no cooling, no units
// of energy, every rub the same length.
const RUB_SECONDS = 0.25; // Time for one rub, back and forth.

function createRub(lesson) {
  const world = lesson.world;
  const rub = world.rub;
  let state;

  function reset() {
    state = {
      time: 0,
      running: false,
      finished: false,
      surface: rub.surface,
      times: 0,
      done: 0,
      temperature: rub.startTemperature,
      rubbed: false,
      quietSince: null,
    };
  }

  function start(steps) {
    reset();
    state.running = true;
    for (const step of steps) {
      if (step.block === 'set_rub_surface' && (rub.surfaces ?? Object.keys(RUB_SURFACES)).includes(step.surface)) state.surface = step.surface;
      if (step.block === 'rub' && rub.timesOptions.includes(step.times)) {
        state.times += step.times;
        state.rubbed = true;
      }
    }
  }

  function step() {
    if (!state.running || state.finished) return;
    const dt = STEP_MS / 1000;
    state.time += dt;
    const target = Math.min(state.times, state.time / RUB_SECONDS);
    if (target > state.done) {
      state.temperature += (target - state.done) * HEAT_PER_RUB * RUB_SURFACES[state.surface];
      state.done = target;
    }
    if (state.done >= state.times) state.quietSince ??= state.time;
    const settled = state.quietSince !== null && state.time - state.quietSince >= SETTLE_SECONDS;
    if (settled || state.time >= lesson.winCondition.timeLimit) {
      state.running = false;
      state.finished = true;
    }
  }

  function snapshot() {
    return {
      model: 'rub',
      time: state.time,
      running: state.running,
      finished: state.finished,
      gravity: world.gravity,
      drone: null,
      rub: { ...rub, surface: state.surface, done: state.done, times: state.times, temperature: state.temperature },
      objects: [],
      landed: {},
    };
  }

  function result() {
    return { rubbed: state.rubbed, temperature: Math.round(state.temperature * 10) / 10, surface: state.surface, times: state.times };
  }

  reset();
  return { reset, start, step, snapshot, result, isFinished: () => state.finished };
}

// Runs a whole program instantly (used by the tests).
export function runToEnd(Matter, lesson, steps) {
  const sim = createSimulation(Matter, lesson);
  sim.start(steps);
  const maxSteps = Math.ceil((lesson.winCondition.timeLimit * 1000) / STEP_MS) + 1;
  for (let i = 0; i < maxSteps && !sim.isFinished(); i++) sim.step();
  return sim.result();
}
