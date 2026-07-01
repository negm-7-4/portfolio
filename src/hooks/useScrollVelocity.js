import { useScroll, useVelocity, useSpring, useTransform } from "motion/react";

/**
 * A single, shared "kinetic" signal derived from scroll velocity.
 *
 * Returns a spring-smoothed motion value in roughly [-max, max] that maps fast
 * scrolling to a subtle reaction (skew, scale, stretch). The signal is
 * transform-friendly: feed it straight into `skewY` / `scaleY` so the whole
 * effect stays on the compositor and holds 60fps.
 *
 *   const skew = useScrollVelocity({ max: 3 });   // ±3deg
 *   <motion.div style={{ skewY: skew }} />
 *
 * `clampAt` is the velocity (px/s) that counts as "full tilt"; anything faster
 * is capped so a flick of the wheel never throws the layout around.
 */
export default function useScrollVelocity({ max = 3, clampAt = 1600, stiffness = 250, damping = 40 } = {}) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness, damping, mass: 0.4 });
  return useTransform(smooth, [-clampAt, 0, clampAt], [-max, 0, max], { clamp: true });
}
