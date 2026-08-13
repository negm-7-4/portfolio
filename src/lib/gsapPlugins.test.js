import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The club-plugin loader.
 *
 * Two properties carry real weight here:
 *
 *  1. **Asking for one plugin fetches one plugin.** This is the whole point of
 *     the rewrite — the previous version pulled ~25 kB gzipped of nine unused
 *     plugins to use DrawSVG. A regression would be invisible at runtime and
 *     only show up as a slower site.
 *
 *  2. **Each plugin registers at most once.** `gsap.registerPlugin` is not free
 *     and re-registering across the several components that call `loadGsap`
 *     would repeat that work on every mount.
 *
 * `scrollSync` is mocked so these never touch the real GSAP.
 */

const gsap = { registerPlugin: vi.fn() };
const ScrollTrigger = { update: vi.fn() };
const loadScrollSync = vi.fn(async () => ({ gsap, ScrollTrigger }));

vi.mock("./scrollSync", () => ({ loadScrollSync }));

vi.mock("gsap/DrawSVGPlugin", () => ({ DrawSVGPlugin: { name: "DrawSVGPlugin" } }));
vi.mock("gsap/SplitText", () => ({ SplitText: { name: "SplitText" } }));
vi.mock("gsap/Flip", () => ({ Flip: { name: "Flip" } }));

/* Assertions go through `registerPlugin` rather than import side effects.
   `vi.mock` factories are hoisted and evaluated once for the whole file, so
   `resetModules` does not re-run them — an import counter would silently
   stop counting after the first test. What gets registered is both
   observable and the thing that actually matters. */
const registered = () => gsap.registerPlugin.mock.calls.flat().map((p) => p.name);

async function freshLoader() {
  vi.resetModules();
  gsap.registerPlugin.mockClear();
  return import("./gsapPlugins");
}

describe("loadGsap", () => {
  beforeEach(() => {
    loadScrollSync.mockClear();
  });

  it("returns gsap and ScrollTrigger with no plugins requested", async () => {
    const { loadGsap } = await freshLoader();
    const result = await loadGsap();

    expect(result.gsap).toBe(gsap);
    expect(result.ScrollTrigger).toBe(ScrollTrigger);
    expect(gsap.registerPlugin).not.toHaveBeenCalled();
  });

  it("fetches ONLY the plugin asked for", async () => {
    // The regression this guards: the old loader imported ten plugins to use
    // one, and nothing at runtime would tell you it had come back.
    const { loadGsap } = await freshLoader();
    await loadGsap("DrawSVGPlugin");

    expect(registered()).toEqual(["DrawSVGPlugin"]);
    expect(gsap.registerPlugin).toHaveBeenCalledTimes(1);
  });

  it("returns the requested plugin under its own name", async () => {
    const { loadGsap } = await freshLoader();
    const result = await loadGsap("DrawSVGPlugin");

    expect(result.DrawSVGPlugin).toEqual({ name: "DrawSVGPlugin" });
  });

  it("loads several plugins when several are asked for", async () => {
    const { loadGsap } = await freshLoader();
    const result = await loadGsap("SplitText", "Flip");

    expect(registered().sort()).toEqual(["Flip", "SplitText"]);
    expect(result.SplitText).toBeDefined();
    expect(result.Flip).toBeDefined();
  });

  it("registers each plugin at most once across repeated calls", async () => {
    const { loadGsap } = await freshLoader();

    await loadGsap("DrawSVGPlugin");
    await loadGsap("DrawSVGPlugin");
    await loadGsap("DrawSVGPlugin");

    expect(registered()).toEqual(["DrawSVGPlugin"]);
    expect(gsap.registerPlugin).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent requests for the same plugin", async () => {
    // Several components mount in the same tick and each ask for the plugin.
    // Without an in-flight cache each would import and register separately.
    const { loadGsap } = await freshLoader();

    await Promise.all([
      loadGsap("DrawSVGPlugin"),
      loadGsap("DrawSVGPlugin"),
      loadGsap("DrawSVGPlugin"),
    ]);

    expect(gsap.registerPlugin).toHaveBeenCalledTimes(1);
  });

  it("rejects an unknown plugin name instead of failing silently", async () => {
    const { loadGsap } = await freshLoader();

    await expect(loadGsap("NotARealPlugin")).rejects.toThrow(/Unknown GSAP plugin/);
  });

  it("advertises the plugins it can load", async () => {
    const { AVAILABLE_PLUGINS } = await freshLoader();

    expect(AVAILABLE_PLUGINS).toContain("DrawSVGPlugin");
    expect(AVAILABLE_PLUGINS).toContain("SplitText");
    // ScrollTrigger comes from scrollSync, not from here.
    expect(AVAILABLE_PLUGINS).not.toContain("ScrollTrigger");
  });
});
