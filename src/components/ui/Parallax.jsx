import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import useScrollVelocity from "../../hooks/useScrollVelocity";
import { SPRING_SCROLL } from "../../lib/motion";

/**
 * Continuous scroll parallax — translates (and optionally fades) its children
 * as they pass through the viewport, so motion happens scrolling BOTH ways.
 *
 * Adds a whisper of velocity-driven skew: scroll fast and the block leans into
 * the motion, then springs flat when you stop — the "kinetic drag" of
 * Locomotive/Awwwards sites. Transform + opacity only → stays at 60fps.
 */
export default function Parallax({
  children,
  className = "",
  distance = 60,
  fade = false,
  smooth = true,
  kinetic = true,
  style = {},
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Always create the spring (rules-of-hooks safe) then pick the source.
  const springy = useSpring(scrollYProgress, SPRING_SCROLL);
  const progress = smooth ? springy : scrollYProgress;

  const y       = useTransform(progress, [0, 1], [distance, -distance]);
  const opacity = useTransform(progress, [0, 0.18, 0.82, 1], [0.2, 1, 1, 0.2]);
  const skewY   = useScrollVelocity({ max: 2, clampAt: 1800 });

  return (
    <motion.div
      ref={ref}
      style={{
        ...style,
        y,
        skewY: kinetic ? skewY : undefined,
        opacity: fade ? opacity : undefined,
        willChange: "transform",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
