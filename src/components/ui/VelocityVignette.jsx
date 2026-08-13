import { motion, useMotionTemplate, useScroll, useSpring, useTransform, useVelocity } from "motion/react";

/**
 * A subtle radial vignette that softly intensifies when the user is
 * scrolling fast. Adds a feeling of momentum without being intrusive.
 * Spring-smoothed so it eases in and out gracefully.
 */
export default function VelocityVignette() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 100, damping: 28 });

  // Map absolute velocity → opacity (max about 0.35)
  const opacity = useTransform(smooth, (v) => Math.min(0.4, Math.abs(v) / 5000));

  /* Direction-aware tint: scrolling up warms the edge, scrolling down cools
     it. These three values were computed and then thrown away — the vignette
     was always neutral black. They now actually drive the gradient. */
  const tintR = useTransform(smooth, (v) => (v < 0 ? 200 : 130));
  const tintG = useTransform(smooth, (v) => (v < 0 ? 180 : 150));
  const tintB = useTransform(smooth, (v) => (v < 0 ? 170 : 180));
  const background = useMotionTemplate`radial-gradient(ellipse at center, transparent 35%, rgba(${tintR}, ${tintG}, ${tintB}, 0.6) 100%)`;

  return (
    <motion.div
      aria-hidden
      style={{ opacity, background }}
      className="pointer-events-none fixed inset-0 z-[4] mix-blend-multiply"
    />
  );
}
