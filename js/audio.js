// Sound effects and music. The recorded sound effects from the design
// delivery (assets/audio, CC0) play when they have loaded; until then, or if
// a file is missing, the same sound is made in the browser with the Web
// Audio API (PLAN.md, D16). The area music is composed for ILO and played
// live in the browser: calm and warm, in the style of peaceful game music
// (requested 2026-10-28), with original melodies. Browsers only allow sound
// after the kid clicks or presses a key, so nothing plays until unlock().

let ctx = null;
let master;
let sfx;
let music;
let enabled = true;
let theme = null;
let timer = null;
let stepIndex = 0;
let nextTime = 0;
let recorded; // Output for recorded sounds (already mixed by the designers).
const buffers = {};

const AUDIO_ROOT = new URL('../assets/audio/', import.meta.url);
const EFFECTS = ['step', 'coin', 'door', 'pop', 'stamp', 'throw', 'splat', 'hit', 'click'];
// Effects that play quieter than the recording (1 = as recorded).
const VOLUME = { step: 0.35 };

// One 8-bar loop per area, composed for ILO. Each bar is 8 eighth notes.
//   chords   one chord per bar (MIDI notes, 60 = middle C), played as a soft
//            pad and as a music-box arpeggio
//   arp      which chord note the arpeggio plays on each eighth note
//   melody   the flute-like tune, one MIDI note per eighth note (null = rest)
//   bass     on which eighth notes of a bar the chord's root sounds, low
const THEMES = {
  plaza: { // C major, I-vi-ii-V: warm and welcoming.
    tempo: 92,
    chords: [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65],
      [53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [55, 59, 62, 65]],
    arp: [0, 1, 2, 3, 2, 1, 2, 1],
    bass: [0, 4],
    melody: [
      76, null, 74, 72, 74, null, 76, null,
      72, null, null, 69, 72, 74, 76, null,
      77, null, 76, 74, 72, null, 74, null,
      71, null, 74, null, 79, null, null, null,
      81, null, 79, 77, 76, null, 77, null,
      79, null, 76, null, 74, 76, 79, null,
      77, 76, 74, null, 72, null, 74, null,
      74, null, null, null, null, null, null, null,
    ],
  },
  forest: { // F major with a bright raised fourth (B natural): dappled, curious.
    tempo: 84,
    chords: [[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 62], [57, 60, 64, 67],
      [50, 53, 57, 60], [58, 62, 65, 69], [55, 58, 62, 65], [60, 64, 67, 70]],
    arp: [0, 2, 1, 3, 0, 2, 1, 2],
    bass: [0, 4],
    melody: [
      72, null, 76, null, 77, null, 79, null,
      79, null, null, 83, 81, null, 79, null,
      76, null, 79, null, 74, null, null, null,
      76, null, 72, null, 69, null, null, null,
      77, null, 76, 74, 72, null, 69, null,
      74, null, 77, null, 81, null, null, 79,
      77, null, 74, null, 70, null, 74, null,
      72, null, null, null, null, null, null, null,
    ],
  },
  savannah: { // D major pentatonic over a light shaker: sunny and easy-going.
    tempo: 100, drums: true,
    chords: [[62, 66, 69, 74], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69],
      [62, 66, 69, 74], [54, 57, 61, 64], [55, 59, 62, 66], [57, 62, 64, 69]],
    arp: [0, 1, 2, 1, 3, 2, 1, 2],
    bass: [0, 3, 4],
    melody: [
      74, null, 76, 78, null, 81, null, 78,
      76, null, 74, null, 71, null, 74, null,
      79, null, 78, 76, null, 74, null, 71,
      73, null, 76, null, null, null, null, null,
      81, null, 78, null, 76, 78, 81, null,
      78, null, 76, 73, null, 69, null, null,
      71, 74, 79, null, 78, null, 76, null,
      74, null, null, null, null, null, null, null,
    ],
  },
  arctic: { // E major, slow and spacious, with bell-like notes: quiet snow.
    tempo: 72,
    chords: [[52, 56, 59, 63], [49, 52, 56, 59], [57, 61, 64, 68], [59, 64, 66, 71],
      [52, 56, 59, 63], [56, 59, 63, 66], [57, 61, 64, 68], [59, 63, 66, 68]],
    arp: [0, 2, 3, 2, 1, 2, 3, 2],
    bass: [0],
    bells: true,
    melody: [
      83, null, null, 80, null, null, 76, null,
      78, null, null, null, 80, null, null, null,
      81, null, null, 80, null, null, 76, null,
      78, null, null, null, null, null, null, null,
      83, null, null, 85, null, null, 83, null,
      80, null, null, 78, null, null, 75, null,
      76, null, null, 78, null, null, 80, null,
      76, null, null, null, null, null, null, null,
    ],
  },
  coast: { // F major with a lazy off-beat bass and a shaker: sunny and relaxed (Phase 13).
    tempo: 100,
    drums: true,
    chords: [[53, 57, 60, 64], [57, 60, 64, 67], [58, 62, 65, 69], [60, 64, 67, 70],
      [53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [60, 64, 67, 70]],
    arp: [0, 2, 1, 3, 0, 2, 1, 2],
    bass: [0, 3, 6],
    melody: [
      72, null, 69, 72, 74, null, 72, null,
      76, null, 74, 72, 69, null, null, null,
      70, null, 74, null, 77, 76, 74, null,
      72, null, null, null, 67, 69, 72, null,
      77, null, 76, 74, 72, null, 69, null,
      74, null, 72, 69, 65, null, null, null,
      67, null, 70, null, 74, 72, 70, null,
      69, null, 67, null, 65, null, null, null,
    ],
  },
  indoor: { // G major, cozy and unhurried: inside a warm building.
    tempo: 88,
    chords: [[55, 59, 62, 66], [52, 55, 59, 62], [60, 64, 67, 71], [62, 66, 69, 72],
      [59, 62, 66, 69], [52, 55, 59, 62], [57, 60, 64, 67], [62, 66, 69, 72]],
    arp: [0, 1, 2, 1, 3, 1, 2, 1],
    bass: [0, 4],
    melody: [
      74, null, 79, null, 78, 79, 81, null,
      79, null, 76, null, 74, null, null, null,
      76, null, 79, null, 83, null, 81, 79,
      78, null, null, null, null, null, null, null,
      78, null, 81, null, 79, 78, 76, null,
      74, null, 76, null, 79, null, null, null,
      76, null, 72, null, 74, null, 76, null,
      79, null, null, null, null, null, null, null,
    ],
  },
};

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

