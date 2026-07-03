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
            0.2  About     → TORUS    (it opens, starts to breathe)
            0.4  Skills    → HELIX    (structured, systematic)
            0.6  Journey   → WAVE     (a drifting landscape)
            0.8  Projects  → SCATTER  (a wide constellation — centre left open)
            1.0  Contact   → SPHERE'  (re-gathers into a tight luminous core)

   Every particle keeps its identity across formations, so a scroll reads as
   thousands of points travelling coherent arcs — not a cut. Colour drifts
   toward the active chapter's accent; scroll velocity adds turbulence; the
   cloud explodes in from nothing on the intro, synced to the preloader lift.
   ─────────────────────────────────────────────────────────────────────── */

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // golden angle

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

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uBlend;
  uniform float uReveal;
  uniform float uDrift;
  uniform float uSize;
  uniform vec3  uPointer; // cursor projected onto the field's plane (world)
  uniform float uPush;    // pointer interaction strength (0 on touch tiers)

  attribute vec3  aTo;
  attribute float aSeed;
  attribute float aColT;

  varying float vColT;
  varying float vTw;
  varying float vPinf;

  void main() {
    vColT = aColT;
    float ph = aSeed * 6.28318;

    // Core morph: every particle lerps from its current shape to the next.
    vec3 pos = mix(position, aTo, uBlend);

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

    vec4 mv = viewMatrix * wp;

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
    formHelix(f2, N, 1.7, 7.2, 5); // skills — structured
    const f3 = mk();
    formWave(f3, N, 11, 1.3); // journey — landscape
    const f4 = mk();
    formScatter(f4, N, 3.8, 7.6, 0.72, rng); // projects — wide constellation
    const f5 = mk();
    formSphere(f5, N, 2.1); // contact — re-gather, tight

    return [f0, f1, f2, f3, f4, f5];
  }, [N]);

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
    // orbiting a living object.
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.035 + scroll * Math.PI * 0.55;
      group.current.rotation.x = Math.sin(scroll * Math.PI) * 0.15;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
