import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp, dampC } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";
import { sections } from "../../data/sections";

/* eslint-disable react/no-unknown-property */

/* ──────────────────────────────────────────────────────────────────────
   MORPH FIELD — the signature cinematic beat.

   A single GPU point cloud (one draw call) whose particles continuously
   re-form into distinct SHAPES as the page scrolls, so the world literally
   rebuilds itself around the story. Each shape belongs to a CHAPTER, not to
   a slice of raw scroll (see the FORMATION table below):

     hero        → RINGS       (a banded ring system — the planet)
     about       → FINGERPRINT (identity, drawn as a mark rather than a photo)
     skills      → ATOM        (the React mark — three orbits + nucleus)
     experience  → GALAXY      (spiral arms — the journey)
     projects    → SCATTER     (a wide constellation, centre left open)
     contact     → BEACON      (concentric rings pulsing outward)
     page end    → ✦           (the site's own mark — the signature)

   Every particle keeps its identity across formations and travels a seeded
   ARC with its own departure window (swarm, not tween). The atom and the
   initials are "readable" shapes, so the field's yaw squares up to the
   camera while they hold the stage and releases as you move off. Colour
   drifts toward the active chapter's accent; scroll velocity adds
   turbulence; the cloud explodes in from nothing on the intro.
   ─────────────────────────────────────────────────────────────────────── */

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // golden angle

/* ONE COMPOSED FORMATION PER CHAPTER — formation index === chapter index,
   with the last entry landing at the foot of the page.

     00 hero ......... RINGS       a banded ring system — the planet
     01 about ........ FINGERPRINT identity, drawn as a mark
     02 services ..... LATTICE     an ordered 3D grid — systems, built
     03 skills ....... ATOM        the React mark
     04 experience ... GALAXY      spiral arms — the journey
     05 process ...... HELIX       two strands and their rungs — a pipeline
     06 projects ..... SCATTER     a wide constellation, centre left open
     07 case study ... WAVE        a calm drifting terrain under a long read
     08 socials ...... NETWORK     clustered nodes joined by strands
     09 contact ...... BEACON      concentric rings pulsing outward
     10 page end ..... ✦           the site's own mark — the signature

   There used to be seven shapes for eleven beats, which meant five chapters
   (services, process, case study, socials, and half of about) never showed a
   composed shape at all — the field spent them stranded mid-morph, which is
   by definition a formless cloud. Over the case-study stretch that is several
   thousand pixels of bright noise sitting on top of the copy.

   A morph is a transition, not a state. Every chapter now HOLDS a shape and
   the morphing happens in the travel between them, where it reads as the
   world rebuilding itself rather than as mush. */

/* Formations that must read head-on → their rotational symmetry period.
   The yaw snaps to the nearest multiple while they hold the stage, so the
   correction is always the shortest possible move. */
/* Formations that must read head-on, and the YAW period that leaves them
   looking the same (the yaw snaps to the nearest multiple, so the
   correction is always the shortest move).
   NB: a flat shape only faces the camera at a FULL turn — its in-plane
   symmetry (the ✦'s 4 points, say) is about its own normal, not the yaw
   axis, so snapping the yaw by 90° would stand it edge-on.
   Keys are formation indices: 1 fingerprint · 3 atom · 9 beacon · 10 the ✦. */
const FACE_SYMMETRY = { 1: TAU, 3: Math.PI / 3, 9: TAU, 10: TAU };

/* How present the field is during each chapter — same index as the
   formation table (0…sections.length).

   Once every formation actually landed on its own chapter, a second problem
   became obvious: the shapes are now fully composed exactly where the copy
   is, and a bright additive cloud directly behind body text is a legibility
   problem no amount of art direction excuses. So the field performs — it
   opens up for the beats that are meant to be spectacle (the hero, the
   projects constellation, the contact beacon, the finale) and steps back
   under the chapters people are there to READ. */
const FIELD_PRESENCE = [
  1.0, // 00 hero ........... the opening statement
  0.6, // 01 about .......... dense copy + the profile card
  0.58, // 02 services
  0.72, // 03 skills ......... the atom is the section's own mark, let it show
  0.6, // 04 experience
  0.58, // 05 process
  0.9, // 06 projects ....... the constellation IS the backdrop here
  0.55, // 07 case study ..... the longest read on the site
  0.7, // 08 socials
  0.95, // 09 contact ........ the beacon is the point of the chapter
  1.0, // 10 finale
];
const FIELD_OPACITY = 0.72;

/* Planetary tilt/roll of the hero ring system — enough to read as a disc in
   perspective (not edge-on, not a flat bullseye). Shared with HeroModel's
   rim so the whole object sits in one plane. */
const RING_TILT = 0.42;
const RING_ROLL = 0.18;

