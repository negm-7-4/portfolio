import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Button that is magnetically pulled toward the cursor while hovered,
 * then springs back on leave. Tightened springs + smoother whileTap scale.
 * Pass `strength` to tune the pull.
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
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

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
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 20 }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
