import { motion, useMotionTemplate, useSpring } from "motion/react";
import { useCursor } from "../../hooks/useCursor";

/**
 * Soft radial light that follows the cursor across the page,
 * giving a "torch" feel without darkening anything beneath.
 * Sits below particles and the cursor itself.
 */
export default function CursorSpotlight() {
  const c = useCursor();
  // If there is no provider (touch device etc.) bail out cheaply
  if (!c) return null;

  const x = useSpring(c.mx, { stiffness: 120, damping: 22, mass: 0.6 });
  const y = useSpring(c.my, { stiffness: 120, damping: 22, mass: 0.6 });

  const bg = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, rgba(180,200,230,0.08), transparent 70%)`;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ backgroundImage: bg }}
    />
  );
}
