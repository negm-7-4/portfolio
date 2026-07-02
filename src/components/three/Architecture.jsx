import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";

/* eslint-disable react/no-unknown-property */

/* ──────────────────────────────────────────────────────────────────────
   ARCHITECTURE — the world's built environment.

   Two layers that give the void a sense of *place* without stealing focus
   from the core / morph field:

   • GlassMonoliths — thin floating slabs at the periphery. On high tier
     they're true transmissive glass (refracting the lightformers + the
     scene behind); mid tier swaps to a cheap translucent standard material
     that reads the same at a glance. Each slab drifts vertically with
     scroll at its own rate, so traversing the page parallaxes the
     architecture past the camera like passing buildings.

   • LightShafts — fake volumetrics: additive gradient planes leaning out
     of the key light's corner. Two on high, one on mid. Their intensity
     dims through the text-heavy middle of the page (same grammar as
     SectionAccent) so copy always wins.

   Everything here is a handful of draw calls; no per-frame allocations.
   ─────────────────────────────────────────────────────────────────────── */

// `glass: true` marks the slabs close enough to the camera path for real
// refraction to read. Only those get the transmissive material (three.js
// renders an extra transmission pass per frame — worth it exactly twice).
const SLABS = [
  { pos: [-6.4, 2.6, -4.5], size: [1.6, 3.4, 0.12], spin: 0.1, phase: 0.0, rise: 1.7, glass: true },
  { pos: [6.8, -1.2, -6.0], size: [1.3, 2.8, 0.12], spin: -0.08, phase: 1.9, rise: -1.3 },
  { pos: [-5.2, -3.2, -2.5], size: [1.1, 2.2, 0.1], spin: 0.13, phase: 3.7, rise: 1.0, glass: true },
  { pos: [7.4, 3.2, -8.5], size: [2.0, 4.2, 0.14], spin: -0.06, phase: 5.1, rise: -2.0 },
];

const RINGS = [
  { pos: [-8.5, 0.6, -10.5], r: 2.6, tube: 0.05, spin: 0.05, tilt: 0.6 },
  { pos: [8.8, -2.6, -11.5], r: 3.4, tube: 0.06, spin: -0.04, tilt: -0.45 },
];

function GlassMonoliths({ quality }) {
  const refs = useRef([]);
  const slabs = quality === "high" ? SLABS : SLABS.slice(0, 3);

  useFrame((state, dt) => {
    const { scroll } = experience.getState();
    const t = state.clock.elapsedTime;
    for (let i = 0; i < slabs.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const s = slabs[i];
      m.rotation.y += dt * s.spin;
      m.rotation.x = Math.sin(t * 0.22 + s.phase) * 0.14;
      // Scroll parallax + an always-alive float, each slab on its own beat.
      m.position.y = s.pos[1] + scroll * s.rise + Math.sin(t * 0.5 + s.phase) * 0.22;
    }
  });

  return (
    <group>
      {slabs.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={s.pos}
          rotation={[0, i * 1.3, 0.08]}
        >
          <boxGeometry args={s.size} />
          {quality === "high" && s.glass ? (
            <meshPhysicalMaterial
              color="#c7d2e2"
              metalness={0}
              roughness={0.12}
              transmission={0.92}
              thickness={0.5}
              ior={1.45}
              envMapIntensity={1.6}
              clearcoat={1}
              clearcoatRoughness={0.15}
            />
          ) : (
            <meshStandardMaterial
              color="#aab8cc"
              metalness={0.1}
              roughness={0.14}
              envMapIntensity={1.8}
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}

function MetalRings() {
  const refs = useRef([]);

  useFrame((_, dt) => {
    for (let i = 0; i < RINGS.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      m.rotation.z += dt * RINGS[i].spin;
    }
  });

  return (
    <group>
      {RINGS.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={r.pos}
          rotation={[r.tilt, 0.3, 0]}
        >
          <torusGeometry args={[r.r, r.tube, 12, 96]} />
          <meshStandardMaterial
            color="#0d1420"
            metalness={1}
            roughness={0.3}
            envMapIntensity={1.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Fake volumetric shafts — additive gradient planes from the key light. ── */
const SHAFT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHAFT_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    // Soft across the beam, bright at the source (top), fading to nothing.
    float across = sin(vUv.x * 3.14159);
    float along  = smoothstep(0.0, 0.85, vUv.y) * (1.0 - smoothstep(0.9, 1.0, vUv.y));
    float a = across * across * along * uOpacity;
    gl_FragColor = vec4(uColor, a);

    #include <colorspace_fragment>
  }
`;

const SHAFTS = [
  { pos: [-4.6, 3.4, -5.5], rotZ: 0.5, w: 2.6, h: 13, color: "#5a7cff", base: 0.1 },
  { pos: [3.8, 4.0, -7.0], rotZ: -0.38, w: 2.0, h: 12, color: "#aab4c4", base: 0.07 },
];

function LightShafts({ quality }) {
  const shafts = quality === "high" ? SHAFTS : SHAFTS.slice(0, 1);

  const materials = useMemo(
    () =>
      shafts.map(
        (s) =>
          new THREE.ShaderMaterial({
            uniforms: {
              uColor: { value: new THREE.Color(s.color) },
              uOpacity: { value: 0 },
            },
            vertexShader: SHAFT_VERT,
            fragmentShader: SHAFT_FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quality]
  );

  useEffect(() => {
    return () => materials.forEach((m) => m.dispose());
  }, [materials]);

  useFrame((_, dt) => {
    const { scroll } = experience.getState();
    // Full presence on the hero / contact beats, dimmed through the middle
    // so the shafts never fight the copy.
    const presence = 1 - Math.sin(scroll * Math.PI) * 0.65;
    for (let i = 0; i < materials.length; i++) {
      damp(materials[i].uniforms.uOpacity, "value", shafts[i].base * presence, 0.5, dt);
    }
  });

  return (
    <group>
      {shafts.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[0, 0, s.rotZ]} material={materials[i]}>
          <planeGeometry args={[s.w, s.h]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Architecture({ quality = "high" }) {
  return (
    <group>
      <GlassMonoliths quality={quality} />
      <MetalRings />
      <LightShafts quality={quality} />
    </group>
  );
}
