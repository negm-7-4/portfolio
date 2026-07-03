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
let built = false;
let enabled = false;

const TARGET_GAIN = 0.06; // low — a presence, not a soundtrack

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
  try { await ctx.resume(); } catch { /* ignore */ }
  ramp(TARGET_GAIN, 1.4);
}

export function disableAudio() {
  enabled = false;
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

  noise.onended = () => { bp.disconnect(); ng.disconnect(); };
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
