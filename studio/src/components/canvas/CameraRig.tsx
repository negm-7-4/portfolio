"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/lib/store";
import { sampleCamera } from "@/lib/journey";

/**
 * The director. Reads global scroll progress from the store and drives the
 * camera along the journey keyframes, layering in a subtle pointer parallax.
 * The whole site is one continuous, eased camera move.
 */
export default function CameraRig() {
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpTarget = useRef(new THREE.Vector3());

  useFrame(({ camera }, dt) => {
    const { scroll, pointer, reducedMotion, phase } = useExperience.getState();

    // During the intro reveal, ease in from a pushed-back, lifted position.
    const introPull = phase === "ready" ? 0 : 1;

    const { pos, target } = sampleCamera(scroll);
    const px = reducedMotion ? 0 : pointer.x;
    const py = reducedMotion ? 0 : pointer.y;

    tmpPos.current.set(
      pos[0] + px * 0.45,
      pos[1] - py * 0.3 + introPull * 1.2,
      pos[2] + introPull * 2.0
    );
    tmpTarget.current.set(target[0] + px * 0.25, target[1] - py * 0.18, target[2]);

    // Frame-rate independent smoothing.
    const k = 1 - Math.pow(0.0009, dt);
    camera.position.lerp(tmpPos.current, k);
    lookAt.current.lerp(tmpTarget.current, k);
    camera.lookAt(lookAt.current);
  });

  return null;
}
