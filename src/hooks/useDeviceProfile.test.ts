// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { detectDeviceProfile } from "./useDeviceProfile";

/**
 * This function decides whether a visitor downloads ~330 kB of three.js.
 * Getting a threshold wrong is invisible in review and expensive on a phone
 * in Egypt on a metered connection, so every branch is pinned here.
 */

interface Fake {
  reducedMotion?: boolean;
  coarse?: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
  effectiveType?: string;
}

function fakeDevice({
  reducedMotion = false,
  coarse = false,
  deviceMemory = 8,
  hardwareConcurrency = 8,
  saveData = false,
  effectiveType = "4g",
}: Fake = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : coarse,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("navigator", {
    deviceMemory,
    hardwareConcurrency,
    connection: { saveData, effectiveType },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("detectDeviceProfile", () => {
  it("gives a capable desktop the full experience", () => {
    fakeDevice();
    expect(detectDeviceProfile()).toEqual({
      tier: "high",
      reducedMotion: false,
      touch: false,
      saveData: false,
    });
  });

  it("puts a capable phone on mid, not low", () => {
    // Touch alone is not weakness. Dropping every phone to the flat backdrop
    // meant most visitors never saw the hero at all.
    fakeDevice({ coarse: true, deviceMemory: 8, hardwareConcurrency: 8 });
    const profile = detectDeviceProfile();
    expect(profile.tier).toBe("mid");
    expect(profile.touch).toBe(true);
  });

  it.each([
    ["reduced motion", { reducedMotion: true }],
    ["data saver", { saveData: true }],
    ["2g", { effectiveType: "2g" }],
    ["slow 2g", { effectiveType: "slow-2g" }],
    ["2 GB memory", { deviceMemory: 2 }],
    ["2 cores", { hardwareConcurrency: 2 }],
  ])("drops to low on %s", (_label, overrides) => {
    fakeDevice(overrides);
    expect(detectDeviceProfile().tier).toBe("low");
  });

  it("does not treat 3g as slow", () => {
    // Only 2g is slow enough to justify skipping the experience entirely.
    fakeDevice({ effectiveType: "3g" });
    expect(detectDeviceProfile().tier).toBe("high");
  });

  it.each([
    ["4 GB memory", { deviceMemory: 4 }],
    ["4 cores", { hardwareConcurrency: 4 }],
  ])("uses mid for %s", (_label, overrides) => {
    fakeDevice(overrides);
    expect(detectDeviceProfile().tier).toBe("mid");
  });

  it("assumes capable hardware when the browser will not say", () => {
    // deviceMemory is Chromium-only. Treating "unknown" as weak would
    // downgrade every Safari and Firefox visitor.
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("navigator", {});
    expect(detectDeviceProfile().tier).toBe("high");
  });

  it("reports saveData so callers can explain the downgrade", () => {
    fakeDevice({ saveData: true });
    expect(detectDeviceProfile().saveData).toBe(true);
  });

  it("lets reduced motion win over otherwise strong hardware", () => {
    fakeDevice({ reducedMotion: true, deviceMemory: 32, hardwareConcurrency: 24 });
    const profile = detectDeviceProfile();
    expect(profile.tier).toBe("low");
    expect(profile.reducedMotion).toBe(true);
  });
});
