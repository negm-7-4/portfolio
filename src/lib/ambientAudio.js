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
let built = false;
let enabled = false;

const TARGET_GAIN = 0.06; // low — a presence, not a soundtrack

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

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
