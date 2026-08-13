/**
 * Ambient sound bed — pure Web Audio synthesis, NO asset downloads.
 *
 * A cinematic site has sound. This is a soft, consonant pad (root + fifth +
 * octave so it can never clash), warmed through a low-pass filter, with a slow
 * "breathing" LFO on the master gain and a whisper of band-passed air noise.
 * Volume is deliberately low and it is OFF by default — the AudioContext is
 * only created on the user's first toggle (respecting autoplay policy) and is
 * suspended whenever the tab is hidden.
 */

let ctx = null;
let master = null;
let sfxBus = null; // interaction SFX bus — independent of the pad's breathing
let cueBus = null; // the cinematic cue, sent hard into the cathedral reverb
let reverb = null; // shared convolver — the "very large room"
let built = false;
let enabled = false;

const TARGET_GAIN = 0.06; // low — a presence, not a soundtrack

/* Listeners that want to follow the real enabled state (the toggle button).
   Without this the toggle keeps its own copy and drifts the moment anything
   else arms audio. */
const listeners = new Set();
function announce() {
  for (const fn of listeners) fn(enabled);
}

/** Subscribe to enabled-state changes. Returns an unsubscribe function. */
export function onAudioChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ── Cathedral space ──────────────────────────────────────────────────
   A procedurally generated impulse response — exponentially decaying
   noise — driving a ConvolverNode. This is the single most important
   node in the file: it is what turns a handful of oscillators into an
   organ standing in an enormous stone room rather than a synth patch.
   Generated once, shared by every cue. No asset, no download. */
function makeReverb(seconds = 3.4, decay = 2.8) {
  const rate = ctx.sampleRate;
  const len = Math.max(1, Math.floor(rate * seconds));
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      // A short "pre-delay" of silence puts the room *behind* the note.
      const t = i / len;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // SFX bus: a fixed, gentle gain straight to the output. Kept off the
  // master so the pad's breathing LFO / mute ramp never touches interaction
  // sounds — they read cleanly on their own.
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.5;
  sfxBus.connect(ctx.destination);

  // Cue bus: the theme goes out dry AND into the cathedral, so the organ
  // has a body up front and a tail that keeps ringing after the click.
  reverb = makeReverb();
  const wet = ctx.createGain();
  wet.gain.value = 0.85;
  reverb.connect(wet);
  wet.connect(ctx.destination);

  cueBus = ctx.createGain();
  cueBus.gain.value = 0.42;
  cueBus.connect(ctx.destination);
  cueBus.connect(reverb);

  // Warmth filter in front of the master bus.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1100;
  lp.Q.value = 0.5;
  lp.connect(master);

  // Drone chord — A2 / E3 / A3 (mid-low so laptop speakers can carry it).
  const voices = [
    { f: 110.0, g: 0.5, type: "sine" },
    { f: 164.81, g: 0.3, type: "triangle" },
    { f: 220.0, g: 0.22, type: "sine" },
  ];
  voices.forEach((v, i) => {
    const o = ctx.createOscillator();
    o.type = v.type;
    o.frequency.value = v.f;
    o.detune.value = (i - 1) * 4; // gentle chorus
    const g = ctx.createGain();
    g.gain.value = v.g;
    o.connect(g);
    g.connect(lp);
    o.start();
  });

  // Slow breathing — an LFO modulating the master gain (±) for life.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06; // ~16s cycle
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.018;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  // A whisper of "air" — band-passed looping noise, very low.
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const nf = ctx.createBiquadFilter();
  nf.type = "bandpass";
  nf.frequency.value = 900;
  nf.Q.value = 0.4;
  const ng = ctx.createGain();
  ng.gain.value = 0.01;
  noise.connect(nf);
  nf.connect(ng);
  ng.connect(master);
  noise.start();

  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend?.();
    else if (enabled) ctx.resume?.();
  });

  built = true;
}

function ramp(to, seconds) {
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(to, t + seconds);
}

export function isAudioEnabled() {
  return enabled;
}

export async function enableAudio() {
  if (!built) build();
  enabled = true;
  announce();
  try {
    await ctx.resume();
  } catch {
    /* ignore */
  }
  ramp(TARGET_GAIN, 1.4);
}

export function disableAudio() {
  enabled = false;
  announce();
  if (!ctx) return;
  ramp(0, 0.7);
  window.setTimeout(() => {
    if (!enabled) ctx.suspend?.();
  }, 800);
}

/** Toggle and return the new enabled state. */
export function toggleAudio() {
  if (enabled) {
    disableAudio();
    return false;
  }
  enableAudio();
  return true;
}

/* ──────────────────────────────────────────────────────────────────────
   INTERACTION SFX — synthesized on the fly, no assets. Every one is a hard
   no-op unless the user has opted into sound, so nothing ever plays
   unrequested. All voices self-stop and disconnect, so there is no node
   accumulation over a long session.
   ─────────────────────────────────────────────────────────────────────── */

/** Cinematic arrival whoosh — a down-swept bandpassed noise gust + a soft
 *  sub thump. Fired as a navigation warp lands. */
