import { useEffect, useState } from "react";

/**
 * Returns a device-capability profile so heavy components can degrade
 * gracefully on weaker hardware or when the user explicitly asked for
 * reduced motion.
 *
 * Reads:
 *   - prefers-reduced-motion media query
 *   - navigator.deviceMemory   (Chromium-only, fallback assumed mid)
 *   - navigator.hardwareConcurrency
 *   - touch-only pointer       (mobile / tablet)
 *
 * Profile tiers:
 *   "low"  — reduce motion, skip particles/spotlight, low fps WebGL
 *   "mid"  — normal experience without heaviest extras
 *   "high" — everything on
 */
export default function useDeviceProfile() {
  const [profile, setProfile] = useState(() => detect());

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setProfile(detect());
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  return profile;
}

function detect() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { tier: "high", reducedMotion: false, touch: false };
  }
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const memory = navigator.deviceMemory ?? 8;          // assume mid-range if unknown
  const cores  = navigator.hardwareConcurrency ?? 8;
  // Honour the user's data-saver preference — drop straight to the fast path.
  const conn = navigator.connection || {};
  const saveData = conn.saveData ?? false;
  const slowNet  = /(^|-)2g$/.test(conn.effectiveType || "");

  let tier = "high";
  if (reducedMotion || saveData || slowNet || memory <= 2 || cores <= 2) tier = "low";
  else if (memory <= 4 || cores <= 4 || touch)                           tier = "mid";

  return { tier, reducedMotion, touch, saveData };
}