// Small, fast, deterministic RNG so the scatter formation is stable across
// reloads (important — the morph must look identical every visit).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Formation generators ───────────────────────────────────────────────
   Each fills `out` (a Float32Array of N*3) in place and uses the SAME
   particle index `k` as its through-line, so point k in one shape maps to
   point k in the next — that is what makes the morphs read as one swarm
   rearranging itself rather than a crossfade between two clouds. ── */

/* ── SATURN RINGS — the hero formation. ────────────────────────────────
   A flat banded ring system (kept in the XZ plane; the group supplies the
   tilt) with Cassini-style gaps, denser inner bands and a sparse dusty
   outer band. Radii start outside the gem + its orbiting shards so the
   whole thing reads as one planet-and-rings object.

   Because a ring is rotationally symmetric about its axis, the group can
   spin it forever and it still composes identically every time you return
   to the top — motion without drift. */
function formRings(out, N, rIn, rOut, thickness, rng) {
  // [start, end] as a fraction of the ring width; the holes between them
  // are the divisions that sell the "Saturn" read.
  const BANDS = [
    [0.0, 0.26],
    [0.33, 0.58],
    [0.65, 0.84],
    [0.9, 1.0],
  ];
  // Relative particle share per band — inner bands are the dense bright ones.
  const WEIGHT = [0.34, 0.3, 0.24, 0.12];
  const cum = [];
  let acc = 0;
  for (const w of WEIGHT) {
    acc += w;
    cum.push(acc);
  }

  for (let k = 0; k < N; k++) {
    const pick = rng();
    let b = 0;
    while (b < cum.length - 1 && pick > cum[b]) b++;
    const [b0, b1] = BANDS[b];

    // Bias toward the inner edge of each band so bands have a bright rim.
    const u = b0 + Math.pow(rng(), 0.75) * (b1 - b0);
    const rad = rIn + u * (rOut - rIn);

    // Golden-angle base keeps the azimuth even; jitter breaks any moiré.
    const a = k * GOLDEN + rng() * 0.4;

    // Ring gets thinner (and dustier) toward the outside.
    const th = thickness * (1.15 - 0.75 * u);
    out[k * 3] = Math.cos(a) * rad;
    out[k * 3 + 1] = (rng() - 0.5) * th;
    out[k * 3 + 2] = Math.sin(a) * rad;
  }
}

/* ── SPIRAL GALAXY ────────────────────────────────────────────────────
   Logarithmic arms winding out of a dense core bulge, thinning into a
   dusty disc. Radius follows pow(rng, 0.65) so the core stays bright and
   the arms trail off — the distribution is what sells it, not the count. */
function formGalaxy(out, N, radius, arms, twist, thickness, rng) {
  for (let k = 0; k < N; k++) {
    const t = Math.pow(rng(), 0.62); // 0 = core, 1 = rim
    const rad = t * radius;
    const arm = (k % arms) * (TAU / arms);
    // Arms are fat near the core and tighten outward.
    const spread = 0.55 * (1 - t) + 0.1;
    const a = arm + t * twist + (rng() - 0.5) * spread;
    out[k * 3] = Math.cos(a) * rad;
    out[k * 3 + 1] = (rng() - 0.5) * thickness * (1 - t * 0.8);
    out[k * 3 + 2] = Math.sin(a) * rad;
  }
}

/* ── FINGERPRINT ──────────────────────────────────────────────────────
   Concentric ridges whose centre drifts outward, producing the whorl of a
   real print. Abstract but instantly readable, and far more elegant than a
   literal portrait: this is "who I am" as a mark, not a photo.
   Laid out in the XY plane so the facing logic squares it to the camera. */
function formFingerprint(out, N, R, rng) {
  const RIDGES = 24;
  const per = Math.max(1, Math.floor(N / RIDGES));
  for (let k = 0; k < N; k++) {
    const ridge = Math.min(RIDGES - 1, Math.floor(k / per));
    const i = k - ridge * per;
    const t = ridge / (RIDGES - 1); // 0 = core whorl, 1 = outer ridge
    const a = (i / per) * TAU + ridge * 0.22;

    const rad = R * (0.1 + t * 0.9);
    // Centre drifts as ridges grow → the loop/whorl instead of bullseyes.
    const cx = R * 0.22 * t;
    const cy = -R * 0.06 * t;
    const squash = 0.86 + 0.1 * t;
    // Organic ridge wobble so the lines breathe like skin, not vector art.
    const wob = 1 + 0.045 * Math.sin(a * 3.0 + ridge * 1.7);

    out[k * 3] = cx + Math.cos(a) * rad * wob;
    out[k * 3 + 1] = cy + Math.sin(a) * rad * squash * wob;
    out[k * 3 + 2] = (rng() - 0.5) * 0.09;
  }
}