export function sfxWarp() {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;

  // Noise gust.
  const dur = 0.55;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(1800, t);
  bp.frequency.exponentialRampToValueAtTime(220, t + dur); // sweep down = motion

  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.5, t + 0.06);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  noise.connect(bp);
  bp.connect(ng);
  ng.connect(sfxBus);
  noise.start(t);
  noise.stop(t + dur);

  // Sub thump — grounds the landing.
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.5);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.32, t + 0.04);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  osc.connect(og);
  og.connect(sfxBus);
  osc.start(t);
  osc.stop(t + 0.6);

  noise.onended = () => {
    bp.disconnect();
    ng.disconnect();
  };
  osc.onended = () => og.disconnect();
}

// A consonant pentatonic scale — chapter pings can never sound "wrong".
const PING_SCALE = [523.25, 587.33, 698.46, 783.99, 880.0, 1046.5];

/** Soft chapter-arrival sonar — a bell-ish two-partial ping, pitched by the
 *  chapter index so travelling the page climbs a gentle scale. */
export function sfxChapter(index = 0) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  const base = PING_SCALE[index % PING_SCALE.length];

  [1, 2.01].forEach((mult, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = base * mult;
    const g = ctx.createGain();
    const peak = i === 0 ? 0.14 : 0.05;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(g);
    g.connect(sfxBus);
    osc.start(t);
    osc.stop(t + 0.95);
    osc.onended = () => g.disconnect();
  });
}

/* ──────────────────────────────────────────────────────────────────────
   THE THEME — the site's signature cue, fired when a hero CTA is pressed.

   Written in the idiom of the Interstellar score rather than sampled from
   it: the recording is copyrighted, and this file's whole premise is that
   nothing is downloaded. What actually produces that feeling is three
   ingredients, and all three are cheap to synthesize:

     ① a church-organ stack — a fundamental plus its pipe-rank harmonics,
        with a slow attack and a long release, drenched in a very large room
     ② a rising line that leans on a suspension before it resolves —
        root → sus4 → fifth → octave, the "reaching upward" gesture
     ③ the mechanical ticking ostinato underneath: time, running out

   Everything self-stops and disconnects, so a long session accumulates
   nothing. Silent unless the visitor has opted into sound.
   ─────────────────────────────────────────────────────────────────────── */

const CUE_ROOT = 110; // A2 — low enough to feel, high enough for laptop speakers

/* Pipe-organ rank weights: 16′ · 8′ · 4′ · 2⅔′ · 2′. Odd harmonics carry the
   reedy edge, the sub-octave carries the weight. */
const ORGAN_RANKS = [
  { mul: 0.5, gain: 0.5, type: "sine" },
  { mul: 1, gain: 1.0, type: "sine" },
  { mul: 2, gain: 0.5, type: "sine" },
  { mul: 3, gain: 0.26, type: "triangle" },
  { mul: 4, gain: 0.16, type: "sine" },
  { mul: 6, gain: 0.07, type: "triangle" },
];

/* The line. `mul` is a ratio against the root (1 · 4/3 · 3/2 · 2 = root,
   suspended fourth, fifth, octave), `at` is its entry in seconds. */
const CUE_LINE = [
  { mul: 1, at: 0.0, dur: 3.0, gain: 0.16 }, // pedal — held under everything
  { mul: 2, at: 0.0, dur: 3.0, gain: 0.1 }, // octave doubling on the pedal
  { mul: 8 / 3, at: 0.62, dur: 0.72, gain: 0.09 }, // the suspension (sus4)
  { mul: 3, at: 1.15, dur: 2.0, gain: 0.11 }, // it resolves up to the fifth
  { mul: 4, at: 1.95, dur: 1.7, gain: 0.1 }, // and arrives on the octave
];

let lastCue = 0;

/* ── Optional licensed track ──────────────────────────────────────────
   If a file exists at this path it becomes the button cue, and the
   synthesized theme below is the fallback. Nothing is bundled: the file is
   fetched from /public at runtime, and a 404 silently leaves the synth in
   place, so the site works identically whether or not one is present.

   Drop in a track you hold the rights to. A commercial score is not that —
   this repo deploys to a public URL, which makes serving one distribution
   without a licence. Keep it short and compressed too: the cue is a button
   press, so anything past a couple of MB is a worse trade than the synth.
   See public/audio/README.md. */
const THEME_TRACK_URL = "/audio/theme.mp3";
const THEME_EXCERPT = { start: 0, length: 7.5, fadeIn: 0.5, fadeOut: 1.6 };

let themeBuffer = null;
let themeState = "idle"; // idle | loading | ready | absent
let themeVoice = null; // the one playing source, so a re-press can replace it

async function loadTheme() {
  if (themeState !== "idle" || !ctx) return;
  themeState = "loading";
  try {
    const res = await fetch(THEME_TRACK_URL);
    // A dev server happily answers 200 with index.html for a missing file,
    // so trust the content type rather than the status code alone.
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("audio")) {
      themeState = "absent";
      return;
    }
    themeBuffer = await ctx.decodeAudioData(await res.arrayBuffer());
    themeState = "ready";
  } catch {
    themeState = "absent";
  }
}

