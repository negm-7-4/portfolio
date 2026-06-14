import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Continuous scroll parallax — translates (and optionally fades) its children
 * as they pass through the viewport, so motion happens scrolling BOTH up and
 * down. Transform/opacity only, so it stays cheap.
 *
 * Spring-smoothed for buttery motion that pairs well with Lenis.
 */
export default function Parallax({
  children,
  className = "",
  distance = 60,
  fade = false,
  smooth = true,
  style = {},
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Optionally spring-smooth the progress for silkier motion
  const progress = smooth
    ? useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 })
    : scrollYProgress;

  const y       = useTransform(progress, [0, 1], [distance, -distance]);
  const opacity = useTransform(progress, [0, 0.18, 0.82, 1], [0.2, 1, 1, 0.2]);

  return (
    <motion.div
      ref={ref}
      style={{ ...style, y, opacity: fade ? opacity : undefined, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
