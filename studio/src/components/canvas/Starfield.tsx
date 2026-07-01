"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Deep-background particle field. Two drifting shells of points give
 * parallax depth behind the whole world. Cheap: one draw call per shell.
 */
export default function Starfield({ count = 1400 }: { count?: number }) {
  const inner = useRef<THREE.Points>(null);
  const outer = useRef<THREE.Points>(null);

  const [near, far] = useMemo(() => {
    const make = (n: number, radius: number, spread: number) => {
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        // distribute on a rough shell so the camera sits inside it
        const r = radius + Math.random() * spread;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        arr[i * 3 + 2] = r * Math.cos(phi);
      }
      return arr;
    };
    return [make(Math.floor(count * 0.6), 12, 14), make(Math.floor(count * 0.4), 26, 22)];
  }, [count]);

  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.y += dt * 0.006;
    if (outer.current) outer.current.rotation.y -= dt * 0.003;
  });

  return (
    <group>
      <points ref={inner}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[near, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          sizeAttenuation
          color="#cfd8e6"
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
      <points ref={outer}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[far, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          sizeAttenuation
          color="#8b94a8"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