/** Play an excerpt of the licensed track, if one was supplied. */
function playTrackExcerpt() {
  const { start, length, fadeIn, fadeOut } = THEME_EXCERPT;
  const t = ctx.currentTime + 0.02;

  // Never stack: a second press replaces the first rather than doubling it.
  if (themeVoice) {
    try {
      themeVoice.stop();
    } catch {
      /* already stopped */
    }
    themeVoice = null;
  }

  const src = ctx.createBufferSource();
  src.buffer = themeBuffer;
  const g = ctx.createGain();
  const span = Math.min(length, Math.max(0.5, themeBuffer.duration - start));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(1, t + fadeIn);
  g.gain.setValueAtTime(1, t + span - fadeOut);
  g.gain.exponentialRampToValueAtTime(0.0001, t + span);
  src.connect(g);
  g.connect(cueBus);
  src.start(t, Math.min(start, Math.max(0, themeBuffer.duration - 1)), span);
  src.stop(t + span + 0.05);
  themeVoice = src;
  src.onended = () => {
    g.disconnect();
    if (themeVoice === src) themeVoice = null;
  };
}

/** One organ note: a rank stack through a shared shaped envelope. */
function organNote(freq, at, dur, peak) {
  const stop = at + dur + 0.9; // let the release ring out
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + 0.22); // slow organ attack
  // Hold, then release. Clamped so a short note never schedules the hold
  // before the attack has finished (which would cancel the ramp).
  env.gain.setValueAtTime(peak, at + Math.max(0.24, dur * 0.6));
  env.gain.exponentialRampToValueAtTime(0.0001, stop);
  env.connect(cueBus);

  const oscs = [];
  for (const rank of ORGAN_RANKS) {
    const o = ctx.createOscillator();
    o.type = rank.type;
    o.frequency.value = freq * rank.mul;
    o.detune.value = (rank.mul % 2 === 0 ? 1 : -1) * 2.5; // pipes never agree
    const g = ctx.createGain();
    g.gain.value = rank.gain;
    o.connect(g);
    g.connect(env);
    o.start(at);
    o.stop(stop);
    o.onended = () => g.disconnect();
    oscs.push(o);
  }
  // One node owns the teardown of the shared envelope.
  oscs[0].addEventListener("ended", () => env.disconnect(), { once: true });
}

/** The clock: a steady, quiet mechanical tick that fades in and back out. */
function ostinato(at, beats, step) {
  for (let i = 0; i < beats; i++) {
    const t0 = at + i * step;
    // Swell in over the first third, ebb away over the last third.
    const shape = Math.sin((Math.PI * (i + 0.5)) / beats);
    const peak = 0.03 + shape * 0.055;

    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = i % 4 === 0 ? 1180 : 1620; // downbeat sits lower
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
    // Band-limit it so the square reads as a wooden tick, not a beep.
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200;
    bp.Q.value = 1.4;
    o.connect(bp);
    bp.connect(g);
    g.connect(cueBus);
    o.start(t0);
    o.stop(t0 + 0.09);
    o.onended = () => {
      bp.disconnect();
      g.disconnect();
    };
  }
}

/**
 * Fire the theme.
 *
 * @param {"full"|"short"} weight  "short" is the two-chord version used for
 *   secondary interactions, so the full statement stays special.
 */
export function sfxTheme(weight = "full") {
  if (!enabled || !ctx) return;
  // Rapid clicks must not stack into a wall of organ.
  const now = ctx.currentTime;
  if (now - lastCue < 1.1) return;
  lastCue = now;

  // A supplied track wins; otherwise the synthesized theme plays. The fetch
  // is kicked off here rather than on load so a visitor who never turns sound
  // on never pays for it — the first press gets the synth, any press after
  // the decode lands gets the track.
  if (themeState === "idle") loadTheme();
  if (themeState === "ready" && weight === "full") {
    playTrackExcerpt();
    return;
  }

  const t = now + 0.02; // a beat of headroom for the scheduler
  const line = weight === "short" ? CUE_LINE.slice(0, 3) : CUE_LINE;
  const span = weight === "short" ? 1.4 : 3.0;

  for (const note of line) {
    organNote(CUE_ROOT * note.mul, t + note.at, note.dur, note.gain);
  }

  // The ticking clock underneath — ~7 per second, the score's restless pulse.
  ostinato(t + 0.1, weight === "short" ? 9 : 20, 0.14);

  // Sub drop — the floor falling away as the organ enters.
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(78, t);
  sub.frequency.exponentialRampToValueAtTime(38, t + Math.min(1.4, span));
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.exponentialRampToValueAtTime(0.22, t + 0.12);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + span * 0.7);
  sub.connect(sg);
  sg.connect(cueBus);
  sub.start(t);
  sub.stop(t + span);
  sub.onended = () => sg.disconnect();
}
