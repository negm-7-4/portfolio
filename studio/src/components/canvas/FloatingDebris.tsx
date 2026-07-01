"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useExperience } from "@/lib/store";

type Shard = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  kind: number;
  speed: number;
};

/**
 * Drifting geometric shards scattered through the world — they give the
 * scene parallax depth and a sense of an environment you move *through*.
 */
export default function FloatingDebris({ count = 26 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);

  const shards = useMemo<Shard[]>(() => {
    const out: Shard[] = [];
    for (let i = 0; i < count; i++) {
      // spread in a wide volume, biased away from dead center
      const radius = 3 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 7;
      out.push({
        pos: [Math.cos(theta) * radius, y, -2 - Math.random() * 9],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.08 + Math.random() * 0.28,
        kind: Math.floor(Math.random() * 3),
        speed: 0.2 + Math.random() * 0.5,
      });
    }
    return out;
  }, [count]);

  useFrame((_, dt) => {
    if (!group.current) return;
    if (useExperience.getState().reducedMotion) return;
    group.current.children.forEach((c, i) => {
      c.rotation.x += dt * 0.1 * shards[i].speed;
      c.rotation.y += dt * 0.14 * shards[i].speed;
    });
  });

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={0.4} floatIntensity={0.6}>
          <mesh position={s.pos} rotation={s.rot} scale={s.scale}>
            {s.kind === 0 ? (
              <octahedronGeometry args={[1, 0]} />
            ) : s.kind === 1 ? (
              <tetrahedronGeometry args={[1, 0]} />
            ) : (
              <boxGeometry args={[1, 1, 1]} />
            )}
            <meshStandardMaterial
              color="#8b94a8"
              roughness={0.25}
              metalness={0.85}
              emissive="#1a2236"
              emissiveIntensity={0.4}
              envMapIntensity={1.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