export function setEnabled(on) {
  enabled = on;
  if (master) master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05);
}

// Call from a click or key press. Safe to call many times.
export function unlock() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return; // Very old browser: the game works silently.
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = enabled ? 1 : 0;
  master.connect(ctx.destination);
  sfx = ctx.createGain();
  sfx.gain.value = 0.35;
  sfx.connect(master);
  music = ctx.createGain();
  music.gain.value = 0.14;
  music.connect(master);
  // A soft room echo for the music only, made from fading noise (no files).
  const reverb = ctx.createConvolver();
  reverb.buffer = roomEcho(1.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  music.connect(reverb).connect(wet).connect(master);
  recorded = ctx.createGain();
  recorded.connect(master);
  if (theme) startLoop();
  loadRecordings();
}

function roomEcho(seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  return buffer;
}

// Loads the recorded sound effects: OGG where the browser plays it, else
// MP3. (The delivery's recorded area music is no longer used: the themes
// above replace it.)
function loadRecordings() {
  const ext = new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  for (const name of EFFECTS) {
    fetch(new URL(`${name}.${ext}`, AUDIO_ROOT))
      .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(name))))
      .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
      .then((buffer) => {
        buffers[name] = buffer;
      })
      .catch(() => {}); // Keep the made-up version.
  }
}

function tone(freq, start, duration, { wave = 'sine', gain = 0.3, out = sfx, slideTo = null, attack = 0.01, vibrato = 0 } = {}) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  if (vibrato) {
    // A gentle wobble in pitch, like breath in a flute.
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5;
    depth.gain.value = freq * vibrato;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(start + 0.15);
    lfo.stop(start + duration + 0.05);
  }
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(out);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

let noiseBuffer = null;
function noise(start, duration, { gain = 0.2, filter = 'lowpass', freq = 1000, out = sfx } = {}) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(f).connect(env).connect(out);
  source.start(start);
  source.stop(start + duration + 0.05);
}

