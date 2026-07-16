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
   rebuilds itself around the story:

     scroll 0.0  Hero      → SPHERE   (a coherent core — the identity)
            0.2  About     → PORTRAIT (the real photo, sampled into light)
            0.4  Skills    → ATOM     (the React mark — three orbits + nucleus)
            0.6  Journey   → WAVE     (a drifting landscape)
            0.8  Projects  → SCATTER  (a wide constellation — centre left open)
            1.0  Contact   → "MN"     (the initials assemble — the signature)

   The portrait decodes the actual photo asynchronously; a torus holds the
   slot until it lands (always within the hero beat), then the buffers are
   hot-swapped.

   Every particle keeps its identity across formations and travels a seeded
   ARC with its own departure window (swarm, not tween). The atom and the
   initials are "readable" shapes, so the field's yaw squares up to the
   camera while they hold the stage and releases as you move off. Colour
   drifts toward the active chapter's accent; scroll velocity adds
   turbulence; the cloud explodes in from nothing on the intro.
   ─────────────────────────────────────────────────────────────────────── */

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // golden angle

/* Formations that must read head-on → their rotational symmetry period.
   The yaw snaps to the nearest multiple while they hold the stage, so the
   correction is always the shortest possible move. */
const FACE_SYMMETRY = { 1: TAU, 2: Math.PI / 3, 5: TAU }; // portrait · atom (60°) · "MN"

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

/* ── Formation generators. Each fills `out` (Float32Array, N*3) in place and
      uses the SAME particle index `k` as its through-line, so point k in one
      shape maps to point k in the next → coherent, readable morphs. ── */
function formSphere(out, N, R) {
  for (let k = 0; k < N; k++) {
    const t = N > 1 ? k / (N - 1) : 0;
    const y = 1 - 2 * t;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = k * GOLDEN;
    out[k * 3] = Math.cos(phi) * r * R;
    out[k * 3 + 1] = y * R;
    out[k * 3 + 2] = Math.sin(phi) * r * R;
  }
}

function formTorus(out, N, R, r) {
  for (let k = 0; k < N; k++) {
    const u = k / N;
    const a = u * TAU * 6 + k * GOLDEN * 0.15; // major sweep (coiled)
    const b = u * TAU * 23; // minor sweep (incommensurate → fills the surface)
    const rr = R + r * Math.cos(b);
    out[k * 3] = Math.cos(a) * rr;
    out[k * 3 + 1] = r * Math.sin(b);
    out[k * 3 + 2] = Math.sin(a) * rr;
  }
}

function formHelix(out, N, radius, height, turns) {
  for (let k = 0; k < N; k++) {
    const u = k / N;
    const strand = k % 2 === 0 ? 0 : Math.PI; // double helix
    const a = u * turns * TAU;
    const wobble = 0.12 * Math.sin(a * 3.0);
    out[k * 3] = Math.cos(a + strand) * (radius + wobble);
    out[k * 3 + 1] = (u - 0.5) * height;
    out[k * 3 + 2] = Math.sin(a + strand) * (radius + wobble);
  }
}

function formWave(out, N, span, amp) {
  const side = Math.max(1, Math.floor(Math.sqrt(N)));
  for (let k = 0; k < N; k++) {
    const col = k % side;
    const row = Math.floor(k / side);
    const x = (col / side - 0.5) * span;
    const z = (row / side - 0.5) * span;
    out[k * 3] = x;
    out[k * 3 + 1] = Math.sin(x * 0.9) * Math.cos(z * 0.9) * amp;
    out[k * 3 + 2] = z;
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

/* Rasterise text to an offscreen canvas and sample the letterforms — the
   particles literally assemble the initials. Deterministic (seeded rng),
   with a sphere fallback if the canvas is unavailable for any reason. */
function formText(out, N, text, height, zCenter, rng) {
  try {
    const W = 360;
    const H = 160;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = "900 132px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, H / 2 + 8);

    const img = ctx.getImageData(0, 0, W, H).data;
    const px = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (img[(y * W + x) * 4] > 120) px.push(x, y);
      }
    }
    if (px.length < 200) throw new Error("text sample too sparse");

    const count = px.length / 2;
    const scale = height / H;
    for (let k = 0; k < N; k++) {
      const p = Math.floor(rng() * count);
      out[k * 3] = (px[p * 2] - W / 2) * scale + (rng() - 0.5) * 0.05;
      out[k * 3 + 1] = (H / 2 - px[p * 2 + 1]) * scale + (rng() - 0.5) * 0.05;
      out[k * 3 + 2] = zCenter + (rng() - 0.5) * 0.5;
    }
  } catch {
    formSphere(out, N, 2.1); // never break the journey over a canvas quirk
  }
}

