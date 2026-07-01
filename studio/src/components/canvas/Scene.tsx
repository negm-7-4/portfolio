"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";

import { useExperience } from "@/lib/store";
import { chapters } from "@/lib/journey";

import CameraRig from "./CameraRig";
import WorldGrade from "./WorldGrade";
import WorldLighting from "./WorldLighting";
import Starfield from "./Starfield";
import Monolith from "./Monolith";
import FloatingDebris from "./FloatingDebris";
import SkillConstellation from "./SkillConstellation";
import ProjectsCorridor from "./ProjectsCorridor";
import Effects from "./Effects";

/**
 * The single persistent 3D canvas behind the entire site. Fixed, full-bleed,
 * pointer-events disabled — the DOM overlay handles all interaction while this
 * paints the connected cinematic world.
 */
export default function Scene() {
  const quality = useExperience((s) => s.quality);
  const dprMax = quality === "high" ? 1.9 : quality === "mid" ? 1.4 : 1;
  const debrisCount = quality === "high" ? 28 : quality === "mid" ? 16 : 8;
  const stars = quality === "high" ? 1500 : quality === "mid" ? 800 : 0;

  return (
    <div className="fixed inset-0 -z-10" style={{ pointerEvents: "none" }} aria-hidden>
      <Canvas
        dpr={[1, dprMax]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 1.4, 9.2], fov: 38, near: 0.1, far: 100 }}
      >
        <color attach="background" args={[chapters[0].fog]} />
        <fog attach="fog" args={[chapters[0].fog, 5, 24]} />

        <CameraRig />
        <WorldGrade />

        <Suspense fallback={null}>
          <WorldLighting />
          {stars > 0 && <Starfield count={stars} />}
          <Monolith />
          <FloatingDebris count={debrisCount} />
          <SkillConstellation />
          <ProjectsCorridor />
          <Preload all />
        </Suspense>

        <Effects />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
