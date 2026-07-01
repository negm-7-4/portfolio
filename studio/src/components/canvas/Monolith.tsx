"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useExperience } from "@/lib/store";

/**
 * The hero centerpiece — a slowly morphing crystalline core orbited by a
 * wireframe cage and a thin halo ring. It's the gravitational center of the
 * intro/about acts and reacts to the pointer with a parallax tilt.
 */
export default function Monolith() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const { pointer, reducedMotion, scroll } = useExperience.getState();
    const t = state.clock.elapsedTime;

    if (group.current) {
      const px = reducedMotion ? 0 : pointer.x;
      const py = reducedMotion ? 0 : pointer.y;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, px * 0.4 + t * 0.08, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, py * 0.25, 0.05);
      // Sink/scale slightly as the journey moves past the intro act.
      const s = THREE.MathUtils.lerp(1, 0.78, Math.min(1, scroll * 2));
      group.current.scale.setScalar(s);
    }
    if (cage.current) cage.current.rotation.y -= dt * 0.12;
    if (cage.current) cage.current.rotation.z += dt * 0.04;
    if (ring.current) ring.current.rotation.z += dt * 0.18;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 0.8) * 0.015;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5} floatingRange={[-0.08, 0.08]}>
      <group ref={group}>
        {/* Morphing crystalline core */}
        <mesh ref={core}>
          <icosahedronGeometry args={[1, 6]} />
          <MeshDistortMaterial
            color="#9fb0c8"
            emissive="#2a3550"
            emissiveIntensity={0.6}
            roughness={0.12}
            metalness={0.9}
            distort={0.32}
            speed={1.6}
            envMapIntensity={1.4}
          />
        </mesh>

        {/* Faceted wireframe cage */}
        <mesh ref={cage} scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#aab4c4" wireframe transparent opacity={0.14} />
        </mesh>

        {/* Thin halo ring */}
        <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]} scale={2.1}>
          <torusGeometry args={[1, 0.006, 8, 160]} />
          <meshBasicMaterial color="#c8d2dd" transparent opacity={0.5} />
        </mesh>

        {/* Inner emissive point for bloom */}
        <pointLight position={[0, 0, 0]} intensity={6} distance={4} color="#7e93c8" />
      </group>
    </Float>
  );
}
