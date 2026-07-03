import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { experience } from "../../store/experience";

/* eslint-disable react/no-unknown-property */

/* ──────────────────────────────────────────────────────────────────────
   COMETS — occasional shooting stars in the deep background.

   A tiny pool of gradient-shader planes (2 on mid, 3 on high) that streak
   across the far field every handful of seconds, plus one deliberately
   fired whenever the story crosses into a new chapter — so a section
   change reads as a small celestial event.

   Everything is pooled and mutated in place: zero allocations per frame,
   at most three transparent quads on screen at once.
   ─────────────────────────────────────────────────────────────────────── */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uAlpha;
  uniform vec3  uColor;
  varying vec2 vUv;

  void main() {
    // Thin across the streak, brightening toward the head (uv.x = 1).
    float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
    across *= across;
    float tail = pow(vUv.x, 2.6);
    float head = smoothstep(0.93, 1.0, vUv.x) * 1.6;
    float a = (tail * 0.8 + head) * across * uAlpha;
    gl_FragColor = vec4(uColor, a);

    #include <colorspace_fragment>
  }
`;

export default function Comets({ quality = "high" }) {
  const COUNT = quality === "high" ? 3 : 2;
  const meshes = useRef([]);
  const lastSection = useRef(0);

  // Pooled per-comet state — mutated in place, never re-allocated.
  const pool = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        active: false,
        next: 2 + i * 3 + Math.random() * 4, // first appearances, staggered
        t: 0,
        dur: 1.4,
        dist: 34,
        from: new THREE.Vector3(),
        dir: new THREE.Vector3(),
      })),
    [COUNT]
  );

  const materials = useMemo(
    () =>
      Array.from(
        { length: COUNT },
        () =>
          new THREE.ShaderMaterial({
            uniforms: {
              uAlpha: { value: 0 },
              uColor: { value: new THREE.Color("#cfdcf2") },
            },
            vertexShader: VERT,
            fragmentShader: FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
      ),
    [COUNT]
  );

  useEffect(() => {
    return () => materials.forEach((m) => m.dispose());
  }, [materials]);

  const spawn = (c, mesh) => {
    const fromLeft = Math.random() < 0.5;
    c.from.set(
      (fromLeft ? -1 : 1) * (16 + Math.random() * 10),
      Math.random() * 11 - 2,
      -18 - Math.random() * 14
    );
    c.dir
      .set(fromLeft ? 1 : -1, -(0.14 + Math.random() * 0.22), 0)
      .normalize();
    c.dist = 28 + Math.random() * 12;
    c.dur = 1.1 + Math.random() * 0.8;
    c.t = 0;
    c.active = true;

    mesh.scale.set(3.6 + Math.random() * 2.6, 0.05 + Math.random() * 0.04, 1);
    mesh.rotation.z = Math.atan2(c.dir.y, c.dir.x);
  };

  useFrame((state, dt) => {
    const elapsed = state.clock.elapsedTime;
    const { sectionIndex } = experience.getState();

    // A chapter crossing fires one comet immediately — a small celestial
    // punctuation mark on the story beat.
    if (sectionIndex !== lastSection.current) {
      lastSection.current = sectionIndex;
      const idle = pool.find((c) => !c.active);
      if (idle) idle.next = Math.min(idle.next, elapsed);
    }

    for (let i = 0; i < pool.length; i++) {
      const c = pool[i];
      const mesh = meshes.current[i];
      if (!mesh) continue;

      if (!c.active) {
        mesh.visible = false;
        if (elapsed >= c.next) spawn(c, mesh);
        continue;
      }

      c.t += dt / c.dur;
      if (c.t >= 1) {
        c.active = false;
        c.next = elapsed + 5 + Math.random() * 9;
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;
      mesh.position
        .copy(c.from)
        .addScaledVector(c.dir, c.t * c.dist);
      materials[i].uniforms.uAlpha.value = Math.sin(Math.PI * c.t) * 0.75;
    }
  });

  return (
    <group>
      {materials.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => (meshes.current[i] = el)}
          material={m}
          visible={false}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
