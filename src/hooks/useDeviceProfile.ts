import { useEffect, useState } from "react";

/**
 * Device-capability profile.
 *
 * This is the most consequential function in the codebase: its answer decides
 * whether a visitor downloads ~330 kB of three.js or never sees it. So the
 * detection is exported separately from the hook and covered by tests.
 *
 * Reads:
 *   - prefers-reduced-motion
 *   - navigator.deviceMemory      (Chromium-only; unknown is assumed capable)
 *   - navigator.hardwareConcurrency
 *   - navigator.connection        (saveData / effectiveType)
 *   - pointer: coarse             (touch)
 *
 * Tiers:
 *   "low"  — reduced motion, data saver, 2G, or genuinely weak hardware.
 *            Skips the 3D world entirely.
 *   "mid"  — modest hardware or a phone. Gets the world, minus the heaviest
 *            extras. Touch alone is not weakness: dropping every phone to the
 *            flat backdrop meant most visitors never saw the hero at all.
 *   "high" — everything on.
 */

export type DeviceTier = "low" | "mid" | "high";

export interface DeviceProfile {
  tier: DeviceTier;
  reducedMotion: boolean;
  touch: boolean;
  saveData: boolean;
}

interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: string;
}

type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  connection?: NavigatorConnection;
};

/** Pure, synchronous capability read. Exported for tests. */
export function detectDeviceProfile(): DeviceProfile {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { tier: "high", reducedMotion: false, touch: false, saveData: false };
  }

  const nav = navigator as ExtendedNavigator;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const memory = nav.deviceMemory ?? 8; // unknown → assume capable
  const cores = nav.hardwareConcurrency ?? 8;

  // Honour the visitor's data-saver preference — this is a bandwidth decision
  // they already made, and a 330 kB 3D scene is exactly what it is about.
  const connection = nav.connection ?? {};
  const saveData = connection.saveData ?? false;
  const slowNet = /(^|-)2g$/.test(connection.effectiveType ?? "");

  let tier: DeviceTier = "high";
  if (reducedMotion || saveData || slowNet || memory <= 2 || cores <= 2) tier = "low";
  else if (memory <= 4 || cores <= 4 || touch) tier = "mid";

  return { tier, reducedMotion, touch, saveData };
}

export default function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(detectDeviceProfile);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return undefined;
    const onChange = () => setProfile(detectDeviceProfile());
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return profile;
}
