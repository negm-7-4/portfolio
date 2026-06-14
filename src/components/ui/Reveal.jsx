import { motion } from "motion/react";

const directions = {
  up:    { y:  60, x: 0 },
  down:  { y: -60, x: 0 },
  left:  { x:  60, y: 0 },
  right: { x: -60, y: 0 },
};

/**
 * Generic scroll-reveal wrapper. Fades + slides in (optionally with a
 * subtle blur defocus) when the element enters the viewport.
 *
 * Supports `dir` and `blur` flag for an extra layer of cinematic feel.
 */
export default function Reveal({
  children,
  className = "",
  dir = "up",
  delay = 0,
  duration = 0.6,                    // snappier default (was 0.75)
  blur = true,
  once = false,
}) {
  const offset = directions[dir] || directions.up;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...offset,
        filter: blur ? "blur(6px)" : undefined,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: blur ? "blur(0px)" : undefined,
      }}
      viewport={{ once, margin: "-12%" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        // blur fades faster than the slide so it doesn't linger
        filter: { duration: Math.min(duration * 0.6, 0.5), delay },
      }}
    >
      {children}
    </motion.div>
  );
}
