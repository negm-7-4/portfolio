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
  try {
    await ctx.resume();
  } catch {
    /* ignore */
  }
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

  noise.onended = () => {
    bp.disconnect();
    ng.disconnect();
  };
  osc.onended = () => og.disconnect();
}

/**
 * LAUNCH — the cinematic swell under the hero's primary call to action.
 *
 * This is an ORIGINAL cue, synthesized live like everything else here. It is
 * deliberately written in the register people associate with big space-film
 * scores — a pipe-organ registration and a slow rising perfect fifth — but it
 * is not, and must not become, anyone's actual soundtrack. Shipping a
 * commercial score on a public portfolio is a copyright takedown waiting to
 * happen, and it would also mean the first real audio download on a site that
 * has so far cost visitors zero bytes of audio.
 *
 * The organ character comes from the drawbar registration: a fundamental plus
 * its octave, twelfth, double octave and seventeenth, all sines. That stack
 * is what makes a sine pile read as "organ" rather than "beep". A slow attack
 * and long release give it the swell; a shallow tremolo keeps it breathing.
 */
export function sfxLaunch() {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;

  const ROOT = 146.83; // D3
  const RISE = 220.0; // A3 — a perfect fifth up
  const ATTACK = 0.14;
  const HOLD = 1.15;
  const RELEASE = 1.25;
  const END = ATTACK + HOLD + RELEASE;

  // Drawbar registration: harmonic ratio → relative loudness.
  const DRAWBARS = [
    [1, 1.0], // fundamental
    [2, 0.5], // octave
    [3, 0.34], // twelfth
    [4, 0.22], // double octave
    [6, 0.12], // seventeenth-ish upper colour
  ];

  const voice = ctx.createGain();
  voice.gain.setValueAtTime(0.0001, t);
  voice.gain.exponentialRampToValueAtTime(0.34, t + ATTACK);
  voice.gain.setValueAtTime(0.34, t + ATTACK + HOLD);
  voice.gain.exponentialRampToValueAtTime(0.0001, t + END);

  // Rolls the top off so the upper drawbars sit behind the fundamental
  // instead of shrieking on laptop speakers.
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(1500, t);
  tone.frequency.linearRampToValueAtTime(2600, t + ATTACK + HOLD);
  tone.Q.value = 0.4;

  voice.connect(tone);
  tone.connect(sfxBus);

  // Shallow tremolo — an organ is never perfectly static.
  const trem = ctx.createOscillator();
  trem.type = "sine";
  trem.frequency.value = 5.2;
  const tremDepth = ctx.createGain();
  tremDepth.gain.value = 0.045;
  trem.connect(tremDepth);
  tremDepth.connect(voice.gain);
  trem.start(t);
  trem.stop(t + END);

  const oscillators = DRAWBARS.map(([ratio, level]) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(ROOT * ratio, t);
    // The swell rises a fifth — the move that carries the whole cue.
    osc.frequency.exponentialRampToValueAtTime(RISE * ratio, t + ATTACK + HOLD);

    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g);
    g.connect(voice);
    osc.start(t);
    osc.stop(t + END);
    osc.onended = () => g.disconnect();
    return osc;
  });

  // Sub octave for weight under the organ.
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(ROOT / 2, t);
  sub.frequency.exponentialRampToValueAtTime(RISE / 2, t + ATTACK + HOLD);
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.0001, t);
  subG.gain.exponentialRampToValueAtTime(0.2, t + ATTACK * 1.6);
  subG.gain.exponentialRampToValueAtTime(0.0001, t + END);
  sub.connect(subG);
  subG.connect(sfxBus);
  sub.start(t);
  sub.stop(t + END);

  sub.onended = () => subG.disconnect();
  oscillators[0].onended = () => {
    trem.disconnect();
    tremDepth.disconnect();
    voice.disconnect();
    tone.disconnect();
  };
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
