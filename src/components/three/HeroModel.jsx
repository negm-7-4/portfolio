import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp } from "maath/easing";
import * as THREE from "three";

import { experience } from "../../store/experience";

/* eslint-disable react/no-unknown-property */

const BASE_Y = 0;
// The art-directed resting yaw: the angle that presents a lit facet edge-on
// to the camera. Scroll 0 always returns here, so the hero never re-composes
// itself differently between visits.
const HERO_YAW = 0.62;
// The particle rings' plane (shared with MorphField) — used by the thin rim.
const RING_TILT = 0.42;
const RING_ROLL = 0.18;
// The shard belts run POLAR — a vertical plane that crosses the rings, so
// the two orbital systems visibly intersect instead of overlapping.
const SHARD_TILT = 0.12;
const SHARD_ROLL = Math.PI / 2 - 0.16;

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

/* A belt of shards laid out as a flat orbital ring (thin in Y) so the group
   can revolve it like a planet's ring system. Spread evenly around the
   circle, jittered in radius/height so it reads as debris, not a necklace. */
function makeShards(count, radius, seed, spread = 0.3, thickness = 0.16) {
  const rng = mulberry32(seed);
  const shards = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rng() * 0.28;
    const r = radius + (rng() - 0.5) * spread;
    shards.push({
      pos: [Math.cos(a) * r, (rng() - 0.5) * thickness, Math.sin(a) * r],
      rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
      scale: 0.07 + rng() * 0.08,
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

  // Two ring bands with a gap between them — the Saturn read.
  const shardsA = useMemo(() => makeShards(16, 1.75, 0xa11ce, 0.26, 0.14), []);
  const shardsB = useMemo(() => makeShards(12, 2.35, 0xbee5, 0.3, 0.12), []);
  // Birth choreography progress — 0 until the world's first frame, then
  // climbs to 1 while the shards pop into orbit one after another.
  const reveal = useRef(0);

  // One geometry + one material for every shard — 14 meshes, 1 of each.
  const shardGeo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const shardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a3850",
        metalness: 1,
        roughness: 0.18,
        envMapIntensity: 2.0,
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

    // The geometric solid is the CONSTANT of the journey — it never scales
    // away (that hand-off used to leave a plain sphere behind, which read
    // as "the shape turned into a circle"). It only eases down a little
    // with depth; the particle formations around it carry the storytelling.
    const w = 1 - smoothstep(0.06, 0.9, scroll) * 0.3;
    const cur = g.scale.x;
    g.scale.setScalar(cur + (w - cur) * Math.min(1, dt * 3));

    // ── Orientation is ANCHORED TO SCROLL, never accumulated from time ──
    // A `+= dt * spin` turn drifts forever, so returning to the top showed a
    // different face of the gem every visit (and some faces read flat). The
    // yaw is now a pure function of scroll plus a small bounded breath, so
    // scroll 0 always composes the SAME art-directed hero shot, while
    // travelling down still turns the gem a full, deliberate quarter-turn.
    const yaw = HERO_YAW + scroll * 2.4 + Math.sin(t * 0.28) * 0.09;
    g.rotation.y += (yaw - g.rotation.y) * Math.min(1, dt * 2.6);

    // Hover leans the gem toward the viewer instead of spinning it up —
    // a bounded, reversible response rather than a speed change.
    const lean = hovered ? 0.14 : 0;
    g.rotation.x += (pointer.y * 0.12 + lean - g.rotation.x) * Math.min(1, dt * 3);
    g.rotation.z += (pointer.x * 0.07 - g.rotation.z) * Math.min(1, dt * 3);
    g.position.y = BASE_Y + Math.sin(t * 0.8) * 0.1;

    // ── The shard belts ARE the orbital motion ──────────────────────
    // They revolve continuously around the gem like a planet's rings. A
    // full belt is near rotationally symmetric, so it still composes the
    // same at any moment — motion without the drift problem. Hover speeds
    // the orbit up as the reward for reaching in.
    const orbitSpeed = hovered ? 0.42 : 0.16;
    if (orbitA.current) {
      orbitA.current.rotation.order = "YXZ"; // spin in-plane, then tilt
      orbitA.current.rotation.y += dt * orbitSpeed;
    }
    if (orbitB.current) {
      orbitB.current.rotation.order = "YXZ";
      orbitB.current.rotation.y -= dt * orbitSpeed * 0.72;
    }

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
      damp(shell.current, "uOpacity", (hovered ? 1.35 : 1.0) + pulse * 0.18, 0.3, dt);
      damp(shell.current, "uScrollPulse", hovered ? 0.5 : 0.12, 0.35, dt);
    }
  });

  return (
    <group ref={group} scale={0.001} position={[0.3, BASE_Y, 2.3]}>
      {/* The gem — polished faceted metal. Bright env catch + low roughness
          so every facet glints as it turns instead of reading as a dark mass. */}
      <mesh>
        <icosahedronGeometry args={[1.02, 0]} />
        <meshStandardMaterial
          color="#3a4a68"
          metalness={0.78}
          roughness={0.22}
          envMapIntensity={2.4}
          flatShading
        />
      </mesh>

      {/* The heart — a small burning star; bloom does the rest. */}
      <mesh ref={heart} scale={0.3}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#dfe8f8" toneMapped={false} />
      </mesh>
      <pointLight ref={light} color="#8fb0ff" intensity={7} distance={10} />
      {/* Dedicated key light — rakes the upper facets so the gem always
          reads as a lit, dimensional object against the bright particles. */}
      <pointLight position={[2.4, 2.2, 3.2]} intensity={26} distance={12} color="#e8eefb" />

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

      {/* Fine polished rim, sharing the ring plane so it reads as the inner
          edge of the belt rather than a separate hoop. */}
      <mesh rotation={[Math.PI / 2 + RING_TILT, 0, RING_ROLL]}>
        <torusGeometry args={[1.5, 0.01, 8, 96]} />
        <meshStandardMaterial
          color="#141b27"
          metalness={1}
          roughness={0.32}
          envMapIntensity={1.25}
        />
      </mesh>

      {/* Two shard belts on a VERTICAL (polar) plane — they orbit up and
          over the gem, crossing the horizontal particle rings.
          rotation.y is driven every frame; x/z here stand the plane up. */}
      <group ref={orbitA} rotation={[SHARD_TILT, 0, SHARD_ROLL]}>
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
      <group ref={orbitB} rotation={[SHARD_TILT, 0, SHARD_ROLL + 0.22]}>
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
