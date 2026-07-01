"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/lib/store";
import { chapters, lerp, smooth } from "@/lib/journey";

/**
 * Color grading per act. Lerps the scene background + fog color between
 * chapter grades as you scroll, so the world's atmosphere shifts subtly from
 * section to section — the cinematic "scene change".
 */
export default function WorldGrade() {
  const { scene } = useThree();
  const current = useRef(new THREE.Color(chapters[0].fog));
  const target = useRef(new THREE.Color());

  useFrame(() => {
    const p = useExperience.getState().scroll;
    const n = chapters.length - 1;
    const x = Math.min(0.9999, Math.max(0, p)) * n;
    const i = Math.floor(x);
    const f = smooth(x - i);
    const a = new THREE.Color(chapters[i].fog);
    const b = new THREE.Color(chapters[Math.min(n, i + 1)].fog);
    target.current.copy(a).lerp(b, f);

    current.current.lerp(target.current, 0.05);

    if (scene.background instanceof THREE.Color) scene.background.copy(current.current);
    else scene.background = current.current.clone();

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(current.current);
      // pull the far plane in during the Work act for a denser corridor
      const workCloseness = smooth(Math.max(0, Math.min(1, (p - 0.55) / 0.25)));
      scene.fog.far = lerp(24, 14, workCloseness);
    }
  });

  return null;
}