/* Sample the real portrait photo into a particle formation. The shot is a
   bright subject on a dark backdrop (measured: face ~90, corners ~20), so a
   luminance-weighted CDF pulls every point onto the person; a bottom
   falloff keeps the bright shirt from out-voting the face. Brightness also
   drives a z relief — the face literally comes forward. Async (image
   decode) → resolves null on any failure and the torus keeps the slot. */
function buildPortrait(url, N, width, zCenter, seed) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const W = 132;
        const H = Math.max(1, Math.round((img.height / img.width) * W));
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0, W, H);
        const d = ctx.getImageData(0, 0, W, H).data;

        const lumAt = (i4) =>
          (0.299 * d[i4] + 0.587 * d[i4 + 1] + 0.114 * d[i4 + 2]) / 255;

        const cdf = new Float32Array(W * H);
        let acc = 0;
        for (let y = 0; y < H; y++) {
          const v = y / H;
          const fall = v > 0.72 ? 1 - ((v - 0.72) / 0.28) * 0.65 : 1;
          for (let x = 0; x < W; x++) {
            acc += Math.pow(lumAt((y * W + x) * 4), 1.8) * fall;
            cdf[y * W + x] = acc;
          }
        }
        if (acc < 1) throw new Error("frame too dark to sample");

        const rng = mulberry32(seed);
        const out = new Float32Array(N * 3);
        const scale = width / W;
        for (let k = 0; k < N; k++) {
          const target = rng() * acc;
          let lo = 0;
          let hi = cdf.length - 1;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cdf[mid] < target) lo = mid + 1;
            else hi = mid;
          }
          const x = lo % W;
          const y = (lo / W) | 0;
          const lum = lumAt((y * W + x) * 4);
          out[k * 3] = (x - W / 2 + rng()) * scale;
          out[k * 3 + 1] = (H / 2 - y + rng()) * scale;
          // Relief: bright features float toward the camera.
          out[k * 3 + 2] = zCenter + (lum - 0.35) * 1.4 + (rng() - 0.5) * 0.12;
        }
        resolve(out);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uBlend;
  uniform float uReveal;
  uniform float uDrift;
  uniform float uSize;
  uniform float uArc;     // swarm arc strength (how far particles bow out)
  uniform float uShock;   // radial pulse strength (0..1, JS owns the decay)
  uniform float uShockR;  // the pulse ring's current radius (world units)
  uniform vec3  uPointer; // cursor projected onto the field's plane (world)
  uniform float uPush;    // pointer interaction strength (0 on touch tiers)

  attribute vec3  aTo;
  attribute float aSeed;
  attribute float aColT;

  varying float vColT;
  varying float vTw;
  varying float vPinf;
  varying float vDepth;

  void main() {
    vColT = aColT;
    float ph = aSeed * 6.28318;

    // Staggered departure: each particle's blend window is offset by its
    // seed, so the shape FLOCKS into place — a swarm, never a tween.
    float b = clamp(uBlend * 1.35 - aSeed * 0.35, 0.0, 1.0);
    b = b * b * (3.0 - 2.0 * b);
    vec3 pos = mix(position, aTo, b);

    // Arc travel: every particle bows out along its own seeded direction,
    // scaled by how far it has to fly. Straight lines read mechanical;
    // arcs read alive. Zero when settled (sin(0)=sin(π)=0).
    float travel = length(aTo - position);
    vec3 arcDir = normalize(vec3(sin(ph), cos(ph * 1.31), sin(ph * 0.73)) + 0.0001);
    pos += arcDir * sin(b * 3.14159) * travel * uArc * (0.3 + 0.7 * aSeed);

    // Always-alive drift so a settled formation still shimmers.
    vec3 drift = vec3(
      sin(uTime * 0.5  + ph),
      cos(uTime * 0.45 + ph * 1.3),
      sin(uTime * 0.6  + ph * 0.7)
    );
    pos += drift * uDrift;

    // Intro: explode in from a diffuse cloud as the preloader lifts.
    float ex = 1.0 - clamp(uReveal, 0.0, 1.0);
    pos += normalize(pos + 0.0001) * ex * (6.0 + aSeed * 6.0);

    // Pointer field: particles part around the cursor like disturbed water —
    // computed in WORLD space so it stays honest while the group rotates.
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vec3 toP = wp.xyz - uPointer;
    float pd = length(toP);
    vPinf = smoothstep(2.6, 0.0, pd) * uPush;
    wp.xyz += normalize(toP + 0.0001) * vPinf * 1.5;

    // Shockwave: an expanding spherical ring from the core that throws
    // particles outward and heats them as it passes through.
    float ringD = length(wp.xyz) - uShockR;
    float shockInf = exp(-ringD * ringD * 1.6) * uShock;
    wp.xyz += normalize(wp.xyz + 0.0001) * shockInf * 1.1;
    vPinf = max(vPinf, shockInf);

    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;

    vTw = 0.55 + 0.45 * sin(uTime * 2.0 + ph * 3.0);
    float s = uSize * (0.45 + aSeed) * vTw * (1.0 + vPinf * 1.1);
    gl_PointSize = clamp(s * (220.0 / -mv.z), 1.0, 64.0);

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

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);

    vec3 col = mix(uColorA, uColorB, vColT);
    col += uColorHot * core * 0.8;
    // Particles near the cursor heat toward white — the wake reads as energy.
    col = mix(col, uColorHot, vPinf * 0.6);
    // Depth grade — near particles run hot, far ones cool off and recede.
    // Gives the flat additive cloud a real sense of volume.
    float dn = smoothstep(6.0, 22.0, vDepth);
    col = mix(col * 1.18 + uColorHot * 0.05, col * 0.55, dn);

    float alpha = glow * glow * uOpacity * (0.35 + 0.65 * vTw) * clamp(uReveal, 0.0, 1.0);
    alpha *= 1.0 + vPinf * 0.5;
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
  // Shockwave state (this component owns the pulse's lifecycle).
  const shockR = useRef(0);
  const lastShock = useRef(0);

  const N = quality === "high" ? 7000 : 3600;

  // ── Precompute every formation once (deterministic). ──────────────
  const forms = useMemo(() => {
    const mk = () => new Float32Array(N * 3);
    const rng = mulberry32(0xc0ffee);

    const f0 = mk();
    formSphere(f0, N, 2.2); // hero — coherent core (tight, so the mech reads)
    const f1 = mk();
    formTorus(f1, N, 3.0, 0.85); // about — opens
    const f2 = mk();
    formAtom(f2, N, 3.1, rng); // skills — the React mark
    const f3 = mk();
    formWave(f3, N, 11, 1.3); // journey — landscape
    const f4 = mk();
    formScatter(f4, N, 3.8, 7.6, 0.72, rng); // projects — wide constellation
    const f5 = mk();
    // contact — the initials assemble in front of the core (z=2.2), the
    // luminous orb glowing through the letterforms behind them.
    formText(f5, N, "MN", 3.4, 2.2, rng);

    return [f0, f1, f2, f3, f4, f5];
  }, [N]);

  // The About slot upgrades itself: once the real photo decodes, its
  // sampled formation replaces the torus in place. Offset in front of the
  // core (like the initials) so the orb glows behind the face.
  useEffect(() => {
    let cancelled = false;
    buildPortrait("/mohamed.jpg", N, 3.9, 1.9, 0xfa11ce).then((arr) => {
      if (cancelled || !arr) return;
      forms[1].set(arr);
      // If the live buffers currently hold the About slot, force a
      // re-upload on the next frame; otherwise the next boundary crossing
      // picks the new data up for free.
      if (lastSeg.current <= 1) lastSeg.current = -1;
    });
    return () => {
      cancelled = true;
    };
  }, [forms, N]);

  // ── Static per-particle attributes: seed + colour position. ───────
  const { seeds, colT } = useMemo(() => {
    const rng = mulberry32(0x51ade);
    const seeds = new Float32Array(N);
    const colT = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      seeds[k] = rng();
      colT[k] = k / N; // sweep the palette across the cloud
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          uSize: { value: quality === "high" ? 0.8 : 1.1 },
          uOpacity: { value: 0.68 },
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
    const { scroll, velocity, sectionIndex, pointer, warp } = experience.getState();
    const u = material.uniforms;

    // Cast the cursor through the camera onto the field's plane (z = 0) so
    // the repulsion happens where the eye says the cursor is. Mouse only —
    // touch tiers keep uPush at 0 and skip all of this.
    if (interactive) {
      const cam = state.camera;
      rayDir.current
        .set(pointer.x, pointer.y, 0.5)
        .unproject(cam)
        .sub(cam.position)
        .normalize();
      const dz = rayDir.current.z;
      if (Math.abs(dz) > 1e-4) {
        const tHit = -cam.position.z / dz;
        if (tHit > 0 && tHit < 80) {
          pointerWorld.current.copy(cam.position).addScaledVector(rayDir.current, tHit);
        }
      }
      // Chase, don't snap — the wake trails the cursor like a real fluid.
      u.uPointer.value.lerp(pointerWorld.current, Math.min(1, dt * 7));
      damp(u.uPush, "value", 1, 0.5, dt);
    }

    // Global morph position across the whole page → segment + fraction.
    const g = Math.min(F - 1 - 1e-4, Math.max(0, scroll * (F - 1)));
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
      if (lastShock.current <= 0.001) shockR.current = 0; // a fresh pulse
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
      let ry = state.clock.elapsedTime * 0.035 + scroll * Math.PI * 0.55;
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
      group.current.rotation.y = ry;
      group.current.rotation.x = Math.sin(scroll * Math.PI) * 0.15;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
