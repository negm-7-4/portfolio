import { motion } from "motion/react";
import { revealVariants, staggerContainer, EASE_OUT, DUR_REVEAL, VIEWPORT } from "../../lib/motion";

/**
 * Generic scroll-reveal wrapper. Slides + fades in with a touch of 3D
 * perspective and micro-scale so content feels like it rises off the page
 * rather than just sliding. Transform + opacity only (plus a brief one-shot
 * blur on text), so it stays GPU-composited and holds 60fps.
 *
 * API is unchanged from before — `dir`, `delay`, `duration`, `blur`, `once` —
 * with two additions:
 *   `depth`   — adds the perspective lift (default on; auto-off for big blocks)
 *   `stagger` — if set, reveals direct <Reveal.Item> / motion children in cascade
 */
export default function Reveal({
  children,
  className = "",
  dir = "up",
  delay = 0,
  duration = DUR_REVEAL,
  blur = true,
  once = false,
  depth = true,
  style,
}) {
  const variants = revealVariants({ dir, blur, depth });

  return (
    <motion.div
      className={className}
      style={{ transformPerspective: depth ? 1100 : undefined, willChange: "transform, opacity", ...style }}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: VIEWPORT.margin }}
      transition={{
        duration,
        delay,
        ease: EASE_OUT,
        // blur resolves faster than the slide so it never lingers or smears
        filter: { duration: Math.min(duration * 0.55, 0.45), delay },
        scale: { duration: duration * 1.05, delay, ease: EASE_OUT },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Cascade variant — wrap a list so children stagger in. Children should be
 * <Reveal.Item> (or any motion element using the "item" variants).
 */
export function RevealGroup({ children, className = "", stagger = 0.08, delay = 0, once = false }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: VIEWPORT.margin }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "", dir = "up", blur = true, depth = true, style }) {
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: depth ? 1100 : undefined, willChange: "transform, opacity", ...style }}
      variants={{
        ...revealVariants({ dir, blur, depth }),
        show: {
          ...revealVariants({ dir, blur, depth }).show,
          transition: { duration: DUR_REVEAL, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

Reveal.Group = RevealGroup;
Reveal.Item = RevealItem;
