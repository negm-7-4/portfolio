/**
 * On-demand GSAP plugin loader.
 *
 * GSAP 3.13+ ships every formerly-paid "club" plugin in the public package.
 * This used to eagerly import and register ten of them in one Promise.all —
 * SplitText, MorphSVG, MotionPath, Flip, ScrambleText, CustomEase, Inertia,
 * Physics2D and friends — which meant the first component that wanted a single
 * plugin pulled ~63 kB (25 kB gzipped) of the other nine with it.
 *
 * The site actually uses one: DrawSVG, for the signature flourish.
 *
 * So plugins are now loaded individually and memoised by name. Asking for one
 * fetches one. Asking for the same one twice fetches nothing the second time.
 * Adding an effect that needs MorphSVG later costs only MorphSVG.
 *
 * Deliberately NOT offered here, and why:
 *   • ScrollSmoother     — hijacks scrolling; would fight the site's Lenis.
 *   • GSDevTools /
 *     MotionPathHelper   — authoring/debug tools, not for production bundles.
 *   • PixiPlugin /
 *     EaselPlugin        — need Pixi.js / EaselJS, which this project doesn't use.
 *   • ScrollToPlugin     — the site already scrolls via lib/navigation.
 */
import { loadScrollSync } from "./scrollSync";

/**
 * name → () => import(...)
 *
 * Static import specifiers (not template strings) so Rollup can see every
 * edge and emit a separate chunk per plugin.
 */
const LOADERS = {
  DrawSVGPlugin: () => import("gsap/DrawSVGPlugin"),
  SplitText: () => import("gsap/SplitText"),
  MorphSVGPlugin: () => import("gsap/MorphSVGPlugin"),
  MotionPathPlugin: () => import("gsap/MotionPathPlugin"),
  Flip: () => import("gsap/Flip"),
  Observer: () => import("gsap/Observer"),
  ScrambleTextPlugin: () => import("gsap/ScrambleTextPlugin"),
  CustomEase: () => import("gsap/CustomEase"),
  InertiaPlugin: () => import("gsap/InertiaPlugin"),
  Physics2DPlugin: () => import("gsap/Physics2DPlugin"),
};

/** name → in-flight or settled promise, so each plugin loads at most once. */
const cache = new Map();

function loadPlugin(gsap, name) {
  if (!cache.has(name)) {
    const load = LOADERS[name];
    if (!load) {
      return Promise.reject(new Error(`Unknown GSAP plugin: ${name}`));
    }
    cache.set(
      name,
      load().then((module) => {
        const plugin = module[name] ?? module.default;
        gsap.registerPlugin(plugin);
        return plugin;
      })
    );
  }
  return cache.get(name);
}

/**
 * Load GSAP + ScrollTrigger (shared, wired into Lenis) plus only the club
 * plugins named.
 *
 * @param {...keyof LOADERS} names
 * @returns {Promise<{gsap: object, ScrollTrigger: object} & Record<string, object>>}
 *
 * @example
 *   const { gsap } = await loadGsap("DrawSVGPlugin");
 *   gsap.set(".sig-draw", { drawSVG: "0%" });
 */
export async function loadGsap(...names) {
  const { gsap, ScrollTrigger } = await loadScrollSync();
  const plugins = await Promise.all(names.map((name) => loadPlugin(gsap, name)));

  return names.reduce((acc, name, i) => ({ ...acc, [name]: plugins[i] }), {
    gsap,
    ScrollTrigger,
  });
}

/** The plugin names this loader knows how to fetch. */
export const AVAILABLE_PLUGINS = Object.keys(LOADERS);
