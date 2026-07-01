"use client";

import { useEffect } from "react";
import { useExperience, type Quality } from "./store";

/**
 * Detects device capability once on mount and writes the tier +
 * reduced-motion flag into the store. Heavy 3D / postprocessing is
 * gated on this so weak hardware and mobile stay smooth.
 */
export function useQualityTier() {
  useEffect(() => {
    const detect = (): { quality: Quality; reducedMotion: boolean } => {
      const reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const cores = navigator.hardwareConcurrency ?? 8;
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection ?? {};
      const saveData = conn.saveData ?? false;
      const slowNet = /(^|-)2g$/.test(conn.effectiveType ?? "");
      const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 600;

      let quality: Quality = "high";
      if (reducedMotion || saveData || slowNet || mem <= 2 || cores <= 2) quality = "low";
      else if (mem <= 4 || cores <= 4 || coarse || smallScreen) quality = "mid";

      return { quality, reducedMotion };
    };

    const apply = () => {
      const { quality, reducedMotion } = detect();
      useExperience.getState().setQuality(quality, reducedMotion);
    };
    apply();

    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);
}
