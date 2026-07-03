import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp, dampC } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";
import { sections } from "../../data/sections";

/* eslint-disable react/no-unknown-property */

/* ──────────────────────────────────────────────────────────────────────
   NEBULA — the world's deep-space atmosphere.

   One large additive plane far behind everything (z = -40, inside the fog's
   falloff but in front of the star sphere), running a two-layer FBM that
   drifts extremely slowly, so the void behind the sculpture reads as a
   living gas cloud instead of flat black.

   It participates in the story like everything else:
     • its accent hue is dyed by the active chapter (and by the active
       project's brand colour inside the gallery),
     • it breathes with the journey — strongest at the hero and the contact
       finale, calmest through the text-heavy middle,
     • a warp arrival (anchor navigation) flashes it briefly brighter.

   Cost: a single quad; the only real work is fragment FBM, which drops an
   octave on mid tier. No per-frame allocations.
   ─────────────────────────────────────────────────────────────────────── */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uColorDeep;
  uniform vec3  uColorAccent;
  uniform vec3  uColorHot;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 q = vUv * vec2(3.0, 1.6);
    float t = uTime * 0.018;

    // Two FBM layers, the second warped by the first → curling gas.
    float n1 = fbm(q + vec2(t, -t * 0.6));
    float n2 = fbm(q * 1.7 - vec2(t * 0.8, t * 0.4) + n1 * 1.25);
    float neb = smoothstep(0.32, 0.95, n1 * 0.62 + n2 * 0.55);

    vec3 col = mix(uColorDeep, uColorAccent, smoothstep(0.25, 1.0, n2));
    col += uColorHot * pow(neb, 3.0) * 0.35;

    // Soft oval mask so the quad's edges never read as edges.
    vec2 c = vUv - 0.5;
    float mask = 1.0 - smoothstep(0.26, 0.5, length(c * vec2(1.1, 1.55)));

    gl_FragColor = vec4(col, neb * mask * uOpacity);

    #include <colorspace_fragment>
  }
`;

export default function Nebula({ quality = "high" }) {
  const mesh = useRef(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uColorDeep: { value: new THREE.Color("#101a30") },
          uColorAccent: { value: new THREE.Color(sections[0].accent).multiplyScalar(0.55) },
          uColorHot: { value: new THREE.Color("#8fb1ff") },
        },
        vertexShader: VERT,
        fragmentShader: FRAG.replace(/OCTAVES/g, quality === "high" ? "4" : "3"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [quality]
  );

  // Scratch colour — dye target without per-frame allocation.
  const dyeColor = useMemo(() => new THREE.Color(), []);
  const accents = useMemo(() => sections.map((s) => new THREE.Color(s.accent)), []);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame((state, dt) => {
    const { scroll, sectionIndex, accentOverride, warp } = experience.getState();
    const u = material.uniforms;

    u.uTime.value = state.clock.elapsedTime;

    // Breathes with the journey (strong hero/finale, calm middle);
    // a warp arrival flashes it briefly brighter.
    const presence = 0.15 + (1 - Math.sin(scroll * Math.PI)) * 0.09;
    damp(u.uOpacity, "value", presence + warp * 0.28, 0.45, dt);

    // Same dye grammar as the morph field / accent light.
    if (accentOverride) dyeColor.set(accentOverride);
    else dyeColor.copy(accents[Math.min(sectionIndex, accents.length - 1)]);
    dyeColor.multiplyScalar(0.55);
    dampC(u.uColorAccent.value, dyeColor, 0.8, dt);

    // The cloud slowly slides past as the page travels — one more parallax
    // layer between the stars and the architecture.
    if (mesh.current) {
      mesh.current.position.x = -scroll * 9;
      mesh.current.rotation.z = scroll * 0.06;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 5, -40]} material={material}>
      <planeGeometry args={[160, 72]} />
    </mesh>
  );
}