// A marimba-like note (the stones at the Waterfall cove), as a MIDI number.
export function playNote(midi) {
  if (!ctx || !enabled) return;
  const now = ctx.currentTime;
  tone(hz(midi), now, 0.7, { gain: 0.3 });
  tone(hz(midi + 12), now, 0.25, { gain: 0.08 }); // The bright knock of the bar
}

// Short sound effects by name.
export function play(name) {
  if (!ctx || !enabled) return;
  if (buffers[name]) {
    const source = ctx.createBufferSource();
    source.buffer = buffers[name];
    const volume = ctx.createGain();
    volume.gain.value = VOLUME[name] ?? 1;
    source.connect(volume).connect(recorded);
    source.start();
    return;
  }
  const now = ctx.currentTime;
  switch (name) {
    case 'step': noise(now, 0.04, { gain: 0.05 * VOLUME.step, freq: 700 }); break;
    case 'coin': tone(988, now, 0.08, { gain: 0.25 }); tone(1319, now + 0.07, 0.2, { gain: 0.25 }); break;
    case 'door': noise(now, 0.35, { gain: 0.12, freq: 500 }); tone(220, now, 0.25, { gain: 0.08, slideTo: 330 }); break;
    case 'pop': tone(660, now, 0.1, { gain: 0.2, slideTo: 990 }); break;
    case 'stamp': [523, 659, 784, 1047].forEach((f, i) => tone(f, now + i * 0.08, 0.25, { wave: 'triangle', gain: 0.25 })); break;
    case 'throw': noise(now, 0.15, { gain: 0.12, filter: 'highpass', freq: 1500 }); break;
    case 'splat': noise(now, 0.12, { gain: 0.25, freq: 600 }); break;
    case 'hit': tone(880, now, 0.1, { gain: 0.2 }); tone(1175, now + 0.08, 0.15, { gain: 0.2 }); break;
    case 'click': tone(1200, now, 0.04, { gain: 0.08 }); break;
    default: break;
  }
}

// Picks the music for an area ('plaza', 'forest', 'savannah', 'arctic', 'coast', 'indoor').
export function setTheme(name) {
  if (name === theme || !THEMES[name]) return;
  theme = name;
  if (ctx) startLoop();
}

function startLoop() {
  clearInterval(timer);
  stepIndex = 0;
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(schedule, 50);
}

// Schedules the next notes a little ahead of time, so the music stays even
// if the game is busy for a moment.
function schedule() {
  const song = THEMES[theme];
  const eighth = 60 / song.tempo / 2;
  const total = song.melody.length;
  while (nextTime < ctx.currentTime + 0.25) {
    const i = stepIndex % total;
    const beat = i % 8;
    const chord = song.chords[Math.floor(i / 8) % song.chords.length];
    if (beat === 0) {
      // Soft pad: the whole chord, fading in and out over the bar.
      for (const note of chord) tone(hz(note), nextTime, eighth * 8.5, { wave: 'triangle', gain: 0.07, out: music, attack: eighth * 2 });
    }
    // Music-box arpeggio (bell-like, higher, in the Arctic).
    const arpNote = chord[song.arp[beat] % chord.length] + (song.bells ? 24 : 12);
    tone(hz(arpNote), nextTime, song.bells ? 1.4 : 0.45, { wave: 'sine', gain: song.bells ? 0.1 : 0.13, out: music });
    if (song.bass.includes(beat)) tone(hz(chord[0] - 24), nextTime, eighth * 3, { wave: 'sine', gain: 0.32, out: music });
    const note = song.melody[i];
    if (note) {
      let length = eighth; // Hold the note until the next one starts.
      for (let k = 1; k < 8 && song.melody[(i + k) % total] === null; k++) length += eighth;
      tone(hz(note), nextTime, Math.min(length * 1.1, eighth * 6), { wave: 'triangle', gain: 0.22, out: music, attack: 0.04, vibrato: 0.006 });
    }
    if (song.drums && beat % 2 === 1) noise(nextTime, 0.04, { gain: 0.05, filter: 'highpass', freq: 6000, out: music });
    nextTime += eighth;
    stepIndex++;
  }
}
