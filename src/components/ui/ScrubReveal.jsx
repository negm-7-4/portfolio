import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { SPRING_SCROLL } from "../../lib/motion";

/**
 * Scroll-SCRUBBED reveal — the "video" primitive. Instead of firing once, the
 * whole reveal is tied to the element's position in the viewport, so scrolling
 * scrubs it like a frame-by-frame clip:
 *
 *   • clip-path wipe   — content unmasks from the bottom as it enters
 *   • Ken-Burns zoom   — a slow scale that keeps drifting the whole pass
 *   • 3D tilt + drift  — a subtle rotateX + y parallax for depth
 *
 * Pure transform + clip-path → GPU-composited, holds 60fps, and rides Lenis
 * smoothly because it reads the same scroll framer's other sections use.
 */
export default function ScrubReveal({
  children,
  className = "",
  wipe = true,
  tilt = 6,
  parallax = 44,
  zoom = 0.1,
  style = {},
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, SPRING_SCROLL);

  const y       = useTransform(p, [0, 1], [parallax, -parallax]);
  const rotateX = useTransform(p, [0, 0.5, 1], [tilt, 0, -tilt]);
  const scale   = useTransform(p, [0, 0.5, 1], [1 + zoom, 1 + zoom * 0.45, 1]);
  const opacity = useTransform(p, [0.0, 0.16], [0.35, 1]);
  const clip    = useTransform(
    p,
    [0.03, 0.32],
    ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y,
        rotateX,
        scale,
        opacity,
        clipPath: wipe ? clip : undefined,
        transformPerspective: 1300,
        willChange: "transform, clip-path",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
