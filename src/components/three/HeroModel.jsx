import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";

/* eslint-disable react/no-unknown-property */

const BASE_Y = 0;

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Deterministic RNG — the shard constellation must be identical every visit.
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

/* ──────────────────────────────────────────────────────────────────────
   THE PRISM CORE — the hero centrepiece, and it is *ours*.

   Replaces the stock three.js RobotExpressive GLB (which any senior
   reviewer recognises on sight) with a fully procedural signature
   sculpture: a dark faceted gem with a light burning inside it, the glow
   breathing through the facets via the site's hand-written fresnel shell,
   two counter-rotating shard orbits, and a fine polished halo.

   Zero download, zero loader, zero GLTF runtime — the 464 KB robot asset
   simply never ships. Same stage directions as before: star of the hero
   beat, hover-reactive, pointer parallax, scales away as the story moves
   on. High tier only (mid keeps the full-size procedural core).
   ─────────────────────────────────────────────────────────────────────── */

function makeShards(count, radius, seed) {
  const rng = mulberry32(seed);
  const shards = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rng() * 0.5;
    shards.push({
      pos: [
        Math.cos(a) * (radius + (rng() - 0.5) * 0.22),
        (rng() - 0.5) * 0.5,
        Math.sin(a) * (radius + (rng() - 0.5) * 0.22),
      ],
      rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
      scale: 0.06 + rng() * 0.08,
    });
  }
  return shards;
}

export default function HeroModel() {
  const group = useRef(null);
  const shell = useRef(null);
  const light = useRef(null);
  const heart = useRef(null);
  const orbitA = useRef(null);
  const orbitB = useRef(null);

  const shardsA = useMemo(() => makeShards(8, 1.62, 0xa11ce), []);
  const shardsB = useMemo(() => makeShards(6, 1.98, 0xbee5), []);
  // Birth choreography progress — 0 until the world's first frame, then
  // climbs to 1 while the shards pop into orbit one after another.
  const reveal = useRef(0);

  // One geometry + one material for every shard — 14 meshes, 1 of each.
  const shardGeo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const shardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#131b28",
        metalness: 1,
        roughness: 0.24,
        envMapIntensity: 1.5,
        flatShading: true,
      }),
    []
  );
  useEffect(() => {
    return () => {
      shardGeo.dispose();
      shardMat.dispose();
    };
  }, [shardGeo, shardMat]);

  useFrame((state, dt) => {
    const { scroll, pointer, hovered } = experience.getState();
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    // Star of the hero beat only; scales away into the body of the story.
    const w = 1 - smoothstep(0.03, 0.18, scroll);
    const cur = g.scale.x;
    g.scale.setScalar(cur + (w - cur) * Math.min(1, dt * 3));

    // Slow signature turn (faster on hover) + pointer parallax that always
    // settles back level.
    const spin = hovered ? 0.45 : 0.15;
    g.rotation.y += dt * spin;
    g.rotation.x += (pointer.y * 0.12 - g.rotation.x) * Math.min(1, dt * 3);
    g.rotation.z += (pointer.x * 0.07 - g.rotation.z) * Math.min(1, dt * 3);
    g.position.y = BASE_Y + Math.sin(t * 0.8) * 0.1;

    // Counter-rotating orbits — hover energises the whole system.
    if (orbitA.current) orbitA.current.rotation.y += dt * (hovered ? 0.85 : 0.32);
    if (orbitB.current) orbitB.current.rotation.y -= dt * (hovered ? 0.65 : 0.26);

    // Birth choreography: once the world is ready the shards pop into
    // their orbits one after another with a back-out overshoot — the
    // system assembles itself in front of the visitor.
    const ready = experience.getState().ready;
    reveal.current = Math.min(1, reveal.current + (ready ? dt * 0.5 : 0));
    const spawn = (orbit, data, offset) => {
      if (!orbit) return;
      const kids = orbit.children;
      for (let i = 0; i < kids.length; i++) {
        const r = Math.min(1, Math.max(0, reveal.current * 2.4 - (i + offset) * 0.16));
        const e = r - 1;
        const back = 1 + 2.70158 * e * e * e + 1.70158 * e * e; // back.out
        kids[i].scale.setScalar(data[i].scale * Math.max(0.0001, back));
        kids[i].rotation.x += dt * 0.35;
        kids[i].rotation.y += dt * 0.28;
      }
    };
    spawn(orbitA.current, shardsA, 0);
    spawn(orbitB.current, shardsB, 8);

    // The light inside beats like a slow heart; hover feeds it.
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.7);
    if (light.current) {
      const target = (hovered ? 9 : 4.5) + pulse * 2.2;
      light.current.intensity += (target - light.current.intensity) * Math.min(1, dt * 4);
    }
    if (heart.current) {
      heart.current.scale.setScalar(0.3 + pulse * 0.045 + (hovered ? 0.05 : 0));
    }

    // Fresnel shell breathes with the heart and flares on hover.
    if (shell.current) {
      shell.current.uTime = t;
      damp(shell.current, "uOpacity", (hovered ? 1.05 : 0.7) + pulse * 0.15, 0.3, dt);
      damp(shell.current, "uScrollPulse", hovered ? 0.5 : 0.12, 0.35, dt);
    }
  });

  return (
    <group ref={group} scale={0.001} position={[0.3, BASE_Y, 2.3]}>
      {/* The gem — dark faceted metal, crisp flat-shaded facets. */}
      <mesh>
        <icosahedronGeometry args={[1.02, 0]} />
        <meshStandardMaterial
          color="#0e141d"
          metalness={1}
          roughness={0.16}
          envMapIntensity={1.7}
          flatShading
        />
      </mesh>

      {/* The heart — a small burning star; bloom does the rest. */}
      <mesh ref={heart} scale={0.3}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#dfe8f8" toneMapped={false} />
      </mesh>
      <pointLight ref={light} color="#8fb0ff" intensity={5} distance={9} />

      {/* Energy shell — the site's hand-written fresnel GLSL. */}
      <mesh scale={1.14}>
        <icosahedronGeometry args={[1.02, 3]} />
        <fresnelMaterial
          ref={shell}
          transparent
          depthWrite={false}
          uFresnelPower={2.6}
          uDisplace={0.05}
          uFreq={2.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Fine polished halo, tilted like a ring system. */}
      <mesh rotation={[Math.PI / 2.15, 0, 0.22]}>
        <torusGeometry args={[1.82, 0.012, 8, 96]} />
        <meshStandardMaterial
          color="#141b27"
          metalness={1}
          roughness={0.32}
          envMapIntensity={1.25}
        />
      </mesh>

      {/* Two counter-rotating shard orbits. */}
      <group ref={orbitA} rotation={[0.5, 0, 0.3]}>
        {shardsA.map((s, i) => (
          <mesh
            key={i}
            geometry={shardGeo}
            material={shardMat}
            position={s.pos}
            rotation={s.rot}
            scale={s.scale}
          />
        ))}
      </group>
      <group ref={orbitB} rotation={[-0.42, 0.8, -0.24]}>
        {shardsB.map((s, i) => (
          <mesh
            key={i}
            geometry={shardGeo}
            material={shardMat}
            position={s.pos}
            rotation={s.rot}
            scale={s.scale}
          />
        ))}
      </group>
    </group>
  );
}