/* ── BEACON ───────────────────────────────────────────────────────────
   A transmission: concentric rings pulsing out of a bright core, thinning
   and scattering as they travel. Reads as "reaching out" — the contact
   beat — without resorting to an envelope or literal letterforms. */
function formBeacon(out, N, R, rng) {
  const RINGS = 8;
  for (let k = 0; k < N; k++) {
    // Weight particles toward the inner rings so the core stays bright and
    // the outermost ring dissolves into dust.
    const t = Math.pow(rng(), 0.7);
    const ring = Math.min(RINGS - 1, Math.floor(t * RINGS));
    const rt = ring / (RINGS - 1);
    const rad = R * (0.06 + rt * 0.94);
    const a = ((k * GOLDEN) % TAU) + ring * 0.35;
    const jitter = (rng() - 0.5) * 0.05 * (1 + rt * 3);
    out[k * 3] = Math.cos(a) * (rad + jitter);
    out[k * 3 + 1] = Math.sin(a) * (rad + jitter);
    out[k * 3 + 2] = (rng() - 0.5) * 0.12;
  }
}

/* ── THE MARK (✦) ─────────────────────────────────────────────────────
   The site's own glyph, drawn by every particle: a sharp four-point star.
   The journey closes on the signature it opened with. */
function formStar(out, N, R, rng) {
  for (let k = 0; k < N; k++) {
    const a = (k / N) * TAU + rng() * 0.02;
    // r peaks on the axes and pinches hard at the diagonals → 4 sharp points.
    const spike = R / (1 + 5.5 * Math.abs(Math.sin(2 * a)));
    // Bias toward the outline so the silhouette stays crisp, with some fill.
    const rad = spike * Math.pow(rng(), 0.4);
    out[k * 3] = Math.cos(a) * rad;
    out[k * 3 + 1] = Math.sin(a) * rad;
    out[k * 3 + 2] = (rng() - 0.5) * 0.09;
  }
}

/* ── LATTICE ──────────────────────────────────────────────────────────
   A 3D wireframe grid: every particle rides along ONE line of a cubic
   lattice, its other two coordinates snapped to the grid. A filled cube of
   points would read as a solid blob; running them along the lines is what
   makes it read as structure — the services chapter, as a built system. */
function formLattice(out, N, size, cells, rng) {
  const step = (size * 2) / cells;
  for (let k = 0; k < N; k++) {
    const axis = k % 3; // which way this particle's line runs
    const i = Math.floor(rng() * (cells + 1));
    const j = Math.floor(rng() * (cells + 1));
    const along = (rng() - 0.5) * size * 2;
    const a = -size + i * step;
    const b = -size + j * step;
    // A hair of jitter so the lines read as drawn rather than printed.
    const w = () => (rng() - 0.5) * 0.05;

    if (axis === 0) {
      out[k * 3] = along + w();
      out[k * 3 + 1] = a + w();
      out[k * 3 + 2] = b + w();
    } else if (axis === 1) {
      out[k * 3] = a + w();
      out[k * 3 + 1] = along + w();
      out[k * 3 + 2] = b + w();
    } else {
      out[k * 3] = a + w();
      out[k * 3 + 1] = b + w();
      out[k * 3 + 2] = along + w();
    }
  }
}

/* ── HELIX ────────────────────────────────────────────────────────────
   Two counter-phase strands climbing a shared axis, joined by rungs. The
   process chapter is a sequence of steps, and this is the most legible
   "ordered progression" a point cloud can draw. Laid along Y so it reads
   as a climb rather than a horizon. */
function formHelix(out, N, R, height, turns, rng) {
  for (let k = 0; k < N; k++) {
    const role = k % 5; // 0,1,2,3 = strands · 4 = a rung. Strands stay dense.
    const t = ((k / N) * 1.0 + rng() * 0.002) % 1;
    const a = t * turns * TAU;
    const y = (t - 0.5) * height;

    if (role === 4) {
      // Rung: a bar crossing between the two strands at this height.
      const u = rng();
      const x0 = Math.cos(a) * R;
      const z0 = Math.sin(a) * R;
      const x1 = Math.cos(a + Math.PI) * R;
      const z1 = Math.sin(a + Math.PI) * R;
      out[k * 3] = x0 + (x1 - x0) * u;
      out[k * 3 + 1] = y;
      out[k * 3 + 2] = z0 + (z1 - z0) * u;
      continue;
    }

    const phase = role < 2 ? 0 : Math.PI;
    const jitter = (rng() - 0.5) * 0.07;
    out[k * 3] = Math.cos(a + phase) * (R + jitter);
    out[k * 3 + 1] = y + jitter;
    out[k * 3 + 2] = Math.sin(a + phase) * (R + jitter);
  }
}

