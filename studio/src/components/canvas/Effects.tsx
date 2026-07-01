"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useExperience } from "@/lib/store";

/**
 * Postprocessing — kept lean and reliable. Bloom makes the emissive cores and
 * project slabs glow; a soft vignette focuses the frame. Film grain is handled
 * cheaply in the DOM layer. Disabled entirely on low-tier devices.
 */
export default function Effects() {
  const quality = useExperience((s) => s.quality);
  if (quality === "low") return null;

  const high = quality === "high";

  return (
    <EffectComposer enableNormalPass={false} multisampling={high ? 4 : 0}>
      <Bloom
        intensity={high ? 0.9 : 0.6}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.28} darkness={0.62} />
    </EffectComposer>
  );
}
