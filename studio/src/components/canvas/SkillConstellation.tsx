"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { skillCategories } from "@/lib/content";
import { useExperience } from "@/lib/store";

/**
 * The Skills act — a slowly rotating constellation. Each skill is a glowing
 * node on a fibonacci sphere; faint lines link every node to the core, like a
 * living ecosystem of tools.
 */
export default function SkillConstellation() {
  const group = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const flat = skillCategories.flatMap((c) => c.items.map((it) => ({ ...it })));
    const n = flat.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return flat.map((it, i) => {
      const yy = 1 - (i / (n - 1)) * 2; // 1..-1
      const r = Math.sqrt(1 - yy * yy);
      const theta = golden * i;
      const radius = 1.7;
      return {
        ...it,
        p: new THREE.Vector3(Math.cos(theta) * r * radius, yy * radius, Math.sin(theta) * r * radius),
      };
    });
  }, []);

  const linePositions = useMemo(() => {
    const arr: number[] = [];
    nodes.forEach((nd) => {
      arr.push(0, 0, 0, nd.p.x, nd.p.y, nd.p.z);
    });
    return new Float32Array(arr);
  }, [nodes]);

  useFrame((state, dt) => {
    if (!group.current) return;
    if (!useExperience.getState().reducedMotion) {
      group.current.rotation.y += dt * 0.08;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, 0.8, -0.8]}>
      {/* link lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5a6680" transparent opacity={0.25} />
      </lineSegments>

      {/* core */}
      <mesh>
        <icosahedronGeometry args={[0.28, 2]} />
        <meshStandardMaterial color="#c8d2dd" emissive="#3a4566" emissiveIntensity={0.8} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* nodes */}
      {nodes.map((nd, i) => (
        <mesh key={i} position={nd.p}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color={nd.color} emissive={nd.color} emissiveIntensity={1.1} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