/* ── WAVE ─────────────────────────────────────────────────────────────
   A drifting terrain: a plane whose height is two crossed sine ridges,
   thinning toward the edges. Deliberately the calmest shape in the set —
   it holds the case study, which is the longest read on the site, so the
   field wants to be a horizon behind the words rather than an event. */
function formWave(out, N, size, amp, rng) {
  for (let k = 0; k < N; k++) {
    // Square-root radius keeps the density even across the disc instead of
    // bunching every particle into the middle.
    const rad = Math.sqrt(rng()) * size;
    const a = rng() * TAU;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad * 0.75;
    const fade = 1 - rad / size; // ridges flatten out toward the rim
    out[k * 3] = x;
    out[k * 3 + 1] =
      (Math.sin(x * 0.7) * 0.6 + Math.sin(z * 0.9 + x * 0.25) * 0.4) * amp * fade +
      (rng() - 0.5) * 0.06;
    out[k * 3 + 2] = z;
  }
}

/* ── NETWORK ──────────────────────────────────────────────────────────
   Clusters of nodes with strands running between them — the socials
   chapter as what it actually is: connections. The link particles are what
   sell it; a field of blobs alone would just be another scatter. */
function formNetwork(out, N, R, nodeCount, rng) {
  // Node centres, spread on a shell so none of them stack up in depth.
  const nodes = [];
  for (let n = 0; n < nodeCount; n++) {
    const theta = rng() * TAU;
    const phi = Math.acos(2 * rng() - 1);
    const rad = R * (0.35 + rng() * 0.65);
    nodes.push([
      Math.sin(phi) * Math.cos(theta) * rad,
      Math.cos(phi) * rad * 0.7,
      Math.sin(phi) * Math.sin(theta) * rad,
    ]);
  }

  for (let k = 0; k < N; k++) {
    if (k % 5 < 3) {
      // Node: a soft ball of points around one centre.
      const c = nodes[k % nodeCount];
      const theta = rng() * TAU;
      const phi = Math.acos(2 * rng() - 1);
      const rad = Math.pow(rng(), 0.55) * R * 0.13;
      out[k * 3] = c[0] + Math.sin(phi) * Math.cos(theta) * rad;
      out[k * 3 + 1] = c[1] + Math.cos(phi) * rad;
      out[k * 3 + 2] = c[2] + Math.sin(phi) * Math.sin(theta) * rad;
      continue;
    }
    // Link: a particle somewhere along the strand joining two nodes.
    const a = nodes[Math.floor(rng() * nodeCount)];
    const b = nodes[Math.floor(rng() * nodeCount)];
    const u = rng();
    const sag = Math.sin(u * Math.PI) * 0.18; // strands hang, they don't ping
    out[k * 3] = a[0] + (b[0] - a[0]) * u;
    out[k * 3 + 1] = a[1] + (b[1] - a[1]) * u - sag;
    out[k * 3 + 2] = a[2] + (b[2] - a[2]) * u;
  }
}

