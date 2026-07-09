/**
 * Curated GSAP plugin loader.
 *
 * GSAP 3.13+ ships every formerly-paid "club" plugin in the public package.
 * This loads a hand-picked subset ON DEMAND (only when a premium effect first
 * mounts) and registers it once, so the heavy plugins live in their own lazy
 * `gsap-plugins` chunk and never touch the critical path.
 *
 * It builds on `loadScrollSync()` so ScrollTrigger is registered once and
 * stays wired into Lenis — no duplicate registration, no double scroll driver.
 *
 * Deliberately NOT registered here, and why:
 *   • ScrollSmoother     — hijacks scrolling; would fight the site's Lenis.
 *   • GSDevTools /
 *     MotionPathHelper   — authoring/debug tools, not for production bundles.
 *   • PixiPlugin /
 *     EaselPlugin        — need Pixi.js / EaselJS, which this project doesn't use.
 *   • PhysicsPropsPlugin — niche; Physics2DPlugin covers our particle needs.
 *   • ScrollToPlugin     — the site already scrolls via Lenis.scrollTo().
 */
import { loadScrollSync } from "./scrollSync";

let promise = null;

export function loadGsap() {
  if (!promise) {
    promise = loadScrollSync().then(({ gsap, ScrollTrigger }) =>
      Promise.all([
        import("gsap/SplitText"),
        import("gsap/DrawSVGPlugin"),
        import("gsap/MorphSVGPlugin"),
        import("gsap/MotionPathPlugin"),
        import("gsap/Flip"),
        import("gsap/Observer"),
        import("gsap/ScrambleTextPlugin"),
        import("gsap/CustomEase"),
        import("gsap/InertiaPlugin"),
        import("gsap/Physics2DPlugin"),
      ]).then(
        ([
          { SplitText },
          { DrawSVGPlugin },
          { MorphSVGPlugin },
          { MotionPathPlugin },
          { Flip },
          { Observer },
          { ScrambleTextPlugin },
          { CustomEase },
          { InertiaPlugin },
          { Physics2DPlugin },
        ]) => {
          gsap.registerPlugin(
            SplitText,
            DrawSVGPlugin,
            MorphSVGPlugin,
            MotionPathPlugin,
            Flip,
            Observer,
            ScrambleTextPlugin,
            CustomEase,
            InertiaPlugin,
            Physics2DPlugin
          );
          return {
            gsap,
            ScrollTrigger,
            SplitText,
            DrawSVGPlugin,
            MorphSVGPlugin,
            MotionPathPlugin,
            Flip,
            Observer,
            ScrambleTextPlugin,
            CustomEase,
            InertiaPlugin,
            Physics2DPlugin,
          };
        }
      )
    );
  }
  return promise;
}
