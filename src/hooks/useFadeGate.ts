import { useTransform, type MotionValue } from "motion/react";

/**
 * Derive a `visibility` value from a fading `opacity` motion value.
 *
 * Scroll-linked fades are a lie to the accessibility tree: `opacity: 0` still
 * paints an interactive box. A hero whose CTAs have faded out completely is
 * still tabbable and still clickable, so a keyboard visitor lands on an
 * invisible "View My Work" button and a mouse visitor can click a control
 * they cannot see, sitting over the content below it.
 *
 * `visibility: hidden` is the one property that removes an element from hit
 * testing AND from the tab order, and it is a discrete (non-animated) switch,
 * so flipping it costs nothing. Bind it alongside the opacity:
 *
 *   const opacity = useTransform(progress, [0, 0.7], [1, 0]);
 *   const visibility = useFadeGate(opacity);
 *   <motion.div style={{ opacity, visibility }} />
 */
export default function useFadeGate(
  opacity: MotionValue<number>,
  threshold = 0.04
): MotionValue<"hidden" | "visible"> {
  return useTransform(opacity, (value) => (value <= threshold ? "hidden" : "visible"));
}
