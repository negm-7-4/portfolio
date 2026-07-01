import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { SPRING_MAGNET, SPRING_SNAP } from "../../lib/motion";

/**
 * Button that is magnetically pulled toward the cursor while hovered, lifts a
 * touch on hover, and springs back cleanly on leave. Pass `strength` to tune
 * the pull. All transform — no layout — so it stays at 60fps.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.4,
  as = "button",
  ...rest
}) {
  const ref = useRef(null);
  const rectRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_MAGNET);
  const sy = useSpring(y, SPRING_MAGNET);

  const handleMouseEnter = () => {
    rectRef.current = ref.current?.getBoundingClientRect();
  };

  const handleMove = (e) => {
    if (!rectRef.current) rectRef.current = ref.current?.getBoundingClientRect();
    const rect = rectRef.current;
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    rectRef.current = null;
    x.set(0); y.set(0);
  };

  const MotionTag = motion[as] || motion.button;

  return (
    <MotionTag
      ref={ref}
      data-cursor="hover"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.95 }}
      transition={SPRING_SNAP}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
