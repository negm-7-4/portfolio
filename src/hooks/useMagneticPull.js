import { useEffect, useLayoutEffect, useRef } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { useCursor } from "./useCursor";

/**
 * Shared rAF-driven magnetic pull. Each call gets its own springs but
 * shares ONE animation frame loop with every other magnetic element in
 * the page, and caches the element's rect (only refreshes on scroll +
 * resize). This avoids the classic "subscribe-to-cursor + reflow on
 * every move" performance trap.
 *
 * Returns { ref, sx, sy, srx, sry } — attach `ref` to the target element
 * and apply the four motion values as transforms.
 *
 * Options:
 *   radius      — cursor-proximity radius in px (default 220)
 *   strength    — max translation in px (default 18)
 *   tiltStrength — max tilt in degrees (default 0 = no tilt)
 */
const sharedLoop = (() => {
  const subscribers = new Set();
  let raf = 0;
  let lastMx = -1, lastMy = -1;
  let cursor = null;

  const start = (c) => {
    cursor = c;
    if (raf) return;
    const tick = () => {
      const mx = cursor?.mx.get() ?? -9999;
      const my = cursor?.my.get() ?? -9999;
      if (mx !== lastMx || my !== lastMy) {
        lastMx = mx; lastMy = my;
        for (const sub of subscribers) sub(mx, my);
      }
      raf = subscribers.size ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  };

  return {
    subscribe(fn, c) {
      subscribers.add(fn);
      start(c);
      return () => {
        subscribers.delete(fn);
        if (!subscribers.size && raf) { cancelAnimationFrame(raf); raf = 0; }
      };
    },
  };
})();

export default function useMagneticPull({
  radius = 220,
  strength = 18,
  tiltStrength = 0,
  springStiffness = 170,
  springDamping = 20,
} = {}) {
  const ref = useRef(null);
  const rectRef = useRef(null); // { cx, cy }
  const c = useCursor();

  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx  = useSpring(lx, { stiffness: springStiffness, damping: springDamping, mass: 0.6 });
  const sy  = useSpring(ly, { stiffness: springStiffness, damping: springDamping, mass: 0.6 });
  const srx = useSpring(rx, { stiffness: springStiffness, damping: springDamping, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: springStiffness, damping: springDamping, mass: 0.6 });

  // Cache element center on layout, refresh on scroll + resize
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) { rectRef.current = null; return; }
      const r = el.getBoundingClientRect();
      rectRef.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Subscribe to the shared rAF loop
  useEffect(() => {
    if (!c) return;
    const R2 = radius * radius;
    const onTick = (mx, my) => {
      const rect = rectRef.current;
      if (!rect) return;
      const dx = mx - rect.cx;
      const dy = my - rect.cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / radius) ** 2;
        lx.set((dx / d) * strength * f);
        ly.set((dy / d) * strength * f);
        if (tiltStrength) {
          rx.set(-(dy / radius) * tiltStrength * f);
          ry.set( (dx / radius) * tiltStrength * f);
        }
      } else if (lx.get() !== 0) {
        lx.set(0);
        ly.set(0);
        if (tiltStrength) { rx.set(0); ry.set(0); }
      }
    };
    return sharedLoop.subscribe(onTick, c);
  }, [c, radius, strength, tiltStrength, lx, ly, rx, ry]);

  return { ref, sx, sy, srx, sry };
}
