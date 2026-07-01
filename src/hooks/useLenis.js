import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Buttery smooth scrolling synced with the rAF loop.
 * Also exposes `window.__lenis` so other modules (GSAP, anchor links) can drive it.
 */
export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.13, // higher = snappier / more responsive scroll
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      // Cover more ground per wheel tick so the site feels fast to traverse.
      wheelMultiplier: 1.45,
      // Lenis 1.x renamed `smoothTouch` → `syncTouch`. `false` keeps native
      // touch scrolling on mobile (best feel + perf). The old key was a no-op.
      syncTouch: false,
      touchMultiplier: 2,
    });

    window.__lenis = lenis;

    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
}
