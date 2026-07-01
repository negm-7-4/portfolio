"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural lighting + reflections. No external HDRI fetch — the
 * environment is built from Lightformers so it works fully offline and
 * gives the metallic/distort materials crisp, cinematic highlights.
 */
export default function WorldLighting() {
  return (
    <>
      <ambientLight intensity={0.22} color="#9aa6c0" />
      <directionalLight position={[5, 7, 4]} intensity={1.1} color="#d6def0" />
      <directionalLight position={[-6, -3, -2]} intensity={0.4} color="#3a4a78" />
      <spotLight position={[0, 6, 2]} angle={0.6} penumbra={1} intensity={1.4} color="#aab4c4" distance={20} />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 3, 3]} scale={[7, 5, 1]} color="#c8d2dd" />
        <Lightformer intensity={1.4} position={[-4, 1, 2]} scale={[3, 6, 1]} color="#7e93c8" />
        <Lightformer intensity={1.2} position={[4, -1, 2]} scale={[3, 5, 1]} color="#8b94a8" />
        <Lightformer intensity={0.8} position={[0, -4, 1]} scale={[8, 3, 1]} color="#2a3550" />
      </Environment>
    </>
  );
}