function formScatter(out, N, rMin, rMax, flatten, rng) {
  for (let k = 0; k < N; k++) {
    const theta = rng() * TAU;
    const phi = Math.acos(2 * rng() - 1);
    const rad = rMin + rng() * (rMax - rMin);
    out[k * 3] = Math.sin(phi) * Math.cos(theta) * rad;
    out[k * 3 + 1] = Math.cos(phi) * rad * flatten;
    out[k * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rad;
  }
}

/* The React mark — three elliptical orbits 60° apart + a dense nucleus.
   Faces +Z; the group's facing logic squares it to the camera. */
function formAtom(out, N, R, rng) {
  const nucleus = Math.floor(N * 0.2);
  for (let k = 0; k < N; k++) {
    if (k < nucleus) {
      // Nucleus — a tight gaussian-ish ball.
      const theta = rng() * TAU;
      const phi = Math.acos(2 * rng() - 1);
      const rad = Math.pow(rng(), 0.6) * R * 0.22;
      out[k * 3] = Math.sin(phi) * Math.cos(theta) * rad;
      out[k * 3 + 1] = Math.cos(phi) * rad;
      out[k * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rad;
      continue;
    }
    const ring = k % 3;
    const u = (k - nucleus) / (N - nucleus);
    const a = u * TAU * 3 + ring * 2.1; // 3 laps per ring → even coverage
    // Flat ellipse in XY…
    const ex = Math.cos(a) * R;
    const ey = Math.sin(a) * R * 0.38;
    // …rotated around Z by the ring's 60° step.
    const rot = ring * (Math.PI / 3);
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    out[k * 3] = ex * c - ey * s;
    out[k * 3 + 1] = ex * s + ey * c;
    out[k * 3 + 2] = (rng() - 0.5) * 0.24; // slight slab depth
  }
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uBlend;
  uniform float uReveal;
  uniform float uDrift;
  uniform float uSize;
  uniform float uPixelRatio; // device pixels per CSS pixel — see gl_PointSize
  uniform float uArc;     // swarm arc strength (how far particles bow out)
  uniform float uShock;   // radial pulse strength (0..1, JS owns the decay)
  uniform float uShockR;  // the pulse ring's current radius (world units)
  uniform vec3  uPointer; // cursor projected onto the field's plane (world)
  uniform float uPush;    // pointer interaction strength (0 on touch tiers)

  // The buffer density the point sizes below were tuned against. See the
  // gl_PointSize note at the bottom of main().
  const float REF_PIXEL_RATIO = 1.25;

  attribute vec3  aTo;
  attribute float aSeed;
  attribute float aColT;

  varying float vColT;
  varying float vTw;
  varying float vPinf;
  varying float vDepth;
  varying float vFlight; // 0 settled → 1 mid-morph, this particle is travelling
  varying float vFlare;  // 1 for the sparse subset that renders as a star

  /* A smooth, divergence-ish swirl sampled in SPACE rather than per particle.
     The old drift gave every particle its own random phase, so a settled
     formation shimmered like TV static. Sampling a spatial field instead
     means neighbours move together, and the cloud breathes like a fluid. */
  vec3 curlish(vec3 p, float t) {
    return vec3(
      sin(p.y * 0.90 + t * 0.50) - cos(p.z * 1.10 - t * 0.37),
      sin(p.z * 0.80 + t * 0.43) - cos(p.x * 1.05 - t * 0.51),
      sin(p.x * 0.95 + t * 0.61) - cos(p.y * 0.85 - t * 0.44)
    );
  }

  void main() {
    vColT = aColT;
    float ph = aSeed * 6.28318;
    vFlare = step(0.94, aSeed); // ~6% of the cloud carries a star flare

    // Staggered departure: each particle's blend window is offset by its
    // seed, so the shape FLOCKS into place — a swarm, never a tween.
    float b = clamp(uBlend * 1.35 - aSeed * 0.35, 0.0, 1.0);
    b = b * b * (3.0 - 2.0 * b);
    vec3 pos = mix(position, aTo, b);

    // Arc travel: every particle bows out along its own seeded direction,
    // scaled by how far it has to fly. Straight lines read mechanical;
    // arcs read alive. Zero when settled (sin(0)=sin(π)=0).
    float travel = length(aTo - position);
    float mid = sin(b * 3.14159); // peaks mid-flight, zero at both ends
    vec3 arcDir = normalize(vec3(sin(ph), cos(ph * 1.31), sin(ph * 0.73)) + 0.0001);
    pos += arcDir * mid * travel * uArc * (0.3 + 0.7 * aSeed);

    // How energetically this particle is moving right now. A long-haul
    // particle mid-morph is the brightest thing in the frame, so a formation
    // change reads as a surge of energy instead of a silent rearrangement.
    vFlight = clamp(mid * travel * 0.22, 0.0, 1.0);

    // Always-alive drift so a settled formation still shimmers — a spatial
    // swirl, plus a whisper of per-particle phase so it never looks uniform.
    vec3 drift = curlish(pos * 0.55, uTime * 0.6) * 0.5
               + vec3(sin(uTime * 0.5 + ph), cos(uTime * 0.45 + ph * 1.3), sin(uTime * 0.6 + ph * 0.7)) * 0.35;
    pos += drift * uDrift;

    // Intro: explode in from a diffuse cloud as the preloader lifts.
    float ex = 1.0 - clamp(uReveal, 0.0, 1.0);
    pos += normalize(pos + 0.0001) * ex * (6.0 + aSeed * 6.0);

    // Pointer field: particles part around the cursor like disturbed water —
    // computed in WORLD space so it stays honest while the group rotates.
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vec3 toP = wp.xyz - uPointer;
    float pd = length(toP);
    // The cursor parts the shell like disturbed water and heats its wake —
    // the field's signature interaction, kept generous so it reads clearly.
    vPinf = smoothstep(2.4, 0.0, pd) * uPush;
    wp.xyz += normalize(toP + 0.0001) * vPinf * 1.25;

    // Shockwave: an expanding spherical ring from the core that throws
    // particles outward and heats them as it passes through.
    float ringD = length(wp.xyz) - uShockR;
    float shockInf = exp(-ringD * ringD * 1.6) * uShock;
    wp.xyz += normalize(wp.xyz + 0.0001) * shockInf * 1.1;
    vPinf = max(vPinf, shockInf);

    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;

    vTw = 0.55 + 0.45 * sin(uTime * 2.0 + ph * 3.0);
    float s = uSize * (0.45 + aSeed) * vTw * (1.0 + vPinf * 1.1 + vFlight * 0.8);

    // gl_PointSize is measured in DEVICE pixels, and this line used to ignore
    // that: the cloud rendered visibly finer on a dense screen than on a 1×
    // one, and it changed size on the same screen whenever AdaptiveDpr stepped
    // the resolution mid-scroll. Sizing in CSS pixels and multiplying by the
    // live ratio at the end makes the field look identical everywhere.
    //
    // The divisor is the density the field was art-directed at. Normalising to
    // 1× instead would have been "correct" and wrong: every sprite is
    // additively blended, so a 25% size bump is a compounding brightness bump,
    // and the hero blew out into a white mass.
    float cssSize = clamp(s * (220.0 / -mv.z) / REF_PIXEL_RATIO, 1.0, 51.0);
    gl_PointSize = cssSize * uPixelRatio;

    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorHot;
  uniform float uOpacity;
  uniform float uReveal;

  varying float vColT;
  varying float vTw;
  varying float vPinf;
  varying float vDepth;
  varying float vFlight;
  varying float vFlare;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);

    // A sparse subset renders as a four-point star rather than a dot, so the
    // cloud has real "stars" scattered through the dust instead of reading
    // as one uniform grain.
    float cross = max(0.0, 1.0 - abs(uv.x) * 11.0) + max(0.0, 1.0 - abs(uv.y) * 11.0);
    float spark = cross * vFlare * (1.0 - smoothstep(0.1, 0.5, d));

    vec3 col = mix(uColorA, uColorB, vColT);
    col += uColorHot * core * 0.8;
    // Particles near the cursor heat toward white — the wake reads as energy.
    col = mix(col, uColorHot, vPinf * 0.6);
    // …and so do particles that are mid-flight between two formations, so a
    // morph looks like the field spending energy to rebuild itself.
    col = mix(col, uColorHot, vFlight * 0.45);
    // Depth grade — near particles run hot, far ones cool off and recede.
    // Gives the flat additive cloud a real sense of volume.
    float dn = smoothstep(6.0, 22.0, vDepth);
    col = mix(col * 1.18 + uColorHot * 0.05, col * 0.55, dn);

    float alpha = (glow * glow + spark * 0.5) * uOpacity * (0.35 + 0.65 * vTw) * clamp(uReveal, 0.0, 1.0);
    alpha *= 1.0 + vPinf * 0.5 + vFlight * 0.6;
    gl_FragColor = vec4(col, alpha);

    #include <colorspace_fragment>
  }
`;

export default function MorphField({ quality = "high", interactive = false }) {
  const group = useRef(null);
  const lastSeg = useRef(-1);
  // Cursor-ray scratch vectors (world-space pointer projection, no allocs).
  const rayDir = useRef(new THREE.Vector3());
  const pointerWorld = useRef(new THREE.Vector3(0, 0, 999));
  const camFwd = useRef(new THREE.Vector3());
  // Shockwave state (this component owns the pulse's lifecycle).
  const shockR = useRef(0);
  const lastShock = useRef(0);

  const N = quality === "high" ? 7000 : 3600;

  // ── Precompute every formation once (deterministic). ──────────────
  const forms = useMemo(() => {
    const mk = () => new Float32Array(N * 3);
    const rng = mulberry32(0xc0ffee);

    // One entry per chapter — see the FORMATION table at the top of the file.
    // Index k is the shape that chapter k holds.
    const f = Array.from({ length: 11 }, mk);

    // 00 hero. Widened from 2.45–3.95: the narrow band read as a stripe
    // through the frame rather than a ring system, and at the hero's camera
    // distance the outer edge never cleared the gem's shard belts enough for
    // the Cassini gaps to be legible.
    formRings(f[0], N, 2.75, 5.1, 0.17, rng);
    formFingerprint(f[1], N, 3.0, rng); // 01 about
    formLattice(f[2], N, 2.7, 5, rng); // 02 services
    formAtom(f[3], N, 3.1, rng); // 03 skills
    formGalaxy(f[4], N, 5.6, 3, 3.4, 0.5, rng); // 04 experience
    formHelix(f[5], N, 1.5, 7.0, 2.6, rng); // 05 process
    formScatter(f[6], N, 3.8, 7.6, 0.72, rng); // 06 projects
    formWave(f[7], N, 6.4, 1.5, rng); // 07 case study
    formNetwork(f[8], N, 3.6, 9, rng); // 08 socials
    // Contact and the finale share the closest, tightest camera in the whole
    // journey (fov 41 at z 8), so both were sized past the edges of their own
    // shot: the ✦ in particular had its four points off-frame and read as a
    // plain cross of light. Sized to sit inside the frame instead.
    formBeacon(f[9], N, 3.0, rng); // 09 contact
    formStar(f[10], N, 2.3, rng); // 10 finale

    return f;
  }, [N]);

  // ── Static per-particle attributes: seed + colour position. ───────
  const { seeds, colT } = useMemo(() => {
    const rng = mulberry32(0x51ade);
    const seeds = new Float32Array(N);
    const colT = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      seeds[k] = rng();
      // Mostly random, with a gentle index sweep underneath.
      //
      // A pure `k / N` sweep tied the palette to CONSTRUCTION ORDER, and the
      // formations are all built by walking k: the fingerprint's ridges, the
      // atom's three orbits, the ring bands. So each of those shapes came out
      // striped in rainbow bands that tracked the loop rather than the form.
      // Keeping a third of the sweep preserves a soft overall gradient across
      // the cloud without painting the algorithm onto the sculpture.
      colT[k] = 0.35 * (k / N) + 0.65 * rng();
    }
    return { seeds, colT };
  }, [N]);

  // ── Geometry: `position` is the FROM buffer, `aTo` is the TO buffer.
  //    We swap their contents only when crossing a segment boundary. ──
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const from = forms[0].slice();
    const to = forms[1].slice();
    g.setAttribute("position", new THREE.BufferAttribute(from, 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aColT", new THREE.BufferAttribute(colT, 1));
    return g;
  }, [forms, seeds, colT]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBlend: { value: 0 },
          uReveal: { value: 0 },
          uDrift: { value: 0.06 },
          uArc: { value: 0.16 },
          uShock: { value: 0 },
          uShockR: { value: 0 },
          uPointer: { value: new THREE.Vector3(0, 0, 999) },
          uPush: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: quality === "high" ? 0.8 : 1.1 },
          uOpacity: { value: FIELD_OPACITY },
          uColorA: { value: new THREE.Color("#6f7c8c") },
          uColorB: { value: new THREE.Color(sections[0].accent) },
          uColorHot: { value: new THREE.Color("#e8eefb") },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [quality]
  );

  // Chapter accents, precomputed as THREE colours for cheap damping.
  const accents = useMemo(() => sections.map((s) => new THREE.Color(s.accent)), []);
  // Scratch colour for the projects-gallery dye (no per-frame allocation).
  const overrideColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const F = forms.length;

  useFrame((state, dt) => {
    const { story, storyN, velocity, sectionIndex, pointer, warp } = experience.getState();
    const u = material.uniforms;

    // Read every frame, not once: AdaptiveDpr changes the renderer's pixel
    // ratio at runtime, and gl_PointSize is measured in device pixels.
    u.uPixelRatio.value = state.gl.getPixelRatio();

    // Cast the cursor through the camera onto the plane through the field's
    // centre that faces the camera, so the repulsion lands where the eye
    // says the cursor is at any camera angle. Mouse only.
    if (interactive) {
      const cam = state.camera;
      rayDir.current.set(pointer.x, pointer.y, 0.5).unproject(cam).sub(cam.position).normalize();
      // Plane: passes through the origin (the field's centre), normal =
      // the camera's forward axis. Robust for every shot in the journey,
      // unlike a hard-coded z = 0 plane.
      camFwd.current.set(0, 0, -1).applyQuaternion(cam.quaternion);
      const denom = rayDir.current.dot(camFwd.current);
      if (Math.abs(denom) > 1e-4) {
        const tHit = -cam.position.dot(camFwd.current) / denom;
        if (tHit > 0 && tHit < 120) {
          pointerWorld.current.copy(cam.position).addScaledVector(rayDir.current, tHit);
        }
      }
      // Chase, don't snap — the wake trails the cursor like a real fluid.
      u.uPointer.value.lerp(pointerWorld.current, Math.min(1, dt * 7));
      damp(u.uPush, "value", 1, 0.5, dt);
    } else if (u.uPush.value > 0.001) {
      // Release smoothly so particles settle back instead of freezing in a
      // pushed-open pose if interaction ever turns off.
      damp(u.uPush, "value", 0, 0.4, dt);
    }

    // Story position IS the formation position: one shape per chapter, so
    // chapter k holds shape k and the morph happens in the travel between
    // them. `story` already runs 0 … sections.length with the page's foot as
    // the last stop, which is exactly the finale's slot.
    const g = Math.min(F - 1 - 1e-4, Math.max(0, story));
    const seg = Math.floor(g);
    const f = g - seg;

    // Only touch the big buffers when we actually cross a boundary (rare).
    if (seg !== lastSeg.current) {
      const pos = geometry.attributes.position;
      const to = geometry.attributes.aTo;
      pos.array.set(forms[seg]);
      to.array.set(forms[Math.min(seg + 1, F - 1)]);
      pos.needsUpdate = true;
      to.needsUpdate = true;
      lastSeg.current = seg;
    }

    // Ease the blend so each hand-off eases in/out rather than tracking
    // scroll linearly — reads as a deliberate transformation.
    u.uBlend.value = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;

    u.uTime.value = state.clock.elapsedTime;

    // Chapter presence — lerped between neighbours so it breathes across a
    // chapter boundary instead of stepping.
    const pi = Math.min(FIELD_PRESENCE.length - 1, Math.max(0, story));
    const p0 = Math.floor(pi);
    const p1 = Math.min(FIELD_PRESENCE.length - 1, p0 + 1);
    const presence = FIELD_PRESENCE[p0] + (FIELD_PRESENCE[p1] - FIELD_PRESENCE[p0]) * (pi - p0);
    damp(u.uOpacity, "value", FIELD_OPACITY * presence, 0.5, dt);

    // Fast scrolling energises the whole field (turbulence + a size lift);
    // a warp arrival electrifies it for a beat as the new shot lands.
    const turb = Math.min(Math.abs(velocity) * 10, 1);
    damp(u.uDrift, "value", 0.06 + turb * 0.55 + warp * 0.85, 0.2, dt);

    // Intro reveal — synced to the world's first painted frame.
    const ready = experience.getState().ready;
    damp(u.uReveal, "value", ready ? 1 : 0, 0.9, dt);

    // Shockwave lifecycle — MorphField is the single owner: the orb click
    // sets shock=1, we expand the ring and decay the strength to nothing.
    const shock = experience.getState().shock;
    if (shock > 0.001) {
      // A pulse is "fresh" either when none was running, or when something
      // re-armed the store while the previous one was still decaying. Without
      // the second test a second click mid-decay only re-raised the amplitude
      // of a ring that had already expanded past the cloud — so hammering the
      // button felt completely dead after the first press.
      const fresh = lastShock.current <= 0.001 || shock > lastShock.current + 0.01;
      if (fresh) shockR.current = 0;
      shockR.current += dt * 9;
      u.uShock.value = shock;
      u.uShockR.value = shockR.current;
      experience.getState().setShock(shock * Math.exp(-1.5 * dt));
    } else if (u.uShock.value !== 0) {
      u.uShock.value = 0;
    }
    lastShock.current = shock;

    // Colour drifts toward the active chapter's accent — the field is dyed
    // by wherever you are in the story. Inside the projects gallery the
    // active project's brand colour takes over, so each project re-dyes
    // the constellation around its own identity.
    const { accentOverride } = experience.getState();
    const dye = accentOverride
      ? overrideColor.set(accentOverride)
      : accents[Math.min(sectionIndex, accents.length - 1)];
    dampC(u.uColorB.value, dye, 0.6, dt);

    // Slow signature rotation + a scroll-linked yaw so traversal feels like
    // orbiting a living object. Readable formations (the atom, the initials)
    // square up: while one holds the stage the yaw eases to its nearest
    // symmetric orientation, then releases as you scroll off it.
    if (group.current) {
      // Anchored to scroll (plus a small bounded breath) rather than
      // accumulating with time, so returning to the top always re-composes
      // the identical hero shot instead of a drifted one.
      let ry = storyN * Math.PI * 0.55 + Math.sin(state.clock.elapsedTime * 0.16) * 0.06;
      const near = Math.round(g);
      const sym = FACE_SYMMETRY[near];
      if (sym) {
        const settle = 1 - Math.min(1, Math.abs(g - near) * 2.2);
        if (settle > 0) {
          // Square up to where the camera actually is (its azimuth around
          // the origin), not to a fixed axis — the About shot views from
          // the side, and the portrait must meet its gaze.
          const cam = state.camera.position;
          const az = Math.atan2(cam.x, cam.z);
          const w = settle * settle * (3 - 2 * settle);
          const rel = ry - az;
          const wrapped = ((rel % sym) + sym) % sym;
          const delta = wrapped > sym / 2 ? wrapped - sym : wrapped;
          ry -= delta * w;
        }
      }
      // ── Saturn mode (hero) ──────────────────────────────────────────
      // While the rings hold the stage they revolve continuously about
      // their own axis at a fixed planetary tilt. A ring is rotationally
      // symmetric, so this reads as real orbital motion yet composes
      // IDENTICALLY every time you return to the top. As the rings morph
      // away it cross-fades back to the anchored yaw + facing logic.
      const ringMix = 1 - Math.min(1, Math.max(0, g / 0.85));
      const rm = ringMix * ringMix * (3 - 2 * ringMix);
      const orbit = state.clock.elapsedTime * 0.14;

      group.current.rotation.order = "YXZ"; // spin in-plane, then tilt
      group.current.rotation.y = orbit * rm + ry * (1 - rm);
      group.current.rotation.x = RING_TILT * rm + Math.sin(storyN * Math.PI) * 0.15 * (1 - rm);
      group.current.rotation.z = RING_ROLL * rm;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
