"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/lib/content";
import { useExperience } from "@/lib/store";

/**
 * A corridor of monolithic slabs receding down -Z — one per project. The
 * camera flies through it during the Work act. Hovering a project in the DOM
 * lights its slab (store.hoveredProject), tying the 2D and 3D layers together.
 */
function Slab({ index, color }: { index: number; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const side = index % 2 === 0 ? -1 : 1;
  const z = -2.2 - index * 2.6;
  const x = side * (1.5 + (index % 3) * 0.15);
  const y = Math.sin(index * 1.3) * 0.4;

  useFrame((state, dt) => {
    const hovered = useExperience.getState().hoveredProject === index;
    if (mesh.current) {
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y,
        side * -0.35 + (hovered ? side * 0.2 : 0),
        0.06
      );
      mesh.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.06;
    }
    if (mat.current) {
      const target = hovered ? 1.6 : 0.5;
      mat.current.emissiveIntensity = THREE.MathUtils.lerp(mat.current.emissiveIntensity, target, 0.08);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={mesh}>
        <boxGeometry args={[1.4, 3.4, 0.12]} />
        <meshStandardMaterial
          ref={mat}
          color="#0a0d15"
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.18}
          metalness={0.9}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* glowing edge frame */}
      <mesh>
        <boxGeometry args={[1.46, 3.46, 0.06]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.22} />
      </mesh>
      <pointLight position={[0, 0, 0.6]} intensity={1.2} distance={3} color={color} />
    </group>
  );
}

export default function ProjectsCorridor() {
  return (
    <group>
      {projects.map((p, i) => (
        <Slab key={p.title} index={i} color={p.color} />
      ))}
    </group>
  );
}
